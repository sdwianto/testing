/* eslint-disable @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-argument, @typescript-eslint/no-misused-promises, @typescript-eslint/no-floating-promises, @typescript-eslint/no-unnecessary-type-assertion */
import type { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

// ========================================
// INVENTORY OFFLINE PACK API (P1 - Offline Backbone)
// ========================================

const InventoryPackRequestSchema = z.object({
  tenantId: z.string(),
  siteId: z.string().optional(),
  itemIds: z.array(z.string()).optional(),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { tenantId, siteId, itemIds } = InventoryPackRequestSchema.parse(body);

    // Fetch items with inventory data
    const items = await prisma.item.findMany({
      where: {
        tenantId,
        isActive: true,
        ...(itemIds && { id: { in: itemIds } }),
      },
      include: {
        branches: {
          include: {
            locations: true,
          },
        },
        inventoryTxs: {
          where: {
            createdAt: {
              gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // Last 30 days
            },
          },
          orderBy: { createdAt: 'desc' },
          take: 500,
        },
      },
    });

    // Fetch purchase requests and orders
    const purchaseRequests = await prisma.purchaseRequest.findMany({
      where: {
        tenantId,
        status: { in: ['DRAFT', 'SUBMITTED', 'APPROVED'] },
      },
      include: {
        items: true,
      },
      orderBy: { createdAt: 'desc' },
      take: 100,
    });

    const purchaseOrders = await prisma.purchaseOrder.findMany({
      where: {
        tenantId,
        status: { in: ['DRAFT', 'SENT', 'ACKNOWLEDGED'] },
      },
      include: {
        items: true,
      },
      orderBy: { createdAt: 'desc' },
      take: 100,
    });

    // Fetch sites/warehouses
    const sites = await prisma.systemConfig.findMany({
      where: {
        tenantId,
        key: { startsWith: 'site.' },
      },
    });

    // Fetch inventory users
    const inventoryUsers = await prisma.user.findMany({
      where: {
        tenantId,
        isActive: true,
        role: {
          name: { in: ['Inventory Manager', 'Warehouse Staff', 'Procurement'] },
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

    // Fetch suppliers/vendors
    const suppliers = await prisma.systemConfig.findMany({
      where: {
        tenantId,
        key: { startsWith: 'supplier.' },
      },
    });

    const packData = {
      masterData: {
        items,
        sites: sites.map(site => ({
          id: site.key.replace('site.', ''),
          name: site.value,
        })),
        inventoryUsers,
        suppliers: suppliers.map(supplier => ({
          id: supplier.key.replace('supplier.', ''),
          name: supplier.value,
        })),
        purchaseRequests,
        purchaseOrders,
      },
      transactions: [
        ...items.flatMap(item => item.inventoryTxs),
        ...purchaseRequests.flatMap(pr => pr.items),
        ...purchaseOrders.flatMap(po => po.items),
      ],
      lookups: {
        itemTypes: [...new Set(items.map(item => item.type))],
        transactionTypes: ['GRN', 'GI', 'ADJ', 'MOVE'],
        purchaseRequestStatuses: ['DRAFT', 'SUBMITTED', 'APPROVED', 'REJECTED', 'CANCELLED', 'CONVERTED_TO_PO'],
        purchaseOrderStatuses: ['DRAFT', 'SENT', 'ACKNOWLEDGED', 'PARTIALLY_RECEIVED', 'RECEIVED', 'CANCELLED', 'CLOSED'],
        priorityLevels: ['LOW', 'MEDIUM', 'HIGH', 'URGENT'],
        inventoryRoles: [...new Set(inventoryUsers.map(user => user.role.name))],
      },
    };

    return Response.json(packData);
  } catch (error) {
    console.error('Inventory pack creation error:', error);
    return Response.json(
      { error: 'Failed to create inventory pack' },
      { status: 500 }
    );
  }
}
