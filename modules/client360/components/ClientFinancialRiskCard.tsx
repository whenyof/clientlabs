"use client"

import {
 ShieldExclamationIcon,
 ClockIcon,
 DocumentCheckIcon,
 ExclamationTriangleIcon,
 CheckBadgeIcon,
 ChartBarIcon,
} from "@heroicons/react/24/outline"
import type { ClientFinancialRisk } from "../services/getClientFinancialRisk"

// ---------------------------------------------------------------------------
// Visual config per risk level
// ---------------------------------------------------------------------------

const LEVEL_CONFIG = {
 low: {
 gradient: " ",
 bgGradient: " ",
 borderColor: "border-[var(--accent)]",
 textAccent: "text-[var(--accent)]",
 ringColor: "stroke-emerald-500",
 ringBg: "stroke-emerald-500/15",
 glowShadow: "shadow-emerald-500/8",
 dotColor: "bg-[var(--accent-soft)]",
 labelBg: "bg-[var(--accent-soft)]",
 barColor: "bg-[var(--accent-soft)]",
 iconBg: "bg-[var(--accent-soft)]",
 },
 medium: {
 gradient: " ",
 bgGradient: " ",
 borderColor: "border-[var(--border-subtle)]",
 textAccent: "text-[var(--text-secondary)]",
 ringColor: "stroke-amber-500",
 ringBg: "stroke-amber-500/15",
 glowShadow: "shadow-amber-500/8",
 dotColor: "bg-[var(--bg-card)]",
 labelBg: "bg-[var(--bg-card)]",
 barColor: "bg-[var(--bg-card)]",
 iconBg: "bg-[var(--bg-card)]",
 },
 high: {
 gradient: " ",
 bgGradient: " ",
 borderColor: "border-[var(--critical)]",
 textAccent: "text-[var(--critical)]",
 ringColor: "stroke-red-500",
 ringBg: "stroke-red-500/15",
 glowShadow: "shadow-red-500/8",
 dotColor: "bg-[var(--bg-card)]",
 labelBg: "bg-[var(--bg-card)]",
 barColor: "bg-[var(--bg-card)]",
 iconBg: "bg-[var(--bg-card)]",
 },
} as const

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

// ---------------------------------------------------------------------------
// Score ring — circular SVG gauge
// ---------------------------------------------------------------------------

function ScoreRing({
 score,
 level,
 label,
}: {
 score: number
 level: ClientFinancialRisk["level"]
 label: string
}) {
 const cfg = LEVEL_CONFIG[level]
 const radius = 54
 const circumference = 2 * Math.PI * radius
 const progress = (score / 100) * circumference
 const offset = circumference - progress

 return (
 <div className="relative flex flex-col items-center gap-2">
 <svg
 width="140"
 height="140"
 viewBox="0 0 140 140"
 className="transform -rotate-90"
 >
 {/* Background ring */}
 <circle
 cx="70"
 cy="70"
 r={radius}
 fill="none"
 strokeWidth="10"
 className={cfg.ringBg}
 strokeLinecap="round"
 />
 {/* Progress ring */}
 <circle
 cx="70"
 cy="70"
 r={radius}
 fill="none"
 strokeWidth="10"
 className={cfg.ringColor}
 strokeLinecap="round"
 strokeDasharray={circumference}
 strokeDashoffset={offset}
 style={{
 transition: "stroke-dashoffset 1s ease-in-out",
 }}
 />
 </svg>

 {/* Center value */}
 <div className="absolute inset-0 flex flex-col items-center justify-center">
 <span className="text-3xl font-bold text-[var(--text-primary)] tabular-nums tracking-tight">
 {score}
 </span>
 <span className={`text-[10px] font-semibold uppercase tracking-widest ${cfg.textAccent}`}>
 / 100
 </span>
 </div>

 {/* Label pill */}
 <span
 className={`
 inline-flex items-center gap-1.5 px-3 py-1 rounded-full
 text-xs font-bold uppercase tracking-wider
 ${cfg.labelBg} ${cfg.textAccent}
 `}
 >
 <span className={`w-2 h-2 rounded-full ${cfg.dotColor} animate-pulse`} />
 Riesgo {label}
 </span>
 </div>
 )
}

// ---------------------------------------------------------------------------
// Indicator row
// ---------------------------------------------------------------------------

interface IndicatorProps {
 icon: React.ComponentType<React.SVGProps<SVGSVGElement>>
 label: string
 value: string
 sublabel?: string
 accent?: string
 iconBg?: string
}

function Indicator({ icon: Icon, label, value, sublabel, accent = "text-[var(--text-primary)]", iconBg = "bg-[var(--bg-card)] border border-[var(--border-subtle)]" }: IndicatorProps) {
 return (
 <div className="flex items-center gap-3 group/ind">
 <div className={`shrink-0 p-2 rounded-lg ${iconBg} transition-colors duration-200`}>
 <Icon className="w-4 h-4 text-[var(--text-secondary)] group-hover/ind:text-[var(--text-primary)] transition-colors duration-200" />
 </div>
 <div className="min-w-0 flex-1">
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
// Invoice paid bar
// ---------------------------------------------------------------------------

function InvoiceBar({
 sent,
 paid,
 level,
}: {
 sent: number
 paid: number
 level: ClientFinancialRisk["level"]
}) {
 const cfg = LEVEL_CONFIG[level]
 const pct = sent > 0 ? Math.round((paid / sent) * 100) : 0

 return (
 <div className="space-y-2">
 <div className="flex items-center justify-between text-xs">
 <span className="text-[var(--text-secondary)] font-medium">Facturas pagadas</span>
 <span className="text-[var(--text-primary)] font-bold tabular-nums">
 {paid}/{sent}
 <span className="text-gray-500 font-normal ml-1">({pct}%)</span>
 </span>
 </div>
 <div className="h-2 rounded-full bg-[var(--bg-card)] border border-[var(--border-subtle)] overflow-hidden">
 <div
 className={`h-full rounded-full ${cfg.barColor} transition-all duration-700 ease-out`}
 style={{ width: `${pct}%` }}
 />
 </div>
 </div>
 )
}

// ---------------------------------------------------------------------------
// Reasons section
// ---------------------------------------------------------------------------

function ReasonsSection({ reasons, level }: { reasons: string[]; level: ClientFinancialRisk["level"] }) {
 const cfg = LEVEL_CONFIG[level]
 if (reasons.length === 0) return null

 return (
 <div className="space-y-2">
 <div className="text-[11px] text-gray-500 font-semibold uppercase tracking-wider">
 Factores de riesgo
 </div>
 <ul className="space-y-1.5">
 {reasons.map((reason, i) => (
 <li
 key={i}
 className="flex items-start gap-2 text-xs text-[var(--text-secondary)] leading-relaxed"
 >
 <span className={`shrink-0 mt-1.5 w-1.5 h-1.5 rounded-full ${cfg.dotColor} opacity-60`} />
 {reason}
 </li>
 ))}
 </ul>
 </div>
 )
}

// ---------------------------------------------------------------------------
// Main component
// ---------------------------------------------------------------------------

interface ClientFinancialRiskCardProps {
 risk: ClientFinancialRisk
}

export function ClientFinancialRiskCard({ risk }: ClientFinancialRiskCardProps) {
 const cfg = LEVEL_CONFIG[risk.level]

 const hasNoHistory = risk.invoicesSent === 0

 return (
 <div
 id="client360-financial-risk"
 className={`
 relative overflow-hidden rounded-2xl
 bg-[var(--bg-card)] backdrop-
 border ${cfg.borderColor}
 transition-all duration-300
 hover:shadow-sm ${cfg.glowShadow}
 `}
 >
 {/* Top gradient stripe */}
 <div className={`h-1 bg-[var(--bg-card)] ${cfg.gradient}`} />

 {/* Background glow */}
 <div className={`absolute inset-0 bg-[var(--bg-card)] ${cfg.bgGradient} opacity-50 pointer-events-none`} />

 {/* Header */}
 <div className="relative flex items-center gap-3 px-6 py-4 border-b border-[var(--border-subtle)]">
 <div className={`p-2.5 rounded-xl bg-[var(--bg-card)] ${cfg.gradient} shadow-sm`}>
 <ShieldExclamationIcon className="w-5 h-5 text-[var(--text-primary)]" />
 </div>
 <div>
 <h3 className="text-sm font-bold text-[var(--text-primary)] tracking-wide">
 Riesgo Financiero
 </h3>
 <p className="text-[11px] text-gray-500 font-medium">
 Análisis basado en historial de pagos
 </p>
 </div>
 </div>

 {/* Body */}
 <div className="relative p-6">
 {hasNoHistory ? (
 /* ────── Empty state ────── */
 <div className="flex flex-col items-center justify-center py-8 text-center">
 <div className="w-16 h-16 mb-4 rounded-2xl bg-[var(--bg-card)] border border-[var(--border-subtle)] flex items-center justify-center">
 <DocumentCheckIcon className="w-8 h-8 text-gray-600" />
 </div>
 <p className="text-sm text-[var(--text-secondary)] font-medium">
 Sin historial de facturación
 </p>
 <p className="text-xs text-gray-600 mt-1 max-w-[220px]">
 El score de riesgo se calculará cuando existan facturas emitidas
 </p>
 </div>
 ) : (
 /* ────── Full view ────── */
 <div className="flex flex-col lg:flex-row gap-8">
 {/* Left: Score ring */}
 <div className="flex justify-center lg:justify-start">
 <ScoreRing
 score={risk.score}
 level={risk.level}
 label={risk.label}
 />
 </div>

 {/* Right: Indicators + bar */}
 <div className="flex-1 min-w-0 space-y-5">
 {/* Indicators grid */}
 <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
 <Indicator
 icon={ClockIcon}
 label="Retraso medio"
 value={`${risk.avgDelayDays}d`}
 accent={risk.avgDelayDays > 15 ? "text-[var(--text-secondary)]" : "text-[var(--text-primary)]"}
 iconBg={cfg.iconBg}
 />
 <Indicator
 icon={ExclamationTriangleIcon}
 label="Peor retraso"
 value={`${risk.worstDelayDays}d`}
 accent={risk.worstDelayDays > 30 ? "text-[var(--critical)]" : "text-[var(--text-primary)]"}
 iconBg={cfg.iconBg}
 />
 <Indicator
 icon={ChartBarIcon}
 label="Tiempo medio de pago"
 value={`${risk.avgPaymentDays}d`}
 iconBg={cfg.iconBg}
 />
 <Indicator
 icon={CheckBadgeIcon}
 label="Volumen vencido"
 value={formatCurrency(risk.overdueAmount)}
 sublabel={risk.overdueCount > 0 ? `(${risk.overdueCount} fact.)` : undefined}
 accent={risk.overdueAmount > 0 ? "text-[var(--critical)]" : "text-[var(--accent)]"}
 iconBg={cfg.iconBg}
 />
 </div>

 {/* Invoice bar */}
 <InvoiceBar
 sent={risk.invoicesSent}
 paid={risk.invoicesPaid}
 level={risk.level}
 />

 {/* Reasons */}
 <ReasonsSection reasons={risk.reasons} level={risk.level} />
 </div>
 </div>
 )}
 </div>

 {/* Hover glow overlay */}
 <div className="absolute inset-0 rounded-2xl bg-[var(--bg-card)] opacity-0 hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
 </div>
 )
}
