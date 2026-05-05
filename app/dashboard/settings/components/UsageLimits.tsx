"use client"

import { useState, useEffect, useCallback } from "react"
import { cn } from "@/lib/utils"

interface UsageItem {
  label: string
  current: number
  limit: number
  unit: string
}

function getStatus(current: number, limit: number) {
  if (limit === -1) return { color: "bg-[var(--accent)]", text: "text-[var(--accent)]", bg: "bg-emerald-50", label: "Ilimitado" }
  const pct = (current / limit) * 100
  if (pct >= 90) return { color: "bg-red-500", text: "text-red-600", bg: "bg-red-50", label: "Crítico" }
  if (pct >= 80) return { color: "bg-amber-400", text: "text-amber-600", bg: "bg-amber-50", label: "Atención" }
  return { color: "bg-[var(--accent)]", text: "text-[var(--accent)]", bg: "bg-emerald-50", label: "Normal" }
}

function planLabel(plan: string) {
  if (plan === "TRIAL") return "Prueba (Pro)"
  if (plan === "FREE" || plan === "STARTER") return "Starter"
  if (plan === "PRO") return "Pro"
  if (plan === "BUSINESS") return "Business"
  return plan
}

const DEFAULT_USAGE: UsageItem[] = [
  { label: "Leads", current: 0, limit: 50, unit: "" },
  { label: "Clientes", current: 0, limit: 20, unit: "" },
  { label: "Miembros del equipo", current: 0, limit: 1, unit: "" },
  { label: "Automatizaciones activas", current: 0, limit: 0, unit: "" },
  { label: "Almacenamiento", current: 0, limit: 0.5, unit: "GB" },
]

export function UsageLimits() {
  const [usage, setUsage] = useState<UsageItem[]>(DEFAULT_USAGE)
  const [plan, setPlan] = useState<string>("STARTER")
  const [loading, setLoading] = useState(true)

  const loadUsage = useCallback(async () => {
    try {
      const res = await fetch("/api/settings/usage")
      const data = await res.json()
      if (data.success) {
        setUsage(data.usage ?? DEFAULT_USAGE)
        setPlan(data.plan ?? "STARTER")
      }
    } catch {
      // silently use defaults
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { loadUsage() }, [loadUsage])

  if (loading) {
    return <div className="text-slate-400 py-8 text-sm text-center">Cargando uso del plan…</div>
  }

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
            <span className="text-sm font-bold text-[var(--accent)]">PLAN {plan}</span>
            <p className="text-xs text-slate-500 mt-0.5">Datos actualizados en tiempo real</p>
          </div>
          <span className="text-sm font-medium text-slate-600 bg-slate-50 border border-slate-200 px-3 py-1.5 rounded-lg">
            {planLabel(plan)}
          </span>
        </div>
      </div>

      {/* Usage Items */}
      <div className="bg-white rounded-xl border border-slate-200 divide-y divide-slate-50">
        {usage.map((item) => {
          const isUnlimited = item.limit === -1
          const pct = isUnlimited ? 0 : Math.round((item.current / item.limit) * 100)
          const status = getStatus(item.current, item.limit)

          return (
            <div key={item.label} className="px-6 py-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-[#0B1F2A]">{item.label}</span>
                <div className="flex items-center gap-3">
                  <span className="text-sm text-slate-700 font-mono">
                    {item.current.toLocaleString()}{item.unit}
                    {!isUnlimited && ` / ${item.limit.toLocaleString()}${item.unit}`}
                  </span>
                  <span className={cn("text-[10px] font-semibold uppercase px-1.5 py-0.5 rounded", status.text, status.bg)}>
                    {isUnlimited ? "∞" : `${pct}%`}
                  </span>
                </div>
              </div>
              {!isUnlimited && (
                <div className="w-full bg-slate-100 rounded-full h-1.5">
                  <div
                    className={cn("h-1.5 rounded-full transition-all", status.color)}
                    style={{ width: `${Math.min(pct, 100)}%` }}
                  />
                </div>
              )}
              {pct >= 80 && !isUnlimited && (
                <p className="text-xs text-amber-600 mt-1">
                  Estás cerca del límite de tu plan. Considera actualizar.
                </p>
              )}
            </div>
          )
        })}
      </div>

      {/* Capacity Note */}
      <div className="bg-white rounded-xl border border-slate-200 p-6">
        <h3 className="text-sm font-medium text-slate-500 mb-2">Diagnóstico</h3>
        <p className="text-sm text-[#0B1F2A]">
          {usage.some((u) => u.limit !== -1 && (u.current / u.limit) >= 0.8)
            ? "Algunos recursos están cerca del límite. Considera actualizar tu plan."
            : "Tu consumo actual se mantiene dentro de los límites del plan. No se requieren acciones inmediatas."}
        </p>
      </div>
    </div>
  )
}
