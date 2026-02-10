"use client"

import { motion } from "framer-motion"
import { ExclamationTriangleIcon, FireIcon, LightBulbIcon } from "@heroicons/react/24/outline"
import { useFinanceData } from "../context/FinanceDataContext"
import { Alerts } from "./Alerts"

export function FinanceIntelligence() {
  const { analytics } = useFinanceData()
  const k = analytics?.kpis
  const trends = analytics?.trends

  const insightCards: { icon: typeof ExclamationTriangleIcon; label: string; type: "warning" | "fire" | "idea" }[] = []

  if (trends?.expenseGrowth != null && trends.expenseGrowth > 10) {
    insightCards.push({
      icon: ExclamationTriangleIcon,
      label: `Gastos +${trends.expenseGrowth.toFixed(0)}% vs período anterior`,
      type: "warning",
    })
  }
  if (trends?.incomeGrowth != null && trends.incomeGrowth > 5) {
    insightCards.push({
      icon: FireIcon,
      label: `Ingresos +${trends.incomeGrowth.toFixed(0)}% — buena tendencia`,
      type: "fire",
    })
  }
  if (k && k.totalIncome > 0) {
    const marginPct = (k.netProfit / k.totalIncome) * 100
    if (marginPct > 15 && marginPct < 30) {
      insightCards.push({
        icon: LightBulbIcon,
        label: "Margen en rango saludable; oportunidad de upsell en servicios premium",
        type: "idea",
      })
    }
  }

  return (
    <section className="space-y-6" aria-label="Inteligencia financiera">
      {insightCards.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {insightCards.map((card, i) => {
            const Icon = card.icon
            return (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.25, delay: i * 0.06 }}
                className="flex items-start gap-3 rounded-xl bg-white/[0.03] border border-white/[0.08] p-4"
              >
                <span
                  className={`shrink-0 p-2 rounded-lg ${
                    card.type === "warning"
                      ? "bg-amber-500/10 text-amber-400"
                      : card.type === "fire"
                        ? "bg-orange-500/10 text-orange-400"
                        : "bg-white/10 text-white/70"
                  }`}
                >
                  <Icon className="w-4 h-4" aria-hidden />
                </span>
                <p className="text-sm text-white/90 font-medium leading-snug">{card.label}</p>
              </motion.div>
            )
          })}
        </div>
      )}
      <div className="rounded-xl border border-white/[0.08] bg-white/[0.02] overflow-hidden">
        <Alerts />
      </div>
    </section>
  )
}
