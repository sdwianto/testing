'use client';

/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/no-unsafe-call */

/* eslint-disable @typescript-eslint/prefer-nullish-coalescing */

import { useState, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';

import { Card, CardContent } from '@/components/ui/card';
import { DashboardSkeleton } from '@/components/ui/loading-skeleton';
import { 
  Package, FileText, BarChart3, 
  Wrench, Calendar, Activity,
  TrendingUp, Clock, DollarSign,
  AlertTriangle, CheckCircle,
  Filter, Download, RefreshCw
} from 'lucide-react';
import { trpc } from '@/lib/trpc';
import { format } from 'date-fns';

// ========================================
// MODERN OPERATIONS DASHBOARD COMPONENT
// Enterprise-grade dashboard with real-time insights
// ========================================

interface ModernOperationsDashboardProps {
  onSuccess?: () => void;
}

export function ModernOperationsDashboard({ onSuccess: _onSuccess }: ModernOperationsDashboardProps) {
  const [timeRange, setTimeRange] = useState('30');
  const [equipmentFilter, setEquipmentFilter] = useState('all');

  // tRPC queries
  const { data: equipmentData, isLoading: equipmentLoading } = trpc.ops.listEquipment.useQuery({ 
    limit: 1000 
  });

  const { data: workOrdersData, isLoading: workOrdersLoading } = trpc.ops.listWorkOrders.useQuery({
    limit: 100,
    status: undefined,
  });

  const { data: maintenanceSchedules, isLoading: maintenanceLoading } = trpc.ops.listMaintenanceSchedules.useQuery({
    limit: 50,
  });

  const { data: performanceMetrics, isLoading: performanceLoading } = trpc.ops.getPerformanceMetrics.useQuery({
    timeRange: Number(timeRange),
    equipmentId: equipmentFilter === 'all' ? undefined : equipmentFilter,
  });

  const { data: maintenanceMetrics, isLoading: maintenanceMetricsLoading } = trpc.ops.getMaintenanceMetrics.useQuery({
    timeRange: Number(timeRange),
    equipmentId: equipmentFilter === 'all' ? undefined : equipmentFilter,
  });

  // const { data: lifecycleAnalytics, isLoading: lifecycleLoading } = trpc.ops.getLifecycleAnalytics.useQuery({
  //   timeRange: 365,
  // });

  const isLoading = equipmentLoading || workOrdersLoading || maintenanceLoading || 
                   performanceLoading || maintenanceMetricsLoading;

  // Calculate statistics
  const stats = useMemo(() => {
    if (!equipmentData || !workOrdersData || !maintenanceSchedules) return null;

    const totalEquipment = equipmentData.equipment?.length || 0;
    const activeEquipment = equipmentData.equipment?.filter((eq: any) => eq.currentStatus === 'ACTIVE').length || 0;
    const totalWorkOrders = workOrdersData.workOrders?.length || 0;
    const openWorkOrders = workOrdersData.workOrders?.filter((wo: any) => wo.status === 'OPEN').length || 0;
    const inProgressWorkOrders = workOrdersData.workOrders?.filter((wo: any) => wo.status === 'IN_PROGRESS').length || 0;
    const completedWorkOrders = workOrdersData.workOrders?.filter((wo: any) => wo.status === 'COMPLETED').length || 0;
    const totalSchedules = maintenanceSchedules.schedules?.length || 0;
    const overdueSchedules = maintenanceSchedules.schedules?.filter((s: any) => 
      new Date(s.nextMaintenanceDate) < new Date()
    ).length || 0;

    return {
      totalEquipment,
      activeEquipment,
      totalWorkOrders,
      openWorkOrders,
      inProgressWorkOrders,
      completedWorkOrders,
      totalSchedules,
      overdueSchedules,
    };
  }, [equipmentData, workOrdersData, maintenanceSchedules]);

  // const getPerformanceStatus = (value: number, type: 'utilization' | 'availability') => {
  //   if (type === 'utilization') {
  //     if (value >= 80) return { status: 'Excellent', color: 'text-green-600', bg: 'bg-green-50' };
  //     if (value >= 60) return { status: 'Good', color: 'text-blue-600', bg: 'bg-blue-50' };
  //     if (value >= 40) return { status: 'Fair', color: 'text-yellow-600', bg: 'bg-yellow-50' };
  //     return { status: 'Poor', color: 'text-red-600', bg: 'bg-red-50' };
  //   } else {
  //     if (value >= 95) return { status: 'Excellent', color: 'text-green-600', bg: 'bg-green-50' };
  //     if (value >= 85) return { status: 'Good', color: 'text-blue-600', bg: 'bg-blue-50' };
  //     if (value >= 75) return { status: 'Fair', color: 'text-yellow-600', bg: 'bg-yellow-50' };
  //     return { status: 'Poor', color: 'text-red-600', bg: 'bg-red-50' };
  //   }
  // };

  if (isLoading) {
    return <DashboardSkeleton />;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold dark:text-white dark:text-white">Operations Dashboard</h1>
          <p className="text-muted-foreground dark:text-gray-400">Real-time insights into your equipment operations and maintenance</p>
        </div>
        <div className="flex items-center space-x-4">
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger className="w-40">
              <Calendar className="h-4 w-4 mr-2" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7">Last 7 days</SelectItem>
              <SelectItem value="30">Last 30 days</SelectItem>
              <SelectItem value="90">Last 90 days</SelectItem>
              <SelectItem value="365">Last year</SelectItem>
            </SelectContent>
          </Select>
          <Select value={equipmentFilter} onValueChange={setEquipmentFilter}>
            <SelectTrigger className="w-48">
              <Filter className="h-4 w-4 mr-2" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Equipment</SelectItem>
              {equipmentData?.equipment?.map((eq: any) => (
                <SelectItem key={eq.id} value={eq.id}>
                  {eq.code} - {eq.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button variant="outline">
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
          <Button variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      {/* Key Performance Indicators */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center">
              <Package className="h-4 w-4 text-muted-foreground" />
              <div className="ml-2">
                <p className="text-sm font-medium text-muted-foreground">Total Equipment</p>
                <p className="text-2xl font-bold">{stats?.totalEquipment || 0}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center">
              <CheckCircle className="h-4 w-4 text-green-500" />
              <div className="ml-2">
                <p className="text-sm font-medium text-muted-foreground">Active Equipment</p>
                <p className="text-2xl font-bold text-green-600">{stats?.activeEquipment || 0}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center">
              <AlertTriangle className="h-4 w-4 text-yellow-500" />
              <div className="ml-2">
                <p className="text-sm font-medium text-muted-foreground">Open Work Orders</p>
                <p className="text-2xl font-bold text-yellow-600">{stats?.openWorkOrders || 0}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center">
              <Clock className="h-4 w-4 text-red-500" />
              <div className="ml-2">
                <p className="text-sm font-medium text-muted-foreground">Overdue Maintenance</p>
                <p className="text-2xl font-bold text-red-600">{stats?.overdueSchedules || 0}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Performance Metrics */}
      {performanceMetrics && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center">
                <Activity className="h-4 w-4 text-blue-500" />
                <div className="ml-2">
                  <p className="text-sm font-medium text-muted-foreground">Avg Utilization</p>
                  <p className="text-2xl font-bold text-blue-600">{performanceMetrics.averageUtilization}%</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center">
                <CheckCircle className="h-4 w-4 text-green-500" />
                <div className="ml-2">
                  <p className="text-sm font-medium text-muted-foreground">Avg Availability</p>
                  <p className="text-2xl font-bold text-green-600">{performanceMetrics.averageAvailability}%</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center">
                <Clock className="h-4 w-4 text-purple-500" />
                <div className="ml-2">
                  <p className="text-sm font-medium text-muted-foreground">Total Runtime</p>
                  <p className="text-2xl font-bold text-purple-600">{performanceMetrics.totalOperatingHours.toLocaleString()}h</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Maintenance KPIs */}
      {maintenanceMetrics && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center">
                <Wrench className="h-4 w-4 text-orange-500" />
                <div className="ml-2">
                  <p className="text-sm font-medium text-muted-foreground">MTTR</p>
                  <p className="text-2xl font-bold text-orange-600">{maintenanceMetrics.averageMTTR}h</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center">
                <TrendingUp className="h-4 w-4 text-green-500" />
                <div className="ml-2">
                  <p className="text-sm font-medium text-muted-foreground">MTBF</p>
                  <p className="text-2xl font-bold text-green-600">{maintenanceMetrics.averageMTBF}h</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center">
                <DollarSign className="h-4 w-4 text-red-500" />
                <div className="ml-2">
                  <p className="text-sm font-medium text-muted-foreground">Total Cost</p>
                  <p className="text-2xl font-bold text-red-600">${maintenanceMetrics.totalMaintenanceCost.toLocaleString()}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Recent Work Orders */}
        <Card>
          <CardContent className="p-6">
            <div className="mb-4">
              <h3 className="text-lg font-semibold">Recent Work Orders</h3>
              <p className="text-sm text-muted-foreground">Latest work orders and their status</p>
            </div>
            <div className="space-y-4">
              {workOrdersData?.workOrders?.slice(0, 5).map((workOrder: any) => (
                <div key={workOrder.id} className="flex items-center space-x-4 p-3 rounded-lg hover:bg-muted/50">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-muted">
                    <FileText className="h-5 w-5 text-muted-foreground" />
                  </div>
                  <div className="flex-1">
                    <div className="font-medium">{workOrder.workOrderNumber}</div>
                    <div className="text-sm text-muted-foreground">{workOrder.equipment?.code} - {workOrder.title}</div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Badge variant={
                      workOrder.status === 'COMPLETED' ? 'default' :
                      workOrder.status === 'IN_PROGRESS' ? 'default' :
                      'secondary'
                    } className={
                      workOrder.status === 'COMPLETED' ? 'bg-green-100 text-green-800' :
                      workOrder.status === 'IN_PROGRESS' ? 'bg-orange-100 text-orange-800' :
                      'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-100'
                    }>
                      {workOrder.status.replace('_', ' ')}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Upcoming Maintenance */}
        <Card>
          <CardContent className="p-6">
            <div className="mb-4">
              <h3 className="text-lg font-semibold">Upcoming Maintenance</h3>
              <p className="text-sm text-muted-foreground">Scheduled maintenance activities</p>
            </div>
            <div className="space-y-4">
              {maintenanceSchedules?.schedules
                ?.sort((a: any, b: any) => new Date(a.nextMaintenanceDate).getTime() - new Date(b.nextMaintenanceDate).getTime())
                .slice(0, 5)
                .map((schedule: any) => (
                <div key={schedule.id} className="flex items-center space-x-4 p-3 rounded-lg hover:bg-muted/50">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-muted">
                    <Calendar className="h-5 w-5 text-muted-foreground" />
                  </div>
                  <div className="flex-1">
                    <div className="font-medium">{schedule.scheduleName}</div>
                    <div className="text-sm text-muted-foreground">{schedule.equipment?.code}</div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-medium">{format(new Date(schedule.nextMaintenanceDate), 'MMM dd')}</div>
                    {new Date(schedule.nextMaintenanceDate) < new Date() && (
                      <Badge variant="destructive" className="text-xs mt-1">Overdue</Badge>
                    )}
                    {new Date(schedule.nextMaintenanceDate) > new Date() && 
                     new Date(schedule.nextMaintenanceDate) <= new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) && (
                      <Badge variant="default" className="text-xs bg-orange-600 mt-1">Due Soon</Badge>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Equipment Performance */}
        <Card>
          <CardContent className="p-6">
            <div className="mb-4">
              <h3 className="text-lg font-semibold">Equipment Performance</h3>
              <p className="text-sm text-muted-foreground">Top performing equipment</p>
            </div>
            <div className="space-y-4">
              {performanceMetrics?.equipmentPerformance
                ?.sort((a: any, b: any) => b.utilizationRate - a.utilizationRate)
                .slice(0, 5)
                .map((ep: any) => (
                <div key={ep.equipmentId} className="flex items-center space-x-4 p-3 rounded-lg hover:bg-muted/50">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-muted">
                    <Package className="h-5 w-5 text-muted-foreground" />
                  </div>
                  <div className="flex-1">
                    <div className="font-medium">{ep.equipment.code}</div>
                    <div className="text-sm text-muted-foreground">{ep.equipment.name}</div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-medium">{ep.utilizationRate}%</div>
                    <div className="text-xs text-muted-foreground">Utilization</div>
                  </div>
                  <Badge className={
                    ep.performanceStatus === 'EXCELLENT' ? 'bg-green-100 text-green-800' :
                    ep.performanceStatus === 'GOOD' ? 'bg-blue-100 text-blue-800' :
                    ep.performanceStatus === 'FAIR' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-red-100 text-red-800'
                  }>
                    {ep.performanceStatus}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Cost Analysis */}
        <Card>
          <CardContent className="p-6">
            <div className="mb-4">
              <h3 className="text-lg font-semibold">Cost Analysis</h3>
              <p className="text-sm text-muted-foreground">Maintenance cost breakdown</p>
            </div>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="h-3 w-3 rounded-full bg-blue-500"></div>
                  <span className="text-sm font-medium dark:text-white">Labor</span>
                </div>
                <span className="text-sm text-muted-foreground">60%</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="h-3 w-3 rounded-full bg-green-500"></div>
                  <span className="text-sm font-medium dark:text-white">Parts</span>
                </div>
                <span className="text-sm text-muted-foreground">30%</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="h-3 w-3 rounded-full bg-orange-500"></div>
                  <span className="text-sm font-medium dark:text-white">Materials</span>
                </div>
                <span className="text-sm text-muted-foreground">10%</span>
              </div>
              <div className="pt-4 border-t">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium dark:text-white">Total Cost</span>
                  <span className="text-sm font-semibold">${maintenanceMetrics?.totalMaintenanceCost?.toLocaleString() || 0}</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardContent className="p-6">
          <div className="mb-4">
            <h3 className="text-lg font-semibold">Quick Actions</h3>
            <p className="text-sm text-muted-foreground">Common operations and maintenance tasks</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Button variant="outline" className="h-20 flex flex-col items-center justify-center space-y-2">
              <Package className="h-6 w-6" />
              <span>Add Equipment</span>
            </Button>
            <Button variant="outline" className="h-20 flex flex-col items-center justify-center space-y-2">
              <FileText className="h-6 w-6" />
              <span>Create Work Order</span>
            </Button>
            <Button variant="outline" className="h-20 flex flex-col items-center justify-center space-y-2">
              <Calendar className="h-6 w-6" />
              <span>Schedule Maintenance</span>
            </Button>
            <Button variant="outline" className="h-20 flex flex-col items-center justify-center space-y-2">
              <BarChart3 className="h-6 w-6" />
              <span>View Reports</span>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
