'use client';

/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/prefer-nullish-coalescing */

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Search, Package, AlertTriangle, TrendingUp, TrendingDown } from 'lucide-react';
import { trpc } from '@/lib/trpc';

// ========================================
// STOCK MANAGEMENT COMPONENT (P1 - Inventory Module)
// Per Implementation Guide: Multi-store stock, stock level monitoring
// ========================================

interface StockManagementProps {
  onSuccess?: () => void;
}

export function StockManagement({ onSuccess }: StockManagementProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [siteFilter, setSiteFilter] = useState<string>('all');
  const [lowStockFilter, setLowStockFilter] = useState<boolean>(false);

  // tRPC queries
  const { data: stockLevels, isLoading } = trpc.inventory.getStockLevels.useQuery({
    siteId: siteFilter === 'all' ? undefined : siteFilter,
  });

  const { data: sites } = trpc.core.getSites.useQuery();

  const { data: lowStockItems } = trpc.inventory.getLowStockItems.useQuery({
    threshold: 10, // Items with stock below 10
  });

  const filteredStock = stockLevels?.filter((stock: any) => {
    const matchesSearch = stock.item?.number?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         stock.item?.description?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesLowStock = lowStockFilter ? stock.totalOnHand <= stock.reorderPoint : true;
    return matchesSearch && matchesLowStock;
  }) || [];

  const totalItems = stockLevels?.length || 0;
  const lowStockCount = stockLevels?.filter((s: any) => s.totalOnHand <= s.reorderPoint).length || 0;
  const outOfStockCount = stockLevels?.filter((s: any) => s.totalOnHand === 0).length || 0;
  const totalValue = stockLevels?.reduce((sum: number, stock: any) => 
    sum + (stock.totalOnHand * Number(stock.item?.avgCost || 0)), 0) || 0;

  if (isLoading) {
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
          <h2 className="text-2xl font-bold text-gray-900">Stock Management</h2>
          <p className="text-gray-600">Monitor inventory levels across all locations</p>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
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
              <AlertTriangle className="h-4 w-4 text-red-500" />
              <div className="ml-2">
                <p className="text-sm font-medium text-muted-foreground">Out of Stock</p>
                <p className="text-2xl font-bold text-red-600">{outOfStockCount}</p>
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
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Search items..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <Select value={siteFilter} onValueChange={setSiteFilter}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Filter by site" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Sites</SelectItem>
                {sites?.map((site: any) => (
                  <SelectItem key={site.id} value={site.id}>
                    {site.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={lowStockFilter.toString()} onValueChange={(value) => setLowStockFilter(value === 'true')}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Stock filter" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="false">All Items</SelectItem>
                <SelectItem value="true">Low Stock Only</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Stock Levels Table */}
      <Card>
        <CardHeader>
          <CardTitle>Stock Levels ({filteredStock.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Item</TableHead>
                <TableHead>Site</TableHead>
                <TableHead>On Hand</TableHead>
                <TableHead>Committed</TableHead>
                <TableHead>On Order</TableHead>
                <TableHead>Reorder Point</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Value</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredStock.map((stock: any) => {
                const getStockStatus = () => {
                  if (stock.totalOnHand === 0) {
                    return <Badge variant="destructive">Out of Stock</Badge>;
                  }
                  if (stock.totalOnHand <= stock.reorderPoint) {
                    return <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">Low Stock</Badge>;
                  }
                  return <Badge variant="default" className="bg-green-100 text-green-800">In Stock</Badge>;
                };

                const itemValue = stock.totalOnHand * Number(stock.item?.avgCost || 0);

                return (
                  <TableRow key={`${stock.itemId}-${stock.siteId}`}>
                    <TableCell>
                      <div>
                        <div className="font-medium">{stock.item?.number}</div>
                        <div className="text-sm text-gray-500">{stock.item?.description}</div>
                      </div>
                    </TableCell>
                    <TableCell>{stock.site?.name || stock.siteId}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{stock.totalOnHand}</span>
                        {stock.totalOnHand <= stock.reorderPoint && (
                          <TrendingDown className="h-4 w-4 text-red-500" />
                        )}
                      </div>
                    </TableCell>
                    <TableCell>{stock.totalCommitted}</TableCell>
                    <TableCell>{stock.totalOnOrder}</TableCell>
                    <TableCell>{stock.reorderPoint}</TableCell>
                    <TableCell>{getStockStatus()}</TableCell>
                    <TableCell>${itemValue.toFixed(2)}</TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

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
                  And {lowStockItems.length - 5} more items...
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
