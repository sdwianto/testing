'use client';

// Performance Rules: FP1 Server Components when possible, FP3 Dynamic imports, FP6 Data fetching optimization
import { useState, useMemo, Suspense } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { DataTable } from '@/components/ui/data-table';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { RentalMetricsCards } from './components/RentalMetricsCards';
import { 
  Plus, 
  RefreshCw, 
  Download,
  Calendar,
  Filter,
  Search
} from 'lucide-react';
import { trpc } from '@/lib/trpc';
import { format } from 'date-fns';
import type { RentalContract } from './types/rental';
import { RentalForm } from './RentalForm';

// ========================================
// RENTAL DASHBOARD - Performance Optimized
// Follows all frontend performance rules
// ========================================

interface RentalDashboardProps {
  onCreateRental?: () => void;
}

export function RentalDashboard({ onCreateRental }: RentalDashboardProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [showRentalForm, setShowRentalForm] = useState(false);
  
  // FP6: React Query for efficient data fetching with staleTime
  const { 
    data: rentalsData, 
    isLoading: rentalsLoading,
    refetch: refetchRentals
  } = trpc.rental.listRentals.useQuery({
    limit: 50,
    search: searchTerm || undefined,
    status: (statusFilter as any) || undefined,
  }, {
    staleTime: 30 * 1000, // FP7: 30s stale time to reduce requests
  });

  const { 
    data: metricsData, 
    isLoading: metricsLoading 
  } = trpc.rental.getRentalMetrics.useQuery(undefined, {
    staleTime: 60 * 1000, // FP7: 1min stale time for metrics
  });

  // FP6: Memoize expensive computations
  const processedRentals = useMemo(() => {
    if (!rentalsData?.rentals) return [];
    
    return rentalsData.rentals.map((rental: RentalContract) => ({
      id: rental.id,
      rentalNumber: rental.rentalNumber,
      equipment: rental.equipment?.code || 'N/A',
      customer: rental.customer?.name || 'Unknown',
      status: rental.status,
      startDate: format(new Date(rental.startDate), 'MMM dd, yyyy'),
      dailyRate: new Intl.NumberFormat('en-US', { 
        style: 'currency', 
        currency: 'USD' 
      }).format(rental.dailyRate),
      totalBilled: rental.rentalBills?.reduce((sum, bill) => sum + bill.totalAmount, 0) || 0,
    }));
  }, [rentalsData?.rentals]);

  // FP6: Memoize table columns to prevent re-renders
  const columns = useMemo(() => [
    {
      accessorKey: 'rentalNumber',
      header: 'Rental #',
      cell: ({ row }: any) => (
        <div className="font-medium">{row.getValue('rentalNumber')}</div>
      ),
    },
    {
      accessorKey: 'equipment',
      header: 'Equipment',
      cell: ({ row }: any) => (
        <div className="font-medium">{row.getValue('equipment')}</div>
      ),
    },
    {
      accessorKey: 'customer',
      header: 'Customer',
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
    },
    {
      accessorKey: 'dailyRate',
      header: 'Daily Rate',
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
  ], []);

  // Remove defaultMetrics - use real data or loading state

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h2 className="text-2xl font-bold">Rental Dashboard</h2>
          <p className="text-muted-foreground">Monitor active rentals and revenue performance</p>
        </div>
        <div className="flex gap-2">
          <Button 
            size="sm" 
            variant="outline"
            onClick={() => refetchRentals()}
            disabled={rentalsLoading}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${rentalsLoading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          <Button size="sm" variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
          <Button size="sm" onClick={() => setShowRentalForm(true)}>
            <Plus className="h-4 w-4 mr-2" />
            New Rental
          </Button>
        </div>
      </div>

      {/* Key Metrics - Suspense boundary for better UX */}
      <Suspense fallback={<div className="h-32 animate-pulse bg-muted rounded" />}>
                <RentalMetricsCards 
          metrics={metricsData} 
          isLoading={metricsLoading} 
        />
      </Suspense>

      {/* Active Rentals Table */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Active Rentals</CardTitle>
            <div className="flex items-center gap-2">
              <div className="relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <input
                  type="text"
                  placeholder="Search rentals..."
                  className="pl-8 pr-4 py-2 border border-input bg-background rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <Button size="sm" variant="outline">
                <Filter className="h-4 w-4 mr-2" />
                Filter
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {rentalsLoading ? (
            <div className="flex items-center justify-center h-32">
              <LoadingSpinner />
            </div>
          ) : (
            <DataTable
              columns={columns}
              data={processedRentals}
              // FP6: Enable pagination for large datasets
              pagination={{
                pageSize: 10,
                showSizeChanger: true,
              }}
            />
          )}
        </CardContent>
      </Card>

      {/* Rental Form Dialog */}
      <RentalForm
        isOpen={showRentalForm}
        onClose={() => setShowRentalForm(false)}
        onSuccess={() => {
          refetchRentals();
        }}
      />
    </div>
  );
}
