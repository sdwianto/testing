import React from 'react';
import { DashboardLayout } from '@/components/layouts/DashboardLayout';
import { DashboardRealTime } from '@/components/DashboardRealTime';
import { MaintenanceCard } from '@/components/MaintenanceCard';
import { MaintenanceAlerts } from '@/components/MaintenanceAlerts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';
import { 
  Package, 
  Truck, 
  DollarSign, 
  Users, 
  Wrench, 
  Building2,
  TrendingUp,
  AlertTriangle,
  CheckCircle,
  Clock,
  Plus
} from 'lucide-react';

const DashboardPage: React.FC = () => {
  const router = useRouter();
  // Mock data for demonstration
  const stats = {
    inventory: {
      totalItems: 1247,
      lowStock: 23,
      outOfStock: 5,
      value: 1250000
    },
    rental: {
      activeRentals: 18,
      pendingReturns: 3,
      maintenanceDue: 7,
      revenue: 450000
    },
    finance: {
      monthlyRevenue: 850000,
      pendingPayments: 125000,
      expenses: 320000,
      profit: 530000
    },
    hr: {
      totalEmployees: 45,
      onLeave: 3,
      newHires: 2,
      attendance: 98.5
    },
    maintenance: {
      totalEquipment: 45,
      scheduledMaintenance: 12,
      overdueMaintenance: 3,
      inProgress: 5,
      completedThisMonth: 28,
      totalCost: 125000
    }
  };

  const maintenanceAlerts = [
    {
      id: 1,
      equipmentName: 'Loader LD-005',
      equipmentCode: 'LD-005',
      alertType: 'EMERGENCY' as const,
      message: 'Engine failure - immediate repair required',
      priority: 'CRITICAL' as const,
      scheduledDate: '2024-01-08'
    },
    {
      id: 2,
      equipmentName: 'Bulldozer BD-003',
      equipmentCode: 'BD-003',
      alertType: 'OVERDUE' as const,
      message: 'Hydraulic system maintenance overdue',
      priority: 'HIGH' as const,
      daysOverdue: 5,
      scheduledDate: '2024-01-10'
    },
    {
      id: 3,
      equipmentName: 'Crane CR-002',
      equipmentCode: 'CR-002',
      alertType: 'INSPECTION' as const,
      message: 'Annual safety inspection due',
      priority: 'HIGH' as const,
      scheduledDate: '2024-01-20'
    },
    {
      id: 4,
      equipmentName: 'Excavator EX-001',
      equipmentCode: 'EX-001',
      alertType: 'SCHEDULED' as const,
      message: 'Regular engine oil change scheduled',
      priority: 'MEDIUM' as const,
      scheduledDate: '2024-01-15'
    }
  ];

  const recentActivities = [
    { id: 1, type: 'maintenance', message: 'Emergency maintenance started: Loader LD-005 engine failure', time: '5 min ago', status: 'warning' },
    { id: 2, type: 'maintenance', message: 'Preventive maintenance completed: Excavator EX-001', time: '30 min ago', status: 'success' },
    { id: 3, type: 'maintenance', message: 'Overdue maintenance alert: Bulldozer BD-003', time: '1 hour ago', status: 'warning' },
    { id: 4, type: 'inventory', message: 'Low stock alert: Excavator spare parts', time: '2 hours ago', status: 'warning' },
    { id: 5, type: 'rental', message: 'Equipment rental completed: Bulldozer #BD-001', time: '3 hours ago', status: 'success' },
    { id: 6, type: 'maintenance', message: 'Scheduled maintenance: Crane #CR-003', time: '4 hours ago', status: 'info' },
    { id: 7, type: 'finance', message: 'Payment received: Invoice #INV-2024-001', time: '5 hours ago', status: 'success' },
    { id: 8, type: 'hr', message: 'New employee onboarded: John Smith', time: '6 hours ago', status: 'info' }
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
    <DashboardLayout>
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

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Inventory */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Inventory</CardTitle>
              <Package className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.inventory.totalItems.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">
                {stats.inventory.lowStock} low stock, {stats.inventory.outOfStock} out of stock
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                Value: ${stats.inventory.value.toLocaleString()}
              </p>
            </CardContent>
          </Card>

          {/* Rental & Equipment */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Rental & Equipment</CardTitle>
              <Truck className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.rental.activeRentals}</div>
              <p className="text-xs text-muted-foreground">
                {stats.rental.pendingReturns} pending returns, {stats.rental.maintenanceDue} maintenance due
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                Revenue: ${stats.rental.revenue.toLocaleString()}
              </p>
            </CardContent>
          </Card>

          {/* Finance */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Finance</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">${stats.finance.monthlyRevenue.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">
                ${stats.finance.pendingPayments.toLocaleString()} pending payments
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                Profit: ${stats.finance.profit.toLocaleString()}
              </p>
            </CardContent>
          </Card>

          {/* HR & Payroll */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">HR & Payroll</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.hr.totalEmployees}</div>
              <p className="text-xs text-muted-foreground">
                {stats.hr.onLeave} on leave, {stats.hr.newHires} new hires
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                Attendance: {stats.hr.attendance}%
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
                onClick={() => router.push('/inventory')}
              >
                <Package className="h-6 w-6" />
                <span className="text-sm">Inventory</span>
              </Button>
              <Button 
                variant="outline" 
                className="h-20 flex flex-col items-center justify-center gap-2"
                onClick={() => router.push('/rental')}
              >
                <Truck className="h-6 w-6" />
                <span className="text-sm">Rental</span>
              </Button>
              <Button 
                variant="outline" 
                className="h-20 flex flex-col items-center justify-center gap-2 relative"
                onClick={() => router.push('/maintenance')}
              >
                <Wrench className="h-6 w-6" />
                <span className="text-sm">Maintenance</span>
                {stats.maintenance.overdueMaintenance > 0 && (
                  <Badge className="absolute -top-2 -right-2 h-5 w-5 flex items-center justify-center p-0 text-xs bg-red-500 text-white">
                    {stats.maintenance.overdueMaintenance}
                  </Badge>
                )}
              </Button>
              <Button 
                variant="outline" 
                className="h-20 flex flex-col items-center justify-center gap-2"
                onClick={() => router.push('/finance')}
              >
                <DollarSign className="h-6 w-6" />
                <span className="text-sm">Finance</span>
              </Button>
              <Button 
                variant="outline" 
                className="h-20 flex flex-col items-center justify-center gap-2"
                onClick={() => router.push('/hrms')}
              >
                <Users className="h-6 w-6" />
                <span className="text-sm">HR</span>
              </Button>
              <Button 
                variant="outline" 
                className="h-20 flex flex-col items-center justify-center gap-2"
                onClick={() => router.push('/crm')}
              >
                <Building2 className="h-6 w-6" />
                <span className="text-sm">CRM</span>
              </Button>
              <Button 
                variant="outline" 
                className="h-20 flex flex-col items-center justify-center gap-2"
                onClick={() => router.push('/reports')}
              >
                <TrendingUp className="h-6 w-6" />
                <span className="text-sm">Reports</span>
              </Button>
              <Button 
                variant="outline" 
                className="h-20 flex flex-col items-center justify-center gap-2"
                onClick={() => router.push('/alerts')}
              >
                <AlertTriangle className="h-6 w-6" />
                <span className="text-sm">Alerts</span>
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Maintenance Overview Card */}
        <MaintenanceCard
          stats={stats.maintenance}
          onViewMaintenance={() => router.push('/maintenance')}
          onScheduleMaintenance={() => router.push('/maintenance')}
          onViewOverdue={() => router.push('/maintenance?tab=overdue')}
          onViewCompleted={() => router.push('/maintenance?tab=completed')}
          onViewCostAnalysis={() => router.push('/maintenance?tab=reports')}
        />

        {/* Maintenance Alerts */}
        <MaintenanceAlerts
          alerts={maintenanceAlerts}
          onViewAll={() => router.push('/maintenance')}
          onViewAlert={(alertId) => router.push(`/maintenance?alert=${alertId}`)}
        />

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
    </DashboardLayout>
  );
};

export default DashboardPage;
