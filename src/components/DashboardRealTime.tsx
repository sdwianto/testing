import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Activity, 
  WifiOff
} from 'lucide-react';

interface DashboardMetrics {
  activeOrders: number;
  pendingApprovals: number;
}

export const DashboardRealTime: React.FC = () => {
  const metrics: DashboardMetrics = {
    activeOrders: 45,
    pendingApprovals: 8,
  };

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
              Running in development mode with mock data
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}; 