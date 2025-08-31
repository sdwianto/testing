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
  Package, Wrench, AlertTriangle, 
  CheckCircle, Settings, Activity, TrendingUp,
  FileText, Clock, DollarSign
} from 'lucide-react';
import { trpc } from '@/lib/trpc';
import { toast } from 'sonner';
import { format } from 'date-fns';

// ========================================
// PARTS LIST MANAGEMENT COMPONENT
// JDE F3111 equivalent with enterprise features
// ========================================

type PartsListFormData = {
  workOrderId: string;
  itemId: string;
  quantityRequired: number;
  quantityIssued: number;
  unitCost: number;
  notes?: string;
};

interface PartsListManagementProps {
  onSuccess?: () => void;
}

export function PartsListManagement({ onSuccess }: PartsListManagementProps) {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingPart, setEditingPart] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [workOrderFilter, setWorkOrderFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [selectedPart, setSelectedPart] = useState<any>(null);
  const [activeTab, setActiveTab] = useState('parts');

  const { register, handleSubmit, formState: { errors }, setValue, reset } = useForm<PartsListFormData>({
    defaultValues: {
      workOrderId: '',
      itemId: '',
      quantityRequired: 0,
      quantityIssued: 0,
      unitCost: 0,
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
  const { data: partsList, isLoading, refetch } = trpc.ops.listPartsList.useQuery({
    limit: 50, // FP6: cursor pagination for large lists
    workOrderId: workOrderFilter === 'all' ? undefined : workOrderFilter,
    search: debouncedSearchTerm.length >= 2 ? debouncedSearchTerm : undefined, // FP6: server-side search
  });

  const { data: workOrders } = trpc.ops.listWorkOrders.useQuery({ limit: 1000 });
  const { data: items } = trpc.inventory.listItems.useQuery({ limit: 1000 });

  const createPartsList = (trpc.ops.createPartsList as any).useMutation({
    onSuccess: () => {
      toast.success('Parts list item created successfully');
      reset();
      setIsFormOpen(false);
      void refetch();
      onSuccess?.();
    },
    onError: (error: any) => {
      toast.error(`Failed to create parts list item: ${error.message}`);
    },
  });

  const updatePartsList = (trpc.ops.updatePartsList as any).useMutation({
    onSuccess: () => {
      toast.success('Parts list item updated successfully');
      reset();
      setIsFormOpen(false);
      setEditingPart(null);
      void refetch();
      onSuccess?.();
    },
    onError: (error: any) => {
      toast.error(`Failed to update parts list item: ${error.message}`);
    },
  });

  const onSubmit = async (data: PartsListFormData) => {
    if (editingPart) {
      await updatePartsList.mutateAsync({
        id: editingPart,
        ...data,
        idempotencyKey: crypto.randomUUID(),
      });
    } else {
      await createPartsList.mutateAsync({
        ...data,
        idempotencyKey: crypto.randomUUID(),
      });
    }
  };

  const handleEdit = (part: any) => {
    setEditingPart(part.id);
    setValue('workOrderId', part.workOrderId);
    setValue('itemId', part.itemId);
    setValue('quantityRequired', part.quantityRequired);
    setValue('quantityIssued', part.quantityIssued);
    setValue('unitCost', Number(part.unitCost));
    setValue('notes', part.notes || '');
    setIsFormOpen(true);
  };

  const handleViewDetails = (part: any) => {
    setSelectedPart(part);
  };

  // Get parts data
  const allParts = useMemo(() => {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-return
    return partsList?.partsList || [] as any[];
  }, [partsList]);

  const getStatusBadge = (part: any) => {
    const required = Number(part.quantityRequired);
    const issued = Number(part.quantityIssued);
    
    if (issued >= required) {
      return <Badge variant="default" className="bg-green-600">Complete</Badge>;
    } else if (issued > 0) {
      return <Badge variant="default" className="bg-orange-600">Partial</Badge>;
    } else {
      return <Badge variant="secondary">Pending</Badge>;
    }
  };

  const getCompletionPercentage = (part: any) => {
    const required = Number(part.quantityRequired);
    const issued = Number(part.quantityIssued);
    if (required === 0) return 0;
    return Math.round((issued / required) * 100);
  };

  const totalValue = allParts.reduce((sum: number, part: any) => {
    return sum + (Number(part.quantityRequired) * Number(part.unitCost));
  }, 0);

  const issuedValue = allParts.reduce((sum: number, part: any) => {
    return sum + (Number(part.quantityIssued) * Number(part.unitCost));
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
          <h2 className="text-2xl font-bold text-gray-900">Parts List Management</h2>
          <p className="text-gray-600">Manage parts requirements and issuance for work orders</p>
        </div>
        <Button onClick={() => setIsFormOpen(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Add Parts
        </Button>
      </div>

      {/* Parts Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center">
              <Package className="h-4 w-4 text-muted-foreground" />
              <div className="ml-2">
                <p className="text-sm font-medium text-muted-foreground">Total Parts</p>
                <p className="text-2xl font-bold">{allParts.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center">
              <CheckCircle className="h-4 w-4 text-muted-foreground" />
              <div className="ml-2">
                <p className="text-sm font-medium text-muted-foreground">Complete</p>
                <p className="text-2xl font-bold text-green-600">
                  {allParts.filter((p: any) => Number(p.quantityIssued) >= Number(p.quantityRequired)).length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center">
              <AlertTriangle className="h-4 w-4 text-muted-foreground" />
              <div className="ml-2">
                <p className="text-sm font-medium text-muted-foreground">Pending</p>
                <p className="text-2xl font-bold text-orange-600">
                  {allParts.filter((p: any) => Number(p.quantityIssued) < Number(p.quantityRequired)).length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center">
              <DollarSign className="h-4 w-4 text-muted-foreground" />
              <div className="ml-2">
                <p className="text-sm font-medium text-muted-foreground">Total Value</p>
                <p className="text-2xl font-bold">${totalValue.toLocaleString()}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs for different views */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="parts">Parts List</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="parts" className="space-y-4">
          {/* Search and Filter */}
          <Card>
            <CardContent className="pt-6">
              <div className="flex gap-4">
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                    <Input
                      placeholder="Search parts (min 2 chars)..."
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
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-48">
                    <SelectValue placeholder="Filter by status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="complete">Complete</SelectItem>
                    <SelectItem value="partial">Partial</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Parts List Table */}
          <Card>
            <CardHeader>
              <CardTitle>Parts List ({allParts.length})</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Work Order</TableHead>
                    <TableHead>Item</TableHead>
                    <TableHead>Required</TableHead>
                    <TableHead>Issued</TableHead>
                    <TableHead>Progress</TableHead>
                    <TableHead>Unit Cost</TableHead>
                    <TableHead>Total Value</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {allParts.map((part: any) => (
                    <TableRow key={part.id}>
                      <TableCell>
                        <div>
                          <div className="font-medium">{part.workOrder?.workOrderNumber}</div>
                          <div className="text-sm text-gray-500">{part.workOrder?.title}</div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div>
                          <div className="font-medium">{part.item?.number}</div>
                          <div className="text-sm text-gray-500">{part.item?.description}</div>
                        </div>
                      </TableCell>
                      <TableCell>{part.quantityRequired}</TableCell>
                      <TableCell>{part.quantityIssued}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <div className="w-16 bg-gray-200 rounded-full h-2">
                            <div 
                              className="bg-blue-600 h-2 rounded-full" 
                              style={{ width: `${getCompletionPercentage(part)}%` }}
                            ></div>
                          </div>
                          <span className="text-sm">{getCompletionPercentage(part)}%</span>
                        </div>
                      </TableCell>
                      <TableCell>${Number(part.unitCost).toLocaleString()}</TableCell>
                      <TableCell>${(Number(part.quantityRequired) * Number(part.unitCost)).toLocaleString()}</TableCell>
                      <TableCell>{getStatusBadge(part)}</TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleViewDetails(part)}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleEdit(part)}
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
                  Parts Usage Trends
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Total Required Value</span>
                    <span className="font-medium">${totalValue.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Total Issued Value</span>
                    <span className="font-medium">${issuedValue.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Remaining Value</span>
                    <span className="font-medium">${(totalValue - issuedValue).toLocaleString()}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Activity className="h-5 w-5" />
                  Completion Status
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Complete</span>
                    <span className="font-medium text-green-600">
                      {allParts.filter((p: any) => Number(p.quantityIssued) >= Number(p.quantityRequired)).length}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Partial</span>
                    <span className="font-medium text-orange-600">
                      {allParts.filter((p: any) => Number(p.quantityIssued) > 0 && Number(p.quantityIssued) < Number(p.quantityRequired)).length}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Pending</span>
                    <span className="font-medium text-gray-600">
                      {allParts.filter((p: any) => Number(p.quantityIssued) === 0).length}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      {/* Parts List Details Modal */}
      {selectedPart && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <Package className="h-5 w-5" />
                  Parts List Details
                </CardTitle>
                <p className="text-sm text-gray-600">{selectedPart.item?.number} - {selectedPart.item?.description}</p>
              </div>
              <Button variant="outline" onClick={() => setSelectedPart(null)}>
                Close
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label className="text-sm font-medium text-gray-500">Work Order</Label>
                <p className="text-sm">{selectedPart.workOrder?.workOrderNumber} - {selectedPart.workOrder?.title}</p>
              </div>
              <div>
                <Label className="text-sm font-medium text-gray-500">Item</Label>
                <p className="text-sm">{selectedPart.item?.number} - {selectedPart.item?.description}</p>
              </div>
              <div>
                <Label className="text-sm font-medium text-gray-500">Quantity Required</Label>
                <p className="text-sm">{selectedPart.quantityRequired}</p>
              </div>
              <div>
                <Label className="text-sm font-medium text-gray-500">Quantity Issued</Label>
                <p className="text-sm">{selectedPart.quantityIssued}</p>
              </div>
              <div>
                <Label className="text-sm font-medium text-gray-500">Unit Cost</Label>
                <p className="text-sm">${Number(selectedPart.unitCost).toLocaleString()}</p>
              </div>
              <div>
                <Label className="text-sm font-medium text-gray-500">Total Value</Label>
                <p className="text-sm">${(Number(selectedPart.quantityRequired) * Number(selectedPart.unitCost)).toLocaleString()}</p>
              </div>
              <div>
                <Label className="text-sm font-medium text-gray-500">Status</Label>
                <div className="mt-1">{getStatusBadge(selectedPart)}</div>
              </div>
              <div>
                <Label className="text-sm font-medium text-gray-500">Notes</Label>
                <p className="text-sm">{selectedPart.notes || 'No notes'}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Parts List Form Modal */}
      {isFormOpen && (
        <Card>
          <CardHeader>
            <CardTitle>
              {editingPart ? 'Edit Parts List Item' : 'Add New Parts List Item'}
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
                  <Label htmlFor="itemId">Item *</Label>
                  <Select onValueChange={(value: any) => setValue('itemId', value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select item" />
                    </SelectTrigger>
                    <SelectContent>
                      {items?.items?.map((item: any) => (
                        <SelectItem key={item.id} value={item.id}>
                          {item.number} - {item.description}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {errors.itemId && (
                    <p className="text-sm text-red-600">{errors.itemId.message}</p>
                  )}
                </div>

                <div>
                  <Label htmlFor="quantityRequired">Quantity Required *</Label>
                  <Input
                    id="quantityRequired"
                    type="number"
                    {...register('quantityRequired', { valueAsNumber: true })}
                    placeholder="0"
                  />
                  {errors.quantityRequired && (
                    <p className="text-sm text-red-600">{errors.quantityRequired.message}</p>
                  )}
                </div>

                <div>
                  <Label htmlFor="quantityIssued">Quantity Issued</Label>
                  <Input
                    id="quantityIssued"
                    type="number"
                    {...register('quantityIssued', { valueAsNumber: true })}
                    placeholder="0"
                  />
                </div>

                <div>
                  <Label htmlFor="unitCost">Unit Cost *</Label>
                  <Input
                    id="unitCost"
                    type="number"
                    step="0.01"
                    {...register('unitCost', { valueAsNumber: true })}
                    placeholder="0.00"
                  />
                  {errors.unitCost && (
                    <p className="text-sm text-red-600">{errors.unitCost.message}</p>
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
                <Button type="submit" disabled={createPartsList.isPending || updatePartsList.isPending}>
                  {editingPart ? 'Update Parts Item' : 'Add Parts Item'}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setIsFormOpen(false);
                    setEditingPart(null);
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
