"use client"
import { getBaseUrl } from "@/lib/api/baseUrl"

import { useState, useEffect, useCallback, useMemo } from "react"
import { format } from "date-fns"
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
  AlertCircle,
  RefreshCcw,
  Clock,
  UserPlus,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { formatTimeAgo } from "@domains/leads/utils/formatting"

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
  EMAIL: "Email enviado",
  TASK: "Tarea",
  lead_created: "Lead creado",
}

const POSITIVE_EVENTS = new Set(["payment_completed", "cta_click", "demo_request", "CONVERTED", "CALL"])

function getEventLabel(type: string, title?: string): string {
  if (title) return title
  return EVENT_LABELS[type] ?? type.replace(/_/g, " ")
}

function EventIcon({ type }: { type: string }) {
  switch (type) {
    case "page_view":
      return <Eye style={{ width: 14, height: 14, color: "#378ADD", flexShrink: 0 }} />
    case "cta_click":
      return <MousePointer2 style={{ width: 14, height: 14, color: "#1FA97A", flexShrink: 0 }} />
    case "add_to_cart":
      return <ShoppingCart style={{ width: 14, height: 14, color: "#EF9F27", flexShrink: 0 }} />
    case "payment_completed":
      return <CreditCard style={{ width: 14, height: 14, color: "#1FA97A", flexShrink: 0 }} />
    case "demo_request":
      return <Zap style={{ width: 14, height: 14, color: "#1FA97A", flexShrink: 0 }} />
    case "form_submit":
    case "email_capture":
    case "EMAIL":
      return <Mail style={{ width: 14, height: 14, color: "#378ADD", flexShrink: 0 }} />
    case "NOTE":
      return <StickyNote style={{ width: 14, height: 14, color: "#EF9F27", flexShrink: 0 }} />
    case "CALL":
      return <Phone style={{ width: 14, height: 14, color: "#1FA97A", flexShrink: 0 }} />
    case "TASK":
      return <CheckSquare style={{ width: 14, height: 14, color: "#8B5CF6", flexShrink: 0 }} />
    case "lead_created":
      return <UserPlus style={{ width: 14, height: 14, color: "var(--text-secondary)", flexShrink: 0 }} />
    default:
      return <MousePointer2 style={{ width: 14, height: 14, color: "var(--text-secondary)", flexShrink: 0 }} />
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
      const res = await fetch(`${getBaseUrl()}/api/leads/${leadId}/insights?page=1&pageSize=20`, { signal })
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
    Promise.all([fetchInsights(controller.signal), fetchActivities(controller.signal)])
      .then(([sessions, activityList]) => {
        setInsightsSessions(sessions)
        setActivities(activityList)
      })
      .catch((err) => { if (err?.name !== "AbortError") setError(true) })
      .finally(() => setLoading(false))
    return () => controller.abort()
  }, [leadId, fetchInsights, fetchActivities])

  const flatEvents = useMemo((): TimelineEvent[] => {
    const list: TimelineEvent[] = []
    insightsSessions.forEach((session) => {
      session.events.forEach((e, i) => {
        list.push({ id: `${session.sessionId}-${i}`, type: e.type, createdAt: e.createdAt })
      })
    })
    activities.forEach((a) => {
      list.push({ id: `activity-${a.id}`, type: a.type, createdAt: a.createdAt, title: a.title, description: a.description ?? undefined })
    })
    if (list.length === 0 && createdAt) {
      list.push({ id: "lead-created", type: "lead_created", createdAt: new Date(createdAt).toISOString(), title: "Lead creado" })
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
      <div
        style={{ background: "var(--bg-card)", border: "0.5px solid var(--border-subtle)", borderRadius: 12, padding: 20 }}
        className="animate-pulse"
      >
        <div style={{ height: 18, width: 120, borderRadius: 4, background: "var(--border-subtle)", marginBottom: 16 }} />
        {[1, 2, 3].map((i) => (
          <div key={i} style={{ display: "flex", gap: 10, marginBottom: 12 }}>
            <div style={{ width: 8, height: 8, borderRadius: "50%", background: "var(--border-subtle)", marginTop: 4, flexShrink: 0 }} />
            <div style={{ height: 40, flex: 1, borderRadius: 6, background: "var(--border-subtle)" }} />
          </div>
        ))}
      </div>
    )
  }

  if (error && flatEvents.length === 0) {
    return (
      <div style={{ background: "var(--bg-card)", border: "0.5px solid var(--border-subtle)", borderRadius: 12, padding: 32, textAlign: "center" }}>
        <AlertCircle style={{ width: 32, height: 32, color: "var(--critical)", margin: "0 auto 12px" }} />
        <p style={{ fontSize: 14, fontWeight: 600, color: "var(--text-primary)", margin: "0 0 4px" }}>Error al cargar la actividad</p>
        <p style={{ fontSize: 13, color: "var(--text-secondary)", margin: "0 0 16px" }}>No pudimos recuperar la actividad. Intenta de nuevo.</p>
        <Button type="button" variant="outline" size="sm" onClick={handleRetry} style={{ display: "inline-flex", gap: 6 }}>
          <RefreshCcw style={{ width: 14, height: 14 }} />
          Reintentar
        </Button>
      </div>
    )
  }

  return (
    <div style={{ background: "var(--bg-card)", border: "0.5px solid var(--border-subtle)", borderRadius: 12, padding: 20 }}>
      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 16 }}>
        <h2 style={{ fontSize: 14, fontWeight: 600, color: "var(--text-primary)", margin: 0 }}>Actividad</h2>
        {flatEvents.length > 0 && (
          <span style={{
            fontSize: 11, fontWeight: 500, padding: "2px 8px", borderRadius: 20,
            background: "var(--bg-surface)", color: "var(--text-secondary)",
            border: "0.5px solid var(--border-subtle)",
          }}>
            {flatEvents.length}
          </span>
        )}
      </div>

      {flatEvents.length === 0 ? (
        <div style={{ textAlign: "center", padding: "24px 0", color: "var(--text-secondary)" }}>
          <Clock style={{ width: 28, height: 28, margin: "0 auto 8px" }} />
          <p style={{ fontSize: 13, fontWeight: 500, margin: 0 }}>Sin actividad registrada</p>
          <p style={{ fontSize: 12, margin: "4px 0 0" }}>Las interacciones aparecerán aquí.</p>
        </div>
      ) : (
        <div>
          {flatEvents.map((event, index) => (
            <div key={event.id}>
              <div style={{ display: "flex", gap: 10, alignItems: "flex-start", padding: "10px 0" }}>
                {/* Dot */}
                <div style={{
                  width: 8, height: 8, borderRadius: "50%", flexShrink: 0, marginTop: 4,
                  background: POSITIVE_EVENTS.has(event.type) ? "#1FA97A" : "var(--border-main)",
                }} />
                {/* Content */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 2 }}>
                    <EventIcon type={event.type} />
                    <p style={{ fontSize: 13, fontWeight: 500, color: "var(--text-primary)", margin: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                      {getEventLabel(event.type, event.title)}
                    </p>
                  </div>
                  <p style={{ fontSize: 11, color: "var(--text-secondary)", margin: 0 }}>
                    {event.description ? `${event.description} · ` : ""}{formatTimeAgo(event.createdAt)}
                  </p>
                </div>
              </div>
              {index < flatEvents.length - 1 && (
                <div style={{ height: "0.5px", background: "var(--border-subtle)", margin: "0 0 0 18px" }} />
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
