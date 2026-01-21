"use client"

import { AlertTriangle, Minus, ArrowDown } from "lucide-react"

interface PriorityBadgeProps {
  priority: string
}

export function PriorityBadge({ priority }: PriorityBadgeProps) {
  const getPriorityConfig = (priority: string) => {
    switch (priority) {
      case "high":
        return {
          color: "text-red-400 bg-red-500/10 border border-red-500/20",
          icon: AlertTriangle,
          text: "Alta"
        }
      case "medium":
        return {
          color: "text-yellow-400 bg-yellow-500/10 border border-yellow-500/20",
          icon: Minus,
          text: "Media"
        }
      case "low":
        return {
          color: "text-green-400 bg-green-500/10 border border-green-500/20",
          icon: ArrowDown,
          text: "Baja"
        }
      default:
        return {
          color: "text-gray-400 bg-gray-500/10 border border-gray-500/20",
          icon: Minus,
          text: "Media"
        }
    }
  }

  const config = getPriorityConfig(priority)
  const IconComponent = config.icon

  return (
    <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${config.color}`}>
      <IconComponent className="w-3 h-3" />
      {config.text}
    </span>
  )
}