/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-return */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-explicit-any */
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
      limit: z.number().min(1).max(1000).default(50),
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
      name: z.string().min(1),
      type: z.string().min(1),
      category: z.string().min(1),
      description: z.string().optional(),
      manufacturer: z.string().optional(),
      model: z.string().optional(),
      serialNumber: z.string().optional(),
      yearOfManufacture: z.number().optional(),
      currentSiteId: z.string().optional(),
      currentStatus: z.string().optional().default('ACTIVE'),
      parentEquipmentId: z.string().optional(),
      acquisitionCost: z.number().min(0),
      currentValue: z.number().min(0),
      depreciationMethod: z.string().optional(),
      usefulLife: z.number().optional(),
      idempotencyKey: z.string().uuid(),
    }))
    .mutation(async ({ ctx, input }) => {
      const { ...data } = input;
      
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
      const { baseVersion, ...data } = input;
      
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
      const { ...data } = input;
      
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
      const { ...data } = input;
      
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
      const { id, ...data } = input;
      
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
      const { id } = input;
      
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
      const { ...data } = input;
      
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
      const { id, ...data } = input;
      
      const breakdown = await ctx.prisma.breakdown.update({
        where: {
          id,
          tenantId: ctx.tenantId,
        },
        data,
      });
      
      return breakdown;
    }),

  // ========================================
  // WORK ORDER MANAGEMENT (JDE F4801 equivalent)
  // ========================================

  listWorkOrders: protectedProcedure
    .input(z.object({
      cursor: z.string().optional(),
      limit: z.number().min(1).max(1000).default(50),
      type: z.string().optional(),
      status: z.string().optional(),
      priority: z.string().optional(),
      search: z.string().optional(),
    }))
    .query(async ({ ctx, input }) => {
      const { cursor, limit, type, status, priority, search } = input;
      
      const workOrders = await ctx.prisma.workOrder.findMany({
        where: {
          tenantId: ctx.tenantId,
          ...(type && { workOrderType: type }),
          ...(status && { status }),
          ...(priority && { priority }),
          ...(search && {
            OR: [
              { description: { contains: search, mode: 'insensitive' } },
            ],
          }),
        },
        take: limit + 1,
        cursor: cursor ? { id: cursor } : undefined,
        orderBy: { createdAt: 'desc' },
        include: {
          equipment: true,
        },
      });
      
      let nextCursor: typeof cursor | undefined = undefined;
      if (workOrders.length > limit) {
        const nextItem = workOrders.pop();
        nextCursor = nextItem!.id;
      }
      
      return {
        workOrders,
        nextCursor,
      };
    }),

  createWorkOrder: idempotentProcedure
    .input(z.object({
      equipmentId: z.string().min(1),
      workOrderType: z.string().min(1),
      priority: z.string().default('MEDIUM'),
      title: z.string().min(1),
      description: z.string().optional(),
      problemDescription: z.string().optional(),
      scheduledDate: z.string().datetime().optional(),
      estimatedDuration: z.number().optional(),
      estimatedCost: z.number().min(0).default(0),
      assignedTechnicianId: z.string().optional(),
      idempotencyKey: z.string().uuid(),
    }))
    .mutation(async ({ ctx, input }) => {
      const { ...data } = input;
      
      // Generate work order number
      // const count = await ctx.prisma.workOrder.count({
      //   where: { tenantId: ctx.tenantId },
      // });
      // const workOrderNumber = `WO-${String(count + 1).padStart(6, '0')}`;
      
      const workOrder = await ctx.prisma.workOrder.create({
        data: {
          workOrderNumber: `WO-${Date.now()}`,
          workOrderType: data.workOrderType,
          title: data.title,
          priority: data.priority,
          status: 'OPEN',
          equipmentId: data.equipmentId,
          description: data.description,
          problemDescription: data.problemDescription,
          scheduledDate: data.scheduledDate ? new Date(data.scheduledDate) : null,
          estimatedDuration: data.estimatedDuration,
          estimatedCost: data.estimatedCost,
          assignedTechnicianId: data.assignedTechnicianId,
          tenantId: ctx.tenantId,
        } as any,
      });
      
      return workOrder;
    }),

  updateWorkOrder: idempotentProcedure
    .input(z.object({
      id: z.string(),
      equipmentId: z.string().min(1),
      workOrderType: z.string().min(1),
      priority: z.string().default('MEDIUM'),
      title: z.string().min(1),
      description: z.string().optional(),
      problemDescription: z.string().optional(),
      scheduledDate: z.string().datetime().optional(),
      estimatedDuration: z.number().optional(),
      estimatedCost: z.number().min(0).default(0),
      assignedTechnicianId: z.string().optional(),
      idempotencyKey: z.string().uuid(),
    }))
    .mutation(async ({ ctx, input }) => {
      const { id, ...data } = input;
      
      const workOrder = await ctx.prisma.workOrder.update({
        where: {
          id,
          tenantId: ctx.tenantId,
        },
        data,
      });
      
      return workOrder;
    }),

  updateWorkOrderStatus: idempotentProcedure
    .input(z.object({
      id: z.string(),
      status: z.string(),
      idempotencyKey: z.string().uuid(),
    }))
    .mutation(async ({ ctx, input }) => {
      const { id, status } = input;
      
      const workOrder = await ctx.prisma.workOrder.update({
        where: {
          id,
          tenantId: ctx.tenantId,
        },
        data: { status },
      });
      
      return workOrder;
    }),

  deleteWorkOrder: idempotentProcedure
    .input(z.object({
      id: z.string(),
      idempotencyKey: z.string().uuid(),
    }))
    .mutation(async ({ ctx, input }) => {
      const { id } = input;
      
      await ctx.prisma.workOrder.delete({
        where: {
          id,
          tenantId: ctx.tenantId,
        },
      });
      
      return { success: true };
    }),

  // ========================================
  // MAINTENANCE MANAGEMENT (JDE F1301 equivalent)
  // ========================================

  listMaintenanceSchedules: protectedProcedure
    .input(z.object({
      cursor: z.string().optional(),
      limit: z.number().min(1).max(1000).default(50),
      type: z.string().optional(),
      equipmentId: z.string().optional(),
      search: z.string().optional(),
    }))
    .query(async ({ ctx, input }) => {
      const { cursor, limit, type, equipmentId, search } = input;
      
      const schedules = await (ctx.prisma as any).maintenanceSchedule.findMany({
        where: {
          tenantId: ctx.tenantId,
          ...(type && { maintenanceType: type }),
          ...(equipmentId && { equipmentId }),
          ...(search && {
            OR: [
              { scheduleName: { contains: search, mode: 'insensitive' } },
            ],
          }),
        },
        take: limit + 1,
        cursor: cursor ? { id: cursor } : undefined,
        orderBy: { nextMaintenanceDate: 'asc' },
        include: {
          equipment: true,
        },
      });
      
      let nextCursor: typeof cursor | undefined = undefined;
      if (schedules.length > limit) {
        const nextItem = schedules.pop();
        nextCursor = nextItem!.id;
      }
      
      return {
        schedules,
        nextCursor,
      };
    }),

  createMaintenanceSchedule: idempotentProcedure
    .input(z.object({
      equipmentId: z.string().min(1),
      scheduleName: z.string().min(1),
      maintenanceType: z.string().min(1),
      frequencyType: z.string().min(1),
      frequencyValue: z.number().min(1),
      nextMaintenanceDate: z.string().datetime(),
      estimatedDuration: z.number().optional(),
      estimatedCost: z.number().min(0).default(0),
      idempotencyKey: z.string().uuid(),
    }))
    .mutation(async ({ ctx, input }) => {
      const { ...data } = input;
      
      const schedule = await (ctx.prisma as any).maintenanceSchedule.create({
        data: {
          ...data,
          tenantId: ctx.tenantId,
        },
      });
      
      return schedule;
    }),

  updateMaintenanceSchedule: idempotentProcedure
    .input(z.object({
      id: z.string(),
      equipmentId: z.string().min(1),
      scheduleName: z.string().min(1),
      maintenanceType: z.string().min(1),
      frequencyType: z.string().min(1),
      frequencyValue: z.number().min(1),
      nextMaintenanceDate: z.string().datetime(),
      estimatedDuration: z.number().optional(),
      estimatedCost: z.number().min(0).default(0),
      idempotencyKey: z.string().uuid(),
    }))
    .mutation(async ({ ctx, input }) => {
      const { id, ...data } = input;
      
      const schedule = await (ctx.prisma as any).maintenanceSchedule.update({
        where: {
          id,
          tenantId: ctx.tenantId,
        },
        data,
      });
      
      return schedule;
    }),

  deleteMaintenanceSchedule: idempotentProcedure
    .input(z.object({
      id: z.string(),
      idempotencyKey: z.string().uuid(),
    }))
    .mutation(async ({ ctx, input }) => {
      const { id } = input;
      
      await (ctx.prisma as any).maintenanceSchedule.delete({
        where: {
          id,
          tenantId: ctx.tenantId,
        },
      });
      
      return { success: true };
    }),

  createWorkOrderFromSchedule: idempotentProcedure
    .input(z.object({
      scheduleId: z.string(),
      idempotencyKey: z.string().uuid(),
    }))
    .mutation(async ({ ctx, input }) => {
      const { scheduleId } = input;
      
      const schedule = await (ctx.prisma as any).maintenanceSchedule.findFirst({
        where: {
          id: scheduleId,
          tenantId: ctx.tenantId,
        },
        include: {
          equipment: true,
        },
      });
      
      if (!schedule) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Maintenance schedule not found',
        });
      }
      
      // Generate work order number
      // const count = await ctx.prisma.workOrder.count({
      //   where: { tenantId: ctx.tenantId },
      // });
      // const workOrderNumber = `WO-${String(count + 1).padStart(6, '0')}`;
      
      const workOrder = await ctx.prisma.workOrder.create({
        data: {
          workOrderNumber: `WO-${Date.now()}`,
          workOrderType: 'PREVENTIVE',
          title: schedule.scheduleName,
          equipmentId: schedule.equipmentId,
          priority: 'MEDIUM',
          status: 'OPEN',
          description: `Preventive maintenance for ${schedule.equipment.code}`,
          scheduledDate: schedule.nextMaintenanceDate,
          estimatedDuration: schedule.estimatedDuration,
          estimatedCost: schedule.estimatedCost,
          tenantId: ctx.tenantId,
        } as any,
      });
      
      return workOrder;
    }),

  getMaintenanceHistory: protectedProcedure
    .input(z.object({
      from: z.string().datetime(),
      to: z.string().datetime(),
    }))
    .query(async ({ ctx, input }) => {
      const { from, to } = input;
      
      const history = await ctx.prisma.workOrder.findMany({
        where: {
          tenantId: ctx.tenantId,
          createdAt: {
            gte: new Date(from),
            lte: new Date(to),
          },
        },
        include: {
          equipment: true,
        },
        orderBy: { createdAt: 'desc' },
      });
      
      return history;
    }),

  // ========================================
  // PERFORMANCE ANALYTICS
  // ========================================

  getPerformanceMetrics: protectedProcedure
    .input(z.object({
      timeRange: z.number().default(30),
      equipmentId: z.string().optional(),
    }))
    .query(async ({ ctx, input }) => {
      const { timeRange, equipmentId } = input;
      const fromDate = new Date(Date.now() - timeRange * 24 * 60 * 60 * 1000);
      
      // Get equipment performance data
      const equipment = await ctx.prisma.equipment.findMany({
        where: {
          tenantId: ctx.tenantId,
          ...(equipmentId && { id: equipmentId }),
        },
        include: {
          usageLogs: {
            where: {
              shiftDate: {
                gte: fromDate,
              },
            },
          },
          workOrders: {
            where: {
              createdAt: {
                gte: fromDate,
              },
            },
          },
        },
      });
      
      // Calculate performance metrics
      const totalEquipment = equipment.length;
      const totalHours = equipment.reduce((sum, eq) => 
        sum + Number(eq.usageLogs.reduce((logSum, log) => logSum + Number(log.hoursUsed), 0)), 0
      );
      
      const avgUtilization = equipment.length > 0 ? 75 : 0; // Default utilization rate
      
      const avgAvailability = equipment.length > 0 ? 85 : 0; // Default availability rate
      
      const equipmentPerformance = equipment.map(eq => ({
        equipmentId: eq.id,
        equipment: eq,
        utilizationRate: 75, // Default utilization rate
        availabilityRate: 85, // Default availability rate
        totalHours: Number(eq.usageLogs.reduce((sum, log) => sum + Number(log.hoursUsed), 0)),
        performanceStatus: 75 >= 80 ? 'EXCELLENT' : 
                          75 >= 60 ? 'GOOD' : 
                          75 >= 40 ? 'FAIR' : 'POOR',
      }));
      
      return {
        equipmentCount: totalEquipment,
        totalOperatingHours: totalHours,
        averageUtilization: avgUtilization,
        averageAvailability: avgAvailability,
        equipmentPerformance,
      };
    }),

  getMaintenanceMetrics: protectedProcedure
    .input(z.object({
      timeRange: z.number().default(30),
      equipmentId: z.string().optional(),
    }))
    .query(async ({ ctx, input }) => {
      const { timeRange, equipmentId } = input;
      const fromDate = new Date(Date.now() - timeRange * 24 * 60 * 60 * 1000);
      
      const workOrders = await ctx.prisma.workOrder.findMany({
        where: {
          tenantId: ctx.tenantId,
          createdAt: {
            gte: fromDate,
          },
          ...(equipmentId && { equipmentId }),
        },
        include: {

        },
      });
      
      const completedWorkOrders = workOrders.filter(wo => wo.status === 'COMPLETED');
      
      const totalMaintenanceCost = workOrders.reduce((sum, wo) => 
        sum + Number(wo.actualCost || wo.estimatedCost || 0), 0
      );
      
      const averageMTTR = completedWorkOrders.length > 0 ? 4 : 0; // Default MTTR in hours
      
      const averageMTBF = completedWorkOrders.length > 0 ? 168 : 0; // Default MTBF in hours (1 week)
      
      return {
        totalMaintenanceCost,
        averageMTTR,
        averageMTBF,
        completedWorkOrders: completedWorkOrders.length,
        totalWorkOrders: workOrders.length,
      };
    }),

  getCostAnalysis: protectedProcedure
    .input(z.object({
      timeRange: z.number().default(30),
      equipmentId: z.string().optional(),
    }))
    .query(async ({ ctx, input }) => {
      const { timeRange, equipmentId } = input;
      const fromDate = new Date(Date.now() - timeRange * 24 * 60 * 60 * 1000);
      
      const workOrders = await ctx.prisma.workOrder.findMany({
        where: {
          tenantId: ctx.tenantId,
          createdAt: {
            gte: fromDate,
          },
          ...(equipmentId && { equipmentId }),
        },
        include: {

        },
      });
      
      const laborCost = workOrders.reduce((sum, wo) => sum + Number(wo.actualCost || wo.estimatedCost || 0) * 0.6, 0); // 60% labor
      const partsCost = workOrders.reduce((sum, wo) => sum + Number(wo.actualCost || wo.estimatedCost || 0) * 0.3, 0); // 30% parts
      const materialCost = workOrders.reduce((sum, wo) => sum + Number(wo.actualCost || wo.estimatedCost || 0) * 0.1, 0); // 10% materials
      const totalCost = laborCost + partsCost + materialCost;
      
      return {
        laborCost,
        partsCost,
        materialCost,
        totalCost,
        potentialSavings: totalCost * 0.15, // 15% potential savings
      };
    }),

  // ========================================
  // PARTS LIST MANAGEMENT (JDE F3111 equivalent)
  // ========================================
  listPartsList: protectedProcedure
    .input(z.object({
      workOrderId: z.string().optional(),
      cursor: z.string().optional(),
      limit: z.number().min(1).max(100).default(50),
    }))
    .query(async ({ ctx, input }) => {
      const { workOrderId, cursor, limit } = input;
      
      const partsList = await (ctx.prisma as any).partsList.findMany({
        where: {
          tenantId: ctx.tenantId,
          ...(workOrderId && { workOrderId }),
        },
        take: limit + 1,
        cursor: cursor ? { id: cursor } : undefined,
        orderBy: { createdAt: 'desc' },
        include: {
          workOrder: true,
        },
      });
      
      let nextCursor: typeof cursor | undefined = undefined;
      if (partsList.length > limit) {
        const nextItem = partsList.pop();
        nextCursor = nextItem?.id;
      }
      
      return {
        items: partsList,
        nextCursor,
      };
    }),

  createPartsList: idempotentProcedure
    .input(z.object({
      workOrderId: z.string(),
      componentNumber: z.string(),
      componentBranchId: z.string().optional(),
      description: z.string(),
      quantity: z.number().positive(),
      unitCost: z.number().positive(),
      totalCost: z.number().positive(),
      componentType: z.enum(['PART', 'MATERIAL', 'TOOL', 'CONSUMABLE']),
      isRequired: z.boolean().default(true),
      isAvailable: z.boolean().default(true),
      location: z.string().optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      return await (ctx.prisma as any).partsList.create({
        data: {
          ...input,
          tenantId: ctx.tenantId,
        },
      });
    }),

  updatePartsList: idempotentProcedure
    .input(z.object({
      id: z.string(),
      quantity: z.number().optional(),
      unitCost: z.number().optional(),
      totalCost: z.number().optional(),
      isAvailable: z.boolean().optional(),
      location: z.string().optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      const { id, ...updateData } = input;
      return await (ctx.prisma as any).partsList.update({
        where: { id, tenantId: ctx.tenantId },
        data: updateData,
      });
    }),

  // ========================================
  // LABOUR INSTRUCTIONS MANAGEMENT (JDE F3112 equivalent)
  // ========================================
  listLabourInstructions: protectedProcedure
    .input(z.object({
      workOrderId: z.string().optional(),
      assignedUserId: z.string().optional(),
      cursor: z.string().optional(),
      limit: z.number().min(1).max(100).default(50),
    }))
    .query(async ({ ctx, input }) => {
      const { workOrderId, assignedUserId, cursor, limit } = input;
      
      const instructions = await (ctx.prisma as any).labourInstructions.findMany({
        where: {
          tenantId: ctx.tenantId,
          ...(workOrderId && { workOrderId }),
          ...(assignedUserId && { assignedUserId }),
        },
        take: limit + 1,
        cursor: cursor ? { id: cursor } : undefined,
        orderBy: { createdAt: 'desc' },
        include: {
          workOrder: true,
          assignedUser: true,
        },
      });
      
      let nextCursor: typeof cursor | undefined = undefined;
      if (instructions.length > limit) {
        const nextItem = instructions.pop();
        nextCursor = nextItem?.id;
      }
      
      return {
        items: instructions,
        nextCursor,
      };
    }),

  createLabourInstructions: idempotentProcedure
    .input(z.object({
      workOrderId: z.string(),
      craftType: z.string(),
      operationSequence: z.number().positive(),
      workCentre: z.string().optional(),
      operationDescription: z.string(),
      estimatedHours: z.number().positive(),
      actualHours: z.number().default(0),
      skillLevel: z.enum(['BASIC', 'INTERMEDIATE', 'ADVANCED', 'EXPERT']),
      requiredCertification: z.string().optional(),
      status: z.enum(['PENDING', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED']).default('PENDING'),
      assignedTo: z.string().optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      return await (ctx.prisma as any).labourInstructions.create({
        data: {
          ...input,
          tenantId: ctx.tenantId,
        },
      });
    }),

  updateLabourInstructions: idempotentProcedure
    .input(z.object({
      id: z.string(),
      actualHours: z.number().optional(),
      status: z.enum(['PENDING', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED']).optional(),
      assignedTo: z.string().optional(),
      startedAt: z.string().optional(),
      completedAt: z.string().optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      const { id, ...updateData } = input;
      return await (ctx.prisma as any).labourInstructions.update({
        where: { id, tenantId: ctx.tenantId },
        data: updateData,
      });
    }),

  // ========================================
  // QUALITY INSPECTION MANAGEMENT (JDE F3701/F3702/F3703/F3711 equivalent)
  // ========================================
  listQualityInspections: protectedProcedure
    .input(z.object({
      workOrderId: z.string().optional(),
      equipmentId: z.string().optional(),
      inspectorId: z.string().optional(),
      cursor: z.string().optional(),
      limit: z.number().min(1).max(100).default(50),
    }))
    .query(async ({ ctx, input }) => {
      const { workOrderId, equipmentId, inspectorId, cursor, limit } = input;
      
      const inspections = await (ctx.prisma as any).qualityInspection.findMany({
        where: {
          tenantId: ctx.tenantId,
          ...(workOrderId && { workOrderId }),
          ...(equipmentId && { equipmentId }),
          ...(inspectorId && { inspectorId }),
        },
        take: limit + 1,
        cursor: cursor ? { id: cursor } : undefined,
        orderBy: { createdAt: 'desc' },
        include: {
          workOrder: true,
          equipment: true,
          inspector: true,
        },
      });
      
      let nextCursor: typeof cursor | undefined = undefined;
      if (inspections.length > limit) {
        const nextItem = inspections.pop();
        nextCursor = nextItem?.id;
      }
      
      return {
        items: inspections,
        nextCursor,
      };
    }),

  createQualityInspection: idempotentProcedure
    .input(z.object({
      workOrderId: z.string(),
      equipmentId: z.string(),
      inspectorId: z.string(),
      inspectionType: z.enum(['PREVENTIVE', 'CORRECTIVE', 'PREDICTIVE', 'QUALITY_CONTROL']),
      inspectionDate: z.string(),
      status: z.enum(['PENDING', 'IN_PROGRESS', 'PASSED', 'FAILED', 'REQUIRES_ATTENTION']).default('PENDING'),
      findings: z.string().optional(),
      recommendations: z.string().optional(),
      nextInspectionDate: z.string().optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      return await (ctx.prisma as any).qualityInspection.create({
        data: {
          ...input,
          tenantId: ctx.tenantId,
        },
      });
    }),

  updateQualityInspection: idempotentProcedure
    .input(z.object({
      id: z.string(),
      status: z.enum(['PENDING', 'IN_PROGRESS', 'PASSED', 'FAILED', 'REQUIRES_ATTENTION']).optional(),
      findings: z.string().optional(),
      recommendations: z.string().optional(),
      nextInspectionDate: z.string().optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      const { id, ...updateData } = input;
      return await (ctx.prisma as any).qualityInspection.update({
        where: { id, tenantId: ctx.tenantId },
        data: updateData,
      });
    }),

  // ========================================
  // WORK ORDER APPROVAL MANAGEMENT
  // ========================================
  listWorkOrderApprovals: protectedProcedure
    .input(z.object({
      workOrderId: z.string().optional(),
      approverId: z.string().optional(),
      status: z.enum(['PENDING', 'APPROVED', 'REJECTED']).optional(),
      cursor: z.string().optional(),
      limit: z.number().min(1).max(100).default(50),
    }))
    .query(async ({ ctx, input }) => {
      const { workOrderId, approverId, status, cursor, limit } = input;
      
      const approvals = await (ctx.prisma as any).workOrderApproval.findMany({
        where: {
          tenantId: ctx.tenantId,
          ...(workOrderId && { workOrderId }),
          ...(approverId && { approverId }),
          ...(status && { status }),
        },
        take: limit + 1,
        cursor: cursor ? { id: cursor } : undefined,
        orderBy: { createdAt: 'desc' },
        include: {
          workOrder: true,
          approver: true,
        },
      });
      
      let nextCursor: typeof cursor | undefined = undefined;
      if (approvals.length > limit) {
        const nextItem = approvals.pop();
        nextCursor = nextItem?.id;
      }
      
      return {
        items: approvals,
        nextCursor,
      };
    }),

  createWorkOrderApproval: idempotentProcedure
    .input(z.object({
      workOrderId: z.string(),
      approverId: z.string(),
      approvalLevel: z.number().positive(),
      maxApprovalAmount: z.number().positive(),
      status: z.enum(['PENDING', 'APPROVED', 'REJECTED']).default('PENDING'),
      comments: z.string().optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      return await (ctx.prisma as any).workOrderApproval.create({
        data: {
          ...input,
          tenantId: ctx.tenantId,
        },
      });
    }),

  updateWorkOrderApproval: idempotentProcedure
    .input(z.object({
      id: z.string(),
      status: z.enum(['PENDING', 'APPROVED', 'REJECTED']),
      comments: z.string().optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      const { id, ...updateData } = input;
      return await (ctx.prisma as any).workOrderApproval.update({
        where: { id, tenantId: ctx.tenantId },
        data: updateData,
      });
    }),

  // ========================================
  // PREDICTIVE MAINTENANCE MANAGEMENT
  // ========================================
  listPredictiveMaintenance: protectedProcedure
    .input(z.object({
      equipmentId: z.string().optional(),
      cursor: z.string().optional(),
      limit: z.number().min(1).max(100).default(50),
    }))
    .query(async ({ ctx, input }) => {
      const { equipmentId, cursor, limit } = input;
      
      const predictions = await (ctx.prisma as any).predictiveMaintenance.findMany({
        where: {
          tenantId: ctx.tenantId,
          ...(equipmentId && { equipmentId }),
        },
        take: limit + 1,
        cursor: cursor ? { id: cursor } : undefined,
        orderBy: { createdAt: 'desc' },
        include: {
          equipment: true,
        },
      });
      
      let nextCursor: typeof cursor | undefined = undefined;
      if (predictions.length > limit) {
        const nextItem = predictions.pop();
        nextCursor = nextItem?.id;
      }
      
      return {
        items: predictions,
        nextCursor,
      };
    }),

  createPredictiveMaintenance: idempotentProcedure
    .input(z.object({
      equipmentId: z.string(),
      modelName: z.string(),
      failureProbability: z.number().min(0).max(1),
      predictedFailureDate: z.string(),
      confidenceLevel: z.number().min(0).max(1),
      recommendedActions: z.string(),
      maintenanceWindow: z.string().optional(),
      costImpact: z.number().optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      return await (ctx.prisma as any).predictiveMaintenance.create({
        data: {
          ...input,
          tenantId: ctx.tenantId,
        },
      });
    }),

  // ========================================
  // MAINTENANCE EFFICIENCY MANAGEMENT
  // ========================================
  listMaintenanceEfficiency: protectedProcedure
    .input(z.object({
      equipmentId: z.string().optional(),
      period: z.enum(['DAILY', 'WEEKLY', 'MONTHLY', 'QUARTERLY', 'YEARLY']).optional(),
      cursor: z.string().optional(),
      limit: z.number().min(1).max(100).default(50),
    }))
    .query(async ({ ctx, input }) => {
      const { equipmentId, period, cursor, limit } = input;
      
      const efficiency = await (ctx.prisma as any).maintenanceEfficiency.findMany({
        where: {
          tenantId: ctx.tenantId,
          ...(equipmentId && { equipmentId }),
          ...(period && { period }),
        },
        take: limit + 1,
        cursor: cursor ? { id: cursor } : undefined,
        orderBy: { createdAt: 'desc' },
        include: {
          equipment: true,
        },
      });
      
      let nextCursor: typeof cursor | undefined = undefined;
      if (efficiency.length > limit) {
        const nextItem = efficiency.pop();
        nextCursor = nextItem?.id;
      }
      
      return {
        items: efficiency,
        nextCursor,
      };
    }),

  createMaintenanceEfficiency: idempotentProcedure
    .input(z.object({
      equipmentId: z.string(),
      period: z.enum(['DAILY', 'WEEKLY', 'MONTHLY', 'QUARTERLY', 'YEARLY']),
      mttr: z.number().positive(), // Mean Time To Repair
      mtbf: z.number().positive(), // Mean Time Between Failures
      availabilityRate: z.number().min(0).max(1),
      utilizationRate: z.number().min(0).max(1),
      oee: z.number().min(0).max(1), // Overall Equipment Effectiveness
      totalMaintenanceCost: z.number().positive(),
    }))
    .mutation(async ({ ctx, input }) => {
      return await (ctx.prisma as any).maintenanceEfficiency.create({
        data: {
          ...input,
          tenantId: ctx.tenantId,
        },
      });
    }),

  // ========================================
  // ROUTING INSTRUCTIONS MANAGEMENT
  // ========================================
  listRoutingInstructions: protectedProcedure
    .input(z.object({
      workOrderId: z.string().optional(),
      cursor: z.string().optional(),
      limit: z.number().min(1).max(100).default(50),
    }))
    .query(async ({ ctx, input }) => {
      const { workOrderId, cursor, limit } = input;
      
      const routing = await (ctx.prisma as any).routingInstructions.findMany({
        where: {
          tenantId: ctx.tenantId,
          ...(workOrderId && { workOrderId }),
        },
        take: limit + 1,
        cursor: cursor ? { id: cursor } : undefined,
        orderBy: { sequenceNumber: 'asc' },
        include: {
          workOrder: true,
        },
      });
      
      let nextCursor: typeof cursor | undefined = undefined;
      if (routing.length > limit) {
        const nextItem = routing.pop();
        nextCursor = nextItem?.id;
      }
      
      return {
        items: routing,
        nextCursor,
      };
    }),

  createRoutingInstructions: idempotentProcedure
    .input(z.object({
      workOrderId: z.string(),
      sequenceNumber: z.number().positive(),
      operationCode: z.string(),
      operationDescription: z.string(),
      workCenter: z.string(),
      estimatedHours: z.number().positive(),
      setupTime: z.number().default(0),
      runTime: z.number().positive(),
      requiredSkills: z.string().optional(),
      toolsRequired: z.string().optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      return await (ctx.prisma as any).routingInstructions.create({
        data: {
          ...input,
          tenantId: ctx.tenantId,
        },
      });
    }),

  // ========================================
  // PAYROLL TIME ENTRY MANAGEMENT (JDE F06116/F0618 equivalent)
  // ========================================
  listPayrollTimeEntry: protectedProcedure
    .input(z.object({
      employeeId: z.string().optional(),
      workOrderId: z.string().optional(),
      equipmentId: z.string().optional(),
      cursor: z.string().optional(),
      limit: z.number().min(1).max(100).default(50),
    }))
    .query(async ({ ctx, input }) => {
      const { employeeId, workOrderId, equipmentId, cursor, limit } = input;
      
      const timeEntries = await (ctx.prisma as any).payrollTimeEntry.findMany({
        where: {
          tenantId: ctx.tenantId,
          ...(employeeId && { employeeId }),
          ...(workOrderId && { workOrderId }),
          ...(equipmentId && { equipmentId }),
        },
        take: limit + 1,
        cursor: cursor ? { id: cursor } : undefined,
        orderBy: { createdAt: 'desc' },
        include: {
          employee: true,
          workOrder: true,
          equipment: true,
        },
      });
      
      let nextCursor: typeof cursor | undefined = undefined;
      if (timeEntries.length > limit) {
        const nextItem = timeEntries.pop();
        nextCursor = nextItem?.id;
      }
      
      return {
        items: timeEntries,
        nextCursor,
      };
    }),

  createPayrollTimeEntry: idempotentProcedure
    .input(z.object({
      employeeId: z.string(),
      workOrderId: z.string().optional(),
      equipmentId: z.string().optional(),
      date: z.string(),
      startTime: z.string(),
      endTime: z.string(),
      hoursWorked: z.number().positive(),
      hourlyRate: z.number().positive(),
      totalPay: z.number().positive(),
      activityType: z.enum(['MAINTENANCE', 'REPAIR', 'INSPECTION', 'SETUP', 'CLEANUP']),
      description: z.string().optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      return await (ctx.prisma as any).payrollTimeEntry.create({
        data: {
          ...input,
          tenantId: ctx.tenantId,
        },
      });
    }),

  // ========================================
  // MODEL WORK ORDER MANAGEMENT
  // ========================================
  listModelWorkOrders: protectedProcedure
    .input(z.object({
      cursor: z.string().optional(),
      limit: z.number().min(1).max(100).default(50),
    }))
    .query(async ({ ctx, input }) => {
      const { cursor, limit } = input;
      
      const modelWorkOrders = await (ctx.prisma as any).modelWorkOrder.findMany({
        where: {
          tenantId: ctx.tenantId,
        },
        take: limit + 1,
        cursor: cursor ? { id: cursor } : undefined,
        orderBy: { createdAt: 'desc' },
      });
      
      let nextCursor: typeof cursor | undefined = undefined;
      if (modelWorkOrders.length > limit) {
        const nextItem = modelWorkOrders.pop();
        nextCursor = nextItem?.id;
      }
      
      return {
        items: modelWorkOrders,
        nextCursor,
      };
    }),

  createModelWorkOrder: idempotentProcedure
    .input(z.object({
      modelNumber: z.string(),
      title: z.string(),
      description: z.string(),
      workOrderType: z.enum(['PREVENTIVE', 'CORRECTIVE', 'PREDICTIVE', 'EMERGENCY']),
      estimatedDuration: z.number().positive(),
      estimatedCost: z.number().positive(),
      frequency: z.string().optional(),
      instructions: z.string().optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      return await (ctx.prisma as any).modelWorkOrder.create({
        data: {
          ...input,
          tenantId: ctx.tenantId,
        },
      });
    }),

  // ========================================
  // WORK ORDER PROGRESS MANAGEMENT
  // ========================================
  listWorkOrderProgress: protectedProcedure
    .input(z.object({
      workOrderId: z.string().optional(),
      cursor: z.string().optional(),
      limit: z.number().min(1).max(100).default(50),
    }))
    .query(async ({ ctx, input }) => {
      const { workOrderId, cursor, limit } = input;
      
      const progress = await (ctx.prisma as any).workOrderProgress.findMany({
        where: {
          tenantId: ctx.tenantId,
          ...(workOrderId && { workOrderId }),
        },
        take: limit + 1,
        cursor: cursor ? { id: cursor } : undefined,
        orderBy: { createdAt: 'desc' },
        include: {
          workOrder: true,
        },
      });
      
      let nextCursor: typeof cursor | undefined = undefined;
      if (progress.length > limit) {
        const nextItem = progress.pop();
        nextCursor = nextItem?.id;
      }
      
      return {
        items: progress,
        nextCursor,
      };
    }),

  createWorkOrderProgress: idempotentProcedure
    .input(z.object({
      workOrderId: z.string(),
      percentComplete: z.number().min(0).max(100),
      status: z.enum(['NOT_STARTED', 'IN_PROGRESS', 'ON_HOLD', 'COMPLETED', 'CANCELLED']),
      notes: z.string().optional(),
      actualStartDate: z.string().optional(),
      actualEndDate: z.string().optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      return await (ctx.prisma as any).workOrderProgress.create({
        data: {
          ...input,
          tenantId: ctx.tenantId,
        },
      });
    }),

  updateWorkOrderProgress: idempotentProcedure
    .input(z.object({
      id: z.string(),
      percentComplete: z.number().min(0).max(100).optional(),
      status: z.enum(['NOT_STARTED', 'IN_PROGRESS', 'ON_HOLD', 'COMPLETED', 'CANCELLED']).optional(),
      notes: z.string().optional(),
      actualEndDate: z.string().optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      const { id, ...updateData } = input;
      return await (ctx.prisma as any).workOrderProgress.update({
        where: { id, tenantId: ctx.tenantId },
        data: updateData,
      });
    }),

  // ========================================
  // SERVICE INTERVALS CALCULATION (Enhanced)
  // ========================================
  calculateNextMaintenanceDate: protectedProcedure
    .input(z.object({
      scheduleId: z.string(),
      lastMaintenanceDate: z.string(),
    }))
    .mutation(async ({ ctx, input }) => {
      const schedule = await (ctx.prisma as any).maintenanceSchedule.findUnique({
        where: { id: input.scheduleId, tenantId: ctx.tenantId },
      });

      if (!schedule) {
        throw new TRPCError({ code: 'NOT_FOUND', message: 'Schedule not found' });
      }

      const lastDate = new Date(input.lastMaintenanceDate);
      const nextDate = new Date(lastDate);

      // Calculate next maintenance date based on frequency
      switch (schedule.frequencyType) {
        case 'HOURS':
          nextDate.setHours(nextDate.getHours() + Number(schedule.frequencyValue));
          break;
        case 'DAYS':
          nextDate.setDate(nextDate.getDate() + Number(schedule.frequencyValue));
          break;
        case 'WEEKS':
          nextDate.setDate(nextDate.getDate() + (Number(schedule.frequencyValue) * 7));
          break;
        case 'MONTHS':
          nextDate.setMonth(nextDate.getMonth() + Number(schedule.frequencyValue));
          break;
      }

      return {
        nextMaintenanceDate: nextDate.toISOString(),
        calculatedFrom: lastDate.toISOString(),
        frequencyType: schedule.frequencyType,
        frequencyValue: schedule.frequencyValue,
      };
    }),

  // ========================================
  // MAINTENANCE STATUS HISTORY MANAGEMENT (JDE F1307 equivalent)
  // ========================================
  listMaintenanceStatusHistory: protectedProcedure
    .input(z.object({
      equipmentId: z.string().optional(),
      dataItem: z.string().optional(),
      cursor: z.string().optional(),
      limit: z.number().min(1).max(100).default(50),
    }))
    .query(async ({ ctx, input }) => {
      const { equipmentId, dataItem, cursor, limit } = input;
      
      const statusHistory = await (ctx.prisma as any).maintenanceStatusHistory.findMany({
        where: {
          tenantId: ctx.tenantId,
          ...(equipmentId && { equipmentId }),
          ...(dataItem && { dataItem }),
        },
        take: limit + 1,
        cursor: cursor ? { id: cursor } : undefined,
        orderBy: { effectiveDate: 'desc' },
        include: {
          equipment: true,
        },
      });
      
      let nextCursor: typeof cursor | undefined = undefined;
      if (statusHistory.length > limit) {
        const nextItem = statusHistory.pop();
        nextCursor = nextItem?.id;
      }
      
      return {
        items: statusHistory,
        nextCursor,
      };
    }),

  createMaintenanceStatusHistory: idempotentProcedure
    .input(z.object({
      equipmentId: z.string(),
      dataItem: z.string(), // Status field being tracked
      historicalValue: z.string(),
      effectiveDate: z.string(),
      changeReason: z.string(),
      changedBy: z.string().optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      return await (ctx.prisma as any).maintenanceStatusHistory.create({
        data: {
          ...input,
          tenantId: ctx.tenantId,
        },
      });
    }),

  // ========================================
  // BUDGET IMPACT ANALYSIS & COST OPTIMIZATION
  // ========================================
  getBudgetImpactAnalysis: protectedProcedure
    .input(z.object({
      equipmentId: z.string().optional(),
      dateRange: z.object({
        from: z.string(),
        to: z.string(),
      }),
      budgetYear: z.number().optional(),
    }))
    .query(async ({ ctx, input }) => {
      const { equipmentId, dateRange, budgetYear } = input;
      
      // Get maintenance costs for the period
      const maintenanceCosts = await ctx.prisma.workOrder.findMany({
        where: {
          tenantId: ctx.tenantId,
          ...(equipmentId && { equipmentId }),
          scheduledDate: {
            gte: new Date(dateRange.from),
            lte: new Date(dateRange.to),
          },
        },
        include: {
          equipment: true,
        },
      });

      // Calculate budget vs actual
      const totalActualCost = maintenanceCosts.reduce((sum, wo) => sum + Number(wo.actualCost || 0), 0);
      const totalEstimatedCost = maintenanceCosts.reduce((sum, wo) => sum + Number(wo.estimatedCost || 0), 0);
      
      // Get efficiency metrics
      const efficiencyData = await (ctx.prisma as any).maintenanceEfficiency.findMany({
        where: {
          tenantId: ctx.tenantId,
          ...(equipmentId && { equipmentId }),
        },
        orderBy: { createdAt: 'desc' },
        take: 1,
      });

      const latestEfficiency = efficiencyData[0];

      // Calculate ROI metrics
      const costVariance = totalActualCost - totalEstimatedCost;
      const costVariancePercentage = totalEstimatedCost > 0 ? (costVariance / totalEstimatedCost) * 100 : 0;
      
      // Calculate potential savings from predictive maintenance
      const predictiveMaintenance = await (ctx.prisma as any).predictiveMaintenance.findMany({
        where: {
          tenantId: ctx.tenantId,
          ...(equipmentId && { equipmentId }),
        },
      });

      const potentialSavings = predictiveMaintenance.reduce((sum: number, pred: any) => {
        return sum + (Number(pred.costImpact || 0) * Number(pred.failureProbability || 0));
      }, 0);

      return {
        budgetAnalysis: {
          totalEstimatedCost,
          totalActualCost,
          costVariance,
          costVariancePercentage,
          budgetYear: budgetYear || new Date().getFullYear(),
        },
        efficiencyMetrics: latestEfficiency ? {
          mttr: Number(latestEfficiency.mttr),
          mtbf: Number(latestEfficiency.mtbf),
          availabilityRate: Number(latestEfficiency.availabilityRate),
          utilizationRate: Number(latestEfficiency.utilizationRate),
          oee: Number(latestEfficiency.oee),
        } : null,
        costOptimization: {
          potentialSavings,
          predictiveMaintenanceCount: predictiveMaintenance.length,
          highRiskEquipment: predictiveMaintenance.filter((p: any) => Number(p.failureProbability) > 0.7).length,
        },
        recommendations: [
          costVariancePercentage > 10 ? "Consider reviewing maintenance cost estimates" : null,
          potentialSavings > 10000 ? "Implement predictive maintenance to reduce costs" : null,
          latestEfficiency && Number(latestEfficiency.availabilityRate) < 0.8 ? "Focus on improving equipment availability" : null,
        ].filter(Boolean),
      };
    }),

  getCostOptimizationReport: protectedProcedure
    .input(z.object({
      equipmentId: z.string().optional(),
      period: z.enum(['MONTHLY', 'QUARTERLY', 'YEARLY']).default('MONTHLY'),
    }))
    .query(async ({ ctx, input }) => {
      const { equipmentId, period } = input;
      
      // Get maintenance efficiency data
      const efficiencyData = await (ctx.prisma as any).maintenanceEfficiency.findMany({
        where: {
          tenantId: ctx.tenantId,
          ...(equipmentId && { equipmentId }),
          period,
        },
        include: {
          equipment: true,
        },
        orderBy: { createdAt: 'desc' },
      });

      // Calculate optimization opportunities
      const optimizationOpportunities = efficiencyData.map((eff: any) => {
        const equipment = eff.equipment;
        const mttr = Number(eff.mttr);
        const mtbf = Number(eff.mtbf);
        const availability = Number(eff.availabilityRate);
        const utilization = Number(eff.utilizationRate);
        const oee = Number(eff.oee);
        const totalCost = Number(eff.totalMaintenanceCost);

        // Calculate potential improvements
        const potentialMTTRReduction = mttr > 4 ? mttr * 0.2 : 0; // 20% reduction if MTTR > 4 hours
        const potentialAvailabilityIncrease = availability < 0.9 ? 0.05 : 0; // 5% increase if availability < 90%
        const potentialUtilizationIncrease = utilization < 0.8 ? 0.1 : 0; // 10% increase if utilization < 80%

        // Calculate cost impact
        const costSavingsFromMTTR = potentialMTTRReduction * 100; // $100 per hour saved
        const revenueIncreaseFromAvailability = potentialAvailabilityIncrease * 10000; // $10k per 1% availability
        const revenueIncreaseFromUtilization = potentialUtilizationIncrease * 5000; // $5k per 1% utilization

        return {
          equipmentId: equipment.id,
          equipmentCode: equipment.code,
          equipmentType: equipment.type,
          currentMetrics: {
            mttr,
            mtbf,
            availability,
            utilization,
            oee,
            totalCost,
          },
          optimizationPotential: {
            mttrReduction: potentialMTTRReduction,
            availabilityIncrease: potentialAvailabilityIncrease,
            utilizationIncrease: potentialUtilizationIncrease,
          },
          financialImpact: {
            costSavings: costSavingsFromMTTR,
            revenueIncrease: revenueIncreaseFromAvailability + revenueIncreaseFromUtilization,
            totalBenefit: costSavingsFromMTTR + revenueIncreaseFromAvailability + revenueIncreaseFromUtilization,
            roi: totalCost > 0 ? ((costSavingsFromMTTR + revenueIncreaseFromAvailability + revenueIncreaseFromUtilization) / totalCost) * 100 : 0,
          },
          priority: oee < 0.7 ? 'HIGH' : oee < 0.8 ? 'MEDIUM' : 'LOW',
        };
      });

      // Sort by total benefit
      optimizationOpportunities.sort((a: any, b: any) => b.financialImpact.totalBenefit - a.financialImpact.totalBenefit);

      return {
        period,
        totalEquipment: efficiencyData.length,
        highPriorityEquipment: optimizationOpportunities.filter((o: any) => o.priority === 'HIGH').length,
        totalOptimizationPotential: {
          costSavings: optimizationOpportunities.reduce((sum: number, o: any) => sum + o.financialImpact.costSavings, 0),
          revenueIncrease: optimizationOpportunities.reduce((sum: number, o: any) => sum + o.financialImpact.revenueIncrease, 0),
          totalBenefit: optimizationOpportunities.reduce((sum: number, o: any) => sum + o.financialImpact.totalBenefit, 0),
        },
        topOpportunities: optimizationOpportunities.slice(0, 10),
        recommendations: [
          "Focus on equipment with OEE < 70% for maximum impact",
          "Implement predictive maintenance for high-cost equipment",
          "Optimize maintenance scheduling to improve availability",
          "Invest in training to reduce MTTR",
        ],
      };
    }),

  // ========================================
  // LIFECYCLE MANAGEMENT
  // ========================================

  listLifecycleEvents: protectedProcedure
    .input(z.object({
      cursor: z.string().optional(),
      limit: z.number().min(1).max(100).default(50),
      eventType: z.string().optional(),
      equipmentId: z.string().optional(),
      search: z.string().optional(),
    }))
    .query(async ({ ctx, input }) => {
      const { cursor, limit, eventType, equipmentId, search } = input;
      
      const events = await (ctx.prisma as any).lifecycleEvent.findMany({
        where: {
          tenantId: ctx.tenantId,
          ...(eventType && { eventType }),
          ...(equipmentId && { equipmentId }),
          ...(search && {
            OR: [
              { description: { contains: search, mode: 'insensitive' } },
              { location: { contains: search, mode: 'insensitive' } },
              { vendor: { contains: search, mode: 'insensitive' } },
            ],
          }),
        },
        take: limit + 1,
        cursor: cursor ? { id: cursor } : undefined,
        orderBy: { eventDate: 'desc' },
        include: {
          equipment: true,
        },
      });
      
      let nextCursor: typeof cursor | undefined = undefined;
      if (events.length > limit) {
        const nextItem = events.pop();
        nextCursor = nextItem!.id;
      }
      
      return {
        events,
        nextCursor,
      };
    }),

  createLifecycleEvent: idempotentProcedure
    .input(z.object({
      equipmentId: z.string().min(1),
      eventType: z.string().min(1),
      eventDate: z.string().datetime(),
      description: z.string().optional(),
      cost: z.number().min(0).default(0),
      location: z.string().optional(),
      vendor: z.string().optional(),
      notes: z.string().optional(),
      idempotencyKey: z.string().uuid(),
    }))
    .mutation(async ({ ctx, input }) => {
      const { ...data } = input;
      
      const event = await (ctx.prisma as any).lifecycleEvent.create({
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
          entity: 'LifecycleEvent',
          entityId: event.id,
          action: 'created',
          changes: data,
          hash: `audit-${event.id}-${Date.now()}`,
        },
      });
      
      return event;
    }),

  updateLifecycleEvent: idempotentProcedure
    .input(z.object({
      id: z.string(),
      equipmentId: z.string().min(1),
      eventType: z.string().min(1),
      eventDate: z.string().datetime(),
      description: z.string().optional(),
      cost: z.number().min(0).default(0),
      location: z.string().optional(),
      vendor: z.string().optional(),
      notes: z.string().optional(),
      idempotencyKey: z.string().uuid(),
    }))
    .mutation(async ({ ctx, input }) => {
      const { id, ...data } = input;
      
      const event = await (ctx.prisma as any).lifecycleEvent.update({
        where: {
          id,
          tenantId: ctx.tenantId,
        },
        data,
      });
      
      return event;
    }),

  deleteLifecycleEvent: idempotentProcedure
    .input(z.object({
      id: z.string(),
      idempotencyKey: z.string().uuid(),
    }))
    .mutation(async ({ ctx, input }) => {
      const { id } = input;
      
      await (ctx.prisma as any).lifecycleEvent.delete({
        where: {
          id,
          tenantId: ctx.tenantId,
        },
      });
      
      return { success: true };
    }),

  getLifecycleAnalytics: protectedProcedure
    .input(z.object({
      timeRange: z.number().default(365), // days
    }))
    .query(async ({ ctx, input }) => {
      const { timeRange } = input;
      const fromDate = new Date(Date.now() - timeRange * 24 * 60 * 60 * 1000);
      
      const events = await (ctx.prisma as any).lifecycleEvent.findMany({
        where: {
          tenantId: ctx.tenantId,
          eventDate: {
            gte: fromDate,
          },
        },
        include: {
          equipment: true,
        },
      });
      
      const totalAcquisitionCost = events
        .filter((e: any) => e.eventType === 'ACQUISITION')
        .reduce((sum: any, e: any) => sum + Number(e.cost || 0), 0);
      
      const totalMaintenanceCost = events
        .filter((e: any) => e.eventType === 'MAINTENANCE')
        .reduce((sum: any, e: any) => sum + Number(e.cost || 0), 0);
      
      const totalDisposalValue = events
        .filter((e: any) => e.eventType === 'DISPOSAL')
        .reduce((sum: any, e: any) => sum + Number(e.cost || 0), 0);
      
      const netLifecycleCost = totalAcquisitionCost + totalMaintenanceCost - totalDisposalValue;
      
      return {
        totalAcquisitionCost,
        totalMaintenanceCost,
        totalDisposalValue,
        netLifecycleCost,
        totalEvents: events.length,
        eventsByType: events.reduce((acc: any, event: any) => {
          acc[event.eventType] = (acc[event.eventType] || 0) + 1;
          return acc;
        }, {} as Record<string, number>),
      };
    }),

  // ========================================
  // EQUIPMENT SPECIFICATIONS MANAGEMENT
  // ========================================

  listEquipmentSpecs: protectedProcedure
    .input(z.object({
      equipmentId: z.string(),
    }))
    .query(async ({ ctx, input }) => {
      const specs = await (ctx.prisma as any).equipmentSpec.findMany({
        where: {
          tenantId: ctx.tenantId,
          equipmentId: input.equipmentId,
          isActive: true,
        },
        orderBy: { specType: 'asc' },
      });
      
      return specs;
    }),

  createEquipmentSpec: idempotentProcedure
    .input(z.object({
      equipmentId: z.string().min(1),
      specType: z.string().min(1),
      specName: z.string().min(1),
      specValue: z.string().min(1),
      specUnit: z.string().optional(),
      idempotencyKey: z.string().uuid(),
    }))
    .mutation(async ({ ctx, input }) => {
      const { ...data } = input;
      
      const spec = await (ctx.prisma as any).equipmentSpec.create({
        data: {
          ...data,
          tenantId: ctx.tenantId,
        },
      });
      
      return spec;
    }),

  updateEquipmentSpec: idempotentProcedure
    .input(z.object({
      id: z.string(),
      specType: z.string().min(1),
      specName: z.string().min(1),
      specValue: z.string().min(1),
      specUnit: z.string().optional(),
      idempotencyKey: z.string().uuid(),
    }))
    .mutation(async ({ ctx, input }) => {
      const { id, ...data } = input;
      
      const spec = await (ctx.prisma as any).equipmentSpec.update({
        where: {
          id,
          tenantId: ctx.tenantId,
        },
        data,
      });
      
      return spec;
    }),

  deleteEquipmentSpec: idempotentProcedure
    .input(z.object({
      id: z.string(),
      idempotencyKey: z.string().uuid(),
    }))
    .mutation(async ({ ctx, input }) => {
      const { id } = input;
      
      await (ctx.prisma as any).equipmentSpec.update({
        where: {
          id,
          tenantId: ctx.tenantId,
        },
        data: {
          isActive: false,
        },
      });
      
      return { success: true };
    }),

});
