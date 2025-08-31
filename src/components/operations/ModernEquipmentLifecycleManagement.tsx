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
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

import { Card, CardContent } from '@/components/ui/card';
import { DataTable, type Column } from '@/components/ui/data-table';
import { DashboardSkeleton } from '@/components/ui/loading-skeleton';
import { 
  Plus, Edit, Trash2, Eye, 
  Package, Calendar, Clock, AlertTriangle, 
  CheckCircle, Settings, TrendingUp, Activity,
  DollarSign, MapPin, User, FileText,
  ArrowRight
} from 'lucide-react';
import { trpc } from '@/lib/trpc';
import { toast } from 'sonner';
import { format } from 'date-fns';

// ========================================
// MODERN EQUIPMENT LIFECYCLE MANAGEMENT COMPONENT
// Enterprise-grade UI with modern design
// ========================================

type LifecycleEventFormData = {
  equipmentId: string;
  eventType: string;
  eventDate: string;
  description?: string;
  cost: number;
  location?: string;
  vendor?: string;
  notes?: string;
};

interface ModernEquipmentLifecycleManagementProps {
  onSuccess?: () => void;
}

export function ModernEquipmentLifecycleManagement({ onSuccess }: ModernEquipmentLifecycleManagementProps) {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingEvent, setEditingEvent] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [eventTypeFilter, setEventTypeFilter] = useState<string>('all');
  const [equipmentFilter, setEquipmentFilter] = useState<string>('all');
  const [selectedEvent, setSelectedEvent] = useState<any>(null);
  const [activeTab, setActiveTab] = useState('overview');

  const { register, handleSubmit, formState: { errors }, setValue, reset } = useForm<LifecycleEventFormData>({
    defaultValues: {
      equipmentId: '',
      eventType: 'ACQUISITION',
      eventDate: new Date().toISOString().split('T')[0],
      description: '',
      cost: 0,
      location: '',
      vendor: '',
      notes: '',
    },
  });

  // Debounced search term
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('');
  
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
    }, 300);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  // tRPC queries
  const { data: lifecycleEvents, isLoading, refetch } = trpc.ops.listLifecycleEvents.useQuery({
    limit: 100,
    eventType: eventTypeFilter === 'all' ? undefined : eventTypeFilter,
    equipmentId: equipmentFilter === 'all' ? undefined : equipmentFilter,
    search: debouncedSearchTerm.length >= 2 ? debouncedSearchTerm : undefined,
  });

  const { data: equipment } = trpc.ops.listEquipment.useQuery({ limit: 1000 });
  const { data: lifecycleAnalytics } = trpc.ops.getLifecycleAnalytics.useQuery({
    timeRange: 365,
  });

  const createLifecycleEvent = (trpc.ops.createLifecycleEvent as any).useMutation({
    onSuccess: () => {
      toast.success('Lifecycle event created successfully');
      reset();
      setIsFormOpen(false);
      void refetch();
      onSuccess?.();
    },
    onError: (error: any) => {
      toast.error(`Failed to create lifecycle event: ${error.message}`);
    },
  });

  const updateLifecycleEvent = (trpc.ops.updateLifecycleEvent as any).useMutation({
    onSuccess: () => {
      toast.success('Lifecycle event updated successfully');
      reset();
      setIsFormOpen(false);
      setEditingEvent(null);
      void refetch();
      onSuccess?.();
    },
    onError: (error: any) => {
      toast.error(`Failed to update lifecycle event: ${error.message}`);
    },
  });

  const deleteLifecycleEvent = (trpc.ops.deleteLifecycleEvent as any).useMutation({
    onSuccess: () => {
      toast.success('Lifecycle event deleted successfully');
      void refetch();
    },
    onError: (error: any) => {
      toast.error(`Failed to delete lifecycle event: ${error.message}`);
    },
  });

  const onSubmit = async (data: LifecycleEventFormData) => {
    if (editingEvent) {
      await updateLifecycleEvent.mutateAsync({
        id: editingEvent,
        ...data,
        eventDate: new Date(data.eventDate).toISOString(),
        idempotencyKey: crypto.randomUUID(),
      });
    } else {
      await createLifecycleEvent.mutateAsync({
        ...data,
        eventDate: new Date(data.eventDate).toISOString(),
        idempotencyKey: crypto.randomUUID(),
      });
    }
  };

  const handleEdit = (event: any) => {
    setEditingEvent(event.id);
    setValue('equipmentId', event.equipmentId);
    setValue('eventType', event.eventType);
    setValue('eventDate', format(new Date(event.eventDate), 'yyyy-MM-dd'));
    setValue('description', event.description || '');
    setValue('cost', Number(event.cost));
    setValue('location', event.location || '');
    setValue('vendor', event.vendor || '');
    setValue('notes', event.notes || '');
    setIsFormOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this lifecycle event?')) {
      await deleteLifecycleEvent.mutateAsync({ 
        id,
        idempotencyKey: crypto.randomUUID(),
      });
    }
  };

  const handleViewDetails = (event: any) => {
    setSelectedEvent(event);
  };

  // Get events data
  const allEvents = useMemo(() => {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-return
    return (lifecycleEvents?.events || []) as any[];
  }, [lifecycleEvents]);

  // Calculate statistics
  const stats = useMemo(() => {
    const total = allEvents.length;
    const acquisitions = allEvents.filter((e: any) => e.eventType === 'ACQUISITION').length;
    const maintenance = allEvents.filter((e: any) => e.eventType === 'MAINTENANCE').length;
    const disposals = allEvents.filter((e: any) => e.eventType === 'DISPOSAL').length;
    const totalCost = allEvents.reduce((sum: number, e: any) => sum + Number(e.cost || 0), 0);

    return { total, acquisitions, maintenance, disposals, totalCost };
  }, [allEvents]);

  const getEventTypeBadge = (type: string) => {
    const typeConfig = {
      ACQUISITION: { variant: 'default' as const, color: 'bg-green-100 text-green-800' },
      MAINTENANCE: { variant: 'default' as const, color: 'bg-blue-100 text-blue-800' },
      REPAIR: { variant: 'default' as const, color: 'bg-orange-100 text-orange-800' },
      UPGRADE: { variant: 'default' as const, color: 'bg-purple-100 text-purple-800' },
      DISPOSAL: { variant: 'secondary' as const, color: 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-100' },
    };
    
    const config = typeConfig[type as keyof typeof typeConfig] || typeConfig.MAINTENANCE;
    
    return (
      <Badge variant={config.variant} className={config.color}>
        {type}
      </Badge>
    );
  };

  const getEventIcon = (type: string) => {
    switch (type) {
      case 'ACQUISITION':
        return <Package className="h-4 w-4" />;
      case 'MAINTENANCE':
        return <Settings className="h-4 w-4" />;
      case 'REPAIR':
        return <AlertTriangle className="h-4 w-4" />;
      case 'UPGRADE':
        return <TrendingUp className="h-4 w-4" />;
      case 'DISPOSAL':
        return <Trash2 className="h-4 w-4" />;
      default:
        return <Activity className="h-4 w-4" />;
    }
  };

  // Table columns
  const columns: Column<any>[] = [
    {
      key: 'eventType',
      label: 'Event Type',
      sortable: true,
      render: (value: unknown, row: any) => (
        <div className="flex items-center space-x-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-50">
            {getEventIcon(value as string)}
          </div>
          <div>
            <div className="font-medium dark:text-white">{value as string}</div>
            <div className="text-sm text-muted-foreground">{row.equipment?.code}</div>
          </div>
        </div>
      )
    },
    {
      key: 'eventDate',
      label: 'Date',
      sortable: true,
      render: (value: unknown) => format(new Date(value as string), 'MMM dd, yyyy')
    },
    {
      key: 'description',
      label: 'Description',
      sortable: true,
      render: (value: unknown) => (value as string) || '-'
    },
    {
      key: 'cost',
      label: 'Cost',
      sortable: true,
      render: (value: unknown) => (
        <div className="text-right">
          <div className="font-medium">${Number(value || 0).toLocaleString()}</div>
        </div>
      )
    },
    {
      key: 'location',
      label: 'Location',
      sortable: true,
      render: (value: unknown) => (value as string) || '-'
    },
    {
      key: 'vendor',
      label: 'Vendor',
      sortable: true,
      render: (value: unknown) => (value as string) || '-'
    },
    {
      key: 'actions',
      label: 'Actions',
      render: (_, row) => (
        <div className="flex items-center space-x-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => handleViewDetails(row)}
          >
            <Eye className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => handleEdit(row)}
          >
            <Edit className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => handleDelete(row.id)}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      )
    }
  ];

  if (isLoading) {
    return <DashboardSkeleton />;
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold dark:text-white dark:text-white">Equipment Lifecycle Management</h1>
          <p className="text-muted-foreground dark:text-gray-400 mt-2">Track equipment from acquisition to disposal with comprehensive lifecycle insights</p>
        </div>
        <Button 
          onClick={() => setIsFormOpen(true)}
          className="bg-blue-600 hover:bg-blue-700 text-white"
        >
          <Plus className="h-4 w-4 mr-2" />
          Add Event
        </Button>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center">
              <Activity className="h-4 w-4 text-muted-foreground" />
              <div className="ml-2">
                <p className="text-sm font-medium text-muted-foreground">Total Events</p>
                <p className="text-2xl font-bold">{stats.total}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center">
              <Package className="h-4 w-4 text-green-500" />
              <div className="ml-2">
                <p className="text-sm font-medium text-muted-foreground">Acquisitions</p>
                <p className="text-2xl font-bold text-green-600">{stats.acquisitions}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center">
              <Settings className="h-4 w-4 text-blue-500" />
              <div className="ml-2">
                <p className="text-sm font-medium text-muted-foreground">Maintenance</p>
                <p className="text-2xl font-bold text-blue-600">{stats.maintenance}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center">
              <Trash2 className="h-4 w-4 text-red-500" />
              <div className="ml-2">
                <p className="text-sm font-medium text-muted-foreground">Disposals</p>
                <p className="text-2xl font-bold text-red-600">{stats.disposals}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center">
              <DollarSign className="h-4 w-4 text-purple-500" />
              <div className="ml-2">
                <p className="text-sm font-medium text-muted-foreground">Total Cost</p>
                <p className="text-2xl font-bold text-purple-600">${stats.totalCost.toLocaleString()}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Lifecycle Analytics */}
      {lifecycleAnalytics && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center">
                <Package className="h-4 w-4 text-green-500" />
                <div className="ml-2">
                  <p className="text-sm font-medium text-muted-foreground">Acquisition Cost</p>
                  <p className="text-2xl font-bold text-green-600">${lifecycleAnalytics.totalAcquisitionCost.toLocaleString()}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center">
                <Settings className="h-4 w-4 text-blue-500" />
                <div className="ml-2">
                  <p className="text-sm font-medium text-muted-foreground">Maintenance Cost</p>
                  <p className="text-2xl font-bold text-blue-600">${lifecycleAnalytics.totalMaintenanceCost.toLocaleString()}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center">
                <Trash2 className="h-4 w-4 text-muted-foreground" />
                <div className="ml-2">
                  <p className="text-sm font-medium text-muted-foreground">Disposal Value</p>
                  <p className="text-2xl font-bold text-muted-foreground">${lifecycleAnalytics.totalDisposalValue.toLocaleString()}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center">
                <DollarSign className="h-4 w-4 text-purple-500" />
                <div className="ml-2">
                  <p className="text-sm font-medium text-muted-foreground">Net Lifecycle Cost</p>
                  <p className="text-2xl font-bold text-purple-600">${lifecycleAnalytics.netLifecycleCost.toLocaleString()}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Main Content */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="events">Lifecycle Events</TabsTrigger>
          <TabsTrigger value="timeline">Timeline</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardContent className="p-6">
                <div className="mb-4">
                  <h3 className="text-lg font-semibold">Recent Lifecycle Events</h3>
                  <p className="text-sm text-muted-foreground">Latest equipment lifecycle activities</p>
                </div>
                <div className="space-y-4">
                  {allEvents.slice(0, 5).map((event: any) => (
                    <div key={event.id} className="flex items-center space-x-4 p-3 rounded-lg hover:bg-muted/50">
                      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-50">
                        {getEventIcon(event.eventType)}
                      </div>
                      <div className="flex-1">
                        <div className="font-medium dark:text-white">{event.eventType}</div>
                        <div className="text-sm text-muted-foreground">{event.equipment?.code} - {event.description}</div>
                      </div>
                      <div className="text-right">
                        <div className="text-sm font-medium">{format(new Date(event.eventDate), 'MMM dd')}</div>
                        <div className="text-sm text-muted-foreground">${Number(event.cost).toLocaleString()}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="mb-4">
                  <h3 className="text-lg font-semibold">Events by Type</h3>
                  <p className="text-sm text-muted-foreground">Distribution of lifecycle events</p>
                </div>
                <div className="space-y-4">
                  {Object.entries(
                    allEvents.reduce((acc: Record<string, number>, event: any) => {
                      acc[event.eventType] = (acc[event.eventType] || 0) + 1;
                      return acc;
                    }, {} as Record<string, number>)
                  ).map(([type, count]) => (
                    <div key={type} className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className={`h-3 w-3 rounded-full ${
                          type === 'ACQUISITION' ? 'bg-green-500' :
                          type === 'MAINTENANCE' ? 'bg-blue-500' :
                          type === 'REPAIR' ? 'bg-orange-500' :
                          type === 'UPGRADE' ? 'bg-purple-500' :
                          'bg-muted'
                        }`}></div>
                        <span className="text-sm font-medium dark:text-white">{type}</span>
                      </div>
                      <span className="text-sm text-muted-foreground">{count}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="events" className="space-y-6">
          <DataTable
            data={allEvents}
            columns={columns}
            searchable={true}
            filterable={true}
            exportable={true}
            loading={isLoading}
            emptyMessage="No lifecycle events found. Add your first event to get started."
          />
        </TabsContent>

        <TabsContent value="timeline" className="space-y-6">
          <Card>
            <CardContent className="p-6">
              <div className="mb-4">
                <h3 className="text-lg font-semibold">Equipment Lifecycle Timeline</h3>
                <p className="text-sm text-muted-foreground">Chronological view of equipment lifecycle events</p>
              </div>
              <div className="space-y-4">
                {allEvents
                  .sort((a: any, b: any) => new Date(a.eventDate).getTime() - new Date(b.eventDate).getTime())
                  .map((event: any, index: number) => (
                  <div key={event.id} className="flex items-center space-x-4 p-4 border rounded-lg">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-50">
                      {getEventIcon(event.eventType)}
                    </div>
                    <div className="flex-1">
                      <div className="font-medium dark:text-white">{event.eventType}</div>
                      <div className="text-sm text-muted-foreground">{event.equipment?.code} - {event.description}</div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-medium">{format(new Date(event.eventDate), 'MMM dd, yyyy')}</div>
                      <div className="text-sm text-muted-foreground">${Number(event.cost).toLocaleString()}</div>
                    </div>
                    {index < allEvents.length - 1 && (
                      <div className="flex items-center justify-center">
                        <ArrowRight className="h-4 w-4 text-muted-foreground" />
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardContent className="p-6">
                <div className="mb-4">
                  <h3 className="text-lg font-semibold">Lifecycle Cost Analysis</h3>
                  <p className="text-sm text-muted-foreground">Cost breakdown by lifecycle phase</p>
                </div>
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Acquisition Cost</span>
                    <span className="font-semibold">${lifecycleAnalytics?.totalAcquisitionCost?.toLocaleString() || 0}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Maintenance Cost</span>
                    <span className="font-semibold">${lifecycleAnalytics?.totalMaintenanceCost?.toLocaleString() || 0}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Disposal Value</span>
                    <span className="font-semibold text-green-600">${lifecycleAnalytics?.totalDisposalValue?.toLocaleString() || 0}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Net Lifecycle Cost</span>
                    <span className="font-semibold">${lifecycleAnalytics?.netLifecycleCost?.toLocaleString() || 0}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="mb-4">
                  <h3 className="text-lg font-semibold">Event Distribution</h3>
                  <p className="text-sm text-muted-foreground">Lifecycle events by type</p>
                </div>
                <div className="space-y-4">
                  {Object.entries(lifecycleAnalytics?.eventsByType || {} as Record<string, number>).map(([type, count]) => (
                    <div key={type} className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className={`h-3 w-3 rounded-full ${
                          type === 'ACQUISITION' ? 'bg-green-500' :
                          type === 'MAINTENANCE' ? 'bg-blue-500' :
                          type === 'REPAIR' ? 'bg-orange-500' :
                          type === 'UPGRADE' ? 'bg-purple-500' :
                          'bg-muted'
                        }`}></div>
                        <span className="text-sm font-medium dark:text-white">{type}</span>
                      </div>
                      <span className="text-sm text-muted-foreground">{count as number}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      {/* Event Details Modal */}
      {selectedEvent && (
        <Card className="fixed inset-4 z-50 overflow-auto">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="flex items-center space-x-3 text-2xl font-bold dark:text-white">
                  {getEventIcon(selectedEvent.eventType)}
                  <span>{selectedEvent.eventType}</span>
                </h2>
                <p className="text-muted-foreground mt-1">{selectedEvent.equipment?.code} - {selectedEvent.equipment?.name}</p>
              </div>
              <Button variant="outline" onClick={() => setSelectedEvent(null)}>
                Close
              </Button>
            </div>
            <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">Event Type</Label>
                  <div className="mt-1">{getEventTypeBadge(selectedEvent.eventType)}</div>
                </div>
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">Date</Label>
                  <p className="text-sm">{format(new Date(selectedEvent.eventDate), 'MMM dd, yyyy')}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">Cost</Label>
                  <p className="text-sm">${Number(selectedEvent.cost).toLocaleString()}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">Location</Label>
                  <p className="text-sm">{selectedEvent.location || 'N/A'}</p>
                </div>
              </div>
              <div className="space-y-4">
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">Vendor</Label>
                  <p className="text-sm">{selectedEvent.vendor || 'N/A'}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">Description</Label>
                  <p className="text-sm">{selectedEvent.description || 'N/A'}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">Notes</Label>
                  <p className="text-sm">{selectedEvent.notes || 'N/A'}</p>
                </div>
              </div>
            </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Event Form Modal */}
      {isFormOpen && (
        <Card className="fixed inset-4 z-50 overflow-auto">
          <CardContent className="p-6">
            <div className="mb-6">
              <h2 className="text-2xl font-bold dark:text-white">
                {editingEvent ? 'Edit Lifecycle Event' : 'Add New Lifecycle Event'}
              </h2>
              <p className="text-muted-foreground mt-1">
                {editingEvent ? 'Update lifecycle event details' : 'Record a new equipment lifecycle event'}
              </p>
            </div>
            <div className="space-y-6">
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="equipmentId">Equipment *</Label>
                  <Select onValueChange={(value) => setValue('equipmentId', value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select equipment" />
                    </SelectTrigger>
                    <SelectContent>
                      {equipment?.equipment?.map((eq: any) => (
                        <SelectItem key={eq.id} value={eq.id}>
                          {eq.code} - {eq.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {errors.equipmentId && (
                    <p className="text-sm text-red-600">{errors.equipmentId.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="eventType">Event Type *</Label>
                  <Select onValueChange={(value) => setValue('eventType', value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select event type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="ACQUISITION">Acquisition</SelectItem>
                      <SelectItem value="MAINTENANCE">Maintenance</SelectItem>
                      <SelectItem value="REPAIR">Repair</SelectItem>
                      <SelectItem value="UPGRADE">Upgrade</SelectItem>
                      <SelectItem value="DISPOSAL">Disposal</SelectItem>
                    </SelectContent>
                  </Select>
                  {errors.eventType && (
                    <p className="text-sm text-red-600">{errors.eventType.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="eventDate">Event Date *</Label>
                  <Input
                    id="eventDate"
                    type="date"
                    {...register('eventDate')}
                    className="w-full"
                  />
                  {errors.eventDate && (
                    <p className="text-sm text-red-600">{errors.eventDate.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="cost">Cost</Label>
                  <Input
                    id="cost"
                    type="number"
                    step="0.01"
                    {...register('cost', { valueAsNumber: true })}
                    placeholder="0.00"
                    className="w-full"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="location">Location</Label>
                  <Input
                    id="location"
                    {...register('location')}
                    placeholder="Event location"
                    className="w-full"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="vendor">Vendor</Label>
                  <Input
                    id="vendor"
                    {...register('vendor')}
                    placeholder="Vendor name"
                    className="w-full"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  {...register('description')}
                  placeholder="Event description..."
                  className="w-full"
                  rows={3}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="notes">Notes</Label>
                <Textarea
                  id="notes"
                  {...register('notes')}
                  placeholder="Additional notes..."
                  className="w-full"
                  rows={3}
                />
              </div>

              <div className="flex gap-3 pt-6">
                <Button 
                  type="submit" 
                  disabled={createLifecycleEvent.isPending || updateLifecycleEvent.isPending}
                  className="bg-blue-600 hover:bg-blue-700 text-white"
                >
                  {editingEvent ? 'Update Event' : 'Add Event'}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setIsFormOpen(false);
                    setEditingEvent(null);
                    reset();
                  }}
                >
                  Cancel
                </Button>
              </div>
            </form>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
