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
  Plus, 
  Search, 
  Filter,
  AlertTriangle,
  CheckCircle,
  Clock,
  TrendingUp,
  TrendingDown,
  Package,
  X,
  Eye,
  Edit
} from 'lucide-react';

interface InventoryItem {
  id: number;
  code: string;
  name: string;
  category: string;
  quantity: number;
  minQuantity: number;
  unit: string;
  location: string;
  status: string;
  lastUpdated: string;
}

interface FilterState {
  search: string;
  category: string;
  status: string;
  location: string;
  quantity: string;
  lastUpdated: string;
}

const InventoryPage: React.FC = () => {
  // Filter state
  const [filters, setFilters] = useState<FilterState>({
    search: '',
    category: 'all',
    status: 'all',
    location: 'all',
    quantity: '',
    lastUpdated: ''
  });

  // Dialog state
  const [isFilterDialogOpen, setIsFilterDialogOpen] = useState(false);
  const [isAddItemDialogOpen, setIsAddItemDialogOpen] = useState(false);
  const [isEditItemDialogOpen, setIsEditItemDialogOpen] = useState(false);
  const [isViewItemDialogOpen, setIsViewItemDialogOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<InventoryItem | null>(null);

  // Mock data for demonstration
  const [inventoryItems, setInventoryItems] = useState<InventoryItem[]>([
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
    },
    {
      id: 5,
      code: 'BRA-005',
      name: 'Brake Pad Set',
      category: 'Brake Systems',
      quantity: 2,
      minQuantity: 8,
      unit: 'sets',
      location: 'Warehouse B',
      status: 'low',
      lastUpdated: '2024-03-07'
    },
    {
      id: 6,
      code: 'ELC-006',
      name: 'Electrical Wiring Harness',
      category: 'Electrical Systems',
      quantity: 12,
      minQuantity: 5,
      unit: 'pcs',
      location: 'Warehouse A',
      status: 'normal',
      lastUpdated: '2024-03-11'
    }
  ]);

  // Get unique values for filter options
  const categories = useMemo(() => 
    Array.from(new Set(inventoryItems.map(item => item.category))), 
    [inventoryItems]
  );

  const locations = useMemo(() => 
    Array.from(new Set(inventoryItems.map(item => item.location))), 
    [inventoryItems]
  );

  const statuses = useMemo(() => 
    Array.from(new Set(inventoryItems.map(item => item.status))), 
    [inventoryItems]
  );

  // Filtered items
  const filteredItems = useMemo(() => {
    return inventoryItems.filter(item => {
      // Search filter
      const searchLower = filters.search.toLowerCase();
      const matchesSearch = !filters.search || 
        item.name.toLowerCase().includes(searchLower) ||
        item.code.toLowerCase().includes(searchLower) || 
        item.category.toLowerCase().includes(searchLower) ||
        item.location.toLowerCase().includes(searchLower) ||
        item.status.toLowerCase().includes(searchLower);

      // Quantity filter
      const matchesQuantity = !filters.quantity || 
        item.quantity.toString() === filters.quantity;

      // Category filter
      const matchesCategory = !filters.category || filters.category === 'all' || item.category === filters.category;
      
      // Status filter
      const matchesStatus = !filters.status || filters.status === 'all' || item.status === filters.status;
      
      // Location filter
      const matchesLocation = !filters.location || filters.location === 'all' || item.location === filters.location;
      
      // Last updated filter
      const matchesLastUpdated = !filters.lastUpdated || item.lastUpdated === filters.lastUpdated;

      return matchesSearch && matchesQuantity && matchesCategory && matchesStatus && matchesLocation && matchesLastUpdated;
    });
  }, [inventoryItems, filters]);

  // Clear all filters
  const clearFilters = () => {
    setFilters({
      search: '',
      category: 'all',
      status: 'all',
      location: 'all',
      quantity: '',
      lastUpdated: ''
    });
  };

  // Close filter dialog
  const closeFilterDialog = () => {
    setIsFilterDialogOpen(false);
  };

  // Add new item form state
  const [newItem, setNewItem] = useState({
    code: '',
    name: '',
    category: '',
    quantity: '',
    minQuantity: '',
    unit: '',
    location: '',
    status: 'normal'
  });

  // Add new item
  const addNewItem = () => {
    const item: InventoryItem = {
      id: Math.max(...inventoryItems.map(item => item.id)) + 1,
      code: newItem.code,
      name: newItem.name,
      category: newItem.category,
      quantity: parseInt(newItem.quantity) || 0,
      minQuantity: parseInt(newItem.minQuantity) || 0,
      unit: newItem.unit,
      location: newItem.location,
      status: newItem.status,
      lastUpdated: new Date().toISOString().split('T')[0] ?? ''
    };

    // Add the new item to the inventory list
    setInventoryItems(prevItems => [...prevItems, item]);
    
    // Reset form and close dialog
    setNewItem({
      code: '',
      name: '',
      category: '',
      quantity: '',
      minQuantity: '',
      unit: '',
      location: '',
      status: 'normal'
    });
    setIsAddItemDialogOpen(false);
  };

  // Check if form is valid
  const isFormValid = newItem.code && newItem.name && newItem.category && 
    newItem.quantity && newItem.minQuantity && newItem.unit && newItem.location;

  // Edit item form state
  const [editItem, setEditItem] = useState({
    code: '',
    name: '',
    category: '',
    quantity: '',
    minQuantity: '',
    unit: '',
    location: '',
    status: 'normal'
  });

  // Edit item
  const editInventoryItem = () => {
    if (!selectedItem) return;

    const updatedItem: InventoryItem = {
      ...selectedItem,
      code: editItem.code,
      name: editItem.name,
      category: editItem.category,
      quantity: parseInt(editItem.quantity) || 0,
      minQuantity: parseInt(editItem.minQuantity) || 0,
      unit: editItem.unit,
      location: editItem.location,
      status: editItem.status,
      lastUpdated: new Date().toISOString().split('T')[0] ?? ''
    };

    // Update the item in the inventory list
    setInventoryItems(prevItems => 
      prevItems.map(item => item.id === selectedItem.id ? updatedItem : item)
    );
    
    // Reset form and close dialog
    setEditItem({
      code: '',
      name: '',
      category: '',
      quantity: '',
      minQuantity: '',
      unit: '',
      location: '',
      status: 'normal'
    });
    setSelectedItem(null);
    setIsEditItemDialogOpen(false);
  };

  // Handle edit button click
  const handleEditClick = (item: InventoryItem) => {
    setSelectedItem(item);
    setEditItem({
      code: item.code,
      name: item.name,
      category: item.category,
      quantity: item.quantity.toString(),
      minQuantity: item.minQuantity.toString(),
      unit: item.unit,
      location: item.location,
      status: item.status
    });
    setIsEditItemDialogOpen(true);
  };

  // Handle view button click
  const handleViewClick = (item: InventoryItem) => {
    setSelectedItem(item);
    setIsViewItemDialogOpen(true);
  };

  // Check if edit form is valid
  const isEditFormValid = editItem.code && editItem.name && editItem.category && 
    editItem.quantity && editItem.minQuantity && editItem.unit && editItem.location;

  // Check if any filters are active
  const hasActiveFilters = filters.search || 
    (filters.category && filters.category !== 'all') || 
    (filters.status && filters.status !== 'all') || 
    (filters.location && filters.location !== 'all') || 
    filters.quantity || 
    filters.lastUpdated;

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
          <Dialog open={isAddItemDialogOpen} onOpenChange={setIsAddItemDialogOpen}>
            <DialogTrigger asChild>
              <Button className="flex items-center gap-2">
                <Plus className="h-4 w-4" />
                Add New Item
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[600px]">
              <DialogHeader>
                <DialogTitle>Add New Inventory Item</DialogTitle>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="code">Item Code *</Label>
                    <Input
                      id="code"
                      placeholder="e.g., EXC-001"
                      value={newItem.code}
                      onChange={(e) => setNewItem(prev => ({ ...prev, code: e.target.value }))}
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="name">Item Name *</Label>
                    <Input
                      id="name"
                      placeholder="e.g., Excavator Spare Parts Kit"
                      value={newItem.name}
                      onChange={(e) => setNewItem(prev => ({ ...prev, name: e.target.value }))}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="category">Category *</Label>
                    <Select 
                      value={newItem.category} 
                      onValueChange={(value) => setNewItem(prev => ({ ...prev, category: value }))}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                      <SelectContent>
                        {categories.map((category) => (
                          <SelectItem key={category} value={category}>
                            {category}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="location">Location *</Label>
                    <Select 
                      value={newItem.location} 
                      onValueChange={(value) => setNewItem(prev => ({ ...prev, location: value }))}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select location" />
                      </SelectTrigger>
                      <SelectContent>
                        {locations.map((location) => (
                          <SelectItem key={location} value={location}>
                            {location}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="quantity">Current Quantity *</Label>
                    <Input
                      id="quantity"
                      type="number"
                      placeholder="0"
                      value={newItem.quantity}
                      onChange={(e) => setNewItem(prev => ({ ...prev, quantity: e.target.value }))}
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="minQuantity">Minimum Quantity *</Label>
                    <Input
                      id="minQuantity"
                      type="number"
                      placeholder="0"
                      value={newItem.minQuantity}
                      onChange={(e) => setNewItem(prev => ({ ...prev, minQuantity: e.target.value }))}
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="unit">Unit *</Label>
                    <Select 
                      value={newItem.unit} 
                      onValueChange={(value) => setNewItem(prev => ({ ...prev, unit: value }))}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select unit" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="pcs">Pieces (pcs)</SelectItem>
                        <SelectItem value="units">Units</SelectItem>
                        <SelectItem value="sets">Sets</SelectItem>
                        <SelectItem value="kg">Kilograms (kg)</SelectItem>
                        <SelectItem value="liters">Liters</SelectItem>
                        <SelectItem value="meters">Meters</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="status">Initial Status</Label>
                  <Select 
                    value={newItem.status} 
                    onValueChange={(value) => setNewItem(prev => ({ ...prev, status: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="normal">Normal</SelectItem>
                      <SelectItem value="low">Low Stock</SelectItem>
                      <SelectItem value="out">Out of Stock</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="flex justify-end gap-2">
                <Button 
                  variant="outline" 
                  onClick={() => {
                    setNewItem({
                      code: '',
                      name: '',
                      category: '',
                      quantity: '',
                      minQuantity: '',
                      unit: '',
                      location: '',
                      status: 'normal'
                    });
                    setIsAddItemDialogOpen(false);
                  }}
                >
                  Cancel
                </Button>
                <Button 
                  onClick={addNewItem}
                  disabled={!isFormValid}
                >
                  Add Item
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Items</CardTitle>
              <Package className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{inventoryItems.length}</div>
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
              <div className="text-2xl font-bold">{inventoryItems.filter(item => item.status === 'low').length}</div>
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
              <div className="text-2xl font-bold">{inventoryItems.filter(item => item.status === 'out').length}</div>
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
            <div className="flex items-center justify-between">
              <CardTitle>Inventory Items</CardTitle>
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
                    placeholder="Search items by name, code, location, status, or category..." 
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
                          filters.category !== 'all' ? filters.category : null,
                          filters.status !== 'all' ? filters.status : null,
                          filters.location !== 'all' ? filters.location : null,
                          filters.quantity,
                          filters.lastUpdated
                        ].filter(Boolean).length}
                      </Badge>
                    )}
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[425px]">
                  <DialogHeader>
                    <DialogTitle>Filter Inventory Items</DialogTitle>
                  </DialogHeader>
                  <div className="grid gap-4 py-4">
                    <div className="grid gap-2">
                      <Label htmlFor="category">Category</Label>
                      <Select 
                        value={filters.category} 
                        onValueChange={(value) => setFilters(prev => ({ ...prev, category: value }))}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select category" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All Categories</SelectItem>
                          {categories.map((category) => (
                            <SelectItem key={category} value={category}>
                              {category}
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
                              {status === 'normal' ? 'Normal' : 
                               status === 'low' ? 'Low Stock' : 
                               status === 'out' ? 'Out of Stock' : status}
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
                      <Label htmlFor="quantity">Quantity</Label>
                      <Input 
                        type="number"
                        placeholder="Enter quantity"
                        value={filters.quantity}
                        onChange={(e) => setFilters(prev => ({ ...prev, quantity: e.target.value }))}
                      />
                    </div>

                    <div className="grid gap-2">
                      <Label htmlFor="lastUpdated">Last Updated</Label>
                      <Input 
                        type="date"
                        value={filters.lastUpdated}
                        onChange={(e) => setFilters(prev => ({ ...prev, lastUpdated: e.target.value }))}
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
                {filters.category && filters.category !== 'all' && (
                  <Badge variant="secondary" className="flex items-center gap-1">
                    Category: {filters.category}
                    <X 
                      className="h-3 w-3 cursor-pointer" 
                      onClick={() => setFilters(prev => ({ ...prev, category: 'all' }))}
                    />
                  </Badge>
                )}
                {filters.status && filters.status !== 'all' && (
                  <Badge variant="secondary" className="flex items-center gap-1">
                    Status: {filters.status === 'normal' ? 'Normal' : 
                            filters.status === 'low' ? 'Low Stock' : 
                            filters.status === 'out' ? 'Out of Stock' : filters.status}
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
                {filters.quantity && (
                  <Badge variant="secondary" className="flex items-center gap-1">
                    Quantity: {filters.quantity}
                    <X 
                      className="h-3 w-3 cursor-pointer" 
                      onClick={() => setFilters(prev => ({ ...prev, quantity: '' }))}
                    />
                  </Badge>
                )}
                {filters.lastUpdated && (
                  <Badge variant="secondary" className="flex items-center gap-1">
                    Last Updated: {filters.lastUpdated}
                    <X 
                      className="h-3 w-3 cursor-pointer" 
                      onClick={() => setFilters(prev => ({ ...prev, lastUpdated: '' }))}
                    />
                  </Badge>
                )}
              </div>
            )}

            {/* Results Count */}
            <div className="mb-4 text-sm text-gray-500">
              Showing {filteredItems.length} of {inventoryItems.length} items
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
                  {filteredItems.length > 0 ? (
                    filteredItems.map((item) => (
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
                            <Button size="sm" variant="outline" onClick={() => handleEditClick(item)}>Edit</Button>
                            <Button size="sm" variant="outline" onClick={() => handleViewClick(item)}>View</Button>
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={7} className="p-8 text-center text-gray-500">
                        No items found matching your filters.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        {/* Edit Item Dialog */}
        <Dialog open={isEditItemDialogOpen} onOpenChange={setIsEditItemDialogOpen}>
          <DialogContent className="sm:max-w-[600px]">
            <DialogHeader>
              <DialogTitle>Edit Inventory Item</DialogTitle>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="editCode">Item Code *</Label>
                  <Input
                    id="editCode"
                    placeholder="e.g., EXC-001"
                    value={editItem.code}
                    onChange={(e) => setEditItem(prev => ({ ...prev, code: e.target.value }))}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="editName">Item Name *</Label>
                  <Input
                    id="editName"
                    placeholder="e.g., Excavator Spare Parts Kit"
                    value={editItem.name}
                    onChange={(e) => setEditItem(prev => ({ ...prev, name: e.target.value }))}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="editCategory">Category *</Label>
                  <Select 
                    value={editItem.category} 
                    onValueChange={(value) => setEditItem(prev => ({ ...prev, category: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map((category) => (
                        <SelectItem key={category} value={category}>
                          {category}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="editLocation">Location *</Label>
                  <Select 
                    value={editItem.location} 
                    onValueChange={(value) => setEditItem(prev => ({ ...prev, location: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select location" />
                    </SelectTrigger>
                    <SelectContent>
                      {locations.map((location) => (
                        <SelectItem key={location} value={location}>
                          {location}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="editQuantity">Current Quantity *</Label>
                  <Input
                    id="editQuantity"
                    type="number"
                    placeholder="0"
                    value={editItem.quantity}
                    onChange={(e) => setEditItem(prev => ({ ...prev, quantity: e.target.value }))}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="editMinQuantity">Minimum Quantity *</Label>
                  <Input
                    id="editMinQuantity"
                    type="number"
                    placeholder="0"
                    value={editItem.minQuantity}
                    onChange={(e) => setEditItem(prev => ({ ...prev, minQuantity: e.target.value }))}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="editUnit">Unit *</Label>
                  <Select 
                    value={editItem.unit} 
                    onValueChange={(value) => setEditItem(prev => ({ ...prev, unit: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select unit" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pcs">Pieces (pcs)</SelectItem>
                      <SelectItem value="units">Units</SelectItem>
                      <SelectItem value="sets">Sets</SelectItem>
                      <SelectItem value="kg">Kilograms (kg)</SelectItem>
                      <SelectItem value="liters">Liters</SelectItem>
                      <SelectItem value="meters">Meters</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid gap-2">
                <Label htmlFor="editStatus">Status</Label>
                <Select 
                  value={editItem.status} 
                  onValueChange={(value) => setEditItem(prev => ({ ...prev, status: value }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="normal">Normal</SelectItem>
                    <SelectItem value="low">Low Stock</SelectItem>
                    <SelectItem value="out">Out of Stock</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="flex justify-end gap-2">
              <Button 
                variant="outline" 
                onClick={() => {
                  setEditItem({
                    code: '',
                    name: '',
                    category: '',
                    quantity: '',
                    minQuantity: '',
                    unit: '',
                    location: '',
                    status: 'normal'
                  });
                  setSelectedItem(null);
                  setIsEditItemDialogOpen(false);
                }}
              >
                Cancel
              </Button>
              <Button 
                onClick={editInventoryItem}
                disabled={!isEditFormValid}
              >
                Save Changes
              </Button>
            </div>
          </DialogContent>
        </Dialog>

        {/* View Item Dialog */}
        <Dialog open={isViewItemDialogOpen} onOpenChange={setIsViewItemDialogOpen}>
          <DialogContent className="sm:max-w-[600px]">
            <DialogHeader>
              <DialogTitle>Item Details</DialogTitle>
            </DialogHeader>
            {selectedItem ? (
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label>Item Code</Label>
                    <div className="font-medium">{selectedItem.code}</div>
                  </div>
                  <div className="grid gap-2">
                    <Label>Item Name</Label>
                    <div className="font-medium">{selectedItem.name}</div>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label>Category</Label>
                    <div className="font-medium">{selectedItem.category}</div>
                  </div>
                  <div className="grid gap-2">
                    <Label>Location</Label>
                    <div className="font-medium">{selectedItem.location}</div>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label>Current Quantity</Label>
                    <div className="font-medium">{selectedItem.quantity}</div>
                  </div>
                  <div className="grid gap-2">
                    <Label>Minimum Quantity</Label>
                    <div className="font-medium">{selectedItem.minQuantity}</div>
                  </div>
                </div>
                <div className="grid gap-2">
                  <Label>Unit</Label>
                  <div className="font-medium">{selectedItem.unit}</div>
                </div>
                <div className="grid gap-2">
                  <Label>Status</Label>
                  <div className="font-medium">{getStatusBadge(selectedItem.status)}</div>
                </div>
                <div className="grid gap-2">
                  <Label>Last Updated</Label>
                  <div className="font-medium">{selectedItem.lastUpdated}</div>
                </div>
              </div>
            ) : (
              <div className="p-8 text-center text-gray-500">No item selected for viewing.</div>
            )}
            <div className="flex justify-end">
              <Button onClick={() => setIsViewItemDialogOpen(false)}>Close</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  );
};

export default InventoryPage; 