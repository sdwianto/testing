import { prisma } from '@/lib/prisma';

// ========================================
// GLOBAL SEARCH SERVICE (P1 - Core Platform)
// ========================================

export interface SearchResult {
  id: string;
  type: 'equipment' | 'item' | 'customer' | 'order' | 'workorder' | 'user';
  title: string;
  description: string;
  url: string;
  metadata?: Record<string, unknown>;
}

export class SearchService {
  // Global search across all entities
  static async globalSearch(tenantId: string, query: string, limit = 20): Promise<SearchResult[]> {
    const results: SearchResult[] = [];

    // Search equipment
    const equipment = await prisma.equipment.findMany({
      where: {
        tenantId,
        OR: [
          { code: { contains: query, mode: 'insensitive' } },
          { description: { contains: query, mode: 'insensitive' } },
          { type: { contains: query, mode: 'insensitive' } },
        ],
      },
      take: 5,
    });

    results.push(...equipment.map(eq => ({
      id: eq.id,
      type: 'equipment' as const,
      title: eq.code,
      description: eq.description ?? eq.type,
      url: `/operations/equipment/${eq.id}`,
      metadata: {
        type: eq.type,
        currentSiteId: eq.currentSiteId,
        isActive: eq.isActive,
      },
    })));

    // Search items
    const items = await prisma.item.findMany({
      where: {
        tenantId,
        OR: [
          { number: { contains: query, mode: 'insensitive' } },
          { description: { contains: query, mode: 'insensitive' } },
          { type: { contains: query, mode: 'insensitive' } },
        ],
      },
      take: 5,
    });

    results.push(...items.map(item => ({
      id: item.id,
      type: 'item' as const,
      title: item.number,
      description: item.description ?? item.type,
      url: `/inventory/items/${item.id}`,
      metadata: {
        type: item.type,
        stdCost: item.stdCost,
        isActive: item.isActive,
      },
    })));

    // Search customers
    const customers = await prisma.customer.findMany({
      where: {
        tenantId,
        OR: [
          { customerNumber: { contains: query, mode: 'insensitive' } },
          { name: { contains: query, mode: 'insensitive' } },
          { email: { contains: query, mode: 'insensitive' } },
        ],
      },
      take: 5,
    });

    results.push(...customers.map(customer => ({
      id: customer.id,
      type: 'customer' as const,
      title: customer.name,
      description: customer.customerNumber,
      url: `/crm/customers/${customer.id}`,
      metadata: {
        customerNumber: customer.customerNumber,
        email: customer.email,
        phone: customer.phone,
      },
    })));

    // Search orders
    const orders = await prisma.order.findMany({
      where: {
        tenantId,
        OR: [
          { orderNumber: { contains: query, mode: 'insensitive' } },
          { customer: { name: { contains: query, mode: 'insensitive' } } },
        ],
      },
      include: {
        customer: true,
      },
      take: 5,
    });

    results.push(...orders.map(order => ({
      id: order.id,
      type: 'order' as const,
      title: order.orderNumber,
      description: `Customer: ${order.customer.name}`,
      url: `/crm/orders/${order.id}`,
      metadata: {
        status: order.status,
        subtotal: order.subtotal,
        grandTotal: order.grandTotal,
        customerName: order.customer.name,
      },
    })));

    // Search work orders
    const workOrders = await prisma.workOrder.findMany({
      where: {
        tenantId,
        OR: [
          { description: { contains: query, mode: 'insensitive' } },
          { type: { contains: query, mode: 'insensitive' } },
          { equipment: { code: { contains: query, mode: 'insensitive' } } },
        ],
      },
      include: {
        equipment: true,
      },
      take: 5,
    });

    results.push(...workOrders.map(wo => ({
      id: wo.id,
      type: 'workorder' as const,
      title: wo.description ?? wo.type,
      description: `Equipment: ${wo.equipment.code}`,
      url: `/operations/workorders/${wo.id}`,
      metadata: {
        type: wo.type,
        status: wo.status,
        scheduledDate: wo.scheduledDate,
        equipmentCode: wo.equipment.code,
      },
    })));

    // Search users (admin only)
    const users = await prisma.user.findMany({
      where: {
        tenantId,
        OR: [
          { firstName: { contains: query, mode: 'insensitive' } },
          { lastName: { contains: query, mode: 'insensitive' } },
          { email: { contains: query, mode: 'insensitive' } },
        ],
      },
      take: 5,
    });

    results.push(...users.map(user => ({
      id: user.id,
      type: 'user' as const,
      title: `${user.firstName} ${user.lastName}`,
      description: user.email,
      url: `/settings/users/${user.id}`,
      metadata: {
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        isActive: user.isActive,
      },
    })));

    // Sort by relevance (exact matches first, then partial matches)
    return results
      .sort((a, b) => {
        const aExact = a.title.toLowerCase().includes(query.toLowerCase()) ? 1 : 0;
        const bExact = b.title.toLowerCase().includes(query.toLowerCase()) ? 1 : 0;
        return bExact - aExact;
      })
      .slice(0, limit);
  }

  // Search within specific entity type
  static async searchByType(
    tenantId: string,
    type: SearchResult['type'],
    query: string,
    limit = 10
  ): Promise<SearchResult[]> {
    const results = await this.globalSearch(tenantId, query, 50);
    return results.filter(result => result.type === type).slice(0, limit);
  }

  // Get search suggestions
  static async getSuggestions(tenantId: string, query: string): Promise<string[]> {
    const suggestions: string[] = [];
    
    // Get equipment codes
    const equipment = await prisma.equipment.findMany({
      where: {
        tenantId,
        code: { contains: query, mode: 'insensitive' },
      },
      select: { code: true },
      take: 3,
    });
    suggestions.push(...equipment.map(e => e.code));

    // Get item numbers
    const items = await prisma.item.findMany({
      where: {
        tenantId,
        number: { contains: query, mode: 'insensitive' },
      },
      select: { number: true },
      take: 3,
    });
    suggestions.push(...items.map(i => i.number));

    // Get customer names
    const customers = await prisma.customer.findMany({
      where: {
        tenantId,
        name: { contains: query, mode: 'insensitive' },
      },
      select: { name: true },
      take: 3,
    });
    suggestions.push(...customers.map(c => c.name));

    return [...new Set(suggestions)].slice(0, 10);
  }
}

