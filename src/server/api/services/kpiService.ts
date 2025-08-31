/* eslint-disable @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-explicit-any, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-return, @typescript-eslint/no-unnecessary-type-assertion, @typescript-eslint/prefer-nullish-coalescing */

import { prisma } from "@/lib/prisma";


export interface KPIData {
  maintenanceActivity: {
    planned: number;
    actual: number;
    ratio: number;
  };
  shutdown: {
    count: number;
    totalHours: number;
    averageDuration: number;
  };
  mttr: number; // Mean Time To Repair in hours
  mtbs: number; // Mean Time Between Shutdowns in hours
  availability: number; // Percentage
}

export class KPIService {
  async calculateKPIs(tenantId: string, dateRange: { from: Date; to: Date }): Promise<KPIData> {
    try {
      // Get equipment breakdowns for the date range
      const breakdowns = await prisma.breakdown.findMany({
        where: {
          tenantId,
          startAt: {
            gte: dateRange.from,
            lte: dateRange.to,
          },
        },
        include: {
          equipment: true,
        },
      });

      // Get maintenance activities (using work orders for now)
      const maintenanceActivities = await prisma.workOrder.findMany({
        where: {
          tenantId,
          scheduledDate: {
            gte: dateRange.from,
            lte: dateRange.to,
          },
        },
      });

      // Calculate Maintenance Activity Ratio (MA/PA)
      const plannedMaintenance = maintenanceActivities.filter(ma => (ma as any).workOrderType === 'PREVENTIVE').length;
      const actualMaintenance = maintenanceActivities.filter(ma => ma.status === 'completed').length;
      const maintenanceRatio = plannedMaintenance > 0 ? (actualMaintenance / plannedMaintenance) * 100 : 0;

      // Calculate shutdown metrics
      const shutdownBreakdowns = breakdowns.filter(b => b.endAt === null); // Active breakdowns
      const shutdownCount = shutdownBreakdowns.length;
      
      const totalShutdownHours = breakdowns.reduce((total, breakdown) => {
        if (breakdown.endAt && breakdown.startAt) {
          const duration = breakdown.endAt.getTime() - breakdown.startAt.getTime();
          return total + (duration / (1000 * 60 * 60)); // Convert to hours
        }
        return total;
      }, 0);

      const averageShutdownDuration = shutdownCount > 0 ? totalShutdownHours / shutdownCount : 0;

      // Calculate MTTR (Mean Time To Repair)
      const resolvedBreakdowns = breakdowns.filter(b => b.endAt);
      const totalRepairTime = resolvedBreakdowns.reduce((total, breakdown) => {
        if (breakdown.endAt && breakdown.startAt) {
          const duration = breakdown.endAt.getTime() - breakdown.startAt.getTime();
          return total + (duration / (1000 * 60 * 60)); // Convert to hours
        }
        return total;
      }, 0);
      const mttr = resolvedBreakdowns.length > 0 ? totalRepairTime / resolvedBreakdowns.length : 0;

      // Calculate MTBS (Mean Time Between Shutdowns)
      const sortedBreakdowns = breakdowns
        .filter(b => b.startAt)
        .sort((a, b) => a.startAt!.getTime() - b.startAt!.getTime());
      
      let totalTimeBetweenShutdowns = 0;
      for (let i = 1; i < sortedBreakdowns.length; i++) {
        const timeDiff = sortedBreakdowns[i]!.startAt!.getTime() - sortedBreakdowns[i - 1]!.startAt!.getTime();
        totalTimeBetweenShutdowns += timeDiff / (1000 * 60 * 60); // Convert to hours
      }
      const mtbs = sortedBreakdowns.length > 1 ? totalTimeBetweenShutdowns / (sortedBreakdowns.length - 1) : 0;

      // Calculate Availability
      const totalPeriodHours = (dateRange.to.getTime() - dateRange.from.getTime()) / (1000 * 60 * 60);
      const totalEquipment = await prisma.equipment.count({
        where: { tenantId },
      });
      const totalAvailableHours = totalEquipment * totalPeriodHours;
      const availability = totalAvailableHours > 0 ? ((totalAvailableHours - totalShutdownHours) / totalAvailableHours) * 100 : 100;

      return {
        maintenanceActivity: {
          planned: plannedMaintenance,
          actual: actualMaintenance,
          ratio: Number(maintenanceRatio.toFixed(2)),
        },
        shutdown: {
          count: shutdownCount,
          totalHours: Number(totalShutdownHours.toFixed(2)),
          averageDuration: Number(averageShutdownDuration.toFixed(2)),
        },
        mttr: Number(mttr.toFixed(2)),
        mtbs: Number(mtbs.toFixed(2)),
        availability: Number(availability.toFixed(2)),
      };
    } catch (error) {
      console.error('Error calculating KPIs:', error);
      // Return default values if database error
      return {
        maintenanceActivity: {
          planned: 0,
          actual: 0,
          ratio: 0,
        },
        shutdown: {
          count: 0,
          totalHours: 0,
          averageDuration: 0,
        },
        mttr: 0,
        mtbs: 0,
        availability: 0,
      };
    }
  }

  async getEquipmentUtilization(tenantId: string, dateRange: { from: Date; to: Date }) {
    try {
      const equipment = await prisma.equipment.findMany({
        where: { tenantId },
        include: {
          usageLogs: {
            where: {
              shiftDate: {
                gte: dateRange.from,
                lte: dateRange.to,
              },
            },
          },
          breakdowns: {
            where: {
              startAt: {
                gte: dateRange.from,
                lte: dateRange.to,
              },
            },
          },
        },
      });

      return equipment.map((eq: any) => {
        const totalUsageHours = eq.usageLogs.reduce((sum: any, uh: any) => sum + Number(uh.hoursUsed), 0);
        const totalBreakdownHours = eq.breakdowns.reduce((sum: any, bd: any) => {
          if (bd.endAt && bd.startAt) {
            const duration = bd.endAt.getTime() - bd.startAt.getTime();
            return sum + (duration / (1000 * 60 * 60));
          }
          return sum;
        }, 0);

        const totalPeriodHours = (dateRange.to.getTime() - dateRange.from.getTime()) / (1000 * 60 * 60);
        const utilization = totalPeriodHours > 0 ? (totalUsageHours / totalPeriodHours) * 100 : 0;

        return {
          id: eq.id,
          name: eq.description || eq.code,
          code: eq.code,
          utilization: Number(utilization.toFixed(2)),
          usageHours: totalUsageHours,
          breakdownHours: Number(totalBreakdownHours.toFixed(2)),
          status: eq.isActive ? 'ACTIVE' : 'INACTIVE',
        };
      });
    } catch (error) {
      console.error('Error fetching equipment utilization:', error);
      return [];
    }
  }
}

export const kpiService = new KPIService();
