'use client';

// Performance Rules: FP3 Dynamic imports, FP1 Server Components when possible
import { useState, Suspense, lazy } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { 
  BarChart3, 
  FileText, 
  CreditCard,
  TrendingUp
} from 'lucide-react';

// FP3: Dynamic imports for heavy modules (lazy-load rental components)
const RentalDashboard = lazy(() => import('./rental/RentalDashboard').then(m => ({ default: m.RentalDashboard })));
const RentalManagement = lazy(() => import('./rental/RentalManagement').then(m => ({ default: m.RentalManagement })));

// Future components for P2/P4 phases
const RentalBilling = lazy(() => Promise.resolve({ 
  default: () => (
    <div className="text-center py-12">
      <CreditCard className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
      <h3 className="text-lg font-medium mb-2">Rental Billing</h3>
      <p className="text-muted-foreground">Billing and invoicing features coming in P2 Finance Integration</p>
    </div>
  )
}));

const RentalReports = lazy(() => Promise.resolve({ 
  default: () => (
    <div className="text-center py-12">
      <TrendingUp className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
      <h3 className="text-lg font-medium mb-2">Rental Reports</h3>
      <p className="text-muted-foreground">Advanced reporting and analytics coming in P4 BI Integration</p>
    </div>
  )
}));

// ========================================
// RENTAL TAB - Performance Optimized
// Follows FP3: Dynamic imports for heavy modules
// ========================================

export function ModernRentalTab() {
  const [activeTab, setActiveTab] = useState('dashboard');

  return (
    <div className="space-y-6">
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="dashboard" className="flex items-center gap-2">
            <BarChart3 className="h-4 w-4" />
            Dashboard
          </TabsTrigger>
          <TabsTrigger value="management" className="flex items-center gap-2">
            <FileText className="h-4 w-4" />
            Contracts
          </TabsTrigger>
          <TabsTrigger value="billing" className="flex items-center gap-2">
            <CreditCard className="h-4 w-4" />
            Billing
          </TabsTrigger>
          <TabsTrigger value="reports" className="flex items-center gap-2">
            <TrendingUp className="h-4 w-4" />
            Reports
          </TabsTrigger>
        </TabsList>
        
        {/* Rental Dashboard - Core functionality */}
        <TabsContent value="dashboard" className="space-y-4">
          {/* FP4: Suspense boundaries for streaming */}
          <Suspense fallback={<LoadingSpinner />}>
            <RentalDashboard />
          </Suspense>
        </TabsContent>
        
        {/* Rental Management - Contract management */}
        <TabsContent value="management" className="space-y-4">
          <Suspense fallback={<LoadingSpinner />}>
            <RentalManagement />
          </Suspense>
        </TabsContent>
        
        {/* Rental Billing - P2 Future feature */}
        <TabsContent value="billing" className="space-y-4">
          <Suspense fallback={<LoadingSpinner />}>
            <RentalBilling />
          </Suspense>
        </TabsContent>
        
        {/* Rental Reports - P4 Future feature */}
        <TabsContent value="reports" className="space-y-4">
          <Suspense fallback={<LoadingSpinner />}>
            <RentalReports />
          </Suspense>
        </TabsContent>
      </Tabs>
    </div>
  );
}
