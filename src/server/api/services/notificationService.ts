/* eslint-disable @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-explicit-any */
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();
import { redisPubSub } from '@/lib/redis';

// ========================================
// NOTIFICATION SERVICE (P1 - Core Platform)
// ========================================

export interface Notification {
  id: string;
  type: 'info' | 'warning' | 'error' | 'success';
  title: string;
  message: string;
  userId?: string;
  tenantId: string;
  data?: unknown;
  read: boolean;
  createdAt: Date;
}

export class NotificationService {
  // Create notification
  static async createNotification(notification: Omit<Notification, 'id' | 'read' | 'createdAt'>) {
    const newNotification = await prisma.notification.create({
      data: {
        type: notification.type,
        title: notification.title,
        message: notification.message,
        userId: notification.userId,
        tenantId: notification.tenantId,
        data: notification.data as any,
        read: false,
      },
    });

    // Publish to Redis for real-time updates
    await redisPubSub.publish(
      `tenant:${notification.tenantId}:notifications`,
      JSON.stringify({
        type: 'notification.created',
        notification: newNotification,
        timestamp: new Date().toISOString(),
      })
    );

    return newNotification;
  }

  // Get notifications for user
  static async getUserNotifications(userId: string, tenantId: string, limit = 50) {
    return await prisma.notification.findMany({
      where: {
        OR: [
          { userId },
          { userId: null }, // Global notifications
        ],
        tenantId,
      },
      orderBy: {
        createdAt: 'desc',
      },
      take: limit,
    });
  }

  // Mark notification as read
  static async markAsRead(notificationId: string, userId: string) {
    const notification = await prisma.notification.update({
      where: {
        id: notificationId,
        userId,
      },
      data: {
        read: true,
      },
    });

    // Publish update
    await redisPubSub.publish(
      `tenant:${notification.tenantId}:notifications`,
      JSON.stringify({
        type: 'notification.read',
        notificationId,
        userId,
        timestamp: new Date().toISOString(),
      })
    );

    return notification;
  }

  // Mark all notifications as read for user
  static async markAllAsRead(userId: string, tenantId: string) {
    await prisma.notification.updateMany({
      where: {
        userId,
        tenantId,
        read: false,
      },
      data: {
        read: true,
      },
    });

    // Publish update
    await redisPubSub.publish(
      `tenant:${tenantId}:notifications`,
      JSON.stringify({
        type: 'notifications.all_read',
        userId,
        timestamp: new Date().toISOString(),
      })
    );
  }

  // Get unread count
  static async getUnreadCount(userId: string, tenantId: string) {
    return await prisma.notification.count({
      where: {
        OR: [
          { userId },
          { userId: null }, // Global notifications
        ],
        tenantId,
        read: false,
      },
    });
  }

  // System notifications
  static async createSystemNotification(
    tenantId: string,
    type: Notification['type'],
    title: string,
    message: string,
    data?: unknown
  ) {
    return await this.createNotification({
      type,
      title,
      message,
      tenantId,
      data: data as any,
    });
  }

  // Equipment notifications
  static async notifyEquipmentBreakdown(tenantId: string, equipmentId: string, equipmentCode: string) {
    return await this.createSystemNotification(
      tenantId,
      'error',
      'Equipment Breakdown',
      `Equipment ${equipmentCode} has reported a breakdown and requires immediate attention.`,
      { equipmentId, equipmentCode }
    );
  }

  static async notifyEquipmentMaintenance(tenantId: string, equipmentId: string, equipmentCode: string) {
    return await this.createSystemNotification(
      tenantId,
      'warning',
      'Maintenance Due',
      `Equipment ${equipmentCode} is due for scheduled maintenance.`,
      { equipmentId, equipmentCode }
    );
  }

  // Inventory notifications
  static async notifyLowStock(tenantId: string, itemId: string, itemNumber: string, currentStock: number) {
    return await this.createSystemNotification(
      tenantId,
      'warning',
      'Low Stock Alert',
      `Item ${itemNumber} is running low on stock. Current quantity: ${currentStock}`,
      { itemId, itemNumber, currentStock }
    );
  }

  static async notifyReorderTriggered(tenantId: string, itemId: string, itemNumber: string, reorderQty: number) {
    return await this.createSystemNotification(
      tenantId,
      'info',
      'Reorder Triggered',
      `Automatic reorder has been triggered for item ${itemNumber}. Quantity: ${reorderQty}`,
      { itemId, itemNumber, reorderQty }
    );
  }

  // Work order notifications
  static async notifyWorkOrderCreated(tenantId: string, workOrderId: string, equipmentCode: string) {
    return await this.createSystemNotification(
      tenantId,
      'info',
      'Work Order Created',
      `New work order has been created for equipment ${equipmentCode}.`,
      { workOrderId, equipmentCode }
    );
  }

  static async notifyWorkOrderCompleted(tenantId: string, workOrderId: string, equipmentCode: string) {
    return await this.createSystemNotification(
      tenantId,
      'success',
      'Work Order Completed',
      `Work order for equipment ${equipmentCode} has been completed.`,
      { workOrderId, equipmentCode }
    );
  }
}
