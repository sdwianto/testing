'use client';

import { UsageLogging } from '@/components/operations/UsageLogging';

// ========================================
// USAGE LOGGING TAB COMPONENT
// Separated for better code splitting
// ========================================

export function UsageTab() {
  return (
    <div className="space-y-4">
      <UsageLogging />
    </div>
  );
}
