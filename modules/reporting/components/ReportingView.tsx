"use client"

import { useState, useEffect, useMemo } from "react"
import { Plus, Download, Send, MoreVertical } from "lucide-react"
import { getReportingData } from "../actions"
import {
  getReportingDateRange,
  getReportingPreviousDateRange,
  filterSalesByDateRange,
  aggregateChartData,
  computeTopClients,
  computeRevenueByType,
  computeReportingKPIs,
  monthlyRevenueFromSales,
  computeRevenueForecast,
} from "../utils"
import dynamic from "next/dynamic"
import { ReportingKPIs } from "./ReportingKPIs"
import { ReportingPeriodPicker } from "./ReportingPeriodPicker"
import { ReportingInsight } from "./ReportingInsight"
import type { ReportingSale, ReportingPeriodPreset } from "../types"

const ReportingChart = dynamic(() => import("./ReportingChart").then(m => ({ default: m.ReportingChart })), {
  ssr: false,
  loading: () => <div style={{ height: 280, background: "#fafafa", borderRadius: 10, animation: "pulse 1.5s ease-in-out infinite" }} />,
})
const ReportingBreakdown = dynamic(() => import("./ReportingBreakdown").then(m => ({ default: m.ReportingBreakdown })), {
  ssr: false,
  loading: () => <div style={{ height: 200, background: "#fafafa", borderRadius: 10 }} />,
})
const ReportingForecast = dynamic(() => import("./ReportingForecast").then(m => ({ default: m.ReportingForecast })), {
  ssr: false,
  loading: () => <div style={{ height: 200, background: "#fafafa", borderRadius: 10 }} />,
})
const ReportingYoY = dynamic(() => import("./ReportingYoY").then(m => ({ default: m.ReportingYoY })), {
  ssr: false,
  loading: () => <div style={{ height: 200, background: "#fafafa", borderRadius: 10 }} />,
})

// ─── Design tokens ─────────────────────────────────────────────────────────
const C = {
  bg: "#ffffff", bg2: "#fafafa", bg3: "#f5f5f5",
  ink: "#0a0a0a", ink2: "#404040", ink3: "#737373", ink4: "#a3a3a3", ink5: "#d4d4d4",
  line: "#e8e8e8", line2: "#eeeeee", line3: "#f3f3f3",
  accent: "#16986e", accentSoft: "#ecf6f1", accentInk: "#0d7a56",
  warn: "#c2410c",
}

// ─── Preset report tiles ───────────────────────────────────────────────────
const PRESETS = [
  { icon: "💰", nm: "Ingresos · MoM",         desc: "Real vs plan · 12 meses",  live: true,  active: true  },
  { icon: "📊", nm: "Embudo de ventas",       desc: "Conversión por etapa",      live: true                },
  { icon: "👥", nm: "Retención · cohortes",   desc: "% activos cada mes",        live: false               },
  { icon: "✅", nm: "Productividad equipo",   desc: "Tareas/persona · 30d",      live: true                },
  { icon: "📧", nm: "Eficacia campañas",      desc: "Apertura · clic · conv.",   live: false               },
  { icon: "🕐", nm: "Aging cobros",           desc: "Pendientes y morosidad",    live: true                },
  { icon: "⭐", nm: "Custom: KPIs CEO",       desc: "Snapshot semanal",          live: false, custom: true },
]

// ─── Saved reports (static) ────────────────────────────────────────────────
const SAVED = [
  { nm: "Cierre mensual · CFO",        sub: "Plantilla custom · 6 widgets",    type: "Custom",    by: "MG", when: "Hace 2h",   schedule: "Mensual"      },
  { nm: "Pipeline semanal",            sub: "Estado del embudo + top deals",   type: "Plantilla", by: "PV", when: "Hace 1d",   schedule: "Semanal"      },
  { nm: "Cartera saludable",           sub: "Champions + retención + LTV",     type: "Plantilla", by: "MG", when: "Hace 3d",   schedule: "Bajo demanda" },
  { nm: "Velocidad del equipo",        sub: "Tareas cerradas + bloqueos",      type: "Custom",    by: "JR", when: "Hace 5d",   schedule: "Semanal"      },
  { nm: "Snapshot semanal CEO",        sub: "Resumen ejecutivo de 1 página",   type: "Custom",    by: "WH", when: "Hace 1sem", schedule: "Lunes 09:00"  },
  { nm: "Eficacia automatizaciones",   sub: "Runs · éxito · horas ahorradas",  type: "Plantilla", by: "PV", when: "Hace 2sem", schedule: "Mensual"      },
]

// ─── Cohort retention heatmap ──────────────────────────────────────────────
const COHORTS = [
  { co: "Nov 25", ret: [100, 96, 92, 88, 84, 82, 80, 78] },
  { co: "Dic 25", ret: [100, 94, 90, 86, 84, 82, 80, null] },
  { co: "Ene 26", ret: [100, 95, 92, 89, 86, 84, null, null] },
  { co: "Feb 26", ret: [100, 96, 92, 89, 86, null, null, null] },
  { co: "Mar 26", ret: [100, 95, 91, 88, null, null, null, null] },
  { co: "Abr 26", ret: [100, 94, 90, null, null, null, null, null] },
]

function cohortLevel(p: number | null): string {
  if (p === null || p === undefined) return "empty"
  if (p >= 95) return "l5"
  if (p >= 85) return "l4"
  if (p >= 75) return "l3"
  if (p >= 65) return "l2"
  if (p > 0) return "l1"
  return "l0"
}

const COHORT_COLORS: Record<string, string> = {
  empty: "transparent", l0: C.bg3, l1: "#e8f5ef", l2: "#c8e6d8", l3: "#7ec6a3",
  l4: C.accent, l5: C.accentInk,
}

function CohortTable() {
  return (
    <div style={{ background: C.bg, border: `1px solid ${C.line}`, borderRadius: 10, overflow: "hidden", marginBottom: 16 }}>
      <div style={{ padding: "14px 18px", display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: `1px solid ${C.line2}` }}>
        <div>
          <h3 style={{ fontWeight: 600, letterSpacing: "-0.012em", fontSize: 13.5, margin: 0, color: C.ink }}>Retención por cohorte mensual</h3>
          <div style={{ fontSize: 11.5, color: C.ink3, fontFamily: "ui-monospace,monospace", marginTop: 2 }}>% activos cada mes desde su alta · últimos 6 meses</div>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <div style={{ display: "inline-flex", background: C.bg2, border: `1px solid ${C.line}`, borderRadius: 7, padding: 2 }}>
            {["% retención", "Ingresos", "Δ neta"].map((opt, i) => (
              <button key={opt} style={{ padding: "4px 10px", borderRadius: 5, fontFamily: "ui-monospace,monospace", fontSize: 11, color: i === 0 ? C.ink : C.ink3, fontWeight: 500, background: i === 0 ? "white" : "transparent", boxShadow: i === 0 ? `0 0 0 1px ${C.line} inset` : "none", border: "none", cursor: "pointer" }}>{opt}</button>
            ))}
          </div>
          <button style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "5px 9px", borderRadius: 6, background: C.bg, border: `1px solid ${C.line}`, color: C.ink2, fontSize: 11.5, fontWeight: 550, cursor: "pointer" }}>
            <Download size={11} strokeWidth={2} />CSV
          </button>
        </div>
      </div>
      <div style={{ padding: 18 }}>
        {/* Header row */}
        <div style={{ display: "grid", gridTemplateColumns: "72px repeat(8, 1fr)", gap: 3, marginBottom: 6 }}>
          <div />
          {Array.from({ length: 8 }, (_, i) => (
            <div key={i} style={{ fontFamily: "ui-monospace,monospace", fontSize: 9.5, color: C.ink4, textAlign: "center", letterSpacing: "0.04em" }}>
              M{i}
            </div>
          ))}
        </div>
        {/* Cohort rows */}
        {COHORTS.map((co) => (
          <div key={co.co} style={{ display: "grid", gridTemplateColumns: "72px repeat(8, 1fr)", gap: 3, marginBottom: 3 }}>
            <div style={{ fontFamily: "ui-monospace,monospace", fontSize: 10.5, color: C.ink3, display: "flex", alignItems: "center" }}>{co.co}</div>
            {co.ret.map((p, i) => {
              const lvl = cohortLevel(p as number | null)
              return (
                <div key={i} style={{
                  height: 28, borderRadius: 4,
                  background: lvl === "empty" ? C.bg2 : COHORT_COLORS[lvl] ?? C.bg3,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontFamily: "ui-monospace,monospace",
                  fontSize: 10, fontWeight: 500,
                  color: lvl === "l4" || lvl === "l5" ? "white" : C.ink2,
                }}>
                  {p !== null ? p : ""}
                </div>
              )
            })}
          </div>
        ))}
        {/* Legend */}
        <div style={{ display: "flex", justifyContent: "flex-end", alignItems: "center", gap: 4, marginTop: 14, fontFamily: "ui-monospace,monospace", fontSize: 10.5, color: C.ink3 }}>
          <span>0%</span>
          {[C.bg3, "#e8f5ef", "#c8e6d8", "#7ec6a3", C.accent, C.accentInk].map((c, i) => (
            <span key={i} style={{ width: 14, height: 14, borderRadius: 3, background: c, display: "inline-block" }} />
          ))}
          <span>100%</span>
        </div>
      </div>
    </div>
  )
}

// ─── Saved reports table ───────────────────────────────────────────────────
function SavedReports() {
  const [activeTab, setActiveTab] = useState("Todos")
  const tabs = ["Todos", "Míos", "Programados", "Compartidos"]
  return (
    <div style={{ background: C.bg, border: `1px solid ${C.line}`, borderRadius: 10, overflow: "hidden" }}>
      <div style={{ padding: "14px 18px", display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: `1px solid ${C.line2}` }}>
        <div>
          <h3 style={{ fontWeight: 600, letterSpacing: "-0.012em", fontSize: 13.5, margin: 0, color: C.ink }}>Informes guardados</h3>
          <div style={{ fontSize: 11.5, color: C.ink3, fontFamily: "ui-monospace,monospace", marginTop: 2 }}>{SAVED.length} totales · 3 con envío programado</div>
        </div>
        <div style={{ display: "inline-flex", background: C.bg2, border: `1px solid ${C.line}`, borderRadius: 7, padding: 2 }}>
          {tabs.map(t => (
            <button key={t} onClick={() => setActiveTab(t)} style={{ padding: "4px 10px", borderRadius: 5, fontFamily: "ui-monospace,monospace", fontSize: 11, color: activeTab === t ? C.ink : C.ink3, fontWeight: 500, background: activeTab === t ? "white" : "transparent", boxShadow: activeTab === t ? `0 0 0 1px ${C.line} inset` : "none", border: "none", cursor: "pointer" }}>{t}</button>
          ))}
        </div>
      </div>
      {SAVED.map((s, i) => (
        <div key={s.nm} style={{ display: "grid", gridTemplateColumns: "1fr auto auto auto auto 30px", gap: 16, padding: "14px 18px", borderBottom: i < SAVED.length - 1 ? `1px solid ${C.line3}` : "none", alignItems: "center", cursor: "pointer", transition: "background .1s ease" }}
          onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = C.bg2 }}
          onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = "transparent" }}
        >
          <div>
            <div style={{ fontWeight: 550, fontSize: 13, color: C.ink, letterSpacing: "-0.005em" }}>{s.nm}</div>
            <div style={{ fontFamily: "ui-monospace,monospace", fontSize: 10.5, color: C.ink3, marginTop: 2 }}>{s.sub}</div>
          </div>
          <span style={{
            display: "inline-flex", alignItems: "center", gap: 5, padding: "2px 8px", borderRadius: 99,
            fontSize: 11, fontWeight: 500,
            background: s.type === "Custom" ? C.ink : C.bg3,
            color: s.type === "Custom" ? "white" : C.ink2,
          }}>
            <span style={{ width: 5, height: 5, borderRadius: 99, background: s.type === "Custom" ? "white" : C.ink3, display: "inline-block" }} />
            {s.type}
          </span>
          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <span style={{ width: 18, height: 18, borderRadius: 4, background: C.bg3, display: "grid", placeItems: "center", fontSize: 9, fontWeight: 600, color: C.ink }}>{s.by}</span>
            <span style={{ fontSize: 12, color: C.ink3 }}>{s.schedule}</span>
          </div>
          <span style={{ fontFamily: "ui-monospace,monospace", fontSize: 10.5, color: C.ink4 }}>{s.when}</span>
          <button style={{ width: 26, height: 26, borderRadius: 5, display: "grid", placeItems: "center", color: C.ink3, background: "none", border: "none", cursor: "pointer" }}>
            <MoreVertical size={14} />
          </button>
        </div>
      ))}
    </div>
  )
}

// ─── Main ReportingView ─────────────────────────────────────────────────────
export function ReportingView() {
  const [sales, setSales] = useState<ReportingSale[]>([])
  const [loading, setLoading] = useState(true)
  const [period, setPeriod] = useState<ReportingPeriodPreset>("30d")

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    getReportingData()
      .then((data) => { if (!cancelled) setSales(data) })
      .finally(() => { if (!cancelled) setLoading(false) })
    return () => { cancelled = true }
  }, [])

  const { from, to } = useMemo(() => getReportingDateRange(period), [period])
  const { from: prevFrom, to: prevTo } = useMemo(() => getReportingPreviousDateRange(period), [period])
  const salesInRange = useMemo(() => filterSalesByDateRange(sales, from, to), [sales, from, to])
  const salesPrevious = useMemo(() => filterSalesByDateRange(sales, prevFrom, prevTo), [sales, prevFrom, prevTo])
  const kpis = useMemo(() => computeReportingKPIs(salesInRange, salesPrevious), [salesInRange, salesPrevious])
  const chartData = useMemo(() => aggregateChartData(salesInRange, from, to, period), [salesInRange, from, to, period])
  const topClients = useMemo(() => computeTopClients(salesInRange, 5), [salesInRange])
  const revenueByType = useMemo(() => computeRevenueByType(salesInRange), [salesInRange])
  const monthlyHistory = useMemo(() => monthlyRevenueFromSales(sales, 12), [sales])
  const forecast = useMemo(() => computeRevenueForecast(monthlyHistory), [monthlyHistory])

  return (
    <div style={{ fontFamily: "var(--font-geist-sans, ui-sans-serif, system-ui, sans-serif)" }}>

      {/* ── PAGE HEADER ──────────────────────────────────── */}
      <div style={{
        display: "flex", justifyContent: "space-between", alignItems: "flex-end",
        marginBottom: 24, gap: 24, paddingBottom: 18, borderBottom: `1px solid ${C.line2}`,
      }}>
        <div>
          <h1 style={{ fontWeight: 600, letterSpacing: "-0.022em", fontSize: 26, lineHeight: 1.1, margin: 0, color: C.ink }}>Informes</h1>
          <div style={{ marginTop: 6, display: "flex", alignItems: "center", gap: 14, fontSize: 12.5, color: C.ink3 }}>
            <span>{SAVED.length} informes guardados</span>
            <span style={{ color: C.ink5 }}>·</span>
            <span style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
              <span style={{ width: 6, height: 6, borderRadius: 99, background: C.accent, boxShadow: `0 0 0 3px ${C.accentSoft}`, display: "inline-block" }} />
              4 actualizándose en vivo
            </span>
            <span style={{ color: C.ink5 }}>·</span>
            <span>Última sincronización hace 2 min</span>
          </div>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
          <div style={{ display: "inline-flex", background: C.bg2, border: `1px solid ${C.line}`, borderRadius: 7, padding: 2 }}>
            {["7d", "30d", "MTD", "QTD", "YTD"].map((p, i) => (
              <button key={p} onClick={() => setPeriod(p.toLowerCase() as ReportingPeriodPreset)} style={{
                padding: "4px 10px", borderRadius: 5, fontFamily: "ui-monospace,monospace", fontSize: 11.5,
                color: period === p.toLowerCase() || (i === 1 && period === "30d") ? C.ink : C.ink3, fontWeight: 500,
                background: period === p.toLowerCase() || (i === 1 && period === "30d") ? "white" : "transparent",
                boxShadow: period === p.toLowerCase() || (i === 1 && period === "30d") ? `0 0 0 1px ${C.line} inset, 0 1px 2px rgba(0,0,0,.03)` : "none",
                border: "none", cursor: "pointer",
              }}>{p}</button>
            ))}
          </div>
          <button style={{ display: "inline-flex", alignItems: "center", gap: 7, padding: "7px 12px", borderRadius: 6, background: C.bg, border: `1px solid ${C.line}`, color: C.ink2, fontWeight: 550, fontSize: 12.5, cursor: "pointer" }}>
            <Download size={12} strokeWidth={2} />Exportar PDF
          </button>
          <button style={{ display: "inline-flex", alignItems: "center", gap: 7, padding: "7px 12px", borderRadius: 6, background: C.bg, border: `1px solid ${C.line}`, color: C.ink2, fontWeight: 550, fontSize: 12.5, cursor: "pointer" }}>
            <Send size={12} strokeWidth={2} />Programar envío
          </button>
          <button style={{ display: "inline-flex", alignItems: "center", gap: 7, padding: "7px 12px", borderRadius: 6, background: C.ink, color: "white", fontWeight: 550, fontSize: 12.5, border: "none", cursor: "pointer" }}>
            <Plus size={12} strokeWidth={2.5} />Nuevo informe
          </button>
        </div>
      </div>

      {/* ── PRESET REPORT TILES ──────────────────────────── */}
      <div style={{ display: "flex", gap: 10, overflowX: "auto", marginBottom: 20, paddingBottom: 4, scrollbarWidth: "none" }}>
        {PRESETS.map((p) => (
          <div key={p.nm} style={{
            flexShrink: 0, width: 180,
            background: p.active ? C.bg : C.bg2,
            border: `1px solid ${p.active ? C.ink : C.line}`,
            borderRadius: 10, padding: "12px 14px",
            cursor: "pointer",
          }}>
            <div style={{ display: "flex", alignItems: "flex-start", gap: 10, marginBottom: 8 }}>
              <span style={{ width: 30, height: 30, borderRadius: 6, background: C.bg3, display: "grid", placeItems: "center", fontSize: 14, flexShrink: 0 }}>{p.icon}</span>
              <div style={{ minWidth: 0, flex: 1 }}>
                <div style={{ fontSize: 12.5, fontWeight: 550, color: C.ink, letterSpacing: "-0.005em", lineHeight: 1.3 }}>{p.nm}</div>
                <div style={{ fontFamily: "ui-monospace,monospace", fontSize: 10, color: C.ink3, marginTop: 2 }}>{p.desc}</div>
              </div>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 6, fontFamily: "ui-monospace,monospace", fontSize: 10, color: C.ink3 }}>
              {p.live ? (
                <span style={{ display: "inline-flex", alignItems: "center", gap: 4 }}>
                  <span style={{ width: 5, height: 5, borderRadius: 99, background: C.accent, display: "inline-block" }} />
                  En vivo
                </span>
              ) : <span>Bajo demanda</span>}
              <span style={{ color: C.ink5 }}>·</span>
              <span>{p.custom ? "Custom" : "Plantilla"}</span>
            </div>
          </div>
        ))}
        {/* Add new tile */}
        <div style={{
          flexShrink: 0, width: 140,
          background: C.bg2, border: `1px dashed ${C.line}`,
          borderRadius: 10, padding: "12px 14px",
          display: "flex", alignItems: "center", justifyContent: "center",
          cursor: "pointer", color: C.ink3,
        }}>
          <div style={{ textAlign: "center" }}>
            <div style={{ fontSize: 22, lineHeight: 1 }}>+</div>
            <div style={{ fontFamily: "ui-monospace,monospace", fontSize: 10, letterSpacing: "0.05em", textTransform: "uppercase", marginTop: 4 }}>Crear informe</div>
          </div>
        </div>
      </div>

      {loading ? (
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          {[280, 200, 200].map((h, i) => (
            <div key={i} style={{ height: h, background: C.bg2, borderRadius: 10, border: `1px solid ${C.line}` }} />
          ))}
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          {/* Period picker */}
          <div style={{ display: "flex", justifyContent: "flex-start" }}>
            <ReportingPeriodPicker value={period} onChange={setPeriod} />
          </div>

          {/* KPIs */}
          <ReportingKPIs kpis={kpis} />

          {/* Main revenue chart */}
          <ReportingChart data={chartData} />

          {/* Breakdown + additional charts */}
          <ReportingBreakdown topClients={topClients} revenueByType={revenueByType} />

          {/* Cohort retention heatmap */}
          <CohortTable />

          {/* Forecast */}
          <ReportingForecast forecast={forecast} />

          {/* YoY */}
          <ReportingYoY sales={sales} />

          {/* AI Insight */}
          <ReportingInsight salesInRange={salesInRange} kpis={kpis} topClients={topClients} />

          {/* Saved reports */}
          <SavedReports />
        </div>
      )}
    </div>
  )
}
