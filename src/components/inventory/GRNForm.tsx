/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unsafe-assignment */
'use client';

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
import { Plus, Trash2, Package } from 'lucide-react';
import { trpc } from '@/lib/trpc';
import { toast } from 'sonner';

// ========================================
// GRN FORM COMPONENT (P1 - Inventory Module)
// ========================================

const grnSchema = z.object({
  reference: z.string().min(1, 'Reference is required'),
  supplier: z.string().min(1, 'Supplier is required'),
  notes: z.string().optional(),
  items: z.array(z.object({
    itemId: z.string().min(1, 'Item is required'),
    quantity: z.number().min(1, 'Quantity must be at least 1'),
    unitCost: z.number().min(0, 'Unit cost must be non-negative'),
    location: z.string().min(1, 'Location is required'),
  })).min(1, 'At least one item is required'),
});

type GRNFormData = z.infer<typeof grnSchema>;

interface GRNFormProps {
  onSuccess?: () => void;
  onCancel?: () => void;
}

export function GRNForm({ onSuccess, onCancel }: GRNFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const { register, handleSubmit, formState: { errors }, setValue, watch, reset } = useForm<GRNFormData>({
    resolver: zodResolver(grnSchema),
    defaultValues: {
      reference: '',
      supplier: '',
      notes: '',
      items: [{ itemId: '', quantity: 1, unitCost: 0, location: '' }],
    },
  });

  const watchedItems = watch('items');

  // tRPC queries
  const { data: items } = trpc.inventory.listItems.useQuery({
    limit: 100,
    search: '',
  });

  const { data: locations } = trpc.inventory.listLocations.useQuery({
    limit: 100,
  });

  const createGRN = trpc.inventory.createInventoryTx.useMutation({
    onSuccess: () => {
      toast.success('GRN created successfully');
      reset();
      onSuccess?.();
    },
    onError: (error) => {
      toast.error(`Failed to create GRN: ${error.message}`);
    },
  });

  const onSubmit = async (data: GRNFormData) => {
    setIsSubmitting(true);
    try {
      // Create GRN transactions for each item
      for (const item of data.items) {
        await createGRN.mutateAsync({
          itemId: item.itemId,
          siteId: 'default', // TODO: Get from context
          location: item.location,
          txType: 'GRN',
          qty: item.quantity,
          unitCost: item.unitCost,
          refType: 'GRN',
          refId: data.reference,
          notes: data.notes,
          idempotencyKey: `${data.reference}-${item.itemId}-${Date.now()}`,
        });
      }
    } catch (error) {
      console.error('Error creating GRN:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const addItem = () => {
    setValue('items', [...watchedItems, { itemId: '', quantity: 1, unitCost: 0, location: '' }]);
  };

  const removeItem = (index: number) => {
    if (watchedItems.length > 1) {
      setValue('items', watchedItems.filter((_, i) => i !== index));
    }
  };

  const updateItem = (index: number, field: keyof GRNFormData['items'][0], value: unknown) => {
    const updatedItems = [...watchedItems];
    updatedItems[index] = { ...updatedItems[index], [field]: value } as GRNFormData['items'][0];
    setValue('items', updatedItems);
  };

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Package className="h-5 w-5" />
          Goods Receipt Note (GRN)
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Header Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="reference">Reference Number</Label>
              <Input
                id="reference"
                {...register('reference')}
                placeholder="GRN-2024-001"
                className={errors.reference ? 'border-red-500' : ''}
              />
              {errors.reference && (
                <p className="text-sm text-red-500">{errors.reference.message}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="supplier">Supplier</Label>
              <Input
                id="supplier"
                {...register('supplier')}
                placeholder="Supplier Name"
                className={errors.supplier ? 'border-red-500' : ''}
              />
              {errors.supplier && (
                <p className="text-sm text-red-500">{errors.supplier.message}</p>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Notes</Label>
            <Textarea
              id="notes"
              {...register('notes')}
              placeholder="Additional notes..."
              rows={3}
            />
          </div>

          {/* Items Section */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-medium">Items</h3>
              <Button type="button" onClick={addItem} size="sm" variant="outline">
                <Plus className="h-4 w-4 mr-2" />
                Add Item
              </Button>
            </div>

            {watchedItems.map((item, index) => (
              <Card key={index} className="p-4">
                <div className="grid grid-cols-1 md:grid-cols-5 gap-4 items-end">
                  <div className="space-y-2">
                    <Label>Item</Label>
                    <Select
                      value={item.itemId}
                      onValueChange={(value) => updateItem(index, 'itemId', value)}
                    >
                      <SelectTrigger className={errors.items?.[index]?.itemId ? 'border-red-500' : ''}>
                        <SelectValue placeholder="Select item" />
                      </SelectTrigger>
                      <SelectContent>
                        {items?.items?.map((item) => (
                          <SelectItem key={item.id} value={item.id}>
                            {item.number} - {item.description}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {errors.items?.[index]?.itemId && (
                      <p className="text-sm text-red-500">{errors.items[index]?.itemId?.message}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label>Quantity</Label>
                    <Input
                      type="number"
                      value={item.quantity}
                      onChange={(e) => updateItem(index, 'quantity', parseInt(e.target.value) || 0)}
                      className={errors.items?.[index]?.quantity ? 'border-red-500' : ''}
                    />
                    {errors.items?.[index]?.quantity && (
                      <p className="text-sm text-red-500">{errors.items[index]?.quantity?.message}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label>Unit Cost</Label>
                    <Input
                      type="number"
                      step="0.01"
                      value={item.unitCost}
                      onChange={(e) => updateItem(index, 'unitCost', parseFloat(e.target.value) || 0)}
                      className={errors.items?.[index]?.unitCost ? 'border-red-500' : ''}
                    />
                    {errors.items?.[index]?.unitCost && (
                      <p className="text-sm text-red-500">{errors.items[index]?.unitCost?.message}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label>Location</Label>
                    <Select
                      value={item.location}
                      onValueChange={(value) => updateItem(index, 'location', value)}
                    >
                      <SelectTrigger className={errors.items?.[index]?.location ? 'border-red-500' : ''}>
                        <SelectValue placeholder="Select location" />
                      </SelectTrigger>
                      <SelectContent>
                        {locations?.locations?.map((location) => (
                          <SelectItem key={location.id} value={location.id}>
                            {location.bin}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {errors.items?.[index]?.location && (
                      <p className="text-sm text-red-500">{errors.items[index]?.location?.message}</p>
                    )}
                  </div>

                  <div className="flex justify-end">
                    <Button
                      type="button"
                      onClick={() => removeItem(index)}
                      size="sm"
                      variant="outline"
                      disabled={watchedItems.length === 1}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>

          {/* Form Actions */}
          <div className="flex justify-end gap-4">
            <Button type="button" variant="outline" onClick={onCancel}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Creating GRN...' : 'Create GRN'}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
