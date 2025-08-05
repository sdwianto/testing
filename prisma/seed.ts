import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting ERP database seeding...');

  // ========================================
  // CORE SYSTEM SEEDING
  // ========================================

  // Create Roles
  console.log('Creating roles...');
  const adminRole = await prisma.role.upsert({
    where: { name: 'Administrator' },
    update: {},
    create: {
      name: 'Administrator',
      description: 'Full system access',
      permissions: [
        'user:read', 'user:write', 'user:delete',
        'role:read', 'role:write', 'role:delete',
        'department:read', 'department:write', 'department:delete',
        'product:read', 'product:write', 'product:delete',
        'inventory:read', 'inventory:write', 'inventory:delete',
        'order:read', 'order:write', 'order:delete',
        'finance:read', 'finance:write', 'finance:delete',
        'hr:read', 'hr:write', 'hr:delete',
        'crm:read', 'crm:write', 'crm:delete',
        'equipment:read', 'equipment:write', 'equipment:delete',
        'maintenance:read', 'maintenance:write', 'maintenance:delete',
        'rental:read', 'rental:write', 'rental:delete',
        'report:read', 'report:write',
        'audit:read'
      ]
    }
  });

  const managerRole = await prisma.role.upsert({
    where: { name: 'Manager' },
    update: {},
    create: {
      name: 'Manager',
      description: 'Department manager access',
      permissions: [
        'user:read',
        'product:read', 'product:write',
        'inventory:read', 'inventory:write',
        'order:read', 'order:write',
        'finance:read', 'finance:write',
        'hr:read', 'hr:write',
        'crm:read', 'crm:write',
        'equipment:read', 'equipment:write',
        'maintenance:read', 'maintenance:write',
        'rental:read', 'rental:write',
        'report:read'
      ]
    }
  });

  const operatorRole = await prisma.role.upsert({
    where: { name: 'Operator' },
    update: {},
    create: {
      name: 'Operator',
      description: 'Basic operational access',
      permissions: [
        'product:read',
        'inventory:read', 'inventory:write',
        'order:read', 'order:write',
        'equipment:read',
        'maintenance:read', 'maintenance:write'
      ]
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
      description: 'IT and System Administration'
    }
  });

  const financeDept = await prisma.department.upsert({
    where: { code: 'FIN' },
    update: {},
    create: {
      name: 'Finance & Accounting',
      code: 'FIN',
      description: 'Financial management and accounting'
    }
  });

  const hrDept = await prisma.department.upsert({
    where: { code: 'HR' },
    update: {},
    create: {
      name: 'Human Resources',
      code: 'HR',
      description: 'Human resources and payroll'
    }
  });

  const operationsDept = await prisma.department.upsert({
    where: { code: 'OPS' },
    update: {},
    create: {
      name: 'Operations',
      code: 'OPS',
      description: 'Daily operations and maintenance'
    }
  });

  const salesDept = await prisma.department.upsert({
    where: { code: 'SALES' },
    update: {},
    create: {
      name: 'Sales & Marketing',
      code: 'SALES',
      description: 'Sales and customer relations'
    }
  });

  // Create Admin User (placeholder - will be linked to Clerk)
  console.log('Creating admin user...');
  const adminUser = await prisma.user.upsert({
    where: { email: 'admin@nextgen.com' },
    update: {},
    create: {
      clerkId: 'admin_clerk_id', // This will be replaced with actual Clerk ID
      email: 'admin@nextgen.com',
      firstName: 'System',
      lastName: 'Administrator',
      phone: '+67512345678',
      roleId: adminRole.id,
      departmentId: itDept.id
    }
  });

  // ========================================
  // INVENTORY & PROCUREMENT SEEDING
  // ========================================

  // Create Product Categories
  console.log('Creating product categories...');
  const heavyEquipmentCategory = await prisma.category.upsert({
    where: { code: 'HEAVY-EQ' },
    update: {},
    create: {
      name: 'Heavy Equipment',
      code: 'HEAVY-EQ',
      description: 'Heavy construction and mining equipment'
    }
  });

  const sparePartsCategory = await prisma.category.upsert({
    where: { code: 'SPARE-PARTS' },
    update: {},
    create: {
      name: 'Spare Parts',
      code: 'SPARE-PARTS',
      description: 'Equipment spare parts and components'
    }
  });

  const toolsCategory = await prisma.category.upsert({
    where: { code: 'TOOLS' },
    update: {},
    create: {
      name: 'Tools & Accessories',
      code: 'TOOLS',
      description: 'Hand tools and equipment accessories'
    }
  });

  const consumablesCategory = await prisma.category.upsert({
    where: { code: 'CONSUMABLES' },
    update: {},
    create: {
      name: 'Consumables',
      code: 'CONSUMABLES',
      description: 'Consumable materials and supplies'
    }
  });

  // Create Products
  console.log('Creating products...');
  const excavator = await prisma.product.upsert({
    where: { sku: 'EXC-001' },
    update: {},
    create: {
      name: 'Excavator Komatsu PC200',
      code: 'EXC-001',
      sku: 'EXC-001',
      description: '20-ton hydraulic excavator for construction and mining',
      price: 500000000, // 500 million IDR
      costPrice: 450000000,
      categoryId: heavyEquipmentCategory.id,
      minStockLevel: 1,
      maxStockLevel: 5,
      currentStock: 2,
      unitOfMeasure: 'UNIT',
      isService: false,
      createdBy: adminUser.id
    }
  });

  const bulldozer = await prisma.product.upsert({
    where: { sku: 'BULL-001' },
    update: {},
    create: {
      name: 'Bulldozer Caterpillar D6',
      code: 'BULL-001',
      sku: 'BULL-001',
      description: 'Track-type tractor for earthmoving operations',
      price: 750000000, // 750 million IDR
      costPrice: 675000000,
      categoryId: heavyEquipmentCategory.id,
      minStockLevel: 1,
      maxStockLevel: 3,
      currentStock: 1,
      unitOfMeasure: 'UNIT',
      isService: false,
      createdBy: adminUser.id
    }
  });

  const hydraulicPump = await prisma.product.upsert({
    where: { sku: 'HP-001' },
    update: {},
    create: {
      name: 'Hydraulic Pump Assembly',
      code: 'HP-001',
      sku: 'HP-001',
      description: 'Replacement hydraulic pump for excavators',
      price: 15000000, // 15 million IDR
      costPrice: 12000000,
      categoryId: sparePartsCategory.id,
      minStockLevel: 5,
      maxStockLevel: 20,
      currentStock: 12,
      unitOfMeasure: 'PCS',
      isService: false,
      createdBy: adminUser.id
    }
  });

  const safetyHelmet = await prisma.product.upsert({
    where: { sku: 'SH-001' },
    update: {},
    create: {
      name: 'Safety Helmet',
      code: 'SH-001',
      sku: 'SH-001',
      description: 'Industrial safety helmet with chin strap',
      price: 150000, // 150k IDR
      costPrice: 100000,
      categoryId: toolsCategory.id,
      minStockLevel: 50,
      maxStockLevel: 200,
      currentStock: 150,
      unitOfMeasure: 'PCS',
      isService: false,
      createdBy: adminUser.id
    }
  });

  const dieselFuel = await prisma.product.upsert({
    where: { sku: 'FUEL-001' },
    update: {},
    create: {
      name: 'Diesel Fuel',
      code: 'FUEL-001',
      sku: 'FUEL-001',
      description: 'High-quality diesel fuel for heavy equipment',
      price: 15000, // 15k IDR per liter
      costPrice: 12000,
      categoryId: consumablesCategory.id,
      minStockLevel: 1000,
      maxStockLevel: 5000,
      currentStock: 3000,
      unitOfMeasure: 'LITER',
      isService: false,
      createdBy: adminUser.id
    }
  });

  // Create Warehouses
  console.log('Creating warehouses...');
  const mainWarehouse = await prisma.warehouse.upsert({
    where: { code: 'MAIN-WH' },
    update: {},
    create: {
      name: 'Main Warehouse',
      code: 'MAIN-WH',
      address: 'Port Moresby Industrial Area, Papua New Guinea',
      contactPerson: 'John Smith',
      phone: '+67512345678',
      email: 'warehouse@nextgen.com'
    }
  });

  const siteWarehouse = await prisma.warehouse.upsert({
    where: { code: 'SITE-WH' },
    update: {},
    create: {
      name: 'Site Warehouse',
      code: 'SITE-WH',
      address: 'Mining Site, Highlands Region, Papua New Guinea',
      contactPerson: 'Mike Johnson',
      phone: '+67587654321',
      email: 'site-warehouse@nextgen.com'
    }
  });

  // Create Inventory Items
  console.log('Creating inventory items...');
  await prisma.inventoryItem.upsert({
    where: {
      productId_warehouseId: {
        productId: excavator.id,
        warehouseId: mainWarehouse.id
      }
    },
    update: {},
    create: {
      productId: excavator.id,
      warehouseId: mainWarehouse.id,
      quantity: 2,
      reservedQuantity: 0,
      availableQuantity: 2
    }
  });

  await prisma.inventoryItem.upsert({
    where: {
      productId_warehouseId: {
        productId: bulldozer.id,
        warehouseId: mainWarehouse.id
      }
    },
    update: {},
    create: {
      productId: bulldozer.id,
      warehouseId: mainWarehouse.id,
      quantity: 1,
      reservedQuantity: 0,
      availableQuantity: 1
    }
  });

  await prisma.inventoryItem.upsert({
    where: {
      productId_warehouseId: {
        productId: hydraulicPump.id,
        warehouseId: mainWarehouse.id
      }
    },
    update: {},
    create: {
      productId: hydraulicPump.id,
      warehouseId: mainWarehouse.id,
      quantity: 8,
      reservedQuantity: 0,
      availableQuantity: 8
    }
  });

  await prisma.inventoryItem.upsert({
    where: {
      productId_warehouseId: {
        productId: hydraulicPump.id,
        warehouseId: siteWarehouse.id
      }
    },
    update: {},
    create: {
      productId: hydraulicPump.id,
      warehouseId: siteWarehouse.id,
      quantity: 4,
      reservedQuantity: 0,
      availableQuantity: 4
    }
  });

  // Create Suppliers
  console.log('Creating suppliers...');
  const komatsuSupplier = await prisma.supplier.upsert({
    where: { code: 'KOMATSU' },
    update: {},
    create: {
      name: 'Komatsu Indonesia',
      code: 'KOMATSU',
      contactPerson: 'David Chen',
      email: 'sales@komatsu.co.id',
      phone: '+622123456789',
      address: 'Jakarta, Indonesia',
      taxNumber: '123456789'
    }
  });

  const caterpillarSupplier = await prisma.supplier.upsert({
    where: { code: 'CAT' },
    update: {},
    create: {
      name: 'Caterpillar Asia Pacific',
      code: 'CAT',
      contactPerson: 'Sarah Wilson',
      email: 'info@cat.com',
      phone: '+65987654321',
      address: 'Singapore',
      taxNumber: '987654321'
    }
  });

  // ========================================
  // EQUIPMENT & MAINTENANCE SEEDING
  // ========================================

  // Create Equipment
  console.log('Creating equipment...');
  const excavatorEquipment = await prisma.equipment.upsert({
    where: { code: 'EQ-EXC-001' },
    update: {},
    create: {
      name: 'Excavator Komatsu PC200',
      code: 'EQ-EXC-001',
      model: 'PC200-8',
      serialNumber: 'KOM2024001',
      manufacturer: 'Komatsu',
      yearManufactured: 2024,
      categoryId: heavyEquipmentCategory.id,
      purchaseDate: new Date('2024-01-15'),
      purchasePrice: 450000000,
      currentValue: 450000000,
      status: 'AVAILABLE',
      location: 'Main Yard',
      lastMaintenanceDate: new Date('2024-01-15'),
      nextMaintenanceDate: new Date('2024-04-15'),
      totalOperatingHours: 0,
      createdBy: adminUser.id
    }
  });

  const bulldozerEquipment = await prisma.equipment.upsert({
    where: { code: 'EQ-BULL-001' },
    update: {},
    create: {
      name: 'Bulldozer Caterpillar D6',
      code: 'EQ-BULL-001',
      model: 'D6T',
      serialNumber: 'CAT2024001',
      manufacturer: 'Caterpillar',
      yearManufactured: 2024,
      categoryId: heavyEquipmentCategory.id,
      purchaseDate: new Date('2024-02-01'),
      purchasePrice: 675000000,
      currentValue: 675000000,
      status: 'AVAILABLE',
      location: 'Main Yard',
      lastMaintenanceDate: new Date('2024-02-01'),
      nextMaintenanceDate: new Date('2024-05-01'),
      totalOperatingHours: 0,
      createdBy: adminUser.id
    }
  });

  // ========================================
  // FINANCE & ACCOUNTING SEEDING
  // ========================================

  // Create Chart of Accounts
  console.log('Creating chart of accounts...');
  const cashAccount = await prisma.account.upsert({
    where: { accountNumber: '1000' },
    update: {},
    create: {
      accountNumber: '1000',
      name: 'Cash',
      type: 'ASSET',
      balance: 1000000000 // 1 billion IDR
    }
  });

  const accountsReceivable = await prisma.account.upsert({
    where: { accountNumber: '1100' },
    update: {},
    create: {
      accountNumber: '1100',
      name: 'Accounts Receivable',
      type: 'ASSET',
      balance: 0
    }
  });

  const inventoryAccount = await prisma.account.upsert({
    where: { accountNumber: '1200' },
    update: {},
    create: {
      accountNumber: '1200',
      name: 'Inventory',
      type: 'ASSET',
      balance: 0
    }
  });

  const equipmentAccount = await prisma.account.upsert({
    where: { accountNumber: '1300' },
    update: {},
    create: {
      accountNumber: '1300',
      name: 'Equipment',
      type: 'ASSET',
      balance: 1125000000 // 1.125 billion IDR
    }
  });

  const accountsPayable = await prisma.account.upsert({
    where: { accountNumber: '2000' },
    update: {},
    create: {
      accountNumber: '2000',
      name: 'Accounts Payable',
      type: 'LIABILITY',
      balance: 0
    }
  });

  const revenueAccount = await prisma.account.upsert({
    where: { accountNumber: '4000' },
    update: {},
    create: {
      accountNumber: '4000',
      name: 'Sales Revenue',
      type: 'REVENUE',
      balance: 0
    }
  });

  const rentalRevenueAccount = await prisma.account.upsert({
    where: { accountNumber: '4100' },
    update: {},
    create: {
      accountNumber: '4100',
      name: 'Rental Revenue',
      type: 'REVENUE',
      balance: 0
    }
  });

  const costOfGoodsSold = await prisma.account.upsert({
    where: { accountNumber: '5000' },
    update: {},
    create: {
      accountNumber: '5000',
      name: 'Cost of Goods Sold',
      type: 'EXPENSE',
      balance: 0
    }
  });

  const maintenanceExpense = await prisma.account.upsert({
    where: { accountNumber: '5100' },
    update: {},
    create: {
      accountNumber: '5100',
      name: 'Maintenance Expense',
      type: 'EXPENSE',
      balance: 0
    }
  });

  // ========================================
  // CRM SEEDING
  // ========================================

  // Create Customers
  console.log('Creating customers...');
  const miningCorp = await prisma.customer.upsert({
    where: { customerNumber: 'CUST-001' },
    update: {},
    create: {
      customerNumber: 'CUST-001',
      name: 'PNG Mining Corporation',
      type: 'COMPANY',
      email: 'procurement@pngmining.com',
      phone: '+67512345678',
      address: 'Port Moresby, Papua New Guinea',
      city: 'Port Moresby',
      state: 'National Capital District',
      country: 'Papua New Guinea',
      companyName: 'PNG Mining Corporation',
      taxNumber: 'PNG123456789',
      industry: 'Mining',
      status: 'ACTIVE',
      source: 'Direct Contact',
      creditLimit: 1000000000, // 1 billion IDR
      currentBalance: 0,
      createdBy: adminUser.id
    }
  });

  const constructionLtd = await prisma.customer.upsert({
    where: { customerNumber: 'CUST-002' },
    update: {},
    create: {
      customerNumber: 'CUST-002',
      name: 'Highlands Construction Ltd',
      type: 'COMPANY',
      email: 'info@highlandsconstruction.pg',
      phone: '+67587654321',
      address: 'Goroka, Eastern Highlands, Papua New Guinea',
      city: 'Goroka',
      state: 'Eastern Highlands',
      country: 'Papua New Guinea',
      companyName: 'Highlands Construction Ltd',
      taxNumber: 'PNG987654321',
      industry: 'Construction',
      status: 'ACTIVE',
      source: 'Referral',
      creditLimit: 500000000, // 500 million IDR
      currentBalance: 0,
      createdBy: adminUser.id
    }
  });

  // ========================================
  // HRMS SEEDING
  // ========================================

  // Create Employees (placeholder - will be linked to actual users)
  console.log('Creating employees...');
  const hrManager = await prisma.employee.upsert({
    where: { employeeNumber: 'EMP-001' },
    update: {},
    create: {
      employeeNumber: 'EMP-001',
      userId: adminUser.id, // Placeholder
      firstName: 'Jane',
      lastName: 'Doe',
      email: 'jane.doe@nextgen.com',
      phone: '+67512345678',
      address: 'Port Moresby, Papua New Guinea',
      dateOfBirth: new Date('1985-05-15'),
      gender: 'FEMALE',
      maritalStatus: 'MARRIED',
      departmentId: hrDept.id,
      position: 'HR Manager',
      hireDate: new Date('2024-01-01'),
      employmentStatus: 'ACTIVE',
      baseSalary: 25000000, // 25 million IDR per month
      allowances: 5000000, // 5 million IDR per month
      emergencyContactName: 'John Doe',
      emergencyContactPhone: '+67587654321',
      emergencyContactRelation: 'Spouse'
    }
  });

  console.log('✅ ERP database seeding completed successfully!');
  console.log('📊 Summary of created data:');
  console.log(`   - Roles: 3`);
  console.log(`   - Departments: 5`);
  console.log(`   - Users: 1`);
  console.log(`   - Categories: 4`);
  console.log(`   - Products: 5`);
  console.log(`   - Warehouses: 2`);
  console.log(`   - Suppliers: 2`);
  console.log(`   - Equipment: 2`);
  console.log(`   - Accounts: 9`);
  console.log(`   - Customers: 2`);
  console.log(`   - Employees: 1`);
}

main()
  .catch((e) => {
    console.error('❌ Error during seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  }); 