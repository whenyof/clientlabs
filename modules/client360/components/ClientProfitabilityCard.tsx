"use client"

import { TrendingUp, TrendingDown, Minus, BarChart2 } from "lucide-react"
import type { ClientProfitability, MonthBucket } from "../services/getClientProfitability"

function formatCurrency(v: number): string {
  return new Intl.NumberFormat("es-ES", {
    style: "currency", currency: "EUR",
    minimumFractionDigits: 0, maximumFractionDigits: 0,
  }).format(v)
}

function formatPercent(v: number): string {
  return `${v >= 0 ? "+" : ""}${v.toFixed(1)}%`
}

function MiniBarChart({ months }: { months: MonthBucket[] }) {
  const max = Math.max(...months.map((m) => m.revenue), 1)
  return (
    <div className="space-y-1.5">
      <div className="flex items-end gap-[2px] h-12">
        {months.map((m, i) => {
          const h = Math.max((m.revenue / max) * 100, m.revenue > 0 ? 4 : 0)
          const isLast = i === months.length - 1
          return (
            <div key={m.month} className="flex-1 flex flex-col justify-end" title={`${m.label}: ${formatCurrency(m.revenue)}`}>
              <div
                className="w-full rounded-[2px] transition-colors"
                style={{
                  height: `${h}%`,
                  minHeight: m.revenue > 0 ? "2px" : "1px",
                  background: isLast ? "#1FA97A" : m.revenue > 0 ? "rgba(31,169,122,0.25)" : "rgba(0,0,0,0.05)",
                }}
              />
            </div>
          )
        })}
      </div>
      <div className="flex justify-between text-[9px] text-[var(--text-secondary)] opacity-60">
        <span>{months[0]?.label.slice(0, 3)}</span>
        <span className="text-[#1FA97A] opacity-100 font-medium">{months[months.length - 1]?.label}</span>
      </div>
    </div>
  )
}

function TrendBadge({ trend }: { trend: ClientProfitability["trend"] }) {
  const cfg = {
    up:     { Icon: TrendingUp,   label: "Al alza",  cls: "bg-emerald-50 text-emerald-700" },
    down:   { Icon: TrendingDown, label: "A la baja", cls: "bg-red-50 text-red-700"         },
    stable: { Icon: Minus,        label: "Estable",  cls: "bg-neutral-100 text-neutral-500" },
  }[trend]
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold ${cfg.cls}`}>
      <cfg.Icon className="w-3 h-3" />
      {cfg.label}
    </span>
  )
}

interface ClientProfitabilityCardProps {
  profitability: ClientProfitability
}

export function ClientProfitabilityCard({ profitability: p }: ClientProfitabilityCardProps) {
  const hasData    = p.totalRevenue > 0
  const marginColor = p.marginPercent === null ? "text-[var(--text-secondary)]"
    : p.marginPercent >= 20 ? "text-[#1FA97A]"
    : p.marginPercent >= 0  ? "text-[var(--text-secondary)]"
    : "text-red-600"

  return (
    <div className="bg-[var(--bg-card)] rounded-xl border border-[var(--border-subtle)] overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-3 border-b border-[var(--border-subtle)]">
        <div className="flex items-center gap-2">
          <BarChart2 className="w-3.5 h-3.5 text-[var(--text-secondary)]" aria-hidden="true" />
          <span className="text-[11px] font-semibold uppercase tracking-wider text-[var(--text-secondary)]">
            Rentabilidad
          </span>
        </div>
        {hasData && <TrendBadge trend={p.trend} />}
      </div>

      <div className="px-5 py-4">
        {!hasData ? (
          <p className="text-[13px] text-[var(--text-secondary)] leading-relaxed">
            Sin datos suficientes aún.
          </p>
        ) : (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <div className="text-[9px] uppercase tracking-wider text-[var(--text-secondary)] mb-1">Ingresos</div>
                <div className="text-[18px] font-bold tabular-nums text-[var(--text-primary)]">
                  {formatCurrency(p.totalRevenue)}
                </div>
              </div>
              {p.marginPercent !== null && (
                <div>
                  <div className="text-[9px] uppercase tracking-wider text-[var(--text-secondary)] mb-1">Margen</div>
                  <div className={`text-[18px] font-bold tabular-nums ${marginColor}`}>
                    {formatPercent(p.marginPercent)}
                  </div>
                </div>
              )}
            </div>
            {p.months && p.months.length > 0 && <MiniBarChart months={p.months} />}
          </div>
        )}
      </div>
    </div>
  )
}
