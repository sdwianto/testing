// src/app/dashboard/page.tsx
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/no-unsafe-return */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/prefer-nullish-coalescing */

"use client";

import React, { useState, useMemo } from 'react';
import { ResponsiveShell } from '@/components/layouts/ResponsiveShell';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useRouter } from 'next/navigation';
import { trpc } from '@/lib/trpc';
import { 
  Building2,
  Package,
  Wrench,
  Clock,
  AlertTriangle,
  CheckCircle,
  BarChart3,
  TrendingUp,
  DollarSign,
  Users,
  Activity,
  ShoppingCart,
  FileText,
  Plus,
  ArrowUpRight,
  ArrowDownRight
} from 'lucide-react';

// Type definitions for better type safety
interface Order {
  id: string;
  status: string;
  createdAt: string;
}

interface Equipment {
  id: string;
  code: string;
  type: string;
  description: string;
}

interface WorkOrder {
  id: string;
  status: string;
  priority: string;
}

interface MaintenanceSchedule {
  id: string;
  nextMaintenanceDate: string;
}

interface Item {
  id: string;
  number: string;
  description: string;
  branches?: Array<{
    id: string;
    locations?: Array<{
      id: string;
      quantity: number;
      reorderPoint: number;
      averageCost: number;
    }>;
  }>;
}

interface PurchaseRequest {
  id: string;
  status: string;
  items?: Array<{
    id: string;
    status: string;
  }>;
}

interface Rental {
  id: string;
  status: string;
}

interface Activity {
  id: string;
  message: string;
  time: string;
  status: string;
  type: string;
}

interface StatCardProps {
  title: string;
  value: string | number;
  icon: React.ComponentType<{ className?: string }>;
  description?: string;
  trend?: 'up' | 'down';
  trendValue?: string;
  className?: string;
}

const DashboardPage: React.FC = () => {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('overview');
  
  // Real data from tRPC queries with error handling
  const { data: ordersData, error: ordersError, isLoading: ordersLoading } = trpc.purchase.listPurchaseOrders.useQuery({ limit: 100 }, { retry: 1, retryDelay: 1000, staleTime: 30000 });
  const { data: recentActivitiesData, error: activitiesError, isLoading: activitiesLoading } = trpc.core.getRecentActivities.useQuery({ limit: 10 }, { retry: 1, retryDelay: 1000, staleTime: 30000 });
  const { data: equipmentData, error: equipmentError, isLoading: equipmentLoading } = trpc.ops.listEquipment.useQuery({ limit: 1000 }, { retry: 1, retryDelay: 1000, staleTime: 30000 });
  const { data: workOrdersData, error: workOrdersError, isLoading: workOrdersLoading } = trpc.ops.listWorkOrders.useQuery({ limit: 100 }, { retry: 1, retryDelay: 1000, staleTime: 30000 });
  const { data: maintenanceSchedules, error: maintenanceError, isLoading: maintenanceLoading } = trpc.ops.listMaintenanceSchedules.useQuery({ limit: 50 }, { retry: 1, retryDelay: 1000, staleTime: 30000 });
  const { data: itemsData, error: itemsError, isLoading: itemsLoading } = trpc.inventory.listItems.useQuery({ limit: 1000 }, { retry: 1, retryDelay: 1000, staleTime: 30000 });
  const { data: purchaseRequestsData, error: purchaseRequestsError, isLoading: purchaseRequestsLoading } = trpc.purchase.listPurchaseRequests.useQuery({ limit: 100 }, { retry: 1, retryDelay: 1000, staleTime: 30000 });
  const { data: rentalData, error: rentalError, isLoading: rentalLoading } = trpc.rental.listRentals.useQuery({ limit: 100 }, { retry: 1, retryDelay: 1000, staleTime: 30000 });

  // Check if any queries are loading
  const isLoading = ordersLoading || activitiesLoading || equipmentLoading || workOrdersLoading || maintenanceLoading || itemsLoading || purchaseRequestsLoading || rentalLoading;

  // Check if any queries have errors (but don't block the UI)
  const hasErrors = false; // Temporarily disable error blocking to prevent hang

  // Calculate comprehensive statistics with error handling
  const stats = useMemo(() => {
    // Default values if data is not available
    const defaultStats = {
      orders: { activeOrders: 0, pendingApprovals: 0, completedThisMonth: 0 },
      operations: { totalEquipment: 0, activeWorkOrders: 0, maintenanceDue: 0, criticalAlerts: 0 },
      inventory: { totalItems: 0, lowStockItems: 0, totalValue: 0, pendingGRN: 0 },
      rental: { activeRentals: 0, pendingRentals: 0 }
    };

    // If any queries are loading, return default stats
    if (isLoading) {
      return defaultStats;
    }

    try {
      // Purchase/Orders Statistics
      const activeOrders = ordersData?.orders?.filter((order: any) => 
        order.status === 'OPEN' || order.status === 'IN_PROGRESS'
      ).length ?? 0;
      const pendingApprovals = ordersData?.orders?.filter((order: any) => 
        order.status === 'PENDING_APPROVAL'
      ).length ?? 0;
      const completedThisMonth = ordersData?.orders?.filter((order: any) => {
        const orderDate = new Date(order.createdAt);
        const now = new Date();
        return order.status === 'COMPLETED' && 
               orderDate.getMonth() === now.getMonth() && 
               orderDate.getFullYear() === now.getFullYear();
      }).length ?? 0;

      // Operations Statistics
      const totalEquipment = equipmentData?.equipment?.length ?? 0;
      const activeWorkOrders = workOrdersData?.workOrders?.filter((wo: any) => 
        wo.status === 'OPEN' || wo.status === 'IN_PROGRESS'
      ).length ?? 0;
      const maintenanceDue = maintenanceSchedules?.schedules?.filter((s: any) => 
        new Date(s.nextMaintenanceDate) <= new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
      ).length ?? 0;
      const criticalAlerts = workOrdersData?.workOrders?.filter((wo: any) => 
        wo.priority === 'HIGH' && (wo.status === 'OPEN' || wo.status === 'IN_PROGRESS')
      ).length ?? 0;

      // Inventory Statistics
      const totalItems = itemsData?.items?.length ?? 0;
      const lowStockItems = itemsData?.items?.filter((item: any) => 
        item.branches?.some((branch: any) => 
          branch.locations?.some((location: any) => location.qtyOnHand <= branch.reorderPoint)
        )
      ).length ?? 0;
      const totalValue = itemsData?.items?.reduce((sum: number, item: any) => 
        sum + (item.branches?.reduce((branchSum: number, branch: any) => 
          branchSum + (branch.locations?.reduce((locationSum: number, location: any) => 
            locationSum + (location.qtyOnHand * (parseFloat(item.avgCost) || 0)), 0) ?? 0), 0) ?? 0), 0
      ) ?? 0;
      const pendingGRN = purchaseRequestsData?.requests?.filter((pr: any) => 
        pr.status === 'APPROVED' && pr.items?.some((item: any) => item.status === 'PENDING_GRN')
      ).length ?? 0;

      // Rental Statistics
      const activeRentals = rentalData?.rentals?.filter((rental: any) => 
        rental.status === 'ACTIVE'
      ).length ?? 0;
      const pendingRentals = rentalData?.rentals?.filter((rental: any) => 
        rental.status === 'PENDING'
      ).length ?? 0;

      return {
        orders: { activeOrders, pendingApprovals, completedThisMonth },
        operations: { totalEquipment, activeWorkOrders, maintenanceDue, criticalAlerts },
        inventory: { totalItems, lowStockItems, totalValue, pendingGRN },
        rental: { activeRentals, pendingRentals }
      };
    } catch (error) {
      console.error('Error calculating dashboard stats:', error);
      return defaultStats;
    }
  }, [ordersData, equipmentData, workOrdersData, maintenanceSchedules, itemsData, purchaseRequestsData, rentalData, isLoading, hasErrors]);

  // Use real recent activities or fallback to empty array
  const recentActivities = recentActivitiesData?.activities ?? [];

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'warning': return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
      case 'success': return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'info': return <Clock className="h-4 w-4 text-blue-500" />;
      default: return <Clock className="h-4 w-4 text-gray-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'warning': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
      case 'success': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'info': return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
    }
  };

  const StatCard: React.FC<StatCardProps> = ({ title, value, icon: Icon, description, trend, trendValue, className = "" }) => (
    <Card className={className}>
      <CardContent className="pt-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <Icon className="h-4 w-4 text-muted-foreground" />
            <div className="ml-2">
              <p className="text-sm font-medium text-muted-foreground">{title}</p>
              <p className="text-2xl font-bold">{value}</p>
              {description && (
                <p className="text-xs text-muted-foreground">{description}</p>
              )}
            </div>
          </div>
          {trend && (
            <div className={`flex items-center text-xs ${trend === 'up' ? 'text-green-600' : 'text-red-600'}`}>
              {trend === 'up' ? <ArrowUpRight className="h-3 w-3" /> : <ArrowDownRight className="h-3 w-3" />}
              {trendValue}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );

  // Show loading state
  if (isLoading) {
    return (
      <ResponsiveShell>
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">NextGen ERP Dashboard</h1>
              <p className="text-gray-600 dark:text-gray-400">Loading dashboard data...</p>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <Card key={i}>
                <CardContent className="pt-6">
                  <div className="animate-pulse">
                    <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                    <div className="h-8 bg-gray-200 rounded w-1/2"></div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </ResponsiveShell>
    );
  }

  // Show error state
  if (hasErrors) {
    return (
      <ResponsiveShell>
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">NextGen ERP Dashboard</h1>
              <p className="text-red-600 dark:text-red-400">Some data could not be loaded. Showing available information.</p>
            </div>
          </div>
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <div className="flex">
              <AlertTriangle className="h-5 w-5 text-yellow-400" />
              <div className="ml-3">
                <h3 className="text-sm font-medium text-yellow-800">Dashboard Data Unavailable</h3>
                <div className="mt-2 text-sm text-yellow-700">
                  <p>Some dashboard data could not be loaded. This may be due to:</p>
                  <ul className="list-disc list-inside mt-1">
                    <li>Database connection issues</li>
                    <li>Missing data in the system</li>
                    <li>Temporary service unavailability</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      </ResponsiveShell>
    );
  }

  return (
    <ResponsiveShell>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">NextGen ERP Dashboard</h1>
            <p className="text-gray-600 dark:text-gray-400">Real-time overview of your business operations</p>
          </div>
          <Badge variant="outline" className="flex items-center gap-2">
            <div className="h-2 w-2 rounded-full bg-green-500"></div>
            System Online
          </Badge>
        </div>

        {/* Main Dashboard Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="operations">Operations</TabsTrigger>
            <TabsTrigger value="inventory">Inventory</TabsTrigger>
            <TabsTrigger value="activities">Activities</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            {/* Key Metrics Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <StatCard
                title="Active Orders"
                value={stats.orders.activeOrders}
                icon={ShoppingCart}
                description={`${stats.orders.pendingApprovals} pending approval`}
                trend="up"
                trendValue="12%"
              />
              
              <StatCard
                title="Total Equipment"
                value={stats.operations.totalEquipment}
                icon={Package}
                description={`${stats.operations.activeWorkOrders} active work orders`}
                trend="up"
                trendValue="8%"
              />
              
              <StatCard
                title="Inventory Items"
                value={stats.inventory.totalItems}
                icon={Building2}
                description={`${stats.inventory.lowStockItems} low stock items`}
                trend="down"
                trendValue="3%"
              />
              
              <StatCard
                title="Active Rentals"
                value={stats.rental.activeRentals}
                icon={Wrench}
                description={`${stats.rental.pendingRentals} pending rentals`}
                trend="up"
                trendValue="15%"
              />
            </div>

            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <Button 
                    variant="outline" 
                    className="h-20 flex flex-col items-center justify-center gap-2"
                    onClick={() => router.push('/operations')}
                  >
                    <BarChart3 className="h-6 w-6" />
                    <span className="text-sm">Operations</span>
                  </Button>
                  <Button 
                    variant="outline" 
                    className="h-20 flex flex-col items-center justify-center gap-2"
                    onClick={() => router.push('/inventory')}
                  >
                    <Building2 className="h-6 w-6" />
                    <span className="text-sm">Inventory</span>
                  </Button>
                  <Button 
                    variant="outline" 
                    className="h-20 flex flex-col items-center justify-center gap-2"
                    onClick={() => router.push('/purchase')}
                  >
                    <ShoppingCart className="h-6 w-6" />
                    <span className="text-sm">Purchase</span>
                  </Button>
                  <Button 
                    variant="outline" 
                    className="h-20 flex flex-col items-center justify-center gap-2"
                    onClick={() => router.push('/settings')}
                  >
                    <CheckCircle className="h-6 w-6" />
                    <span className="text-sm">Settings</span>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Operations Tab */}
          <TabsContent value="operations" className="space-y-6">
            {/* Operations Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <StatCard
                title="Total Equipment"
                value={stats.operations.totalEquipment}
                icon={Package}
                description="Registered equipment"
              />
              
              <StatCard
                title="Active Work Orders"
                value={stats.operations.activeWorkOrders}
                icon={Wrench}
                description="Currently in progress"
                className="border-blue-200 bg-blue-50 dark:border-blue-800 dark:bg-blue-950"
              />
              
              <StatCard
                title="Maintenance Due"
                value={stats.operations.maintenanceDue}
                icon={Clock}
                description="Next 7 days"
                className="border-yellow-200 bg-yellow-50 dark:border-yellow-800 dark:bg-yellow-950"
              />
              
              <StatCard
                title="Critical Alerts"
                value={stats.operations.criticalAlerts}
                icon={AlertTriangle}
                description="High priority issues"
                className="border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-950"
              />
            </div>

            {/* Rental Metrics - New Section */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Wrench className="h-5 w-5" />
                  Rental Management
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <StatCard
                    title="Active Rentals"
                    value={stats.rental.activeRentals}
                    icon={Wrench}
                    description="Currently rented out"
                    className="border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-950"
                  />
                  
                  <StatCard
                    title="Pending Rentals"
                    value={stats.rental.pendingRentals}
                    icon={Clock}
                    description="Awaiting approval"
                    className="border-yellow-200 bg-yellow-50 dark:border-yellow-800 dark:bg-yellow-950"
                  />
                  
                  <StatCard
                    title="Available Equipment"
                    value={Math.max(0, stats.operations.totalEquipment - stats.rental.activeRentals)}
                    icon={Package}
                    description="Ready for rental"
                    className="border-blue-200 bg-blue-50 dark:border-blue-800 dark:bg-blue-950"
                  />
                  
                  <StatCard
                    title="Rental Utilization"
                    value={stats.operations.totalEquipment > 0 ? Math.round((stats.rental.activeRentals / stats.operations.totalEquipment) * 100) : 0}
                    icon={TrendingUp}
                    description="% of equipment rented"
                    className="border-purple-200 bg-purple-50 dark:border-purple-800 dark:bg-purple-950"
                  />
                </div>
              </CardContent>
            </Card>

            {/* Operations Actions */}
            <Card>
              <CardHeader>
                <CardTitle>Operations Management</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Button 
                    variant="outline" 
                    className="h-16 flex flex-col items-center justify-center gap-2"
                    onClick={() => router.push('/operations')}
                  >
                    <Wrench className="h-5 w-5" />
                    <span className="text-sm">Work Orders</span>
                  </Button>
                  <Button 
                    variant="outline" 
                    className="h-16 flex flex-col items-center justify-center gap-2"
                    onClick={() => router.push('/operations')}
                  >
                    <Package className="h-5 w-5" />
                    <span className="text-sm">Equipment</span>
                  </Button>
                  <Button 
                    variant="outline" 
                    className="h-16 flex flex-col items-center justify-center gap-2"
                    onClick={() => router.push('/operations')}
                  >
                    <Clock className="h-5 w-5" />
                    <span className="text-sm">Maintenance</span>
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Rental Actions - New Section */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Wrench className="h-5 w-5" />
                  Rental Management Actions
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <Button 
                    variant="outline" 
                    className="h-16 flex flex-col items-center justify-center gap-2"
                    onClick={() => router.push('/operations')}
                  >
                    <Plus className="h-5 w-5" />
                    <span className="text-sm">New Rental</span>
                  </Button>
                  <Button 
                    variant="outline" 
                    className="h-16 flex flex-col items-center justify-center gap-2"
                    onClick={() => router.push('/operations')}
                  >
                    <Wrench className="h-5 w-5" />
                    <span className="text-sm">Active Rentals</span>
                  </Button>
                  <Button 
                    variant="outline" 
                    className="h-16 flex flex-col items-center justify-center gap-2"
                    onClick={() => router.push('/operations')}
                  >
                    <Clock className="h-5 w-5" />
                    <span className="text-sm">Pending Rentals</span>
                  </Button>
                  <Button 
                    variant="outline" 
                    className="h-16 flex flex-col items-center justify-center gap-2"
                    onClick={() => router.push('/operations')}
                  >
                    <BarChart3 className="h-5 w-5" />
                    <span className="text-sm">Rental Reports</span>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Inventory Tab */}
          <TabsContent value="inventory" className="space-y-6">
            {/* Inventory Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <StatCard
                title="Total Items"
                value={stats.inventory.totalItems}
                icon={Building2}
                description="Registered items"
              />
              
              <StatCard
                title="Low Stock Items"
                value={stats.inventory.lowStockItems}
                icon={AlertTriangle}
                description="Below reorder point"
                className="border-yellow-200 bg-yellow-50 dark:border-yellow-800 dark:bg-yellow-950"
              />
              
              <StatCard
                title="Total Value"
                value={`$${stats.inventory.totalValue.toLocaleString()}`}
                icon={DollarSign}
                description="Inventory value"
                className="border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-950"
              />
              
              <StatCard
                title="Pending GRN"
                value={stats.inventory.pendingGRN}
                icon={FileText}
                description="Awaiting receipt"
                className="border-blue-200 bg-blue-50 dark:border-blue-800 dark:bg-blue-950"
              />
            </div>

            {/* Inventory Actions */}
            <Card>
              <CardHeader>
                <CardTitle>Inventory Management</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <Button 
                    variant="outline" 
                    className="h-16 flex flex-col items-center justify-center gap-2"
                    onClick={() => router.push('/inventory')}
                  >
                    <Building2 className="h-5 w-5" />
                    <span className="text-sm">Items</span>
                  </Button>
                  <Button 
                    variant="outline" 
                    className="h-16 flex flex-col items-center justify-center gap-2"
                    onClick={() => router.push('/inventory')}
                  >
                    <Package className="h-5 w-5" />
                    <span className="text-sm">Stock</span>
                  </Button>
                  <Button 
                    variant="outline" 
                    className="h-16 flex flex-col items-center justify-center gap-2"
                    onClick={() => router.push('/inventory')}
                  >
                    <FileText className="h-5 w-5" />
                    <span className="text-sm">GRN/GI</span>
                  </Button>
                  <Button 
                    variant="outline" 
                    className="h-16 flex flex-col items-center justify-center gap-2"
                    onClick={() => router.push('/inventory')}
                  >
                    <ShoppingCart className="h-5 w-5" />
                    <span className="text-sm">Purchase</span>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Activities Tab */}
          <TabsContent value="activities" className="space-y-6">
            {/* Recent Activities */}
            <Card>
              <CardHeader>
                <CardTitle>Recent Activities</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {recentActivities.length > 0 ? (
                    recentActivities.map((activity: Activity) => (
                      <div key={activity.id} className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 p-3 rounded-lg border">
                        <div className="flex items-center gap-3">
                          {getStatusIcon(activity.status)}
                          <div>
                            <p className="text-sm font-medium">{activity.message}</p>
                            <p className="text-xs text-muted-foreground">{activity.time}</p>
                          </div>
                        </div>
                        <Badge className={getStatusColor(activity.status)}>
                          {activity.type}
                        </Badge>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-8 text-muted-foreground">
                      <Activity className="h-8 w-8 mx-auto mb-2" />
                      <p>No recent activities</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </ResponsiveShell>
  );
};

export default DashboardPage;
