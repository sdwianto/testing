/* eslint-disable @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-argument, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-return, @typescript-eslint/no-explicit-any, @typescript-eslint/no-inferrable-types, @typescript-eslint/no-misused-promises, @typescript-eslint/no-empty-function */
import Redis from 'ioredis';

// ========================================
// REDIS CLIENT & STREAMS (P1 - Offline Backbone)
// Enhanced per Implementation Guide
// ========================================

// Redis client instance for general operations
export const redis = new Redis(process.env.REDIS_URL ?? 'redis://localhost:6379', {
  maxRetriesPerRequest: 3,
  lazyConnect: true,
  enableReadyCheck: false,
  connectTimeout: 10000,
  commandTimeout: 5000,
});

// Redis Pub/Sub client for real-time fan-out
export const redisPubSub = new Redis(process.env.REDIS_URL ?? 'redis://localhost:6379', {
  maxRetriesPerRequest: 3,
  lazyConnect: true,
  enableReadyCheck: false,
  connectTimeout: 10000,
  commandTimeout: 5000,
});

// Redis Streams client for replay and consumer groups
export const redisStreams = new Redis(process.env.REDIS_URL ?? 'redis://localhost:6379', {
  maxRetriesPerRequest: 3,
  lazyConnect: true,
  enableReadyCheck: false,
  connectTimeout: 10000,
  commandTimeout: 5000,
});

// Add connection event handlers
redis.on('error', (error) => {
  console.error('Redis client error:', error);
});

redis.on('connect', () => {
  console.log('✅ Redis client connected');
});

redisPubSub.on('error', (error) => {
  console.error('Redis Pub/Sub client error:', error);
});

redisPubSub.on('connect', () => {
  console.log('✅ Redis Pub/Sub client connected');
});

redisStreams.on('error', (error) => {
  console.error('Redis Streams client error:', error);
});

redisStreams.on('connect', () => {
  console.log('✅ Redis Streams client connected');
});

// ========================================
// EVENT ENVELOPE TYPES (per Implementation Guide)
// ========================================

export interface EventEnvelope {
  id: string;
  tenantId: string;
  type: string;
  entity: string;
  entityId: string;
  version: number;
  createdAt: string;
  payload: any;
}

export interface StreamMessage {
  id: string;
  data: EventEnvelope;
}

// ========================================
// REDIS STREAMS UTILITY CLASS (Enhanced)
// ========================================

export class RedisStreams {
  public redis: Redis;

  constructor(redisInstance: Redis) {
    this.redis = redisInstance;
  }

  // Read from stream with proper cursor handling
  async readStream(streamKey: string, cursor: string = '0', count: number = 10): Promise<{
    messages: StreamMessage[];
    nextCursor: string;
  }> {
    try {
      // Check if Redis is connected
      if (this.redis.status !== 'ready') {
        throw new Error('Redis not connected');
      }

      const results = await this.redis.xread('COUNT', count, 'STREAMS', streamKey, cursor);
      
      if (!results || results.length === 0) {
        return { messages: [], nextCursor: cursor };
      }

      const [streamName, messages] = results[0] as [string, any[]];
      const nextCursor = messages.length > 0 ? messages[messages.length - 1][0] : cursor;

      return {
        messages: messages.map(([id, fields]) => ({
          id,
          data: this.parseStreamFields(fields),
        })),
        nextCursor,
      };
    } catch (error) {
      console.error('Failed to read from stream:', error);
      return { messages: [], nextCursor: cursor };
    }
  }

  // Parse stream fields into EventEnvelope
  private parseStreamFields(fields: any[]): EventEnvelope {
    const data: any = {};
    for (let i = 0; i < fields.length; i += 2) {
      data[fields[i]] = fields[i + 1];
    }
    
    // Parse JSON payload if it exists
    if (data.payload) {
      try {
        data.payload = JSON.parse(data.payload);
      } catch (e) {
        // Keep as string if not valid JSON
      }
    }
    
    return data as EventEnvelope;
  }

  // Get latest cursor for stream
  async getLatestCursor(streamKey: string): Promise<string> {
    try {
      if (this.redis.status !== 'ready') {
        throw new Error('Redis not connected');
      }

      const info = await this.redis.xinfo('STREAM', streamKey) as any[];
      if (info && info.length > 0) {
        return info[1] as string; // Last entry ID
      }
      return '0';
    } catch (error) {
      console.error('Failed to get latest cursor:', error);
      return '0';
    }
  }

  // Publish event to stream (per Implementation Guide format)
  async publishEvent(streamKey: string, event: EventEnvelope): Promise<string> {
    try {
      if (this.redis.status !== 'ready') {
        throw new Error('Redis not connected');
      }

      const fields = [
        'tenantId', event.tenantId,
        'type', event.type,
        'entity', event.entity,
        'entityId', event.entityId,
        'version', event.version.toString(),
        'createdAt', event.createdAt,
        'payload', JSON.stringify(event.payload)
      ];
      
      const id = await this.redis.xadd(streamKey, '*', ...fields);
      return id ?? '';
    } catch (error) {
      console.error('Failed to publish event:', error);
      throw error;
    }
  }

  // Create consumer group for reliable processing
  async createConsumerGroup(streamKey: string, groupName: string, startId: string = '0'): Promise<void> {
    try {
      if (this.redis.status !== 'ready') {
        throw new Error('Redis not connected');
      }

      await this.redis.xgroup('CREATE', streamKey, groupName, startId, 'MKSTREAM');
    } catch (error) {
      // Group might already exist, ignore error
      if (!(error as Error).message?.includes('BUSYGROUP')) {
        console.error('Failed to create consumer group:', error);
      }
    }
  }

  // Read from consumer group
  async readFromGroup(
    streamKey: string, 
    groupName: string, 
    consumerName: string, 
    count: number = 10
  ): Promise<StreamMessage[]> {
    try {
      if (this.redis.status !== 'ready') {
        throw new Error('Redis not connected');
      }

      const results = await this.redis.xreadgroup(
        'GROUP', groupName, consumerName,
        'COUNT', count,
        'STREAMS', streamKey, '>'
      );
      
      if (!results || results.length === 0) {
        return [];
      }

      const [streamName, messages] = results[0] as [string, any[]];
      return messages.map(([id, fields]) => ({
        id,
        data: this.parseStreamFields(fields),
      }));
    } catch (error) {
      console.error('Failed to read from consumer group:', error);
      return [];
    }
  }

  // Acknowledge message processing
  async acknowledgeMessage(streamKey: string, groupName: string, messageId: string): Promise<void> {
    try {
      if (this.redis.status !== 'ready') {
        throw new Error('Redis not connected');
      }

      await this.redis.xack(streamKey, groupName, messageId);
    } catch (error) {
      console.error('Failed to acknowledge message:', error);
    }
  }

  // Get stream info
  async getStreamInfo(streamKey: string): Promise<any> {
    try {
      if (this.redis.status !== 'ready') {
        throw new Error('Redis not connected');
      }

      return await this.redis.xinfo('STREAM', streamKey);
    } catch (error) {
      console.error('Failed to get stream info:', error);
      return null;
    }
  }
}

// ========================================
// PUB/SUB UTILITIES (per Implementation Guide)
// ========================================

export class RedisPubSub {
  private redis: Redis;

  constructor(redisInstance: Redis) {
    this.redis = redisInstance;
  }

  // Publish to tenant-specific channel
  async publishToTenant(tenantId: string, event: EventEnvelope): Promise<void> {
    try {
      if (this.redis.status !== 'ready') {
        throw new Error('Redis not connected');
      }

      const channel = `tenant:${tenantId}:pub`;
      await this.redis.publish(channel, JSON.stringify(event));
    } catch (error) {
      console.error('Failed to publish to tenant:', error);
    }
  }

  // Subscribe to tenant-specific channel
  async subscribeToTenant(tenantId: string, callback: (event: EventEnvelope) => void): Promise<() => void> {
    try {
      const channel = `tenant:${tenantId}:pub`;
      const subscriber = new Redis(process.env.REDIS_URL ?? 'redis://localhost:6379', {
        maxRetriesPerRequest: 3,
        lazyConnect: true,
        enableReadyCheck: false,
        connectTimeout: 10000,
        commandTimeout: 5000,
      });
      
      await subscriber.subscribe(channel);
      
      subscriber.on('message', (channel, message) => {
        try {
          const event = JSON.parse(message) as EventEnvelope;
          callback(event);
        } catch (error) {
          console.error('Failed to parse pub/sub message:', error);
        }
      });

      subscriber.on('error', (error) => {
        console.error('Redis subscriber error:', error);
      });

      return () => {
        void subscriber.unsubscribe(channel);
        void subscriber.disconnect();
      };
    } catch (error) {
      console.error('Failed to subscribe to tenant:', error);
      return () => {};
    }
  }
}

// Export instances
export const redisStreamsInstance = new RedisStreams(redisStreams);
export const redisPubSubInstance = new RedisPubSub(redisPubSub);