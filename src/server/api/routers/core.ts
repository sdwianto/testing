/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/prefer-nullish-coalescing */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/no-unnecessary-type-assertion */
import { z } from 'zod';
import { router, protectedProcedure, rbacProcedure } from '../config/trpc';
import { NotificationService } from '../services/notificationService';
import { SearchService } from '../services/searchService';
import { ConfigService } from '../services/configService';
import { AuditService } from '../services/auditService';
import { requirePermission, PERMISSIONS } from '../middleware/rbac';

// ========================================
// CORE PLATFORM ROUTER (P1 - Core Platform)
// ========================================

export const coreRouter = router({
  // ========================================
  // NOTIFICATIONS
  // ========================================
  notifications: router({
    list: protectedProcedure
      .input(z.object({
        limit: z.number().min(1).max(100).default(50),
        unreadOnly: z.boolean().default(false),
      }))
      .query(async ({ ctx, input }) => {
        const notifications = await NotificationService.getUserNotifications(
          ctx.userId!,
          ctx.tenantId,
          input.limit
        );

        if (input.unreadOnly) {
          return notifications.filter((n: any) => !n.read);
        }

        return notifications;
      }),

    unreadCount: protectedProcedure
      .query(async ({ ctx }) => {
        return await NotificationService.getUnreadCount(
          ctx.userId!,
          ctx.tenantId
        );
      }),

    markAsRead: protectedProcedure
      .input(z.object({
        notificationId: z.string(),
      }))
      .mutation(async ({ ctx, input }) => {
        return await NotificationService.markAsRead(
          input.notificationId,
          ctx.userId!
        );
      }),

    markAllAsRead: protectedProcedure
      .mutation(async ({ ctx }) => {
        return await NotificationService.markAllAsRead(
          ctx.userId!,
          ctx.tenantId
        );
      }),

    create: rbacProcedure
      .use(requirePermission(PERMISSIONS.SYS_CONFIG_WRITE))
      .input(z.object({
        type: z.enum(['info', 'warning', 'error', 'success']),
        title: z.string(),
        message: z.string(),
        userId: z.string().optional(),
        data: z.any().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        return await NotificationService.createNotification({
          ...input,
          tenantId: ctx.tenantId,
        });
      }),
  }),

  // ========================================
  // GLOBAL SEARCH
  // ========================================
  search: router({
    global: protectedProcedure
      .input(z.object({
        query: z.string().min(1),
        limit: z.number().min(1).max(50).default(20),
      }))
      .query(async ({ ctx, input }) => {
        return await SearchService.globalSearch(
          ctx.tenantId,
          input.query,
          input.limit
        );
      }),

    byType: protectedProcedure
      .input(z.object({
        type: z.enum(['equipment', 'item', 'customer', 'order', 'workorder', 'user']),
        query: z.string().min(1),
        limit: z.number().min(1).max(50).default(10),
      }))
      .query(async ({ ctx, input }) => {
        return await SearchService.searchByType(
          ctx.tenantId,
          input.type,
          input.query,
          input.limit
        );
      }),

    suggestions: protectedProcedure
      .input(z.object({
        query: z.string().min(1),
      }))
      .query(async ({ ctx, input }) => {
        return await SearchService.getSuggestions(
          ctx.tenantId,
          input.query
        );
      }),
  }),

  // ========================================
  // SYSTEM CONFIGURATION
  // ========================================
  config: router({
    get: protectedProcedure
      .input(z.object({
        key: z.string(),
      }))
      .query(async ({ ctx, input }) => {
        return await ConfigService.getConfig(ctx.tenantId, input.key);
      }),

    getAll: protectedProcedure
      .input(z.object({
        includePublic: z.boolean().default(true),
      }))
      .query(async ({ ctx, input }) => {
        return await ConfigService.getAllConfigs(
          ctx.tenantId,
          input.includePublic
        );
      }),

    getPublic: protectedProcedure
      .query(async ({ ctx }) => {
        return await ConfigService.getPublicConfigs(ctx.tenantId);
      }),

    set: rbacProcedure
      .use(requirePermission(PERMISSIONS.SYS_CONFIG_WRITE))
      .input(z.object({
        key: z.string(),
        value: z.any(),
        type: z.enum(['string', 'number', 'boolean', 'json']).default('string'),
        description: z.string().optional(),
        isPublic: z.boolean().default(false),
      }))
      .mutation(async ({ ctx, input }) => {
        return await ConfigService.setConfig(
          ctx.tenantId,
          input.key,
          input.value,
          input.type,
          input.description,
          input.isPublic
        );
      }),

    delete: rbacProcedure
      .use(requirePermission(PERMISSIONS.SYS_CONFIG_WRITE))
      .input(z.object({
        key: z.string(),
      }))
      .mutation(async ({ ctx, input }) => {
        return await ConfigService.deleteConfig(ctx.tenantId, input.key);
      }),

    initializeDefaults: rbacProcedure
      .use(requirePermission(PERMISSIONS.SYS_CONFIG_WRITE))
      .mutation(async ({ ctx }) => {
        return await ConfigService.initializeDefaultConfigs(ctx.tenantId);
      }),

    updateBulk: rbacProcedure
      .use(requirePermission(PERMISSIONS.SYS_CONFIG_WRITE))
      .input(z.object({
        configs: z.record(z.any()),
      }))
      .mutation(async ({ ctx, input }) => {
        return await ConfigService.updateConfigs(ctx.tenantId, input.configs);
      }),
  }),

  // ========================================
  // SYSTEM INFO
  // ========================================
  system: router({
    info: protectedProcedure
      .query(async ({ ctx }) => {
        const tenant = await ctx.prisma.tenant.findUnique({
          where: { id: ctx.tenantId },
        });

        const userCount = await ctx.prisma.user.count({
          where: { tenantId: ctx.tenantId },
        });

        const equipmentCount = await ctx.prisma.equipment.count({
          where: { tenantId: ctx.tenantId },
        });

        const itemCount = await ctx.prisma.item.count({
          where: { tenantId: ctx.tenantId },
        });

        const customerCount = await ctx.prisma.customer.count({
          where: { tenantId: ctx.tenantId },
        });

        return {
          tenant: {
            id: tenant?.id,
            name: tenant?.name,
            createdAt: tenant?.createdAt,
          },
          stats: {
            users: userCount,
            equipment: equipmentCount,
            items: itemCount,
            customers: customerCount,
          },
          version: '1.0.0',
          environment: process.env.NODE_ENV,
        };
      }),

    health: protectedProcedure
      .query(async ({ ctx }) => {
        // Check database connection
        const dbHealth = await ctx.prisma.$queryRaw`SELECT 1 as health`;
        
        // Check Redis connection (if available)
        let redisHealth = true;
        try {
          // This would be implemented when Redis is fully integrated
          // await redis.ping();
        } catch {
          redisHealth = false;
        }

        return {
          status: 'healthy',
          timestamp: new Date().toISOString(),
          services: {
            database: dbHealth ? 'healthy' : 'unhealthy',
            redis: redisHealth ? 'healthy' : 'unhealthy',
          },
        };
      }),
  }),

  // ========================================
  // DEPARTMENTS
  // ========================================
  departments: router({
    list: protectedProcedure
      .input(z.object({
        cursor: z.string().optional(),
        limit: z.number().min(1).max(100).default(50),
        search: z.string().optional(),
      }))
      .query(async ({ ctx, input }) => {
        const { cursor, limit, search } = input;
        
        const departments = await ctx.prisma.department.findMany({
          where: {
            ...(search && {
              OR: [
                { name: { contains: search, mode: 'insensitive' } },
                { code: { contains: search, mode: 'insensitive' } },
                { description: { contains: search, mode: 'insensitive' } },
              ],
            }),
          },
          take: limit + 1,
          cursor: cursor ? { id: cursor } : undefined,
          orderBy: { createdAt: 'desc' },
        });
        
        let nextCursor: typeof cursor | undefined = undefined;
        if (departments.length > limit) {
          const nextDept = departments.pop();
          nextCursor = nextDept!.id;
        }
        
        return {
          departments,
          nextCursor,
        };
      }),
  }),

  // ========================================
  // AUDIT LOGGING
  // ========================================
  audit: router({
    getEntityEvents: protectedProcedure
      .input(z.object({
        entity: z.string(),
        entityId: z.string(),
        limit: z.number().min(1).max(100).default(50),
      }))
      .query(async ({ ctx, input }) => {
        return await AuditService.getEntityAuditEvents(
          ctx.tenantId,
          input.entity,
          input.entityId,
          input.limit
        );
      }),

    getUserEvents: protectedProcedure
      .input(z.object({
        userId: z.string().optional(),
        limit: z.number().min(1).max(100).default(50),
      }))
      .query(async ({ ctx, input }) => {
        const userId = input.userId || ctx.userId!;
        return await AuditService.getUserAuditEvents(
          ctx.tenantId,
          userId,
          input.limit
        );
      }),

    getActionEvents: protectedProcedure
      .input(z.object({
        action: z.string(),
        limit: z.number().min(1).max(100).default(50),
      }))
      .query(async ({ ctx, input }) => {
        return await AuditService.getActionAuditEvents(
          ctx.tenantId,
          input.action,
          input.limit
        );
      }),

    getFilteredEvents: rbacProcedure
      .use(requirePermission(PERMISSIONS.SYS_AUDIT_READ))
      .input(z.object({
        userId: z.string().optional(),
        action: z.string().optional(),
        entity: z.string().optional(),
        entityId: z.string().optional(),
        startDate: z.date().optional(),
        endDate: z.date().optional(),
        limit: z.number().min(1).max(100).default(100),
      }))
      .query(async ({ ctx, input }) => {
        return await AuditService.getAuditEvents(
          ctx.tenantId,
          {
            actorId: input.userId,
            action: input.action,
            entity: input.entity,
            entityId: input.entityId,
            startDate: input.startDate,
            endDate: input.endDate,
          },
          input.limit
        );
      }),
  }),

  // Additional procedures for new components
  getSites: protectedProcedure
    .query(async ({ ctx }) => {
      // Mock sites data - in real implementation, this would come from database
      return [
        { id: 'site-1', name: 'Main Site' },
        { id: 'site-2', name: 'Secondary Site' },
        { id: 'site-3', name: 'Remote Site' },
      ];
    }),

  getUsers: protectedProcedure
    .input(z.object({
      role: z.string().optional(),
    }))
    .query(async ({ ctx, input }) => {
      // Mock users data - in real implementation, this would come from database
      const users = [
        { id: 'user-1', name: 'John Doe', role: 'OPERATOR', isActive: true, lastLogin: '2024-03-10 14:30' },
        { id: 'user-2', name: 'Jane Smith', role: 'MANAGER', isActive: true, lastLogin: '2024-03-10 13:45' },
        { id: 'user-3', name: 'Bob Johnson', role: 'OPERATOR', isActive: true, lastLogin: '2024-03-10 12:15' },
        { id: 'user-4', name: 'Alice Brown', role: 'ADMIN', isActive: false, lastLogin: '2024-03-08 16:20' },
      ];

      if (input.role) {
        return { users: users.filter(user => user.role === input.role) };
      }

      return { users };
    }),

  // Recent Activities for Dashboard
  getRecentActivities: protectedProcedure
    .input(z.object({
      limit: z.number().min(1).max(1000).default(10),
    }))
    .query(async ({ ctx, input }) => {
      // Get recent audit events as activities
      const recentEvents = await AuditService.getAuditEvents(
        ctx.tenantId,
        {},
        input.limit
      );

      // Transform audit events to activities format
      const activities = recentEvents.map((event: any) => {
        const action = event.action as string;
        return {
          id: event.id,
          type: action.toLowerCase().includes('order') ? 'order' : 
                action.toLowerCase().includes('customer') ? 'crm' : 'system',
          message: `${action}: ${event.entity} ${event.entityId}`,
          time: new Date(event.createdAt).toLocaleString(),
          status: action.toLowerCase().includes('create') ? 'info' :
                 action.toLowerCase().includes('update') ? 'success' :
                 action.toLowerCase().includes('delete') ? 'warning' : 'info'
        };
      });

      return { activities };
    }),

  // System Configuration
  getSystemConfig: protectedProcedure
    .query(async ({ ctx }) => {
      // Mock system config data - in real implementation, this would come from database
      return {
        systemUptime: '99.8%',
        lastBackup: '2024-03-10 02:00',
        nextBackup: '2024-03-11 02:00',
        databaseSize: '2.4 GB',
        storageUsed: '68%'
      };
    }),

  // Sync Status
  getSyncStatus: protectedProcedure
    .query(async ({ ctx }) => {
      // Mock sync status data - in real implementation, this would come from database
      return {
        syncedToday: 1247,
        conflicts: 3
      };
    }),

  // Devices
  getDevices: protectedProcedure
    .query(async ({ ctx }) => {
      // Mock devices data - in real implementation, this would come from database
      return {
        devices: [
          {
            id: 1,
            name: 'Port Moresby Office',
            type: 'Desktop',
            status: 'Online',
            lastSync: '2024-01-15 10:30',
            pendingRecords: 0,
            syncProgress: 100,
            location: 'Port Moresby',
            ip: '192.168.1.100'
          },
          {
            id: 2,
            name: 'Lae Warehouse',
            type: 'Desktop',
            status: 'Online',
            lastSync: '2024-01-15 10:25',
            pendingRecords: 0,
            syncProgress: 100,
            location: 'Lae',
            ip: '192.168.1.101'
          }
        ]
      };
    }),

  // Sync Queue
  getSyncQueue: protectedProcedure
    .query(async ({ ctx }) => {
      // Mock sync queue data - in real implementation, this would come from database
      return {
        queue: [
          {
            id: 1,
            type: 'Customer Data Update',
            device: 'Mount Hagen Site',
            records: 45,
            status: 'Pending',
            timestamp: '2024-01-15 08:15',
            priority: 'High'
          },
          {
            id: 2,
            type: 'Customer Data',
            device: 'Goroka Field Office',
            records: 23,
            status: 'Pending',
            timestamp: '2024-01-15 07:30',
            priority: 'Medium'
          }
        ]
      };
    }),

  // List Customers
  listCustomers: protectedProcedure
    .input(z.object({
      limit: z.number().min(1).max(1000).default(50),
      search: z.string().optional(),
    }))
    .query(async ({ ctx, input }) => {
      try {
        const customers = await ctx.prisma.customer.findMany({
          where: {
            tenantId: ctx.tenantId,
            ...(input.search && {
              OR: [
                { name: { contains: input.search, mode: 'insensitive' } },
                { companyName: { contains: input.search, mode: 'insensitive' } },
                { email: { contains: input.search, mode: 'insensitive' } },
              ],
            }),
          },
          take: input.limit,
          orderBy: { createdAt: 'desc' },
          select: {
            id: true,
            name: true,
            companyName: true,
            email: true,
            phone: true,
            status: true,
            createdAt: true,
          },
        });

        return { customers };
      } catch (error) {
        console.error('Error fetching customers:', error);
        // Return empty array if error occurs
        return { customers: [] };
      }
    }),
});
