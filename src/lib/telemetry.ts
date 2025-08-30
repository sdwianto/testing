/* eslint-disable @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-argument, @typescript-eslint/no-unsafe-return, @typescript-eslint/no-explicit-any, @typescript-eslint/no-floating-promises */
import { prisma } from '@/lib/prisma';

// ========================================
// TELEMETRY & OBSERVABILITY (P1 - Core Platform)
// Per Implementation Guide: metrics, logs, traces with SLOs & actionable alerts
// ========================================

export interface TelemetryEvent {
  id: string;
  tenantId: string;
  type: 'metric' | 'log' | 'trace' | 'span';
  name: string;
  value?: number;
  tags: Record<string, string>;
  timestamp: string;
  duration?: number;
  metadata?: any;
}

export interface PerformanceMetric {
  route: string;
  method: string;
  status: number;
  latency: number;
  dbTime?: number;
  cacheHit?: boolean;
  retries?: number;
  eventLag?: number;
  correlationId: string;
  tenantId: string;
  userId?: string;
}

export interface OfflineMetric {
  queueLength: number;
  replayRate: number;
  conflictRate: number;
  timeToDrain: number;
  reconnectLatency: number;
  eventsLag: number;
  idempotencyDuplicatesBlocked: number;
  tenantId: string;
  timestamp: string;
}

export class TelemetryService {
  private static instance: TelemetryService;
  private metrics: Map<string, number> = new Map<string, number>();
  private traces: TelemetryEvent[] = [];

  static getInstance(): TelemetryService {
    if (!TelemetryService.instance) {
      TelemetryService.instance = new TelemetryService();
    }
    return TelemetryService.instance;
  }

  // Record performance metric
  static async recordPerformance(metric: PerformanceMetric): Promise<void> {
    try {
      const event: TelemetryEvent = {
        id: `perf_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        tenantId: metric.tenantId,
        type: 'metric',
        name: 'api.performance',
        value: metric.latency,
        tags: {
          route: metric.route,
          method: metric.method,
          status: metric.status.toString(),
          correlationId: metric.correlationId,
          ...(metric.userId && { userId: metric.userId }),
          ...(metric.dbTime && { dbTime: metric.dbTime.toString() }),
          ...(metric.cacheHit !== undefined && { cacheHit: metric.cacheHit.toString() }),
          ...(metric.retries && { retries: metric.retries.toString() }),
          ...(metric.eventLag && { eventLag: metric.eventLag.toString() }),
        },
        timestamp: new Date().toISOString(),
        duration: metric.latency,
        metadata: metric,
      };

      await this.storeTelemetryEvent(event);
      
      // Check SLOs
      await this.checkSLOS(metric);
    } catch (error) {
      console.error('Failed to record performance metric:', error);
    }
  }

  // Record offline metric
  static async recordOfflineMetric(metric: OfflineMetric): Promise<void> {
    try {
      const event: TelemetryEvent = {
        id: `offline_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        tenantId: metric.tenantId,
        type: 'metric',
        name: 'offline.sync',
        tags: {
          queueLength: metric.queueLength.toString(),
          replayRate: metric.replayRate.toString(),
          conflictRate: metric.conflictRate.toString(),
          timeToDrain: metric.timeToDrain.toString(),
          reconnectLatency: metric.reconnectLatency.toString(),
          eventsLag: metric.eventsLag.toString(),
          idempotencyDuplicatesBlocked: metric.idempotencyDuplicatesBlocked.toString(),
        },
        timestamp: metric.timestamp,
        metadata: metric,
      };

      await this.storeTelemetryEvent(event);
    } catch (error) {
      console.error('Failed to record offline metric:', error);
    }
  }

  // Record custom metric
  static async recordMetric(
    tenantId: string,
    name: string,
    value: number,
    tags: Record<string, string> = {},
    metadata?: any
  ): Promise<void> {
    try {
      const event: TelemetryEvent = {
        id: `metric_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        tenantId,
        type: 'metric',
        name,
        value,
        tags,
        timestamp: new Date().toISOString(),
        metadata,
      };

      await this.storeTelemetryEvent(event);
    } catch (error) {
      console.error('Failed to record metric:', error);
    }
  }

  // Record log event
  static async recordLog(
    tenantId: string,
    level: 'info' | 'warn' | 'error' | 'debug',
    message: string,
    tags: Record<string, string> = {},
    metadata?: any
  ): Promise<void> {
    try {
      const event: TelemetryEvent = {
        id: `log_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        tenantId,
        type: 'log',
        name: `log.${level}`,
        tags: {
          level,
          message,
          ...tags,
        },
        timestamp: new Date().toISOString(),
        metadata,
      };

      await this.storeTelemetryEvent(event);
    } catch (error) {
      console.error('Failed to record log:', error);
    }
  }

  // Start trace span
  static startSpan(
    tenantId: string,
    operation: string,
    tags: Record<string, string> = {}
  ): Span {
    const spanId = `span_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const startTime = Date.now();

    return {
      id: spanId,
      tenantId,
      operation,
      tags,
      startTime,
      finish: async (status: 'success' | 'error' = 'success', metadata?: any) => {
        const duration = Date.now() - startTime;
        
        const event: TelemetryEvent = {
          id: spanId,
          tenantId,
          type: 'span',
          name: `span.${operation}`,
          tags: {
            ...tags,
            status,
            duration: duration.toString(),
          },
          timestamp: new Date().toISOString(),
          duration,
          metadata,
        };

        await this.storeTelemetryEvent(event);
      },
    };
  }

  // Check SLOs and create alerts
  private static async checkSLOS(metric: PerformanceMetric): Promise<void> {
    const alerts: string[] = [];

    // API Performance SLO: p95 ≤ 300ms
    if (metric.latency > 300) {
      alerts.push(`API latency exceeded SLO: ${metric.latency}ms > 300ms for ${metric.route}`);
    }

    // Database time SLO: ≤ 100ms
    if (metric.dbTime && metric.dbTime > 100) {
      alerts.push(`Database time exceeded SLO: ${metric.dbTime}ms > 100ms for ${metric.route}`);
    }

    // Event lag SLO: ≤ 5s
    if (metric.eventLag && metric.eventLag > 5000) {
      alerts.push(`Event lag exceeded SLO: ${metric.eventLag}ms > 5000ms`);
    }

    // Create alerts
    for (const alert of alerts) {
      await this.createAlert(metric.tenantId, 'SLO_VIOLATION', alert, {
        metric,
        severity: 'warning',
      });
    }
  }

  // Create alert
  private static async createAlert(
    tenantId: string,
    type: string,
    message: string,
    metadata?: any
  ): Promise<void> {
    try {
      await prisma.notification.create({
        data: {
          tenantId,
          type: 'warning',
          title: `Alert: ${type}`,
          message,
          data: metadata,
        },
      });

      // Also log the alert
      await this.recordLog(tenantId, 'warn', `Alert: ${message}`, { type }, metadata);
    } catch (error) {
      console.error('Failed to create alert:', error);
    }
  }

  // Store telemetry event
  private static async storeTelemetryEvent(event: TelemetryEvent): Promise<void> {
    try {
      // Store in database (using SystemConfig for now, could be separate telemetry table)
      await prisma.systemConfig.create({
        data: {
          tenantId: event.tenantId,
          key: `telemetry:${event.id}`,
          value: JSON.stringify(event),
          type: 'json',
          description: `Telemetry event: ${event.name}`,
        },
      });

      // Also store in memory for quick access
      const instance = TelemetryService.getInstance();
      instance.traces.push(event);
      
      // Keep only last 1000 traces in memory
      if (instance.traces.length > 1000) {
        instance.traces = instance.traces.slice(-1000);
      }
    } catch (error) {
      console.error('Failed to store telemetry event:', error);
    }
  }

  // Get metrics for dashboard
  static async getMetrics(
    tenantId: string,
    timeRange: { from: Date; to: Date },
    metricType?: string
  ): Promise<TelemetryEvent[]> {
    try {
      const configs = await prisma.systemConfig.findMany({
        where: {
          tenantId,
          key: { startsWith: 'telemetry:' },
          createdAt: {
            gte: timeRange.from,
            lte: timeRange.to,
          },
        },
        orderBy: { createdAt: 'desc' },
        take: 1000,
      });

      const events = configs
        .map(config => {
          try {
            return JSON.parse(config.value) as TelemetryEvent;
          } catch {
            return null;
          }
        })
        .filter((event): event is TelemetryEvent => event !== null);

      if (metricType) {
        return events.filter(event => event.name === metricType);
      }

      return events;
    } catch (error) {
      console.error('Failed to get metrics:', error);
      return [];
    }
  }

  // Get performance summary
  static async getPerformanceSummary(
    tenantId: string,
    timeRange: { from: Date; to: Date }
  ): Promise<{
    avgLatency: number;
    p95Latency: number;
    errorRate: number;
    totalRequests: number;
    slowestRoutes: Array<{ route: string; avgLatency: number }>;
  }> {
    try {
      const events = await this.getMetrics(tenantId, timeRange, 'api.performance');
      
      const latencies = events.map(e => e.value ?? 0);
      const errors = events.filter(e => parseInt(e.tags.status ?? '200') >= 400);
      
      const avgLatency = latencies.length > 0 ? latencies.reduce((sum, lat) => sum + lat, 0) / latencies.length : 0;
      const sortedLatencies = latencies.sort((a, b) => a - b);
      const p95Index = Math.floor(sortedLatencies.length * 0.95);
      const p95Latency = sortedLatencies[p95Index] ?? 0;
      
      const errorRate = events.length > 0 ? (errors.length / events.length) * 100 : 0;
      
      // Group by route
      const routeStats = events.reduce((acc, event) => {
        const route = event.tags.route ?? 'unknown';
        acc[route] ??= { total: 0, sum: 0 };
        acc[route].total++;
        acc[route].sum += event.value ?? 0;
        return acc;
      }, {} as Record<string, { total: number; sum: number }>);

      const slowestRoutes = Object.entries(routeStats)
        .map(([route, stats]) => ({
          route,
          avgLatency: stats.sum / stats.total,
        }))
        .sort((a, b) => b.avgLatency - a.avgLatency)
        .slice(0, 10);

      return {
        avgLatency,
        p95Latency,
        errorRate,
        totalRequests: events.length,
        slowestRoutes,
      };
    } catch (error) {
      console.error('Failed to get performance summary:', error);
      return {
        avgLatency: 0,
        p95Latency: 0,
        errorRate: 0,
        totalRequests: 0,
        slowestRoutes: [],
      };
    }
  }
}

// Span interface
export interface Span {
  id: string;
  tenantId: string;
  operation: string;
  tags: Record<string, string>;
  startTime: number;
  finish: (status?: 'success' | 'error', metadata?: any) => Promise<void>;
}

// Performance monitoring middleware
export function withTelemetry<T extends any[], R>(
  fn: (...args: T) => Promise<R>,
  operation: string,
  tenantId: string
) {
  return async (...args: T): Promise<R> => {
    const span = TelemetryService.startSpan(tenantId, operation);
    
    try {
      const result = await fn(...args);
      await span.finish('success');
      return result;
    } catch (error) {
      await span.finish('error', { error: (error as Error).message });
      throw error;
    }
  };
}
