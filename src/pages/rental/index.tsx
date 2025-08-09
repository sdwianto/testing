import React, { useState, useMemo } from 'react';
import { DashboardLayout } from '@/components/layouts/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { 
  Wrench, 
  Plus, 
  Search, 
  Filter,
  AlertTriangle,
  CheckCircle,
  Clock,
  Calendar,
  DollarSign,
  Users,
  Truck,
  X,
  Eye,
  Edit
} from 'lucide-react';

interface Equipment {
  id: number;
  code: string;
  name: string;
  type: string;
  status: string;
  currentRental: string | null;
  rentalRate: number;
  maintenanceDue: string;
  location: string;
  lastMaintenance: string;
}

interface MaintenanceRecord {
  id: number;
  equipmentCode: string;
  equipmentName: string;
  type: string;
  status: string;
  scheduledDate: string;
  technician: string;
  description: string;
}

interface FilterState {
  search: string;
  type: string;
  status: string;
  location: string;
  rentalRate: string;
}

const RentalPage: React.FC = () => {
  // Filter state
  const [filters, setFilters] = useState<FilterState>({
    search: '',
    type: 'all',
    status: 'all',
    location: 'all',
    rentalRate: ''
  });

  // Dialog state
  const [isFilterDialogOpen, setIsFilterDialogOpen] = useState(false);
  const [isNewRentalDialogOpen, setIsNewRentalDialogOpen] = useState(false);
  const [isEditEquipmentDialogOpen, setIsEditEquipmentDialogOpen] = useState(false);
  const [isViewEquipmentDialogOpen, setIsViewEquipmentDialogOpen] = useState(false);
  const [isViewMaintenanceDialogOpen, setIsViewMaintenanceDialogOpen] = useState(false);
  const [isScheduleMaintenanceDialogOpen, setIsScheduleMaintenanceDialogOpen] = useState(false);
  const [selectedEquipment, setSelectedEquipment] = useState<Equipment | null>(null);
  const [selectedMaintenance, setSelectedMaintenance] = useState<MaintenanceRecord | null>(null);

  // Mock data for demonstration
  const [equipment, setEquipment] = useState<Equipment[]>([
    {
      id: 1,
      code: 'EXC-001',
      name: 'Excavator PC200',
      type: 'Heavy Equipment',
      status: 'rented',
      currentRental: 'Highlands Construction',
      rentalRate: 2500,
      maintenanceDue: '2024-03-15',
      location: 'Site A',
      lastMaintenance: '2024-02-15'
    },
    {
      id: 2,
      code: 'BD-002',
      name: 'Bulldozer D6',
      type: 'Heavy Equipment',
      status: 'available',
      currentRental: null,
      rentalRate: 1800,
      maintenanceDue: '2024-03-20',
      location: 'Warehouse',
      lastMaintenance: '2024-02-20'
    },
    {
      id: 3,
      code: 'CR-003',
      name: 'Crane 50T',
      type: 'Lifting Equipment',
      status: 'maintenance',
      currentRental: null,
      rentalRate: 3200,
      maintenanceDue: '2024-03-10',
      location: 'Service Center',
      lastMaintenance: '2024-03-05'
    },
    {
      id: 4,
      code: 'GR-004',
      name: 'Grader CAT 12',
      type: 'Heavy Equipment',
      status: 'rented',
      currentRental: 'Mining Corp PNG',
      rentalRate: 2200,
      maintenanceDue: '2024-03-25',
      location: 'Site B',
      lastMaintenance: '2024-02-25'
    }
  ]);

  const [maintenanceRecords, setMaintenanceRecords] = useState<MaintenanceRecord[]>([
    {
      id: 1,
      equipmentCode: 'EXC-001',
      equipmentName: 'Excavator PC200',
      type: 'Preventive',
      status: 'scheduled',
      scheduledDate: '2024-03-15',
      technician: 'John Smith',
      description: 'Regular maintenance and oil change'
    },
    {
      id: 2,
      equipmentCode: 'CR-003',
      equipmentName: 'Crane 50T',
      type: 'Repair',
      status: 'in-progress',
      scheduledDate: '2024-03-10',
      technician: 'Mike Johnson',
      description: 'Hydraulic system repair'
    },
    {
      id: 3,
      equipmentCode: 'BD-002',
      equipmentName: 'Bulldozer D6',
      type: 'Preventive',
      status: 'scheduled',
      scheduledDate: '2024-03-20',
      technician: 'David Wilson',
      description: 'Engine inspection and filter replacement'
    }
  ]);

  // Get unique values for filter options
  const types = useMemo(() => 
    Array.from(new Set(equipment.map(item => item.type))), 
    [equipment]
  );

  const locations = useMemo(() => 
    Array.from(new Set(equipment.map(item => item.location))), 
    [equipment]
  );

  const statuses = useMemo(() => 
    Array.from(new Set(equipment.map(item => item.status))), 
    [equipment]
  );

  // Filtered equipment
  const filteredEquipment = useMemo(() => {
    return equipment.filter(item => {
      // Search filter
      const searchLower = filters.search.toLowerCase();
      const matchesSearch = !filters.search || 
        item.name.toLowerCase().includes(searchLower) ||
        item.code.toLowerCase().includes(searchLower) || 
        item.type.toLowerCase().includes(searchLower) ||
        item.location.toLowerCase().includes(searchLower) ||
        item.status.toLowerCase().includes(searchLower);

      // Type filter
      const matchesType = !filters.type || filters.type === 'all' || item.type === filters.type;
      
      // Status filter
      const matchesStatus = !filters.status || filters.status === 'all' || item.status === filters.status;
      
      // Location filter
      const matchesLocation = !filters.location || filters.location === 'all' || item.location === filters.location;
      
      // Rental rate filter
      const matchesRentalRate = !filters.rentalRate || item.rentalRate.toString() === filters.rentalRate;

      return matchesSearch && matchesType && matchesStatus && matchesLocation && matchesRentalRate;
    });
  }, [equipment, filters]);

  // Clear all filters
  const clearFilters = () => {
    setFilters({
      search: '',
      type: 'all',
      status: 'all',
      location: 'all',
      rentalRate: ''
    });
  };

  // Close filter dialog
  const closeFilterDialog = () => {
    setIsFilterDialogOpen(false);
  };

  // New rental form state
  const [newRental, setNewRental] = useState({
    code: '',
    name: '',
    type: '',
    rentalRate: '',
    location: '',
    status: 'available'
  });

  // Edit equipment form state
  const [editEquipment, setEditEquipment] = useState({
    code: '',
    name: '',
    type: '',
    rentalRate: '',
    location: '',
    status: 'available'
  });

  // Schedule maintenance form state
  const [scheduleMaintenance, setScheduleMaintenance] = useState({
    equipmentCode: '',
    equipmentName: '',
    type: 'Preventive',
    scheduledDate: '',
    technician: '',
    description: ''
  });

  // Add new rental
  const addNewRental = () => {
    const newEquipment: Equipment = {
      id: Math.max(...equipment.map(item => item.id)) + 1,
      code: newRental.code,
      name: newRental.name,
      type: newRental.type,
      status: newRental.status,
      currentRental: null,
      rentalRate: parseInt(newRental.rentalRate) || 0,
      maintenanceDue: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0] ?? '',
      location: newRental.location,
      lastMaintenance: new Date().toISOString().split('T')[0] ?? ''
    };

    setEquipment(prevEquipment => [...prevEquipment, newEquipment]);
    
    setNewRental({
      code: '',
      name: '',
      type: '',
      rentalRate: '',
      location: '',
      status: 'available'
    });
    setIsNewRentalDialogOpen(false);
  };

  // Edit equipment
  const editEquipmentItem = () => {
    if (!selectedEquipment) return;

    const updatedEquipment: Equipment = {
      ...selectedEquipment,
      code: editEquipment.code,
      name: editEquipment.name,
      type: editEquipment.type,
      rentalRate: parseInt(editEquipment.rentalRate) || 0,
      location: editEquipment.location,
      status: editEquipment.status
    };

    setEquipment(prevEquipment => 
      prevEquipment.map(item => item.id === selectedEquipment.id ? updatedEquipment : item)
    );
    
    setEditEquipment({
      code: '',
      name: '',
      type: '',
      rentalRate: '',
      location: '',
      status: 'available'
    });
    setSelectedEquipment(null);
    setIsEditEquipmentDialogOpen(false);
  };

  // Schedule maintenance
  const scheduleNewMaintenance = () => {
    const newMaintenance: MaintenanceRecord = {
      id: Math.max(...maintenanceRecords.map(item => item.id)) + 1,
      equipmentCode: scheduleMaintenance.equipmentCode,
      equipmentName: scheduleMaintenance.equipmentName,
      type: scheduleMaintenance.type,
      status: 'scheduled',
      scheduledDate: scheduleMaintenance.scheduledDate,
      technician: scheduleMaintenance.technician,
      description: scheduleMaintenance.description
    };

    setMaintenanceRecords(prevRecords => [...prevRecords, newMaintenance]);
    
    setScheduleMaintenance({
      equipmentCode: '',
      equipmentName: '',
      type: 'Preventive',
      scheduledDate: '',
      technician: '',
      description: ''
    });
    setIsScheduleMaintenanceDialogOpen(false);
  };

  // Handle edit button click
  const handleEditClick = (item: Equipment) => {
    setSelectedEquipment(item);
    setEditEquipment({
      code: item.code,
      name: item.name,
      type: item.type,
      rentalRate: item.rentalRate.toString(),
      location: item.location,
      status: item.status
    });
    setIsEditEquipmentDialogOpen(true);
  };

  // Handle view button click
  const handleViewClick = (item: Equipment) => {
    setSelectedEquipment(item);
    setIsViewEquipmentDialogOpen(true);
  };

  // Handle view maintenance details
  const handleViewMaintenanceClick = (record: MaintenanceRecord) => {
    setSelectedMaintenance(record);
    setIsViewMaintenanceDialogOpen(true);
  };

  // Check if forms are valid
  const isNewRentalFormValid = newRental.code && newRental.name && newRental.type && 
    newRental.rentalRate && newRental.location;

  const isEditFormValid = editEquipment.code && editEquipment.name && editEquipment.type && 
    editEquipment.rentalRate && editEquipment.location;

  const isScheduleFormValid = scheduleMaintenance.equipmentCode && scheduleMaintenance.equipmentName && 
    scheduleMaintenance.scheduledDate && scheduleMaintenance.technician;

  // Check if any filters are active
  const hasActiveFilters = filters.search || 
    (filters.type && filters.type !== 'all') || 
    (filters.status && filters.status !== 'all') || 
    (filters.location && filters.location !== 'all') || 
    filters.rentalRate;

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'rented':
        return <Badge variant="secondary">Rented</Badge>;
      case 'available':
        return <Badge variant="default">Available</Badge>;
      case 'maintenance':
        return <Badge variant="destructive">In Maintenance</Badge>;
      case 'scheduled':
        return <Badge variant="outline">Scheduled</Badge>;
      case 'in-progress':
        return <Badge variant="destructive">In Progress</Badge>;
      case 'completed':
        return <Badge variant="default">Completed</Badge>;
      default:
        return <Badge variant="outline">Unknown</Badge>;
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'rented':
        return <Truck className="h-4 w-4 text-blue-500" />;
      case 'available':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'maintenance':
        return <Wrench className="h-4 w-4 text-red-500" />;
      case 'scheduled':
        return <Calendar className="h-4 w-4 text-yellow-500" />;
      case 'in-progress':
        return <Clock className="h-4 w-4 text-orange-500" />;
      case 'completed':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      default:
        return <Clock className="h-4 w-4 text-gray-500" />;
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Rental & Maintenance</h1>
            <p className="text-gray-600 dark:text-gray-400">Manage equipment rentals, maintenance schedules, and service records</p>
          </div>
          <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
            <Dialog open={isScheduleMaintenanceDialogOpen} onOpenChange={setIsScheduleMaintenanceDialogOpen}>
              <DialogTrigger asChild>
                <Button variant="outline" className="w-full sm:w-auto flex items-center gap-2">
                  <Wrench className="h-4 w-4" />
                  Schedule Maintenance
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[600px]">
                <DialogHeader>
                  <DialogTitle>Schedule Maintenance</DialogTitle>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="grid gap-2">
                      <Label htmlFor="equipmentCode">Equipment Code *</Label>
                      <Input
                        id="equipmentCode"
                        placeholder="e.g., EXC-001"
                        value={scheduleMaintenance.equipmentCode}
                        onChange={(e) => setScheduleMaintenance(prev => ({ ...prev, equipmentCode: e.target.value }))}
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="equipmentName">Equipment Name *</Label>
                      <Input
                        id="equipmentName"
                        placeholder="e.g., Excavator PC200"
                        value={scheduleMaintenance.equipmentName}
                        onChange={(e) => setScheduleMaintenance(prev => ({ ...prev, equipmentName: e.target.value }))}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="grid gap-2">
                      <Label htmlFor="maintenanceType">Maintenance Type</Label>
                      <Select 
                        value={scheduleMaintenance.type} 
                        onValueChange={(value) => setScheduleMaintenance(prev => ({ ...prev, type: value }))}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select type" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Preventive">Preventive</SelectItem>
                          <SelectItem value="Repair">Repair</SelectItem>
                          <SelectItem value="Emergency">Emergency</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="scheduledDate">Scheduled Date *</Label>
                      <Input
                        id="scheduledDate"
                        type="date"
                        value={scheduleMaintenance.scheduledDate}
                        onChange={(e) => setScheduleMaintenance(prev => ({ ...prev, scheduledDate: e.target.value }))}
                      />
                    </div>
                  </div>

                  <div className="grid gap-2">
                    <Label htmlFor="technician">Technician *</Label>
                    <Input
                      id="technician"
                      placeholder="e.g., John Smith"
                      value={scheduleMaintenance.technician}
                      onChange={(e) => setScheduleMaintenance(prev => ({ ...prev, technician: e.target.value }))}
                    />
                  </div>

                  <div className="grid gap-2">
                    <Label htmlFor="description">Description</Label>
                    <Input
                      id="description"
                      placeholder="e.g., Regular maintenance and oil change"
                      value={scheduleMaintenance.description}
                      onChange={(e) => setScheduleMaintenance(prev => ({ ...prev, description: e.target.value }))}
                    />
                  </div>
                </div>
                <div className="flex justify-end gap-2">
                  <Button 
                    variant="outline" 
                    onClick={() => {
                      setScheduleMaintenance({
                        equipmentCode: '',
                        equipmentName: '',
                        type: 'Preventive',
                        scheduledDate: '',
                        technician: '',
                        description: ''
                      });
                      setIsScheduleMaintenanceDialogOpen(false);
                    }}
                  >
                    Cancel
                  </Button>
                  <Button 
                    onClick={scheduleNewMaintenance}
                    disabled={!isScheduleFormValid}
                  >
                    Schedule Maintenance
                  </Button>
                </div>
              </DialogContent>
            </Dialog>

            <Dialog open={isNewRentalDialogOpen} onOpenChange={setIsNewRentalDialogOpen}>
              <DialogTrigger asChild>
                <Button className="w-full sm:w-auto flex items-center gap-2">
                  <Plus className="h-4 w-4" />
                  New Rental
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[600px]">
                <DialogHeader>
                  <DialogTitle>Add New Equipment</DialogTitle>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="grid gap-2">
                      <Label htmlFor="code">Equipment Code *</Label>
                      <Input
                        id="code"
                        placeholder="e.g., EXC-001"
                        value={newRental.code}
                        onChange={(e) => setNewRental(prev => ({ ...prev, code: e.target.value }))}
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="name">Equipment Name *</Label>
                      <Input
                        id="name"
                        placeholder="e.g., Excavator PC200"
                        value={newRental.name}
                        onChange={(e) => setNewRental(prev => ({ ...prev, name: e.target.value }))}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="grid gap-2">
                      <Label htmlFor="type">Equipment Type *</Label>
                      <Select 
                        value={newRental.type} 
                        onValueChange={(value) => setNewRental(prev => ({ ...prev, type: value }))}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select type" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Heavy Equipment">Heavy Equipment</SelectItem>
                          <SelectItem value="Lifting Equipment">Lifting Equipment</SelectItem>
                          <SelectItem value="Transport Equipment">Transport Equipment</SelectItem>
                          <SelectItem value="Tools">Tools</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="location">Location *</Label>
                      <Select 
                        value={newRental.location} 
                        onValueChange={(value) => setNewRental(prev => ({ ...prev, location: value }))}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select location" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Warehouse">Warehouse</SelectItem>
                          <SelectItem value="Site A">Site A</SelectItem>
                          <SelectItem value="Site B">Site B</SelectItem>
                          <SelectItem value="Service Center">Service Center</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="grid gap-2">
                      <Label htmlFor="rentalRate">Daily Rental Rate *</Label>
                      <Input
                        id="rentalRate"
                        type="number"
                        placeholder="e.g., 2500"
                        value={newRental.rentalRate}
                        onChange={(e) => setNewRental(prev => ({ ...prev, rentalRate: e.target.value }))}
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="status">Initial Status</Label>
                      <Select 
                        value={newRental.status} 
                        onValueChange={(value) => setNewRental(prev => ({ ...prev, status: value }))}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select status" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="available">Available</SelectItem>
                          <SelectItem value="maintenance">In Maintenance</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>
                <div className="flex justify-end gap-2">
                  <Button 
                    variant="outline" 
                    onClick={() => {
                      setNewRental({
                        code: '',
                        name: '',
                        type: '',
                        rentalRate: '',
                        location: '',
                        status: 'available'
                      });
                      setIsNewRentalDialogOpen(false);
                    }}
                  >
                    Cancel
                  </Button>
                  <Button 
                    onClick={addNewRental}
                    disabled={!isNewRentalFormValid}
                  >
                    Add Equipment
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Equipment</CardTitle>
              <Truck className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">45</div>
              <p className="text-xs text-muted-foreground">
                <CheckCircle className="inline h-3 w-3 text-green-500" /> All equipment operational
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Rentals</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">18</div>
              <p className="text-xs text-muted-foreground">
                <Truck className="inline h-3 w-3 text-blue-500" /> Currently rented out
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Maintenance Due</CardTitle>
              <AlertTriangle className="h-4 w-4 text-yellow-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">7</div>
              <p className="text-xs text-muted-foreground">
                <Wrench className="inline h-3 w-3 text-orange-500" /> Scheduled this week
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Monthly Revenue</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">$450K</div>
              <p className="text-xs text-muted-foreground">
                <DollarSign className="inline h-3 w-3 text-green-500" /> +15% from last month
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Equipment Management */}
        <Card>
          <CardHeader>
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <CardTitle>Equipment Management</CardTitle>
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
            <div className="flex gap-4 mb-6">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input 
                    placeholder="Search equipment by name, code, type, location, or status..." 
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
                          filters.type !== 'all' ? filters.type : null,
                          filters.status !== 'all' ? filters.status : null,
                          filters.location !== 'all' ? filters.location : null,
                          filters.rentalRate
                        ].filter(Boolean).length}
                      </Badge>
                    )}
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[425px]">
                  <DialogHeader>
                    <DialogTitle>Filter Equipment</DialogTitle>
                  </DialogHeader>
                  <div className="grid gap-4 py-4">
                    <div className="grid gap-2">
                      <Label htmlFor="type">Equipment Type</Label>
                      <Select 
                        value={filters.type} 
                        onValueChange={(value) => setFilters(prev => ({ ...prev, type: value }))}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select type" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All Types</SelectItem>
                          {types.map((type) => (
                            <SelectItem key={type} value={type}>
                              {type}
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
                              {status === 'rented' ? 'Rented' : 
                               status === 'available' ? 'Available' : 
                               status === 'maintenance' ? 'In Maintenance' : status}
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

                    <div className="grid gap-2">
                      <Label htmlFor="rentalRate">Rental Rate</Label>
                      <Input 
                        type="number"
                        placeholder="Enter rental rate"
                        value={filters.rentalRate}
                        onChange={(e) => setFilters(prev => ({ ...prev, rentalRate: e.target.value }))}
                      />
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
                {filters.type && filters.type !== 'all' && (
                  <Badge variant="secondary" className="flex items-center gap-1">
                    Type: {filters.type}
                    <X 
                      className="h-3 w-3 cursor-pointer" 
                      onClick={() => setFilters(prev => ({ ...prev, type: 'all' }))}
                    />
                  </Badge>
                )}
                {filters.status && filters.status !== 'all' && (
                  <Badge variant="secondary" className="flex items-center gap-1">
                    Status: {filters.status === 'rented' ? 'Rented' : 
                            filters.status === 'available' ? 'Available' : 
                            filters.status === 'maintenance' ? 'In Maintenance' : filters.status}
                    <X 
                      className="h-3 w-3 cursor-pointer" 
                      onClick={() => setFilters(prev => ({ ...prev, status: 'all' }))}
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
                {filters.rentalRate && (
                  <Badge variant="secondary" className="flex items-center gap-1">
                    Rental Rate: {filters.rentalRate}
                    <X 
                      className="h-3 w-3 cursor-pointer" 
                      onClick={() => setFilters(prev => ({ ...prev, rentalRate: '' }))}
                    />
                  </Badge>
                )}
              </div>
            )}

            {/* Results Count */}
            <div className="mb-4 text-sm text-gray-500">
              Showing {filteredEquipment.length} of {equipment.length} equipment
            </div>

            {/* Equipment Table */}
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left p-3 font-medium">Equipment</th>
                    <th className="text-left p-3 font-medium">Type</th>
                    <th className="text-left p-3 font-medium">Status</th>
                    <th className="text-left p-3 font-medium">Current Rental</th>
                    <th className="text-left p-3 font-medium">Rental Rate</th>
                    <th className="text-left p-3 font-medium">Maintenance Due</th>
                    <th className="text-left p-3 font-medium">Location</th>
                    <th className="text-left p-3 font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredEquipment.length > 0 ? (
                    filteredEquipment.map((item) => (
                      <tr key={item.id} className="border-b hover:bg-gray-50 dark:hover:bg-gray-800">
                        <td className="p-3">
                          <div>
                            <div className="font-medium">{item.name}</div>
                            <div className="text-sm text-gray-500">{item.code}</div>
                          </div>
                        </td>
                        <td className="p-3">{item.type}</td>
                        <td className="p-3">
                          <div className="flex items-center gap-2">
                            {getStatusIcon(item.status)}
                            {getStatusBadge(item.status)}
                          </div>
                        </td>
                        <td className="p-3">
                          {item.currentRental ? (
                            <div className="flex items-center gap-2">
                              <Users className="h-4 w-4 text-gray-400" />
                              <span>{item.currentRental}</span>
                            </div>
                          ) : (
                            <span className="text-gray-500">-</span>
                          )}
                        </td>
                        <td className="p-3">
                          <div className="flex items-center gap-1">
                            <DollarSign className="h-4 w-4 text-gray-400" />
                            <span>{item.rentalRate}/day</span>
                          </div>
                        </td>
                        <td className="p-3">
                          <div className="flex items-center gap-2">
                            <Calendar className="h-4 w-4 text-gray-400" />
                            <span className="text-sm">{item.maintenanceDue}</span>
                          </div>
                        </td>
                        <td className="p-3">{item.location}</td>
                        <td className="p-3">
                          <div className="flex gap-2">
                            <Button size="sm" variant="outline" onClick={() => handleViewClick(item)}>View</Button>
                            <Button size="sm" variant="outline" onClick={() => handleEditClick(item)}>Edit</Button>
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={8} className="p-8 text-center text-gray-500">
                        No equipment found matching your filters.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        {/* Maintenance Records */}
        <Card>
          <CardHeader>
            <CardTitle>Maintenance Records</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {maintenanceRecords.map((record) => (
                <div key={record.id} className="flex flex-col gap-3 p-4 border rounded-lg">
                  <div className="flex items-center gap-4">
                    {getStatusIcon(record.status)}
                    <div>
                      <div className="font-medium">{record.equipmentName}</div>
                      <div className="text-sm text-gray-500">
                        {record.equipmentCode} • {record.type} • {record.technician}
                      </div>
                      <div className="text-sm text-gray-500 mt-1">{record.description}</div>
                    </div>
                  </div>
                  <div className="flex flex-wrap items-center gap-2 justify-between">
                    <div className="text-left sm:text-right">
                      <div className="text-sm font-medium">Scheduled</div>
                      <div className="text-sm text-gray-500">{record.scheduledDate}</div>
                    </div>
                    <div className="flex items-center gap-2">
                      {getStatusBadge(record.status)}
                      <Button size="sm" variant="outline" onClick={() => handleViewMaintenanceClick(record)}>View Details</Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Edit Equipment Dialog */}
        <Dialog open={isEditEquipmentDialogOpen} onOpenChange={setIsEditEquipmentDialogOpen}>
          <DialogContent className="sm:max-w-[600px]">
            <DialogHeader>
              <DialogTitle>Edit Equipment</DialogTitle>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="editCode">Equipment Code *</Label>
                  <Input
                    id="editCode"
                    placeholder="e.g., EXC-001"
                    value={editEquipment.code}
                    onChange={(e) => setEditEquipment(prev => ({ ...prev, code: e.target.value }))}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="editName">Equipment Name *</Label>
                  <Input
                    id="editName"
                    placeholder="e.g., Excavator PC200"
                    value={editEquipment.name}
                    onChange={(e) => setEditEquipment(prev => ({ ...prev, name: e.target.value }))}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="editType">Equipment Type *</Label>
                  <Select 
                    value={editEquipment.type} 
                    onValueChange={(value) => setEditEquipment(prev => ({ ...prev, type: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Heavy Equipment">Heavy Equipment</SelectItem>
                      <SelectItem value="Lifting Equipment">Lifting Equipment</SelectItem>
                      <SelectItem value="Transport Equipment">Transport Equipment</SelectItem>
                      <SelectItem value="Tools">Tools</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="editLocation">Location *</Label>
                  <Select 
                    value={editEquipment.location} 
                    onValueChange={(value) => setEditEquipment(prev => ({ ...prev, location: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select location" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Warehouse">Warehouse</SelectItem>
                      <SelectItem value="Site A">Site A</SelectItem>
                      <SelectItem value="Site B">Site B</SelectItem>
                      <SelectItem value="Service Center">Service Center</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="editRentalRate">Daily Rental Rate *</Label>
                  <Input
                    id="editRentalRate"
                    type="number"
                    placeholder="e.g., 2500"
                    value={editEquipment.rentalRate}
                    onChange={(e) => setEditEquipment(prev => ({ ...prev, rentalRate: e.target.value }))}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="editStatus">Status</Label>
                  <Select 
                    value={editEquipment.status} 
                    onValueChange={(value) => setEditEquipment(prev => ({ ...prev, status: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="available">Available</SelectItem>
                      <SelectItem value="rented">Rented</SelectItem>
                      <SelectItem value="maintenance">In Maintenance</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
            <div className="flex justify-end gap-2">
              <Button 
                variant="outline" 
                onClick={() => {
                  setEditEquipment({
                    code: '',
                    name: '',
                    type: '',
                    rentalRate: '',
                    location: '',
                    status: 'available'
                  });
                  setSelectedEquipment(null);
                  setIsEditEquipmentDialogOpen(false);
                }}
              >
                Cancel
              </Button>
              <Button 
                onClick={editEquipmentItem}
                disabled={!isEditFormValid}
              >
                Save Changes
              </Button>
            </div>
          </DialogContent>
        </Dialog>

        {/* View Equipment Dialog */}
        <Dialog open={isViewEquipmentDialogOpen} onOpenChange={setIsViewEquipmentDialogOpen}>
          <DialogContent className="sm:max-w-[600px]">
            <DialogHeader>
              <DialogTitle>Equipment Details</DialogTitle>
            </DialogHeader>
            {selectedEquipment ? (
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label>Equipment Code</Label>
                    <div className="font-medium">{selectedEquipment.code}</div>
                  </div>
                  <div className="grid gap-2">
                    <Label>Equipment Name</Label>
                    <div className="font-medium">{selectedEquipment.name}</div>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label>Equipment Type</Label>
                    <div className="font-medium">{selectedEquipment.type}</div>
                  </div>
                  <div className="grid gap-2">
                    <Label>Location</Label>
                    <div className="font-medium">{selectedEquipment.location}</div>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label>Daily Rental Rate</Label>
                    <div className="font-medium">${selectedEquipment.rentalRate}/day</div>
                  </div>
                  <div className="grid gap-2">
                    <Label>Status</Label>
                    <div className="font-medium">{getStatusBadge(selectedEquipment.status)}</div>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label>Current Rental</Label>
                    <div className="font-medium">
                      {selectedEquipment.currentRental ?? 'Not currently rented'}
                    </div>
                  </div>
                  <div className="grid gap-2">
                    <Label>Maintenance Due</Label>
                    <div className="font-medium">{selectedEquipment.maintenanceDue}</div>
                  </div>
                </div>
                <div className="grid gap-2">
                  <Label>Last Maintenance</Label>
                  <div className="font-medium">{selectedEquipment.lastMaintenance}</div>
                </div>
              </div>
            ) : (
              <div className="p-8 text-center text-gray-500">No equipment selected for viewing.</div>
            )}
            <div className="flex justify-end">
              <Button onClick={() => setIsViewEquipmentDialogOpen(false)}>Close</Button>
            </div>
          </DialogContent>
        </Dialog>

        {/* View Maintenance Details Dialog */}
        <Dialog open={isViewMaintenanceDialogOpen} onOpenChange={setIsViewMaintenanceDialogOpen}>
          <DialogContent className="sm:max-w-[600px]">
            <DialogHeader>
              <DialogTitle>Maintenance Details</DialogTitle>
            </DialogHeader>
            {selectedMaintenance ? (
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label>Equipment Code</Label>
                    <div className="font-medium">{selectedMaintenance.equipmentCode}</div>
                  </div>
                  <div className="grid gap-2">
                    <Label>Equipment Name</Label>
                    <div className="font-medium">{selectedMaintenance.equipmentName}</div>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label>Maintenance Type</Label>
                    <div className="font-medium">{selectedMaintenance.type}</div>
                  </div>
                  <div className="grid gap-2">
                    <Label>Status</Label>
                    <div className="font-medium">{getStatusBadge(selectedMaintenance.status)}</div>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label>Scheduled Date</Label>
                    <div className="font-medium">{selectedMaintenance.scheduledDate}</div>
                  </div>
                  <div className="grid gap-2">
                    <Label>Technician</Label>
                    <div className="font-medium">{selectedMaintenance.technician}</div>
                  </div>
                </div>
                <div className="grid gap-2">
                  <Label>Description</Label>
                  <div className="font-medium">{selectedMaintenance.description}</div>
                </div>
              </div>
            ) : (
              <div className="p-8 text-center text-gray-500">No maintenance record selected for viewing.</div>
            )}
            <div className="flex justify-end">
              <Button onClick={() => setIsViewMaintenanceDialogOpen(false)}>Close</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  );
};

export default RentalPage; 