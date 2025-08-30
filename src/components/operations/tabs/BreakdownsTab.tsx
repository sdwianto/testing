'use client';

import { BreakdownCapture } from '@/components/operations/BreakdownCapture';

// ========================================
// BREAKDOWNS TAB COMPONENT
// Separated for better code splitting
// ========================================

export function BreakdownsTab() {
  return (
    <div className="space-y-4">
      <BreakdownCapture />
    </div>
  );
}
