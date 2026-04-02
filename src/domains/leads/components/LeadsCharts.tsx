"use client"

import { useState, useEffect } from "react"
import {
  BarChart, Bar, XAxis, YAxis, Tooltip,
  ResponsiveContainer, Cell,
  PieChart, Pie, ReferenceLine, LabelList
} from "recharts"
import { ChevronDown, ChevronUp, BarChart2 } from "lucide-react"

// ── Tipos ──────────────────────────────
interface DailyLead {
  date: string   // "DD MMM"
  total: number
}

interface StatusCount {
  name: string
  value: number
  color: string
}

interface ChartInitialData {
  daily: DailyLead[]
  byStatus: StatusCount[]
}

interface LeadsChartsProps {
  userId?: string
  initialData?: ChartInitialData
}

// ── Tooltip personalizado barra ─────────
function BarTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null
  return (
    <div className="bg-white border border-slate-100 rounded-xl px-3 py-2 shadow-[0_4px_16px_rgba(0,0,0,0.08)] text-xs">
      <p className="text-slate-500 mb-1">{label}</p>
      <p className="font-semibold text-slate-900">
        {payload[0].value} leads
      </p>
    </div>
  )
}

// ── Tooltip personalizado donut ─────────
function PieTooltip({ active, payload }: any) {
  if (!active || !payload?.length) return null
  return (
    <div className="bg-white border border-slate-100 rounded-xl px-3 py-2 shadow-[0_4px_16px_rgba(0,0,0,0.08)] text-xs">
      <p className="font-semibold text-slate-900">
        {payload[0].name}
      </p>
      <p className="text-slate-500">
        {payload[0].value} leads
      </p>
    </div>
  )
}

export function LeadsCharts({ initialData }: LeadsChartsProps) {
  const [isOpen, setIsOpen] = useState(true)
  const [dailyData, setDailyData] = useState<DailyLead[]>(initialData?.daily ?? [])
  const [statusData, setStatusData] = useState<StatusCount[]>(initialData?.byStatus ?? [])
  const [isLoading, setIsLoading] = useState(false)

  // Persistir estado colapsado en localStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem("leads-charts-open")
      if (saved !== null) {
        setIsOpen(JSON.parse(saved))
      }
    } catch {
      localStorage.removeItem("leads-charts-open")
      setIsOpen(true)
    }
  }, [])

  const toggleOpen = () => {
    const next = !isOpen
    setIsOpen(next)
    localStorage.setItem("leads-charts-open", String(next))
  }

  useEffect(() => {
    if (!isOpen) {
      setIsLoading(false)
      return
    }
    fetchChartData()
  }, [isOpen])

  const fetchChartData = async () => {
    setIsLoading(true)
    try {
      const res = await fetch("/api/leads/charts")
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      const data = await res.json()
      setDailyData(data.daily || [])
      setStatusData(data.byStatus || [])
    } catch (err) {
      console.error('[LeadsCharts] fetch error:', err)
    } finally {
      setIsLoading(false)
    }
  }

  const totalLeads = statusData.reduce(
    (acc, s) => acc + s.value, 0
  )

  const avg = dailyData.length > 0
    ? Math.round(dailyData.reduce((a, b) => a + b.total, 0) / dailyData.length)
    : 0

  const periodTotal = dailyData.reduce((a, b) => a + b.total, 0)

  return (
    <div className="border border-slate-200 rounded-xl overflow-hidden bg-white mb-4">

      {/* ── Header colapsable ── */}
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
            Últimos 30 días
          </span>
        </div>
        {isOpen
          ? <ChevronUp className="h-4 w-4 text-slate-400" />
          : <ChevronDown className="h-4 w-4 text-slate-400" />
        }
      </button>

      {/* ── Contenido ── */}
      {isOpen && (
        <div className="border-t border-slate-100 px-5 py-5">
          {isLoading ? (
            <div className="flex items-center justify-center h-[160px]">
              <div className="flex gap-1">
                {[0,1,2].map(i => (
                  <div key={i}
                    className="w-1.5 h-1.5 rounded-full bg-[#1FA97A] animate-bounce"
                    style={{ animationDelay: `${i * 0.15}s` }}
                  />
                ))}
              </div>
            </div>
          ) : (
            <div style={{ display: "grid", gridTemplateColumns: "180px 1fr", gap: "24px", alignItems: "center" }}>

              {/* ── Donut + leyenda (IZQUIERDA) ── */}
              <div>
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
                        <Tooltip content={<PieTooltip />} />
                      </PieChart>
                    </ResponsiveContainer>
                    {/* Total en el centro */}
                    <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", pointerEvents: "none" }}>
                      <span style={{ fontSize: 20, fontWeight: 700, color: "#0F172A", lineHeight: 1 }}>
                        {totalLeads}
                      </span>
                      <span style={{ fontSize: 9, color: "#9CA3AF", marginTop: 2, textTransform: "uppercase", letterSpacing: "0.05em" }}>
                        total
                      </span>
                    </div>
                  </div>

                  {/* Leyenda */}
                  <div style={{ width: "100%", borderTop: "1px solid #F1F5F9", paddingTop: 12, marginTop: 4 }}>
                    {statusData.map(s => (
                      <div key={s.name} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "3px 0" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                          <div style={{ width: 7, height: 7, borderRadius: "50%", background: s.color, flexShrink: 0 }} />
                          <span style={{ fontSize: 11, color: "#475569" }}>
                            {s.name}
                          </span>
                        </div>
                        <span style={{ fontSize: 11, fontWeight: 600, color: "#0F172A", fontVariantNumeric: "tabular-nums" }}>
                          {s.value}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* ── Gráfico barras (DERECHA) ── */}
              <div>
                <div className="flex items-baseline gap-2 mb-3">
                  <span className="text-[11px] uppercase tracking-[0.08em] text-slate-400 font-medium">
                    Leads captados · 30 días
                  </span>
                  <span className="text-[13px] font-semibold text-slate-900 ml-auto">
                    {periodTotal} total
                  </span>
                </div>
                <ResponsiveContainer width="100%" height={180}>
                  <BarChart
                    data={dailyData}
                    margin={{ top: 16, right: 0, left: -20, bottom: 0 }}
                    barSize={8}
                  >
                    <XAxis
                      dataKey="date"
                      tick={{ fontSize: 10, fill: "#9CA3AF" }}
                      tickLine={false}
                      axisLine={false}
                      interval={1}
                    />
                    <YAxis
                      tick={{ fontSize: 10, fill: "#9CA3AF" }}
                      tickLine={false}
                      axisLine={false}
                      allowDecimals={false}
                    />
                    <Tooltip
                      content={<BarTooltip />}
                      cursor={{ fill: "rgba(31,169,122,0.06)", radius: 4 }}
                    />
                    <ReferenceLine
                      y={avg}
                      stroke="#1FA97A"
                      strokeDasharray="3 3"
                      strokeOpacity={0.4}
                      strokeWidth={1}
                    />
                    <Bar dataKey="total" radius={[3, 3, 0, 0]}>
                      {dailyData.map((entry, i) => (
                        <Cell
                          key={i}
                          fill={
                            i === dailyData.length - 1
                              ? "#1FA97A"
                              : entry.total > 0
                                ? "#D1FAE5"
                                : "#F3F4F6"
                          }
                        />
                      ))}
                      <LabelList
                        dataKey="total"
                        position="top"
                        content={(props: any) => {
                          const { x, y, width, value, index } = props
                          if (index !== dailyData.length - 1) return null
                          if (!value) return null
                          return (
                            <text
                              x={x + width / 2}
                              y={y - 6}
                              textAnchor="middle"
                              fill="#1FA97A"
                              fontSize={10}
                              fontWeight={600}
                            >
                              Hoy
                            </text>
                          )
                        }}
                      />
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>

            </div>
          )}
        </div>
      )}
    </div>
  )
}
