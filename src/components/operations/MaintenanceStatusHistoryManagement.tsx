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
import { Plus, Edit, Trash2, Search, History, Activity } from 'lucide-react';
import { trpc } from '@/lib/trpc';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { LoadingSpinner } from '@/components/ui/loading-spinner';

// ========================================
// MAINTENANCE STATUS HISTORY MANAGEMENT COMPONENT
// Equipment Status Change Tracking
// ========================================

const maintenanceStatusHistorySchema = z.object({
  equipmentId: z.string().min(1, 'Equipment is required'),
  previousStatus: z.string().min(1, 'Previous Status is required'),
  newStatus: z.string().min(1, 'New Status is required'),
  changeDate: z.string().min(1, 'Change Date is required'),
  changeReason: z.string().min(1, 'Change Reason is required'),
  changedBy: z.string().min(1, 'Changed By is required'),
  notes: z.string().optional(),
});

type MaintenanceStatusHistoryFormData = z.infer<typeof maintenanceStatusHistorySchema>;

export function MaintenanceStatusHistoryManagement() {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingHistory, setEditingHistory] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  const { register, handleSubmit, formState: { errors }, setValue, reset } = useForm<MaintenanceStatusHistoryFormData>({
    resolver: zodResolver(maintenanceStatusHistorySchema),
    defaultValues: {
      equipmentId: '',
      previousStatus: '',
      newStatus: '',
      changeDate: new Date().toISOString().split('T')[0],
      changeReason: '',
      changedBy: '',
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

  const { data: maintenanceStatusHistory, isLoading, refetch } = (trpc.ops.listMaintenanceStatusHistory as any).useQuery({
    limit: 50,
    search: debouncedSearchTerm.length >= 2 ? debouncedSearchTerm : undefined,
    newStatus: statusFilter === 'all' ? undefined : statusFilter,
  });

  const { data: equipment } = (trpc.ops.listEquipment as any).useQuery({ limit: 1000 });
  const { data: users } = (trpc.core.getUsers as any).useQuery({ limit: 1000 });

  const createMaintenanceStatusHistory = (trpc.ops.createMaintenanceStatusHistory as any).useMutation({
    onSuccess: () => {
      toast.success('Maintenance status history created successfully');
      reset();
      setIsFormOpen(false);
      void refetch();
    },
    onError: (error: any) => {
      toast.error(`Failed to create maintenance status history: ${error.message}`);
    },
  });

  const updateMaintenanceStatusHistory = (trpc.ops.updateMaintenanceStatusHistory as any).useMutation({
    onSuccess: () => {
      toast.success('Maintenance status history updated successfully');
      reset();
      setIsFormOpen(false);
      setEditingHistory(null);
      void refetch();
    },
    onError: (error: any) => {
      toast.error(`Failed to update maintenance status history: ${error.message}`);
    },
  });

  const deleteMaintenanceStatusHistory = (trpc.ops.deleteMaintenanceStatusHistory as any).useMutation({
    onSuccess: () => {
      toast.success('Maintenance status history deleted successfully');
      void refetch();
    },
    onError: (error: any) => {
      toast.error(`Failed to delete maintenance status history: ${error.message}`);
    },
  });

  const onSubmit = async (data: MaintenanceStatusHistoryFormData) => {
    if (editingHistory) {
      await updateMaintenanceStatusHistory.mutateAsync({
        id: editingHistory,
        ...data,
        changeDate: new Date(data.changeDate).toISOString(),
        idempotencyKey: crypto.randomUUID(),
      });
    } else {
      await createMaintenanceStatusHistory.mutateAsync({
        ...data,
        changeDate: new Date(data.changeDate).toISOString(),
        idempotencyKey: crypto.randomUUID(),
      });
    }
  };

  const handleEdit = (history: any) => {
    setEditingHistory(history.id);
    setValue('equipmentId', history.equipmentId);
    setValue('previousStatus', history.previousStatus);
    setValue('newStatus', history.newStatus);
    setValue('changeDate', format(new Date(history.changeDate), 'yyyy-MM-dd'));
    setValue('changeReason', history.changeReason);
    setValue('changedBy', history.changedBy);
    setValue('notes', history.notes || '');
    setIsFormOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this maintenance status history?')) {
      await deleteMaintenanceStatusHistory.mutateAsync({
        id,
        idempotencyKey: crypto.randomUUID(),
      });
    }
  };

  const allHistory = useMemo(() => {
    return maintenanceStatusHistory?.maintenanceStatusHistory || [] as any[];
  }, [maintenanceStatusHistory]);

  const getStatusBadge = (status: string) => {
    switch (status.toLowerCase()) {
      case 'operational':
        return <Badge className="bg-green-500 hover:bg-green-600">Operational</Badge>;
      case 'maintenance':
        return <Badge className="bg-yellow-500 hover:bg-yellow-600">Maintenance</Badge>;
      case 'repair':
        return <Badge className="bg-orange-500 hover:bg-orange-600">Repair</Badge>;
      case 'out_of_service':
        return <Badge variant="destructive">Out of Service</Badge>;
      case 'retired':
        return <Badge className="bg-gray-500 hover:bg-gray-600">Retired</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
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
          <h2 className="text-2xl font-bold text-gray-900">Maintenance Status History Management</h2>
          <p className="text-gray-600">Track equipment status changes and maintenance history</p>
        </div>
        <Button onClick={() => setIsFormOpen(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Add Status Change
        </Button>
      </div>

      <Card>
        <CardContent className="pt-6">
          <div className="flex gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Search status history (min 2 chars)..."
                  value={searchTerm}
                  onChange={(e: any) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="OPERATIONAL">Operational</SelectItem>
                <SelectItem value="MAINTENANCE">Maintenance</SelectItem>
                <SelectItem value="REPAIR">Repair</SelectItem>
                <SelectItem value="OUT_OF_SERVICE">Out of Service</SelectItem>
                <SelectItem value="RETIRED">Retired</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Maintenance Status History ({allHistory.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Equipment</TableHead>
                <TableHead>Previous Status</TableHead>
                <TableHead>New Status</TableHead>
                <TableHead>Change Date</TableHead>
                <TableHead>Change Reason</TableHead>
                <TableHead>Changed By</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {allHistory.map((history: any) => (
                <TableRow key={history.id}>
                  <TableCell className="font-medium">
                    <div className="flex items-center gap-2">
                      <Activity className="h-4 w-4 text-muted-foreground" />
                      <span>{history.equipment?.code}</span>
                    </div>
                  </TableCell>
                  <TableCell>{getStatusBadge(history.previousStatus)}</TableCell>
                  <TableCell>{getStatusBadge(history.newStatus)}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <History className="h-4 w-4 text-muted-foreground" />
                      <span>{format(new Date(history.changeDate), 'MMM dd, yyyy HH:mm')}</span>
                    </div>
                  </TableCell>
                  <TableCell>{history.changeReason}</TableCell>
                  <TableCell>{history.changedBy}</TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm" onClick={() => handleEdit(history)}>
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button variant="outline" size="sm" onClick={() => handleDelete(history.id)}>
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
            <CardTitle>{editingHistory ? 'Edit Maintenance Status History' : 'Create New Maintenance Status History'}</CardTitle>
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
                  <Label htmlFor="previousStatus">Previous Status *</Label>
                  <Select onValueChange={(value: any) => setValue('previousStatus', value)} value={register('previousStatus').value}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select Previous Status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="OPERATIONAL">Operational</SelectItem>
                      <SelectItem value="MAINTENANCE">Maintenance</SelectItem>
                      <SelectItem value="REPAIR">Repair</SelectItem>
                      <SelectItem value="OUT_OF_SERVICE">Out of Service</SelectItem>
                      <SelectItem value="RETIRED">Retired</SelectItem>
                    </SelectContent>
                  </Select>
                  {errors.previousStatus && (
                    <p className="text-sm text-red-600">{errors.previousStatus.message}</p>
                  )}
                </div>

                <div>
                  <Label htmlFor="newStatus">New Status *</Label>
                  <Select onValueChange={(value: any) => setValue('newStatus', value)} value={register('newStatus').value}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select New Status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="OPERATIONAL">Operational</SelectItem>
                      <SelectItem value="MAINTENANCE">Maintenance</SelectItem>
                      <SelectItem value="REPAIR">Repair</SelectItem>
                      <SelectItem value="OUT_OF_SERVICE">Out of Service</SelectItem>
                      <SelectItem value="RETIRED">Retired</SelectItem>
                    </SelectContent>
                  </Select>
                  {errors.newStatus && (
                    <p className="text-sm text-red-600">{errors.newStatus.message}</p>
                  )}
                </div>

                <div>
                  <Label htmlFor="changeDate">Change Date *</Label>
                  <Input
                    id="changeDate"
                    type="date"
                    {...register('changeDate')}
                  />
                  {errors.changeDate && (
                    <p className="text-sm text-red-600">{errors.changeDate.message}</p>
                  )}
                </div>

                <div>
                  <Label htmlFor="changeReason">Change Reason *</Label>
                  <Input
                    id="changeReason"
                    {...register('changeReason')}
                    placeholder="e.g., Scheduled maintenance, Equipment failure"
                  />
                  {errors.changeReason && (
                    <p className="text-sm text-red-600">{errors.changeReason.message}</p>
                  )}
                </div>

                <div>
                  <Label htmlFor="changedBy">Changed By *</Label>
                  <Select onValueChange={(value: any) => setValue('changedBy', value)} value={register('changedBy').value}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select User" />
                    </SelectTrigger>
                    <SelectContent>
                      {users?.map((user: any) => (
                        <SelectItem key={user.id} value={user.name}>
                          {user.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {errors.changedBy && (
                    <p className="text-sm text-red-600">{errors.changedBy.message}</p>
                  )}
                </div>

                <div className="md:col-span-2">
                  <Label htmlFor="notes">Notes</Label>
                  <Textarea
                    id="notes"
                    {...register('notes')}
                    placeholder="Any additional notes or observations..."
                  />
                </div>
              </div>

              <div className="flex gap-2 pt-4">
                <Button type="submit" disabled={createMaintenanceStatusHistory.isPending || updateMaintenanceStatusHistory.isPending}>
                  {editingHistory ? 'Update History' : 'Add History'}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setIsFormOpen(false);
                    setEditingHistory(null);
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
