import React from 'react';
import { DashboardLayout } from '@/components/layouts/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { 
  BarChart3, 
  PieChart,
  TrendingUp,
  TrendingDown,
  Users,
  Calendar,
  Download,
  Filter,
  Search,
  Plus,
  FileText,
  Activity,
  Target,
  Clock,
  AlertTriangle,
  CheckCircle
} from 'lucide-react';

const ReportsPage: React.FC = () => {
  // Mock data for demonstration
  const reportStats = {
    totalReports: 24,
    scheduledReports: 8,
    lastGenerated: '2024-03-10',
    nextScheduled: '2024-03-15'
  };

  const reports = [
    {
      id: 1,
      name: 'Monthly Financial Report',
      type: 'Finance',
      description: 'Comprehensive financial overview including P&L, balance sheet, and cash flow',
      lastGenerated: '2024-03-01',
      nextScheduled: '2024-04-01',
      status: 'scheduled',
      format: 'PDF',
      recipients: ['management@nextgen.com', 'finance@nextgen.com']
    },
    {
      id: 2,
      name: 'Inventory Status Report',
      type: 'Inventory',
      description: 'Current inventory levels, low stock alerts, and stock movement analysis',
      lastGenerated: '2024-03-10',
      nextScheduled: '2024-03-17',
      status: 'active',
      format: 'Excel',
      recipients: ['inventory@nextgen.com']
    },
    {
      id: 3,
      name: 'Equipment Utilization Report',
      type: 'Rental',
      description: 'Equipment rental performance, utilization rates, and maintenance schedules',
      lastGenerated: '2024-03-08',
      nextScheduled: '2024-03-15',
      status: 'active',
      format: 'PDF',
      recipients: ['operations@nextgen.com']
    },
    {
      id: 4,
      name: 'Customer Analytics Report',
      type: 'CRM',
      description: 'Customer behavior analysis, sales pipeline, and customer satisfaction metrics',
      lastGenerated: '2024-03-05',
      nextScheduled: '2024-03-12',
      status: 'scheduled',
      format: 'PowerBI',
      recipients: ['sales@nextgen.com', 'management@nextgen.com']
    }
  ];

  const analytics = [
    {
      id: 1,
      title: 'Revenue Trend',
      type: 'line',
      value: '$850K',
      change: '+12.5%',
      trend: 'up',
      period: 'This Month'
    },
    {
      id: 2,
      title: 'Equipment Utilization',
      type: 'bar',
      value: '78%',
      change: '+5.2%',
      trend: 'up',
      period: 'This Month'
    },
    {
      id: 3,
      title: 'Customer Satisfaction',
      type: 'pie',
      value: '4.6/5',
      change: '+0.3',
      trend: 'up',
      period: 'This Month'
    },
    {
      id: 4,
      title: 'Inventory Turnover',
      type: 'bar',
      value: '6.2x',
      change: '-0.8x',
      trend: 'down',
      period: 'This Month'
    }
  ];

  const kpiMetrics = [
    {
      category: 'Financial',
      metrics: [
        { name: 'Monthly Revenue', value: '$850K', change: '+12.5%', trend: 'up' },
        { name: 'Gross Profit Margin', value: '62.4%', change: '+2.1%', trend: 'up' },
        { name: 'Operating Expenses', value: '$320K', change: '-5.2%', trend: 'down' },
        { name: 'Net Profit', value: '$530K', change: '+18.7%', trend: 'up' }
      ]
    },
    {
      category: 'Operational',
      metrics: [
        { name: 'Equipment Utilization', value: '78%', change: '+5.2%', trend: 'up' },
        { name: 'Inventory Turnover', value: '6.2x', change: '-0.8x', trend: 'down' },
        { name: 'Order Fulfillment Rate', value: '96.8%', change: '+1.2%', trend: 'up' },
        { name: 'Customer Retention', value: '94.2%', change: '+2.1%', trend: 'up' }
      ]
    },
    {
      category: 'Customer',
      metrics: [
        { name: 'Customer Satisfaction', value: '4.6/5', change: '+0.3', trend: 'up' },
        { name: 'Average Order Value', value: '$8,500', change: '+15.3%', trend: 'up' },
        { name: 'Customer Acquisition Cost', value: '$2,100', change: '-8.7%', trend: 'down' },
        { name: 'Customer Lifetime Value', value: '$45,200', change: '+12.4%', trend: 'up' }
      ]
    }
  ];

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <Badge variant="default">Active</Badge>;
      case 'scheduled':
        return <Badge variant="outline">Scheduled</Badge>;
      case 'inactive':
        return <Badge variant="secondary">Inactive</Badge>;
      default:
        return <Badge variant="outline">Unknown</Badge>;
    }
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'up':
        return <TrendingUp className="h-4 w-4 text-green-500" />;
      case 'down':
        return <TrendingDown className="h-4 w-4 text-red-500" />;
      default:
        return <Activity className="h-4 w-4 text-gray-500" />;
    }
  };

  const getTrendColor = (trend: string) => {
    switch (trend) {
      case 'up':
        return 'text-green-600';
      case 'down':
        return 'text-red-600';
      default:
        return 'text-gray-600';
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Reports & Analytics</h1>
            <p className="text-gray-600 dark:text-gray-400">Generate reports, view analytics, and track business performance</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" className="flex items-center gap-2">
              <Download className="h-4 w-4" />
              Export All
            </Button>
            <Button className="flex items-center gap-2">
              <Plus className="h-4 w-4" />
              Create Report
            </Button>
          </div>
        </div>

        {/* Report Overview Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Reports</CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{reportStats.totalReports}</div>
              <p className="text-xs text-muted-foreground">
                <Plus className="inline h-3 w-3 text-green-500" /> +3 new this month
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Scheduled Reports</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{reportStats.scheduledReports}</div>
              <p className="text-xs text-muted-foreground">
                <Clock className="inline h-3 w-3 text-yellow-500" /> Next: {reportStats.nextScheduled}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Last Generated</CardTitle>
              <Activity className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{reportStats.lastGenerated}</div>
              <p className="text-xs text-muted-foreground">
                <CheckCircle className="inline h-3 w-3 text-green-500" /> All reports up to date
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Report Formats</CardTitle>
              <Download className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">4</div>
              <p className="text-xs text-muted-foreground">
                PDF, Excel, PowerBI, CSV
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Key Performance Indicators */}
        <Card>
          <CardHeader>
            <CardTitle>Key Performance Indicators</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {kpiMetrics.map((category) => (
                <div key={category.category} className="space-y-4">
                  <h3 className="font-semibold text-lg">{category.category}</h3>
                  <div className="space-y-3">
                    {category.metrics.map((metric, index) => (
                      <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                        <div>
                          <div className="font-medium text-sm">{metric.name}</div>
                          <div className="text-2xl font-bold">{metric.value}</div>
                        </div>
                        <div className="text-right">
                          <div className={`text-sm font-medium ${getTrendColor(metric.trend)}`}>
                            {getTrendIcon(metric.trend)}
                            {metric.change}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Report Management */}
        <Card>
          <CardHeader>
            <CardTitle>Report Management</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex gap-4 mb-6">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input 
                    placeholder="Search reports..." 
                    className="pl-10"
                  />
                </div>
              </div>
              <Button variant="outline" className="flex items-center gap-2">
                <Filter className="h-4 w-4" />
                Filters
              </Button>
            </div>

            <div className="space-y-4">
              {reports.map((report) => (
                <div key={report.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center gap-4">
                    <div className="p-2 bg-blue-100 rounded-lg">
                      <FileText className="h-6 w-6 text-blue-600" />
                    </div>
                    <div>
                      <div className="font-medium">{report.name}</div>
                      <div className="text-sm text-gray-500">{report.description}</div>
                      <div className="text-sm text-gray-500 mt-1">
                        Type: {report.type} • Format: {report.format} • Recipients: {report.recipients.length}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <div className="text-sm font-medium">Last Generated</div>
                      <div className="text-sm text-gray-500">{report.lastGenerated}</div>
                      <div className="text-sm text-gray-500">Next: {report.nextScheduled}</div>
                    </div>
                    {getStatusBadge(report.status)}
                    <div className="flex gap-2">
                      <Button size="sm" variant="outline">View</Button>
                      <Button size="sm" variant="outline">Edit</Button>
                      <Button size="sm" variant="outline">
                        <Download className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Analytics Dashboard */}
        <Card>
          <CardHeader>
            <CardTitle>Analytics Dashboard</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {analytics.map((item) => (
                <div key={item.id} className="p-4 border rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-medium">{item.title}</h3>
                    <div className="p-2 bg-gray-100 rounded-lg">
                      {item.type === 'line' && <TrendingUp className="h-4 w-4 text-blue-600" />}
                      {item.type === 'bar' && <BarChart3 className="h-4 w-4 text-green-600" />}
                      {item.type === 'pie' && <PieChart className="h-4 w-4 text-purple-600" />}
                    </div>
                  </div>
                  <div className="text-2xl font-bold mb-1">{item.value}</div>
                  <div className={`text-sm font-medium ${getTrendColor(item.trend)}`}>
                    {getTrendIcon(item.trend)}
                    {item.change} {item.period}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Report Generation
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button variant="outline" className="w-full justify-start">
                <Plus className="mr-2 h-4 w-4" />
                Create Custom Report
              </Button>
              <Button variant="outline" className="w-full justify-start">
                <Calendar className="mr-2 h-4 w-4" />
                Schedule Reports
              </Button>
              <Button variant="outline" className="w-full justify-start">
                <Download className="mr-2 h-4 w-4" />
                Export Reports
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5" />
                Analytics
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button variant="outline" className="w-full justify-start">
                <TrendingUp className="mr-2 h-4 w-4" />
                Performance Analytics
              </Button>
              <Button variant="outline" className="w-full justify-start">
                <Target className="mr-2 h-4 w-4" />
                KPI Dashboard
              </Button>
              <Button variant="outline" className="w-full justify-start">
                <Activity className="mr-2 h-4 w-4" />
                Real-time Metrics
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5" />
                Alerts & Notifications
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button variant="outline" className="w-full justify-start">
                <AlertTriangle className="mr-2 h-4 w-4" />
                Set Alerts
              </Button>
              <Button variant="outline" className="w-full justify-start">
                <Clock className="mr-2 h-4 w-4" />
                Notification Settings
              </Button>
              <Button variant="outline" className="w-full justify-start">
                <Users className="mr-2 h-4 w-4" />
                User Permissions
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default ReportsPage; 