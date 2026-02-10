"use client"

import { useMemo } from "react"
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from "recharts"
import { useSectorConfig } from "@/hooks/useSectorConfig"
import { getPaymentStatusLabel } from "../utils"
import type { Sale } from "../types"

const COLORS = ["#22c55e", "#eab308", "#f97316", "#ef4444", "#a1a1aa"]

type Props = {
  sales: Sale[]
  /** byStatus | byClient */
  variant?: "byStatus" | "byClient"
}

export function SalesDistributionChart({ sales, variant = "byStatus" }: Props) {
  const { labels } = useSectorConfig()
  const sl = labels.sales

  const data = useMemo(() => {
    if (variant === "byStatus") {
      const map = new Map<string, number>()
      for (const s of sales) {
        const key = (s.status || "").toUpperCase() || "PENDIENTE"
        map.set(key, (map.get(key) ?? 0) + 1)
      }
      return Array.from(map.entries()).map(([status, count]) => ({
        name: getPaymentStatusLabel(status, sl),
        value: count,
        key: status,
      }))
    }
    const byClient = new Map<string, number>()
    for (const s of sales) {
      const name = s.clientName || "Sin cliente"
      byClient.set(name, (byClient.get(name) ?? 0) + 1)
    }
    return Array.from(byClient.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 8)
      .map(([name, value]) => ({ name, value, key: name }))
  }, [sales, variant, sl])

  const title = variant === "byStatus" ? sl.distribution.byStatus : sl.distribution.byClient

  return (
    <div className="rounded-xl border border-white/10 bg-white/5 p-6 backdrop-blur">
      <h3 className="text-sm font-medium text-white/80 mb-4">{title}</h3>
      {data.length === 0 ? (
        <div className="min-h-[220px] h-[220px] w-full flex items-center justify-center text-white/40 text-sm">
          —
        </div>
      ) : (
      <div className="min-h-[220px] h-[220px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius={56}
              outerRadius={80}
              paddingAngle={2}
              dataKey="value"
              nameKey="name"
            >
              {data.map((_, i) => (
                <Cell key={data[i].key} fill={COLORS[i % COLORS.length]} stroke="rgb(24 24 27)" strokeWidth={1} />
              ))}
            </Pie>
            <Tooltip
              contentStyle={{
                backgroundColor: "rgb(24 24 27)",
                border: "1px solid rgba(255,255,255,0.1)",
                borderRadius: "8px",
              }}
              formatter={(value: number, _name: string, props: { payload: { value: number } }) => {
                const total = data.reduce((s, d) => s + d.value, 0)
                const pct = total > 0 ? Math.round((value / total) * 100) : 0
                return [value, `${pct}%`]
              }}
            />
            <Legend
              layout="vertical"
              align="right"
              verticalAlign="middle"
              wrapperStyle={{ fontSize: "12px" }}
              formatter={(value) => <span className="text-white/70 text-xs">{value}</span>}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>
      )}
    </div>
  )
}
