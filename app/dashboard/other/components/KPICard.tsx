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
    <div className={`
      bg-white/5
      backdrop-blur-xl
      border border-white/10
      rounded-xl md:rounded-2xl
      p-4 md:p-6
      hover:border-purple-500/40
      transition
      hover:bg-white/10
      flex flex-col justify-between
      min-h-[140px] md:min-h-0
      ${className || ''}
    `}>
      <div className="flex items-center justify-between mb-3 md:mb-4">
        <div className="p-2 md:p-3 bg-purple-500/10 rounded-lg shrink-0">
          <span className="text-xl md:text-2xl leading-none">{icon}</span>
        </div>
        {change && (
          <div className={`flex items-center gap-0.5 md:gap-1 text-[10px] md:text-sm px-1.5 py-0.5 md:px-2 md:py-1 rounded-full ${change.isPositive
            ? 'text-green-400 bg-green-500/10'
            : 'text-red-400 bg-red-500/10'
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
        <p className="text-xl md:text-2xl font-bold text-white mb-0.5 md:mb-1 truncate">{value}</p>
        <p className="text-xs md:text-sm font-medium text-gray-300 mb-0.5 md:mb-1 truncate">{title}</p>
        <p className="text-[10px] md:text-xs text-gray-500 line-clamp-1 md:line-clamp-2 md:whitespace-normal">{description}</p>
      </div>
    </div>
  )
}