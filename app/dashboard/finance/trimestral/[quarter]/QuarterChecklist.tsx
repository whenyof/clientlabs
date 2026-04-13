"use client"

import { useState, useEffect } from "react"
import { CheckSquare, Square } from "lucide-react"
import { cn } from "@/lib/utils"

type ValidQuarter = "q1" | "q2" | "q3" | "q4"

const CHECKLIST_ITEMS = [
  { id: "facturas", label: "Todas las facturas del trimestre estan registradas" },
  { id: "gastos", label: "Los gastos con IVA deducible estan categorizados" },
  { id: "rectificativas", label: "Las facturas rectificativas estan incluidas" },
  { id: "datos", label: "Los datos del cliente / empresa son correctos" },
  { id: "asesor", label: "He revisado el resultado con mi asesor fiscal" },
]

function getStorageKey(quarter: ValidQuarter) {
  const year = new Date().getFullYear()
  return `trimestral-checklist-${year}-${quarter}`
}

type Props = { quarter: ValidQuarter }

export function QuarterChecklist({ quarter }: Props) {
  const [checked, setChecked] = useState<Record<string, boolean>>({})
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    try {
      const stored = localStorage.getItem(getStorageKey(quarter))
      if (stored) setChecked(JSON.parse(stored))
    } catch {
      // ignore
    }
  }, [quarter])

  const toggle = (id: string) => {
    setChecked((prev) => {
      const next = { ...prev, [id]: !prev[id] }
      try {
        localStorage.setItem(getStorageKey(quarter), JSON.stringify(next))
      } catch {
        // ignore
      }
      return next
    })
  }

  const completedCount = CHECKLIST_ITEMS.filter((item) => checked[item.id]).length
  const allDone = completedCount === CHECKLIST_ITEMS.length

  return (
    <div className="rounded-xl border border-slate-200 bg-white overflow-hidden">
      <div className="px-5 py-4 border-b border-slate-100 bg-slate-50">
        <div className="flex items-center justify-between">
          <h3 className="text-[14px] font-semibold text-slate-900">Verificacion previa</h3>
          <span className={cn(
            "text-[11px] font-semibold px-2 py-0.5 rounded-md",
            allDone ? "bg-[#1FA97A]/10 text-[#1FA97A]" : "bg-slate-100 text-slate-500"
          )}>
            {completedCount}/{CHECKLIST_ITEMS.length}
          </span>
        </div>
        <p className="text-[11px] text-slate-400 mt-0.5">Antes de presentar la declaracion</p>
      </div>

      <div className="px-5 py-4 space-y-3">
        {!mounted ? (
          <div className="space-y-3">
            {CHECKLIST_ITEMS.map((item) => (
              <div key={item.id} className="h-5 bg-slate-100 rounded animate-pulse" />
            ))}
          </div>
        ) : (
          CHECKLIST_ITEMS.map((item) => {
            const isChecked = !!checked[item.id]
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => toggle(item.id)}
                className="flex items-start gap-3 w-full text-left group"
                aria-checked={isChecked}
                role="checkbox"
              >
                <span className="shrink-0 mt-0.5">
                  {isChecked ? (
                    <CheckSquare className="h-4 w-4 text-[#1FA97A]" />
                  ) : (
                    <Square className="h-4 w-4 text-slate-300 group-hover:text-slate-400 transition-colors" />
                  )}
                </span>
                <span className={cn(
                  "text-[12px] leading-relaxed transition-colors",
                  isChecked ? "text-slate-400 line-through" : "text-slate-700"
                )}>
                  {item.label}
                </span>
              </button>
            )
          })
        )}
      </div>

      {allDone && mounted && (
        <div className="px-5 py-3 border-t border-[#1FA97A]/20 bg-emerald-50/50">
          <p className="text-[11px] font-medium text-[#1FA97A]">
            Todo verificado. Puedes presentar la declaracion.
          </p>
        </div>
      )}
    </div>
  )
}
