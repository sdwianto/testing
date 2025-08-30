/* eslint-disable @typescript-eslint/prefer-nullish-coalescing, @typescript-eslint/no-unsafe-assignment */
import { z } from 'zod';
import { router, protectedProcedure, idempotentProcedure } from '../config/trpc';
import { TRPCError } from '@trpc/server';

// ========================================
// INVENTORY ROUTER (P1 - Item Master & Transactions)
// ========================================

export const inventoryRouter = router({
  // Item Management
  listItems: protectedProcedure
    .input(z.object({
      cursor: z.string().optional(),
      limit: z.number().min(1).max(100).default(50),
      type: z.string().optional(),
      search: z.string().optional(),
    }))
    .query(async ({ ctx, input }) => {
      const { cursor, limit, type, search } = input;
      
      const items = await ctx.prisma.item.findMany({
        where: {
          tenantId: ctx.tenantId,
          isActive: true,
          ...(type && { type }),
          ...(search && {
            OR: [
              { number: { contains: search, mode: 'insensitive' } },
              { description: { contains: search, mode: 'insensitive' } },
            ],
          }),
        },
        take: limit + 1,
        cursor: cursor ? { id: cursor } : undefined,
        orderBy: { createdAt: 'desc' },
        include: {
          branches: {
            include: {
              locations: true,
            },
          },
        },
      });
      
      let nextCursor: typeof cursor | undefined = undefined;
      if (items.length > limit) {
        const nextItem = items.pop();
        nextCursor = nextItem!.id;
      }
      
      return {
        items,
        nextCursor,
      };
    }),

  getItem: protectedProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      const item = await ctx.prisma.item.findFirst({
        where: {
          id: input.id,
          tenantId: ctx.tenantId,
        },
        include: {
          branches: {
            include: {
              locations: true,
            },
          },
          inventoryTxs: {
            orderBy: { createdAt: 'desc' },
            take: 20,
          },
        },
      });
      
      if (!item) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Item not found',
        });
      }
      
      return item;
    }),

  createItem: idempotentProcedure
    .input(z.object({
      number: z.string().min(1),
      description: z.string().min(1),
      type: z.string().min(1),
      stdCost: z.number().min(0).default(0),
      lastCost: z.number().min(0).default(0),
      avgCost: z.number().min(0).default(0),
      idempotencyKey: z.string().uuid(),
    }))
    .mutation(async ({ ctx, input }) => {
      const { idempotencyKey, ...data } = input;
      
      // Check if item number already exists
      const existing = await ctx.prisma.item.findFirst({
        where: {
          number: data.number,
          tenantId: ctx.tenantId,
        },
      });
      
      if (existing) {
        throw new TRPCError({
          code: 'CONFLICT',
          message: 'Item number already exists',
        });
      }
      
      const item = await ctx.prisma.item.create({
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
          entity: 'Item',
          entityId: item.id,
          action: 'created',
          changes: data,
          hash: `audit-${item.id}-${Date.now()}`,
        },
      });
      
      // Create outbox event
      await ctx.prisma.outboxEvent.create({
        data: {
          tenantId: ctx.tenantId,
          type: 'inv.item.created',
          entity: 'Item',
          entityId: item.id,
          version: item.version,
          payload: {
            number: item.number,
            description: item.description,
            type: item.type,
          },
          delivered: false,
        },
      });
      
      return item;
    }),

  // Item Branch Management
  createItemBranch: idempotentProcedure
    .input(z.object({
      itemId: z.string(),
      siteId: z.string().min(1),
      reorderPoint: z.number().min(0).default(0),
      reorderQty: z.number().min(0).default(0),
      safetyStock: z.number().min(0).default(0),
      leadTimeDays: z.number().min(0).default(0),
      lotSize: z.number().min(1).default(1),
      idempotencyKey: z.string().uuid(),
    }))
    .mutation(async ({ ctx, input }) => {
      const { idempotencyKey, ...data } = input;
      
      // Check if item branch already exists
      const existing = await ctx.prisma.itemBranch.findFirst({
        where: {
          itemId: data.itemId,
          siteId: data.siteId,
          tenantId: ctx.tenantId,
        },
      });
      
      if (existing) {
        throw new TRPCError({
          code: 'CONFLICT',
          message: 'Item branch already exists for this site',
        });
      }
      
      const itemBranch = await ctx.prisma.itemBranch.create({
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
          entity: 'ItemBranch',
          entityId: itemBranch.id,
          action: 'created',
          changes: data,
          hash: `audit-${itemBranch.id}-${Date.now()}`,
        },
      });
      
      return itemBranch;
    }),

  // Inventory Transactions (GRN/GI/ADJ/MOVE)
  createInventoryTx: idempotentProcedure
    .input(z.object({
      itemId: z.string(),
      siteId: z.string().min(1),
      location: z.string().min(1),
      txType: z.enum(['GRN', 'GI', 'ADJ', 'MOVE']),
      qty: z.number().int(),
      unitCost: z.number().min(0).default(0),
      refType: z.string().optional(),
      refId: z.string().optional(),
      notes: z.string().optional(),
      idempotencyKey: z.string().uuid(),
    }))
    .mutation(async ({ ctx, input }) => {
      const { idempotencyKey, ...data } = input;
      
      // Validate item exists
      const item = await ctx.prisma.item.findFirst({
        where: {
          id: data.itemId,
          tenantId: ctx.tenantId,
        },
      });
      
      if (!item) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Item not found',
        });
      }
      
      // For GI (Goods Issue), check if sufficient stock
      if (data.txType === 'GI' && data.qty > 0) {
        const itemBranch = await ctx.prisma.itemBranch.findFirst({
          where: {
            itemId: data.itemId,
            siteId: data.siteId,
            tenantId: ctx.tenantId,
          },
          include: {
            locations: true,
          },
        });
        
        if (itemBranch) {
          const totalOnHand = itemBranch.locations.reduce((sum, loc) => sum + loc.qtyOnHand, 0);
          if (totalOnHand < data.qty) {
            throw new TRPCError({
              code: 'BAD_REQUEST',
              message: 'Insufficient stock for goods issue',
              cause: {
                requested: data.qty,
                available: totalOnHand,
              },
            });
          }
        }
      }
      
      const inventoryTx = await ctx.prisma.inventoryTx.create({
        data: {
          ...data,
          tenantId: ctx.tenantId,
          userId: ctx.userId,
        },
      });
      
      // Update item costs if this is a GRN
      if (data.txType === 'GRN' && data.qty > 0) {
        const newAvgCost = ((Number(item.avgCost) * 0) + (data.unitCost * data.qty)) / data.qty;
        
        await ctx.prisma.item.update({
          where: { id: item.id },
          data: {
            lastCost: data.unitCost,
            avgCost: newAvgCost,
            version: { increment: 1 },
          },
        });
      }
      
      // Create audit event
      await ctx.prisma.auditEvent.create({
        data: {
          tenantId: ctx.tenantId,
          actorId: ctx.userId,
          entity: 'InventoryTx',
          entityId: inventoryTx.id,
          action: 'created',
          changes: data,
          hash: `audit-${inventoryTx.id}-${Date.now()}`,
        },
      });
      
      // Create outbox event
      await ctx.prisma.outboxEvent.create({
        data: {
          tenantId: ctx.tenantId,
          type: 'inv.transaction.created',
          entity: 'InventoryTx',
          entityId: inventoryTx.id,
          version: 1,
          payload: {
            itemId: inventoryTx.itemId,
            txType: inventoryTx.txType,
            qty: inventoryTx.qty,
            unitCost: inventoryTx.unitCost,
            siteId: inventoryTx.siteId,
          },
          delivered: false,
        },
      });
      
      return inventoryTx;
    }),

  // Stock Levels and Reorder Alerts
  getStockLevels: protectedProcedure
    .input(z.object({
      siteId: z.string().optional(),
      lowStock: z.boolean().optional(),
    }))
    .query(async ({ ctx, input }) => {
      const { siteId, lowStock } = input;
      
      const itemBranches = await ctx.prisma.itemBranch.findMany({
        where: {
          tenantId: ctx.tenantId,
          ...(siteId && { siteId }),
        },
        include: {
          item: true,
          locations: true,
        },
      });
      
      const stockLevels = itemBranches.map(branch => {
        const totalOnHand = branch.locations.reduce((sum, loc) => sum + loc.qtyOnHand, 0);
        const totalCommitted = branch.locations.reduce((sum, loc) => sum + loc.qtyCommitted, 0);
        const totalOnOrder = branch.locations.reduce((sum, loc) => sum + loc.qtyOnOrder, 0);
        const available = totalOnHand - totalCommitted;
        const isLowStock = available <= branch.reorderPoint;
        
        return {
          itemId: branch.itemId,
          itemNumber: branch.item.number,
          itemDescription: branch.item.description,
          siteId: branch.siteId,
          qtyOnHand: totalOnHand,
          qtyCommitted: totalCommitted,
          qtyOnOrder: totalOnOrder,
          available,
          reorderPoint: branch.reorderPoint,
          reorderQty: branch.reorderQty,
          safetyStock: branch.safetyStock,
          isLowStock,
          leadTimeDays: branch.leadTimeDays,
        };
      });
      
      if (lowStock) {
        return stockLevels.filter(level => level.isLowStock);
      }
      
      return stockLevels;
    }),

  // Inventory Analytics
  getInventoryAnalytics: protectedProcedure
    .input(z.object({
      startDate: z.string().datetime(),
      endDate: z.string().datetime(),
      siteId: z.string().optional(),
    }))
    .query(async ({ ctx, input }) => {
      const { startDate, endDate, siteId } = input;
      
      // Get transaction summary
      const transactions = await ctx.prisma.inventoryTx.findMany({
        where: {
          tenantId: ctx.tenantId,
          ...(siteId && { siteId }),
          createdAt: {
            gte: new Date(startDate),
            lte: new Date(endDate),
          },
        },
      });
      
      const summary = transactions.reduce((acc, tx) => {
        if (!acc[tx.txType]) {
          acc[tx.txType] = { count: 0, totalQty: 0, totalValue: 0 };
        }
        acc[tx.txType]!.count += 1;
        acc[tx.txType]!.totalQty += tx.qty;
        acc[tx.txType]!.totalValue += tx.qty * Number(tx.unitCost);
        return acc;
      }, {} as Record<string, { count: number; totalQty: number; totalValue: number }>);
      
      // Get top items by transaction volume
      const itemStats = transactions.reduce((acc, tx) => {
        if (!acc[tx.itemId]) {
          acc[tx.itemId] = { qty: 0, value: 0 };
        }
        acc[tx.itemId]!.qty += Math.abs(tx.qty);
        acc[tx.itemId]!.value += Math.abs(tx.qty * Number(tx.unitCost));
        return acc;
      }, {} as Record<string, { qty: number; value: number }>);
      
      const topItems = Object.entries(itemStats)
        .sort(([, a], [, b]) => b.value - a.value)
        .slice(0, 10)
        .map(([itemId, stats]) => ({
          itemId,
          ...stats,
        }));
      
      return {
        summary,
        topItems,
        totalTransactions: transactions.length,
        period: { startDate, endDate },
      };
    }),

  // List Locations
  listLocations: protectedProcedure
    .input(z.object({
      cursor: z.string().optional(),
      limit: z.number().min(1).max(100).default(50),
      search: z.string().optional(),
    }))
    .query(async ({ ctx, input }) => {
      const { cursor, limit, search } = input;
      
      const locations = await ctx.prisma.itemLocation.findMany({
        where: {
          tenantId: ctx.tenantId,
          ...(search && {
            OR: [
              { bin: { contains: search, mode: 'insensitive' } },
              { lotNumber: { contains: search, mode: 'insensitive' } },
            ],
          }),
        },
        take: limit + 1,
        cursor: cursor ? { id: cursor } : undefined,
        orderBy: { createdAt: 'desc' },
        include: {
          itemBranch: {
            include: {
              item: {
                select: { id: true, number: true, description: true },
              },
            },
          },
        },
      });
      
      let nextCursor: typeof cursor | undefined = undefined;
      if (locations.length > limit) {
        const nextLocation = locations.pop();
        nextCursor = nextLocation!.id;
      }
      
      return {
        locations,
        nextCursor,
      };
    }),
});
