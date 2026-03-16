"use client"

import { Activity, Mail, PhoneCall, CreditCard, FileText, CalendarClock } from "lucide-react"

export interface ClientTimelineEvent {
  id: string
  type: string
  title: string
  description?: string | null
  timestamp: string
}

export interface ClientTimelineProps {
  events: ClientTimelineEvent[]
}

function getEventIcon(type: string) {
  switch (type) {
    case "EMAIL":
      return <Mail className="h-4 w-4 text-blue-500" />
    case "CALL":
      return <PhoneCall className="h-4 w-4 text-emerald-500" />
    case "PAYMENT":
      return <CreditCard className="h-4 w-4 text-emerald-600" />
    case "INVOICE":
      return <FileText className="h-4 w-4 text-neutral-500" />
    default:
      return <Activity className="h-4 w-4 text-neutral-400" />
  }
}

export function ClientTimeline({ events }: ClientTimelineProps) {
  if (!events || events.length === 0) {
    return (
      <div className="rounded-xl border border-neutral-200 bg-white p-6 shadow-sm text-sm text-neutral-500">
        No hay actividad registrada todavía.
      </div>
    )
  }

  return (
    <div className="rounded-xl border border-neutral-200 bg-white p-6 shadow-sm">
      <h2 className="mb-4 text-sm font-semibold text-neutral-700 flex items-center gap-2">
        <CalendarClock className="h-4 w-4 text-neutral-400" />
        Línea de tiempo
      </h2>
      <div className="space-y-4">
        {events.map((event) => (
          <div key={event.id} className="flex items-start gap-3">
            <div className="mt-1 flex h-8 w-8 items-center justify-center rounded-full bg-neutral-100">
              {getEventIcon(event.type)}
            </div>
            <div className="flex-1 space-y-0.5">
              <div className="flex items-center justify-between gap-2">
                <p className="text-sm font-medium text-neutral-900">{event.title}</p>
                <span className="text-xs text-neutral-500 whitespace-nowrap">{event.timestamp}</span>
              </div>
              {event.description && (
                <p className="text-xs text-neutral-600">{event.description}</p>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
