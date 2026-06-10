"use client"

import { useState, useId } from "react"
import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"
import { ArrowUpRight, ArrowDownRight, Minus, ExternalLink, Download, Loader2 } from "lucide-react"
import { toast } from "sonner"
import type { SummaryData } from "../page"
import { RevenueChart } from "./RevenueChart"

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
  red: "#b91c1c",
  redSoft: "#fef2f2",
}

// ─── Format helpers ─────────────────────────────────────────────────────────
const fmtNum = (n: number) => new Intl.NumberFormat("es-ES").format(Math.round(n))
const fmtEur = (n: number) => `${fmtNum(n)} €`
const fmtK = (n: number) => {
  if (Math.abs(n) >= 1_000_000) return `${(n / 1_000_000).toFixed(1).replace(".", ",")}M`
  if (Math.abs(n) >= 1000) return `${(n / 1000).toFixed(n % 1000 === 0 ? 0 : 1).replace(".", ",")}k`
  return fmtNum(n)
}

function calcDelta(cur: number, prev: number): number | null {
  return prev === 0 ? null : ((cur - prev) / prev) * 100
}

// ─── Sparkline (pure SVG, no library) ─────────────────────────────────────
function Sparkline({ values }: { values: number[] }) {
  const uid = useId()
  if (values.length < 2) return null
  const W = 80, H = 30
  const min = Math.min(...values)
  const max = Math.max(...values)
  const range = Math.max(max - min, 1)
  const pts = values.map((v, i) => {
    const x = (i / (values.length - 1)) * W
    const y = H - 2 - ((v - min) / range) * (H - 6)
    return `${x.toFixed(1)},${y.toFixed(1)}`
  })
  const polyPts = pts.join(" ")
  const fillPts = `0,${H} ${polyPts} ${W},${H}`
  const gradId = `sg-${uid.replace(/:/g, "")}`
  return (
    <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} style={{ display: "block", flexShrink: 0 }}>
      <defs>
        <linearGradient id={gradId} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={C.accent} stopOpacity={0.18} />
          <stop offset="100%" stopColor={C.accent} stopOpacity={0} />
        </linearGradient>
      </defs>
      <polygon points={fillPts} fill={`url(#${gradId})`} />
      <polyline points={polyPts} fill="none" stroke={C.accent} strokeWidth={1.5} strokeLinejoin="round" strokeLinecap="round" />
    </svg>
  )
}

// ─── KPI Card ──────────────────────────────────────────────────────────────
interface KpiProps {
  label: string
  tag: string
  value: string | number
  unit?: string
  delta: number | null
  deltaLabel?: string
  isLast?: boolean
  sparkline?: number[]
}

function KpiCard({ label, tag, value, unit, delta, deltaLabel, isLast, sparkline }: KpiProps) {
  const trend = delta === null ? "flat" : delta >= 0 ? "up" : "down"
  const deltaColor = trend === "up" ? C.accentInk : trend === "down" ? C.red : C.ink3
  return (
    <div style={{ padding: "18px 22px", borderRight: isLast ? "none" : `1px solid ${C.line2}`, display: "flex", flexDirection: "column", gap: 4 }}>
      <div style={{ fontSize: 11.5, color: C.ink3, fontWeight: 500, display: "flex", alignItems: "center", gap: 6 }}>
        {label}
        <span style={{ fontFamily: "ui-monospace, monospace", fontSize: 9, padding: "1px 5px", borderRadius: 3, background: C.bg3, color: C.ink3, letterSpacing: "0.04em", textTransform: "uppercase" }}>{tag}</span>
      </div>
      <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", gap: 8, marginTop: 4 }}>
        <div style={{ fontWeight: 600, letterSpacing: "-0.028em", fontSize: 28, lineHeight: 1.1, fontVariantNumeric: "tabular-nums", color: C.ink }}>
          {typeof value === "number" ? fmtNum(value) : value}
          {unit && <span style={{ color: C.ink3, fontWeight: 500, fontSize: 18, marginLeft: 2 }}>{unit}</span>}
        </div>
        {sparkline && sparkline.length >= 2 && <Sparkline values={sparkline} />}
      </div>
      <div style={{ marginTop: 6, display: "flex", alignItems: "center", gap: 6 }}>
        <span style={{ display: "inline-flex", alignItems: "center", gap: 4, fontFamily: "ui-monospace, monospace", fontSize: 11.5, fontWeight: 500, color: deltaColor }}>
          {trend === "up" && <ArrowUpRight size={11} strokeWidth={2.4} />}
          {trend === "down" && <ArrowDownRight size={11} strokeWidth={2.4} />}
          {trend === "flat" && <Minus size={11} strokeWidth={2.4} />}
          {delta !== null ? `${delta >= 0 ? "+" : ""}${delta.toFixed(1)}%` : "Nuevo"}
          {deltaLabel && <span style={{ color: C.ink4, marginLeft: 4, fontWeight: 450 }}>{deltaLabel}</span>}
        </span>
      </div>
    </div>
  )
}

// ─── Card wrappers ─────────────────────────────────────────────────────────
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

function CardLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <Link href={href} style={{ fontSize: 11.5, color: C.ink3, fontWeight: 500, display: "inline-flex", alignItems: "center", gap: 4, textDecoration: "none" }}>
      {children} <ExternalLink size={11} />
    </Link>
  )
}

// ─── Pipeline stage ────────────────────────────────────────────────────────
type StageLead = { id: string; name: string | null; companyName: string | null }

function PipelineStage({ num, stage, count, estimatedValue, barPct, isLast, isWon, leads, wonRevenue }: {
  num: string; stage: string; count: number; estimatedValue: number
  barPct: number; isLast?: boolean; isWon?: boolean
  leads: StageLead[]
  wonRevenue?: number
}) {
  const displayValue = isWon ? (wonRevenue ?? 0) : estimatedValue
  return (
    <div style={{ padding: "18px 20px", borderRight: isLast ? "none" : `1px solid ${C.line2}`, display: "flex", flexDirection: "column", gap: 4 }}>
      <div style={{ fontFamily: "ui-monospace, monospace", fontSize: 10, color: C.ink4, letterSpacing: "0.04em" }}>
        {num} · {count} lead{count !== 1 ? "s" : ""}
      </div>
      <div style={{ fontWeight: 600, letterSpacing: "-0.012em", fontSize: 13.5, marginTop: 2, color: isWon ? C.accentInk : C.ink }}>{stage}</div>
      {displayValue > 0 && (
        <div style={{ fontWeight: 600, letterSpacing: "-0.025em", fontSize: 20, fontVariantNumeric: "tabular-nums", marginTop: 4, lineHeight: 1, color: C.ink }}>
          {fmtNum(displayValue)}
          <span style={{ color: C.ink3, fontSize: 13, fontWeight: 500 }}> €</span>
        </div>
      )}
      {/* Real leads for this stage */}
      {leads.length > 0 && (
        <div style={{ marginTop: 8, display: "flex", flexDirection: "column", gap: 4 }}>
          {leads.map((lead) => (
            <div key={lead.id} style={{ fontSize: 11.5, color: C.ink2, lineHeight: 1.3, overflow: "hidden" }}>
              <span style={{ display: "block", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", fontWeight: 500 }}>
                {lead.name || "Sin nombre"}
              </span>
              {lead.companyName && (
                <span style={{ display: "block", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", fontSize: 10.5, color: C.ink4 }}>
                  {lead.companyName}
                </span>
              )}
            </div>
          ))}
          {count > leads.length && (
            <div style={{ fontSize: 10.5, color: C.ink4, fontFamily: "ui-monospace, monospace", marginTop: 2 }}>
              +{count - leads.length} más
            </div>
          )}
        </div>
      )}
      <div style={{ marginTop: 10, height: 3, background: C.bg3, borderRadius: 99, overflow: "hidden", position: "relative" }}>
        <div style={{ position: "absolute", left: 0, top: 0, bottom: 0, background: isWon ? C.accent : C.ink, borderRadius: 99, width: `${barPct}%` }} />
      </div>
    </div>
  )
}

// ─── Status pill ───────────────────────────────────────────────────────────
const STATUS_CFG: Record<string, { bg: string; color: string; label: string }> = {
  NEW:       { bg: C.bg3,        color: C.ink2,     label: "Nuevo" },
  CONTACTED: { bg: "#eef2fb",    color: "#3756a4",  label: "Contactado" },
  QUALIFIED: { bg: C.bg3,        color: C.ink2,     label: "Cualificado" },
  STALLED:   { bg: "#fff7ed",    color: "#c2410c",  label: "Estancado" },
  CONVERTED: { bg: C.accentSoft, color: C.accentInk, label: "Ganado" },
  LOST:      { bg: C.redSoft,    color: C.red,      label: "Perdido" },
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

// ─── Date helpers ──────────────────────────────────────────────────────────
function parseDue(dateStr: string | null): { label: string; status: "" | "today" | "late" } {
  if (!dateStr) return { label: "Sin fecha", status: "" }
  const due = new Date(dateStr)
  const diffDays = Math.floor((due.getTime() - Date.now()) / 86_400_000)
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

// ─── Period selector (URL-wired) ───────────────────────────────────────────
function PeriodSelector() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const active = searchParams?.get("period") ?? "MTD"
  const opts = ["7d", "30d", "MTD", "QTD", "YTD"]

  function select(opt: string) {
    const params = new URLSearchParams(searchParams?.toString() ?? "")
    params.set("period", opt)
    router.push(`?${params.toString()}`, { scroll: false })
  }

  return (
    <div style={{ display: "inline-flex", background: C.bg2, border: `1px solid ${C.line}`, borderRadius: 7, padding: 2 }}>
      {opts.map((opt) => (
        <button
          key={opt}
          onClick={() => select(opt)}
          style={{
            padding: "4px 10px", borderRadius: 5,
            fontFamily: "ui-monospace, monospace", fontSize: 11.5,
            color: active === opt ? C.ink : C.ink3, fontWeight: 500,
            background: active === opt ? "white" : "transparent",
            boxShadow: active === opt ? `0 0 0 1px ${C.line} inset, 0 1px 2px rgba(0,0,0,.03)` : "none",
            cursor: "pointer", border: "none",
          }}
        >
          {opt}
        </button>
      ))}
    </div>
  )
}

// ─── Main DashboardView ────────────────────────────────────────────────────
interface Props { data: SummaryData }

export function DashboardView({ data }: Props) {
  const { kpis, leadsByStatus, pipeline, revenueChart, leadSources, leadsRecent, tasksHighPriority, activityFeed, meta } = data

  const [doneTasks, setDoneTasks] = useState<Set<string>>(new Set())
  const [exportMenuOpen, setExportMenuOpen] = useState(false)
  const [exporting, setExporting] = useState<"xlsx" | "pdf" | null>(null)

  const markDone = async (taskId: string) => {
    setDoneTasks((prev) => new Set([...prev, taskId]))
    try {
      const res = await fetch(`/api/tasks/${taskId}/complete`, { method: "POST" })
      if (!res.ok) throw new Error("error")
    } catch {
      setDoneTasks((prev) => { const s = new Set(prev); s.delete(taskId); return s })
      toast.error("No se pudo completar la tarea")
    }
  }

  const handleExport = async (fmt: "xlsx" | "pdf") => {
    setExportMenuOpen(false)
    setExporting(fmt)
    try {
      const res = await fetch(`/api/dashboard/export?format=${fmt}&period=${encodeURIComponent(data.period)}`)
      if (!res.ok) throw new Error("error")
      const blob = await res.blob()
      const url = URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = url
      a.download = `dashboard-${data.period}-${new Date().toISOString().split("T")[0]}.${fmt}`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
    } catch {
      toast.error("No se pudo generar el informe")
    } finally {
      setExporting(null)
    }
  }

  const totalLeads = Object.values(leadsByStatus).reduce((s, v) => s + v, 0)
  const convCurrent = kpis.leadsCreatedCurrent > 0 ? (kpis.conversionsCurrent / kpis.leadsCreatedCurrent) * 100 : 0
  const convPrev = kpis.leadsCreatedPrev > 0 ? (kpis.conversionsPrev / kpis.leadsCreatedPrev) * 100 : 0

  const monthName = new Date().toLocaleString("es-ES", { month: "long" })
  const monthCap = monthName.charAt(0).toUpperCase() + monthName.slice(1)

  const greeting = (() => {
    const h = new Date().getHours()
    if (h >= 6 && h < 13) return "Buenos días"
    if (h < 20) return "Buenas tardes"
    return "Buenas noches"
  })()

  const maxPV = Math.max(...pipeline.map((s) => s.estimatedValue), 1)
  const totalSrc = leadSources.reduce((s, x) => s + x.count, 0)

  type FeedItem = { html: React.ReactNode; time: string; isNew: boolean }
  const feed: FeedItem[] = [
    ...activityFeed.leads.slice(0, 3).map((l) => ({
      html: <span>Nuevo lead <strong>{l.name || "Sin nombre"}</strong></span>,
      time: relTime(l.createdAt),
      isNew: true,
    })),
    ...activityFeed.invoices.slice(0, 3).map((inv) => ({
      html: <span>Factura <strong>{inv.number}</strong> · {fmtEur(Number(inv.total))}</span>,
      time: relTime(inv.updatedAt),
      isNew: false,
    })),
    ...activityFeed.tasks.slice(0, 2).map((t) => ({
      html: <span>Tarea <strong>{t.title}</strong></span>,
      time: relTime(t.updatedAt),
      isNew: false,
    })),
  ]

  return (
    <div style={{ fontFamily: "var(--font-geist-sans, ui-sans-serif, system-ui, sans-serif)", color: C.ink }}>

      {/* ── PAGE HEADER ─────────────────────────────────── */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: 28, gap: 24, paddingBottom: 18, borderBottom: `1px solid ${C.line2}` }}>
        <div>
          <h1 style={{ fontWeight: 600, letterSpacing: "-0.022em", fontSize: 26, lineHeight: 1.1, margin: 0, color: C.ink }}>
            {greeting}{meta.userName ? `, ${meta.userName.split(" ")[0]}` : ""}
          </h1>
          <div style={{ marginTop: 6, display: "flex", alignItems: "center", gap: 14, fontSize: 12.5, color: C.ink3 }}>
            <span>{meta.currentDate ? new Intl.DateTimeFormat("es-ES", { weekday: "long", year: "numeric", month: "long", day: "numeric" }).format(new Date(meta.currentDate)) : ""}</span>
            <span style={{ color: C.ink5 }}>·</span>
            <span style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
              <span style={{ width: 6, height: 6, borderRadius: 99, background: C.accent, boxShadow: `0 0 0 3px ${C.accentSoft}`, display: "inline-block", animation: "pulse-dot 2s ease-in-out infinite" }} />
              En vivo
            </span>
          </div>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <PeriodSelector />
          <div style={{ position: "relative" }}>
            <button
              onClick={() => setExportMenuOpen((v) => !v)}
              disabled={exporting !== null}
              style={{
                display: "inline-flex", alignItems: "center", gap: 7, padding: "7px 12px",
                borderRadius: 6, background: C.bg, border: `1px solid ${C.line}`,
                color: exporting ? C.ink3 : C.ink2, fontWeight: 550, fontSize: 12.5,
                cursor: exporting ? "not-allowed" : "pointer", opacity: exporting ? 0.7 : 1,
              }}
            >
              {exporting
                ? <Loader2 size={12} strokeWidth={2} className="animate-spin" />
                : <Download size={12} strokeWidth={2} />}
              {exporting ? "Exportando..." : "Exportar"}
            </button>
            {exportMenuOpen && (
              <>
                <div style={{ position: "fixed", inset: 0, zIndex: 9 }} onClick={() => setExportMenuOpen(false)} />
                <div style={{
                  position: "absolute", top: "calc(100% + 4px)", right: 0, zIndex: 10,
                  background: "#fff", border: `1px solid ${C.line}`, borderRadius: 8,
                  boxShadow: "0 4px 16px rgba(0,0,0,0.08)", minWidth: 160, overflow: "hidden",
                }}>
                  {(["xlsx", "pdf"] as const).map((fmt) => (
                    <button
                      key={fmt}
                      onClick={() => handleExport(fmt)}
                      style={{
                        display: "block", width: "100%", padding: "9px 14px",
                        fontSize: 12.5, color: C.ink, background: "none",
                        border: "none", cursor: "pointer", textAlign: "left",
                      }}
                      onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.background = C.bg2 }}
                      onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.background = "none" }}
                    >
                      {fmt === "xlsx" ? "Excel (.xlsx)" : "PDF"}
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* ── KPI ROW ──────────────────────────────────────── */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", border: `1px solid ${C.line}`, borderRadius: 10, background: C.bg, marginBottom: 16, overflow: "hidden" }}
        className="sm:grid-cols-4 grid-cols-2"
      >
        <KpiCard label="Leads activos" tag="abiertos" value={kpis.leadsActive} delta={calcDelta(kpis.leadsCreatedCurrent, kpis.leadsCreatedPrev)} deltaLabel="captación" sparkline={data.sparklines?.leads} />
        <KpiCard label="Clientes activos" tag="cartera" value={kpis.clientsActive} delta={calcDelta(kpis.clientsCreatedCurrent, kpis.clientsCreatedPrev)} deltaLabel="nuevos" sparkline={data.sparklines?.clients} />
        <KpiCard label="Tasa de conversión" tag={data.period} value={Number(convCurrent.toFixed(1))} unit="%" delta={calcDelta(convCurrent, convPrev)} sparkline={data.sparklines?.conversions} />
        <KpiCard label={`Ingresos · ${monthCap}`} tag={data.period} value={kpis.invoicedCurrent} unit="€" delta={calcDelta(kpis.invoicedCurrent, kpis.invoicedPrev)} isLast sparkline={data.sparklines?.revenue} />
      </div>

      {/* ── ROW 1: REVENUE + LEADS ────────────────────────── */}
      <div className="grid gap-4 mb-4" style={{ gridTemplateColumns: "2fr 1fr" }}>
        <div style={{ border: `1px solid ${C.line}`, borderRadius: 10, background: C.bg, overflow: "hidden" }}>
          <RevenueChart data={revenueChart} />
        </div>

        <Card>
          <CardHead title="Leads recientes" subtitle={`${kpis.leadsActive} activos`} actions={<CardLink href="/dashboard/leads/kanban">Pipeline</CardLink>} />
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
          <CardHead title="Pipeline comercial" subtitle={`${totalLeads} leads`} actions={<CardLink href="/dashboard/leads/kanban">Pipeline completo</CardLink>} />
          <div style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)" }}>
            {[
              { num: "01", stage: "Nuevo",       status: "NEW" },
              { num: "02", stage: "Contactado",  status: "CONTACTED" },
              { num: "03", stage: "Cualificado", status: "QUALIFIED" },
              { num: "04", stage: "Ganado",      status: "CONVERTED", isWon: true },
              { num: "05", stage: "Perdido",     status: "LOST" },
            ].map((s, i) => {
              const row = pipeline.find((p) => p.status === s.status) ?? { count: 0, estimatedValue: 0, leads: [], wonRevenue: undefined }
              return (
                <PipelineStage
                  key={s.num}
                  num={s.num}
                  stage={s.stage}
                  count={row.count}
                  estimatedValue={row.estimatedValue}
                  barPct={maxPV > 0 ? (row.estimatedValue / maxPV) * 100 : 0}
                  isLast={i === 4}
                  isWon={s.isWon}
                  leads={row.leads}
                  wonRevenue={row.wonRevenue}
                />
              )
            })}
          </div>
        </Card>
      </div>

      {/* ── ROW 3: TASKS + ACTIVITY ───────────────────────── */}
      <div className="grid gap-4 mb-4" style={{ gridTemplateColumns: "2fr 1fr" }}>
        <Card>
          <CardHead title="Tareas prioritarias" subtitle={`${tasksHighPriority.length} abiertas · ${kpis.tasksOverdue} vencidas`} actions={<CardLink href="/dashboard/tasks">Tablero</CardLink>} />
          <div style={{ padding: 18 }}>
            {tasksHighPriority.filter((t) => !doneTasks.has(t.id)).length === 0 ? (
              <div style={{ textAlign: "center", padding: "24px 0", color: C.ink3, fontSize: 12.5 }}>No hay tareas prioritarias</div>
            ) : tasksHighPriority.filter((t) => !doneTasks.has(t.id)).slice(0, 6).map((task) => {
              const { label: dueLabel, status: dueStatus } = parseDue(task.dueDate)
              return (
                <div key={task.id} style={{ display: "grid", gridTemplateColumns: "18px 1fr auto auto", gap: 12, padding: "10px 0", borderBottom: `1px solid ${C.line3}`, alignItems: "center" }}>
                  <span
                    role="checkbox"
                    aria-checked={false}
                    onClick={() => markDone(task.id)}
                    style={{ width: 16, height: 16, border: `1.5px solid ${C.ink5}`, borderRadius: 4, display: "grid", placeItems: "center", cursor: "pointer", flexShrink: 0 }}
                  />
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

      {/* ── ROW 4: HEALTH + SOURCES ──────────────────────── */}
      <div className="grid grid-cols-2 gap-4 mb-4">
        <Card>
          <CardHead title="Salud de cartera" subtitle={`${kpis.clientsActive} clientes activos`} actions={<CardLink href="/dashboard/clients">Clientes</CardLink>} />
          {/* ── Segmented health bar ── */}
          {(() => {
            const hb = data.healthBar
            const total = hb.champions + hb.saludables + hb.enRiesgo + hb.churnAlto
            if (total === 0) return null
            const segs = [
              { k: "saludables", l: "Saludables", n: hb.saludables, c: C.accent },
              { k: "champions",  l: "Champions",  n: hb.champions,  c: C.accentInk },
              { k: "enRiesgo",   l: "En riesgo",  n: hb.enRiesgo,   c: "#d97706" },
              { k: "churnAlto",  l: "Churn alto", n: hb.churnAlto,  c: C.red },
            ].filter((s) => s.n > 0)
            return (
              <div style={{ padding: "14px 18px 12px" }}>
                <div style={{ display: "flex", height: 7, borderRadius: 99, overflow: "hidden", gap: 1.5 }}>
                  {segs.map((s) => (
                    <div key={s.k} style={{ flex: s.n / total, background: s.c, minWidth: 3 }} />
                  ))}
                </div>
                <div style={{ display: "flex", flexWrap: "wrap", gap: "5px 14px", marginTop: 10 }}>
                  {segs.map((s) => (
                    <div key={s.k} style={{ display: "flex", alignItems: "center", gap: 5 }}>
                      <span style={{ width: 6, height: 6, borderRadius: 2, background: s.c, display: "inline-block", flexShrink: 0 }} />
                      <span style={{ fontSize: 11, color: C.ink3 }}>{s.l}</span>
                      <span style={{ fontFamily: "ui-monospace, monospace", fontSize: 11, fontWeight: 600, color: C.ink2 }}>{s.n}</span>
                    </div>
                  ))}
                </div>
              </div>
            )
          })()}
          <div style={{ padding: "0 18px 18px" }}>
            {[
              { l: `Leads nuevos (${data.period})`,  v: `+${kpis.leadsCreatedCurrent}` },
              { l: "Cobros pendientes",              v: fmtEur(kpis.pendingCobro) },
              { l: "Facturas vencidas",              v: String(kpis.invoicesOverdue) },
              { l: "Tareas urgentes (HIGH)",         v: String(kpis.tasksHighPriorityCount) },
            ].map((row) => (
              <div key={row.l} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "14px 0", borderTop: `1px solid ${C.line2}` }}>
                <span style={{ fontSize: 12, color: C.ink3 }}>{row.l}</span>
                <span style={{ fontFamily: "ui-monospace, monospace", fontSize: 13.5, fontWeight: 500 }}>{row.v}</span>
              </div>
            ))}
          </div>
        </Card>

        <Card>
          <CardHead title="Origen de oportunidades" subtitle="Acumulado" actions={<CardLink href="/dashboard/leads/analytics">Ver origen</CardLink>} />
          <div style={{ padding: 18 }}>
            {leadSources.length === 0 ? (
              <div style={{ textAlign: "center", padding: "24px 0", color: C.ink3, fontSize: 12.5 }}>Sin datos de fuentes</div>
            ) : leadSources.slice(0, 6).map((s) => (
              <div key={s.source} style={{ display: "grid", gridTemplateColumns: "100px 1fr 40px 56px", gap: 16, padding: "8px 0", alignItems: "center" }}>
                <span style={{ fontSize: 12.5, fontWeight: 500, display: "flex", alignItems: "center", gap: 8 }}>
                  <span style={{ width: 6, height: 6, borderRadius: 2, background: C.ink, display: "inline-block", flexShrink: 0 }} />
                  {s.source}
                </span>
                <div style={{ height: 4, background: C.bg3, borderRadius: 99, overflow: "hidden", position: "relative" }}>
                  <div style={{ position: "absolute", left: 0, top: 0, bottom: 0, background: C.ink, borderRadius: 99, width: `${(s.count / (leadSources[0]?.count || 1)) * 100}%` }} />
                </div>
                <span style={{ fontFamily: "ui-monospace, monospace", fontSize: 11.5, color: C.ink2, fontWeight: 500, textAlign: "right" }}>{s.count}</span>
                <span style={{ fontFamily: "ui-monospace, monospace", fontSize: 11, color: C.ink3, textAlign: "right" }}>{totalSrc > 0 ? Math.round((s.count / totalSrc) * 100) : 0}%</span>
              </div>
            ))}
          </div>
        </Card>
      </div>

    </div>
  )
}
