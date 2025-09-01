/* eslint-disable @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-argument, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unnecessary-type-assertion */
import { z } from 'zod';
import { Decimal } from '@prisma/client/runtime/library';
import { router, protectedProcedure, idempotentProcedure } from '../config/trpc';
import { TRPCError } from '@trpc/server';
import { AuditService } from '../services/auditService';

// ========================================
// PURCHASE MANAGEMENT ROUTER (P1 - Inventory Module)
// ========================================

export const purchaseRouter = router({
  // ========================================
  // PURCHASE REQUEST MANAGEMENT
  // ========================================
  
  // List Purchase Requests
  listPurchaseRequests: protectedProcedure
    .input(z.object({
      cursor: z.string().optional(),
      limit: z.number().min(1).max(100).default(50),
      status: z.string().optional(),
      priority: z.string().optional(),
      search: z.string().optional(),
    }))
    .query(async ({ ctx, input }) => {
      const { cursor, limit, status, priority, search } = input;
      
      const purchaseRequests = await ctx.prisma.purchaseRequest.findMany({
        where: {
          tenantId: ctx.tenantId,
          ...(status && { status: status as any }),
          ...(priority && { priority: priority as any }),
          ...(search && {
            OR: [
              { prNumber: { contains: search, mode: 'insensitive' } },
              { title: { contains: search, mode: 'insensitive' } },
              { description: { contains: search, mode: 'insensitive' } },
            ],
          }),
        },
        take: limit + 1,
        cursor: cursor ? { id: cursor } : undefined,
        orderBy: { createdAt: 'desc' },
        include: {
          requester: {
            select: { id: true, firstName: true, lastName: true, email: true },
          },
          department: {
            select: { id: true, name: true, code: true },
          },
          approver: {
            select: { id: true, firstName: true, lastName: true, email: true },
          },
          items: {
            include: {
              item: {
                select: { id: true, number: true, description: true, type: true },
              },
            },
          },
        },
      });
      
      let nextCursor: typeof cursor | undefined = undefined;
      if (purchaseRequests.length > limit) {
        const nextPR = purchaseRequests.pop();
        nextCursor = nextPR!.id;
      }
      
      return {
        requests: purchaseRequests,
        nextCursor,
      };
    }),

  // Get Purchase Request by ID
  getPurchaseRequest: protectedProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      const purchaseRequest = await ctx.prisma.purchaseRequest.findFirst({
        where: {
          id: input.id,
          tenantId: ctx.tenantId,
        },
        include: {
          requester: {
            select: { id: true, firstName: true, lastName: true, email: true },
          },
          department: {
            select: { id: true, name: true, code: true },
          },
          approver: {
            select: { id: true, firstName: true, lastName: true, email: true },
          },
          items: {
            include: {
              item: {
                select: { id: true, number: true, description: true, type: true },
              },
            },
          },
          purchaseOrders: {
            select: { id: true, poNumber: true, status: true, totalAmount: true },
          },
        },
      });

      if (!purchaseRequest) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Purchase Request not found',
        });
      }

      return purchaseRequest;
    }),

  // Create Purchase Request
  createPurchaseRequest: idempotentProcedure
    .input(z.object({
      title: z.string().min(1),
      description: z.string().optional(),
      departmentId: z.string().optional(),
      priority: z.enum(['LOW', 'MEDIUM', 'HIGH', 'URGENT']).default('MEDIUM'),
      requiredDate: z.date().optional(),
      items: z.array(z.object({
        itemId: z.string(),
        quantity: z.number().min(1),
        unitPrice: z.number().min(0),
        description: z.string().optional(),
        specifications: z.string().optional(),
      })),
    }))
    .mutation(async ({ ctx, input }) => {
      const { title, description, departmentId, priority, requiredDate, items } = input;
      
      // Calculate total amount
      const totalAmount = items.reduce((sum, item) => sum + (item.quantity * item.unitPrice), 0);
      
      // Generate PR number
      const prCount = await ctx.prisma.purchaseRequest.count({
        where: { tenantId: ctx.tenantId },
      });
      const prNumber = `PR-${new Date().getFullYear()}-${String(prCount + 1).padStart(4, '0')}`;
      
      const purchaseRequest = await ctx.prisma.purchaseRequest.create({
        data: {
          tenantId: ctx.tenantId,
          prNumber,
          title,
          description,
          requestedBy: ctx.userId!,
          departmentId,
          priority,
          requiredDate,
          totalAmount,
          items: {
            create: items.map(item => ({
              tenantId: ctx.tenantId,
              itemId: item.itemId,
              quantity: item.quantity,
              unitPrice: item.unitPrice,
              totalPrice: item.quantity * item.unitPrice,
              description: item.description,
              specifications: item.specifications,
            })),
          },
        },
        include: {
          requester: {
            select: { id: true, firstName: true, lastName: true, email: true },
          },
          department: {
            select: { id: true, name: true, code: true },
          },
          items: {
            include: {
              item: {
                select: { id: true, number: true, description: true, type: true },
              },
            },
          },
        },
      });

      // Audit log
      await AuditService.auditSystemOperation(
        ctx.tenantId,
        ctx.userId!,
        'CREATE',
        'purchaseRequest',
        purchaseRequest.id,
        undefined,
        purchaseRequest,
        { prNumber, totalAmount, itemCount: items.length }
      );

      return purchaseRequest;
    }),

  // Update Purchase Request
  updatePurchaseRequest: idempotentProcedure
    .input(z.object({
      id: z.string(),
      title: z.string().min(1).optional(),
      description: z.string().optional(),
      departmentId: z.string().optional(),
      priority: z.enum(['LOW', 'MEDIUM', 'HIGH', 'URGENT']).optional(),
      requiredDate: z.date().optional(),
      items: z.array(z.object({
        itemId: z.string(),
        quantity: z.number().min(1),
        unitPrice: z.number().min(0),
        description: z.string().optional(),
        specifications: z.string().optional(),
      })).optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      const { id, ...updateData } = input;
      
      // Get current PR for audit
      const currentPR = await ctx.prisma.purchaseRequest.findFirst({
        where: { id, tenantId: ctx.tenantId },
        include: { items: true },
      });

      if (!currentPR) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Purchase Request not found',
        });
      }

      if (currentPR.status !== 'DRAFT') {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: 'Cannot update Purchase Request that is not in DRAFT status',
        });
      }

      // Calculate total amount if items are updated
      let totalAmount = currentPR.totalAmount;
      if (updateData.items) {
        totalAmount = new Decimal(updateData.items.reduce((sum, item) => sum + (item.quantity * item.unitPrice), 0));
      }

      const purchaseRequest = await ctx.prisma.purchaseRequest.update({
        where: { id },
        data: {
          title: updateData.title,
          description: updateData.description,
          priority: updateData.priority as any,
          requiredDate: updateData.requiredDate,
          totalAmount,
        },
        include: {
          requester: {
            select: { id: true, firstName: true, lastName: true, email: true },
          },
          department: {
            select: { id: true, name: true, code: true },
          },
          items: {
            include: {
              item: {
                select: { id: true, number: true, description: true, type: true },
              },
            },
          },
        },
      });

      // Audit log
      await AuditService.auditSystemOperation(
        ctx.tenantId,
        ctx.userId!,
        'UPDATE',
        'purchaseRequest',
        purchaseRequest.id,
        currentPR,
        purchaseRequest,
        { prNumber: purchaseRequest.prNumber }
      );

      return purchaseRequest;
    }),

  // Submit Purchase Request
  submitPurchaseRequest: idempotentProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const purchaseRequest = await ctx.prisma.purchaseRequest.findFirst({
        where: { id: input.id, tenantId: ctx.tenantId },
      });

      if (!purchaseRequest) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Purchase Request not found',
        });
      }

      if (purchaseRequest.status !== 'DRAFT') {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: 'Purchase Request is not in DRAFT status',
        });
      }

      const updatedPR = await ctx.prisma.purchaseRequest.update({
        where: { id: input.id },
        data: { status: 'SUBMITTED' },
        include: {
          requester: {
            select: { id: true, firstName: true, lastName: true, email: true },
          },
          department: {
            select: { id: true, name: true, code: true },
          },
        },
      });

      // Audit log
      await AuditService.auditSystemOperation(
        ctx.tenantId,
        ctx.userId!,
        'SUBMIT',
        'purchaseRequest',
        updatedPR.id,
        purchaseRequest,
        updatedPR,
        { prNumber: updatedPR.prNumber }
      );

      return updatedPR;
    }),

  // Approve Purchase Request
  approvePurchaseRequest: idempotentProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const purchaseRequest = await ctx.prisma.purchaseRequest.findFirst({
        where: { id: input.id, tenantId: ctx.tenantId },
      });

      if (!purchaseRequest) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Purchase Request not found',
        });
      }

      if (purchaseRequest.status !== 'SUBMITTED') {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: 'Purchase Request is not in SUBMITTED status',
        });
      }

      const updatedPR = await ctx.prisma.purchaseRequest.update({
        where: { id: input.id },
        data: { 
          status: 'APPROVED',
          approvedBy: ctx.userId!,
          approvedDate: new Date(),
        },
        include: {
          requester: {
            select: { id: true, firstName: true, lastName: true, email: true },
          },
          department: {
            select: { id: true, name: true, code: true },
          },
          approver: {
            select: { id: true, firstName: true, lastName: true, email: true },
          },
        },
      });

      // Audit log
      await AuditService.auditSystemOperation(
        ctx.tenantId,
        ctx.userId!,
        'APPROVE',
        'purchaseRequest',
        updatedPR.id,
        purchaseRequest,
        updatedPR,
        { prNumber: updatedPR.prNumber }
      );

      return updatedPR;
    }),

  // ========================================
  // PURCHASE ORDER MANAGEMENT
  // ========================================
  
  // List Purchase Orders
  listPurchaseOrders: protectedProcedure
    .input(z.object({
      cursor: z.string().optional(),
      limit: z.number().min(1).max(100).default(50),
      status: z.string().optional(),
      search: z.string().optional(),
    }))
    .query(async ({ ctx, input }) => {
      const { cursor, limit, status, search } = input;
      
      const purchaseOrders = await ctx.prisma.purchaseOrder.findMany({
        where: {
          tenantId: ctx.tenantId,
          ...(status && { status: status as any }),
          ...(search && {
            OR: [
              { poNumber: { contains: search, mode: 'insensitive' } },
              { supplierName: { contains: search, mode: 'insensitive' } },
            ],
          }),
        },
        take: limit + 1,
        cursor: cursor ? { id: cursor } : undefined,
        orderBy: { createdAt: 'desc' },
        include: {
          purchaseRequest: {
            select: { id: true, prNumber: true, title: true },
          },
          creator: {
            select: { id: true, firstName: true, lastName: true, email: true },
          },
          items: {
            include: {
              item: {
                select: { id: true, number: true, description: true, type: true },
              },
            },
          },
        },
      });
      
      let nextCursor: typeof cursor | undefined = undefined;
      if (purchaseOrders.length > limit) {
        const nextPO = purchaseOrders.pop();
        nextCursor = nextPO!.id;
      }
      
      return {
        orders: purchaseOrders,
        nextCursor,
      };
    }),

  // Get Purchase Order by ID
  getPurchaseOrder: protectedProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      const purchaseOrder = await ctx.prisma.purchaseOrder.findFirst({
        where: {
          id: input.id,
          tenantId: ctx.tenantId,
        },
        include: {
          purchaseRequest: {
            select: { id: true, prNumber: true, title: true },
          },
          creator: {
            select: { id: true, firstName: true, lastName: true, email: true },
          },
          updater: {
            select: { id: true, firstName: true, lastName: true, email: true },
          },
          items: {
            include: {
              item: {
                select: { id: true, number: true, description: true, type: true },
              },
            },
          },
        },
      });

      if (!purchaseOrder) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Purchase Order not found',
        });
      }

      return purchaseOrder;
    }),

  // Create Purchase Order from Purchase Request
  createPurchaseOrderFromPR: idempotentProcedure
    .input(z.object({
      prId: z.string(),
      supplierName: z.string().min(1),
      supplierAddress: z.string().optional(),
      expectedDate: z.date().optional(),
      notes: z.string().optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      const { prId, supplierName, supplierAddress, expectedDate, notes } = input;
      
      // Get Purchase Request
      const purchaseRequest = await ctx.prisma.purchaseRequest.findFirst({
        where: { id: prId, tenantId: ctx.tenantId },
        include: { items: true },
      });

      if (!purchaseRequest) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Purchase Request not found',
        });
      }

      if (purchaseRequest.status !== 'APPROVED') {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: 'Purchase Request must be APPROVED to create Purchase Order',
        });
      }

      // Generate PO number
      const poCount = await ctx.prisma.purchaseOrder.count({
        where: { tenantId: ctx.tenantId },
      });
      const poNumber = `PO-${new Date().getFullYear()}-${String(poCount + 1).padStart(4, '0')}`;
      
      // Calculate totals
      const subtotal = (purchaseRequest as any).items.reduce((sum: number, item: any) => sum + parseFloat(item.totalPrice), 0);
      const taxAmount = subtotal * 0.1; // 10% tax (configurable)
      const totalAmount = subtotal + taxAmount;

      const purchaseOrder = await ctx.prisma.purchaseOrder.create({
        data: {
          tenantId: ctx.tenantId,
          poNumber,
          prId,
          supplierName,
          supplierAddress,
          expectedDate,
          subtotal,
          taxAmount,
          totalAmount,
          notes,
          createdBy: ctx.userId!,
          items: {
            create: purchaseRequest.items.map(item => ({
              tenantId: ctx.tenantId,
              itemId: item.itemId,
              quantity: item.quantity,
              unitPrice: item.unitPrice,
              totalPrice: item.totalPrice,
            })),
          },
        },
        include: {
          purchaseRequest: {
            select: { id: true, prNumber: true, title: true },
          },
          creator: {
            select: { id: true, firstName: true, lastName: true, email: true },
          },
          items: {
            include: {
              item: {
                select: { id: true, number: true, description: true, type: true },
              },
            },
          },
        },
      });

      // Update PR status to CONVERTED_TO_PO
      await ctx.prisma.purchaseRequest.update({
        where: { id: prId },
        data: { status: 'CONVERTED_TO_PO' },
      });

      // Audit log
      await AuditService.auditSystemOperation(
        ctx.tenantId,
        ctx.userId!,
        'CREATE',
        'purchaseOrder',
        purchaseOrder.id,
        undefined,
        purchaseOrder,
        { poNumber, prNumber: purchaseRequest.prNumber, totalAmount }
      );

      return purchaseOrder;
    }),

  // Update Purchase Order
  updatePurchaseOrder: idempotentProcedure
    .input(z.object({
      id: z.string(),
      supplierName: z.string().min(1).optional(),
      supplierAddress: z.string().optional(),
      expectedDate: z.date().optional(),
      notes: z.string().optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      const { id, ...updateData } = input;
      
      // Get current PO for audit
      const currentPO = await ctx.prisma.purchaseOrder.findFirst({
        where: { id, tenantId: ctx.tenantId },
      });

      if (!currentPO) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Purchase Order not found',
        });
      }

      if (currentPO.status !== 'DRAFT') {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: 'Cannot update Purchase Order that is not in DRAFT status',
        });
      }

      const purchaseOrder = await ctx.prisma.purchaseOrder.update({
        where: { id },
        data: {
          ...updateData,
          updatedBy: ctx.userId!,
        },
        include: {
          purchaseRequest: {
            select: { id: true, prNumber: true, title: true },
          },
          creator: {
            select: { id: true, firstName: true, lastName: true, email: true },
          },
          updater: {
            select: { id: true, firstName: true, lastName: true, email: true },
          },
          items: {
            include: {
              item: {
                select: { id: true, number: true, description: true, type: true },
              },
            },
          },
        },
      });

      // Audit log
      await AuditService.auditSystemOperation(
        ctx.tenantId,
        ctx.userId!,
        'UPDATE',
        'purchaseOrder',
        purchaseOrder.id,
        currentPO,
        purchaseOrder,
        { poNumber: purchaseOrder.poNumber }
      );

      return purchaseOrder;
    }),

  // Send Purchase Order
  sendPurchaseOrder: idempotentProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const purchaseOrder = await ctx.prisma.purchaseOrder.findFirst({
        where: { id: input.id, tenantId: ctx.tenantId },
      });

      if (!purchaseOrder) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Purchase Order not found',
        });
      }

      if (purchaseOrder.status !== 'DRAFT') {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: 'Purchase Order is not in DRAFT status',
        });
      }

      const updatedPO = await ctx.prisma.purchaseOrder.update({
        where: { id: input.id },
        data: { status: 'SENT' },
        include: {
          purchaseRequest: {
            select: { id: true, prNumber: true, title: true },
          },
          creator: {
            select: { id: true, firstName: true, lastName: true, email: true },
          },
        },
      });

      // Audit log
      await AuditService.auditSystemOperation(
        ctx.tenantId,
        ctx.userId!,
        'SEND',
        'purchaseOrder',
        updatedPO.id,
        purchaseOrder,
        updatedPO,
        { poNumber: updatedPO.poNumber }
      );

      return updatedPO;
    }),
});
