"use client"

import { useState, useId } from "react"
import { useRouter } from "next/navigation"
import {
  Plus, Download,
  MoreVertical, ArrowUpRight, ArrowDownRight, Minus,
  List, LayoutGrid,
} from "lucide-react"
import { CreateProviderDialog } from "./CreateProviderDialog"
import { ProvidersKanbanView } from "./ProvidersKanbanView"
import { ListHeader } from "@/components/list/ListHeader"

// ─── Design tokens ────────────────────────────────────────────────────────
const C = {
  bg: "#ffffff", bg2: "#fafafa", bg3: "#f5f5f5",
  ink: "#0a0a0a", ink2: "#404040", ink3: "#737373", ink4: "#a3a3a3", ink5: "#d4d4d4",
  line: "#e8e8e8", line2: "#eeeeee", line3: "#f3f3f3",
  accent: "#16986e", accentSoft: "#ecf6f1", accentInk: "#0d7a56",
  warn: "#c2410c", warnSoft: "#fef3eb",
  red: "#b91c1c", redSoft: "#fef2f2",
  blue: "#3756a4", blueSoft: "#eef2fb",
}

// ─── Types ────────────────────────────────────────────────────────────────
type Provider = {
  id: string; name: string; type: string | null
  monthlyCost: number | null; dependencyLevel: string
  isCritical: boolean; operationalState: string; status: string
  createdAt: Date; updatedAt: Date; contactEmail?: string | null
  payments: { id: string; paymentDate: Date; amount: number; status: string }[]
  tasks: { id: string; status: string }[]
  _count: { payments: number; tasks: number }
}

type KPIs = {
  totalMonthlyCost: number; totalAnnualCost: number
  activeProviders: number; providersWithIssues: number
  criticalProviders: number; totalProviders: number
}

// ─── Format helpers ───────────────────────────────────────────────────────
const fmtNum = (n: number) => new Intl.NumberFormat("es-ES").format(Math.round(n))
const fmtEur = (n: number) => `${fmtNum(n)} €`

// ─── Pseudo-random (deterministic) ───────────────────────────────────────

// ─── Type config ──────────────────────────────────────────────────────────
const TYPE_LABELS: Record<string, string> = {
  SERVICE: "Servicios profesionales",
  PRODUCT: "Productos",
  SOFTWARE: "Software",
  OTHER: "Otros",
}
const TYPE_COLORS: Record<string, string> = {
  SERVICE: C.ink, SOFTWARE: C.accent, PRODUCT: C.ink2, OTHER: C.ink4,
}
const STATUS_CFG: Record<string, { label: string; tone: string }> = {
  OK:      { label: "Activo",   tone: "green" },
  ACTIVE:  { label: "Activo",   tone: "green" },
  PENDING: { label: "Pendiente",tone: "amber" },
  ISSUE:   { label: "Incidencia",tone: "red"  },
  PAUSED:  { label: "Pausado",  tone: "amber" },
  BLOCKED: { label: "Bloqueado",tone: "red"   },
}

// ─── Pill ─────────────────────────────────────────────────────────────────
const TONE: Record<string, { bg: string; color: string }> = {
  green: { bg: C.accentSoft, color: C.accentInk },
  amber: { bg: C.warnSoft,   color: C.warn       },
  red:   { bg: C.redSoft,    color: C.red         },
  blue:  { bg: C.blueSoft,   color: C.blue        },
}
function Pill({ tone, children }: { tone: string; children: React.ReactNode }) {
  const t = TONE[tone] ?? { bg: C.bg3, color: C.ink2 }
  return (
    <span style={{ display: "inline-flex", alignItems: "center", gap: 5, padding: "2px 8px", borderRadius: 99, fontSize: 11, fontWeight: 500, background: t.bg, color: t.color }}>
      <span style={{ width: 5, height: 5, borderRadius: 99, background: t.color, display: "inline-block" }} />
      {children}
    </span>
  )
}

// ─── Sparkline ────────────────────────────────────────────────────────────
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
function KpiCard({ label, tag, value, unit, delta, deltaLabel, trend = "flat", spark, isLast }: {
  label: string; tag: string; value: string | number; unit?: string
  delta?: number; deltaLabel?: string; trend?: "up" | "down" | "flat"
  spark?: number[]; isLast?: boolean
}) {
  const dc = trend === "up" ? C.accentInk : trend === "down" ? C.red : C.ink3
  return (
    <div style={{ padding: "18px 22px", borderRight: isLast ? "none" : `1px solid ${C.line2}`, display: "flex", flexDirection: "column", gap: 4 }}>
      <div style={{ fontSize: 11.5, color: C.ink3, fontWeight: 500, display: "flex", alignItems: "center", gap: 6 }}>
        {label}
        <span style={{ fontFamily: "ui-monospace,monospace", fontSize: 9, padding: "1px 5px", borderRadius: 3, background: C.bg3, color: C.ink3, letterSpacing: "0.04em", textTransform: "uppercase" }}>{tag}</span>
      </div>
      <div style={{ fontWeight: 600, letterSpacing: "-0.028em", fontSize: 28, lineHeight: 1.1, marginTop: 4, fontVariantNumeric: "tabular-nums", color: C.ink }}>
        {typeof value === "number" ? fmtNum(value) : value}
        {unit && <span style={{ color: C.ink3, fontWeight: 500, fontSize: 18, marginLeft: 2 }}>{unit}</span>}
      </div>
      <div style={{ marginTop: 10, display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10 }}>
        {delta !== undefined && (
          <span style={{ display: "inline-flex", alignItems: "center", gap: 4, fontFamily: "ui-monospace,monospace", fontSize: 11.5, fontWeight: 500, color: dc }}>
            {trend === "up" && <ArrowUpRight size={11} strokeWidth={2.4} />}
            {trend === "down" && <ArrowDownRight size={11} strokeWidth={2.4} />}
            {trend === "flat" && <Minus size={11} strokeWidth={2.4} />}
            {delta > 0 ? "+" : ""}{delta.toFixed(1)}%
            {deltaLabel && <span style={{ color: C.ink4, marginLeft: 4, fontWeight: 450 }}>{deltaLabel}</span>}
          </span>
        )}
        {spark && <Sparkline data={spark} color={trend === "down" ? C.ink3 : C.ink} />}
      </div>
    </div>
  )
}

// ─── Card ─────────────────────────────────────────────────────────────────
function Card({ children, style }: { children: React.ReactNode; style?: React.CSSProperties }) {
  return <div style={{ background: C.bg, border: `1px solid ${C.line}`, borderRadius: 10, display: "flex", flexDirection: "column", overflow: "hidden", ...style }}>{children}</div>
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
// ─── Recalc KPIs ─────────────────────────────────────────────────────────
function recalc(list: Provider[]): KPIs {
  const totalMonthlyCost = list.reduce((s, p) => s + (p.monthlyCost || 0), 0)
  const activeProviders = list.filter(p => p.status === "OK" || p.status === "ACTIVE").length
  const providersWithIssues = list.filter(p => p.status === "ISSUE" || p.operationalState === "RISK").length
  const criticalProviders = list.filter(p =>
    (p.dependencyLevel === "HIGH" || p.dependencyLevel === "CRITICAL" || p.isCritical) &&
    (p.status === "PENDING" || p.status === "ISSUE" || p.operationalState === "ATTENTION" || p.operationalState === "RISK")
  ).length
  return { totalMonthlyCost, totalAnnualCost: totalMonthlyCost * 12, activeProviders, providersWithIssues, criticalProviders, totalProviders: list.length }
}

// ─── Main component ───────────────────────────────────────────────────────
export function ProvidersView({ initialProviders, initialKPIs }: { initialProviders: Provider[]; initialKPIs: KPIs }) {
  const router = useRouter()
  const [providers, setProviders] = useState(initialProviders)
  const [kpis, setKPIs] = useState(initialKPIs)
  const [search, setSearch] = useState("")
  const [filterStatus] = useState("all")
  const [filterType] = useState("all")
  const [isCreateOpen, setIsCreateOpen] = useState(false)
  const [viewMode, setViewMode] = useState<"list" | "kanban">("list")
  const [showAllCats, setShowAllCats] = useState(false)

  const handleUpdate = (id: string, data: Partial<Provider>) => {
    const next = providers.map(p => p.id === id ? { ...p, ...data } : p)
    setProviders(next); setKPIs(recalc(next))
  }

  const filtered = providers.filter(p => {
    const q = search.toLowerCase()
    return (
      (!q || p.name.toLowerCase().includes(q) || (p.type ?? "").toLowerCase().includes(q)) &&
      (filterStatus === "all" || p.status === filterStatus) &&
      (filterType === "all" || (p.type || "OTHER") === filterType)
    )
  })

  // Derived: category breakdown
  const catMap: Record<string, number> = {}
  providers.forEach(p => {
    const k = p.type || "OTHER"
    catMap[k] = (catMap[k] || 0) + (p.monthlyCost || 0)
  })
  const cats = Object.entries(catMap)
    .map(([k, v]) => ({ label: TYPE_LABELS[k] || k, value: v, color: TYPE_COLORS[k] || C.ink3 }))
    .sort((a, b) => b.value - a.value)
  const maxCat = Math.max(...cats.map(c => c.value), 1)
  const totalCat = cats.reduce((s, c) => s + c.value, 0)
  // Vista plegada: solo categorías con gasto > 0, tope de 5 (mayor gasto primero,
  // ya ordenadas). El botón "Ver todas" despliega las 16 (incluidas las de 0€).
  // Mostrar/ocultar en cliente — los datos ya están cargados, sin llamadas al server.
  const COLLAPSED_CATS = 5
  const collapsedCats = cats.filter(c => c.value > 0).slice(0, COLLAPSED_CATS)
  const visibleCats = showAllCats ? cats : collapsedCats

  // Derived: top providers by monthly cost
  const topProviders = [...providers].sort((a, b) => (b.monthlyCost || 0) - (a.monthlyCost || 0)).slice(0, 8)

  // Derived: recurring contracts (providers with monthlyCost > 0)
  const contracts = providers.filter(p => (p.monthlyCost || 0) > 0).slice(0, 8)
  const totalContracts = contracts.reduce((s, c) => s + (c.monthlyCost || 0), 0)


  const monthName = new Date().toLocaleString("es-ES", { month: "long" })
  const monthCap = monthName.charAt(0).toUpperCase() + monthName.slice(1)

  return (
    <>
      {/* ── PAGE HEADER ─────────────────────────────────── */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: 24, gap: 24, paddingBottom: 18, borderBottom: `1px solid ${C.line2}` }}>
        <div>
          <h1 style={{ fontWeight: 600, letterSpacing: "-0.022em", fontSize: 26, lineHeight: 1.1, margin: 0, color: C.ink }}>Proveedores</h1>
          <div style={{ marginTop: 6, display: "flex", alignItems: "center", gap: 14, fontSize: 12.5, color: C.ink3, flexWrap: "wrap" }}>
            <span>{kpis.activeProviders} activos</span>
            <span style={{ color: C.ink5 }}>·</span>
            <span>{contracts.length} contratos recurrentes</span>
          </div>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
          <a href="/api/settings/export/providers" download style={{ display: "inline-flex", alignItems: "center", gap: 7, padding: "7px 12px", borderRadius: 6, background: C.bg, border: `1px solid ${C.line}`, color: C.ink2, fontWeight: 550, fontSize: 12.5, cursor: "pointer", textDecoration: "none" }}>
            <Download size={12} strokeWidth={2} />Exportar CSV
          </a>
          <button
            onClick={() => setIsCreateOpen(true)}
            style={{ display: "inline-flex", alignItems: "center", gap: 7, padding: "7px 12px", borderRadius: 6, background: C.ink, color: "white", fontWeight: 550, fontSize: 12.5, border: "none", cursor: "pointer" }}
          >
            <Plus size={12} strokeWidth={2.5} />Nuevo proveedor
          </button>
        </div>
      </div>

      {/* ── KPI ROW ──────────────────────────────────────── */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", border: `1px solid ${C.line}`, borderRadius: 10, background: C.bg, marginBottom: 16, overflow: "hidden" }}>
        <KpiCard label={`Gasto mensual · ${monthCap}`} tag="Mes" value={kpis.totalMonthlyCost} unit="€" />
        <KpiCard label="Proveedores activos" tag="Total" value={kpis.activeProviders} />
        <KpiCard label="Contratos recurrentes" tag="Activos" value={contracts.length} />
        <KpiCard label="Gasto recurrente" tag="Mes" value={Math.round(totalContracts)} unit="€" isLast />
      </div>

      {/* ── VIEW TOGGLE (list / kanban) ───────────────────── */}
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 16 }}>
        <div style={{ display: "inline-flex", background: C.bg2, border: `1px solid ${C.line}`, borderRadius: 7, padding: 2 }}>
          {(["list", "kanban"] as const).map(m => (
            <button key={m} onClick={() => setViewMode(m)} style={{ display: "flex", alignItems: "center", gap: 6, padding: "4px 10px", borderRadius: 5, fontFamily: "ui-monospace,monospace", fontSize: 11.5, color: viewMode === m ? C.ink : C.ink3, fontWeight: 500, background: viewMode === m ? "white" : "transparent", boxShadow: viewMode === m ? `0 0 0 1px ${C.line} inset, 0 1px 2px rgba(0,0,0,.03)` : "none", border: "none", cursor: "pointer" }}>
              {m === "list" ? <List size={11} /> : <LayoutGrid size={11} />}
              {m === "list" ? "Lista" : "Tablero"}
            </button>
          ))}
        </div>
      </div>

      {viewMode === "kanban" ? (
        <ProvidersKanbanView providers={providers} onProviderUpdate={handleUpdate} />
      ) : (
        <>
          {/* ── ROW 1: GASTO POR CATEGORÍA (ancho completo) ── */}
          {/* El panel "Vencimiento de pagos" se retiró (datos simulados). Follow-up
              post-launch: reconstruirlo con payments[] reales. */}
          <div className="mb-4">
            {/* Category breakdown */}
            <Card>
              <CardHead title={`Gasto por categoría · ${monthCap}`} subtitle={`Total ${fmtEur(Math.round(totalCat))} · ${cats.length} categorías`} />
              <div style={{ padding: "14px 0" }}>
                {cats.length === 0 ? (
                  <div style={{ padding: "32px 18px", textAlign: "center", color: C.ink3, fontSize: 12.5 }}>Sin datos de coste</div>
                ) : visibleCats.map((cat) => (
                  <div key={cat.label} style={{ display: "grid", gridTemplateColumns: "130px 1fr 90px 60px", gap: 14, alignItems: "center", padding: "4px 18px" }}>
                    <span style={{ fontSize: 12.5, fontWeight: 500, color: C.ink2, display: "flex", alignItems: "center", gap: 8 }}>
                      <span style={{ width: 8, height: 8, borderRadius: 2, background: cat.color, display: "inline-block", flexShrink: 0 }} />
                      {cat.label}
                    </span>
                    <div style={{ height: 8, background: C.bg3, borderRadius: 99, overflow: "hidden", position: "relative" }}>
                      <div style={{ position: "absolute", left: 0, top: 0, bottom: 0, background: cat.color, borderRadius: 99, width: `${(cat.value / maxCat) * 100}%`, transition: "width .8s ease" }} />
                    </div>
                    <span style={{ fontFamily: "ui-monospace,monospace", fontSize: 12, fontWeight: 600, color: C.ink, textAlign: "right" }}>{fmtEur(Math.round(cat.value))}</span>
                    <span style={{ fontFamily: "ui-monospace,monospace", fontSize: 10.5, color: C.ink3, textAlign: "right" }}>{totalCat > 0 ? `${((cat.value / totalCat) * 100).toFixed(0)}%` : "0%"}</span>
                  </div>
                ))}
              </div>
              {cats.length > collapsedCats.length && (
                <div style={{ padding: "10px 18px", borderTop: `1px solid ${C.line2}` }}>
                  <button
                    type="button"
                    onClick={() => setShowAllCats(v => !v)}
                    style={{ background: "none", border: "none", cursor: "pointer", color: C.ink2, fontSize: 12, fontWeight: 550, fontFamily: "ui-monospace,monospace", padding: 0 }}
                  >
                    {showAllCats ? "Ver menos" : `Ver todas (${cats.length})`}
                  </button>
                </div>
              )}
            </Card>

          </div>

          {/* ── ROW 2: TOP + CONTRACTS ─────────────────────── */}
          <div className="grid gap-4 mb-4" style={{ gridTemplateColumns: "5fr 7fr" }}>
            {/* Top providers */}
            <Card>
              <CardHead title="Top proveedores · este mes" subtitle="Por importe facturado" />
              <div>
                {topProviders.length === 0 ? (
                  <div style={{ padding: "32px 18px", textAlign: "center", color: C.ink3, fontSize: 12.5 }}>Sin datos</div>
                ) : topProviders.map((p) => {
                  const av = p.name.split(" ").map(w => w[0] ?? "").slice(0, 2).join("").toUpperCase()
                  return (
                    <div key={p.id} onClick={() => router.push(`/dashboard/providers/${p.id}`)} style={{ display: "grid", gridTemplateColumns: "32px 1fr 80px 100px", gap: 12, alignItems: "center", padding: "11px 18px", borderBottom: `1px solid ${C.line3}`, cursor: "pointer", transition: "background .1s ease" }}
                      onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = C.bg2 }}
                      onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = "transparent" }}
                    >
                      <div style={{ width: 30, height: 30, borderRadius: 6, background: C.bg3, border: `1px solid ${C.line2}`, display: "grid", placeItems: "center", fontWeight: 600, fontSize: 10.5, color: C.ink }}>{av}</div>
                      <div>
                        <div style={{ fontWeight: 550, fontSize: 12.5, color: C.ink, letterSpacing: "-0.005em" }}>{p.name}</div>
                        <div style={{ fontFamily: "ui-monospace,monospace", fontSize: 10.5, color: C.ink3, marginTop: 1 }}>{TYPE_LABELS[p.type || "OTHER"] || p.type}</div>
                      </div>
                      <span style={{ fontFamily: "ui-monospace,monospace", fontSize: 11, color: C.ink2, textAlign: "right" }}>{p._count.payments} doc.</span>
                      <span style={{ fontFamily: "ui-monospace,monospace", fontSize: 12.5, fontWeight: 600, color: C.ink, textAlign: "right" }}>{fmtEur(p.monthlyCost || 0)}</span>
                    </div>
                  )
                })}
              </div>
            </Card>

            {/* Recurring contracts */}
            <Card>
              <CardHead
                title="Contratos recurrentes"
                subtitle={`${contracts.length} activos · ${fmtEur(Math.round(totalContracts))}/mes`}
              />
              {/* Table header */}
              <div style={{ display: "grid", gridTemplateColumns: "1.4fr 1fr 100px 100px 90px 30px", gap: 14, padding: "10px 18px", background: C.bg2, borderBottom: `1px solid ${C.line2}`, fontFamily: "ui-monospace,monospace", fontSize: 10, fontWeight: 500, color: C.ink3, letterSpacing: "0.06em", textTransform: "uppercase" }}>
                <span>Contrato</span><span>Proveedor</span><span>Frecuencia</span><span style={{ textAlign: "right" }}>Importe</span><span>Estado</span><span />
              </div>
              {contracts.map((p) => {
                const tone = p.status === "ACTIVE" || p.status === "OK" ? "green" : "amber"
                const freq = "Mensual"
                return (
                  <div key={p.id} onClick={() => router.push(`/dashboard/providers/${p.id}`)} style={{ display: "grid", gridTemplateColumns: "1.4fr 1fr 100px 100px 90px 30px", gap: 14, alignItems: "center", padding: "12px 18px", borderBottom: `1px solid ${C.line3}`, cursor: "pointer", transition: "background .1s ease" }}
                    onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = C.bg2 }}
                    onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = "transparent" }}
                  >
                    <div>
                      <div style={{ fontWeight: 550, fontSize: 12.5, color: C.ink, letterSpacing: "-0.005em" }}>{p.name}</div>
                      <div style={{ fontFamily: "ui-monospace,monospace", fontSize: 10.5, color: C.ink3, marginTop: 1 }}>{TYPE_LABELS[p.type || "OTHER"]}</div>
                    </div>
                    <span style={{ fontSize: 12, color: C.ink2, fontWeight: 500 }}>{p.name.split(" ")[0]}</span>
                    <span style={{ fontFamily: "ui-monospace,monospace", fontSize: 11, color: C.ink3 }}>{freq}</span>
                    <span style={{ fontFamily: "ui-monospace,monospace", fontSize: 12.5, fontWeight: 600, color: C.ink, textAlign: "right" }}>{fmtNum(p.monthlyCost || 0)}<span style={{ color: C.ink3, fontWeight: 500, marginLeft: 2 }}>€</span></span>
                    <Pill tone={tone}>{tone === "green" ? "Activo" : "Pausado"}</Pill>
                    <button style={{ width: 26, height: 26, borderRadius: 5, display: "grid", placeItems: "center", color: C.ink3, background: "none", border: "none", cursor: "pointer" }} onClick={e => { e.stopPropagation() }}>
                      <MoreVertical size={14} />
                    </button>
                  </div>
                )
              })}
              {contracts.length === 0 && (
                <div style={{ padding: "32px 18px", textAlign: "center", color: C.ink3, fontSize: 12.5 }}>No hay contratos recurrentes</div>
              )}
            </Card>
          </div>

          {/* ── DIRECTORY TABLE ─────────────────────────────── */}
          <Card>
            <ListHeader
              title="Directorio de proveedores"
              subtitle={`${filtered.length} registros · ordenados por gasto YTD`}
              searchPlaceholder="Buscar proveedor…"
              searchValue={search}
              onSearchChange={setSearch}
              filters={[
                { label: "Categoría", value: "Todas" },
                { label: "País", value: "Todos" },
                { label: "Estado", value: "Activos" },
                { label: "Pendiente", value: "Cualquiera" },
              ]}
            />

            <div style={{ overflowX: "auto" }}>
              <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12.5, minWidth: 1100 }}>
                <thead>
                  <tr>
                    <th style={{ padding: "9px 16px", borderBottom: `1px solid ${C.line2}`, background: C.bg2, width: 26 }}>
                      <input type="checkbox" style={{ appearance: "none", width: 14, height: 14, border: `1.5px solid ${C.ink5}`, borderRadius: 3, cursor: "pointer", background: "white" }} />
                    </th>
                    {["Proveedor", "Categoría", "País", "Gasto YTD", "Por pagar", "Últ. doc.", "Estado", ""].map((h, i) => (
                      <th key={i} style={{ padding: "9px 16px", textAlign: i >= 3 && i <= 5 ? "right" : "left", fontFamily: "ui-monospace,monospace", fontSize: 10, fontWeight: 500, color: C.ink3, letterSpacing: "0.06em", textTransform: "uppercase", borderBottom: `1px solid ${C.line2}`, background: C.bg2, whiteSpace: "nowrap" }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filtered.length === 0 ? (
                    <tr><td colSpan={9} style={{ padding: "48px 16px", textAlign: "center", color: C.ink3, fontSize: 12.5 }}>No hay proveedores que coincidan con los filtros</td></tr>
                  ) : filtered.map((p) => {
                    const av = p.name.split(" ").map(w => w[0] ?? "").slice(0, 2).join("").toUpperCase()
                    const stCfg = STATUS_CFG[p.status] ?? { label: p.status, tone: "amber" }
                    const lastDate = new Date(p.updatedAt).toLocaleDateString("es-ES", { day: "numeric", month: "short" })
                    const type = TYPE_LABELS[p.type || "OTHER"] || p.type || "Otro"
                    const spentYTD = (p.monthlyCost || 0) * 12
                    const pendingAmt = p.tasks.length > 0 ? (p.monthlyCost || 0) : 0
                    const since = new Date(p.createdAt).getFullYear()
                    const isActive = p.status === "OK" || p.status === "ACTIVE"
                    return (
                      <tr key={p.id}
                        onClick={() => router.push(`/dashboard/providers/${p.id}`)}
                        style={{ cursor: "pointer", transition: "background .1s ease" }}
                        onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = C.bg2 }}
                        onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = "transparent" }}
                      >
                        <td style={{ padding: "11px 16px", borderBottom: `1px solid ${C.line3}` }} onClick={e => e.stopPropagation()}>
                          <input type="checkbox" style={{ appearance: "none", width: 14, height: 14, border: `1.5px solid ${C.ink5}`, borderRadius: 3, cursor: "pointer", background: "white" }} />
                        </td>
                        {/* Proveedor */}
                        <td style={{ padding: "11px 16px", borderBottom: `1px solid ${C.line3}` }}>
                          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                            <div style={{ width: 26, height: 26, borderRadius: 5, background: C.bg3, border: `1px solid ${C.line2}`, display: "grid", placeItems: "center", fontWeight: 600, fontSize: 10, color: C.ink, flexShrink: 0 }}>{av}</div>
                            <div>
                              <div style={{ fontWeight: 550, color: C.ink, letterSpacing: "-0.005em" }}>{p.name}</div>
                              <div style={{ fontFamily: "ui-monospace,monospace", fontSize: 10.5, color: C.ink3 }}>Proveedor desde {since}</div>
                            </div>
                          </div>
                        </td>
                        {/* Categoría */}
                        <td style={{ padding: "11px 16px", borderBottom: `1px solid ${C.line3}` }}>
                          <span style={{ display: "inline-flex", alignItems: "center", gap: 5, padding: "2px 8px", borderRadius: 99, fontSize: 11, fontWeight: 500, background: C.bg3, color: C.ink2, border: `1px solid ${C.line2}` }}>{type}</span>
                        </td>
                        {/* País */}
                        <td style={{ padding: "11px 16px", borderBottom: `1px solid ${C.line3}`, fontFamily: "ui-monospace,monospace", fontSize: 11, color: C.ink3 }}>
                          ES
                        </td>
                        {/* Gasto YTD */}
                        <td style={{ padding: "11px 16px", borderBottom: `1px solid ${C.line3}`, textAlign: "right" }}>
                          <span style={{ fontFamily: "ui-monospace,monospace", fontSize: 12.5, fontWeight: 600, color: C.ink }}>
                            {spentYTD > 0 ? <>{fmtNum(spentYTD)}<span style={{ color: C.ink3, fontWeight: 500, marginLeft: 2 }}>€</span></> : "—"}
                          </span>
                        </td>
                        {/* Por pagar */}
                        <td style={{ padding: "11px 16px", borderBottom: `1px solid ${C.line3}`, textAlign: "right" }}>
                          {pendingAmt > 0 ? (
                            <span style={{ fontFamily: "ui-monospace,monospace", fontSize: 12.5, fontWeight: 600, color: C.warn }}>
                              {fmtNum(pendingAmt)}<span style={{ color: C.warn, fontWeight: 500, marginLeft: 2 }}>€</span>
                            </span>
                          ) : <span style={{ fontFamily: "ui-monospace,monospace", fontSize: 12, color: C.ink4 }}>—</span>}
                        </td>
                        {/* Últ. doc. */}
                        <td style={{ padding: "11px 16px", borderBottom: `1px solid ${C.line3}`, fontFamily: "ui-monospace,monospace", fontSize: 11, color: C.ink3, textAlign: "right" }}>{lastDate}</td>
                        {/* Estado */}
                        <td style={{ padding: "11px 16px", borderBottom: `1px solid ${C.line3}` }}>
                          <Pill tone={isActive ? "green" : stCfg.tone}>{isActive ? "Activo" : "Pausado"}</Pill>
                        </td>
                        <td style={{ padding: "11px 16px", borderBottom: `1px solid ${C.line3}` }} onClick={e => e.stopPropagation()}>
                          <button style={{ width: 26, height: 26, borderRadius: 5, display: "grid", placeItems: "center", color: C.ink3, background: "none", border: "none", cursor: "pointer" }}>
                            <MoreVertical size={14} />
                          </button>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>

            {/* Table footer */}
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "10px 16px", borderTop: `1px solid ${C.line2}`, background: C.bg2, fontSize: 11.5, color: C.ink3 }}>
              <span style={{ fontFamily: "ui-monospace,monospace" }}>1–{filtered.length} de {kpis.totalProviders}</span>
              <div style={{ display: "flex", alignItems: "center", gap: 3 }}>
                {["‹", "1", "2", "3", "›"].map((b, i) => (
                  <button key={i} style={{ minWidth: 26, height: 26, padding: "0 8px", borderRadius: 5, fontFamily: "ui-monospace,monospace", fontSize: 11.5, color: i === 1 ? "white" : C.ink2, background: i === 1 ? C.ink : "white", border: `1px solid ${i === 1 ? C.ink : C.line}`, cursor: i === 0 ? "not-allowed" : "pointer", opacity: i === 0 ? 0.4 : 1 }}>{b}</button>
                ))}
              </div>
            </div>
          </Card>
        </>
      )}

      <CreateProviderDialog
        open={isCreateOpen}
        onOpenChange={setIsCreateOpen}
        onProviderCreated={np => {
          const next = [np as unknown as Provider, ...providers]
          setProviders(next); setKPIs(recalc(next))
        }}
      />
    </>
  )
}
