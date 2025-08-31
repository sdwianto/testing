'use client';

/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/no-unsafe-call */

/* eslint-disable @typescript-eslint/prefer-nullish-coalescing */

import { useState, useMemo, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

import { Card, CardContent } from '@/components/ui/card';

import { DataTable, type Column } from '@/components/ui/data-table';
import { DashboardSkeleton } from '@/components/ui/loading-skeleton';
import { 
  Plus, Edit, Trash2, Eye, 
  Calendar, Clock, AlertTriangle, 
  CheckCircle, DollarSign, FileText
} from 'lucide-react';
import { trpc } from '@/lib/trpc';
import { toast } from 'sonner';
import { format } from 'date-fns';

// ========================================
// MODERN WORK ORDER MANAGEMENT COMPONENT
// Enterprise-grade UI with modern design
// ========================================

type WorkOrderFormData = {
  equipmentId: string;
  workOrderType: string;
  priority: string;
  title: string;
  description?: string;
  problemDescription?: string;
  scheduledDate?: string;
  estimatedDuration?: number;
  estimatedCost: number;
  assignedTechnicianId?: string;
};

interface ModernWorkOrderManagementProps {
  onSuccess?: () => void;
}

export function ModernWorkOrderManagement({ onSuccess }: ModernWorkOrderManagementProps) {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingWorkOrder, setEditingWorkOrder] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [priorityFilter, setPriorityFilter] = useState<string>('all');
  const [selectedWorkOrder, setSelectedWorkOrder] = useState<any>(null);
  const [activeTab, setActiveTab] = useState('overview');

  const { register, handleSubmit, formState: { errors }, setValue, reset } = useForm<WorkOrderFormData>({
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

  // Debounced search term
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('');
  
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
    }, 300);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  // tRPC queries
  const { data: workOrdersData, isLoading, refetch } = trpc.ops.listWorkOrders.useQuery({
    limit: 100,
    type: typeFilter === 'all' ? undefined : typeFilter,
    status: statusFilter === 'all' ? undefined : statusFilter,
    priority: priorityFilter === 'all' ? undefined : priorityFilter,
    search: debouncedSearchTerm.length >= 2 ? debouncedSearchTerm : undefined,
  });

  const { data: equipment } = trpc.ops.listEquipment.useQuery({ limit: 1000 });

  const createWorkOrder = (trpc.ops.createWorkOrder as any).useMutation({
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

  const updateWorkOrder = (trpc.ops.updateWorkOrder as any).useMutation({
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

  const updateWorkOrderStatus = (trpc.ops.updateWorkOrderStatus as any).useMutation({
    onSuccess: () => {
      toast.success('Work order status updated successfully');
      void refetch();
    },
    onError: (error: any) => {
      toast.error(`Failed to update work order status: ${error.message}`);
    },
  });

  const deleteWorkOrder = (trpc.ops.deleteWorkOrder as any).useMutation({
    onSuccess: () => {
      toast.success('Work order deleted successfully');
      void refetch();
    },
    onError: (error: any) => {
      toast.error(`Failed to delete work order: ${error.message}`);
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
  };

  const handleStatusChange = async (id: string, status: string) => {
    await updateWorkOrderStatus.mutateAsync({
      id,
      status,
      idempotencyKey: crypto.randomUUID(),
    });
  };

  // Get work orders data
  const allWorkOrders = useMemo(() => {
    return workOrdersData?.workOrders || [];
  }, [workOrdersData]) as any[];

  // Calculate statistics
  const stats = useMemo(() => {
    const total = allWorkOrders.length;
    const open = allWorkOrders.filter((wo: any) => wo.status === 'OPEN').length;
    const inProgress = allWorkOrders.filter((wo: any) => wo.status === 'IN_PROGRESS').length;
    const completed = allWorkOrders.filter((wo: any) => wo.status === 'COMPLETED').length;
    const totalCost = allWorkOrders.reduce((sum: number, wo: any) => sum + Number(wo.estimatedCost || 0), 0);

    return { total, open, inProgress, completed, totalCost };
  }, [allWorkOrders]);

  const getPriorityBadge = (priority: string) => {
    const priorityConfig = {
      HIGH: { variant: 'destructive' as const, color: 'bg-red-100 text-red-800' },
      MEDIUM: { variant: 'default' as const, color: 'bg-yellow-100 text-yellow-800' },
      LOW: { variant: 'secondary' as const, color: 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-100' },
    };
    
    const config = priorityConfig[priority as keyof typeof priorityConfig] || priorityConfig.MEDIUM;
    
    return (
      <Badge variant={config.variant} className={config.color}>
        {priority}
      </Badge>
    );
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      OPEN: { variant: 'default' as const, color: 'bg-blue-100 text-blue-800' },
      IN_PROGRESS: { variant: 'default' as const, color: 'bg-orange-100 text-orange-800' },
      COMPLETED: { variant: 'default' as const, color: 'bg-green-100 text-green-800' },
      CANCELLED: { variant: 'secondary' as const, color: 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-100' },
    };
    
    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.OPEN;
    
    return (
      <Badge variant={config.variant} className={config.color}>
        {status.replace('_', ' ')}
      </Badge>
    );
  };

  const getTypeBadge = (type: string) => {
    const typeConfig = {
      PREVENTIVE: { variant: 'default' as const, color: 'bg-green-100 text-green-800' },
      CORRECTIVE: { variant: 'default' as const, color: 'bg-red-100 text-red-800' },
      PREDICTIVE: { variant: 'default' as const, color: 'bg-blue-100 text-blue-800' },
      EMERGENCY: { variant: 'destructive' as const, color: 'bg-red-100 text-red-800' },
    };
    
    const config = typeConfig[type as keyof typeof typeConfig] || typeConfig.PREVENTIVE;
    
    return (
      <Badge variant={config.variant} className={config.color}>
        {type}
      </Badge>
    );
  };

  // Table columns
  const columns: Column<any>[] = [
    {
      key: 'workOrderNumber',
      label: 'Work Order',
      sortable: true,
      render: (value, row) => (
        <div className="flex items-center space-x-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-50">
            <FileText className="h-4 w-4 text-blue-600" />
          </div>
          <div>
            <div className="font-medium dark:text-white">{value as string}</div>
            <div className="text-sm text-muted-foreground">{row.title}</div>
          </div>
        </div>
      )
    },
    {
      key: 'equipment',
      label: 'Equipment',
      sortable: true,
      render: (_, row) => (
        <div>
          <div className="font-medium dark:text-white">{row.equipment?.code}</div>
          <div className="text-sm text-muted-foreground">{row.equipment?.name}</div>
        </div>
      )
    },
    {
      key: 'workOrderType',
      label: 'Type',
      sortable: true,
      render: (value) => getTypeBadge(value as string)
    },
    {
      key: 'priority',
      label: 'Priority',
      sortable: true,
      render: (value) => getPriorityBadge(value as string)
    },
    {
      key: 'status',
      label: 'Status',
      sortable: true,
      render: (value) => getStatusBadge(value as string)    
    },
    {
      key: 'scheduledDate',
      label: 'Scheduled',
      sortable: true,
      render: (value) => value ? format(new Date(value as string), 'MMM dd, yyyy') : '-'
    },
    {
      key: 'estimatedCost',
      label: 'Estimated Cost',
      sortable: true,
      render: (value) => (
        <div className="text-right">
          <div className="font-medium">${Number(value || 0).toLocaleString()}</div>
        </div>
      )
    },
    {
      key: 'actions',
      label: 'Actions',
      render: (_, row) => (
        <div className="flex items-center space-x-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => handleViewDetails(row)}
          >
            <Eye className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => handleEdit(row)}
          >
            <Edit className="h-4 w-4" />
          </Button>
          <Select
            value={row.status}
            onValueChange={(value) => handleStatusChange(row.id, value)}
          >
            <SelectTrigger className="w-32 h-8">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="OPEN">Open</SelectItem>
              <SelectItem value="IN_PROGRESS">In Progress</SelectItem>
              <SelectItem value="COMPLETED">Completed</SelectItem>
              <SelectItem value="CANCELLED">Cancelled</SelectItem>
            </SelectContent>
          </Select>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => handleDelete(row.id)}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      )
    }
  ];

  if (isLoading) {
    return <DashboardSkeleton />;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold dark:text-white dark:text-white">Work Order Management</h1>
          <p className="text-muted-foreground mt-1">Track and manage maintenance work orders with real-time updates</p>
        </div>
        <Button 
          onClick={() => setIsFormOpen(true)}
          className="bg-blue-600 hover:bg-blue-700 text-white"
        >
          <Plus className="h-4 w-4 mr-2" />
          Create Work Order
        </Button>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center">
              <FileText className="h-4 w-4 text-muted-foreground" />
              <div className="ml-2">
                <p className="text-sm font-medium text-muted-foreground">Total Work Orders</p>
                <p className="text-2xl font-bold">{stats.total}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center">
              <AlertTriangle className="h-4 w-4 text-blue-500" />
              <div className="ml-2">
                <p className="text-sm font-medium text-muted-foreground">Open</p>
                <p className="text-2xl font-bold text-blue-600">{stats.open}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center">
              <Clock className="h-4 w-4 text-yellow-500" />
              <div className="ml-2">
                <p className="text-sm font-medium text-muted-foreground">In Progress</p>
                <p className="text-2xl font-bold text-yellow-600">{stats.inProgress}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center">
              <CheckCircle className="h-4 w-4 text-green-500" />
              <div className="ml-2">
                <p className="text-sm font-medium text-muted-foreground">Completed</p>
                <p className="text-2xl font-bold text-green-600">{stats.completed}</p>
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
                <p className="text-2xl font-bold text-purple-600">${stats.totalCost.toLocaleString()}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="work-orders">Work Orders</TabsTrigger>
          <TabsTrigger value="schedule">Schedule</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardContent className="p-6">
                <div className="mb-4">
                  <h3 className="text-lg font-semibold">Recent Work Orders</h3>
                  <p className="text-sm text-muted-foreground">Latest work orders and their status</p>
                </div>
                <div className="space-y-4">
                  {allWorkOrders.slice(0, 5).map((workOrder: any) => (
                    <div key={workOrder.id} className="flex items-center space-x-4 p-3 rounded-lg hover:bg-muted/50">
                      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-50">
                        <FileText className="h-5 w-5 text-blue-600" />
                      </div>
                      <div className="flex-1">
                        <div className="font-medium dark:text-white">{workOrder.workOrderNumber}</div>
                        <div className="text-sm text-muted-foreground">{workOrder.equipment?.code} - {workOrder.title}</div>
                      </div>
                      <div className="flex items-center space-x-2">
                        {getStatusBadge(workOrder.status)}
                        {getPriorityBadge(workOrder.priority)}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="mb-4">
                  <h3 className="text-lg font-semibold">Work Orders by Type</h3>
                  <p className="text-sm text-muted-foreground">Distribution of work order types</p>
                </div>
                <div className="space-y-4">
                  {Object.entries(
                    allWorkOrders.reduce((acc: Record<string, number>, wo: any) => {
                      acc[wo.workOrderType] = (acc[wo.workOrderType] || 0) + 1;
                      return acc;
                    }, {} as Record<string, number>)
                  ).map(([type, count]) => (
                    <div key={type} className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className={`h-3 w-3 rounded-full ${
                          type === 'PREVENTIVE' ? 'bg-green-500' :
                          type === 'CORRECTIVE' ? 'bg-red-500' :
                          type === 'PREDICTIVE' ? 'bg-blue-500' :
                          'bg-orange-500'
                        }`}></div>
                        <span className="text-sm font-medium dark:text-white">{type}</span>
                      </div>
                      <span className="text-sm text-muted-foreground">{count}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="work-orders" className="space-y-6">
          <DataTable
            data={allWorkOrders}
            columns={columns}
            searchable={true}
            filterable={true}
            exportable={true}
            loading={isLoading}
            emptyMessage="No work orders found. Create your first work order to get started."
          />
        </TabsContent>

        <TabsContent value="schedule" className="space-y-6">
          <Card>
            <CardContent className="p-6">
              <div className="mb-4">
                <h3 className="text-lg font-semibold">Scheduled Work Orders</h3>
                <p className="text-sm text-muted-foreground">Upcoming work orders by date</p>
              </div>
              <div className="space-y-4">
                {allWorkOrders
                  .filter((wo: any) => wo.scheduledDate)
                  .sort((a: any, b: any) => new Date(a.scheduledDate).getTime() - new Date(b.scheduledDate).getTime())
                  .slice(0, 10)
                  .map((workOrder: any) => (
                  <div key={workOrder.id} className="flex items-center space-x-4 p-4 border rounded-lg">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-50">
                      <Calendar className="h-5 w-5 text-blue-600" />
                    </div>
                    <div className="flex-1">
                      <div className="font-medium dark:text-white">{workOrder.workOrderNumber}</div>
                      <div className="text-sm text-muted-foreground">{workOrder.equipment?.code} - {workOrder.title}</div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-medium">{format(new Date(workOrder.scheduledDate), 'MMM dd, yyyy')}</div>
                      <div className="flex items-center space-x-2 mt-1">
                        {getStatusBadge(workOrder.status)}
                        {getPriorityBadge(workOrder.priority)}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardContent className="p-6">
                <div className="mb-4">
                  <h3 className="text-lg font-semibold">Status Distribution</h3>
                  <p className="text-sm text-muted-foreground">Current status of all work orders</p>
                </div>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="h-3 w-3 rounded-full bg-blue-500"></div>
                      <span className="text-sm font-medium dark:text-white">Open</span>
                    </div>
                    <span className="text-sm text-muted-foreground">{stats.open}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="h-3 w-3 rounded-full bg-orange-500"></div>
                      <span className="text-sm font-medium dark:text-white">In Progress</span>
                    </div>
                    <span className="text-sm text-muted-foreground">{stats.inProgress}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="h-3 w-3 rounded-full bg-green-500"></div>
                      <span className="text-sm font-medium dark:text-white">Completed</span>
                    </div>
                    <span className="text-sm text-muted-foreground">{stats.completed}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="mb-4">
                  <h3 className="text-lg font-semibold">Priority Distribution</h3>
                  <p className="text-sm text-muted-foreground">Work orders by priority level</p>
                </div>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="h-3 w-3 rounded-full bg-red-500"></div>
                      <span className="text-sm font-medium dark:text-white">High</span>
                    </div>
                    <span className="text-sm text-muted-foreground">
                      {allWorkOrders.filter((wo: any) => wo.priority === 'HIGH').length}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="h-3 w-3 rounded-full bg-yellow-500"></div>
                      <span className="text-sm font-medium dark:text-white">Medium</span>
                    </div>
                    <span className="text-sm text-muted-foreground">
                      {allWorkOrders.filter((wo: any) => wo.priority === 'MEDIUM').length}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="h-3 w-3 rounded-full bg-muted"></div>
                      <span className="text-sm font-medium dark:text-white">Low</span>
                    </div>
                    <span className="text-sm text-muted-foreground">
                      {allWorkOrders.filter((wo: any) => wo.priority === 'LOW').length}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      {/* Work Order Details Modal */}
      {selectedWorkOrder && (
        <Card className="fixed inset-4 z-50 overflow-auto">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="flex items-center space-x-3 text-2xl font-bold dark:text-white">
                  <FileText className="h-6 w-6 text-blue-600" />
                  <span>{selectedWorkOrder.workOrderNumber}</span>
                </h2>
                <p className="text-muted-foreground mt-1">{selectedWorkOrder.title}</p>
              </div>
              <Button variant="outline" onClick={() => setSelectedWorkOrder(null)}>
                Close
              </Button>
            </div>
            <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">Equipment</Label>
                  <p className="text-sm">{selectedWorkOrder.equipment?.code} - {selectedWorkOrder.equipment?.name}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">Type</Label>
                  <div className="mt-1">{getTypeBadge(selectedWorkOrder.workOrderType)}</div>
                </div>
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">Priority</Label>
                  <div className="mt-1">{getPriorityBadge(selectedWorkOrder.priority)}</div>
                </div>
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">Status</Label>
                  <div className="mt-1">{getStatusBadge(selectedWorkOrder.status)}</div>
                </div>
              </div>
              <div className="space-y-4">
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">Scheduled Date</Label>
                  <p className="text-sm">
                    {selectedWorkOrder.scheduledDate ? 
                      format(new Date(selectedWorkOrder.scheduledDate), 'MMM dd, yyyy') : 
                      'Not scheduled'
                    }
                  </p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">Estimated Duration</Label>
                  <p className="text-sm">{selectedWorkOrder.estimatedDuration || 0} hours</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">Estimated Cost</Label>
                  <p className="text-sm">${Number(selectedWorkOrder.estimatedCost || 0).toLocaleString()}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">Created</Label>
                  <p className="text-sm">{format(new Date(selectedWorkOrder.createdAt), 'MMM dd, yyyy')}</p>
                </div>
              </div>
            </div>
            {selectedWorkOrder.description && (
              <div className="mt-6">
                <Label className="text-sm font-medium text-muted-foreground">Description</Label>
                <p className="text-sm mt-1">{selectedWorkOrder.description}</p>
              </div>
            )}
            {selectedWorkOrder.problemDescription && (
              <div className="mt-6">
                <Label className="text-sm font-medium text-muted-foreground">Problem Description</Label>
                <p className="text-sm mt-1">{selectedWorkOrder.problemDescription}</p>
              </div>
            )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Work Order Form Modal */}
      {isFormOpen && (
        <Card className="fixed inset-4 z-50 overflow-auto">
          <CardContent className="p-6">
            <div className="mb-6">
              <h2 className="text-2xl font-bold dark:text-white">
                {editingWorkOrder ? 'Edit Work Order' : 'Create New Work Order'}
              </h2>
              <p className="text-muted-foreground mt-1">
                {editingWorkOrder ? 'Update work order details' : 'Create a new work order for equipment maintenance'}
              </p>
            </div>
            <div className="space-y-6">
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
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

                <div className="space-y-2">
                  <Label htmlFor="workOrderType">Work Order Type *</Label>
                  <Select onValueChange={(value) => setValue('workOrderType', value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select type" />
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

                <div className="space-y-2">
                  <Label htmlFor="priority">Priority *</Label>
                  <Select onValueChange={(value) => setValue('priority', value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select priority" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="HIGH">High</SelectItem>
                      <SelectItem value="MEDIUM">Medium</SelectItem>
                      <SelectItem value="LOW">Low</SelectItem>
                    </SelectContent>
                  </Select>
                  {errors.priority && (
                    <p className="text-sm text-red-600">{errors.priority.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="scheduledDate">Scheduled Date</Label>
                  <Input
                    id="scheduledDate"
                    type="date"
                    {...register('scheduledDate')}
                    className="w-full"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="estimatedDuration">Estimated Duration (Hours)</Label>
                  <Input
                    id="estimatedDuration"
                    type="number"
                    {...register('estimatedDuration', { valueAsNumber: true })}
                    placeholder="0"
                    className="w-full"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="estimatedCost">Estimated Cost</Label>
                  <Input
                    id="estimatedCost"
                    type="number"
                    step="0.01"
                    {...register('estimatedCost', { valueAsNumber: true })}
                    placeholder="0.00"
                    className="w-full"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="title">Title *</Label>
                <Input
                  id="title"
                  {...register('title')}
                  placeholder="Work order title"
                  className="w-full"
                />
                {errors.title && (
                  <p className="text-sm text-red-600">{errors.title.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  {...register('description')}
                  placeholder="Work order description..."
                  className="w-full"
                  rows={3}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="problemDescription">Problem Description</Label>
                <Textarea
                  id="problemDescription"
                  {...register('problemDescription')}
                  placeholder="Describe the problem or issue..."
                  className="w-full"
                  rows={3}
                />
              </div>

              <div className="flex gap-3 pt-6">
                <Button 
                  type="submit" 
                  disabled={createWorkOrder.isPending || updateWorkOrder.isPending}
                  className="bg-blue-600 hover:bg-blue-700 text-white"
                >
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
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
