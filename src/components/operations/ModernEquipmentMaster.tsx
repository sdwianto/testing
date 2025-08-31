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
  Wrench, TrendingUp, Settings, Activity, 
  CheckCircle, Package, 
  Calendar, Clock, DollarSign, MapPin
} from 'lucide-react';
import { trpc } from '@/lib/trpc';
import { toast } from 'sonner';
import { format } from 'date-fns';

// ========================================
// MODERN EQUIPMENT MASTER COMPONENT
// Enterprise-grade UI with modern design
// ========================================

const equipmentSchema = z.object({
  code: z.string().min(1, 'Equipment code is required'),
  name: z.string().min(1, 'Equipment name is required'),
  type: z.string().min(1, 'Equipment type is required'),
  category: z.string().min(1, 'Equipment category is required'),
  description: z.string().optional(),
  manufacturer: z.string().optional(),
  model: z.string().optional(),
  serialNumber: z.string().optional(),
  yearOfManufacture: z.number().optional(),
  currentSiteId: z.string().optional(),
  currentStatus: z.string().optional(),
  parentEquipmentId: z.string().optional(),
  acquisitionCost: z.number().min(0, 'Acquisition cost must be non-negative'),
  currentValue: z.number().min(0, 'Current value must be non-negative'),
  depreciationMethod: z.string().optional(),
  usefulLife: z.number().optional(),
});

type EquipmentFormData = z.infer<typeof equipmentSchema>;

interface ModernEquipmentMasterProps {
  onSuccess?: () => void;
}

export function ModernEquipmentMaster({ onSuccess }: ModernEquipmentMasterProps) {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingEquipment, setEditingEquipment] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [selectedEquipment, setSelectedEquipment] = useState<any>(null);
  const [activeTab, setActiveTab] = useState('overview');

  const { register, handleSubmit, formState: { errors }, setValue, reset } = useForm<EquipmentFormData>({
    resolver: zodResolver(equipmentSchema),
    defaultValues: {
      code: '',
      name: '',
      type: '',
      category: '',
      description: '',
      manufacturer: '',
      model: '',
      serialNumber: '',
      yearOfManufacture: new Date().getFullYear(),
      currentSiteId: '',
      currentStatus: 'ACTIVE',
      parentEquipmentId: '',
      acquisitionCost: 0,
      currentValue: 0,
      depreciationMethod: 'STRAIGHT_LINE',
      usefulLife: 10,
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
  const { data: equipmentData, isLoading, refetch } = trpc.ops.listEquipment.useQuery({
    limit: 1000,
    type: typeFilter === 'all' ? undefined : typeFilter,
    search: debouncedSearchTerm.length >= 2 ? debouncedSearchTerm : undefined,
  });

  const { data: kpiData } = trpc.ops.getEquipmentKPIs.useQuery({
    startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
    endDate: new Date().toISOString(),
  });

  const createEquipment = (trpc.ops.createEquipment as any).useMutation({
    onSuccess: () => {
      toast.success('Equipment created successfully');
      reset();
      setIsFormOpen(false);
      void refetch();
      onSuccess?.();
    },
    onError: (error: any) => {
      toast.error(`Failed to create equipment: ${error.message}`);
    },
  });

  const updateEquipment = (trpc.ops.updateEquipment as any).useMutation({
    onSuccess: () => {
      toast.success('Equipment updated successfully');
      reset();
      setIsFormOpen(false);
      setEditingEquipment(null);
      void refetch();
      onSuccess?.();
    },
    onError: (error: any) => {
      toast.error(`Failed to update equipment: ${error.message}`);
    },
  });

  const deleteEquipment = (trpc.ops.deleteEquipment as any).useMutation({
    onSuccess: () => {
      toast.success('Equipment deleted successfully');
      void refetch();
    },
    onError: (error: any) => {
      toast.error(`Failed to delete equipment: ${error.message}`);
    },
  });

  const onSubmit = async (data: EquipmentFormData) => {
    if (editingEquipment) {
      await updateEquipment.mutateAsync({
        id: editingEquipment,
        ...data,
        idempotencyKey: crypto.randomUUID(),
      });
    } else {
      await createEquipment.mutateAsync({
        ...data,
        idempotencyKey: crypto.randomUUID(),
      });
    }
  };

  const handleEdit = (equipment: any) => {
    setEditingEquipment(equipment.id);
    setValue('code', equipment.code);
    setValue('name', equipment.name);
    setValue('type', equipment.type);
    setValue('category', equipment.category);
    setValue('description', equipment.description || '');
    setValue('manufacturer', equipment.manufacturer || '');
    setValue('model', equipment.model || '');
    setValue('serialNumber', equipment.serialNumber || '');
    setValue('yearOfManufacture', equipment.yearOfManufacture || new Date().getFullYear());
    setValue('currentSiteId', equipment.currentSiteId || '');
    setValue('currentStatus', equipment.currentStatus || 'ACTIVE');
    setValue('parentEquipmentId', equipment.parentEquipmentId || '');
    setValue('acquisitionCost', Number(equipment.acquisitionCost));
    setValue('currentValue', Number(equipment.currentValue));
    setValue('depreciationMethod', equipment.depreciationMethod || 'STRAIGHT_LINE');
    setValue('usefulLife', equipment.usefulLife || 10);
    setIsFormOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this equipment?')) {
      await deleteEquipment.mutateAsync({ 
        id,
        idempotencyKey: crypto.randomUUID(),
      });
    }
  };

  const handleViewDetails = (equipment: any) => {
    setSelectedEquipment(equipment);
  };

  // Get equipment data
  const allEquipment = useMemo(() => {
    return equipmentData?.equipment || [];
  }, [equipmentData]) as any[];

  // Calculate statistics
  const stats = useMemo(() => {
    const total = allEquipment.length;
    const active = allEquipment.filter((eq: any) => eq.currentStatus === 'ACTIVE').length;
    const maintenance = allEquipment.filter((eq: any) => eq.currentStatus === 'MAINTENANCE').length;
    const totalValue = allEquipment.reduce((sum: number, eq: any) => sum + Number(eq.currentValue || 0), 0);

    return { total, active, maintenance, totalValue };
  }, [allEquipment]);

  // Table columns
  const columns: Column<any>[] = [
    {
      key: 'code',
      label: 'Code',
      sortable: true,
      render: (value, row) => (
        <div className="flex items-center space-x-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-50">
            <Package className="h-4 w-4 text-blue-600" />
          </div>
          <div>
            <div className="font-medium dark:text-white">{value as string}</div>
            <div className="text-sm text-muted-foreground">{row.name}</div>
          </div>
        </div>
      )
    },
    {
      key: 'type',
      label: 'Type',
      sortable: true,
      render: (value) => (
        <Badge variant="outline" className="text-xs">
          {value as string}
        </Badge>
      )
    },
    {
      key: 'currentStatus',
      label: 'Status',
      sortable: true,
      render: (value) => {
        const statusConfig = {
          ACTIVE: { variant: 'default' as const, color: 'bg-green-100 text-green-800' },
          MAINTENANCE: { variant: 'default' as const, color: 'bg-orange-100 text-orange-800' },
          INACTIVE: { variant: 'secondary' as const, color: 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-100' },
        };
        
        const config = statusConfig[value as keyof typeof statusConfig] || statusConfig.INACTIVE;
        
        return (
          <Badge variant={config.variant} className={config.color}>
            {value as string}
          </Badge>
        );
      }
    },
    {
      key: 'currentValue',
      label: 'Current Value',
      sortable: true,
      render: (value) => (
        <div className="text-right">
          <div className="font-medium">${Number(value || 0).toLocaleString()}</div>
        </div>
      )
    },
    {
      key: 'yearOfManufacture',
      label: 'Year',
      sortable: true,
      render: (value) => (value as string) || '-'
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
          <h2 className="text-3xl font-bold dark:text-white dark:text-white">Equipment Master</h2>
          <p className="text-muted-foreground dark:text-gray-400">Manage equipment inventory and specifications</p>
        </div>
        <Button onClick={() => setIsFormOpen(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Add Equipment
        </Button>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center">
              <Package className="h-4 w-4 text-muted-foreground" />
              <div className="ml-2">
                <p className="text-sm font-medium text-muted-foreground">Total Equipment</p>
                <p className="text-2xl font-bold">{stats.total}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center">
              <CheckCircle className="h-4 w-4 text-green-500" />
              <div className="ml-2">
                <p className="text-sm font-medium text-muted-foreground">Active Equipment</p>
                <p className="text-2xl font-bold text-green-600">{stats.active}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center">
              <Wrench className="h-4 w-4 text-yellow-500" />
              <div className="ml-2">
                <p className="text-sm font-medium text-muted-foreground">Under Maintenance</p>
                <p className="text-2xl font-bold text-yellow-600">{stats.maintenance}</p>
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
                <p className="text-2xl font-bold text-purple-600">${stats.totalValue.toLocaleString()}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* KPI Cards */}
      {kpiData && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center">
                <Clock className="h-4 w-4 text-green-500" />
                <div className="ml-2">
                  <p className="text-sm font-medium text-muted-foreground">MTTR</p>
                  <p className="text-2xl font-bold text-green-600">{kpiData.mttr}h</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center">
                <TrendingUp className="h-4 w-4 text-blue-500" />
                <div className="ml-2">
                  <p className="text-sm font-medium text-muted-foreground">MTBF</p>
                  <p className="text-2xl font-bold text-blue-600">{kpiData.mtbs}h</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center">
                <Activity className="h-4 w-4 text-purple-500" />
                <div className="ml-2">
                  <p className="text-sm font-medium text-muted-foreground">Availability</p>
                  <p className="text-2xl font-bold text-purple-600">{kpiData.availability}%</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Main Content */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="equipment">Equipment List</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardContent className="p-6">
                <div className="mb-4">
                  <h3 className="text-lg font-semibold">Recent Equipment</h3>
                  <p className="text-sm text-muted-foreground">Latest equipment additions and updates</p>
                </div>
                <div className="space-y-4">
                  {allEquipment.slice(0, 5).map((equipment: any) => (
                    <div key={equipment.id} className="flex items-center space-x-4 p-3 rounded-lg hover:bg-muted/50">
                      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-50">
                        <Package className="h-5 w-5 text-blue-600" />
                      </div>
                      <div className="flex-1">
                        <div className="font-medium dark:text-white">{equipment.code}</div>
                        <div className="text-sm text-muted-foreground">{equipment.name}</div>
                      </div>
                      <Badge variant="outline" className="text-xs">
                        {equipment.currentStatus}
                      </Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="mb-4">
                  <h3 className="text-lg font-semibold">Equipment by Type</h3>
                  <p className="text-sm text-muted-foreground">Distribution of equipment categories</p>
                </div>
                <div className="space-y-4">
                  {Object.entries(
                    allEquipment.reduce((acc: Record<string, number>, eq: any) => {
                      acc[eq.type] = (acc[eq.type] || 0) + 1;
                      return acc;
                    }, {} as Record<string, number>)
                  ).map(([type, count]) => (
                    <div key={type} className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="h-3 w-3 rounded-full bg-blue-500"></div>
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

        <TabsContent value="equipment" className="space-y-6">
          <DataTable
            data={allEquipment}
            columns={columns}
            searchable={true}
            filterable={true}
            exportable={true}
            loading={isLoading}
            emptyMessage="No equipment found. Add your first equipment to get started."
          />
        </TabsContent>

        <TabsContent value="analytics" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardContent className="p-6">
                <div className="mb-4">
                  <h3 className="text-lg font-semibold">Performance Metrics</h3>
                  <p className="text-sm text-muted-foreground">Key performance indicators for equipment</p>
                </div>
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Total Operating Hours</span>
                    <span className="font-semibold">{kpiData?.totalRuntime || 0}h</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Total Downtime</span>
                    <span className="font-semibold">{kpiData?.totalDowntime || 0}h</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Total Breakdowns</span>
                    <span className="font-semibold">{kpiData?.totalBreakdowns || 0}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="mb-4">
                  <h3 className="text-lg font-semibold">Status Distribution</h3>
                  <p className="text-sm text-muted-foreground">Current status of all equipment</p>
                </div>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="h-3 w-3 rounded-full bg-green-500"></div>
                      <span className="text-sm font-medium dark:text-white">Active</span>
                    </div>
                    <span className="text-sm text-muted-foreground">{stats.active}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="h-3 w-3 rounded-full bg-orange-500"></div>
                      <span className="text-sm font-medium dark:text-white">Maintenance</span>
                    </div>
                    <span className="text-sm text-muted-foreground">{stats.maintenance}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="h-3 w-3 rounded-full bg-muted"></div>
                      <span className="text-sm font-medium dark:text-white">Inactive</span>
                    </div>
                    <span className="text-sm text-muted-foreground">{stats.total - stats.active - stats.maintenance}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      {/* Equipment Details Modal */}
      {selectedEquipment && (
        <Card className="fixed inset-4 z-50 overflow-auto">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="flex items-center space-x-3 text-2xl font-bold dark:text-white">
                  <Package className="h-6 w-6 text-blue-600" />
                  <span>{selectedEquipment.code}</span>
                </h2>
                <p className="text-muted-foreground mt-1">{selectedEquipment.name}</p>
              </div>
              <Button variant="outline" onClick={() => setSelectedEquipment(null)}>
                Close
              </Button>
            </div>
            <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">Type</Label>
                  <p className="text-sm">{selectedEquipment.type}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">Category</Label>
                  <p className="text-sm">{selectedEquipment.category}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">Manufacturer</Label>
                  <p className="text-sm">{selectedEquipment.manufacturer || 'N/A'}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">Model</Label>
                  <p className="text-sm">{selectedEquipment.model || 'N/A'}</p>
                </div>
              </div>
              <div className="space-y-4">
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">Serial Number</Label>
                  <p className="text-sm">{selectedEquipment.serialNumber || 'N/A'}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">Year of Manufacture</Label>
                  <p className="text-sm">{selectedEquipment.yearOfManufacture || 'N/A'}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">Current Value</Label>
                  <p className="text-sm">${Number(selectedEquipment.currentValue || 0).toLocaleString()}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">Status</Label>
                  <Badge variant="outline" className="mt-1">
                    {selectedEquipment.currentStatus}
                  </Badge>
                </div>
              </div>
            </div>
            {selectedEquipment.description && (
              <div className="mt-6">
                <Label className="text-sm font-medium text-muted-foreground">Description</Label>
                <p className="text-sm mt-1">{selectedEquipment.description}</p>
              </div>
            )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Equipment Form Modal */}
      {isFormOpen && (
        <Card className="fixed inset-4 z-50 overflow-auto">
          <CardContent className="p-6">
            <div className="mb-6">
              <h2 className="text-2xl font-bold dark:text-white">
                {editingEquipment ? 'Edit Equipment' : 'Add New Equipment'}
              </h2>
              <p className="text-muted-foreground mt-1">
                {editingEquipment ? 'Update equipment information' : 'Add a new equipment to your inventory'}
              </p>
            </div>
            <div className="space-y-6">
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="code">Equipment Code *</Label>
                  <Input
                    id="code"
                    {...register('code')}
                    placeholder="EQ-001"
                    className="w-full"
                  />
                  {errors.code && (
                    <p className="text-sm text-red-600">{errors.code.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="name">Equipment Name *</Label>
                  <Input
                    id="name"
                    {...register('name')}
                    placeholder="Excavator Model X"
                    className="w-full"
                  />
                  {errors.name && (
                    <p className="text-sm text-red-600">{errors.name.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="type">Type *</Label>
                  <Select onValueChange={(value) => setValue('type', value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="EXCAVATOR">Excavator</SelectItem>
                      <SelectItem value="BULLDOZER">Bulldozer</SelectItem>
                      <SelectItem value="CRANE">Crane</SelectItem>
                      <SelectItem value="TRUCK">Truck</SelectItem>
                      <SelectItem value="GENERATOR">Generator</SelectItem>
                      <SelectItem value="OTHER">Other</SelectItem>
                    </SelectContent>
                  </Select>
                  {errors.type && (
                    <p className="text-sm text-red-600">{errors.type.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="category">Category *</Label>
                  <Select onValueChange={(value) => setValue('category', value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="HEAVY_MACHINERY">Heavy Machinery</SelectItem>
                      <SelectItem value="VEHICLE">Vehicle</SelectItem>
                      <SelectItem value="TOOL">Tool</SelectItem>
                      <SelectItem value="EQUIPMENT">Equipment</SelectItem>
                    </SelectContent>
                  </Select>
                  {errors.category && (
                    <p className="text-sm text-red-600">{errors.category.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="manufacturer">Manufacturer</Label>
                  <Input
                    id="manufacturer"
                    {...register('manufacturer')}
                    placeholder="Caterpillar"
                    className="w-full"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="model">Model</Label>
                  <Input
                    id="model"
                    {...register('model')}
                    placeholder="320D"
                    className="w-full"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="serialNumber">Serial Number</Label>
                  <Input
                    id="serialNumber"
                    {...register('serialNumber')}
                    placeholder="CAT320D123456"
                    className="w-full"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="yearOfManufacture">Year of Manufacture</Label>
                  <Input
                    id="yearOfManufacture"
                    type="number"
                    {...register('yearOfManufacture', { valueAsNumber: true })}
                    placeholder="2020"
                    className="w-full"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="acquisitionCost">Acquisition Cost *</Label>
                  <Input
                    id="acquisitionCost"
                    type="number"
                    step="0.01"
                    {...register('acquisitionCost', { valueAsNumber: true })}
                    placeholder="0.00"
                    className="w-full"
                  />
                  {errors.acquisitionCost && (
                    <p className="text-sm text-red-600">{errors.acquisitionCost.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="currentValue">Current Value *</Label>
                  <Input
                    id="currentValue"
                    type="number"
                    step="0.01"
                    {...register('currentValue', { valueAsNumber: true })}
                    placeholder="0.00"
                    className="w-full"
                  />
                  {errors.currentValue && (
                    <p className="text-sm text-red-600">{errors.currentValue.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="currentStatus">Status</Label>
                  <Select onValueChange={(value) => setValue('currentStatus', value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="ACTIVE">Active</SelectItem>
                      <SelectItem value="MAINTENANCE">Maintenance</SelectItem>
                      <SelectItem value="INACTIVE">Inactive</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="usefulLife">Useful Life (Years)</Label>
                  <Input
                    id="usefulLife"
                    type="number"
                    {...register('usefulLife', { valueAsNumber: true })}
                    placeholder="10"
                    className="w-full"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  {...register('description')}
                  placeholder="Additional equipment details..."
                  className="w-full"
                  rows={3}
                />
              </div>

              <div className="flex gap-3 pt-6">
                <Button 
                  type="submit" 
                  disabled={createEquipment.isPending || updateEquipment.isPending}
                  className="bg-blue-600 hover:bg-blue-700 text-white"
                >
                  {editingEquipment ? 'Update Equipment' : 'Add Equipment'}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setIsFormOpen(false);
                    setEditingEquipment(null);
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
