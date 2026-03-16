"use client"

import { CalendarClock, PhoneCall, Mail, FileText } from "lucide-react"

export interface ClientNextActionCardProps {
  nextAction?: {
    label: string
    description?: string
    type?: "call" | "email" | "meeting" | "task"
  }
}

export function ClientNextActionCard({ nextAction }: ClientNextActionCardProps) {
  const action =
    nextAction || {
      label: "Programar próxima acción",
      description: "Define el siguiente paso para avanzar esta relación.",
      type: "call" as const,
    }

  const getIcon = () => {
    switch (action.type) {
      case "email":
        return <Mail className="h-4 w-4" />
      case "meeting":
        return <CalendarClock className="h-4 w-4" />
      case "task":
        return <FileText className="h-4 w-4" />
      default:
        return <PhoneCall className="h-4 w-4" />
    }
  }

  return (
    <div className="rounded-xl border border-neutral-200 bg-white p-6 shadow-sm">
      <h3 className="mb-3 text-xs font-semibold uppercase tracking-wider text-neutral-500">
        Próxima acción
      </h3>
      <div className="flex items-center gap-3 text-sm">
        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-emerald-50 text-emerald-700">
          {getIcon()}
        </div>
        <div className="space-y-0.5">
          <p className="font-medium text-neutral-900">{action.label}</p>
          {action.description && (
            <p className="text-xs text-neutral-600">{action.description}</p>
          )}
        </div>
      </div>
    </div>
  )
}
