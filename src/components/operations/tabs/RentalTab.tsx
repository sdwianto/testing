'use client';

/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/no-unsafe-return */
/* eslint-disable @typescript-eslint/no-explicit-any */

import React, { useState, useCallback } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { trpc } from '@/lib/trpc';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Plus, Search, Eye, Edit, FileText, Clock, DollarSign } from 'lucide-react';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { LoadingSpinner } from '@/components/ui/loading-spinner';

// Rental Management Tab Component
export function RentalTab() {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showUsageDialog, setShowUsageDialog] = useState(false);
  const [selectedRental, setSelectedRental] = useState<{
    id: string;
    equipment: { code: string };
  } | null>(null);
  const queryClient = useQueryClient();

  // Type assertion for tRPC client
  const api = trpc as any;

  // Debounced search
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('');
  React.useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
    }, 300);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  // Fetch rentals with infinite query
  const {
    data: rentalsData,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
    error,
  } = api.rental.listRentals.useInfiniteQuery(
    {
      limit: 50,
      search: debouncedSearchTerm ?? undefined,
      status: statusFilter && statusFilter !== 'all' ? (statusFilter as 'ACTIVE' | 'COMPLETED' | 'CANCELLED' | 'SUSPENDED' | 'OVERDUE') : undefined,
    },
    {
      getNextPageParam: (lastPage: any) => lastPage?.nextCursor,
    }
  );

  // Get rental stats
  const { data: stats } = api.rental.getRentalStats.useQuery();

  // Create rental mutation
  const createRentalMutation = api.rental.createRental.useMutation({
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['rentals'] });
      void queryClient.invalidateQueries({ queryKey: ['rental-stats'] });
      setShowCreateDialog(false);
      toast.success('Rental created successfully');
    },
    onError: (error: any) => {
      toast.error(error.message ?? 'Failed to create rental');
    },
  });

  // Log usage mutation
  const logUsageMutation = api.rental.logRentalUsage.useMutation({
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['rentals'] });
      void queryClient.invalidateQueries({ queryKey: ['rental-usage'] });
      setShowUsageDialog(false);
      toast.success('Usage logged successfully');
    },
    onError: (error: any) => {
      toast.error(error.message ?? 'Failed to log usage');
    },
  });

  const rentals = rentalsData?.pages?.flatMap((page: any) => page.rentals) ?? [];

  const handleCreateRental = useCallback((formData: {
    equipmentId: string;
    customerId: string;
    startDate: string;
    endDate?: string;
    hourlyRate: number;
    dailyRate: number;
    weeklyRate: number;
    monthlyRate: number;
    pickupLocation?: string;
    returnLocation?: string;
    contractTerms?: string;
    insuranceRequired: boolean;
    insuranceAmount: number;
  }) => {
    createRentalMutation.mutate({
      ...formData,
      idempotencyKey: crypto.randomUUID(),
    });
  }, [createRentalMutation]);

  const handleLogUsage = useCallback((formData: {
    rentalId: string;
    usageDate: string;
    hoursUsed: number;
    loadUnits: number;
    operatorId?: string;
    location?: string;
    notes?: string;
  }) => {
    logUsageMutation.mutate({
      ...formData,
      idempotencyKey: crypto.randomUUID(),
    });
  }, [logUsageMutation]);

  const getStatusBadge = (status: string) => {
    const variants: Record<string, 'default' | 'secondary' | 'destructive' | 'outline'> = {
      ACTIVE: 'default',
      COMPLETED: 'secondary',
      CANCELLED: 'destructive',
      SUSPENDED: 'outline',
      OVERDUE: 'destructive',
    };
    return <Badge variant={variants[status] ?? 'outline'}>{status}</Badge>;
  };

  if (isLoading) return <LoadingSpinner />;
  if (error) return <div className="text-red-500">Error: {(error as Error).message}</div>;

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Rentals</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.totalRentals ?? 0}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Rentals</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.activeRentals ?? 0}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Completed</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.completedRentals ?? 0}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ${(stats?.totalRevenue ?? 0).toLocaleString()}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters and Actions */}
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
            <div className="flex flex-col sm:flex-row gap-4 flex-1">
              <div className="relative flex-1 max-w-sm">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Search rentals..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-full sm:w-48">
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="ACTIVE">Active</SelectItem>
                  <SelectItem value="COMPLETED">Completed</SelectItem>
                  <SelectItem value="CANCELLED">Cancelled</SelectItem>
                  <SelectItem value="SUSPENDED">Suspended</SelectItem>
                  <SelectItem value="OVERDUE">Overdue</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  New Rental
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>Create New Rental</DialogTitle>
                  <DialogDescription>
                    Create a new equipment rental contract
                  </DialogDescription>
                </DialogHeader>
                <CreateRentalDialog
                  onSubmit={handleCreateRental}
                  isLoading={createRentalMutation.isPending}
                />
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
      </Card>

      {/* Rentals Table */}
      <Card>
        <CardHeader>
          <CardTitle>Equipment Rentals</CardTitle>
          <CardDescription>
            Manage equipment rental contracts and track usage
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Rental #</TableHead>
                  <TableHead>Equipment</TableHead>
                  <TableHead>Customer</TableHead>
                  <TableHead>Period</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Total Amount</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {rentals.map((rental: any) => (
                  <TableRow key={rental.id}>
                    <TableCell className="font-medium">
                      {rental.rentalNumber}
                    </TableCell>
                    <TableCell>
                      <div>
                        <div className="font-medium">{rental.equipment.code}</div>
                        <div className="text-sm text-muted-foreground">
                          {rental.equipment.type}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div>
                        <div className="font-medium">{rental.customer.name}</div>
                        <div className="text-sm text-muted-foreground">
                          {rental.customer.companyName}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">
                        <div>{format(new Date(rental.startDate), 'MMM dd, yyyy')}</div>
                        {rental.endDate && (
                          <div className="text-muted-foreground">
                            to {format(new Date(rental.endDate), 'MMM dd, yyyy')}
                          </div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      {getStatusBadge(rental.status)}
                    </TableCell>
                    <TableCell>
                      ${rental.totalAmount.toLocaleString()}
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setSelectedRental(rental);
                            setShowUsageDialog(true);
                          }}
                        >
                          <Clock className="h-4 w-4" />
                        </Button>
                        <Button variant="outline" size="sm">
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button variant="outline" size="sm">
                          <Edit className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {/* Load More Button */}
          {hasNextPage && (
            <div className="flex justify-center mt-4">
              <Button
                variant="outline"
                onClick={() => fetchNextPage()}
                disabled={isFetchingNextPage}
              >
                {isFetchingNextPage ? 'Loading...' : 'Load More'}
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Usage Logging Dialog */}
      <Dialog open={showUsageDialog} onOpenChange={setShowUsageDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Log Equipment Usage</DialogTitle>
            <DialogDescription>
                             Record usage hours and load units for {selectedRental?.equipment.code}
            </DialogDescription>
          </DialogHeader>
          <LogUsageDialog
            rental={selectedRental}
            onSubmit={handleLogUsage}
            isLoading={logUsageMutation.isPending}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}

// Create Rental Dialog Component
function CreateRentalDialog({ onSubmit, isLoading }: { 
  onSubmit: (data: {
    equipmentId: string;
    customerId: string;
    startDate: string;
    endDate?: string;
    hourlyRate: number;
    dailyRate: number;
    weeklyRate: number;
    monthlyRate: number;
    pickupLocation?: string;
    returnLocation?: string;
    contractTerms?: string;
    insuranceRequired: boolean;
    insuranceAmount: number;
  }) => void; 
  isLoading: boolean 
}) {
  const [formData, setFormData] = useState({
    equipmentId: '',
    customerId: '',
    startDate: '',
    endDate: '',
    hourlyRate: 0,
    dailyRate: 0,
    weeklyRate: 0,
    monthlyRate: 0,
    pickupLocation: '',
    returnLocation: '',
    contractTerms: '',
    insuranceRequired: false,
    insuranceAmount: 0,
  });

  // Fetch equipment and customers for dropdowns
  const { data: equipment } = trpc.ops.listEquipment.useQuery({ limit: 100 });
  const { data: customers } = (trpc.core as any).listCustomers?.useQuery({ limit: 100 }) ?? { data: undefined };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="equipment">Equipment</Label>
          <Select
            value={formData.equipmentId}
            onValueChange={(value) => setFormData({ ...formData, equipmentId: value })}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select equipment" />
            </SelectTrigger>
            <SelectContent>
              {equipment?.equipment.map((eq: any) => (
                <SelectItem key={eq.id} value={eq.id}>
                  {eq.code} - {eq.type}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label htmlFor="customer">Customer</Label>
          <Select
            value={formData.customerId}
            onValueChange={(value) => setFormData({ ...formData, customerId: value })}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select customer" />
            </SelectTrigger>
            <SelectContent>
              {customers?.customers?.map((customer: any) => (
                <SelectItem key={customer.id} value={customer.id}>
                  {customer.name} - {customer.companyName}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="startDate">Start Date</Label>
          <Input
            id="startDate"
            type="datetime-local"
            value={formData.startDate}
            onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
            required
          />
        </div>
        <div>
          <Label htmlFor="endDate">End Date</Label>
          <Input
            id="endDate"
            type="datetime-local"
            value={formData.endDate}
            onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="hourlyRate">Hourly Rate</Label>
          <Input
            id="hourlyRate"
            type="number"
            step="0.01"
            value={formData.hourlyRate}
            onChange={(e) => setFormData({ ...formData, hourlyRate: parseFloat(e.target.value) || 0 })}
          />
        </div>
        <div>
          <Label htmlFor="dailyRate">Daily Rate</Label>
          <Input
            id="dailyRate"
            type="number"
            step="0.01"
            value={formData.dailyRate}
            onChange={(e) => setFormData({ ...formData, dailyRate: parseFloat(e.target.value) || 0 })}
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="pickupLocation">Pickup Location</Label>
          <Input
            id="pickupLocation"
            value={formData.pickupLocation}
            onChange={(e) => setFormData({ ...formData, pickupLocation: e.target.value })}
          />
        </div>
        <div>
          <Label htmlFor="returnLocation">Return Location</Label>
          <Input
            id="returnLocation"
            value={formData.returnLocation}
            onChange={(e) => setFormData({ ...formData, returnLocation: e.target.value })}
          />
        </div>
      </div>

      <div>
        <Label htmlFor="contractTerms">Contract Terms</Label>
        <Textarea
          id="contractTerms"
          value={formData.contractTerms}
          onChange={(e) => setFormData({ ...formData, contractTerms: e.target.value })}
          rows={3}
        />
      </div>

      <DialogFooter>
        <Button type="submit" disabled={isLoading}>
          {isLoading ? 'Creating...' : 'Create Rental'}
        </Button>
      </DialogFooter>
    </form>
  );
}

// Log Usage Dialog Component
function LogUsageDialog({ rental, onSubmit, isLoading }: { 
  rental: { id: string; equipment: { code: string } } | null; 
  onSubmit: (data: {
    rentalId: string;
    usageDate: string;
    hoursUsed: number;
    loadUnits: number;
    operatorId?: string;
    location?: string;
    notes?: string;
  }) => void; 
  isLoading: boolean 
}) {
  const [formData, setFormData] = useState({
    usageDate: new Date().toISOString().slice(0, 16),
    hoursUsed: 0,
    loadUnits: 0,
    operatorId: '',
    location: '',
    notes: '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      ...formData,
      rentalId: rental?.id ?? '',
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Label htmlFor="usageDate">Usage Date</Label>
        <Input
          id="usageDate"
          type="datetime-local"
          value={formData.usageDate}
          onChange={(e) => setFormData({ ...formData, usageDate: e.target.value })}
          required
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="hoursUsed">Hours Used</Label>
          <Input
            id="hoursUsed"
            type="number"
            step="0.1"
            value={formData.hoursUsed}
            onChange={(e) => setFormData({ ...formData, hoursUsed: parseFloat(e.target.value) || 0 })}
            required
          />
        </div>
        <div>
          <Label htmlFor="loadUnits">Load Units</Label>
          <Input
            id="loadUnits"
            type="number"
            step="0.1"
            value={formData.loadUnits}
            onChange={(e) => setFormData({ ...formData, loadUnits: parseFloat(e.target.value) || 0 })}
          />
        </div>
      </div>

      <div>
        <Label htmlFor="location">Location</Label>
        <Input
          id="location"
          value={formData.location}
          onChange={(e) => setFormData({ ...formData, location: e.target.value })}
        />
      </div>

      <div>
        <Label htmlFor="notes">Notes</Label>
        <Textarea
          id="notes"
          value={formData.notes}
          onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
          rows={3}
        />
      </div>

      <DialogFooter>
        <Button type="submit" disabled={isLoading}>
          {isLoading ? 'Logging...' : 'Log Usage'}
        </Button>
      </DialogFooter>
    </form>
  );
}
