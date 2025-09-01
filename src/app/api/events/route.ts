/* eslint-disable @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-argument, @typescript-eslint/no-misused-promises, @typescript-eslint/no-floating-promises, @typescript-eslint/no-unnecessary-type-assertion */
import type { NextRequest } from 'next/server';

// ========================================
// SIMPLIFIED SSE ENDPOINT (P1 - Real-time Updates)
// Temporary implementation without Redis dependency
// ========================================

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const tenantId = searchParams.get('tenantId') ?? 'CA-MINE';
  const cursor = searchParams.get('cursor') ?? '0';

  // Create SSE response with proper headers
  const eventStream = new ReadableStream({
    start(controller) {
      const encoder = new TextEncoder();
      let isConnected = true;
      let heartbeatInterval: NodeJS.Timeout;
      let messageCount = 0;

      // Send initial connection message
      const sendMessage = (type: string, data: unknown) => {
        if (!isConnected) return;
        
        messageCount++;
        const message = `data: ${JSON.stringify({
          type,
          messageId: messageCount,
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
        cursor,
        message: 'SSE connection established',
        version: '1.0'
      });

      // Enhanced heartbeat with better timing - prevent proxy timeout
      const startHeartbeat = () => {
        heartbeatInterval = setInterval(() => {
          if (!isConnected) return;
          
          // Send ping comment to prevent proxy timeout
          try {
            controller.enqueue(encoder.encode(': ping\n\n'));
          } catch (error) {
            console.error('Failed to send heartbeat ping:', error);
          }
          
          sendMessage('heartbeat', {
            cursor,
            timestamp: new Date().toISOString(),
            message: 'Connection alive',
            uptime: process.uptime()
          });
        }, 15000); // Reduced to 15 seconds for more stability
      };

      // Initialize connection
      const initialize = async () => {
        try {
          // Start heartbeat immediately
          startHeartbeat();
          
          // Send initial status
          sendMessage('status', {
            message: 'Real-time connection active',
            tenantId,
            features: {
              operations: true,
              inventory: true,
              crm: true,
              offline: true
            },
            config: {
              heartbeatInterval: 30000,
              maxReconnectAttempts: 5
            }
          });
          
        } catch (error) {
          console.error('SSE initialization error:', error);
          sendMessage('error', {
            message: 'Initialization failed',
            error: error instanceof Error ? error.message : 'Unknown error',
            fatal: false
          });
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
        
        try {
          controller.close();
        } catch (error) {
          console.error('Error closing SSE stream:', error);
        }
      };

      request.signal.addEventListener('abort', cleanup);

      // Also cleanup on stream close
      return cleanup;
    }
  });

  return new Response(eventStream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache, no-store, must-revalidate',
      'Connection': 'keep-alive',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Headers': 'Cache-Control',
      'X-Accel-Buffering': 'no', // Disable nginx buffering
      'X-Connection-Type': 'SSE',
      'X-Heartbeat-Interval': '30000'
    },
  });
}