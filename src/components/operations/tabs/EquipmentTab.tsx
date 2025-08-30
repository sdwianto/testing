'use client';

import { EquipmentMaster } from '@/components/operations/EquipmentMaster';

// ========================================
// EQUIPMENT TAB COMPONENT
// Separated for better code splitting
// ========================================

export function EquipmentTab() {
  return (
    <div className="space-y-4">
      <EquipmentMaster />
    </div>
  );
}
