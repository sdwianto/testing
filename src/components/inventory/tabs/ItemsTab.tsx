'use client';

import { ItemMaster } from '@/components/inventory/ItemMaster';

// ========================================
// ITEMS TAB COMPONENT
// Separated for better code splitting
// ========================================

export function ItemsTab() {
  return (
    <div className="space-y-4">
      <ItemMaster />
    </div>
  );
}
