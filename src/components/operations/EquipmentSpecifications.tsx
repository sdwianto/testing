'use client';

/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/no-unsafe-call */
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
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { 
  Plus, Edit, Trash2, Settings, 
  Ruler, Zap, Gauge, Wrench 
} from 'lucide-react';
import { trpc } from '@/lib/trpc';
import { toast } from 'sonner';

// ========================================
// EQUIPMENT SPECIFICATIONS COMPONENT
// ========================================

const specSchema = z.object({
  specType: z.string().min(1, 'Specification type is required'),
  specName: z.string().min(1, 'Specification name is required'),
  specValue: z.string().min(1, 'Specification value is required'),
  specUnit: z.string().optional(),
});

type SpecFormData = z.infer<typeof specSchema>;

interface EquipmentSpecificationsProps {
  equipmentId: string;
}

export function EquipmentSpecifications({ equipmentId }: EquipmentSpecificationsProps) {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingSpec, setEditingSpec] = useState<string | null>(null);

  const { register, handleSubmit, formState: { errors }, setValue, reset } = useForm<SpecFormData>({
    resolver: zodResolver(specSchema),
    defaultValues: {
      specType: 'DIMENSIONS',
      specName: '',
      specValue: '',
      specUnit: '',
    },
  });

  const { data: specs, isLoading, refetch } = trpc.ops.listEquipmentSpecs.useQuery({
    equipmentId,
  });

  const createSpec = trpc.ops.createEquipmentSpec.useMutation({
    onSuccess: () => {
      toast.success('Specification created successfully');
      reset();
      setIsFormOpen(false);
      refetch();
    },
    onError: (error) => {
      toast.error(`Failed to create specification: ${error.message}`);
    },
  });

  const updateSpec = trpc.ops.updateEquipmentSpec.useMutation({
    onSuccess: () => {
      toast.success('Specification updated successfully');
      reset();
      setIsFormOpen(false);
      setEditingSpec(null);
      refetch();
    },
    onError: (error) => {
      toast.error(`Failed to update specification: ${error.message}`);
    },
  });

  const deleteSpec = trpc.ops.deleteEquipmentSpec.useMutation({
    onSuccess: () => {
      toast.success('Specification deleted successfully');
      refetch();
    },
    onError: (error) => {
      toast.error(`Failed to delete specification: ${error.message}`);
    },
  });

  const onSubmit = async (data: SpecFormData) => {
    if (editingSpec) {
      await updateSpec.mutateAsync({
        id: editingSpec,
        ...data,
        idempotencyKey: crypto.randomUUID(),
      });
    } else {
      await createSpec.mutateAsync({
        equipmentId,
        ...data,
        idempotencyKey: crypto.randomUUID(),
      });
    }
  };

  const handleEdit = (spec: any) => {
    setEditingSpec(spec.id);
    setValue('specType', spec.specType);
    setValue('specName', spec.specName);
    setValue('specValue', spec.specValue);
    setValue('specUnit', spec.specUnit || '');
    setIsFormOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this specification?')) {
      await deleteSpec.mutateAsync({ 
        id,
        idempotencyKey: crypto.randomUUID(),
      });
    }
  };

  const getSpecTypeIcon = (type: string) => {
    const iconMap = {
      DIMENSIONS: Ruler,
      CAPACITY: Gauge,
      POWER: Zap,
      PERFORMANCE: Settings,
      GENERAL: Wrench,
    };
    
    return iconMap[type as keyof typeof iconMap] || Wrench;
  };

  const getSpecTypeBadge = (type: string) => {
    const typeConfig = {
      DIMENSIONS: { variant: 'outline' as const, color: 'text-blue-600' },
      CAPACITY: { variant: 'secondary' as const, color: 'text-green-600' },
      POWER: { variant: 'default' as const, color: 'text-orange-600' },
      PERFORMANCE: { variant: 'destructive' as const, color: 'text-red-600' },
      GENERAL: { variant: 'outline' as const, color: 'text-gray-600' },
    };
    
    const config = typeConfig[type as keyof typeof typeConfig] || typeConfig.GENERAL;
    const Icon = getSpecTypeIcon(type);
    
    return (
      <Badge variant={config.variant} className={`flex items-center gap-1 ${config.color}`}>
        <Icon className="h-3 w-3" />
        {type}
      </Badge>
    );
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-32">
        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">Equipment Specifications</h3>
          <p className="text-sm text-gray-600">Manage technical specifications and parameters</p>
        </div>
        <Button onClick={() => setIsFormOpen(true)} size="sm">
          <Plus className="h-4 w-4 mr-2" />
          Add Specification
        </Button>
      </div>

      {/* Specifications List */}
      <Card>
        <CardContent className="pt-6">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Type</TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Value</TableHead>
                <TableHead>Unit</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {specs?.map((spec: any) => (
                <TableRow key={spec.id}>
                  <TableCell>{getSpecTypeBadge(spec.specType)}</TableCell>
                  <TableCell className="font-medium">{spec.specName}</TableCell>
                  <TableCell>{spec.specValue}</TableCell>
                  <TableCell>{spec.specUnit || '-'}</TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleEdit(spec)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDelete(spec.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          
          {(!specs || specs.length === 0) && (
            <div className="text-center py-8 text-gray-500">
              <Settings className="h-12 w-12 mx-auto mb-2 opacity-50" />
              <p>No specifications found. Add some specifications to get started.</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Specification Form Modal */}
      {isFormOpen && (
        <Card>
          <CardHeader>
            <CardTitle>
              {editingSpec ? 'Edit Specification' : 'Add New Specification'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="specType">Specification Type *</Label>
                  <Select onValueChange={(value) => setValue('specType', value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="DIMENSIONS">Dimensions</SelectItem>
                      <SelectItem value="CAPACITY">Capacity</SelectItem>
                      <SelectItem value="POWER">Power</SelectItem>
                      <SelectItem value="PERFORMANCE">Performance</SelectItem>
                      <SelectItem value="GENERAL">General</SelectItem>
                    </SelectContent>
                  </Select>
                  {errors.specType && (
                    <p className="text-sm text-red-600">{errors.specType.message}</p>
                  )}
                </div>

                <div>
                  <Label htmlFor="specName">Specification Name *</Label>
                  <Input
                    id="specName"
                    {...register('specName')}
                    placeholder="e.g., Engine Power, Load Capacity"
                  />
                  {errors.specName && (
                    <p className="text-sm text-red-600">{errors.specName.message}</p>
                  )}
                </div>

                <div>
                  <Label htmlFor="specValue">Value *</Label>
                  <Input
                    id="specValue"
                    {...register('specValue')}
                    placeholder="e.g., 250, 15.5"
                  />
                  {errors.specValue && (
                    <p className="text-sm text-red-600">{errors.specValue.message}</p>
                  )}
                </div>

                <div>
                  <Label htmlFor="specUnit">Unit</Label>
                  <Input
                    id="specUnit"
                    {...register('specUnit')}
                    placeholder="e.g., HP, tons, meters"
                  />
                </div>
              </div>

              <div className="flex gap-2 pt-4">
                <Button type="submit" disabled={createSpec.isPending || updateSpec.isPending}>
                  {editingSpec ? 'Update Specification' : 'Create Specification'}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setIsFormOpen(false);
                    setEditingSpec(null);
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
