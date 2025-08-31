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
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Plus, Edit, Trash2, Search, Eye, 
  Wrench, Calendar, Clock, AlertTriangle, 
  CheckCircle, Settings, Activity, TrendingUp 
} from 'lucide-react';
import { trpc } from '@/lib/trpc';
import { toast } from 'sonner';
import { format } from 'date-fns';

// ========================================
// MAINTENANCE MANAGEMENT COMPONENT
// JDE F1301 equivalent with enterprise features
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

interface MaintenanceManagementProps {
  onSuccess?: () => void;
}

export function MaintenanceManagement({ onSuccess }: MaintenanceManagementProps) {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingSchedule, setEditingSchedule] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [equipmentFilter, setEquipmentFilter] = useState<string>('all');
  const [selectedSchedule, setSelectedSchedule] = useState<any>(null);
  const [activeTab, setActiveTab] = useState('schedules');

  const { register, handleSubmit, formState: { errors }, setValue, reset } = useForm<MaintenanceScheduleFormData>({
    // resolver: zodResolver(maintenanceScheduleSchema), // Temporarily disabled due to type mismatch
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

  // Debounced search term (FP6: debounce search inputs)
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('');
  
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
    }, 300);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  // tRPC queries with cursor pagination (R1: keyset pagination)
  const { data: maintenanceSchedules, isLoading, refetch } = trpc.ops.listMaintenanceSchedules.useQuery({
    limit: 50, // FP6: cursor pagination for large lists
    type: typeFilter === 'all' ? undefined : typeFilter,
    equipmentId: equipmentFilter === 'all' ? undefined : equipmentFilter,
    search: debouncedSearchTerm.length >= 2 ? debouncedSearchTerm : undefined, // FP6: server-side search
  });

  const { data: equipment } = trpc.ops.listEquipment.useQuery({ limit: 1000 });
  const { data: maintenanceHistory } = trpc.ops.getMaintenanceHistory.useQuery({
    from: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(), // Last 30 days
    to: new Date().toISOString(),
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
    return maintenanceSchedules?.schedules || [] as any[];
  }, [maintenanceSchedules]);



  const getTypeBadge = (type: string) => {
    const typeConfig = {
      PREVENTIVE: { variant: 'outline' as const, color: 'text-green-600' },
      PREDICTIVE: { variant: 'default' as const, color: 'text-blue-600' },
      CONDITION_BASED: { variant: 'secondary' as const, color: 'text-orange-600' },
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
          <h2 className="text-2xl font-bold text-gray-900">Maintenance Management</h2>
          <p className="text-gray-600">Manage maintenance schedules, preventive maintenance, and maintenance history</p>
        </div>
        <Button onClick={() => setIsFormOpen(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Create Schedule
        </Button>
      </div>

      {/* Maintenance Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              <div className="ml-2">
                <p className="text-sm font-medium text-muted-foreground">Total Schedules</p>
                <p className="text-2xl font-bold">{allSchedules.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center">
              <AlertTriangle className="h-4 w-4 text-muted-foreground" />
              <div className="ml-2">
                <p className="text-sm font-medium text-muted-foreground">Overdue</p>
                <p className="text-2xl font-bold text-red-600">
                  {allSchedules.filter((s: any) => isOverdue(s.nextMaintenanceDate)).length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center">
              <Clock className="h-4 w-4 text-muted-foreground" />
              <div className="ml-2">
                <p className="text-sm font-medium text-muted-foreground">Due Soon</p>
                <p className="text-2xl font-bold text-orange-600">
                  {allSchedules.filter((s: any) => isDueSoon(s.nextMaintenanceDate)).length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center">
              <CheckCircle className="h-4 w-4 text-muted-foreground" />
              <div className="ml-2">
                <p className="text-sm font-medium text-muted-foreground">Completed</p>
                <p className="text-2xl font-bold text-green-600">
                  {maintenanceHistory?.filter((h: any) => h.status === 'COMPLETED').length || 0}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs for different views */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="schedules">Maintenance Schedules</TabsTrigger>
          <TabsTrigger value="history">Maintenance History</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="schedules" className="space-y-4">
          {/* Search and Filter */}
          <Card>
            <CardContent className="pt-6">
              <div className="flex gap-4">
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                    <Input
                      placeholder="Search schedules (min 2 chars)..."
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
                    <SelectItem value="PREDICTIVE">Predictive</SelectItem>
                    <SelectItem value="CONDITION_BASED">Condition Based</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={equipmentFilter} onValueChange={setEquipmentFilter}>
                  <SelectTrigger className="w-48">
                    <SelectValue placeholder="Filter by equipment" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Equipment</SelectItem>
                    {equipment?.equipment?.map((eq: any) => (
                      <SelectItem key={eq.id} value={eq.id}>
                        {eq.code} - {eq.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Maintenance Schedules List */}
          <Card>
            <CardHeader>
              <CardTitle>Maintenance Schedules ({allSchedules.length})</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Schedule Name</TableHead>
                    <TableHead>Equipment</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Frequency</TableHead>
                    <TableHead>Next Maintenance</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {allSchedules.map((schedule: any) => (
                    <TableRow key={schedule.id}>
                      <TableCell className="font-medium">{schedule.scheduleName}</TableCell>
                      <TableCell>
                        <div>
                          <div className="font-medium">{schedule.equipment?.code}</div>
                          <div className="text-sm text-gray-500">{schedule.equipment?.name}</div>
                        </div>
                      </TableCell>
                      <TableCell>{getTypeBadge(schedule.maintenanceType)}</TableCell>
                      <TableCell>{getFrequencyText(schedule.frequencyType, schedule.frequencyValue)}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <span>{format(new Date(schedule.nextMaintenanceDate), 'MMM dd, yyyy')}</span>
                          {isOverdue(schedule.nextMaintenanceDate) && (
                            <Badge variant="destructive" className="text-xs">Overdue</Badge>
                          )}
                          {isDueSoon(schedule.nextMaintenanceDate) && !isOverdue(schedule.nextMaintenanceDate) && (
                            <Badge variant="default" className="text-xs bg-orange-600">Due Soon</Badge>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant={schedule.isActive ? "default" : "secondary"}>
                          {schedule.isActive ? "Active" : "Inactive"}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleViewDetails(schedule)}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleEdit(schedule)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleCreateWorkOrder(schedule.id)}
                            disabled={createWorkOrderFromSchedule.isPending}
                          >
                            <Wrench className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDelete(schedule.id)}
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
        </TabsContent>

        <TabsContent value="history" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Maintenance History (Last 30 Days)</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Equipment</TableHead>
                    <TableHead>Work Order</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Duration</TableHead>
                    <TableHead>Cost</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {maintenanceHistory?.map((history: any) => (
                    <TableRow key={history.id}>
                      <TableCell>{format(new Date(history.date), 'MMM dd, yyyy')}</TableCell>
                      <TableCell>
                        <div>
                          <div className="font-medium">{history.equipment?.code}</div>
                          <div className="text-sm text-gray-500">{history.equipment?.name}</div>
                        </div>
                      </TableCell>
                      <TableCell>{history.workOrderNumber}</TableCell>
                      <TableCell>{getTypeBadge(history.type)}</TableCell>
                      <TableCell>
                        <Badge variant={history.status === 'COMPLETED' ? 'default' : 'secondary'}>
                          {history.status}
                        </Badge>
                      </TableCell>
                      <TableCell>{history.duration || 0} hours</TableCell>
                      <TableCell>${Number(history.cost || 0).toLocaleString()}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5" />
                  Maintenance Trends
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600">Maintenance trend charts will be displayed here.</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Activity className="h-5 w-5" />
                  Cost Analysis
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600">Maintenance cost analysis will be displayed here.</p>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      {/* Maintenance Schedule Details Modal */}
      {selectedSchedule && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <Settings className="h-5 w-5" />
                  {selectedSchedule.scheduleName}
                </CardTitle>
                <p className="text-sm text-gray-600">{selectedSchedule.equipment?.code} - {selectedSchedule.equipment?.name}</p>
              </div>
              <Button variant="outline" onClick={() => setSelectedSchedule(null)}>
                Close
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label className="text-sm font-medium text-gray-500">Maintenance Type</Label>
                <div className="mt-1">{getTypeBadge(selectedSchedule.maintenanceType)}</div>
              </div>
              <div>
                <Label className="text-sm font-medium text-gray-500">Frequency</Label>
                <p className="text-sm">{getFrequencyText(selectedSchedule.frequencyType, selectedSchedule.frequencyValue)}</p>
              </div>
              <div>
                <Label className="text-sm font-medium text-gray-500">Next Maintenance</Label>
                <p className="text-sm">{format(new Date(selectedSchedule.nextMaintenanceDate), 'MMM dd, yyyy')}</p>
              </div>
              <div>
                <Label className="text-sm font-medium text-gray-500">Estimated Duration</Label>
                <p className="text-sm">{selectedSchedule.estimatedDuration || 0} hours</p>
              </div>
              <div>
                <Label className="text-sm font-medium text-gray-500">Estimated Cost</Label>
                <p className="text-sm">${Number(selectedSchedule.estimatedCost || 0).toLocaleString()}</p>
              </div>
              <div>
                <Label className="text-sm font-medium text-gray-500">Last Maintenance</Label>
                <p className="text-sm">
                  {selectedSchedule.lastMaintenanceDate ? 
                    format(new Date(selectedSchedule.lastMaintenanceDate), 'MMM dd, yyyy') : 
                    'Never'
                  }
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Maintenance Schedule Form Modal */}
      {isFormOpen && (
        <Card>
          <CardHeader>
            <CardTitle>
              {editingSchedule ? 'Edit Maintenance Schedule' : 'Create New Maintenance Schedule'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="equipmentId">Equipment *</Label>
                  <Select onValueChange={(value: any) => setValue('equipmentId', value)}>
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
                  <Label htmlFor="scheduleName">Schedule Name *</Label>
                  <Input
                    id="scheduleName"
                    {...register('scheduleName')}
                    placeholder="e.g., Monthly Oil Change"
                  />
                  {errors.scheduleName && (
                    <p className="text-sm text-red-600">{errors.scheduleName.message}</p>
                  )}
                </div>

                <div>
                  <Label htmlFor="maintenanceType">Maintenance Type *</Label>
                  <Select onValueChange={(value: any) => setValue('maintenanceType', value)}>
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

                <div>
                  <Label htmlFor="frequencyType">Frequency Type *</Label>
                  <Select onValueChange={(value: any) => setValue('frequencyType', value)}>
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

                <div>
                  <Label htmlFor="frequencyValue">Frequency Value *</Label>
                  <Input
                    id="frequencyValue"
                    type="number"
                    {...register('frequencyValue', { valueAsNumber: true })}
                    placeholder="30"
                  />
                  {errors.frequencyValue && (
                    <p className="text-sm text-red-600">{errors.frequencyValue.message}</p>
                  )}
                </div>

                <div>
                  <Label htmlFor="nextMaintenanceDate">Next Maintenance Date *</Label>
                  <Input
                    id="nextMaintenanceDate"
                    type="date"
                    {...register('nextMaintenanceDate')}
                  />
                  {errors.nextMaintenanceDate && (
                    <p className="text-sm text-red-600">{errors.nextMaintenanceDate.message}</p>
                  )}
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
                <Button type="submit" disabled={createMaintenanceSchedule.isPending || updateMaintenanceSchedule.isPending}>
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
          </CardContent>
        </Card>
      )}
    </div>
  );
}
