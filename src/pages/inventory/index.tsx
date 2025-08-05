import React from 'react';
import { DashboardLayout } from '@/components/layouts/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { 
  Plus, 
  Search, 
  Filter,
  AlertTriangle,
  CheckCircle,
  Clock,
  TrendingUp,
  TrendingDown,
  Package
} from 'lucide-react';

const InventoryPage: React.FC = () => {
  // Mock data for demonstration
  const inventoryItems = [
    {
      id: 1,
      code: 'EXC-001',
      name: 'Excavator Spare Parts Kit',
      category: 'Heavy Equipment',
      quantity: 15,
      minQuantity: 10,
      unit: 'pcs',
      location: 'Warehouse A',
      status: 'normal',
      lastUpdated: '2024-03-10'
    },
    {
      id: 2,
      code: 'HYD-002',
      name: 'Hydraulic Pump Assembly',
      category: 'Hydraulic Systems',
      quantity: 3,
      minQuantity: 5,
      unit: 'units',
      location: 'Warehouse B',
      status: 'low',
      lastUpdated: '2024-03-09'
    },
    {
      id: 3,
      code: 'ENG-003',
      name: 'Engine Oil Filter',
      category: 'Engine Parts',
      quantity: 0,
      minQuantity: 20,
      unit: 'pcs',
      location: 'Warehouse A',
      status: 'out',
      lastUpdated: '2024-03-08'
    },
    {
      id: 4,
      code: 'TIR-004',
      name: 'Tire Set (Heavy Duty)',
      category: 'Tires & Wheels',
      quantity: 8,
      minQuantity: 4,
      unit: 'sets',
      location: 'Warehouse C',
      status: 'normal',
      lastUpdated: '2024-03-10'
    }
  ];

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'low':
        return <Badge variant="destructive">Low Stock</Badge>;
      case 'out':
        return <Badge variant="destructive">Out of Stock</Badge>;
      case 'normal':
        return <Badge variant="secondary">Normal</Badge>;
      default:
        return <Badge variant="outline">Unknown</Badge>;
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'low':
        return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
      case 'out':
        return <AlertTriangle className="h-4 w-4 text-red-500" />;
      case 'normal':
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
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Inventory Management</h1>
            <p className="text-gray-600 dark:text-gray-400">Manage your inventory, track stock levels, and monitor supplies</p>
          </div>
          <Button className="flex items-center gap-2">
            <Plus className="h-4 w-4" />
            Add New Item
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Items</CardTitle>
              <Package className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">1,247</div>
              <p className="text-xs text-muted-foreground">
                <TrendingUp className="inline h-3 w-3 text-green-500" /> +12% from last month
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Low Stock Items</CardTitle>
              <AlertTriangle className="h-4 w-4 text-yellow-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">23</div>
              <p className="text-xs text-muted-foreground">
                <TrendingDown className="inline h-3 w-3 text-red-500" /> -5% from last month
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Out of Stock</CardTitle>
              <AlertTriangle className="h-4 w-4 text-red-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">5</div>
              <p className="text-xs text-muted-foreground">
                <TrendingUp className="inline h-3 w-3 text-red-500" /> +2 from last week
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Value</CardTitle>
              <Package className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">$1.25M</div>
              <p className="text-xs text-muted-foreground">
                <TrendingUp className="inline h-3 w-3 text-green-500" /> +8% from last month
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Search and Filters */}
        <Card>
          <CardHeader>
            <CardTitle>Inventory Items</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex gap-4 mb-6">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input 
                    placeholder="Search items by name, code, or category..." 
                    className="pl-10"
                  />
                </div>
              </div>
              <Button variant="outline" className="flex items-center gap-2">
                <Filter className="h-4 w-4" />
                Filters
              </Button>
            </div>

            {/* Inventory Table */}
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left p-3 font-medium">Item</th>
                    <th className="text-left p-3 font-medium">Category</th>
                    <th className="text-left p-3 font-medium">Quantity</th>
                    <th className="text-left p-3 font-medium">Location</th>
                    <th className="text-left p-3 font-medium">Status</th>
                    <th className="text-left p-3 font-medium">Last Updated</th>
                    <th className="text-left p-3 font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {inventoryItems.map((item) => (
                    <tr key={item.id} className="border-b hover:bg-gray-50 dark:hover:bg-gray-800">
                      <td className="p-3">
                        <div>
                          <div className="font-medium">{item.name}</div>
                          <div className="text-sm text-gray-500">{item.code}</div>
                        </div>
                      </td>
                      <td className="p-3">{item.category}</td>
                      <td className="p-3">
                        <div className="flex items-center gap-2">
                          <span className="font-medium">{item.quantity}</span>
                          <span className="text-sm text-gray-500">{item.unit}</span>
                        </div>
                      </td>
                      <td className="p-3">{item.location}</td>
                      <td className="p-3">
                        <div className="flex items-center gap-2">
                          {getStatusIcon(item.status)}
                          {getStatusBadge(item.status)}
                        </div>
                      </td>
                      <td className="p-3 text-sm text-gray-500">{item.lastUpdated}</td>
                      <td className="p-3">
                        <div className="flex gap-2">
                          <Button size="sm" variant="outline">Edit</Button>
                          <Button size="sm" variant="outline">View</Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default InventoryPage; 