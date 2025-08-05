import React from 'react';
import { DashboardLayout } from '@/components/layouts/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
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
  Truck
} from 'lucide-react';

const RentalPage: React.FC = () => {
  // Mock data for demonstration
  const equipment = [
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
  ];

  const maintenanceRecords = [
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
  ];

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
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Rental & Maintenance</h1>
            <p className="text-gray-600 dark:text-gray-400">Manage equipment rentals, maintenance schedules, and service records</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" className="flex items-center gap-2">
              <Wrench className="h-4 w-4" />
              Schedule Maintenance
            </Button>
            <Button className="flex items-center gap-2">
              <Plus className="h-4 w-4" />
              New Rental
            </Button>
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
            <CardTitle>Equipment Management</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex gap-4 mb-6">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input 
                    placeholder="Search equipment by name, code, or type..." 
                    className="pl-10"
                  />
                </div>
              </div>
              <Button variant="outline" className="flex items-center gap-2">
                <Filter className="h-4 w-4" />
                Filters
              </Button>
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
                  {equipment.map((item) => (
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

        {/* Maintenance Records */}
        <Card>
          <CardHeader>
            <CardTitle>Maintenance Records</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {maintenanceRecords.map((record) => (
                <div key={record.id} className="flex items-center justify-between p-4 border rounded-lg">
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
                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <div className="text-sm font-medium">Scheduled</div>
                      <div className="text-sm text-gray-500">{record.scheduledDate}</div>
                    </div>
                    {getStatusBadge(record.status)}
                    <Button size="sm" variant="outline">View Details</Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default RentalPage; 