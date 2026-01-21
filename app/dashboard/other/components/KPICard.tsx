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
}

export function KPICard({ title, value, change, icon, description }: KPICardProps) {
  return (
    <div className="
      bg-white/5
      backdrop-blur-xl
      border border-white/10
      rounded-2xl
      p-6
      hover:border-purple-500/40
      transition
      hover:bg-white/10
    ">
      <div className="flex items-center justify-between mb-4">
        <div className="p-3 bg-purple-500/10 rounded-lg">
          <span className="text-2xl">{icon}</span>
        </div>
        {change && (
          <div className={`flex items-center gap-1 text-sm px-2 py-1 rounded-full ${
            change.isPositive
              ? 'text-green-400 bg-green-500/10'
              : 'text-red-400 bg-red-500/10'
          }`}>
            {change.isPositive ? (
              <TrendingUp className="w-3 h-3" />
            ) : (
              <TrendingDown className="w-3 h-3" />
            )}
            <span className="font-medium">
              {change.isPositive ? '+' : ''}{change.value}%
            </span>
          </div>
        )}
      </div>

      <div>
        <p className="text-2xl font-bold text-white mb-1">{value}</p>
        <p className="text-sm font-medium text-gray-300 mb-1">{title}</p>
        <p className="text-xs text-gray-500">{description}</p>
      </div>
    </div>
  )
}