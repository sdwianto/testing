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
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

import { Card, CardContent } from '@/components/ui/card';
import { DataTable, type Column } from '@/components/ui/data-table';
import { DashboardSkeleton } from '@/components/ui/loading-skeleton';
import { 
  Plus, Edit, Trash2, Eye, 
  Wrench, Calendar, Clock, AlertTriangle, 
  CheckCircle, Settings, TrendingUp,
  Package, DollarSign
} from 'lucide-react';
import { trpc } from '@/lib/trpc';
import { toast } from 'sonner';
import { format } from 'date-fns';

// ========================================
// MODERN MAINTENANCE MANAGEMENT COMPONENT
// Enterprise-grade UI with modern design
// ========================================

type MaintenanceScheduleFormData = {
  equipmentId: string;
  scheduleName: string;
  maintenanceType: string;
  frequencyType: string;
  frequencyValue: number;
  nextMaintenanceDate: string;
  estimatedDuration?: number;
  estimatedCost: number;
};

interface ModernMaintenanceManagementProps {
  onSuccess?: () => void;
}

export function ModernMaintenanceManagement({ onSuccess }: ModernMaintenanceManagementProps) {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingSchedule, setEditingSchedule] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [equipmentFilter, setEquipmentFilter] = useState<string>('all');
  const [selectedSchedule, setSelectedSchedule] = useState<any>(null);
  const [activeTab, setActiveTab] = useState('overview');

  const { register, handleSubmit, formState: { errors }, setValue, reset } = useForm<MaintenanceScheduleFormData>({
    defaultValues: {
      equipmentId: '',
      scheduleName: '',
      maintenanceType: 'PREVENTIVE',
      frequencyType: 'DAYS',
      frequencyValue: 30,
      nextMaintenanceDate: '',
      estimatedDuration: 0,
      estimatedCost: 0,
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
  const { data: maintenanceSchedules, isLoading, refetch } = trpc.ops.listMaintenanceSchedules.useQuery({
    limit: 50,
    type: typeFilter === 'all' ? undefined : typeFilter,
    equipmentId: equipmentFilter === 'all' ? undefined : equipmentFilter,
    search: debouncedSearchTerm.length >= 2 ? debouncedSearchTerm : undefined,
  });

  const { data: equipment } = trpc.ops.listEquipment.useQuery({ limit: 1000 });
  const { data: maintenanceHistory } = trpc.ops.getMaintenanceHistory.useQuery({
    from: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
    to: new Date().toISOString(),
  });

  const { data: maintenanceMetrics } = trpc.ops.getMaintenanceMetrics.useQuery({
    timeRange: 30,
  });

  const createMaintenanceSchedule = (trpc.ops.createMaintenanceSchedule as any).useMutation({
    onSuccess: () => {
      toast.success('Maintenance schedule created successfully');
      reset();
      setIsFormOpen(false);
      void refetch();
      onSuccess?.();
    },
    onError: (error: any) => {
      toast.error(`Failed to create maintenance schedule: ${error.message}`);
    },
  });

  const updateMaintenanceSchedule = (trpc.ops.updateMaintenanceSchedule as any).useMutation({
    onSuccess: () => {
      toast.success('Maintenance schedule updated successfully');
      reset();
      setIsFormOpen(false);
      setEditingSchedule(null);
      void refetch();
      onSuccess?.();
    },
    onError: (error: any) => {
      toast.error(`Failed to update maintenance schedule: ${error.message}`);
    },
  });

  const deleteMaintenanceSchedule = (trpc.ops.deleteMaintenanceSchedule as any).useMutation({
    onSuccess: () => {
      toast.success('Maintenance schedule deleted successfully');
      void refetch();
    },
    onError: (error: any) => {
      toast.error(`Failed to delete maintenance schedule: ${error.message}`);
    },
  });

  const createWorkOrderFromSchedule = (trpc.ops.createWorkOrderFromSchedule as any).useMutation({
    onSuccess: () => {
      toast.success('Work order created from schedule successfully');
      void refetch();
    },
    onError: (error: any) => {
      toast.error(`Failed to create work order: ${error.message}`);
    },
  });

  const onSubmit = async (data: MaintenanceScheduleFormData) => {
    if (editingSchedule) {
      await updateMaintenanceSchedule.mutateAsync({
        id: editingSchedule,
        ...data,
        nextMaintenanceDate: new Date(data.nextMaintenanceDate).toISOString(),
        idempotencyKey: crypto.randomUUID(),
      });
    } else {
      await createMaintenanceSchedule.mutateAsync({
        ...data,
        nextMaintenanceDate: new Date(data.nextMaintenanceDate).toISOString(),
        idempotencyKey: crypto.randomUUID(),
      });
    }
  };

  const handleEdit = (schedule: any) => {
    setEditingSchedule(schedule.id);
    setValue('equipmentId', schedule.equipmentId);
    setValue('scheduleName', schedule.scheduleName);
    setValue('maintenanceType', schedule.maintenanceType);
    setValue('frequencyType', schedule.frequencyType);
    setValue('frequencyValue', schedule.frequencyValue);
    setValue('nextMaintenanceDate', format(new Date(schedule.nextMaintenanceDate), 'yyyy-MM-dd'));
    setValue('estimatedDuration', schedule.estimatedDuration || 0);
    setValue('estimatedCost', Number(schedule.estimatedCost));
    setIsFormOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this maintenance schedule?')) {
      await deleteMaintenanceSchedule.mutateAsync({ 
        id,
        idempotencyKey: crypto.randomUUID(),
      });
    }
  };

  const handleViewDetails = (schedule: any) => {
    setSelectedSchedule(schedule);
  };

  const handleCreateWorkOrder = async (scheduleId: string) => {
    await createWorkOrderFromSchedule.mutateAsync({
      scheduleId,
      idempotencyKey: crypto.randomUUID(),
    });
  };

  // Get schedules data
  const allSchedules = useMemo(() => {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-return
    return (maintenanceSchedules?.schedules || []) as any[];
  }, [maintenanceSchedules]);

  // Calculate statistics
  const stats = useMemo(() => {
    const total = allSchedules.length;
    const overdue = allSchedules.filter((s: any) => isOverdue(s.nextMaintenanceDate)).length;
    const dueSoon = allSchedules.filter((s: any) => isDueSoon(s.nextMaintenanceDate)).length;
    const completed = maintenanceHistory?.filter((h: any) => h.status === 'COMPLETED').length || 0;

    return { total, overdue, dueSoon, completed };
  }, [allSchedules, maintenanceHistory]);

  const getTypeBadge = (type: string) => {
    const typeConfig = {
      PREVENTIVE: { variant: 'default' as const, color: 'bg-green-100 text-green-800' },
      PREDICTIVE: { variant: 'default' as const, color: 'bg-blue-100 text-blue-800' },
      CONDITION_BASED: { variant: 'default' as const, color: 'bg-orange-100 text-orange-800' },
    };
    
    const config = typeConfig[type as keyof typeof typeConfig] || typeConfig.PREVENTIVE;
    
    return (
      <Badge variant={config.variant} className={config.color}>
        {type.replace('_', ' ')}
      </Badge>
    );
  };

  const getFrequencyText = (type: string, value: number) => {
    const typeText = {
      HOURS: 'hours',
      DAYS: 'days',
      WEEKS: 'weeks',
      MONTHS: 'months',
    };
    
    return `Every ${value} ${typeText[type as keyof typeof typeText] || 'units'}`;
  };

  const isOverdue = (nextDate: string) => {
    return new Date(nextDate) < new Date();
  };

  const isDueSoon = (nextDate: string) => {
    const next = new Date(nextDate);
    const now = new Date();
    const diffDays = (next.getTime() - now.getTime()) / (1000 * 60 * 60 * 24);
    return diffDays <= 7 && diffDays >= 0;
  };

  // Table columns
  const columns: Column<any>[] = [
    {
      key: 'scheduleName',
      label: 'Schedule Name',
      sortable: true,
      render: (value, row) => (
        <div className="flex items-center space-x-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-50">
            <Calendar className="h-4 w-4 text-blue-600" />
          </div>
          <div>
            <div className="font-medium dark:text-white">{value as string}</div>
            <div className="text-sm text-muted-foreground">{row.equipment?.code}</div>
          </div>
        </div>
      )
    },
    {
      key: 'maintenanceType',
      label: 'Type',
      sortable: true,
      render: (value) => getTypeBadge(value as string)
    },
    {
      key: 'frequencyType',
      label: 'Frequency',
      sortable: true,
      render: (value, row) => getFrequencyText(value as string, row.frequencyValue)
    },
    {
      key: 'nextMaintenanceDate',
      label: 'Next Maintenance',
      sortable: true,
      render: (value) => (
        <div className="flex items-center space-x-2">
          <span>{format(new Date(value as string), 'MMM dd, yyyy')}</span>
          {isOverdue(value as string) && (
            <Badge variant="destructive" className="text-xs">Overdue</Badge>
          )}
          {isDueSoon(value as string) && !isOverdue(value as string) && (
            <Badge variant="default" className="text-xs bg-orange-600">Due Soon</Badge>
          )}
        </div>
      )
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
      key: 'isActive',
      label: 'Status',
      sortable: true,
      render: (value) => (
        <Badge variant={value ? "default" : "secondary"}>
          {value ? "Active" : "Inactive"}
        </Badge>
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
          <Button
            variant="ghost"
            size="sm"
            onClick={() => handleCreateWorkOrder(row.id)}
            disabled={createWorkOrderFromSchedule.isPending}
          >
            <Wrench className="h-4 w-4" />
          </Button>
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
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold dark:text-white dark:text-white">Maintenance Management</h1>
          <p className="text-muted-foreground dark:text-gray-400 mt-2">Schedule and track equipment maintenance with predictive insights</p>
        </div>
        <Button 
          onClick={() => setIsFormOpen(true)}
          className="bg-blue-600 hover:bg-blue-700 text-white"
        >
          <Plus className="h-4 w-4 mr-2" />
          Create Schedule
        </Button>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              <div className="ml-2">
                <p className="text-sm font-medium text-muted-foreground">Total Schedules</p>
                <p className="text-2xl font-bold">{stats.total}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center">
              <AlertTriangle className="h-4 w-4 text-red-500" />
              <div className="ml-2">
                <p className="text-sm font-medium text-muted-foreground">Overdue</p>
                <p className="text-2xl font-bold text-red-600">{stats.overdue}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center">
              <Clock className="h-4 w-4 text-yellow-500" />
              <div className="ml-2">
                <p className="text-sm font-medium text-muted-foreground">Due Soon</p>
                <p className="text-2xl font-bold text-yellow-600">{stats.dueSoon}</p>
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
      </div>

      {/* KPI Cards */}
      {maintenanceMetrics && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center">
                <DollarSign className="h-4 w-4 text-green-500" />
                <div className="ml-2">
                  <p className="text-sm font-medium text-muted-foreground">Total Cost</p>
                  <p className="text-2xl font-bold text-green-600">${maintenanceMetrics.totalMaintenanceCost.toLocaleString()}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center">
                <Clock className="h-4 w-4 text-blue-500" />
                <div className="ml-2">
                  <p className="text-sm font-medium text-muted-foreground">Average MTTR</p>
                  <p className="text-2xl font-bold text-blue-600">{maintenanceMetrics.averageMTTR}h</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center">
                <TrendingUp className="h-4 w-4 text-purple-500" />
                <div className="ml-2">
                  <p className="text-sm font-medium text-muted-foreground">Average MTBF</p>
                  <p className="text-2xl font-bold text-purple-600">{maintenanceMetrics.averageMTBF}h</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Main Content */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="schedules">Schedules</TabsTrigger>
          <TabsTrigger value="history">History</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardContent className="p-6">
                <div className="mb-4">
                  <h3 className="text-lg font-semibold">Upcoming Maintenance</h3>
                  <p className="text-sm text-muted-foreground">Next scheduled maintenance activities</p>
                </div>
                <div className="space-y-4">
                  {allSchedules
                    .sort((a: any, b: any) => new Date(a.nextMaintenanceDate).getTime() - new Date(b.nextMaintenanceDate).getTime())
                    .slice(0, 5)
                    .map((schedule: any) => (
                    <div key={schedule.id} className="flex items-center space-x-4 p-3 rounded-lg hover:bg-muted/50">
                      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-50">
                        <Calendar className="h-5 w-5 text-blue-600" />
                      </div>
                      <div className="flex-1">
                        <div className="font-medium dark:text-white">{schedule.scheduleName}</div>
                        <div className="text-sm text-muted-foreground">{schedule.equipment?.code}</div>
                      </div>
                      <div className="text-right">
                        <div className="text-sm font-medium">{format(new Date(schedule.nextMaintenanceDate), 'MMM dd')}</div>
                        {isOverdue(schedule.nextMaintenanceDate) && (
                          <Badge variant="destructive" className="text-xs mt-1">Overdue</Badge>
                        )}
                        {isDueSoon(schedule.nextMaintenanceDate) && !isOverdue(schedule.nextMaintenanceDate) && (
                          <Badge variant="default" className="text-xs bg-orange-600 mt-1">Due Soon</Badge>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="mb-4">
                  <h3 className="text-lg font-semibold">Maintenance by Type</h3>
                  <p className="text-sm text-muted-foreground">Distribution of maintenance activities</p>
                </div>
                <div className="space-y-4">
                  {Object.entries(
                    allSchedules.reduce((acc: Record<string, number>, schedule: any) => {
                      acc[schedule.maintenanceType] = (acc[schedule.maintenanceType] || 0) + 1;
                      return acc;
                    }, {} as Record<string, number>)
                  ).map(([type, count]) => (
                    <div key={type} className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className={`h-3 w-3 rounded-full ${
                          type === 'PREVENTIVE' ? 'bg-green-500' :
                          type === 'PREDICTIVE' ? 'bg-blue-500' :
                          'bg-orange-500'
                        }`}></div>
                        <span className="text-sm font-medium dark:text-white">{type.replace('_', ' ')}</span>
                      </div>
                      <span className="text-sm text-muted-foreground">{count}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="schedules" className="space-y-6">
          <DataTable
            data={allSchedules}
            columns={columns}
            searchable={true}
            filterable={true}
            exportable={true}
            loading={isLoading}
            emptyMessage="No maintenance schedules found. Create your first schedule to get started."
          />
        </TabsContent>

        <TabsContent value="history" className="space-y-6">
          <Card>
            <CardContent className="p-6">
              <div className="mb-4">
                <h3 className="text-lg font-semibold">Maintenance History</h3>
                <p className="text-sm text-muted-foreground">Recent maintenance activities and work orders</p>
              </div>
              <div className="space-y-4">
                {maintenanceHistory?.slice(0, 10).map((history: any) => (
                  <div key={history.id} className="flex items-center space-x-4 p-4 border rounded-lg">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-muted">
                      <Wrench className="h-5 w-5 text-muted-foreground" />
                    </div>
                    <div className="flex-1">
                      <div className="font-medium dark:text-white">{history.workOrderNumber}</div>
                      <div className="text-sm text-muted-foreground">{history.equipment?.code} - {history.equipment?.name}</div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-medium">{format(new Date(history.date), 'MMM dd, yyyy')}</div>
                      <Badge variant={history.status === 'COMPLETED' ? 'default' : 'secondary'} className="mt-1">
                        {history.status}
                      </Badge>
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
                  <h3 className="text-lg font-semibold">Maintenance Trends</h3>
                  <p className="text-sm text-muted-foreground">Performance metrics and trends</p>
                </div>
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Total Work Orders</span>
                    <span className="font-semibold">{maintenanceMetrics?.totalWorkOrders || 0}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Completed Work Orders</span>
                    <span className="font-semibold">{maintenanceMetrics?.completedWorkOrders || 0}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Completion Rate</span>
                    <span className="font-semibold">
                      {maintenanceMetrics?.totalWorkOrders && maintenanceMetrics.totalWorkOrders > 0 
                        ? Math.round((maintenanceMetrics.completedWorkOrders / maintenanceMetrics.totalWorkOrders) * 100)
                        : 0}%
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="mb-4">
                  <h3 className="text-lg font-semibold">Cost Analysis</h3>
                  <p className="text-sm text-muted-foreground">Maintenance cost breakdown and insights</p>
                </div>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="h-3 w-3 rounded-full bg-blue-500"></div>
                      <span className="text-sm font-medium dark:text-white">Labor</span>
                    </div>
                    <span className="text-sm text-muted-foreground">60%</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="h-3 w-3 rounded-full bg-green-500"></div>
                      <span className="text-sm font-medium dark:text-white">Parts</span>
                    </div>
                    <span className="text-sm text-muted-foreground">30%</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="h-3 w-3 rounded-full bg-orange-500"></div>
                      <span className="text-sm font-medium dark:text-white">Materials</span>
                    </div>
                    <span className="text-sm text-muted-foreground">10%</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      {/* Schedule Details Modal */}
      {selectedSchedule && (
        <Card className="fixed inset-4 z-50 overflow-auto">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="flex items-center space-x-3 text-2xl font-bold dark:text-white">
                  <Settings className="h-6 w-6 text-blue-600" />
                  <span>{selectedSchedule.scheduleName}</span>
                </h2>
                <p className="text-muted-foreground mt-1">{selectedSchedule.equipment?.code} - {selectedSchedule.equipment?.name}</p>
              </div>
              <Button variant="outline" onClick={() => setSelectedSchedule(null)}>
                Close
              </Button>
            </div>
            <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">Maintenance Type</Label>
                  <div className="mt-1">{getTypeBadge(selectedSchedule.maintenanceType)}</div>
                </div>
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">Frequency</Label>
                  <p className="text-sm">{getFrequencyText(selectedSchedule.frequencyType, selectedSchedule.frequencyValue)}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">Next Maintenance</Label>
                  <p className="text-sm">{format(new Date(selectedSchedule.nextMaintenanceDate), 'MMM dd, yyyy')}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">Estimated Duration</Label>
                  <p className="text-sm">{selectedSchedule.estimatedDuration || 0} hours</p>
                </div>
              </div>
              <div className="space-y-4">
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">Estimated Cost</Label>
                  <p className="text-sm">${Number(selectedSchedule.estimatedCost || 0).toLocaleString()}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">Last Maintenance</Label>
                  <p className="text-sm">
                    {selectedSchedule.lastMaintenanceDate ? 
                      format(new Date(selectedSchedule.lastMaintenanceDate), 'MMM dd, yyyy') : 
                      'Never'
                    }
                  </p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">Status</Label>
                  <Badge variant={selectedSchedule.isActive ? "default" : "secondary"} className="mt-1">
                    {selectedSchedule.isActive ? "Active" : "Inactive"}
                  </Badge>
                </div>
              </div>
            </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Schedule Form Modal */}
      {isFormOpen && (
        <Card className="fixed inset-4 z-50 overflow-auto">
          <CardContent className="p-6">
            <div className="mb-6">
              <h2 className="text-2xl font-bold dark:text-white">
                {editingSchedule ? 'Edit Maintenance Schedule' : 'Create New Maintenance Schedule'}
              </h2>
              <p className="text-muted-foreground mt-1">
                {editingSchedule ? 'Update maintenance schedule details' : 'Set up a new maintenance schedule for your equipment'}
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
                  <Label htmlFor="scheduleName">Schedule Name *</Label>
                  <Input
                    id="scheduleName"
                    {...register('scheduleName')}
                    placeholder="e.g., Monthly Oil Change"
                    className="w-full"
                  />
                  {errors.scheduleName && (
                    <p className="text-sm text-red-600">{errors.scheduleName.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="maintenanceType">Maintenance Type *</Label>
                  <Select onValueChange={(value) => setValue('maintenanceType', value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="PREVENTIVE">Preventive</SelectItem>
                      <SelectItem value="PREDICTIVE">Predictive</SelectItem>
                      <SelectItem value="CONDITION_BASED">Condition Based</SelectItem>
                    </SelectContent>
                  </Select>
                  {errors.maintenanceType && (
                    <p className="text-sm text-red-600">{errors.maintenanceType.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="frequencyType">Frequency Type *</Label>
                  <Select onValueChange={(value) => setValue('frequencyType', value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select frequency type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="HOURS">Hours</SelectItem>
                      <SelectItem value="DAYS">Days</SelectItem>
                      <SelectItem value="WEEKS">Weeks</SelectItem>
                      <SelectItem value="MONTHS">Months</SelectItem>
                    </SelectContent>
                  </Select>
                  {errors.frequencyType && (
                    <p className="text-sm text-red-600">{errors.frequencyType.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="frequencyValue">Frequency Value *</Label>
                  <Input
                    id="frequencyValue"
                    type="number"
                    {...register('frequencyValue', { valueAsNumber: true })}
                    placeholder="30"
                    className="w-full"
                  />
                  {errors.frequencyValue && (
                    <p className="text-sm text-red-600">{errors.frequencyValue.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="nextMaintenanceDate">Next Maintenance Date *</Label>
                  <Input
                    id="nextMaintenanceDate"
                    type="date"
                    {...register('nextMaintenanceDate')}
                    className="w-full"
                  />
                  {errors.nextMaintenanceDate && (
                    <p className="text-sm text-red-600">{errors.nextMaintenanceDate.message}</p>
                  )}
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

              <div className="flex gap-3 pt-6">
                <Button 
                  type="submit" 
                  disabled={createMaintenanceSchedule.isPending || updateMaintenanceSchedule.isPending}
                  className="bg-blue-600 hover:bg-blue-700 text-white"
                >
                  {editingSchedule ? 'Update Schedule' : 'Create Schedule'}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setIsFormOpen(false);
                    setEditingSchedule(null);
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
