'use client';

import { OperationsDashboard } from '@/components/dashboard/OperationsDashboard';

// ========================================
// DASHBOARD TAB COMPONENT
// Separated for better code splitting
// ========================================

export function DashboardTab() {
  return (
    <div className="space-y-4">
      <OperationsDashboard />
    </div>
  );
}
