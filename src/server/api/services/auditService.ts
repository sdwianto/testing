/* eslint-disable @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-argument, @typescript-eslint/no-explicit-any, @typescript-eslint/no-inferrable-types */
import { prisma } from '@/lib/prisma';

// ========================================
// AUDIT SERVICE (P1 - Core Platform)
// ========================================

export interface AuditEvent {
  id: string;
  tenantId: string;
  actorId: string;
  action: string;
  entity: string;
  entityId: string;
  oldValues?: any;
  newValues?: any;
  metadata?: any;
  timestamp: Date;
}

export class AuditService {
  // Create audit event
  static async createAuditEvent(event: Omit<AuditEvent, 'id' | 'timestamp'>) {
    return await prisma.auditEvent.create({
      data: {
        tenantId: event.tenantId,
        actorId: event.actorId,
        action: event.action,
        entity: event.entity,
        entityId: event.entityId,
        changes: {
          oldValues: event.oldValues,
          newValues: event.newValues,
          metadata: event.metadata,
        },
        hash: 'mock-hash', // TODO: Implement proper hash
      },
    });
  }

  // Get audit events for entity
  static async getEntityAuditEvents(
    tenantId: string,
    entity: string,
    entityId: string,
    limit: number = 50
  ) {
    return await prisma.auditEvent.findMany({
      where: {
        tenantId,
        entity,
        entityId,
      },
      orderBy: {
        createdAt: 'desc',
      },
      take: limit,
    });
  }

  // Get audit events for user
  static async getUserAuditEvents(
    tenantId: string,
    actorId: string,
    limit: number = 50
  ) {
    return await prisma.auditEvent.findMany({
      where: {
        tenantId,
        actorId,
      },
      orderBy: {
        createdAt: 'desc',
      },
      take: limit,
    });
  }

  // Get audit events by action
  static async getActionAuditEvents(
    tenantId: string,
    action: string,
    limit: number = 50
  ) {
    return await prisma.auditEvent.findMany({
      where: {
        tenantId,
        action,
      },
      orderBy: {
        createdAt: 'desc',
      },
      take: limit,
    });
  }

  // Get audit events with filters
  static async getAuditEvents(
    tenantId: string,
    filters: {
      actorId?: string;
      action?: string;
      entity?: string;
      entityId?: string;
      startDate?: Date;
      endDate?: Date;
    },
    limit: number = 100
  ) {
    return await prisma.auditEvent.findMany({
      where: {
        tenantId,
        ...(filters.actorId && { actorId: filters.actorId }),
        ...(filters.action && { action: filters.action }),
        ...(filters.entity && { entity: filters.entity }),
        ...(filters.entityId && { entityId: filters.entityId }),
        ...(filters.startDate && { timestamp: { gte: filters.startDate } }),
        ...(filters.endDate && { timestamp: { lte: filters.endDate } }),
      },
      orderBy: {
        createdAt: 'desc',
      },
      take: limit,
    });
  }

  // Audit equipment operations
  static async auditEquipmentOperation(
    tenantId: string,
    actorId: string,
    action: string,
    equipmentId: string,
    oldValues?: any,
    newValues?: any,
    metadata?: any
  ) {
    return await this.createAuditEvent({
      tenantId,
      actorId,
      action,
      entity: 'equipment',
      entityId: equipmentId,
      oldValues,
      newValues,
      metadata,
    });
  }

  // Audit inventory operations
  static async auditInventoryOperation(
    tenantId: string,
    actorId: string,
    action: string,
    itemId: string,
    oldValues?: any,
    newValues?: any,
    metadata?: any
  ) {
    return await this.createAuditEvent({
      tenantId,
      actorId,
      action,
      entity: 'item',
      entityId: itemId,
      oldValues,
      newValues,
      metadata,
    });
  }

  // Audit user operations
  static async auditUserOperation(
    tenantId: string,
    actorId: string,
    action: string,
    targetUserId: string,
    oldValues?: any,
    newValues?: any,
    metadata?: any
  ) {
    return await this.createAuditEvent({
      tenantId,
      actorId,
      action,
      entity: 'user',
      entityId: targetUserId,
      oldValues,
      newValues,
      metadata,
    });
  }

  // Audit system operations
  static async auditSystemOperation(
    tenantId: string,
    actorId: string,
    action: string,
    entity: string,
    entityId: string,
    oldValues?: any,
    newValues?: any,
    metadata?: any
  ) {
    return await this.createAuditEvent({
      tenantId,
      actorId,
      action,
      entity,
      entityId,
      oldValues,
      newValues,
      metadata,
    });
  }
}
