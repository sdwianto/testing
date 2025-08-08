import React, { useState } from 'react';
import { DashboardLayout } from '@/components/layouts/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Wrench, 
  Clock, 
  AlertTriangle, 
  CheckCircle, 
  Plus,
  Search,
  Filter,
  Calendar,
  Settings,
  FileText,
  DollarSign,
  MapPin,
  User
} from 'lucide-react';

interface MaintenanceRecord {
  id: number;
  equipmentName: string;
  equipmentCode: string;
  maintenanceType: string;
  description: string;
  scheduledDate: string;
  status: string;
  assignedTechnician: string;
  estimatedCost: number;
  priority: string;
  progressDetails?: string;
  actualCost?: number;
  completionDate?: string;
}

const MaintenancePage: React.FC = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [isAddMaintenanceOpen, setIsAddMaintenanceOpen] = useState(false);
  const [isDetailDialogOpen, setIsDetailDialogOpen] = useState(false);
  const [isProgressDialogOpen, setIsProgressDialogOpen] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState<MaintenanceRecord | null>(null);
  const [progressDetails, setProgressDetails] = useState('');
  const [actualCost, setActualCost] = useState('');

  // Form state for adding new maintenance
  const [newMaintenance, setNewMaintenance] = useState({
    equipment: '',
    maintenanceType: '',
    description: '',
    scheduledDate: '',
    priority: '',
    assignedTechnician: '',
    estimatedCost: ''
  });

  // Mock data for demonstration
  const [maintenanceStats, setMaintenanceStats] = useState({
    totalEquipment: 45,
    scheduledMaintenance: 12,
    overdueMaintenance: 3,
    inProgress: 5,
    completedThisMonth: 28,
    totalCost: 125000
  });

  const [maintenanceRecords, setMaintenanceRecords] = useState<MaintenanceRecord[]>([
    {
      id: 1,
      equipmentName: 'Excavator EX-001',
      equipmentCode: 'EX-001',
      maintenanceType: 'PREVENTIVE',
      description: 'Regular engine oil change and filter replacement',
      scheduledDate: '2024-01-15',
      status: 'SCHEDULED',
      assignedTechnician: 'John Smith',
      estimatedCost: 2500,
      priority: 'MEDIUM'
    },
    {
      id: 2,
      equipmentName: 'Bulldozer BD-003',
      equipmentCode: 'BD-003',
      maintenanceType: 'CORRECTIVE',
      description: 'Hydraulic system repair - leak detected',
      scheduledDate: '2024-01-10',
      status: 'IN_PROGRESS',
      assignedTechnician: 'Mike Johnson',
      estimatedCost: 8500,
      priority: 'HIGH',
      progressDetails: 'Hydraulic fluid drained, new seals installed, system pressure tested',
      actualCost: 8200
    },
    {
      id: 3,
      equipmentName: 'Crane CR-002',
      equipmentCode: 'CR-002',
      maintenanceType: 'INSPECTION',
      description: 'Annual safety inspection and certification',
      scheduledDate: '2024-01-20',
      status: 'SCHEDULED',
      assignedTechnician: 'Sarah Wilson',
      estimatedCost: 1500,
      priority: 'HIGH'
    },
    {
      id: 4,
      equipmentName: 'Loader LD-005',
      equipmentCode: 'LD-005',
      maintenanceType: 'EMERGENCY',
      description: 'Engine failure - immediate repair required',
      scheduledDate: '2024-01-08',
      status: 'IN_PROGRESS',
      assignedTechnician: 'David Brown',
      estimatedCost: 15000,
      priority: 'CRITICAL',
      progressDetails: 'Engine disassembled, damaged piston identified, replacement parts ordered',
      actualCost: 14500
    },
    {
      id: 5,
      equipmentName: 'Drill Rig DR-001',
      equipmentCode: 'DR-001',
      maintenanceType: 'PREVENTIVE',
      description: 'Monthly lubrication and component check',
      scheduledDate: '2024-01-12',
      status: 'COMPLETED',
      assignedTechnician: 'Lisa Chen',
      estimatedCost: 800,
      priority: 'LOW',
      progressDetails: 'All lubrication points serviced, components inspected and cleaned',
      actualCost: 750,
      completionDate: '2024-01-12'
    }
  ]);

  const upcomingMaintenance = [
    { id: 1, equipment: 'Excavator EX-002', date: '2024-01-18', type: 'PREVENTIVE' },
    { id: 2, equipment: 'Bulldozer BD-001', date: '2024-01-22', type: 'INSPECTION' },
    { id: 3, equipment: 'Crane CR-004', date: '2024-01-25', type: 'PREVENTIVE' },
    { id: 4, equipment: 'Loader LD-003', date: '2024-01-28', type: 'CORRECTIVE' }
  ];

  const handleRecordClick = (record: MaintenanceRecord) => {
    setSelectedRecord(record);
    setIsDetailDialogOpen(true);
  };

  const handleStartWork = (recordId: number) => {
    setMaintenanceRecords(prev => prev.map(record => 
      record.id === recordId 
        ? { ...record, status: 'IN_PROGRESS' }
        : record
    ));
    
    // Update stats
    setMaintenanceStats(prev => ({
      ...prev,
      scheduledMaintenance: prev.scheduledMaintenance - 1,
      inProgress: prev.inProgress + 1
    }));
  };

  const handleUpdateProgress = (record: MaintenanceRecord) => {
    setSelectedRecord(record);
    setProgressDetails(record.progressDetails ?? '');
    setActualCost(record.actualCost?.toString() ?? '');
    setIsProgressDialogOpen(true);
  };

  const handleSaveProgress = () => {
    if (!selectedRecord) return;

    setMaintenanceRecords(prev => prev.map(record => 
      record.id === selectedRecord.id 
        ? { 
            ...record, 
            progressDetails: progressDetails,
            actualCost: actualCost ? parseFloat(actualCost) : undefined
          }
        : record
    ));

    setIsProgressDialogOpen(false);
    setProgressDetails('');
    setActualCost('');
    setSelectedRecord(null);
  };

  const handleComplete = (recordId: number) => {
    setMaintenanceRecords(prev => prev.map(record => 
      record.id === recordId 
        ? { 
            ...record, 
            status: 'COMPLETED',
            completionDate: new Date().toISOString().split('T')[0]
          }
        : record
    ));
    
    // Update stats
    setMaintenanceStats(prev => ({
      ...prev,
      inProgress: prev.inProgress - 1,
      completedThisMonth: prev.completedThisMonth + 1
    }));
  };

  // Handle form input changes
  const handleFormChange = (field: string, value: string) => {
    setNewMaintenance(prev => ({
      ...prev,
      [field]: value
    }));
  };

  // Reset form when dialog opens/closes
  const handleDialogChange = (open: boolean) => {
    setIsAddMaintenanceOpen(open);
    if (!open) {
      // Reset form when closing
      setNewMaintenance({
        equipment: '',
        maintenanceType: '',
        description: '',
        scheduledDate: '',
        priority: '',
        assignedTechnician: '',
        estimatedCost: ''
      });
    }
  };

  // Handle form submission
  const handleScheduleMaintenance = () => {
    // Validate required fields
    if (!newMaintenance.equipment || !newMaintenance.maintenanceType || 
        !newMaintenance.description || !newMaintenance.scheduledDate || 
        !newMaintenance.priority || !newMaintenance.assignedTechnician || 
        !newMaintenance.estimatedCost) {
      alert('Please fill in all required fields');
      return;
    }

    // Create new maintenance record
    const newRecord: MaintenanceRecord = {
      id: Math.max(...maintenanceRecords.map(r => r.id)) + 1, // Generate new ID
      equipmentName: newMaintenance.equipment,
      equipmentCode: newMaintenance.equipment.split(' ').pop() ?? '',
      maintenanceType: newMaintenance.maintenanceType.toUpperCase(),
      description: newMaintenance.description,
      scheduledDate: newMaintenance.scheduledDate,
      status: 'SCHEDULED',
      assignedTechnician: newMaintenance.assignedTechnician,
      estimatedCost: parseFloat(newMaintenance.estimatedCost),
      priority: newMaintenance.priority.toUpperCase()
    };

    // Add to maintenance records
    setMaintenanceRecords(prev => [newRecord, ...prev]);

    // Update stats
    setMaintenanceStats(prev => ({
      ...prev,
      scheduledMaintenance: prev.scheduledMaintenance + 1
    }));

    // Reset form and close dialog
    setNewMaintenance({
      equipment: '',
      maintenanceType: '',
      description: '',
      scheduledDate: '',
      priority: '',
      assignedTechnician: '',
      estimatedCost: ''
    });
    setIsAddMaintenanceOpen(false);

    // Show success message
    alert('Maintenance scheduled successfully!');
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'SCHEDULED': return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
      case 'IN_PROGRESS': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
      case 'COMPLETED': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'CANCELLED': return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'CRITICAL': return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      case 'HIGH': return 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200';
      case 'MEDIUM': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
      case 'LOW': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'PREVENTIVE': return <Settings className="h-4 w-4" />;
      case 'CORRECTIVE': return <Wrench className="h-4 w-4" />;
      case 'EMERGENCY': return <AlertTriangle className="h-4 w-4" />;
      case 'INSPECTION': return <FileText className="h-4 w-4" />;
      default: return <Wrench className="h-4 w-4" />;
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Maintenance Management</h1>
            <p className="text-gray-600 dark:text-gray-400">Equipment maintenance scheduling and tracking</p>
          </div>
          <Dialog open={isAddMaintenanceOpen} onOpenChange={handleDialogChange}>
            <DialogTrigger asChild>
              <Button className="flex items-center gap-2">
                <Plus className="h-4 w-4" />
                Add Maintenance
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Schedule New Maintenance</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="equipment">Equipment</Label>
                    <Select value={newMaintenance.equipment} onValueChange={(value) => handleFormChange('equipment', value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select equipment" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Excavator EX-001">Excavator EX-001</SelectItem>
                        <SelectItem value="Bulldozer BD-003">Bulldozer BD-003</SelectItem>
                        <SelectItem value="Crane CR-002">Crane CR-002</SelectItem>
                        <SelectItem value="Loader LD-005">Loader LD-005</SelectItem>
                        <SelectItem value="Drill Rig DR-001">Drill Rig DR-001</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="type">Maintenance Type</Label>
                    <Select value={newMaintenance.maintenanceType} onValueChange={(value) => handleFormChange('maintenanceType', value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="preventive">Preventive</SelectItem>
                        <SelectItem value="corrective">Corrective</SelectItem>
                        <SelectItem value="emergency">Emergency</SelectItem>
                        <SelectItem value="inspection">Inspection</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div>
                  <Label htmlFor="description">Description</Label>
                  <Textarea 
                    placeholder="Describe the maintenance work..." 
                    value={newMaintenance.description}
                    onChange={(e) => handleFormChange('description', e.target.value)}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="scheduledDate">Scheduled Date</Label>
                    <Input 
                      type="date" 
                      value={newMaintenance.scheduledDate}
                      onChange={(e) => handleFormChange('scheduledDate', e.target.value)}
                    />
                  </div>
                  <div>
                    <Label htmlFor="priority">Priority</Label>
                    <Select value={newMaintenance.priority} onValueChange={(value) => handleFormChange('priority', value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select priority" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="low">Low</SelectItem>
                        <SelectItem value="medium">Medium</SelectItem>
                        <SelectItem value="high">High</SelectItem>
                        <SelectItem value="critical">Critical</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="technician">Assigned Technician</Label>
                    <Select value={newMaintenance.assignedTechnician} onValueChange={(value) => handleFormChange('assignedTechnician', value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select technician" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="John Smith">John Smith</SelectItem>
                        <SelectItem value="Mike Johnson">Mike Johnson</SelectItem>
                        <SelectItem value="Sarah Wilson">Sarah Wilson</SelectItem>
                        <SelectItem value="David Brown">David Brown</SelectItem>
                        <SelectItem value="Lisa Chen">Lisa Chen</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="estimatedCost">Estimated Cost</Label>
                    <Input 
                      type="number" 
                      placeholder="Enter cost" 
                      value={newMaintenance.estimatedCost}
                      onChange={(e) => handleFormChange('estimatedCost', e.target.value)}
                    />
                  </div>
                </div>
                <div className="flex justify-end gap-2">
                  <Button variant="outline" onClick={() => handleDialogChange(false)}>
                    Cancel
                  </Button>
                  <Button onClick={handleScheduleMaintenance}>Schedule Maintenance</Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {/* Maintenance Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Equipment</CardTitle>
              <Wrench className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{maintenanceStats.totalEquipment}</div>
              <p className="text-xs text-muted-foreground">Active equipment</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Scheduled</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{maintenanceStats.scheduledMaintenance}</div>
              <p className="text-xs text-muted-foreground">
                {maintenanceStats.overdueMaintenance} overdue
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">In Progress</CardTitle>
              <Wrench className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{maintenanceStats.inProgress}</div>
              <p className="text-xs text-muted-foreground">Active maintenance</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Monthly Cost</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">${maintenanceStats.totalCost.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">
                {maintenanceStats.completedThisMonth} completed this month
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Main Content Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
          <TabsList>
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="scheduled">Scheduled</TabsTrigger>
            <TabsTrigger value="in-progress">In Progress</TabsTrigger>
            <TabsTrigger value="completed">Completed</TabsTrigger>
            <TabsTrigger value="reports">Reports</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-4">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Maintenance Records */}
              <div className="lg:col-span-2">
                <Card>
                  <CardHeader>
                    <CardTitle>Recent Maintenance Records</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {maintenanceRecords.map((record) => (
                        <div 
                          key={record.id} 
                          className="flex items-center justify-between p-4 rounded-lg border cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                          onClick={() => handleRecordClick(record)}
                        >
                          <div className="flex items-center gap-4">
                            {getTypeIcon(record.maintenanceType)}
                            <div>
                              <h4 className="font-medium">{record.equipmentName}</h4>
                              <p className="text-sm text-muted-foreground">{record.description}</p>
                              <div className="flex items-center gap-2 mt-1">
                                <Calendar className="h-3 w-3" />
                                <span className="text-xs">{record.scheduledDate}</span>
                                <User className="h-3 w-3 ml-2" />
                                <span className="text-xs">{record.assignedTechnician}</span>
                              </div>
                            </div>
                          </div>
                          <div className="flex flex-col items-end gap-2">
                            <Badge className={getStatusColor(record.status)}>
                              {record.status}
                            </Badge>
                            <Badge className={getPriorityColor(record.priority)}>
                              {record.priority}
                            </Badge>
                            <p className="text-sm font-medium">${record.estimatedCost.toLocaleString()}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Upcoming Maintenance */}
              <div>
                <Card>
                  <CardHeader>
                    <CardTitle>Upcoming Maintenance</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {upcomingMaintenance.map((item) => (
                        <div key={item.id} className="flex items-center justify-between p-3 rounded-lg border">
                          <div>
                            <h4 className="font-medium text-sm">{item.equipment}</h4>
                            <p className="text-xs text-muted-foreground">{item.date}</p>
                          </div>
                          <Badge variant="outline">{item.type}</Badge>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                {/* Quick Actions */}
                <Card className="mt-4">
                  <CardHeader>
                    <CardTitle>Quick Actions</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <Button variant="outline" className="w-full justify-start">
                      <Plus className="h-4 w-4 mr-2" />
                      Schedule Maintenance
                    </Button>
                    <Button variant="outline" className="w-full justify-start">
                      <Search className="h-4 w-4 mr-2" />
                      Search Equipment
                    </Button>
                    <Button variant="outline" className="w-full justify-start">
                      <Filter className="h-4 w-4 mr-2" />
                      Filter Records
                    </Button>
                    <Button variant="outline" className="w-full justify-start">
                      <FileText className="h-4 w-4 mr-2" />
                      Generate Report
                    </Button>
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="scheduled" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Scheduled Maintenance</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {maintenanceRecords.filter(r => r.status === 'SCHEDULED').map((record) => (
                    <div key={record.id} className="flex items-center justify-between p-4 rounded-lg border">
                      <div className="flex items-center gap-4">
                        {getTypeIcon(record.maintenanceType)}
                        <div>
                          <h4 className="font-medium">{record.equipmentName}</h4>
                          <p className="text-sm text-muted-foreground">{record.description}</p>
                          <div className="flex items-center gap-2 mt-1">
                            <Calendar className="h-3 w-3" />
                            <span className="text-xs">{record.scheduledDate}</span>
                            <User className="h-3 w-3 ml-2" />
                            <span className="text-xs">{record.assignedTechnician}</span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge className={getPriorityColor(record.priority)}>
                          {record.priority}
                        </Badge>
                        <Button size="sm" onClick={() => handleStartWork(record.id)}>
                          Start Work
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="in-progress" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Maintenance In Progress</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {maintenanceRecords.filter(r => r.status === 'IN_PROGRESS').map((record) => (
                    <div key={record.id} className="flex items-center justify-between p-4 rounded-lg border">
                      <div className="flex items-center gap-4">
                        {getTypeIcon(record.maintenanceType)}
                        <div>
                          <h4 className="font-medium">{record.equipmentName}</h4>
                          <p className="text-sm text-muted-foreground">{record.description}</p>
                          <div className="flex items-center gap-2 mt-1">
                            <User className="h-3 w-3" />
                            <span className="text-xs">{record.assignedTechnician}</span>
                            <MapPin className="h-3 w-3 ml-2" />
                            <span className="text-xs">Workshop A</span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge className={getPriorityColor(record.priority)}>
                          {record.priority}
                        </Badge>
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => handleUpdateProgress(record)}
                        >
                          Update Progress
                        </Button>
                        <Button 
                          size="sm" 
                          disabled={!record.progressDetails}
                          onClick={() => handleComplete(record.id)}
                        >
                          Complete
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="completed" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Completed Maintenance</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {maintenanceRecords.filter(r => r.status === 'COMPLETED').map((record) => (
                    <div key={record.id} className="flex items-center justify-between p-4 rounded-lg border">
                      <div className="flex items-center gap-4">
                        <CheckCircle className="h-4 w-4 text-green-500" />
                        <div>
                          <h4 className="font-medium">{record.equipmentName}</h4>
                          <p className="text-sm text-muted-foreground">{record.description}</p>
                          <div className="flex items-center gap-2 mt-1">
                            <User className="h-3 w-3" />
                            <span className="text-xs">{record.assignedTechnician}</span>
                            <Calendar className="h-3 w-3 ml-2" />
                            <span className="text-xs">Completed: {record.completionDate}</span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                          COMPLETED
                        </Badge>
                        <p className="text-sm font-medium">${record.actualCost?.toLocaleString() ?? record.estimatedCost.toLocaleString()}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="reports" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Maintenance Cost Analysis</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between">
                      <span>Preventive Maintenance</span>
                      <span className="font-medium">$45,000</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Corrective Maintenance</span>
                      <span className="font-medium">$65,000</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Emergency Repairs</span>
                      <span className="font-medium">$15,000</span>
                    </div>
                    <div className="border-t pt-2">
                      <div className="flex justify-between font-bold">
                        <span>Total</span>
                        <span>$125,000</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Equipment Downtime</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between">
                      <span>Excavator EX-001</span>
                      <span className="font-medium">2.5 days</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Bulldozer BD-003</span>
                      <span className="font-medium">1.8 days</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Crane CR-002</span>
                      <span className="font-medium">0.5 days</span>
                    </div>
                    <div className="border-t pt-2">
                      <div className="flex justify-between font-bold">
                        <span>Average</span>
                        <span>1.6 days</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>

        {/* Maintenance Record Detail Dialog */}
        <Dialog open={isDetailDialogOpen} onOpenChange={setIsDetailDialogOpen}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Maintenance Record Details</DialogTitle>
            </DialogHeader>
            {selectedRecord && (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-sm font-medium">Equipment</Label>
                    <p className="text-sm text-muted-foreground">{selectedRecord.equipmentName}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium">Equipment Code</Label>
                    <p className="text-sm text-muted-foreground">{selectedRecord.equipmentCode}</p>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-sm font-medium">Maintenance Type</Label>
                    <div className="flex items-center gap-2 mt-1">
                      {getTypeIcon(selectedRecord.maintenanceType)}
                      <Badge variant="outline">{selectedRecord.maintenanceType}</Badge>
                    </div>
                  </div>
                  <div>
                    <Label className="text-sm font-medium">Priority</Label>
                    <Badge className={getPriorityColor(selectedRecord.priority)}>
                      {selectedRecord.priority}
                    </Badge>
                  </div>
                </div>
                <div>
                  <Label className="text-sm font-medium">Description</Label>
                  <p className="text-sm text-muted-foreground mt-1">{selectedRecord.description}</p>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-sm font-medium">Scheduled Date</Label>
                    <p className="text-sm text-muted-foreground">{selectedRecord.scheduledDate}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium">Assigned Technician</Label>
                    <p className="text-sm text-muted-foreground">{selectedRecord.assignedTechnician}</p>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-sm font-medium">Estimated Cost</Label>
                    <p className="text-sm text-muted-foreground">${selectedRecord.estimatedCost.toLocaleString()}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium">Status</Label>
                    <Badge className={getStatusColor(selectedRecord.status)}>
                      {selectedRecord.status}
                    </Badge>
                  </div>
                </div>
                {selectedRecord.progressDetails && (
                  <div>
                    <Label className="text-sm font-medium">Progress Details</Label>
                    <p className="text-sm text-muted-foreground mt-1">{selectedRecord.progressDetails}</p>
                  </div>
                )}
                {selectedRecord.actualCost && (
                  <div>
                    <Label className="text-sm font-medium">Actual Cost</Label>
                    <p className="text-sm text-muted-foreground">${selectedRecord.actualCost.toLocaleString()}</p>
                  </div>
                )}
                {selectedRecord.completionDate && (
                  <div>
                    <Label className="text-sm font-medium">Completion Date</Label>
                    <p className="text-sm text-muted-foreground">{selectedRecord.completionDate}</p>
                  </div>
                )}
              </div>
            )}
          </DialogContent>
        </Dialog>

        {/* Update Progress Dialog */}
        <Dialog open={isProgressDialogOpen} onOpenChange={setIsProgressDialogOpen}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Update Maintenance Progress</DialogTitle>
            </DialogHeader>
            {selectedRecord && (
              <div className="space-y-4">
                <div>
                  <Label className="text-sm font-medium">Equipment</Label>
                  <p className="text-sm text-muted-foreground">{selectedRecord.equipmentName}</p>
                </div>
                <div>
                  <Label htmlFor="progressDetails" className="text-sm font-medium">Progress Details</Label>
                  <Textarea 
                    id="progressDetails"
                    placeholder="Describe the current progress and work completed..."
                    value={progressDetails}
                    onChange={(e) => setProgressDetails(e.target.value)}
                    rows={4}
                  />
                </div>
                <div>
                  <Label htmlFor="actualCost" className="text-sm font-medium">Actual Cost (Optional)</Label>
                  <Input 
                    id="actualCost"
                    type="number" 
                    placeholder="Enter actual cost if different from estimated"
                    value={actualCost}
                    onChange={(e) => setActualCost(e.target.value)}
                  />
                </div>
                <div className="flex justify-end gap-2">
                  <Button variant="outline" onClick={() => setIsProgressDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button onClick={handleSaveProgress}>
                    Save Progress
                  </Button>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  );
};

export default MaintenancePage;
