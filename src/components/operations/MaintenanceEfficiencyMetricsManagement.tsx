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
import { Plus, Edit, Trash2, Search, BarChart3, TrendingUp, Clock, Target } from 'lucide-react';
import { trpc } from '@/lib/trpc';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { LoadingSpinner } from '@/components/ui/loading-spinner';

// ========================================
// MAINTENANCE EFFICIENCY METRICS MANAGEMENT COMPONENT
// KPIs & Performance Analytics
// ========================================

const maintenanceEfficiencySchema = z.object({
  equipmentId: z.string().min(1, 'Equipment is required'),
  metricType: z.enum(['MTTR', 'MTBF', 'AVAILABILITY', 'UTILIZATION', 'OEE', 'COST_PER_HOUR', 'MAINTENANCE_COST_RATIO']).default('MTTR'),
  metricValue: z.number().min(0, 'Metric Value must be non-negative'),
  targetValue: z.number().min(0, 'Target Value must be non-negative').optional(),
  unit: z.string().min(1, 'Unit is required'),
  measurementDate: z.string().min(1, 'Measurement Date is required'),
  period: z.enum(['DAILY', 'WEEKLY', 'MONTHLY', 'QUARTERLY', 'YEARLY']).default('MONTHLY'),
  status: z.enum(['EXCELLENT', 'GOOD', 'AVERAGE', 'POOR', 'CRITICAL']).default('AVERAGE'),
  notes: z.string().optional(),
});

type MaintenanceEfficiencyFormData = z.infer<typeof maintenanceEfficiencySchema>;

export function MaintenanceEfficiencyMetricsManagement() {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingMetric, setEditingMetric] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState<string>('all');

  const { register, handleSubmit, formState: { errors }, setValue, reset } = useForm<MaintenanceEfficiencyFormData>({
    resolver: zodResolver(maintenanceEfficiencySchema),
    defaultValues: {
      equipmentId: '',
      metricType: 'MTTR',
      metricValue: 0,
      targetValue: 0,
      unit: '',
      measurementDate: new Date().toISOString().split('T')[0],
      period: 'MONTHLY',
      status: 'AVERAGE',
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

  const { data: maintenanceEfficiency, isLoading, refetch } = (trpc.ops.listMaintenanceEfficiency as any).useQuery({
    limit: 50,
    search: debouncedSearchTerm.length >= 2 ? debouncedSearchTerm : undefined,
    metricType: typeFilter === 'all' ? undefined : typeFilter,
  });

  const { data: equipment } = (trpc.ops.listEquipment as any).useQuery({ limit: 1000 });

  const createMaintenanceEfficiency = (trpc.ops.createMaintenanceEfficiency as any).useMutation({
    onSuccess: () => {
      toast.success('Maintenance efficiency metric created successfully');
      reset();
      setIsFormOpen(false);
      void refetch();
    },
    onError: (error: any) => {
      toast.error(`Failed to create maintenance efficiency metric: ${error.message}`);
    },
  });

  const updateMaintenanceEfficiency = (trpc.ops.updateMaintenanceEfficiency as any).useMutation({
    onSuccess: () => {
      toast.success('Maintenance efficiency metric updated successfully');
      reset();
      setIsFormOpen(false);
      setEditingMetric(null);
      void refetch();
    },
    onError: (error: any) => {
      toast.error(`Failed to update maintenance efficiency metric: ${error.message}`);
    },
  });

  const deleteMaintenanceEfficiency = (trpc.ops.deleteMaintenanceEfficiency as any).useMutation({
    onSuccess: () => {
      toast.success('Maintenance efficiency metric deleted successfully');
      void refetch();
    },
    onError: (error: any) => {
      toast.error(`Failed to delete maintenance efficiency metric: ${error.message}`);
    },
  });

  const onSubmit = async (data: MaintenanceEfficiencyFormData) => {
    if (editingMetric) {
      await updateMaintenanceEfficiency.mutateAsync({
        id: editingMetric,
        ...data,
        measurementDate: new Date(data.measurementDate).toISOString(),
        idempotencyKey: crypto.randomUUID(),
      });
    } else {
      await createMaintenanceEfficiency.mutateAsync({
        ...data,
        measurementDate: new Date(data.measurementDate).toISOString(),
        idempotencyKey: crypto.randomUUID(),
      });
    }
  };

  const handleEdit = (metric: any) => {
    setEditingMetric(metric.id);
    setValue('equipmentId', metric.equipmentId);
    setValue('metricType', metric.metricType);
    setValue('metricValue', metric.metricValue);
    setValue('targetValue', metric.targetValue || 0);
    setValue('unit', metric.unit);
    setValue('measurementDate', format(new Date(metric.measurementDate), 'yyyy-MM-dd'));
    setValue('period', metric.period);
    setValue('status', metric.status);
    setValue('notes', metric.notes || '');
    setIsFormOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this maintenance efficiency metric?')) {
      await deleteMaintenanceEfficiency.mutateAsync({
        id,
        idempotencyKey: crypto.randomUUID(),
      });
    }
  };

  const allMetrics = useMemo(() => {
    return maintenanceEfficiency?.maintenanceEfficiency || [];
  }, [maintenanceEfficiency]) as any[];

  const getTypeBadge = (type: string) => {
    switch (type) {
      case 'MTTR':
        return <Badge className="bg-red-500 hover:bg-red-600">MTTR</Badge>;
      case 'MTBF':
        return <Badge className="bg-green-500 hover:bg-green-600">MTBF</Badge>;
      case 'AVAILABILITY':
        return <Badge className="bg-blue-500 hover:bg-blue-600">Availability</Badge>;
      case 'UTILIZATION':
        return <Badge className="bg-purple-500 hover:bg-purple-600">Utilization</Badge>;
      case 'OEE':
        return <Badge className="bg-orange-500 hover:bg-orange-600">OEE</Badge>;
      case 'COST_PER_HOUR':
        return <Badge className="bg-yellow-500 hover:bg-yellow-600">Cost/Hour</Badge>;
      case 'MAINTENANCE_COST_RATIO':
        return <Badge className="bg-indigo-500 hover:bg-indigo-600">Cost Ratio</Badge>;
      default:
        return <Badge variant="outline">{type}</Badge>;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'EXCELLENT':
        return <Badge className="bg-green-500 hover:bg-green-600">Excellent</Badge>;
      case 'GOOD':
        return <Badge className="bg-blue-500 hover:bg-blue-600">Good</Badge>;
      case 'AVERAGE':
        return <Badge className="bg-yellow-500 hover:bg-yellow-600">Average</Badge>;
      case 'POOR':
        return <Badge className="bg-orange-500 hover:bg-orange-600">Poor</Badge>;
      case 'CRITICAL':
        return <Badge variant="destructive">Critical</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getPeriodBadge = (period: string) => {
    switch (period) {
      case 'DAILY':
        return <Badge variant="outline">Daily</Badge>;
      case 'WEEKLY':
        return <Badge variant="outline">Weekly</Badge>;
      case 'MONTHLY':
        return <Badge variant="outline">Monthly</Badge>;
      case 'QUARTERLY':
        return <Badge variant="outline">Quarterly</Badge>;
      case 'YEARLY':
        return <Badge variant="outline">Yearly</Badge>;
      default:
        return <Badge variant="outline">{period}</Badge>;
    }
  };

  const getPerformanceIcon = (status: string) => {
    switch (status) {
      case 'EXCELLENT':
      case 'GOOD':
        return <TrendingUp className="h-4 w-4 text-green-500" />;
      case 'AVERAGE':
        return <Target className="h-4 w-4 text-yellow-500" />;
      case 'POOR':
      case 'CRITICAL':
        return <TrendingUp className="h-4 w-4 text-red-500 rotate-180" />;
      default:
        return <BarChart3 className="h-4 w-4 text-gray-500" />;
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
          <h2 className="text-2xl font-bold text-gray-900">Maintenance Efficiency Metrics Management</h2>
          <p className="text-gray-600">Track KPIs and performance metrics for maintenance operations</p>
        </div>
        <Button onClick={() => setIsFormOpen(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Add Efficiency Metric
        </Button>
      </div>

      <Card>
        <CardContent className="pt-6">
          <div className="flex gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Search efficiency metrics (min 2 chars)..."
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
                <SelectItem value="MTTR">MTTR</SelectItem>
                <SelectItem value="MTBF">MTBF</SelectItem>
                <SelectItem value="AVAILABILITY">Availability</SelectItem>
                <SelectItem value="UTILIZATION">Utilization</SelectItem>
                <SelectItem value="OEE">OEE</SelectItem>
                <SelectItem value="COST_PER_HOUR">Cost/Hour</SelectItem>
                <SelectItem value="MAINTENANCE_COST_RATIO">Cost Ratio</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Maintenance Efficiency Metrics ({allMetrics.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Equipment</TableHead>
                <TableHead>Metric Type</TableHead>
                <TableHead>Value</TableHead>
                <TableHead>Target</TableHead>
                <TableHead>Unit</TableHead>
                <TableHead>Period</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {allMetrics.map((metric: any) => (
                <TableRow key={metric.id}>
                  <TableCell className="font-medium">
                    <div className="flex items-center gap-2">
                      <BarChart3 className="h-4 w-4 text-muted-foreground" />
                      <span>{metric.equipment?.code}</span>
                    </div>
                  </TableCell>
                  <TableCell>{getTypeBadge(metric.metricType)}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      {getPerformanceIcon(metric.status)}
                      <span className="font-medium">{Number(metric.metricValue).toFixed(2)}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    {metric.targetValue ? (
                      <div className="flex items-center gap-2">
                        <Target className="h-4 w-4 text-muted-foreground" />
                        <span>{Number(metric.targetValue).toFixed(2)}</span>
                      </div>
                    ) : 'N/A'}
                  </TableCell>
                  <TableCell>{metric.unit}</TableCell>
                  <TableCell>{getPeriodBadge(metric.period)}</TableCell>
                  <TableCell>{getStatusBadge(metric.status)}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4 text-muted-foreground" />
                      <span>{format(new Date(metric.measurementDate), 'MMM dd, yyyy')}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm" onClick={() => handleEdit(metric)}>
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button variant="outline" size="sm" onClick={() => handleDelete(metric.id)}>
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
            <CardTitle>{editingMetric ? 'Edit Maintenance Efficiency Metric' : 'Create New Maintenance Efficiency Metric'}</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="equipmentId">Equipment *</Label>
                  <Select onValueChange={(value: any) => setValue('equipmentId', value)} value={register('equipmentId').value}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select Equipment" />
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
                  <Label htmlFor="metricType">Metric Type *</Label>
                  <Select onValueChange={(value: any) => setValue('metricType', value)} value={register('metricType').value}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select Metric Type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="MTTR">MTTR (Mean Time To Repair)</SelectItem>
                      <SelectItem value="MTBF">MTBF (Mean Time Between Failures)</SelectItem>
                      <SelectItem value="AVAILABILITY">Availability</SelectItem>
                      <SelectItem value="UTILIZATION">Utilization</SelectItem>
                      <SelectItem value="OEE">OEE (Overall Equipment Effectiveness)</SelectItem>
                      <SelectItem value="COST_PER_HOUR">Cost Per Hour</SelectItem>
                      <SelectItem value="MAINTENANCE_COST_RATIO">Maintenance Cost Ratio</SelectItem>
                    </SelectContent>
                  </Select>
                  {errors.metricType && (
                    <p className="text-sm text-red-600">{errors.metricType.message}</p>
                  )}
                </div>

                <div>
                  <Label htmlFor="metricValue">Metric Value *</Label>
                  <Input
                    id="metricValue"
                    type="number"
                    step="0.01"
                    {...register('metricValue', { valueAsNumber: true })}
                    placeholder="0.00"
                  />
                  {errors.metricValue && (
                    <p className="text-sm text-red-600">{errors.metricValue.message}</p>
                  )}
                </div>

                <div>
                  <Label htmlFor="targetValue">Target Value</Label>
                  <Input
                    id="targetValue"
                    type="number"
                    step="0.01"
                    {...register('targetValue', { valueAsNumber: true })}
                    placeholder="0.00"
                  />
                  {errors.targetValue && (
                    <p className="text-sm text-red-600">{errors.targetValue.message}</p>
                  )}
                </div>

                <div>
                  <Label htmlFor="unit">Unit *</Label>
                  <Input
                    id="unit"
                    {...register('unit')}
                    placeholder="e.g., hours, %, $"
                  />
                  {errors.unit && (
                    <p className="text-sm text-red-600">{errors.unit.message}</p>
                  )}
                </div>

                <div>
                  <Label htmlFor="period">Period *</Label>
                  <Select onValueChange={(value: any) => setValue('period', value)} value={register('period').value}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select Period" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="DAILY">Daily</SelectItem>
                      <SelectItem value="WEEKLY">Weekly</SelectItem>
                      <SelectItem value="MONTHLY">Monthly</SelectItem>
                      <SelectItem value="QUARTERLY">Quarterly</SelectItem>
                      <SelectItem value="YEARLY">Yearly</SelectItem>
                    </SelectContent>
                  </Select>
                  {errors.period && (
                    <p className="text-sm text-red-600">{errors.period.message}</p>
                  )}
                </div>

                <div>
                  <Label htmlFor="status">Status *</Label>
                  <Select onValueChange={(value: any) => setValue('status', value)} value={register('status').value}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select Status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="EXCELLENT">Excellent</SelectItem>
                      <SelectItem value="GOOD">Good</SelectItem>
                      <SelectItem value="AVERAGE">Average</SelectItem>
                      <SelectItem value="POOR">Poor</SelectItem>
                      <SelectItem value="CRITICAL">Critical</SelectItem>
                    </SelectContent>
                  </Select>
                  {errors.status && (
                    <p className="text-sm text-red-600">{errors.status.message}</p>
                  )}
                </div>

                <div>
                  <Label htmlFor="measurementDate">Measurement Date *</Label>
                  <Input
                    id="measurementDate"
                    type="date"
                    {...register('measurementDate')}
                  />
                  {errors.measurementDate && (
                    <p className="text-sm text-red-600">{errors.measurementDate.message}</p>
                  )}
                </div>

                <div className="md:col-span-2">
                  <Label htmlFor="notes">Notes</Label>
                  <Textarea
                    id="notes"
                    {...register('notes')}
                    placeholder="Additional notes about this metric measurement..."
                  />
                </div>
              </div>

              <div className="flex gap-2 pt-4">
                <Button type="submit" disabled={createMaintenanceEfficiency.isPending || updateMaintenanceEfficiency.isPending}>
                  {editingMetric ? 'Update Metric' : 'Create Metric'}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setIsFormOpen(false);
                    setEditingMetric(null);
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
