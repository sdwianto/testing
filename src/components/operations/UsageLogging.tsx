'use client';

/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-argument */

/* eslint-disable @typescript-eslint/no-unsafe-return */
/* eslint-disable @typescript-eslint/no-floating-promises */
/* eslint-disable @typescript-eslint/prefer-nullish-coalescing */

import { useState } from 'react';
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
import { Plus, Clock, TrendingUp, Calendar } from 'lucide-react';
import { trpc } from '@/lib/trpc';
import { toast } from 'sonner';
import { format } from 'date-fns';

// ========================================
// USAGE LOGGING COMPONENT (P1 - Operations Module)
// Per Implementation Guide: Usage hours, load per shift, breakdown capture
// ========================================

const usageLogSchema = z.object({
  equipmentId: z.string().min(1, 'Equipment is required'),
  shiftDate: z.string().min(1, 'Shift date is required'),
  hoursUsed: z.number().min(0, 'Hours used must be non-negative'),
  loadUnits: z.number().min(0).optional(),
  operatorId: z.string().optional(),
  notes: z.string().optional(),
});

type UsageLogFormData = z.infer<typeof usageLogSchema>;

interface UsageLoggingProps {
  onSuccess?: () => void;
}

export function UsageLogging({ onSuccess }: UsageLoggingProps) {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [dateRange, setDateRange] = useState({
    from: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // 7 days ago
    to: new Date(),
  });

  const { register, handleSubmit, formState: { errors }, setValue, reset } = useForm<UsageLogFormData>({
    resolver: zodResolver(usageLogSchema),
    defaultValues: {
      equipmentId: '',
      shiftDate: new Date().toISOString().split('T')[0],
      hoursUsed: 0,
      loadUnits: 0,
      operatorId: '',
      notes: '',
    },
  });

  // tRPC queries
  const { data: equipment } = trpc.ops.listEquipment.useQuery({
    limit: 100,
  });

  const { data: usageLogs, isLoading, refetch } = trpc.ops.getUsageLogs.useQuery({
    from: dateRange.from.toISOString(),
    to: dateRange.to.toISOString(),
  });

  const { data: operators } = trpc.core.getUsers.useQuery({
    role: 'OPERATOR',
  });

  const logUsage = trpc.ops.logUsage.useMutation({
    onSuccess: () => {
      toast.success('Usage logged successfully');
      reset();
      setIsFormOpen(false);
      refetch();
      onSuccess?.();
    },
    onError: (error) => {
      toast.error(`Failed to log usage: ${error.message}`);
    },
  });

  const onSubmit = async (data: UsageLogFormData) => {
    await logUsage.mutateAsync({
      ...data,
      shiftDate: new Date(data.shiftDate).toISOString(),
      idempotencyKey: crypto.randomUUID(),
    });
  };

  const totalHours = usageLogs?.reduce((sum: number, log: any) => sum + Number(log.hoursUsed), 0) || 0;
  const totalLoadUnits = usageLogs?.reduce((sum: number, log: any) => sum + Number(log.loadUnits || 0), 0) || 0;
  const uniqueEquipment = new Set(usageLogs?.map((log: any) => log.equipmentId)).size;

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
          <h2 className="text-2xl font-bold text-gray-900">Usage Logging</h2>
          <p className="text-gray-600">Track equipment usage hours and load per shift</p>
        </div>
        <Button onClick={() => setIsFormOpen(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Log Usage
        </Button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center">
              <Clock className="h-4 w-4 text-muted-foreground" />
              <div className="ml-2">
                <p className="text-sm font-medium text-muted-foreground">Total Hours</p>
                <p className="text-2xl font-bold">{totalHours.toFixed(1)}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center">
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
              <div className="ml-2">
                <p className="text-sm font-medium text-muted-foreground">Load Units</p>
                <p className="text-2xl font-bold">{totalLoadUnits.toFixed(1)}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              <div className="ml-2">
                <p className="text-sm font-medium text-muted-foreground">Equipment Used</p>
                <p className="text-2xl font-bold">{uniqueEquipment}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center">
              <Clock className="h-4 w-4 text-muted-foreground" />
              <div className="ml-2">
                <p className="text-sm font-medium text-muted-foreground">Avg Hours/Day</p>
                <p className="text-2xl font-bold">
                  {usageLogs?.length ? (totalHours / usageLogs.length).toFixed(1) : '0.0'}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Date Range Filter */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex gap-4">
            <div>
              <Label htmlFor="from">From Date</Label>
              <Input
                id="from"
                type="date"
                value={format(dateRange.from, 'yyyy-MM-dd')}
                onChange={(e) => setDateRange(prev => ({
                  ...prev,
                  from: new Date(e.target.value)
                }))}
              />
            </div>
            <div>
              <Label htmlFor="to">To Date</Label>
              <Input
                id="to"
                type="date"
                value={format(dateRange.to, 'yyyy-MM-dd')}
                onChange={(e) => setDateRange(prev => ({
                  ...prev,
                  to: new Date(e.target.value)
                }))}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Usage Logs Table */}
      <Card>
        <CardHeader>
          <CardTitle>Usage Logs ({usageLogs?.length || 0})</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Equipment</TableHead>
                <TableHead>Hours Used</TableHead>
                <TableHead>Load Units</TableHead>
                <TableHead>Operator</TableHead>
                <TableHead>Notes</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {usageLogs?.map((log: any) => (
                <TableRow key={log.id}>
                  <TableCell>{format(new Date(log.shiftDate), 'MMM dd, yyyy')}</TableCell>
                  <TableCell>
                    <div>
                      <div className="font-medium">{log.equipment?.code}</div>
                      <div className="text-sm text-gray-500">{log.equipment?.type}</div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">
                      {Number(log.hoursUsed).toFixed(1)} hrs
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {log.loadUnits ? (
                      <Badge variant="secondary">
                        {Number(log.loadUnits).toFixed(1)} units
                      </Badge>
                    ) : (
                      <span className="text-gray-400">-</span>
                    )}
                  </TableCell>
                  <TableCell>{log.operatorId || '-'}</TableCell>
                  <TableCell className="max-w-xs truncate">
                    {log.notes || '-'}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Usage Logging Form Modal */}
      {isFormOpen && (
        <Card>
          <CardHeader>
            <CardTitle>Log Equipment Usage</CardTitle>
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
                          {eq.code} - {eq.type}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {errors.equipmentId && (
                    <p className="text-sm text-red-600">{errors.equipmentId.message}</p>
                  )}
                </div>

                <div>
                  <Label htmlFor="shiftDate">Shift Date *</Label>
                  <Input
                    id="shiftDate"
                    type="date"
                    {...register('shiftDate')}
                  />
                  {errors.shiftDate && (
                    <p className="text-sm text-red-600">{errors.shiftDate.message}</p>
                  )}
                </div>

                <div>
                  <Label htmlFor="hoursUsed">Hours Used *</Label>
                  <Input
                    id="hoursUsed"
                    type="number"
                    step="0.1"
                    {...register('hoursUsed', { valueAsNumber: true })}
                    placeholder="0.0"
                  />
                  {errors.hoursUsed && (
                    <p className="text-sm text-red-600">{errors.hoursUsed.message}</p>
                  )}
                </div>

                <div>
                  <Label htmlFor="loadUnits">Load Units</Label>
                  <Input
                    id="loadUnits"
                    type="number"
                    step="0.1"
                    {...register('loadUnits', { valueAsNumber: true })}
                    placeholder="0.0"
                  />
                </div>

                <div>
                  <Label htmlFor="operatorId">Operator</Label>
                  <Select onValueChange={(value) => setValue('operatorId', value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select operator" />
                    </SelectTrigger>
                    <SelectContent>
                      {operators?.map((op: any) => (
                        <SelectItem key={op.id} value={op.id}>
                          {op.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
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
                <Button type="submit" disabled={logUsage.isPending}>
                  Log Usage
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setIsFormOpen(false);
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
