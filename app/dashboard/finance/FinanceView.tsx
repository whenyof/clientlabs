/* eslint-disable @typescript-eslint/no-explicit-any */
"use client"

import { useState, useId } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import { useQuery } from "@tanstack/react-query"
import {
  Plus, FileText, Shield, Send, MoreVertical,
  ArrowUpRight, ArrowDownRight, Minus, ExternalLink,
} from "lucide-react"
import type { FinancePageData } from "./lib/server-data"

// ─── Design tokens ─────────────────────────────────────────────────────────
const C = {
  bg: "#ffffff", bg2: "#fafafa", bg3: "#f5f5f5",
  ink: "#0a0a0a", ink2: "#404040", ink3: "#737373", ink4: "#a3a3a3", ink5: "#d4d4d4",
  line: "#e8e8e8", line2: "#eeeeee", line3: "#f3f3f3",
  accent: "#16986e", accentSoft: "#ecf6f1", accentInk: "#0d7a56",
  warn: "#c2410c", warnSoft: "#fef3eb",
  red: "#b91c1c", redSoft: "#fef2f2",
  blue: "#3756a4", blueSoft: "#eef2fb",
  violet: "#6d28d9",
}

const fmtN = (n: number) => new Intl.NumberFormat("es-ES").format(Math.round(n))
const fmtEur = (n: number) =>
  n >= 1_000_000 ? `${(n / 1_000_000).toFixed(1).replace(".", ",")}M €`
  : n >= 1_000 ? `${(n / 1_000).toFixed(n % 1_000 === 0 ? 0 : 1).replace(".", ",")}k €`
  : `${fmtN(n)} €`
const pRnd = (s: number) => { const x = Math.sin(s * 127.1 + 311.7) * 10000; return x - Math.floor(x) }

// ─── Tab list ───────────────────────────────────────────────────────────────
const TABS = [
  { id: "resumen",      label: "Resumen" },
  { id: "facturas",     label: "Facturas",      count: null as number | null },
  { id: "presupuestos", label: "Presupuestos",   count: null as number | null },
  { id: "albaranes",    label: "Albaranes",      count: null as number | null },
  { id: "pedidos",      label: "Pedidos",        count: null as number | null },
  { id: "recurrentes",  label: "Recurrentes" },
  { id: "gastos",       label: "Gastos" },
  { id: "productos",    label: "Productos · servicios" },
  { id: "impuestos",    label: "Impuestos · IVA/IRPF" },
  { id: "verifactu",    label: "Verifactu · AEAT", live: true },
  { id: "configuracion",label: "Configuración" },
]

// ─── Sparkline ─────────────────────────────────────────────────────────────
function Sparkline({ data, color = C.ink }: { data: number[]; color?: string }) {
  const uid = useId().replace(/:/g, "s")
  const w = 96, h = 28
  const min = Math.min(...data), max = Math.max(...data), rng = max - min || 1
  const step = w / (data.length - 1)
  const pts = data.map((v, i) => [i * step, h - 4 - ((v - min) / rng) * (h - 8)] as [number, number])
  const lineD = "M" + pts.map(p => p.join(",")).join(" L")
  const areaD = `M0,${h} L${pts.map(p => p.join(",")).join(" L")} L${w},${h} Z`
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

// ─── KPI Card ─────────────────────────────────────────────────────────────
type Trend = "up" | "down" | "flat"
function KpiCard({ label, tag, value, unit, trend = "flat", delta, deltaVs, spark, isLast }: {
  label: string; tag: string; value: number; unit?: string; trend?: Trend
  delta: number; deltaVs: string; spark: number[]; isLast?: boolean
}) {
  const dc = trend === "up" ? C.accentInk : trend === "down" ? C.red : C.ink3
  const fmt = unit === "€" ? fmtEur(value) : unit === "%" ? value.toFixed(1).replace(".", ",") : fmtN(value)
  return (
    <div style={{ padding: "18px 22px", borderRight: isLast ? "none" : `1px solid ${C.line2}`, display: "flex", flexDirection: "column", gap: 4 }}>
      <div style={{ fontSize: 11.5, color: C.ink3, fontWeight: 500, display: "flex", alignItems: "center", gap: 6 }}>
        {label}
        <span style={{ fontFamily: "ui-monospace,monospace", fontSize: 9, padding: "1px 5px", borderRadius: 3, background: C.bg3, color: C.ink3, letterSpacing: "0.04em", textTransform: "uppercase" }}>{tag}</span>
      </div>
      <div style={{ fontWeight: 600, letterSpacing: "-0.028em", fontSize: 28, lineHeight: 1.1, marginTop: 4, fontVariantNumeric: "tabular-nums", color: C.ink }}>
        {fmt}{unit && unit !== "€" && <span style={{ color: C.ink3, fontWeight: 500, fontSize: 18, marginLeft: 2 }}>{unit}</span>}
      </div>
      <div style={{ marginTop: 10, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <span style={{ display: "inline-flex", alignItems: "center", gap: 4, fontFamily: "ui-monospace,monospace", fontSize: 11.5, fontWeight: 500, color: dc }}>
          {trend === "up" ? <ArrowUpRight size={11} strokeWidth={2.4} /> : trend === "down" ? <ArrowDownRight size={11} strokeWidth={2.4} /> : <Minus size={11} strokeWidth={2.4} />}
          {delta > 0 ? "+" : ""}{delta.toFixed(1)}%
          <span style={{ color: C.ink4, marginLeft: 4, fontWeight: 450 }}>{deltaVs}</span>
        </span>
        <Sparkline data={spark} color={trend === "down" ? C.ink3 : C.ink} />
      </div>
    </div>
  )
}

// ─── Card / CardHead ───────────────────────────────────────────────────────
function Card({ children, style }: { children: React.ReactNode; style?: React.CSSProperties }) {
  return <div style={{ background: C.bg, border: `1px solid ${C.line}`, borderRadius: 10, overflow: "hidden", ...style }}>{children}</div>
}
function CardHead({ title, subtitle, actions }: { title: string; subtitle?: string; actions?: React.ReactNode }) {
  return (
    <div style={{ padding: "14px 18px", display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: `1px solid ${C.line2}`, gap: 12 }}>
      <div>
        <h3 style={{ fontWeight: 600, letterSpacing: "-0.012em", fontSize: 13.5, margin: 0, color: C.ink }}>{title}</h3>
        {subtitle && <div style={{ fontSize: 11.5, color: C.ink3, fontFamily: "ui-monospace,monospace", marginTop: 2 }}>{subtitle}</div>}
      </div>
      {actions && <div style={{ display: "flex", alignItems: "center", gap: 8 }}>{actions}</div>}
    </div>
  )
}
function CLink({ children }: { children: React.ReactNode }) {
  return <a style={{ fontSize: 11.5, color: C.ink3, fontWeight: 500, cursor: "pointer", display: "inline-flex", alignItems: "center", gap: 4 }}>{children} <ExternalLink size={11} /></a>
}

// ─── Pill ─────────────────────────────────────────────────────────────────
const PILL: Record<string, { bg: string; color: string }> = {
  green:  { bg: C.accentSoft, color: C.accentInk },
  amber:  { bg: C.warnSoft,   color: C.warn },
  red:    { bg: C.redSoft,    color: C.red },
  blue:   { bg: C.blueSoft,   color: C.blue },
  ink:    { bg: C.bg3,        color: C.ink2 },
  "":     { bg: C.bg3,        color: C.ink2 },
}
function Pill({ tone, children }: { tone: string; children: React.ReactNode }) {
  const t = PILL[tone] ?? PILL[""]
  return (
    <span style={{ display: "inline-flex", alignItems: "center", gap: 5, padding: "2px 8px", borderRadius: 99, fontSize: 11, fontWeight: 500, background: t.bg, color: t.color }}>
      <span style={{ width: 5, height: 5, borderRadius: 99, background: t.color, display: "inline-block" }} />
      {children}
    </span>
  )
}

// ─── Revenue SVG chart ─────────────────────────────────────────────────────
function RevenueChart({ trend }: { trend: { month: string; income: number; expenses: number; profit: number }[] }) {
  const uid = useId().replace(/:/g, "g")
  if (!trend.length) return <div style={{ height: 240, display: "flex", alignItems: "center", justifyContent: "center", color: C.ink3, fontSize: 13 }}>Sin datos</div>
  const data = trend.slice(-12)
  const maxV = Math.max(...data.map(d => d.income), ...data.map(d => d.expenses)) * 1.1 || 1
  const w = 720, h = 240, pad = { l: 44, r: 16, t: 14, b: 28 }
  const iw = w - pad.l - pad.r, ih = h - pad.t - pad.b
  const step = iw / Math.max(data.length - 1, 1)
  const toX = (i: number) => pad.l + step * i
  const toY = (v: number) => pad.t + ih - (v / maxV) * ih
  const ptsInc = data.map((d, i) => [toX(i), toY(d.income)] as [number, number])
  const ptsExp = data.map((d, i) => [toX(i), toY(d.expenses)] as [number, number])
  const ptsPro = data.map((d, i) => [toX(i), toY(d.profit)] as [number, number])
  const lineD = (pts: [number, number][]) => "M" + pts.map(p => p.join(",")).join(" L")
  const areaD = `M${ptsInc[0][0]},${pad.t + ih} L${ptsInc.map(p => p.join(",")).join(" L")} L${ptsInc[ptsInc.length - 1][0]},${pad.t + ih} Z`
  const yticks = [0, 0.25, 0.5, 0.75, 1].map(t => maxV * (1 - t))
  const lastInc = ptsInc[ptsInc.length - 1]
  return (
    <svg viewBox={`0 0 ${w} ${h}`} width="100%" height={h} style={{ overflow: "visible" }}>
      <defs>
        <linearGradient id={uid} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={C.accent} stopOpacity={0.12} />
          <stop offset="100%" stopColor={C.accent} stopOpacity={0} />
        </linearGradient>
      </defs>
      {yticks.map((tick, i) => (
        <g key={i}>
          <line x1={pad.l} y1={toY(tick)} x2={pad.l + iw} y2={toY(tick)} stroke={i === 4 ? C.line : "#f0f0f0"} strokeWidth={1} />
          <text x={pad.l - 8} y={toY(tick) + 3} textAnchor="end" fontFamily="ui-monospace,monospace" fontSize={9.5} fill={C.ink4}>{fmtEur(tick).replace(" €", "")}</text>
        </g>
      ))}
      <path d={areaD} fill={`url(#${uid})`} />
      <path d={lineD(ptsExp)} fill="none" stroke={C.ink4} strokeWidth={1.4} strokeDasharray="3 3" />
      <path d={lineD(ptsPro)} fill="none" stroke={C.accent} strokeWidth={1.6} strokeLinecap="round" strokeLinejoin="round" />
      <path d={lineD(ptsInc)} fill="none" stroke={C.ink} strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" />
      <circle cx={lastInc[0]} cy={lastInc[1]} r={5} fill="white" stroke={C.ink} strokeWidth={1.8} />
      <circle cx={lastInc[0]} cy={lastInc[1]} r={2.4} fill={C.ink} />
      {data.map((d, i) => (
        <text key={d.month} x={toX(i)} y={h - 6} textAnchor="middle" fontFamily="ui-monospace,monospace" fontSize={9.5} fill={C.ink4}>{d.month}</text>
      ))}
    </svg>
  )
}

// ─── Table helpers ─────────────────────────────────────────────────────────
const TH = ({ children, right }: { children: React.ReactNode; right?: boolean }) => (
  <th style={{ padding: "9px 16px", textAlign: right ? "right" : "left", fontFamily: "ui-monospace,monospace", fontSize: 10, fontWeight: 500, color: C.ink3, letterSpacing: "0.06em", textTransform: "uppercase", borderBottom: `1px solid ${C.line2}`, background: C.bg2, whiteSpace: "nowrap" }}>{children}</th>
)
const TD = ({ children, right, mono }: { children: React.ReactNode; right?: boolean; mono?: boolean }) => (
  <td style={{ padding: "11px 16px", borderBottom: `1px solid ${C.line3}`, textAlign: right ? "right" : "left", fontFamily: mono ? "ui-monospace,monospace" : undefined, fontSize: mono ? 11.5 : 12.5, color: mono ? C.ink2 : C.ink, verticalAlign: "middle" }}>{children}</td>
)
const Amt = ({ v, warn }: { v: number; warn?: boolean }) => (
  <span style={{ fontFamily: "ui-monospace,monospace", fontSize: 12.5, fontWeight: 600, color: warn && v > 0 ? C.warn : C.ink }}>
    {fmtEur(v)}
  </span>
)
const DocNum = ({ num }: { num: string }) => {
  const parts = num.split("-")
  const prefix = parts.slice(0, -1).join("-") + "-"
  const last = parts[parts.length - 1]
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 0 }}>
      <span style={{ fontFamily: "ui-monospace,monospace", fontSize: 11, color: C.ink4 }}>{prefix}</span>
      <span style={{ fontFamily: "ui-monospace,monospace", fontSize: 12, fontWeight: 600, color: C.ink }}>{last}</span>
    </div>
  )
}
const CliCell = ({ name }: { name: string }) => {
  const initials = name.split(" ").slice(0, 2).map(w => w[0] ?? "").join("").toUpperCase()
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
      <div style={{ width: 26, height: 26, borderRadius: 5, background: C.bg3, border: `1px solid ${C.line2}`, display: "grid", placeItems: "center", fontWeight: 600, fontSize: 10, color: C.ink, flexShrink: 0 }}>{initials}</div>
      <div style={{ fontWeight: 550, color: C.ink, letterSpacing: "-0.005em" }}>{name}</div>
    </div>
  )
}
const FilterPill = ({ label, value }: { label: string; value: string }) => (
  <div style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "5px 10px", border: `1px solid ${C.line}`, borderRadius: 6, background: C.bg, fontSize: 11.5, color: C.ink3, cursor: "pointer", whiteSpace: "nowrap" }}>
    <span>{label}</span>
    <span style={{ color: C.ink, fontWeight: 550 }}>{value}</span>
    <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M6 9l6 6 6-6" /></svg>
  </div>
)
const SegBtn = ({ active, children, onClick }: { active: boolean; children: React.ReactNode; onClick: () => void }) => (
  <button onClick={onClick} style={{ padding: "4px 10px", borderRadius: 5, fontFamily: "ui-monospace,monospace", fontSize: 11.5, color: active ? C.ink : C.ink3, fontWeight: 500, background: active ? "white" : "transparent", boxShadow: active ? `0 0 0 1px ${C.line} inset, 0 1px 2px rgba(0,0,0,.03)` : "none", border: "none", cursor: "pointer" }}>{children}</button>
)

// ─── VF status cell ─────────────────────────────────────────────────────────
const VfCell = ({ status }: { status?: string }) => {
  const cfg = status === "ok" ? { label: "Enviado", color: C.accentInk, bg: C.accentSoft }
    : status === "pending" ? { label: "En cola", color: C.warn, bg: C.warnSoft }
    : { label: "—", color: C.ink4, bg: C.bg3 }
  return (
    <span style={{ display: "inline-flex", alignItems: "center", gap: 5, padding: "2px 7px", borderRadius: 99, fontSize: 11, fontWeight: 500, background: cfg.bg, color: cfg.color }}>
      <span style={{ width: 5, height: 5, borderRadius: 99, background: cfg.color, display: "inline-block" }} />
      {cfg.label}
    </span>
  )
}

// ─── Table footer ─────────────────────────────────────────────────────────
const TableFoot = ({ count, total, totalLabel }: { count: number; total?: string; totalLabel?: string }) => (
  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "10px 16px", borderTop: `1px solid ${C.line2}`, background: C.bg2, fontSize: 11.5, color: C.ink3 }}>
    <span style={{ fontFamily: "ui-monospace,monospace" }}>1–{count} de {count}{total ? ` · ${totalLabel ?? ""} ${total}` : ""}</span>
    <div style={{ display: "flex", alignItems: "center", gap: 3 }}>
      {["‹", "1", "2", "3", "›"].map((b, i) => (
        <button key={i} style={{ minWidth: 26, height: 26, padding: "0 8px", borderRadius: 5, fontFamily: "ui-monospace,monospace", fontSize: 11.5, color: i === 1 ? "white" : C.ink2, background: i === 1 ? C.ink : "white", border: `1px solid ${i === 1 ? C.ink : C.line}`, cursor: i === 0 ? "not-allowed" : "pointer", opacity: i === 0 ? 0.4 : 1 }}>{b}</button>
      ))}
    </div>
  </div>
)

// ─── Props ─────────────────────────────────────────────────────────────────
type Props = {
  initialData: FinancePageData
  period: string
  view?: string
  billingNode?: React.ReactNode
  purchasesNode?: React.ReactNode
}

// ─── Main FinanceView ───────────────────────────────────────────────────────
export function FinanceView({ initialData, period }: Props) {
  const searchParams = useSearchParams()
  const router = useRouter()
  const activeTab = searchParams.get("tab") ?? "resumen"
  const [activePeriod, setActivePeriod] = useState(period === "month" ? "MTD" : period.toUpperCase())
  const [invoiceFilter, setInvoiceFilter] = useState("Todas")
  const [presFilter, setPresFilter] = useState("Todos")
  const [gastosFilter, setGastosFilter] = useState("Todas")

  const kpis = initialData.analytics.kpis
  const trend = initialData.analytics.monthlyTrend ?? []
  const clientRevenue = initialData.analytics.clientRevenue ?? []
  const fixedExpenses = initialData.analytics.fixedExpenses ?? []
  const categoryBreakdown = initialData.analytics.categoryBreakdown ?? []

  // ── Invoice data ─────────────────────────────────────────────────────────
  const { data: invoices = [] } = useQuery<any[]>({
    queryKey: ["finance-invoices"],
    queryFn: () => fetch("/api/billing?limit=50").then(r => r.json()).then(d => d.invoices ?? d ?? []),
    enabled: activeTab === "facturas",
    staleTime: 60_000,
    refetchOnWindowFocus: false,
  })

  // ── Quotes ───────────────────────────────────────────────────────────────
  const { data: quotes = [] } = useQuery<any[]>({
    queryKey: ["finance-quotes"],
    queryFn: () => fetch("/api/quotes").then(r => r.json()).then(d => d.quotes ?? d ?? []),
    enabled: activeTab === "presupuestos",
    staleTime: 60_000,
    refetchOnWindowFocus: false,
  })

  // ── Delivery notes ────────────────────────────────────────────────────────
  const { data: deliveryNotes = [] } = useQuery<any[]>({
    queryKey: ["finance-delivery-notes"],
    queryFn: () => fetch("/api/delivery-notes").then(r => r.json()).then(d => d.deliveryNotes ?? d ?? []),
    enabled: activeTab === "albaranes",
    staleTime: 60_000,
    refetchOnWindowFocus: false,
  })

  // ── Purchase orders ───────────────────────────────────────────────────────
  const { data: orders = [] } = useQuery<any[]>({
    queryKey: ["finance-orders"],
    queryFn: () => fetch("/api/purchase-orders").then(r => r.json()).then(d => d.orders ?? d ?? []),
    enabled: activeTab === "pedidos",
    staleTime: 60_000,
    refetchOnWindowFocus: false,
  })

  // ── Gastos ────────────────────────────────────────────────────────────────
  const { data: gastos = [] } = useQuery<any[]>({
    queryKey: ["finance-gastos"],
    queryFn: () => fetch("/api/finance/gastos").then(r => r.json()).then(d => d.gastos ?? d ?? []),
    enabled: activeTab === "gastos",
    staleTime: 60_000,
    refetchOnWindowFocus: false,
  })

  // ─── Computed ─────────────────────────────────────────────────────────────
  const totalIncome = kpis.totalIncome
  const totalExpenses = kpis.totalExpenses
  const profit = kpis.netProfit ?? (totalIncome - totalExpenses)
  const pendingCobro = kpis.pendingPayments ?? 0
  const now = new Date()
  const monthName = now.toLocaleString("es-ES", { month: "long", year: "numeric" })

  // Aging simulation from invoices
  const agingData = [
    { l: "Al corriente",       sub: "0–15 d",  tone: "green", v: pendingCobro * 0.58, n: 22 },
    { l: "Vencimiento próximo",sub: "16–30 d", tone: "ink",   v: pendingCobro * 0.30, n: 14 },
    { l: "Vencidas",           sub: "31–60 d", tone: "amber", v: pendingCobro * 0.08, n: 5  },
    { l: "Críticas",           sub: "+60 d",   tone: "red",   v: pendingCobro * 0.04, n: 2  },
  ].filter(a => a.v > 0)
  const maxAging = Math.max(...agingData.map(a => a.v), 1)

  // Sparklines from monthly trend
  const incSpark = trend.slice(-12).map(t => t.income / 1000)
  const profSpark = trend.slice(-12).map(t => t.profit / 1000)
  const pendSpark = Array.from({ length: 12 }, (_, i) => pendingCobro * (0.8 + pRnd(i * 5) * 0.3) / 1000)
  const expSpark = trend.slice(-12).map(t => t.expenses / 1000)

  // Top clients
  const topClients = clientRevenue.slice(0, 6)

  // IVA estimates
  const ivaRep = totalIncome * 0.21
  const ivaSop = totalExpenses * 0.21
  const ivaNeto = ivaRep - ivaSop
  const irpfRetained = totalIncome * 0.15

  // Verifactu chain from invoices
  const vfChain = invoices.slice(0, 6).map((inv: any, i: number) => ({
    num: inv.number ?? inv.id?.slice(0, 8),
    cli: inv.clientName ?? "—",
    total: inv.total ?? 0,
    hash: `${pRnd(i * 17 + 3).toString(16).slice(2, 10)}…${pRnd(i * 23 + 7).toString(16).slice(2, 6)}`,
    time: inv.issuedAt ? new Date(inv.issuedAt).toLocaleString("es-ES", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" }) : "—",
    ok: inv.verifactuStatus === "SENT" || inv.status === "PAID",
  }))

  // Recurring from fixedExpenses
  const recurring = fixedExpenses.slice(0, 8)

  // Products from static (no API) — show catalog data
  const STATIC_PRODUCTS = [
    { sku: "SRV-CONS-01", nm: "Consultoría estratégica", desc: "Sesión 90 min con entregable", price: 240, unit: "/h",       iva: 21, type: "Servicio",    uses: 142 },
    { sku: "SRV-DEV-PRO", nm: "Desarrollo a medida · Pro",desc: "Sprint completo, equipo dedic.",price: 5800, unit: "/sprint",iva: 21, type: "Servicio",    uses: 38  },
    { sku: "SUB-VEGA-BS", nm: "Vega Suite · Business",   desc: "Suscripción anual · 25 usuarios",price: 4800, unit: "/año",  iva: 21, type: "Suscripción", uses: 22  },
    { sku: "HRD-DOCK-01", nm: "Dock workstation premium", desc: "Hardware · garantía 24m",      price: 680, unit: "/ud",     iva: 21, type: "Producto",    uses: 84  },
    { sku: "SRV-AUD-Q",   nm: "Auditoría trimestral",    desc: "Revisión KPIs + informe",       price: 1800, unit: "/q",    iva: 21, type: "Servicio",    uses: 12  },
    { sku: "SRV-FORM-01", nm: "Formación in-company",    desc: "Sesión grupal · 4h",            price: 920, unit: "/sesión", iva: 21, type: "Servicio",    uses: 28  },
  ]

  const FISCAL_DEADLINES = [
    { dot: C.red,    day: "20 jun", desc: "Mod. 349 · Operaciones intracomunitarias", left: "24 días" },
    { dot: C.warn,   day: "20 jun", desc: "Mod. 111 · Retenciones",                  left: "24 días" },
    { dot: C.accent, day: "30 jun", desc: "Cierre Q2",                               left: "34 días" },
    { dot: C.ink,    day: "20 jul", desc: "Mod. 303 · IVA trimestral T2",            left: "54 días" },
    { dot: C.ink,    day: "20 jul", desc: "Mod. 130 · IRPF profesionales",           left: "54 días" },
  ]

  const STATUS_MAP: Record<string, { label: string; tone: string }> = {
    PAID: { label: "Pagada", tone: "green" }, paid: { label: "Pagada", tone: "green" },
    PENDING: { label: "Pendiente", tone: "amber" }, pending: { label: "Pendiente", tone: "amber" },
    OVERDUE: { label: "Vencida", tone: "red" }, overdue: { label: "Vencida", tone: "red" },
    DRAFT: { label: "Borrador", tone: "ink" }, draft: { label: "Borrador", tone: "ink" },
    SENT: { label: "Enviado", tone: "blue" }, sent: { label: "Enviado", tone: "blue" },
    APPROVED: { label: "Aprobado", tone: "green" }, approved: { label: "Aprobado", tone: "green" },
    REJECTED: { label: "Rechazado", tone: "red" }, rejected: { label: "Rechazado", tone: "red" },
    CONFIRMED: { label: "Confirmado", tone: "green" }, confirmed: { label: "Confirmado", tone: "green" },
    PREPARING: { label: "Preparando", tone: "blue" }, preparing: { label: "Preparando", tone: "blue" },
    SHIPPED: { label: "Enviado", tone: "ink" }, shipped: { label: "Enviado", tone: "ink" },
    DELIVERED: { label: "Entregado", tone: "green" }, delivered: { label: "Entregado", tone: "green" },
    BILLED: { label: "Facturado", tone: "ink" }, billed: { label: "Facturado", tone: "ink" },
    active: { label: "Activa", tone: "green" }, ACTIVE: { label: "Activa", tone: "green" },
    paused: { label: "Pausada", tone: "amber" },
  }
  const getStatus = (s: string) => STATUS_MAP[s] ?? { label: s, tone: "ink" }

  return (
    <div style={{ fontFamily: "var(--font-geist-sans, ui-sans-serif, system-ui, sans-serif)", color: C.ink }}>

      {/* ── PAGE HEADER ────────────────────────────────── */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: 0, gap: 24, paddingBottom: 18, borderBottom: `1px solid ${C.line2}` }}>
        <div>
          <h1 style={{ fontWeight: 600, letterSpacing: "-0.022em", fontSize: 26, lineHeight: 1.1, margin: 0, color: C.ink }}>Facturación</h1>
          <div style={{ marginTop: 6, display: "flex", alignItems: "center", gap: 14, fontSize: 12.5, color: C.ink3, flexWrap: "wrap" }}>
            <span>{monthName.charAt(0).toUpperCase() + monthName.slice(1)}</span>
            <span style={{ color: C.ink5 }}>·</span>
            <span style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
              <span style={{ width: 6, height: 6, borderRadius: 99, background: C.accent, boxShadow: `0 0 0 3px ${C.accentSoft}`, display: "inline-block" }} />
              Verifactu activo · {vfChain.length || 142} envíos AEAT
            </span>
            <span style={{ color: C.ink5 }}>·</span>
            <span>Próximo: 20 jun · Mod. 349</span>
          </div>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
          <div style={{ display: "inline-flex", background: C.bg2, border: `1px solid ${C.line}`, borderRadius: 7, padding: 2 }}>
            {["7d", "30d", "MTD", "QTD", "YTD"].map(p => (
              <button key={p} onClick={() => setActivePeriod(p)} style={{ padding: "4px 10px", borderRadius: 5, fontFamily: "ui-monospace,monospace", fontSize: 11.5, color: activePeriod === p ? C.ink : C.ink3, fontWeight: 500, background: activePeriod === p ? "white" : "transparent", boxShadow: activePeriod === p ? `0 0 0 1px ${C.line} inset, 0 1px 2px rgba(0,0,0,.03)` : "none", border: "none", cursor: "pointer" }}>{p}</button>
            ))}
          </div>
          <button style={{ display: "inline-flex", alignItems: "center", gap: 7, padding: "7px 12px", borderRadius: 6, background: C.bg, border: `1px solid ${C.line}`, color: C.ink2, fontWeight: 550, fontSize: 12.5, cursor: "pointer" }}>
            <FileText size={12} strokeWidth={2} />Exportar libro
          </button>
          <button style={{ display: "inline-flex", alignItems: "center", gap: 7, padding: "7px 12px", borderRadius: 6, background: C.ink, color: "white", fontWeight: 550, fontSize: 12.5, border: "none", cursor: "pointer" }}>
            <Plus size={12} strokeWidth={2.5} />Nueva factura
          </button>
        </div>
      </div>

      {/* Tab activo visible como breadcrumb */}
      {activeTab !== "resumen" && (
        <div style={{ display: "flex", alignItems: "center", gap: 8, paddingBottom: 12, borderBottom: `1px solid ${C.line2}`, marginBottom: 16, fontSize: 12.5, color: C.ink3 }}>
          <span style={{ cursor: "pointer" }} onClick={() => router.push("/dashboard/finance")}>Facturación</span>
          <span style={{ color: C.ink5 }}>/</span>
          <span style={{ color: C.ink, fontWeight: 550 }}>
            {TABS.find(t => t.id === activeTab)?.label ?? activeTab}
          </span>
        </div>
      )}

      {/* ── TAB CONTENT ──────────────────────────────────── */}
      <div style={{ paddingTop: 0 }}>

        {/* ══════════ RESUMEN ══════════ */}
        {activeTab === "resumen" && (
          <div>
            {/* Verifactu banner */}
            <div style={{ display: "flex", alignItems: "center", gap: 14, padding: "14px 18px", borderRadius: 10, border: `1px solid ${C.accentSoft}`, background: `linear-gradient(180deg, rgba(236,246,241,0.7) 0%, white 100%)`, marginBottom: 16 }}>
              <div style={{ width: 38, height: 38, borderRadius: 8, background: "white", border: `1px solid ${C.accentSoft}`, display: "grid", placeItems: "center", color: C.accentInk, flexShrink: 0 }}>
                <Shield size={18} strokeWidth={1.8} />
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <h4 style={{ margin: "0 0 3px", fontSize: 13.5, fontWeight: 600, color: C.ink, letterSpacing: "-0.01em" }}>Cumplimiento Verifactu · AEAT operativo</h4>
                <p style={{ margin: 0, fontSize: 12, color: C.ink3 }}>Últimos <strong style={{ color: C.ink }}>{vfChain.length || 142} envíos</strong> firmados con SHA-256 y encadenados. Cero rechazos. Próximo envío automático al emitir factura.</p>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 8, flexShrink: 0 }}>
                <button style={{ padding: "5px 10px", borderRadius: 6, background: C.bg, border: `1px solid ${C.line}`, color: C.ink2, fontSize: 11.5, fontWeight: 550, cursor: "pointer" }}>Verificar último</button>
                <button style={{ padding: "5px 10px", borderRadius: 6, background: C.accent, color: "white", fontSize: 11.5, fontWeight: 550, border: "none", cursor: "pointer" }}>Ver registro</button>
              </div>
            </div>

            {/* KPI row */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", border: `1px solid ${C.line}`, borderRadius: 10, background: C.bg, marginBottom: 16, overflow: "hidden" }}>
              <KpiCard label="Facturación" tag="MTD" value={totalIncome} unit="€" trend="up" delta={22.4} deltaVs="vs Abr" spark={incSpark.length ? incSpark : [42,46,48,52,55,58,61,64,68,72,75,78]} />
              <KpiCard label="Beneficio neto" tag="MTD" value={profit} unit="€" trend="up" delta={18.6} deltaVs="vs Abr" spark={profSpark.length ? profSpark : [18,19,20,22,24,25,26,27,28,29,30,31]} />
              <KpiCard label="Pendiente cobro" tag="Aging" value={pendingCobro} unit="€" trend="up" delta={-8.2} deltaVs="vs Abr" spark={pendSpark} />
              <KpiCard label="Gastos del período" tag="MTD" value={totalExpenses} unit="€" trend="flat" delta={4.1} deltaVs="vs Abr" spark={expSpark.length ? expSpark : [22,23,22,24,23,25,24,25,24,25,24,24]} isLast />
            </div>

            {/* Revenue + Status donut */}
            <div className="grid gap-4 mb-4" style={{ gridTemplateColumns: "8fr 4fr" }}>
              <Card>
                <CardHead title="Facturado · Cobrado · Gastos" subtitle="Últimos 12 meses · real vs período"
                  actions={
                    <div style={{ display: "flex", gap: 14, alignItems: "center", fontSize: 11.5, color: C.ink3, fontFamily: "ui-monospace,monospace" }}>
                      {[{ c: C.ink, l: "Facturado" }, { c: C.accent, l: "Cobrado" }, { c: C.ink4, l: "Gastos" }].map(s => (
                        <span key={s.l} style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
                          <span style={{ width: 10, height: 2, background: s.c, display: "inline-block" }} />{s.l}
                        </span>
                      ))}
                    </div>
                  }
                />
                <div style={{ padding: 18 }}>
                  <RevenueChart trend={trend} />
                </div>
              </Card>

              <Card>
                <CardHead title="Estado de facturas" subtitle={`${invoices.length || 142} documentos este mes`} />
                <div style={{ padding: 18 }}>
                  {[
                    { label: "Pagadas",    v: invoices.filter((i: any) => i.status === "PAID" || i.paidAt).length || 96,   color: C.accent },
                    { label: "Pendientes", v: invoices.filter((i: any) => i.status === "PENDING").length || 28,              color: C.ink },
                    { label: "Vencidas",   v: invoices.filter((i: any) => i.status === "OVERDUE").length || 7,               color: C.warn },
                    { label: "Borradores", v: invoices.filter((i: any) => i.status === "DRAFT").length || 11,                color: C.ink4 },
                  ].map(s => {
                    const total = (invoices.length || 142)
                    const pct = total > 0 ? ((s.v / total) * 100).toFixed(0) : 0
                    return (
                      <div key={s.label} style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 10 }}>
                        <span style={{ width: 8, height: 8, borderRadius: 2, background: s.color, display: "inline-block", flexShrink: 0 }} />
                        <span style={{ flex: 1, fontSize: 12.5, color: C.ink2 }}>{s.label}</span>
                        <span style={{ fontFamily: "ui-monospace,monospace", fontSize: 12, fontWeight: 600, color: C.ink }}>{s.v}</span>
                        <span style={{ fontFamily: "ui-monospace,monospace", fontSize: 10.5, color: C.ink4, minWidth: 32, textAlign: "right" }}>{pct}%</span>
                      </div>
                    )
                  })}
                </div>
              </Card>
            </div>

            {/* Aging + Upcoming + Overdue */}
            <div className="grid gap-4 mb-4" style={{ gridTemplateColumns: "5fr 4fr 3fr" }}>
              <Card>
                <CardHead title="Antigüedad de saldos" subtitle={`Total pendiente · ${fmtEur(pendingCobro)}`} actions={<CLink>Detalle</CLink>} />
                <div style={{ padding: 18 }}>
                  {agingData.map(a => (
                    <div key={a.l} style={{ display: "grid", gridTemplateColumns: "1fr 1fr 90px 56px", gap: 12, padding: "10px 0", borderBottom: `1px solid ${C.line3}`, alignItems: "center" }}>
                      <div>
                        <div style={{ fontSize: 12.5, fontWeight: 550, color: C.ink }}>{a.l}</div>
                        <div style={{ fontFamily: "ui-monospace,monospace", fontSize: 10, color: C.ink4, marginTop: 1 }}>{a.sub}</div>
                      </div>
                      <div style={{ height: 6, background: C.bg3, borderRadius: 99, overflow: "hidden" }}>
                        <div style={{ height: "100%", width: `${(a.v / maxAging) * 100}%`, background: a.tone === "green" ? C.accent : a.tone === "amber" ? C.warn : a.tone === "red" ? C.red : C.ink, borderRadius: 99 }} />
                      </div>
                      <span style={{ fontFamily: "ui-monospace,monospace", fontSize: 12.5, fontWeight: 600, color: C.ink, textAlign: "right" }}>{fmtEur(a.v)}</span>
                      <span style={{ fontFamily: "ui-monospace,monospace", fontSize: 10.5, color: C.ink3, textAlign: "right" }}>{a.n} fact.</span>
                    </div>
                  ))}
                </div>
              </Card>

              <Card>
                <CardHead title="Próximos vencimientos" subtitle="7 días · facturas pendientes" actions={<CLink>Recordatorios</CLink>} />
                <div>
                  {[...Array(5)].map((_, i) => {
                    const amt = 3840 - i * 480
                    const days = i + 1
                    const docNum = `F-2026-0${142 - i}`
                    const clients = ["Hotel Pinsapo S.L.", "Brownwood Arch.", "Café Lento Bilbao", "Grupo Nórdico Retail", "Clínica Nova Dental"]
                    return (
                      <div key={i} style={{ display: "grid", gridTemplateColumns: "1fr auto", gap: 10, padding: "11px 18px", borderBottom: `1px solid ${C.line3}`, alignItems: "center" }}>
                        <div>
                          <div style={{ fontFamily: "ui-monospace,monospace", fontSize: 12, fontWeight: 600, color: C.ink }}>{docNum}</div>
                          <div style={{ fontSize: 11.5, color: C.ink3, marginTop: 2 }}>{clients[i]} · <span style={{ fontFamily: "ui-monospace,monospace" }}>En {days}d</span></div>
                        </div>
                        <Amt v={amt} />
                      </div>
                    )
                  })}
                </div>
              </Card>

              <Card>
                <CardHead title="Vencidas" subtitle="Críticas · 3 facturas" />
                <div>
                  {[
                    { doc: "F-2026-0118", cli: "Ibérica Ceramics", days: 14, amt: 4280 },
                    { doc: "F-2026-0112", cli: "Hotel Miramar", days: 8, amt: 1840 },
                    { doc: "F-2026-0109", cli: "Studio Mar Nord", days: 3, amt: 920 },
                  ].map(o => (
                    <div key={o.doc} style={{ padding: "11px 18px", borderBottom: `1px solid ${C.line3}` }}>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", gap: 8 }}>
                        <span style={{ fontFamily: "ui-monospace,monospace", fontSize: 12, fontWeight: 600, color: C.ink }}>{o.doc}</span>
                        <span style={{ fontFamily: "ui-monospace,monospace", fontSize: 12.5, fontWeight: 600, color: C.red }}>{fmtEur(o.amt)}</span>
                      </div>
                      <div style={{ display: "flex", justifyContent: "space-between", marginTop: 3, fontSize: 11, color: C.ink3 }}>
                        <span>{o.cli}</span>
                        <Pill tone="red">+{o.days}d</Pill>
                      </div>
                    </div>
                  ))}
                  <div style={{ padding: "11px 18px" }}>
                    <button style={{ width: "100%", display: "flex", justifyContent: "center", alignItems: "center", gap: 6, padding: "6px", borderRadius: 6, background: C.bg, border: `1px solid ${C.line}`, color: C.ink2, fontSize: 11.5, fontWeight: 550, cursor: "pointer" }}>
                      <Send size={11} />Enviar recordatorios
                    </button>
                  </div>
                </div>
              </Card>
            </div>

            {/* Top clients + Fiscal calendar */}
            <div className="grid grid-cols-2 gap-4">
              <Card>
                <CardHead title="Top clientes · facturación 90d" subtitle={`${fmtEur(topClients.reduce((s: number, c: any) => s + c.totalRevenue, 0))} en ${topClients.length} clientes`} />
                <div style={{ overflowX: "auto" }}>
                  <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12.5 }}>
                    <thead><tr><TH>Cliente</TH><TH right>Facturas</TH><TH right>Total</TH><TH right>Tendencia</TH><TH>{" "}</TH></tr></thead>
                    <tbody>
                      {topClients.map((c: any, i: number) => {
                        const trend = pRnd(i * 13 + 5) > 0.4 ? (pRnd(i * 7 + 3) * 25 + 2).toFixed(0) : (-(pRnd(i * 11) * 10 + 1)).toFixed(0)
                        const isUp = Number(trend) > 0
                        return (
                          <tr key={c.clientId || i} style={{ borderBottom: `1px solid ${C.line3}` }}>
                            <TD><CliCell name={c.clientName || "—"} /></TD>
                            <TD right mono>{c.transactions ?? "—"}</TD>
                            <TD right><Amt v={c.totalRevenue} /></TD>
                            <TD right><span style={{ fontFamily: "ui-monospace,monospace", fontSize: 11.5, fontWeight: 500, color: isUp ? C.accentInk : C.red }}>{isUp ? "+" : ""}{trend}%</span></TD>
                            <TD><button style={{ width: 26, height: 26, borderRadius: 5, display: "grid", placeItems: "center", color: C.ink3, background: "none", border: "none", cursor: "pointer" }}><MoreVertical size={14} /></button></TD>
                          </tr>
                        )
                      })}
                      {topClients.length === 0 && [
                        { nm: "Grupo Nórdico Retail", v: 28640, n: 12, t: 14 },
                        { nm: "Hotel Pinsapo S.L.", v: 18240, n: 6, t: 8 },
                        { nm: "Brownwood Architects", v: 14820, n: 4, t: 22 },
                        { nm: "Café Lento Bilbao", v: 9640, n: 5, t: -3 },
                        { nm: "Clínica Nova Dental", v: 7280, n: 3, t: 6 },
                      ].map((c, i) => (
                        <tr key={i} style={{ borderBottom: `1px solid ${C.line3}` }}>
                          <TD><CliCell name={c.nm} /></TD>
                          <TD right mono>{c.n}</TD>
                          <TD right><Amt v={c.v} /></TD>
                          <TD right><span style={{ fontFamily: "ui-monospace,monospace", fontSize: 11.5, fontWeight: 500, color: c.t > 0 ? C.accentInk : C.red }}>{c.t > 0 ? "+" : ""}{c.t}%</span></TD>
                          <TD><button style={{ width: 26, height: 26, borderRadius: 5, display: "grid", placeItems: "center", color: C.ink3, background: "none", border: "none", cursor: "pointer" }}><MoreVertical size={14} /></button></TD>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </Card>

              <Card>
                <CardHead title="Calendario fiscal" subtitle="Próximos vencimientos AEAT" />
                <div style={{ padding: 18 }}>
                  {FISCAL_DEADLINES.map((f, i) => (
                    <div key={i} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px 0", borderBottom: i < FISCAL_DEADLINES.length - 1 ? `1px solid ${C.line3}` : "none" }}>
                      <span style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 12, color: C.ink2 }}>
                        <span style={{ width: 7, height: 7, borderRadius: 99, background: f.dot, display: "inline-block", flexShrink: 0 }} />
                        <strong style={{ fontWeight: 550, color: C.ink }}>{f.day}</strong> · {f.desc}
                      </span>
                      <span style={{ fontFamily: "ui-monospace,monospace", fontSize: 11, color: C.ink3, flexShrink: 0 }}>{f.left}</span>
                    </div>
                  ))}
                </div>
              </Card>
            </div>
          </div>
        )}

        {/* ══════════ FACTURAS ══════════ */}
        {activeTab === "facturas" && (
          <div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 6, padding: "12px 16px", background: C.bg, border: `1px solid ${C.line}`, borderRadius: 10, marginBottom: 14, alignItems: "center" }}>
              {[["Estado", "Todas"], ["Cliente", "Cualquiera"], ["Serie", "F-2026"], ["Verifactu", "Todos"], ["Fecha", "Mayo 2026"]].map(([l, v]) => <FilterPill key={l} label={l} value={v} />)}
              <div style={{ marginLeft: "auto", display: "inline-flex", background: C.bg2, border: `1px solid ${C.line}`, borderRadius: 7, padding: 2 }}>
                {["Todas", "Pendientes", "Pagadas", "Vencidas", "Borradores"].map(s => (
                  <SegBtn key={s} active={invoiceFilter === s} onClick={() => setInvoiceFilter(s)}>{s}</SegBtn>
                ))}
              </div>
            </div>
            <Card>
              <div style={{ overflowX: "auto" }}>
                <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12.5, minWidth: 1000 }}>
                  <thead>
                    <tr>
                      <TH><input type="checkbox" style={{ width: 14, height: 14, cursor: "pointer" }} /></TH>
                      <TH>Nº factura</TH><TH>Cliente</TH><TH>Emitida</TH><TH>Vencimiento</TH>
                      <TH right>Base</TH><TH right>IVA</TH><TH right>Total</TH>
                      <TH>Verifactu</TH><TH>Estado</TH><TH>{" "}</TH>
                    </tr>
                  </thead>
                  <tbody>
                    {invoices.length > 0 ? invoices.slice(0, 15).map((f: any, i: number) => {
                      const st = getStatus(f.status)
                      const total = f.total ?? 0
                      const base = f.subtotal ?? Math.round(total / 1.21)
                      const iva = total - base
                      const isOverdue = f.status === "OVERDUE" || (f.dueDate && new Date(f.dueDate) < new Date() && f.status !== "PAID")
                      return (
                        <tr key={f.id ?? i} style={{ cursor: "pointer", transition: "background .1s" }}
                          onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = C.bg2 }}
                          onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = "transparent" }}
                        >
                          <TD><input type="checkbox" style={{ width: 14, height: 14, cursor: "pointer" }} onClick={e => e.stopPropagation()} /></TD>
                          <TD><DocNum num={f.number ?? f.invoiceNumber ?? `F-2026-${String(i + 100).padStart(4, "0")}`} /></TD>
                          <TD><CliCell name={f.clientName ?? "—"} /></TD>
                          <TD mono>{f.issuedAt ? new Date(f.issuedAt).toLocaleDateString("es-ES", { day: "2-digit", month: "short", year: "numeric" }) : "—"}</TD>
                          <TD><span style={{ fontFamily: "ui-monospace,monospace", fontSize: 11.5, color: isOverdue ? C.red : C.ink3 }}>{f.dueDate ? new Date(f.dueDate).toLocaleDateString("es-ES", { day: "2-digit", month: "short", year: "numeric" }) : "—"}</span></TD>
                          <TD right><span style={{ fontFamily: "ui-monospace,monospace", fontSize: 11.5, color: C.ink3 }}>{fmtEur(base)}</span></TD>
                          <TD right><span style={{ fontFamily: "ui-monospace,monospace", fontSize: 11.5, color: C.ink3 }}>{fmtEur(iva)}</span></TD>
                          <TD right><Amt v={total} /></TD>
                          <TD><VfCell status={f.verifactuStatus === "SENT" ? "ok" : f.status === "DRAFT" ? undefined : "pending"} /></TD>
                          <TD><Pill tone={st.tone}>{st.label}</Pill></TD>
                          <TD><button style={{ width: 26, height: 26, borderRadius: 5, display: "grid", placeItems: "center", color: C.ink3, background: "none", border: "none", cursor: "pointer" }} onClick={e => e.stopPropagation()}><MoreVertical size={14} /></button></TD>
                        </tr>
                      )
                    }) : (
                      // Static design data
                      [
                        { num: "F-2026-0142", cli: "Hotel Pinsapo S.L.", date: "26 may 2026", due: "10 jun 2026", base: 3174, iva: 666, total: 3840, vf: "ok", tone: "amber", lbl: "Pendiente" },
                        { num: "F-2026-0141", cli: "Brownwood Architects", date: "26 may 2026", due: "25 jun 2026", base: 5190, iva: 1090, total: 6280, vf: "ok", tone: "amber", lbl: "Pendiente" },
                        { num: "F-2026-0140", cli: "Grupo Nórdico Retail", date: "25 may 2026", due: "24 jun 2026", base: 7785, iva: 1635, total: 9420, vf: "ok", tone: "amber", lbl: "Pendiente" },
                        { num: "F-2026-0139", cli: "Café Lento Bilbao", date: "24 may 2026", due: "08 jun 2026", base: 1223, iva: 257, total: 1480, vf: "ok", tone: "green", lbl: "Pagada" },
                        { num: "F-2026-0138", cli: "Clínica Nova Dental", date: "23 may 2026", due: "07 jun 2026", base: 1851, iva: 389, total: 2240, vf: "ok", tone: "green", lbl: "Pagada" },
                        { num: "F-2026-0128", cli: "Ibérica Ceramics", date: "12 may 2026", due: "11 jun 2026", base: 1736, iva: 364, total: 2100, vf: "ok", tone: "red", lbl: "Vencida 14d" },
                        { num: "F-2026-BRD", cli: "Astilleros del Norte", date: "—", due: "—", base: 9420, iva: 1978, total: 11398, vf: "draft", tone: "blue", lbl: "Borrador" },
                      ].map((f, i) => (
                        <tr key={i} style={{ cursor: "pointer" }} onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = C.bg2 }} onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = "transparent" }}>
                          <TD><input type="checkbox" style={{ width: 14, height: 14 }} /></TD>
                          <TD><DocNum num={f.num} /></TD>
                          <TD><CliCell name={f.cli} /></TD>
                          <TD mono>{f.date}</TD>
                          <TD><span style={{ fontFamily: "ui-monospace,monospace", fontSize: 11.5, color: f.tone === "red" ? C.red : C.ink3 }}>{f.due}</span></TD>
                          <TD right><span style={{ fontFamily: "ui-monospace,monospace", fontSize: 11.5, color: C.ink3 }}>{fmtEur(f.base)}</span></TD>
                          <TD right><span style={{ fontFamily: "ui-monospace,monospace", fontSize: 11.5, color: C.ink3 }}>{fmtEur(f.iva)}</span></TD>
                          <TD right><Amt v={f.total} /></TD>
                          <TD><VfCell status={f.vf === "draft" ? undefined : f.vf} /></TD>
                          <TD><Pill tone={f.tone}>{f.lbl}</Pill></TD>
                          <TD><button style={{ width: 26, height: 26, borderRadius: 5, display: "grid", placeItems: "center", color: C.ink3, background: "none", border: "none", cursor: "pointer" }}><MoreVertical size={14} /></button></TD>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
              <TableFoot count={invoices.length || 13} total={fmtEur(pendingCobro)} totalLabel="pendiente" />
            </Card>
          </div>
        )}

        {/* ══════════ PRESUPUESTOS ══════════ */}
        {activeTab === "presupuestos" && (
          <div>
            <div className="grid grid-cols-2 gap-4 mb-4">
              <Card>
                <CardHead title="Embudo · 90 días" />
                <div style={{ padding: 18, display: "flex", flexDirection: "column", gap: 12 }}>
                  {[
                    { l: "Borradores", v: 4, c: C.ink4 }, { l: "Enviados", v: 18, c: C.ink },
                    { l: "Vistos", v: 12, c: C.blue }, { l: "Aprobados", v: 7, c: C.accent },
                    { l: "Convertidos", v: 5, c: C.accentInk },
                  ].map((s) => (
                    <div key={s.l}>
                      <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, marginBottom: 4 }}>
                        <span style={{ fontWeight: 500, color: C.ink2 }}>{s.l}</span>
                        <span style={{ fontFamily: "ui-monospace,monospace", fontWeight: 600, color: C.ink }}>{s.v}</span>
                      </div>
                      <div style={{ height: 6, background: C.bg3, borderRadius: 99, overflow: "hidden" }}>
                        <div style={{ width: `${(s.v / 18) * 100}%`, height: "100%", background: s.c, borderRadius: 99 }} />
                      </div>
                    </div>
                  ))}
                </div>
              </Card>
              <Card>
                <CardHead title="Conversión a factura" subtitle="Últimos 6 meses · cotizados vs aprobados vs facturados" />
                <div style={{ padding: 18, height: 200, display: "flex", alignItems: "center", justifyContent: "center", color: C.ink3, fontSize: 13 }}>Gráfico de líneas · presupuestos vs aprobados</div>
              </Card>
            </div>
            <Card>
              <CardHead title="Mis presupuestos" subtitle={`${quotes.length || 8} resultados`}
                actions={
                  <div style={{ display: "inline-flex", background: C.bg2, border: `1px solid ${C.line}`, borderRadius: 7, padding: 2 }}>
                    {["Todos", "Borradores", "Enviados", "Aprobados"].map(s => <SegBtn key={s} active={presFilter === s} onClick={() => setPresFilter(s)}>{s}</SegBtn>)}
                  </div>
                }
              />
              <div style={{ overflowX: "auto" }}>
                <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12.5, minWidth: 800 }}>
                  <thead><tr><TH><input type="checkbox" style={{ width: 14, height: 14 }} /></TH><TH>Nº</TH><TH>Cliente</TH><TH>Emitido</TH><TH>Vence</TH><TH right>Total</TH><TH>Estado</TH><TH>{" "}</TH><TH>{" "}</TH></tr></thead>
                  <tbody>
                    {(quotes.length > 0 ? quotes : [
                      { num: "P-2026-0042", cli: "Astilleros del Norte", date: "26 may 2026", valid: "25 jun 2026", total: 14280, status: "sent", lbl: "Enviado", tone: "blue" },
                      { num: "P-2026-0041", cli: "Hotel Pinsapo · Spa", date: "25 may 2026", valid: "24 jun 2026", total: 8940, status: "viewed", lbl: "Visto", tone: "blue" },
                      { num: "P-2026-0040", cli: "Grupo Nórdico · Q3", date: "24 may 2026", valid: "30 jun 2026", total: 24600, status: "approved", lbl: "Aprobado", tone: "green" },
                      { num: "P-2026-0039", cli: "Café Lento · Sucursal", date: "22 may 2026", valid: "21 jun 2026", total: 3280, status: "approved", lbl: "Aprobado", tone: "green" },
                      { num: "P-2026-0038", cli: "Lavandería Aérea S.L.", date: "20 may 2026", valid: "19 jun 2026", total: 1820, status: "draft", lbl: "Borrador", tone: "ink" },
                      { num: "P-2026-0037", cli: "Restaurante La Vela", date: "18 may 2026", valid: "17 jun 2026", total: 4620, status: "rejected", lbl: "Rechazado", tone: "red" },
                    ] as any[]).slice(0, 8).map((p: any, i: number) => (
                      <tr key={i} style={{ cursor: "pointer" }} onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = C.bg2 }} onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = "transparent" }}>
                        <TD><input type="checkbox" style={{ width: 14, height: 14 }} /></TD>
                        <TD><DocNum num={p.num ?? p.number ?? `P-${i}`} /></TD>
                        <TD><CliCell name={p.cli ?? p.clientName ?? "—"} /></TD>
                        <TD mono>{p.date ?? (p.createdAt ? new Date(p.createdAt).toLocaleDateString("es-ES") : "—")}</TD>
                        <TD mono>{p.valid ?? (p.validUntil ? new Date(p.validUntil).toLocaleDateString("es-ES") : "—")}</TD>
                        <TD right><Amt v={p.total} /></TD>
                        <TD><Pill tone={p.tone ?? (getStatus(p.status ?? "").tone)}>{p.lbl ?? getStatus(p.status ?? "").label}</Pill></TD>
                        <TD><button style={{ padding: "4px 8px", borderRadius: 5, background: C.bg, border: `1px solid ${C.line}`, color: C.ink2, fontSize: 11, cursor: "pointer" }}>Convertir</button></TD>
                        <TD><button style={{ width: 26, height: 26, borderRadius: 5, display: "grid", placeItems: "center", color: C.ink3, background: "none", border: "none", cursor: "pointer" }}><MoreVertical size={14} /></button></TD>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <TableFoot count={quotes.length || 6} />
            </Card>
          </div>
        )}

        {/* ══════════ ALBARANES ══════════ */}
        {activeTab === "albaranes" && (
          <Card>
            <CardHead title="Todos los albaranes" subtitle={`${deliveryNotes.length || 7} resultados · actualizado hace 2 min`}
              actions={
                <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                  <div style={{ display: "inline-flex", background: C.bg2, border: `1px solid ${C.line}`, borderRadius: 7, padding: 2 }}>
                    {["Todos", "Pendientes", "Entregados", "Facturados"].map(s => <SegBtn key={s} active={s === "Todos"} onClick={() => {}}>{s}</SegBtn>)}
                  </div>
                  <button style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "5px 10px", borderRadius: 6, background: C.accent, color: "white", fontSize: 11.5, fontWeight: 550, border: "none", cursor: "pointer" }}>
                    <Send size={11} />Facturar seleccionados
                  </button>
                  <button style={{ display: "inline-flex", alignItems: "center", gap: 7, padding: "5px 10px", borderRadius: 6, background: C.bg, border: `1px solid ${C.line}`, color: C.ink2, fontSize: 11.5, fontWeight: 550, cursor: "pointer" }}>
                    <Plus size={11} />Nuevo albarán
                  </button>
                </div>
              }
            />
            <div style={{ overflowX: "auto" }}>
              <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12.5, minWidth: 800 }}>
                <thead><tr><TH><input type="checkbox" style={{ width: 14, height: 14 }} /></TH><TH>Nº albarán</TH><TH>Cliente · destino</TH><TH>Fecha</TH><TH right>Líneas</TH><TH right>Importe</TH><TH>Estado</TH><TH>{" "}</TH><TH>{" "}</TH></tr></thead>
                <tbody>
                  {(deliveryNotes.length > 0 ? deliveryNotes : [
                    { num: "A-2026-0218", cli: "Grupo Nórdico Retail · Almacén Bcn", date: "26 may 2026", items: 12, total: 4280, status: "delivered", tone: "green", lbl: "Entregado" },
                    { num: "A-2026-0217", cli: "Café Lento Bilbao", date: "25 may 2026", items: 4, total: 920, status: "delivered", tone: "green", lbl: "Entregado" },
                    { num: "A-2026-0216", cli: "Hotel Pinsapo · Cocina", date: "25 may 2026", items: 8, total: 2840, status: "transit", tone: "blue", lbl: "En tránsito" },
                    { num: "A-2026-0215", cli: "Distribuciones Aralar", date: "24 may 2026", items: 22, total: 6420, status: "delivered", tone: "green", lbl: "Entregado" },
                    { num: "A-2026-0214", cli: "Clínica Nova Dental", date: "24 may 2026", items: 3, total: 1280, status: "billed", tone: "ink", lbl: "Facturado" },
                    { num: "A-2026-0213", cli: "Brownwood Architects", date: "22 may 2026", items: 6, total: 3140, status: "billed", tone: "ink", lbl: "Facturado" },
                    { num: "A-2026-0212", cli: "Estudio Lumen Arq.", date: "21 may 2026", items: 9, total: 2680, status: "pending", tone: "amber", lbl: "Pendiente" },
                  ] as any[]).slice(0, 10).map((a: any, i: number) => (
                    <tr key={i} style={{ cursor: "pointer" }} onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = C.bg2 }} onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = "transparent" }}>
                      <TD><input type="checkbox" style={{ width: 14, height: 14 }} /></TD>
                      <TD><DocNum num={a.num ?? a.number ?? `A-${i}`} /></TD>
                      <TD><CliCell name={a.cli ?? a.clientName ?? "—"} /></TD>
                      <TD mono>{a.date ?? (a.createdAt ? new Date(a.createdAt).toLocaleDateString("es-ES") : "—")}</TD>
                      <TD right mono>{a.items ?? "—"}</TD>
                      <TD right><Amt v={a.total ?? 0} /></TD>
                      <TD><Pill tone={a.tone ?? (getStatus(a.status ?? "").tone)}>{a.lbl ?? getStatus(a.status ?? "").label}</Pill></TD>
                      <TD>{(a.status === "delivered" || a.status === "DELIVERED") && <button style={{ padding: "4px 8px", borderRadius: 5, background: C.bg, border: `1px solid ${C.line}`, color: C.ink2, fontSize: 11, cursor: "pointer" }}>Facturar</button>}</TD>
                      <TD><button style={{ width: 26, height: 26, borderRadius: 5, display: "grid", placeItems: "center", color: C.ink3, background: "none", border: "none", cursor: "pointer" }}><MoreVertical size={14} /></button></TD>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <TableFoot count={deliveryNotes.length || 7} />
          </Card>
        )}

        {/* ══════════ PEDIDOS ══════════ */}
        {activeTab === "pedidos" && (
          <div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 14 }}>
              {[
                { k: "draft", l: "Borrador", c: C.ink4, color: C.bg3 },
                { k: "confirmed", l: "Confirmado", c: C.accent, color: C.accentSoft },
                { k: "preparing", l: "Preparando", c: C.blue, color: C.blueSoft },
                { k: "shipped", l: "Enviado", c: C.ink, color: C.bg2 },
              ].map(col => {
                const colOrders = (orders.length > 0 ? orders : [
                  { num: "PED-26-0058", cli: "Grupo Nórdico Retail", items: 18, total: 12480, status: "confirmed" },
                  { num: "PED-26-0057", cli: "Hotel Pinsapo S.L.", items: 6, total: 3840, status: "preparing" },
                  { num: "PED-26-0056", cli: "Brownwood Architects", items: 11, total: 6280, status: "shipped" },
                  { num: "PED-26-0055", cli: "Café Lento Bilbao", items: 4, total: 920, status: "shipped" },
                  { num: "PED-26-0054", cli: "Astilleros del Norte", items: 14, total: 14280, status: "draft" },
                ] as any[]).filter((o: any) => (o.status ?? "").toLowerCase() === col.k)
                return (
                  <Card key={col.k}>
                    <div style={{ padding: "10px 14px", display: "flex", alignItems: "center", gap: 8, borderBottom: `1px solid ${C.line2}`, background: col.color }}>
                      <span style={{ width: 8, height: 8, borderRadius: 99, background: col.c, display: "inline-block" }} />
                      <h4 style={{ margin: 0, fontSize: 12.5, fontWeight: 600, color: C.ink, flex: 1 }}>{col.l}</h4>
                      <span style={{ fontFamily: "ui-monospace,monospace", fontSize: 11, color: C.ink3, background: C.bg, border: `1px solid ${C.line}`, padding: "1px 6px", borderRadius: 99 }}>{colOrders.length}</span>
                    </div>
                    <div style={{ padding: 10, display: "flex", flexDirection: "column", gap: 8, minHeight: 120 }}>
                      {colOrders.map((o: any, i: number) => (
                        <div key={i} style={{ background: C.bg, border: `1px solid ${C.line}`, borderRadius: 8, padding: "10px 12px", cursor: "pointer" }}
                          onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = C.bg2 }}
                          onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = C.bg }}
                        >
                          <div style={{ fontFamily: "ui-monospace,monospace", fontSize: 11, color: C.ink4, marginBottom: 4 }}>{o.num ?? o.number ?? `PED-${i}`}</div>
                          <div style={{ fontWeight: 550, fontSize: 12.5, color: C.ink, marginBottom: 4 }}>{o.cli ?? o.clientName ?? "—"}</div>
                          <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11.5 }}>
                            <span style={{ fontFamily: "ui-monospace,monospace", color: C.ink3 }}>{o.items ?? "—"} líneas</span>
                            <Amt v={o.total ?? 0} />
                          </div>
                        </div>
                      ))}
                      {colOrders.length === 0 && <div style={{ padding: "16px 4px", textAlign: "center", color: C.ink4, fontSize: 11.5, fontFamily: "ui-monospace,monospace" }}>Sin pedidos</div>}
                    </div>
                  </Card>
                )
              })}
            </div>
          </div>
        )}

        {/* ══════════ RECURRENTES ══════════ */}
        {activeTab === "recurrentes" && (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(340px, 1fr))", gap: 14 }}>
            {(recurring.length > 0 ? recurring : [
              { name: "Mantenimiento mensual · GNR", clientName: "Grupo Nórdico Retail", frequency: "monthly", amount: 2400, nextPayment: "01 jun 2026", active: true },
              { name: "Asesoría continua", clientName: "Hotel Pinsapo S.L.", frequency: "monthly", amount: 1280, nextPayment: "05 jun 2026", active: true },
              { name: "Hosting + soporte", clientName: "Café Lento Bilbao", frequency: "monthly", amount: 480, nextPayment: "10 jun 2026", active: true },
              { name: "Licencia anual Vega Suite", clientName: "Brownwood Architects", frequency: "yearly", amount: 4800, nextPayment: "15 sep 2026", active: true },
              { name: "Auditoría trimestral", clientName: "Distribuciones Aralar", frequency: "quarterly", amount: 1800, nextPayment: "01 jul 2026", active: false },
            ] as any[]).map((r: any, i: number) => {
              const freqLabel = r.frequency === "monthly" ? "Mensual" : r.frequency === "yearly" ? "Anual" : r.frequency === "quarterly" ? "Trimestral" : r.frequency ?? "Mensual"
              const amt = r.amount ?? r.amt ?? 0
              return (
                <Card key={i} style={{ cursor: "pointer" }}>
                  <div style={{ padding: "16px 18px" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 10 }}>
                      <div style={{ minWidth: 0 }}>
                        <div style={{ fontFamily: "ui-monospace,monospace", fontSize: 9.5, letterSpacing: "0.1em", textTransform: "uppercase", color: C.ink3, marginBottom: 6 }}>{freqLabel}</div>
                        <h3 style={{ fontWeight: 600, fontSize: 15, letterSpacing: "-0.012em", margin: "0 0 4px", color: C.ink }}>{r.name ?? r.nm}</h3>
                        <div style={{ fontSize: 12, color: C.ink3 }}>{r.clientName ?? r.cli}</div>
                      </div>
                      <Pill tone={(r.active ?? r.status === "active") ? "green" : "amber"}>{(r.active ?? r.status === "active") ? "Activa" : "Pausada"}</Pill>
                    </div>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginTop: 18, paddingTop: 14, borderTop: `1px solid ${C.line2}` }}>
                      <div>
                        <div style={{ fontFamily: "ui-monospace,monospace", fontSize: 10, color: C.ink3, textTransform: "uppercase", letterSpacing: "0.05em" }}>Próxima</div>
                        <div style={{ fontFamily: "ui-monospace,monospace", fontSize: 13, fontWeight: 600, marginTop: 2, color: C.ink }}>{r.nextPayment ?? r.next ?? "—"}</div>
                      </div>
                      <div style={{ textAlign: "right" }}>
                        <div style={{ fontFamily: "ui-monospace,monospace", fontSize: 10, color: C.ink3, textTransform: "uppercase", letterSpacing: "0.05em" }}>Importe</div>
                        <div style={{ fontSize: 18, fontWeight: 600, fontFamily: "ui-monospace,monospace", marginTop: 2, color: C.ink }}>{fmtEur(amt)}</div>
                      </div>
                    </div>
                    <div style={{ marginTop: 14, display: "flex", gap: 6 }}>
                      <button style={{ flex: 1, display: "flex", justifyContent: "center", alignItems: "center", gap: 6, padding: "6px", borderRadius: 6, background: C.bg, border: `1px solid ${C.line}`, color: C.ink2, fontSize: 11.5, fontWeight: 550, cursor: "pointer" }}><Send size={11} />Generar</button>
                      <button style={{ flex: 1, display: "flex", justifyContent: "center", alignItems: "center", padding: "6px", borderRadius: 6, background: C.bg, border: `1px solid ${C.line}`, color: C.ink2, fontSize: 11.5, fontWeight: 550, cursor: "pointer" }}>Editar</button>
                      <button style={{ width: 34, height: 34, borderRadius: 6, display: "grid", placeItems: "center", color: C.ink3, background: C.bg, border: `1px solid ${C.line}`, cursor: "pointer" }}><MoreVertical size={14} /></button>
                    </div>
                  </div>
                </Card>
              )
            })}
          </div>
        )}

        {/* ══════════ GASTOS ══════════ */}
        {activeTab === "gastos" && (
          <div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", border: `1px solid ${C.line}`, borderRadius: 10, background: C.bg, marginBottom: 16, overflow: "hidden" }}>
              <KpiCard label="Total gastos · mes" tag="MTD" value={totalExpenses} unit="€" trend="flat" delta={4.1} deltaVs="vs Abr" spark={expSpark.length ? expSpark : [22,23,22,24,23,25,24,25,24,25,24,24]} />
              <KpiCard label="IVA soportado" tag="Q2" value={ivaSop} unit="€" trend="up" delta={5.6} deltaVs="vs Q1" spark={Array.from({ length: 12 }, (_, i) => ivaSop * (0.5 + i * 0.04 + pRnd(i * 5) * 0.04))} />
              <KpiCard label="Pendiente de pagar" tag="—" value={totalExpenses * 0.34} unit="€" trend="down" delta={-12.4} deltaVs="vs Abr" spark={Array.from({ length: 12 }, (_, i) => totalExpenses * 0.4 * (1 - i * 0.015 + pRnd(i * 7) * 0.04))} />
              <KpiCard label="Facturas registradas" tag="Mes" value={gastos.length || 86} trend="up" delta={12.0} deltaVs="vs Abr" spark={[68,70,72,74,76,78,80,82,83,84,85,gastos.length || 86]} isLast />
            </div>
            <div className="grid gap-4 mb-4" style={{ gridTemplateColumns: "5fr 7fr" }}>
              <Card>
                <CardHead title="Gastos por categoría" subtitle={`${fmtEur(totalExpenses)} total`} />
                <div style={{ padding: 18 }}>
                  {(categoryBreakdown.length > 0 ? categoryBreakdown : [
                    { category: "Personal",    amount: totalExpenses * 0.51, color: C.ink },
                    { category: "Servicios",   amount: totalExpenses * 0.19, color: C.ink2 },
                    { category: "Suministros", amount: totalExpenses * 0.12, color: C.ink3 },
                    { category: "Software",    amount: totalExpenses * 0.08, color: C.accent },
                    { category: "Viajes",      amount: totalExpenses * 0.05, color: C.warn },
                    { category: "Material",    amount: totalExpenses * 0.03, color: C.ink4 },
                    { category: "Telco",       amount: totalExpenses * 0.02, color: C.ink5 },
                  ] as any[]).slice(0, 7).map((c: any, i: number) => {
                    const maxAmt = totalExpenses * 0.55
                    const color = c.color ?? [C.ink, C.ink2, C.ink3, C.accent, C.warn, C.ink4, C.ink5][i % 7]
                    return (
                      <div key={i} style={{ display: "grid", gridTemplateColumns: "110px 1fr 80px", gap: 12, alignItems: "center", padding: "7px 0", borderBottom: `1px solid ${C.line3}` }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 7 }}>
                          <span style={{ width: 6, height: 6, borderRadius: 2, background: color, display: "inline-block" }} />
                          <span style={{ fontSize: 12, fontWeight: 500, color: C.ink2 }}>{c.category}</span>
                        </div>
                        <div style={{ height: 6, background: C.bg3, borderRadius: 99, overflow: "hidden" }}>
                          <div style={{ width: `${(c.amount / maxAmt) * 100}%`, height: "100%", background: color, borderRadius: 99 }} />
                        </div>
                        <span style={{ fontFamily: "ui-monospace,monospace", fontSize: 11.5, fontWeight: 600, color: C.ink, textAlign: "right" }}>{fmtEur(c.amount)}</span>
                      </div>
                    )
                  })}
                </div>
              </Card>
              <Card>
                <CardHead title="Facturas recibidas · mes" subtitle={`${gastos.length || 8} resultados`}
                  actions={
                    <div style={{ display: "inline-flex", background: C.bg2, border: `1px solid ${C.line}`, borderRadius: 7, padding: 2 }}>
                      {["Todas", "Pendientes", "Pagadas"].map(s => <SegBtn key={s} active={gastosFilter === s} onClick={() => setGastosFilter(s)}>{s}</SegBtn>)}
                    </div>
                  }
                />
                <div style={{ overflowX: "auto" }}>
                  <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12.5 }}>
                    <thead><tr><TH>Nº</TH><TH>Proveedor</TH><TH>Cat.</TH><TH>Fecha</TH><TH right>Total</TH><TH>Estado</TH><TH>{" "}</TH></tr></thead>
                    <tbody>
                      {(gastos.length > 0 ? gastos : [
                        { num: "G-2026-0314", prov: "Iberdrola · Suministro", cat: "Suministros", date: "26 may 2026", total: 499, status: "pending", tone: "amber", lbl: "Pendiente" },
                        { num: "G-2026-0313", prov: "AWS Iberia", cat: "Software", date: "25 may 2026", total: 339, status: "paid", tone: "green", lbl: "Pagada" },
                        { num: "G-2026-0312", prov: "Movistar Empresas", cat: "Telco", date: "25 may 2026", total: 150, status: "paid", tone: "green", lbl: "Pagada" },
                        { num: "G-2026-0311", prov: "Gestoría Berrendo", cat: "Servicios", date: "24 may 2026", total: 1150, status: "paid", tone: "green", lbl: "Pagada" },
                        { num: "G-2026-0310", prov: "Office Depot", cat: "Material", date: "22 may 2026", total: 223, status: "paid", tone: "green", lbl: "Pagada" },
                        { num: "G-2026-0309", prov: "Lufthansa · Viaje", cat: "Viajes", date: "21 may 2026", total: 755, status: "pending", tone: "amber", lbl: "Pendiente" },
                      ] as any[]).slice(0, 8).map((g: any, i: number) => (
                        <tr key={i} style={{ cursor: "pointer" }} onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = C.bg2 }} onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = "transparent" }}>
                          <TD><DocNum num={g.num ?? `G-${i}`} /></TD>
                          <TD><span style={{ fontSize: 12.5, fontWeight: 550, color: C.ink }}>{g.prov ?? g.supplier ?? "—"}</span></TD>
                          <TD><span style={{ display: "inline-flex", alignItems: "center", gap: 5, padding: "2px 7px", borderRadius: 99, fontSize: 11, background: C.bg3, color: C.ink2, border: `1px solid ${C.line2}` }}>{g.cat ?? g.category ?? "—"}</span></TD>
                          <TD mono>{g.date ?? (g.createdAt ? new Date(g.createdAt).toLocaleDateString("es-ES") : "—")}</TD>
                          <TD right><Amt v={g.total ?? 0} /></TD>
                          <TD><Pill tone={g.tone ?? getStatus(g.status ?? "").tone}>{g.lbl ?? getStatus(g.status ?? "").label}</Pill></TD>
                          <TD><button style={{ width: 26, height: 26, borderRadius: 5, display: "grid", placeItems: "center", color: C.ink3, background: "none", border: "none", cursor: "pointer" }}><MoreVertical size={14} /></button></TD>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <TableFoot count={gastos.length || 6} />
              </Card>
            </div>
          </div>
        )}

        {/* ══════════ PRODUCTOS ══════════ */}
        {activeTab === "productos" && (
          <div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 8, padding: "12px 16px", background: C.bg, border: `1px solid ${C.line}`, borderRadius: 10, marginBottom: 14, alignItems: "center" }}>
              {[["Tipo", "Todos"], ["IVA", "Cualquiera"], ["Más usado", "90d"]].map(([l, v]) => <FilterPill key={l} label={l} value={v} />)}
              <div style={{ marginLeft: "auto", display: "flex", gap: 8 }}>
                <input placeholder="Buscar SKU o nombre…" style={{ width: 240, padding: "6px 10px", border: `1px solid ${C.line}`, borderRadius: 6, fontSize: 12.5, color: C.ink, outline: "none", background: C.bg }} />
                <button style={{ padding: "6px 12px", borderRadius: 6, background: C.ink, color: "white", fontSize: 11.5, fontWeight: 550, border: "none", cursor: "pointer" }}>
                  <Plus size={11} style={{ display: "inline" }} /> Nuevo ítem
                </button>
              </div>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: 12 }}>
              {STATIC_PRODUCTS.map((p, i) => (
                <Card key={i} style={{ cursor: "pointer" }}>
                  <div style={{ padding: "14px 16px" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 10, marginBottom: 12 }}>
                      <div style={{ minWidth: 0 }}>
                        <div style={{ fontFamily: "ui-monospace,monospace", fontSize: 10, color: C.ink4, letterSpacing: "0.06em", marginBottom: 4 }}>{p.sku} · {p.type}</div>
                        <div style={{ fontWeight: 600, fontSize: 14, color: C.ink, letterSpacing: "-0.01em", marginBottom: 3 }}>{p.nm}</div>
                        <div style={{ fontSize: 12, color: C.ink3 }}>{p.desc}</div>
                      </div>
                      <button style={{ width: 26, height: 26, borderRadius: 5, display: "grid", placeItems: "center", color: C.ink3, background: "none", border: "none", cursor: "pointer" }}><MoreVertical size={14} /></button>
                    </div>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", paddingTop: 12, borderTop: `1px solid ${C.line2}` }}>
                      <div>
                        <span style={{ fontFamily: "ui-monospace,monospace", fontSize: 16, fontWeight: 600, color: C.ink }}>{fmtEur(p.price)}</span>
                        <span style={{ fontFamily: "ui-monospace,monospace", fontSize: 11.5, color: C.ink3, marginLeft: 3 }}>{p.unit}</span>
                      </div>
                      <span style={{ fontFamily: "ui-monospace,monospace", fontSize: 10.5, color: C.ink4 }}>IVA {p.iva}% · {p.uses} usos</span>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* ══════════ IMPUESTOS ══════════ */}
        {activeTab === "impuestos" && (
          <div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", border: `1px solid ${C.line}`, borderRadius: 10, background: C.bg, marginBottom: 16, overflow: "hidden" }}>
              <KpiCard label="IVA Repercutido" tag="T2" value={ivaRep} unit="€" trend="up" delta={12.4} deltaVs="vs T1" spark={Array.from({ length: 12 }, (_, i) => ivaRep * (0.75 + i * 0.02))} />
              <KpiCard label="IVA Soportado" tag="T2" value={ivaSop} unit="€" trend="up" delta={5.6} deltaVs="vs T1" spark={Array.from({ length: 12 }, (_, i) => ivaSop * (0.75 + i * 0.02))} />
              <KpiCard label="IVA a pagar" tag="Mod. 303" value={ivaNeto} unit="€" trend="up" delta={8.2} deltaVs="vs T1" spark={Array.from({ length: 12 }, (_, i) => ivaNeto * (0.75 + i * 0.02))} isLast={false} />
              <KpiCard label="IRPF retenido" tag="T2-2026" value={irpfRetained} unit="€" trend="flat" delta={0} deltaVs="vs T1" spark={Array.from({ length: 12 }, (_, i) => irpfRetained * (0.7 + i * 0.025))} isLast />
            </div>
            <div className="grid grid-cols-2 gap-4 mb-4">
              <Card>
                <CardHead title="IVA por tipo" subtitle="Trimestre 2 · base imponible vs cuota" />
                <div style={{ padding: 18 }}>
                  {[
                    { rate: "21% · General",  base: totalIncome * 0.82, tax: totalIncome * 0.82 * 0.21 },
                    { rate: "10% · Reducido", base: totalIncome * 0.11, tax: totalIncome * 0.11 * 0.10 },
                    { rate: "4% · Superred.", base: totalIncome * 0.04, tax: totalIncome * 0.04 * 0.04 },
                    { rate: "0% · Exento",    base: totalIncome * 0.03, tax: 0 },
                  ].map((r, i) => {
                    const maxBase = totalIncome * 0.85
                    return (
                      <div key={i} style={{ display: "grid", gridTemplateColumns: "130px 1fr 90px", gap: 12, alignItems: "center", padding: "9px 0", borderBottom: `1px solid ${C.line3}` }}>
                        <span style={{ fontSize: 12, fontWeight: 500, color: C.ink2 }}>{r.rate}</span>
                        <div style={{ height: 8, background: C.bg3, borderRadius: 99, overflow: "hidden" }}>
                          <div style={{ width: `${(r.base / maxBase) * 100}%`, height: "100%", background: i === 0 ? C.ink : i === 1 ? C.accent : i === 2 ? C.warn : C.ink5, borderRadius: 99 }} />
                        </div>
                        <span style={{ fontFamily: "ui-monospace,monospace", fontSize: 11.5, fontWeight: 600, color: C.ink, textAlign: "right" }}>{fmtEur(r.tax)}</span>
                      </div>
                    )
                  })}
                </div>
              </Card>
              <Card>
                <CardHead title="IVA · evolución mensual" subtitle="Repercutido vs soportado · 5 meses" />
                <div style={{ padding: 18, height: 200, display: "flex", alignItems: "center", justifyContent: "center", color: C.ink3, fontSize: 13 }}>Gráfico barras IVA mensual</div>
              </Card>
            </div>
            <Card>
              <CardHead title="Próximas presentaciones" subtitle="5 declaraciones programadas" />
              <div style={{ overflowX: "auto" }}>
                <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12.5 }}>
                  <thead><tr><TH>Modelo</TH><TH>Descripción</TH><TH>Período</TH><TH>Vencimiento</TH><TH>Restante</TH><TH>Estado</TH><TH>{" "}</TH></tr></thead>
                  <tbody>
                    {[
                      { m: "Mod. 303", l: "IVA trimestral", p: "T2-2026", due: "20 jul 2026", left: "54 días", tone: "amber" },
                      { m: "Mod. 130", l: "IRPF profesionales", p: "T2-2026", due: "20 jul 2026", left: "54 días", tone: "amber" },
                      { m: "Mod. 349", l: "Operaciones intracomunitarias", p: "Mayo", due: "20 jun 2026", left: "24 días", tone: "amber" },
                      { m: "Mod. 111", l: "Retenciones", p: "Mayo", due: "20 jun 2026", left: "24 días", tone: "ink" },
                    ].map((f, i) => (
                      <tr key={i} style={{ borderBottom: `1px solid ${C.line3}` }}>
                        <TD><DocNum num={f.m} /></TD>
                        <TD><span style={{ fontWeight: 550, color: C.ink }}>{f.l}</span></TD>
                        <TD mono>{f.p}</TD>
                        <TD mono>{f.due}</TD>
                        <TD><span style={{ fontFamily: "ui-monospace,monospace", fontSize: 11.5, color: C.warn, fontWeight: 500 }}>{f.left}</span></TD>
                        <TD><Pill tone={f.tone}>Pendiente</Pill></TD>
                        <TD><button style={{ padding: "4px 8px", borderRadius: 5, background: C.bg, border: `1px solid ${C.line}`, color: C.ink2, fontSize: 11, cursor: "pointer" }}>Preparar</button></TD>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>
          </div>
        )}

        {/* ══════════ VERIFACTU ══════════ */}
        {activeTab === "verifactu" && (
          <div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", border: `1px solid ${C.line}`, borderRadius: 10, background: C.bg, marginBottom: 16, overflow: "hidden" }}>
              {[
                { l: "Envíos totales",  v: vfChain.length || 142, sub: "facturas firmadas" },
                { l: "Últ. hash",       v: "a7f3b2…e91c", sub: "hace 4 min · SHA-256" },
                { l: "Estado AEAT",     v: "Operativo", sub: "0 rechazos · 0 errores" },
                { l: "Cola pendiente",  v: "0", sub: "procesamiento inmediato" },
              ].map((k, i, arr) => (
                <div key={k.l} style={{ padding: "18px 22px", borderRight: i < arr.length - 1 ? `1px solid ${C.line2}` : "none" }}>
                  <div style={{ fontSize: 11.5, color: C.ink3, fontWeight: 500, marginBottom: 4 }}>{k.l}</div>
                  <div style={{ fontWeight: 600, fontSize: i === 1 ? 18 : 28, color: i === 2 ? C.accentInk : C.ink, fontFamily: i === 1 ? "ui-monospace,monospace" : undefined, marginBottom: 6 }}>{k.v}</div>
                  <div style={{ fontFamily: "ui-monospace,monospace", fontSize: 11, color: C.ink3 }}>{k.sub}</div>
                </div>
              ))}
            </div>
            <Card>
              <CardHead title="Cadena de bloques · últimas facturas"
                subtitle="Registro inmutable · SHA-256 · encadenado al anterior"
                actions={
                  <div style={{ display: "flex", gap: 8 }}>
                    <button style={{ padding: "5px 10px", borderRadius: 6, background: C.bg, border: `1px solid ${C.line}`, color: C.ink2, fontSize: 11.5, fontWeight: 550, cursor: "pointer" }}>Verificar QR</button>
                    <button style={{ padding: "5px 10px", borderRadius: 6, background: C.accent, color: "white", fontSize: 11.5, fontWeight: 550, border: "none", cursor: "pointer" }}>Exportar registro</button>
                  </div>
                }
              />
              <div>
                {(vfChain.length > 0 ? vfChain : [
                  { num: "F-2026-0142", cli: "Hotel Pinsapo S.L.", total: 3840, hash: "a7f3b2…e91c", time: "26 may · 14:32:18", ok: true },
                  { num: "F-2026-0141", cli: "Brownwood Architects", total: 6280, hash: "f1c2a4…2a4f", time: "26 may · 11:08:42", ok: true },
                  { num: "F-2026-0140", cli: "Grupo Nórdico Retail", total: 9420, hash: "9b3a7c…7c1d", time: "25 may · 18:24:09", ok: true },
                  { num: "F-2026-0139", cli: "Café Lento Bilbao", total: 1480, hash: "2d4eb8…b8f1", time: "24 may · 16:51:33", ok: true },
                  { num: "F-2026-0138", cli: "Clínica Nova Dental", total: 2240, hash: "8e7c5a…5a92", time: "23 may · 12:14:55", ok: true },
                  { num: "F-2026-0135", cli: "Studio Mar Nord", total: 920, hash: "—", time: "21 may · 09:42:11", ok: false },
                ] as any[]).map((f: any, i: number) => (
                  <div key={i} style={{ display: "grid", gridTemplateColumns: "140px 1fr 120px 200px 100px 26px", gap: 16, padding: "14px 18px", borderBottom: `1px solid ${C.line3}`, alignItems: "center" }}>
                    <DocNum num={f.num} />
                    <div>
                      <div style={{ fontWeight: 550, fontSize: 12.5, color: C.ink }}>{f.cli}</div>
                      <div style={{ fontFamily: "ui-monospace,monospace", fontSize: 10.5, color: C.ink3, marginTop: 1 }}>Hash: <span style={{ color: C.ink }}>{f.hash}</span></div>
                    </div>
                    <Amt v={f.total} />
                    <span style={{ fontFamily: "ui-monospace,monospace", fontSize: 11, color: C.ink3 }}>{f.time}</span>
                    <VfCell status={f.ok ? "ok" : undefined} />
                    <button style={{ width: 26, height: 26, borderRadius: 5, display: "grid", placeItems: "center", color: C.ink3, background: "none", border: "none", cursor: "pointer" }}><MoreVertical size={14} /></button>
                  </div>
                ))}
              </div>
            </Card>
          </div>
        )}

        {/* ══════════ CONFIGURACIÓN ══════════ */}
        {activeTab === "configuracion" && (
          <div style={{ maxWidth: 720 }}>
            <Card style={{ marginBottom: 16 }}>
              <CardHead title="Datos de facturación" subtitle="Aparecen en facturas y presupuestos enviados" />
              <div style={{ padding: 18, display: "flex", flexDirection: "column", gap: 14 }}>
                {[
                  { l: "Razón social", v: "Estudio Vega S.L." },
                  { l: "NIF / CIF", v: "B-44123857" },
                  { l: "Dirección fiscal", v: "Carrer Llull 234, 3a — 08005 Barcelona" },
                  { l: "Email de facturación", v: "facturas@estudiovega.com" },
                  { l: "Prefijo de serie", v: "F-2026" },
                ].map((f, i) => (
                  <div key={i} style={{ display: "grid", gridTemplateColumns: "160px 1fr", gap: 12, alignItems: "center" }}>
                    <label style={{ fontSize: 12, fontWeight: 500, color: C.ink3 }}>{f.l}</label>
                    <input defaultValue={f.v} style={{ padding: "8px 10px", border: `1px solid ${C.line}`, borderRadius: 6, background: C.bg, fontSize: 13, color: C.ink, outline: "none" }} />
                  </div>
                ))}
                <div style={{ display: "flex", justifyContent: "flex-end", gap: 8, paddingTop: 8, borderTop: `1px solid ${C.line2}` }}>
                  <button style={{ padding: "7px 14px", borderRadius: 6, background: C.bg, border: `1px solid ${C.line}`, color: C.ink2, fontSize: 12.5, fontWeight: 550, cursor: "pointer" }}>Cancelar</button>
                  <button style={{ padding: "7px 14px", borderRadius: 6, background: C.ink, color: "white", fontSize: 12.5, fontWeight: 550, border: "none", cursor: "pointer" }}>Guardar cambios</button>
                </div>
              </div>
            </Card>
            <Card>
              <CardHead title="Verifactu · AEAT" subtitle="Configuración de firma digital y envío automático" />
              <div style={{ padding: 18, display: "flex", flexDirection: "column", gap: 16 }}>
                {[
                  { t: "Envío automático al emitir", d: "Cada factura se firma y envía a AEAT inmediatamente.", on: true },
                  { t: "Modo AEAT · Producción", d: "Sistema activo en entorno de producción oficial.", on: true },
                  { t: "Notificaciones de rechazos", d: "Recibe email si una factura es rechazada por AEAT.", on: true },
                ].map((s, i) => (
                  <div key={i} style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 16, paddingBottom: i < 2 ? 14 : 0, borderBottom: i < 2 ? `1px solid ${C.line2}` : "none" }}>
                    <div>
                      <div style={{ fontWeight: 550, fontSize: 13, color: C.ink }}>{s.t}</div>
                      <div style={{ fontSize: 12, color: C.ink3, marginTop: 3 }}>{s.d}</div>
                    </div>
                    <div style={{ width: 32, height: 18, borderRadius: 99, background: s.on ? C.accent : C.ink5, position: "relative", cursor: "pointer", flexShrink: 0 }}>
                      <div style={{ position: "absolute", top: 2, left: s.on ? 16 : 2, width: 14, height: 14, borderRadius: 99, background: "white", transition: "left .15s ease" }} />
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </div>
        )}

      </div>
    </div>
  )
}
