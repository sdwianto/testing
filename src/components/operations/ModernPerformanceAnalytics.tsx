'use client';

/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */

/* eslint-disable @typescript-eslint/prefer-nullish-coalescing */

import { useState, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

import { Card, CardContent } from '@/components/ui/card';
import { DashboardSkeleton } from '@/components/ui/loading-skeleton';
import { 
  TrendingUp, Activity, Clock, 
  DollarSign, Package, AlertTriangle, CheckCircle,
  BarChart3, LineChart, Calendar, Filter, Download
} from 'lucide-react';
import { trpc } from '@/lib/trpc';

// ========================================
// MODERN PERFORMANCE ANALYTICS COMPONENT
// Enterprise-grade analytics with modern design
// ========================================

interface ModernPerformanceAnalyticsProps {
  onSuccess?: () => void;
}

export function ModernPerformanceAnalytics({ onSuccess }: ModernPerformanceAnalyticsProps) {
  const [timeRange, setTimeRange] = useState('30');
  const [equipmentFilter, setEquipmentFilter] = useState('all');
  const [activeTab, setActiveTab] = useState('overview');

  // tRPC queries
  const { data: performanceMetrics, isLoading: performanceLoading } = trpc.ops.getPerformanceMetrics.useQuery({
    timeRange: Number(timeRange),
    equipmentId: equipmentFilter === 'all' ? undefined : equipmentFilter,
  });

  const { data: maintenanceMetrics, isLoading: maintenanceLoading } = trpc.ops.getMaintenanceMetrics.useQuery({
    timeRange: Number(timeRange),
    equipmentId: equipmentFilter === 'all' ? undefined : equipmentFilter,
  });

  const { data: costAnalysis, isLoading: costLoading } = trpc.ops.getCostAnalysis.useQuery({
    timeRange: Number(timeRange),
    equipmentId: equipmentFilter === 'all' ? undefined : equipmentFilter,
  });

  const { data: equipmentData } = trpc.ops.listEquipment.useQuery({ limit: 1000 });

  const isLoading = performanceLoading || maintenanceLoading || costLoading;

  // Calculate statistics
  const stats = useMemo(() => {
    if (!performanceMetrics) return null;

    const totalEquipment = performanceMetrics.equipmentCount;
    const totalHours = performanceMetrics.totalOperatingHours;
    const avgUtilization = performanceMetrics.averageUtilization;
    const avgAvailability = performanceMetrics.averageAvailability;

    return { totalEquipment, totalHours, avgUtilization, avgAvailability };
  }, [performanceMetrics]);

  const getPerformanceStatus = (value: number, type: 'utilization' | 'availability') => {
    if (type === 'utilization') {
      if (value >= 80) return { status: 'Excellent', color: 'text-green-600', bg: 'bg-green-50' };
      if (value >= 60) return { status: 'Good', color: 'text-blue-600', bg: 'bg-blue-50' };
      if (value >= 40) return { status: 'Fair', color: 'text-yellow-600', bg: 'bg-yellow-50' };
      return { status: 'Poor', color: 'text-red-600', bg: 'bg-red-50' };
    } else {
      if (value >= 95) return { status: 'Excellent', color: 'text-green-600', bg: 'bg-green-50' };
      if (value >= 85) return { status: 'Good', color: 'text-blue-600', bg: 'bg-blue-50' };
      if (value >= 75) return { status: 'Fair', color: 'text-yellow-600', bg: 'bg-yellow-50' };
      return { status: 'Poor', color: 'text-red-600', bg: 'bg-red-50' };
    }
  };

  const getOEEStatus = (oee: number) => {
    if (oee >= 85) return { status: 'World Class', color: 'text-green-600', bg: 'bg-green-50' };
    if (oee >= 75) return { status: 'Excellent', color: 'text-blue-600', bg: 'bg-blue-50' };
    if (oee >= 65) return { status: 'Good', color: 'text-yellow-600', bg: 'bg-yellow-50' };
    if (oee >= 50) return { status: 'Fair', color: 'text-orange-600', bg: 'bg-orange-50' };
    return { status: 'Poor', color: 'text-red-600', bg: 'bg-red-50' };
  };

  if (isLoading) {
    return <DashboardSkeleton />;
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold dark:text-white dark:text-white">Performance Analytics</h1>
          <p className="text-gray-600 dark:text-muted-foreground mt-2">Comprehensive equipment performance insights and KPIs</p>
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
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      {/* Key Performance Indicators */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center">
                <Package className="h-4 w-4 text-muted-foreground" />
                <div className="ml-2">
                  <p className="text-sm font-medium text-muted-foreground">Total Equipment</p>
                  <p className="text-2xl font-bold">{stats.totalEquipment}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center">
                <Clock className="h-4 w-4 text-blue-500" />
                <div className="ml-2">
                  <p className="text-sm font-medium text-muted-foreground">Operating Hours</p>
                  <p className="text-2xl font-bold text-blue-600">{stats.totalHours.toLocaleString()}h</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center">
                <Activity className="h-4 w-4 text-green-500" />
                <div className="ml-2">
                  <p className="text-sm font-medium text-muted-foreground">Avg Utilization</p>
                  <p className="text-2xl font-bold text-green-600">{stats.avgUtilization}%</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center">
                <CheckCircle className="h-4 w-4 text-purple-500" />
                <div className="ml-2">
                  <p className="text-sm font-medium text-muted-foreground">Avg Availability</p>
                  <p className="text-2xl font-bold text-purple-600">{stats.avgAvailability}%</p>
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
                <Clock className="h-4 w-4 text-blue-500" />
                <div className="ml-2">
                  <p className="text-sm font-medium text-muted-foreground">MTTR</p>
                  <p className="text-2xl font-bold text-blue-600">{maintenanceMetrics.averageMTTR}h</p>
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
                <DollarSign className="h-4 w-4 text-purple-500" />
                <div className="ml-2">
                  <p className="text-sm font-medium text-muted-foreground">Total Cost</p>
                  <p className="text-2xl font-bold text-purple-600">${maintenanceMetrics.totalMaintenanceCost.toLocaleString()}</p>
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
          <TabsTrigger value="equipment">Equipment Performance</TabsTrigger>
          <TabsTrigger value="costs">Cost Analysis</TabsTrigger>
          <TabsTrigger value="trends">Trends</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardContent className="p-6">
                <div className="mb-4">
                  <h3 className="text-lg font-semibold">Performance Summary</h3>
                  <p className="text-sm text-muted-foreground">Key performance indicators and metrics</p>
                </div>
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Overall Equipment Effectiveness (OEE)</span>
                    <div className="flex items-center space-x-2">
                      <span className="font-semibold">78%</span>
                      <Badge className={getOEEStatus(78).bg + ' ' + getOEEStatus(78).color}>
                        {getOEEStatus(78).status}
                      </Badge>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Average Utilization Rate</span>
                    <div className="flex items-center space-x-2">
                      <span className="font-semibold">{stats?.avgUtilization}%</span>
                      <Badge className={getPerformanceStatus(stats?.avgUtilization || 0, 'utilization').bg + ' ' + getPerformanceStatus(stats?.avgUtilization || 0, 'utilization').color}>
                        {getPerformanceStatus(stats?.avgUtilization || 0, 'utilization').status}
                      </Badge>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Average Availability Rate</span>
                    <div className="flex items-center space-x-2">
                      <span className="font-semibold">{stats?.avgAvailability}%</span>
                      <Badge className={getPerformanceStatus(stats?.avgAvailability || 0, 'availability').bg + ' ' + getPerformanceStatus(stats?.avgAvailability || 0, 'availability').color}>
                        {getPerformanceStatus(stats?.avgAvailability || 0, 'availability').status}
                      </Badge>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Total Work Orders</span>
                    <span className="font-semibold">{maintenanceMetrics?.totalWorkOrders || 0}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Completion Rate</span>
                    <span className="font-semibold">
                      {maintenanceMetrics?.totalWorkOrders && maintenanceMetrics.totalWorkOrders > 0 
                        ? Math.round((maintenanceMetrics.completedWorkOrders / maintenanceMetrics.totalWorkOrders) * 100)
                        : 0}%
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="mb-4">
                  <h3 className="text-lg font-semibold">Performance Distribution</h3>
                  <p className="text-sm text-muted-foreground">Equipment performance by category</p>
                </div>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="h-3 w-3 rounded-full bg-green-500"></div>
                      <span className="text-sm font-medium dark:text-white">Excellent (≥80%)</span>
                    </div>
                    <span className="text-sm text-gray-500">
                      {performanceMetrics?.equipmentPerformance?.filter((ep: any) => ep.utilizationRate >= 80).length || 0}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="h-3 w-3 rounded-full bg-blue-500"></div>
                      <span className="text-sm font-medium dark:text-white">Good (60-79%)</span>
                    </div>
                    <span className="text-sm text-gray-500">
                      {performanceMetrics?.equipmentPerformance?.filter((ep: any) => ep.utilizationRate >= 60 && ep.utilizationRate < 80).length || 0}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="h-3 w-3 rounded-full bg-yellow-500"></div>
                      <span className="text-sm font-medium dark:text-white">Fair (40-59%)</span>
                    </div>
                    <span className="text-sm text-gray-500">
                      {performanceMetrics?.equipmentPerformance?.filter((ep: any) => ep.utilizationRate >= 40 && ep.utilizationRate < 60).length || 0}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="h-3 w-3 rounded-full bg-red-500"></div>
                      <span className="text-sm font-medium dark:text-white">Poor (&lt;40%)</span>
                    </div>
                    <span className="text-sm text-gray-500">
                      {performanceMetrics?.equipmentPerformance?.filter((ep: any) => ep.utilizationRate < 40).length || 0}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="equipment" className="space-y-6">
          <Card>
            <CardContent className="p-6">
              <div className="mb-4">
                <h3 className="text-lg font-semibold">Equipment Performance Details</h3>
                <p className="text-sm text-muted-foreground">Individual equipment performance metrics</p>
              </div>
              <div className="space-y-4">
                {performanceMetrics?.equipmentPerformance?.map((ep: any) => (
                  <div key={ep.equipmentId} className="flex items-center space-x-4 p-4 border rounded-lg">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-50">
                      <Package className="h-5 w-5 text-blue-600" />
                    </div>
                    <div className="flex-1">
                      <div className="font-medium dark:text-white">{ep.equipment.code}</div>
                      <div className="text-sm text-gray-500">{ep.equipment.name}</div>
                    </div>
                    <div className="grid grid-cols-3 gap-6 text-center">
                      <div>
                        <div className="text-sm text-gray-600">Utilization</div>
                        <div className="font-semibold">{ep.utilizationRate}%</div>
                      </div>
                      <div>
                        <div className="text-sm text-gray-600">Availability</div>
                        <div className="font-semibold">{ep.availabilityRate}%</div>
                      </div>
                      <div>
                        <div className="text-sm text-gray-600">Total Hours</div>
                        <div className="font-semibold">{ep.totalHours}h</div>
                      </div>
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
        </TabsContent>

        <TabsContent value="costs" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardContent className="p-6">
                <div className="mb-4">
                  <h3 className="text-lg font-semibold">Cost Breakdown</h3>
                  <p className="text-sm text-muted-foreground">Maintenance cost distribution</p>
                </div>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="h-3 w-3 rounded-full bg-blue-500"></div>
                      <span className="text-sm font-medium dark:text-white">Labor</span>
                    </div>
                    <span className="text-sm text-gray-500">60%</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="h-3 w-3 rounded-full bg-green-500"></div>
                      <span className="text-sm font-medium dark:text-white">Parts</span>
                    </div>
                    <span className="text-sm text-gray-500">30%</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="h-3 w-3 rounded-full bg-orange-500"></div>
                      <span className="text-sm font-medium dark:text-white">Materials</span>
                    </div>
                    <span className="text-sm text-gray-500">10%</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="mb-4">
                  <h3 className="text-lg font-semibold">Cost Analysis</h3>
                  <p className="text-sm text-muted-foreground">Cost metrics and insights</p>
                </div>
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Total Maintenance Cost</span>
                    <span className="font-semibold">${costAnalysis?.totalCost?.toLocaleString() || 0}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Labor Cost</span>
                    <span className="font-semibold">${costAnalysis?.laborCost?.toLocaleString() || 0}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Parts Cost</span>
                    <span className="font-semibold">${costAnalysis?.partsCost?.toLocaleString() || 0}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Material Cost</span>
                    <span className="font-semibold">${costAnalysis?.materialCost?.toLocaleString() || 0}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Potential Savings</span>
                    <span className="font-semibold text-green-600">${costAnalysis?.potentialSavings?.toLocaleString() || 0}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="trends" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardContent className="p-6">
                <div className="mb-4">
                  <h3 className="text-lg font-semibold">Performance Trends</h3>
                  <p className="text-sm text-muted-foreground">Performance metrics over time</p>
                </div>
                <div className="h-64 flex items-center justify-center bg-muted rounded-lg">
                  <div className="text-center">
                    <BarChart3 className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-gray-500">Performance trend chart will be displayed here</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="mb-4">
                  <h3 className="text-lg font-semibold">Cost Trends</h3>
                  <p className="text-sm text-muted-foreground">Maintenance cost trends over time</p>
                </div>
                <div className="h-64 flex items-center justify-center bg-muted rounded-lg">
                  <div className="text-center">
                    <LineChart className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-gray-500">Cost trend chart will be displayed here</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
