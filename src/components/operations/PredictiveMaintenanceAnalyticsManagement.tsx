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
import { Plus, Edit, Trash2, Search, Brain, AlertTriangle, TrendingUp, Activity } from 'lucide-react';
import { trpc } from '@/lib/trpc';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { LoadingSpinner } from '@/components/ui/loading-spinner';

// ========================================
// PREDICTIVE MAINTENANCE ANALYTICS MANAGEMENT COMPONENT
// Machine Learning & Failure Prediction
// ========================================

const predictiveMaintenanceSchema = z.object({
  equipmentId: z.string().min(1, 'Equipment is required'),
  modelName: z.string().min(1, 'Model Name is required'),
  predictionType: z.enum(['FAILURE_RISK', 'PERFORMANCE_DEGRADATION', 'LIFESPAN_ESTIMATION', 'COST_OPTIMIZATION']).default('FAILURE_RISK'),
  riskScore: z.number().min(0).max(100, 'Risk Score must be between 0 and 100'),
  confidenceLevel: z.number().min(0).max(100, 'Confidence Level must be between 0 and 100'),
  predictedFailureDate: z.string().optional(),
  recommendedAction: z.string().min(1, 'Recommended Action is required'),
  estimatedCost: z.number().min(0, 'Estimated Cost must be non-negative').optional(),
  dataPoints: z.number().min(0, 'Data Points must be non-negative').optional(),
  lastUpdated: z.string().min(1, 'Last Updated is required'),
  notes: z.string().optional(),
});

type PredictiveMaintenanceFormData = z.infer<typeof predictiveMaintenanceSchema>;

export function PredictiveMaintenanceAnalyticsManagement() {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingPrediction, setEditingPrediction] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState<string>('all');

  const { register, handleSubmit, formState: { errors }, setValue, reset } = useForm<PredictiveMaintenanceFormData>({
    resolver: zodResolver(predictiveMaintenanceSchema),
    defaultValues: {
      equipmentId: '',
      modelName: '',
      predictionType: 'FAILURE_RISK',
      riskScore: 0,
      confidenceLevel: 0,
      predictedFailureDate: '',
      recommendedAction: '',
      estimatedCost: 0,
      dataPoints: 0,
      lastUpdated: new Date().toISOString().split('T')[0],
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

  const { data: predictiveMaintenance, isLoading, refetch } = (trpc.ops.listPredictiveMaintenance as any).useQuery({
    limit: 50,
    search: debouncedSearchTerm.length >= 2 ? debouncedSearchTerm : undefined,
    predictionType: typeFilter === 'all' ? undefined : typeFilter,
  });

  const { data: equipment } = (trpc.ops.listEquipment as any).useQuery({ limit: 1000 });

  const createPredictiveMaintenance = (trpc.ops.createPredictiveMaintenance as any).useMutation({
    onSuccess: () => {
      toast.success('Predictive maintenance analytics created successfully');
      reset();
      setIsFormOpen(false);
      void refetch();
    },
    onError: (error: any) => {
      toast.error(`Failed to create predictive maintenance analytics: ${error.message}`);
    },
  });

  const updatePredictiveMaintenance = (trpc.ops.updatePredictiveMaintenance as any).useMutation({
    onSuccess: () => {
      toast.success('Predictive maintenance analytics updated successfully');
      reset();
      setIsFormOpen(false);
      setEditingPrediction(null);
      void refetch();
    },
    onError: (error: any) => {
      toast.error(`Failed to update predictive maintenance analytics: ${error.message}`);
    },
  });

  const deletePredictiveMaintenance = (trpc.ops.deletePredictiveMaintenance as any).useMutation({
    onSuccess: () => {
      toast.success('Predictive maintenance analytics deleted successfully');
      void refetch();
    },
    onError: (error: any) => {
      toast.error(`Failed to delete predictive maintenance analytics: ${error.message}`);
    },
  });

  const onSubmit = async (data: PredictiveMaintenanceFormData) => {
    if (editingPrediction) {
      await updatePredictiveMaintenance.mutateAsync({
        id: editingPrediction,
        ...data,
        predictedFailureDate: data.predictedFailureDate ? new Date(data.predictedFailureDate).toISOString() : undefined,
        lastUpdated: new Date(data.lastUpdated).toISOString(),
        idempotencyKey: crypto.randomUUID(),
      });
    } else {
      await createPredictiveMaintenance.mutateAsync({
        ...data,
        predictedFailureDate: data.predictedFailureDate ? new Date(data.predictedFailureDate).toISOString() : undefined,
        lastUpdated: new Date(data.lastUpdated).toISOString(),
        idempotencyKey: crypto.randomUUID(),
      });
    }
  };

  const handleEdit = (prediction: any) => {
    setEditingPrediction(prediction.id);
    setValue('equipmentId', prediction.equipmentId);
    setValue('modelName', prediction.modelName);
    setValue('predictionType', prediction.predictionType);
    setValue('riskScore', prediction.riskScore);
    setValue('confidenceLevel', prediction.confidenceLevel);
    setValue('predictedFailureDate', prediction.predictedFailureDate ? format(new Date(prediction.predictedFailureDate), 'yyyy-MM-dd') : '');
    setValue('recommendedAction', prediction.recommendedAction);
    setValue('estimatedCost', prediction.estimatedCost || 0);
    setValue('dataPoints', prediction.dataPoints || 0);
    setValue('lastUpdated', format(new Date(prediction.lastUpdated), 'yyyy-MM-dd'));
    setValue('notes', prediction.notes || '');
    setIsFormOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this predictive maintenance analytics?')) {
      await deletePredictiveMaintenance.mutateAsync({
        id,
        idempotencyKey: crypto.randomUUID(),
      });
    }
  };

  const allPredictions = useMemo(() => {
    return predictiveMaintenance?.predictiveMaintenance || [] as any[];
  }, [predictiveMaintenance]);

  const getTypeBadge = (type: string) => {
    switch (type) {
      case 'FAILURE_RISK':
        return <Badge className="bg-red-500 hover:bg-red-600">Failure Risk</Badge>;
      case 'PERFORMANCE_DEGRADATION':
        return <Badge className="bg-orange-500 hover:bg-orange-600">Performance</Badge>;
      case 'LIFESPAN_ESTIMATION':
        return <Badge className="bg-blue-500 hover:bg-blue-600">Lifespan</Badge>;
      case 'COST_OPTIMIZATION':
        return <Badge className="bg-green-500 hover:bg-green-600">Cost Opt.</Badge>;
      default:
        return <Badge variant="outline">{type}</Badge>;
    }
  };

  const getRiskBadge = (riskScore: number) => {
    if (riskScore >= 80) {
      return <Badge variant="destructive">Critical</Badge>;
    } else if (riskScore >= 60) {
      return <Badge className="bg-orange-500 hover:bg-orange-600">High</Badge>;
    } else if (riskScore >= 40) {
      return <Badge className="bg-yellow-500 hover:bg-yellow-600">Medium</Badge>;
    } else {
      return <Badge className="bg-green-500 hover:bg-green-600">Low</Badge>;
    }
  };

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 80) return 'text-green-600';
    if (confidence >= 60) return 'text-yellow-600';
    return 'text-red-600';
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
          <h2 className="text-2xl font-bold text-gray-900">Predictive Maintenance Analytics Management</h2>
          <p className="text-gray-600">Machine learning models for failure prediction and maintenance optimization</p>
        </div>
        <Button onClick={() => setIsFormOpen(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Add Prediction Model
        </Button>
      </div>

      <Card>
        <CardContent className="pt-6">
          <div className="flex gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Search predictions (min 2 chars)..."
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
                <SelectItem value="FAILURE_RISK">Failure Risk</SelectItem>
                <SelectItem value="PERFORMANCE_DEGRADATION">Performance</SelectItem>
                <SelectItem value="LIFESPAN_ESTIMATION">Lifespan</SelectItem>
                <SelectItem value="COST_OPTIMIZATION">Cost Optimization</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Predictive Maintenance Analytics ({allPredictions.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Equipment</TableHead>
                <TableHead>Model</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Risk Score</TableHead>
                <TableHead>Confidence</TableHead>
                <TableHead>Predicted Failure</TableHead>
                <TableHead>Data Points</TableHead>
                <TableHead>Last Updated</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {allPredictions.map((prediction: any) => (
                <TableRow key={prediction.id}>
                  <TableCell className="font-medium">
                    <div className="flex items-center gap-2">
                      <Activity className="h-4 w-4 text-muted-foreground" />
                      <span>{prediction.equipment?.code}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Brain className="h-4 w-4 text-muted-foreground" />
                      <span>{prediction.modelName}</span>
                    </div>
                  </TableCell>
                  <TableCell>{getTypeBadge(prediction.predictionType)}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{prediction.riskScore}%</span>
                      {getRiskBadge(prediction.riskScore)}
                    </div>
                  </TableCell>
                  <TableCell>
                    <span className={`font-medium ${getConfidenceColor(prediction.confidenceLevel)}`}>
                      {prediction.confidenceLevel}%
                    </span>
                  </TableCell>
                  <TableCell>
                    {prediction.predictedFailureDate ? (
                      <div className="flex items-center gap-2">
                        <AlertTriangle className="h-4 w-4 text-orange-500" />
                        <span>{format(new Date(prediction.predictedFailureDate), 'MMM dd, yyyy')}</span>
                      </div>
                    ) : 'N/A'}
                  </TableCell>
                  <TableCell>{prediction.dataPoints || 0}</TableCell>
                  <TableCell>{format(new Date(prediction.lastUpdated), 'MMM dd, yyyy')}</TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm" onClick={() => handleEdit(prediction)}>
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button variant="outline" size="sm" onClick={() => handleDelete(prediction.id)}>
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
            <CardTitle>{editingPrediction ? 'Edit Predictive Maintenance Analytics' : 'Create New Predictive Maintenance Analytics'}</CardTitle>
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
                  <Label htmlFor="modelName">Model Name *</Label>
                  <Input
                    id="modelName"
                    {...register('modelName')}
                    placeholder="e.g., Random Forest v2.1"
                  />
                  {errors.modelName && (
                    <p className="text-sm text-red-600">{errors.modelName.message}</p>
                  )}
                </div>

                <div>
                  <Label htmlFor="predictionType">Prediction Type *</Label>
                  <Select onValueChange={(value: any) => setValue('predictionType', value)} value={register('predictionType').value}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select Type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="FAILURE_RISK">Failure Risk</SelectItem>
                      <SelectItem value="PERFORMANCE_DEGRADATION">Performance Degradation</SelectItem>
                      <SelectItem value="LIFESPAN_ESTIMATION">Lifespan Estimation</SelectItem>
                      <SelectItem value="COST_OPTIMIZATION">Cost Optimization</SelectItem>
                    </SelectContent>
                  </Select>
                  {errors.predictionType && (
                    <p className="text-sm text-red-600">{errors.predictionType.message}</p>
                  )}
                </div>

                <div>
                  <Label htmlFor="riskScore">Risk Score (0-100) *</Label>
                  <Input
                    id="riskScore"
                    type="number"
                    min="0"
                    max="100"
                    {...register('riskScore', { valueAsNumber: true })}
                    placeholder="75"
                  />
                  {errors.riskScore && (
                    <p className="text-sm text-red-600">{errors.riskScore.message}</p>
                  )}
                </div>

                <div>
                  <Label htmlFor="confidenceLevel">Confidence Level (0-100) *</Label>
                  <Input
                    id="confidenceLevel"
                    type="number"
                    min="0"
                    max="100"
                    {...register('confidenceLevel', { valueAsNumber: true })}
                    placeholder="85"
                  />
                  {errors.confidenceLevel && (
                    <p className="text-sm text-red-600">{errors.confidenceLevel.message}</p>
                  )}
                </div>

                <div>
                  <Label htmlFor="predictedFailureDate">Predicted Failure Date</Label>
                  <Input
                    id="predictedFailureDate"
                    type="date"
                    {...register('predictedFailureDate')}
                  />
                  {errors.predictedFailureDate && (
                    <p className="text-sm text-red-600">{errors.predictedFailureDate.message}</p>
                  )}
                </div>

                <div>
                  <Label htmlFor="recommendedAction">Recommended Action *</Label>
                  <Input
                    id="recommendedAction"
                    {...register('recommendedAction')}
                    placeholder="e.g., Schedule preventive maintenance"
                  />
                  {errors.recommendedAction && (
                    <p className="text-sm text-red-600">{errors.recommendedAction.message}</p>
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

                <div>
                  <Label htmlFor="dataPoints">Data Points</Label>
                  <Input
                    id="dataPoints"
                    type="number"
                    {...register('dataPoints', { valueAsNumber: true })}
                    placeholder="1000"
                  />
                  {errors.dataPoints && (
                    <p className="text-sm text-red-600">{errors.dataPoints.message}</p>
                  )}
                </div>

                <div>
                  <Label htmlFor="lastUpdated">Last Updated *</Label>
                  <Input
                    id="lastUpdated"
                    type="date"
                    {...register('lastUpdated')}
                  />
                  {errors.lastUpdated && (
                    <p className="text-sm text-red-600">{errors.lastUpdated.message}</p>
                  )}
                </div>

                <div className="md:col-span-2">
                  <Label htmlFor="notes">Notes</Label>
                  <Textarea
                    id="notes"
                    {...register('notes')}
                    placeholder="Model parameters, training data info, or additional notes..."
                  />
                </div>
              </div>

              <div className="flex gap-2 pt-4">
                <Button type="submit" disabled={createPredictiveMaintenance.isPending || updatePredictiveMaintenance.isPending}>
                  {editingPrediction ? 'Update Analytics' : 'Create Analytics'}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setIsFormOpen(false);
                    setEditingPrediction(null);
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
