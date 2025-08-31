'use client';

import { EnhancedEquipmentMaster } from '@/components/operations/EnhancedEquipmentMaster';
import { WorkOrderManagement } from '@/components/operations/WorkOrderManagement';
import { MaintenanceManagement } from '@/components/operations/MaintenanceManagement';
import { PerformanceAnalytics } from '@/components/operations/PerformanceAnalytics';
import { EquipmentLifecycleManagement } from '@/components/operations/EquipmentLifecycleManagement';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

// ========================================
// EQUIPMENT TAB COMPONENT
// Complete Equipment Management System
// ========================================

export function EquipmentTab() {
  return (
    <div className="space-y-6">
      <Tabs defaultValue="equipment-master" className="w-full">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="equipment-master">Equipment Master</TabsTrigger>
          <TabsTrigger value="work-orders">Work Orders</TabsTrigger>
          <TabsTrigger value="maintenance">Maintenance</TabsTrigger>
          <TabsTrigger value="performance">Performance</TabsTrigger>
          <TabsTrigger value="lifecycle">Lifecycle</TabsTrigger>
        </TabsList>
        
        {/* Equipment Master Tab */}
        <TabsContent value="equipment-master" className="space-y-4">
          <EnhancedEquipmentMaster />
        </TabsContent>
        
        {/* Work Orders Tab */}
        <TabsContent value="work-orders" className="space-y-4">
          <WorkOrderManagement />
        </TabsContent>
        
        {/* Maintenance Tab */}
        <TabsContent value="maintenance" className="space-y-4">
          <MaintenanceManagement />
        </TabsContent>
        
        {/* Performance Tab */}
        <TabsContent value="performance" className="space-y-4">
          <PerformanceAnalytics />
        </TabsContent>
        
        {/* Lifecycle Tab */}
        <TabsContent value="lifecycle" className="space-y-4">
          <EquipmentLifecycleManagement />
        </TabsContent>
      </Tabs>
    </div>
  );
}
