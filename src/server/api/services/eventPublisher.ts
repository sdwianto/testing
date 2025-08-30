/* eslint-disable @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-argument, @typescript-eslint/no-unsafe-return, @typescript-eslint/no-explicit-any, @typescript-eslint/no-inferrable-types, @typescript-eslint/no-misused-promises, @typescript-eslint/no-empty-function */
import { prisma } from '@/lib/prisma';
import { redisStreamsInstance, redisPubSubInstance, type EventEnvelope } from '@/lib/redis';

// ========================================
// EVENT PUBLISHER SERVICE (P1 - Outbox Pattern)
// ========================================

export class EventPublisher {
  // Process outbox events and publish to Redis (Enhanced per Implementation Guide)
  static async processOutboxEvents() {
    try {
      // Get undelivered events
      const undeliveredEvents = await prisma.outboxEvent.findMany({
        where: {
          delivered: false,
        },
        orderBy: {
          createdAt: 'asc',
        },
        take: 100, // Process in batches
      });

      for (const event of undeliveredEvents) {
        try {
          // Create EventEnvelope per Implementation Guide format
          const eventEnvelope: EventEnvelope = {
            id: event.id,
            tenantId: event.tenantId,
            type: event.type,
            entity: event.entity,
            entityId: event.entityId,
            version: event.version,
            createdAt: event.createdAt.toISOString(),
            payload: event.payload as any,
          };

          // Publish to tenant-specific Redis Stream
          const streamKey = `tenant:${event.tenantId}:stream`;
          await redisStreamsInstance.publishEvent(streamKey, eventEnvelope);

          // Publish to Pub/Sub for real-time fan-out
          await redisPubSubInstance.publishToTenant(event.tenantId, eventEnvelope);

          // Mark as delivered
          await prisma.outboxEvent.update({
            where: { id: event.id },
            data: { delivered: true },
          });

          console.log(`✅ Published event: ${event.type} for ${event.entity}:${event.entityId}`);
        } catch (error) {
          console.error(`❌ Failed to publish event ${event.id}:`, error);
          
          // Increment retry count or mark as failed
          // For now, we'll leave it undelivered for retry
        }
      }

      return undeliveredEvents.length;
    } catch (error) {
      console.error('❌ Event publisher error:', error);
      throw error;
    }
  }

  // Start background processing
  static startBackgroundProcessing() {
    // Process outbox events every 5 seconds
    setInterval(() => {
      void (async () => {
        try {
          const processedCount = await this.processOutboxEvents();
          if (processedCount > 0) {
            console.log(`📤 Processed ${processedCount} outbox events`);
          }
        } catch (error) {
          console.error('❌ Background event processing error:', error);
        }
      })();
    }, 5000);

    console.log('🚀 Event publisher background processing started');
  }

  // Publish event directly (for immediate events) - Enhanced per Implementation Guide
  static async publishEvent(tenantId: string, event: {
    type: string;
    entity: string;
    entityId: string;
    payload: unknown;
    version: number;
  }) {
    try {
      // Create EventEnvelope per Implementation Guide format
      const eventEnvelope: EventEnvelope = {
        id: `evt_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        tenantId,
        type: event.type,
        entity: event.entity,
        entityId: event.entityId,
        version: event.version,
        createdAt: new Date().toISOString(),
        payload: event.payload,
      };

      // Publish to tenant-specific Redis Stream
      const streamKey = `tenant:${tenantId}:stream`;
      await redisStreamsInstance.publishEvent(streamKey, eventEnvelope);

      // Publish to Pub/Sub for real-time fan-out
      await redisPubSubInstance.publishToTenant(tenantId, eventEnvelope);

      console.log(`✅ Published direct event: ${event.type} for ${event.entity}:${event.entityId}`);
    } catch (error) {
      console.error('❌ Failed to publish direct event:', error);
      throw error;
    }
  }

  // Get events for a tenant with cursor support - Enhanced per Implementation Guide
  static async getEvents(tenantId: string, cursor = '0', limit = 50) {
    try {
      const streamKey = `tenant:${tenantId}:stream`;
      const result = await redisStreamsInstance.readStream(streamKey, cursor, limit);

      const messages = result.messages;
      const nextCursor = result.nextCursor;

      // Format events per Implementation Guide
      const formattedEvents = messages.map((message) => ({
        id: message.id,
        type: message.data.type,
        entity: message.data.entity,
        entityId: message.data.entityId,
        payload: message.data.payload,
        version: message.data.version,
        timestamp: message.data.createdAt,
      }));

      return {
        events: formattedEvents,
        nextCursor,
        hasMore: messages.length === limit,
      };
    } catch (error) {
      console.error('❌ Failed to get events:', error);
      throw error;
    }
  }
}

// ========================================
// EVENT TYPES (P1 - Domain Events)
// ========================================

export const EventTypes = {
  // Operations Events
  OPS_EQUIPMENT_CREATED: 'ops.equipment.created',
  OPS_EQUIPMENT_UPDATED: 'ops.equipment.updated',
  OPS_USAGE_LOGGED: 'ops.usage.logged',
  OPS_BREAKDOWN_REPORTED: 'ops.breakdown.reported',
  OPS_BREAKDOWN_RESOLVED: 'ops.breakdown.resolved',
  OPS_WORKORDER_CREATED: 'ops.workorder.created',
  OPS_WORKORDER_UPDATED: 'ops.workorder.updated',

  // Inventory Events
  INV_ITEM_CREATED: 'inv.item.created',
  INV_ITEM_UPDATED: 'inv.item.updated',
  INV_TRANSACTION_CREATED: 'inv.transaction.created',
  INV_STOCK_LOW: 'inv.stock.low',
  INV_REORDER_TRIGGERED: 'inv.reorder.triggered',

  // CRM Events
  CRM_CUSTOMER_CREATED: 'crm.customer.created',
  CRM_CUSTOMER_UPDATED: 'crm.customer.updated',
  CRM_ORDER_CREATED: 'crm.order.created',
  CRM_ORDER_UPDATED: 'crm.order.updated',

  // System Events
  SYS_USER_LOGIN: 'sys.user.login',
  SYS_USER_LOGOUT: 'sys.user.logout',
  SYS_AUDIT_EVENT: 'sys.audit.event',
  SYS_SYNC_COMPLETED: 'sys.sync.completed',
  SYS_SYNC_FAILED: 'sys.sync.failed',
} as const;

export type EventType = typeof EventTypes[keyof typeof EventTypes];
