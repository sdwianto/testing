'use client';

// Performance Rule FP6: Memoization for expensive pure computations
import { memo } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  DollarSign, 
  Package, 
  TrendingUp, 
  AlertTriangle,
  Clock,
  CreditCard
} from 'lucide-react';
import type { RentalMetrics } from '../types/rental';

// ========================================
// RENTAL METRICS CARDS - Performance Optimized
// Follows FP6: Memoize expensive pure computations
// ========================================

interface RentalMetricsCardsProps {
  metrics: RentalMetrics;
  isLoading?: boolean;
}

// FP6: Pure component with memoization for performance
export const RentalMetricsCards = memo(function RentalMetricsCards({ 
  metrics, 
  isLoading = false 
}: RentalMetricsCardsProps) {
  
  // FP6: Avoid unnecessary computations in render
  const formatCurrency = (amount: number) => 
    new Intl.NumberFormat('en-US', { 
      style: 'currency', 
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);

  const formatPercentage = (value: number) => 
    `${Math.round(value)}%`;

  if (!metrics || isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        {Array.from({ length: 6 }).map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardContent className="pt-6">
              <div className="flex items-center">
                <div className="h-4 w-4 bg-muted rounded mr-2" />
                <div className="space-y-2 flex-1">
                  <div className="h-3 bg-muted rounded w-20" />
                  <div className="h-6 bg-muted rounded w-16" />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  const cards = [
    {
      id: 'active-rentals',
      title: 'Active Rentals',
      value: metrics.totalActiveRentals,
      icon: Package,
      color: 'text-blue-600',
      bgColor: 'text-blue-500',
      format: (val: number) => val.toString()
    },
    {
      id: 'total-revenue',
      title: 'Total Revenue',
      value: metrics.totalRevenue,
      icon: DollarSign,
      color: 'text-green-600',
      bgColor: 'text-green-500',
      format: formatCurrency
    },
    {
      id: 'utilization',
      title: 'Equipment Utilization',
      value: metrics.equipmentUtilization,
      icon: TrendingUp,
      color: 'text-purple-600',
      bgColor: 'text-purple-500',
      format: formatPercentage
    },
    {
      id: 'avg-duration',
      title: 'Avg Duration (Days)',
      value: metrics.averageRentalDuration,
      icon: Clock,
      color: 'text-orange-600',
      bgColor: 'text-orange-500',
      format: (val: number) => Math.round(val).toString()
    },
    {
      id: 'overdue',
      title: 'Overdue Rentals',
      value: metrics.overdueRentals,
      icon: AlertTriangle,
      color: 'text-red-600',
      bgColor: 'text-red-500',
      format: (val: number) => val.toString(),
      badge: metrics.overdueRentals > 0 ? 'urgent' : undefined
    },
    {
      id: 'pending-payments',
      title: 'Pending Payments',
      value: metrics.pendingPayments,
      icon: CreditCard,
      color: 'text-yellow-600',
      bgColor: 'text-yellow-500',
      format: formatCurrency,
      badge: metrics.pendingPayments > 1000 ? 'warning' : undefined
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
      {cards.map((card) => {
        const IconComponent = card.icon;
        
        return (
          <Card key={card.id} className="relative">
            <CardContent className="pt-6">
              <div className="flex items-center">
                <IconComponent className={`h-4 w-4 ${card.bgColor}`} />
                <div className="ml-2 flex-1">
                  <p className="text-sm font-medium text-muted-foreground">
                    {card.title}
                  </p>
                  <div className="flex items-center gap-2">
                    <p className={`text-2xl font-bold ${card.color}`}>
                      {card.format(card.value)}
                    </p>
                    {card.badge && (
                      <Badge variant={card.badge === 'urgent' ? 'destructive' : 'secondary'}>
                        {card.badge}
                      </Badge>
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
});

RentalMetricsCards.displayName = 'RentalMetricsCards';
