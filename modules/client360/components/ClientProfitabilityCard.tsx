"use client"

import {
 ArrowTrendingUpIcon,
 ArrowTrendingDownIcon,
 MinusIcon,
 CurrencyEuroIcon,
 ChartBarSquareIcon,
 CalendarDaysIcon,
 SparklesIcon,
} from "@heroicons/react/24/outline"
import type { ClientProfitability, MonthBucket } from "../services/getClientProfitability"

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

function formatPercent(value: number): string {
 return `${value >= 0 ? "+" : ""}${value.toFixed(1)}%`
}

// ---------------------------------------------------------------------------
// Mini bar chart — last 12 months revenue
// ---------------------------------------------------------------------------

function MiniBarChart({
 months,
 hasCostData,
}: {
 months: MonthBucket[]
 hasCostData: boolean
}) {
 const maxRevenue = Math.max(...months.map((m) => m.revenue), 1)

 return (
 <div className="space-y-2">
 <div className="flex items-center justify-between text-[11px] text-gray-500 font-semibold uppercase tracking-wider">
 <span>Últimos 12 meses</span>
 <div className="flex items-center gap-3">
 <span className="flex items-center gap-1">
 <span className="w-2 h-2 rounded-sm bg-blue-500" />
 Ingresos
 </span>
 {hasCostData && (
 <span className="flex items-center gap-1">
 <span className="w-2 h-2 rounded-sm bg-emerald-500/50" />
 Costes
 </span>
 )}
 </div>
 </div>

 <div className="flex items-end gap-1 h-24">
 {months.map((m) => {
 const revHeight = Math.max((m.revenue / maxRevenue) * 100, 2)
 const costHeight = hasCostData
 ? Math.max((m.cost / maxRevenue) * 100, m.cost > 0 ? 2 : 0)
 : 0
 const hasActivity = m.revenue > 0 || m.cost > 0

 return (
 <div
 key={m.month}
 className="flex-1 flex flex-col items-center gap-0.5 group/bar"
 title={`${m.label}: ${formatCurrency(m.revenue)}${hasCostData ? ` | Coste: ${formatCurrency(m.cost)}` : ""}`}
 >
 <div className="w-full flex flex-col items-center justify-end h-20 relative">
 {/* Revenue bar */}
 <div
 className={`
 w-full rounded-t-sm transition-all duration-500
 ${hasActivity
 ? "bg-[var(--bg-card)] group-hover/bar:bg-blue-400"
 : "bg-[var(--bg-card)] border border-[var(--border-subtle)]"
 }
 `}
 style={{ height: `${revHeight}%` }}
 />
 {/* Cost overlay */}
 {costHeight > 0 && (
 <div
 className="w-full bg-emerald-500/40 absolute bottom-0 rounded-t-sm group-hover/bar:bg-violet-400/50 transition-all duration-500"
 style={{ height: `${costHeight}%` }}
 />
 )}
 </div>
 <span className="text-[9px] text-gray-600 font-medium truncate w-full text-center group-hover/bar:text-[var(--text-secondary)] transition-colors">
 {m.label.slice(0, 3)}
 </span>
 </div>
 )
 })}
 </div>
 </div>
 )
}

// ---------------------------------------------------------------------------
// Trend badge
// ---------------------------------------------------------------------------

function TrendBadge({ trend }: { trend: ClientProfitability["trend"] }) {
 const config = {
 up: {
 icon: ArrowTrendingUpIcon,
 label: "Al alza",
 bg: "bg-[var(--accent-soft)]",
 text: "text-[var(--accent)]",
 },
 down: {
 icon: ArrowTrendingDownIcon,
 label: "A la baja",
 bg: "bg-[var(--bg-card)]",
 text: "text-[var(--critical)]",
 },
 stable: {
 icon: MinusIcon,
 label: "Estable",
 bg: "bg-gray-500/15",
 text: "text-[var(--text-secondary)]",
 },
 }

 const c = config[trend]
 const Icon = c.icon

 return (
 <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${c.bg} ${c.text}`}>
 <Icon className="w-3.5 h-3.5" />
 {c.label}
 </span>
 )
}

// ---------------------------------------------------------------------------
// KPI mini card
// ---------------------------------------------------------------------------

interface MiniKpiProps {
 icon: React.ComponentType<React.SVGProps<SVGSVGElement>>
 label: string
 value: string
 sublabel?: string
 accent?: string
}

function MiniKpi({ icon: Icon, label, value, sublabel, accent = "text-[var(--text-primary)]" }: MiniKpiProps) {
 return (
 <div className="flex items-center gap-3 group/kpi">
 <div className="shrink-0 p-2 rounded-lg bg-[var(--bg-card)] border border-[var(--border-subtle)] group-hover/kpi:bg-[var(--bg-card)] border border-[var(--border-subtle)] transition-colors">
 <Icon className="w-4 h-4 text-[var(--text-secondary)] group-hover/kpi:text-[var(--text-primary)] transition-colors" />
 </div>
 <div className="min-w-0">
 <div className="text-[11px] text-gray-500 font-medium uppercase tracking-wider">
 {label}
 </div>
 <div className={`text-sm font-bold ${accent} tabular-nums`}>
 {value}
 {sublabel && (
 <span className="text-xs text-gray-500 font-normal ml-1">{sublabel}</span>
 )}
 </div>
 </div>
 </div>
 )
}

// ---------------------------------------------------------------------------
// Month KPI card (best / worst)
// ---------------------------------------------------------------------------

function MonthKpiCard({
 bucket,
 label,
 accentColor,
}: {
 bucket: MonthBucket
 label: string
 accentColor: string
}) {
 return (
 <div className="flex items-center gap-3 group/month">
 <div className={`shrink-0 p-2 rounded-lg bg-[var(--bg-card)] border border-[var(--border-subtle)] group-hover/month:bg-[var(--bg-card)] border border-[var(--border-subtle)] transition-colors`}>
 <CalendarDaysIcon className="w-4 h-4 text-[var(--text-secondary)] group-hover/month:text-[var(--text-primary)] transition-colors" />
 </div>
 <div className="min-w-0">
 <div className="text-[11px] text-gray-500 font-medium uppercase tracking-wider">
 {label}
 </div>
 <div className={`text-sm font-bold ${accentColor} tabular-nums`}>
 {bucket.label}
 <span className="text-xs text-gray-500 font-normal ml-1.5">
 {formatCurrency(bucket.revenue)}
 </span>
 </div>
 </div>
 </div>
 )
}

// ---------------------------------------------------------------------------
// Main component
// ---------------------------------------------------------------------------

interface ClientProfitabilityCardProps {
 profitability: ClientProfitability
}

export function ClientProfitabilityCard({ profitability: p }: ClientProfitabilityCardProps) {
  const hasData = p.totalRevenue > 0

  const marginColor =
    p.marginPercent !== null
      ? p.marginPercent >= 40
        ? "text-[var(--accent)]"
        : p.marginPercent >= 20
          ? "text-[var(--accent)]"
          : p.marginPercent >= 0
            ? "text-[var(--text-secondary)]"
            : "text-[var(--critical)]"
      : "text-[var(--text-secondary)]"

  return (
    <section id="client360-profitability" className="border-b border-neutral-200 pb-4 space-y-3">
      <div className="flex items-center gap-2">
        <ChartBarSquareIcon className="w-4 h-4 text-[var(--text-secondary)]" />
        <h3 className="text-xs font-semibold uppercase tracking-wider text-[var(--text-secondary)]">
          Rentabilidad
        </h3>
        {hasData && <TrendBadge trend={p.trend} />}
      </div>

      {!hasData ? (
        <div className="flex items-center gap-3 text-xs text-[var(--text-secondary)]">
          <SparklesIcon className="w-4 h-4 text-gray-500" />
          <span>Sin datos suficientes para calcular la rentabilidad del cliente.</span>
        </div>
      ) : (
        <div className="flex items-baseline justify-between text-sm">
          <div className="space-y-0.5">
            <div className="text-[11px] uppercase tracking-wider text-gray-500">
              Ingresos
            </div>
            <div className="text-lg font-semibold text-[var(--text-primary)] tabular-nums">
              {formatCurrency(p.totalRevenue)}
            </div>
          </div>
          <div className="text-right space-y-0.5">
            <div className="text-[11px] uppercase tracking-wider text-gray-500">
              Margen
            </div>
            <div className={`text-lg font-semibold tabular-nums ${marginColor}`}>
              {p.marginPercent !== null ? formatPercent(p.marginPercent) : "—"}
            </div>
          </div>
        </div>
      )}
    </section>
  )
}
