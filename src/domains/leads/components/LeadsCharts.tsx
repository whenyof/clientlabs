"use client"

import { useState, useEffect } from "react"
import {
  BarChart, Bar, XAxis, YAxis, Tooltip,
  ResponsiveContainer, Cell,
  PieChart, Pie
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

interface LeadsChartsProps {
  userId?: string
}

// ── Colores por estado ──────────────────
const STATUS_COLORS: Record<string, string> = {
  NEW:       "#1FA97A",
  CONTACTED: "#3B82F6",
  QUALIFIED: "#D9A441",
  CONVERTED: "#8B5CF6",
  LOST:      "#EF4444",
}

const STATUS_LABELS: Record<string, string> = {
  NEW:       "Nuevo",
  CONTACTED: "Contactado",
  QUALIFIED: "Cualificado",
  CONVERTED: "Convertido",
  LOST:      "Perdido",
}

// ── Tooltip personalizado barra ─────────
function BarTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null
  return (
    <div className="bg-white border border-slate-200 rounded-lg px-3 py-2 shadow-lg text-xs">
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
    <div className="bg-white border border-slate-200 rounded-lg px-3 py-2 shadow-lg text-xs">
      <p className="font-semibold text-slate-900">
        {payload[0].name}
      </p>
      <p className="text-slate-500">
        {payload[0].value} leads
      </p>
    </div>
  )
}

export function LeadsCharts({}: LeadsChartsProps) {
  const [isOpen, setIsOpen] = useState(true)
  const [dailyData, setDailyData] = useState<DailyLead[]>([])
  const [statusData, setStatusData] = useState<StatusCount[]>([])
  const [isLoading, setIsLoading] = useState(true)

  // Persistir estado colapsado en localStorage
  useEffect(() => {
    const saved = localStorage.getItem("leads-charts-open")
    if (saved !== null) setIsOpen(saved === "true")
  }, [])

  const toggleOpen = () => {
    const next = !isOpen
    setIsOpen(next)
    localStorage.setItem("leads-charts-open", String(next))
  }

  useEffect(() => {
    if (!isOpen) return
    fetchChartData()
  }, [isOpen])

  const fetchChartData = async () => {
    setIsLoading(true)
    try {
      const res = await fetch("/api/leads/charts")
      if (!res.ok) throw new Error()
      const data = await res.json()
      setDailyData(data.daily || [])
      setStatusData(data.byStatus || [])
    } catch {
      // silently fail — charts are non-critical
    } finally {
      setIsLoading(false)
    }
  }

  const totalLeads = statusData.reduce(
    (acc, s) => acc + s.value, 0
  )

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
        <div className="border-t border-slate-100 px-5 py-4">
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
            <div className="grid grid-cols-[1fr_220px] gap-6">

              {/* ── Gráfico barras ── */}
              <div>
                <p className="text-[11px] uppercase tracking-[0.08em] text-slate-400 font-medium mt-0 mb-3">
                  Leads captados por día
                </p>
                <ResponsiveContainer width="100%" height={150}>
                  <BarChart
                    data={dailyData}
                    margin={{ top: 0, right: 0, left: -20, bottom: 0 }}
                    barSize={6}
                  >
                    <XAxis
                      dataKey="date"
                      tick={{ fontSize: 10, fill: "#9CA3AF" }}
                      tickLine={false}
                      axisLine={false}
                      interval="preserveStartEnd"
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
                    <Bar dataKey="total" radius={[3, 3, 0, 0]}>
                      {dailyData.map((_, i) => (
                        <Cell
                          key={i}
                          fill={i === dailyData.length - 1 ? "#1FA97A" : "#E5E7EB"}
                        />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>

              {/* ── Donut + leyenda ── */}
              <div>
                <div className="flex flex-col items-center gap-3">
                  <div className="relative flex-shrink-0">
                    <ResponsiveContainer width={140} height={140}>
                      <PieChart>
                        <Pie
                          data={statusData.length > 0
                            ? statusData
                            : [{ name: "Sin datos", value: 1, color: "#E5E7EB" }]
                          }
                          cx="50%"
                          cy="50%"
                          innerRadius={44}
                          outerRadius={62}
                          dataKey="value"
                          strokeWidth={0}
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
                    <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                      <span className="text-[18px] font-bold text-slate-900 leading-none">
                        {totalLeads}
                      </span>
                      <span className="text-[9px] text-slate-400 mt-0.5 uppercase tracking-wider">
                        total
                      </span>
                    </div>
                  </div>

                  {/* Leyenda */}
                  <div className="w-full space-y-1.5">
                    {statusData.map(s => (
                      <div key={s.name} className="flex justify-between">
                        <div className="flex items-center gap-1.5">
                          <div
                            className="w-2 h-2 rounded-full flex-shrink-0"
                            style={{ background: s.color }}
                          />
                          <span className="text-[11px] text-slate-600">
                            {s.name}
                          </span>
                        </div>
                        <span className="text-[11px] font-medium text-slate-900 tabular-nums">
                          {s.value}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

            </div>
          )}
        </div>
      )}
    </div>
  )
}
