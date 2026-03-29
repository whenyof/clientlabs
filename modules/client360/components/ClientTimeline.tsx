"use client"

import { useState } from "react"
import {
  UserPlus, ShoppingCart, FileText, CheckCircle2, AlertTriangle,
  Banknote, Clock, ChevronDown, ClipboardList, MessageSquare, Phone, Mail,
} from "lucide-react"
import type { TimelineEvent, TimelineEventType } from "../services/getClientTimeline"

// ─── Config ──────────────────────────────────────────────────────────────────

const EVENT_CONFIG: Record<TimelineEventType, {
  Icon: React.ComponentType<React.SVGProps<SVGSVGElement>>
  color: string
  label: string
}> = {
  creation:           { Icon: UserPlus,      color: "#1FA97A", label: "Alta"        },
  sale:               { Icon: ShoppingCart,  color: "#1FA97A", label: "Venta"       },
  invoice_issued:     { Icon: FileText,      color: "#3B82F6", label: "Factura"     },
  invoice_paid:       { Icon: CheckCircle2,  color: "#1FA97A", label: "Cobrada"     },
  invoice_overdue:    { Icon: AlertTriangle, color: "#EF4444", label: "Vencida"     },
  payment:            { Icon: Banknote,      color: "#1FA97A", label: "Pago"        },
  task_created:       { Icon: ClipboardList, color: "#F59E0B", label: "Tarea"       },
  note_added:         { Icon: MessageSquare, color: "#6B7280", label: "Nota"        },
  interaction_logged: { Icon: Phone,         color: "#3B82F6", label: "Interacción" },
  email_sent:         { Icon: Mail,          color: "#8B5CF6", label: "Email"       },
}
const DEFAULT_CFG: { Icon: React.ComponentType<React.SVGProps<SVGSVGElement>>; color: string; label: string } =
  { Icon: Clock, color: "#6B7280", label: "Evento" }

// ─── Helpers ─────────────────────────────────────────────────────────────────

function formatCurrency(v: number, currency = "EUR") {
  return new Intl.NumberFormat("es-ES", {
    style: "currency", currency, minimumFractionDigits: 0, maximumFractionDigits: 0,
  }).format(v)
}

function formatDate(iso: string) {
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return "—"
  return d.toLocaleDateString("es-ES", { day: "numeric", month: "short" })
}

function getUrl(event: TimelineEvent): string | null {
  if (!event.resourceId || !event.resourceType) return null
  if (event.resourceType === "invoice") return `/dashboard/finance/billing?invoiceId=${event.resourceId}`
  if (event.resourceType === "task")    return `/dashboard/tasks?taskId=${event.resourceId}`
  return null
}

// ─── Single event ─────────────────────────────────────────────────────────────

function TimelineItem({ event, isLast }: { event: TimelineEvent; isLast: boolean }) {
  const cfg  = EVENT_CONFIG[event.type] ?? DEFAULT_CFG
  const { Icon } = cfg
  const url  = getUrl(event)

  const amountColor =
    event.type === "payment" || event.type === "invoice_paid" ? "#1FA97A"
    : event.type === "invoice_overdue" ? "#EF4444"
    : "var(--text-primary)"

  return (
    <div className="flex gap-3">
      {/* Dot + line */}
      <div className="flex flex-col items-center shrink-0 pt-1">
        <div
          className="w-6 h-6 rounded-lg flex items-center justify-center shrink-0"
          style={{ background: `${cfg.color}15`, border: `1px solid ${cfg.color}25` }}
        >
          <Icon className="w-3 h-3" style={{ color: cfg.color }} aria-hidden="true" />
        </div>
        {!isLast && (
          <div className="w-px bg-[var(--border-subtle)] mt-1.5" style={{ flex: 1, minHeight: 14 }} />
        )}
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0 pb-3">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            {url ? (
              <a href={url} className="text-[13px] font-medium text-[var(--text-primary)] hover:text-[#1FA97A] transition-colors leading-snug line-clamp-1">
                {event.title}
              </a>
            ) : (
              <span className="text-[13px] font-medium text-[var(--text-primary)] leading-snug line-clamp-1">
                {event.title}
              </span>
            )}
            {event.subtitle && (
              <p className="text-[11px] text-[var(--text-secondary)] mt-0.5 truncate">{event.subtitle}</p>
            )}
          </div>
          {event.amount !== null && (
            <span className="shrink-0 text-[13px] font-semibold tabular-nums" style={{ color: amountColor }}>
              {event.type === "payment" || event.type === "invoice_paid" ? "+" : ""}
              {formatCurrency(event.amount, event.currency)}
            </span>
          )}
        </div>
        <div className="flex items-center gap-2 mt-1">
          <span className="text-[11px] text-[var(--text-secondary)] tabular-nums">{formatDate(event.date)}</span>
          <span className="text-[9px] font-semibold uppercase tracking-wider px-1.5 py-0.5 rounded"
            style={{ background: `${cfg.color}10`, color: cfg.color }}>
            {cfg.label}
          </span>
        </div>
      </div>
    </div>
  )
}

// ─── Main ─────────────────────────────────────────────────────────────────────

const INITIAL = 4

interface ClientTimelineProps {
  events: TimelineEvent[]
}

export function ClientTimeline({ events }: ClientTimelineProps) {
  const [showAll, setShowAll] = useState(false)
  const visible  = showAll ? events : events.slice(0, INITIAL)
  const remaining = events.length - INITIAL

  return (
    <div className="bg-[var(--bg-card)] rounded-xl border border-[var(--border-subtle)] overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-3 border-b border-[var(--border-subtle)]">
        <div className="flex items-center gap-2">
          <Clock className="w-3.5 h-3.5 text-[var(--text-secondary)]" aria-hidden="true" />
          <span className="text-[11px] font-semibold uppercase tracking-wider text-[var(--text-secondary)]">
            Actividad
          </span>
        </div>
        <span className="text-[11px] text-[var(--text-secondary)]">
          {events.length} evento{events.length !== 1 ? "s" : ""}
        </span>
      </div>

      <div className="px-5 py-4">
        {events.length === 0 ? (
          <p className="text-[13px] text-[var(--text-secondary)]">Sin actividad registrada todavía.</p>
        ) : (
          <>
            {visible.map((ev, i) => (
              <TimelineItem key={ev.id} event={ev} isLast={i === visible.length - 1 && (showAll || remaining <= 0)} />
            ))}

            {remaining > 0 && !showAll && (
              <button
                onClick={() => setShowAll(true)}
                className="mt-2 w-full flex items-center justify-center gap-1.5 py-2 rounded-lg border border-[var(--border-subtle)] text-[12px] font-medium text-[var(--text-secondary)] hover:bg-[var(--bg-surface)] hover:text-[var(--text-primary)] transition-colors"
              >
                <ChevronDown className="w-3.5 h-3.5" />
                Ver {remaining} más
              </button>
            )}
          </>
        )}
      </div>
    </div>
  )
}
