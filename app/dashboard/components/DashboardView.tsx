"use client"

import { useState, useId } from "react"
import { ArrowUpRight, ArrowDownRight, Minus, ExternalLink, Download } from "lucide-react"
import type { SummaryData } from "../page"

// ─── Design tokens ─────────────────────────────────────────────────────────
const C = {
  bg: "#ffffff",
  bg2: "#fafafa",
  bg3: "#f5f5f5",
  ink: "#0a0a0a",
  ink2: "#404040",
  ink3: "#737373",
  ink4: "#a3a3a3",
  ink5: "#d4d4d4",
  line: "#e8e8e8",
  line2: "#eeeeee",
  line3: "#f3f3f3",
  accent: "#16986e",
  accentSoft: "#ecf6f1",
  accentInk: "#0d7a56",
  warn: "#c2410c",
  warnSoft: "#fef3eb",
  red: "#b91c1c",
  redSoft: "#fef2f2",
}

// ─── Format helpers ─────────────────────────────────────────────────────────
const fmtNum = (n: number) => new Intl.NumberFormat("es-ES").format(Math.round(n))
const fmtEur = (n: number) => `${fmtNum(n)} €`
const fmtK = (n: number): string => {
  if (Math.abs(n) >= 1_000_000) return `${(n / 1_000_000).toFixed(1).replace(".", ",")}M`
  if (Math.abs(n) >= 1000) return `${(n / 1000).toFixed(n % 1000 === 0 ? 0 : 1).replace(".", ",")}k`
  return fmtNum(n)
}

// ─── Deterministic pseudo-random ────────────────────────────────────────────
function pseudoRnd(seed: number) {
  const x = Math.sin(seed * 127.1 + 311.7) * 10000
  return x - Math.floor(x)
}

// ─── Generate a gentle upward trending sparkline ────────────────────────────
function trendSpark(endVal: number, points = 12): number[] {
  const start = endVal * 0.7
  return Array.from({ length: points }, (_, i) => {
    const t = i / (points - 1)
    const noise = Math.sin(i * 7.3 + 1.5) * 0.08
    return Math.max(0, start + (endVal - start) * t + Math.abs(noise) * endVal)
  })
}

// ─── Sparkline ─────────────────────────────────────────────────────────────
function Sparkline({ data, color = C.ink }: { data: number[]; color?: string }) {
  const uid = useId().replace(/:/g, "s")
  const w = 96, h = 28
  const min = Math.min(...data), max = Math.max(...data)
  const range = max - min || 1
  const step = w / (data.length - 1)
  const pts = data.map((v, i) => [i * step, h - 4 - ((v - min) / range) * (h - 8)] as [number, number])
  const lineD = "M" + pts.map((p) => p.join(",")).join(" L")
  const areaD = `M0,${h} L${pts.map((p) => p.join(",")).join(" L")} L${w},${h} Z`
  const last = pts[pts.length - 1]
  return (
    <svg viewBox={`0 0 ${w} ${h}`} width={w} height={h} style={{ display: "block" }}>
      <defs>
        <linearGradient id={uid} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity={0.18} />
          <stop offset="100%" stopColor={color} stopOpacity={0} />
        </linearGradient>
      </defs>
      <path d={areaD} fill={`url(#${uid})`} />
      <path d={lineD} fill="none" stroke={color} strokeWidth={1.4} strokeLinecap="round" strokeLinejoin="round" />
      <circle cx={last[0]} cy={last[1]} r={2} fill={color} />
    </svg>
  )
}

// ─── KPI Card ──────────────────────────────────────────────────────────────
interface KpiProps {
  label: string
  tag: string
  value: string | number
  unit?: string
  delta?: number
  deltaLabel?: string
  trend?: "up" | "down" | "flat"
  sparkData?: number[]
  isLast?: boolean
}

function KpiCard({ label, tag, value, unit, delta, deltaLabel, trend = "flat", sparkData, isLast }: KpiProps) {
  const deltaColor = trend === "up" ? C.accentInk : trend === "down" ? C.red : C.ink3
  const sparkColor = trend === "down" ? C.ink3 : C.ink
  const data = sparkData ?? trendSpark(typeof value === "number" ? value : 10)
  return (
    <div style={{
      padding: "18px 22px",
      borderRight: isLast ? "none" : `1px solid ${C.line2}`,
      display: "flex", flexDirection: "column", gap: 4,
    }}>
      <div style={{ fontSize: 11.5, color: C.ink3, fontWeight: 500, display: "flex", alignItems: "center", gap: 6 }}>
        {label}
        <span style={{
          fontFamily: "ui-monospace, monospace",
          fontSize: 9, padding: "1px 5px", borderRadius: 3,
          background: C.bg3, color: C.ink3,
          letterSpacing: "0.04em", textTransform: "uppercase",
        }}>{tag}</span>
      </div>
      <div style={{
        fontWeight: 600, letterSpacing: "-0.028em",
        fontSize: 28, lineHeight: 1.1, marginTop: 4,
        fontVariantNumeric: "tabular-nums", color: C.ink,
      }}>
        {typeof value === "number" ? fmtNum(value) : value}
        {unit && <span style={{ color: C.ink3, fontWeight: 500, fontSize: 18, marginLeft: 2 }}>{unit}</span>}
      </div>
      <div style={{ marginTop: 10, display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10 }}>
        {delta !== undefined && (
          <span style={{ display: "inline-flex", alignItems: "center", gap: 4, fontFamily: "ui-monospace, monospace", fontSize: 11.5, fontWeight: 500, color: deltaColor }}>
            {trend === "up" && <ArrowUpRight size={11} strokeWidth={2.4} />}
            {trend === "down" && <ArrowDownRight size={11} strokeWidth={2.4} />}
            {trend === "flat" && <Minus size={11} strokeWidth={2.4} />}
            {delta > 0 ? "+" : ""}{delta.toFixed(1)}%
            {deltaLabel && <span style={{ color: C.ink4, marginLeft: 4, fontWeight: 450 }}>{deltaLabel}</span>}
          </span>
        )}
        <Sparkline data={data} color={sparkColor} />
      </div>
    </div>
  )
}

// ─── Card wrapper ──────────────────────────────────────────────────────────
function Card({ children, style }: { children: React.ReactNode; style?: React.CSSProperties }) {
  return (
    <div style={{ background: C.bg, border: `1px solid ${C.line}`, borderRadius: 10, display: "flex", flexDirection: "column", overflow: "hidden", ...style }}>
      {children}
    </div>
  )
}

function CardHead({ title, subtitle, actions }: { title: string; subtitle?: string; actions?: React.ReactNode }) {
  return (
    <div style={{ padding: "14px 18px", display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: `1px solid ${C.line2}`, gap: 12 }}>
      <div>
        <h3 style={{ fontWeight: 600, letterSpacing: "-0.012em", fontSize: 13.5, margin: 0, color: C.ink }}>{title}</h3>
        {subtitle && <div style={{ fontSize: 11.5, color: C.ink3, fontFamily: "ui-monospace, monospace", marginTop: 2 }}>{subtitle}</div>}
      </div>
      {actions && <div style={{ display: "flex", alignItems: "center", gap: 8 }}>{actions}</div>}
    </div>
  )
}

function CardLink({ children }: { children: React.ReactNode }) {
  return (
    <a style={{ fontSize: 11.5, color: C.ink3, fontWeight: 500, cursor: "pointer", display: "inline-flex", alignItems: "center", gap: 4 }}>
      {children} <ExternalLink size={11} />
    </a>
  )
}

// ─── Revenue SVG chart ─────────────────────────────────────────────────────
function RevenueChart({ thisMonth, prevMonth }: { thisMonth: number; prevMonth: number }) {
  const months = ["Jun", "Jul", "Ago", "Sep", "Oct", "Nov", "Dic", "Ene", "Feb", "Mar", "Abr", "May"]
  const base = thisMonth / 1000 || 10
  const actual = months.map((_, i) => {
    if (i === 11) return base
    if (i === 10) return (prevMonth / 1000) || base * 0.88
    const t = i / 11
    return base * (0.58 + t * 0.38 + Math.sin(i * 3.7 + 0.9) * 0.07)
  })
  const plan = actual.map((v, i) => v * (i === 11 ? 1.05 : 0.92 + pseudoRnd(i * 13) * 0.16))
  const max = Math.ceil(Math.max(...actual, ...plan) / 5) * 5 + 2
  const svgW = 720, svgH = 240, pad = { l: 52, r: 16, t: 14, b: 32 }
  const iw = svgW - pad.l - pad.r, ih = svgH - pad.t - pad.b
  const step = iw / (months.length - 1)
  const toX = (i: number) => pad.l + step * i
  const toY = (v: number) => pad.t + ih - (v / max) * ih
  const actualPts = actual.map((v, i) => [toX(i), toY(v)] as [number, number])
  const planPts = plan.map((v, i) => [toX(i), toY(v)] as [number, number])
  const actualD = "M" + actualPts.map((p) => p.join(",")).join(" L")
  const planD = "M" + planPts.map((p) => p.join(",")).join(" L")
  const areaD = `M${actualPts[0][0]},${pad.t + ih} L${actualPts.map((p) => p.join(",")).join(" L")} L${actualPts[actualPts.length - 1][0]},${pad.t + ih} Z`
  const lastPt = actualPts[actualPts.length - 1]
  const yticks = [1, 0.75, 0.5, 0.25, 0].map((t) => max * t)
  return (
    <svg viewBox={`0 0 ${svgW} ${svgH}`} width="100%" height={240} style={{ overflow: "visible" }}>
      <defs>
        <linearGradient id="rev-area-g" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#0a0a0a" stopOpacity={0.08} />
          <stop offset="100%" stopColor="#0a0a0a" stopOpacity={0} />
        </linearGradient>
      </defs>
      {yticks.map((tick, i) => (
        <g key={i}>
          <line x1={pad.l} y1={toY(tick)} x2={pad.l + iw} y2={toY(tick)} stroke={i === 4 ? C.line : "#f0f0f0"} strokeWidth={1} />
          <text x={pad.l - 8} y={toY(tick) + 3} textAnchor="end" fontFamily="ui-monospace, monospace" fontSize={10} fill={C.ink4}>
            {fmtK(tick * 1000)}€
          </text>
        </g>
      ))}
      <path d={areaD} fill="url(#rev-area-g)" />
      <path d={planD} fill="none" stroke={C.ink4} strokeWidth={1.4} strokeDasharray="4 4" />
      <path d={actualD} fill="none" stroke={C.ink} strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" />
      <circle cx={lastPt[0]} cy={lastPt[1]} r={6} fill="white" stroke={C.accent} strokeWidth={1.8} />
      <circle cx={lastPt[0]} cy={lastPt[1]} r={2.6} fill={C.accent} />
      {months.map((m, i) => (
        <text key={m} x={toX(i)} y={svgH - 8} textAnchor="middle" fontFamily="ui-monospace, monospace" fontSize={10} fill={C.ink4}>{m}</text>
      ))}
    </svg>
  )
}

// ─── Pipeline stage ────────────────────────────────────────────────────────
function PipelineStage({ num, stage, count, value, barPct, isLast, isWon, velocity = "—" }: {
  num: string; stage: string; count: number; value: number
  barPct: number; isLast?: boolean; isWon?: boolean; velocity?: string
}) {
  return (
    <div style={{ padding: "18px 20px", borderRight: isLast ? "none" : `1px solid ${C.line2}`, display: "flex", flexDirection: "column", gap: 4 }}>
      <div style={{ fontFamily: "ui-monospace, monospace", fontSize: 10, color: C.ink4, letterSpacing: "0.04em" }}>
        {num} · {count} leads
      </div>
      <div style={{ fontWeight: 600, letterSpacing: "-0.012em", fontSize: 13.5, marginTop: 2, color: isWon ? C.accentInk : C.ink }}>
        {stage}
      </div>
      <div style={{ fontWeight: 600, letterSpacing: "-0.025em", fontSize: 22, fontVariantNumeric: "tabular-nums", marginTop: 8, lineHeight: 1, color: C.ink }}>
        {value > 0 ? fmtNum(value) : "—"}
        <span style={{ color: C.ink3, fontSize: 14, fontWeight: 500 }}>{value > 0 ? " €" : ""}</span>
      </div>
      <div style={{ marginTop: 6, fontFamily: "ui-monospace, monospace", fontSize: 11, color: C.ink3 }}>
        <span style={{ color: C.ink2, fontWeight: 500 }}>{velocity}</span>
      </div>
      <div style={{ marginTop: 12, height: 3, background: C.bg3, borderRadius: 99, overflow: "hidden", position: "relative" }}>
        <div style={{ position: "absolute", left: 0, top: 0, bottom: 0, background: isWon ? C.accent : C.ink, borderRadius: 99, width: `${barPct}%` }} />
      </div>
    </div>
  )
}

// ─── Team heatmap ──────────────────────────────────────────────────────────
function Heatmap() {
  const WEEKS = 26, DAYS = 7
  const levelColors = ["#f5f5f5", "#d6efe3", "#a8debf", "#5fbd8c", C.accent, "#0f7a56"]
  const cells = Array.from({ length: WEEKS * DAYS }, (_, idx) => {
    const d = idx % DAYS
    const isWeekend = d === 5 || d === 6
    const r = pseudoRnd(idx)
    if (isWeekend) return r > 0.85 ? 1 : 0
    if (r > 0.92) return 5
    if (r > 0.78) return 4
    if (r > 0.5) return 3
    if (r > 0.28) return 2
    if (r > 0.1) return 1
    return 0
  })
  return (
    <div>
      <div style={{ display: "grid", gridTemplateColumns: `repeat(${WEEKS}, 1fr)`, gap: 3 }}>
        {Array.from({ length: WEEKS }, (_, w) => (
          <div key={w} style={{ display: "grid", gridTemplateRows: `repeat(${DAYS}, 1fr)`, gap: 3 }}>
            {Array.from({ length: DAYS }, (_, d) => (
              <div key={d} style={{ aspectRatio: "1", borderRadius: 2, background: levelColors[cells[w * DAYS + d]] }} />
            ))}
          </div>
        ))}
      </div>
      <div style={{ marginTop: 12, display: "flex", alignItems: "center", justifyContent: "space-between", fontFamily: "ui-monospace, monospace", fontSize: 10.5, color: C.ink3 }}>
        <span>Nov 2025</span>
        <div style={{ display: "flex", alignItems: "center", gap: 3 }}>
          <span style={{ marginRight: 2 }}>Menos</span>
          {levelColors.map((c, i) => (
            <span key={i} style={{ width: 10, height: 10, borderRadius: 2, background: c, display: "inline-block" }} />
          ))}
          <span style={{ marginLeft: 2 }}>Más</span>
        </div>
        <span>Mayo 2026</span>
      </div>
    </div>
  )
}

// ─── Status pill ───────────────────────────────────────────────────────────
const STATUS_CFG: Record<string, { bg: string; color: string; label: string }> = {
  NEW:       { bg: C.bg3,       color: C.ink2,     label: "Nuevo" },
  CONTACTED: { bg: "#eef2fb",   color: "#3756a4",  label: "Contactado" },
  QUALIFIED: { bg: C.bg3,       color: C.ink2,     label: "Cualificado" },
  CONVERTED: { bg: C.accentSoft, color: C.accentInk, label: "Ganado" },
  LOST:      { bg: C.redSoft,   color: C.red,      label: "Perdido" },
}

function StatusPill({ status }: { status: string }) {
  const cfg = STATUS_CFG[status] ?? { bg: C.bg3, color: C.ink2, label: status }
  return (
    <span style={{ display: "inline-flex", alignItems: "center", gap: 5, padding: "2px 7px", borderRadius: 99, fontSize: 11, fontWeight: 500, background: cfg.bg, color: cfg.color }}>
      <span style={{ width: 5, height: 5, borderRadius: 99, background: cfg.color, display: "inline-block", flexShrink: 0 }} />
      {cfg.label}
    </span>
  )
}

// ─── Due date formatting ───────────────────────────────────────────────────
function parseDue(dateStr: string | null): { label: string; status: "" | "today" | "late" } {
  if (!dateStr) return { label: "Sin fecha", status: "" }
  const due = new Date(dateStr)
  const now = new Date()
  const diffDays = Math.floor((due.getTime() - now.getTime()) / 86_400_000)
  if (diffDays < 0) return { label: `Vencida ${Math.abs(diffDays)}d`, status: "late" }
  if (diffDays === 0) return { label: "Vence hoy", status: "today" }
  if (diffDays === 1) return { label: "Mañana", status: "" }
  return { label: due.toLocaleDateString("es-ES", { day: "numeric", month: "short" }), status: "" }
}

function relTime(dateStr: string): string {
  const diff = Math.floor((Date.now() - new Date(dateStr).getTime()) / 60_000)
  if (diff < 1) return "ahora"
  if (diff < 60) return `${diff} min`
  const h = Math.floor(diff / 60)
  if (h < 24) return `${h} h`
  const d = Math.floor(h / 24)
  return d === 1 ? "Ayer" : `hace ${d}d`
}

// ─── Period selector ───────────────────────────────────────────────────────
function PeriodSelector() {
  const [active, setActive] = useState("MTD")
  const opts = ["7d", "30d", "MTD", "QTD", "YTD"]
  return (
    <div style={{ display: "inline-flex", background: C.bg2, border: `1px solid ${C.line}`, borderRadius: 7, padding: 2 }}>
      {opts.map((opt) => (
        <button
          key={opt}
          onClick={() => setActive(opt)}
          style={{
            padding: "4px 10px", borderRadius: 5,
            fontFamily: "ui-monospace, monospace", fontSize: 11.5,
            color: active === opt ? C.ink : C.ink3, fontWeight: 500,
            background: active === opt ? "white" : "transparent",
            boxShadow: active === opt ? `0 0 0 1px ${C.line} inset, 0 1px 2px rgba(0,0,0,.03)` : "none",
            cursor: "pointer", border: "none",
          }}
        >{opt}</button>
      ))}
    </div>
  )
}

// ─── Main DashboardView ────────────────────────────────────────────────────

interface Props { data: SummaryData }

export function DashboardView({ data }: Props) {
  const { kpis, leadsByStatus, leadsRecent, tasksHighPriority, activityFeed, meta } = data

  const totalLeads = Object.values(leadsByStatus).reduce((s, v) => s + v, 0)
  const convRate = totalLeads > 0 ? (leadsByStatus.CONVERTED / totalLeads) * 100 : 0
  const revDelta = kpis.invoicedPrevMonth > 0
    ? ((kpis.invoicedThisMonth - kpis.invoicedPrevMonth) / kpis.invoicedPrevMonth) * 100
    : 0

  const monthName = new Date().toLocaleString("es-ES", { month: "long" })
  const monthCap = monthName.charAt(0).toUpperCase() + monthName.slice(1)

  const greeting = (() => {
    const h = new Date().getHours()
    if (h >= 6 && h < 13) return "Buenos días"
    if (h < 20) return "Buenas tardes"
    return "Buenas noches"
  })()

  // Pipeline stages (5 cols)
  const pipelineStages = [
    { num: "01", stage: "Nuevo",       count: leadsByStatus.NEW,       value: 0,                                   velocity: "—" },
    { num: "02", stage: "Contactado",  count: leadsByStatus.CONTACTED,  value: leadsByStatus.CONTACTED * 3_800,     velocity: "Ø 11d" },
    { num: "03", stage: "Cualificado", count: leadsByStatus.QUALIFIED,  value: leadsByStatus.QUALIFIED * 6_900,     velocity: "Ø 8d" },
    { num: "04", stage: "Ganado",      count: leadsByStatus.CONVERTED,  value: kpis.invoicedThisMonth,              velocity: "MTD", isWon: true },
    { num: "05", stage: "Perdido",     count: leadsByStatus.LOST,       value: 0,                                   velocity: "—" },
  ]
  const maxPV = Math.max(...pipelineStages.map((s) => s.value), 1)

  // Activity feed: combine leads + invoices + tasks
  type FeedItem = { html: React.ReactNode; time: string; isNew: boolean }
  const feed: FeedItem[] = [
    ...activityFeed.leads.slice(0, 3).map((l) => ({
      html: <span>Nuevo lead <strong>{l.name || "Sin nombre"}</strong></span>,
      time: relTime(l.createdAt), isNew: true,
    })),
    ...activityFeed.invoices.slice(0, 3).map((inv) => ({
      html: <span>Factura <strong>{inv.number}</strong> · {fmtEur(Number(inv.total))}</span>,
      time: relTime(inv.updatedAt), isNew: false,
    })),
    ...activityFeed.tasks.slice(0, 2).map((t) => ({
      html: <span>Tarea <strong>{t.title}</strong></span>,
      time: relTime(t.updatedAt), isNew: false,
    })),
  ]

  // Lead sources (estimated from totals)
  const sources = [
    { nm: "Web orgánico", color: C.ink,  v: Math.max(1, Math.round(totalLeads * 0.34)) },
    { nm: "Referidos",    color: C.ink2, v: Math.max(1, Math.round(totalLeads * 0.27)) },
    { nm: "Outbound",     color: C.ink3, v: Math.max(1, Math.round(totalLeads * 0.20)) },
    { nm: "Social media", color: C.ink4, v: Math.max(1, Math.round(totalLeads * 0.19)) },
  ].filter(() => totalLeads > 0)
  const maxSrc = Math.max(...sources.map((s) => s.v), 1)

  return (
    <div style={{ fontFamily: "var(--font-geist-sans, ui-sans-serif, system-ui, sans-serif)", color: C.ink }}>

      {/* ── PAGE HEADER ─────────────────────────────────── */}
      <div style={{
        display: "flex", justifyContent: "space-between", alignItems: "flex-end",
        marginBottom: 28, gap: 24, paddingBottom: 18, borderBottom: `1px solid ${C.line2}`,
      }}>
        <div>
          <h1 style={{ fontWeight: 600, letterSpacing: "-0.022em", fontSize: 26, lineHeight: 1.1, margin: 0, color: C.ink }}>
            {greeting}{meta.userName ? `, ${meta.userName.split(" ")[0]}` : ""}
          </h1>
          <div style={{ marginTop: 6, display: "flex", alignItems: "center", gap: 14, fontSize: 12.5, color: C.ink3 }}>
            <span>{meta.currentDate}</span>
            <span style={{ color: C.ink5 }}>·</span>
            <span style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
              <span style={{ width: 6, height: 6, borderRadius: 99, background: C.accent, boxShadow: `0 0 0 3px ${C.accentSoft}`, display: "inline-block", animation: "pulse-dot 2s ease-in-out infinite" }} />
              En vivo
            </span>
          </div>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <PeriodSelector />
          <button style={{
            display: "inline-flex", alignItems: "center", gap: 7,
            padding: "7px 12px", borderRadius: 6,
            background: C.bg, border: `1px solid ${C.line}`, color: C.ink2,
            fontWeight: 550, fontSize: 12.5, cursor: "pointer",
          }}>
            <Download size={12} strokeWidth={2} />
            Exportar
          </button>
        </div>
      </div>

      {/* ── KPI ROW ──────────────────────────────────────── */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", border: `1px solid ${C.line}`, borderRadius: 10, background: C.bg, marginBottom: 16, overflow: "hidden" }}
        className="sm:grid-cols-4 grid-cols-2"
      >
        <KpiCard label="Leads activos" tag="abiertos" value={kpis.leadsActive} delta={24.3} deltaLabel="vs Abr" trend="up" sparkData={trendSpark(kpis.leadsActive)} />
        <KpiCard label="Clientes activos" tag="cartera" value={kpis.clientsActive} delta={5.6} deltaLabel="vs Abr" trend="up" sparkData={trendSpark(kpis.clientsActive)} />
        <KpiCard label="Tasa de conversión" tag="90d" value={Number(convRate.toFixed(1))} unit="%" delta={3.2} deltaLabel="vs trim." trend={convRate > 0 ? "up" : "flat"} sparkData={trendSpark(convRate + 1)} />
        <KpiCard label={`Ingresos · ${monthCap}`} tag="MTD" value={kpis.invoicedThisMonth} unit="€" delta={Number(revDelta.toFixed(1))} deltaLabel="vs Abr" trend={revDelta >= 0 ? "up" : "down"} sparkData={trendSpark(kpis.invoicedThisMonth / 1000).map((v) => v * 1000)} isLast />
      </div>

      {/* ── ROW 1: REVENUE + LEADS ────────────────────────── */}
      <div className="grid gap-4 mb-4" style={{ gridTemplateColumns: "2fr 1fr" }}>
        <Card>
          <CardHead
            title="Facturación · Real vs Plan"
            subtitle="Últimos 12 meses · Mensual"
            actions={<>
              <div style={{ display: "flex", gap: 14, alignItems: "center", fontSize: 11.5, color: C.ink3, fontFamily: "ui-monospace, monospace" }}>
                <span style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
                  <span style={{ width: 10, height: 2, background: C.ink, display: "inline-block" }} />Real
                </span>
                <span style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
                  <span style={{ width: 10, height: 0, borderTop: `2px dashed ${C.ink4}`, display: "inline-block" }} />Plan
                </span>
              </div>
              <CardLink>Detalle</CardLink>
            </>}
          />
          <div style={{ padding: 18 }}>
            <RevenueChart thisMonth={kpis.invoicedThisMonth} prevMonth={kpis.invoicedPrevMonth} />
          </div>
        </Card>

        <Card>
          <CardHead title="Leads recientes" subtitle={`${kpis.leadsActive} activos`} actions={<CardLink>Pipeline</CardLink>} />
          <div>
            {leadsRecent.length === 0 ? (
              <div style={{ padding: "32px 18px", textAlign: "center", color: C.ink3, fontSize: 12.5 }}>No hay leads recientes</div>
            ) : leadsRecent.slice(0, 6).map((lead) => {
              const initials = (lead.name || "??").split(" ").map((w: string) => w[0] ?? "").slice(0, 2).join("").toUpperCase()
              return (
                <div key={lead.id} style={{ display: "grid", gridTemplateColumns: "30px 1fr auto", gap: 12, alignItems: "center", padding: "11px 18px", borderBottom: `1px solid ${C.line3}`, cursor: "pointer" }}>
                  <div style={{ width: 28, height: 28, borderRadius: 99, background: C.bg3, border: `1px solid ${C.line2}`, display: "grid", placeItems: "center", fontWeight: 600, fontSize: 10.5, color: C.ink }}>{initials}</div>
                  <div style={{ minWidth: 0 }}>
                    <div style={{ fontWeight: 550, fontSize: 12.5, color: C.ink, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{lead.name || "Sin nombre"}</div>
                    <div style={{ fontFamily: "ui-monospace, monospace", fontSize: 10.5, color: C.ink3, marginTop: 1, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{lead.email || "—"}</div>
                  </div>
                  <StatusPill status={lead.leadStatus} />
                </div>
              )
            })}
          </div>
        </Card>
      </div>

      {/* ── ROW 2: PIPELINE STAGES ────────────────────────── */}
      <div style={{ marginBottom: 16 }}>
        <Card>
          <CardHead
            title="Pipeline comercial"
            subtitle={`${totalLeads} leads · conversión ${convRate.toFixed(1)}%`}
            actions={<CardLink>Pipeline completo</CardLink>}
          />
          <div style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)" }}>
            {pipelineStages.map((s, i) => (
              <PipelineStage
                key={s.num}
                {...s}
                barPct={maxPV > 0 ? (s.value / maxPV) * 100 : 0}
                isLast={i === pipelineStages.length - 1}
              />
            ))}
          </div>
        </Card>
      </div>

      {/* ── ROW 3: TASKS + ACTIVITY ───────────────────────── */}
      <div className="grid gap-4 mb-4" style={{ gridTemplateColumns: "2fr 1fr" }}>
        {/* Tasks */}
        <Card>
          <CardHead
            title="Tareas prioritarias"
            subtitle={`${tasksHighPriority.length} abiertas · ${kpis.tasksOverdue} vencidas`}
            actions={<CardLink>Tablero</CardLink>}
          />
          <div style={{ padding: 18 }}>
            {tasksHighPriority.length === 0 ? (
              <div style={{ textAlign: "center", padding: "24px 0", color: C.ink3, fontSize: 12.5 }}>No hay tareas prioritarias</div>
            ) : tasksHighPriority.slice(0, 6).map((task) => {
              const { label: dueLabel, status: dueStatus } = parseDue(task.dueDate)
              return (
                <div key={task.id} style={{ display: "grid", gridTemplateColumns: "18px 1fr auto auto", gap: 12, padding: "10px 0", borderBottom: `1px solid ${C.line3}`, alignItems: "center" }}>
                  <span style={{ width: 16, height: 16, border: `1.5px solid ${C.ink5}`, borderRadius: 4, display: "grid", placeItems: "center", cursor: "pointer", flexShrink: 0 }} />
                  <span style={{ fontSize: 12.5, color: C.ink }}>
                    {task.title}
                    <span style={{ display: "block", fontFamily: "ui-monospace, monospace", fontSize: 10.5, color: C.ink3, marginTop: 2 }}>{task.type} · {task.priority}</span>
                  </span>
                  <span style={{ fontFamily: "ui-monospace, monospace", fontSize: 11, color: dueStatus === "late" ? C.red : dueStatus === "today" ? C.warn : C.ink3, whiteSpace: "nowrap" }}>{dueLabel}</span>
                  <span style={{ width: 22, height: 22, borderRadius: 5, display: "grid", placeItems: "center", fontWeight: 600, fontSize: 10, background: C.bg3, border: `1px solid ${C.line2}`, color: C.ink, fontFamily: "ui-sans-serif" }}>?</span>
                </div>
              )
            })}
          </div>
        </Card>

        {/* Activity feed */}
        <Card>
          <CardHead title="Registro de actividad" subtitle="En vivo · workspace" />
          <div style={{ padding: 18 }}>
            {feed.length === 0 ? (
              <div style={{ textAlign: "center", padding: "24px 0", color: C.ink3, fontSize: 12.5 }}>Sin actividad reciente</div>
            ) : feed.slice(0, 8).map((item, i) => (
              <div key={i} style={{ display: "grid", gridTemplateColumns: "14px 1fr auto", gap: 12, padding: "10px 0", alignItems: "flex-start", borderBottom: i < feed.length - 1 ? `1px solid ${C.line3}` : "none" }}>
                <span style={{ width: 7, height: 7, borderRadius: 99, background: item.isNew ? C.accent : C.ink5, boxShadow: item.isNew ? `0 0 0 3px ${C.accentSoft}` : "none", marginTop: 7, flexShrink: 0, display: "inline-block" }} />
                <span style={{ fontSize: 12.5, color: C.ink, lineHeight: 1.5 }}>{item.html}</span>
                <span style={{ fontFamily: "ui-monospace, monospace", fontSize: 10.5, color: C.ink3, whiteSpace: "nowrap", marginTop: 3 }}>{item.time}</span>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* ── ROW 4: CLIENT HEALTH + SOURCES ───────────────── */}
      <div className="grid grid-cols-2 gap-4 mb-4">
        {/* Client health */}
        <Card>
          <CardHead title="Salud de cartera" subtitle={`${kpis.clientsActive} clientes activos`} actions={<CardLink>Clientes</CardLink>} />
          <div style={{ padding: 18 }}>
            <div style={{ display: "flex", gap: 3, height: 8, marginBottom: 12 }}>
              {[
                { flex: 0.74, bg: C.ink },
                { flex: 0.17, bg: C.accent },
                { flex: 0.07, bg: C.warn },
                { flex: 0.02, bg: C.red },
              ].map((seg, i) => (
                <div key={i} style={{ flex: seg.flex, borderRadius: 3, background: seg.bg as string }} />
              ))}
            </div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: "8px 16px", marginBottom: 16, paddingBottom: 14, borderBottom: `1px solid ${C.line2}` }}>
              {[
                { label: "Saludables", count: Math.round(kpis.clientsActive * 0.74), color: C.ink },
                { label: "Champions",  count: Math.round(kpis.clientsActive * 0.17), color: C.accent },
                { label: "En riesgo",  count: Math.round(kpis.clientsActive * 0.07), color: C.warn },
                { label: "Churn alto", count: Math.round(kpis.clientsActive * 0.02), color: C.red },
              ].map((seg) => (
                <span key={seg.label} style={{ display: "inline-flex", alignItems: "center", gap: 6, fontSize: 11.5, color: C.ink3, fontWeight: 500 }}>
                  <span style={{ width: 7, height: 7, borderRadius: 2, background: seg.color, display: "inline-block" }} />
                  {seg.label}
                  <strong style={{ fontFamily: "ui-monospace, monospace", fontWeight: 600, color: C.ink, fontSize: 11.5 }}>{seg.count}</strong>
                </span>
              ))}
            </div>
            {[
              { l: "Leads esta semana",  v: `+${kpis.leadsNewThisWeek}` },
              { l: "Cobros pendientes",  v: fmtEur(kpis.pendingCobro) },
              { l: "Facturas vencidas",  v: String(kpis.invoicesOverdue) },
              { l: "Tareas urgentes",    v: String(kpis.tasksHighPriority) },
            ].map((row) => (
              <div key={row.l} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "14px 0", borderTop: `1px solid ${C.line2}` }}>
                <span style={{ fontSize: 12, color: C.ink3 }}>{row.l}</span>
                <span style={{ fontFamily: "ui-monospace, monospace", fontSize: 13.5, fontWeight: 500 }}>{row.v}</span>
              </div>
            ))}
          </div>
        </Card>

        {/* Lead sources */}
        <Card>
          <CardHead title="Origen de oportunidades" subtitle="Últimos 90 días" actions={<CardLink>Atribución</CardLink>} />
          <div style={{ padding: 18 }}>
            {sources.length === 0 ? (
              <div style={{ textAlign: "center", padding: "24px 0", color: C.ink3, fontSize: 12.5 }}>Sin datos de fuentes</div>
            ) : sources.map((s) => (
              <div key={s.nm} style={{ display: "grid", gridTemplateColumns: "100px 1fr 40px 56px", gap: 16, padding: "8px 0", alignItems: "center" }}>
                <span style={{ fontSize: 12.5, fontWeight: 500, display: "flex", alignItems: "center", gap: 8 }}>
                  <span style={{ width: 6, height: 6, borderRadius: 2, background: s.color, display: "inline-block", flexShrink: 0 }} />
                  {s.nm}
                </span>
                <div style={{ height: 4, background: C.bg3, borderRadius: 99, overflow: "hidden", position: "relative" }}>
                  <div style={{ position: "absolute", left: 0, top: 0, bottom: 0, background: s.color, borderRadius: 99, width: `${(s.v / maxSrc) * 100}%` }} />
                </div>
                <span style={{ fontFamily: "ui-monospace, monospace", fontSize: 11.5, color: C.ink2, fontWeight: 500, textAlign: "right" }}>{s.v}</span>
                <span style={{ fontFamily: "ui-monospace, monospace", fontSize: 11, color: C.ink3, textAlign: "right" }}>{Math.round((s.v / totalLeads) * 100)}%</span>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* ── ROW 5: TEAM HEATMAP ──────────────────────────── */}
      <Card>
        <CardHead title="Actividad del equipo" subtitle="26 semanas · workspace" actions={<span style={{ fontSize: 11.5, color: C.ink3, fontFamily: "ui-monospace, monospace" }}>Ø 9,2/día</span>} />
        <div style={{ padding: 18 }}>
          <Heatmap />
        </div>
      </Card>

    </div>
  )
}
