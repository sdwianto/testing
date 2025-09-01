/* eslint-disable @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-explicit-any */
'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { toast } from 'sonner';
import { trpc } from '@/lib/trpc';
import { Calendar, X } from 'lucide-react';
import type { RentalFormData } from './types/rental';

// ========================================
// RENTAL FORM - Add/Edit Rental Contracts
// Follows project rules and validation standards
// ========================================

const rentalFormSchema = z.object({
  customerId: z.string().min(1, 'Customer is required'),
  equipmentId: z.string().min(1, 'Equipment is required'),
  startDate: z.string().min(1, 'Start date is required'),
  endDate: z.string().optional(),
  dailyRate: z.number().min(0, 'Daily rate must be positive'),
  hourlyRate: z.number().min(0, 'Hourly rate must be positive'),
  contractTerms: z.string().optional(),
});

interface Rental {
  id: string;
  customerId: string;
  equipmentId: string;
  startDate: string;
  endDate?: string;
  dailyRate: number;
  hourlyRate: number;
  contractTerms?: string;
}

interface RentalFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
  editingRental?: Rental;
}

export function RentalForm({ 
  isOpen, 
  onClose, 
  onSuccess,
  editingRental 
}: RentalFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { register, handleSubmit, formState: { errors }, setValue, reset, watch } = useForm<RentalFormData>({
    resolver: zodResolver(rentalFormSchema),
    defaultValues: {
      customerId: '',
      equipmentId: '',
      startDate: '',
      endDate: '',
      dailyRate: 0,
      hourlyRate: 0,
      contractTerms: '',
    },
  });

  // tRPC queries with error handling
  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
  const { data: customers } = trpc.core.listCustomers.useQuery({ limit: 1000 }, { retry: 1 });
  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
  const { data: equipment } = trpc.ops.listEquipment.useQuery({ limit: 1000 }, { retry: 1 });

  // Create/Update rental mutation
  const createRental = trpc.rental.createRental.useMutation({
    onSuccess: () => {
      toast.success('Rental contract created successfully');
      reset();
      onClose();
      onSuccess?.();
    },
    onError: (error) => {
      toast.error(`Failed to create rental: ${error.message}`);
    },
  });

  const updateRental = trpc.rental.updateRental.useMutation({
    onSuccess: () => {
      toast.success('Rental contract updated successfully');
      onClose();
      onSuccess?.();
    },
    onError: (error) => {
      toast.error(`Failed to update rental: ${error.message}`);
    },
  });

  const onSubmit = async (data: RentalFormData) => {
    setIsSubmitting(true);
    try {
      const idempotencyKey = `rental-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      
      if (editingRental) {
        await updateRental.mutateAsync({
          id: editingRental.id,
          idempotencyKey,
          ...data,
        });
      } else {
        await createRental.mutateAsync({
          ...data,
          idempotencyKey,
        });
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    reset();
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            {editingRental ? 'Edit Rental Contract' : 'New Rental Contract'}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Customer and Equipment Selection */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="customerId">Customer *</Label>
              <Select 
                value={watch('customerId')} 
                onValueChange={(value) => setValue('customerId', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select customer" />
                </SelectTrigger>
                <SelectContent>
                  {/* eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-explicit-any, @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access */}
                  {customers?.customers?.map((customer: any) => (
                    <SelectItem key={customer.id} value={customer.id}>
                      {customer.name} {customer.companyName && `(${customer.companyName})`}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.customerId && (
                <p className="text-sm text-destructive">{errors.customerId.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="equipmentId">Equipment *</Label>
              <Select 
                value={watch('equipmentId')} 
                onValueChange={(value) => setValue('equipmentId', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select equipment" />
                </SelectTrigger>
                <SelectContent>
                  {equipment?.equipment?.map((item: { id: string; code: string; name: string }) => (
                    <SelectItem key={item.id} value={item.id}>
                      {item.code} - {item.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.equipmentId && (
                <p className="text-sm text-destructive">{errors.equipmentId.message}</p>
              )}
            </div>
          </div>

          {/* Date Range */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="startDate">Start Date *</Label>
              <Input
                type="date"
                {...register('startDate')}
                className={errors.startDate ? 'border-destructive' : ''}
              />
              {errors.startDate && (
                <p className="text-sm text-destructive">{errors.startDate.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="endDate">End Date (Optional)</Label>
              <Input
                type="date"
                {...register('endDate')}
                min={watch('startDate')}
              />
              {errors.endDate && (
                <p className="text-sm text-destructive">{errors.endDate.message}</p>
              )}
            </div>
          </div>

          {/* Rates */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="dailyRate">Daily Rate (USD) *</Label>
              <Input
                type="number"
                step="0.01"
                min="0"
                {...register('dailyRate', { valueAsNumber: true })}
                className={errors.dailyRate ? 'border-destructive' : ''}
              />
              {errors.dailyRate && (
                <p className="text-sm text-destructive">{errors.dailyRate.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="hourlyRate">Hourly Rate (USD) *</Label>
              <Input
                type="number"
                step="0.01"
                min="0"
                {...register('hourlyRate', { valueAsNumber: true })}
                className={errors.hourlyRate ? 'border-destructive' : ''}
              />
              {errors.hourlyRate && (
                <p className="text-sm text-destructive">{errors.hourlyRate.message}</p>
              )}
            </div>
          </div>

          {/* Contract Terms */}
          <div className="space-y-2">
            <Label htmlFor="contractTerms">Contract Terms (Optional)</Label>
            <Textarea
              {...register('contractTerms')}
              placeholder="Enter contract terms, conditions, or special notes..."
              rows={4}
            />
            {errors.contractTerms && (
              <p className="text-sm text-destructive">{errors.contractTerms.message}</p>
            )}
          </div>

          {/* Form Actions */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t">
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={isSubmitting}
            >
              <X className="h-4 w-4 mr-2" />
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <div className="h-4 w-4 mr-2 animate-spin rounded-full border-2 border-current border-t-transparent" />
                  {editingRental ? 'Updating...' : 'Creating...'}
                </>
              ) : (
                <>
                  <Calendar className="h-4 w-4 mr-2" />
                  {editingRental ? 'Update Contract' : 'Create Contract'}
                </>
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
