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
import { Plus, Trash2, ShoppingCart } from 'lucide-react';
import { trpc } from '@/lib/trpc';
import { toast } from 'sonner';

// ========================================
// PURCHASE REQUEST FORM COMPONENT (P1 - Inventory Module)
// ========================================

const prSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  description: z.string().optional(),
  departmentId: z.string().optional(),
  priority: z.enum(['LOW', 'MEDIUM', 'HIGH', 'URGENT']),
  requiredDate: z.string().optional(),
  items: z.array(z.object({
    itemId: z.string().min(1, 'Item is required'),
    quantity: z.number().min(1, 'Quantity must be at least 1'),
    unitPrice: z.number().min(0, 'Unit price must be non-negative'),
    description: z.string().optional(),
    specifications: z.string().optional(),
  })).min(1, 'At least one item is required'),
});

type PRFormData = z.infer<typeof prSchema>;

interface PurchaseRequestFormProps {
  onSuccess?: () => void;
  onCancel?: () => void;
}

export function PurchaseRequestForm({ onSuccess, onCancel }: PurchaseRequestFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const { register, handleSubmit, formState: { errors }, setValue, watch, reset } = useForm<PRFormData>({
    resolver: zodResolver(prSchema),
    defaultValues: {
      title: '',
      description: '',
      departmentId: '',
      priority: 'MEDIUM',
      requiredDate: '',
      items: [{ itemId: '', quantity: 1, unitPrice: 0, description: '', specifications: '' }],
    },
  });

  const watchedItems = watch('items');

  // tRPC queries
  const { data: items } = trpc.inv.listItems.useQuery({
    limit: 100,
    search: '',
  });

  const { data: departments } = trpc.core.departments.list.useQuery({
    limit: 100,
  });

  const createPR = trpc.purchase.createPurchaseRequest.useMutation({
    onSuccess: () => {
      toast.success('Purchase Request created successfully');
      reset();
      onSuccess?.();
    },
    onError: (error) => {
      toast.error(`Failed to create Purchase Request: ${error.message}`);
    },
  });

  const onSubmit = async (data: PRFormData) => {
    setIsSubmitting(true);
    try {
      await createPR.mutateAsync({
        title: data.title,
        description: data.description,
        departmentId: data.departmentId ?? undefined,
        priority: data.priority,
        requiredDate: data.requiredDate ? new Date(data.requiredDate) : undefined,
        items: data.items,
      });
    } catch (error) {
      console.error('Error creating Purchase Request:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const addItem = () => {
    setValue('items', [...watchedItems, { itemId: '', quantity: 1, unitPrice: 0, description: '', specifications: '' }]);
  };

  const removeItem = (index: number) => {
    if (watchedItems.length > 1) {
      setValue('items', watchedItems.filter((_, i) => i !== index));
    }
  };

  const updateItem = (index: number, field: keyof PRFormData['items'][0], value: unknown) => {
    const updatedItems = [...watchedItems];
    updatedItems[index] = { ...updatedItems[index], [field]: value } as PRFormData['items'][0];
    setValue('items', updatedItems);
  };

  // Calculate total amount
  const totalAmount = watchedItems.reduce((sum, item) => sum + (item.quantity * item.unitPrice), 0);

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <ShoppingCart className="h-5 w-5" />
          Purchase Request
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Header Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="title">Title</Label>
              <Input
                id="title"
                {...register('title')}
                placeholder="Purchase Request Title"
                className={errors.title ? 'border-red-500' : ''}
              />
              {errors.title && (
                <p className="text-sm text-red-500">{errors.title.message}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="priority">Priority</Label>
              <Select
                value={watch('priority')}
                onValueChange={(value) => setValue('priority', value as 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT')}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select priority" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="LOW">Low</SelectItem>
                  <SelectItem value="MEDIUM">Medium</SelectItem>
                  <SelectItem value="HIGH">High</SelectItem>
                  <SelectItem value="URGENT">Urgent</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="departmentId">Department</Label>
              <Select
                value={watch('departmentId')}
                onValueChange={(value) => setValue('departmentId', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select department" />
                </SelectTrigger>
                <SelectContent>
                  {departments?.departments?.map((dept) => (
                    <SelectItem key={dept.id} value={dept.id}>
                      {dept.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="requiredDate">Required Date</Label>
              <Input
                id="requiredDate"
                type="date"
                {...register('requiredDate')}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              {...register('description')}
              placeholder="Additional description..."
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
                <div className="grid grid-cols-1 md:grid-cols-6 gap-4 items-end">
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
                    <Label>Unit Price</Label>
                    <Input
                      type="number"
                      step="0.01"
                      value={item.unitPrice}
                      onChange={(e) => updateItem(index, 'unitPrice', parseFloat(e.target.value) || 0)}
                      className={errors.items?.[index]?.unitPrice ? 'border-red-500' : ''}
                    />
                    {errors.items?.[index]?.unitPrice && (
                      <p className="text-sm text-red-500">{errors.items[index]?.unitPrice?.message}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label>Description</Label>
                    <Input
                      value={item.description}
                      onChange={(e) => updateItem(index, 'description', e.target.value)}
                      placeholder="Item description"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Specifications</Label>
                    <Input
                      value={item.specifications}
                      onChange={(e) => updateItem(index, 'specifications', e.target.value)}
                      placeholder="Specifications"
                    />
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

          {/* Total Amount */}
          <div className="flex justify-end">
            <div className="text-lg font-semibold">
              Total Amount: ${totalAmount.toFixed(2)}
            </div>
          </div>

          {/* Form Actions */}
          <div className="flex justify-end gap-4">
            <Button type="button" variant="outline" onClick={onCancel}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Creating Purchase Request...' : 'Create Purchase Request'}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
