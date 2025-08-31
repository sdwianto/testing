'use client';

import { ModernEquipmentMaster } from '@/components/operations/ModernEquipmentMaster';
import { ModernWorkOrderManagement } from '@/components/operations/ModernWorkOrderManagement';
import { ModernMaintenanceManagement } from '@/components/operations/ModernMaintenanceManagement';
import { ModernPerformanceAnalytics } from '@/components/operations/ModernPerformanceAnalytics';
import { ModernEquipmentLifecycleManagement } from '@/components/operations/ModernEquipmentLifecycleManagement';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Package, FileText, Settings, BarChart3, 
  RotateCcw, Wrench, Calendar, Activity
} from 'lucide-react';

// ========================================
// MODERN EQUIPMENT TAB COMPONENT
// Enterprise-grade Equipment Management System
// ========================================

export function ModernEquipmentTab() {
  return (
    <div className="space-y-6">
      <Tabs defaultValue="equipment-master" className="w-full">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="equipment-master" className="flex items-center gap-2">
            <Package className="h-4 w-4" />
            Equipment
          </TabsTrigger>
          <TabsTrigger value="work-orders" className="flex items-center gap-2">
            <FileText className="h-4 w-4" />
            Work Orders
          </TabsTrigger>
          <TabsTrigger value="maintenance" className="flex items-center gap-2">
            <Settings className="h-4 w-4" />
            Maintenance
          </TabsTrigger>
          <TabsTrigger value="performance" className="flex items-center gap-2">
            <BarChart3 className="h-4 w-4" />
            Performance
          </TabsTrigger>
          <TabsTrigger value="lifecycle" className="flex items-center gap-2">
            <RotateCcw className="h-4 w-4" />
            Lifecycle
          </TabsTrigger>
        </TabsList>
        
        {/* Equipment Master Tab */}
        <TabsContent value="equipment-master" className="space-y-4">
          <ModernEquipmentMaster />
        </TabsContent>
        
        {/* Work Orders Tab */}
        <TabsContent value="work-orders" className="space-y-4">
          <ModernWorkOrderManagement />
        </TabsContent>
        
        {/* Maintenance Tab */}
        <TabsContent value="maintenance" className="space-y-4">
          <ModernMaintenanceManagement />
        </TabsContent>
        
        {/* Performance Tab */}
        <TabsContent value="performance" className="space-y-4">
          <ModernPerformanceAnalytics />
        </TabsContent>
        
        {/* Lifecycle Tab */}
        <TabsContent value="lifecycle" className="space-y-4">
          <ModernEquipmentLifecycleManagement />
        </TabsContent>
      </Tabs>
    </div>
  );
}
