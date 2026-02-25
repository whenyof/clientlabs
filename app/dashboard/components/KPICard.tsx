"use client"

import { TrendingUp, TrendingDown } from "lucide-react"

interface KPICardProps {
  title: string
  value: string
  change?: {
    value: number
    isPositive: boolean
  }
  icon: string
  description: string
  className?: string
}

export function KPICard({ title, value, change, icon, description, className }: KPICardProps) {
  return (
    <div className={`flex flex-col justify-between h-full min-h-[140px] md:min-h-0 ${className || ''}`}>
      <div className="flex items-center justify-between mb-3 md:mb-4">
        <div className="p-2 md:p-3 bg-[var(--accent)]/10 text-[var(--accent)] rounded-lg shrink-0">
          <span className="text-xl md:text-2xl leading-none">{icon}</span>
        </div>
        {change && (
          <div className={`flex items-center gap-0.5 md:gap-1 text-[10px] md:text-sm px-1.5 py-0.5 md:px-2 md:py-1 rounded-full ${change.isPositive
            ? 'text-[var(--accent)] bg-[var(--accent)]/10'
            : 'text-[var(--critical)] bg-[var(--critical)]/10'
            }`}>
            {change.isPositive ? (
              <TrendingUp className="w-3 h-3 md:w-3.5 md:h-3.5" />
            ) : (
              <TrendingDown className="w-3 h-3 md:w-3.5 md:h-3.5" />
            )}
            <span className="font-medium whitespace-nowrap">
              {change.isPositive ? '+' : ''}{change.value}%
            </span>
          </div>
        )}
      </div>

      <div>
        <p className="text-xl md:text-2xl font-bold text-[var(--text-primary)] mb-0.5 md:mb-1 truncate">{value}</p>
        <p className="text-xs md:text-sm font-medium text-[var(--text-secondary)] mb-0.5 md:mb-1 truncate">{title}</p>
        <p className="text-[10px] md:text-xs text-[var(--text-secondary)]/80 line-clamp-1 md:line-clamp-2 md:whitespace-normal">{description}</p>
      </div>
    </div>
  )
}