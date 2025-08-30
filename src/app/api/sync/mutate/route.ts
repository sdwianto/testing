/* eslint-disable @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-argument, @typescript-eslint/no-misused-promises, @typescript-eslint/no-floating-promises, @typescript-eslint/no-unnecessary-type-assertion */
import type { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { EventPublisher } from '@/server/api/services/eventPublisher';
import { z } from 'zod';
import type { CustomerStatus, CustomerType } from '@prisma/client';

// ========================================
// SYNC MUTATE ENDPOINT (P1 - Offline Backbone)
// Per Implementation Guide: at-least-once semantics with idempotency de-dup
// ========================================

const MutationSchema = z.object({
  id: z.string(),
  kind: z.string(),
  payload: z.any(),
  idempotencyKey: z.string().uuid(),
  baseVersion: z.number().optional(),
  createdAt: z.string(),
});

const SyncRequestSchema = z.object({
  mutations: z.array(MutationSchema),
});

type Mutation = z.infer<typeof MutationSchema>;

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { mutations } = SyncRequestSchema.parse(body);
    
    const results = [];
    
    for (const mutation of mutations) {
      try {
        const result = await processMutation(mutation);
        results.push(result);
      } catch (error) {
        console.error(`Failed to process mutation ${mutation.id}:`, error);
        results.push({
          localId: mutation.id,
          status: 'error',
          message: error instanceof Error ? error.message : 'Unknown error',
        });
      }
    }
    
    return Response.json({ results });
  } catch (error) {
    console.error('Sync mutate error:', error);
    return Response.json(
      { error: 'Invalid request format' },
      { status: 400 }
    );
  }
}

async function processMutation(mutation: unknown) {
  const { idempotencyKey, kind, payload, baseVersion } = mutation as Mutation;
  
  // Check idempotency first
  const existingResult = await prisma.idempotencyLog.findUnique({
    where: {
      tenantId_key: {
        tenantId: 'CA-MINE', // TODO: Get from auth context
        key: idempotencyKey,
      },
    },
  });
  
  if (existingResult) {
    return {
      localId: (mutation as Mutation).id,
      status: 'applied',
      result: existingResult.result,
      message: 'Idempotent replay - returning cached result',
    };
  }
  
  // Process based on mutation kind
  let result;
  let entityType = 'Unknown';
  let entityId = (mutation as Mutation).id;
  
  try {
    switch (kind) {
      case 'ops.logUsage':
        result = await processUsageLog(payload, baseVersion);
        entityType = 'UsageLog';
        entityId = result.id;
        break;
        
      case 'ops.reportBreakdown':
        result = await processBreakdown(payload, baseVersion);
        entityType = 'Breakdown';
        entityId = result.id;
        break;
        
      case 'inv.createTransaction':
        result = await processInventoryTransaction(payload, baseVersion);
        entityType = 'InventoryTx';
        entityId = result.id;
        break;
        
      case 'crm.createCustomer':
        result = await processCustomer(payload, baseVersion);
        entityType = 'Customer';
        entityId = result.id;
        break;
        
      default:
        throw new Error(`Unknown mutation kind: ${kind}`);
    }
    
    // Store idempotency result
    await prisma.idempotencyLog.create({
      data: {
        key: idempotencyKey,
        hash: JSON.stringify(payload),
        result: result,
        tenantId: 'CA-MINE', // TODO: Get from auth context
      },
    });
    
    // Publish event
    await EventPublisher.publishEvent('CA-MINE', {
      type: `${kind}.completed`,
      entity: entityType,
      entityId: entityId,
      payload: result,
      version: (result as { version?: number }).version ?? 1,
    });
    
    return {
      localId: (mutation as Mutation).id,
      status: 'applied',
      result: result,
    };
    
  } catch (error) {
    if ((error as { code?: string }).code === 'CONFLICT') {
      return {
        localId: (mutation as Mutation).id,
        status: 'conflict',
        entity: entityType,
        entityId: entityId,
        serverData: (error as { cause?: unknown }).cause,
        message: error instanceof Error ? error.message : 'Unknown error',
      };
    }
    
    throw error;
  }
}

async function processUsageLog(payload: unknown, baseVersion?: number) {
  const p = payload as { equipmentId: string; shiftDate: string; hoursUsed: number; loadUnits?: number; operatorId?: string; notes?: string };
  
  // Version check for conflict resolution
  if (baseVersion) {
    const equipment = await prisma.equipment.findFirst({
      where: { id: p.equipmentId },
    });
    
    if (equipment && equipment.version !== baseVersion) {
      const error = new Error('Equipment version mismatch') as Error & { code?: string; cause?: unknown };
      error.code = 'CONFLICT';
      error.cause = {
        currentVersion: equipment.version,
        expectedVersion: baseVersion,
      };
      throw error;
    }
  }
  
  const usageLog = await prisma.usageLog.create({
    data: {
      tenantId: 'CA-MINE',
      equipmentId: p.equipmentId,
      shiftDate: new Date(p.shiftDate),
      hoursUsed: p.hoursUsed,
      loadUnits: p.loadUnits ?? 0,
      operatorId: p.operatorId,
      notes: p.notes,
    },
  });
  
  return usageLog;
}

async function processBreakdown(payload: unknown, baseVersion?: number) {
  const p = payload as { equipmentId: string; startAt: string; endAt?: string; reason: string; notes?: string; reportedBy: string; resolvedBy?: string };
  const breakdown = await prisma.breakdown.create({
    data: {
      tenantId: 'CA-MINE',
      equipmentId: p.equipmentId,
      startAt: new Date(p.startAt),
      endAt: p.endAt ? new Date(p.endAt) : null,
      reason: p.reason,
      notes: p.notes,
      reportedBy: p.reportedBy,
      resolvedBy: p.resolvedBy,
    },
  });
  
  return breakdown;
}

async function processInventoryTransaction(payload: unknown, baseVersion?: number) {
  const p = payload as { itemId: string; siteId: string; location: string; txType: string; qty: number; unitCost?: number; refType?: string; refId?: string; userId: string; notes?: string };
  // Version check for conflict resolution
  if (baseVersion) {
    const item = await prisma.item.findFirst({
      where: { id: p.itemId },
    });
    
    if (item && item.version !== baseVersion) {
      const error = new Error('Item version mismatch') as Error & { code?: string; cause?: unknown };
      error.code = 'CONFLICT';
      error.cause = {
        currentVersion: item.version,
        expectedVersion: baseVersion,
      };
      throw error;
    }
  }
  
  const inventoryTx = await prisma.inventoryTx.create({
    data: {
      tenantId: 'CA-MINE',
      itemId: p.itemId,
      siteId: p.siteId, 
      location: p.location,
      txType: p.txType,
      qty: p.qty,
      unitCost: p.unitCost ?? 0,
      refType: p.refType,
      refId: p.refId,
      userId: p.userId,
      notes: p.notes,
    },
  });
  
  return inventoryTx;
}

async function processCustomer(payload: unknown, baseVersion?: number) {
  const p = payload as { id?: string; customerNumber: string; name: string; type?: string; email?: string; phone?: string; address?: string; city?: string; state?: string; postalCode?: string; country?: string; companyName?: string; taxNumber?: string; industry?: string; status?: string; source?: string; notes?: string; creditLimit?: number; currentBalance?: number };
  // Version check for conflict resolution
  if (baseVersion) {
    const customer = await prisma.customer.findFirst({
      where: { id: p.id },
    });
    
    if (customer && customer.version !== baseVersion) {
      const error = new Error('Customer version mismatch') as Error & { code?: string; cause?: unknown };
      error.code = 'CONFLICT';
      error.cause = {
        currentVersion: customer.version,
        expectedVersion: baseVersion,
      };
      throw error;
    }
  }
  
  const customer = await prisma.customer.create({
    data: {
      tenantId: 'CA-MINE',
      customerNumber: p.customerNumber,
      name: p.name,
      type: (p.type ?? 'INDIVIDUAL') as CustomerType,
      email: p.email,
      phone: p.phone,
      address: p.address,
      city: p.city,
      state: p.state,
      postalCode: p.postalCode,
      country: p.country ?? 'Indonesia',
      companyName: p.companyName,
      taxNumber: p.taxNumber,
      industry: p.industry,
      status: (p.status ?? 'ACTIVE') as CustomerStatus,
      source: p.source,
      notes: p.notes,
      creditLimit: p.creditLimit ?? 0,
      currentBalance: p.currentBalance ?? 0,
    },
  });
  
  return customer;
}
