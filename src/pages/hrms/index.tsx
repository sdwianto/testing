import React from 'react';
import { DashboardLayout } from '@/components/layouts/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { 
  Users, 
  UserPlus,
  Calendar,
  Clock,
  DollarSign,
  TrendingUp,
  AlertTriangle,
  CheckCircle,
  Search,
  Filter,
  FileText,
  Building2,
  GraduationCap,
  Briefcase
} from 'lucide-react';

const HRMSPage: React.FC = () => {
  // Mock data for demonstration
  const hrStats = {
    totalEmployees: 45,
    activeEmployees: 42,
    onLeave: 3,
    newHires: 2,
    attendance: 98.5,
    payroll: {
      monthly: 125000,
      pending: 125000,
      processed: 0
    }
  };

  const employees = [
    {
      id: 1,
      employeeId: 'EMP-001',
      name: 'John Smith',
      position: 'Equipment Operator',
      department: 'Operations',
      email: 'john.smith@nextgen.com',
      phone: '+675 1234 5678',
      status: 'active',
      hireDate: '2023-01-15',
      salary: 3500,
      location: 'Port Moresby',
      attendance: 95
    },
    {
      id: 2,
      employeeId: 'EMP-002',
      name: 'Sarah Johnson',
      position: 'Maintenance Technician',
      department: 'Maintenance',
      email: 'sarah.johnson@nextgen.com',
      phone: '+675 1234 5679',
      status: 'active',
      hireDate: '2023-03-20',
      salary: 4200,
      location: 'Lae',
      attendance: 98
    },
    {
      id: 3,
      employeeId: 'EMP-003',
      name: 'Mike Wilson',
      position: 'Inventory Manager',
      department: 'Inventory',
      email: 'mike.wilson@nextgen.com',
      phone: '+675 1234 5680',
      status: 'on-leave',
      hireDate: '2022-11-10',
      salary: 4800,
      location: 'Port Moresby',
      attendance: 92
    },
    {
      id: 4,
      employeeId: 'EMP-004',
      name: 'Lisa Brown',
      position: 'Finance Officer',
      department: 'Finance',
      email: 'lisa.brown@nextgen.com',
      phone: '+675 1234 5681',
      status: 'active',
      hireDate: '2023-06-05',
      salary: 3800,
      location: 'Port Moresby',
      attendance: 100
    }
  ];

  const leaveRequests = [
    {
      id: 1,
      employeeName: 'Mike Wilson',
      employeeId: 'EMP-003',
      type: 'Annual Leave',
      startDate: '2024-03-15',
      endDate: '2024-03-22',
      days: 8,
      status: 'approved',
      reason: 'Family vacation'
    },
    {
      id: 2,
      employeeName: 'David Lee',
      employeeId: 'EMP-005',
      type: 'Sick Leave',
      startDate: '2024-03-12',
      endDate: '2024-03-14',
      days: 3,
      status: 'approved',
      reason: 'Medical appointment'
    },
    {
      id: 3,
      employeeName: 'Anna Garcia',
      employeeId: 'EMP-006',
      type: 'Maternity Leave',
      startDate: '2024-04-01',
      endDate: '2024-07-01',
      days: 90,
      status: 'pending',
      reason: 'Maternity leave'
    }
  ];

  const departments = [
    { id: 1, name: 'Operations', count: 18, manager: 'John Smith' },
    { id: 2, name: 'Maintenance', count: 12, manager: 'Sarah Johnson' },
    { id: 3, name: 'Inventory', count: 8, manager: 'Mike Wilson' },
    { id: 4, name: 'Finance', count: 5, manager: 'Lisa Brown' },
    { id: 5, name: 'HR', count: 3, manager: 'David Lee' }
  ];

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <Badge variant="default">Active</Badge>;
      case 'on-leave':
        return <Badge variant="outline">On Leave</Badge>;
      case 'terminated':
        return <Badge variant="destructive">Terminated</Badge>;
      case 'approved':
        return <Badge variant="default">Approved</Badge>;
      case 'pending':
        return <Badge variant="outline">Pending</Badge>;
      case 'rejected':
        return <Badge variant="destructive">Rejected</Badge>;
      default:
        return <Badge variant="outline">Unknown</Badge>;
    }
  };

  const getAttendanceColor = (attendance: number) => {
    if (attendance >= 95) return 'text-green-600';
    if (attendance >= 90) return 'text-yellow-600';
    return 'text-red-600';
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">HRMS & Payroll</h1>
            <p className="text-gray-600 dark:text-gray-400">Manage employees, attendance, leave, and payroll</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" className="flex items-center gap-2">
              <FileText className="h-4 w-4" />
              Payroll Report
            </Button>
            <Button className="flex items-center gap-2">
              <UserPlus className="h-4 w-4" />
              Add Employee
            </Button>
          </div>
        </div>

        {/* HR Overview Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Employees</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{hrStats.totalEmployees}</div>
              <p className="text-xs text-muted-foreground">
                <UserPlus className="inline h-3 w-3 text-green-500" /> +{hrStats.newHires} new hires this month
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Employees</CardTitle>
              <CheckCircle className="h-4 w-4 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{hrStats.activeEmployees}</div>
              <p className="text-xs text-muted-foreground">
                <AlertTriangle className="inline h-3 w-3 text-yellow-500" /> {hrStats.onLeave} on leave
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Attendance Rate</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{hrStats.attendance}%</div>
              <p className="text-xs text-muted-foreground">
                <TrendingUp className="inline h-3 w-3 text-green-500" /> +2.5% from last month
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Monthly Payroll</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatCurrency(hrStats.payroll.monthly)}</div>
              <p className="text-xs text-muted-foreground">
                <Clock className="inline h-3 w-3 text-yellow-500" /> {formatCurrency(hrStats.payroll.pending)} pending
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Employee Management */}
        <Card>
          <CardHeader>
            <CardTitle>Employee Management</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex gap-4 mb-6">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input 
                    placeholder="Search employees..." 
                    className="pl-10"
                  />
                </div>
              </div>
              <Button variant="outline" className="flex items-center gap-2">
                <Filter className="h-4 w-4" />
                Filters
              </Button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left p-3 font-medium">Employee</th>
                    <th className="text-left p-3 font-medium">Position</th>
                    <th className="text-left p-3 font-medium">Department</th>
                    <th className="text-left p-3 font-medium">Status</th>
                    <th className="text-left p-3 font-medium">Salary</th>
                    <th className="text-left p-3 font-medium">Attendance</th>
                    <th className="text-left p-3 font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {employees.map((employee) => (
                    <tr key={employee.id} className="border-b hover:bg-gray-50 dark:hover:bg-gray-800">
                      <td className="p-3">
                        <div>
                          <div className="font-medium">{employee.name}</div>
                          <div className="text-sm text-gray-500">{employee.employeeId}</div>
                          <div className="text-sm text-gray-500">{employee.email}</div>
                        </div>
                      </td>
                      <td className="p-3">
                        <div className="flex items-center gap-2">
                          <Briefcase className="h-4 w-4 text-gray-400" />
                          <span>{employee.position}</span>
                        </div>
                      </td>
                      <td className="p-3">
                        <div className="flex items-center gap-2">
                          <Building2 className="h-4 w-4 text-gray-400" />
                          <span>{employee.department}</span>
                        </div>
                      </td>
                      <td className="p-3">
                        {getStatusBadge(employee.status)}
                      </td>
                      <td className="p-3">
                        <div className="flex items-center gap-1">
                          <DollarSign className="h-4 w-4 text-gray-400" />
                          <span>{formatCurrency(employee.salary)}</span>
                        </div>
                      </td>
                      <td className="p-3">
                        <span className={`font-medium ${getAttendanceColor(employee.attendance)}`}>
                          {employee.attendance}%
                        </span>
                      </td>
                      <td className="p-3">
                        <div className="flex gap-2">
                          <Button size="sm" variant="outline">View</Button>
                          <Button size="sm" variant="outline">Edit</Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        {/* Leave Management */}
        <Card>
          <CardHeader>
            <CardTitle>Leave Management</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {leaveRequests.map((request) => (
                <div key={request.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center gap-4">
                    <Calendar className="h-4 w-4 text-blue-500" />
                    <div>
                      <div className="font-medium">{request.employeeName}</div>
                      <div className="text-sm text-gray-500">
                        {request.employeeId} • {request.type} • {request.days} days
                      </div>
                      <div className="text-sm text-gray-500">
                        {request.startDate} to {request.endDate}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <div className="text-sm font-medium">Reason</div>
                      <div className="text-sm text-gray-500">{request.reason}</div>
                    </div>
                    {getStatusBadge(request.status)}
                    <Button size="sm" variant="outline">View Details</Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Department Overview */}
        <Card>
          <CardHeader>
            <CardTitle>Department Overview</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {departments.map((dept) => (
                <div key={dept.id} className="p-4 border rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-medium">{dept.name}</h3>
                    <Badge variant="outline">{dept.count} employees</Badge>
                  </div>
                  <p className="text-sm text-gray-500 mb-3">Manager: {dept.manager}</p>
                  <div className="flex gap-2">
                    <Button size="sm" variant="outline">View Team</Button>
                    <Button size="sm" variant="outline">Reports</Button>
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
                <Users className="h-5 w-5" />
                Employee Management
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button variant="outline" className="w-full justify-start">
                <UserPlus className="mr-2 h-4 w-4" />
                Add New Employee
              </Button>
              <Button variant="outline" className="w-full justify-start">
                <Search className="mr-2 h-4 w-4" />
                Employee Directory
              </Button>
              <Button variant="outline" className="w-full justify-start">
                <GraduationCap className="mr-2 h-4 w-4" />
                Training Records
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Attendance & Leave
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button variant="outline" className="w-full justify-start">
                <Clock className="mr-2 h-4 w-4" />
                Attendance Report
              </Button>
              <Button variant="outline" className="w-full justify-start">
                <Calendar className="mr-2 h-4 w-4" />
                Leave Requests
              </Button>
              <Button variant="outline" className="w-full justify-start">
                <AlertTriangle className="mr-2 h-4 w-4" />
                Absence Alerts
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <DollarSign className="h-5 w-5" />
                Payroll
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button variant="outline" className="w-full justify-start">
                <FileText className="mr-2 h-4 w-4" />
                Process Payroll
              </Button>
              <Button variant="outline" className="w-full justify-start">
                <DollarSign className="mr-2 h-4 w-4" />
                Payroll Reports
              </Button>
              <Button variant="outline" className="w-full justify-start">
                <TrendingUp className="mr-2 h-4 w-4" />
                Salary Analytics
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default HRMSPage; 