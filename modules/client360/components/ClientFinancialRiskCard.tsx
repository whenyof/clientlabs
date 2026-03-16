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
  const hasNoHistory = risk.invoicesSent === 0

  return (
    <section id="client360-financial-risk" className="border-b border-neutral-200 pb-4 space-y-3">
      <div className="flex items-center gap-2">
        <ShieldExclamationIcon className="w-4 h-4 text-[var(--text-secondary)]" />
        <h3 className="text-xs font-semibold uppercase tracking-wider text-[var(--text-secondary)]">
          Riesgo financiero
        </h3>
      </div>

      {hasNoHistory ? (
        <div className="flex items-center gap-3 text-xs text-[var(--text-secondary)]">
          <DocumentCheckIcon className="w-4 h-4 text-gray-500" />
          <span>Sin historial de facturación suficiente para calcular el riesgo.</span>
        </div>
      ) : (
        <div className="flex items-baseline justify-between text-sm">
          <div className="space-y-0.5">
            <div className="text-[11px] uppercase tracking-wider text-gray-500">
              Risk score
            </div>
            <div className="text-2xl font-semibold text-[var(--text-primary)] tabular-nums">
              {risk.score}
            </div>
          </div>
          <div className="text-right space-y-0.5">
            <div className="text-xs text-[var(--text-secondary)]">
              Nivel: <span className="font-medium text-[var(--text-primary)]">{risk.label}</span>
            </div>
            <div className="text-xs text-[var(--text-secondary)]">
              Volumen vencido:{" "}
              <span className="font-medium text-[var(--critical)]">
                {formatCurrency(risk.overdueAmount)}
              </span>
            </div>
          </div>
        </div>
      )}
    </section>
  )
}
