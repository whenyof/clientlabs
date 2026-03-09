"use client"

import { useState, useEffect, useCallback, useMemo, memo } from "react"
import { format, isToday, isYesterday, differenceInDays } from "date-fns"
import { es } from "date-fns/locale"
import {
  Eye,
  MousePointer2,
  ShoppingCart,
  CreditCard,
  Mail,
  Zap,
  StickyNote,
  Phone,
  CheckSquare,
  Loader2,
  History,
  AlertCircle,
  RefreshCcw,
  Clock,
} from "lucide-react"
import { Button } from "@/components/ui/button"

interface TimelineEvent {
  id: string
  type: string
  createdAt: string
  title?: string
  description?: string
}

interface ActivityItem {
  id: string
  type: string
  title: string
  description: string | null
  createdAt: string
}

interface TimelineSession {
  sessionId: string
  events: { type: string; createdAt: string }[]
}

const EVENT_LABELS: Record<string, string> = {
  page_view: "Visitó página",
  cta_click: "Clic en CTA",
  form_submit: "Envió formulario",
  email_capture: "Capturó email",
  add_to_cart: "Añadió al carrito",
  payment_completed: "Pago completado",
  demo_request: "Solicitó demo",
  NOTE: "Nota",
  CALL: "Llamada",
  EMAIL: "Email",
  TASK: "Tarea",
}

function getEventLabel(type: string, title?: string): string {
  if (title) return title
  return EVENT_LABELS[type] ?? type.replace(/_/g, " ")
}

function getDayGroup(date: Date): string {
  if (isToday(date)) return "Hoy"
  if (isYesterday(date)) return "Ayer"
  const days = differenceInDays(new Date(), date)
  if (days < 7) return `Hace ${days} días`
  if (days < 30) return `Hace ${Math.floor(days / 7)} sem`
  return format(date, "d MMM yyyy", { locale: es })
}

const EventIcon = memo(({ type }: { type: string }) => {
  switch (type) {
    case "page_view":
      return <Eye className="h-4 w-4 text-blue-500 shrink-0" />
    case "cta_click":
      return <MousePointer2 className="h-4 w-4 text-emerald-500 shrink-0" />
    case "add_to_cart":
      return <ShoppingCart className="h-4 w-4 text-orange-500 shrink-0" />
    case "payment_completed":
      return <CreditCard className="h-4 w-4 text-emerald-500 shrink-0" />
    case "demo_request":
      return <Zap className="h-4 w-4 text-emerald-500 shrink-0" />
    case "form_submit":
    case "email_capture":
      return <Mail className="h-4 w-4 text-blue-500 shrink-0" />
    case "NOTE":
      return <StickyNote className="h-4 w-4 text-amber-500 shrink-0" />
    case "CALL":
      return <Phone className="h-4 w-4 text-emerald-500 shrink-0" />
    case "EMAIL":
      return <Mail className="h-4 w-4 text-blue-500 shrink-0" />
    case "TASK":
      return <CheckSquare className="h-4 w-4 text-violet-500 shrink-0" />
    default:
      return <MousePointer2 className="h-4 w-4 text-neutral-400 shrink-0" />
  }
})
EventIcon.displayName = "EventIcon"

function formatTimeAgo(createdAt: string): string {
  const date = new Date(createdAt)
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffMins = Math.floor(diffMs / 60000)
  const diffHours = Math.floor(diffMs / 3600000)
  const diffDays = Math.floor(diffMs / 86400000)
  if (diffMins < 1) return "Hace un momento"
  if (diffMins < 60) return `Hace ${diffMins} min`
  if (diffHours < 24) return `Hace ${diffHours}h`
  if (diffDays === 1) return "Ayer"
  if (diffDays < 7) return `Hace ${diffDays} días`
  return format(date, "d MMM, HH:mm", { locale: es })
}

const EventRow = memo(({ event }: { event: TimelineEvent }) => (
  <div className="flex items-start gap-3 py-2">
    <div className="flex flex-col items-center">
      <div className="h-3 w-3 rounded-full bg-neutral-300 shrink-0 mt-1.5" />
      <div className="w-px flex-1 min-h-[20px] bg-neutral-200" />
    </div>
    <div className="flex-1 min-w-0 pb-4">
      <div className="flex items-start gap-3">
        <div className="p-2 rounded-lg bg-white border border-neutral-200 shrink-0">
          <EventIcon type={event.type} />
        </div>
        <div className="min-w-0 flex-1 space-y-0.5">
          <p className="text-sm font-medium text-neutral-900">
            {getEventLabel(event.type, event.title)}
          </p>
          <p className="text-xs text-neutral-500">
            {event.description
              ? `${event.description} · ${formatTimeAgo(event.createdAt)}`
              : formatTimeAgo(event.createdAt)}
          </p>
        </div>
      </div>
    </div>
  </div>
))
EventRow.displayName = "EventRow"

export const LeadTimeline = memo(({ leadId }: { leadId: string }) => {
  const [insightsSessions, setInsightsSessions] = useState<TimelineSession[]>([])
  const [activities, setActivities] = useState<ActivityItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)

  const fetchActivities = useCallback(async (signal?: AbortSignal) => {
    const res = await fetch(`/api/leads/${leadId}/activity`, { signal })
    if (!res.ok) return []
    const data = await res.json()
    return data as ActivityItem[]
  }, [leadId])

  const fetchInsights = useCallback(async (signal?: AbortSignal) => {
    try {
      const res = await fetch(`/api/leads/${leadId}/insights?page=1&pageSize=20`, {
        signal,
      })
      if (!res.ok) throw new Error("Failed to fetch")
      const data = await res.json()
      return (data.timeline ?? []) as TimelineSession[]
    } catch {
      return []
    }
  }, [leadId])

  useEffect(() => {
    const controller = new AbortController()
    setLoading(true)
    setError(false)
    Promise.all([
      fetchInsights(controller.signal),
      fetchActivities(controller.signal),
    ])
      .then(([sessions, activityList]) => {
        setInsightsSessions(sessions)
        setActivities(activityList)
      })
      .catch((err) => {
        if (err?.name !== "AbortError") setError(true)
      })
      .finally(() => setLoading(false))
    return () => controller.abort()
  }, [leadId, fetchInsights, fetchActivities])

  const flatEvents = useMemo((): TimelineEvent[] => {
    const list: TimelineEvent[] = []
    insightsSessions.forEach((session) => {
      session.events.forEach((e, i) => {
        list.push({
          id: `${session.sessionId}-${i}`,
          type: e.type,
          createdAt: e.createdAt,
        })
      })
    })
    activities.forEach((a) => {
      list.push({
        id: `activity-${a.id}`,
        type: a.type,
        createdAt: a.createdAt,
        title: a.title,
        description: a.description ?? undefined,
      })
    })
    list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    return list
  }, [insightsSessions, activities])

  const { dayKeys, groupsByDay } = useMemo(() => {
    const groups: Record<string, TimelineEvent[]> = {}
    flatEvents.forEach((ev) => {
      const key = getDayGroup(new Date(ev.createdAt))
      if (!groups[key]) groups[key] = []
      groups[key].push(ev)
    })
    const order = ["Hoy", "Ayer"]
    const rest = Object.keys(groups).filter((k) => !order.includes(k))
    const dayKeys = [...order.filter((k) => groups[k]?.length), ...rest]
    return { dayKeys, groupsByDay: groups }
  }, [flatEvents])

  const handleRetry = useCallback(() => {
    setError(false)
    setLoading(true)
    Promise.all([fetchInsights(), fetchActivities()])
      .then(([sessions, activityList]) => {
        setInsightsSessions(sessions)
        setActivities(activityList)
      })
      .finally(() => setLoading(false))
  }, [fetchInsights, fetchActivities])

  if (loading && flatEvents.length === 0) {
    return (
      <div className="rounded-xl border border-neutral-200 bg-white p-5 space-y-6 animate-pulse">
        <div className="h-6 w-48 bg-neutral-100 rounded" />
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="flex gap-3">
              <div className="h-3 w-3 rounded-full bg-neutral-100" />
              <div className="h-16 flex-1 bg-neutral-100 rounded-lg" />
            </div>
          ))}
        </div>
      </div>
    )
  }

  if (error && flatEvents.length === 0) {
    return (
      <div className="rounded-xl border border-red-200 bg-red-50/50 p-8 text-center">
        <AlertCircle className="h-10 w-10 text-red-500 mx-auto mb-3" />
        <h3 className="font-semibold text-red-900 mb-1">Error al cargar la actividad</h3>
        <p className="text-sm text-red-700 mb-4">
          No pudimos recuperar la actividad. Intenta de nuevo.
        </p>
        <Button
          type="button"
          variant="outline"
          onClick={handleRetry}
          className="inline-flex items-center gap-2 border-red-200 text-red-700 hover:bg-red-50"
        >
          <RefreshCcw className="h-4 w-4" />
          Reintentar
        </Button>
      </div>
    )
  }

  return (
    <div className="rounded-xl border border-neutral-200 bg-white p-5">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-lg font-semibold text-neutral-900 flex items-center gap-2">
          <History className="h-5 w-5 text-neutral-500" />
          Actividad
        </h2>
        {flatEvents.length > 0 && (
          <span className="text-xs text-neutral-500">
            {flatEvents.length} {flatEvents.length === 1 ? "entrada" : "entradas"}
          </span>
        )}
      </div>

      {flatEvents.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-8 text-neutral-500">
          <Clock className="h-8 w-8 mb-3 text-neutral-400" />
          <p className="text-sm font-medium">
            Este lead aún no tiene actividad.
          </p>
          <p className="text-sm mt-1 text-center max-w-sm">
            Cuando visite tu web o interactúe con tu negocio aparecerá aquí.
          </p>
        </div>
      ) : (
        <div className="relative">
          {dayKeys.map((dayKey) => (
            <div key={dayKey} className="mb-6">
              <p className="text-xs font-semibold text-neutral-500 uppercase tracking-wider mb-3">
                {dayKey}
              </p>
              <div className="space-y-4">
                {groupsByDay[dayKey]?.map((ev) => (
                  <EventRow key={ev.id} event={ev} />
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
})

LeadTimeline.displayName = "LeadTimeline"
