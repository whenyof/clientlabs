"use client"

import { Shield } from "lucide-react"
import type { ClientFinancialRisk } from "../services/getClientFinancialRisk"

function formatCurrency(v: number): string {
  return new Intl.NumberFormat("es-ES", {
    style: "currency", currency: "EUR",
    minimumFractionDigits: 0, maximumFractionDigits: 0,
  }).format(v)
}

const LEVEL = {
  low:    { label: "Bajo",  scoreColor: "#1FA97A", bg: "bg-emerald-50", text: "text-emerald-700" },
  medium: { label: "Medio", scoreColor: "#F59E0B", bg: "bg-amber-50",   text: "text-amber-700"   },
  high:   { label: "Alto",  scoreColor: "#EF4444", bg: "bg-red-50",     text: "text-red-700"     },
} as const

interface ClientFinancialRiskCardProps {
  risk: ClientFinancialRisk
}

export function ClientFinancialRiskCard({ risk }: ClientFinancialRiskCardProps) {
  const cfg        = LEVEL[risk.level]
  const noHistory  = risk.invoicesSent === 0
  const paidPct    = risk.invoicesSent > 0
    ? Math.round((risk.invoicesPaid / risk.invoicesSent) * 100)
    : 0

  return (
    <div className="bg-[var(--bg-card)] rounded-xl border border-[var(--border-subtle)] overflow-hidden">
      {/* Header */}
      <div className="flex items-center gap-2 px-5 py-3 border-b border-[var(--border-subtle)]">
        <Shield className="w-3.5 h-3.5 text-[var(--text-secondary)]" aria-hidden="true" />
        <span className="text-[11px] font-semibold uppercase tracking-wider text-[var(--text-secondary)]">
          Riesgo financiero
        </span>
      </div>

      <div className="px-5 py-4">
        {noHistory ? (
          <p className="text-[13px] text-[var(--text-secondary)] leading-relaxed">
            Sin historial de facturación suficiente para calcular el riesgo.
          </p>
        ) : (
          <div className="space-y-4">
            {/* Score + level */}
            <div className="flex items-end justify-between gap-3">
              <div>
                <div className="text-[9px] uppercase tracking-wider text-[var(--text-secondary)] mb-1">
                  Risk score
                </div>
                <div className="text-[32px] font-bold tabular-nums leading-none" style={{ color: cfg.scoreColor }}>
                  {risk.score}
                  <span className="text-[16px] font-normal text-[var(--text-secondary)] ml-1">/100</span>
                </div>
              </div>
              <span className={`text-[11px] font-semibold px-2.5 py-1 rounded-lg ${cfg.bg} ${cfg.text}`}>
                Riesgo {cfg.label}
              </span>
            </div>

            {/* Paid bar */}
            <div>
              <div className="flex justify-between text-[11px] text-[var(--text-secondary)] mb-1.5">
                <span>Facturas pagadas</span>
                <span className="tabular-nums font-medium">{risk.invoicesPaid}/{risk.invoicesSent} ({paidPct}%)</span>
              </div>
              <div className="h-1.5 rounded-full bg-[var(--border-subtle)] overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-700"
                  style={{ width: `${paidPct}%`, background: cfg.scoreColor }}
                />
              </div>
            </div>

            {/* Overdue */}
            {risk.overdueAmount > 0 && (
              <div className="flex items-center justify-between text-[12px]">
                <span className="text-[var(--text-secondary)]">Importe vencido</span>
                <span className="font-semibold text-red-600 tabular-nums">
                  {formatCurrency(risk.overdueAmount)}
                </span>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
