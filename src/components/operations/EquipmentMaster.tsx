'use client';

/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-floating-promises */
/* eslint-disable @typescript-eslint/prefer-nullish-coalescing */
/* eslint-disable @typescript-eslint/prefer-optional-chain */

import { useState, useMemo, useCallback, useEffect } from 'react';
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
import { Plus, Edit, Trash2, Search, Filter } from 'lucide-react';
import { trpc } from '@/lib/trpc';
import { toast } from 'sonner';

// ========================================
// EQUIPMENT MASTER COMPONENT (P1 - Operations Module)
// ========================================

const equipmentSchema = z.object({
  code: z.string().min(1, 'Equipment code is required'),
  type: z.string().min(1, 'Equipment type is required'),
  description: z.string().optional(),
  currentSiteId: z.string().optional(),
  acquisitionCost: z.number().min(0, 'Acquisition cost must be non-negative'),
  currentValue: z.number().min(0, 'Current value must be non-negative'),
});

type EquipmentFormData = z.infer<typeof equipmentSchema>;

interface EquipmentMasterProps {
  onSuccess?: () => void;
}

export function EquipmentMaster({ onSuccess }: EquipmentMasterProps) {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingEquipment, setEditingEquipment] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [cursor, setCursor] = useState<string | undefined>(undefined);

  const { register, handleSubmit, formState: { errors }, setValue, watch, reset } = useForm<EquipmentFormData>({
    resolver: zodResolver(equipmentSchema),
    defaultValues: {
      code: '',
      type: '',
      description: '',
      currentSiteId: '',
      acquisitionCost: 0,
      currentValue: 0,
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
  const { data: equipment, isLoading, refetch, fetchNextPage, hasNextPage, isFetchingNextPage } = trpc.ops.listEquipment.useInfiniteQuery(
    {
      limit: 50, // FP6: cursor pagination for large lists
      type: typeFilter === 'all' ? undefined : typeFilter,
      search: debouncedSearchTerm.length >= 2 ? debouncedSearchTerm : undefined, // FP6: server-side search
    },
    {
      getNextPageParam: (lastPage) => lastPage.nextCursor,
      staleTime: 5 * 60 * 1000, // FP7: tune React Query cache
      gcTime: 10 * 60 * 1000, // React Query v5: gcTime replaces cacheTime
    }
  );

  const { data: sites } = trpc.core.getSites.useQuery();

  const createEquipment = trpc.ops.createEquipment.useMutation({
    onSuccess: () => {
      toast.success('Equipment created successfully');
      reset();
      setIsFormOpen(false);
      refetch();
      onSuccess?.();
    },
    onError: (error) => {
      toast.error(`Failed to create equipment: ${error.message}`);
    },
  });

  const updateEquipment = trpc.ops.updateEquipment.useMutation({
    onSuccess: () => {
      toast.success('Equipment updated successfully');
      reset();
      setIsFormOpen(false);
      setEditingEquipment(null);
      refetch();
      onSuccess?.();
    },
    onError: (error) => {
      toast.error(`Failed to update equipment: ${error.message}`);
    },
  });

  const deleteEquipment = trpc.ops.deleteEquipment.useMutation({
    onSuccess: () => {
      toast.success('Equipment deleted successfully');
      refetch();
    },
    onError: (error) => {
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
    setValue('type', equipment.type);
    setValue('description', equipment.description || '');
    setValue('currentSiteId', equipment.currentSiteId || '');
    setValue('acquisitionCost', Number(equipment.acquisitionCost));
    setValue('currentValue', Number(equipment.currentValue));
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

  // Flatten paginated results
  const allEquipment = useMemo(() => {
    return equipment?.pages.flatMap(page => page.equipment) || [];
  }, [equipment]);

  // Load more callback
  const loadMore = useCallback(() => {
    if (hasNextPage && !isFetchingNextPage) {
      void fetchNextPage();
    }
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

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
          <p className="text-gray-600">Manage equipment inventory and details</p>
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
                <TableHead>Type</TableHead>
                <TableHead>Description</TableHead>
                <TableHead>Current Site</TableHead>
                <TableHead>Acquisition Cost</TableHead>
                <TableHead>Current Value</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {allEquipment.map((equipment: any) => (
                <TableRow key={equipment.id}>
                  <TableCell className="font-medium">{equipment.code}</TableCell>
                  <TableCell>{equipment.type}</TableCell>
                  <TableCell>{equipment.description || '-'}</TableCell>
                  <TableCell>{equipment.currentSiteId || '-'}</TableCell>
                  <TableCell>${Number(equipment.acquisitionCost).toLocaleString()}</TableCell>
                  <TableCell>${Number(equipment.currentValue).toLocaleString()}</TableCell>
                  <TableCell>
                    <Badge variant={equipment.isActive ? "default" : "secondary"}>
                      {equipment.isActive ? "Active" : "Inactive"}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-2">
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
          
          {/* Load More Button */}
          {hasNextPage && (
            <div className="flex justify-center mt-4">
              <Button 
                variant="outline" 
                onClick={loadMore} 
                disabled={isFetchingNextPage}
              >
                {isFetchingNextPage ? 'Loading...' : 'Load More'}
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

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
                    </SelectContent>
                  </Select>
                  {errors.type && (
                    <p className="text-sm text-red-600">{errors.type.message}</p>
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
              </div>

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
