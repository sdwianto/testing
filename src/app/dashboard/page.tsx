"use client";

import React from 'react';
import { ResponsiveShell } from '@/components/layouts/ResponsiveShell';
import { DashboardRealTime } from '@/components/DashboardRealTime';
import { OperationsDashboard } from '@/components/dashboard/OperationsDashboard';
// Maintenance components removed
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';
import { 
  Building2,
  AlertTriangle,
  CheckCircle,
  Clock,
  BarChart3
} from 'lucide-react';

const DashboardPage: React.FC = () => {
  const router = useRouter();
  // Mock data for demonstration - only CRM and Orders remain
  const stats = {
    orders: {
      activeOrders: 45,
      pendingApprovals: 8,
      completedThisMonth: 120
    }
  };

  // Maintenance alerts removed

  const recentActivities = [
    { id: 1, type: 'order', message: 'New order received: Order #ORD-2024-001', time: '5 min ago', status: 'info' },
    { id: 2, type: 'order', message: 'Order completed: Order #ORD-2024-002', time: '30 min ago', status: 'success' },
    { id: 3, type: 'crm', message: 'New customer contact: ABC Company', time: '1 hour ago', status: 'info' },
    { id: 4, type: 'order', message: 'Order approved: Order #ORD-2024-003', time: '2 hours ago', status: 'success' },
    { id: 5, type: 'crm', message: 'Customer follow-up scheduled: XYZ Corp', time: '3 hours ago', status: 'info' },
    { id: 6, type: 'order', message: 'Order processing: Order #ORD-2024-004', time: '4 hours ago', status: 'info' },
    { id: 7, type: 'crm', message: 'Customer meeting completed: DEF Ltd', time: '5 hours ago', status: 'success' },
    { id: 8, type: 'order', message: 'Order delivered: Order #ORD-2024-005', time: '6 hours ago', status: 'success' }
  ];

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

        {/* Real-time Dashboard Component */}
        <DashboardRealTime />

        {/* Operations Dashboard */}
        <OperationsDashboard />

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Orders */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Orders</CardTitle>
              <Building2 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.orders.activeOrders}</div>
              <p className="text-xs text-muted-foreground">
                {stats.orders.pendingApprovals} pending approval
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                {stats.orders.completedThisMonth} completed this month
              </p>
            </CardContent>
          </Card>
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
                <AlertTriangle className="h-6 w-6" />
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

        {/* Maintenance components removed */}

        {/* Recent Activities */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Activities</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
                {recentActivities.map((activity) => (
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
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </ResponsiveShell>
  );
};

export default DashboardPage;
