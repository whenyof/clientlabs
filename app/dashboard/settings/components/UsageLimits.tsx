"use client"

import { cn } from "@/lib/utils"

const usageData = [
  { label: "Clientes", current: 847, limit: 1000, unit: "" },
  { label: "Leads", current: 2340, limit: 5000, unit: "" },
  { label: "Automatizaciones", current: 12, limit: 25, unit: "" },
  { label: "API Calls / mes", current: 8750, limit: 50000, unit: "" },
  { label: "Almacenamiento", current: 2.3, limit: 10, unit: "GB" },
  { label: "Miembros del equipo", current: 3, limit: 5, unit: "" },
]

function getStatus(current: number, limit: number) {
  const pct = (current / limit) * 100
  if (pct >= 90) return { color: "bg-red-500", text: "text-red-600", bg: "bg-red-50", label: "Crítico" }
  if (pct >= 70) return { color: "bg-amber-400", text: "text-amber-600", bg: "bg-amber-50", label: "Atención" }
  return { color: "bg-[var(--accent)]", text: "text-[var(--accent)]", bg: "bg-emerald-50", label: "Normal" }
}

export function UsageLimits() {
  return (
    <div className="space-y-6">
      {/* Section Header */}
      <div>
        <h2 className="text-lg font-semibold text-[#0B1F2A]">Uso del plan</h2>
        <p className="text-sm text-slate-500 mt-0.5">Consumo actual de recursos y límites de tu plan.</p>
      </div>

      {/* Plan Info */}
      <div className="bg-white rounded-xl border border-slate-200 p-6">
        <div className="flex items-center justify-between">
          <div>
            <span className="text-sm font-bold text-[var(--accent)]">PLAN CORPORATE</span>
            <p className="text-xs text-slate-500 mt-0.5">Ciclo actual: 1 Mar - 31 Mar 2026</p>
          </div>
          <button className="px-4 py-2 text-sm font-medium text-[var(--accent)] border border-[var(--accent)]/20 rounded-lg hover:bg-[var(--accent)]/5 transition-colors">
            Cambiar plan
          </button>
        </div>
      </div>

      {/* Usage Items */}
      <div className="bg-white rounded-xl border border-slate-200 divide-y divide-slate-50">
        {usageData.map((item) => {
          const pct = Math.round((item.current / item.limit) * 100)
          const status = getStatus(item.current, item.limit)

          return (
            <div key={item.label} className="px-6 py-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-[#0B1F2A]">{item.label}</span>
                <div className="flex items-center gap-3">
                  <span className="text-sm text-slate-700 font-mono">
                    {item.current.toLocaleString()}{item.unit} / {item.limit.toLocaleString()}{item.unit}
                  </span>
                  <span className={cn("text-[10px] font-semibold uppercase px-1.5 py-0.5 rounded", status.text, status.bg)}>
                    {pct}%
                  </span>
                </div>
              </div>
              <div className="w-full bg-slate-100 rounded-full h-1.5">
                <div
                  className={cn("h-1.5 rounded-full transition-all", status.color)}
                  style={{ width: `${Math.min(pct, 100)}%` }}
                />
              </div>
            </div>
          )
        })}
      </div>

      {/* Capacity Note */}
      <div className="bg-white rounded-xl border border-slate-200 p-6">
        <h3 className="text-sm font-medium text-slate-500 mb-2">Diagnóstico</h3>
        <p className="text-sm text-[#0B1F2A]">
          Tu consumo actual se mantiene dentro de los límites del plan. No se requieren acciones inmediatas.
        </p>
      </div>
    </div>
  )
}