"use client"

import { CheckCircleIcon, ClockIcon, ExclamationTriangleIcon, XCircleIcon, DocumentTextIcon } from "@heroicons/react/24/outline"

interface PaymentStatusBadgeProps {
  status: 'draft' | 'issued' | 'sent' | 'paid' | 'overdue' | 'cancelled'
}

const statusConfig = {
  draft: {
    label: 'Borrador',
    color: 'bg-gray-500/20 text-gray-400 border-gray-500/30',
    icon: DocumentTextIcon
  },
  issued: {
    label: 'Emitida',
    color: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
    icon: ClockIcon
  },
  sent: {
    label: 'Enviada',
    color: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
    icon: ClockIcon
  },
  paid: {
    label: 'Pagada',
    color: 'bg-green-500/20 text-green-400 border-green-500/30',
    icon: CheckCircleIcon
  },
  overdue: {
    label: 'Vencida',
    color: 'bg-red-500/20 text-red-400 border-red-500/30',
    icon: ExclamationTriangleIcon
  },
  cancelled: {
    label: 'Cancelada',
    color: 'bg-gray-500/20 text-gray-400 border-gray-500/30',
    icon: XCircleIcon
  }
}

export function PaymentStatusBadge({ status }: PaymentStatusBadgeProps) {
  const config = statusConfig[status]
  const Icon = config.icon

  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${config.color}`}>
      <Icon className="w-3 h-3" />
      {config.label}
    </span>
  )
}