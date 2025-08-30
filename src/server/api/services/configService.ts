/* eslint-disable @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-argument, @typescript-eslint/no-explicit-any, @typescript-eslint/no-inferrable-types */
import { prisma } from '@/lib/prisma';

// ========================================
// CONFIGURATION SERVICE (P1 - Core Platform)
// ========================================

export interface SystemConfig {
  id: string;
  tenantId: string;
  key: string;
  value: unknown;
  type: 'string' | 'number' | 'boolean' | 'json';
  description?: string;
  isPublic: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export class ConfigService {
  // Get configuration value
  static async getConfig(tenantId: string, key: string): Promise<unknown> {
    const config = await prisma.systemConfig.findUnique({
      where: {
        tenantId_key: {
          tenantId,
          key,
        },
      },
    });

    if (!config) {
      return null;
    }

    // Parse value based on type
    switch (config.type) {
      case 'number':
        return Number(config.value);
      case 'boolean':
        return config.value === 'true';
      case 'json':
        return JSON.parse(config.value);
      default:
        return config.value;
    }
  }

  // Set configuration value
  static async setConfig(
    tenantId: string,
    key: string,
    value: unknown,
    type: SystemConfig['type'] = 'string',
    description?: string,
    isPublic: boolean = false
  ) {
    let stringValue: string;
    
    switch (type) {
      case 'number':
        stringValue = (value as any).toString();
        break;
      case 'boolean':
        stringValue = (value as any).toString();
        break;
      case 'json':
        stringValue = JSON.stringify(value);
        break;
      default:
        stringValue = value as string;
    }

    return await prisma.systemConfig.upsert({
      where: {
        tenantId_key: {
          tenantId,
          key,
        },
      },
      update: {
        value: stringValue,
        type,
        description,
        isPublic,
        updatedAt: new Date(),
      },
      create: {
        tenantId,
        key,
        value: stringValue,
        type,
        description,
        isPublic,
      },
    });
  }

  // Get all configurations for tenant
  static async getAllConfigs(tenantId: string, includePublic: boolean = true) {
    return await prisma.systemConfig.findMany({
      where: {
        tenantId,
        ...(includePublic ? {} : { isPublic: false }),
      },
      orderBy: {
        key: 'asc',
      },
    });
  }

  // Get public configurations
  static async getPublicConfigs(tenantId: string) {
    return await prisma.systemConfig.findMany({
      where: {
        tenantId,
        isPublic: true,
      },
      orderBy: {
        key: 'asc',
      },
    });
  }

  // Delete configuration
  static async deleteConfig(tenantId: string, key: string) {
    return await prisma.systemConfig.delete({
      where: {
        tenantId_key: {
          tenantId,
          key,
        },
      },
    });
  }

  // Initialize default configurations
  static async initializeDefaultConfigs(tenantId: string) {
    const defaultConfigs = [
      // System settings
      { key: 'system.name', value: 'NextGen ERP', type: 'string' as const, description: 'System name' },
      { key: 'system.version', value: '1.0.0', type: 'string' as const, description: 'System version' },
      { key: 'system.timezone', value: 'Pacific/Port_Moresby', type: 'string' as const, description: 'Default timezone' },
      { key: 'system.currency', value: 'PGK', type: 'string' as const, description: 'Default currency' },
      { key: 'system.date_format', value: 'DD/MM/YYYY', type: 'string' as const, description: 'Date format' },
      
      // Operations settings
      { key: 'ops.auto_breakdown_notification', value: 'true', type: 'boolean' as const, description: 'Auto notify on equipment breakdown' },
      { key: 'ops.maintenance_reminder_days', value: '7', type: 'number' as const, description: 'Days before maintenance to send reminder' },
      { key: 'ops.usage_tracking_enabled', value: 'true', type: 'boolean' as const, description: 'Enable usage tracking' },
      
      // Inventory settings
      { key: 'inv.auto_reorder_enabled', value: 'true', type: 'boolean' as const, description: 'Enable automatic reordering' },
      { key: 'inv.low_stock_threshold', value: '10', type: 'number' as const, description: 'Low stock threshold percentage' },
      { key: 'inv.cost_tracking_enabled', value: 'true', type: 'boolean' as const, description: 'Enable cost tracking' },
      
      // CRM settings
      { key: 'crm.auto_customer_number', value: 'true', type: 'boolean' as const, description: 'Auto generate customer numbers' },
      { key: 'crm.customer_number_prefix', value: 'CUST', type: 'string' as const, description: 'Customer number prefix' },
      { key: 'crm.order_number_prefix', value: 'ORD', type: 'string' as const, description: 'Order number prefix' },
      
      // Notification settings
      { key: 'notifications.email_enabled', value: 'true', type: 'boolean' as const, description: 'Enable email notifications' },
      { key: 'notifications.sms_enabled', value: 'false', type: 'boolean' as const, description: 'Enable SMS notifications' },
      { key: 'notifications.push_enabled', value: 'true', type: 'boolean' as const, description: 'Enable push notifications' },
      
      // Security settings
      { key: 'security.session_timeout', value: '3600', type: 'number' as const, description: 'Session timeout in seconds' },
      { key: 'security.password_min_length', value: '8', type: 'number' as const, description: 'Minimum password length' },
      { key: 'security.require_2fa', value: 'false', type: 'boolean' as const, description: 'Require two-factor authentication' },
      
      // Backup settings
      { key: 'backup.auto_backup_enabled', value: 'true', type: 'boolean' as const, description: 'Enable automatic backups' },
      { key: 'backup.backup_interval_hours', value: '24', type: 'number' as const, description: 'Backup interval in hours' },
      { key: 'backup.retention_days', value: '30', type: 'number' as const, description: 'Backup retention in days' },
    ];

    for (const config of defaultConfigs) {
      await this.setConfig(
        tenantId,
        config.key,
        config.value,
        config.type,
        config.description,
        true // Public by default
      );
    }
  }

  // Get configuration with fallback
  static async getConfigWithFallback(tenantId: string, key: string, fallback: any): Promise<any> {
    const value = await this.getConfig(tenantId, key);
    return value !== null ? value : fallback;
  }

  // Bulk update configurations
  static async updateConfigs(tenantId: string, configs: Record<string, any>) {
    const updates = Object.entries(configs).map(([key, value]) =>
      this.setConfig(tenantId, key, value)
    );

    await Promise.all(updates);
  }
}

