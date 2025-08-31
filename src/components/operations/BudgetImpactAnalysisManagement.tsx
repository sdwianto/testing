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
import { Plus, Edit, Trash2, Search, DollarSign, TrendingUp, TrendingDown, Target } from 'lucide-react';
import { trpc } from '@/lib/trpc';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { LoadingSpinner } from '@/components/ui/loading-spinner';

// ========================================
// BUDGET IMPACT ANALYSIS MANAGEMENT COMPONENT
// Cost Optimization & ROI Analysis
// ========================================

const budgetImpactAnalysisSchema = z.object({
  workOrderId: z.string().min(1, 'Work Order is required'),
  budgetCategory: z.string().min(1, 'Budget Category is required'),
  budgetedAmount: z.number().min(0, 'Budgeted Amount must be non-negative'),
  actualAmount: z.number().min(0, 'Actual Amount must be non-negative'),
  variance: z.number().optional(),
  variancePercentage: z.number().optional(),
  analysisDate: z.string().min(1, 'Analysis Date is required'),
  impactType: z.enum(['POSITIVE', 'NEGATIVE', 'NEUTRAL']).default('NEUTRAL'),
  notes: z.string().optional(),
});

type BudgetImpactAnalysisFormData = z.infer<typeof budgetImpactAnalysisSchema>;

export function BudgetImpactAnalysisManagement() {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingAnalysis, setEditingAnalysis] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [impactFilter, setImpactFilter] = useState<string>('all');

  const { register, handleSubmit, formState: { errors }, setValue, reset } = useForm<BudgetImpactAnalysisFormData>({
    resolver: zodResolver(budgetImpactAnalysisSchema),
    defaultValues: {
      workOrderId: '',
      budgetCategory: '',
      budgetedAmount: 0,
      actualAmount: 0,
      variance: 0,
      variancePercentage: 0,
      analysisDate: new Date().toISOString().split('T')[0],
      impactType: 'NEUTRAL',
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

  const { data: budgetImpactAnalysis, isLoading, refetch } = (trpc.ops.listBudgetImpactAnalysis as any).useQuery({
    limit: 50,
    search: debouncedSearchTerm.length >= 2 ? debouncedSearchTerm : undefined,
    impactType: impactFilter === 'all' ? undefined : impactFilter,
  });

  const { data: workOrders } = (trpc.ops.listWorkOrders as any).useQuery({ limit: 1000 });

  const createBudgetImpactAnalysis = (trpc.ops.createBudgetImpactAnalysis as any).useMutation({
    onSuccess: () => {
      toast.success('Budget impact analysis created successfully');
      reset();
      setIsFormOpen(false);
      void refetch();
    },
    onError: (error: any) => {
      toast.error(`Failed to create budget impact analysis: ${error.message}`);
    },
  });

  const updateBudgetImpactAnalysis = (trpc.ops.updateBudgetImpactAnalysis as any).useMutation({
    onSuccess: () => {
      toast.success('Budget impact analysis updated successfully');
      reset();
      setIsFormOpen(false);
      setEditingAnalysis(null);
      void refetch();
    },
    onError: (error: any) => {
      toast.error(`Failed to update budget impact analysis: ${error.message}`);
    },
  });

  const deleteBudgetImpactAnalysis = (trpc.ops.deleteBudgetImpactAnalysis as any).useMutation({
    onSuccess: () => {
      toast.success('Budget impact analysis deleted successfully');
      void refetch();
    },
    onError: (error: any) => {
      toast.error(`Failed to delete budget impact analysis: ${error.message}`);
    },
  });

  const onSubmit = async (data: BudgetImpactAnalysisFormData) => {
    // Calculate variance and variance percentage
    const variance = data.actualAmount - data.budgetedAmount;
    const variancePercentage = data.budgetedAmount > 0 ? (variance / data.budgetedAmount) * 100 : 0;
    
    const submitData = {
      ...data,
      variance,
      variancePercentage,
      analysisDate: new Date(data.analysisDate).toISOString(),
    };

    if (editingAnalysis) {
      await updateBudgetImpactAnalysis.mutateAsync({
        id: editingAnalysis,
        ...submitData,
        idempotencyKey: crypto.randomUUID(),
      });
    } else {
      await createBudgetImpactAnalysis.mutateAsync({
        ...submitData,
        idempotencyKey: crypto.randomUUID(),
      });
    }
  };

  const handleEdit = (analysis: any) => {
    setEditingAnalysis(analysis.id);
    setValue('workOrderId', analysis.workOrderId);
    setValue('budgetCategory', analysis.budgetCategory);
    setValue('budgetedAmount', analysis.budgetedAmount);
    setValue('actualAmount', analysis.actualAmount);
    setValue('variance', analysis.variance || 0);
    setValue('variancePercentage', analysis.variancePercentage || 0);
    setValue('analysisDate', format(new Date(analysis.analysisDate), 'yyyy-MM-dd'));
    setValue('impactType', analysis.impactType);
    setValue('notes', analysis.notes || '');
    setIsFormOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this budget impact analysis?')) {
      await deleteBudgetImpactAnalysis.mutateAsync({
        id,
        idempotencyKey: crypto.randomUUID(),
      });
    }
  };

  const allAnalysis = useMemo(() => {
    return budgetImpactAnalysis?.budgetImpactAnalysis || [] as any[];
  }, [budgetImpactAnalysis]);

  const getImpactBadge = (impactType: string) => {
    switch (impactType) {
      case 'POSITIVE':
        return <Badge className="bg-green-500 hover:bg-green-600">Positive</Badge>;
      case 'NEGATIVE':
        return <Badge variant="destructive">Negative</Badge>;
      case 'NEUTRAL':
        return <Badge variant="secondary">Neutral</Badge>;
      default:
        return <Badge variant="outline">{impactType}</Badge>;
    }
  };

  const getVarianceIcon = (variance: number) => {
    if (variance > 0) {
      return <TrendingUp className="h-4 w-4 text-red-500" />;
    } else if (variance < 0) {
      return <TrendingDown className="h-4 w-4 text-green-500" />;
    }
    return <Target className="h-4 w-4 text-gray-500" />;
  };

  const getVarianceColor = (variance: number) => {
    if (variance > 0) return 'text-red-600';
    if (variance < 0) return 'text-green-600';
    return 'text-gray-600';
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
          <h2 className="text-2xl font-bold text-gray-900">Budget Impact Analysis Management</h2>
          <p className="text-gray-600">Analyze budget vs. actual costs and track financial impact of maintenance activities</p>
        </div>
        <Button onClick={() => setIsFormOpen(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Add Budget Analysis
        </Button>
      </div>

      <Card>
        <CardContent className="pt-6">
          <div className="flex gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Search budget analysis (min 2 chars)..."
                  value={searchTerm}
                  onChange={(e: any) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <Select value={impactFilter} onValueChange={setImpactFilter}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Filter by impact" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Impacts</SelectItem>
                <SelectItem value="POSITIVE">Positive</SelectItem>
                <SelectItem value="NEGATIVE">Negative</SelectItem>
                <SelectItem value="NEUTRAL">Neutral</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Budget Impact Analysis ({allAnalysis.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Work Order</TableHead>
                <TableHead>Budget Category</TableHead>
                <TableHead>Budgeted Amount</TableHead>
                <TableHead>Actual Amount</TableHead>
                <TableHead>Variance</TableHead>
                <TableHead>Variance %</TableHead>
                <TableHead>Impact Type</TableHead>
                <TableHead>Analysis Date</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {allAnalysis.map((analysis: any) => (
                <TableRow key={analysis.id}>
                  <TableCell className="font-medium">{analysis.workOrder?.workOrderNumber}</TableCell>
                  <TableCell>{analysis.budgetCategory}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <DollarSign className="h-4 w-4 text-muted-foreground" />
                      <span>${Number(analysis.budgetedAmount).toLocaleString()}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <DollarSign className="h-4 w-4 text-muted-foreground" />
                      <span>${Number(analysis.actualAmount).toLocaleString()}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className={`flex items-center gap-2 ${getVarianceColor(analysis.variance || 0)}`}>
                      {getVarianceIcon(analysis.variance || 0)}
                      <span>${Number(analysis.variance || 0).toLocaleString()}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <span className={getVarianceColor(analysis.variancePercentage || 0)}>
                      {(analysis.variancePercentage || 0).toFixed(1)}%
                    </span>
                  </TableCell>
                  <TableCell>{getImpactBadge(analysis.impactType)}</TableCell>
                  <TableCell>{format(new Date(analysis.analysisDate), 'MMM dd, yyyy')}</TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm" onClick={() => handleEdit(analysis)}>
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button variant="outline" size="sm" onClick={() => handleDelete(analysis.id)}>
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
            <CardTitle>{editingAnalysis ? 'Edit Budget Impact Analysis' : 'Create New Budget Impact Analysis'}</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="workOrderId">Work Order *</Label>
                  <Select onValueChange={(value: any) => setValue('workOrderId', value)} value={register('workOrderId').value}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select Work Order" />
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
                  <Label htmlFor="budgetCategory">Budget Category *</Label>
                  <Input
                    id="budgetCategory"
                    {...register('budgetCategory')}
                    placeholder="e.g., Labor, Parts, Materials"
                  />
                  {errors.budgetCategory && (
                    <p className="text-sm text-red-600">{errors.budgetCategory.message}</p>
                  )}
                </div>

                <div>
                  <Label htmlFor="budgetedAmount">Budgeted Amount *</Label>
                  <Input
                    id="budgetedAmount"
                    type="number"
                    step="0.01"
                    {...register('budgetedAmount', { valueAsNumber: true })}
                    placeholder="0.00"
                  />
                  {errors.budgetedAmount && (
                    <p className="text-sm text-red-600">{errors.budgetedAmount.message}</p>
                  )}
                </div>

                <div>
                  <Label htmlFor="actualAmount">Actual Amount *</Label>
                  <Input
                    id="actualAmount"
                    type="number"
                    step="0.01"
                    {...register('actualAmount', { valueAsNumber: true })}
                    placeholder="0.00"
                  />
                  {errors.actualAmount && (
                    <p className="text-sm text-red-600">{errors.actualAmount.message}</p>
                  )}
                </div>

                <div>
                  <Label htmlFor="analysisDate">Analysis Date *</Label>
                  <Input
                    id="analysisDate"
                    type="date"
                    {...register('analysisDate')}
                  />
                  {errors.analysisDate && (
                    <p className="text-sm text-red-600">{errors.analysisDate.message}</p>
                  )}
                </div>

                <div>
                  <Label htmlFor="impactType">Impact Type *</Label>
                  <Select onValueChange={(value: any) => setValue('impactType', value)} value={register('impactType').value}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select Impact Type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="POSITIVE">Positive</SelectItem>
                      <SelectItem value="NEGATIVE">Negative</SelectItem>
                      <SelectItem value="NEUTRAL">Neutral</SelectItem>
                    </SelectContent>
                  </Select>
                  {errors.impactType && (
                    <p className="text-sm text-red-600">{errors.impactType.message}</p>
                  )}
                </div>

                <div className="md:col-span-2">
                  <Label htmlFor="notes">Notes</Label>
                  <Textarea
                    id="notes"
                    {...register('notes')}
                    placeholder="Analysis notes, recommendations, or observations..."
                  />
                </div>
              </div>

              <div className="flex gap-2 pt-4">
                <Button type="submit" disabled={createBudgetImpactAnalysis.isPending || updateBudgetImpactAnalysis.isPending}>
                  {editingAnalysis ? 'Update Analysis' : 'Create Analysis'}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setIsFormOpen(false);
                    setEditingAnalysis(null);
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
