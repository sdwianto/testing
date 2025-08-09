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
  Briefcase,
  X,
  Eye,
  Edit
} from 'lucide-react';

interface Employee {
  id: number;
  employeeId: string;
  name: string;
  position: string;
  department: string;
  email: string;
  phone: string;
  status: string;
  hireDate: string;
  salary: number;
  location: string;
  attendance: number;
}

interface LeaveRequest {
  id: number;
  employeeName: string;
  employeeId: string;
  type: string;
  startDate: string;
  endDate: string;
  days: number;
  status: string;
  reason: string;
}

interface AttendanceRecord {
  id: number;
  employeeName: string;
  employeeId: string;
  date: string;
  checkIn: string;
  checkOut: string;
  hours: number;
  status: string;
}

interface PayrollRecord {
  id: number;
  employeeName: string;
  employeeId: string;
  period: string;
  basicSalary: number;
  allowances: number;
  deductions: number;
  netSalary: number;
  status: string;
}

interface TrainingRecord {
  id: number;
  employeeName: string;
  employeeId: string;
  courseName: string;
  startDate: string;
  endDate: string;
  status: string;
  score: number;
}

interface FilterState {
  search: string;
  department: string;
  status: string;
  position: string;
  location: string;
}

const HRMSPage: React.FC = () => {
  // Filter state
  const [filters, setFilters] = useState<FilterState>({
    search: '',
    department: 'all',
    status: 'all',
    position: 'all',
    location: 'all'
  });

  // Dialog state
  const [isFilterDialogOpen, setIsFilterDialogOpen] = useState(false);
  const [isAddEmployeeDialogOpen, setIsAddEmployeeDialogOpen] = useState(false);
  const [isEditEmployeeDialogOpen, setIsEditEmployeeDialogOpen] = useState(false);
  const [isViewEmployeeDialogOpen, setIsViewEmployeeDialogOpen] = useState(false);
  const [isViewLeaveDialogOpen, setIsViewLeaveDialogOpen] = useState(false);
  const [isNewLeaveDialogOpen, setIsNewLeaveDialogOpen] = useState(false);
  const [isAttendanceReportDialogOpen, setIsAttendanceReportDialogOpen] = useState(false);
  const [isLeaveRequestsDialogOpen, setIsLeaveRequestsDialogOpen] = useState(false);
  const [isAbsenceAlertsDialogOpen, setIsAbsenceAlertsDialogOpen] = useState(false);
  const [isProcessPayrollDialogOpen, setIsProcessPayrollDialogOpen] = useState(false);
  const [isPayrollReportsDialogOpen, setIsPayrollReportsDialogOpen] = useState(false);
  const [isSalaryAnalyticsDialogOpen, setIsSalaryAnalyticsDialogOpen] = useState(false);
  const [isEmployeeDirectoryDialogOpen, setIsEmployeeDirectoryDialogOpen] = useState(false);
  const [isTrainingRecordsDialogOpen, setIsTrainingRecordsDialogOpen] = useState(false);
  const [isViewTeamDialogOpen, setIsViewTeamDialogOpen] = useState(false);
  const [isDepartmentReportsDialogOpen, setIsDepartmentReportsDialogOpen] = useState(false);
  const [isLeaveApprovalDialogOpen, setIsLeaveApprovalDialogOpen] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);
  const [selectedLeave, setSelectedLeave] = useState<LeaveRequest | null>(null);

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

  const [employees, setEmployees] = useState<Employee[]>([
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
  ]);

  const [leaveRequests, setLeaveRequests] = useState<LeaveRequest[]>([
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
  ]);

  const [attendanceRecords, setAttendanceRecords] = useState<AttendanceRecord[]>([
    {
      id: 1,
      employeeName: 'John Smith',
      employeeId: 'EMP-001',
      date: '2024-03-15',
      checkIn: '08:00',
      checkOut: '17:00',
      hours: 9,
      status: 'present'
    },
    {
      id: 2,
      employeeName: 'Sarah Johnson',
      employeeId: 'EMP-002',
      date: '2024-03-15',
      checkIn: '07:45',
      checkOut: '16:30',
      hours: 8.75,
      status: 'present'
    },
    {
      id: 3,
      employeeName: 'Mike Wilson',
      employeeId: 'EMP-003',
      date: '2024-03-15',
      checkIn: '--',
      checkOut: '--',
      hours: 0,
      status: 'absent'
    }
  ]);

  const [payrollRecords, setPayrollRecords] = useState<PayrollRecord[]>([
    {
      id: 1,
      employeeName: 'John Smith',
      employeeId: 'EMP-001',
      period: 'March 2024',
      basicSalary: 3500,
      allowances: 500,
      deductions: 200,
      netSalary: 3800,
      status: 'processed'
    },
    {
      id: 2,
      employeeName: 'Sarah Johnson',
      employeeId: 'EMP-002',
      period: 'March 2024',
      basicSalary: 4200,
      allowances: 600,
      deductions: 250,
      netSalary: 4550,
      status: 'processed'
    },
    {
      id: 3,
      employeeName: 'Lisa Brown',
      employeeId: 'EMP-004',
      period: 'March 2024',
      basicSalary: 3800,
      allowances: 400,
      deductions: 180,
      netSalary: 4020,
      status: 'pending'
    }
  ]);

  const [trainingRecords, setTrainingRecords] = useState<TrainingRecord[]>([
    {
      id: 1,
      employeeName: 'John Smith',
      employeeId: 'EMP-001',
      courseName: 'Equipment Safety Training',
      startDate: '2024-02-01',
      endDate: '2024-02-15',
      status: 'completed',
      score: 95
    },
    {
      id: 2,
      employeeName: 'Sarah Johnson',
      employeeId: 'EMP-002',
      courseName: 'Advanced Maintenance Techniques',
      startDate: '2024-03-01',
      endDate: '2024-03-30',
      status: 'in-progress',
      score: 0
    },
    {
      id: 3,
      employeeName: 'Mike Wilson',
      employeeId: 'EMP-003',
      courseName: 'Inventory Management Systems',
      startDate: '2024-01-15',
      endDate: '2024-01-30',
      status: 'completed',
      score: 88
    }
  ]);

  const [departments, setDepartments] = useState([
    { id: 1, name: 'Operations', count: 18, manager: 'John Smith' },
    { id: 2, name: 'Maintenance', count: 12, manager: 'Sarah Johnson' },
    { id: 3, name: 'Inventory', count: 8, manager: 'Mike Wilson' },
    { id: 4, name: 'Finance', count: 5, manager: 'Lisa Brown' },
    { id: 5, name: 'HR', count: 3, manager: 'David Lee' }
  ]);

  // New leave request form state
  const [newLeaveRequest, setNewLeaveRequest] = useState({
    employeeId: '',
    employeeName: '',
    type: '',
    startDate: '',
    endDate: '',
    reason: ''
  });

  // Get unique values for filter options
  const departmentsList = useMemo(() => 
    Array.from(new Set(employees.map(item => item.department))), 
    [employees]
  );

  const positions = useMemo(() => 
    Array.from(new Set(employees.map(item => item.position))), 
    [employees]
  );

  const locations = useMemo(() => 
    Array.from(new Set(employees.map(item => item.location))), 
    [employees]
  );

  const statuses = useMemo(() => 
    Array.from(new Set(employees.map(item => item.status))), 
    [employees]
  );

  // Filtered employees
  const filteredEmployees = useMemo(() => {
    return employees.filter(item => {
      // Search filter
      const searchLower = filters.search.toLowerCase();
      const matchesSearch = !filters.search || 
        item.name.toLowerCase().includes(searchLower) ||
        item.employeeId.toLowerCase().includes(searchLower) || 
        item.email.toLowerCase().includes(searchLower) ||
        item.position.toLowerCase().includes(searchLower) ||
        item.department.toLowerCase().includes(searchLower);

      // Department filter
      const matchesDepartment = !filters.department || filters.department === 'all' || item.department === filters.department;
      
      // Status filter
      const matchesStatus = !filters.status || filters.status === 'all' || item.status === filters.status;
      
      // Position filter
      const matchesPosition = !filters.position || filters.position === 'all' || item.position === filters.position;
      
      // Location filter
      const matchesLocation = !filters.location || filters.location === 'all' || item.location === filters.location;

      return matchesSearch && matchesDepartment && matchesStatus && matchesPosition && matchesLocation;
    });
  }, [employees, filters]);

  // Clear all filters
  const clearFilters = () => {
    setFilters({
      search: '',
      department: 'all',
      status: 'all',
      position: 'all',
      location: 'all'
    });
  };

  // Close filter dialog
  const closeFilterDialog = () => {
    setIsFilterDialogOpen(false);
  };

  // New employee form state
  const [newEmployee, setNewEmployee] = useState({
    employeeId: '',
    name: '',
    position: '',
    department: '',
    email: '',
    phone: '',
    salary: '',
    location: '',
    status: 'active'
  });

  // Edit employee form state
  const [editEmployee, setEditEmployee] = useState({
    employeeId: '',
    name: '',
    position: '',
    department: '',
    email: '',
    phone: '',
    salary: '',
    location: '',
    status: 'active'
  });

  // Add new employee
  const addNewEmployee = () => {
    const employee: Employee = {
      id: Math.max(...employees.map(item => item.id)) + 1,
      employeeId: newEmployee.employeeId,
      name: newEmployee.name,
      position: newEmployee.position,
      department: newEmployee.department,
      email: newEmployee.email,
      phone: newEmployee.phone,
      status: newEmployee.status,
      hireDate: new Date().toISOString().split('T')[0] ?? '',
      salary: parseFloat(newEmployee.salary) || 0,
      location: newEmployee.location,
      attendance: 100
    };

    setEmployees(prevEmployees => [...prevEmployees, employee]);
    
    setNewEmployee({
      employeeId: '',
      name: '',
      position: '',
      department: '',
      email: '',
      phone: '',
      salary: '',
      location: '',
      status: 'active'
    });
    setIsAddEmployeeDialogOpen(false);
  };

  // Edit employee
  const editEmployeeItem = () => {
    if (!selectedEmployee) return;

    const updatedEmployee: Employee = {
      ...selectedEmployee,
      employeeId: editEmployee.employeeId,
      name: editEmployee.name,
      position: editEmployee.position,
      department: editEmployee.department,
      email: editEmployee.email,
      phone: editEmployee.phone,
      salary: parseFloat(editEmployee.salary) || 0,
      location: editEmployee.location,
      status: editEmployee.status
    };

    setEmployees(prevEmployees => 
      prevEmployees.map(item => item.id === selectedEmployee.id ? updatedEmployee : item)
    );
    
    setEditEmployee({
      employeeId: '',
      name: '',
      position: '',
      department: '',
      email: '',
      phone: '',
      salary: '',
      location: '',
      status: 'active'
    });
    setSelectedEmployee(null);
    setIsEditEmployeeDialogOpen(false);
  };

  // Handle edit employee button click
  const handleEditEmployeeClick = (item: Employee) => {
    setSelectedEmployee(item);
    setEditEmployee({
      employeeId: item.employeeId,
      name: item.name,
      position: item.position,
      department: item.department,
      email: item.email,
      phone: item.phone,
      salary: item.salary.toString(),
      location: item.location,
      status: item.status
    });
    setIsEditEmployeeDialogOpen(true);
  };

  // Handle view employee button click
  const handleViewEmployeeClick = (item: Employee) => {
    setSelectedEmployee(item);
    setIsViewEmployeeDialogOpen(true);
  };

  // Handle view leave details
  const handleViewLeaveClick = (item: LeaveRequest) => {
    setSelectedLeave(item);
    setIsViewLeaveDialogOpen(true);
  };

  // Check if forms are valid
  const isNewEmployeeFormValid = newEmployee.employeeId && newEmployee.name && newEmployee.position && 
    newEmployee.department && newEmployee.email && newEmployee.phone && newEmployee.salary && newEmployee.location;

  const isEditEmployeeFormValid = editEmployee.employeeId && editEmployee.name && editEmployee.position && 
    editEmployee.department && editEmployee.email && editEmployee.phone && editEmployee.salary && editEmployee.location;

  // Check if any filters are active
  const hasActiveFilters = filters.search || 
    (filters.department && filters.department !== 'all') || 
    (filters.status && filters.status !== 'all') || 
    (filters.position && filters.position !== 'all') || 
    (filters.location && filters.location !== 'all');

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
      case 'declined':
        return <Badge variant="destructive">Declined</Badge>;
      case 'postponed':
        return <Badge variant="outline">Postponed</Badge>;
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

  // Add new leave request
  const addNewLeaveRequest = () => {
    const startDate = new Date(newLeaveRequest.startDate);
    const endDate = new Date(newLeaveRequest.endDate);
    const days = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)) + 1;

    const leaveRequest: LeaveRequest = {
      id: Math.max(...leaveRequests.map(item => item.id)) + 1,
      employeeName: newLeaveRequest.employeeName,
      employeeId: newLeaveRequest.employeeId,
      type: newLeaveRequest.type,
      startDate: newLeaveRequest.startDate,
      endDate: newLeaveRequest.endDate,
      days: days,
      status: 'pending',
      reason: newLeaveRequest.reason
    };

    setLeaveRequests(prevRequests => [...prevRequests, leaveRequest]);
    
    setNewLeaveRequest({
      employeeId: '',
      employeeName: '',
      type: '',
      startDate: '',
      endDate: '',
      reason: ''
    });
    setIsNewLeaveDialogOpen(false);
  };

  // Check if new leave request form is valid
  const isNewLeaveRequestFormValid = newLeaveRequest.employeeId && newLeaveRequest.employeeName && 
    newLeaveRequest.type && newLeaveRequest.startDate && newLeaveRequest.endDate && newLeaveRequest.reason;

  // Handle leave approval status change
  const handleLeaveApproval = (leaveId: number, newStatus: string) => {
    setLeaveRequests(prevRequests => 
      prevRequests.map(request => 
        request.id === leaveId 
          ? { ...request, status: newStatus }
          : request
      )
    );
    setIsLeaveApprovalDialogOpen(false);
    setSelectedLeave(null);
  };

  // Handle leave approval button click
  const handleLeaveApprovalClick = (leave: LeaveRequest) => {
    setSelectedLeave(leave);
    setIsLeaveApprovalDialogOpen(true);
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">HRMS & Payroll</h1>
            <p className="text-gray-600 dark:text-gray-400">Manage employees, attendance, leave, and payroll</p>
          </div>
          <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
            <Dialog open={isPayrollReportsDialogOpen} onOpenChange={setIsPayrollReportsDialogOpen}>
              <DialogTrigger asChild>
                <Button variant="outline" className="w-full sm:w-auto flex items-center gap-2">
                  <FileText className="h-4 w-4" />
                  Payroll Report
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[600px]">
                <DialogHeader>
                  <DialogTitle>Payroll Report</DialogTitle>
                </DialogHeader>
                <div className="p-8 text-center text-gray-500">
                  Payroll report functionality will be implemented here.
                </div>
              </DialogContent>
            </Dialog>

            <Dialog open={isAddEmployeeDialogOpen} onOpenChange={setIsAddEmployeeDialogOpen}>
              <DialogTrigger asChild>
                <Button className="w-full sm:w-auto flex items-center gap-2">
                  <UserPlus className="h-4 w-4" />
                  Add Employee
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[600px]">
                <DialogHeader>
                  <DialogTitle>Add New Employee</DialogTitle>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="grid gap-2">
                      <Label htmlFor="employeeId">Employee ID *</Label>
                      <Input
                        id="employeeId"
                        placeholder="e.g., EMP-001"
                        value={newEmployee.employeeId}
                        onChange={(e) => setNewEmployee(prev => ({ ...prev, employeeId: e.target.value }))}
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="name">Full Name *</Label>
                      <Input
                        id="name"
                        placeholder="e.g., John Smith"
                        value={newEmployee.name}
                        onChange={(e) => setNewEmployee(prev => ({ ...prev, name: e.target.value }))}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="grid gap-2">
                      <Label htmlFor="position">Position *</Label>
                      <Input
                        id="position"
                        placeholder="e.g., Equipment Operator"
                        value={newEmployee.position}
                        onChange={(e) => setNewEmployee(prev => ({ ...prev, position: e.target.value }))}
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="department">Department *</Label>
                      <Select 
                        value={newEmployee.department} 
                        onValueChange={(value) => setNewEmployee(prev => ({ ...prev, department: value }))}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select department" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Operations">Operations</SelectItem>
                          <SelectItem value="Maintenance">Maintenance</SelectItem>
                          <SelectItem value="Inventory">Inventory</SelectItem>
                          <SelectItem value="Finance">Finance</SelectItem>
                          <SelectItem value="HR">HR</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="grid gap-2">
                      <Label htmlFor="email">Email *</Label>
                      <Input
                        id="email"
                        type="email"
                        placeholder="e.g., john.smith@nextgen.com"
                        value={newEmployee.email}
                        onChange={(e) => setNewEmployee(prev => ({ ...prev, email: e.target.value }))}
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="phone">Phone *</Label>
                      <Input
                        id="phone"
                        placeholder="e.g., +675 1234 5678"
                        value={newEmployee.phone}
                        onChange={(e) => setNewEmployee(prev => ({ ...prev, phone: e.target.value }))}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="grid gap-2">
                      <Label htmlFor="salary">Salary *</Label>
                      <Input
                        id="salary"
                        type="number"
                        placeholder="e.g., 3500"
                        value={newEmployee.salary}
                        onChange={(e) => setNewEmployee(prev => ({ ...prev, salary: e.target.value }))}
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="location">Location *</Label>
                      <Select 
                        value={newEmployee.location} 
                        onValueChange={(value) => setNewEmployee(prev => ({ ...prev, location: value }))}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select location" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Port Moresby">Port Moresby</SelectItem>
                          <SelectItem value="Lae">Lae</SelectItem>
                          <SelectItem value="Mount Hagen">Mount Hagen</SelectItem>
                          <SelectItem value="Goroka">Goroka</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="grid gap-2">
                    <Label htmlFor="status">Status</Label>
                    <Select 
                      value={newEmployee.status} 
                      onValueChange={(value) => setNewEmployee(prev => ({ ...prev, status: value }))}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="active">Active</SelectItem>
                        <SelectItem value="on-leave">On Leave</SelectItem>
                        <SelectItem value="terminated">Terminated</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="flex justify-end gap-2">
                  <Button 
                    variant="outline" 
                    onClick={() => {
                      setNewEmployee({
                        employeeId: '',
                        name: '',
                        position: '',
                        department: '',
                        email: '',
                        phone: '',
                        salary: '',
                        location: '',
                        status: 'active'
                      });
                      setIsAddEmployeeDialogOpen(false);
                    }}
                  >
                    Cancel
                  </Button>
                  <Button 
                    onClick={addNewEmployee}
                    disabled={!isNewEmployeeFormValid}
                  >
                    Add Employee
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
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
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <CardTitle>Employee Management</CardTitle>
              {hasActiveFilters && (
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={clearFilters}
                  className="flex items-center gap-2"
                >
                  <X className="h-4 w-4" />
                  Clear Filters
                </Button>
              )}
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col md:flex-row gap-2 md:gap-4 mb-6">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input 
                    placeholder="Search employees by name, ID, email, position, or department..." 
                    className="pl-10"
                    value={filters.search}
                    onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
                  />
                </div>
              </div>
              
              <Dialog open={isFilterDialogOpen} onOpenChange={setIsFilterDialogOpen}>
                <DialogTrigger asChild>
                  <Button variant="outline" className="flex items-center gap-2">
                    <Filter className="h-4 w-4" />
                    Filters
                    {hasActiveFilters && (
                      <Badge variant="secondary" className="ml-1">
                        {[
                          filters.department !== 'all' ? filters.department : null,
                          filters.status !== 'all' ? filters.status : null,
                          filters.position !== 'all' ? filters.position : null,
                          filters.location !== 'all' ? filters.location : null
                        ].filter(Boolean).length}
                      </Badge>
                    )}
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[425px]">
                  <DialogHeader>
                    <DialogTitle>Filter Employees</DialogTitle>
                  </DialogHeader>
                  <div className="grid gap-4 py-4">
                    <div className="grid gap-2">
                      <Label htmlFor="department">Department</Label>
                      <Select 
                        value={filters.department} 
                        onValueChange={(value) => setFilters(prev => ({ ...prev, department: value }))}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select department" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All Departments</SelectItem>
                          {departmentsList.map((dept) => (
                            <SelectItem key={dept} value={dept}>
                              {dept}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div className="grid gap-2">
                      <Label htmlFor="status">Status</Label>
                      <Select 
                        value={filters.status} 
                        onValueChange={(value) => setFilters(prev => ({ ...prev, status: value }))}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select status" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All Statuses</SelectItem>
                          {statuses.map((status) => (
                            <SelectItem key={status} value={status}>
                              {status === 'active' ? 'Active' : 
                               status === 'on-leave' ? 'On Leave' : 
                               status === 'terminated' ? 'Terminated' : status}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div className="grid gap-2">
                      <Label htmlFor="position">Position</Label>
                      <Select 
                        value={filters.position} 
                        onValueChange={(value) => setFilters(prev => ({ ...prev, position: value }))}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select position" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All Positions</SelectItem>
                          {positions.map((position) => (
                            <SelectItem key={position} value={position}>
                              {position}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="grid gap-2">
                      <Label htmlFor="location">Location</Label>
                      <Select 
                        value={filters.location} 
                        onValueChange={(value) => setFilters(prev => ({ ...prev, location: value }))}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select location" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All Locations</SelectItem>
                          {locations.map((location) => (
                            <SelectItem key={location} value={location}>
                              {location}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div className="flex justify-end gap-2">
                    <Button variant="outline" onClick={clearFilters}>
                      Clear All
                    </Button>
                    <Button onClick={closeFilterDialog}>
                      Apply Filters
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            </div>

            {/* Active Filters Display */}
            {hasActiveFilters && (
              <div className="flex flex-wrap gap-2 mb-4">
                {filters.department && filters.department !== 'all' && (
                  <Badge variant="secondary" className="flex items-center gap-1">
                    Department: {filters.department}
                    <X 
                      className="h-3 w-3 cursor-pointer" 
                      onClick={() => setFilters(prev => ({ ...prev, department: 'all' }))}
                    />
                  </Badge>
                )}
                {filters.status && filters.status !== 'all' && (
                  <Badge variant="secondary" className="flex items-center gap-1">
                    Status: {filters.status === 'active' ? 'Active' : 
                            filters.status === 'on-leave' ? 'On Leave' : 
                            filters.status === 'terminated' ? 'Terminated' : filters.status}
                    <X 
                      className="h-3 w-3 cursor-pointer" 
                      onClick={() => setFilters(prev => ({ ...prev, status: 'all' }))}
                    />
                  </Badge>
                )}
                {filters.position && filters.position !== 'all' && (
                  <Badge variant="secondary" className="flex items-center gap-1">
                    Position: {filters.position}
                    <X 
                      className="h-3 w-3 cursor-pointer" 
                      onClick={() => setFilters(prev => ({ ...prev, position: 'all' }))}
                    />
                  </Badge>
                )}
                {filters.location && filters.location !== 'all' && (
                  <Badge variant="secondary" className="flex items-center gap-1">
                    Location: {filters.location}
                    <X 
                      className="h-3 w-3 cursor-pointer" 
                      onClick={() => setFilters(prev => ({ ...prev, location: 'all' }))}
                    />
                  </Badge>
                )}
              </div>
            )}

            {/* Results Count */}
            <div className="mb-4 text-sm text-gray-500">
              Showing {filteredEmployees.length} of {employees.length} employees
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
                  {filteredEmployees.length > 0 ? (
                    filteredEmployees.map((employee) => (
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
                            <Button size="sm" variant="outline" onClick={() => handleViewEmployeeClick(employee)}>View</Button>
                            <Button size="sm" variant="outline" onClick={() => handleEditEmployeeClick(employee)}>Edit</Button>
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={7} className="p-8 text-center text-gray-500">
                        No employees found matching your filters.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        {/* Leave Management */}
        <Card>
          <CardHeader>
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
              <CardTitle>Leave Management</CardTitle>
              <Button 
                onClick={() => setIsNewLeaveDialogOpen(true)}
                className="w-full sm:w-auto flex items-center gap-2"
              >
                <Calendar className="h-4 w-4" />
                New Leave Request
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {leaveRequests.map((request) => (
                <div key={request.id} className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 p-4 border rounded-lg">
                  <div className="flex items-start gap-4">
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
                  <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto justify-between sm:justify-end">
                    <div className="text-left sm:text-right">
                      <div className="text-sm font-medium">Reason</div>
                      <div className="text-sm text-gray-500">{request.reason}</div>
                    </div>
                    {getStatusBadge(request.status)}
                    <div className="flex gap-2 w-full sm:w-auto">
                      <Button size="sm" variant="outline" className="flex-1 sm:flex-none" onClick={() => handleViewLeaveClick(request)}>View Details</Button>
                      {request.status === 'pending' && (
                        <Button size="sm" className="flex-1 sm:flex-none bg-blue-600 hover:bg-blue-700" onClick={() => handleLeaveApprovalClick(request)}>
                          Leave Approval
                        </Button>
                      )}
                    </div>
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
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={() => setIsViewTeamDialogOpen(true)}
                    >
                      View Team
                    </Button>
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={() => setIsDepartmentReportsDialogOpen(true)}
                    >
                      Reports
                    </Button>
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
              <Button 
                variant="outline" 
                className="w-full justify-start"
                onClick={() => setIsAddEmployeeDialogOpen(true)}
              >
                <UserPlus className="mr-2 h-4 w-4" />
                Add New Employee
              </Button>
              <Button 
                variant="outline" 
                className="w-full justify-start"
                onClick={() => setIsEmployeeDirectoryDialogOpen(true)}
              >
                <Search className="mr-2 h-4 w-4" />
                Employee Directory
              </Button>
              <Button 
                variant="outline" 
                className="w-full justify-start"
                onClick={() => setIsTrainingRecordsDialogOpen(true)}
              >
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
              <Button 
                variant="outline" 
                className="w-full justify-start"
                onClick={() => setIsAttendanceReportDialogOpen(true)}
              >
                <Clock className="mr-2 h-4 w-4" />
                Attendance Report
              </Button>
              <Button 
                variant="outline" 
                className="w-full justify-start"
                onClick={() => setIsLeaveRequestsDialogOpen(true)}
              >
                <Calendar className="mr-2 h-4 w-4" />
                Leave Requests
              </Button>
              <Button 
                variant="outline" 
                className="w-full justify-start"
                onClick={() => setIsAbsenceAlertsDialogOpen(true)}
              >
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
              <Button 
                variant="outline" 
                className="w-full justify-start"
                onClick={() => setIsProcessPayrollDialogOpen(true)}
              >
                <FileText className="mr-2 h-4 w-4" />
                Process Payroll
              </Button>
              <Button 
                variant="outline" 
                className="w-full justify-start"
                onClick={() => setIsPayrollReportsDialogOpen(true)}
              >
                <DollarSign className="mr-2 h-4 w-4" />
                Payroll Reports
              </Button>
              <Button 
                variant="outline" 
                className="w-full justify-start"
                onClick={() => setIsSalaryAnalyticsDialogOpen(true)}
              >
                <TrendingUp className="mr-2 h-4 w-4" />
                Salary Analytics
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Edit Employee Dialog */}
        <Dialog open={isEditEmployeeDialogOpen} onOpenChange={setIsEditEmployeeDialogOpen}>
          <DialogContent className="sm:max-w-[600px]">
            <DialogHeader>
              <DialogTitle>Edit Employee</DialogTitle>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="editEmployeeId">Employee ID *</Label>
                  <Input
                    id="editEmployeeId"
                    placeholder="e.g., EMP-001"
                    value={editEmployee.employeeId}
                    onChange={(e) => setEditEmployee(prev => ({ ...prev, employeeId: e.target.value }))}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="editName">Full Name *</Label>
                  <Input
                    id="editName"
                    placeholder="e.g., John Smith"
                    value={editEmployee.name}
                    onChange={(e) => setEditEmployee(prev => ({ ...prev, name: e.target.value }))}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="editPosition">Position *</Label>
                  <Input
                    id="editPosition"
                    placeholder="e.g., Equipment Operator"
                    value={editEmployee.position}
                    onChange={(e) => setEditEmployee(prev => ({ ...prev, position: e.target.value }))}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="editDepartment">Department *</Label>
                  <Select 
                    value={editEmployee.department} 
                    onValueChange={(value) => setEditEmployee(prev => ({ ...prev, department: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select department" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Operations">Operations</SelectItem>
                      <SelectItem value="Maintenance">Maintenance</SelectItem>
                      <SelectItem value="Inventory">Inventory</SelectItem>
                      <SelectItem value="Finance">Finance</SelectItem>
                      <SelectItem value="HR">HR</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="editEmail">Email *</Label>
                  <Input
                    id="editEmail"
                    type="email"
                    placeholder="e.g., john.smith@nextgen.com"
                    value={editEmployee.email}
                    onChange={(e) => setEditEmployee(prev => ({ ...prev, email: e.target.value }))}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="editPhone">Phone *</Label>
                  <Input
                    id="editPhone"
                    placeholder="e.g., +675 1234 5678"
                    value={editEmployee.phone}
                    onChange={(e) => setEditEmployee(prev => ({ ...prev, phone: e.target.value }))}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="editSalary">Salary *</Label>
                  <Input
                    id="editSalary"
                    type="number"
                    placeholder="e.g., 3500"
                    value={editEmployee.salary}
                    onChange={(e) => setEditEmployee(prev => ({ ...prev, salary: e.target.value }))}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="editLocation">Location *</Label>
                  <Select 
                    value={editEmployee.location} 
                    onValueChange={(value) => setEditEmployee(prev => ({ ...prev, location: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select location" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Port Moresby">Port Moresby</SelectItem>
                      <SelectItem value="Lae">Lae</SelectItem>
                      <SelectItem value="Mount Hagen">Mount Hagen</SelectItem>
                      <SelectItem value="Goroka">Goroka</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid gap-2">
                <Label htmlFor="editStatus">Status</Label>
                <Select 
                  value={editEmployee.status} 
                  onValueChange={(value) => setEditEmployee(prev => ({ ...prev, status: value }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="on-leave">On Leave</SelectItem>
                    <SelectItem value="terminated">Terminated</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="flex justify-end gap-2">
              <Button 
                variant="outline" 
                onClick={() => {
                  setEditEmployee({
                    employeeId: '',
                    name: '',
                    position: '',
                    department: '',
                    email: '',
                    phone: '',
                    salary: '',
                    location: '',
                    status: 'active'
                  });
                  setSelectedEmployee(null);
                  setIsEditEmployeeDialogOpen(false);
                }}
              >
                Cancel
              </Button>
              <Button 
                onClick={editEmployeeItem}
                disabled={!isEditEmployeeFormValid}
              >
                Save Changes
              </Button>
            </div>
          </DialogContent>
        </Dialog>

        {/* View Employee Dialog */}
        <Dialog open={isViewEmployeeDialogOpen} onOpenChange={setIsViewEmployeeDialogOpen}>
          <DialogContent className="sm:max-w-[600px]">
            <DialogHeader>
              <DialogTitle>Employee Details</DialogTitle>
            </DialogHeader>
            {selectedEmployee ? (
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label>Employee ID</Label>
                    <div className="font-medium">{selectedEmployee.employeeId}</div>
                  </div>
                  <div className="grid gap-2">
                    <Label>Full Name</Label>
                    <div className="font-medium">{selectedEmployee.name}</div>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label>Position</Label>
                    <div className="font-medium">{selectedEmployee.position}</div>
                  </div>
                  <div className="grid gap-2">
                    <Label>Department</Label>
                    <div className="font-medium">{selectedEmployee.department}</div>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label>Email</Label>
                    <div className="font-medium">{selectedEmployee.email}</div>
                  </div>
                  <div className="grid gap-2">
                    <Label>Phone</Label>
                    <div className="font-medium">{selectedEmployee.phone}</div>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label>Salary</Label>
                    <div className="font-medium">{formatCurrency(selectedEmployee.salary)}</div>
                  </div>
                  <div className="grid gap-2">
                    <Label>Location</Label>
                    <div className="font-medium">{selectedEmployee.location}</div>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label>Status</Label>
                    <div className="font-medium">{getStatusBadge(selectedEmployee.status)}</div>
                  </div>
                  <div className="grid gap-2">
                    <Label>Hire Date</Label>
                    <div className="font-medium">{selectedEmployee.hireDate}</div>
                  </div>
                </div>
                <div className="grid gap-2">
                  <Label>Attendance</Label>
                  <div className="font-medium">
                    <span className={`${getAttendanceColor(selectedEmployee.attendance)}`}>
                      {selectedEmployee.attendance}%
                    </span>
                  </div>
                </div>
              </div>
            ) : (
              <div className="p-8 text-center text-gray-500">No employee selected for viewing.</div>
            )}
            <div className="flex justify-end">
              <Button onClick={() => setIsViewEmployeeDialogOpen(false)}>Close</Button>
            </div>
          </DialogContent>
        </Dialog>

        {/* View Leave Details Dialog */}
        <Dialog open={isViewLeaveDialogOpen} onOpenChange={setIsViewLeaveDialogOpen}>
          <DialogContent className="sm:max-w-[600px]">
            <DialogHeader>
              <DialogTitle>Leave Request Details</DialogTitle>
            </DialogHeader>
            {selectedLeave ? (
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label>Employee Name</Label>
                    <div className="font-medium">{selectedLeave.employeeName}</div>
                  </div>
                  <div className="grid gap-2">
                    <Label>Employee ID</Label>
                    <div className="font-medium">{selectedLeave.employeeId}</div>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label>Leave Type</Label>
                    <div className="font-medium">{selectedLeave.type}</div>
                  </div>
                  <div className="grid gap-2">
                    <Label>Status</Label>
                    <div className="font-medium">{getStatusBadge(selectedLeave.status)}</div>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label>Start Date</Label>
                    <div className="font-medium">{selectedLeave.startDate}</div>
                  </div>
                  <div className="grid gap-2">
                    <Label>End Date</Label>
                    <div className="font-medium">{selectedLeave.endDate}</div>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label>Duration</Label>
                    <div className="font-medium">{selectedLeave.days} days</div>
                  </div>
                </div>
                <div className="grid gap-2">
                  <Label>Reason</Label>
                  <div className="font-medium">{selectedLeave.reason}</div>
                </div>
              </div>
            ) : (
              <div className="p-8 text-center text-gray-500">No leave request selected for viewing.</div>
            )}
            <div className="flex justify-end">
              <Button onClick={() => setIsViewLeaveDialogOpen(false)}>Close</Button>
            </div>
          </DialogContent>
        </Dialog>

        {/* New Leave Request Dialog */}
        <Dialog open={isNewLeaveDialogOpen} onOpenChange={setIsNewLeaveDialogOpen}>
          <DialogContent className="sm:max-w-[600px]">
            <DialogHeader>
              <DialogTitle>New Leave Request</DialogTitle>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="newLeaveEmployeeId">Employee ID *</Label>
                  <Input
                    id="newLeaveEmployeeId"
                    placeholder="e.g., EMP-001"
                    value={newLeaveRequest.employeeId}
                    onChange={(e) => setNewLeaveRequest(prev => ({ ...prev, employeeId: e.target.value }))}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="newLeaveEmployeeName">Full Name *</Label>
                  <Input
                    id="newLeaveEmployeeName"
                    placeholder="e.g., John Smith"
                    value={newLeaveRequest.employeeName}
                    onChange={(e) => setNewLeaveRequest(prev => ({ ...prev, employeeName: e.target.value }))}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="newLeaveType">Leave Type *</Label>
                  <Select 
                    value={newLeaveRequest.type} 
                    onValueChange={(value) => setNewLeaveRequest(prev => ({ ...prev, type: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select leave type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Annual Leave">Annual Leave</SelectItem>
                      <SelectItem value="Sick Leave">Sick Leave</SelectItem>
                      <SelectItem value="Maternity Leave">Maternity Leave</SelectItem>
                      <SelectItem value="Paternity Leave">Paternity Leave</SelectItem>
                      <SelectItem value="Bereavement Leave">Bereavement Leave</SelectItem>
                      <SelectItem value="Other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="newLeaveStartDate">Start Date *</Label>
                  <Input
                    id="newLeaveStartDate"
                    type="date"
                    value={newLeaveRequest.startDate}
                    onChange={(e) => setNewLeaveRequest(prev => ({ ...prev, startDate: e.target.value }))}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="newLeaveEndDate">End Date *</Label>
                  <Input
                    id="newLeaveEndDate"
                    type="date"
                    value={newLeaveRequest.endDate}
                    onChange={(e) => setNewLeaveRequest(prev => ({ ...prev, endDate: e.target.value }))}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="newLeaveReason">Reason *</Label>
                  <Textarea
                    id="newLeaveReason"
                    placeholder="Enter leave reason"
                    value={newLeaveRequest.reason}
                    onChange={(e) => setNewLeaveRequest(prev => ({ ...prev, reason: e.target.value }))}
                  />
                </div>
              </div>
            </div>
            <div className="flex justify-end gap-2">
              <Button 
                variant="outline" 
                onClick={() => {
                  setNewLeaveRequest({
                    employeeId: '',
                    employeeName: '',
                    type: '',
                    startDate: '',
                    endDate: '',
                    reason: ''
                  });
                  setIsNewLeaveDialogOpen(false);
                }}
              >
                Cancel
              </Button>
              <Button 
                onClick={addNewLeaveRequest}
                disabled={!isNewLeaveRequestFormValid}
              >
                Submit Leave Request
              </Button>
            </div>
          </DialogContent>
        </Dialog>

        {/* Attendance Report Dialog */}
        <Dialog open={isAttendanceReportDialogOpen} onOpenChange={setIsAttendanceReportDialogOpen}>
          <DialogContent className="sm:max-w-[800px]">
            <DialogHeader>
              <DialogTitle>Attendance Report - March 15, 2024</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="grid grid-cols-3 gap-4 mb-4">
                <div className="p-4 border rounded-lg text-center">
                  <div className="text-2xl font-bold text-green-600">42</div>
                  <div className="text-sm text-gray-500">Present</div>
                </div>
                <div className="p-4 border rounded-lg text-center">
                  <div className="text-2xl font-bold text-yellow-600">2</div>
                  <div className="text-sm text-gray-500">Late</div>
                </div>
                <div className="p-4 border rounded-lg text-center">
                  <div className="text-2xl font-bold text-red-600">1</div>
                  <div className="text-sm text-gray-500">Absent</div>
                </div>
              </div>
              
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left p-3 font-medium">Employee</th>
                      <th className="text-left p-3 font-medium">Check In</th>
                      <th className="text-left p-3 font-medium">Check Out</th>
                      <th className="text-left p-3 font-medium">Hours</th>
                      <th className="text-left p-3 font-medium">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {attendanceRecords.map((record) => (
                      <tr key={record.id} className="border-b">
                        <td className="p-3">
                          <div>
                            <div className="font-medium">{record.employeeName}</div>
                            <div className="text-sm text-gray-500">{record.employeeId}</div>
                          </div>
                        </td>
                        <td className="p-3">{record.checkIn}</td>
                        <td className="p-3">{record.checkOut}</td>
                        <td className="p-3">{record.hours}</td>
                        <td className="p-3">
                          {record.status === 'present' ? (
                            <Badge variant="default">Present</Badge>
                          ) : (
                            <Badge variant="destructive">Absent</Badge>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
            <div className="flex justify-end">
              <Button onClick={() => setIsAttendanceReportDialogOpen(false)}>Close</Button>
            </div>
          </DialogContent>
        </Dialog>

        {/* Leave Requests Dialog */}
        <Dialog open={isLeaveRequestsDialogOpen} onOpenChange={setIsLeaveRequestsDialogOpen}>
          <DialogContent className="sm:max-w-[600px]">
            <DialogHeader>
              <DialogTitle>Leave Requests</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              {leaveRequests.map((request) => (
                <div key={request.id} className="p-4 border rounded-lg">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-medium">{request.employeeName}</div>
                      <div className="text-sm text-gray-500">
                        {request.employeeId} • {request.type} • {request.days} days
                      </div>
                      <div className="text-sm text-gray-500">
                        {request.startDate} to {request.endDate}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline">{getStatusBadge(request.status)}</Badge>
                      <Button size="sm" variant="outline" onClick={() => handleViewLeaveClick(request)}>View Details</Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <div className="flex justify-end">
              <Button onClick={() => setIsLeaveRequestsDialogOpen(false)}>Close</Button>
            </div>
          </DialogContent>
        </Dialog>

        {/* Absence Alerts Dialog */}
        <Dialog open={isAbsenceAlertsDialogOpen} onOpenChange={setIsAbsenceAlertsDialogOpen}>
          <DialogContent className="sm:max-w-[600px]">
            <DialogHeader>
              <DialogTitle>Absence Alerts</DialogTitle>
            </DialogHeader>
            <div className="p-8 text-center text-gray-500">
              Absence alert functionality will be implemented here.
            </div>
            <div className="flex justify-end">
              <Button onClick={() => setIsAbsenceAlertsDialogOpen(false)}>Close</Button>
            </div>
          </DialogContent>
        </Dialog>

        {/* Process Payroll Dialog */}
        <Dialog open={isProcessPayrollDialogOpen} onOpenChange={setIsProcessPayrollDialogOpen}>
          <DialogContent className="sm:max-w-[600px]">
            <DialogHeader>
              <DialogTitle>Process Payroll</DialogTitle>
            </DialogHeader>
            <div className="p-8 text-center text-gray-500">
              Payroll processing functionality will be implemented here.
            </div>
            <div className="flex justify-end">
              <Button onClick={() => setIsProcessPayrollDialogOpen(false)}>Close</Button>
            </div>
          </DialogContent>
        </Dialog>

        {/* Payroll Reports Dialog */}
        <Dialog open={isPayrollReportsDialogOpen} onOpenChange={setIsPayrollReportsDialogOpen}>
          <DialogContent className="sm:max-w-[800px]">
            <DialogHeader>
              <DialogTitle>Payroll Reports - March 2024</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="grid grid-cols-3 gap-4 mb-4">
                <div className="p-4 border rounded-lg text-center">
                  <div className="text-2xl font-bold text-green-600">{formatCurrency(12370)}</div>
                  <div className="text-sm text-gray-500">Total Processed</div>
                </div>
                <div className="p-4 border rounded-lg text-center">
                  <div className="text-2xl font-bold text-yellow-600">{formatCurrency(4020)}</div>
                  <div className="text-sm text-gray-500">Pending</div>
                </div>
                <div className="p-4 border rounded-lg text-center">
                  <div className="text-2xl font-bold text-blue-600">45</div>
                  <div className="text-sm text-gray-500">Total Employees</div>
                </div>
              </div>
              
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left p-3 font-medium">Employee</th>
                      <th className="text-left p-3 font-medium">Period</th>
                      <th className="text-left p-3 font-medium">Basic Salary</th>
                      <th className="text-left p-3 font-medium">Allowances</th>
                      <th className="text-left p-3 font-medium">Deductions</th>
                      <th className="text-left p-3 font-medium">Net Salary</th>
                      <th className="text-left p-3 font-medium">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {payrollRecords.map((record) => (
                      <tr key={record.id} className="border-b">
                        <td className="p-3">
                          <div>
                            <div className="font-medium">{record.employeeName}</div>
                            <div className="text-sm text-gray-500">{record.employeeId}</div>
                          </div>
                        </td>
                        <td className="p-3">{record.period}</td>
                        <td className="p-3">{formatCurrency(record.basicSalary)}</td>
                        <td className="p-3">{formatCurrency(record.allowances)}</td>
                        <td className="p-3">{formatCurrency(record.deductions)}</td>
                        <td className="p-3 font-medium">{formatCurrency(record.netSalary)}</td>
                        <td className="p-3">
                          {record.status === 'processed' ? (
                            <Badge variant="default">Processed</Badge>
                          ) : (
                            <Badge variant="outline">Pending</Badge>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
            <div className="flex justify-end">
              <Button onClick={() => setIsPayrollReportsDialogOpen(false)}>Close</Button>
            </div>
          </DialogContent>
        </Dialog>

        {/* Salary Analytics Dialog */}
        <Dialog open={isSalaryAnalyticsDialogOpen} onOpenChange={setIsSalaryAnalyticsDialogOpen}>
          <DialogContent className="sm:max-w-[600px]">
            <DialogHeader>
              <DialogTitle>Salary Analytics</DialogTitle>
            </DialogHeader>
            <div className="p-8 text-center text-gray-500">
              Salary analytics functionality will be implemented here.
            </div>
            <div className="flex justify-end">
              <Button onClick={() => setIsSalaryAnalyticsDialogOpen(false)}>Close</Button>
            </div>
          </DialogContent>
        </Dialog>

        {/* Employee Directory Dialog */}
        <Dialog open={isEmployeeDirectoryDialogOpen} onOpenChange={setIsEmployeeDirectoryDialogOpen}>
          <DialogContent className="sm:max-w-[600px]">
            <DialogHeader>
              <DialogTitle>Employee Directory</DialogTitle>
            </DialogHeader>
            <div className="p-8 text-center text-gray-500">
              Employee directory functionality will be implemented here.
            </div>
            <div className="flex justify-end">
              <Button onClick={() => setIsEmployeeDirectoryDialogOpen(false)}>Close</Button>
            </div>
          </DialogContent>
        </Dialog>

        {/* Training Records Dialog */}
        <Dialog open={isTrainingRecordsDialogOpen} onOpenChange={setIsTrainingRecordsDialogOpen}>
          <DialogContent className="sm:max-w-[800px]">
            <DialogHeader>
              <DialogTitle>Training Records</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="grid grid-cols-3 gap-4 mb-4">
                <div className="p-4 border rounded-lg text-center">
                  <div className="text-2xl font-bold text-green-600">2</div>
                  <div className="text-sm text-gray-500">Completed</div>
                </div>
                <div className="p-4 border rounded-lg text-center">
                  <div className="text-2xl font-bold text-yellow-600">1</div>
                  <div className="text-sm text-gray-500">In Progress</div>
                </div>
                <div className="p-4 border rounded-lg text-center">
                  <div className="text-2xl font-bold text-blue-600">91.5</div>
                  <div className="text-sm text-gray-500">Avg Score</div>
                </div>
              </div>
              
              <div className="space-y-4">
                {trainingRecords.map((record) => (
                  <div key={record.id} className="p-4 border rounded-lg">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="font-medium">{record.employeeName}</div>
                        <div className="text-sm text-gray-500">{record.employeeId}</div>
                        <div className="text-sm font-medium mt-1">{record.courseName}</div>
                        <div className="text-sm text-gray-500">
                          {record.startDate} to {record.endDate}
                        </div>
                      </div>
                      <div className="text-right">
                        {record.status === 'completed' ? (
                          <Badge variant="default">Completed</Badge>
                        ) : (
                          <Badge variant="outline">In Progress</Badge>
                        )}
                        {record.score > 0 && (
                          <div className="text-sm font-medium mt-1">Score: {record.score}%</div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className="flex justify-end">
              <Button onClick={() => setIsTrainingRecordsDialogOpen(false)}>Close</Button>
            </div>
          </DialogContent>
        </Dialog>

        {/* View Team Dialog */}
        <Dialog open={isViewTeamDialogOpen} onOpenChange={setIsViewTeamDialogOpen}>
          <DialogContent className="sm:max-w-[600px]">
            <DialogHeader>
              <DialogTitle>View Team</DialogTitle>
            </DialogHeader>
            <div className="p-8 text-center text-gray-500">
              View team functionality will be implemented here.
            </div>
            <div className="flex justify-end">
              <Button onClick={() => setIsViewTeamDialogOpen(false)}>Close</Button>
            </div>
          </DialogContent>
        </Dialog>

        {/* Department Reports Dialog */}
        <Dialog open={isDepartmentReportsDialogOpen} onOpenChange={setIsDepartmentReportsDialogOpen}>
          <DialogContent className="sm:max-w-[600px]">
            <DialogHeader>
              <DialogTitle>Department Reports</DialogTitle>
            </DialogHeader>
            <div className="p-8 text-center text-gray-500">
              Department report functionality will be implemented here.
            </div>
            <div className="flex justify-end">
              <Button onClick={() => setIsDepartmentReportsDialogOpen(false)}>Close</Button>
            </div>
          </DialogContent>
        </Dialog>

        {/* Leave Approval Dialog */}
        <Dialog open={isLeaveApprovalDialogOpen} onOpenChange={setIsLeaveApprovalDialogOpen}>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>Leave Approval</DialogTitle>
            </DialogHeader>
            {selectedLeave && (
              <div className="space-y-4">
                <div className="p-4 border rounded-lg bg-gray-50">
                  <div className="font-medium">{selectedLeave.employeeName}</div>
                  <div className="text-sm text-gray-500">{selectedLeave.employeeId}</div>
                  <div className="text-sm font-medium mt-2">{selectedLeave.type}</div>
                  <div className="text-sm text-gray-500">
                    {selectedLeave.startDate} to {selectedLeave.endDate} ({selectedLeave.days} days)
                  </div>
                  <div className="text-sm mt-2">
                    <span className="font-medium">Reason:</span> {selectedLeave.reason}
                  </div>
                </div>
                
                <div className="space-y-3">
                  <div className="text-sm font-medium">Select Approval Status:</div>
                  <div className="grid grid-cols-3 gap-3">
                    <Button 
                      variant="outline" 
                      className="h-12 flex flex-col items-center justify-center gap-1"
                      onClick={() => handleLeaveApproval(selectedLeave.id, 'approved')}
                    >
                      <CheckCircle className="h-4 w-4 text-green-600" />
                      <span className="text-xs">Approve</span>
                    </Button>
                    <Button 
                      variant="outline" 
                      className="h-12 flex flex-col items-center justify-center gap-1"
                      onClick={() => handleLeaveApproval(selectedLeave.id, 'declined')}
                    >
                      <X className="h-4 w-4 text-red-600" />
                      <span className="text-xs">Decline</span>
                    </Button>
                    <Button 
                      variant="outline" 
                      className="h-12 flex flex-col items-center justify-center gap-1"
                      onClick={() => handleLeaveApproval(selectedLeave.id, 'postponed')}
                    >
                      <Clock className="h-4 w-4 text-yellow-600" />
                      <span className="text-xs">Postpone</span>
                    </Button>
                  </div>
                </div>
              </div>
            )}
            <div className="flex justify-end">
              <Button 
                variant="outline" 
                onClick={() => {
                  setIsLeaveApprovalDialogOpen(false);
                  setSelectedLeave(null);
                }}
              >
                Cancel
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  );
};

export default HRMSPage; 