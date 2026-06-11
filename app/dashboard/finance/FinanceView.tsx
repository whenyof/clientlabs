/* eslint-disable @typescript-eslint/no-explicit-any */
"use client"

import { useEffect } from "react"
import { useId } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import { useQuery } from "@tanstack/react-query"
import {
  Plus, FileText, ArrowUpRight, ArrowDownRight, Minus,
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
}

const fmtN = (n: number) => new Intl.NumberFormat("es-ES").format(Math.round(n))
const fmtEur = (n: number) =>
  n >= 1_000_000 ? `${(n / 1_000_000).toFixed(1).replace(".", ",")}M €`
  : n >= 1_000 ? `${(n / 1_000).toFixed(n % 1_000 === 0 ? 0 : 1).replace(".", ",")}k €`
  : `${fmtN(n)} €`

// ─── Legacy tab → real page mapping ─────────────────────────────────────────
// The old design rendered every finance area as a mock tab here. The real,
// functional pages live under /dashboard/finance/*; legacy ?tab= links redirect.
const TAB_ROUTES: Record<string, string> = {
  facturas: "/dashboard/finance/invoicing",
  presupuestos: "/dashboard/finance/presupuestos",
  albaranes: "/dashboard/finance/albaranes",
  pedidos: "/dashboard/finance/pedidos",
  gastos: "/dashboard/finance/gastos",
  productos: "/dashboard/finance/productos",
  impuestos: "/dashboard/finance/trimestral",
  verifactu: "/dashboard/settings?section=verifactu",
  configuracion: "/dashboard/finance/configuracion",
}

// ─── Sparkline ─────────────────────────────────────────────────────────────
function Sparkline({ data, color = C.ink }: { data: number[]; color?: string }) {
  const uid = useId().replace(/:/g, "s")
  if (data.length < 2) return null
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

// ─── KPI Card (delta/spark optional — only rendered with real data) ────────
function KpiCard({ label, tag, value, unit, delta, deltaVs, spark, isLast }: {
  label: string; tag: string; value: number; unit?: string
  delta?: number | null; deltaVs?: string; spark?: number[]; isLast?: boolean
}) {
  const trend = delta == null ? null : delta > 0.05 ? "up" : delta < -0.05 ? "down" : "flat"
  const dc = trend === "up" ? C.accentInk : trend === "down" ? C.red : C.ink3
  const fmt = unit === "€" ? fmtEur(value) : unit === "%" ? value.toFixed(1).replace(".", ",") : fmtN(value)
  const hasFooter = trend !== null || (spark && spark.length > 1)
  return (
    <div style={{ padding: "18px 22px", borderRight: isLast ? "none" : `1px solid ${C.line2}`, display: "flex", flexDirection: "column", gap: 4 }}>
      <div style={{ fontSize: 11.5, color: C.ink3, fontWeight: 500, display: "flex", alignItems: "center", gap: 6 }}>
        {label}
        <span style={{ fontFamily: "ui-monospace,monospace", fontSize: 9, padding: "1px 5px", borderRadius: 3, background: C.bg3, color: C.ink3, letterSpacing: "0.04em", textTransform: "uppercase" }}>{tag}</span>
      </div>
      <div style={{ fontWeight: 600, letterSpacing: "-0.028em", fontSize: 28, lineHeight: 1.1, marginTop: 4, fontVariantNumeric: "tabular-nums", color: C.ink }}>
        {fmt}{unit && unit !== "€" && <span style={{ color: C.ink3, fontWeight: 500, fontSize: 18, marginLeft: 2 }}>{unit}</span>}
      </div>
      {hasFooter && (
        <div style={{ marginTop: 10, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          {trend !== null ? (
            <span style={{ display: "inline-flex", alignItems: "center", gap: 4, fontFamily: "ui-monospace,monospace", fontSize: 11.5, fontWeight: 500, color: dc }}>
              {trend === "up" ? <ArrowUpRight size={11} strokeWidth={2.4} /> : trend === "down" ? <ArrowDownRight size={11} strokeWidth={2.4} /> : <Minus size={11} strokeWidth={2.4} />}
              {delta! > 0 ? "+" : ""}{delta!.toFixed(1)}%
              {deltaVs && <span style={{ color: C.ink4, marginLeft: 4, fontWeight: 450 }}>{deltaVs}</span>}
            </span>
          ) : <span />}
          {spark && spark.length > 1 && <Sparkline data={spark} color={trend === "down" ? C.ink3 : C.ink} />}
        </div>
      )}
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
const CliCell = ({ name }: { name: string }) => {
  const initials = name.split(" ").slice(0, 2).map(w => w[0] ?? "").join("").toUpperCase()
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
      <div style={{ width: 26, height: 26, borderRadius: 5, background: C.bg3, border: `1px solid ${C.line2}`, display: "grid", placeItems: "center", fontWeight: 600, fontSize: 10, color: C.ink, flexShrink: 0 }}>{initials}</div>
      <div style={{ fontWeight: 550, color: C.ink, letterSpacing: "-0.005em" }}>{name}</div>
    </div>
  )
}

// ─── Spain statutory tax deadlines (public AEAT calendar, days computed live) ─
function getFiscalDeadlines(now: Date) {
  const y = now.getFullYear()
  const all = [
    { date: new Date(y, 0, 30), desc: "Mod. 303 · IVA T4 año anterior" },
    { date: new Date(y, 0, 30), desc: "Mod. 130 · IRPF T4 año anterior" },
    { date: new Date(y, 3, 20), desc: "Mod. 303 · IVA trimestral T1" },
    { date: new Date(y, 3, 20), desc: "Mod. 130 · IRPF profesionales T1" },
    { date: new Date(y, 6, 20), desc: "Mod. 303 · IVA trimestral T2" },
    { date: new Date(y, 6, 20), desc: "Mod. 130 · IRPF profesionales T2" },
    { date: new Date(y, 9, 20), desc: "Mod. 303 · IVA trimestral T3" },
    { date: new Date(y, 9, 20), desc: "Mod. 130 · IRPF profesionales T3" },
    { date: new Date(y + 1, 0, 30), desc: "Mod. 303 · IVA trimestral T4" },
  ]
  return all
    .map(d => ({ ...d, daysLeft: Math.ceil((d.date.getTime() - now.getTime()) / 86_400_000) }))
    .filter(d => d.daysLeft >= 0)
    .slice(0, 5)
}

// ─── Aging bucket labels ────────────────────────────────────────────────────
const AGING_LABELS: Record<string, { l: string; sub: string; tone: string }> = {
  "current": { l: "Al corriente",        sub: "no vencidas", tone: "green" },
  "0-30":    { l: "Vencidas",            sub: "0–30 d",      tone: "ink" },
  "31-60":   { l: "Vencidas",            sub: "31–60 d",     tone: "amber" },
  "61-90":   { l: "Vencidas",            sub: "61–90 d",     tone: "red" },
  "90+":     { l: "Críticas",            sub: "+90 d",       tone: "red" },
}

// ─── Period selector mapping (URL param ↔ label) ───────────────────────────
const PERIODS = [
  { label: "7d",  param: "week" },
  { label: "MTD", param: "month" },
  { label: "QTD", param: "quarter" },
  { label: "YTD", param: "year" },
]

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
  const legacyRoute = TAB_ROUTES[activeTab]

  // Legacy ?tab= deep links → real functional pages
  useEffect(() => {
    if (legacyRoute) router.replace(legacyRoute)
  }, [legacyRoute, router])

  const kpis = initialData.analytics.kpis
  const trends = initialData.analytics.trends
  const trend = initialData.analytics.monthlyTrend ?? []
  const clientRevenue = initialData.analytics.clientRevenue ?? []
  const fixedExpenses = initialData.analytics.fixedExpenses ?? []

  // ── Real invoices (summary cards on resumen) ─────────────────────────────
  const { data: invoices = [], isLoading: invoicesLoading } = useQuery<any[]>({
    queryKey: ["finance-invoices"],
    queryFn: () => fetch("/api/billing?limit=50").then(r => r.json()).then(d => d.invoices ?? []),
    enabled: activeTab === "resumen",
    staleTime: 60_000,
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    retry: 0,
  })

  // ── Real aging report ─────────────────────────────────────────────────────
  const { data: aging } = useQuery<{ buckets: { label: string; amount: number; count: number }[]; totalOutstanding: number }>({
    queryKey: ["finance-aging"],
    queryFn: () => fetch("/api/invoicing/aging").then(r => r.json()),
    enabled: activeTab === "resumen",
    staleTime: 60_000,
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    retry: 0,
  })

  // ─── Computed (all from real data) ────────────────────────────────────────
  const totalIncome = kpis.totalIncome
  const totalExpenses = kpis.totalExpenses
  const profit = kpis.netProfit ?? (totalIncome - totalExpenses)
  const pendingCobro = kpis.pendingPayments ?? 0
  const now = new Date()
  const monthName = now.toLocaleString("es-ES", { month: "long", year: "numeric" })

  const customerInvoices = invoices.filter((i: any) => i.type !== "VENDOR")
  const statusCounts = {
    paid: customerInvoices.filter((i: any) => i.status === "PAID").length,
    pending: customerInvoices.filter((i: any) => i.status === "SENT" || i.status === "VIEWED").length,
    overdue: customerInvoices.filter((i: any) => i.status === "OVERDUE").length,
    draft: customerInvoices.filter((i: any) => i.status === "DRAFT").length,
  }
  const invoiceTotal = customerInvoices.length

  const remaining = (inv: any) => {
    const paid = (inv.payments ?? []).reduce((s: number, p: any) => s + (p.amount ?? 0), 0)
    return Math.max(0, (inv.total ?? 0) - paid)
  }
  const inDays = (d: string | Date) => Math.ceil((new Date(d).getTime() - now.getTime()) / 86_400_000)

  const upcoming = customerInvoices
    .filter((i: any) => (i.status === "SENT" || i.status === "VIEWED") && i.dueDate && inDays(i.dueDate) >= 0 && inDays(i.dueDate) <= 7)
    .sort((a: any, b: any) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime())
    .slice(0, 5)

  const overdue = customerInvoices
    .filter((i: any) => i.status === "OVERDUE")
    .sort((a: any, b: any) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime())
    .slice(0, 3)

  const agingBuckets = (aging?.buckets ?? []).filter(b => b.count > 0)
  const maxAging = Math.max(...agingBuckets.map(b => b.amount), 1)

  const incSpark = trend.slice(-12).map(t => t.income / 1000)
  const profSpark = trend.slice(-12).map(t => t.profit / 1000)
  const expSpark = trend.slice(-12).map(t => t.expenses / 1000)

  const topClients = clientRevenue.slice(0, 6)
  const fiscalDeadlines = getFiscalDeadlines(now)
  const activePeriodLabel = PERIODS.find(p => p.param === period)?.label ?? "MTD"

  // While redirecting a legacy tab, render a lightweight placeholder
  if (legacyRoute) {
    return <div style={{ padding: 24, color: C.ink3, fontSize: 13 }}>Redirigiendo…</div>
  }

  return (
    <div style={{ fontFamily: "var(--font-geist-sans, ui-sans-serif, system-ui, sans-serif)", color: C.ink }}>

      {/* ── PAGE HEADER ────────────────────────────────── */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: 16, gap: 24, paddingBottom: 18, borderBottom: `1px solid ${C.line2}` }}>
        <div>
          <h1 style={{ fontWeight: 600, letterSpacing: "-0.022em", fontSize: 26, lineHeight: 1.1, margin: 0, color: C.ink }}>Facturación</h1>
          <div style={{ marginTop: 6, display: "flex", alignItems: "center", gap: 14, fontSize: 12.5, color: C.ink3, flexWrap: "wrap" }}>
            <span>{monthName.charAt(0).toUpperCase() + monthName.slice(1)}</span>
            {fiscalDeadlines.length > 0 && (
              <>
                <span style={{ color: C.ink5 }}>·</span>
                <span>Próximo plazo AEAT: {fiscalDeadlines[0].date.toLocaleDateString("es-ES", { day: "2-digit", month: "short" })}</span>
              </>
            )}
          </div>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
          <div style={{ display: "inline-flex", background: C.bg2, border: `1px solid ${C.line}`, borderRadius: 7, padding: 2 }}>
            {PERIODS.map(p => (
              <button key={p.label} onClick={() => router.push(`/dashboard/finance?period=${p.param}`)} style={{ padding: "4px 10px", borderRadius: 5, fontFamily: "ui-monospace,monospace", fontSize: 11.5, color: activePeriodLabel === p.label ? C.ink : C.ink3, fontWeight: 500, background: activePeriodLabel === p.label ? "white" : "transparent", boxShadow: activePeriodLabel === p.label ? `0 0 0 1px ${C.line} inset, 0 1px 2px rgba(0,0,0,.03)` : "none", border: "none", cursor: "pointer" }}>{p.label}</button>
            ))}
          </div>
          <a href={`/api/finance/export?period=${period}`} download style={{ display: "inline-flex", alignItems: "center", gap: 7, padding: "7px 12px", borderRadius: 6, background: C.bg, border: `1px solid ${C.line}`, color: C.ink2, fontWeight: 550, fontSize: 12.5, cursor: "pointer", textDecoration: "none" }}>
            <FileText size={12} strokeWidth={2} />Exportar libro
          </a>
          <button onClick={() => router.push("/dashboard/finance/invoicing")} style={{ display: "inline-flex", alignItems: "center", gap: 7, padding: "7px 12px", borderRadius: 6, background: C.ink, color: "white", fontWeight: 550, fontSize: 12.5, border: "none", cursor: "pointer" }}>
            <Plus size={12} strokeWidth={2.5} />Nueva factura
          </button>
        </div>
      </div>

      {/* ── TAB CONTENT ──────────────────────────────────── */}
      <div>

        {/* ══════════ RESUMEN ══════════ */}
        {activeTab === "resumen" && (
          <div>
            {/* KPI row — server-computed values and period-over-period deltas */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", border: `1px solid ${C.line}`, borderRadius: 10, background: C.bg, marginBottom: 16, overflow: "hidden" }}>
              <KpiCard label="Facturación" tag={activePeriodLabel} value={totalIncome} unit="€" delta={trends?.incomeGrowth ?? null} deltaVs="vs ant." spark={incSpark} />
              <KpiCard label="Beneficio neto" tag={activePeriodLabel} value={profit} unit="€" delta={trends?.profitGrowth ?? null} deltaVs="vs ant." spark={profSpark} />
              <KpiCard label="Pendiente cobro" tag="Total" value={pendingCobro} unit="€" />
              <KpiCard label="Gastos del período" tag={activePeriodLabel} value={totalExpenses} unit="€" delta={trends?.expenseGrowth ?? null} deltaVs="vs ant." spark={expSpark} isLast />
            </div>

            {/* Revenue + Status */}
            <div className="grid gap-4 mb-4" style={{ gridTemplateColumns: "8fr 4fr" }}>
              <Card>
                <CardHead title="Facturado · Beneficio · Gastos" subtitle="Últimos 12 meses"
                  actions={
                    <div style={{ display: "flex", gap: 14, alignItems: "center", fontSize: 11.5, color: C.ink3, fontFamily: "ui-monospace,monospace" }}>
                      {[{ c: C.ink, l: "Facturado" }, { c: C.accent, l: "Beneficio" }, { c: C.ink4, l: "Gastos" }].map(s => (
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
                <CardHead title="Estado de facturas" subtitle={invoicesLoading ? "Cargando…" : `${invoiceTotal} facturas de cliente`} />
                <div style={{ padding: 18 }}>
                  {invoiceTotal === 0 ? (
                    <div style={{ textAlign: "center", color: C.ink3, fontSize: 12.5, padding: "24px 0" }}>
                      {invoicesLoading ? "Cargando…" : "Sin facturas todavía"}
                    </div>
                  ) : (
                    [
                      { label: "Pagadas",    v: statusCounts.paid,    color: C.accent },
                      { label: "Pendientes", v: statusCounts.pending, color: C.ink },
                      { label: "Vencidas",   v: statusCounts.overdue, color: C.warn },
                      { label: "Borradores", v: statusCounts.draft,   color: C.ink4 },
                    ].map(s => {
                      const pct = invoiceTotal > 0 ? ((s.v / invoiceTotal) * 100).toFixed(0) : "0"
                      return (
                        <div key={s.label} style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 10 }}>
                          <span style={{ width: 8, height: 8, borderRadius: 2, background: s.color, display: "inline-block", flexShrink: 0 }} />
                          <span style={{ flex: 1, fontSize: 12.5, color: C.ink2 }}>{s.label}</span>
                          <span style={{ fontFamily: "ui-monospace,monospace", fontSize: 12, fontWeight: 600, color: C.ink }}>{s.v}</span>
                          <span style={{ fontFamily: "ui-monospace,monospace", fontSize: 10.5, color: C.ink4, minWidth: 32, textAlign: "right" }}>{pct}%</span>
                        </div>
                      )
                    })
                  )}
                </div>
              </Card>
            </div>

            {/* Aging + Upcoming + Overdue */}
            <div className="grid gap-4 mb-4" style={{ gridTemplateColumns: "5fr 4fr 3fr" }}>
              <Card>
                <CardHead title="Antigüedad de saldos" subtitle={aging ? `Total pendiente · ${fmtEur(aging.totalOutstanding ?? 0)}` : "Cargando…"} />
                <div style={{ padding: 18 }}>
                  {agingBuckets.length === 0 ? (
                    <div style={{ textAlign: "center", color: C.ink3, fontSize: 12.5, padding: "24px 0" }}>Sin facturas pendientes de cobro</div>
                  ) : agingBuckets.map(b => {
                    const meta = AGING_LABELS[b.label] ?? { l: b.label, sub: "", tone: "ink" }
                    return (
                      <div key={b.label} style={{ display: "grid", gridTemplateColumns: "1fr 1fr 90px 56px", gap: 12, padding: "10px 0", borderBottom: `1px solid ${C.line3}`, alignItems: "center" }}>
                        <div>
                          <div style={{ fontSize: 12.5, fontWeight: 550, color: C.ink }}>{meta.l}</div>
                          <div style={{ fontFamily: "ui-monospace,monospace", fontSize: 10, color: C.ink4, marginTop: 1 }}>{meta.sub}</div>
                        </div>
                        <div style={{ height: 6, background: C.bg3, borderRadius: 99, overflow: "hidden" }}>
                          <div style={{ height: "100%", width: `${(b.amount / maxAging) * 100}%`, background: meta.tone === "green" ? C.accent : meta.tone === "amber" ? C.warn : meta.tone === "red" ? C.red : C.ink, borderRadius: 99 }} />
                        </div>
                        <span style={{ fontFamily: "ui-monospace,monospace", fontSize: 12.5, fontWeight: 600, color: C.ink, textAlign: "right" }}>{fmtEur(b.amount)}</span>
                        <span style={{ fontFamily: "ui-monospace,monospace", fontSize: 10.5, color: C.ink3, textAlign: "right" }}>{b.count} fact.</span>
                      </div>
                    )
                  })}
                </div>
              </Card>

              <Card>
                <CardHead title="Próximos vencimientos" subtitle="7 días · facturas pendientes" />
                <div>
                  {upcoming.length === 0 ? (
                    <div style={{ padding: "24px 18px", textAlign: "center", color: C.ink3, fontSize: 12.5 }}>Sin vencimientos próximos</div>
                  ) : upcoming.map((inv: any) => (
                    <div key={inv.id} style={{ display: "grid", gridTemplateColumns: "1fr auto", gap: 10, padding: "11px 18px", borderBottom: `1px solid ${C.line3}`, alignItems: "center", cursor: "pointer" }}
                      onClick={() => router.push(`/dashboard/finance/invoicing/${inv.id}`)}
                    >
                      <div>
                        <div style={{ fontFamily: "ui-monospace,monospace", fontSize: 12, fontWeight: 600, color: C.ink }}>{inv.number}</div>
                        <div style={{ fontSize: 11.5, color: C.ink3, marginTop: 2 }}>{inv.Client?.name ?? "—"} · <span style={{ fontFamily: "ui-monospace,monospace" }}>En {inDays(inv.dueDate)}d</span></div>
                      </div>
                      <Amt v={remaining(inv)} />
                    </div>
                  ))}
                </div>
              </Card>

              <Card>
                <CardHead title="Vencidas" subtitle={`${statusCounts.overdue} facturas`} />
                <div>
                  {overdue.length === 0 ? (
                    <div style={{ padding: "24px 18px", textAlign: "center", color: C.ink3, fontSize: 12.5 }}>Sin facturas vencidas</div>
                  ) : overdue.map((inv: any) => (
                    <div key={inv.id} style={{ padding: "11px 18px", borderBottom: `1px solid ${C.line3}`, cursor: "pointer" }}
                      onClick={() => router.push(`/dashboard/finance/invoicing/${inv.id}`)}
                    >
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", gap: 8 }}>
                        <span style={{ fontFamily: "ui-monospace,monospace", fontSize: 12, fontWeight: 600, color: C.ink }}>{inv.number}</span>
                        <span style={{ fontFamily: "ui-monospace,monospace", fontSize: 12.5, fontWeight: 600, color: C.red }}>{fmtEur(remaining(inv))}</span>
                      </div>
                      <div style={{ display: "flex", justifyContent: "space-between", marginTop: 3, fontSize: 11, color: C.ink3 }}>
                        <span>{inv.Client?.name ?? "—"}</span>
                        <Pill tone="red">+{Math.abs(inDays(inv.dueDate))}d</Pill>
                      </div>
                    </div>
                  ))}
                </div>
              </Card>
            </div>

            {/* Top clients + Fiscal calendar */}
            <div className="grid grid-cols-2 gap-4">
              <Card>
                <CardHead title="Top clientes · facturación" subtitle={topClients.length > 0 ? `${fmtEur(topClients.reduce((s: number, c: any) => s + c.totalRevenue, 0))} en ${topClients.length} clientes` : undefined} />
                <div style={{ overflowX: "auto" }}>
                  {topClients.length === 0 ? (
                    <div style={{ padding: "24px 18px", textAlign: "center", color: C.ink3, fontSize: 12.5 }}>Sin facturación por cliente todavía</div>
                  ) : (
                    <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12.5 }}>
                      <thead><tr><TH>Cliente</TH><TH right>Operaciones</TH><TH right>Total</TH></tr></thead>
                      <tbody>
                        {topClients.map((c: any, i: number) => (
                          <tr key={c.clientId || i} style={{ borderBottom: `1px solid ${C.line3}` }}>
                            <TD><CliCell name={c.clientName || "—"} /></TD>
                            <TD right mono>{c.transactions ?? "—"}</TD>
                            <TD right><Amt v={c.totalRevenue} /></TD>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  )}
                </div>
              </Card>

              <Card>
                <CardHead title="Calendario fiscal" subtitle="Plazos AEAT · calendario oficial" />
                <div style={{ padding: 18 }}>
                  {fiscalDeadlines.map((f, i) => (
                    <div key={i} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px 0", borderBottom: i < fiscalDeadlines.length - 1 ? `1px solid ${C.line3}` : "none" }}>
                      <span style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 12, color: C.ink2 }}>
                        <span style={{ width: 7, height: 7, borderRadius: 99, background: f.daysLeft <= 15 ? C.red : f.daysLeft <= 30 ? C.warn : C.ink, display: "inline-block", flexShrink: 0 }} />
                        <strong style={{ fontWeight: 550, color: C.ink }}>{f.date.toLocaleDateString("es-ES", { day: "2-digit", month: "short" })}</strong> · {f.desc}
                      </span>
                      <span style={{ fontFamily: "ui-monospace,monospace", fontSize: 11, color: C.ink3, flexShrink: 0 }}>{f.daysLeft} días</span>
                    </div>
                  ))}
                </div>
              </Card>
            </div>
          </div>
        )}

        {/* ══════════ RECURRENTES (real fixed expenses) ══════════ */}
        {activeTab === "recurrentes" && (
          fixedExpenses.length === 0 ? (
            <Card>
              <div style={{ padding: "48px 24px", textAlign: "center", color: C.ink3, fontSize: 13 }}>
                No hay gastos o ingresos recurrentes configurados todavía
              </div>
            </Card>
          ) : (
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(340px, 1fr))", gap: 14 }}>
              {fixedExpenses.map((r) => {
                const freqLabel = r.frequency === "monthly" ? "Mensual" : r.frequency === "yearly" ? "Anual" : r.frequency === "quarterly" ? "Trimestral" : r.frequency
                return (
                  <Card key={r.id}>
                    <div style={{ padding: "16px 18px" }}>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 10 }}>
                        <div style={{ minWidth: 0 }}>
                          <div style={{ fontFamily: "ui-monospace,monospace", fontSize: 9.5, letterSpacing: "0.1em", textTransform: "uppercase", color: C.ink3, marginBottom: 6 }}>{freqLabel}</div>
                          <h3 style={{ fontWeight: 600, fontSize: 15, letterSpacing: "-0.012em", margin: "0 0 4px", color: C.ink }}>{r.name}</h3>
                        </div>
                        <Pill tone={r.active ? "green" : "amber"}>{r.active ? "Activa" : "Pausada"}</Pill>
                      </div>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginTop: 18, paddingTop: 14, borderTop: `1px solid ${C.line2}` }}>
                        <div>
                          <div style={{ fontFamily: "ui-monospace,monospace", fontSize: 10, color: C.ink3, textTransform: "uppercase", letterSpacing: "0.05em" }}>Próxima</div>
                          <div style={{ fontFamily: "ui-monospace,monospace", fontSize: 13, fontWeight: 600, marginTop: 2, color: C.ink }}>
                            {r.nextPayment ? new Date(r.nextPayment).toLocaleDateString("es-ES", { day: "2-digit", month: "short", year: "numeric" }) : "—"}
                          </div>
                        </div>
                        <div style={{ textAlign: "right" }}>
                          <div style={{ fontFamily: "ui-monospace,monospace", fontSize: 10, color: C.ink3, textTransform: "uppercase", letterSpacing: "0.05em" }}>Importe</div>
                          <div style={{ fontSize: 18, fontWeight: 600, fontFamily: "ui-monospace,monospace", marginTop: 2, color: C.ink }}>{fmtEur(r.amount)}</div>
                        </div>
                      </div>
                    </div>
                  </Card>
                )
              })}
            </div>
          )
        )}

      </div>
    </div>
  )
}
