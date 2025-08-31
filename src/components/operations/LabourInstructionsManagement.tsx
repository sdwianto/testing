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
  Users, Wrench, AlertTriangle, 
  CheckCircle, Settings, Activity, TrendingUp,
  Clock, User, FileText
} from 'lucide-react';
import { trpc } from '@/lib/trpc';
import { toast } from 'sonner';
import { format } from 'date-fns';

// ========================================
// LABOUR INSTRUCTIONS MANAGEMENT COMPONENT
// JDE F3112 equivalent with enterprise features
// ========================================

type LabourInstructionsFormData = {
  workOrderId: string;
  taskDescription: string;
  estimatedHours: number;
  actualHours?: number;
  skillLevel: string;
  assignedUserId?: string;
  instructions: string;
  status: string;
  notes?: string;
};

interface LabourInstructionsManagementProps {
  onSuccess?: () => void;
}

export function LabourInstructionsManagement({ onSuccess }: LabourInstructionsManagementProps) {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingInstruction, setEditingInstruction] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [workOrderFilter, setWorkOrderFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [skillFilter, setSkillFilter] = useState<string>('all');
  const [selectedInstruction, setSelectedInstruction] = useState<any>(null);
  const [activeTab, setActiveTab] = useState('instructions');

  const { register, handleSubmit, formState: { errors }, setValue, reset } = useForm<LabourInstructionsFormData>({
    defaultValues: {
      workOrderId: '',
      taskDescription: '',
      estimatedHours: 0,
      actualHours: 0,
      skillLevel: 'BASIC',
      assignedUserId: '',
      instructions: '',
      status: 'PENDING',
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
  const { data: labourInstructions, isLoading, refetch } = trpc.ops.listLabourInstructions.useQuery({
    limit: 50, // FP6: cursor pagination for large lists
    workOrderId: workOrderFilter === 'all' ? undefined : workOrderFilter,
    status: statusFilter === 'all' ? undefined : statusFilter,
    search: debouncedSearchTerm.length >= 2 ? debouncedSearchTerm : undefined, // FP6: server-side search
  });

  const { data: workOrders } = trpc.ops.listWorkOrders.useQuery({ limit: 1000 });
  const { data: users } = trpc.core.getUsers.useQuery({});

  const createLabourInstructions = (trpc.ops.createLabourInstructions as any).useMutation({
    onSuccess: () => {
      toast.success('Labour instruction created successfully');
      reset();
      setIsFormOpen(false);
      void refetch();
      onSuccess?.();
    },
    onError: (error: any) => {
      toast.error(`Failed to create labour instruction: ${error.message}`);
    },
  });

  const updateLabourInstructions = (trpc.ops.updateLabourInstructions as any).useMutation({
    onSuccess: () => {
      toast.success('Labour instruction updated successfully');
      reset();
      setIsFormOpen(false);
      setEditingInstruction(null);
      void refetch();
      onSuccess?.();
    },
    onError: (error: any) => {
      toast.error(`Failed to update labour instruction: ${error.message}`);
    },
  });

  const onSubmit = async (data: LabourInstructionsFormData) => {
    if (editingInstruction) {
      await updateLabourInstructions.mutateAsync({
        id: editingInstruction,
        ...data,
        idempotencyKey: crypto.randomUUID(),
      });
    } else {
      await createLabourInstructions.mutateAsync({
        ...data,
        idempotencyKey: crypto.randomUUID(),
      });
    }
  };

  const handleEdit = (instruction: any) => {
    setEditingInstruction(instruction.id);
    setValue('workOrderId', instruction.workOrderId);
    setValue('taskDescription', instruction.taskDescription);
    setValue('estimatedHours', instruction.estimatedHours);
    setValue('actualHours', instruction.actualHours || 0);
    setValue('skillLevel', instruction.skillLevel);
    setValue('assignedUserId', instruction.assignedUserId || '');
    setValue('instructions', instruction.instructions);
    setValue('status', instruction.status);
    setValue('notes', instruction.notes || '');
    setIsFormOpen(true);
  };

  const handleViewDetails = (instruction: any) => {
    setSelectedInstruction(instruction);
  };

  // Get instructions data
  const allInstructions = useMemo(() => {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-return
    return labourInstructions?.labourInstructions || [] as any[];
  }, [labourInstructions]);

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      PENDING: { variant: 'secondary' as const, color: 'text-gray-600' },
      IN_PROGRESS: { variant: 'default' as const, color: 'text-blue-600' },
      COMPLETED: { variant: 'default' as const, color: 'text-green-600' },
      CANCELLED: { variant: 'destructive' as const, color: 'text-red-600' },
    };
    
    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.PENDING;
    
    return (
      <Badge variant={config.variant} className={config.color}>
        {status.replace('_', ' ')}
      </Badge>
    );
  };

  const getSkillBadge = (skill: string) => {
    const skillConfig = {
      BASIC: { variant: 'outline' as const, color: 'text-gray-600' },
      INTERMEDIATE: { variant: 'default' as const, color: 'text-blue-600' },
      ADVANCED: { variant: 'default' as const, color: 'text-green-600' },
      EXPERT: { variant: 'default' as const, color: 'text-purple-600' },
    };
    
    const config = skillConfig[skill as keyof typeof skillConfig] || skillConfig.BASIC;
    
    return (
      <Badge variant={config.variant} className={config.color}>
        {skill}
      </Badge>
    );
  };

  const getEfficiencyPercentage = (instruction: any) => {
    const estimated = Number(instruction.estimatedHours);
    const actual = Number(instruction.actualHours || 0);
    if (estimated === 0) return 0;
    return Math.round((actual / estimated) * 100);
  };

  const totalEstimatedHours = allInstructions.reduce((sum: number, instruction: any) => {
    return sum + Number(instruction.estimatedHours);
  }, 0);

  const totalActualHours = allInstructions.reduce((sum: number, instruction: any) => {
    return sum + Number(instruction.actualHours || 0);
  }, 0);

  const completedInstructions = allInstructions.filter((i: any) => i.status === 'COMPLETED').length;

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
          <h2 className="text-2xl font-bold text-gray-900">Labour Instructions Management</h2>
          <p className="text-gray-600">Manage labour tasks, assignments, and work instructions</p>
        </div>
        <Button onClick={() => setIsFormOpen(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Add Instruction
        </Button>
      </div>

      {/* Labour Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center">
              <Users className="h-4 w-4 text-muted-foreground" />
              <div className="ml-2">
                <p className="text-sm font-medium text-muted-foreground">Total Tasks</p>
                <p className="text-2xl font-bold">{allInstructions.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center">
              <CheckCircle className="h-4 w-4 text-muted-foreground" />
              <div className="ml-2">
                <p className="text-sm font-medium text-muted-foreground">Completed</p>
                <p className="text-2xl font-bold text-green-600">{completedInstructions}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center">
              <Clock className="h-4 w-4 text-muted-foreground" />
              <div className="ml-2">
                <p className="text-sm font-medium text-muted-foreground">Est. Hours</p>
                <p className="text-2xl font-bold">{totalEstimatedHours.toFixed(1)}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center">
              <Activity className="h-4 w-4 text-muted-foreground" />
              <div className="ml-2">
                <p className="text-sm font-medium text-muted-foreground">Actual Hours</p>
                <p className="text-2xl font-bold">{totalActualHours.toFixed(1)}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs for different views */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="instructions">Labour Instructions</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="instructions" className="space-y-4">
          {/* Search and Filter */}
          <Card>
            <CardContent className="pt-6">
              <div className="flex gap-4">
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                    <Input
                      placeholder="Search instructions (min 2 chars)..."
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
                    <SelectItem value="PENDING">Pending</SelectItem>
                    <SelectItem value="IN_PROGRESS">In Progress</SelectItem>
                    <SelectItem value="COMPLETED">Completed</SelectItem>
                    <SelectItem value="CANCELLED">Cancelled</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={skillFilter} onValueChange={setSkillFilter}>
                  <SelectTrigger className="w-48">
                    <SelectValue placeholder="Filter by skill" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Skills</SelectItem>
                    <SelectItem value="BASIC">Basic</SelectItem>
                    <SelectItem value="INTERMEDIATE">Intermediate</SelectItem>
                    <SelectItem value="ADVANCED">Advanced</SelectItem>
                    <SelectItem value="EXPERT">Expert</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Labour Instructions Table */}
          <Card>
            <CardHeader>
              <CardTitle>Labour Instructions ({allInstructions.length})</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Work Order</TableHead>
                    <TableHead>Task Description</TableHead>
                    <TableHead>Skill Level</TableHead>
                    <TableHead>Assigned To</TableHead>
                    <TableHead>Est. Hours</TableHead>
                    <TableHead>Actual Hours</TableHead>
                    <TableHead>Efficiency</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {allInstructions.map((instruction: any) => (
                    <TableRow key={instruction.id}>
                      <TableCell>
                        <div>
                          <div className="font-medium">{instruction.workOrder?.workOrderNumber}</div>
                          <div className="text-sm text-gray-500">{instruction.workOrder?.title}</div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="max-w-xs">
                          <div className="font-medium truncate">{instruction.taskDescription}</div>
                          <div className="text-sm text-gray-500 truncate">{instruction.instructions}</div>
                        </div>
                      </TableCell>
                      <TableCell>{getSkillBadge(instruction.skillLevel)}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <User className="h-4 w-4 text-gray-400" />
                          <span className="text-sm">
                            {instruction.assignedUser?.name || 'Unassigned'}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>{instruction.estimatedHours}</TableCell>
                      <TableCell>{instruction.actualHours || 0}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <div className="w-16 bg-gray-200 rounded-full h-2">
                            <div 
                              className={`h-2 rounded-full ${
                                getEfficiencyPercentage(instruction) <= 100 ? 'bg-green-600' : 'bg-red-600'
                              }`}
                              style={{ width: `${Math.min(getEfficiencyPercentage(instruction), 100)}%` }}
                            ></div>
                          </div>
                          <span className="text-sm">{getEfficiencyPercentage(instruction)}%</span>
                        </div>
                      </TableCell>
                      <TableCell>{getStatusBadge(instruction.status)}</TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleViewDetails(instruction)}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleEdit(instruction)}
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
                  Labour Efficiency
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Total Estimated Hours</span>
                    <span className="font-medium">{totalEstimatedHours.toFixed(1)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Total Actual Hours</span>
                    <span className="font-medium">{totalActualHours.toFixed(1)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Efficiency Rate</span>
                    <span className={`font-medium ${
                      totalEstimatedHours > 0 && (totalActualHours / totalEstimatedHours) <= 1 
                        ? 'text-green-600' 
                        : 'text-red-600'
                    }`}>
                      {totalEstimatedHours > 0 
                        ? `${((totalActualHours / totalEstimatedHours) * 100).toFixed(1)}%`
                        : '0%'
                      }
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Activity className="h-5 w-5" />
                  Task Status Distribution
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Completed</span>
                    <span className="font-medium text-green-600">
                      {allInstructions.filter((i: any) => i.status === 'COMPLETED').length}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">In Progress</span>
                    <span className="font-medium text-blue-600">
                      {allInstructions.filter((i: any) => i.status === 'IN_PROGRESS').length}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Pending</span>
                    <span className="font-medium text-gray-600">
                      {allInstructions.filter((i: any) => i.status === 'PENDING').length}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Cancelled</span>
                    <span className="font-medium text-red-600">
                      {allInstructions.filter((i: any) => i.status === 'CANCELLED').length}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      {/* Labour Instruction Details Modal */}
      {selectedInstruction && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  Labour Instruction Details
                </CardTitle>
                <p className="text-sm text-gray-600">{selectedInstruction.taskDescription}</p>
              </div>
              <Button variant="outline" onClick={() => setSelectedInstruction(null)}>
                Close
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label className="text-sm font-medium text-gray-500">Work Order</Label>
                <p className="text-sm">{selectedInstruction.workOrder?.workOrderNumber} - {selectedInstruction.workOrder?.title}</p>
              </div>
              <div>
                <Label className="text-sm font-medium text-gray-500">Task Description</Label>
                <p className="text-sm">{selectedInstruction.taskDescription}</p>
              </div>
              <div>
                <Label className="text-sm font-medium text-gray-500">Skill Level</Label>
                <div className="mt-1">{getSkillBadge(selectedInstruction.skillLevel)}</div>
              </div>
              <div>
                <Label className="text-sm font-medium text-gray-500">Assigned To</Label>
                <p className="text-sm">{selectedInstruction.assignedUser?.name || 'Unassigned'}</p>
              </div>
              <div>
                <Label className="text-sm font-medium text-gray-500">Estimated Hours</Label>
                <p className="text-sm">{selectedInstruction.estimatedHours}</p>
              </div>
              <div>
                <Label className="text-sm font-medium text-gray-500">Actual Hours</Label>
                <p className="text-sm">{selectedInstruction.actualHours || 0}</p>
              </div>
              <div>
                <Label className="text-sm font-medium text-gray-500">Status</Label>
                <div className="mt-1">{getStatusBadge(selectedInstruction.status)}</div>
              </div>
              <div>
                <Label className="text-sm font-medium text-gray-500">Instructions</Label>
                <p className="text-sm whitespace-pre-wrap">{selectedInstruction.instructions}</p>
              </div>
              <div className="md:col-span-2">
                <Label className="text-sm font-medium text-gray-500">Notes</Label>
                <p className="text-sm">{selectedInstruction.notes || 'No notes'}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Labour Instruction Form Modal */}
      {isFormOpen && (
        <Card>
          <CardHeader>
            <CardTitle>
              {editingInstruction ? 'Edit Labour Instruction' : 'Add New Labour Instruction'}
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
                  <Label htmlFor="taskDescription">Task Description *</Label>
                  <Input
                    id="taskDescription"
                    {...register('taskDescription')}
                    placeholder="e.g., Replace hydraulic pump"
                  />
                  {errors.taskDescription && (
                    <p className="text-sm text-red-600">{errors.taskDescription.message}</p>
                  )}
                </div>

                <div>
                  <Label htmlFor="skillLevel">Skill Level *</Label>
                  <Select onValueChange={(value: any) => setValue('skillLevel', value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select skill level" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="BASIC">Basic</SelectItem>
                      <SelectItem value="INTERMEDIATE">Intermediate</SelectItem>
                      <SelectItem value="ADVANCED">Advanced</SelectItem>
                      <SelectItem value="EXPERT">Expert</SelectItem>
                    </SelectContent>
                  </Select>
                  {errors.skillLevel && (
                    <p className="text-sm text-red-600">{errors.skillLevel.message}</p>
                  )}
                </div>

                <div>
                  <Label htmlFor="assignedUserId">Assigned To</Label>
                  <Select onValueChange={(value: any) => setValue('assignedUserId', value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select user" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">Unassigned</SelectItem>
                      {users?.map((user: any) => (
                        <SelectItem key={user.id} value={user.id}>
                          {user.name} ({user.email})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="estimatedHours">Estimated Hours *</Label>
                  <Input
                    id="estimatedHours"
                    type="number"
                    step="0.1"
                    {...register('estimatedHours', { valueAsNumber: true })}
                    placeholder="0.0"
                  />
                  {errors.estimatedHours && (
                    <p className="text-sm text-red-600">{errors.estimatedHours.message}</p>
                  )}
                </div>

                <div>
                  <Label htmlFor="actualHours">Actual Hours</Label>
                  <Input
                    id="actualHours"
                    type="number"
                    step="0.1"
                    {...register('actualHours', { valueAsNumber: true })}
                    placeholder="0.0"
                  />
                </div>

                <div>
                  <Label htmlFor="status">Status *</Label>
                  <Select onValueChange={(value: any) => setValue('status', value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="PENDING">Pending</SelectItem>
                      <SelectItem value="IN_PROGRESS">In Progress</SelectItem>
                      <SelectItem value="COMPLETED">Completed</SelectItem>
                      <SelectItem value="CANCELLED">Cancelled</SelectItem>
                    </SelectContent>
                  </Select>
                  {errors.status && (
                    <p className="text-sm text-red-600">{errors.status.message}</p>
                  )}
                </div>

                <div className="md:col-span-2">
                  <Label htmlFor="instructions">Instructions *</Label>
                  <Textarea
                    id="instructions"
                    {...register('instructions')}
                    placeholder="Detailed work instructions..."
                    rows={4}
                  />
                  {errors.instructions && (
                    <p className="text-sm text-red-600">{errors.instructions.message}</p>
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
                <Button type="submit" disabled={createLabourInstructions.isPending || updateLabourInstructions.isPending}>
                  {editingInstruction ? 'Update Instruction' : 'Add Instruction'}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setIsFormOpen(false);
                    setEditingInstruction(null);
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
