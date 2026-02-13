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
        bg: "bg-emerald-500/15",
        text: "text-emerald-400",
        dot: "bg-emerald-400",
        label: "Activo",
    },
    FOLLOW_UP: {
        bg: "bg-amber-500/15",
        text: "text-amber-400",
        dot: "bg-amber-400",
        label: "Seguimiento",
    },
    INACTIVE: {
        bg: "bg-gray-500/15",
        text: "text-gray-400",
        dot: "bg-gray-400",
        label: "Inactivo",
    },
    VIP: {
        bg: "bg-purple-500/15",
        text: "text-purple-400",
        dot: "bg-purple-400",
        label: "VIP",
    },
}

function getStatusStyle(status: string) {
    return (
        STATUS_STYLES[status] ?? {
            bg: "bg-gray-500/15",
            text: "text-gray-400",
            dot: "bg-gray-400",
            label: status,
        }
    )
}

// ---------------------------------------------------------------------------
// Action buttons config (no functionality yet — structure only)
// ---------------------------------------------------------------------------

const ACTIONS = [
    { id: "new-sale", label: "Nueva venta", icon: PlusIcon, gradient: "from-emerald-600 to-green-600" },
    { id: "new-invoice", label: "Nueva factura", icon: DocumentTextIcon, gradient: "from-blue-600 to-indigo-600" },
    { id: "register-payment", label: "Registrar pago", icon: BanknotesIcon, gradient: "from-violet-600 to-purple-600" },
    { id: "send-reminder", label: "Enviar recordatorio", icon: BellAlertIcon, gradient: "from-amber-600 to-orange-600" },
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
        <div className="rounded-2xl bg-gray-800/50 backdrop-blur-sm border border-gray-700/50 overflow-hidden">
            {/* Decorative top gradient stripe */}
            <div className="h-1 bg-gradient-to-r from-purple-600 via-blue-600 to-emerald-500" />

            <div className="p-6 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
                {/* ──── Left: identity ──── */}
                <div className="flex items-start gap-5 min-w-0">
                    {/* Avatar */}
                    <div className="shrink-0 w-14 h-14 rounded-2xl bg-gradient-to-br from-purple-600 to-blue-600 flex items-center justify-center shadow-lg shadow-purple-500/20">
                        <UserCircleIcon className="w-8 h-8 text-white" />
                    </div>

                    <div className="min-w-0 space-y-2">
                        {/* Name + badge */}
                        <div className="flex items-center gap-3 flex-wrap">
                            <h1 className="text-2xl font-bold text-white truncate">
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
                        <div className="flex flex-wrap items-center gap-x-5 gap-y-1.5 text-sm text-gray-400">
                            {client.email && (
                                <span className="flex items-center gap-1.5 hover:text-white transition-colors">
                                    <EnvelopeIcon className="w-4 h-4 text-gray-500" />
                                    {client.email}
                                </span>
                            )}
                            {client.phone && (
                                <span className="flex items-center gap-1.5 hover:text-white transition-colors">
                                    <PhoneIcon className="w-4 h-4 text-gray-500" />
                                    {client.phone}
                                </span>
                            )}
                            {client.taxId && (
                                <span className="flex items-center gap-1.5 hover:text-white transition-colors">
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
                  bg-gradient-to-r ${action.gradient}
                  text-white text-sm font-semibold
                  opacity-50 cursor-not-allowed
                  transition-all duration-300
                  shadow-lg
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
