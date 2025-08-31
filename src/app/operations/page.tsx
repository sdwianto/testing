'use client';

import { useState, Suspense, lazy } from 'react';
import { ResponsiveShell } from '@/components/layouts/ResponsiveShell';
import { ModernOperationsPage } from '@/components/operations/ModernOperationsPage';
import { LoadingSpinner } from '@/components/ui/loading-spinner';

// FP3: Dynamic import for heavy modules (lazy-load modern components)
const ModernOperationsPageLazy = lazy(() => import('@/components/operations/ModernOperationsPage').then(m => ({ default: m.ModernOperationsPage })));

// ========================================
// MODERN OPERATIONS PAGE (P1 - Operations Module)
// Enterprise-grade Operations Management System
// ========================================



export default function OperationsPage() {
  return (
    <ResponsiveShell>
      <Suspense fallback={<LoadingSpinner />}>
        <ModernOperationsPage />
      </Suspense>
    </ResponsiveShell>
  );
}
