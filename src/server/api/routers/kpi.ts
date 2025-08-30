/* eslint-disable @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-argument, @typescript-eslint/no-explicit-any, @typescript-eslint/no-inferrable-types, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-return, @typescript-eslint/prefer-nullish-coalescing, @typescript-eslint/no-unnecessary-type-assertion */

import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "@/server/api/config/trpc";
import { kpiService } from "@/server/api/services/kpiService";

export const kpiRouter = createTRPCRouter({
  getKPIs: protectedProcedure
    .input(
      z.object({
        from: z.string().transform((str) => new Date(str)),
        to: z.string().transform((str) => new Date(str)),
      })
    )
    .query(async ({ ctx, input }) => {
      const tenantId = ctx.tenantId;
      return await kpiService.calculateKPIs(tenantId, input);
    }),

  getEquipmentUtilization: protectedProcedure
    .input(
      z.object({
        from: z.string().transform((str) => new Date(str)),
        to: z.string().transform((str) => new Date(str)),
      })
    )
    .query(async ({ ctx, input }) => {
      const tenantId = ctx.tenantId;
      return await kpiService.getEquipmentUtilization(tenantId, input);
    }),

  getMaintenanceTrends: protectedProcedure
    .input(
      z.object({
        from: z.string().transform((str) => new Date(str)),
        to: z.string().transform((str) => new Date(str)),
        groupBy: z.enum(["day", "week", "month"]).default("week"),
      })
    )
    .query(async ({ ctx, input }) => {
      const tenantId = ctx.tenantId;
      
      // Get maintenance activities grouped by time period
      const activities = await ctx.prisma.workOrder.findMany({
        where: {
          tenantId,
          scheduledDate: {
            gte: input.from,
            lte: input.to,
          },
        },
        orderBy: {
          scheduledDate: "asc",
        },
      });

      // Group by time period
      const grouped = activities.reduce((acc, activity) => {
        const date = new Date(activity.scheduledDate || activity.createdAt);
        let key: string;
        
        switch (input.groupBy) {
          case "day":
            key = date.toISOString().split("T")[0]!;
            break;
          case "week":
            const weekStart = new Date(date);
            weekStart.setDate(date.getDate() - date.getDay());
            key = weekStart.toISOString().split("T")[0]!;
            break;
          case "month":
            key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
            break;
          default:
            key = date.toISOString().split("T")[0]!;
        }

        if (!acc[key]) {
          acc[key] = {
            period: key,
            planned: 0,
            completed: 0,
            overdue: 0,
          };
        }

        if (activity.type === "preventive") {
          acc[key]!.planned++;
        }
        if (activity.status === "completed") {
          acc[key]!.completed++;
        }
        if (activity.status === "canceled") {
          acc[key]!.overdue++;
        }

        return acc;
      }, {} as Record<string, { period: string; planned: number; completed: number; overdue: number }>);

      return Object.values(grouped);
    }),

  getBreakdownTrends: protectedProcedure
    .input(
      z.object({
        from: z.string().transform((str) => new Date(str)),
        to: z.string().transform((str) => new Date(str)),
        groupBy: z.enum(["day", "week", "month"]).default("week"),
      })
    )
    .query(async ({ ctx, input }) => {
      const tenantId = ctx.tenantId;
      
      const breakdowns = await ctx.prisma.breakdown.findMany({
        where: {
          tenantId,
          startAt: {
            gte: input.from,
            lte: input.to,
          },
        },
        orderBy: {
          startAt: "asc",
        },
      });

      // Group by time period
      const grouped = breakdowns.reduce((acc, breakdown) => {
        const date = new Date(breakdown.startAt!);
        let key: string;
        
        switch (input.groupBy) {
          case "day":
            key = date.toISOString().split("T")[0]!;
            break;
          case "week":
            const weekStart = new Date(date);
            weekStart.setDate(date.getDate() - date.getDay());
            key = weekStart.toISOString().split("T")[0]!;
            break;
          case "month":
            key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
            break;
          default:
            key = date.toISOString().split("T")[0]!;
        }

        if (!acc[key]) {
          acc[key] = {
            period: key,
            count: 0,
            totalDowntime: 0,
            averageRepairTime: 0,
          };
        }

        acc[key]!.count++;
        
        if (breakdown.endAt && breakdown.startAt) {
          const duration = breakdown.endAt.getTime() - breakdown.startAt.getTime();
          const hours = duration / (1000 * 60 * 60);
          acc[key]!.totalDowntime += hours;
        }

        return acc;
      }, {} as Record<string, { period: string; count: number; totalDowntime: number; averageRepairTime: number }>);

      // Calculate average repair time
      Object.values(grouped).forEach(group => {
        if (group.count > 0) {
          group.averageRepairTime = Number((group.totalDowntime / group.count).toFixed(2));
        }
      });

      return Object.values(grouped);
    }),
});
