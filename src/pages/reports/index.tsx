import React, { useState, useMemo } from 'react';
import { DashboardLayout } from '@/components/layouts/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { 
  BarChart3, 
  PieChart,
  TrendingUp,
  TrendingDown,
  Users,
  User,
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
  CheckCircle,
  Eye,
  Edit,
  X,
  Bell,
  Settings,
  Shield,
  Zap,
  Database,
  Globe,
  Smartphone
} from 'lucide-react';

// Interfaces
interface Report {
  id: number;
  name: string;
  type: string;
  description: string;
  lastGenerated: string;
  nextScheduled: string;
  status: string;
  format: string;
  recipients: string[];
}

interface FilterState {
  search: string;
  type: string;
  status: string;
  format: string;
}

interface NewReportState {
  name: string;
  type: string;
  description: string;
  format: string;
  recipients: string;
  schedule: string;
}

interface EditReportState {
  name: string;
  type: string;
  description: string;
  format: string;
  recipients: string;
  schedule: string;
}

interface ScheduledReport {
  id: number;
  name: string;
  frequency: string;
  nextRun: string;
  recipients: string[];
  status: string;
}

interface AlertRule {
  id: number;
  name: string;
  condition: string;
  threshold: string;
  action: string;
  status: string;
}

interface NotificationSetting {
  id: number;
  type: string;
  email: boolean;
  sms: boolean;
  push: boolean;
  frequency: string;
}

interface UserPermission {
  id: number;
  name: string;
  role: string;
  permissions: string[];
  lastAccess: string;
}

const ReportsPage: React.FC = () => {
  // State management
  const [filters, setFilters] = useState<FilterState>({
    search: '',
    type: 'all',
    status: 'all',
    format: 'all'
  });
  const [isFilterDialogOpen, setIsFilterDialogOpen] = useState(false);
  const [isCreateReportDialogOpen, setIsCreateReportDialogOpen] = useState(false);
  const [isEditReportDialogOpen, setIsEditReportDialogOpen] = useState(false);
  const [isViewReportDialogOpen, setIsViewReportDialogOpen] = useState(false);
  const [isScheduleReportsDialogOpen, setIsScheduleReportsDialogOpen] = useState(false);
  const [isPerformanceAnalyticsDialogOpen, setIsPerformanceAnalyticsDialogOpen] = useState(false);
  const [isKpiDashboardDialogOpen, setIsKpiDashboardDialogOpen] = useState(false);
  const [isRealTimeMetricsDialogOpen, setIsRealTimeMetricsDialogOpen] = useState(false);
  const [isAlertsDialogOpen, setIsAlertsDialogOpen] = useState(false);
  const [isNotificationSettingsDialogOpen, setIsNotificationSettingsDialogOpen] = useState(false);
  const [isUserPermissionsDialogOpen, setIsUserPermissionsDialogOpen] = useState(false);
  const [selectedReport, setSelectedReport] = useState<Report | null>(null);
  const [newReport, setNewReport] = useState<NewReportState>({
    name: '',
    type: '',
    description: '',
    format: '',
    recipients: '',
    schedule: ''
  });
  const [editReport, setEditReport] = useState<EditReportState>({
    name: '',
    type: '',
    description: '',
    format: '',
    recipients: '',
    schedule: ''
  });

  // Mock data for demonstration
  const reportStats = {
    totalReports: 24,
    scheduledReports: 8,
    lastGenerated: '2024-03-10',
    nextScheduled: '2024-03-15'
  };

  const [reports, setReports] = useState<Report[]>([
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
  ]);

  const [scheduledReports, setScheduledReports] = useState<ScheduledReport[]>([
    {
      id: 1,
      name: 'Monthly Financial Report',
      frequency: 'Monthly',
      nextRun: '2024-04-01',
      recipients: ['management@nextgen.com', 'finance@nextgen.com'],
      status: 'active'
    },
    {
      id: 2,
      name: 'Weekly Inventory Report',
      frequency: 'Weekly',
      nextRun: '2024-03-17',
      recipients: ['inventory@nextgen.com'],
      status: 'active'
    },
    {
      id: 3,
      name: 'Daily Equipment Status',
      frequency: 'Daily',
      nextRun: '2024-03-15',
      recipients: ['operations@nextgen.com'],
      status: 'paused'
    }
  ]);

  const [alertRules, setAlertRules] = useState<AlertRule[]>([
    {
      id: 1,
      name: 'Low Inventory Alert',
      condition: 'Stock Level',
      threshold: '< 10 units',
      action: 'Email + SMS',
      status: 'active'
    },
    {
      id: 2,
      name: 'High Equipment Usage',
      condition: 'Utilization Rate',
      threshold: '> 90%',
      action: 'Email',
      status: 'active'
    },
    {
      id: 3,
      name: 'Revenue Drop Alert',
      condition: 'Daily Revenue',
      threshold: '< $50K',
      action: 'Email + Push',
      status: 'inactive'
    }
  ]);

  const [notificationSettings, setNotificationSettings] = useState<NotificationSetting[]>([
    {
      id: 1,
      type: 'Report Generation',
      email: true,
      sms: false,
      push: true,
      frequency: 'Immediate'
    },
    {
      id: 2,
      type: 'System Alerts',
      email: true,
      sms: true,
      push: true,
      frequency: 'Immediate'
    },
    {
      id: 3,
      type: 'Performance Updates',
      email: true,
      sms: false,
      push: false,
      frequency: 'Daily'
    }
  ]);

  const [userPermissions, setUserPermissions] = useState<UserPermission[]>([
    {
      id: 1,
      name: 'John Smith',
      role: 'Admin',
      permissions: ['View All Reports', 'Create Reports', 'Edit Reports', 'Delete Reports', 'Export Data'],
      lastAccess: '2024-03-10 14:30'
    },
    {
      id: 2,
      name: 'Sarah Johnson',
      role: 'Manager',
      permissions: ['View All Reports', 'Create Reports', 'Edit Reports'],
      lastAccess: '2024-03-10 12:15'
    },
    {
      id: 3,
      name: 'Mike Wilson',
      role: 'User',
      permissions: ['View Assigned Reports'],
      lastAccess: '2024-03-10 09:45'
    }
  ]);

  // Filtering logic
  const filteredReports = useMemo(() => {
    return reports.filter(report => {
      const matchesSearch = report.name.toLowerCase().includes(filters.search.toLowerCase()) ||
                           report.description.toLowerCase().includes(filters.search.toLowerCase());
      const matchesType = filters.type === 'all' || report.type === filters.type;
      const matchesStatus = filters.status === 'all' || report.status === filters.status;
      const matchesFormat = filters.format === 'all' || report.format === filters.format;
      
      return matchesSearch && matchesType && matchesStatus && matchesFormat;
    });
  }, [reports, filters]);

  // Functions
  const clearFilters = () => {
    setFilters({
      search: '',
      type: 'all',
      status: 'all',
      format: 'all'
    });
  };

  const closeFilterDialog = () => {
    setIsFilterDialogOpen(false);
  };

  const addNewReport = () => {
    const newReportItem: Report = {
      id: Math.max(...reports.map(r => r.id)) + 1,
      name: newReport.name,
      type: newReport.type,
      description: newReport.description,
      lastGenerated: new Date().toISOString().split('T')[0] ?? '',
      nextScheduled: newReport.schedule,
      status: 'active',
      format: newReport.format,
      recipients: newReport.recipients.split(',').map(email => email.trim())
    };
    
    setReports([...reports, newReportItem]);
    setNewReport({
      name: '',
      type: '',
      description: '',
      format: '',
      recipients: '',
      schedule: ''
    });
    setIsCreateReportDialogOpen(false);
  };

  const editReportItem = () => {
    if (!selectedReport) return;
    
    const updatedReports = reports.map(report => 
      report.id === selectedReport.id 
        ? {
            ...report,
            name: editReport.name,
            type: editReport.type,
            description: editReport.description,
            format: editReport.format,
            recipients: editReport.recipients.split(',').map(email => email.trim()),
            nextScheduled: editReport.schedule
          }
        : report
    );
    
    setReports(updatedReports);
    setIsEditReportDialogOpen(false);
  };

  const handleEditClick = (report: Report) => {
    setSelectedReport(report);
    setEditReport({
      name: report.name,
      type: report.type,
      description: report.description,
      format: report.format,
      recipients: report.recipients.join(', '),
      schedule: report.nextScheduled
    });
    setIsEditReportDialogOpen(true);
  };

  const handleViewClick = (report: Report) => {
    setSelectedReport(report);
    setIsViewReportDialogOpen(true);
  };

  const exportAllReports = () => {
    // Simulate export functionality
    alert('Exporting all reports...');
  };

  const downloadReport = (report: Report) => {
    // Simulate download functionality
    alert(`Downloading ${report.name} in ${report.format} format...`);
  };

  const scheduleReport = (report: Report) => {
    // Simulate scheduling functionality
    alert(`Scheduling ${report.name}...`);
  };

  const setAlert = () => {
    setIsAlertsDialogOpen(true);
  };

  const openNotificationSettings = () => {
    setIsNotificationSettingsDialogOpen(true);
  };

  const openUserPermissionsDialog = () => {
    setIsUserPermissionsDialogOpen(true);
  };

  const performanceAnalytics = () => {
    setIsPerformanceAnalyticsDialogOpen(true);
  };

  const kpiDashboard = () => {
    setIsKpiDashboardDialogOpen(true);
  };

  const realTimeMetrics = () => {
    setIsRealTimeMetricsDialogOpen(true);
  };

  const scheduleReports = () => {
    setIsScheduleReportsDialogOpen(true);
  };

  // Form validation
  const isNewReportFormValid = newReport.name && newReport.type && newReport.description && newReport.format;
  const isEditReportFormValid = editReport.name && editReport.type && editReport.description && editReport.format;

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
            <Button variant="outline" className="flex items-center gap-2" onClick={exportAllReports}>
              <Download className="h-4 w-4" />
              Export All
            </Button>
            <Dialog open={isCreateReportDialogOpen} onOpenChange={setIsCreateReportDialogOpen}>
              <DialogTrigger asChild>
                <Button className="flex items-center gap-2">
                  <Plus className="h-4 w-4" />
                  Create Report
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-md">
                <DialogHeader>
                  <DialogTitle>Create New Report</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="report-name">Report Name</Label>
                    <Input
                      id="report-name"
                      value={newReport.name}
                      onChange={(e) => setNewReport({...newReport, name: e.target.value})}
                      placeholder="Enter report name"
                    />
                  </div>
                  <div>
                    <Label htmlFor="report-type">Report Type</Label>
                    <Select value={newReport.type} onValueChange={(value) => setNewReport({...newReport, type: value})}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select report type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Finance">Finance</SelectItem>
                        <SelectItem value="Inventory">Inventory</SelectItem>
                        <SelectItem value="Rental">Rental</SelectItem>
                        <SelectItem value="CRM">CRM</SelectItem>
                        <SelectItem value="HRMS">HRMS</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="report-description">Description</Label>
                    <Input
                      id="report-description"
                      value={newReport.description}
                      onChange={(e) => setNewReport({...newReport, description: e.target.value})}
                      placeholder="Enter report description"
                    />
                  </div>
                  <div>
                    <Label htmlFor="report-format">Format</Label>
                    <Select value={newReport.format} onValueChange={(value) => setNewReport({...newReport, format: value})}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select format" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="PDF">PDF</SelectItem>
                        <SelectItem value="Excel">Excel</SelectItem>
                        <SelectItem value="PowerBI">PowerBI</SelectItem>
                        <SelectItem value="CSV">CSV</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="report-recipients">Recipients (comma-separated emails)</Label>
                    <Input
                      id="report-recipients"
                      value={newReport.recipients}
                      onChange={(e) => setNewReport({...newReport, recipients: e.target.value})}
                      placeholder="email1@example.com, email2@example.com"
                    />
                  </div>
                  <div>
                    <Label htmlFor="report-schedule">Next Schedule</Label>
                    <Input
                      id="report-schedule"
                      type="date"
                      value={newReport.schedule}
                      onChange={(e) => setNewReport({...newReport, schedule: e.target.value})}
                    />
                  </div>
                  <div className="flex gap-2 pt-4">
                    <Button 
                      onClick={addNewReport} 
                      disabled={!isNewReportFormValid}
                      className="flex-1"
                    >
                      Create Report
                    </Button>
                    <Button 
                      variant="outline" 
                      onClick={() => setIsCreateReportDialogOpen(false)}
                      className="flex-1"
                    >
                      Cancel
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
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
                    value={filters.search}
                    onChange={(e) => setFilters({...filters, search: e.target.value})}
                  />
                </div>
              </div>
              <Dialog open={isFilterDialogOpen} onOpenChange={setIsFilterDialogOpen}>
                <DialogTrigger asChild>
                  <Button variant="outline" className="flex items-center gap-2">
                    <Filter className="h-4 w-4" />
                    Filters
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-md">
                  <DialogHeader>
                    <DialogTitle>Filter Reports</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="filter-type">Report Type</Label>
                      <Select value={filters.type} onValueChange={(value) => setFilters({...filters, type: value})}>
                        <SelectTrigger>
                          <SelectValue placeholder="All Types" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All Types</SelectItem>
                          <SelectItem value="Finance">Finance</SelectItem>
                          <SelectItem value="Inventory">Inventory</SelectItem>
                          <SelectItem value="Rental">Rental</SelectItem>
                          <SelectItem value="CRM">CRM</SelectItem>
                          <SelectItem value="HRMS">HRMS</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="filter-status">Status</Label>
                      <Select value={filters.status} onValueChange={(value) => setFilters({...filters, status: value})}>
                        <SelectTrigger>
                          <SelectValue placeholder="All Statuses" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All Statuses</SelectItem>
                          <SelectItem value="active">Active</SelectItem>
                          <SelectItem value="scheduled">Scheduled</SelectItem>
                          <SelectItem value="inactive">Inactive</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="filter-format">Format</Label>
                      <Select value={filters.format} onValueChange={(value) => setFilters({...filters, format: value})}>
                        <SelectTrigger>
                          <SelectValue placeholder="All Formats" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All Formats</SelectItem>
                          <SelectItem value="PDF">PDF</SelectItem>
                          <SelectItem value="Excel">Excel</SelectItem>
                          <SelectItem value="PowerBI">PowerBI</SelectItem>
                          <SelectItem value="CSV">CSV</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="flex gap-2 pt-4">
                      <Button onClick={closeFilterDialog} className="flex-1">
                        Apply Filters
                      </Button>
                      <Button variant="outline" onClick={clearFilters} className="flex-1">
                        Clear All
                      </Button>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
            </div>

            {/* Active Filters */}
            {(filters.type !== 'all' || filters.status !== 'all' || filters.format !== 'all') && (
              <div className="flex flex-wrap gap-2 mb-4">
                {filters.type !== 'all' && (
                  <Badge variant="secondary" className="flex items-center gap-1">
                    Type: {filters.type}
                    <X className="h-3 w-3 cursor-pointer" onClick={() => setFilters({...filters, type: 'all'})} />
                  </Badge>
                )}
                {filters.status !== 'all' && (
                  <Badge variant="secondary" className="flex items-center gap-1">
                    Status: {filters.status}
                    <X className="h-3 w-3 cursor-pointer" onClick={() => setFilters({...filters, status: 'all'})} />
                  </Badge>
                )}
                {filters.format !== 'all' && (
                  <Badge variant="secondary" className="flex items-center gap-1">
                    Format: {filters.format}
                    <X className="h-3 w-3 cursor-pointer" onClick={() => setFilters({...filters, format: 'all'})} />
                  </Badge>
                )}
              </div>
            )}

            {/* Results count */}
            <div className="text-sm text-gray-500 mb-4">
              Showing {filteredReports.length} of {reports.length} reports
            </div>

            <div className="space-y-4">
              {filteredReports.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  No reports found matching your criteria.
                </div>
              ) : (
                filteredReports.map((report) => (
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
                        <Button size="sm" variant="outline" onClick={() => handleViewClick(report)}>
                          <Eye className="h-4 w-4 mr-1" />
                          View
                        </Button>
                        <Button size="sm" variant="outline" onClick={() => handleEditClick(report)}>
                          <Edit className="h-4 w-4 mr-1" />
                          Edit
                        </Button>
                        <Button size="sm" variant="outline" onClick={() => downloadReport(report)}>
                          <Download className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))
              )}
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
              <Dialog open={isCreateReportDialogOpen} onOpenChange={setIsCreateReportDialogOpen}>
                <DialogTrigger asChild>
                  <Button variant="outline" className="w-full justify-start">
                    <Plus className="mr-2 h-4 w-4" />
                    Create Custom Report
                  </Button>
                </DialogTrigger>
              </Dialog>
              <Button variant="outline" className="w-full justify-start" onClick={scheduleReports}>
                <Calendar className="mr-2 h-4 w-4" />
                Schedule Reports
              </Button>
              <Button variant="outline" className="w-full justify-start" onClick={exportAllReports}>
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
              <Button variant="outline" className="w-full justify-start" onClick={performanceAnalytics}>
                <TrendingUp className="mr-2 h-4 w-4" />
                Performance Analytics
              </Button>
              <Button variant="outline" className="w-full justify-start" onClick={kpiDashboard}>
                <Target className="mr-2 h-4 w-4" />
                KPI Dashboard
              </Button>
              <Button variant="outline" className="w-full justify-start" onClick={realTimeMetrics}>
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
              <Button variant="outline" className="w-full justify-start" onClick={setAlert}>
                <AlertTriangle className="mr-2 h-4 w-4" />
                Set Alerts
              </Button>
              <Button variant="outline" className="w-full justify-start" onClick={openNotificationSettings}>
                <Clock className="mr-2 h-4 w-4" />
                Notification Settings
              </Button>
              <Button variant="outline" className="w-full justify-start" onClick={openUserPermissionsDialog}>
                <Users className="mr-2 h-4 w-4" />
                User Permissions
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* View Report Dialog */}
        <Dialog open={isViewReportDialogOpen} onOpenChange={setIsViewReportDialogOpen}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Report Details</DialogTitle>
            </DialogHeader>
            {selectedReport && (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="font-medium">Report Name</Label>
                    <p className="text-sm text-gray-600">{selectedReport.name}</p>
                  </div>
                  <div>
                    <Label className="font-medium">Type</Label>
                    <p className="text-sm text-gray-600">{selectedReport.type}</p>
                  </div>
                  <div>
                    <Label className="font-medium">Format</Label>
                    <p className="text-sm text-gray-600">{selectedReport.format}</p>
                  </div>
                  <div>
                    <Label className="font-medium">Status</Label>
                    <div className="mt-1">{getStatusBadge(selectedReport.status)}</div>
                  </div>
                  <div>
                    <Label className="font-medium">Last Generated</Label>
                    <p className="text-sm text-gray-600">{selectedReport.lastGenerated}</p>
                  </div>
                  <div>
                    <Label className="font-medium">Next Scheduled</Label>
                    <p className="text-sm text-gray-600">{selectedReport.nextScheduled}</p>
                  </div>
                </div>
                <div>
                  <Label className="font-medium">Description</Label>
                  <p className="text-sm text-gray-600 mt-1">{selectedReport.description}</p>
                </div>
                <div>
                  <Label className="font-medium">Recipients</Label>
                  <div className="mt-1">
                    {selectedReport.recipients.map((email, index) => (
                      <Badge key={index} variant="outline" className="mr-2 mb-2">
                        {email}
                      </Badge>
                    ))}
                  </div>
                </div>
                <div className="flex gap-2 pt-4">
                  <Button onClick={() => downloadReport(selectedReport)} className="flex-1">
                    <Download className="h-4 w-4 mr-2" />
                    Download Report
                  </Button>
                  <Button variant="outline" onClick={() => setIsViewReportDialogOpen(false)} className="flex-1">
                    Close
                  </Button>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>

        {/* Edit Report Dialog */}
        <Dialog open={isEditReportDialogOpen} onOpenChange={setIsEditReportDialogOpen}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Edit Report</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="edit-report-name">Report Name</Label>
                <Input
                  id="edit-report-name"
                  value={editReport.name}
                  onChange={(e) => setEditReport({...editReport, name: e.target.value})}
                  placeholder="Enter report name"
                />
              </div>
              <div>
                <Label htmlFor="edit-report-type">Report Type</Label>
                <Select value={editReport.type} onValueChange={(value) => setEditReport({...editReport, type: value})}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select report type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Finance">Finance</SelectItem>
                    <SelectItem value="Inventory">Inventory</SelectItem>
                    <SelectItem value="Rental">Rental</SelectItem>
                    <SelectItem value="CRM">CRM</SelectItem>
                    <SelectItem value="HRMS">HRMS</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="edit-report-description">Description</Label>
                <Input
                  id="edit-report-description"
                  value={editReport.description}
                  onChange={(e) => setEditReport({...editReport, description: e.target.value})}
                  placeholder="Enter report description"
                />
              </div>
              <div>
                <Label htmlFor="edit-report-format">Format</Label>
                <Select value={editReport.format} onValueChange={(value) => setEditReport({...editReport, format: value})}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select format" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="PDF">PDF</SelectItem>
                    <SelectItem value="Excel">Excel</SelectItem>
                    <SelectItem value="PowerBI">PowerBI</SelectItem>
                    <SelectItem value="CSV">CSV</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="edit-report-recipients">Recipients (comma-separated emails)</Label>
                <Input
                  id="edit-report-recipients"
                  value={editReport.recipients}
                  onChange={(e) => setEditReport({...editReport, recipients: e.target.value})}
                  placeholder="email1@example.com, email2@example.com"
                />
              </div>
              <div>
                <Label htmlFor="edit-report-schedule">Next Schedule</Label>
                <Input
                  id="edit-report-schedule"
                  type="date"
                  value={editReport.schedule}
                  onChange={(e) => setEditReport({...editReport, schedule: e.target.value})}
                />
              </div>
              <div className="flex gap-2 pt-4">
                <Button 
                  onClick={editReportItem} 
                  disabled={!isEditReportFormValid}
                  className="flex-1"
                >
                  Update Report
                </Button>
                <Button 
                  variant="outline" 
                  onClick={() => setIsEditReportDialogOpen(false)}
                  className="flex-1"
                >
                  Cancel
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Schedule Reports Dialog */}
        <Dialog open={isScheduleReportsDialogOpen} onOpenChange={setIsScheduleReportsDialogOpen}>
          <DialogContent className="sm:max-w-[800px]">
            <DialogHeader>
              <DialogTitle>Schedule Reports</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-medium">Scheduled Reports</h3>
                <Button size="sm" className="flex items-center gap-2">
                  <Plus className="h-4 w-4" />
                  Add Schedule
                </Button>
              </div>

              <div className="space-y-3">
                {scheduledReports.map((scheduledReport) => (
                  <div key={scheduledReport.id} className="p-4 border rounded-lg">
                    <div className="flex justify-between items-start">
                      <div>
                        <div className="font-medium">{scheduledReport.name}</div>
                        <div className="text-sm text-gray-500">
                          Frequency: {scheduledReport.frequency} • Next Run: {scheduledReport.nextRun}
                        </div>
                        <div className="text-sm text-gray-500 mt-1">
                          Recipients: {scheduledReport.recipients.join(', ')}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant={scheduledReport.status === 'active' ? 'default' : 'secondary'}>
                          {scheduledReport.status}
                        </Badge>
                        <Button size="sm" variant="outline">
                          <Edit className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Performance Analytics Dialog */}
        <Dialog open={isPerformanceAnalyticsDialogOpen} onOpenChange={setIsPerformanceAnalyticsDialogOpen}>
          <DialogContent className="sm:max-w-[900px]">
            <DialogHeader>
              <DialogTitle>Performance Analytics</DialogTitle>
            </DialogHeader>
            <div className="space-y-6">
              <div className="grid grid-cols-3 gap-4">
                <Card>
                  <CardContent className="p-4 text-center">
                    <div className="text-2xl font-bold text-blue-600">$2.4M</div>
                    <div className="text-sm text-gray-500">Total Revenue</div>
                    <div className="text-xs text-green-600 mt-1">+15.2% vs last month</div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4 text-center">
                    <div className="text-2xl font-bold text-green-600">78%</div>
                    <div className="text-sm text-gray-500">Equipment Utilization</div>
                    <div className="text-xs text-green-600 mt-1">+5.2% vs last month</div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4 text-center">
                    <div className="text-2xl font-bold text-purple-600">94.2%</div>
                    <div className="text-sm text-gray-500">Customer Satisfaction</div>
                    <div className="text-xs text-green-600 mt-1">+2.1% vs last month</div>
                  </CardContent>
                </Card>
              </div>

              <div className="space-y-4">
                <h3 className="text-lg font-medium">Performance Trends</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 border rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <TrendingUp className="h-4 w-4 text-green-600" />
                      <span className="font-medium">Revenue Growth</span>
                    </div>
                    <div className="text-sm text-gray-600">
                      Consistent growth over the past 6 months with seasonal peaks in Q3 and Q4.
                    </div>
                  </div>
                  <div className="p-4 border rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <Activity className="h-4 w-4 text-blue-600" />
                      <span className="font-medium">Operational Efficiency</span>
                    </div>
                    <div className="text-sm text-gray-600">
                      Equipment utilization rates improving steadily with optimized scheduling.
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="text-lg font-medium">Key Insights</h3>
                <div className="space-y-2">
                  <div className="flex items-start gap-2 p-3 bg-green-50 rounded-lg">
                    <CheckCircle className="h-4 w-4 text-green-600 mt-0.5" />
                    <div>
                      <div className="font-medium text-green-800">Revenue Growth</div>
                      <div className="text-sm text-green-700">15.2% increase in monthly revenue driven by new customer acquisitions</div>
                    </div>
                  </div>
                  <div className="flex items-start gap-2 p-3 bg-blue-50 rounded-lg">
                    <Activity className="h-4 w-4 text-blue-600 mt-0.5" />
                    <div>
                      <div className="font-medium text-blue-800">Operational Excellence</div>
                      <div className="text-sm text-blue-700">Equipment utilization improved by 5.2% through better scheduling</div>
                    </div>
                  </div>
                  <div className="flex items-start gap-2 p-3 bg-purple-50 rounded-lg">
                    <Users className="h-4 w-4 text-purple-600 mt-0.5" />
                    <div>
                      <div className="font-medium text-purple-800">Customer Satisfaction</div>
                      <div className="text-sm text-purple-700">94.2% satisfaction rate with improved service delivery</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* KPI Dashboard Dialog */}
        <Dialog open={isKpiDashboardDialogOpen} onOpenChange={setIsKpiDashboardDialogOpen}>
          <DialogContent className="sm:max-w-[900px]">
            <DialogHeader>
              <DialogTitle>KPI Dashboard</DialogTitle>
            </DialogHeader>
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                {kpiMetrics.map((category) => (
                  <div key={category.category} className="space-y-4">
                    <h3 className="font-semibold text-lg border-b pb-2">{category.category}</h3>
                    <div className="space-y-3">
                      {category.metrics.map((metric, index) => (
                        <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                          <div>
                            <div className="font-medium text-sm">{metric.name}</div>
                            <div className="text-xl font-bold">{metric.value}</div>
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

              <div className="space-y-4">
                <h3 className="text-lg font-medium">KPI Summary</h3>
                <div className="grid grid-cols-3 gap-4">
                  <div className="text-center p-4 bg-green-50 rounded-lg">
                    <div className="text-2xl font-bold text-green-600">12</div>
                    <div className="text-sm text-green-700">KPIs Improving</div>
                  </div>
                  <div className="text-center p-4 bg-yellow-50 rounded-lg">
                    <div className="text-2xl font-bold text-yellow-600">3</div>
                    <div className="text-sm text-yellow-700">KPIs Stable</div>
                  </div>
                  <div className="text-center p-4 bg-red-50 rounded-lg">
                    <div className="text-2xl font-bold text-red-600">1</div>
                    <div className="text-sm text-red-700">KPIs Declining</div>
                  </div>
                </div>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Real-time Metrics Dialog */}
        <Dialog open={isRealTimeMetricsDialogOpen} onOpenChange={setIsRealTimeMetricsDialogOpen}>
          <DialogContent className="sm:max-w-[800px]">
            <DialogHeader>
              <DialogTitle>Real-time Metrics</DialogTitle>
            </DialogHeader>
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <Activity className="h-4 w-4 text-green-600" />
                      <span className="font-medium">Active Equipment</span>
                    </div>
                    <div className="text-2xl font-bold text-green-600">47/52</div>
                    <div className="text-sm text-gray-500">90.4% utilization</div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <Users className="h-4 w-4 text-blue-600" />
                      <span className="font-medium">Online Users</span>
                    </div>
                    <div className="text-2xl font-bold text-blue-600">23</div>
                    <div className="text-sm text-gray-500">Active sessions</div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <Database className="h-4 w-4 text-purple-600" />
                      <span className="font-medium">System Load</span>
                    </div>
                    <div className="text-2xl font-bold text-purple-600">67%</div>
                    <div className="text-sm text-gray-500">Normal range</div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <Globe className="h-4 w-4 text-orange-600" />
                      <span className="font-medium">API Response</span>
                    </div>
                    <div className="text-2xl font-bold text-orange-600">142ms</div>
                    <div className="text-sm text-gray-500">Average response time</div>
                  </CardContent>
                </Card>
              </div>

              <div className="space-y-4">
                <h3 className="text-lg font-medium">Live Activity Feed</h3>
                <div className="space-y-2 max-h-60 overflow-y-auto">
                  <div className="flex items-center gap-2 p-2 bg-green-50 rounded">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    <span className="text-sm">New order received - Equipment #EQ-2024-001</span>
                    <span className="text-xs text-gray-500 ml-auto">2 min ago</span>
                  </div>
                  <div className="flex items-center gap-2 p-2 bg-blue-50 rounded">
                    <Users className="h-4 w-4 text-blue-600" />
                    <span className="text-sm">User login - Sarah Johnson</span>
                    <span className="text-xs text-gray-500 ml-auto">5 min ago</span>
                  </div>
                  <div className="flex items-center gap-2 p-2 bg-yellow-50 rounded">
                    <AlertTriangle className="h-4 w-4 text-yellow-600" />
                    <span className="text-sm">Low stock alert - Diesel Fuel</span>
                    <span className="text-xs text-gray-500 ml-auto">8 min ago</span>
                  </div>
                  <div className="flex items-center gap-2 p-2 bg-purple-50 rounded">
                    <FileText className="h-4 w-4 text-purple-600" />
                    <span className="text-sm">Report generated - Daily Equipment Status</span>
                    <span className="text-xs text-gray-500 ml-auto">12 min ago</span>
                  </div>
                </div>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Alerts Dialog */}
        <Dialog open={isAlertsDialogOpen} onOpenChange={setIsAlertsDialogOpen}>
          <DialogContent className="sm:max-w-[800px]">
            <DialogHeader>
              <DialogTitle>Alert Management</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-medium">Alert Rules</h3>
                <Button size="sm" className="flex items-center gap-2">
                  <Plus className="h-4 w-4" />
                  Create Alert
                </Button>
              </div>

              <div className="space-y-3">
                {alertRules.map((alertRule) => (
                  <div key={alertRule.id} className="p-4 border rounded-lg">
                    <div className="flex justify-between items-start">
                      <div>
                        <div className="font-medium">{alertRule.name}</div>
                        <div className="text-sm text-gray-500">
                          Condition: {alertRule.condition} • Threshold: {alertRule.threshold}
                        </div>
                        <div className="text-sm text-gray-500 mt-1">
                          Action: {alertRule.action}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant={alertRule.status === 'active' ? 'default' : 'secondary'}>
                          {alertRule.status}
                        </Badge>
                        <Button size="sm" variant="outline">
                          <Edit className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="space-y-4">
                <h3 className="text-lg font-medium">Recent Alerts</h3>
                <div className="space-y-2">
                  <div className="flex items-center gap-2 p-3 bg-red-50 rounded-lg">
                    <AlertTriangle className="h-4 w-4 text-red-600" />
                    <div>
                      <div className="font-medium text-red-800">Low Inventory Alert</div>
                      <div className="text-sm text-red-700">Diesel Fuel stock level is below 10 units</div>
                      <div className="text-xs text-red-600 mt-1">Triggered 2 hours ago</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 p-3 bg-yellow-50 rounded-lg">
                    <AlertTriangle className="h-4 w-4 text-yellow-600" />
                    <div>
                      <div className="font-medium text-yellow-800">High Equipment Usage</div>
                      <div className="text-sm text-yellow-700">Excavator #EX-001 utilization at 92%</div>
                      <div className="text-xs text-yellow-600 mt-1">Triggered 4 hours ago</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Notification Settings Dialog */}
        <Dialog open={isNotificationSettingsDialogOpen} onOpenChange={setIsNotificationSettingsDialogOpen}>
          <DialogContent className="sm:max-w-[700px]">
            <DialogHeader>
              <DialogTitle>Notification Settings</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-3">
                {notificationSettings.map((setting) => (
                  <div key={setting.id} className="p-4 border rounded-lg">
                    <div className="flex justify-between items-start">
                      <div>
                        <div className="font-medium">{setting.type}</div>
                        <div className="text-sm text-gray-500">Frequency: {setting.frequency}</div>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="flex items-center gap-2">
                          <input
                            type="checkbox"
                            checked={setting.email}
                            className="rounded"
                          />
                          <span className="text-sm">Email</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <input
                            type="checkbox"
                            checked={setting.sms}
                            className="rounded"
                          />
                          <span className="text-sm">SMS</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <input
                            type="checkbox"
                            checked={setting.push}
                            className="rounded"
                          />
                          <span className="text-sm">Push</span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="space-y-4">
                <h3 className="text-lg font-medium">Notification Channels</h3>
                <div className="grid grid-cols-3 gap-4">
                  <div className="text-center p-4 border rounded-lg">
                    <Bell className="h-8 w-8 text-blue-600 mx-auto mb-2" />
                    <div className="font-medium">Email Notifications</div>
                    <div className="text-sm text-gray-500">Configure email preferences</div>
                  </div>
                  <div className="text-center p-4 border rounded-lg">
                    <Smartphone className="h-8 w-8 text-green-600 mx-auto mb-2" />
                    <div className="font-medium">SMS Alerts</div>
                    <div className="text-sm text-gray-500">Emergency notifications</div>
                  </div>
                  <div className="text-center p-4 border rounded-lg">
                    <Zap className="h-8 w-8 text-purple-600 mx-auto mb-2" />
                    <div className="font-medium">Push Notifications</div>
                    <div className="text-sm text-gray-500">Real-time updates</div>
                  </div>
                </div>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* User Permissions Dialog */}
        <Dialog open={isUserPermissionsDialogOpen} onOpenChange={setIsUserPermissionsDialogOpen}>
          <DialogContent className="sm:max-w-[800px]">
            <DialogHeader>
              <DialogTitle>User Permissions</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-medium">User Access Management</h3>
                <Button size="sm" className="flex items-center gap-2">
                  <Plus className="h-4 w-4" />
                  Add User
                </Button>
              </div>

              <div className="space-y-3">
                {userPermissions.map((user) => (
                  <div key={user.id} className="p-4 border rounded-lg">
                    <div className="flex justify-between items-start">
                      <div>
                        <div className="font-medium">{user.name}</div>
                        <div className="text-sm text-gray-500">
                          Role: {user.role} • Last Access: {user.lastAccess}
                        </div>
                        <div className="text-sm text-gray-500 mt-1">
                          Permissions: {user.permissions.join(', ')}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant="outline">{user.role}</Badge>
                        <Button size="sm" variant="outline">
                          <Edit className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="space-y-4">
                <h3 className="text-lg font-medium">Permission Levels</h3>
                <div className="grid grid-cols-3 gap-4">
                  <div className="text-center p-4 bg-red-50 rounded-lg">
                    <Shield className="h-8 w-8 text-red-600 mx-auto mb-2" />
                    <div className="font-medium text-red-800">Admin</div>
                    <div className="text-sm text-red-700">Full system access</div>
                  </div>
                  <div className="text-center p-4 bg-blue-50 rounded-lg">
                    <Users className="h-8 w-8 text-blue-600 mx-auto mb-2" />
                    <div className="font-medium text-blue-800">Manager</div>
                    <div className="text-sm text-blue-700">Department-level access</div>
                  </div>
                  <div className="text-center p-4 bg-green-50 rounded-lg">
                    <User className="h-8 w-8 text-green-600 mx-auto mb-2" />
                    <div className="font-medium text-green-800">User</div>
                    <div className="text-sm text-green-700">Limited access</div>
                  </div>
                </div>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  );
};

export default ReportsPage; 