import * as React from "react"
import { cn } from "@/lib/utils"
import { LucideIcon } from "lucide-react"

interface StatCardProps extends React.HTMLAttributes<HTMLDivElement> {
  title: string
  value: string | number
  change?: {
    value: number
    type: "increase" | "decrease" | "neutral"
  }
  icon?: LucideIcon
  description?: string
  trend?: {
    value: number
    period: string
  }
}

const StatCard = React.forwardRef<HTMLDivElement, StatCardProps>(
  ({ className, title, value, change, icon: Icon, description, trend, ...props }, ref) => {
    const getChangeColor = (type: string) => {
      switch (type) {
        case "increase":
          return "text-green-600 bg-green-50"
        case "decrease":
          return "text-red-600 bg-red-50"
        default:
          return "text-gray-600 bg-gray-50"
      }
    }

    const getChangeIcon = (type: string) => {
      switch (type) {
        case "increase":
          return "↗"
        case "decrease":
          return "↘"
        default:
          return "→"
      }
    }

    return (
      <div
        ref={ref}
        className={cn(
          "relative overflow-hidden rounded-xl border border-gray-200 bg-white p-6 shadow-sm transition-all duration-200 hover:shadow-md",
          className
        )}
        {...props}
      >
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <p className="text-sm font-medium text-gray-600">{title}</p>
            <div className="mt-2 flex items-baseline">
              <p className="text-3xl font-bold text-gray-900">{value}</p>
              {change && (
                <span
                  className={cn(
                    "ml-2 inline-flex items-center rounded-full px-2 py-1 text-xs font-medium",
                    getChangeColor(change.type)
                  )}
                >
                  <span className="mr-1">{getChangeIcon(change.type)}</span>
                  {Math.abs(change.value)}%
                </span>
              )}
            </div>
            {description && (
              <p className="mt-1 text-sm text-gray-500">{description}</p>
            )}
            {trend && (
              <p className="mt-2 text-xs text-gray-400">
                {trend.value > 0 ? "+" : ""}{trend.value} from {trend.period}
              </p>
            )}
          </div>
          {Icon && (
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-gray-50">
              <Icon className="h-6 w-6 text-gray-600" />
            </div>
          )}
        </div>
        
        {/* Subtle gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-br from-transparent via-transparent to-gray-50/30 pointer-events-none" />
      </div>
    )
  }
)
StatCard.displayName = "StatCard"

export { StatCard }
