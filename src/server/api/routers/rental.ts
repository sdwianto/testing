/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/no-unsafe-return */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/prefer-nullish-coalescing */

import { z } from 'zod';
import { router, protectedProcedure, idempotentProcedure } from '../config/trpc';
import { TRPCError } from '@trpc/server';

// ========================================
// RENTAL MANAGEMENT ROUTER (JDE F4201-style)
// ========================================

export const rentalRouter = router({
  // Equipment Rental Management
  listRentals: protectedProcedure
    .input(z.object({
      cursor: z.string().optional(),
      limit: z.number().min(1).max(1000).default(50),
      status: z.enum(['ACTIVE', 'COMPLETED', 'CANCELLED', 'SUSPENDED', 'OVERDUE']).optional(),
      customerId: z.string().optional(),
      equipmentId: z.string().optional(),
      search: z.string().optional(), // FP6: server-side search
    }))
    .query(async ({ ctx, input }) => {
      const { cursor, limit, status, customerId, equipmentId, search } = input;
      
      // R2: tenant-scoped query with proper indexing
      const rentals = await ctx.prisma.equipmentRental.findMany({
        where: {
          tenantId: ctx.tenantId, // R2: left-most index starts with tenant_id
          ...(status && { status }),
          ...(customerId && { customerId }),
          ...(equipmentId && { equipmentId }),
          // FP6: server-side search (avoid client-side filtering)
          ...(search && {
            OR: [
              { rentalNumber: { contains: search, mode: 'insensitive' } },
              { contractTerms: { contains: search, mode: 'insensitive' } },
            ],
          }),
        },
        take: limit + 1,
        cursor: cursor ? { id: cursor } : undefined,
        orderBy: { createdAt: 'desc' }, // R1: tie-break by id (createdAt for now)
        include: {
          equipment: {
            select: {
              id: true,
              code: true,
              type: true,
              description: true,
            },
          },
          customer: {
            select: {
              id: true,
              customerNumber: true,
              name: true,
              companyName: true,
            },
          },
          rentalBills: {
            select: {
              id: true,
              billNumber: true,
              status: true,
              totalAmount: true,
              balanceDue: true,
            },
          },
        },
      });
      
      let nextCursor: typeof cursor | undefined = undefined;
      if (rentals.length > limit) {
        const nextItem = rentals.pop();
        nextCursor = nextItem!.id;
      }
      
      return {
        rentals,
        nextCursor,
      };
    }),

  getRental: protectedProcedure
    .input(z.object({
      id: z.string(),
    }))
    .query(async ({ ctx, input }) => {
      const rental = await ctx.prisma.equipmentRental.findFirst({
        where: {
          id: input.id,
          tenantId: ctx.tenantId, // R2: tenant-scoped
        },
        include: {
          equipment: true,
          customer: true,
          rentalBills: {
            orderBy: { billDate: 'desc' },
          },
          rentalUsage: {
            orderBy: { usageDate: 'desc' },
            take: 50, // Recent usage only
          },
        },
      });

      if (!rental) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Rental not found',
        });
      }

      return rental;
    }),

  createRental: idempotentProcedure
    .input(z.object({
      equipmentId: z.string(),
      customerId: z.string(),
      startDate: z.string().datetime(),
      endDate: z.string().datetime().optional(),
      hourlyRate: z.number().min(0).default(0),
      dailyRate: z.number().min(0).default(0),
      weeklyRate: z.number().min(0).default(0),
      monthlyRate: z.number().min(0).default(0),
      pickupLocation: z.string().optional(),
      returnLocation: z.string().optional(),
      contractTerms: z.string().optional(),
      insuranceRequired: z.boolean().default(false),
      insuranceAmount: z.number().min(0).default(0),
      idempotencyKey: z.string().uuid(),
    }))
    .mutation(async ({ ctx, input }) => {
      const {
        equipmentId,
        customerId,
        startDate,
        endDate,
        hourlyRate,
        dailyRate,
        weeklyRate,
        monthlyRate,
        pickupLocation,
        returnLocation,
        contractTerms,
        insuranceRequired,
        insuranceAmount,
        idempotencyKey,
      } = input;

      // Check if equipment is available
      const existingRental = await ctx.prisma.equipmentRental.findFirst({
        where: {
          equipmentId,
          tenantId: ctx.tenantId,
          status: 'ACTIVE',
          OR: [
            {
              AND: [
                { startDate: { lte: new Date(startDate) } },
                { endDate: { gte: new Date(startDate) } },
              ],
            },
            {
              AND: [
                { startDate: { lte: endDate ? new Date(endDate) : new Date() } },
                { endDate: { gte: endDate ? new Date(endDate) : new Date() } },
              ],
            },
          ],
        },
      });

      if (existingRental) {
        throw new TRPCError({
          code: 'CONFLICT',
          message: 'Equipment is already rented during this period',
        });
      }

      // Generate rental number
      const rentalCount = await ctx.prisma.equipmentRental.count({
        where: { tenantId: ctx.tenantId },
      });
      const rentalNumber = `RENT-${String(rentalCount + 1).padStart(6, '0')}`;

      const rental = await ctx.prisma.equipmentRental.create({
        data: {
          tenantId: ctx.tenantId,
          rentalNumber,
          equipmentId,
          customerId,
          startDate: new Date(startDate),
          endDate: endDate ? new Date(endDate) : null,
          hourlyRate,
          dailyRate,
          weeklyRate,
          monthlyRate,
          pickupLocation,
          returnLocation,
          contractTerms,
          insuranceRequired,
          insuranceAmount,
          status: 'ACTIVE',
          billingStatus: 'PENDING',
          createdBy: ctx.userId,
        },
        include: {
          equipment: {
            select: {
              id: true,
              code: true,
              type: true,
              description: true,
            },
          },
          customer: {
            select: {
              id: true,
              customerNumber: true,
              name: true,
              companyName: true,
            },
          },
        },
      });

      return rental;
    }),

  updateRental: idempotentProcedure
    .input(z.object({
      id: z.string(),
      endDate: z.string().datetime().optional(),
      hourlyRate: z.number().min(0).optional(),
      dailyRate: z.number().min(0).optional(),
      weeklyRate: z.number().min(0).optional(),
      monthlyRate: z.number().min(0).optional(),
      pickupLocation: z.string().optional(),
      returnLocation: z.string().optional(),
      currentLocation: z.string().optional(),
      contractTerms: z.string().optional(),
      insuranceRequired: z.boolean().optional(),
      insuranceAmount: z.number().min(0).optional(),
      status: z.enum(['ACTIVE', 'COMPLETED', 'CANCELLED', 'SUSPENDED', 'OVERDUE']).optional(),
      idempotencyKey: z.string().uuid(),
      baseVersion: z.number().int().optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      const {
        id,
        endDate,
        hourlyRate,
        dailyRate,
        weeklyRate,
        monthlyRate,
        pickupLocation,
        returnLocation,
        currentLocation,
        contractTerms,
        insuranceRequired,
        insuranceAmount,
        status,
        idempotencyKey,
        baseVersion,
      } = input;

      // R4: Check version for conflict resolution
      const existingRental = await ctx.prisma.equipmentRental.findFirst({
        where: {
          id,
          tenantId: ctx.tenantId,
        },
      });

      if (!existingRental) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Rental not found',
        });
      }

      if (baseVersion && existingRental.version !== baseVersion) {
        throw new TRPCError({
          code: 'CONFLICT',
          message: 'Rental has been modified by another user',
        });
      }

      const updateData: any = {
        updatedBy: ctx.userId,
        version: { increment: 1 },
      };

      if (endDate !== undefined) updateData.endDate = endDate ? new Date(endDate) : null;
      if (hourlyRate !== undefined) updateData.hourlyRate = hourlyRate;
      if (dailyRate !== undefined) updateData.dailyRate = dailyRate;
      if (weeklyRate !== undefined) updateData.weeklyRate = weeklyRate;
      if (monthlyRate !== undefined) updateData.monthlyRate = monthlyRate;
      if (pickupLocation !== undefined) updateData.pickupLocation = pickupLocation;
      if (returnLocation !== undefined) updateData.returnLocation = returnLocation;
      if (currentLocation !== undefined) updateData.currentLocation = currentLocation;
      if (contractTerms !== undefined) updateData.contractTerms = contractTerms;
      if (insuranceRequired !== undefined) updateData.insuranceRequired = insuranceRequired;
      if (insuranceAmount !== undefined) updateData.insuranceAmount = insuranceAmount;
      if (status !== undefined) updateData.status = status;

      // If completing rental, set actual end date
      if (status === 'COMPLETED') {
        updateData.actualEndDate = new Date();
      }

      const rental = await ctx.prisma.equipmentRental.update({
        where: { id },
        data: updateData,
        include: {
          equipment: {
            select: {
              id: true,
              code: true,
              type: true,
              description: true,
            },
          },
          customer: {
            select: {
              id: true,
              customerNumber: true,
              name: true,
              companyName: true,
            },
          },
        },
      });

      return rental;
    }),

  // Rental Usage Logging
  logRentalUsage: idempotentProcedure
    .input(z.object({
      rentalId: z.string(),
      usageDate: z.string().datetime(),
      hoursUsed: z.number().min(0),
      loadUnits: z.number().min(0).default(0),
      operatorId: z.string().optional(),
      location: z.string().optional(),
      notes: z.string().optional(),
      idempotencyKey: z.string().uuid(),
    }))
    .mutation(async ({ ctx, input }) => {
      const {
        rentalId,
        usageDate,
        hoursUsed,
        loadUnits,
        operatorId,
        location,
        notes,
        idempotencyKey,
      } = input;

      // Verify rental exists and is active
      const rental = await ctx.prisma.equipmentRental.findFirst({
        where: {
          id: rentalId,
          tenantId: ctx.tenantId,
          status: 'ACTIVE',
        },
      });

      if (!rental) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Active rental not found',
        });
      }

      const usage = await ctx.prisma.rentalUsage.create({
        data: {
          tenantId: ctx.tenantId,
          rentalId,
          usageDate: new Date(usageDate),
          hoursUsed,
          loadUnits,
          operatorId,
          location,
          notes,
        },
      });

      // Update rental totals
      await ctx.prisma.equipmentRental.update({
        where: { id: rentalId },
        data: {
          hoursUsed: { increment: hoursUsed },
          version: { increment: 1 },
        },
      });

      return usage;
    }),

  // Rental Billing
  createRentalBill: idempotentProcedure
    .input(z.object({
      rentalId: z.string(),
      periodStart: z.string().datetime(),
      periodEnd: z.string().datetime(),
      dueDate: z.string().datetime(),
      baseAmount: z.number().min(0).default(0),
      usageAmount: z.number().min(0).default(0),
      additionalCharges: z.number().min(0).default(0),
      idempotencyKey: z.string().uuid(),
    }))
    .mutation(async ({ ctx, input }) => {
      const {
        rentalId,
        periodStart,
        periodEnd,
        dueDate,
        baseAmount,
        usageAmount,
        additionalCharges,
        idempotencyKey,
      } = input;

      // Verify rental exists
      const rental = await ctx.prisma.equipmentRental.findFirst({
        where: {
          id: rentalId,
          tenantId: ctx.tenantId,
        },
      });

      if (!rental) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Rental not found',
        });
      }

      // Generate bill number
      const billCount = await ctx.prisma.rentalBill.count({
        where: { tenantId: ctx.tenantId },
      });
      const billNumber = `BILL-${String(billCount + 1).padStart(6, '0')}`;

      const totalAmount = baseAmount + usageAmount + additionalCharges;

      const bill = await ctx.prisma.rentalBill.create({
        data: {
          tenantId: ctx.tenantId,
          rentalId,
          billNumber,
          billDate: new Date(),
          dueDate: new Date(dueDate),
          periodStart: new Date(periodStart),
          periodEnd: new Date(periodEnd),
          baseAmount,
          usageAmount,
          additionalCharges,
          totalAmount,
          balanceDue: totalAmount,
          status: 'PENDING',
        },
      });

      // Update rental billing status
      await ctx.prisma.equipmentRental.update({
        where: { id: rentalId },
        data: {
          billingStatus: 'BILLED',
          totalAmount: { increment: totalAmount },
          balanceDue: { increment: totalAmount },
          version: { increment: 1 },
        },
      });

      return bill;
    }),

  // Get rental statistics
  getRentalStats: protectedProcedure
    .query(async ({ ctx }) => {
      const [
        totalRentals,
        activeRentals,
        completedRentals,
        overdueRentals,
        totalRevenue,
        pendingBills,
      ] = await Promise.all([
        ctx.prisma.equipmentRental.count({
          where: { tenantId: ctx.tenantId },
        }),
        ctx.prisma.equipmentRental.count({
          where: { tenantId: ctx.tenantId, status: 'ACTIVE' },
        }),
        ctx.prisma.equipmentRental.count({
          where: { tenantId: ctx.tenantId, status: 'COMPLETED' },
        }),
        ctx.prisma.equipmentRental.count({
          where: { tenantId: ctx.tenantId, status: 'OVERDUE' },
        }),
        ctx.prisma.equipmentRental.aggregate({
          where: { tenantId: ctx.tenantId },
          _sum: { totalAmount: true },
        }),
        ctx.prisma.rentalBill.aggregate({
          where: { 
            tenantId: ctx.tenantId,
            status: 'PENDING',
          },
          _sum: { balanceDue: true },
        }),
      ]);

      return {
        totalRentals,
        activeRentals,
        completedRentals,
        overdueRentals,
        totalRevenue: totalRevenue._sum.totalAmount || 0,
        pendingBills: pendingBills._sum.balanceDue || 0,
      };
    }),

  // Get rental usage history
  getRentalUsage: protectedProcedure
    .input(z.object({
      rentalId: z.string(),
      cursor: z.string().optional(),
      limit: z.number().min(1).max(1000).default(50),
    }))
    .query(async ({ ctx, input }) => {
      const { rentalId, cursor, limit } = input;
      
      const usage = await ctx.prisma.rentalUsage.findMany({
        where: {
          rentalId,
          tenantId: ctx.tenantId,
        },
        take: limit + 1,
        cursor: cursor ? { id: cursor } : undefined,
        orderBy: { usageDate: 'desc' },
      });
      
      let nextCursor: typeof cursor | undefined = undefined;
      if (usage.length > limit) {
        const nextItem = usage.pop();
        nextCursor = nextItem!.id;
      }
      
      return {
        usage,
        nextCursor,
      };
    }),

  // Rental Metrics for Dashboard (Performance Rule: R1 cursor pagination, R2 tenant-scoped)
  getRentalMetrics: protectedProcedure
    .query(async ({ ctx }) => {
      // R2: All queries tenant-scoped and indexed
      const [
        totalActiveRentals,
        totalRevenue,
        overdueRentals,
        pendingPayments,
        equipmentStats
      ] = await Promise.all([
        // Count active rentals
        ctx.prisma.equipmentRental.count({
          where: {
            tenantId: ctx.tenantId,
            status: 'ACTIVE'
          }
        }),
        
        // Calculate total revenue from rental bills (billed or paid)
        ctx.prisma.rentalBill.aggregate({
          where: {
            tenantId: ctx.tenantId,
            status: { in: ['SENT', 'PAID', 'OVERDUE'] },
          },
          _sum: { totalAmount: true },
        }),
        
        // Count overdue rentals
        ctx.prisma.equipmentRental.count({
          where: {
            tenantId: ctx.tenantId,
            status: 'OVERDUE'
          }
        }),
        
        // Calculate pending payments (billed but unpaid/partially paid)
        ctx.prisma.rentalBill.aggregate({
          where: {
            tenantId: ctx.tenantId,
            status: { in: ['SENT', 'OVERDUE'] },
            balanceDue: { gt: 0 },
          },
          _sum: { balanceDue: true },
        }),
        
        // Equipment utilization stats
        ctx.prisma.equipment.findMany({
          where: {
            tenantId: ctx.tenantId,
          },
          select: {
            id: true,
            equipmentRentals: {
              where: {
                status: { in: ['ACTIVE', 'COMPLETED'] },
              },
              select: {
                id: true,
                status: true,
                startDate: true,
                endDate: true,
              },
            },
          },
        }),
      ]);

      // Calculate equipment utilization percentage
      const totalEquipment = equipmentStats.length;
      const rentedEquipment = equipmentStats.filter((eq: any) =>
        eq.equipmentRentals.some((rental: any) => rental.status === 'ACTIVE')
      ).length;
      const equipmentUtilization = totalEquipment > 0 ? (rentedEquipment / totalEquipment) * 100 : 0;

      // Calculate average rental duration (in days)
      const completedRentals = equipmentStats.flatMap((eq: any) =>
        eq.equipmentRentals.filter((rental: any) => rental.endDate)
      );
      const totalDuration = completedRentals.reduce((sum, rental) => {
        const start = new Date(rental.startDate);
        const end = new Date(rental.endDate!);
        const duration = (end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24);
        return sum + duration;
      }, 0);
      const averageRentalDuration = completedRentals.length > 0 ? 
        totalDuration / completedRentals.length : 0;

      return {
        totalActiveRentals,
        totalRevenue: Number(totalRevenue._sum.totalAmount || 0),
        equipmentUtilization: Math.round(equipmentUtilization * 100) / 100,
        averageRentalDuration: Math.round(averageRentalDuration * 100) / 100,
        overdueRentals,
        pendingPayments: Number(pendingPayments._sum.balanceDue || 0),
      };
    }),
});
