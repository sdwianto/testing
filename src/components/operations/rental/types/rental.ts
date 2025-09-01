// ========================================
// RENTAL TYPES - Type definitions for rental module
// Follows project rules: TypeScript strict, proper type safety
// ========================================

export interface RentalContract {
  id: string;
  tenantId: string;
  rentalNumber: string;
  customerId: string;
  equipmentId: string;
  status: 'ACTIVE' | 'COMPLETED' | 'CANCELLED' | 'SUSPENDED' | 'OVERDUE';
  startDate: string;
  endDate?: string;
  dailyRate: number;
  hourlyRate: number;
  contractTerms?: string;
  createdAt: string;
  updatedAt: string;
  
  // Relations
  equipment?: {
    id: string;
    code: string;
    type: string;
    description?: string;
  };
  customer?: {
    id: string;
    customerNumber: string;
    name: string;
    companyName?: string;
  };
  rentalBills?: RentalBill[];
}

export interface RentalBill {
  id: string;
  billNumber: string;
  status: 'draft' | 'approved' | 'posted' | 'paid';
  totalAmount: number;
  balanceDue: number;
  dueDate?: string;
  createdAt: string;
}

export interface RentalUsage {
  id: string;
  equipmentId: string;
  customerId: string;
  shiftDate: string;
  hoursUsed: number;
  rentalRate: number;
  totalAmount: number;
  status: 'recorded' | 'billed' | 'invoiced';
}

export interface RentalMetrics {
  totalActiveRentals: number;
  totalRevenue: number;
  equipmentUtilization: number;
  averageRentalDuration: number;
  overdueRentals: number;
  pendingPayments: number;
}

export interface RentalFormData {
  customerId: string;
  equipmentId: string;
  startDate: string;
  endDate?: string;
  dailyRate: number;
  hourlyRate: number;
  contractTerms?: string;
}
