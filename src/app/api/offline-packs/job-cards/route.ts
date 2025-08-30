/* eslint-disable @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-argument, @typescript-eslint/no-misused-promises, @typescript-eslint/no-floating-promises, @typescript-eslint/no-unnecessary-type-assertion */
import type { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

// ========================================
// JOB CARDS OFFLINE PACK API (P1 - Offline Backbone)
// ========================================

const JobCardsPackRequestSchema = z.object({
  tenantId: z.string(),
  siteId: z.string().optional(),
  equipmentIds: z.array(z.string()).optional(),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { tenantId, siteId, equipmentIds } = JobCardsPackRequestSchema.parse(body);

    // Fetch equipment data
    const equipment = await prisma.equipment.findMany({
      where: {
        tenantId,
        isActive: true,
        ...(siteId && { currentSiteId: siteId }),
        ...(equipmentIds && { id: { in: equipmentIds } }),
      },
      include: {
        usageLogs: {
          where: {
            shiftDate: {
              gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // Last 30 days
            },
          },
          orderBy: { shiftDate: 'desc' },
          take: 100,
        },
        breakdowns: {
          where: {
            startAt: {
              gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // Last 30 days
            },
          },
          orderBy: { startAt: 'desc' },
          take: 50,
        },
        workOrders: {
          where: {
            status: { in: ['planned', 'released', 'in_progress'] },
          },
          orderBy: { scheduledDate: 'asc' },
          take: 50,
        },
      },
    });

    // Fetch work order templates
    const workOrderTemplates = await prisma.systemConfig.findMany({
      where: {
        tenantId,
        key: { startsWith: 'workorder.template.' },
      },
    });

    // Fetch maintenance schedules
    const maintenanceSchedules = await prisma.systemConfig.findMany({
      where: {
        tenantId,
        key: { startsWith: 'maintenance.schedule.' },
      },
    });

    // Fetch users for assignment
    const users = await prisma.user.findMany({
      where: {
        tenantId,
        isActive: true,
      },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        role: {
          select: {
            name: true,
          },
        },
      },
    });

    // Fetch sites/locations
    const sites = await prisma.systemConfig.findMany({
      where: {
        tenantId,
        key: { startsWith: 'site.' },
      },
    });

    const packData = {
      masterData: {
        equipment,
        users,
        sites: sites.map(site => ({
          id: site.key.replace('site.', ''),
          name: site.value,
        })),
        workOrderTemplates: workOrderTemplates.map(template => ({
          id: template.key.replace('workorder.template.', ''),
          name: template.value,
          config: template.value,
        })),
        maintenanceSchedules: maintenanceSchedules.map(schedule => ({
          id: schedule.key.replace('maintenance.schedule.', ''),
          name: schedule.value,
          config: schedule.value,
        })),
      },
      transactions: [
        ...equipment.flatMap(eq => eq.usageLogs),
        ...equipment.flatMap(eq => eq.breakdowns),
        ...equipment.flatMap(eq => eq.workOrders),
      ],
      lookups: {
        equipmentTypes: [...new Set(equipment.map(eq => eq.type))],
        workOrderTypes: ['preventive', 'corrective', 'emergency'],
        workOrderStatuses: ['planned', 'released', 'in_progress', 'completed', 'canceled'],
        breakdownReasons: [...new Set(equipment.flatMap(eq => eq.breakdowns).map(bd => bd.reason).filter(Boolean))],
      },
    };

    return Response.json(packData);
  } catch (error) {
    console.error('Job cards pack creation error:', error);
    return Response.json(
      { error: 'Failed to create job cards pack' },
      { status: 500 }
    );
  }
}
