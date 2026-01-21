"use client"

import { CheckCircleIcon, PauseIcon, DocumentTextIcon, ExclamationTriangleIcon } from "@heroicons/react/24/outline"

interface AutomationStatusBadgeProps {
  status: 'active' | 'paused' | 'draft' | 'error'
}

const statusConfig = {
  active: {
    label: 'Activa',
    color: 'bg-green-500/20 text-green-400 border-green-500/30',
    icon: CheckCircleIcon
  },
  paused: {
    label: 'Pausada',
    color: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
    icon: PauseIcon
  },
  draft: {
    label: 'Borrador',
    color: 'bg-gray-500/20 text-gray-400 border-gray-500/30',
    icon: DocumentTextIcon
  },
  error: {
    label: 'Error',
    color: 'bg-red-500/20 text-red-400 border-red-500/30',
    icon: ExclamationTriangleIcon
  }
}

export function AutomationStatusBadge({ status }: AutomationStatusBadgeProps) {
  const config = statusConfig[status]
  const Icon = config.icon

  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${config.color}`}>
      <Icon className="w-3 h-3" />
      {config.label}
    </span>
  )
}