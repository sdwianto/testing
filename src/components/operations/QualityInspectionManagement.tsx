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
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Plus, Edit, Trash2, Search, Eye, 
  CheckCircle, AlertTriangle, XCircle, 
  Settings, Activity, TrendingUp, FileText,
  Clock, User, Shield, Target
} from 'lucide-react';
import { trpc } from '@/lib/trpc';
import { toast } from 'sonner';
import { format } from 'date-fns';

// ========================================
// QUALITY INSPECTION MANAGEMENT COMPONENT
// JDE F3701/F3702/F3703/F3711 equivalent with enterprise features
// ========================================

type QualityInspectionFormData = {
  workOrderId: string;
  inspectionType: string;
  inspectionDate: string;
  inspectorId: string;
  status: string;
  result: string;
  passFail: boolean;
  defectsFound?: string;
  correctiveActions?: string;
  notes?: string;
};

interface QualityInspectionManagementProps {
  onSuccess?: () => void;
}

export function QualityInspectionManagement({ onSuccess }: QualityInspectionManagementProps) {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingInspection, setEditingInspection] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [workOrderFilter, setWorkOrderFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [resultFilter, setResultFilter] = useState<string>('all');
  const [selectedInspection, setSelectedInspection] = useState<any>(null);
  const [activeTab, setActiveTab] = useState('inspections');

  const { register, handleSubmit, formState: { errors }, setValue, reset } = useForm<QualityInspectionFormData>({
    defaultValues: {
      workOrderId: '',
      inspectionType: 'PREVENTIVE',
      inspectionDate: new Date().toISOString().split('T')[0],
      inspectorId: '',
      status: 'PENDING',
      result: 'PASS',
      passFail: true,
      defectsFound: '',
      correctiveActions: '',
      notes: '',
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
  const { data: qualityInspections, isLoading, refetch } = trpc.ops.listQualityInspections.useQuery({
    limit: 50, // FP6: cursor pagination for large lists
    workOrderId: workOrderFilter === 'all' ? undefined : workOrderFilter,
    status: statusFilter === 'all' ? undefined : statusFilter,
    inspectionType: typeFilter === 'all' ? undefined : typeFilter,
    search: debouncedSearchTerm.length >= 2 ? debouncedSearchTerm : undefined, // FP6: server-side search
  });

  const { data: workOrders } = trpc.ops.listWorkOrders.useQuery({ limit: 1000 });
  const { data: users } = trpc.core.getUsers.useQuery({});

  const createQualityInspection = (trpc.ops.createQualityInspection as any).useMutation({
    onSuccess: () => {
      toast.success('Quality inspection created successfully');
      reset();
      setIsFormOpen(false);
      void refetch();
      onSuccess?.();
    },
    onError: (error: any) => {
      toast.error(`Failed to create quality inspection: ${error.message}`);
    },
  });

  const updateQualityInspection = (trpc.ops.updateQualityInspection as any).useMutation({
    onSuccess: () => {
      toast.success('Quality inspection updated successfully');
      reset();
      setIsFormOpen(false);
      setEditingInspection(null);
      void refetch();
      onSuccess?.();
    },
    onError: (error: any) => {
      toast.error(`Failed to update quality inspection: ${error.message}`);
    },
  });

  const onSubmit = async (data: QualityInspectionFormData) => {
    if (editingInspection) {
      await updateQualityInspection.mutateAsync({
        id: editingInspection,
        ...data,
        inspectionDate: new Date(data.inspectionDate).toISOString(),
        idempotencyKey: crypto.randomUUID(),
      });
    } else {
      await createQualityInspection.mutateAsync({
        ...data,
        inspectionDate: new Date(data.inspectionDate).toISOString(),
        idempotencyKey: crypto.randomUUID(),
      });
    }
  };

  const handleEdit = (inspection: any) => {
    setEditingInspection(inspection.id);
    setValue('workOrderId', inspection.workOrderId);
    setValue('inspectionType', inspection.inspectionType);
    setValue('inspectionDate', format(new Date(inspection.inspectionDate), 'yyyy-MM-dd'));
    setValue('inspectorId', inspection.inspectorId);
    setValue('status', inspection.status);
    setValue('result', inspection.result);
    setValue('passFail', inspection.passFail);
    setValue('defectsFound', inspection.defectsFound || '');
    setValue('correctiveActions', inspection.correctiveActions || '');
    setValue('notes', inspection.notes || '');
    setIsFormOpen(true);
  };

  const handleViewDetails = (inspection: any) => {
    setSelectedInspection(inspection);
  };

  // Get inspections data
  const allInspections = useMemo(() => {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-return
    return qualityInspections?.qualityInspections || [] as any[];
  }, [qualityInspections]);

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      PENDING: { variant: 'secondary' as const, color: 'text-gray-600' },
      IN_PROGRESS: { variant: 'default' as const, color: 'text-blue-600' },
      COMPLETED: { variant: 'default' as const, color: 'text-green-600' },
      CANCELLED: { variant: 'destructive' as const, color: 'text-red-600' },
    };
    
    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.PENDING;
    
    return (
      <Badge variant={config.variant} className={config.color}>
        {status.replace('_', ' ')}
      </Badge>
    );
  };

  const getResultBadge = (result: string, passFail: boolean) => {
    if (result === 'PASS' || passFail) {
      return <Badge variant="default" className="bg-green-600">PASS</Badge>;
    } else {
      return <Badge variant="destructive">FAIL</Badge>;
    }
  };

  const getTypeBadge = (type: string) => {
    const typeConfig = {
      PREVENTIVE: { variant: 'outline' as const, color: 'text-green-600' },
      CORRECTIVE: { variant: 'default' as const, color: 'text-blue-600' },
      PREDICTIVE: { variant: 'secondary' as const, color: 'text-orange-600' },
      FINAL: { variant: 'default' as const, color: 'text-purple-600' },
    };
    
    const config = typeConfig[type as keyof typeof typeConfig] || typeConfig.PREVENTIVE;
    
    return (
      <Badge variant={config.variant} className={config.color}>
        {type}
      </Badge>
    );
  };

  const totalInspections = allInspections.length;
  const passedInspections = allInspections.filter((i: any) => i.passFail || i.result === 'PASS').length;
  const failedInspections = allInspections.filter((i: any) => !i.passFail || i.result === 'FAIL').length;
  const completedInspections = allInspections.filter((i: any) => i.status === 'COMPLETED').length;

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
          <h2 className="text-2xl font-bold text-gray-900">Quality Inspection Management</h2>
          <p className="text-gray-600">Manage quality inspections, compliance checks, and quality control processes</p>
        </div>
        <Button onClick={() => setIsFormOpen(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Schedule Inspection
        </Button>
      </div>

      {/* Quality Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center">
              <Shield className="h-4 w-4 text-muted-foreground" />
              <div className="ml-2">
                <p className="text-sm font-medium text-muted-foreground">Total Inspections</p>
                <p className="text-2xl font-bold">{totalInspections}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center">
              <CheckCircle className="h-4 w-4 text-muted-foreground" />
              <div className="ml-2">
                <p className="text-sm font-medium text-muted-foreground">Passed</p>
                <p className="text-2xl font-bold text-green-600">{passedInspections}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center">
              <XCircle className="h-4 w-4 text-muted-foreground" />
              <div className="ml-2">
                <p className="text-sm font-medium text-muted-foreground">Failed</p>
                <p className="text-2xl font-bold text-red-600">{failedInspections}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center">
              <Target className="h-4 w-4 text-muted-foreground" />
              <div className="ml-2">
                <p className="text-sm font-medium text-muted-foreground">Pass Rate</p>
                <p className="text-2xl font-bold">
                  {totalInspections > 0 ? Math.round((passedInspections / totalInspections) * 100) : 0}%
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs for different views */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="inspections">Quality Inspections</TabsTrigger>
          <TabsTrigger value="analytics">Quality Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="inspections" className="space-y-4">
          {/* Search and Filter */}
          <Card>
            <CardContent className="pt-6">
              <div className="flex gap-4">
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                    <Input
                      placeholder="Search inspections (min 2 chars)..."
                      value={searchTerm}
                      onChange={(e: any) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>
                <Select value={workOrderFilter} onValueChange={setWorkOrderFilter}>
                  <SelectTrigger className="w-48">
                    <SelectValue placeholder="Filter by work order" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Work Orders</SelectItem>
                    {workOrders?.workOrders?.map((wo: any) => (
                      <SelectItem key={wo.id} value={wo.id}>
                        {wo.workOrderNumber} - {wo.title}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Select value={typeFilter} onValueChange={setTypeFilter}>
                  <SelectTrigger className="w-48">
                    <SelectValue placeholder="Filter by type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Types</SelectItem>
                    <SelectItem value="PREVENTIVE">Preventive</SelectItem>
                    <SelectItem value="CORRECTIVE">Corrective</SelectItem>
                    <SelectItem value="PREDICTIVE">Predictive</SelectItem>
                    <SelectItem value="FINAL">Final</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={resultFilter} onValueChange={setResultFilter}>
                  <SelectTrigger className="w-48">
                    <SelectValue placeholder="Filter by result" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Results</SelectItem>
                    <SelectItem value="PASS">Pass</SelectItem>
                    <SelectItem value="FAIL">Fail</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Quality Inspections Table */}
          <Card>
            <CardHeader>
              <CardTitle>Quality Inspections ({allInspections.length})</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Work Order</TableHead>
                    <TableHead>Inspection Type</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Inspector</TableHead>
                    <TableHead>Result</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Defects</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {allInspections.map((inspection: any) => (
                    <TableRow key={inspection.id}>
                      <TableCell>
                        <div>
                          <div className="font-medium">{inspection.workOrder?.workOrderNumber}</div>
                          <div className="text-sm text-gray-500">{inspection.workOrder?.title}</div>
                        </div>
                      </TableCell>
                      <TableCell>{getTypeBadge(inspection.inspectionType)}</TableCell>
                      <TableCell>{format(new Date(inspection.inspectionDate), 'MMM dd, yyyy')}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <User className="h-4 w-4 text-gray-400" />
                          <span className="text-sm">
                            {inspection.inspector?.name || 'Unassigned'}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>{getResultBadge(inspection.result, inspection.passFail)}</TableCell>
                      <TableCell>{getStatusBadge(inspection.status)}</TableCell>
                      <TableCell>
                        {inspection.defectsFound ? (
                          <Badge variant="destructive" className="text-xs">
                            {inspection.defectsFound.split(',').length} defects
                          </Badge>
                        ) : (
                          <Badge variant="outline" className="text-xs">None</Badge>
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleViewDetails(inspection)}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleEdit(inspection)}
                          >
                            <Edit className="h-4 w-4" />
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

        <TabsContent value="analytics" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5" />
                  Quality Performance
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Total Inspections</span>
                    <span className="font-medium">{totalInspections}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Passed</span>
                    <span className="font-medium text-green-600">{passedInspections}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Failed</span>
                    <span className="font-medium text-red-600">{failedInspections}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Pass Rate</span>
                    <span className={`font-medium ${
                      totalInspections > 0 && (passedInspections / totalInspections) >= 0.95 
                        ? 'text-green-600' 
                        : totalInspections > 0 && (passedInspections / totalInspections) >= 0.8
                        ? 'text-orange-600'
                        : 'text-red-600'
                    }`}>
                      {totalInspections > 0 ? `${((passedInspections / totalInspections) * 100).toFixed(1)}%` : '0%'}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Activity className="h-5 w-5" />
                  Inspection Status
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Completed</span>
                    <span className="font-medium text-green-600">{completedInspections}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">In Progress</span>
                    <span className="font-medium text-blue-600">
                      {allInspections.filter((i: any) => i.status === 'IN_PROGRESS').length}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Pending</span>
                    <span className="font-medium text-gray-600">
                      {allInspections.filter((i: any) => i.status === 'PENDING').length}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Cancelled</span>
                    <span className="font-medium text-red-600">
                      {allInspections.filter((i: any) => i.status === 'CANCELLED').length}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      {/* Quality Inspection Details Modal */}
      {selectedInspection && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="h-5 w-5" />
                  Quality Inspection Details
                </CardTitle>
                <p className="text-sm text-gray-600">
                  {selectedInspection.inspectionType} - {format(new Date(selectedInspection.inspectionDate), 'MMM dd, yyyy')}
                </p>
              </div>
              <Button variant="outline" onClick={() => setSelectedInspection(null)}>
                Close
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label className="text-sm font-medium text-gray-500">Work Order</Label>
                <p className="text-sm">{selectedInspection.workOrder?.workOrderNumber} - {selectedInspection.workOrder?.title}</p>
              </div>
              <div>
                <Label className="text-sm font-medium text-gray-500">Inspection Type</Label>
                <div className="mt-1">{getTypeBadge(selectedInspection.inspectionType)}</div>
              </div>
              <div>
                <Label className="text-sm font-medium text-gray-500">Inspection Date</Label>
                <p className="text-sm">{format(new Date(selectedInspection.inspectionDate), 'MMM dd, yyyy')}</p>
              </div>
              <div>
                <Label className="text-sm font-medium text-gray-500">Inspector</Label>
                <p className="text-sm">{selectedInspection.inspector?.name || 'Unassigned'}</p>
              </div>
              <div>
                <Label className="text-sm font-medium text-gray-500">Result</Label>
                <div className="mt-1">{getResultBadge(selectedInspection.result, selectedInspection.passFail)}</div>
              </div>
              <div>
                <Label className="text-sm font-medium text-gray-500">Status</Label>
                <div className="mt-1">{getStatusBadge(selectedInspection.status)}</div>
              </div>
              <div>
                <Label className="text-sm font-medium text-gray-500">Defects Found</Label>
                <p className="text-sm">{selectedInspection.defectsFound || 'None'}</p>
              </div>
              <div>
                <Label className="text-sm font-medium text-gray-500">Corrective Actions</Label>
                <p className="text-sm">{selectedInspection.correctiveActions || 'None'}</p>
              </div>
              <div className="md:col-span-2">
                <Label className="text-sm font-medium text-gray-500">Notes</Label>
                <p className="text-sm">{selectedInspection.notes || 'No notes'}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Quality Inspection Form Modal */}
      {isFormOpen && (
        <Card>
          <CardHeader>
            <CardTitle>
              {editingInspection ? 'Edit Quality Inspection' : 'Schedule New Quality Inspection'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="workOrderId">Work Order *</Label>
                  <Select onValueChange={(value: any) => setValue('workOrderId', value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select work order" />
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
                  <Label htmlFor="inspectionType">Inspection Type *</Label>
                  <Select onValueChange={(value: any) => setValue('inspectionType', value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="PREVENTIVE">Preventive</SelectItem>
                      <SelectItem value="CORRECTIVE">Corrective</SelectItem>
                      <SelectItem value="PREDICTIVE">Predictive</SelectItem>
                      <SelectItem value="FINAL">Final</SelectItem>
                    </SelectContent>
                  </Select>
                  {errors.inspectionType && (
                    <p className="text-sm text-red-600">{errors.inspectionType.message}</p>
                  )}
                </div>

                <div>
                  <Label htmlFor="inspectionDate">Inspection Date *</Label>
                  <Input
                    id="inspectionDate"
                    type="date"
                    {...register('inspectionDate')}
                  />
                  {errors.inspectionDate && (
                    <p className="text-sm text-red-600">{errors.inspectionDate.message}</p>
                  )}
                </div>

                <div>
                  <Label htmlFor="inspectorId">Inspector *</Label>
                  <Select onValueChange={(value: any) => setValue('inspectorId', value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select inspector" />
                    </SelectTrigger>
                    <SelectContent>
                      {users?.map((user: any) => (
                        <SelectItem key={user.id} value={user.id}>
                          {user.name} ({user.email})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {errors.inspectorId && (
                    <p className="text-sm text-red-600">{errors.inspectorId.message}</p>
                  )}
                </div>

                <div>
                  <Label htmlFor="status">Status *</Label>
                  <Select onValueChange={(value: any) => setValue('status', value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="PENDING">Pending</SelectItem>
                      <SelectItem value="IN_PROGRESS">In Progress</SelectItem>
                      <SelectItem value="COMPLETED">Completed</SelectItem>
                      <SelectItem value="CANCELLED">Cancelled</SelectItem>
                    </SelectContent>
                  </Select>
                  {errors.status && (
                    <p className="text-sm text-red-600">{errors.status.message}</p>
                  )}
                </div>

                <div>
                  <Label htmlFor="result">Result *</Label>
                  <Select onValueChange={(value: any) => {
                    setValue('result', value);
                    setValue('passFail', value === 'PASS');
                  }}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select result" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="PASS">Pass</SelectItem>
                      <SelectItem value="FAIL">Fail</SelectItem>
                    </SelectContent>
                  </Select>
                  {errors.result && (
                    <p className="text-sm text-red-600">{errors.result.message}</p>
                  )}
                </div>

                <div className="md:col-span-2">
                  <Label htmlFor="defectsFound">Defects Found</Label>
                  <Textarea
                    id="defectsFound"
                    {...register('defectsFound')}
                    placeholder="List any defects found during inspection..."
                  />
                </div>

                <div className="md:col-span-2">
                  <Label htmlFor="correctiveActions">Corrective Actions</Label>
                  <Textarea
                    id="correctiveActions"
                    {...register('correctiveActions')}
                    placeholder="Describe corrective actions taken..."
                  />
                </div>

                <div className="md:col-span-2">
                  <Label htmlFor="notes">Notes</Label>
                  <Textarea
                    id="notes"
                    {...register('notes')}
                    placeholder="Additional notes..."
                  />
                </div>
              </div>

              <div className="flex gap-2 pt-4">
                <Button type="submit" disabled={createQualityInspection.isPending || updateQualityInspection.isPending}>
                  {editingInspection ? 'Update Inspection' : 'Schedule Inspection'}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setIsFormOpen(false);
                    setEditingInspection(null);
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
