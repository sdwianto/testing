'use client';

import { ModernEquipmentMaster } from '@/components/operations/ModernEquipmentMaster';
import { ModernWorkOrderManagement } from '@/components/operations/ModernWorkOrderManagement';
import { ModernMaintenanceManagement } from '@/components/operations/ModernMaintenanceManagement';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Package, FileText, Settings
} from 'lucide-react';

// ========================================
// EQUIPMENT MANAGEMENT - CLEANED & SIMPLIFIED
// Focus on core equipment operations
// ========================================

export function ModernEquipmentTab() {
  return (
    <div className="space-y-6">
      <Tabs defaultValue="equipment-master" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="equipment-master" className="flex items-center gap-2">
            <Package className="h-4 w-4" />
            Equipment Master
          </TabsTrigger>
          <TabsTrigger value="work-orders" className="flex items-center gap-2">
            <FileText className="h-4 w-4" />
            Work Orders
          </TabsTrigger>
          <TabsTrigger value="maintenance" className="flex items-center gap-2">
            <Settings className="h-4 w-4" />
            Maintenance
          </TabsTrigger>
        </TabsList>
        
        {/* Equipment Master - Core equipment data */}
        <TabsContent value="equipment-master" className="space-y-4">
          <ModernEquipmentMaster />
        </TabsContent>
        
        {/* Work Orders - Active work management */}
        <TabsContent value="work-orders" className="space-y-4">
          <ModernWorkOrderManagement />
        </TabsContent>
        
        {/* Maintenance - Preventive maintenance scheduling */}
        <TabsContent value="maintenance" className="space-y-4">
          <ModernMaintenanceManagement />
        </TabsContent>
      </Tabs>
    </div>
  );
}