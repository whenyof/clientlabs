"use client"

import { useState, useEffect } from "react"
import {
  BarChart, Bar, XAxis, YAxis, Tooltip,
  ResponsiveContainer, Cell,
  PieChart, Pie, ReferenceLine
} from "recharts"
import { ChevronDown, ChevronUp, BarChart2 } from "lucide-react"

interface ClientsChartsProps {
  clients: Array<{
    id: string
    totalSpent: number | null
    status: string
    createdAt: string | Date
    updatedAt: string | Date
  }>
}

const STATUS_COLORS: Record<string, string> = {
  ACTIVE:     "#1FA97A",
  VIP:        "#D9A441",
  INACTIVE:   "#9CA3AF",
  FOLLOW_UP:  "#EF4444",
}

const STATUS_LABELS: Record<string, string> = {
  ACTIVE:    "Activo",
  VIP:       "VIP",
  INACTIVE:  "Inactivo",
  FOLLOW_UP: "Seguimiento",
}

function BarTooltipContent({ active, payload, label }: any) {
  if (!active || !payload?.length) return null
  return (
    <div className="bg-white border border-slate-100 rounded-xl px-3 py-2 shadow-[0_4px_16px_rgba(0,0,0,0.08)] text-xs">
      <p className="text-slate-500 mb-1">{label}</p>
      <p className="font-semibold text-slate-900">
        {formatRev(payload[0].value)}
      </p>
    </div>
  )
}

function PieTooltipContent({ active, payload }: any) {
  if (!active || !payload?.length) return null
  return (
    <div className="bg-white border border-slate-100 rounded-xl px-3 py-2 shadow-[0_4px_16px_rgba(0,0,0,0.08)] text-xs">
      <p className="font-semibold text-slate-900">
        {payload[0].name}
      </p>
      <p className="text-slate-500">
        {payload[0].value} clientes
      </p>
    </div>
  )
}

function formatRev(v: number) {
  if (v >= 1_000_000) return `€${(v / 1_000_000).toFixed(1)}M`
  if (v >= 1_000) return `€${(v / 1_000).toFixed(0)}K`
  return `€${v}`
}

export function ClientsCharts({ clients }: ClientsChartsProps) {
  const [isOpen, setIsOpen] = useState(true)

  useEffect(() => {
    const saved = localStorage.getItem("clients-charts-open")
    if (saved !== null) setIsOpen(saved === "true")
  }, [])

  const toggleOpen = () => {
    const next = !isOpen
    setIsOpen(next)
    localStorage.setItem("clients-charts-open", String(next))
  }

  // Ingresos por mes — últimos 6 meses
  const monthlyData = (() => {
    const now = new Date()
    const months = Array.from({ length: 6 }, (_, i) => {
      const d = new Date(now)
      d.setMonth(d.getMonth() - (5 - i))
      return {
        month: d.toLocaleDateString("es-ES", { month: "short" }),
        year: d.getFullYear(),
        monthNum: d.getMonth(),
        total: 0,
      }
    })

    clients.forEach(client => {
      if (!client.totalSpent) return
      const d = new Date(client.updatedAt)
      const idx = months.findIndex(
        m => m.monthNum === d.getMonth() && m.year === d.getFullYear()
      )
      if (idx !== -1) {
        months[idx].total += client.totalSpent
      }
    })

    return months.map(m => ({ date: m.month, total: m.total }))
  })()

  // Distribución por estado
  const statusMap = new Map<string, number>()
  clients.forEach(c => {
    statusMap.set(c.status, (statusMap.get(c.status) || 0) + 1)
  })

  const statusData = Array.from(statusMap.entries())
    .map(([status, value]) => ({
      name: STATUS_LABELS[status] || status,
      value,
      color: STATUS_COLORS[status] || "#9CA3AF",
    }))
    .filter(s => s.value > 0)
    .sort((a, b) => b.value - a.value)

  const totalClients = clients.length
  const totalRevenue = clients.reduce((a, c) => a + (c.totalSpent || 0), 0)

  const avgRevenue = monthlyData.length > 0
    ? Math.round(monthlyData.reduce((a, b) => a + b.total, 0) / monthlyData.length)
    : 0

  return (
    <div className="border border-slate-200 rounded-xl overflow-hidden bg-white mb-4">

      <button
        onClick={toggleOpen}
        className="w-full flex items-center justify-between px-5 py-3.5 hover:bg-slate-50 transition-colors"
      >
        <div className="flex items-center gap-2.5">
          <BarChart2 className="h-4 w-4 text-[#1FA97A]" />
          <span className="text-[13px] font-semibold text-slate-700">
            Resumen visual
          </span>
          <span className="text-[11px] text-slate-400">
            Ingresos y distribución
          </span>
        </div>
        {isOpen
          ? <ChevronUp className="h-4 w-4 text-slate-400" />
          : <ChevronDown className="h-4 w-4 text-slate-400" />
        }
      </button>

      {isOpen && (
        <div className="border-t border-slate-100 px-4 sm:px-5 py-4 sm:py-5">
          <div className="grid grid-cols-1 sm:grid-cols-[180px_1fr] gap-6" style={{ alignItems: "center" }}>

            {/* Donut izquierda */}
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "12px" }}>
              <div style={{ position: "relative" }}>
                <ResponsiveContainer width={160} height={160}>
                  <PieChart>
                    <Pie
                      data={statusData.length > 0
                        ? statusData
                        : [{ name: "Sin datos", value: 1, color: "#E5E7EB" }]
                      }
                      cx="50%"
                      cy="50%"
                      innerRadius={48}
                      outerRadius={68}
                      dataKey="value"
                      strokeWidth={0}
                      paddingAngle={2}
                    >
                      {(statusData.length > 0
                        ? statusData
                        : [{ color: "#E5E7EB" }]
                      ).map((entry, i) => (
                        <Cell key={i} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip content={<PieTooltipContent />} />
                  </PieChart>
                </ResponsiveContainer>
                <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", pointerEvents: "none" }}>
                  <span style={{ fontSize: 20, fontWeight: 700, color: "#0F172A", lineHeight: 1 }}>
                    {totalClients}
                  </span>
                  <span style={{ fontSize: 9, color: "#9CA3AF", textTransform: "uppercase", letterSpacing: "0.1em", marginTop: 3 }}>
                    total
                  </span>
                </div>
              </div>

              {/* Leyenda */}
              <div style={{ width: "100%", borderTop: "1px solid #F1F5F9", paddingTop: 10 }}>
                {statusData.map(s => (
                  <div key={s.name} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 6 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                      <div style={{ width: 7, height: 7, borderRadius: "50%", background: s.color, flexShrink: 0 }} />
                      <span style={{ fontSize: 11, color: "#6B7280" }}>{s.name}</span>
                    </div>
                    <span style={{ fontSize: 11, fontWeight: 600, color: "#0F172A" }}>{s.value}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Barras derecha */}
            <div>
              <div className="flex items-baseline gap-2 mb-3">
                <span className="text-[11px] uppercase tracking-[0.08em] text-slate-400 font-medium">
                  Ingresos por mes
                </span>
                <span className="text-[13px] font-semibold text-slate-900 ml-auto">
                  {formatRev(totalRevenue)} total
                </span>
              </div>
              <ResponsiveContainer width="100%" height={180}>
                <BarChart
                  data={monthlyData}
                  margin={{ top: 16, right: 0, left: -10, bottom: 0 }}
                  barSize={28}
                >
                  <XAxis
                    dataKey="date"
                    tick={{ fontSize: 11, fill: "#9CA3AF" }}
                    tickLine={false}
                    axisLine={false}
                  />
                  <YAxis
                    tick={{ fontSize: 10, fill: "#9CA3AF" }}
                    tickLine={false}
                    axisLine={false}
                    tickFormatter={(v: number) => v >= 1000 ? `€${v / 1000}K` : `€${v}`}
                    allowDecimals={false}
                  />
                  <Tooltip
                    content={<BarTooltipContent />}
                    cursor={{ fill: "rgba(31,169,122,0.06)", radius: 4 }}
                  />
                  <ReferenceLine
                    y={avgRevenue}
                    stroke="#1FA97A"
                    strokeDasharray="3 3"
                    strokeOpacity={0.4}
                    strokeWidth={1}
                  />
                  <Bar dataKey="total" radius={[6, 6, 0, 0]}>
                    {monthlyData.map((entry, i) => (
                      <Cell
                        key={i}
                        fill={
                          i === monthlyData.length - 1
                            ? "#1FA97A"
                            : entry.total > 0
                              ? "#D1FAE5"
                              : "#F3F4F6"
                        }
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>

          </div>
        </div>
      )}
    </div>
  )
}
