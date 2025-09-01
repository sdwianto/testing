'use client';

/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-floating-promises */
/* eslint-disable @typescript-eslint/prefer-nullish-coalescing */

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
import { Plus, Edit, Trash2, Search, Package, AlertTriangle } from 'lucide-react';
import { trpc } from '@/lib/trpc';
import { toast } from 'sonner';

// ========================================
// ITEM MASTER COMPONENT (P1 - Inventory Module)
// Per Implementation Guide: Item master, multi-store stock
// ========================================

const itemSchema = z.object({
  number: z.string().min(1, 'Item number is required'),
  description: z.string().min(1, 'Description is required'),
  type: z.string().min(1, 'Item type is required'),
  stdCost: z.number().min(0, 'Standard cost must be non-negative'),
  lastCost: z.number().min(0, 'Last cost must be non-negative'),
  avgCost: z.number().min(0, 'Average cost must be non-negative'),
});

type ItemFormData = z.infer<typeof itemSchema>;

interface ItemMasterProps {
  onSuccess?: () => void;
}

export function ItemMaster({ onSuccess }: ItemMasterProps) {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('');

  const { register, handleSubmit, formState: { errors }, setValue, watch, reset } = useForm<ItemFormData>({
    resolver: zodResolver(itemSchema),
    defaultValues: {
      number: '',
      description: '',
      type: '',
      stdCost: 0,
      lastCost: 0,
      avgCost: 0,
    },
  });

  // Debounced search term (FP6: debounce search inputs)
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
    }, 300);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  // tRPC queries with cursor pagination (R1: keyset pagination)
  const { data: items, isLoading, refetch, fetchNextPage, hasNextPage, isFetchingNextPage } = trpc.inventory.listItems.useInfiniteQuery(
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

  const createItem = trpc.inventory.createItem.useMutation({
    onSuccess: () => {
      toast.success('Item created successfully');
      reset();
      setIsFormOpen(false);
      void refetch();
      onSuccess?.();
    },
    onError: (error) => {
      toast.error(`Failed to create item: ${error.message}`);
    },
  });

  const updateItem = trpc.inventory.updateItem.useMutation({
    onSuccess: () => {
      toast.success('Item updated successfully');
      reset();
      setIsFormOpen(false);
      setEditingItem(null);
      void refetch();
      onSuccess?.();
    },
    onError: (error) => {
      toast.error(`Failed to update item: ${error.message}`);
    },
  });

  const deleteItem = trpc.inventory.deleteItem.useMutation({
    onSuccess: () => {
      toast.success('Item deleted successfully');
      void refetch();
    },
    onError: (error) => {
      toast.error(`Failed to delete item: ${error.message}`);
    },
  });

  const onSubmit = async (data: ItemFormData) => {
    if (editingItem) {
      await updateItem.mutateAsync({
        id: editingItem,
        ...data,
        idempotencyKey: crypto.randomUUID(),
      });
    } else {
      await createItem.mutateAsync({
        ...data,
        idempotencyKey: crypto.randomUUID(),
      });
    }
  };

  const handleEdit = (item: any) => {
    setEditingItem(item.id);
    setValue('number', item.number);
    setValue('description', item.description);
    setValue('type', item.type);
    setValue('stdCost', Number(item.stdCost));
    setValue('lastCost', Number(item.lastCost));
    setValue('avgCost', Number(item.avgCost));
    setIsFormOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this item?')) {
      await deleteItem.mutateAsync({ 
        id,
        idempotencyKey: crypto.randomUUID(),
      });
    }
  };

  // Flatten paginated results
  const allItems = useMemo(() => {
    return items?.pages.flatMap(page => page.items) || [];
  }, [items]);

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
          <h2 className="text-2xl font-bold text-gray-900">Item Master</h2>
          <p className="text-gray-600">Manage inventory items and specifications</p>
        </div>
        <Button onClick={() => setIsFormOpen(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Add Item
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
                  placeholder="Search items (min 2 chars)..."
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
                <SelectItem value="RAW_MATERIAL">Raw Material</SelectItem>
                <SelectItem value="FINISHED_GOOD">Finished Good</SelectItem>
                <SelectItem value="SPARE_PART">Spare Part</SelectItem>
                <SelectItem value="TOOL">Tool</SelectItem>
                <SelectItem value="CONSUMABLE">Consumable</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Items List */}
      <Card>
        <CardHeader>
          <CardTitle>Items ({allItems.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Number</TableHead>
                <TableHead>Description</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Standard Cost</TableHead>
                <TableHead>Last Cost</TableHead>
                <TableHead>Average Cost</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {allItems.map((item: any) => (
                <TableRow key={item.id}>
                  <TableCell className="font-medium">{item.number}</TableCell>
                  <TableCell>{item.description}</TableCell>
                  <TableCell>
                    <Badge variant="outline">{item.type}</Badge>
                  </TableCell>
                  <TableCell>${Number(item.stdCost).toFixed(2)}</TableCell>
                  <TableCell>${Number(item.lastCost).toFixed(2)}</TableCell>
                  <TableCell>${Number(item.avgCost).toFixed(2)}</TableCell>
                  <TableCell>
                    <Badge variant={item.isActive ? "default" : "secondary"}>
                      {item.isActive ? "Active" : "Inactive"}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleEdit(item)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDelete(item.id)}
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

      {/* Item Form Modal */}
      {isFormOpen && (
        <Card>
          <CardHeader>
            <CardTitle>
              {editingItem ? 'Edit Item' : 'Add New Item'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="number">Item Number *</Label>
                  <Input
                    id="number"
                    {...register('number')}
                    placeholder="e.g., ITM-001"
                  />
                  {errors.number && (
                    <p className="text-sm text-red-600">{errors.number.message}</p>
                  )}
                </div>

                <div>
                  <Label htmlFor="type">Item Type *</Label>
                  <Select onValueChange={(value) => setValue('type', value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="RAW_MATERIAL">Raw Material</SelectItem>
                      <SelectItem value="FINISHED_GOOD">Finished Good</SelectItem>
                      <SelectItem value="SPARE_PART">Spare Part</SelectItem>
                      <SelectItem value="TOOL">Tool</SelectItem>
                      <SelectItem value="CONSUMABLE">Consumable</SelectItem>
                    </SelectContent>
                  </Select>
                  {errors.type && (
                    <p className="text-sm text-red-600">{errors.type.message}</p>
                  )}
                </div>

                <div className="md:col-span-2">
                  <Label htmlFor="description">Description *</Label>
                  <Textarea
                    id="description"
                    {...register('description')}
                    placeholder="Item description..."
                  />
                  {errors.description && (
                    <p className="text-sm text-red-600">{errors.description.message}</p>
                  )}
                </div>

                <div>
                  <Label htmlFor="stdCost">Standard Cost</Label>
                  <Input
                    id="stdCost"
                    type="number"
                    step="0.01"
                    {...register('stdCost', { valueAsNumber: true })}
                    placeholder="0.00"
                  />
                  {errors.stdCost && (
                    <p className="text-sm text-red-600">{errors.stdCost.message}</p>
                  )}
                </div>

                <div>
                  <Label htmlFor="lastCost">Last Cost</Label>
                  <Input
                    id="lastCost"
                    type="number"
                    step="0.01"
                    {...register('lastCost', { valueAsNumber: true })}
                    placeholder="0.00"
                  />
                  {errors.lastCost && (
                    <p className="text-sm text-red-600">{errors.lastCost.message}</p>
                  )}
                </div>

                <div>
                  <Label htmlFor="avgCost">Average Cost</Label>
                  <Input
                    id="avgCost"
                    type="number"
                    step="0.01"
                    {...register('avgCost', { valueAsNumber: true })}
                    placeholder="0.00"
                  />
                  {errors.avgCost && (
                    <p className="text-sm text-red-600">{errors.avgCost.message}</p>
                  )}
                </div>
              </div>

              <div className="flex gap-2 pt-4">
                <Button type="submit" disabled={createItem.isPending || updateItem.isPending}>
                  {editingItem ? 'Update Item' : 'Create Item'}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setIsFormOpen(false);
                    setEditingItem(null);
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
