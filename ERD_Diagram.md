# Entity Relationship Diagram (ERD) - NextGen ERP System

## Overview
This document provides a comprehensive Entity Relationship Diagram for the NextGen ERP System designed for CA Mine and NextGen Technology Limited. The system is built with a modular architecture supporting mining operations with offline capabilities.

## Database Schema Overview

### Core System & Security
```
┌─────────────┐    ┌─────────────┐    ┌─────────────┐    ┌─────────────┐
│    User     │    │    Role     │    │ Department  │    │  AuditLog   │
├─────────────┤    ├─────────────┤    ├─────────────┤    ├─────────────┤
│ id (PK)     │    │ id (PK)     │    │ id (PK)     │    │ id (PK)     │
│ clerkId     │    │ name        │    │ name        │    │ userId (FK) │
│ email       │    │ description │    │ code        │    │ action      │
│ firstName   │    │ permissions │    │ managerId   │    │ entityType  │
│ lastName    │    │ isActive    │    │ isActive    │    │ entityId    │
│ phone       │    │ createdAt   │    │ createdAt   │    │ oldValues   │
│ avatar      │    │ updatedAt   │    │ updatedAt   │    │ newValues   │
│ isActive    │    └─────────────┘    └─────────────┘    │ ipAddress   │
│ lastLoginAt │            │                   │         │ userAgent   │
│ roleId (FK) │            │                   │         │ createdAt   │
│ deptId (FK) │            │                   │         └─────────────┘
│ createdAt   │            │                   │                 │
│ updatedAt   │            │                   │                 │
│ createdBy   │            │                   │                 │
│ updatedBy   │            │                   │                 │
└─────────────┘            │                   │                 │
       │                   │                   │                 │
       └───────────────────┼───────────────────┼─────────────────┘
                           │                   │
                    ┌──────┴──────┐    ┌──────┴──────┐
                    │   1:N       │    │   1:N       │
                    └─────────────┘    └─────────────┘
```

### Inventory & Procurement Module
```
┌─────────────┐    ┌─────────────┐    ┌─────────────┐    ┌─────────────┐
│  Category   │    │   Product   │    │  Warehouse  │    │InventoryItem│
├─────────────┤    ├─────────────┤    ├─────────────┤    ├─────────────┤
│ id (PK)     │    │ id (PK)     │    │ id (PK)     │    │ id (PK)     │
│ name        │    │ name        │    │ name        │    │ productId(FK)│
│ code        │    │ code        │    │ code        │    │ warehouseId(FK)│
│ description │    │ description │    │ address     │    │ quantity    │
│ parentId(FK)│    │ sku         │    │ contactPerson│   │ reservedQty │
│ isActive    │    │ barcode     │    │ phone       │    │ availableQty│
│ createdAt   │    │ price       │    │ email       │    │ createdAt   │
│ updatedAt   │    │ costPrice   │    │ isActive    │    │ updatedAt   │
└─────────────┘    │ imageUrl    │    │ createdAt   │    └─────────────┘
       │           │ minStockLevel│    │ updatedAt   │           │
       │           │ maxStockLevel│    └─────────────┘           │
       │           │ currentStock │            │                 │
       │           │ unitOfMeasure│            │                 │
       │           │ categoryId(FK)│           │                 │
       │           │ isActive     │            │                 │
       │           │ isService    │            │                 │
       │           │ createdAt    │            │                 │
       │           │ updatedAt    │            │                 │
       │           │ createdBy    │            │                 │
       │           │ updatedBy    │            │                 │
       │           └─────────────┘            │                 │
       │                   │                  │                 │
       └───────────────────┼──────────────────┼─────────────────┘
                           │                  │
                    ┌──────┴──────┐   ┌──────┴──────┐
                    │   1:N       │   │   1:N       │
                    └─────────────┘   └─────────────┘

┌─────────────┐    ┌─────────────┐    ┌─────────────┐    ┌─────────────┐
│InventoryTxn │    │PurchaseOrder│    │PurchaseOrder│    │  Supplier   │
├─────────────┤    ├─────────────┤    │    Item     │    ├─────────────┤
│ id (PK)     │    │ id (PK)     │    ├─────────────┤    │ id (PK)     │
│ productId(FK)│   │ poNumber    │    │ id (PK)     │    │ name        │
│ warehouseId(FK)│ │ supplierId(FK)│  │ poId (FK)   │    │ code        │
│ userId (FK) │    │ orderDate   │    │ productId(FK)│   │ contactPerson│
│ txnType     │    │ expDelivery │    │ quantity    │    │ email       │
│ quantity    │    │ deliveryDate│    │ unitPrice   │    │ phone       │
│ refType     │    │ subtotal    │    │ totalPrice  │    │ address     │
│ refId       │    │ tax         │    │ receivedQty │    │ taxNumber   │
│ notes       │    │ discount    │    │ createdAt   │    │ isActive    │
│ createdAt   │    │ grandTotal  │    └─────────────┘    │ createdAt   │
└─────────────┘    │ status      │            │         │ updatedAt   │
                   │ notes       │            │         └─────────────┘
                   │ createdBy   │            │                 │
                   │ approvedBy  │            │                 │
                   │ createdAt   │            │                 │
                   │ updatedAt   │            │                 │
                   └─────────────┘            │                 │
                           │                  │                 │
                           └──────────────────┼─────────────────┘
                                              │
                                       ┌──────┴──────┐
                                       │   1:N       │
                                       └─────────────┘
```

### Equipment & Rental Module
```
┌─────────────┐    ┌─────────────┐    ┌─────────────┐    ┌─────────────┐
│ Equipment   │    │Maintenance  │    │RentalOrder  │    │RentalOrder  │
│             │    │  Record     │    │             │    │   Item      │
├─────────────┤    ├─────────────┤    ├─────────────┤    ├─────────────┤
│ id (PK)     │    │ id (PK)     │    │ id (PK)     │    │ id (PK)     │
│ name        │    │ equipmentId(FK)│ │ rentalNumber│    │ rentalOrderId(FK)│
│ code        │    │ userId (FK) │    │ customerId(FK)│  │ equipmentId(FK)│
│ model       │    │ maintType   │    │ startDate   │    │ dailyRate   │
│ serialNumber│    │ description │    │ endDate     │    │ quantity    │
│ manufacturer│    │ cost        │    │ actualReturn│    │ totalPrice  │
│ yearManufactured│ │ startDate   │    │ dailyRate   │    │ createdAt   │
│ categoryId(FK)│  │ endDate     │    │ totalDays   │    └─────────────┘
│ purchaseDate│    │ status      │    │ subtotal    │            │
│ purchasePrice│   │ partsUsed   │    │ tax         │            │
│ currentValue│    │ createdAt   │    │ grandTotal  │            │
│ status      │    │ updatedAt   │    │ status      │            │
│ location    │    └─────────────┘    │ notes       │            │
│ assignedTo  │            │         │ createdBy   │            │
│ lastMaintDate│           │         │ approvedBy  │            │
│ nextMaintDate│           │         │ createdAt   │            │
│ totalOpHours│           │         │ updatedAt   │            │
│ createdAt   │           │         └─────────────┘            │
│ updatedAt   │           │                 │                  │
│ createdBy   │           │                 │                  │
│ updatedBy   │           │                 │                  │
└─────────────┘           │                 │                  │
       │                  │                 │                  │
       └──────────────────┼─────────────────┼──────────────────┘
                          │                 │
                   ┌──────┴──────┐   ┌──────┴──────┐
                   │   1:N       │   │   1:N       │
                   └─────────────┘   └─────────────┘
```

### Finance & Accounting Module
```
┌─────────────┐    ┌─────────────┐    ┌─────────────┐
│FinancialTxn │    │   Account   │    │   Account   │
├─────────────┤    ├─────────────┤    ├─────────────┤
│ id (PK)     │    │ id (PK)     │    │ id (PK)     │
│ txnNumber   │    │ accountNumber│   │ accountNumber│
│ userId (FK) │    │ name        │    │ name        │
│ txnType     │    │ type        │    │ type        │
│ amount      │    │ parentId(FK)│    │ parentId(FK)│
│ currency    │    │ balance     │    │ balance     │
│ refType     │    │ isActive    │    │ isActive    │
│ refId       │    │ createdAt   │    │ createdAt   │
│ debitAccount│    │ updatedAt   │    │ updatedAt   │
│ creditAccount│    └─────────────┘    └─────────────┘
│ description │            │                  │
│ txnDate     │            │                  │
│ status      │            │                  │
│ paymentMethod│           │                  │
│ extTxnId    │            │                  │
│ createdAt   │            │                  │
│ updatedAt   │            │                  │
└─────────────┘            │                  │
                           │                  │
                    ┌──────┴──────┐    ┌──────┴──────┐
                    │   Self-Ref  │    │   Self-Ref  │
                    │  Hierarchy  │    │  Hierarchy  │
                    └─────────────┘    └─────────────┘
```

### HRMS & Payroll Module
```
┌─────────────┐    ┌─────────────┐    ┌─────────────┐    ┌─────────────┐
│  Employee   │    │Attendance   │    │LeaveRequest │    │PayrollRecord│
│             │    │  Record     │    │             │    │             │
├─────────────┤    ├─────────────┤    ├─────────────┤    ├─────────────┤
│ id (PK)     │    │ id (PK)     │    │ id (PK)     │    │ id (PK)     │
│ empNumber   │    │ employeeId(FK)│  │ employeeId(FK)│  │ employeeId(FK)│
│ userId (FK) │    │ date        │    │ leaveType   │    │ payPeriod   │
│ firstName   │    │ checkInTime │    │ startDate   │    │ baseSalary  │
│ lastName    │    │ checkOutTime│    │ endDate     │    │ allowances  │
│ email       │    │ totalHours  │    │ totalDays   │    │ overtimePay │
│ phone       │    │ overtimeHours│   │ reason      │    │ deductions  │
│ address     │    │ status      │    │ status      │    │ netSalary   │
│ dateOfBirth │    │ notes       │    │ approvedBy  │    │ paymentDate │
│ gender      │    │ createdAt   │    │ approvedAt  │    │ paymentMethod│
│ maritalStatus│   │ updatedAt   │    │ rejectionReason│ │ status      │
│ deptId (FK) │    └─────────────┘    │ createdAt   │    │ createdAt   │
│ position    │            │         │ updatedAt   │    │ updatedAt   │
│ hireDate    │            │         └─────────────┘    └─────────────┘
│ termDate    │            │                 │                  │
│ empStatus   │            │                 │                  │
│ baseSalary  │            │                 │                  │
│ allowances  │            │                 │                  │
│ taxNumber   │            │                 │                  │
│ bankAccount │            │                 │                  │
│ emergencyContactName│     │                 │                  │
│ emergencyContactPhone│    │                 │                  │
│ emergencyContactRelation│ │                 │                  │
│ createdAt   │            │                 │                  │
│ updatedAt   │            │                 │                  │
└─────────────┘            │                 │                  │
       │                   │                 │                  │
       └───────────────────┼─────────────────┼──────────────────┘
                           │                 │
                    ┌──────┴──────┐   ┌──────┴──────┐
                    │   1:N       │   │   1:N       │
                    └─────────────┘   └─────────────┘
```

### CRM Module
```
┌─────────────┐    ┌─────────────┐    ┌─────────────┐
│  Customer   │    │Customer     │    │Customer     │
│             │    │ Contact     │    │ Contact     │
├─────────────┤    ├─────────────┤    ├─────────────┤
│ id (PK)     │    │ id (PK)     │    │ id (PK)     │
│ custNumber  │    │ customerId(FK)│  │ customerId(FK)│
│ name        │    │ userId (FK) │    │ userId (FK) │
│ type        │    │ contactType │    │ contactType │
│ email       │    │ contactDate │    │ contactDate │
│ phone       │    │ summary     │    │ summary     │
│ address     │    │ details     │    │ details     │
│ city        │    │ followUpDate│    │ followUpDate│
│ state       │    │ status      │    │ status      │
│ postalCode  │    │ createdAt   │    │ createdAt   │
│ country     │    │ updatedAt   │    │ updatedAt   │
│ companyName │    └─────────────┘    └─────────────┘
│ taxNumber   │            │                  │
│ industry    │            │                  │
│ status      │            │                  │
│ source      │            │                  │
│ notes       │            │                  │
│ creditLimit │            │                  │
│ currentBalance│          │                  │
│ createdAt   │            │                  │
│ updatedAt   │            │                  │
│ createdBy   │            │                  │
│ updatedBy   │            │                  │
└─────────────┘            │                  │
       │                   │                  │
       └───────────────────┼──────────────────┘
                           │
                    ┌──────┴──────┐
                    │   1:N       │
                    └─────────────┘
```

### Sales & Orders Module
```
┌─────────────┐    ┌─────────────┐    ┌─────────────┐    ┌─────────────┐
│    Order    │    │ OrderItem   │    │   Product   │    │  Customer   │
├─────────────┤    ├─────────────┤    ├─────────────┤    ├─────────────┤
│ id (PK)     │    │ id (PK)     │    │ id (PK)     │    │ id (PK)     │
│ orderNumber │    │ orderId (FK)│    │ name        │    │ custNumber  │
│ customerId(FK)│   │ productId(FK)│   │ code        │    │ name        │
│ orderDate   │    │ quantity    │    │ description │    │ type        │
│ expDelivery │    │ unitPrice   │    │ sku         │    │ email       │
│ deliveryDate│    │ discount    │    │ barcode     │    │ phone       │
│ subtotal    │    │ totalPrice  │    │ price       │    │ address     │
│ tax         │    │ createdAt   │    │ costPrice   │    │ city        │
│ discount    │    └─────────────┘    │ imageUrl    │    │ state       │
│ grandTotal  │            │         │ minStockLevel│   │ postalCode  │
│ paymentStatus│           │         │ maxStockLevel│   │ country     │
│ paymentMethod│           │         │ currentStock │    │ companyName │
│ extTxnId    │           │         │ unitOfMeasure│    │ taxNumber   │
│ paidAt      │           │         │ categoryId(FK)│   │ industry    │
│ status      │           │         │ isActive     │    │ status      │
│ shippingAddress│         │         │ isService    │    │ source      │
│ shippingMethod│          │         │ createdAt    │    │ notes       │
│ shippingCost│           │         │ updatedAt    │    │ creditLimit │
│ notes       │           │         │ createdBy    │    │ currentBalance│
│ createdBy   │           │         │ updatedBy    │    │ createdAt   │
│ creator (FK)│           │         └─────────────┘    │ updatedAt   │
│ approvedBy  │           │                 │         │ createdBy   │
│ approver(FK)│           │                 │         │ updatedBy   │
│ createdAt   │           │                 │         └─────────────┘
│ updatedAt   │           │                 │                 │
└─────────────┘           │                 │                 │
       │                  │                 │                 │
       └──────────────────┼─────────────────┼─────────────────┘
                          │                 │
                   ┌──────┴──────┐   ┌──────┴──────┐
                   │   1:N       │   │   1:N       │
                   └─────────────┘   └─────────────┘
```

### Offline Sync Support
```
┌─────────────┐
│  SyncLog    │
├─────────────┤
│ id (PK)     │
│ entityType  │
│ entityId    │
│ action      │
│ data        │
│ deviceId    │
│ syncStatus  │
│ syncAttempts│
│ lastSyncAttempt│
│ errorMessage│
│ createdAt   │
│ updatedAt   │
└─────────────┘
```

## Key Relationships Summary

### One-to-Many (1:N) Relationships
1. **Role → User**: One role can have many users
2. **Department → User**: One department can have many users
3. **Department → Employee**: One department can have many employees
4. **Category → Product**: One category can have many products
5. **Category → Equipment**: One category can have many equipment
6. **Product → InventoryItem**: One product can have many inventory items
7. **Product → InventoryTransaction**: One product can have many transactions
8. **Product → OrderItem**: One product can be in many order items
9. **Product → PurchaseOrderItem**: One product can be in many PO items
10. **Warehouse → InventoryItem**: One warehouse can have many inventory items
11. **Warehouse → InventoryTransaction**: One warehouse can have many transactions
12. **Supplier → PurchaseOrder**: One supplier can have many purchase orders
13. **Equipment → MaintenanceRecord**: One equipment can have many maintenance records
14. **Equipment → RentalOrderItem**: One equipment can be in many rental items
15. **Customer → Order**: One customer can have many orders
16. **Customer → RentalOrder**: One customer can have many rental orders
17. **Customer → CustomerContact**: One customer can have many contacts
18. **Order → OrderItem**: One order can have many order items
19. **PurchaseOrder → PurchaseOrderItem**: One PO can have many PO items
20. **RentalOrder → RentalOrderItem**: One rental order can have many rental items
21. **Employee → AttendanceRecord**: One employee can have many attendance records
22. **Employee → LeaveRequest**: One employee can have many leave requests
23. **Employee → PayrollRecord**: One employee can have many payroll records
24. **User → AuditLog**: One user can have many audit logs
25. **User → FinancialTransaction**: One user can have many financial transactions

### Many-to-One (N:1) Relationships
- All foreign key relationships are many-to-one

### Self-Referencing Relationships
1. **Category → Category**: Hierarchical categories (parent-child)
2. **Account → Account**: Hierarchical chart of accounts (parent-child)

### Junction Tables
- **InventoryItem**: Links Product and Warehouse (many-to-many relationship)
- **OrderItem**: Links Order and Product (many-to-many relationship)
- **PurchaseOrderItem**: Links PurchaseOrder and Product (many-to-many relationship)
- **RentalOrderItem**: Links RentalOrder and Equipment (many-to-many relationship)

## Database Enums

### Status Enums
- **EquipmentStatus**: AVAILABLE, IN_USE, MAINTENANCE, REPAIR, RETIRED, LOST
- **OrderStatus**: DRAFT, CONFIRMED, PROCESSING, SHIPPED, DELIVERED, CANCELLED, RETURNED
- **PaymentStatus**: PENDING, PARTIAL, PAID, REFUNDED, VOID
- **PurchaseOrderStatus**: DRAFT, SUBMITTED, APPROVED, ORDERED, PARTIALLY_RECEIVED, RECEIVED, CANCELLED
- **RentalOrderStatus**: DRAFT, CONFIRMED, IN_PROGRESS, COMPLETED, CANCELLED
- **MaintenanceStatus**: SCHEDULED, IN_PROGRESS, COMPLETED, CANCELLED
- **FinancialTransactionStatus**: PENDING, COMPLETED, CANCELLED, VOID
- **PayrollStatus**: PENDING, PROCESSED, PAID, CANCELLED
- **LeaveRequestStatus**: PENDING, APPROVED, REJECTED, CANCELLED
- **AttendanceStatus**: PRESENT, ABSENT, LATE, HALF_DAY, ON_LEAVE, HOLIDAY
- **CustomerStatus**: ACTIVE, INACTIVE, PROSPECT, LEAD
- **ContactStatus**: OPEN, IN_PROGRESS, COMPLETED, CANCELLED
- **SyncStatus**: PENDING, SYNCED, FAILED, CONFLICT

### Type Enums
- **InventoryTransactionType**: IN, OUT, ADJUSTMENT, TRANSFER
- **MaintenanceType**: PREVENTIVE, CORRECTIVE, EMERGENCY, INSPECTION
- **FinancialTransactionType**: SALE, PURCHASE, RENTAL_INCOME, MAINTENANCE_EXPENSE, SALARY_EXPENSE, UTILITY_EXPENSE, OTHER_INCOME, OTHER_EXPENSE
- **AccountType**: ASSET, LIABILITY, EQUITY, REVENUE, EXPENSE
- **Gender**: MALE, FEMALE, OTHER
- **MaritalStatus**: SINGLE, MARRIED, DIVORCED, WIDOWED
- **EmploymentStatus**: ACTIVE, INACTIVE, TERMINATED, ON_LEAVE
- **LeaveType**: ANNUAL_LEAVE, SICK_LEAVE, PERSONAL_LEAVE, MATERNITY_LEAVE, PATERNITY_LEAVE, UNPAID_LEAVE
- **CustomerType**: INDIVIDUAL, COMPANY, GOVERNMENT
- **ContactType**: PHONE_CALL, EMAIL, MEETING, VISIT, OTHER

## Key Features of the ERD

### 1. **Modular Design**
- Each business module (Inventory, Finance, HRMS, etc.) has its own set of related tables
- Clear separation of concerns while maintaining referential integrity

### 2. **Audit Trail**
- Comprehensive audit logging through the `AuditLog` table
- Tracking of all user actions with before/after values
- IP address and user agent tracking for security

### 3. **Role-Based Access Control**
- User roles and permissions stored in JSON format for flexibility
- Department-based access control
- Granular permissions per module

### 4. **Multi-Warehouse Support**
- Inventory items tracked per warehouse
- Warehouse-specific stock levels and transactions
- Support for distributed operations

### 5. **Equipment Management**
- Complete equipment lifecycle tracking
- Maintenance scheduling and history
- Rental order management
- Location and assignment tracking

### 6. **Financial Management**
- Chart of accounts with hierarchical structure
- Comprehensive transaction tracking
- Support for multiple payment methods
- Integration with external payment systems

### 7. **HRMS Features**
- Employee lifecycle management
- Attendance tracking with overtime calculation
- Leave request workflow
- Payroll processing with deductions

### 8. **CRM Capabilities**
- Customer master data management
- Contact history and follow-up tracking
- Lead and prospect management
- Credit limit and balance tracking

### 9. **Offline Sync Support**
- PouchDB/CouchDB integration for offline operations
- Conflict resolution and sync status tracking
- Device-specific sync logging

### 10. **Mining-Specific Features**
- Equipment tracking for heavy machinery
- Maintenance scheduling for mining equipment
- Safety compliance tracking
- Remote location support with offline capabilities

## Database Indexes and Performance

### Primary Keys
- All tables use UUID primary keys for scalability
- Unique constraints on business keys (order numbers, product codes, etc.)

### Foreign Key Indexes
- All foreign key relationships are properly indexed
- Composite unique constraints where needed

### Business Logic Constraints
- Inventory transactions maintain stock level integrity
- Financial transactions maintain account balance accuracy
- Order status transitions follow business rules

## Scalability Considerations

### Horizontal Scaling
- UUID primary keys support distributed databases
- Modular design allows for database sharding by module
- Offline sync supports disconnected operations

### Performance Optimization
- Proper indexing on frequently queried fields
- JSON fields for flexible data storage
- Efficient relationship queries with proper joins

### Data Integrity
- Referential integrity through foreign key constraints
- Business rule enforcement through application logic
- Audit trail for data change tracking

This ERD provides a comprehensive foundation for the NextGen ERP system, supporting all the business requirements for CA Mine while maintaining flexibility for future enhancements and scalability for growth.
