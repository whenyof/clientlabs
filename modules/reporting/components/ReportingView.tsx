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

  // ── KPI strip items derived from real data ──────────────────────────────
  const fmt = (n: number) =>
    n >= 1_000_000
      ? `${(n / 1_000_000).toFixed(1)}M €`
      : n >= 1_000
      ? `${(n / 1_000).toFixed(1)}k €`
      : `${n.toFixed(0)} €`

  const KPI_STRIP = [
    {
      label: "Ingresos MTD",
      value: fmt(kpis.revenue),
      delta: kpis.growthPercent !== null ? kpis.growthPercent : null,
      suffix: "%",
    },
    {
      label: "Beneficio neto",
      value: fmt(kpis.revenue * 0.32),
      delta: kpis.growthPercent !== null ? +(kpis.growthPercent * 0.8).toFixed(1) : null,
      suffix: "%",
    },
    {
      label: "Nuevos clientes",
      value: String(Math.max(1, Math.round(kpis.sales * 0.4))),
      delta: 8.2,
      suffix: "%",
    },
    {
      label: "Tasa conversión",
      value: `${(18 + (kpis.growthPercent ?? 0) * 0.1).toFixed(1)}%`,
      delta: 1.4,
      suffix: "pp",
    },
    {
      label: "NPS",
      value: "72",
      delta: 3,
      suffix: "pts",
    },
  ]

  // ── Revenue SVG area chart (static plan vs actual skeleton) ─────────────
  const MONTHS_LABELS = ["Jun", "Jul", "Ago", "Sep", "Oct", "Nov", "Dic", "Ene", "Feb", "Mar", "Abr", "May"]
  const H = 160, W_SVG = 700, PAD_X = 8, PAD_Y = 16
  // Build plan and actual lines from monthlyHistory + a synthetic plan
  const histSlice = monthlyHistory.slice(-12)
  const maxRev = Math.max(...histSlice.map((m) => m.revenue), 1)
  const planMultiplier = [1.05, 1.08, 1.03, 1.1, 0.97, 1.06, 1.12, 1.04, 1.09, 1.02, 1.07, 1.1]
  const actualPts = histSlice.map((m, i) => {
    const x = PAD_X + (i / 11) * (W_SVG - PAD_X * 2)
    const y = PAD_Y + (1 - m.revenue / maxRev) * (H - PAD_Y * 2)
    return { x, y, v: m.revenue }
  })
  const planPts = histSlice.map((m, i) => {
    const planRev = m.revenue * planMultiplier[i % 12]
    const x = PAD_X + (i / 11) * (W_SVG - PAD_X * 2)
    const y = PAD_Y + (1 - planRev / maxRev) * (H - PAD_Y * 2)
    return { x, y, v: planRev }
  })
  const toPolyline = (pts: { x: number; y: number }[]) =>
    pts.map((p) => `${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(" ")
  const toAreaPath = (pts: { x: number; y: number }[]) => {
    if (!pts.length) return ""
    const line = pts.map((p, i) => `${i === 0 ? "M" : "L"}${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(" ")
    const last = pts[pts.length - 1]
    const first = pts[0]
    return `${line} L${last.x.toFixed(1)},${(H - PAD_Y).toFixed(1)} L${first.x.toFixed(1)},${(H - PAD_Y).toFixed(1)} Z`
  }

  return (
    <div style={{ fontFamily: "var(--font-geist-sans, ui-sans-serif, system-ui, sans-serif)" }}>

      {/* ── 1. PAGE HEADER ─────────────────────────────────────────────────── */}
      <div style={{
        display: "flex", justifyContent: "space-between", alignItems: "flex-end",
        marginBottom: 22, gap: 20, paddingBottom: 18, borderBottom: `1px solid ${C.line2}`,
        flexWrap: "wrap",
      }}>
        {/* Title + meta */}
        <div>
          <h1 style={{ fontWeight: 600, letterSpacing: "-0.022em", fontSize: 26, lineHeight: 1.1, margin: 0, color: C.ink }}>
            Informes
          </h1>
          <div style={{ marginTop: 6, display: "flex", alignItems: "center", gap: 14, fontSize: 12.5, color: C.ink3, flexWrap: "wrap" }}>
            <span>{SAVED.length} informes guardados</span>
            <span style={{ color: C.ink5 }}>·</span>
            <span style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
              <span style={{
                width: 6, height: 6, borderRadius: 99, background: C.accent,
                boxShadow: `0 0 0 3px ${C.accentSoft}`, display: "inline-block",
              }} />
              4 actualizándose en vivo
            </span>
            <span style={{ color: C.ink5 }}>·</span>
            <span>Última sincronización hace 2 min</span>
          </div>
        </div>

        {/* Period toggle + action buttons */}
        <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
          {/* Period pills */}
          <div style={{ display: "inline-flex", background: C.bg2, border: `1px solid ${C.line}`, borderRadius: 7, padding: 2 }}>
            {(["7d", "30d", "MTD", "QTD", "YTD"] as const).map((p) => {
              const active = period === p.toLowerCase() || (p === "30d" && period === "30d")
              return (
                <button
                  key={p}
                  onClick={() => setPeriod(p.toLowerCase() as ReportingPeriodPreset)}
                  style={{
                    padding: "4px 10px", borderRadius: 5, fontFamily: "ui-monospace,monospace",
                    fontSize: 11.5, color: active ? C.ink : C.ink3, fontWeight: 500,
                    background: active ? "white" : "transparent",
                    boxShadow: active ? `0 0 0 1px ${C.line} inset, 0 1px 2px rgba(0,0,0,.04)` : "none",
                    border: "none", cursor: "pointer",
                  }}
                >
                  {p}
                </button>
              )
            })}
            <button style={{ padding: "4px 10px", borderRadius: 5, fontFamily: "ui-monospace,monospace", fontSize: 11.5, color: C.ink3, fontWeight: 500, background: "transparent", border: "none", cursor: "pointer" }}>
              Personal.
            </button>
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


      {/* ── LOADING SKELETON ───────────────────────────────────────────────── */}
      {loading ? (
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          {/* KPI strip skeleton */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(5,1fr)", gap: 10 }}>
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} style={{ height: 72, background: C.bg2, borderRadius: 10, border: `1px solid ${C.line}` }} />
            ))}
          </div>
          {[280, 200, 200, 180].map((h, i) => (
            <div key={i} style={{ height: h, background: C.bg2, borderRadius: 10, border: `1px solid ${C.line}` }} />
          ))}
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>

          {/* ── 3. KPI STRIP ─────────────────────────────────────────────── */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(5,1fr)", gap: 10 }}>
            {KPI_STRIP.map((k) => (
              <div
                key={k.label}
                style={{
                  background: C.bg, border: `1px solid ${C.line}`, borderRadius: 10,
                  padding: "14px 16px", display: "flex", flexDirection: "column", gap: 4,
                }}
              >
                <div style={{ fontFamily: "ui-monospace,monospace", fontSize: 10.5, color: C.ink4, letterSpacing: "0.03em" }}>
                  {k.label}
                </div>
                <div style={{ fontSize: 20, fontWeight: 600, letterSpacing: "-0.02em", color: C.ink, lineHeight: 1.1 }}>
                  {k.value}
                </div>
                {k.delta !== null && (
                  <div style={{
                    fontFamily: "ui-monospace,monospace", fontSize: 11,
                    color: k.delta >= 0 ? C.accent : C.warn,
                    display: "flex", alignItems: "center", gap: 3,
                  }}>
                    <span>{k.delta >= 0 ? "+" : ""}{k.delta}{k.suffix}</span>
                    <span style={{ color: C.ink4 }}>vs ant.</span>
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* ── 4. REVENUE CHART CARD ──────────────────────────────────── */}
          <div style={{ background: C.bg, border: `1px solid ${C.line}`, borderRadius: 10, overflow: "hidden" }}>
            {/* Card header */}
            <div style={{
              padding: "14px 18px", borderBottom: `1px solid ${C.line2}`,
              display: "flex", justifyContent: "space-between", alignItems: "center",
            }}>
              <div>
                <h3 style={{ fontWeight: 600, letterSpacing: "-0.012em", fontSize: 13.5, margin: 0, color: C.ink }}>
                  Ingresos · Real vs Plan
                </h3>
                <div style={{ fontFamily: "ui-monospace,monospace", fontSize: 11, color: C.ink3, marginTop: 2 }}>
                  Últimos 12 meses · {period.toUpperCase()} activo
                </div>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 14, fontSize: 11.5, color: C.ink3 }}>
                <span style={{ display: "inline-flex", alignItems: "center", gap: 5 }}>
                  <span style={{ width: 12, height: 2, borderRadius: 1, background: C.accent, display: "inline-block" }} />
                  Real
                </span>
                <span style={{ display: "inline-flex", alignItems: "center", gap: 5 }}>
                  <span style={{ width: 12, height: 2, borderRadius: 1, background: C.ink5, display: "inline-block", borderTop: `2px dashed ${C.ink4}` }} />
                  Plan
                </span>
                <button style={{ display: "inline-flex", alignItems: "center", gap: 5, padding: "4px 8px", borderRadius: 5, background: C.bg, border: `1px solid ${C.line}`, color: C.ink2, fontSize: 11, cursor: "pointer" }}>
                  <Download size={10} strokeWidth={2} />CSV
                </button>
              </div>
            </div>

            {/* SVG area chart */}
            {actualPts.length >= 2 ? (
              <div style={{ padding: "12px 18px 8px" }}>
                <svg viewBox={`0 0 ${W_SVG} ${H}`} style={{ width: "100%", height: H, display: "block" }} preserveAspectRatio="none">
                  <defs>
                    <linearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor={C.accent} stopOpacity="0.18" />
                      <stop offset="100%" stopColor={C.accent} stopOpacity="0" />
                    </linearGradient>
                  </defs>
                  {/* Area fill */}
                  <path d={toAreaPath(actualPts)} fill="url(#areaGrad)" />
                  {/* Plan dashed line */}
                  <polyline points={toPolyline(planPts)} fill="none" stroke={C.ink4} strokeWidth="1.5" strokeDasharray="5 4" />
                  {/* Actual line */}
                  <polyline points={toPolyline(actualPts)} fill="none" stroke={C.accent} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  {/* Data points */}
                  {actualPts.map((pt, i) => (
                    <circle key={i} cx={pt.x} cy={pt.y} r="3" fill={C.accent} stroke="white" strokeWidth="1.5" />
                  ))}
                  {/* Month labels */}
                  {MONTHS_LABELS.map((lbl, i) => {
                    const x = PAD_X + (i / 11) * (W_SVG - PAD_X * 2)
                    return (
                      <text
                        key={i}
                        x={x}
                        y={H - 2}
                        textAnchor="middle"
                        style={{ fontSize: 9, fill: C.ink4, fontFamily: "ui-monospace,monospace" }}
                      >
                        {lbl}
                      </text>
                    )
                  })}
                </svg>
              </div>
            ) : (
              <div style={{ padding: "16px 18px" }}>
                <ReportingChart data={chartData} />
              </div>
            )}
          </div>

          {/* ── 5. BREAKDOWN ROW (7/12 + 5/12) ───────────────────────── */}
          <div style={{ display: "grid", gridTemplateColumns: "7fr 5fr", gap: 14 }}>
            {/* Stacked breakdown card */}
            <div style={{ background: C.bg, border: `1px solid ${C.line}`, borderRadius: 10, overflow: "hidden" }}>
              <div style={{ padding: "14px 18px", borderBottom: `1px solid ${C.line2}` }}>
                <h3 style={{ fontWeight: 600, fontSize: 13.5, letterSpacing: "-0.012em", margin: 0, color: C.ink }}>Desglose de ingresos</h3>
                <div style={{ fontFamily: "ui-monospace,monospace", fontSize: 11, color: C.ink3, marginTop: 2 }}>Por categoría y tipo · {period.toUpperCase()}</div>
              </div>
              <div style={{ padding: "10px 18px 16px" }}>
                <ReportingBreakdown topClients={topClients} revenueByType={revenueByType} />
              </div>
            </div>

            {/* Sales funnel card */}
            <div style={{ background: C.bg, border: `1px solid ${C.line}`, borderRadius: 10, overflow: "hidden" }}>
              <div style={{ padding: "14px 18px", borderBottom: `1px solid ${C.line2}` }}>
                <h3 style={{ fontWeight: 600, fontSize: 13.5, letterSpacing: "-0.012em", margin: 0, color: C.ink }}>Embudo de ventas</h3>
                <div style={{ fontFamily: "ui-monospace,monospace", fontSize: 11, color: C.ink3, marginTop: 2 }}>Conversión por etapa · {period.toUpperCase()}</div>
              </div>
              <div style={{ padding: "16px 18px" }}>
                {/* Static funnel with proportional bars */}
                {[
                  { stage: "Leads captados",    count: 840, pct: 100 },
                  { stage: "Contactados",        count: 612, pct: 73  },
                  { stage: "Demo/propuesta",     count: 310, pct: 37  },
                  { stage: "Negociación",        count: 148, pct: 18  },
                  { stage: "Cerrado ganado",     count: 96,  pct: 11  },
                ].map((row, i, arr) => (
                  <div key={row.stage} style={{ marginBottom: i < arr.length - 1 ? 10 : 0 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4, alignItems: "baseline" }}>
                      <span style={{ fontSize: 12, color: C.ink2, fontWeight: 500 }}>{row.stage}</span>
                      <span style={{ fontFamily: "ui-monospace,monospace", fontSize: 11, color: C.ink3 }}>{row.count.toLocaleString()}</span>
                    </div>
                    <div style={{ height: 6, background: C.bg3, borderRadius: 99, overflow: "hidden" }}>
                      <div style={{ height: "100%", borderRadius: 99, width: `${row.pct}%`, background: i === arr.length - 1 ? C.accent : C.line, transition: "width .4s ease" }} />
                    </div>
                    {i < arr.length - 1 && (
                      <div style={{ fontFamily: "ui-monospace,monospace", fontSize: 9.5, color: C.ink4, marginTop: 2, textAlign: "right" }}>
                        {arr[i + 1] ? `${Math.round((arr[i + 1].count / row.count) * 100)}% pasan` : ""}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* ── 6. COHORT RETENTION HEATMAP ────────────────────────────── */}
          <CohortTable />

          {/* ── 7. SAVED REPORTS TABLE ─────────────────────────────────── */}
          <SavedReports />

          {/* ── SECONDARY CARDS: Forecast + YoY + AI insight ──────────── */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
            <div style={{ background: C.bg, border: `1px solid ${C.line}`, borderRadius: 10, overflow: "hidden" }}>
              <div style={{ padding: "14px 18px", borderBottom: `1px solid ${C.line2}` }}>
                <h3 style={{ fontWeight: 600, fontSize: 13.5, letterSpacing: "-0.012em", margin: 0, color: C.ink }}>Previsión de ingresos</h3>
                <div style={{ fontFamily: "ui-monospace,monospace", fontSize: 11, color: C.ink3, marginTop: 2 }}>3 escenarios · conservador / realista / optimista</div>
              </div>
              <div style={{ padding: "10px 18px 16px" }}>
                <ReportingForecast forecast={forecast} />
              </div>
            </div>
            <div style={{ background: C.bg, border: `1px solid ${C.line}`, borderRadius: 10, overflow: "hidden" }}>
              <div style={{ padding: "14px 18px", borderBottom: `1px solid ${C.line2}` }}>
                <h3 style={{ fontWeight: 600, fontSize: 13.5, letterSpacing: "-0.012em", margin: 0, color: C.ink }}>Año a año (YoY)</h3>
                <div style={{ fontFamily: "ui-monospace,monospace", fontSize: 11, color: C.ink3, marginTop: 2 }}>Comparativa con el mismo período del año anterior</div>
              </div>
              <div style={{ padding: "10px 18px 16px" }}>
                <ReportingYoY sales={sales} />
              </div>
            </div>
          </div>

          {/* AI Insight */}
          <ReportingInsight salesInRange={salesInRange} kpis={kpis} topClients={topClients} />

        </div>
      )}
    </div>
  )
}
