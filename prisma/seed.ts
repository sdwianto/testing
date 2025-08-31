import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seeding for P1 Core Platform...');

  // ========================================
  // TENANT SETUP (P1 - Multi-tenant)
  // ========================================

  // Create Default Tenant
  console.log('Creating default tenant...');
  const defaultTenant = await prisma.tenant.upsert({
    where: { code: 'CA-MINE' },
    update: {},
    create: {
      name: 'CA Mine',
      code: 'CA-MINE',
      domain: 'ca-mine.local',
      isActive: true,
      settings: {
        currency: 'PGK',
        timezone: 'Pacific/Port_Moresby',
        dateFormat: 'DD/MM/YYYY',
        features: {
          operations: true,
          inventory: true,
          crm: true,
          offline: true
        }
      }
    }
  });

  // ========================================
  // CORE SYSTEM SEEDING
  // ========================================

  // Create Roles
  console.log('Creating roles...');
  const adminRole = await prisma.role.upsert({
    where: { name: 'ADMIN' },
    update: {},
    create: {
      name: 'ADMIN',
      description: 'System Administrator with full access',
      permissions: ['all']
    }
  });

  const managerRole = await prisma.role.upsert({
    where: { name: 'MANAGER' },
    update: {},
    create: {
      name: 'MANAGER',
      description: 'Department Manager with management access',
      permissions: ['ops', 'inv', 'crm', 'orders', 'reports']
    }
  });

  const operatorRole = await prisma.role.upsert({
    where: { name: 'OPERATOR' },
    update: {},
    create: {
      name: 'OPERATOR',
      description: 'Field operator with equipment and inventory access',
      permissions: ['ops', 'inv']
    }
  });

  const userRole = await prisma.role.upsert({
    where: { name: 'USER' },
    update: {},
    create: {
      name: 'USER',
      description: 'Regular user with limited access',
      permissions: ['crm', 'orders']
    }
  });

  // Create Departments
  console.log('Creating departments...');
  const itDept = await prisma.department.upsert({
    where: { code: 'IT' },
    update: {},
    create: {
      name: 'Information Technology',
      code: 'IT',
      description: 'IT Department for system management',
      isActive: true
    }
  });

  const salesDept = await prisma.department.upsert({
    where: { code: 'SALES' },
    update: {},
    create: {
      name: 'Sales & Marketing',
      code: 'SALES',
      description: 'Sales and marketing operations',
      isActive: true
    }
  });

  const operationsDept = await prisma.department.upsert({
    where: { code: 'OPS' },
    update: {},
    create: {
      name: 'Operations',
      code: 'OPS',
      description: 'Business operations and customer service',
      isActive: true
    }
  });

  // Create Admin User
  console.log('Creating admin user...');
  const adminUser = await prisma.user.upsert({
    where: { email: 'admin@nextgen-erp.com' },
    update: {},
    create: {
      tenantId: defaultTenant.id, // Multi-tenant support
      clerkId: 'admin-clerk-id',
      email: 'admin@nextgen-erp.com',
      firstName: 'System',
      lastName: 'Administrator',
      phone: '+675-1234-5678',
      roleId: adminRole.id,
      departmentId: itDept.id
    }
  });

  // Create Manager User
  console.log('Creating manager user...');
  const managerUser = await prisma.user.upsert({
    where: { email: 'manager@nextgen-erp.com' },
    update: {},
    create: {
      tenantId: defaultTenant.id,
      clerkId: 'manager-clerk-id',
      email: 'manager@nextgen-erp.com',
      firstName: 'Operations',
      lastName: 'Manager',
      phone: '+675-2345-6789',
      roleId: managerRole.id,
      departmentId: operationsDept.id
    }
  });

  // Create Operator User
  console.log('Creating operator user...');
  const operatorUser = await prisma.user.upsert({
    where: { email: 'operator@nextgen-erp.com' },
    update: {},
    create: {
      tenantId: defaultTenant.id,
      clerkId: 'operator-clerk-id',
      email: 'operator@nextgen-erp.com',
      firstName: 'Field',
      lastName: 'Operator',
      phone: '+675-3456-7890',
      roleId: operatorRole.id,
      departmentId: operationsDept.id
    }
  });

  // ========================================
  // OPERATIONS SEEDING (P1)
  // ========================================

  // Create Equipment
  console.log('Creating equipment...');
  const excavator = await prisma.equipment.create({
    data: {
      tenantId: defaultTenant.id,
      code: 'EXC-001',
      name: 'CAT 320D Excavator',
      type: 'Excavator',
      category: 'Heavy Equipment',
      description: 'CAT 320D Excavator',
      currentSiteId: 'SITE-A',
      acquisitionCost: 500000.00,
      currentValue: 450000.00,
      isActive: true
    }
  });

  const bulldozer = await prisma.equipment.create({
    data: {
      tenantId: defaultTenant.id,
      code: 'BUL-001',
      name: 'CAT D6T Bulldozer',
      type: 'Bulldozer',
      category: 'Heavy Equipment',
      description: 'CAT D6T Bulldozer',
      currentSiteId: 'SITE-B',
      acquisitionCost: 400000.00,
      currentValue: 380000.00,
      isActive: true
    }
  });

  const loader = await prisma.equipment.create({
    data: {
      tenantId: defaultTenant.id,
      code: 'LDR-001',
      name: 'CAT 950M Loader',
      type: 'Loader',
      category: 'Heavy Equipment',
      description: 'CAT 950M Loader',
      currentSiteId: 'SITE-A',
      acquisitionCost: 350000.00,
      currentValue: 320000.00,
      isActive: true
    }
  });

  // Create Usage Logs
  console.log('Creating usage logs...');
  await prisma.usageLog.create({
    data: {
      tenantId: defaultTenant.id,
      equipmentId: excavator.id,
      shiftDate: new Date('2024-01-15'),
      hoursUsed: 8.5,
      loadUnits: 120.0,
      operatorId: operatorUser.id,
      notes: 'Normal operation, no issues'
    }
  });

  await prisma.usageLog.create({
    data: {
      tenantId: defaultTenant.id,
      equipmentId: bulldozer.id,
      shiftDate: new Date('2024-01-15'),
      hoursUsed: 7.0,
      loadUnits: 95.0,
      operatorId: operatorUser.id,
      notes: 'Heavy load operations'
    }
  });

  // Create Breakdowns
  console.log('Creating breakdowns...');
  await prisma.breakdown.create({
    data: {
      tenantId: defaultTenant.id,
      equipmentId: loader.id,
      startAt: new Date('2024-01-16T08:00:00Z'),
      endAt: new Date('2024-01-16T14:30:00Z'),
      reason: 'Hydraulic system failure',
      notes: 'Hydraulic pump replacement required',
      reportedBy: operatorUser.id,
      resolvedBy: managerUser.id
    }
  });

  // Create Work Orders
  console.log('Creating work orders...');
  await prisma.workOrder.create({
    data: {
      tenantId: defaultTenant.id,
      workOrderNumber: 'WO-2024-001',
      equipmentId: excavator.id,
      workOrderType: 'PREVENTIVE',
      priority: 'MEDIUM',
      status: 'OPEN',
      title: 'Monthly Preventive Maintenance',
      description: 'Monthly preventive maintenance',
      scheduledDate: new Date('2024-02-01'),
      estimatedCost: 2500.00,
      assignedTechnicianId: managerUser.id
    }
  });

  // ========================================
  // INVENTORY SEEDING (P1)
  // ========================================

  // Create Items
  console.log('Creating items...');
  const hydraulicOil = await prisma.item.create({
    data: {
      tenantId: defaultTenant.id,
      number: 'HYD-OIL-001',
      description: 'Hydraulic Oil 46',
      type: 'Lubricant',
      stdCost: 25.00,
      lastCost: 24.50,
      avgCost: 24.75,
      isActive: true
    }
  });

  const engineFilter = await prisma.item.create({
    data: {
      tenantId: defaultTenant.id,
      number: 'ENG-FIL-001',
      description: 'Engine Air Filter',
      type: 'Filter',
      stdCost: 45.00,
      lastCost: 43.00,
      avgCost: 44.00,
      isActive: true
    }
  });

  const hydraulicPump = await prisma.item.create({
    data: {
      tenantId: defaultTenant.id,
      number: 'HYD-PMP-001',
      description: 'Hydraulic Pump Assembly',
      type: 'Component',
      stdCost: 2500.00,
      lastCost: 2450.00,
      avgCost: 2475.00,
      isActive: true
    }
  });

  // Create Item Branches
  console.log('Creating item branches...');
  const hydraulicOilBranch = await prisma.itemBranch.create({
    data: {
      tenantId: defaultTenant.id,
      itemId: hydraulicOil.id,
      siteId: 'SITE-A',
      reorderPoint: 50,
      reorderQty: 100,
      safetyStock: 25,
      leadTimeDays: 7,
      lotSize: 1
    }
  });

  const engineFilterBranch = await prisma.itemBranch.create({
    data: {
      tenantId: defaultTenant.id,
      itemId: engineFilter.id,
      siteId: 'SITE-A',
      reorderPoint: 20,
      reorderQty: 50,
      safetyStock: 10,
      leadTimeDays: 5,
      lotSize: 1
    }
  });

  // Create Item Locations
  console.log('Creating item locations...');
  await prisma.itemLocation.create({
    data: {
      tenantId: defaultTenant.id,
      itemBranchId: hydraulicOilBranch.id,
      bin: 'A-01-01',
      lotNumber: 'LOT-2024-001',
      qtyOnHand: 75,
      qtyCommitted: 10,
      qtyOnOrder: 0
    }
  });

  await prisma.itemLocation.create({
    data: {
      tenantId: defaultTenant.id,
      itemBranchId: engineFilterBranch.id,
      bin: 'A-02-01',
      lotNumber: 'LOT-2024-002',
      qtyOnHand: 30,
      qtyCommitted: 5,
      qtyOnOrder: 0
    }
  });

  // Create Inventory Transactions
  console.log('Creating inventory transactions...');
  await prisma.inventoryTx.create({
    data: {
      tenantId: defaultTenant.id,
      itemId: hydraulicOil.id,
      siteId: 'SITE-A',
      location: 'A-01-01',
      txType: 'GRN',
      qty: 100,
      unitCost: 24.50,
      refType: 'PO',
      refId: 'PO-2024-001',
      userId: managerUser.id,
      notes: 'Initial stock receipt'
    }
  });

  await prisma.inventoryTx.create({
    data: {
      tenantId: defaultTenant.id,
      itemId: hydraulicOil.id,
      siteId: 'SITE-A',
      location: 'A-01-01',
      txType: 'GI',
      qty: -15,
      unitCost: 24.50,
      refType: 'WO',
      refId: 'WO-2024-001',
      userId: operatorUser.id,
      notes: 'Used for equipment maintenance'
    }
  });

  // ========================================
  // CRM SEEDING
  // ========================================

  // Create Sample Customers
  console.log('Creating sample customers...');
  const customer1 = await prisma.customer.upsert({
    where: { customerNumber: 'CUST-001' },
    update: {},
    create: {
      tenantId: defaultTenant.id, // Multi-tenant support
      customerNumber: 'CUST-001',
      name: 'Highlands Construction Ltd',
      type: 'COMPANY',
      industry: 'Construction',
      status: 'ACTIVE',
      email: 'contact@highlands-construction.pg',
      phone: '+675-2345-6789',
      address: 'Port Moresby, Papua New Guinea',
      createdBy: adminUser.id
    }
  });

  const customer2 = await prisma.customer.upsert({
    where: { customerNumber: 'CUST-002' },
    update: {},
    create: {
      tenantId: defaultTenant.id,
      customerNumber: 'CUST-002',
      name: 'Mining Solutions Inc',
      type: 'COMPANY',
      industry: 'Mining',
      status: 'ACTIVE',
      email: 'info@mining-solutions.pg',
      phone: '+675-3456-7890',
      address: 'Lae, Papua New Guinea',
      createdBy: adminUser.id
    }
  });

  const customer3 = await prisma.customer.upsert({
    where: { customerNumber: 'CUST-003' },
    update: {},
    create: {
      tenantId: defaultTenant.id,
      customerNumber: 'CUST-003',
      name: 'John Smith',
      type: 'INDIVIDUAL',
      industry: 'Construction',
      status: 'ACTIVE',
      email: 'john.smith@email.com',
      phone: '+675-4567-8901',
      address: 'Mount Hagen, Papua New Guinea',
      createdBy: adminUser.id
    }
  });

  // Create Sample Orders
  console.log('Creating sample orders...');
  const order1 = await prisma.order.upsert({
    where: { orderNumber: 'ORD-2024-001' },
    update: {},
    create: {
      tenantId: defaultTenant.id,
      orderNumber: 'ORD-2024-001',
      customerId: customer1.id,
      orderDate: new Date('2024-01-15'),
      status: 'DRAFT',
      subtotal: 150000000, // 150 million IDR
      grandTotal: 150000000,
      createdBy: adminUser.id
    }
  });

  const order2 = await prisma.order.upsert({
    where: { orderNumber: 'ORD-2024-002' },
    update: {},
    create: {
      tenantId: defaultTenant.id,
      orderNumber: 'ORD-2024-002',
      customerId: customer2.id,
      orderDate: new Date('2024-01-20'),
      status: 'CONFIRMED',
      subtotal: 250000000, // 250 million IDR
      grandTotal: 250000000,
      createdBy: adminUser.id,
      approvedBy: adminUser.id
    }
  });

  const order3 = await prisma.order.upsert({
    where: { orderNumber: 'ORD-2024-003' },
    update: {},
    create: {
      tenantId: defaultTenant.id,
      orderNumber: 'ORD-2024-003',
      customerId: customer3.id,
      orderDate: new Date('2024-01-25'),
      status: 'DELIVERED',
      subtotal: 75000000, // 75 million IDR
      grandTotal: 75000000,
      createdBy: adminUser.id,
      approvedBy: adminUser.id
    }
  });

  // Create Customer Contacts
  console.log('Creating customer contacts...');
  await prisma.customerContact.create({
    data: {
      tenantId: defaultTenant.id,
      customerId: customer1.id,
      userId: adminUser.id,
      contactType: 'EMAIL',
      contactDate: new Date('2024-01-15'),
      summary: 'Initial contact with project manager',
      details: 'Discussed equipment rental requirements for construction project',
      followUpDate: new Date('2024-01-22'),
      status: 'OPEN'
    }
  });

  await prisma.customerContact.create({
    data: {
      tenantId: defaultTenant.id,
      customerId: customer2.id,
      userId: adminUser.id,
      contactType: 'PHONE_CALL',
      contactDate: new Date('2024-01-20'),
      summary: 'Follow-up call with operations director',
      details: 'Confirmed mining equipment specifications and delivery timeline',
      followUpDate: new Date('2024-01-27'),
      status: 'OPEN'
    }
  });

  // ========================================
  // AUDIT & EVENT SOURCING (P1)
  // ========================================

  // Create Audit Events
  console.log('Creating audit events...');
  await prisma.auditEvent.create({
    data: {
      tenantId: defaultTenant.id,
      actorId: adminUser.id,
      entity: 'Customer',
      entityId: customer1.id,
      action: 'created',
      changes: { name: 'Highlands Construction Ltd', customerNumber: 'CUST-001' },
      hash: 'audit-hash-001'
    }
  });

  await prisma.auditEvent.create({
    data: {
      tenantId: defaultTenant.id,
      actorId: adminUser.id,
      entity: 'Order',
      entityId: order1.id,
      action: 'created',
      changes: { orderNumber: 'ORD-2024-001', status: 'DRAFT' },
      hash: 'audit-hash-002'
    }
  });

  await prisma.auditEvent.create({
    data: {
      tenantId: defaultTenant.id,
      actorId: operatorUser.id,
      entity: 'Equipment',
      entityId: excavator.id,
      action: 'usage_logged',
      changes: { hoursUsed: 8.5, loadUnits: 120.0 },
      hash: 'audit-hash-003'
    }
  });

  // Create Outbox Events
  console.log('Creating outbox events...');
  await prisma.outboxEvent.create({
    data: {
      tenantId: defaultTenant.id,
      type: 'ops.equipment.created',
      entity: 'Equipment',
      entityId: excavator.id,
      version: 1,
      payload: { code: 'EXC-001', type: 'Excavator', siteId: 'SITE-A' },
      delivered: false
    }
  });

  await prisma.outboxEvent.create({
    data: {
      tenantId: defaultTenant.id,
      type: 'inv.item.created',
      entity: 'Item',
      entityId: hydraulicOil.id,
      version: 1,
      payload: { number: 'HYD-OIL-001', description: 'Hydraulic Oil 46' },
      delivered: false
    }
  });

  // Create Idempotency Logs
  console.log('Creating idempotency logs...');
  await prisma.idempotencyLog.create({
    data: {
      tenantId: defaultTenant.id,
      key: 'ops-log-usage-001',
      hash: 'hash-ops-log-usage-001',
      result: { id: 'usage-log-001', equipmentId: excavator.id }
    }
  });

  await prisma.idempotencyLog.create({
    data: {
      tenantId: defaultTenant.id,
      key: 'inv-create-item-001',
      hash: 'hash-inv-create-item-001',
      result: { id: hydraulicOil.id, number: 'HYD-OIL-001' }
    }
  });

  console.log('✅ P1 Core Platform database seeding completed successfully!');
  console.log('📊 Summary:');
  console.log(`   - Tenant: 1 (CA Mine)`);
  console.log(`   - Roles: 4 (Admin, Manager, Operator, User)`);
  console.log(`   - Departments: 3 (IT, Sales, Operations)`);
  console.log(`   - Users: 3 (Admin, Manager, Operator)`);
  console.log(`   - Equipment: 3 (Excavator, Bulldozer, Loader)`);
  console.log(`   - Usage Logs: 2`);
  console.log(`   - Breakdowns: 1`);
  console.log(`   - Work Orders: 1`);
  console.log(`   - Items: 3 (Hydraulic Oil, Engine Filter, Hydraulic Pump)`);
  console.log(`   - Item Branches: 2`);
  console.log(`   - Item Locations: 2`);
  console.log(`   - Inventory Transactions: 2`);
  console.log(`   - Customers: 3`);
  console.log(`   - Orders: 3`);
  console.log(`   - Customer Contacts: 2`);
  console.log(`   - Audit Events: 3`);
  console.log(`   - Outbox Events: 2`);
  console.log(`   - Idempotency Logs: 2`);
}

main()
  .catch((e) => {
    console.error('❌ Error during seeding:', e);
    process.exit(1);
  })
  .finally(() => {
    void prisma.$disconnect();
  }); 