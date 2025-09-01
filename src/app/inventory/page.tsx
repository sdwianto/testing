'use client';

import { useState, Suspense, lazy, useMemo } from 'react';
import { ResponsiveShell } from '@/components/layouts/ResponsiveShell';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { trpc } from '@/lib/trpc';
import { 
  Package, 
  TrendingUp, 
  AlertTriangle, 
  BarChart3,
  ShoppingCart,
  FileText,
  Plus
} from 'lucide-react';

// FP3: Dynamic import for heavy modules (lazy-load tab components)
const DashboardTab = lazy(() => import('@/components/inventory/tabs/DashboardTab').then(m => ({ default: m.DashboardTab })));
const ItemsTab = lazy(() => import('@/components/inventory/tabs/ItemsTab').then(m => ({ default: m.ItemsTab })));
const StockTab = lazy(() => import('@/components/inventory/tabs/StockTab').then(m => ({ default: m.StockTab })));
const TransactionsTab = lazy(() => import('@/components/inventory/tabs/TransactionsTab').then(m => ({ default: m.TransactionsTab })));
const PurchaseTab = lazy(() => import('@/components/inventory/tabs/PurchaseTab').then(m => ({ default: m.PurchaseTab })));
const ReportsTab = lazy(() => import('@/components/inventory/tabs/ReportsTab').then(m => ({ default: m.ReportsTab })));

// Form components (lazy-loaded when needed)
const GRNForm = lazy(() => import('@/components/inventory/GRNForm').then(m => ({ default: m.GRNForm })));
const GIForm = lazy(() => import('@/components/inventory/GIForm').then(m => ({ default: m.GIForm })));
const PurchaseRequestForm = lazy(() => import('@/components/inventory/PurchaseRequestForm').then(m => ({ default: m.PurchaseRequestForm })));

// ========================================
// INVENTORY PAGE (P1 - Inventory Module)
// Per Implementation Guide: Item master, multi-store stock, GRN/GI, basic PR→PO
// ========================================



export default function InventoryPage() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [showGRNForm, setShowGRNForm] = useState(false);
  const [showGIForm, setShowGIForm] = useState(false);
  const [showPRForm, setShowPRForm] = useState(false);

  // Real data from tRPC queries
  const { data: itemsData } = trpc.inventory.listItems.useQuery({ limit: 1000 });
  const { data: purchaseRequestsData } = trpc.purchase.listPurchaseRequests.useQuery({ limit: 100 });
  
  // Calculate real statistics
  const quickStats = useMemo(() => {
    const totalItems = itemsData?.items?.length || 0;
    const lowStockItems = itemsData?.items?.filter((item: any) => 
      item.branches?.some((branch: any) => 
        branch.locations?.some((location: any) => location.quantity <= location.reorderPoint)
      )
    ).length || 0;
    const totalValue = itemsData?.items?.reduce((sum: number, item: any) => 
      sum + (item.branches?.reduce((branchSum: number, branch: any) => 
        branchSum + (branch.locations?.reduce((locationSum: number, location: any) => 
          locationSum + (location.quantity * (location.averageCost || 0)), 0) || 0), 0) || 0), 0
    ) || 0;
    const pendingGRN = purchaseRequestsData?.requests?.filter((pr: any) => 
      pr.status === 'APPROVED' && pr.items?.some((item: any) => item.status === 'PENDING_GRN')
    ).length || 0;

    return {
      totalItems,
      lowStockItems,
      totalValue,
      pendingGRN
    };
  }, [itemsData, purchaseRequestsData]);

  return (
    <ResponsiveShell>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Inventory</h1>
            <p className="text-gray-600 dark:text-gray-400">Manage items, track stock levels, and process transactions</p>
          </div>
          <div className="flex gap-2">
            <Button onClick={() => setShowGRNForm(true)} size="sm">
              <Plus className="h-4 w-4 mr-2" />
              GRN
            </Button>
            <Button onClick={() => setShowGIForm(true)} size="sm" variant="outline">
              <Plus className="h-4 w-4 mr-2" />
              GI
            </Button>
            <Button onClick={() => setShowPRForm(true)} size="sm" variant="outline">
              <Plus className="h-4 w-4 mr-2" />
              PR
            </Button>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center">
                <Package className="h-4 w-4 text-muted-foreground" />
                <div className="ml-2">
                  <p className="text-sm font-medium text-muted-foreground">Total Items</p>
                  <p className="text-2xl font-bold">{quickStats.totalItems}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center">
                <AlertTriangle className="h-4 w-4 text-yellow-500" />
                <div className="ml-2">
                  <p className="text-sm font-medium text-muted-foreground">Low Stock</p>
                  <p className="text-2xl font-bold text-yellow-600">{quickStats.lowStockItems}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center">
                <TrendingUp className="h-4 w-4 text-green-500" />
                <div className="ml-2">
                  <p className="text-sm font-medium text-muted-foreground">Total Value</p>
                  <p className="text-2xl font-bold text-green-600">
                    ${(quickStats.totalValue / 1000000).toFixed(1)}M
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center">
                <FileText className="h-4 w-4 text-blue-500" />
                <div className="ml-2">
                  <p className="text-sm font-medium text-muted-foreground">Pending GRN</p>
                  <p className="text-2xl font-bold text-blue-600">{quickStats.pendingGRN}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
          <TabsList className="grid w-full grid-cols-6">
            <TabsTrigger value="dashboard" className="flex items-center gap-2">
              <BarChart3 className="h-4 w-4" />
              Dashboard
            </TabsTrigger>
            <TabsTrigger value="items" className="flex items-center gap-2">
              <Package className="h-4 w-4" />
              Items
            </TabsTrigger>
            <TabsTrigger value="stock" className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4" />
              Stock
            </TabsTrigger>
            <TabsTrigger value="transactions" className="flex items-center gap-2">
              <ShoppingCart className="h-4 w-4" />
              Transactions
            </TabsTrigger>
            <TabsTrigger value="purchase" className="flex items-center gap-2">
              <FileText className="h-4 w-4" />
              Purchase
            </TabsTrigger>
            <TabsTrigger value="reports" className="flex items-center gap-2">
              <BarChart3 className="h-4 w-4" />
              Reports
            </TabsTrigger>
          </TabsList>

          <TabsContent value="dashboard" className="space-y-4">
            <Suspense fallback={<LoadingSpinner />}>
              <DashboardTab />
            </Suspense>
          </TabsContent>

          <TabsContent value="items" className="space-y-4">
            <Suspense fallback={<LoadingSpinner />}>
              <ItemsTab />
            </Suspense>
          </TabsContent>

          <TabsContent value="stock" className="space-y-4">
            <Suspense fallback={<LoadingSpinner />}>
              <StockTab />
            </Suspense>
          </TabsContent>

          <TabsContent value="transactions" className="space-y-4">
            <Suspense fallback={<LoadingSpinner />}>
              <TransactionsTab 
                onShowGRNForm={() => setShowGRNForm(true)}
                onShowGIForm={() => setShowGIForm(true)}
              />
            </Suspense>
          </TabsContent>

          <TabsContent value="purchase" className="space-y-4">
            <Suspense fallback={<LoadingSpinner />}>
              <PurchaseTab 
                onShowPRForm={() => setShowPRForm(true)}
              />
            </Suspense>
          </TabsContent>

          <TabsContent value="reports" className="space-y-4">
            <Suspense fallback={<LoadingSpinner />}>
              <ReportsTab />
            </Suspense>
          </TabsContent>
        </Tabs>

        {/* Transaction Forms */}
        {showGRNForm && (
          <Suspense fallback={<LoadingSpinner />}>
            <GRNForm 
              onSuccess={() => setShowGRNForm(false)} 
              onCancel={() => setShowGRNForm(false)} 
            />
          </Suspense>
        )}

        {showGIForm && (
          <Suspense fallback={<LoadingSpinner />}>
            <GIForm 
              onSuccess={() => setShowGIForm(false)} 
              onCancel={() => setShowGIForm(false)} 
            />
          </Suspense>
        )}

        {showPRForm && (
          <Suspense fallback={<LoadingSpinner />}>
            <PurchaseRequestForm 
              onSuccess={() => setShowPRForm(false)} 
              onCancel={() => setShowPRForm(false)} 
            />
          </Suspense>
        )}
      </div>
    </ResponsiveShell>
  );
}
