"use client"

import {
 CurrencyEuroIcon,
 CalendarDaysIcon,
 ClockIcon,
 ExclamationTriangleIcon,
 ChartBarIcon,
 ArrowTrendingUpIcon,
} from "@heroicons/react/24/outline"
import type { ComponentType, SVGProps } from "react"
import type { ClientFinancialKPIs } from "../types"

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function formatCurrency(value: number): string {
 return new Intl.NumberFormat("es-ES", {
 style: "currency",
 currency: "EUR",
 minimumFractionDigits: 0,
 maximumFractionDigits: 0,
 }).format(value)
}

function formatDays(value: number): string {
 return `${value}d`
}

// ---------------------------------------------------------------------------
// Card visual config (same structure as before — no redesign)
// ---------------------------------------------------------------------------

interface KpiCardDef {
 id: string
 label: string
 icon: ComponentType<SVGProps<SVGSVGElement>>
 gradient: string
 bgGradient: string
 borderHover: string
 glowColor: string
 format: (kpis: ClientFinancialKPIs) => string
 alert?: (kpis: ClientFinancialKPIs) => boolean
}

const KPI_CARDS: KpiCardDef[] = [
 {
 id: "total-revenue",
 label: "Ingresos totales",
 icon: CurrencyEuroIcon,
 gradient: " ",
 bgGradient: " ",
 borderHover: "hover:border-[var(--accent)]",
 glowColor: "group-hover:shadow-emerald-500/10",
 format: (k) => formatCurrency(k.totalRevenue),
 },
 {
 id: "revenue-ytd",
 label: "Ingresos YTD",
 icon: CalendarDaysIcon,
 gradient: " ",
 bgGradient: " ",
 borderHover: "hover:border-blue-500/40",
 glowColor: "group-hover:shadow-blue-500/10",
 format: (k) => formatCurrency(k.revenueYTD),
 },
 {
 id: "pending",
 label: "Pendiente",
 icon: ClockIcon,
 gradient: " ",
 bgGradient: " ",
 borderHover: "hover:border-[var(--border-subtle)]",
 glowColor: "group-hover:shadow-amber-500/10",
 format: (k) => formatCurrency(k.pending),
 alert: (k) => k.pending > 0,
 },
 {
 id: "overdue",
 label: "Vencido",
 icon: ExclamationTriangleIcon,
 gradient: " ",
 bgGradient: " ",
 borderHover: "hover:border-[var(--critical)]",
 glowColor: "group-hover:shadow-red-500/10",
 format: (k) => formatCurrency(k.overdue),
 alert: (k) => k.overdue > 0,
 },
 {
 id: "avg-pay-time",
 label: "Tiempo medio de pago",
 icon: ChartBarIcon,
 gradient: " ",
 bgGradient: " ",
 borderHover: "hover:border-emerald-500/40",
 glowColor: "group-hover:shadow-emerald-500/10",
 format: (k) => formatDays(k.avgPaymentDays),
 },
 {
 id: "profitability",
 label: "Rentabilidad",
 icon: ArrowTrendingUpIcon,
 gradient: " ",
 bgGradient: " ",
 borderHover: "hover:border-emerald-500/40",
 glowColor: "group-hover:shadow-emerald-500/10",
 format: (k) =>
 k.profitability !== null ? formatCurrency(k.profitability) : "—",
 },
]

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

interface ClientKpiStripProps {
 kpis: ClientFinancialKPIs | null
}

export function ClientKpiStrip({ kpis }: ClientKpiStripProps) {
 const isLoading = kpis === null

 return (
 <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
 {KPI_CARDS.map((card) => {
 const Icon = card.icon
 const displayValue = isLoading ? "…" : card.format(kpis)
 const showAlert = !isLoading && card.alert?.(kpis)

 return (
 <div
 key={card.id}
 id={`client360-kpi-${card.id}`}
 className={`
 group relative overflow-hidden rounded-2xl
 bg-[var(--bg-card)] backdrop-
 border border-[var(--border-subtle)] ${card.borderHover}
 transition-all duration-300
 hover:scale-[1.03] hover:shadow-sm ${card.glowColor}
 `}
 >
 {/* Background gradient */}
 <div
 className={`absolute inset-0 bg-[var(--bg-card)] ${card.bgGradient} opacity-50`}
 />

 {/* Alert pulse for overdue/pending */}
 {showAlert && (
 <div className="absolute top-3 right-3 z-10">
 <span className="relative flex h-2.5 w-2.5">
 <span
 className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 bg-[var(--bg-card)] ${card.gradient}`}
 />
 <span
 className={`relative inline-flex rounded-full h-2.5 w-2.5 bg-[var(--bg-card)] ${card.gradient}`}
 />
 </span>
 </div>
 )}

 {/* Content */}
 <div className="relative p-5">
 <div className="flex items-center gap-3 mb-3">
 <div
 className={`p-2.5 rounded-xl bg-[var(--bg-card)] ${card.gradient} shadow-sm`}
 >
 <Icon className="w-5 h-5 text-[var(--text-primary)]" />
 </div>
 </div>

 <div
 className={`text-2xl font-bold mb-1 transition-opacity duration-300 ${isLoading ? "text-[var(--text-secondary)] animate-pulse" : "text-[var(--text-primary)]"
 }`}
 >
 {displayValue}
 </div>

 <div className="text-xs text-[var(--text-secondary)] font-medium leading-tight">
 {card.label}
 </div>
 </div>

 {/* Hover glow */}
 <div className="absolute inset-0 rounded-2xl bg-[var(--bg-card)] opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
 </div>
 )
 })}
 </div>
 )
}
