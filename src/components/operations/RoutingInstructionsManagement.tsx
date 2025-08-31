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
import { Plus, Edit, Trash2, Search, Route, Settings } from 'lucide-react';
import { trpc } from '@/lib/trpc';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { LoadingSpinner } from '@/components/ui/loading-spinner';

// ========================================
// ROUTING INSTRUCTIONS MANAGEMENT COMPONENT
// Shop Floor Control Integration
// ========================================

const routingInstructionSchema = z.object({
  workOrderId: z.string().min(1, 'Work Order is required'),
  sequenceNumber: z.number().min(1, 'Sequence Number must be at least 1'),
  operationCode: z.string().min(1, 'Operation Code is required'),
  operationDescription: z.string().min(1, 'Operation Description is required'),
  workCenter: z.string().min(1, 'Work Center is required'),
  estimatedHours: z.number().min(0, 'Estimated Hours must be non-negative'),
  setupHours: z.number().min(0, 'Setup Hours must be non-negative').optional(),
  status: z.enum(['PENDING', 'IN_PROGRESS', 'COMPLETED', 'ON_HOLD', 'CANCELLED']).default('PENDING'),
  notes: z.string().optional(),
});

type RoutingInstructionFormData = z.infer<typeof routingInstructionSchema>;

export function RoutingInstructionsManagement() {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingInstruction, setEditingInstruction] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  const { register, handleSubmit, formState: { errors }, setValue, reset } = useForm<RoutingInstructionFormData>({
    resolver: zodResolver(routingInstructionSchema),
    defaultValues: {
      workOrderId: '',
      sequenceNumber: 1,
      operationCode: '',
      operationDescription: '',
      workCenter: '',
      estimatedHours: 0,
      setupHours: 0,
      status: 'PENDING',
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

  const { data: routingInstructions, isLoading, refetch } = (trpc.ops.listRoutingInstructions as any).useQuery({
    limit: 50,
    search: debouncedSearchTerm.length >= 2 ? debouncedSearchTerm : undefined,
    status: statusFilter === 'all' ? undefined : statusFilter,
  });

  const { data: workOrders } = (trpc.ops.listWorkOrders as any).useQuery({ limit: 1000 });

  const createRoutingInstruction = (trpc.ops.createRoutingInstructions as any).useMutation({
    onSuccess: () => {
      toast.success('Routing instruction created successfully');
      reset();
      setIsFormOpen(false);
      void refetch();
    },
    onError: (error: any) => {
      toast.error(`Failed to create routing instruction: ${error.message}`);
    },
  });

  const updateRoutingInstruction = (trpc.ops.updateRoutingInstructions as any).useMutation({
    onSuccess: () => {
      toast.success('Routing instruction updated successfully');
      reset();
      setIsFormOpen(false);
      setEditingInstruction(null);
      void refetch();
    },
    onError: (error: any) => {
      toast.error(`Failed to update routing instruction: ${error.message}`);
    },
  });

  const deleteRoutingInstruction = (trpc.ops.deleteRoutingInstructions as any).useMutation({
    onSuccess: () => {
      toast.success('Routing instruction deleted successfully');
      void refetch();
    },
    onError: (error: any) => {
      toast.error(`Failed to delete routing instruction: ${error.message}`);
    },
  });

  const onSubmit = async (data: RoutingInstructionFormData) => {
    if (editingInstruction) {
      await updateRoutingInstruction.mutateAsync({
        id: editingInstruction,
        ...data,
        idempotencyKey: crypto.randomUUID(),
      });
    } else {
      await createRoutingInstruction.mutateAsync({
        ...data,
        idempotencyKey: crypto.randomUUID(),
      });
    }
  };

  const handleEdit = (instruction: any) => {
    setEditingInstruction(instruction.id);
    setValue('workOrderId', instruction.workOrderId);
    setValue('sequenceNumber', instruction.sequenceNumber);
    setValue('operationCode', instruction.operationCode);
    setValue('operationDescription', instruction.operationDescription);
    setValue('workCenter', instruction.workCenter);
    setValue('estimatedHours', instruction.estimatedHours);
    setValue('setupHours', instruction.setupHours || 0);
    setValue('status', instruction.status);
    setValue('notes', instruction.notes || '');
    setIsFormOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this routing instruction?')) {
      await deleteRoutingInstruction.mutateAsync({
        id,
        idempotencyKey: crypto.randomUUID(),
      });
    }
  };

  const allInstructions = useMemo(() => {
    return routingInstructions?.routingInstructions || [];
  }, [routingInstructions]) as any[];

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
      case 'PENDING':
        return <Badge variant="secondary">Pending</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
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
          <h2 className="text-2xl font-bold text-gray-900">Routing Instructions Management</h2>
          <p className="text-gray-600">Manage shop floor control and routing instructions for work orders</p>
        </div>
        <Button onClick={() => setIsFormOpen(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Add Routing Instruction
        </Button>
      </div>

      <Card>
        <CardContent className="pt-6">
          <div className="flex gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Search routing instructions (min 2 chars)..."
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
                <SelectItem value="PENDING">Pending</SelectItem>
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
          <CardTitle>Routing Instructions ({allInstructions.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Work Order</TableHead>
                <TableHead>Sequence</TableHead>
                <TableHead>Operation Code</TableHead>
                <TableHead>Description</TableHead>
                <TableHead>Work Center</TableHead>
                <TableHead>Est. Hours</TableHead>
                <TableHead>Setup Hours</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {allInstructions.map((instruction: any) => (
                <TableRow key={instruction.id}>
                  <TableCell className="font-medium">{instruction.workOrder?.workOrderNumber}</TableCell>
                  <TableCell>{instruction.sequenceNumber}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Route className="h-4 w-4 text-muted-foreground" />
                      <span>{instruction.operationCode}</span>
                    </div>
                  </TableCell>
                  <TableCell>{instruction.operationDescription}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Settings className="h-4 w-4 text-muted-foreground" />
                      <span>{instruction.workCenter}</span>
                    </div>
                  </TableCell>
                  <TableCell>{instruction.estimatedHours}</TableCell>
                  <TableCell>{instruction.setupHours || '-'}</TableCell>
                  <TableCell>{getStatusBadge(instruction.status)}</TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm" onClick={() => handleEdit(instruction)}>
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button variant="outline" size="sm" onClick={() => handleDelete(instruction.id)}>
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
            <CardTitle>{editingInstruction ? 'Edit Routing Instruction' : 'Create New Routing Instruction'}</CardTitle>
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
                  <Label htmlFor="sequenceNumber">Sequence Number *</Label>
                  <Input
                    id="sequenceNumber"
                    type="number"
                    {...register('sequenceNumber', { valueAsNumber: true })}
                    placeholder="1"
                  />
                  {errors.sequenceNumber && (
                    <p className="text-sm text-red-600">{errors.sequenceNumber.message}</p>
                  )}
                </div>

                <div>
                  <Label htmlFor="operationCode">Operation Code *</Label>
                  <Input
                    id="operationCode"
                    {...register('operationCode')}
                    placeholder="e.g., OP10, ASSY01"
                  />
                  {errors.operationCode && (
                    <p className="text-sm text-red-600">{errors.operationCode.message}</p>
                  )}
                </div>

                <div>
                  <Label htmlFor="operationDescription">Operation Description *</Label>
                  <Input
                    id="operationDescription"
                    {...register('operationDescription')}
                    placeholder="e.g., Assembly Operation"
                  />
                  {errors.operationDescription && (
                    <p className="text-sm text-red-600">{errors.operationDescription.message}</p>
                  )}
                </div>

                <div>
                  <Label htmlFor="workCenter">Work Center *</Label>
                  <Input
                    id="workCenter"
                    {...register('workCenter')}
                    placeholder="e.g., WC001, Assembly Line 1"
                  />
                  {errors.workCenter && (
                    <p className="text-sm text-red-600">{errors.workCenter.message}</p>
                  )}
                </div>

                <div>
                  <Label htmlFor="estimatedHours">Estimated Hours *</Label>
                  <Input
                    id="estimatedHours"
                    type="number"
                    step="0.1"
                    {...register('estimatedHours', { valueAsNumber: true })}
                    placeholder="8.0"
                  />
                  {errors.estimatedHours && (
                    <p className="text-sm text-red-600">{errors.estimatedHours.message}</p>
                  )}
                </div>

                <div>
                  <Label htmlFor="setupHours">Setup Hours</Label>
                  <Input
                    id="setupHours"
                    type="number"
                    step="0.1"
                    {...register('setupHours', { valueAsNumber: true })}
                    placeholder="1.0"
                  />
                  {errors.setupHours && (
                    <p className="text-sm text-red-600">{errors.setupHours.message}</p>
                  )}
                </div>

                <div>
                  <Label htmlFor="status">Status *</Label>
                  <Select onValueChange={(value: any) => setValue('status', value)} value={register('status').value}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select Status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="PENDING">Pending</SelectItem>
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
                    placeholder="Any additional notes or special instructions..."
                  />
                </div>
              </div>

              <div className="flex gap-2 pt-4">
                <Button type="submit" disabled={createRoutingInstruction.isPending || updateRoutingInstruction.isPending}>
                  {editingInstruction ? 'Update Instruction' : 'Add Instruction'}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setIsFormOpen(false);
                    setEditingInstruction(null);
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
