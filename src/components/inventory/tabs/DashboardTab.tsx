'use client';

import { InventoryDashboard } from '@/components/inventory/InventoryDashboard';

// ========================================
// DASHBOARD TAB COMPONENT
// Separated for better code splitting
// ========================================

export function DashboardTab() {
  return (
    <div className="space-y-4">
      <InventoryDashboard />
    </div>
  );
}
