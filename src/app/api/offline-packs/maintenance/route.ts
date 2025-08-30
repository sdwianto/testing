/* eslint-disable @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-argument, @typescript-eslint/no-misused-promises, @typescript-eslint/no-floating-promises, @typescript-eslint/no-unnecessary-type-assertion */
import type { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

// ========================================
// MAINTENANCE OFFLINE PACK API (P1 - Offline Backbone)
// ========================================

const MaintenancePackRequestSchema = z.object({
  tenantId: z.string(),
  equipmentIds: z.array(z.string()).optional(),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { tenantId, equipmentIds } = MaintenancePackRequestSchema.parse(body);

    // Fetch equipment with maintenance data
    const equipment = await prisma.equipment.findMany({
      where: {
        tenantId,
        isActive: true,
        ...(equipmentIds && { id: { in: equipmentIds } }),
      },
      include: {
        workOrders: {
          orderBy: { scheduledDate: 'desc' },
          take: 100,
        },
        breakdowns: {
          where: {
            startAt: {
              gte: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000), // Last 90 days
            },
          },
          orderBy: { startAt: 'desc' },
          take: 100,
        },
        usageLogs: {
          where: {
            shiftDate: {
              gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // Last 30 days
            },
          },
          orderBy: { shiftDate: 'desc' },
          take: 200,
        },
      },
    });

    // Fetch maintenance templates and schedules
    const maintenanceConfigs = await prisma.systemConfig.findMany({
      where: {
        tenantId,
        key: { 
          in: [
            'maintenance.templates',
            'maintenance.schedules',
            'maintenance.checklists',
            'maintenance.parts',
          ],
        },
      },
    });

    // Fetch maintenance personnel
    const maintenanceUsers = await prisma.user.findMany({
      where: {
        tenantId,
        isActive: true,
        role: {
          name: { in: ['Maintenance Manager', 'Technician', 'Mechanic'] },
        },
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

    // Fetch parts and supplies
    const parts = await prisma.item.findMany({
      where: {
        tenantId,
        isActive: true,
        type: { in: ['PART', 'SUPPLY', 'TOOL'] },
      },
      include: {
        branches: {
          include: {
            locations: true,
          },
        },
      },
    });

    const packData = {
      masterData: {
        equipment,
        maintenanceUsers,
        parts,
        maintenanceConfigs: maintenanceConfigs.reduce((acc, config) => {
          acc[config.key] = config.value;
          return acc;
        }, {} as Record<string, unknown>),
      },
      transactions: [
        ...equipment.flatMap(eq => eq.workOrders),
        ...equipment.flatMap(eq => eq.breakdowns),
        ...equipment.flatMap(eq => eq.usageLogs),
      ],
      lookups: {
        equipmentTypes: [...new Set(equipment.map(eq => eq.type))],
        workOrderTypes: ['preventive', 'corrective', 'emergency'],
        workOrderStatuses: ['planned', 'released', 'in_progress', 'completed', 'canceled'],
        maintenancePriorities: ['LOW', 'MEDIUM', 'HIGH', 'URGENT'],
        breakdownReasons: [...new Set(equipment.flatMap(eq => eq.breakdowns).map(bd => bd.reason).filter(Boolean))],
        partTypes: [...new Set(parts.map(part => part.type))],
        maintenanceRoles: [...new Set(maintenanceUsers.map(user => user.role.name))],
      },
    };

    return Response.json(packData);
  } catch (error) {
    console.error('Maintenance pack creation error:', error);
    return Response.json(
      { error: 'Failed to create maintenance pack' },
      { status: 500 }
    );
  }
}
