'use client';

import { useState, Suspense, lazy } from 'react';
import { ResponsiveShell } from '@/components/layouts/ResponsiveShell';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { 
  Wrench, 
  Clock, 
  AlertTriangle, 
  BarChart3,
  TrendingUp,
  Activity,
  Truck
} from 'lucide-react';

// FP3: Dynamic import for heavy modules (lazy-load tab components)
const DashboardTab = lazy(() => import('@/components/operations/tabs/DashboardTab').then(m => ({ default: m.DashboardTab })));
const EquipmentTab = lazy(() => import('@/components/operations/tabs/EquipmentTab').then(m => ({ default: m.EquipmentTab })));
const UsageTab = lazy(() => import('@/components/operations/tabs/UsageTab').then(m => ({ default: m.UsageTab })));
const BreakdownsTab = lazy(() => import('@/components/operations/tabs/BreakdownsTab').then(m => ({ default: m.BreakdownsTab })));
const RentalTab = lazy(() => import('@/components/operations/tabs/RentalTab').then(m => ({ default: m.RentalTab })));
const ReportsTab = lazy(() => import('@/components/operations/tabs/ReportsTab').then(m => ({ default: m.ReportsTab })));

// ========================================
// OPERATIONS PAGE (P1 - Operations Module)
// Per Implementation Guide: Equipment master, usage hours, breakdown capture, rental hours
// ========================================



export default function OperationsPage() {
  const [activeTab, setActiveTab] = useState('dashboard');

  // Mock data for quick stats
  const quickStats = {
    totalEquipment: 45,
    activeBreakdowns: 3,
    totalUsageHours: 1250,
    availability: 94.5
  };

  return (
    <ResponsiveShell>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Operations</h1>
            <p className="text-gray-600 dark:text-gray-400">Manage equipment, track usage, and monitor performance</p>
          </div>
          <Badge variant="outline" className="flex items-center gap-2">
            <Activity className="h-4 w-4" />
            Operations Active
          </Badge>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center">
                <Wrench className="h-4 w-4 text-muted-foreground" />
                <div className="ml-2">
                  <p className="text-sm font-medium text-muted-foreground">Total Equipment</p>
                  <p className="text-2xl font-bold">{quickStats.totalEquipment}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center">
                <AlertTriangle className="h-4 w-4 text-red-500" />
                <div className="ml-2">
                  <p className="text-sm font-medium text-muted-foreground">Active Breakdowns</p>
                  <p className="text-2xl font-bold text-red-600">{quickStats.activeBreakdowns}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center">
                <Clock className="h-4 w-4 text-blue-500" />
                <div className="ml-2">
                  <p className="text-sm font-medium text-muted-foreground">Total Usage Hours</p>
                  <p className="text-2xl font-bold text-blue-600">{quickStats.totalUsageHours}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center">
                <TrendingUp className="h-4 w-4 text-green-500" />
                <div className="ml-2">
                  <p className="text-sm font-medium text-muted-foreground">Availability</p>
                  <p className="text-2xl font-bold text-green-600">{quickStats.availability}%</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
          <TabsList className="grid w-full grid-cols-6">
            <TabsTrigger value="dashboard" className="flex items-center gap-2">
              <BarChart3 className="h-4 w-4" />
              Dashboard
            </TabsTrigger>
            <TabsTrigger value="equipment" className="flex items-center gap-2">
              <Wrench className="h-4 w-4" />
              Equipment
            </TabsTrigger>
            <TabsTrigger value="usage" className="flex items-center gap-2">
              <Clock className="h-4 w-4" />
              Usage Logging
            </TabsTrigger>
            <TabsTrigger value="breakdowns" className="flex items-center gap-2">
              <AlertTriangle className="h-4 w-4" />
              Breakdowns
            </TabsTrigger>
            <TabsTrigger value="rental" className="flex items-center gap-2">
              <Truck className="h-4 w-4" />
              Rental
            </TabsTrigger>
            <TabsTrigger value="reports" className="flex items-center gap-2">
              <BarChart3 className="h-4 w-4" />
              Reports
            </TabsTrigger>
          </TabsList>

          <TabsContent value="dashboard" className="space-y-4">
            <Suspense fallback={<LoadingSpinner />}>
              <DashboardTab />
            </Suspense>
          </TabsContent>

          <TabsContent value="equipment" className="space-y-4">
            <Suspense fallback={<LoadingSpinner />}>
              <EquipmentTab />
            </Suspense>
          </TabsContent>

          <TabsContent value="usage" className="space-y-4">
            <Suspense fallback={<LoadingSpinner />}>
              <UsageTab />
            </Suspense>
          </TabsContent>

          <TabsContent value="breakdowns" className="space-y-4">
            <Suspense fallback={<LoadingSpinner />}>
              <BreakdownsTab />
            </Suspense>
          </TabsContent>

          <TabsContent value="rental" className="space-y-4">
            <Suspense fallback={<LoadingSpinner />}>
              <RentalTab />
            </Suspense>
          </TabsContent>

          <TabsContent value="reports" className="space-y-4">
            <Suspense fallback={<LoadingSpinner />}>
              <ReportsTab />
            </Suspense>
          </TabsContent>
        </Tabs>
      </div>
    </ResponsiveShell>
  );
}
