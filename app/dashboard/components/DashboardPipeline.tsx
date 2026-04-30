"use client"

import { TrendingUp, ArrowRight } from "lucide-react"

interface Props {
  leadsByStatus: {
    NEW: number
    CONTACTED: number
    QUALIFIED: number
    CONVERTED: number
    LOST: number
  }
}

const STAGES = [
  { key: "NEW" as const, label: "Nuevos", color: "#475569", bg: "#F8FAFC", border: "#E2E8F0", strip: "#94A3B8", pill: "#E2E8F0" },
  { key: "CONTACTED" as const, label: "Contactados", color: "#1D4ED8", bg: "#EFF6FF", border: "#DBEAFE", strip: "#60A5FA", pill: "#DBEAFE" },
  { key: "QUALIFIED" as const, label: "Cualificados", color: "#92400E", bg: "#FFFBEB", border: "#FEF3C7", strip: "#FBBF24", pill: "#FEF3C7" },
  { key: "CONVERTED" as const, label: "Convertidos", color: "#1FA97A", bg: "#ECFDF5", border: "#D1FAE5", strip: "#34D399", pill: "#D1FAE5" },
]

function stepConv(from: number, to: number): number | null {
  if (from === 0) return null
  return Math.round((to / from) * 100)
}

function convColor(cr: number | null): string {
  if (cr === null) return "#CBD5E1"
  if (cr >= 80) return "#1FA97A"
  if (cr >= 50) return "#D97706"
  return "#DC2626"
}

export function DashboardPipeline({ leadsByStatus }: Props) {
  const total = Object.values(leadsByStatus).reduce((a, b) => a + b, 0)
  const activeTotal = STAGES.reduce((s, st) => s + leadsByStatus[st.key], 0)
  const globalConv = total > 0 ? Math.round((leadsByStatus.CONVERTED / total) * 100) : 0
  const lostPct = total > 0 ? Math.round((leadsByStatus.LOST / total) * 100) : 0

  if (total === 0) {
    return (
      <div className="rounded-xl border border-slate-200 bg-white p-4">
        <h3 className="mb-3 text-[13px] font-semibold text-slate-900">Pipeline de leads</h3>
        <div className="flex h-[96px] flex-col items-center justify-center gap-2 rounded-lg border border-dashed border-slate-200 bg-slate-50">
          <TrendingUp className="h-5 w-5 text-slate-300" />
          <p className="text-[11px] text-slate-400">Los leads aparecerán aquí cuando los añadas</p>
        </div>
      </div>
    )
  }

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4">
      {/* Header */}
      <div className="mb-3 flex items-center justify-between gap-2">
        <div className="min-w-0">
          <h3 className="text-[13px] font-semibold text-slate-900">Pipeline de leads</h3>
          <p className="mt-0.5 text-[10px] text-slate-400">{total} leads · {activeTotal} activos</p>
        </div>
        <div className="flex flex-shrink-0 items-center gap-1.5 rounded-lg bg-[#ECFDF5] px-2.5 py-1.5">
          <TrendingUp className="h-3 w-3 text-[#1FA97A]" />
          <span className="text-[10px] font-semibold text-[#1FA97A]">{globalConv}% conv.</span>
        </div>
      </div>

      {/* Distribution strip */}
      <div className="mb-3 flex h-[4px] overflow-hidden rounded-full bg-slate-100">
        {STAGES.map((s) => (
          <div key={s.key} style={{ flex: Math.max(leadsByStatus[s.key], 0.01), backgroundColor: s.strip }} />
        ))}
        <div style={{ flex: Math.max(leadsByStatus.LOST, 0.01), backgroundColor: "#FCA5A5" }} />
      </div>

      {/* Stage cards — horizontally scrollable on small screens */}
      <div className="overflow-x-auto -mx-4 px-4">
        <div className="flex items-stretch gap-0 min-w-[480px]">
          {STAGES.map((stage, idx) => {
            const count = leadsByStatus[stage.key]
            const next = STAGES[idx + 1]
            const cr = next ? stepConv(count, leadsByStatus[next.key]) : null
            const pct = activeTotal > 0 ? Math.round((count / activeTotal) * 100) : 0

            return (
              <div key={stage.key} className="flex flex-1 items-stretch">
                {/* Card */}
                <div
                  className="flex flex-1 flex-col overflow-hidden rounded-xl"
                  style={{ backgroundColor: stage.bg, border: `1px solid ${stage.border}` }}
                >
                  {/* Color strip */}
                  <div className="h-[3px] w-full" style={{ backgroundColor: stage.strip }} />
                  {/* Content */}
                  <div className="flex flex-1 flex-col items-center justify-center gap-1 px-2 py-3">
                    <span className="text-[22px] sm:text-[28px] font-bold leading-none tabular-nums" style={{ color: stage.color }}>
                      {count}
                    </span>
                    <span className="text-[8px] font-semibold uppercase tracking-[0.1em] text-slate-400">
                      {stage.label}
                    </span>
                    <span
                      className="rounded-full px-1.5 py-0.5 text-[8px] font-semibold"
                      style={{ backgroundColor: stage.pill, color: stage.color }}
                    >
                      {pct}%
                    </span>
                  </div>
                </div>

                {/* Arrow + conversion rate */}
                {cr !== null && (
                  <div className="flex w-7 flex-shrink-0 flex-col items-center justify-center gap-0.5">
                    <span className="text-[8px] font-semibold tabular-nums" style={{ color: convColor(cr) }}>
                      {cr}%
                    </span>
                    <ArrowRight className="h-3 w-3 text-slate-200" />
                  </div>
                )}
              </div>
            )
          })}

          {/* Divider */}
          <div className="mx-2 w-px self-stretch bg-slate-100" />

          {/* Lost card */}
          <div className="flex w-[76px] flex-shrink-0 flex-col overflow-hidden rounded-xl border border-red-100 bg-red-50/60">
            <div className="h-[3px] w-full bg-red-300" />
            <div className="flex flex-1 flex-col items-center justify-center gap-1 px-2 py-3">
              <span className="text-[22px] sm:text-[28px] font-bold leading-none tabular-nums text-red-400">
                {leadsByStatus.LOST}
              </span>
              <span className="text-[8px] font-semibold uppercase tracking-[0.1em] text-slate-400">
                Perdidos
              </span>
              <span className="rounded-full bg-red-100 px-1.5 py-0.5 text-[8px] font-semibold text-red-400">
                {lostPct}%
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
