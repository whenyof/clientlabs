"use client"

import { useSectorConfig } from "@/hooks/useSectorConfig"
import { formatReportingCurrency } from "../utils"
import type { TopClient, RevenueByType } from "../types"
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from "recharts"

const COLORS = ["rgba(59, 130, 246, 0.7)", "rgba(139, 92, 246, 0.7)", "rgba(234, 179, 8, 0.7)", "rgba(34, 197, 94, 0.7)", "rgba(249, 115, 22, 0.7)"]

type Props = {
  topClients: TopClient[]
  revenueByType: RevenueByType[]
}

export function ReportingBreakdown({ topClients, revenueByType }: Props) {
  const { labels } = useSectorConfig()
  const r = labels.reporting
  const b = r.breakdown
  const revenueLabel = r.kpis.revenue

  const clientData = topClients.map((c) => ({
    name: c.name.length > 18 ? c.name.slice(0, 18) + "…" : c.name,
    fullName: c.name,
    value: c.revenue,
    count: c.count,
  }))

  const typeData = revenueByType.map((t) => ({
    name: t.name.length > 14 ? t.name.slice(0, 14) + "…" : t.name,
    value: t.value,
    count: t.count,
  }))

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
      <div className="rounded-xl border border-white/10 bg-white/5 p-5 backdrop-blur">
        <h3 className="text-sm font-medium text-white/80 mb-4">{b.topClients}</h3>
        {clientData.length === 0 ? (
          <p className="text-white/40 text-sm">Sin datos</p>
        ) : (
          <div className="h-[200px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={clientData} layout="vertical" margin={{ top: 4, right: 8, left: 0, bottom: 4 }}>
                <XAxis type="number" hide />
                <YAxis
                  type="category"
                  dataKey="name"
                  width={100}
                  tick={{ fill: "rgba(255,255,255,0.7)", fontSize: 11 }}
                  axisLine={false}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "rgb(24 24 27)",
                    border: "1px solid rgba(255,255,255,0.1)",
                    borderRadius: "8px",
                  }}
                  formatter={(value: number, _name: string, props: { payload: { fullName?: string; count: number } }) => [
                    formatReportingCurrency(value),
                    props.payload?.fullName ?? props.payload?.name,
                  ]}
                  labelFormatter={() => ""}
                />
                <Bar dataKey="value" radius={[0, 4, 4, 0]} minPointSize={8}>
                  {clientData.map((_, i) => (
                    <Cell key={clientData[i].name} fill={COLORS[i % COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>

      <div className="rounded-xl border border-white/10 bg-white/5 p-5 backdrop-blur">
        <h3 className="text-sm font-medium text-white/80 mb-4">{b.revenueByType}</h3>
        {typeData.length === 0 ? (
          <p className="text-white/40 text-sm">Sin datos</p>
        ) : (
          <div className="h-[200px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={typeData} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
                <XAxis
                  dataKey="name"
                  tick={{ fill: "rgba(255,255,255,0.5)", fontSize: 10 }}
                  axisLine={{ stroke: "rgba(255,255,255,0.1)" }}
                />
                <YAxis
                  tick={{ fill: "rgba(255,255,255,0.5)", fontSize: 11 }}
                  axisLine={false}
                  tickFormatter={(v) => (v >= 1000 ? `${(v / 1000).toFixed(0)}k` : String(v))}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "rgb(24 24 27)",
                    border: "1px solid rgba(255,255,255,0.1)",
                    borderRadius: "8px",
                  }}
                  formatter={(value: number) => [formatReportingCurrency(value), revenueLabel]}
                />
                <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                  {typeData.map((_, i) => (
                    <Cell key={typeData[i].name} fill={COLORS[i % COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>
    </div>
  )
}
