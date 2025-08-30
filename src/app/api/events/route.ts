/* eslint-disable @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-argument, @typescript-eslint/no-misused-promises, @typescript-eslint/no-floating-promises, @typescript-eslint/no-unnecessary-type-assertion */
import type { NextRequest } from 'next/server';
import { redisStreamsInstance, redisPubSubInstance, type EventEnvelope } from '@/lib/redis';

// ========================================
// ENHANCED SSE ENDPOINT (P1 - Real-time Updates)
// Per Implementation Guide with proper backfill and heartbeat
// ========================================

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const tenantId = searchParams.get('tenantId') ?? 'CA-MINE';
  const cursor = searchParams.get('cursor') ?? '0';
  const streamKey = `tenant:${tenantId}:stream`;

  // Create SSE response with proper headers
  const eventStream = new ReadableStream({
    start(controller) {
      const encoder = new TextEncoder();
      let isConnected = true;
      let currentCursor = cursor;
      let heartbeatInterval: NodeJS.Timeout;
      let pollInterval: NodeJS.Timeout;
      let unsubscribe: (() => void) | null = null;

      // Send initial connection message
      const sendMessage = (type: string, data: unknown) => {
        if (!isConnected) return;
        
        const message = `data: ${JSON.stringify({
          type,
          ...(typeof data === 'object' && data !== null ? data : {}),
          timestamp: new Date().toISOString()
        })}\n\n`;
        
        try {
          controller.enqueue(encoder.encode(message));
        } catch (error) {
          console.error('Failed to send SSE message:', error);
          isConnected = false;
        }
      };

      // Send connection confirmation
      sendMessage('connected', {
        tenantId,
        cursor: currentCursor,
        streamKey
      });

      // Enhanced heartbeat with retry logic
      const startHeartbeat = () => {
        heartbeatInterval = setInterval(() => {
          if (!isConnected) return;
          
          sendMessage('heartbeat', {
            cursor: currentCursor
          });
        }, 15000); // 15 seconds per Implementation Guide
      };

      // Backfill missed events on reconnect
      const backfillEvents = async () => {
        try {
          if (currentCursor === '0') return; // No backfill needed for new connections
          
          const { messages, nextCursor } = await redisStreamsInstance.readStream(
            streamKey,
            currentCursor,
            100 // Limit backfill to prevent overwhelming
          );

          for (const message of messages) {
            sendMessage('event', {
              id: message.id,
              eventType: message.data.type,
              entity: message.data.entity,
              entityId: message.data.entityId,
              version: message.data.version,
              payload: message.data.payload,
              isBackfill: true
            });
          }

          if (messages.length > 0) {
            currentCursor = nextCursor;
            sendMessage('backfill_complete', {
              cursor: currentCursor,
              eventsCount: messages.length
            });
          }
        } catch (error) {
          console.error('SSE backfill error:', error);
          sendMessage('error', {
            message: 'Backfill failed',
            error: error instanceof Error ? error.message : 'Unknown error'
          });
        }
      };

      // Poll for new events with exponential backoff
      let retryCount = 0;
      const maxRetries = 5;
      
      const pollEvents = async () => {
        if (!isConnected) return;
        
        try {
          const { messages, nextCursor } = await redisStreamsInstance.readStream(
            streamKey,
            currentCursor,
            10
          );

          for (const message of messages) {
            sendMessage('event', {
              id: message.id,
              eventType: message.data.type,
              entity: message.data.entity,
              entityId: message.data.entityId,
              version: message.data.version,
              payload: message.data.payload,
              isBackfill: false
            });
          }

          if (messages.length > 0) {
            currentCursor = nextCursor;
          }

          // Reset retry count on successful poll
          retryCount = 0;
          
          // Continue polling with normal interval
          pollInterval = setTimeout(pollEvents, 1000);
        } catch (error) {
          console.error('SSE polling error:', error);
          
          sendMessage('error', {
            message: 'Failed to fetch events',
            error: error instanceof Error ? error.message : 'Unknown error',
            retryCount
          });
          
          // Exponential backoff retry
          retryCount++;
          if (retryCount <= maxRetries) {
            const delay = Math.min(1000 * Math.pow(2, retryCount), 30000); // Max 30 seconds
            pollInterval = setTimeout(pollEvents, delay);
          } else {
            // Max retries reached, stop polling
            sendMessage('error', {
              message: 'Max retries reached, connection will be closed',
              fatal: true
            });
            isConnected = false;
            controller.close();
          }
        }
      };

      // Subscribe to real-time Pub/Sub for immediate updates
      const subscribeToRealtime = async () => {
        try {
          unsubscribe = await redisPubSubInstance.subscribeToTenant(tenantId, (event: EventEnvelope) => {
            sendMessage('event', {
              id: `pubsub-${Date.now()}`,
              eventType: event.type,
              entity: event.entity,
              entityId: event.entityId,
              version: event.version,
              payload: event.payload,
              isRealtime: true
            });
          });
        } catch (error) {
          console.error('Failed to subscribe to real-time updates:', error);
        }
      };

      // Initialize connection
      const initialize = async () => {
        try {
          // Start heartbeat
          startHeartbeat();
          
          // Backfill missed events
          await backfillEvents();
          
          // Subscribe to real-time updates
          await subscribeToRealtime();
          
          // Start polling for new events
          pollEvents();
          
        } catch (error) {
          console.error('SSE initialization error:', error);
          sendMessage('error', {
            message: 'Initialization failed',
            error: error instanceof Error ? error.message : 'Unknown error',
            fatal: true
          });
          isConnected = false;
          controller.close();
        }
      };

      // Start initialization
      void initialize();

      // Cleanup on close
      const cleanup = () => {
        isConnected = false;
        
        if (heartbeatInterval) {
          clearInterval(heartbeatInterval);
        }
        
        if (pollInterval) {
          clearTimeout(pollInterval);
        }
        
        if (unsubscribe) {
          unsubscribe();
        }
        
        controller.close();
      };

      request.signal.addEventListener('abort', cleanup);
      
      // Also cleanup on stream close
      return cleanup;
    }
  });

  return new Response(eventStream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Headers': 'Cache-Control',
      'X-Accel-Buffering': 'no', // Disable nginx buffering
    },
  });
}