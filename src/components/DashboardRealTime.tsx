import React, { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { trpc } from '@/lib/trpc';
import { 
  Activity, 
  WifiOff
} from 'lucide-react';

export const DashboardRealTime: React.FC = () => {
  // Real data from tRPC queries
  const { data: ordersData } = trpc.purchase.listPurchaseOrders.useQuery({ limit: 100 });
  
  // Calculate real metrics
  const metrics = useMemo(() => {
    const activeOrders = ordersData?.orders?.filter((order: any) => 
      order.status === 'OPEN' || order.status === 'IN_PROGRESS'
    ).length || 0;
    const pendingApprovals = ordersData?.orders?.filter((order: any) => 
      order.status === 'PENDING_APPROVAL'
    ).length || 0;

    return {
      activeOrders,
      pendingApprovals,
    };
  }, [ordersData]);

  return (
    <div className="space-y-6">


      {/* Real-time Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Orders</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.activeOrders}</div>
            <p className="text-xs text-muted-foreground">
              {metrics.pendingApprovals} pending approval
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">System Status</CardTitle>
            <div className="flex items-center gap-2">
              <Badge variant="secondary">
                Development
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-sm text-muted-foreground">
              Real-time data from database
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}; 