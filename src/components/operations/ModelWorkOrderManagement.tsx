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
import { Plus, Edit, Trash2, Search, Copy, FileText } from 'lucide-react';
import { trpc } from '@/lib/trpc';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { LoadingSpinner } from '@/components/ui/loading-spinner';

// ========================================
// MODEL WORK ORDER MANAGEMENT COMPONENT
// Template-based Work Orders
// ========================================

const modelWorkOrderSchema = z.object({
  modelNumber: z.string().min(1, 'Model Number is required'),
  description: z.string().min(1, 'Description is required'),
  equipmentType: z.string().min(1, 'Equipment Type is required'),
  workOrderType: z.enum(['PREVENTIVE', 'CORRECTIVE', 'PREDICTIVE', 'EMERGENCY']).default('PREVENTIVE'),
  priority: z.enum(['LOW', 'MEDIUM', 'HIGH', 'CRITICAL']).default('MEDIUM'),
  estimatedDuration: z.number().min(0, 'Estimated Duration must be non-negative').optional(),
  estimatedCost: z.number().min(0, 'Estimated Cost must be non-negative').optional(),
  instructions: z.string().optional(),
  isActive: z.boolean().default(true),
});

type ModelWorkOrderFormData = z.infer<typeof modelWorkOrderSchema>;

export function ModelWorkOrderManagement() {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingModel, setEditingModel] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState<string>('all');

  const { register, handleSubmit, formState: { errors }, setValue, reset } = useForm<ModelWorkOrderFormData>({
    resolver: zodResolver(modelWorkOrderSchema),
    defaultValues: {
      modelNumber: '',
      description: '',
      equipmentType: '',
      workOrderType: 'PREVENTIVE',
      priority: 'MEDIUM',
      estimatedDuration: 0,
      estimatedCost: 0,
      instructions: '',
      isActive: true,
    },
  });

  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('');
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
    }, 300);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  const { data: modelWorkOrders, isLoading, refetch } = (trpc.ops.listModelWorkOrders as any).useQuery({
    limit: 50,
    search: debouncedSearchTerm.length >= 2 ? debouncedSearchTerm : undefined,
    workOrderType: typeFilter === 'all' ? undefined : typeFilter,
  });

  const createModelWorkOrder = (trpc.ops.createModelWorkOrder as any).useMutation({
    onSuccess: () => {
      toast.success('Model work order created successfully');
      reset();
      setIsFormOpen(false);
      void refetch();
    },
    onError: (error: any) => {
      toast.error(`Failed to create model work order: ${error.message}`);
    },
  });

  const updateModelWorkOrder = (trpc.ops.updateModelWorkOrder as any).useMutation({
    onSuccess: () => {
      toast.success('Model work order updated successfully');
      reset();
      setIsFormOpen(false);
      setEditingModel(null);
      void refetch();
    },
    onError: (error: any) => {
      toast.error(`Failed to update model work order: ${error.message}`);
    },
  });

  const deleteModelWorkOrder = (trpc.ops.deleteModelWorkOrder as any).useMutation({
    onSuccess: () => {
      toast.success('Model work order deleted successfully');
      void refetch();
    },
    onError: (error: any) => {
      toast.error(`Failed to delete model work order: ${error.message}`);
    },
  });

  const createFromModel = (trpc.ops.createWorkOrderFromModel as any).useMutation({
    onSuccess: () => {
      toast.success('Work order created from model successfully');
      void refetch();
    },
    onError: (error: any) => {
      toast.error(`Failed to create work order from model: ${error.message}`);
    },
  });

  const onSubmit = async (data: ModelWorkOrderFormData) => {
    if (editingModel) {
      await updateModelWorkOrder.mutateAsync({
        id: editingModel,
        ...data,
        idempotencyKey: crypto.randomUUID(),
      });
    } else {
      await createModelWorkOrder.mutateAsync({
        ...data,
        idempotencyKey: crypto.randomUUID(),
      });
    }
  };

  const handleEdit = (model: any) => {
    setEditingModel(model.id);
    setValue('modelNumber', model.modelNumber);
    setValue('description', model.description);
    setValue('equipmentType', model.equipmentType);
    setValue('workOrderType', model.workOrderType);
    setValue('priority', model.priority);
    setValue('estimatedDuration', model.estimatedDuration || 0);
    setValue('estimatedCost', model.estimatedCost || 0);
    setValue('instructions', model.instructions || '');
    setValue('isActive', model.isActive);
    setIsFormOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this model work order?')) {
      await deleteModelWorkOrder.mutateAsync({
        id,
        idempotencyKey: crypto.randomUUID(),
      });
    }
  };

  const handleCreateFromModel = async (modelId: string) => {
    if (confirm('Create a new work order from this model?')) {
      await createFromModel.mutateAsync({
        modelId,
        idempotencyKey: crypto.randomUUID(),
      });
    }
  };

  const allModels = useMemo(() => {
    return modelWorkOrders?.modelWorkOrders || [];
  }, [modelWorkOrders]) as any[];

  const getTypeBadge = (type: string) => {
    switch (type) {
      case 'PREVENTIVE':
        return <Badge className="bg-blue-500 hover:bg-blue-600">Preventive</Badge>;
      case 'CORRECTIVE':
        return <Badge className="bg-orange-500 hover:bg-orange-600">Corrective</Badge>;
      case 'PREDICTIVE':
        return <Badge className="bg-purple-500 hover:bg-purple-600">Predictive</Badge>;
      case 'EMERGENCY':
        return <Badge variant="destructive">Emergency</Badge>;
      default:
        return <Badge variant="outline">{type}</Badge>;
    }
  };

  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case 'CRITICAL':
        return <Badge variant="destructive">Critical</Badge>;
      case 'HIGH':
        return <Badge className="bg-red-500 hover:bg-red-600">High</Badge>;
      case 'MEDIUM':
        return <Badge className="bg-yellow-500 hover:bg-yellow-600">Medium</Badge>;
      case 'LOW':
        return <Badge className="bg-green-500 hover:bg-green-600">Low</Badge>;
      default:
        return <Badge variant="outline">{priority}</Badge>;
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
          <h2 className="text-2xl font-bold text-gray-900">Model Work Order Management</h2>
          <p className="text-gray-600">Create and manage template-based work orders for standardized maintenance</p>
        </div>
        <Button onClick={() => setIsFormOpen(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Add Model Work Order
        </Button>
      </div>

      <Card>
        <CardContent className="pt-6">
          <div className="flex gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Search model work orders (min 2 chars)..."
                  value={searchTerm}
                  onChange={(e: any) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Filter by type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="PREVENTIVE">Preventive</SelectItem>
                <SelectItem value="CORRECTIVE">Corrective</SelectItem>
                <SelectItem value="PREDICTIVE">Predictive</SelectItem>
                <SelectItem value="EMERGENCY">Emergency</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Model Work Orders ({allModels.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Model Number</TableHead>
                <TableHead>Description</TableHead>
                <TableHead>Equipment Type</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Priority</TableHead>
                <TableHead>Est. Duration</TableHead>
                <TableHead>Est. Cost</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {allModels.map((model: any) => (
                <TableRow key={model.id}>
                  <TableCell className="font-medium">
                    <div className="flex items-center gap-2">
                      <FileText className="h-4 w-4 text-muted-foreground" />
                      <span>{model.modelNumber}</span>
                    </div>
                  </TableCell>
                  <TableCell>{model.description}</TableCell>
                  <TableCell>{model.equipmentType}</TableCell>
                  <TableCell>{getTypeBadge(model.workOrderType)}</TableCell>
                  <TableCell>{getPriorityBadge(model.priority)}</TableCell>
                  <TableCell>{model.estimatedDuration ? `${model.estimatedDuration}h` : 'N/A'}</TableCell>
                  <TableCell>{model.estimatedCost ? `$${Number(model.estimatedCost).toLocaleString()}` : 'N/A'}</TableCell>
                  <TableCell>
                    <Badge variant={model.isActive ? 'default' : 'secondary'}>
                      {model.isActive ? 'Active' : 'Inactive'}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={() => handleCreateFromModel(model.id)}
                        title="Create Work Order from Model"
                      >
                        <Copy className="h-4 w-4" />
                      </Button>
                      <Button variant="outline" size="sm" onClick={() => handleEdit(model)}>
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button variant="outline" size="sm" onClick={() => handleDelete(model.id)}>
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
            <CardTitle>{editingModel ? 'Edit Model Work Order' : 'Create New Model Work Order'}</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="modelNumber">Model Number *</Label>
                  <Input
                    id="modelNumber"
                    {...register('modelNumber')}
                    placeholder="e.g., MWO-001"
                  />
                  {errors.modelNumber && (
                    <p className="text-sm text-red-600">{errors.modelNumber.message}</p>
                  )}
                </div>

                <div>
                  <Label htmlFor="description">Description *</Label>
                  <Input
                    id="description"
                    {...register('description')}
                    placeholder="e.g., Monthly Engine Maintenance"
                  />
                  {errors.description && (
                    <p className="text-sm text-red-600">{errors.description.message}</p>
                  )}
                </div>

                <div>
                  <Label htmlFor="equipmentType">Equipment Type *</Label>
                  <Input
                    id="equipmentType"
                    {...register('equipmentType')}
                    placeholder="e.g., Excavator, Bulldozer"
                  />
                  {errors.equipmentType && (
                    <p className="text-sm text-red-600">{errors.equipmentType.message}</p>
                  )}
                </div>

                <div>
                  <Label htmlFor="workOrderType">Work Order Type *</Label>
                  <Select onValueChange={(value: any) => setValue('workOrderType', value)} value={register('workOrderType').value}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select Type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="PREVENTIVE">Preventive</SelectItem>
                      <SelectItem value="CORRECTIVE">Corrective</SelectItem>
                      <SelectItem value="PREDICTIVE">Predictive</SelectItem>
                      <SelectItem value="EMERGENCY">Emergency</SelectItem>
                    </SelectContent>
                  </Select>
                  {errors.workOrderType && (
                    <p className="text-sm text-red-600">{errors.workOrderType.message}</p>
                  )}
                </div>

                <div>
                  <Label htmlFor="priority">Priority *</Label>
                  <Select onValueChange={(value: any) => setValue('priority', value)} value={register('priority').value}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select Priority" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="LOW">Low</SelectItem>
                      <SelectItem value="MEDIUM">Medium</SelectItem>
                      <SelectItem value="HIGH">High</SelectItem>
                      <SelectItem value="CRITICAL">Critical</SelectItem>
                    </SelectContent>
                  </Select>
                  {errors.priority && (
                    <p className="text-sm text-red-600">{errors.priority.message}</p>
                  )}
                </div>

                <div>
                  <Label htmlFor="estimatedDuration">Estimated Duration (hours)</Label>
                  <Input
                    id="estimatedDuration"
                    type="number"
                    step="0.1"
                    {...register('estimatedDuration', { valueAsNumber: true })}
                    placeholder="8.0"
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

                <div className="md:col-span-2">
                  <Label htmlFor="instructions">Instructions</Label>
                  <Textarea
                    id="instructions"
                    {...register('instructions')}
                    placeholder="Detailed instructions for this model work order..."
                    rows={4}
                  />
                </div>

                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="isActive"
                    {...register('isActive')}
                    className="rounded border-gray-300"
                  />
                  <Label htmlFor="isActive">Active Model</Label>
                </div>
              </div>

              <div className="flex gap-2 pt-4">
                <Button type="submit" disabled={createModelWorkOrder.isPending || updateModelWorkOrder.isPending}>
                  {editingModel ? 'Update Model' : 'Create Model'}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setIsFormOpen(false);
                    setEditingModel(null);
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
