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
import { Plus, Edit, Trash2, Search, CheckCircle, XCircle, User, DollarSign } from 'lucide-react';
import { trpc } from '@/lib/trpc';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { LoadingSpinner } from '@/components/ui/loading-spinner';

// ========================================
// WORK ORDER APPROVAL MANAGEMENT COMPONENT
// Enterprise Workflow Features
// ========================================

const workOrderApprovalSchema = z.object({
  workOrderId: z.string().min(1, 'Work Order is required'),
  approverId: z.string().min(1, 'Approver is required'),
  approvalLevel: z.number().min(1, 'Approval Level must be at least 1'),
  requiredAmount: z.number().min(0, 'Required Amount must be non-negative'),
  status: z.enum(['PENDING', 'APPROVED', 'REJECTED']).default('PENDING'),
  approvalDate: z.string().optional(),
  notes: z.string().optional(),
});

type WorkOrderApprovalFormData = z.infer<typeof workOrderApprovalSchema>;

export function WorkOrderApprovalManagement() {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingApproval, setEditingApproval] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  const { register, handleSubmit, formState: { errors }, setValue, reset } = useForm<WorkOrderApprovalFormData>({
    resolver: zodResolver(workOrderApprovalSchema),
    defaultValues: {
      workOrderId: '',
      approverId: '',
      approvalLevel: 1,
      requiredAmount: 0,
      status: 'PENDING',
      approvalDate: '',
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

  const { data: workOrderApprovals, isLoading, refetch } = (trpc.ops.listWorkOrderApprovals as any).useQuery({
    limit: 50,
    search: debouncedSearchTerm.length >= 2 ? debouncedSearchTerm : undefined,
    status: statusFilter === 'all' ? undefined : statusFilter,
  });

  const { data: workOrders } = (trpc.ops.listWorkOrders as any).useQuery({ limit: 1000 });
  const { data: users } = (trpc.core.getUsers as any).useQuery({ limit: 1000 }); // Assuming users can be approvers

  const createWorkOrderApproval = (trpc.ops.createWorkOrderApproval as any).useMutation({
    onSuccess: () => {
      toast.success('Work order approval created successfully');
      reset();
      setIsFormOpen(false);
      void refetch();
    },
    onError: (error: any) => {
      toast.error(`Failed to create work order approval: ${error.message}`);
    },
  });

  const updateWorkOrderApproval = (trpc.ops.updateWorkOrderApproval as any).useMutation({
    onSuccess: () => {
      toast.success('Work order approval updated successfully');
      reset();
      setIsFormOpen(false);
      setEditingApproval(null);
      void refetch();
    },
    onError: (error: any) => {
      toast.error(`Failed to update work order approval: ${error.message}`);
    },
  });

  const deleteWorkOrderApproval = (trpc.ops.deleteWorkOrderApproval as any).useMutation({
    onSuccess: () => {
      toast.success('Work order approval deleted successfully');
      void refetch();
    },
    onError: (error: any) => {
      toast.error(`Failed to delete work order approval: ${error.message}`);
    },
  });

  const onSubmit = async (data: WorkOrderApprovalFormData) => {
    if (editingApproval) {
      await updateWorkOrderApproval.mutateAsync({
        id: editingApproval,
        ...data,
        approvalDate: data.approvalDate ? new Date(data.approvalDate).toISOString() : undefined,
        idempotencyKey: crypto.randomUUID(),
      });
    } else {
      await createWorkOrderApproval.mutateAsync({
        ...data,
        approvalDate: data.approvalDate ? new Date(data.approvalDate).toISOString() : undefined,
        idempotencyKey: crypto.randomUUID(),
      });
    }
  };

  const handleEdit = (approval: any) => {
    setEditingApproval(approval.id);
    setValue('workOrderId', approval.workOrderId);
    setValue('approverId', approval.approverId);
    setValue('approvalLevel', approval.approvalLevel);
    setValue('requiredAmount', approval.requiredAmount);
    setValue('status', approval.status);
    setValue('approvalDate', approval.approvalDate ? format(new Date(approval.approvalDate), 'yyyy-MM-dd') : '');
    setValue('notes', approval.notes || '');
    setIsFormOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this work order approval?')) {
      await deleteWorkOrderApproval.mutateAsync({
        id,
        idempotencyKey: crypto.randomUUID(),
      });
    }
  };

  const allApprovals = useMemo(() => {
    return workOrderApprovals?.workOrderApprovals || [];
  }, [workOrderApprovals]) as any[];

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'APPROVED':
        return <Badge className="bg-green-500 hover:bg-green-600">Approved</Badge>;
      case 'REJECTED':
        return <Badge variant="destructive">Rejected</Badge>;
      case 'PENDING':
        return <Badge variant="secondary">Pending</Badge>;
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
          <h2 className="text-2xl font-bold text-gray-900">Work Order Approval Management</h2>
          <p className="text-gray-600">Manage multi-level, cost-based approval workflows for work orders</p>
        </div>
        <Button onClick={() => setIsFormOpen(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Add Approval Step
        </Button>
      </div>

      <Card>
        <CardContent className="pt-6">
          <div className="flex gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Search approvals (min 2 chars)..."
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
                <SelectItem value="PENDING">Pending</SelectItem>
                <SelectItem value="APPROVED">Approved</SelectItem>
                <SelectItem value="REJECTED">Rejected</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Work Order Approvals ({allApprovals.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Work Order</TableHead>
                <TableHead>Approver</TableHead>
                <TableHead>Level</TableHead>
                <TableHead>Required Amount</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Approval Date</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {allApprovals.map((approval: any) => (
                <TableRow key={approval.id}>
                  <TableCell className="font-medium">{approval.workOrder?.workOrderNumber}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <User className="h-4 w-4 text-muted-foreground" />
                      <span>{approval.approver?.name || 'N/A'}</span>
                    </div>
                  </TableCell>
                  <TableCell>{approval.approvalLevel}</TableCell>
                  <TableCell>${Number(approval.requiredAmount).toLocaleString()}</TableCell>
                  <TableCell>{getStatusBadge(approval.status)}</TableCell>
                  <TableCell>
                    {approval.approvalDate ? format(new Date(approval.approvalDate), 'MMM dd, yyyy') : 'N/A'}
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm" onClick={() => handleEdit(approval)}>
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button variant="outline" size="sm" onClick={() => handleDelete(approval.id)}>
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
            <CardTitle>{editingApproval ? 'Edit Work Order Approval' : 'Create New Work Order Approval'}</CardTitle>
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
                  <Label htmlFor="approverId">Approver *</Label>
                  <Select onValueChange={(value: any) => setValue('approverId', value)} value={register('approverId').value}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select Approver" />
                    </SelectTrigger>
                    <SelectContent>
                      {users?.map((user: any) => (
                        <SelectItem key={user.id} value={user.id}>
                          {user.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {errors.approverId && (
                    <p className="text-sm text-red-600">{errors.approverId.message}</p>
                  )}
                </div>

                <div>
                  <Label htmlFor="approvalLevel">Approval Level *</Label>
                  <Input
                    id="approvalLevel"
                    type="number"
                    {...register('approvalLevel', { valueAsNumber: true })}
                    placeholder="1"
                  />
                  {errors.approvalLevel && (
                    <p className="text-sm text-red-600">{errors.approvalLevel.message}</p>
                  )}
                </div>

                <div>
                  <Label htmlFor="requiredAmount">Required Amount *</Label>
                  <Input
                    id="requiredAmount"
                    type="number"
                    step="0.01"
                    {...register('requiredAmount', { valueAsNumber: true })}
                    placeholder="0.00"
                  />
                  {errors.requiredAmount && (
                    <p className="text-sm text-red-600">{errors.requiredAmount.message}</p>
                  )}
                </div>

                <div>
                  <Label htmlFor="status">Status *</Label>
                  <Select onValueChange={(value: any) => setValue('status', value)} value={register('status').value}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select Status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="PENDING">Pending</SelectItem>
                      <SelectItem value="APPROVED">Approved</SelectItem>
                      <SelectItem value="REJECTED">Rejected</SelectItem>
                    </SelectContent>
                  </Select>
                  {errors.status && (
                    <p className="text-sm text-red-600">{errors.status.message}</p>
                  )}
                </div>

                <div>
                  <Label htmlFor="approvalDate">Approval Date</Label>
                  <Input
                    id="approvalDate"
                    type="date"
                    {...register('approvalDate')}
                  />
                  {errors.approvalDate && (
                    <p className="text-sm text-red-600">{errors.approvalDate.message}</p>
                  )}
                </div>

                <div className="md:col-span-2">
                  <Label htmlFor="notes">Notes</Label>
                  <Textarea
                    id="notes"
                    {...register('notes')}
                    placeholder="Any additional notes or comments..."
                  />
                </div>
              </div>

              <div className="flex gap-2 pt-4">
                <Button type="submit" disabled={createWorkOrderApproval.isPending || updateWorkOrderApproval.isPending}>
                  {editingApproval ? 'Update Approval' : 'Add Approval'}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setIsFormOpen(false);
                    setEditingApproval(null);
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