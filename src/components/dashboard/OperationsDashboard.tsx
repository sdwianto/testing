/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-floating-promises */
"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { KPICard } from "./KPICard";
import { trpc } from "@/lib/trpc";
import { Calendar, RefreshCw, BarChart3, TrendingUp } from "lucide-react";
import { format } from "date-fns";

export function OperationsDashboard() {
  const [dateRange, setDateRange] = useState({
    from: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // 30 days ago
    to: new Date(),
  });

  const { data: kpis, isLoading: kpisLoading, refetch: refetchKPIs } = trpc.kpi.getKPIs.useQuery({
    from: dateRange.from.toISOString(),
    to: dateRange.to.toISOString(),
  });

  const { data: equipmentUtilization, isLoading: utilizationLoading } = trpc.kpi.getEquipmentUtilization.useQuery({
    from: dateRange.from.toISOString(),
    to: dateRange.to.toISOString(),
  });

  const { data: maintenanceTrends, isLoading: trendsLoading } = trpc.kpi.getMaintenanceTrends.useQuery({
    from: dateRange.from.toISOString(),
    to: dateRange.to.toISOString(),
    groupBy: "week",
  });

  const { data: breakdownTrends, isLoading: breakdownLoading } = trpc.kpi.getBreakdownTrends.useQuery({
    from: dateRange.from.toISOString(),
    to: dateRange.to.toISOString(),
    groupBy: "week",
  });

  const handleRefresh = () => {
    refetchKPIs();
  };

  const getAvailabilityVariant = (availability: number) => {
    if (availability >= 95) return "success";
    if (availability >= 85) return "warning";
    return "danger";
  };

  const getMTTRVariant = (mttr: number) => {
    if (mttr <= 2) return "success";
    if (mttr <= 8) return "warning";
    return "danger";
  };

  if (kpisLoading || utilizationLoading || trendsLoading || breakdownLoading) {
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
          <h1 className="text-2xl font-bold text-gray-900">Operations Dashboard</h1>
          <p className="text-gray-600">
            {format(dateRange.from, "MMM dd, yyyy")} - {format(dateRange.to, "MMM dd, yyyy")}
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Button variant="outline" size="sm" onClick={handleRefresh}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <KPICard
          title="Availability"
          value={kpis?.availability ?? 0}
          unit="%"
          variant={getAvailabilityVariant(kpis?.availability ?? 0)}
          description="Overall equipment availability"
        />
        
        <KPICard
          title="MTTR"
          value={kpis?.mttr ?? 0}
          unit="hrs"
          variant={getMTTRVariant(kpis?.mttr ?? 0)}
          description="Mean Time To Repair"
        />
        
        <KPICard
          title="MTBS"
          value={kpis?.mtbs ?? 0}
          unit="hrs"
          description="Mean Time Between Shutdowns"
        />
        
        <KPICard
          title="MA/PA Ratio"
          value={kpis?.maintenanceActivity.ratio ?? 0}
          unit="%"
          description={`${kpis?.maintenanceActivity.actual ?? 0}/${kpis?.maintenanceActivity.planned ?? 0} activities`}
        />
      </div>

      {/* Shutdown Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <BarChart3 className="h-5 w-5 mr-2" />
              Shutdown Count
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-red-600">
              {kpis?.shutdown.count ?? 0}
            </div>
            <p className="text-sm text-gray-500 mt-1">
              Total shutdowns in period
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Total Downtime</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-orange-600">
              {kpis?.shutdown.totalHours ?? 0}
              <span className="text-sm font-normal text-gray-500 ml-1">hrs</span>
            </div>
            <p className="text-sm text-gray-500 mt-1">
              Total downtime hours
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Avg. Duration</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-yellow-600">
              {kpis?.shutdown.averageDuration ?? 0}
              <span className="text-sm font-normal text-gray-500 ml-1">hrs</span>
            </div>
            <p className="text-sm text-gray-500 mt-1">
              Average shutdown duration
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Equipment Utilization */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <TrendingUp className="h-5 w-5 mr-2" />
            Equipment Utilization
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {equipmentUtilization?.map((equipment: any) => (
              <div key={equipment.id} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center space-x-4">
                  <div>
                    <h4 className="font-medium text-gray-900">{equipment.name}</h4>
                    <p className="text-sm text-gray-500">{equipment.code}</p>
                  </div>
                  <Badge variant={equipment.status === "ACTIVE" ? "default" : "destructive"}>
                    {equipment.status}
                  </Badge>
                </div>
                <div className="flex items-center space-x-6">
                  <div className="text-right">
                    <div className="text-sm font-medium text-gray-900">
                      {equipment.utilization}%
                    </div>
                    <div className="text-xs text-gray-500">Utilization</div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-medium text-gray-900">
                      {equipment.usageHours} hrs
                    </div>
                    <div className="text-xs text-gray-500">Usage</div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-medium text-red-600">
                      {equipment.breakdownHours} hrs
                    </div>
                    <div className="text-xs text-gray-500">Downtime</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Maintenance Trends */}
      {maintenanceTrends && maintenanceTrends.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Maintenance Trends</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {maintenanceTrends.map((trend: any) => (
                <div key={trend.period} className="flex items-center justify-between p-3 border rounded">
                  <div className="font-medium">{trend.period}</div>
                  <div className="flex items-center space-x-4">
                    <div className="text-sm">
                      <span className="text-green-600 font-medium">{trend.completed}</span>
                      <span className="text-gray-500"> completed</span>
                    </div>
                    <div className="text-sm">
                      <span className="text-blue-600 font-medium">{trend.planned}</span>
                      <span className="text-gray-500"> planned</span>
                    </div>
                    <div className="text-sm">
                      <span className="text-red-600 font-medium">{trend.overdue}</span>
                      <span className="text-gray-500"> overdue</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Breakdown Trends */}
      {breakdownTrends && breakdownTrends.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Breakdown Trends</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {breakdownTrends.map((trend: any) => (
                <div key={trend.period} className="flex items-center justify-between p-3 border rounded">
                  <div className="font-medium">{trend.period}</div>
                  <div className="flex items-center space-x-4">
                    <div className="text-sm">
                      <span className="text-red-600 font-medium">{trend.count}</span>
                      <span className="text-gray-500"> breakdowns</span>
                    </div>
                    <div className="text-sm">
                      <span className="text-orange-600 font-medium">{trend.totalDowntime.toFixed(1)}</span>
                      <span className="text-gray-500"> hrs downtime</span>
                    </div>
                    <div className="text-sm">
                      <span className="text-yellow-600 font-medium">{trend.averageRepairTime}</span>
                      <span className="text-gray-500"> hrs avg repair</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
