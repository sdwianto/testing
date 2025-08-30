'use client';

import { StockManagement } from '@/components/inventory/StockManagement';

// ========================================
// STOCK TAB COMPONENT
// Separated for better code splitting
// ========================================

export function StockTab() {
  return (
    <div className="space-y-4">
      <StockManagement />
    </div>
  );
}
