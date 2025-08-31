'use client';

/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-floating-promises */
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
  Wrench, TrendingUp, 
  Settings, Activity, AlertTriangle, CheckCircle 
} from 'lucide-react';
import { trpc } from '@/lib/trpc';
import { toast } from 'sonner';
import { EquipmentSpecifications } from '@/components/operations/EquipmentSpecifications';
import { EquipmentDocuments } from '@/components/operations/EquipmentDocuments';

// ========================================
// ENHANCED EQUIPMENT MASTER COMPONENT
// JDE F1201 equivalent with enterprise features
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

interface EnhancedEquipmentMasterProps {
  onSuccess?: () => void;
}

export function EnhancedEquipmentMaster({ onSuccess }: EnhancedEquipmentMasterProps) {
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

  // Debounced search term (FP6: debounce search inputs)
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('');
  
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
    }, 300);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  // tRPC queries with cursor pagination (R1: keyset pagination)
  const { data: equipment, isLoading, refetch } = trpc.ops.listEquipment.useQuery({
    limit: 50, // FP6: cursor pagination for large lists
    type: typeFilter === 'all' ? undefined : typeFilter,
    search: debouncedSearchTerm.length >= 2 ? debouncedSearchTerm : undefined, // FP6: server-side search
  });

  const { data: sites } = trpc.core.getSites.useQuery();
  const { data: equipmentList } = trpc.ops.listEquipment.useQuery({ limit: 1000 }); // For parent equipment selection

  const createEquipment = (trpc.ops.createEquipment as any).useMutation({
    onSuccess: () => {
      toast.success('Equipment created successfully');
      reset();
      setIsFormOpen(false);
      refetch();
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
      refetch();
      onSuccess?.();
    },
    onError: (error: any) => {
      toast.error(`Failed to update equipment: ${error.message}`);
    },
  });

  const deleteEquipment = (trpc.ops.deleteEquipment as any).useMutation({
    onSuccess: () => {
      toast.success('Equipment deleted successfully');
      refetch();
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
    setActiveTab('overview');
  };

  // Flatten paginated results
  const allEquipment = useMemo(() => {
    return equipment?.equipment || [];
  }, [equipment]);



  const getStatusBadge = (status: string) => {
    const statusConfig = {
      ACTIVE: { variant: 'default' as const, icon: CheckCircle, color: 'text-green-600' },
      INACTIVE: { variant: 'secondary' as const, icon: AlertTriangle, color: 'text-gray-600' },
      MAINTENANCE: { variant: 'destructive' as const, icon: Wrench, color: 'text-orange-600' },
      REPAIR: { variant: 'destructive' as const, icon: AlertTriangle, color: 'text-red-600' },
      DISPOSED: { variant: 'outline' as const, icon: Trash2, color: 'text-gray-500' },
    };
    
    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.INACTIVE;
    const Icon = config.icon;
    
    return (
      <Badge variant={config.variant} className="flex items-center gap-1">
        <Icon className={`h-3 w-3 ${config.color}`} />
        {status}
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
          <h2 className="text-2xl font-bold text-gray-900">Equipment Master</h2>
          <p className="text-gray-600">Manage equipment inventory, specifications, and lifecycle</p>
        </div>
        <Button onClick={() => setIsFormOpen(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Add Equipment
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
                  placeholder="Search equipment (min 2 chars)..."
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
                <SelectItem value="EXCAVATOR">Excavator</SelectItem>
                <SelectItem value="BULLDOZER">Bulldozer</SelectItem>
                <SelectItem value="LOADER">Loader</SelectItem>
                <SelectItem value="TRUCK">Truck</SelectItem>
                <SelectItem value="CRANE">Crane</SelectItem>
                <SelectItem value="GENERATOR">Generator</SelectItem>
                <SelectItem value="COMPRESSOR">Compressor</SelectItem>
              </SelectContent>
            </Select>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="ACTIVE">Active</SelectItem>
                <SelectItem value="INACTIVE">Inactive</SelectItem>
                <SelectItem value="MAINTENANCE">Maintenance</SelectItem>
                <SelectItem value="REPAIR">Repair</SelectItem>
                <SelectItem value="DISPOSED">Disposed</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Equipment List */}
      <Card>
        <CardHeader>
          <CardTitle>Equipment List ({allEquipment.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Code</TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Manufacturer</TableHead>
                <TableHead>Model</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Utilization</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {allEquipment.map((equipment: any) => (
                <TableRow key={equipment.id}>
                  <TableCell className="font-medium">{equipment.code}</TableCell>
                  <TableCell>{equipment.name}</TableCell>
                  <TableCell>
                    <Badge variant="outline">{equipment.type}</Badge>
                  </TableCell>
                  <TableCell>{equipment.manufacturer || '-'}</TableCell>
                  <TableCell>{equipment.model || '-'}</TableCell>
                  <TableCell>{getStatusBadge(equipment.currentStatus)}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <div className="w-16 bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-blue-600 h-2 rounded-full" 
                          style={{ width: `${Number(equipment.utilizationRate || 0)}%` }}
                        ></div>
                      </div>
                      <span className="text-sm text-gray-600">
                        {Number(equipment.utilizationRate || 0).toFixed(1)}%
                      </span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleViewDetails(equipment)}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleEdit(equipment)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDelete(equipment.id)}
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

      {/* Equipment Details Modal */}
      {selectedEquipment && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <Settings className="h-5 w-5" />
                  {selectedEquipment.name} ({selectedEquipment.code})
                </CardTitle>
                <p className="text-sm text-gray-600">{selectedEquipment.description}</p>
              </div>
              <Button variant="outline" onClick={() => setSelectedEquipment(null)}>
                Close
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="grid w-full grid-cols-5">
                <TabsTrigger value="overview">Overview</TabsTrigger>
                <TabsTrigger value="specifications">Specifications</TabsTrigger>
                <TabsTrigger value="documents">Documents</TabsTrigger>
                <TabsTrigger value="performance">Performance</TabsTrigger>
                <TabsTrigger value="maintenance">Maintenance</TabsTrigger>
              </TabsList>
              
              <TabsContent value="overview" className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label className="text-sm font-medium text-gray-500">Manufacturer</Label>
                    <p className="text-sm">{selectedEquipment.manufacturer || '-'}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-gray-500">Model</Label>
                    <p className="text-sm">{selectedEquipment.model || '-'}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-gray-500">Serial Number</Label>
                    <p className="text-sm">{selectedEquipment.serialNumber || '-'}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-gray-500">Year of Manufacture</Label>
                    <p className="text-sm">{selectedEquipment.yearOfManufacture || '-'}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-gray-500">Current Status</Label>
                    <div className="mt-1">{getStatusBadge(selectedEquipment.currentStatus)}</div>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-gray-500">Current Location</Label>
                    <p className="text-sm">{selectedEquipment.currentSiteId || '-'}</p>
                  </div>
                </div>
              </TabsContent>
              
              <TabsContent value="specifications" className="space-y-4">
                <EquipmentSpecifications equipmentId={selectedEquipment.id} />
              </TabsContent>
              
              <TabsContent value="documents" className="space-y-4">
                <EquipmentDocuments equipmentId={selectedEquipment.id} />
              </TabsContent>
              
              <TabsContent value="performance" className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Card>
                    <CardContent className="pt-6">
                      <div className="flex items-center">
                        <Activity className="h-4 w-4 text-muted-foreground" />
                        <div className="ml-2">
                          <p className="text-sm font-medium text-muted-foreground">Utilization Rate</p>
                          <p className="text-2xl font-bold">{Number(selectedEquipment.utilizationRate || 0).toFixed(1)}%</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="pt-6">
                      <div className="flex items-center">
                        <CheckCircle className="h-4 w-4 text-muted-foreground" />
                        <div className="ml-2">
                          <p className="text-sm font-medium text-muted-foreground">Availability Rate</p>
                          <p className="text-2xl font-bold">{Number(selectedEquipment.availabilityRate || 0).toFixed(1)}%</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="pt-6">
                      <div className="flex items-center">
                        <TrendingUp className="h-4 w-4 text-muted-foreground" />
                        <div className="ml-2">
                          <p className="text-sm font-medium text-muted-foreground">Total Hours</p>
                          <p className="text-2xl font-bold">{Number(selectedEquipment.totalHours || 0).toFixed(0)}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>
              
              <TabsContent value="maintenance" className="space-y-4">
                <p className="text-sm text-gray-600">Maintenance history and schedules will be displayed here.</p>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      )}

      {/* Equipment Form Modal */}
      {isFormOpen && (
        <Card>
          <CardHeader>
            <CardTitle>
              {editingEquipment ? 'Edit Equipment' : 'Add New Equipment'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <Tabs defaultValue="basic" className="w-full">
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="basic">Basic Info</TabsTrigger>
                  <TabsTrigger value="technical">Technical</TabsTrigger>
                  <TabsTrigger value="financial">Financial</TabsTrigger>
                </TabsList>
                
                <TabsContent value="basic" className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="code">Equipment Code *</Label>
                      <Input
                        id="code"
                        {...register('code')}
                        placeholder="e.g., EXC-001"
                      />
                      {errors.code && (
                        <p className="text-sm text-red-600">{errors.code.message}</p>
                      )}
                    </div>

                    <div>
                      <Label htmlFor="name">Equipment Name *</Label>
                      <Input
                        id="name"
                        {...register('name')}
                        placeholder="e.g., Excavator CAT 320"
                      />
                      {errors.name && (
                        <p className="text-sm text-red-600">{errors.name.message}</p>
                      )}
                    </div>

                    <div>
                      <Label htmlFor="type">Equipment Type *</Label>
                      <Select onValueChange={(value) => setValue('type', value)}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select type" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="EXCAVATOR">Excavator</SelectItem>
                          <SelectItem value="BULLDOZER">Bulldozer</SelectItem>
                          <SelectItem value="LOADER">Loader</SelectItem>
                          <SelectItem value="TRUCK">Truck</SelectItem>
                          <SelectItem value="CRANE">Crane</SelectItem>
                          <SelectItem value="GENERATOR">Generator</SelectItem>
                          <SelectItem value="COMPRESSOR">Compressor</SelectItem>
                        </SelectContent>
                      </Select>
                      {errors.type && (
                        <p className="text-sm text-red-600">{errors.type.message}</p>
                      )}
                    </div>

                    <div>
                      <Label htmlFor="category">Category *</Label>
                      <Select onValueChange={(value) => setValue('category', value)}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select category" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="HEAVY_EQUIPMENT">Heavy Equipment</SelectItem>
                          <SelectItem value="LIGHT_EQUIPMENT">Light Equipment</SelectItem>
                          <SelectItem value="TOOL">Tool</SelectItem>
                          <SelectItem value="VEHICLE">Vehicle</SelectItem>
                          <SelectItem value="GENERATOR">Generator</SelectItem>
                        </SelectContent>
                      </Select>
                      {errors.category && (
                        <p className="text-sm text-red-600">{errors.category.message}</p>
                      )}
                    </div>

                    <div className="md:col-span-2">
                      <Label htmlFor="description">Description</Label>
                      <Textarea
                        id="description"
                        {...register('description')}
                        placeholder="Equipment description..."
                      />
                    </div>

                    <div>
                      <Label htmlFor="currentSiteId">Current Site</Label>
                      <Select onValueChange={(value) => setValue('currentSiteId', value)}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select site" />
                        </SelectTrigger>
                        <SelectContent>
                          {sites?.map((site: any) => (
                            <SelectItem key={site.id} value={site.id}>
                              {site.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label htmlFor="currentStatus">Current Status</Label>
                      <Select onValueChange={(value) => setValue('currentStatus', value)}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select status" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="ACTIVE">Active</SelectItem>
                          <SelectItem value="INACTIVE">Inactive</SelectItem>
                          <SelectItem value="MAINTENANCE">Maintenance</SelectItem>
                          <SelectItem value="REPAIR">Repair</SelectItem>
                          <SelectItem value="DISPOSED">Disposed</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </TabsContent>
                
                <TabsContent value="technical" className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="manufacturer">Manufacturer</Label>
                      <Input
                        id="manufacturer"
                        {...register('manufacturer')}
                        placeholder="e.g., Caterpillar"
                      />
                    </div>

                    <div>
                      <Label htmlFor="model">Model</Label>
                      <Input
                        id="model"
                        {...register('model')}
                        placeholder="e.g., 320D"
                      />
                    </div>

                    <div>
                      <Label htmlFor="serialNumber">Serial Number</Label>
                      <Input
                        id="serialNumber"
                        {...register('serialNumber')}
                        placeholder="e.g., CAT0320D123456"
                      />
                    </div>

                    <div>
                      <Label htmlFor="yearOfManufacture">Year of Manufacture</Label>
                      <Input
                        id="yearOfManufacture"
                        type="number"
                        {...register('yearOfManufacture', { valueAsNumber: true })}
                        placeholder="2020"
                      />
                    </div>

                    <div>
                      <Label htmlFor="parentEquipmentId">Parent Equipment</Label>
                      <Select onValueChange={(value) => setValue('parentEquipmentId', value)}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select parent equipment" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="">None</SelectItem>
                          {equipmentList?.equipment?.map((eq: any) => (
                            <SelectItem key={eq.id} value={eq.id}>
                              {eq.code} - {eq.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </TabsContent>
                
                <TabsContent value="financial" className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="acquisitionCost">Acquisition Cost</Label>
                      <Input
                        id="acquisitionCost"
                        type="number"
                        step="0.01"
                        {...register('acquisitionCost', { valueAsNumber: true })}
                        placeholder="0.00"
                      />
                      {errors.acquisitionCost && (
                        <p className="text-sm text-red-600">{errors.acquisitionCost.message}</p>
                      )}
                    </div>

                    <div>
                      <Label htmlFor="currentValue">Current Value</Label>
                      <Input
                        id="currentValue"
                        type="number"
                        step="0.01"
                        {...register('currentValue', { valueAsNumber: true })}
                        placeholder="0.00"
                      />
                      {errors.currentValue && (
                        <p className="text-sm text-red-600">{errors.currentValue.message}</p>
                      )}
                    </div>

                    <div>
                      <Label htmlFor="depreciationMethod">Depreciation Method</Label>
                      <Select onValueChange={(value) => setValue('depreciationMethod', value)}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select method" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="STRAIGHT_LINE">Straight Line</SelectItem>
                          <SelectItem value="DECLINING_BALANCE">Declining Balance</SelectItem>
                          <SelectItem value="SUM_OF_YEARS">Sum of Years</SelectItem>
                          <SelectItem value="UNITS_OF_PRODUCTION">Units of Production</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label htmlFor="usefulLife">Useful Life (Years)</Label>
                      <Input
                        id="usefulLife"
                        type="number"
                        {...register('usefulLife', { valueAsNumber: true })}
                        placeholder="10"
                      />
                    </div>
                  </div>
                </TabsContent>
              </Tabs>

              <div className="flex gap-2 pt-4">
                <Button type="submit" disabled={createEquipment.isPending || updateEquipment.isPending}>
                  {editingEquipment ? 'Update Equipment' : 'Create Equipment'}
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
          </CardContent>
        </Card>
      )}
    </div>
  );
}
