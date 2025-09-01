'use client';

// Performance Rules: FP6 Data fetching optimization, FP1 Server Components preference
import { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { DataTable } from '@/components/ui/data-table';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { 
  Plus, 
  Edit,
  Trash2,
  Calendar,
  DollarSign,
  User,
  Package
} from 'lucide-react';
import { trpc } from '@/lib/trpc';
import { format } from 'date-fns';
import type { RentalContract } from './types/rental';
import { RentalForm } from './RentalForm';

// ========================================
// RENTAL MANAGEMENT - Contract & Agreement Management
// Follows performance rules and project standards
// ========================================

interface RentalManagementProps {
  onCreateContract?: () => void;
  onEditContract?: (contract: RentalContract) => void;
}

export function RentalManagement({ 
  onCreateContract,
  onEditContract 
}: RentalManagementProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [showRentalForm, setShowRentalForm] = useState(false);
  const [editingRental, setEditingRental] = useState<RentalContract | null>(null);

  // FP6: Efficient data fetching with React Query
  const { 
    data: contractsData, 
    isLoading: contractsLoading,
    refetch: refetchContracts
  } = trpc.rental.listRentals.useQuery({
    limit: 100,
    search: searchTerm || undefined,
    status: (statusFilter as any) || undefined,
  }, {
    staleTime: 30 * 1000, // FP7: Reduce unnecessary requests
  });

  const { data: equipmentData } = trpc.ops.listEquipment.useQuery({
    limit: 1000
  }, {
    staleTime: 5 * 60 * 1000, // FP7: Equipment master data is relatively stable
  });

  // FP6: Memoize processed data to avoid re-computation
  const processedContracts = useMemo(() => {
    if (!contractsData?.rentals) return [];
    
    return contractsData.rentals.map((contract: RentalContract) => ({
      id: contract.id,
      rentalNumber: contract.rentalNumber,
      equipment: {
        code: contract.equipment?.code || 'N/A',
        type: contract.equipment?.type || 'Unknown'
      },
      customer: {
        name: contract.customer?.name || 'Unknown',
        company: contract.customer?.companyName || ''
      },
      status: contract.status,
      startDate: contract.startDate,
      endDate: contract.endDate,
      dailyRate: contract.dailyRate,
      hourlyRate: contract.hourlyRate,
      totalBilled: contract.rentalBills?.reduce((sum, bill) => sum + bill.totalAmount, 0) || 0,
      contractTerms: contract.contractTerms,
      createdAt: contract.createdAt,
    }));
  }, [contractsData?.rentals]);

  // FP6: Memoize table columns
  const columns = useMemo(() => [
    {
      accessorKey: 'rentalNumber',
      header: 'Contract #',
      cell: ({ row }: any) => (
        <div className="font-medium">{row.getValue('rentalNumber')}</div>
      ),
    },
    {
      accessorKey: 'equipment',
      header: 'Equipment',
      cell: ({ row }: any) => {
        const equipment = row.getValue('equipment') as { code: string; type: string };
        return (
          <div>
            <div className="font-medium">{equipment.code}</div>
            <div className="text-sm text-muted-foreground">{equipment.type}</div>
          </div>
        );
      },
    },
    {
      accessorKey: 'customer',
      header: 'Customer',
      cell: ({ row }: any) => {
        const customer = row.getValue('customer') as { name: string; company: string };
        return (
          <div>
            <div className="font-medium">{customer.name}</div>
            {customer.company && (
              <div className="text-sm text-muted-foreground">{customer.company}</div>
            )}
          </div>
        );
      },
    },
    {
      accessorKey: 'status',
      header: 'Status',
      cell: ({ row }: any) => {
        const status = row.getValue('status') as string;
        const variants: Record<string, 'default' | 'secondary' | 'destructive' | 'outline'> = {
          'ACTIVE': 'default',
          'COMPLETED': 'secondary',
          'CANCELLED': 'destructive',
          'SUSPENDED': 'outline',
          'OVERDUE': 'destructive'
        };
        
        return (
          <Badge variant={variants[status] || 'secondary'}>
            {status}
          </Badge>
        );
      },
    },
    {
      accessorKey: 'startDate',
      header: 'Start Date',
      cell: ({ row }: any) => {
        const date = row.getValue('startDate') as string;
        return format(new Date(date), 'MMM dd, yyyy');
      },
    },
    {
      accessorKey: 'dailyRate',
      header: 'Daily Rate',
      cell: ({ row }: any) => {
        const rate = row.getValue('dailyRate') as number;
        return new Intl.NumberFormat('en-US', { 
          style: 'currency', 
          currency: 'USD' 
        }).format(rate);
      },
    },
    {
      accessorKey: 'totalBilled',
      header: 'Total Billed',
      cell: ({ row }: any) => {
        const amount = row.getValue('totalBilled') as number;
        return new Intl.NumberFormat('en-US', { 
          style: 'currency', 
          currency: 'USD' 
        }).format(amount);
      },
    },
    {
      id: 'actions',
      header: 'Actions',
      cell: ({ row }: any) => {
        const contract = row.original;
        
        return (
          <div className="flex items-center gap-2">
            <Button
              size="sm"
              variant="ghost"
              onClick={() => {
                setEditingRental(contract);
                setShowRentalForm(true);
              }}
            >
              <Edit className="h-4 w-4" />
            </Button>
            <Button
              size="sm"
              variant="ghost"
              className="text-destructive hover:text-destructive"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        );
      },
    },
  ], [onEditContract]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h2 className="text-2xl font-bold">Rental Contracts</h2>
          <p className="text-muted-foreground">Manage rental agreements and terms</p>
        </div>
        <div className="flex gap-2">
          <Button size="sm" onClick={() => setShowRentalForm(true)}>
            <Plus className="h-4 w-4 mr-2" />
            New Contract
          </Button>
        </div>
      </div>

      {/* Quick Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center">
              <Package className="h-4 w-4 text-blue-500" />
              <div className="ml-2">
                <p className="text-sm font-medium text-muted-foreground">Active Contracts</p>
                <p className="text-2xl font-bold text-blue-600">
                  {processedContracts.filter(c => c.status === 'ACTIVE').length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center">
              <Calendar className="h-4 w-4 text-green-500" />
              <div className="ml-2">
                <p className="text-sm font-medium text-muted-foreground">Total Contracts</p>
                <p className="text-2xl font-bold text-green-600">
                  {processedContracts.length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center">
              <DollarSign className="h-4 w-4 text-purple-500" />
              <div className="ml-2">
                <p className="text-sm font-medium text-muted-foreground">Total Value</p>
                <p className="text-2xl font-bold text-purple-600">
                  {new Intl.NumberFormat('en-US', { 
                    style: 'currency', 
                    currency: 'USD',
                    minimumFractionDigits: 0
                  }).format(
                    processedContracts.reduce((sum, c) => sum + c.totalBilled, 0)
                  )}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center">
              <User className="h-4 w-4 text-orange-500" />
              <div className="ml-2">
                <p className="text-sm font-medium text-muted-foreground">Unique Customers</p>
                <p className="text-2xl font-bold text-orange-600">
                  {new Set(processedContracts.map(c => c.customer.name)).size}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Contracts Table */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Rental Contracts</CardTitle>
            <div className="flex items-center gap-2">
              <Input
                type="text"
                placeholder="Search contracts..."
                className="w-64"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {contractsLoading ? (
            <div className="flex items-center justify-center h-32">
              <LoadingSpinner />
            </div>
          ) : (
            <DataTable
              columns={columns}
              data={processedContracts}
              // FP6: Pagination for better performance
              pagination={{
                pageSize: 20,
                showSizeChanger: true,
              }}
            />
          )}
        </CardContent>
      </Card>

      {/* Rental Form Dialog */}
      <RentalForm
        isOpen={showRentalForm}
        onClose={() => {
          setShowRentalForm(false);
          setEditingRental(null);
        }}
        onSuccess={() => {
          refetchContracts();
        }}
        editingRental={editingRental}
      />
    </div>
  );
}
