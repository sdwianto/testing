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
import { Plus, Edit, Trash2, Search, TrendingUp, Clock } from 'lucide-react';
import { trpc } from '@/lib/trpc';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { LoadingSpinner } from '@/components/ui/loading-spinner';

// ========================================
// WORK ORDER PROGRESS MANAGEMENT COMPONENT
// Maintenance Percent Complete Tracking
// ========================================

const workOrderProgressSchema = z.object({
  workOrderId: z.string().min(1, 'Work Order is required'),
  progressPercentage: z.number().min(0).max(100, 'Progress must be between 0 and 100'),
  actualStartDate: z.string().optional(),
  actualEndDate: z.string().optional(),
  actualHours: z.number().min(0, 'Actual Hours must be non-negative').optional(),
  actualCost: z.number().min(0, 'Actual Cost must be non-negative').optional(),
  status: z.enum(['NOT_STARTED', 'IN_PROGRESS', 'COMPLETED', 'ON_HOLD', 'CANCELLED']).default('NOT_STARTED'),
  notes: z.string().optional(),
});

type WorkOrderProgressFormData = z.infer<typeof workOrderProgressSchema>;

export function WorkOrderProgressManagement() {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingProgress, setEditingProgress] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  const { register, handleSubmit, formState: { errors }, setValue, reset } = useForm<WorkOrderProgressFormData>({
    resolver: zodResolver(workOrderProgressSchema),
    defaultValues: {
      workOrderId: '',
      progressPercentage: 0,
      actualStartDate: '',
      actualEndDate: '',
      actualHours: 0,
      actualCost: 0,
      status: 'NOT_STARTED',
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

  const { data: workOrderProgress, isLoading, refetch } = (trpc.ops.listWorkOrderProgress as any).useQuery({
    limit: 50,
    search: debouncedSearchTerm.length >= 2 ? debouncedSearchTerm : undefined,
    status: statusFilter === 'all' ? undefined : statusFilter,
  });

  const { data: workOrders } = (trpc.ops.listWorkOrders as any).useQuery({ limit: 1000 });

  const createWorkOrderProgress = (trpc.ops.createWorkOrderProgress as any).useMutation({
    onSuccess: () => {
      toast.success('Work order progress created successfully');
      reset();
      setIsFormOpen(false);
      void refetch();
    },
    onError: (error: any) => {
      toast.error(`Failed to create work order progress: ${error.message}`);
    },
  });

  const updateWorkOrderProgress = (trpc.ops.updateWorkOrderProgress as any).useMutation({
    onSuccess: () => {
      toast.success('Work order progress updated successfully');
      reset();
      setIsFormOpen(false);
      setEditingProgress(null);
      void refetch();
    },
    onError: (error: any) => {
      toast.error(`Failed to update work order progress: ${error.message}`);
    },
  });

  const deleteWorkOrderProgress = (trpc.ops.deleteWorkOrderProgress as any).useMutation({
    onSuccess: () => {
      toast.success('Work order progress deleted successfully');
      void refetch();
    },
    onError: (error: any) => {
      toast.error(`Failed to delete work order progress: ${error.message}`);
    },
  });

  const onSubmit = async (data: WorkOrderProgressFormData) => {
    if (editingProgress) {
      await updateWorkOrderProgress.mutateAsync({
        id: editingProgress,
        ...data,
        actualStartDate: data.actualStartDate ? new Date(data.actualStartDate).toISOString() : undefined,
        actualEndDate: data.actualEndDate ? new Date(data.actualEndDate).toISOString() : undefined,
        idempotencyKey: crypto.randomUUID(),
      });
    } else {
      await createWorkOrderProgress.mutateAsync({
        ...data,
        actualStartDate: data.actualStartDate ? new Date(data.actualStartDate).toISOString() : undefined,
        actualEndDate: data.actualEndDate ? new Date(data.actualEndDate).toISOString() : undefined,
        idempotencyKey: crypto.randomUUID(),
      });
    }
  };

  const handleEdit = (progress: any) => {
    setEditingProgress(progress.id);
    setValue('workOrderId', progress.workOrderId);
    setValue('progressPercentage', progress.progressPercentage);
    setValue('actualStartDate', progress.actualStartDate ? format(new Date(progress.actualStartDate), 'yyyy-MM-dd') : '');
    setValue('actualEndDate', progress.actualEndDate ? format(new Date(progress.actualEndDate), 'yyyy-MM-dd') : '');
    setValue('actualHours', progress.actualHours || 0);
    setValue('actualCost', progress.actualCost || 0);
    setValue('status', progress.status);
    setValue('notes', progress.notes || '');
    setIsFormOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this work order progress?')) {
      await deleteWorkOrderProgress.mutateAsync({
        id,
        idempotencyKey: crypto.randomUUID(),
      });
    }
  };

  const allProgress = useMemo(() => {
    return workOrderProgress?.workOrderProgress || [];
  }, [workOrderProgress]) as any[];

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'COMPLETED':
        return <Badge className="bg-green-500 hover:bg-green-600">Completed</Badge>;
      case 'IN_PROGRESS':
        return <Badge className="bg-blue-500 hover:bg-blue-600">In Progress</Badge>;
      case 'ON_HOLD':
        return <Badge className="bg-yellow-500 hover:bg-yellow-600">On Hold</Badge>;
      case 'CANCELLED':
        return <Badge variant="destructive">Cancelled</Badge>;
      case 'NOT_STARTED':
        return <Badge variant="secondary">Not Started</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getProgressColor = (percentage: number) => {
    if (percentage >= 100) return 'bg-green-500';
    if (percentage >= 75) return 'bg-blue-500';
    if (percentage >= 50) return 'bg-yellow-500';
    if (percentage >= 25) return 'bg-orange-500';
    return 'bg-red-500';
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
          <h2 className="text-2xl font-bold text-gray-900">Work Order Progress Management</h2>
          <p className="text-gray-600">Track maintenance percent complete and actual vs. estimated metrics</p>
        </div>
        <Button onClick={() => setIsFormOpen(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Add Progress Entry
        </Button>
      </div>

      <Card>
        <CardContent className="pt-6">
          <div className="flex gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Search progress entries (min 2 chars)..."
                  value={searchTerm}
                  onChange={(e: any) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="NOT_STARTED">Not Started</SelectItem>
                <SelectItem value="IN_PROGRESS">In Progress</SelectItem>
                <SelectItem value="COMPLETED">Completed</SelectItem>
                <SelectItem value="ON_HOLD">On Hold</SelectItem>
                <SelectItem value="CANCELLED">Cancelled</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Work Order Progress ({allProgress.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Work Order</TableHead>
                <TableHead>Progress</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Start Date</TableHead>
                <TableHead>End Date</TableHead>
                <TableHead>Actual Hours</TableHead>
                <TableHead>Actual Cost</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {allProgress.map((progress: any) => (
                <TableRow key={progress.id}>
                  <TableCell className="font-medium">{progress.workOrder?.workOrderNumber}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <div className="w-20 bg-gray-200 rounded-full h-2">
                        <div 
                          className={`h-2 rounded-full ${getProgressColor(progress.progressPercentage)}`}
                          style={{ width: `${progress.progressPercentage}%` }}
                        />
                      </div>
                      <span className="text-sm font-medium">{progress.progressPercentage}%</span>
                    </div>
                  </TableCell>
                  <TableCell>{getStatusBadge(progress.status)}</TableCell>
                  <TableCell>
                    {progress.actualStartDate ? format(new Date(progress.actualStartDate), 'MMM dd, yyyy') : 'N/A'}
                  </TableCell>
                  <TableCell>
                    {progress.actualEndDate ? format(new Date(progress.actualEndDate), 'MMM dd, yyyy') : 'N/A'}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4 text-muted-foreground" />
                      <span>{progress.actualHours || '-'}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    {progress.actualCost ? `$${Number(progress.actualCost).toLocaleString()}` : 'N/A'}
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm" onClick={() => handleEdit(progress)}>
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button variant="outline" size="sm" onClick={() => handleDelete(progress.id)}>
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
            <CardTitle>{editingProgress ? 'Edit Work Order Progress' : 'Create New Work Order Progress'}</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="workOrderId">Work Order *</Label>
                  <Select onValueChange={(value: any) => setValue('workOrderId', value)} value={register('workOrderId').value}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select Work Order" />
                    </SelectTrigger>
                    <SelectContent>
                      {workOrders?.workOrders?.map((wo: any) => (
                        <SelectItem key={wo.id} value={wo.id}>
                          {wo.workOrderNumber} - {wo.title}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {errors.workOrderId && (
                    <p className="text-sm text-red-600">{errors.workOrderId.message}</p>
                  )}
                </div>

                <div>
                  <Label htmlFor="progressPercentage">Progress Percentage *</Label>
                  <Input
                    id="progressPercentage"
                    type="number"
                    min="0"
                    max="100"
                    {...register('progressPercentage', { valueAsNumber: true })}
                    placeholder="0"
                  />
                  {errors.progressPercentage && (
                    <p className="text-sm text-red-600">{errors.progressPercentage.message}</p>
                  )}
                </div>

                <div>
                  <Label htmlFor="actualStartDate">Actual Start Date</Label>
                  <Input
                    id="actualStartDate"
                    type="date"
                    {...register('actualStartDate')}
                  />
                  {errors.actualStartDate && (
                    <p className="text-sm text-red-600">{errors.actualStartDate.message}</p>
                  )}
                </div>

                <div>
                  <Label htmlFor="actualEndDate">Actual End Date</Label>
                  <Input
                    id="actualEndDate"
                    type="date"
                    {...register('actualEndDate')}
                  />
                  {errors.actualEndDate && (
                    <p className="text-sm text-red-600">{errors.actualEndDate.message}</p>
                  )}
                </div>

                <div>
                  <Label htmlFor="actualHours">Actual Hours</Label>
                  <Input
                    id="actualHours"
                    type="number"
                    step="0.1"
                    {...register('actualHours', { valueAsNumber: true })}
                    placeholder="0.0"
                  />
                  {errors.actualHours && (
                    <p className="text-sm text-red-600">{errors.actualHours.message}</p>
                  )}
                </div>

                <div>
                  <Label htmlFor="actualCost">Actual Cost</Label>
                  <Input
                    id="actualCost"
                    type="number"
                    step="0.01"
                    {...register('actualCost', { valueAsNumber: true })}
                    placeholder="0.00"
                  />
                  {errors.actualCost && (
                    <p className="text-sm text-red-600">{errors.actualCost.message}</p>
                  )}
                </div>

                <div>
                  <Label htmlFor="status">Status *</Label>
                  <Select onValueChange={(value: any) => setValue('status', value)} value={register('status').value}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select Status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="NOT_STARTED">Not Started</SelectItem>
                      <SelectItem value="IN_PROGRESS">In Progress</SelectItem>
                      <SelectItem value="COMPLETED">Completed</SelectItem>
                      <SelectItem value="ON_HOLD">On Hold</SelectItem>
                      <SelectItem value="CANCELLED">Cancelled</SelectItem>
                    </SelectContent>
                  </Select>
                  {errors.status && (
                    <p className="text-sm text-red-600">{errors.status.message}</p>
                  )}
                </div>

                <div className="md:col-span-2">
                  <Label htmlFor="notes">Notes</Label>
                  <Textarea
                    id="notes"
                    {...register('notes')}
                    placeholder="Any additional notes or observations..."
                  />
                </div>
              </div>

              <div className="flex gap-2 pt-4">
                <Button type="submit" disabled={createWorkOrderProgress.isPending || updateWorkOrderProgress.isPending}>
                  {editingProgress ? 'Update Progress' : 'Add Progress'}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setIsFormOpen(false);
                    setEditingProgress(null);
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
