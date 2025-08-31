'use client';

/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/prefer-nullish-coalescing */

import { useState, useMemo, useEffect } from 'react';
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Plus, Edit, Trash2, Search, Eye, 
  Wrench, AlertTriangle, 
  CheckCircle, XCircle, Play
} from 'lucide-react';
import { trpc } from '@/lib/trpc';
import { toast } from 'sonner';
import { format } from 'date-fns';

// ========================================
// WORK ORDER MANAGEMENT COMPONENT
// JDE F4801 equivalent with enterprise features
// ========================================

const workOrderSchema = z.object({
  equipmentId: z.string().min(1, 'Equipment is required'),
  workOrderType: z.string().min(1, 'Work order type is required'),
  priority: z.string().min(1, 'Priority is required'),
  title: z.string().min(1, 'Title is required'),
  description: z.string().optional(),
  problemDescription: z.string().optional(),
  scheduledDate: z.string().optional(),
  estimatedDuration: z.number().optional(),
  estimatedCost: z.number().min(0),
  assignedTechnicianId: z.string().optional(),
});

type WorkOrderFormData = z.infer<typeof workOrderSchema>;

interface WorkOrderManagementProps {
  onSuccess?: () => void;
}

export function WorkOrderManagement({ onSuccess }: WorkOrderManagementProps) {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingWorkOrder, setEditingWorkOrder] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [priorityFilter, setPriorityFilter] = useState<string>('all');
  const [selectedWorkOrder, setSelectedWorkOrder] = useState<any>(null);
  const [activeTab, setActiveTab] = useState('overview');

  const { register, handleSubmit, formState: { errors }, setValue, reset } = useForm<WorkOrderFormData>({
    resolver: zodResolver(workOrderSchema),
    defaultValues: {
      equipmentId: '',
      workOrderType: 'PREVENTIVE',
      priority: 'MEDIUM',
      title: '',
      description: '',
      problemDescription: '',
      scheduledDate: '',
      estimatedDuration: 0,
      estimatedCost: 0,
      assignedTechnicianId: '',
    },
  });

  // Debounced search term (FP6: debounce search inputs)
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('');
  
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
    }, 300);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  // tRPC queries with cursor pagination (R1: keyset pagination)
  const { data: workOrders, isLoading, refetch } = trpc.ops.listWorkOrders.useQuery({
    limit: 50, // FP6: cursor pagination for large lists
    type: typeFilter === 'all' ? undefined : typeFilter,
    status: statusFilter === 'all' ? undefined : statusFilter,
    priority: priorityFilter === 'all' ? undefined : priorityFilter,
    search: debouncedSearchTerm.length >= 2 ? debouncedSearchTerm : undefined, // FP6: server-side search
  });

  const { data: equipment } = trpc.ops.listEquipment.useQuery({ limit: 1000 });
  const { data: technicians } = trpc.core.getUsers.useQuery({ role: 'TECHNICIAN' });

  const createWorkOrder = trpc.ops.createWorkOrder.useMutation({
    onSuccess: () => {
      toast.success('Work order created successfully');
      reset();
      setIsFormOpen(false);
      void refetch();
      onSuccess?.();
    },
    onError: (error: any) => {
      toast.error(`Failed to create work order: ${error.message}`);
    },
  });

  const updateWorkOrder = trpc.ops.updateWorkOrder.useMutation({
    onSuccess: () => {
      toast.success('Work order updated successfully');
      reset();
      setIsFormOpen(false);
      setEditingWorkOrder(null);
      void refetch();
      onSuccess?.();
    },
    onError: (error: any) => {
      toast.error(`Failed to update work order: ${error.message}`);
    },
  });

  const deleteWorkOrder = trpc.ops.deleteWorkOrder.useMutation({
    onSuccess: () => {
      toast.success('Work order deleted successfully');
      void refetch();
    },
    onError: (error: any) => {
      toast.error(`Failed to delete work order: ${error.message}`);
    },
  });

  const updateWorkOrderStatus = trpc.ops.updateWorkOrderStatus.useMutation({
    onSuccess: () => {
      toast.success('Work order status updated successfully');
      void refetch();
    },
    onError: (error: any) => {
      toast.error(`Failed to update work order status: ${error.message}`);
    },
  });

  const onSubmit = async (data: WorkOrderFormData) => {
    if (editingWorkOrder) {
      await updateWorkOrder.mutateAsync({
        id: editingWorkOrder,
        ...data,
        scheduledDate: data.scheduledDate ? new Date(data.scheduledDate).toISOString() : undefined,
        idempotencyKey: crypto.randomUUID(),
      });
    } else {
      await createWorkOrder.mutateAsync({
        ...data,
        scheduledDate: data.scheduledDate ? new Date(data.scheduledDate).toISOString() : undefined,
        idempotencyKey: crypto.randomUUID(),
      });
    }
  };

  const handleEdit = (workOrder: any) => {
    setEditingWorkOrder(workOrder.id);
    setValue('equipmentId', workOrder.equipmentId);
    setValue('workOrderType', workOrder.workOrderType);
    setValue('priority', workOrder.priority);
    setValue('title', workOrder.title);
    setValue('description', workOrder.description || '');
    setValue('problemDescription', workOrder.problemDescription || '');
    setValue('scheduledDate', workOrder.scheduledDate ? format(new Date(workOrder.scheduledDate), 'yyyy-MM-dd') : '');
    setValue('estimatedDuration', workOrder.estimatedDuration || 0);
    setValue('estimatedCost', Number(workOrder.estimatedCost));
    setValue('assignedTechnicianId', workOrder.assignedTechnicianId || '');
    setIsFormOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this work order?')) {
      await deleteWorkOrder.mutateAsync({ 
        id,
        idempotencyKey: crypto.randomUUID(),
      });
    }
  };

  const handleViewDetails = (workOrder: any) => {
    setSelectedWorkOrder(workOrder);
    setActiveTab('overview');
  };

  const handleStatusUpdate = async (id: string, status: string) => {
    await updateWorkOrderStatus.mutateAsync({
      id,
      status,
      idempotencyKey: crypto.randomUUID(),
    });
  };

  // Get work orders data
  const allWorkOrders = useMemo(() => {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-return
    if (!workOrders?.workOrders) return [] as any[];
    // eslint-disable-next-line @typescript-eslint/no-unsafe-return
    return workOrders.workOrders as any[];
  }, [workOrders]);

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      OPEN: { variant: 'secondary' as const, icon: AlertTriangle, color: 'text-yellow-600' },
      IN_PROGRESS: { variant: 'default' as const, icon: Play, color: 'text-blue-600' },
      COMPLETED: { variant: 'default' as const, icon: CheckCircle, color: 'text-green-600' },
      CANCELLED: { variant: 'destructive' as const, icon: XCircle, color: 'text-red-600' },
    };
    
    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.OPEN;
    const Icon = config.icon;
    
    return (
      <Badge variant={config.variant} className="flex items-center gap-1">
        <Icon className={`h-3 w-3 ${config.color}`} />
        {status.replace('_', ' ')}
      </Badge>
    );
  };

  const getPriorityBadge = (priority: string) => {
    const priorityConfig = {
      LOW: { variant: 'outline' as const, color: 'text-gray-600' },
      MEDIUM: { variant: 'secondary' as const, color: 'text-blue-600' },
      HIGH: { variant: 'default' as const, color: 'text-orange-600' },
      CRITICAL: { variant: 'destructive' as const, color: 'text-red-600' },
    };
    
    const config = priorityConfig[priority as keyof typeof priorityConfig] || priorityConfig.MEDIUM;
    
    return (
      <Badge variant={config.variant} className={config.color}>
        {priority}
      </Badge>
    );
  };

  const getTypeBadge = (type: string) => {
    const typeConfig = {
      PREVENTIVE: { variant: 'outline' as const, color: 'text-green-600' },
      CORRECTIVE: { variant: 'default' as const, color: 'text-orange-600' },
      EMERGENCY: { variant: 'destructive' as const, color: 'text-red-600' },
      INSPECTION: { variant: 'secondary' as const, color: 'text-blue-600' },
    };
    
    const config = typeConfig[type as keyof typeof typeConfig] || typeConfig.CORRECTIVE;
    
    return (
      <Badge variant={config.variant} className={config.color}>
        {type}
      </Badge>
    );
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Work Order Management</h2>
          <p className="text-gray-600">Manage work orders, maintenance tasks, and resource allocation</p>
        </div>
        <Button onClick={() => setIsFormOpen(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Create Work Order
        </Button>
      </div>

      {/* Search and Filter */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Search work orders (min 2 chars)..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
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
                <SelectItem value="EMERGENCY">Emergency</SelectItem>
                <SelectItem value="INSPECTION">Inspection</SelectItem>
              </SelectContent>
            </Select>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="OPEN">Open</SelectItem>
                <SelectItem value="IN_PROGRESS">In Progress</SelectItem>
                <SelectItem value="COMPLETED">Completed</SelectItem>
                <SelectItem value="CANCELLED">Cancelled</SelectItem>
              </SelectContent>
            </Select>
            <Select value={priorityFilter} onValueChange={setPriorityFilter}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Filter by priority" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Priorities</SelectItem>
                <SelectItem value="LOW">Low</SelectItem>
                <SelectItem value="MEDIUM">Medium</SelectItem>
                <SelectItem value="HIGH">High</SelectItem>
                <SelectItem value="CRITICAL">Critical</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Work Orders List */}
      <Card>
        <CardHeader>
          <CardTitle>Work Orders ({allWorkOrders.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Work Order #</TableHead>
                <TableHead>Equipment</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Priority</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Scheduled Date</TableHead>
                <TableHead>Assigned To</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {allWorkOrders.map((workOrder: any) => (
                <TableRow key={workOrder.id}>
                  <TableCell className="font-medium">{workOrder.workOrderNumber}</TableCell>
                  <TableCell>
                    <div>
                      <div className="font-medium">{workOrder.equipment?.code}</div>
                      <div className="text-sm text-gray-500">{workOrder.equipment?.name}</div>
                    </div>
                  </TableCell>
                  <TableCell>{getTypeBadge(workOrder.workOrderType)}</TableCell>
                  <TableCell>{getPriorityBadge(workOrder.priority)}</TableCell>
                  <TableCell>{getStatusBadge(workOrder.status)}</TableCell>
                  <TableCell>
                    {workOrder.scheduledDate ? format(new Date(workOrder.scheduledDate), 'MMM dd, yyyy') : '-'}
                  </TableCell>
                  <TableCell>
                    {workOrder.assignedTechnician?.firstName} {workOrder.assignedTechnician?.lastName}
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleViewDetails(workOrder)}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleEdit(workOrder)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      {workOrder.status === 'OPEN' && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleStatusUpdate(workOrder.id, 'IN_PROGRESS')}
                        >
                          <Play className="h-4 w-4" />
                        </Button>
                      )}
                      {workOrder.status === 'IN_PROGRESS' && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleStatusUpdate(workOrder.id, 'COMPLETED')}
                        >
                          <CheckCircle className="h-4 w-4" />
                        </Button>
                      )}
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDelete(workOrder.id)}
                      >
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

      {/* Work Order Details Modal */}
      {selectedWorkOrder && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <Wrench className="h-5 w-5" />
                  {selectedWorkOrder.title} ({selectedWorkOrder.workOrderNumber})
                </CardTitle>
                <p className="text-sm text-gray-600">{selectedWorkOrder.description}</p>
              </div>
              <Button variant="outline" onClick={() => setSelectedWorkOrder(null)}>
                Close
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="overview">Overview</TabsTrigger>
                <TabsTrigger value="schedule">Schedule</TabsTrigger>
                <TabsTrigger value="resources">Resources</TabsTrigger>
                <TabsTrigger value="history">History</TabsTrigger>
              </TabsList>
              
              <TabsContent value="overview" className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label className="text-sm font-medium text-gray-500">Equipment</Label>
                    <p className="text-sm">{selectedWorkOrder.equipment?.code} - {selectedWorkOrder.equipment?.name}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-gray-500">Type</Label>
                    <div className="mt-1">{getTypeBadge(selectedWorkOrder.workOrderType)}</div>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-gray-500">Priority</Label>
                    <div className="mt-1">{getPriorityBadge(selectedWorkOrder.priority)}</div>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-gray-500">Status</Label>
                    <div className="mt-1">{getStatusBadge(selectedWorkOrder.status)}</div>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-gray-500">Estimated Duration</Label>
                    <p className="text-sm">{selectedWorkOrder.estimatedDuration || 0} hours</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-gray-500">Estimated Cost</Label>
                    <p className="text-sm">${Number(selectedWorkOrder.estimatedCost || 0).toLocaleString()}</p>
                  </div>
                </div>
                {selectedWorkOrder.problemDescription && (
                  <div>
                    <Label className="text-sm font-medium text-gray-500">Problem Description</Label>
                    <p className="text-sm mt-1">{selectedWorkOrder.problemDescription}</p>
                  </div>
                )}
              </TabsContent>
              
              <TabsContent value="schedule" className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label className="text-sm font-medium text-gray-500">Scheduled Date</Label>
                    <p className="text-sm">
                      {selectedWorkOrder.scheduledDate ? format(new Date(selectedWorkOrder.scheduledDate), 'MMM dd, yyyy HH:mm') : 'Not scheduled'}
                    </p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-gray-500">Start Date</Label>
                    <p className="text-sm">
                      {selectedWorkOrder.startDate ? format(new Date(selectedWorkOrder.startDate), 'MMM dd, yyyy HH:mm') : 'Not started'}
                    </p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-gray-500">Completed Date</Label>
                    <p className="text-sm">
                      {selectedWorkOrder.completedDate ? format(new Date(selectedWorkOrder.completedDate), 'MMM dd, yyyy HH:mm') : 'Not completed'}
                    </p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-gray-500">Downtime Hours</Label>
                    <p className="text-sm">{Number(selectedWorkOrder.downtimeHours || 0).toFixed(1)} hours</p>
                  </div>
                </div>
              </TabsContent>
              
              <TabsContent value="resources" className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label className="text-sm font-medium text-gray-500">Assigned Technician</Label>
                    <p className="text-sm">
                      {selectedWorkOrder.assignedTechnician ? 
                        `${selectedWorkOrder.assignedTechnician.firstName} ${selectedWorkOrder.assignedTechnician.lastName}` : 
                        'Not assigned'
                      }
                    </p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-gray-500">Labor Cost</Label>
                    <p className="text-sm">${Number(selectedWorkOrder.laborCost || 0).toLocaleString()}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-gray-500">Parts Cost</Label>
                    <p className="text-sm">${Number(selectedWorkOrder.partsCost || 0).toLocaleString()}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-gray-500">Material Cost</Label>
                    <p className="text-sm">${Number(selectedWorkOrder.materialCost || 0).toLocaleString()}</p>
                  </div>
                </div>
              </TabsContent>
              
              <TabsContent value="history" className="space-y-4">
                <p className="text-sm text-gray-600">Work order history will be displayed here.</p>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      )}

      {/* Work Order Form Modal */}
      {isFormOpen && (
        <Card>
          <CardHeader>
            <CardTitle>
              {editingWorkOrder ? 'Edit Work Order' : 'Create New Work Order'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="equipmentId">Equipment *</Label>
                  <Select onValueChange={(value) => setValue('equipmentId', value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select equipment" />
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
                  <Label htmlFor="workOrderType">Work Order Type *</Label>
                  <Select onValueChange={(value) => setValue('workOrderType', value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="PREVENTIVE">Preventive</SelectItem>
                      <SelectItem value="CORRECTIVE">Corrective</SelectItem>
                      <SelectItem value="EMERGENCY">Emergency</SelectItem>
                      <SelectItem value="INSPECTION">Inspection</SelectItem>
                    </SelectContent>
                  </Select>
                  {errors.workOrderType && (
                    <p className="text-sm text-red-600">{errors.workOrderType.message}</p>
                  )}
                </div>

                <div>
                  <Label htmlFor="priority">Priority</Label>
                  <Select onValueChange={(value) => setValue('priority', value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select priority" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="LOW">Low</SelectItem>
                      <SelectItem value="MEDIUM">Medium</SelectItem>
                      <SelectItem value="HIGH">High</SelectItem>
                      <SelectItem value="CRITICAL">Critical</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="assignedTechnicianId">Assigned Technician</Label>
                  <Select onValueChange={(value) => setValue('assignedTechnicianId', value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select technician" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">Not assigned</SelectItem>
                      {technicians?.map((tech: any) => (
                        <SelectItem key={tech.id} value={tech.id}>
                          {tech.firstName} {tech.lastName}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="md:col-span-2">
                  <Label htmlFor="title">Title *</Label>
                  <Input
                    id="title"
                    {...register('title')}
                    placeholder="Work order title..."
                  />
                  {errors.title && (
                    <p className="text-sm text-red-600">{errors.title.message}</p>
                  )}
                </div>

                <div className="md:col-span-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    {...register('description')}
                    placeholder="Work order description..."
                  />
                </div>

                <div className="md:col-span-2">
                  <Label htmlFor="problemDescription">Problem Description</Label>
                  <Textarea
                    id="problemDescription"
                    {...register('problemDescription')}
                    placeholder="Describe the problem or issue..."
                  />
                </div>

                <div>
                  <Label htmlFor="scheduledDate">Scheduled Date</Label>
                  <Input
                    id="scheduledDate"
                    type="datetime-local"
                    {...register('scheduledDate')}
                  />
                </div>

                <div>
                  <Label htmlFor="estimatedDuration">Estimated Duration (Hours)</Label>
                  <Input
                    id="estimatedDuration"
                    type="number"
                    {...register('estimatedDuration', { valueAsNumber: true })}
                    placeholder="0"
                  />
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
                </div>
              </div>

              <div className="flex gap-2 pt-4">
                <Button type="submit" disabled={createWorkOrder.isPending || updateWorkOrder.isPending}>
                  {editingWorkOrder ? 'Update Work Order' : 'Create Work Order'}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setIsFormOpen(false);
                    setEditingWorkOrder(null);
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
