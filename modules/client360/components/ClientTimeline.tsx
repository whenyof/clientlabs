"use client"

import { useState } from "react"
import {
 UserPlusIcon,
 ShoppingCartIcon,
 DocumentTextIcon,
 CheckCircleIcon,
 ExclamationTriangleIcon,
 BanknotesIcon,
 ClockIcon,
 ChevronDownIcon,
} from "@heroicons/react/24/outline"
import type { TimelineEvent, TimelineEventType } from "../services/getClientTimeline"

// ---------------------------------------------------------------------------
// Visual config per event type
// ---------------------------------------------------------------------------

const EVENT_CONFIG: Record<
 TimelineEventType,
 {
 icon: React.ComponentType<React.SVGProps<SVGSVGElement>>
 gradient: string
 lineColor: string
 dotColor: string
 label: string
 }
> = {
 creation: {
 icon: UserPlusIcon,
 gradient: " ",
 lineColor: "bg-[var(--accent-soft)]-primary/30",
 dotColor: "bg-[var(--accent-soft)]-primary",
 label: "Creación",
 },
 sale: {
 icon: ShoppingCartIcon,
 gradient: " ",
 lineColor: "bg-[var(--accent-soft)]",
 dotColor: "bg-[var(--accent-soft)]",
 label: "Venta",
 },
 invoice_issued: {
 icon: DocumentTextIcon,
 gradient: " ",
 lineColor: "bg-[var(--bg-card)]",
 dotColor: "bg-blue-500",
 label: "Factura",
 },
 invoice_paid: {
 icon: CheckCircleIcon,
 gradient: " ",
 lineColor: "bg-[var(--accent-soft)]",
 dotColor: "bg-[var(--accent-soft)]",
 label: "Pagada",
 },
 invoice_overdue: {
 icon: ExclamationTriangleIcon,
 gradient: " ",
 lineColor: "bg-[var(--bg-card)]",
 dotColor: "bg-[var(--bg-card)]",
 label: "Vencida",
 },
 payment: {
 icon: BanknotesIcon,
 gradient: " ",
 lineColor: "bg-emerald-500/30",
 dotColor: "bg-emerald-500",
 label: "Pago",
 },
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function formatCurrency(value: number, currency: string = "EUR"): string {
 return new Intl.NumberFormat("es-ES", {
 style: "currency",
 currency,
 minimumFractionDigits: 0,
 maximumFractionDigits: 0,
 }).format(value)
}

function formatDate(iso: string): string {
 const d = new Date(iso)
 return d.toLocaleDateString("es-ES", {
 day: "numeric",
 month: "short",
 year: "numeric",
 })
}

function formatTime(iso: string): string {
 const d = new Date(iso)
 return d.toLocaleTimeString("es-ES", {
 hour: "2-digit",
 minute: "2-digit",
 })
}

function getResourceUrl(event: TimelineEvent): string | null {
 if (!event.resourceId || !event.resourceType) return null

 switch (event.resourceType) {
 case "invoice":
 return `/dashboard/invoicing?invoiceId=${event.resourceId}`
 case "sale":
 return null // Sales don't have a dedicated detail page in this app
 case "client":
 return null // Already on this page
 case "payment":
 return `/dashboard/invoicing?invoiceId=${event.resourceId}`
 default:
 return null
 }
}

// ---------------------------------------------------------------------------
// Single timeline item
// ---------------------------------------------------------------------------

function TimelineItem({
 event,
 isLast,
}: {
 event: TimelineEvent
 isLast: boolean
}) {
 const config = EVENT_CONFIG[event.type]
 const Icon = config.icon
 const url = getResourceUrl(event)

 const Wrapper = url ? "a" : "div"
 const wrapperProps = url
 ? { href: url, className: "block" }
 : { className: "block" }

 return (
 <div className="relative flex gap-4 group/item">
 {/* ── Left: dot + line ── */}
 <div className="flex flex-col items-center shrink-0">
 {/* Dot with icon */}
 <div
 className={`
 relative z-10 w-9 h-9 rounded-xl
 bg-[var(--bg-card)] ${config.gradient}
 flex items-center justify-center
 shadow-sm shadow-black/20
 group-hover/item:scale-110
 transition-transform duration-200
 `}
 >
 <Icon className="w-4 h-4 text-[var(--text-primary)]" />
 </div>

 {/* Vertical line */}
 {!isLast && (
 <div className={`w-0.5 flex-1 mt-1 ${config.lineColor} min-h-[24px]`} />
 )}
 </div>

 {/* ── Right: content ── */}
 <Wrapper {...wrapperProps}>
 <div
 className={`
 flex-1 pb-6 min-w-0
 ${url ? "cursor-pointer" : ""}
 `}
 >
 <div
 className={`
 rounded-xl bg-[var(--bg-card)]/40 border border-[var(--border-subtle)]
 px-4 py-3
 transition-all duration-200
 ${url
 ? "hover:bg-[var(--bg-card)]/60 hover:border-[var(--border-subtle)] hover:shadow-sm"
 : ""
 }
 `}
 >
 {/* Top row: title + amount */}
 <div className="flex items-start justify-between gap-3">
 <div className="min-w-0">
 <div className="text-sm font-semibold text-[var(--text-primary)] leading-snug">
 {event.title}
 </div>
 {event.subtitle && (
 <div className="text-xs text-gray-500 mt-0.5 truncate">
 {event.subtitle}
 </div>
 )}
 </div>

 {event.amount !== null && (
 <span
 className={`
 shrink-0 text-sm font-bold tabular-nums
 ${event.type === "payment" || event.type === "invoice_paid"
 ? "text-[var(--accent)]"
 : event.type === "invoice_overdue"
 ? "text-[var(--critical)]"
 : "text-[var(--text-primary)]"
 }
 `}
 >
 {event.type === "payment" || event.type === "invoice_paid" ? "+" : ""}
 {formatCurrency(event.amount, event.currency)}
 </span>
 )}
 </div>

 {/* Bottom row: date + type tag */}
 <div className="flex items-center gap-2.5 mt-2">
 <span className="text-[11px] text-gray-600 font-medium tabular-nums">
 {formatDate(event.date)} · {formatTime(event.date)}
 </span>
 <span
 className={`
 inline-flex items-center px-1.5 py-0.5 rounded-md
 text-[10px] font-semibold uppercase tracking-wider
 bg-[var(--bg-card)] border border-[var(--border-subtle)] text-gray-500
 `}
 >
 {config.label}
 </span>
 {url && (
 <span className="text-[10px] text-gray-600 group-hover/item:text-[var(--accent)] transition-colors">
 Ver →
 </span>
 )}
 </div>
 </div>
 </div>
 </Wrapper>
 </div>
 )
}

// ---------------------------------------------------------------------------
// Main component
// ---------------------------------------------------------------------------

const INITIAL_VISIBLE = 10

interface ClientTimelineProps {
 events: TimelineEvent[]
}

export function ClientTimeline({ events }: ClientTimelineProps) {
 const [showAll, setShowAll] = useState(false)
 const visible = showAll ? events : events.slice(0, INITIAL_VISIBLE)
 const hasMore = events.length > INITIAL_VISIBLE

 return (
 <div
 id="client360-timeline"
 className="
 relative overflow-hidden rounded-2xl
 bg-[var(--bg-card)] backdrop-
 border border-[var(--border-subtle)]
 transition-all duration-300
 hover:border-[var(--border-subtle)]
 "
 >
 {/* Top gradient stripe */}
 <div className="h-1 bg-[var(--bg-card)] " />

 {/* Header */}
 <div className="relative flex items-center justify-between px-6 py-4 border-b border-[var(--border-subtle)]">
 <div className="flex items-center gap-3">
 <div className="p-2.5 rounded-xl bg-[var(--bg-card)] shadow-sm">
 <ClockIcon className="w-5 h-5 text-[var(--text-primary)]" />
 </div>
 <div>
 <h3 className="text-sm font-bold text-[var(--text-primary)] tracking-wide">
 Línea Temporal
 </h3>
 <p className="text-[11px] text-gray-500 font-medium">
 {events.length} evento{events.length !== 1 ? "s" : ""} registrado{events.length !== 1 ? "s" : ""}
 </p>
 </div>
 </div>
 </div>

 {/* Body */}
 <div className="relative p-6">
 {events.length === 0 ? (
 /* ────── Empty state ────── */
 <div className="flex flex-col items-center justify-center py-8 text-center">
 <div className="w-16 h-16 mb-4 rounded-2xl bg-[var(--bg-card)] border border-[var(--border-subtle)] flex items-center justify-center">
 <ClockIcon className="w-8 h-8 text-gray-600" />
 </div>
 <p className="text-sm text-[var(--text-secondary)] font-medium">
 Sin actividad registrada
 </p>
 <p className="text-xs text-gray-600 mt-1 max-w-[220px]">
 Los eventos aparecerán aquí a medida que se registren ventas, facturas y pagos
 </p>
 </div>
 ) : (
 <>
 {/* ────── Timeline ────── */}
 <div>
 {visible.map((event, i) => (
 <TimelineItem
 key={event.id}
 event={event}
 isLast={i === visible.length - 1}
 />
 ))}
 </div>

 {/* ────── Show more ────── */}
 {hasMore && !showAll && (
 <div className="flex justify-center pt-2">
 <button
 onClick={() => setShowAll(true)}
 className="
 inline-flex items-center gap-1.5 px-4 py-2 rounded-xl
 bg-[var(--bg-card)] border border-[var(--border-subtle)] border border-[var(--border-subtle)]
 text-xs font-semibold text-[var(--text-secondary)]
 hover:bg-[var(--bg-card)] border border-[var(--border-subtle)] hover:text-[var(--text-primary)] hover:border-gray-500/40
 transition-all duration-200
 "
 >
 <ChevronDownIcon className="w-3.5 h-3.5" />
 Mostrar {events.length - INITIAL_VISIBLE} más
 </button>
 </div>
 )}
 </>
 )}
 </div>
 </div>
 )
}
