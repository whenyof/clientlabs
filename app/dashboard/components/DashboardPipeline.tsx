"use client"

import { ChevronRight } from "lucide-react"

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
  {
    key: "NEW" as const,
    label: "Nuevo",
    bar: "bg-[#E1F5EE] border border-[#9FE1CB]",
  },
  {
    key: "CONTACTED" as const,
    label: "Contactado",
    bar: "bg-blue-100 border border-blue-200",
  },
  {
    key: "QUALIFIED" as const,
    label: "Cualificado",
    bar: "bg-amber-50 border border-amber-200",
  },
  {
    key: "CONVERTED" as const,
    label: "Convertido",
    bar: "bg-[#E1F5EE] border border-[#6EE7B7]",
  },
  {
    key: "LOST" as const,
    label: "Perdido",
    bar: "bg-red-50 border border-red-200",
  },
]

export function DashboardPipeline({ leadsByStatus }: Props) {
  const total = Object.values(leadsByStatus).reduce((a, b) => a + b, 0)
  const maxVal = Math.max(...Object.values(leadsByStatus), 1)

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-[13px] font-semibold text-slate-900">Pipeline de leads</h3>
        <span className="text-[11px] text-slate-400">{total} lead{total !== 1 ? "s" : ""} en total</span>
      </div>

      <div className="flex items-end gap-1">
        {STAGES.map((stage, idx) => {
          const count = leadsByStatus[stage.key]
          const barH = Math.max(8, Math.round((count / maxVal) * 72))

          return (
            <div key={stage.key} className="flex flex-1 items-end gap-1">
              <div className="flex flex-1 flex-col items-center gap-1.5">
                <span className="text-[9px] font-semibold uppercase tracking-[0.08em] text-slate-400">
                  {stage.label}
                </span>
                <div
                  className={`w-full rounded-lg ${stage.bar} transition-all duration-500`}
                  style={{ height: `${barH}px` }}
                />
                <span className="text-[18px] font-bold leading-none text-slate-900">{count}</span>
                <span className="text-[9px] text-slate-400">lead{count !== 1 ? "s" : ""}</span>
              </div>
              {idx < STAGES.length - 1 && (
                <ChevronRight className="mb-8 h-3.5 w-3.5 flex-shrink-0 text-slate-200" />
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
