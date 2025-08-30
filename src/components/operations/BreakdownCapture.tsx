'use client';

/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-argument */
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
import { Plus, AlertTriangle, CheckCircle, Clock, Wrench } from 'lucide-react';
import { trpc } from '@/lib/trpc';
import { toast } from 'sonner';
import { format } from 'date-fns';

// ========================================
// BREAKDOWN CAPTURE COMPONENT (P1 - Operations Module)
// Per Implementation Guide: Breakdown capture & management
// ========================================

const breakdownSchema = z.object({
  equipmentId: z.string().min(1, 'Equipment is required'),
  startAt: z.string().min(1, 'Start time is required'),
  endAt: z.string().optional(),
  reason: z.string().min(1, 'Reason is required'),
  notes: z.string().optional(),
  reportedBy: z.string().optional(),
});

type BreakdownFormData = z.infer<typeof breakdownSchema>;

interface BreakdownCaptureProps {
  onSuccess?: () => void;
}

export function BreakdownCapture({ onSuccess }: BreakdownCaptureProps) {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingBreakdown, setEditingBreakdown] = useState<string | null>(null);
  const [dateRange, setDateRange] = useState({
    from: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // 30 days ago
    to: new Date(),
  });

  const { register, handleSubmit, formState: { errors }, setValue, watch, reset } = useForm<BreakdownFormData>({
    resolver: zodResolver(breakdownSchema),
    defaultValues: {
      equipmentId: '',
      startAt: new Date().toISOString().slice(0, 16),
      endAt: '',
      reason: '',
      notes: '',
      reportedBy: '',
    },
  });

  // tRPC queries
  const { data: equipment } = trpc.ops.listEquipment.useQuery({
    limit: 100,
  });

  const { data: breakdowns, isLoading, refetch } = trpc.ops.getBreakdowns.useQuery({
    from: dateRange.from.toISOString(),
    to: dateRange.to.toISOString(),
  });

  const { data: users } = trpc.core.getUsers.useQuery({});

  const createBreakdown = trpc.ops.createBreakdown.useMutation({
    onSuccess: () => {
      toast.success('Breakdown reported successfully');
      reset();
      setIsFormOpen(false);
      refetch();
      onSuccess?.();
    },
    onError: (error) => {
      toast.error(`Failed to report breakdown: ${error.message}`);
    },
  });

  const updateBreakdown = trpc.ops.updateBreakdown.useMutation({
    onSuccess: () => {
      toast.success('Breakdown updated successfully');
      reset();
      setIsFormOpen(false);
      setEditingBreakdown(null);
      refetch();
      onSuccess?.();
    },
    onError: (error) => {
      toast.error(`Failed to update breakdown: ${error.message}`);
    },
  });

  const resolveBreakdown = trpc.ops.resolveBreakdown.useMutation({
    onSuccess: () => {
      toast.success('Breakdown resolved successfully');
      refetch();
    },
    onError: (error) => {
      toast.error(`Failed to resolve breakdown: ${error.message}`);
    },
  });

  const onSubmit = async (data: BreakdownFormData) => {
    const submitData = {
      ...data,
      startAt: new Date(data.startAt).toISOString(),
      endAt: data.endAt ? new Date(data.endAt).toISOString() : undefined,
    };

    if (editingBreakdown) {
      await updateBreakdown.mutateAsync({
        id: editingBreakdown,
        ...submitData,
        idempotencyKey: crypto.randomUUID(),
      });
    } else {
      await createBreakdown.mutateAsync({
        ...submitData,
        idempotencyKey: crypto.randomUUID(),
      });
    }
  };

  const handleEdit = (breakdown: any) => {
    setEditingBreakdown(breakdown.id);
    setValue('equipmentId', breakdown.equipmentId);
    setValue('startAt', new Date(breakdown.startAt).toISOString().slice(0, 16));
    setValue('endAt', breakdown.endAt ? new Date(breakdown.endAt).toISOString().slice(0, 16) : '');
    setValue('reason', breakdown.reason || '');
    setValue('notes', breakdown.notes || '');
    setValue('reportedBy', breakdown.reportedBy || '');
    setIsFormOpen(true);
  };

  const handleResolve = async (id: string) => {
    await resolveBreakdown.mutateAsync({
      id,
      endAt: new Date().toISOString(),
      idempotencyKey: crypto.randomUUID(),
    });
  };

  const getStatusBadge = (breakdown: any) => {
    if (breakdown.endAt) {
      return <Badge variant="default" className="bg-green-100 text-green-800">Resolved</Badge>;
    }
    return <Badge variant="destructive">Active</Badge>;
  };

  const getDuration = (breakdown: any) => {
    const start = new Date(breakdown.startAt);
    const end = breakdown.endAt ? new Date(breakdown.endAt) : new Date();
    const duration = end.getTime() - start.getTime();
    const hours = Math.floor(duration / (1000 * 60 * 60));
    const minutes = Math.floor((duration % (1000 * 60 * 60)) / (1000 * 60));
    return `${hours}h ${minutes}m`;
  };

  const activeBreakdowns = breakdowns?.filter((b: any) => !b.endAt) || [];
  const resolvedBreakdowns = breakdowns?.filter((b: any) => b.endAt) || [];
  const totalDowntime = resolvedBreakdowns.reduce((sum: number, b: any) => {
    const start = new Date(b.startAt);
    const end = new Date(b.endAt);
    return sum + (end.getTime() - start.getTime());
  }, 0);

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
          <h2 className="text-2xl font-bold text-gray-900">Breakdown Capture</h2>
          <p className="text-gray-600">Report and manage equipment breakdowns</p>
        </div>
        <Button onClick={() => setIsFormOpen(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Report Breakdown
        </Button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center">
              <AlertTriangle className="h-4 w-4 text-red-500" />
              <div className="ml-2">
                <p className="text-sm font-medium text-muted-foreground">Active Breakdowns</p>
                <p className="text-2xl font-bold text-red-600">{activeBreakdowns.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center">
              <CheckCircle className="h-4 w-4 text-green-500" />
              <div className="ml-2">
                <p className="text-sm font-medium text-muted-foreground">Resolved</p>
                <p className="text-2xl font-bold text-green-600">{resolvedBreakdowns.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center">
              <Clock className="h-4 w-4 text-muted-foreground" />
              <div className="ml-2">
                <p className="text-sm font-medium text-muted-foreground">Total Downtime</p>
                <p className="text-2xl font-bold">
                  {Math.floor(totalDowntime / (1000 * 60 * 60))}h
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center">
              <Wrench className="h-4 w-4 text-muted-foreground" />
              <div className="ml-2">
                <p className="text-sm font-medium text-muted-foreground">Avg Resolution</p>
                <p className="text-2xl font-bold">
                  {resolvedBreakdowns.length > 0 
                    ? Math.floor(totalDowntime / resolvedBreakdowns.length / (1000 * 60 * 60)) 
                    : 0}h
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

      {/* Breakdowns Table */}
      <Card>
        <CardHeader>
          <CardTitle>Breakdowns ({breakdowns?.length || 0})</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Equipment</TableHead>
                <TableHead>Start Time</TableHead>
                <TableHead>End Time</TableHead>
                <TableHead>Duration</TableHead>
                <TableHead>Reason</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {breakdowns?.map((breakdown: any) => (
                <TableRow key={breakdown.id}>
                  <TableCell>
                    <div>
                      <div className="font-medium">{breakdown.equipment?.code}</div>
                      <div className="text-sm text-gray-500">{breakdown.equipment?.type}</div>
                    </div>
                  </TableCell>
                  <TableCell>{format(new Date(breakdown.startAt), 'MMM dd, yyyy HH:mm')}</TableCell>
                  <TableCell>
                    {breakdown.endAt ? format(new Date(breakdown.endAt), 'MMM dd, yyyy HH:mm') : '-'}
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">
                      {getDuration(breakdown)}
                    </Badge>
                  </TableCell>
                  <TableCell className="max-w-xs truncate">
                    {breakdown.reason}
                  </TableCell>
                  <TableCell>{getStatusBadge(breakdown)}</TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      {!breakdown.endAt && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleResolve(breakdown.id)}
                        >
                          <CheckCircle className="h-4 w-4" />
                        </Button>
                      )}
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleEdit(breakdown)}
                      >
                        <Wrench className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Breakdown Form Modal */}
      {isFormOpen && (
        <Card>
          <CardHeader>
            <CardTitle>
              {editingBreakdown ? 'Edit Breakdown' : 'Report New Breakdown'}
            </CardTitle>
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
                  <Label htmlFor="startAt">Start Time *</Label>
                  <Input
                    id="startAt"
                    type="datetime-local"
                    {...register('startAt')}
                  />
                  {errors.startAt && (
                    <p className="text-sm text-red-600">{errors.startAt.message}</p>
                  )}
                </div>

                <div>
                  <Label htmlFor="endAt">End Time</Label>
                  <Input
                    id="endAt"
                    type="datetime-local"
                    {...register('endAt')}
                  />
                </div>

                <div>
                  <Label htmlFor="reportedBy">Reported By</Label>
                  <Select onValueChange={(value) => setValue('reportedBy', value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select user" />
                    </SelectTrigger>
                    <SelectContent>
                      {users?.map((user: any) => (
                        <SelectItem key={user.id} value={user.id}>
                          {user.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="md:col-span-2">
                  <Label htmlFor="reason">Reason *</Label>
                  <Input
                    id="reason"
                    {...register('reason')}
                    placeholder="Breakdown reason..."
                  />
                  {errors.reason && (
                    <p className="text-sm text-red-600">{errors.reason.message}</p>
                  )}
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
                <Button type="submit" disabled={createBreakdown.isPending || updateBreakdown.isPending}>
                  {editingBreakdown ? 'Update Breakdown' : 'Report Breakdown'}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setIsFormOpen(false);
                    setEditingBreakdown(null);
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
