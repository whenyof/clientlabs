"use client"
import { getBaseUrl } from "@/lib/api/baseUrl"


import { useState, useEffect, useCallback, useMemo } from "react"
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
  History,
  AlertCircle,
  RefreshCcw,
  Clock,
  UserPlus,
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

function EventIcon({ type }: { type: string }) {
  switch (type) {
    case "page_view":
      return <Eye className="h-4 w-4 shrink-0 text-blue-500" />
    case "cta_click":
      return <MousePointer2 className="h-4 w-4 shrink-0 text-emerald-500" />
    case "add_to_cart":
      return <ShoppingCart className="h-4 w-4 shrink-0 text-orange-500" />
    case "payment_completed":
      return <CreditCard className="h-4 w-4 shrink-0 text-emerald-500" />
    case "demo_request":
      return <Zap className="h-4 w-4 shrink-0 text-emerald-500" />
    case "form_submit":
    case "email_capture":
      return <Mail className="h-4 w-4 shrink-0 text-blue-500" />
    case "NOTE":
      return <StickyNote className="h-4 w-4 shrink-0 text-amber-500" />
    case "CALL":
      return <Phone className="h-4 w-4 shrink-0 text-emerald-500" />
    case "EMAIL":
      return <Mail className="h-4 w-4 shrink-0 text-blue-500" />
    case "TASK":
      return <CheckSquare className="h-4 w-4 shrink-0 text-violet-500" />
    case "lead_created":
      return <UserPlus className="h-4 w-4 shrink-0 text-neutral-500" />
    default:
      return <MousePointer2 className="h-4 w-4 shrink-0 text-neutral-400" />
  }
}

interface LeadTimelineProps {
  leadId: string
  createdAt?: Date
}

export function LeadTimeline({ leadId, createdAt }: LeadTimelineProps) {
  const [insightsSessions, setInsightsSessions] = useState<TimelineSession[]>([])
  const [activities, setActivities] = useState<ActivityItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)

  const fetchActivities = useCallback(async (signal?: AbortSignal) => {
    const res = await fetch(`${getBaseUrl()}/api/leads/${leadId}/activity`, { signal })
    if (!res.ok) return []
    const data = await res.json()
    return data as ActivityItem[]
  }, [leadId])

  const fetchInsights = useCallback(async (signal?: AbortSignal) => {
    try {
      const res = await fetch(`${getBaseUrl()}/api/leads/${leadId}/insights?page=1&pageSize=20`, {
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
    if (list.length === 0 && createdAt) {
      list.push({
        id: "lead-created",
        type: "lead_created",
        createdAt: new Date(createdAt).toISOString(),
        title: "Lead creado",
      })
    }
    list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    return list
  }, [insightsSessions, activities, createdAt])

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
      <div className="animate-pulse space-y-4 rounded-xl border border-neutral-200 bg-white p-6 shadow-sm">
        <div className="h-6 w-48 rounded bg-neutral-100" />
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="flex gap-3">
              <div className="h-3 w-3 shrink-0 rounded-full bg-neutral-100" />
              <div className="h-16 flex-1 rounded-lg bg-neutral-100" />
            </div>
          ))}
        </div>
      </div>
    )
  }

  if (error && flatEvents.length === 0) {
    return (
      <div className="rounded-xl border border-red-200 bg-red-50/50 p-8 text-center shadow-sm">
        <AlertCircle className="mx-auto mb-3 h-10 w-10 text-red-500" />
        <h3 className="mb-1 font-semibold text-red-900">Error al cargar la actividad</h3>
        <p className="mb-4 text-sm text-red-700">
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
    <div className="rounded-xl border border-neutral-200 bg-white p-6 shadow-sm">
      <h2 className="mb-6 flex items-center gap-2 text-lg font-semibold text-neutral-900">
        <History className="h-5 w-5 text-neutral-500" />
        Actividad
      </h2>

      <div className="space-y-4">
        {flatEvents.map((event, index) => (
          <div key={event.id} className="flex items-start gap-3">
            <div className="flex flex-col items-center">
              <div className="mt-1.5 h-3 w-3 shrink-0 rounded-full bg-neutral-300" />
              {index < flatEvents.length - 1 && (
                <div className="mt-0.5 min-h-[20px] w-px flex-1 bg-neutral-200" />
              )}
            </div>
            <div className="min-w-0 flex-1 pb-2">
              <div className="flex items-start gap-3">
                <div className="shrink-0 rounded-lg border border-neutral-200 bg-white p-2">
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
        ))}
      </div>

      {flatEvents.length === 0 && !loading && (
        <div className="flex flex-col items-center justify-center py-8 text-neutral-500">
          <Clock className="mb-3 h-8 w-8 text-neutral-400" />
          <p className="text-sm font-medium">Este lead aún no tiene actividad.</p>
          <p className="mt-1 max-w-sm text-center text-sm">
            Cuando visite tu web o interactúe con tu negocio aparecerá aquí.
          </p>
        </div>
      )}
    </div>
  )
}
