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
                            <span className="w-2 h-2 rounded-sm bg-violet-500/50" />
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
                                            ? "bg-blue-500/80 group-hover/bar:bg-blue-400"
                                            : "bg-gray-700/30"
                                        }
                                    `}
                                    style={{ height: `${revHeight}%` }}
                                />
                                {/* Cost overlay */}
                                {costHeight > 0 && (
                                    <div
                                        className="w-full bg-violet-500/40 absolute bottom-0 rounded-t-sm group-hover/bar:bg-violet-400/50 transition-all duration-500"
                                        style={{ height: `${costHeight}%` }}
                                    />
                                )}
                            </div>
                            <span className="text-[9px] text-gray-600 font-medium truncate w-full text-center group-hover/bar:text-gray-400 transition-colors">
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
            bg: "bg-emerald-500/15",
            text: "text-emerald-400",
        },
        down: {
            icon: ArrowTrendingDownIcon,
            label: "A la baja",
            bg: "bg-red-500/15",
            text: "text-red-400",
        },
        stable: {
            icon: MinusIcon,
            label: "Estable",
            bg: "bg-gray-500/15",
            text: "text-gray-400",
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

function MiniKpi({ icon: Icon, label, value, sublabel, accent = "text-white" }: MiniKpiProps) {
    return (
        <div className="flex items-center gap-3 group/kpi">
            <div className="shrink-0 p-2 rounded-lg bg-gray-700/40 group-hover/kpi:bg-gray-700/60 transition-colors">
                <Icon className="w-4 h-4 text-gray-400 group-hover/kpi:text-white transition-colors" />
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
            <div className={`shrink-0 p-2 rounded-lg bg-gray-700/40 group-hover/month:bg-gray-700/60 transition-colors`}>
                <CalendarDaysIcon className="w-4 h-4 text-gray-400 group-hover/month:text-white transition-colors" />
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
                ? "text-emerald-400"
                : p.marginPercent >= 20
                    ? "text-blue-400"
                    : p.marginPercent >= 0
                        ? "text-amber-400"
                        : "text-red-400"
            : "text-gray-400"

    return (
        <div
            id="client360-profitability"
            className="
                relative overflow-hidden rounded-2xl
                bg-gray-800/50 backdrop-blur-sm
                border border-gray-700/50
                transition-all duration-300
                hover:border-gray-600/60 hover:shadow-2xl hover:shadow-fuchsia-500/5
            "
        >
            {/* Top gradient stripe */}
            <div className="h-1 bg-gradient-to-r from-fuchsia-500 via-purple-500 to-blue-500" />

            {/* Background glow */}
            <div className="absolute inset-0 bg-gradient-to-br from-fuchsia-500/5 to-purple-600/5 opacity-50 pointer-events-none" />

            {/* Header */}
            <div className="relative flex items-center justify-between px-6 py-4 border-b border-gray-700/40">
                <div className="flex items-center gap-3">
                    <div className="p-2.5 rounded-xl bg-gradient-to-br from-fuchsia-500 to-purple-600 shadow-lg">
                        <ChartBarSquareIcon className="w-5 h-5 text-white" />
                    </div>
                    <div>
                        <h3 className="text-sm font-bold text-white tracking-wide">
                            Rentabilidad
                        </h3>
                        <p className="text-[11px] text-gray-500 font-medium">
                            Análisis de ingresos{p.hasCostData ? " y costes" : ""}
                        </p>
                    </div>
                </div>
                {hasData && <TrendBadge trend={p.trend} />}
            </div>

            {/* Body */}
            <div className="relative p-6">
                {!hasData ? (
                    /* ────── Empty state ────── */
                    <div className="flex flex-col items-center justify-center py-8 text-center">
                        <div className="w-16 h-16 mb-4 rounded-2xl bg-gray-700/40 flex items-center justify-center">
                            <SparklesIcon className="w-8 h-8 text-gray-600" />
                        </div>
                        <p className="text-sm text-gray-400 font-medium">
                            Sin datos de facturación
                        </p>
                        <p className="text-xs text-gray-600 mt-1 max-w-[240px]">
                            El análisis de rentabilidad estará disponible cuando existan facturas emitidas
                        </p>
                    </div>
                ) : (
                    <div className="space-y-6">
                        {/* ── Hero metrics ── */}
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                            {/* Revenue */}
                            <div className="rounded-xl bg-gray-800/60 border border-gray-700/30 p-4 text-center group hover:border-blue-500/30 transition-colors">
                                <div className="text-[11px] text-gray-500 font-semibold uppercase tracking-wider mb-1">
                                    Facturación total
                                </div>
                                <div className="text-2xl font-bold text-white tabular-nums">
                                    {formatCurrency(p.totalRevenue)}
                                </div>
                            </div>

                            {/* Profit */}
                            <div className="rounded-xl bg-gray-800/60 border border-gray-700/30 p-4 text-center group hover:border-purple-500/30 transition-colors">
                                <div className="text-[11px] text-gray-500 font-semibold uppercase tracking-wider mb-1">
                                    {p.hasCostData ? "Beneficio estimado" : "—"}
                                </div>
                                <div className={`text-2xl font-bold tabular-nums ${p.profit !== null ? (p.profit >= 0 ? "text-emerald-400" : "text-red-400") : "text-gray-600"}`}>
                                    {p.profit !== null ? formatCurrency(p.profit) : "—"}
                                </div>
                                {!p.hasCostData && (
                                    <div className="text-[10px] text-gray-600 mt-1">
                                        Sin datos de coste
                                    </div>
                                )}
                            </div>

                            {/* Margin */}
                            <div className="rounded-xl bg-gray-800/60 border border-gray-700/30 p-4 text-center group hover:border-fuchsia-500/30 transition-colors">
                                <div className="text-[11px] text-gray-500 font-semibold uppercase tracking-wider mb-1">
                                    {p.hasCostData ? "Margen" : "—"}
                                </div>
                                <div className={`text-2xl font-bold tabular-nums ${marginColor}`}>
                                    {p.marginPercent !== null ? formatPercent(p.marginPercent) : "—"}
                                </div>
                                {!p.hasCostData && (
                                    <div className="text-[10px] text-gray-600 mt-1">
                                        Sin datos de coste
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* ── Mini bar chart ── */}
                        <MiniBarChart months={p.months} hasCostData={p.hasCostData} />

                        {/* ── Bottom KPIs row ── */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-2 border-t border-gray-700/30">
                            {p.bestMonth && (
                                <MonthKpiCard
                                    bucket={p.bestMonth}
                                    label="Mejor mes"
                                    accentColor="text-emerald-400"
                                />
                            )}
                            {p.worstMonth && (
                                <MonthKpiCard
                                    bucket={p.worstMonth}
                                    label="Peor mes"
                                    accentColor="text-amber-400"
                                />
                            )}
                            {p.hasCostData && p.totalCost !== null && (
                                <MiniKpi
                                    icon={CurrencyEuroIcon}
                                    label="Coste total"
                                    value={formatCurrency(p.totalCost)}
                                />
                            )}
                            <MiniKpi
                                icon={ArrowTrendingUpIcon}
                                label="Tendencia"
                                value={
                                    p.trend === "up"
                                        ? "Creciente"
                                        : p.trend === "down"
                                            ? "Decreciente"
                                            : "Estable"
                                }
                                accent={
                                    p.trend === "up"
                                        ? "text-emerald-400"
                                        : p.trend === "down"
                                            ? "text-red-400"
                                            : "text-gray-400"
                                }
                            />
                        </div>
                    </div>
                )}
            </div>

            {/* Hover glow overlay */}
            <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-white/[0.01] to-white/[0.03] opacity-0 hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
        </div>
    )
}
