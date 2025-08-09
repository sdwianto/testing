import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  AlertTriangle, 
  Wrench, 
  Clock, 
  Settings,
  FileText,
  ArrowRight
} from 'lucide-react';

interface MaintenanceAlert {
  id: number;
  equipmentName: string;
  equipmentCode: string;
  alertType: 'OVERDUE' | 'EMERGENCY' | 'SCHEDULED' | 'INSPECTION';
  message: string;
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  daysOverdue?: number;
  scheduledDate?: string;
}

interface MaintenanceAlertsProps {
  alerts: MaintenanceAlert[];
  onViewAll: () => void;
  onViewAlert: (alertId: number) => void;
}

export const MaintenanceAlerts: React.FC<MaintenanceAlertsProps> = ({
  alerts,
  onViewAll,
  onViewAlert
}) => {
  const getAlertIcon = (type: string) => {
    switch (type) {
      case 'EMERGENCY': return <AlertTriangle className="h-4 w-4 text-red-500" />;
      case 'OVERDUE': return <Clock className="h-4 w-4 text-orange-500" />;
      case 'SCHEDULED': return <Settings className="h-4 w-4 text-blue-500" />;
      case 'INSPECTION': return <FileText className="h-4 w-4 text-purple-500" />;
      default: return <Wrench className="h-4 w-4 text-gray-500" />;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'CRITICAL': return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      case 'HIGH': return 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200';
      case 'MEDIUM': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
      case 'LOW': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
    }
  };

  const getAlertTypeColor = (type: string) => {
    switch (type) {
      case 'EMERGENCY': return 'bg-red-50 border-red-200 dark:bg-red-900/20 dark:border-red-800';
      case 'OVERDUE': return 'bg-orange-50 border-orange-200 dark:bg-orange-900/20 dark:border-orange-800';
      case 'SCHEDULED': return 'bg-blue-50 border-blue-200 dark:bg-blue-900/20 dark:border-blue-800';
      case 'INSPECTION': return 'bg-purple-50 border-purple-200 dark:bg-purple-900/20 dark:border-purple-800';
      default: return 'bg-gray-50 border-gray-200 dark:bg-gray-900/20 dark:border-gray-800';
    }
  };

  if (alerts.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Wrench className="h-5 w-5" />
            Maintenance Alerts
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <Wrench className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500 dark:text-gray-400">No maintenance alerts</p>
            <p className="text-sm text-gray-400 dark:text-gray-500">All equipment is up to date</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
          <div className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-red-500" />
            Maintenance Alerts
            <Badge className="bg-red-500 text-white">
              {alerts.length}
            </Badge>
          </div>
          <Button variant="outline" size="sm" className="w-full sm:w-auto" onClick={onViewAll}>
            View All
            <ArrowRight className="h-4 w-4 ml-1" />
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {alerts.slice(0, 5).map((alert) => (
            <div
              key={alert.id}
              className={`p-3 rounded-lg border ${getAlertTypeColor(alert.alertType)} cursor-pointer hover:shadow-sm transition-shadow`}
              onClick={() => onViewAlert(alert.id)}
            >
              <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                <div className="flex items-start gap-3">
                  {getAlertIcon(alert.alertType)}
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="font-medium text-sm">{alert.equipmentName}</h4>
                      <span className="text-xs text-muted-foreground">({alert.equipmentCode})</span>
                    </div>
                    <p className="text-sm text-muted-foreground mb-2">{alert.message}</p>
                    <div className="flex flex-wrap items-center gap-2">
                      <Badge className={getPriorityColor(alert.priority)}>
                        {alert.priority}
                      </Badge>
                      {alert.daysOverdue && (
                        <Badge variant="destructive" className="text-xs">
                          {alert.daysOverdue} days overdue
                        </Badge>
                      )}
                      {alert.scheduledDate && (
                        <span className="text-xs text-muted-foreground">
                          Scheduled: {alert.scheduledDate}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
                <ArrowRight className="h-4 w-4 text-muted-foreground hidden sm:block" />
              </div>
            </div>
          ))}
        </div>
        
        {alerts.length > 5 && (
          <div className="mt-4 pt-3 border-t">
            <Button variant="outline" size="sm" className="w-full" onClick={onViewAll}>
              View {alerts.length - 5} more alerts
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default MaintenanceAlerts;
