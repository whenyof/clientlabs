"use client"

import { TrendingUp, TrendingDown } from "lucide-react"

interface KPICardProps {
  title: string
  value: string
  change?: {
    value: number
    isPositive: boolean
  }
  description: string
  className?: string
}

export function KPICard({ title, value, change, description, className }: KPICardProps) {
  return (
    <div className={`flex h-full flex-col justify-between ${className ?? ""}`}>
      <div>
        <p className="mb-1 truncate text-sm font-medium text-neutral-500">{title}</p>
        <p className="mb-4 text-2xl font-semibold tracking-tight text-neutral-900">{value}</p>
      </div>
      <div className="flex items-center justify-between gap-2">
        <p className="line-clamp-1 text-xs text-neutral-500">{description}</p>
        {change && (
          <div
            className={`flex items-center gap-1 rounded-lg px-2 py-1 text-xs font-medium ${
              change.isPositive ? "bg-neutral-100 text-neutral-700" : "bg-red-50 text-red-600"
            }`}
          >
            {change.isPositive ? (
              <TrendingUp className="h-3 w-3" />
            ) : (
              <TrendingDown className="h-3 w-3" />
            )}
            <span className="whitespace-nowrap">
              {change.isPositive ? "+" : ""}
              {change.value}%
            </span>
          </div>
        )}
      </div>
    </div>
  )
}