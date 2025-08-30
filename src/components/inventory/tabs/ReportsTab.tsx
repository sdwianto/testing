'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { BarChart3, TrendingUp, AlertTriangle, Package } from 'lucide-react';

// ========================================
// REPORTS TAB COMPONENT
// Separated for better code splitting
// ========================================

export function ReportsTab() {
  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>Inventory Reports</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Button variant="outline" className="h-20 flex flex-col items-center justify-center gap-2">
              <BarChart3 className="h-6 w-6" />
              <span className="text-sm">Stock Level Report</span>
            </Button>
            <Button variant="outline" className="h-20 flex flex-col items-center justify-center gap-2">
              <TrendingUp className="h-6 w-6" />
              <span className="text-sm">Movement Analysis</span>
            </Button>
            <Button variant="outline" className="h-20 flex flex-col items-center justify-center gap-2">
              <AlertTriangle className="h-6 w-6" />
              <span className="text-sm">Low Stock Report</span>
            </Button>
            <Button variant="outline" className="h-20 flex flex-col items-center justify-center gap-2">
              <Package className="h-6 w-6" />
              <span className="text-sm">Inventory Valuation</span>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
