'use client';

/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/prefer-nullish-coalescing */

import { useState, useEffect, useMemo } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Plus, Edit, Trash2, Search, Calendar, Clock, AlertTriangle } from 'lucide-react';
import { trpc } from '@/lib/trpc';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { LoadingSpinner } from '@/components/ui/loading-spinner';

// ========================================
// SERVICE INTERVALS MANAGEMENT COMPONENT
// Maintenance Scheduling & Frequency Management
// ========================================

const serviceIntervalSchema = z.object({
  equipmentId: z.string().min(1, 'Equipment is required'),
  serviceType: z.string().min(1, 'Service Type is required'),
  frequencyValue: z.number().min(1, 'Frequency Value must be at least 1'),
  frequencyUnit: z.enum(['HOURS', 'DAYS', 'WEEKS', 'MONTHS', 'YEARS']).default('HOURS'),
  lastServiceDate: z.string().optional(),
  nextServiceDate: z.string().optional(),
  estimatedDuration: z.number().min(0, 'Estimated Duration must be non-negative').optional(),
  estimatedCost: z.number().min(0, 'Estimated Cost must be non-negative').optional(),
  isActive: z.boolean().default(true),
  notes: z.string().optional(),
});

type ServiceIntervalFormData = z.infer<typeof serviceIntervalSchema>;

export function ServiceIntervalsManagement() {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingInterval, setEditingInterval] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [unitFilter, setUnitFilter] = useState<string>('all');

  const { register, handleSubmit, formState: { errors }, setValue, reset } = useForm<ServiceIntervalFormData>({
    resolver: zodResolver(serviceIntervalSchema),
    defaultValues: {
      equipmentId: '',
      serviceType: '',
      frequencyValue: 1,
      frequencyUnit: 'HOURS',
      lastServiceDate: '',
      nextServiceDate: '',
      estimatedDuration: 0,
      estimatedCost: 0,
      isActive: true,
      notes: '',
    },
  });

  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('');
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
    }, 300);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  const { data: serviceIntervals, isLoading, refetch } = (trpc.ops.listServiceIntervals as any).useQuery({
    limit: 50,
    search: debouncedSearchTerm.length >= 2 ? debouncedSearchTerm : undefined,
    frequencyUnit: unitFilter === 'all' ? undefined : unitFilter,
  });

  const { data: equipment } = (trpc.ops.listEquipment as any).useQuery({ limit: 1000 });

  const createServiceInterval = (trpc.ops.createServiceInterval as any).useMutation({
    onSuccess: () => {
      toast.success('Service interval created successfully');
      reset();
      setIsFormOpen(false);
      void refetch();
    },
    onError: (error: any) => {
      toast.error(`Failed to create service interval: ${error.message}`);
    },
  });

  const updateServiceInterval = (trpc.ops.updateServiceInterval as any).useMutation({
    onSuccess: () => {
      toast.success('Service interval updated successfully');
      reset();
      setIsFormOpen(false);
      setEditingInterval(null);
      void refetch();
    },
    onError: (error: any) => {
      toast.error(`Failed to update service interval: ${error.message}`);
    },
  });

  const deleteServiceInterval = (trpc.ops.deleteServiceInterval as any).useMutation({
    onSuccess: () => {
      toast.success('Service interval deleted successfully');
      void refetch();
    },
    onError: (error: any) => {
      toast.error(`Failed to delete service interval: ${error.message}`);
    },
  });

  const onSubmit = async (data: ServiceIntervalFormData) => {
    if (editingInterval) {
      await updateServiceInterval.mutateAsync({
        id: editingInterval,
        ...data,
        lastServiceDate: data.lastServiceDate ? new Date(data.lastServiceDate).toISOString() : undefined,
        nextServiceDate: data.nextServiceDate ? new Date(data.nextServiceDate).toISOString() : undefined,
        idempotencyKey: crypto.randomUUID(),
      });
    } else {
      await createServiceInterval.mutateAsync({
        ...data,
        lastServiceDate: data.lastServiceDate ? new Date(data.lastServiceDate).toISOString() : undefined,
        nextServiceDate: data.nextServiceDate ? new Date(data.nextServiceDate).toISOString() : undefined,
        idempotencyKey: crypto.randomUUID(),
      });
    }
  };

  const handleEdit = (interval: any) => {
    setEditingInterval(interval.id);
    setValue('equipmentId', interval.equipmentId);
    setValue('serviceType', interval.serviceType);
    setValue('frequencyValue', interval.frequencyValue);
    setValue('frequencyUnit', interval.frequencyUnit);
    setValue('lastServiceDate', interval.lastServiceDate ? format(new Date(interval.lastServiceDate), 'yyyy-MM-dd') : '');
    setValue('nextServiceDate', interval.nextServiceDate ? format(new Date(interval.nextServiceDate), 'yyyy-MM-dd') : '');
    setValue('estimatedDuration', interval.estimatedDuration || 0);
    setValue('estimatedCost', interval.estimatedCost || 0);
    setValue('isActive', interval.isActive);
    setValue('notes', interval.notes || '');
    setIsFormOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this service interval?')) {
      await deleteServiceInterval.mutateAsync({
        id,
        idempotencyKey: crypto.randomUUID(),
      });
    }
  };

  const allIntervals = useMemo(() => {
    return serviceIntervals?.serviceIntervals || [];
  }, [serviceIntervals]) as any[];

  const getUnitBadge = (unit: string) => {
    switch (unit) {
      case 'HOURS':
        return <Badge className="bg-blue-500 hover:bg-blue-600">Hours</Badge>;
      case 'DAYS':
        return <Badge className="bg-green-500 hover:bg-green-600">Days</Badge>;
      case 'WEEKS':
        return <Badge className="bg-yellow-500 hover:bg-yellow-600">Weeks</Badge>;
      case 'MONTHS':
        return <Badge className="bg-orange-500 hover:bg-orange-600">Months</Badge>;
      case 'YEARS':
        return <Badge className="bg-purple-500 hover:bg-purple-600">Years</Badge>;
      default:
        return <Badge variant="outline">{unit}</Badge>;
    }
  };

  const isOverdue = (nextServiceDate: string) => {
    return new Date(nextServiceDate) < new Date();
  };

  const isDueSoon = (nextServiceDate: string) => {
    const nextDate = new Date(nextServiceDate);
    const today = new Date();
    const diffDays = Math.ceil((nextDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    return diffDays <= 7 && diffDays >= 0;
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Service Intervals Management</h2>
          <p className="text-gray-600">Manage maintenance schedules and service frequency for equipment</p>
        </div>
        <Button onClick={() => setIsFormOpen(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Add Service Interval
        </Button>
      </div>

      <Card>
        <CardContent className="pt-6">
          <div className="flex gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Search service intervals (min 2 chars)..."
                  value={searchTerm}
                  onChange={(e: any) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <Select value={unitFilter} onValueChange={setUnitFilter}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Filter by unit" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Units</SelectItem>
                <SelectItem value="HOURS">Hours</SelectItem>
                <SelectItem value="DAYS">Days</SelectItem>
                <SelectItem value="WEEKS">Weeks</SelectItem>
                <SelectItem value="MONTHS">Months</SelectItem>
                <SelectItem value="YEARS">Years</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Service Intervals ({allIntervals.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Equipment</TableHead>
                <TableHead>Service Type</TableHead>
                <TableHead>Frequency</TableHead>
                <TableHead>Last Service</TableHead>
                <TableHead>Next Service</TableHead>
                <TableHead>Est. Duration</TableHead>
                <TableHead>Est. Cost</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {allIntervals.map((interval: any) => (
                <TableRow key={interval.id}>
                  <TableCell className="font-medium">{interval.equipment?.code}</TableCell>
                  <TableCell>{interval.serviceType}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4 text-muted-foreground" />
                      <span>{interval.frequencyValue} {interval.frequencyUnit.toLowerCase()}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    {interval.lastServiceDate ? format(new Date(interval.lastServiceDate), 'MMM dd, yyyy') : 'N/A'}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      <span className={isOverdue(interval.nextServiceDate) ? 'text-red-600 font-medium' : isDueSoon(interval.nextServiceDate) ? 'text-yellow-600 font-medium' : ''}>
                        {interval.nextServiceDate ? format(new Date(interval.nextServiceDate), 'MMM dd, yyyy') : 'N/A'}
                      </span>
                      {isOverdue(interval.nextServiceDate) && (
                        <AlertTriangle className="h-4 w-4 text-red-500" />
                      )}
                    </div>
                  </TableCell>
                  <TableCell>{interval.estimatedDuration ? `${interval.estimatedDuration}h` : 'N/A'}</TableCell>
                  <TableCell>{interval.estimatedCost ? `$${Number(interval.estimatedCost).toLocaleString()}` : 'N/A'}</TableCell>
                  <TableCell>
                    <Badge variant={interval.isActive ? 'default' : 'secondary'}>
                      {interval.isActive ? 'Active' : 'Inactive'}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm" onClick={() => handleEdit(interval)}>
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button variant="outline" size="sm" onClick={() => handleDelete(interval.id)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {isFormOpen && (
        <Card>
          <CardHeader>
            <CardTitle>{editingInterval ? 'Edit Service Interval' : 'Create New Service Interval'}</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="equipmentId">Equipment *</Label>
                  <Select onValueChange={(value: any) => setValue('equipmentId', value)} value={register('equipmentId').value}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select Equipment" />
                    </SelectTrigger>
                    <SelectContent>
                      {equipment?.equipment?.map((eq: any) => (
                        <SelectItem key={eq.id} value={eq.id}>
                          {eq.code} - {eq.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {errors.equipmentId && (
                    <p className="text-sm text-red-600">{errors.equipmentId.message}</p>
                  )}
                </div>

                <div>
                  <Label htmlFor="serviceType">Service Type *</Label>
                  <Input
                    id="serviceType"
                    {...register('serviceType')}
                    placeholder="e.g., Oil Change, Inspection"
                  />
                  {errors.serviceType && (
                    <p className="text-sm text-red-600">{errors.serviceType.message}</p>
                  )}
                </div>

                <div>
                  <Label htmlFor="frequencyValue">Frequency Value *</Label>
                  <Input
                    id="frequencyValue"
                    type="number"
                    {...register('frequencyValue', { valueAsNumber: true })}
                    placeholder="100"
                  />
                  {errors.frequencyValue && (
                    <p className="text-sm text-red-600">{errors.frequencyValue.message}</p>
                  )}
                </div>

                <div>
                  <Label htmlFor="frequencyUnit">Frequency Unit *</Label>
                  <Select onValueChange={(value: any) => setValue('frequencyUnit', value)} value={register('frequencyUnit').value}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select Unit" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="HOURS">Hours</SelectItem>
                      <SelectItem value="DAYS">Days</SelectItem>
                      <SelectItem value="WEEKS">Weeks</SelectItem>
                      <SelectItem value="MONTHS">Months</SelectItem>
                      <SelectItem value="YEARS">Years</SelectItem>
                    </SelectContent>
                  </Select>
                  {errors.frequencyUnit && (
                    <p className="text-sm text-red-600">{errors.frequencyUnit.message}</p>
                  )}
                </div>

                <div>
                  <Label htmlFor="lastServiceDate">Last Service Date</Label>
                  <Input
                    id="lastServiceDate"
                    type="date"
                    {...register('lastServiceDate')}
                  />
                  {errors.lastServiceDate && (
                    <p className="text-sm text-red-600">{errors.lastServiceDate.message}</p>
                  )}
                </div>

                <div>
                  <Label htmlFor="nextServiceDate">Next Service Date</Label>
                  <Input
                    id="nextServiceDate"
                    type="date"
                    {...register('nextServiceDate')}
                  />
                  {errors.nextServiceDate && (
                    <p className="text-sm text-red-600">{errors.nextServiceDate.message}</p>
                  )}
                </div>

                <div>
                  <Label htmlFor="estimatedDuration">Estimated Duration (hours)</Label>
                  <Input
                    id="estimatedDuration"
                    type="number"
                    step="0.1"
                    {...register('estimatedDuration', { valueAsNumber: true })}
                    placeholder="2.0"
                  />
                  {errors.estimatedDuration && (
                    <p className="text-sm text-red-600">{errors.estimatedDuration.message}</p>
                  )}
                </div>

                <div>
                  <Label htmlFor="estimatedCost">Estimated Cost</Label>
                  <Input
                    id="estimatedCost"
                    type="number"
                    step="0.01"
                    {...register('estimatedCost', { valueAsNumber: true })}
                    placeholder="0.00"
                  />
                  {errors.estimatedCost && (
                    <p className="text-sm text-red-600">{errors.estimatedCost.message}</p>
                  )}
                </div>

                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="isActive"
                    {...register('isActive')}
                    className="rounded border-gray-300"
                  />
                  <Label htmlFor="isActive">Active Interval</Label>
                </div>

                <div className="md:col-span-2">
                  <Label htmlFor="notes">Notes</Label>
                  <Textarea
                    id="notes"
                    {...register('notes')}
                    placeholder="Any additional notes or special requirements..."
                  />
                </div>
              </div>

              <div className="flex gap-2 pt-4">
                <Button type="submit" disabled={createServiceInterval.isPending || updateServiceInterval.isPending}>
                  {editingInterval ? 'Update Interval' : 'Create Interval'}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setIsFormOpen(false);
                    setEditingInterval(null);
                    reset();
                  }}
                >
                  Cancel
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
