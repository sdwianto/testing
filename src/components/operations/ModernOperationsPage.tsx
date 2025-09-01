'use client';

/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/no-unsafe-return */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/prefer-nullish-coalescing */


import { useState, useMemo } from 'react';
import { ModernOperationsDashboard } from '@/components/operations/ModernOperationsDashboard';
import { ModernEquipmentTab } from '@/components/operations/ModernEquipmentTab';
import { ModernRentalTab } from '@/components/operations/ModernRentalTab';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { trpc } from '@/lib/trpc';

import { 
  BarChart3, Package, Wrench, Clock, AlertTriangle, Plus, DollarSign
} from 'lucide-react';

// ========================================
// OPERATIONS PAGE COMPONENT - CLEANED & SIMPLIFIED
// Enterprise-grade Operations Management System
// ========================================

export function ModernOperationsPage() {
  const [activeTab, setActiveTab] = useState('dashboard');

  // Real data from tRPC queries
  const { data: equipmentData } = trpc.ops.listEquipment.useQuery({ limit: 1000 });
  const { data: workOrdersData } = trpc.ops.listWorkOrders.useQuery({ limit: 100 });
  const { data: maintenanceSchedules } = trpc.ops.listMaintenanceSchedules.useQuery({ limit: 50 });

  // Calculate real statistics
  const quickStats = useMemo(() => {
    const totalEquipment = equipmentData?.equipment?.length || 0;
    const activeWorkOrders = workOrdersData?.workOrders?.filter((wo: any) => 
      wo.status === 'OPEN' || wo.status === 'IN_PROGRESS'
    ).length || 0;
    const maintenanceDue = maintenanceSchedules?.schedules?.filter((s: any) => 
      new Date(s.nextMaintenanceDate) <= new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
    ).length || 0;
    const criticalAlerts = workOrdersData?.workOrders?.filter((wo: any) => 
      wo.priority === 'HIGH' && (wo.status === 'OPEN' || wo.status === 'IN_PROGRESS')
    ).length || 0;

    return {
      totalEquipment,
      activeWorkOrders,
      maintenanceDue,
      criticalAlerts
    };
  }, [equipmentData, workOrdersData, maintenanceSchedules]);

  // Navigation handlers
  const handleCreateWorkOrder = () => {
    setActiveTab('equipment');
    // Trigger work order form in equipment tab
    setTimeout(() => {
      const workOrderTab = document.querySelector('[data-tab="work-orders"]')!;
      (workOrderTab as HTMLElement).click();
    }, 100);
  };

  const handleCreateEquipment = () => {
    setActiveTab('equipment');
    // Trigger equipment form in equipment tab
    setTimeout(() => {
      const equipmentTab = document.querySelector('[data-tab="equipment-master"]')!;
      (equipmentTab as HTMLElement).click();
    }, 100);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-3xl font-bold">Operations</h1>
          <p className="text-muted-foreground">Manage equipment, maintenance, and work orders</p>
        </div>
        <div className="flex gap-2">
          <Button size="sm" onClick={handleCreateWorkOrder}>
            <Plus className="h-4 w-4 mr-2" />
            Work Order
          </Button>
          <Button size="sm" variant="outline" onClick={handleCreateEquipment}>
            <Plus className="h-4 w-4 mr-2" />
            Equipment
          </Button>
        </div>
      </div>

      {/* Key Metrics - Clean and Valuable */}
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

      {/* Main Content - Enhanced with Rental */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="dashboard" className="flex items-center gap-2">
            <BarChart3 className="h-4 w-4" />
            Dashboard
          </TabsTrigger>
          <TabsTrigger value="equipment" className="flex items-center gap-2">
            <Package className="h-4 w-4" />
            Equipment
          </TabsTrigger>
          <TabsTrigger value="rental" className="flex items-center gap-2">
            <DollarSign className="h-4 w-4" />
            Rental
          </TabsTrigger>
        </TabsList>
        
        {/* Operations Dashboard - Direct content, no nested tabs */}
        <TabsContent value="dashboard" className="space-y-4">
          <ModernOperationsDashboard />
        </TabsContent>
        
        {/* Equipment Management */}
        <TabsContent value="equipment" className="space-y-4">
          <ModernEquipmentTab />
        </TabsContent>
        
        {/* Rental Management - NEW */}
        <TabsContent value="rental" className="space-y-4">
          <ModernRentalTab />
        </TabsContent>
      </Tabs>
    </div>
  );
}
