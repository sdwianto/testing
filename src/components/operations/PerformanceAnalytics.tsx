'use client';

/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/prefer-nullish-coalescing */

import { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  TrendingUp, Activity, CheckCircle, 
  Clock, DollarSign, Wrench, BarChart3, 
  PieChart, LineChart, Target, Zap 
} from 'lucide-react';
import { trpc } from '@/lib/trpc';

// ========================================
// PERFORMANCE ANALYTICS COMPONENT
// Enterprise-grade equipment performance analytics
// ========================================

interface PerformanceAnalyticsProps {
  onSuccess?: () => void;
}

export function PerformanceAnalytics({ onSuccess: _onSuccess }: PerformanceAnalyticsProps) {
  const [timeRange, setTimeRange] = useState('30'); // days
  const [equipmentFilter, setEquipmentFilter] = useState('all');
  const [activeTab, setActiveTab] = useState('overview');

  // tRPC queries for performance data
  const { data: equipment } = trpc.ops.listEquipment.useQuery({ limit: 1000 });
  const { data: performanceMetrics } = trpc.ops.getPerformanceMetrics.useQuery({
    timeRange: parseInt(timeRange),
    equipmentId: equipmentFilter === 'all' ? undefined : equipmentFilter,
  });
  const { data: maintenanceMetrics } = trpc.ops.getMaintenanceMetrics.useQuery({
    timeRange: parseInt(timeRange),
    equipmentId: equipmentFilter === 'all' ? undefined : equipmentFilter,
  });
  const { data: costAnalysis } = trpc.ops.getCostAnalysis.useQuery({
    timeRange: parseInt(timeRange),
    equipmentId: equipmentFilter === 'all' ? undefined : equipmentFilter,
  });

  // Calculate overall KPIs
  const overallKPIs = useMemo(() => {
    if (!performanceMetrics) return null;

    const totalEquipment = performanceMetrics.equipmentCount || 0;
    const avgUtilization = performanceMetrics.averageUtilization || 0;
    const avgAvailability = performanceMetrics.averageAvailability || 0;
    const totalHours = performanceMetrics.totalOperatingHours || 0;
    const mttr = maintenanceMetrics?.averageMTTR || 0;
    const mtbf = maintenanceMetrics?.averageMTBF || 0;
    const oee = (avgUtilization * avgAvailability) / 100; // Simplified OEE calculation

    return {
      totalEquipment,
      avgUtilization,
      avgAvailability,
      totalHours,
      mttr,
      mtbf,
      oee,
    };
  }, [performanceMetrics, maintenanceMetrics]);

  const getPerformanceBadge = (value: number, type: 'utilization' | 'availability' | 'oee') => {
    let color = 'text-gray-600';
    let variant: 'default' | 'secondary' | 'destructive' | 'outline' = 'outline';

    if (type === 'utilization' || type === 'availability') {
      if (value >= 90) {
        color = 'text-green-600';
        variant = 'default';
      } else if (value >= 75) {
        color = 'text-blue-600';
        variant = 'secondary';
      } else if (value >= 50) {
        color = 'text-orange-600';
        variant = 'outline';
      } else {
        color = 'text-red-600';
        variant = 'destructive';
      }
    } else if (type === 'oee') {
      if (value >= 0.85) {
        color = 'text-green-600';
        variant = 'default';
      } else if (value >= 0.7) {
        color = 'text-blue-600';
        variant = 'secondary';
      } else if (value >= 0.5) {
        color = 'text-orange-600';
        variant = 'outline';
      } else {
        color = 'text-red-600';
        variant = 'destructive';
      }
    }

    return (
      <Badge variant={variant} className={color}>
        {type === 'oee' ? `${(value * 100).toFixed(1)}%` : `${value.toFixed(1)}%`}
      </Badge>
    );
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      EXCELLENT: { variant: 'default' as const, color: 'text-green-600' },
      GOOD: { variant: 'secondary' as const, color: 'text-blue-600' },
      FAIR: { variant: 'outline' as const, color: 'text-orange-600' },
      POOR: { variant: 'destructive' as const, color: 'text-red-600' },
    };
    
    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.FAIR;
    
    return (
      <Badge variant={config.variant} className={config.color}>
        {status}
      </Badge>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Performance Analytics</h2>
          <p className="text-gray-600">Equipment performance metrics, KPIs, and predictive analytics</p>
        </div>
        <div className="flex gap-4">
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger className="w-32">
              <SelectValue placeholder="Time range" />
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
              <SelectValue placeholder="All equipment" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Equipment</SelectItem>
              {equipment?.equipment?.map((eq: any) => (
                <SelectItem key={eq.id} value={eq.id}>
                  {eq.code} - {eq.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Overall KPI Cards */}
      {overallKPIs && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center">
                <Activity className="h-4 w-4 text-muted-foreground" />
                <div className="ml-2">
                  <p className="text-sm font-medium text-muted-foreground">Avg Utilization</p>
                  <div className="flex items-center gap-2">
                    <p className="text-2xl font-bold">{overallKPIs.avgUtilization.toFixed(1)}%</p>
                    {getPerformanceBadge(overallKPIs.avgUtilization, 'utilization')}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center">
                <CheckCircle className="h-4 w-4 text-muted-foreground" />
                <div className="ml-2">
                  <p className="text-sm font-medium text-muted-foreground">Avg Availability</p>
                  <div className="flex items-center gap-2">
                    <p className="text-2xl font-bold">{overallKPIs.avgAvailability.toFixed(1)}%</p>
                    {getPerformanceBadge(overallKPIs.avgAvailability, 'availability')}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center">
                <Target className="h-4 w-4 text-muted-foreground" />
                <div className="ml-2">
                  <p className="text-sm font-medium text-muted-foreground">Overall OEE</p>
                  <div className="flex items-center gap-2">
                    <p className="text-2xl font-bold">{(overallKPIs.oee * 100).toFixed(1)}%</p>
                    {getPerformanceBadge(overallKPIs.oee, 'oee')}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center">
                <Clock className="h-4 w-4 text-muted-foreground" />
                <div className="ml-2">
                  <p className="text-sm font-medium text-muted-foreground">Total Hours</p>
                  <p className="text-2xl font-bold">{overallKPIs.totalHours.toFixed(0)}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Maintenance KPI Cards */}
      {maintenanceMetrics && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center">
                <Wrench className="h-4 w-4 text-muted-foreground" />
                <div className="ml-2">
                  <p className="text-sm font-medium text-muted-foreground">MTTR (Hours)</p>
                  <p className="text-2xl font-bold">{maintenanceMetrics.averageMTTR?.toFixed(1) || '0.0'}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center">
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
                <div className="ml-2">
                  <p className="text-sm font-medium text-muted-foreground">MTBF (Hours)</p>
                  <p className="text-2xl font-bold">{maintenanceMetrics.averageMTBF?.toFixed(1) || '0.0'}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center">
                <DollarSign className="h-4 w-4 text-muted-foreground" />
                <div className="ml-2">
                  <p className="text-sm font-medium text-muted-foreground">Maintenance Cost</p>
                  <p className="text-2xl font-bold">${maintenanceMetrics.totalMaintenanceCost?.toLocaleString() || '0'}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Analytics Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="equipment">Equipment Performance</TabsTrigger>
          <TabsTrigger value="maintenance">Maintenance Analytics</TabsTrigger>
          <TabsTrigger value="predictive">Predictive Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5" />
                  Performance Trends
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-64 flex items-center justify-center text-gray-500">
                  <div className="text-center">
                    <LineChart className="h-12 w-12 mx-auto mb-2" />
                    <p>Performance trend charts will be displayed here</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <PieChart className="h-5 w-5" />
                  Equipment Status Distribution
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-64 flex items-center justify-center text-gray-500">
                  <div className="text-center">
                    <PieChart className="h-12 w-12 mx-auto mb-2" />
                    <p>Equipment status pie chart will be displayed here</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="equipment" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Equipment Performance Details</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Equipment</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Utilization</TableHead>
                    <TableHead>Availability</TableHead>
                    <TableHead>OEE</TableHead>
                    <TableHead>Total Hours</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {performanceMetrics?.equipmentPerformance?.map((perf: any) => (
                    <TableRow key={perf.equipmentId}>
                      <TableCell>
                        <div>
                          <div className="font-medium">{perf.equipment?.code}</div>
                          <div className="text-sm text-gray-500">{perf.equipment?.name}</div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">{perf.equipment?.type}</Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <div className="w-16 bg-gray-200 rounded-full h-2">
                            <div 
                              className="bg-blue-600 h-2 rounded-full" 
                              style={{ width: `${perf.utilizationRate || 0}%` }}
                            ></div>
                          </div>
                          <span className="text-sm">{perf.utilizationRate?.toFixed(1) || 0}%</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <div className="w-16 bg-gray-200 rounded-full h-2">
                            <div 
                              className="bg-green-600 h-2 rounded-full" 
                              style={{ width: `${perf.availabilityRate || 0}%` }}
                            ></div>
                          </div>
                          <span className="text-sm">{perf.availabilityRate?.toFixed(1) || 0}%</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        {getPerformanceBadge(
                          ((perf.utilizationRate || 0) * (perf.availabilityRate || 0)) / 100, 
                          'oee'
                        )}
                      </TableCell>
                      <TableCell>{perf.totalHours?.toFixed(0) || 0}</TableCell>
                      <TableCell>{getStatusBadge(perf.performanceStatus || 'FAIR')}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="maintenance" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Wrench className="h-5 w-5" />
                  Maintenance Cost Analysis
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Labor Cost</span>
                    <span className="font-medium">${costAnalysis?.laborCost?.toLocaleString() || '0'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Parts Cost</span>
                    <span className="font-medium">${costAnalysis?.partsCost?.toLocaleString() || '0'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Material Cost</span>
                    <span className="font-medium">${costAnalysis?.materialCost?.toLocaleString() || '0'}</span>
                  </div>
                  <div className="border-t pt-2">
                    <div className="flex justify-between">
                      <span className="text-sm font-medium">Total Cost</span>
                      <span className="font-bold">${costAnalysis?.totalCost?.toLocaleString() || '0'}</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5" />
                  Maintenance Trends
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-64 flex items-center justify-center text-gray-500">
                  <div className="text-center">
                    <LineChart className="h-12 w-12 mx-auto mb-2" />
                    <p>Maintenance trend charts will be displayed here</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="predictive" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Zap className="h-5 w-5" />
                  Failure Prediction
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="text-center">
                    <div className="text-3xl font-bold text-orange-600 mb-2">
                      {(performanceMetrics as any)?.predictedFailures || 0}
                    </div>
                    <p className="text-sm text-gray-600">Equipment at risk of failure</p>
                  </div>
                  <div className="space-y-2">
                    <p className="text-sm font-medium">High Risk Equipment:</p>
                    {(performanceMetrics as any)?.highRiskEquipment?.map((eq: any) => (
                      <div key={eq.id} className="flex justify-between items-center p-2 bg-orange-50 rounded">
                        <span className="text-sm">{eq.code}</span>
                        <Badge variant="destructive" className="text-xs">
                          {eq.riskLevel}% risk
                        </Badge>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="h-5 w-5" />
                  Maintenance Optimization
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="text-center">
                    <div className="text-3xl font-bold text-green-600 mb-2">
                      ${costAnalysis?.potentialSavings?.toLocaleString() || '0'}
                    </div>
                    <p className="text-sm text-gray-600">Potential cost savings</p>
                  </div>
                  <div className="space-y-2">
                    <p className="text-sm font-medium">Optimization Recommendations:</p>
                    <ul className="text-sm text-gray-600 space-y-1">
                      <li>• Optimize maintenance intervals</li>
                      <li>• Implement predictive maintenance</li>
                      <li>• Improve spare parts inventory</li>
                      <li>• Enhance technician training</li>
                    </ul>
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
