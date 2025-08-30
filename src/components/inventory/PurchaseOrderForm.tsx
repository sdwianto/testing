/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-argument, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-return */
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
import { FileText, Plus, Trash2 } from 'lucide-react';
import { trpc } from '@/lib/trpc';
import { toast } from 'sonner';

// ========================================
// PURCHASE ORDER FORM COMPONENT (P1 - Inventory Module)
// ========================================

const poSchema = z.object({
  prId: z.string().min(1, 'Purchase Request is required'),
  supplierName: z.string().min(1, 'Supplier name is required'),
  supplierAddress: z.string().optional(),
  expectedDate: z.string().optional(),
  notes: z.string().optional(),
});

type POFormData = z.infer<typeof poSchema>;

interface PurchaseOrderFormProps {
  onSuccess?: () => void;
  onCancel?: () => void;
}

export function PurchaseOrderForm({ onSuccess, onCancel }: PurchaseOrderFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const { register, handleSubmit, formState: { errors }, setValue, watch, reset } = useForm<POFormData>({
    resolver: zodResolver(poSchema),
    defaultValues: {
      prId: '',
      supplierName: '',
      supplierAddress: '',
      expectedDate: '',
      notes: '',
    },
  });

  // tRPC queries
  const { data: purchaseRequests } = trpc.purchase.listPurchaseRequests.useQuery({
    limit: 100,
    status: 'APPROVED',
  });

  const createPO = trpc.purchase.createPurchaseOrderFromPR.useMutation({
    onSuccess: () => {
      toast.success('Purchase Order created successfully');
      reset();
      onSuccess?.();
    },
    onError: (error) => {
      toast.error(`Failed to create Purchase Order: ${error.message}`);
    },
  });

  const onSubmit = async (data: POFormData) => {
    setIsSubmitting(true);
    try {
      await createPO.mutateAsync({
        prId: data.prId,
        supplierName: data.supplierName,
        supplierAddress: data.supplierAddress,
        expectedDate: data.expectedDate ? new Date(data.expectedDate) : undefined,
        notes: data.notes,
      });
    } catch (error) {
      console.error('Error creating Purchase Order:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Get selected PR details
  const selectedPR = purchaseRequests?.purchaseRequests?.find((pr: unknown) => (pr as { id: string }).id === watch('prId'));

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileText className="h-5 w-5" />
          Purchase Order
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Purchase Request Selection */}
          <div className="space-y-2">
            <Label htmlFor="prId">Purchase Request</Label>
            <Select
              value={watch('prId')}
              onValueChange={(value) => setValue('prId', value)}
            >
              <SelectTrigger className={errors.prId ? 'border-red-500' : ''}>
                <SelectValue placeholder="Select Purchase Request" />
              </SelectTrigger>
              <SelectContent>
                {purchaseRequests?.purchaseRequests?.map((pr: unknown) => (
                  <SelectItem key={(pr as { id: string }).id} value={(pr as { id: string }).id}>
                    {(pr as { prNumber: string }).prNumber} - {(pr as { title: string }).title} (${(pr as { totalAmount: number }).totalAmount.toFixed(2)})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.prId && (
              <p className="text-sm text-red-500">{errors.prId.message}</p>
            )}
          </div>

          {/* Selected PR Details */}
          {selectedPR && (
            <Card className="p-4 bg-gray-50 dark:bg-gray-800">
              <h3 className="font-medium mb-2">Purchase Request Details</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="font-medium">PR Number:</span> {selectedPR.prNumber}
                </div>
                <div>
                  <span className="font-medium">Title:</span> {selectedPR.title}
                </div>
                <div>
                  <span className="font-medium">Priority:</span> {selectedPR.priority}
                </div>
                <div>
                  <span className="font-medium">Total Amount:</span> ${parseFloat(selectedPR.totalAmount).toFixed(2)}
                </div>
                <div>
                  <span className="font-medium">Requested By:</span> {selectedPR.requestedBy}
                </div>
                <div>
                  <span className="font-medium">Department:</span> {selectedPR.departmentId}
                </div>
              </div>
              
              {/* PR Items - Mock data for now */}
              <div className="mt-4">
                <h4 className="font-medium mb-2">Items:</h4>
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  Items will be loaded from Purchase Request details
                </div>
              </div>
            </Card>
          )}

          {/* Supplier Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="supplierName">Supplier Name</Label>
              <Input
                id="supplierName"
                {...register('supplierName')}
                placeholder="Supplier Name"
                className={errors.supplierName ? 'border-red-500' : ''}
              />
              {errors.supplierName && (
                <p className="text-sm text-red-500">{errors.supplierName.message}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="expectedDate">Expected Date</Label>
              <Input
                id="expectedDate"
                type="date"
                {...register('expectedDate')}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="supplierAddress">Supplier Address</Label>
            <Textarea
              id="supplierAddress"
              {...register('supplierAddress')}
              placeholder="Supplier address..."
              rows={3}
            />
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

          {/* Form Actions */}
          <div className="flex justify-end gap-4">
            <Button type="button" variant="outline" onClick={onCancel}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting || !selectedPR}>
              {isSubmitting ? 'Creating Purchase Order...' : 'Create Purchase Order'}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
