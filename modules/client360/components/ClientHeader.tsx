"use client"

import type { Client360Base } from "../types"
import {
 UserCircleIcon,
 EnvelopeIcon,
 PhoneIcon,
 IdentificationIcon,
 PlusIcon,
 DocumentTextIcon,
 BanknotesIcon,
 BellAlertIcon,
} from "@heroicons/react/24/outline"

// ---------------------------------------------------------------------------
// Status badge helpers
// ---------------------------------------------------------------------------

const STATUS_STYLES: Record<string, { bg: string; text: string; dot: string; label: string }> = {
 ACTIVE: {
 bg: "bg-[var(--accent-soft)]",
 text: "text-[var(--accent)]",
 dot: "bg-[var(--accent-soft)]",
 label: "Activo",
 },
 FOLLOW_UP: {
 bg: "bg-[var(--bg-card)]",
 text: "text-[var(--text-secondary)]",
 dot: "bg-[var(--bg-card)]",
 label: "Seguimiento",
 },
 INACTIVE: {
 bg: "bg-gray-500/15",
 text: "text-[var(--text-secondary)]",
 dot: "bg-gray-400",
 label: "Inactivo",
 },
 VIP: {
 bg: "bg-[var(--accent-soft)]-primary/15",
 text: "text-[var(--accent)]-hover",
 dot: "bg-[var(--accent-soft)]-hover",
 label: "VIP",
 },
}

function getStatusStyle(status: string) {
 return (
 STATUS_STYLES[status] ?? {
 bg: "bg-gray-500/15",
 text: "text-[var(--text-secondary)]",
 dot: "bg-gray-400",
 label: status,
 }
 )
}

// ---------------------------------------------------------------------------
// Action buttons config (no functionality yet — structure only)
// ---------------------------------------------------------------------------

const ACTIONS = [
 { id: "new-sale", label: "Nueva venta", icon: PlusIcon, gradient: " " },
 { id: "new-invoice", label: "Nueva factura", icon: DocumentTextIcon, gradient: " " },
 { id: "register-payment", label: "Registrar pago", icon: BanknotesIcon, gradient: " " },
 { id: "send-reminder", label: "Enviar recordatorio", icon: BellAlertIcon, gradient: " " },
]

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

interface ClientHeaderProps {
 client: Client360Base
}

export function ClientHeader({ client }: ClientHeaderProps) {
 const s = getStatusStyle(client.status)

 return (
 <div className="rounded-2xl bg-[var(--bg-card)] backdrop- border border-[var(--border-subtle)] overflow-hidden">
 {/* Decorative top gradient stripe */}
 <div className="h-1 bg-[var(--bg-card)] " />

 <div className="p-6 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
 {/* ──── Left: identity ──── */}
 <div className="flex items-start gap-5 min-w-0">
 {/* Avatar */}
 <div className="shrink-0 w-14 h-14 rounded-2xl bg-[var(--bg-card)] flex items-center justify-center shadow-sm shadow-accent-primary/20">
 <UserCircleIcon className="w-8 h-8 text-[var(--text-primary)]" />
 </div>

 <div className="min-w-0 space-y-2">
 {/* Name + badge */}
 <div className="flex items-center gap-3 flex-wrap">
 <h1 className="text-2xl font-bold text-[var(--text-primary)] truncate">
 {client.name ?? "Sin nombre"}
 </h1>
 <span
 className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold ${s.bg} ${s.text}`}
 >
 <span className={`w-1.5 h-1.5 rounded-full ${s.dot}`} />
 {s.label}
 </span>
 </div>

 {/* Info row */}
 <div className="flex flex-wrap items-center gap-x-5 gap-y-1.5 text-sm text-[var(--text-secondary)]">
 {client.email && (
 <span className="flex items-center gap-1.5 hover:text-[var(--text-primary)] transition-colors">
 <EnvelopeIcon className="w-4 h-4 text-gray-500" />
 {client.email}
 </span>
 )}
 {client.phone && (
 <span className="flex items-center gap-1.5 hover:text-[var(--text-primary)] transition-colors">
 <PhoneIcon className="w-4 h-4 text-gray-500" />
 {client.phone}
 </span>
 )}
 {client.taxId && (
 <span className="flex items-center gap-1.5 hover:text-[var(--text-primary)] transition-colors">
 <IdentificationIcon className="w-4 h-4 text-gray-500" />
 {client.taxId}
 </span>
 )}
 </div>
 </div>
 </div>

 {/* ──── Right: action buttons ──── */}
 <div className="flex flex-wrap items-center gap-2 shrink-0">
 {ACTIONS.map((action) => {
 const Icon = action.icon
 return (
 <button
 key={action.id}
 id={`client360-action-${action.id}`}
 disabled
 className={`
 group relative flex items-center gap-2 px-4 py-2.5 rounded-xl
 bg-[var(--bg-card)] ${action.gradient}
 text-[var(--text-primary)] text-sm font-semibold
 opacity-50 cursor-not-allowed
 transition-all duration-300
 shadow-sm
 `}
 title={`${action.label} (próximamente)`}
 >
 <Icon className="w-4 h-4" />
 <span className="hidden xl:inline">{action.label}</span>
 </button>
 )
 })}
 </div>
 </div>
 </div>
 )
}
