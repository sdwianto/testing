/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unsafe-return, @typescript-eslint/no-unsafe-call */
import { TRPCError } from '@trpc/server';
import type { Context } from '../config/trpc';

// ========================================
// RBAC MIDDLEWARE (P1 - Role-Based Access Control)
// ========================================

export interface Permission {
  resource: string;
  action: string;
}

export const PERMISSIONS = {
  // Operations permissions
  OPS_EQUIPMENT_READ: { resource: 'equipment', action: 'read' },
  OPS_EQUIPMENT_WRITE: { resource: 'equipment', action: 'write' },
  OPS_EQUIPMENT_DELETE: { resource: 'equipment', action: 'delete' },
  OPS_USAGE_READ: { resource: 'usage', action: 'read' },
  OPS_USAGE_WRITE: { resource: 'usage', action: 'write' },
  OPS_BREAKDOWN_READ: { resource: 'breakdown', action: 'read' },
  OPS_BREAKDOWN_WRITE: { resource: 'breakdown', action: 'write' },
  OPS_WORKORDER_READ: { resource: 'workorder', action: 'read' },
  OPS_WORKORDER_WRITE: { resource: 'workorder', action: 'write' },

  // Inventory permissions
  INV_ITEM_READ: { resource: 'item', action: 'read' },
  INV_ITEM_WRITE: { resource: 'item', action: 'write' },
  INV_ITEM_DELETE: { resource: 'item', action: 'delete' },
  INV_TRANSACTION_READ: { resource: 'transaction', action: 'read' },
  INV_TRANSACTION_WRITE: { resource: 'transaction', action: 'write' },
  INV_STOCK_READ: { resource: 'stock', action: 'read' },
  INV_STOCK_WRITE: { resource: 'stock', action: 'write' },

  // CRM permissions
  CRM_CUSTOMER_READ: { resource: 'customer', action: 'read' },
  CRM_CUSTOMER_WRITE: { resource: 'customer', action: 'write' },
  CRM_CUSTOMER_DELETE: { resource: 'customer', action: 'delete' },
  CRM_ORDER_READ: { resource: 'order', action: 'read' },
  CRM_ORDER_WRITE: { resource: 'order', action: 'write' },

  // System permissions
  SYS_USER_READ: { resource: 'user', action: 'read' },
  SYS_USER_WRITE: { resource: 'user', action: 'write' },
  SYS_USER_DELETE: { resource: 'user', action: 'delete' },
  SYS_ROLE_READ: { resource: 'role', action: 'read' },
  SYS_ROLE_WRITE: { resource: 'role', action: 'write' },
  SYS_AUDIT_READ: { resource: 'audit', action: 'read' },
  SYS_CONFIG_READ: { resource: 'config', action: 'read' },
  SYS_CONFIG_WRITE: { resource: 'config', action: 'write' },
} as const;

export const ROLE_PERMISSIONS = {
  ADMIN: [
    // All permissions
    ...Object.values(PERMISSIONS),
  ],
  MANAGER: [
    // Operations
    PERMISSIONS.OPS_EQUIPMENT_READ,
    PERMISSIONS.OPS_EQUIPMENT_WRITE,
    PERMISSIONS.OPS_USAGE_READ,
    PERMISSIONS.OPS_USAGE_WRITE,
    PERMISSIONS.OPS_BREAKDOWN_READ,
    PERMISSIONS.OPS_BREAKDOWN_WRITE,
    PERMISSIONS.OPS_WORKORDER_READ,
    PERMISSIONS.OPS_WORKORDER_WRITE,
    
    // Inventory
    PERMISSIONS.INV_ITEM_READ,
    PERMISSIONS.INV_ITEM_WRITE,
    PERMISSIONS.INV_TRANSACTION_READ,
    PERMISSIONS.INV_TRANSACTION_WRITE,
    PERMISSIONS.INV_STOCK_READ,
    PERMISSIONS.INV_STOCK_WRITE,
    
    // CRM
    PERMISSIONS.CRM_CUSTOMER_READ,
    PERMISSIONS.CRM_CUSTOMER_WRITE,
    PERMISSIONS.CRM_ORDER_READ,
    PERMISSIONS.CRM_ORDER_WRITE,
    
    // System (limited)
    PERMISSIONS.SYS_AUDIT_READ,
    PERMISSIONS.SYS_CONFIG_READ,
  ],
  OPERATOR: [
    // Operations (read/write)
    PERMISSIONS.OPS_EQUIPMENT_READ,
    PERMISSIONS.OPS_USAGE_READ,
    PERMISSIONS.OPS_USAGE_WRITE,
    PERMISSIONS.OPS_BREAKDOWN_READ,
    PERMISSIONS.OPS_BREAKDOWN_WRITE,
    PERMISSIONS.OPS_WORKORDER_READ,
    
    // Inventory (read only)
    PERMISSIONS.INV_ITEM_READ,
    PERMISSIONS.INV_TRANSACTION_READ,
    PERMISSIONS.INV_STOCK_READ,
    
    // CRM (read only)
    PERMISSIONS.CRM_CUSTOMER_READ,
    PERMISSIONS.CRM_ORDER_READ,
  ],
  VIEWER: [
    // Read-only access
    PERMISSIONS.OPS_EQUIPMENT_READ,
    PERMISSIONS.OPS_USAGE_READ,
    PERMISSIONS.OPS_BREAKDOWN_READ,
    PERMISSIONS.OPS_WORKORDER_READ,
    PERMISSIONS.INV_ITEM_READ,
    PERMISSIONS.INV_TRANSACTION_READ,
    PERMISSIONS.INV_STOCK_READ,
    PERMISSIONS.CRM_CUSTOMER_READ,
    PERMISSIONS.CRM_ORDER_READ,
  ],
} as const;

export function hasPermission(userRole: string, permission: Permission): boolean {
  const rolePermissions = ROLE_PERMISSIONS[userRole as keyof typeof ROLE_PERMISSIONS];
  if (!rolePermissions) {
    return false;
  }

  return rolePermissions.some(p => 
    p.resource === permission.resource && p.action === permission.action
  );
}

export function requirePermission(permission: Permission) {
  return async ({ ctx, next }: { ctx: Context; next: any }) => {
    // Mock user for now (NextAuth not fully integrated)
    const mockRole = 'ADMIN';
    
    if (!hasPermission(mockRole, permission)) {
      throw new TRPCError({
        code: 'FORBIDDEN',
        message: `Insufficient permissions. Required: ${permission.resource}:${permission.action}`,
      });
    }

    return next();
  };
}

export function requireRole(roles: string[]) {
  return async ({ ctx, next }: { ctx: Context; next: any }) => {
    // Mock user for now (NextAuth not fully integrated)
    const mockRole = 'ADMIN';
    
    if (!roles.includes(mockRole)) {
      throw new TRPCError({
        code: 'FORBIDDEN',
        message: `Insufficient role. Required: ${roles.join(' or ')}`,
      });
    }

    return next();
  };
}
