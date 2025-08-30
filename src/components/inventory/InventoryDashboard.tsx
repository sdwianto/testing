'use client';

/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/no-floating-promises */
/* eslint-disable @typescript-eslint/prefer-nullish-coalescing */

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Package, 
  TrendingUp, 
  TrendingDown, 
  AlertTriangle, 
  CheckCircle,
  RefreshCw,
  BarChart3
} from 'lucide-react';
import { trpc } from '@/lib/trpc';
import { format } from 'date-fns';

// ========================================
// INVENTORY DASHBOARD COMPONENT (P1 - Inventory Module)
// Per Implementation Guide: Inventory dashboards & KPIs
// ========================================

interface InventoryDashboardProps {
  onSuccess?: () => void;
}

export function InventoryDashboard({ onSuccess }: InventoryDashboardProps) {
  const [dateRange, setDateRange] = useState({
    from: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // 30 days ago
    to: new Date(),
  });

  // tRPC queries
  const { data: stockLevels, isLoading: stockLoading, refetch: refetchStock } = trpc.inv.getStockLevels.useQuery({});
  
  const { data: inventoryTxs, isLoading: txLoading } = trpc.inv.getInventoryTransactions.useQuery({
    from: dateRange.from.toISOString(),
    to: dateRange.to.toISOString(),
  });

  const { data: lowStockItems } = trpc.inv.getLowStockItems.useQuery({
    threshold: 10,
  });

  const { data: topItems } = trpc.inv.getTopMovingItems.useQuery({
    from: dateRange.from.toISOString(),
    to: dateRange.to.toISOString(),
    limit: 10,
  });

  const handleRefresh = () => {
    void refetchStock();
  };

  // Calculate KPIs
  const totalItems = stockLevels?.length || 0;
  const lowStockCount = stockLevels?.filter((s: any) => s.totalOnHand <= s.reorderPoint).length || 0;
  const outOfStockCount = stockLevels?.filter((s: any) => s.totalOnHand === 0).length || 0;
  const totalValue = stockLevels?.reduce((sum: number, stock: any) => 
    sum + (stock.totalOnHand * Number(stock.item?.avgCost || 0)), 0) || 0;

  // Transaction analysis
  const grnCount = inventoryTxs?.filter((tx: any) => tx.txType === 'GRN').length || 0;
  const giCount = inventoryTxs?.filter((tx: any) => tx.txType === 'GI').length || 0;
  const totalTransactions = inventoryTxs?.length || 0;

  // Calculate turnover (simplified)
  const avgInventoryValue = totalValue / 2; // Simplified average
  const costOfGoodsSold = inventoryTxs
    ?.filter((tx: any) => tx.txType === 'GI')
    ?.reduce((sum: number, tx: any) => sum + (Math.abs(tx.qty) * Number(tx.unitCost)), 0) || 0;
  const turnoverRatio = avgInventoryValue > 0 ? costOfGoodsSold / avgInventoryValue : 0;

  if (stockLoading || txLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Inventory Dashboard</h2>
          <p className="text-gray-600">
            {format(dateRange.from, "MMM dd, yyyy")} - {format(dateRange.to, "MMM dd, yyyy")}
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Button variant="outline" size="sm" onClick={handleRefresh}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center">
              <Package className="h-4 w-4 text-muted-foreground" />
              <div className="ml-2">
                <p className="text-sm font-medium text-muted-foreground">Total Items</p>
                <p className="text-2xl font-bold">{totalItems}</p>
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
                  ${totalValue.toLocaleString()}
                </p>
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
                <p className="text-2xl font-bold text-yellow-600">{lowStockCount}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center">
              <BarChart3 className="h-4 w-4 text-blue-500" />
              <div className="ml-2">
                <p className="text-sm font-medium text-muted-foreground">Turnover Ratio</p>
                <p className="text-2xl font-bold text-blue-600">
                  {turnoverRatio.toFixed(2)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Transaction Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <TrendingUp className="h-5 w-5 mr-2 text-green-500" />
              Goods Receipt (GRN)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-green-600">{grnCount}</div>
            <p className="text-sm text-muted-foreground">Receipts this period</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <TrendingDown className="h-5 w-5 mr-2 text-red-500" />
              Goods Issue (GI)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-red-600">{giCount}</div>
            <p className="text-sm text-muted-foreground">Issues this period</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <BarChart3 className="h-5 w-5 mr-2 text-blue-500" />
              Total Transactions
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-blue-600">{totalTransactions}</div>
            <p className="text-sm text-muted-foreground">All transactions</p>
          </CardContent>
        </Card>
      </div>

      {/* Stock Status Overview */}
      <Card>
        <CardHeader>
          <CardTitle>Stock Status Overview</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div className="flex items-center">
                <CheckCircle className="h-5 w-5 text-green-500 mr-2" />
                <span className="font-medium">In Stock</span>
              </div>
              <Badge variant="default" className="bg-green-100 text-green-800">
                {totalItems - lowStockCount - outOfStockCount}
              </Badge>
            </div>

            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div className="flex items-center">
                <AlertTriangle className="h-5 w-5 text-yellow-500 mr-2" />
                <span className="font-medium">Low Stock</span>
              </div>
              <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">
                {lowStockCount}
              </Badge>
            </div>

            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div className="flex items-center">
                <AlertTriangle className="h-5 w-5 text-red-500 mr-2" />
                <span className="font-medium">Out of Stock</span>
              </div>
              <Badge variant="destructive">
                {outOfStockCount}
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Top Moving Items */}
      {topItems && topItems.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Top Moving Items</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {topItems.map((item: any, index: number) => (
                <div key={item.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center">
                    <div className="w-8 h-8 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-sm font-medium mr-3">
                      {index + 1}
                    </div>
                    <div>
                      <div className="font-medium">{item.number}</div>
                      <div className="text-sm text-gray-500">{item.description}</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-medium">{item.totalQuantity} units</div>
                    <div className="text-sm text-gray-500">
                      ${(item.totalQuantity * Number(item.avgCost || 0)).toFixed(2)} value
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Low Stock Alerts */}
      {lowStockItems && lowStockItems.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-yellow-500" />
              Low Stock Alerts
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {lowStockItems.slice(0, 5).map((item: any) => (
                <div key={item.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div>
                    <div className="font-medium">{item.number} - {item.description}</div>
                    <div className="text-sm text-gray-500">
                      Current: {item.totalOnHand} | Reorder Point: {item.reorderPoint}
                    </div>
                  </div>
                  <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">
                    Reorder Required
                  </Badge>
                </div>
              ))}
              {lowStockItems.length > 5 && (
                <div className="text-sm text-gray-500 text-center pt-2">
                  And {lowStockItems.length - 5} more items need reordering...
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
