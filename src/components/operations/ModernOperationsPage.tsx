'use client';

import { useState } from 'react';
import { ModernDashboardTab } from '@/components/operations/ModernDashboardTab';
import { ModernEquipmentTab } from '@/components/operations/ModernEquipmentTab';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

import { 
  BarChart3, Package, Wrench, Clock, AlertTriangle, Plus
} from 'lucide-react';

// ========================================
// MODERN OPERATIONS PAGE COMPONENT
// Enterprise-grade Operations Management System
// ========================================

export function ModernOperationsPage() {
  const [activeTab, setActiveTab] = useState('dashboard');

  // Mock data for quick stats
  const quickStats = {
    totalEquipment: 45,
    activeWorkOrders: 12,
    maintenanceDue: 8,
    criticalAlerts: 3
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-3xl font-bold dark:text-white dark:text-white">Operations</h1>
          <p className="text-gray-600 dark:text-gray-400">Manage equipment, maintenance, and work orders</p>
        </div>
        <div className="flex gap-2">
          <Button size="sm">
            <Plus className="h-4 w-4 mr-2" />
            Work Order
          </Button>
          <Button size="sm" variant="outline">
            <Plus className="h-4 w-4 mr-2" />
            Equipment
          </Button>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center">
              <Package className="h-4 w-4 text-muted-foreground" />
              <div className="ml-2">
                <p className="text-sm font-medium text-muted-foreground">Total Equipment</p>
                <p className="text-2xl font-bold">{quickStats.totalEquipment}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center">
              <Wrench className="h-4 w-4 text-blue-500" />
              <div className="ml-2">
                <p className="text-sm font-medium text-muted-foreground">Active Work Orders</p>
                <p className="text-2xl font-bold text-blue-600">{quickStats.activeWorkOrders}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center">
              <Clock className="h-4 w-4 text-yellow-500" />
              <div className="ml-2">
                <p className="text-sm font-medium text-muted-foreground">Maintenance Due</p>
                <p className="text-2xl font-bold text-yellow-600">{quickStats.maintenanceDue}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center">
              <AlertTriangle className="h-4 w-4 text-red-500" />
              <div className="ml-2">
                <p className="text-sm font-medium text-muted-foreground">Critical Alerts</p>
                <p className="text-2xl font-bold text-red-600">{quickStats.criticalAlerts}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="dashboard" className="flex items-center gap-2">
            <BarChart3 className="h-4 w-4" />
            Dashboard
          </TabsTrigger>
          <TabsTrigger value="equipment" className="flex items-center gap-2">
            <Package className="h-4 w-4" />
            Equipment Management
          </TabsTrigger>
        </TabsList>
        
        {/* Dashboard Tab */}
        <TabsContent value="dashboard" className="space-y-4">
          <ModernDashboardTab />
        </TabsContent>
        
        {/* Equipment Management Tab */}
        <TabsContent value="equipment" className="space-y-4">
          <ModernEquipmentTab />
        </TabsContent>
      </Tabs>
    </div>
  );
}
