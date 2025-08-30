/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-return */
/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/prefer-nullish-coalescing */
import { z } from 'zod';
import { router, protectedProcedure, idempotentProcedure } from '../config/trpc';
import { TRPCError } from '@trpc/server';

// ========================================
// OPERATIONS ROUTER (P1 - Equipment & Usage)
// ========================================

export const operationsRouter = router({
  // Equipment Management
  listEquipment: protectedProcedure
    .input(z.object({
      cursor: z.string().optional(),
      limit: z.number().min(1).max(100).default(50),
      type: z.string().optional(),
      siteId: z.string().optional(),
      search: z.string().optional(), // FP6: server-side search
    }))
    .query(async ({ ctx, input }) => {
      const { cursor, limit, type, siteId, search } = input;
      
      // R2: tenant-scoped query with proper indexing
      const equipment = await ctx.prisma.equipment.findMany({
        where: {
          tenantId: ctx.tenantId, // R2: left-most index starts with tenant_id
          isActive: true,
          ...(type && { type }),
          ...(siteId && { currentSiteId: siteId }),
          // FP6: server-side search (avoid client-side filtering)
          ...(search && {
            OR: [
              { code: { contains: search, mode: 'insensitive' } },
              { type: { contains: search, mode: 'insensitive' } },
              { description: { contains: search, mode: 'insensitive' } },
            ],
          }),
        },
        take: limit + 1,
        cursor: cursor ? { id: cursor } : undefined,
        orderBy: { createdAt: 'desc' }, // R1: tie-break by id (createdAt for now)
      });
      
      let nextCursor: typeof cursor | undefined = undefined;
      if (equipment.length > limit) {
        const nextItem = equipment.pop();
        nextCursor = nextItem!.id;
      }
      
      return {
        equipment,
        nextCursor,
      };
    }),

  getEquipment: protectedProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      const equipment = await ctx.prisma.equipment.findFirst({
        where: {
          id: input.id,
          tenantId: ctx.tenantId,
        },
        include: {
          usageLogs: {
            orderBy: { shiftDate: 'desc' },
            take: 10,
          },
          breakdowns: {
            orderBy: { startAt: 'desc' },
            take: 5,
          },
          workOrders: {
            orderBy: { createdAt: 'desc' },
            take: 5,
          },
        },
      });
      
      if (!equipment) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Equipment not found',
        });
      }
      
      return equipment;
    }),

  createEquipment: idempotentProcedure
    .input(z.object({
      code: z.string().min(1),
      type: z.string().min(1),
      description: z.string().optional(),
      currentSiteId: z.string().optional(),
      acquisitionCost: z.number().min(0),
      currentValue: z.number().min(0),
      idempotencyKey: z.string().uuid(),
    }))
    .mutation(async ({ ctx, input }) => {
      const { idempotencyKey, ...data } = input;
      
      // Check if equipment code already exists
      const existing = await ctx.prisma.equipment.findFirst({
        where: {
          code: data.code,
          tenantId: ctx.tenantId,
        },
      });
      
      if (existing) {
        throw new TRPCError({
          code: 'CONFLICT',
          message: 'Equipment code already exists',
        });
      }
      
      const equipment = await ctx.prisma.equipment.create({
        data: {
          ...data,
          tenantId: ctx.tenantId,
        },
      });
      
      // Create audit event
      await ctx.prisma.auditEvent.create({
        data: {
          tenantId: ctx.tenantId,
          actorId: ctx.userId,
          entity: 'Equipment',
          entityId: equipment.id,
          action: 'created',
          changes: data,
          hash: `audit-${equipment.id}-${Date.now()}`,
        },
      });
      
      // Create outbox event
      await ctx.prisma.outboxEvent.create({
        data: {
          tenantId: ctx.tenantId,
          type: 'ops.equipment.created',
          entity: 'Equipment',
          entityId: equipment.id,
          version: equipment.version,
          payload: {
            code: equipment.code,
            type: equipment.type,
            siteId: equipment.currentSiteId,
          },
          delivered: false,
        },
      });
      
      return equipment;
    }),

  // Usage Logging (P1 - Core requirement)
  logUsage: idempotentProcedure
    .input(z.object({
      equipmentId: z.string(),
      shiftDate: z.string().datetime(),
      hoursUsed: z.number().min(0),
      loadUnits: z.number().min(0).optional(),
      operatorId: z.string().optional(),
      notes: z.string().optional(),
      idempotencyKey: z.string().uuid(),
      baseVersion: z.number().int().optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      const { idempotencyKey, baseVersion, ...data } = input;
      
      // Check equipment exists and get current version
      const equipment = await ctx.prisma.equipment.findFirst({
        where: {
          id: data.equipmentId,
          tenantId: ctx.tenantId,
        },
      });
      
      if (!equipment) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Equipment not found',
        });
      }
      
      // Version check for conflict resolution (R4)
      if (baseVersion && equipment.version !== baseVersion) {
        throw new TRPCError({
          code: 'CONFLICT',
          message: 'Equipment version mismatch',
          cause: {
            currentVersion: equipment.version,
            expectedVersion: baseVersion,
          },
        });
      }
      
      const usageLog = await ctx.prisma.usageLog.create({
        data: {
          ...data,
          tenantId: ctx.tenantId,
        },
      });
      
      // Create audit event
      await ctx.prisma.auditEvent.create({
        data: {
          tenantId: ctx.tenantId,
          actorId: ctx.userId,
          entity: 'UsageLog',
          entityId: usageLog.id,
          action: 'created',
          changes: data,
          hash: `audit-${usageLog.id}-${Date.now()}`,
        },
      });
      
      // Create outbox event
      await ctx.prisma.outboxEvent.create({
        data: {
          tenantId: ctx.tenantId,
          type: 'ops.usage.created',
          entity: 'UsageLog',
          entityId: usageLog.id,
          version: 1,
          payload: {
            equipmentId: usageLog.equipmentId,
            hoursUsed: usageLog.hoursUsed,
            loadUnits: usageLog.loadUnits,
            shiftDate: usageLog.shiftDate,
          },
          delivered: false,
        },
      });
      
      return usageLog;
    }),

  // Breakdown Management
  reportBreakdown: idempotentProcedure
    .input(z.object({
      equipmentId: z.string(),
      startAt: z.string().datetime(),
      reason: z.string().optional(),
      notes: z.string().optional(),
      idempotencyKey: z.string().uuid(),
    }))
    .mutation(async ({ ctx, input }) => {
      const { idempotencyKey, ...data } = input;
      
      const breakdown = await ctx.prisma.breakdown.create({
        data: {
          ...data,
          tenantId: ctx.tenantId,
          reportedBy: ctx.userId,
        },
      });
      
      // Create audit event
      await ctx.prisma.auditEvent.create({
        data: {
          tenantId: ctx.tenantId,
          actorId: ctx.userId,
          entity: 'Breakdown',
          entityId: breakdown.id,
          action: 'created',
          changes: data,
          hash: `audit-${breakdown.id}-${Date.now()}`,
        },
      });
      
      // Create outbox event
      await ctx.prisma.outboxEvent.create({
        data: {
          tenantId: ctx.tenantId,
          type: 'ops.breakdown.reported',
          entity: 'Breakdown',
          entityId: breakdown.id,
          version: 1,
          payload: {
            equipmentId: breakdown.equipmentId,
            startAt: breakdown.startAt,
            reason: breakdown.reason,
          },
          delivered: false,
        },
      });
      
      return breakdown;
    }),

  resolveBreakdown: idempotentProcedure
    .input(z.object({
      id: z.string(),
      endAt: z.string().datetime(),
      notes: z.string().optional(),
      idempotencyKey: z.string().uuid(),
    }))
    .mutation(async ({ ctx, input }) => {
      const { idempotencyKey, ...data } = input;
      
      const breakdown = await ctx.prisma.breakdown.update({
        where: {
          id: data.id,
          tenantId: ctx.tenantId,
        },
        data: {
          endAt: new Date(data.endAt),
          notes: data.notes,
          resolvedBy: ctx.userId,
        },
      });
      
      // Create audit event
      await ctx.prisma.auditEvent.create({
        data: {
          tenantId: ctx.tenantId,
          actorId: ctx.userId,
          entity: 'Breakdown',
          entityId: breakdown.id,
          action: 'resolved',
          changes: data,
          hash: `audit-${breakdown.id}-${Date.now()}`,
        },
      });
      
      // Create outbox event
      await ctx.prisma.outboxEvent.create({
        data: {
          tenantId: ctx.tenantId,
          type: 'ops.breakdown.resolved',
          entity: 'Breakdown',
          entityId: breakdown.id,
          version: 1,
          payload: {
            equipmentId: breakdown.equipmentId,
            startAt: breakdown.startAt,
            endAt: breakdown.endAt,
            duration: breakdown.endAt ? 
              new Date(breakdown.endAt).getTime() - new Date(breakdown.startAt).getTime() : null,
          },
          delivered: false,
        },
      });
      
      return breakdown;
    }),

  // Work Order Management
  createWorkOrder: idempotentProcedure
    .input(z.object({
      equipmentId: z.string(),
      type: z.enum(['preventive', 'corrective', 'emergency']),
      status: z.enum(['planned', 'released', 'in_progress', 'completed', 'canceled']).default('planned'),
      scheduledDate: z.string().datetime().optional(),
      estimatedCost: z.number().min(0).default(0),
      description: z.string().optional(),
      assignedTo: z.string().optional(),
      idempotencyKey: z.string().uuid(),
    }))
    .mutation(async ({ ctx, input }) => {
      const { idempotencyKey, ...data } = input;
      
      const workOrder = await ctx.prisma.workOrder.create({
        data: {
          ...data,
          tenantId: ctx.tenantId,
        },
      });
      
      // Create audit event
      await ctx.prisma.auditEvent.create({
        data: {
          tenantId: ctx.tenantId,
          actorId: ctx.userId,
          entity: 'WorkOrder',
          entityId: workOrder.id,
          action: 'created',
          changes: data,
          hash: `audit-${workOrder.id}-${Date.now()}`,
        },
      });
      
      // Create outbox event
      await ctx.prisma.outboxEvent.create({
        data: {
          tenantId: ctx.tenantId,
          type: 'ops.workorder.created',
          entity: 'WorkOrder',
          entityId: workOrder.id,
          version: 1,
          payload: {
            equipmentId: workOrder.equipmentId,
            type: workOrder.type,
            status: workOrder.status,
            scheduledDate: workOrder.scheduledDate,
          },
          delivered: false,
        },
      });
      
      return workOrder;
    }),

  // KPIs and Analytics (P1 - MTTR, MTBS, Availability%)
  getEquipmentKPIs: protectedProcedure
    .input(z.object({
      equipmentId: z.string().optional(),
      startDate: z.string().datetime(),
      endDate: z.string().datetime(),
    }))
    .query(async ({ ctx, input }) => {
      const { equipmentId, startDate, endDate } = input;
      
      // Get breakdowns for MTTR calculation
      const breakdowns = await ctx.prisma.breakdown.findMany({
        where: {
          tenantId: ctx.tenantId,
          ...(equipmentId && { equipmentId }),
          startAt: {
            gte: new Date(startDate),
            lte: new Date(endDate),
          },
          endAt: { not: null }, // Only resolved breakdowns
        },
      });
      
      // Calculate MTTR (Mean Time To Repair)
      const totalRepairTime = breakdowns.reduce((sum, breakdown) => {
        if (breakdown.endAt) {
          return sum + (new Date(breakdown.endAt).getTime() - new Date(breakdown.startAt).getTime());
        }
        return sum;
      }, 0);
      
      const mttr = breakdowns.length > 0 ? totalRepairTime / breakdowns.length / (1000 * 60 * 60) : 0; // hours
      
      // Get usage logs for MTBS calculation
      const usageLogs = await ctx.prisma.usageLog.findMany({
        where: {
          tenantId: ctx.tenantId,
          ...(equipmentId && { equipmentId }),
          shiftDate: {
            gte: new Date(startDate),
            lte: new Date(endDate),
          },
        },
      });
      
      const totalRuntime = usageLogs.reduce((sum, log) => sum + Number(log.hoursUsed), 0);
      const mtbs = breakdowns.length > 0 ? totalRuntime / breakdowns.length : 0; // hours
      
      // Calculate Availability%
      const totalTime = (new Date(endDate).getTime() - new Date(startDate).getTime()) / (1000 * 60 * 60); // hours
      const downtime = breakdowns.reduce((sum, breakdown) => {
        if (breakdown.endAt) {
          return sum + (new Date(breakdown.endAt).getTime() - new Date(breakdown.startAt).getTime()) / (1000 * 60 * 60);
        }
        return sum;
      }, 0);
      
      const availability = totalTime > 0 ? ((totalTime - downtime) / totalTime) * 100 : 100;
      
      return {
        mttr: Math.round(mttr * 100) / 100, // Round to 2 decimal places
        mtbs: Math.round(mtbs * 100) / 100,
        availability: Math.round(availability * 100) / 100,
        totalBreakdowns: breakdowns.length,
        totalRuntime: Math.round(totalRuntime * 100) / 100,
        totalDowntime: Math.round(downtime * 100) / 100,
      };
    }),

  // Additional procedures for new components
  updateEquipment: idempotentProcedure
    .input(z.object({
      id: z.string(),
      code: z.string().min(1),
      type: z.string().min(1),
      description: z.string().optional(),
      currentSiteId: z.string().optional(),
      acquisitionCost: z.number().min(0),
      currentValue: z.number().min(0),
      idempotencyKey: z.string().uuid(),
    }))
    .mutation(async ({ ctx, input }) => {
      const { idempotencyKey, id, ...data } = input;
      
      const equipment = await ctx.prisma.equipment.update({
        where: {
          id,
          tenantId: ctx.tenantId,
        },
        data: {
          ...data,
          version: { increment: 1 },
        },
      });
      
      return equipment;
    }),

  deleteEquipment: idempotentProcedure
    .input(z.object({
      id: z.string(),
      idempotencyKey: z.string().uuid(),
    }))
    .mutation(async ({ ctx, input }) => {
      const { idempotencyKey, id } = input;
      
      const equipment = await ctx.prisma.equipment.update({
        where: {
          id,
          tenantId: ctx.tenantId,
        },
        data: {
          isActive: false,
          version: { increment: 1 },
        },
      });
      
      return equipment;
    }),

  getUsageLogs: protectedProcedure
    .input(z.object({
      from: z.string().datetime(),
      to: z.string().datetime(),
      equipmentId: z.string().optional(),
    }))
    .query(async ({ ctx, input }) => {
      const { from, to, equipmentId } = input;
      
      const usageLogs = await ctx.prisma.usageLog.findMany({
        where: {
          tenantId: ctx.tenantId,
          ...(equipmentId && { equipmentId }),
          shiftDate: {
            gte: new Date(from),
            lte: new Date(to),
          },
        },
        include: {
          equipment: true,
        },
        orderBy: { shiftDate: 'desc' },
      });
      
      return usageLogs;
    }),

  getBreakdowns: protectedProcedure
    .input(z.object({
      from: z.string().datetime(),
      to: z.string().datetime(),
      equipmentId: z.string().optional(),
    }))
    .query(async ({ ctx, input }) => {
      const { from, to, equipmentId } = input;
      
      const breakdowns = await ctx.prisma.breakdown.findMany({
        where: {
          tenantId: ctx.tenantId,
          ...(equipmentId && { equipmentId }),
          startAt: {
            gte: new Date(from),
            lte: new Date(to),
          },
        },
        include: {
          equipment: true,
        },
        orderBy: { startAt: 'desc' },
      });
      
      return breakdowns;
    }),

  createBreakdown: idempotentProcedure
    .input(z.object({
      equipmentId: z.string(),
      startAt: z.string().datetime(),
      endAt: z.string().datetime().optional(),
      reason: z.string().optional(),
      notes: z.string().optional(),
      reportedBy: z.string().optional(),
      idempotencyKey: z.string().uuid(),
    }))
    .mutation(async ({ ctx, input }) => {
      const { idempotencyKey, ...data } = input;
      
      const breakdown = await ctx.prisma.breakdown.create({
        data: {
          ...data,
          tenantId: ctx.tenantId,
          reportedBy: data.reportedBy || ctx.userId,
        },
      });
      
      return breakdown;
    }),

  updateBreakdown: idempotentProcedure
    .input(z.object({
      id: z.string(),
      equipmentId: z.string(),
      startAt: z.string().datetime(),
      endAt: z.string().datetime().optional(),
      reason: z.string().optional(),
      notes: z.string().optional(),
      reportedBy: z.string().optional(),
      idempotencyKey: z.string().uuid(),
    }))
    .mutation(async ({ ctx, input }) => {
      const { idempotencyKey, id, ...data } = input;
      
      const breakdown = await ctx.prisma.breakdown.update({
        where: {
          id,
          tenantId: ctx.tenantId,
        },
        data,
      });
      
      return breakdown;
    }),


});




