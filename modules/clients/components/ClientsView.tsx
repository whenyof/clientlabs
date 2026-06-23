/* eslint-disable @typescript-eslint/no-explicit-any */
"use client"

import { useState, useCallback, useEffect, useRef } from "react"
import { useRouter } from "next/navigation"
import { ClientsTable } from "@domains/clients/components/ClientsTable"
import { ClientsFilters } from "./ClientsFilters"
import { CreateClientButton } from "@/modules/clients/components/CreateClientButton"
import { ImportClients } from "@/modules/clients/components/ImportClients"
import { Download, MoreVertical, Mail, Phone, Zap } from "lucide-react"

// ─── Design tokens ─────────────────────────────────────────────────────────
const C = {
  bg: "#ffffff", bg2: "#fafafa", bg3: "#f5f5f5",
  ink: "#0a0a0a", ink2: "#404040", ink3: "#737373", ink4: "#a3a3a3", ink5: "#d4d4d4",
  line: "#e8e8e8", line2: "#eeeeee", line3: "#f3f3f3",
  accent: "#16986e", accentSoft: "#ecf6f1", accentInk: "#0d7a56",
  warn: "#c2410c", warnSoft: "#fef3eb",
  red: "#b91c1c", redSoft: "#fef2f2",
  blue: "#3756a4", violet: "#6d28d9", cyan: "#0e7490",
}

const fmtN = (n: number) => new Intl.NumberFormat("es-ES").format(Math.round(n))
const fmtEur = (n: number) =>
  n >= 1_000_000 ? `${(n / 1_000_000).toFixed(1).replace(".", ",")}M €`
  : n >= 1000 ? `${(n / 1000).toFixed(1).replace(".", ",")}k €`
  : `${fmtN(n)} €`

// ─── Card ───────────────────────────────────────────────────────────────────
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

// ─── Types ──────────────────────────────────────────────────────────────────
// Las filas y agregados se calculan en server (getClientsView). Tipamos laxo
// (any) para no acoplar el cliente al módulo server-only.
type ClientRow = any

type ClientsAggregates = {
  kpis: { total: number; active: number; vip: number; followup: number; inactive: number; totalRevenue: number }
  segCounts: { all: number; vip: number; healthy: number; risk: number; churn: number; mrr: number; new: number }
  distributionTop6: { name: string; value: number }[]
  attention: { id: string; name: string | null; effectiveStatus: string; isForgotten: boolean; updatedAt: string | Date }[]
  cohort: { co: string; start: number; ret: (number | null)[] }[]
}

type ClientsViewProps = {
  initialData: {
    items: ClientRow[]
    total: number
    hasMore: boolean
    aggregates: ClientsAggregates
  }
  currentFilters: { status: string; search: string; sortBy: string; sortOrder: string }
  serverNow?: string
}

// ─── Cohort color levels ─────────────────────────────────────────────────────
const COHORT_COLORS = ["#fbfbfa", "#ecf6f1", "#c8e6d8", "#7ec6a3", C.accent, C.accentInk]
function cohortLevel(p: number | null) {
  if (p === null) return -1
  if (p >= 90) return 5; if (p >= 80) return 4; if (p >= 70) return 3; if (p >= 60) return 2; if (p > 0) return 1; return 0
}

// ─── Main Component ──────────────────────────────────────────────────────────
export function ClientsView({ initialData, currentFilters, serverNow }: ClientsViewProps) {
  const router = useRouter()
  const [referenceDate] = useState(() => serverNow ? new Date(serverNow) : new Date())
  const [searchTerm, setSearchTerm] = useState(currentFilters.search)
  const [viewMode, setViewMode] = useState<"list" | "health" | "cohort">("list")
  const [activeSegment, setActiveSegment] = useState("all")
  const [sortBy, setSortBy] = useState(currentFilters.sortBy || "createdAt")
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">((currentFilters.sortOrder as "asc" | "desc") || "desc")
  const [statusFilter, setStatusFilter] = useState(currentFilters.status || "all")

  // Filas paginadas + agregados, calculados EN SERVER (getClientsView).
  const [items, setItems] = useState<ClientRow[]>(initialData.items)
  const [aggregates, setAggregates] = useState<ClientsAggregates>(initialData.aggregates)
  const [total, setTotal] = useState(initialData.total)
  const [hasMore, setHasMore] = useState(initialData.hasMore)
  const [loading, setLoading] = useState(false)
  const [loadingMore, setLoadingMore] = useState(false)

  const PAGE_SIZE = 50

  const buildUrl = useCallback((offset: number) => {
    const p = new URLSearchParams()
    if (statusFilter && statusFilter !== "all") p.set("status", statusFilter)
    if (searchTerm.trim()) p.set("search", searchTerm.trim())
    if (activeSegment && activeSegment !== "all") p.set("segment", activeSegment)
    p.set("sortBy", sortBy)
    p.set("sortOrder", sortOrder)
    p.set("offset", String(offset))
    p.set("pageSize", String(PAGE_SIZE))
    return `/api/clients/list?${p.toString()}`
  }, [statusFilter, searchTerm, activeSegment, sortBy, sortOrder])

  // Refetch (página 1 + agregados) al cambiar filtros/búsqueda/segmento/orden.
  // Debounce para la búsqueda; salta el primer render (ya viene de SSR).
  const isFirst = useRef(true)
  useEffect(() => {
    if (isFirst.current) { isFirst.current = false; return }
    let cancelled = false
    setLoading(true)
    const t = setTimeout(async () => {
      try {
        const res = await fetch(buildUrl(0), { credentials: "include" })
        const data = await res.json()
        if (cancelled || !data.success) return
        setItems(data.items)
        setAggregates(data.aggregates)
        setTotal(data.total)
        setHasMore(data.hasMore)
      } catch { /* fail-soft: se mantiene la página actual */ }
      finally { if (!cancelled) setLoading(false) }
    }, 250)
    return () => { cancelled = true; clearTimeout(t) }
  }, [buildUrl])

  const refetch = useCallback(async () => {
    try {
      const res = await fetch(buildUrl(0), { credentials: "include" })
      const data = await res.json()
      if (data.success) {
        setItems(data.items); setAggregates(data.aggregates); setTotal(data.total); setHasMore(data.hasMore)
      }
    } catch { /* ignore */ }
  }, [buildUrl])

  const loadMore = useCallback(async () => {
    if (loadingMore || !hasMore) return
    setLoadingMore(true)
    try {
      const res = await fetch(buildUrl(items.length), { credentials: "include" })
      const data = await res.json()
      if (data.success) { setItems(prev => [...prev, ...data.items]); setHasMore(data.hasMore) }
    } catch { /* ignore */ }
    finally { setLoadingMore(false) }
  }, [buildUrl, items.length, loadingMore, hasMore])

  const handleClientUpdate = useCallback((clientId: string, data: Partial<ClientRow>) => {
    // Optimista en la fila visible; los agregados los recalcula el server.
    setItems(prev => prev.map((c: any) => c.id === clientId ? { ...c, ...data } : c))
    refetch()
  }, [refetch])

  const handleSortChange = useCallback((value: string) => {
    const [field, order] = value.split("-")
    setSortBy(field); setSortOrder(order as "asc" | "desc")
  }, [])

  // Tabla: las filas ya vienen filtradas/ordenadas/paginadas del server.
  const clientesProcesados = items

  const kpis = aggregates.kpis
  const totalClients = kpis.total
  const champions = kpis.vip
  const saludables = kpis.active
  const enRiesgo = kpis.followup
  const churnAlto = kpis.inactive

  // Health segments
  const healthSegments = [
    { label: "Champions",  value: champions,  tone: "green", color: C.accent, desc: "Pago al día · alta interacción" },
    { label: "Saludables", value: saludables, tone: "ink",   color: C.ink,    desc: "Comportamiento estable" },
    { label: "En riesgo",  value: enRiesgo,   tone: "amber", color: C.warn,   desc: "Caída de actividad o pago" },
    { label: "Churn alto", value: churnAlto,  tone: "red",   color: C.red,    desc: "Sin contacto > 90 días" },
  ]
  const healthTotal = Math.max(champions + saludables + enRiesgo + churnAlto, 1)

  // Atención y cohorte vienen calculadas del server (sobre todo el set).
  const attentionClients = aggregates.attention
  const cohortData = aggregates.cohort

  // KPI cards — real values only (no fabricated trends)
  const kpiCards = [
    { label: "Clientes activos", tag: "Total", value: totalClients, unit: "" },
    { label: "Valor cartera · LTV", tag: "Total", value: kpis.totalRevenue, unit: "€" },
    { label: "Tasa de retención", tag: "Salud", value: healthTotal > 0 ? Math.round(((champions + saludables) / healthTotal) * 100 * 10) / 10 : 0, unit: "%" },
    { label: "Churn estimado", tag: "Salud", value: healthTotal > 0 ? Math.round((churnAlto / healthTotal) * 100 * 10) / 10 : 0, unit: "%" },
  ]

  // Segment chips — counts sobre TODO el set (server). mrr/new ya no se capan a 100.
  const segChips = [
    { id: "all", label: "Todos", count: totalClients },
    { id: "vip", label: "Champions", count: champions },
    { id: "healthy", label: "Saludables", count: saludables },
    { id: "risk", label: "En riesgo", count: enRiesgo },
    { id: "churn", label: "Churn alto", count: churnAlto },
    { id: "mrr", label: "Con facturación", count: aggregates.segCounts.mrr },
    { id: "new", label: "Nuevos < 90d", count: aggregates.segCounts.new },
  ]

  return (
    <div style={{ fontFamily: "var(--font-geist-sans, ui-sans-serif, system-ui, sans-serif)", color: C.ink }}>

      {/* ── PAGE HEADER ──────────────────────────────── */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: 20, gap: 24, paddingBottom: 18, borderBottom: `1px solid ${C.line2}` }}>
        <div>
          <h1 style={{ fontWeight: 600, letterSpacing: "-0.022em", fontSize: 26, lineHeight: 1.1, margin: 0, color: C.ink }}>Clientes</h1>
          <div style={{ marginTop: 6, display: "flex", alignItems: "center", gap: 14, fontSize: 12.5, color: C.ink3, flexWrap: "wrap" }}>
            <span>{totalClients} activos</span>
            <span style={{ color: C.ink5 }}>·</span>
            <span style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
              <span style={{ width: 6, height: 6, borderRadius: 99, background: C.accent, boxShadow: `0 0 0 3px ${C.accentSoft}`, display: "inline-block" }} />
              {enRiesgo + churnAlto} requieren atención
            </span>
            <span style={{ color: C.ink5 }}>·</span>
            <span>LTV cartera <strong style={{ color: C.ink }}>{fmtEur(kpis.totalRevenue)}</strong></span>
          </div>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
          <div style={{ display: "inline-flex", background: C.bg2, border: `1px solid ${C.line}`, borderRadius: 7, padding: 2 }}>
            {(["list", "health", "cohort"] as const).map(v => (
              <button key={v} onClick={() => setViewMode(v)} style={{ padding: "4px 10px", borderRadius: 5, fontFamily: "ui-monospace,monospace", fontSize: 11.5, color: viewMode === v ? C.ink : C.ink3, fontWeight: 500, background: viewMode === v ? "white" : "transparent", boxShadow: viewMode === v ? `0 0 0 1px ${C.line} inset, 0 1px 2px rgba(0,0,0,.03)` : "none", border: "none", cursor: "pointer" }}>
                {v === "list" ? "Lista" : v === "health" ? "Salud" : "Retención"}
              </button>
            ))}
          </div>
          <a href="/api/settings/export/clients" download style={{ display: "inline-flex", alignItems: "center", gap: 7, padding: "7px 12px", borderRadius: 6, background: C.bg, border: `1px solid ${C.line}`, color: C.ink2, fontWeight: 550, fontSize: 12.5, cursor: "pointer", textDecoration: "none" }}>
            <Download size={12} strokeWidth={2} />Exportar CSV
          </a>
          <ImportClients />
          <CreateClientButton />
        </div>
      </div>

      {/* ── KPI ROW ──────────────────────────────────── */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", border: `1px solid ${C.line}`, borderRadius: 10, background: C.bg, marginBottom: 16, overflow: "hidden" }}>
        {kpiCards.map((k, i) => (
          <div key={k.label} style={{ padding: "18px 22px", borderRight: i < 3 ? `1px solid ${C.line2}` : "none", display: "flex", flexDirection: "column", gap: 4 }}>
            <div style={{ fontSize: 11.5, color: C.ink3, fontWeight: 500, display: "flex", alignItems: "center", gap: 6 }}>
              {k.label}
              <span style={{ fontFamily: "ui-monospace,monospace", fontSize: 9, padding: "1px 5px", borderRadius: 3, background: C.bg3, color: C.ink3, letterSpacing: "0.04em", textTransform: "uppercase" }}>{k.tag}</span>
            </div>
            <div style={{ fontWeight: 600, letterSpacing: "-0.028em", fontSize: 28, lineHeight: 1.1, marginTop: 4, fontVariantNumeric: "tabular-nums", color: C.ink }}>
              {typeof k.value === "number" && k.unit === "€" ? fmtEur(k.value) : typeof k.value === "number" && k.unit === "%" ? k.value.toFixed(1).replace(".", ",") : fmtN(typeof k.value === "number" ? k.value : 0)}
              {k.unit && k.unit !== "€" && <span style={{ color: C.ink3, fontWeight: 500, fontSize: 18, marginLeft: 2 }}>{k.unit}</span>}
            </div>
          </div>
        ))}
      </div>

      {/* ── ROW: HEALTH + SECTOR ─────────────────────── */}
      <div className="grid grid-cols-2 gap-4 mb-4">
        {/* Salud de cartera */}
        <Card>
          <CardHead title="Salud de cartera" subtitle={`${healthTotal} clientes`} />
          <div style={{ padding: "10px 18px 0" }}>
            {/* Segmented bar */}
            <div style={{ display: "flex", gap: 3, height: 10, marginBottom: 16 }}>
              {healthSegments.map(s => (
                <div key={s.label} style={{ flex: s.value || 0.001, borderRadius: 3, background: s.color }} />
              ))}
            </div>
          </div>
          {/* Health bars */}
          <div>
            {healthSegments.map((s, i) => (
              <div key={s.label} style={{ display: "grid", gridTemplateColumns: "1fr 1fr 80px", gap: 12, padding: "10px 18px", borderBottom: i < healthSegments.length - 1 ? `1px solid ${C.line3}` : "none", alignItems: "center" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <span style={{ width: 7, height: 7, borderRadius: 99, background: s.color, display: "inline-block", flexShrink: 0, boxShadow: s.tone === "green" ? `0 0 0 2px ${C.accentSoft}` : s.tone === "amber" ? `0 0 0 2px ${C.warnSoft}` : s.tone === "red" ? `0 0 0 2px ${C.redSoft}` : "none" }} />
                  <div>
                    <div style={{ fontWeight: 550, fontSize: 12.5, color: C.ink }}>{s.label}</div>
                    <div style={{ fontFamily: "ui-monospace,monospace", fontSize: 10, color: C.ink4, marginTop: 1 }}>{s.desc}</div>
                  </div>
                </div>
                <div style={{ height: 6, background: C.bg3, borderRadius: 99, overflow: "hidden" }}>
                  <div style={{ height: "100%", width: `${(s.value / healthTotal) * 100}%`, background: s.color, borderRadius: 99 }} />
                </div>
                <div style={{ textAlign: "right" }}>
                  <span style={{ fontFamily: "ui-monospace,monospace", fontSize: 12.5, fontWeight: 600, color: C.ink }}>{s.value}</span>
                  <span style={{ fontFamily: "ui-monospace,monospace", fontSize: 10, color: C.ink4, marginLeft: 5 }}>{healthTotal > 0 ? `${((s.value / healthTotal) * 100).toFixed(0)}%` : "0%"}</span>
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* Distribución por valor — real client revenue */}
        <Card>
          <CardHead title="Distribución por valor" subtitle="Top clientes por facturación" />
          <div style={{ padding: 18 }}>
            {(() => {
              const top = aggregates.distributionTop6.map(d => ({ name: d.name, v: d.value }))
              if (top.length === 0) {
                return <div style={{ textAlign: "center", color: C.ink3, fontSize: 12.5, padding: "24px 0" }}>Sin facturación registrada todavía</div>
              }
              const maxV = Math.max(...top.map(t => t.v), 1)
              return top.map(t => (
                <div key={t.name} style={{ display: "grid", gridTemplateColumns: "140px 1fr 80px", gap: 12, alignItems: "center", padding: "7px 0" }}>
                  <span style={{ fontSize: 12.5, fontWeight: 500, color: C.ink2, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{t.name}</span>
                  <div style={{ height: 6, background: C.bg3, borderRadius: 99, overflow: "hidden" }}>
                    <div style={{ width: `${(t.v / maxV) * 100}%`, height: "100%", background: C.accent, borderRadius: 99 }} />
                  </div>
                  <span style={{ fontFamily: "ui-monospace,monospace", fontSize: 11.5, fontWeight: 600, color: C.ink, textAlign: "right" }}>{fmtEur(t.v)}</span>
                </div>
              ))
            })()}
          </div>
        </Card>
      </div>

      {/* ── ATTENTION BANNER ─────────────────────────── */}
      {(attentionClients.length > 0 || enRiesgo > 0 || churnAlto > 0) && (
        <Card style={{ marginBottom: 16 }}>
          <CardHead
            title="Requieren atención"
            subtitle={`${enRiesgo + churnAlto} clientes · ${churnAlto} con riesgo de churn`}
            actions={
              <button style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "5px 9px", borderRadius: 6, background: C.bg, border: `1px solid ${C.line}`, color: C.ink2, fontSize: 11.5, fontWeight: 550, cursor: "pointer" }}>
                <Zap size={11} />Lanzar campaña de recuperación
              </button>
            }
          />
          <div style={{ padding: 18, display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 12 }}>
            {attentionClients.slice(0, 3).map((client) => {
              const isRed = client.effectiveStatus === "INACTIVE" || (client as any).isForgotten
              const daysSince = client.updatedAt ? Math.floor((referenceDate.getTime() - new Date(client.updatedAt).getTime()) / 86_400_000) : 0
              return (
                <div key={client.id} onClick={() => router.push(`/dashboard/clients/${client.id}`)}
                  style={{ padding: 16, borderRadius: 10, border: `1px solid ${isRed ? C.redSoft : C.warnSoft}`, background: isRed ? C.redSoft : C.warnSoft, cursor: "pointer", display: "flex", flexDirection: "column", gap: 8 }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 11, fontWeight: 600, color: isRed ? C.red : C.warn }}>
                    <span style={{ width: 7, height: 7, borderRadius: 99, background: isRed ? C.red : C.warn, display: "inline-block", boxShadow: `0 0 0 2px ${isRed ? C.redSoft : C.warnSoft}` }} />
                    {isRed ? "Riesgo alto" : "A vigilar"}
                  </div>
                  <div>
                    <div style={{ fontWeight: 600, fontSize: 14, color: C.ink, letterSpacing: "-0.01em" }}>{client.name || "Sin nombre"}</div>
                    <div style={{ fontSize: 12, color: C.ink3, marginTop: 2 }}>
                      {daysSince > 0 ? `Sin contacto · ${daysSince}d` : "Requiere atención"}
                    </div>
                  </div>
                  <div style={{ display: "flex", gap: 6, marginTop: 2 }}>
                    <button style={{ display: "inline-flex", alignItems: "center", gap: 5, padding: "4px 9px", borderRadius: 5, background: C.bg, border: `1px solid ${C.line}`, color: C.ink2, fontSize: 11, fontWeight: 550, cursor: "pointer" }} onClick={e => e.stopPropagation()}>
                      <Mail size={11} />Email
                    </button>
                    <button style={{ display: "inline-flex", alignItems: "center", gap: 5, padding: "4px 9px", borderRadius: 5, background: C.bg, border: `1px solid ${C.line}`, color: C.ink2, fontSize: 11, fontWeight: 550, cursor: "pointer" }} onClick={e => e.stopPropagation()}>
                      <Phone size={11} />Llamar
                    </button>
                    <button style={{ marginLeft: "auto", display: "inline-flex", alignItems: "center", gap: 4, padding: "4px 8px", borderRadius: 5, background: "transparent", border: "none", color: C.ink3, fontSize: 11, cursor: "pointer" }}>
                      Ver ficha →
                    </button>
                  </div>
                </div>
              )
            })}
            {/* Fill empty tiles if < 3 */}
            {attentionClients.length < 3 && enRiesgo + churnAlto > attentionClients.length && Array.from({ length: Math.min(3 - attentionClients.length, enRiesgo + churnAlto - attentionClients.length) }, (_, i) => (
              <div key={`placeholder-${i}`} style={{ padding: 16, borderRadius: 10, border: `1px solid ${C.warnSoft}`, background: C.warnSoft, display: "flex", flexDirection: "column", gap: 8 }}>
                <div style={{ fontSize: 11, fontWeight: 600, color: C.warn }}>A vigilar</div>
                <div style={{ fontSize: 12, color: C.ink3 }}>+ {enRiesgo + churnAlto - attentionClients.length - i} clientes más requieren seguimiento</div>
                <button onClick={() => setActiveSegment("risk")} style={{ alignSelf: "flex-start", padding: "4px 9px", borderRadius: 5, background: C.bg, border: `1px solid ${C.line}`, color: C.ink2, fontSize: 11, fontWeight: 550, cursor: "pointer" }}>
                  Ver todos →
                </button>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* ── SEGMENT CHIPS ────────────────────────────── */}
      <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap", marginBottom: 14 }}>
        <span style={{ fontFamily: "ui-monospace,monospace", fontSize: 10, color: C.ink4, textTransform: "uppercase", letterSpacing: "0.08em", flexShrink: 0 }}>Filtrar por</span>
        <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
          {segChips.map(chip => (
            <button key={chip.id} onClick={() => setActiveSegment(chip.id)} style={{
              display: "inline-flex", alignItems: "center", gap: 5,
              padding: "4px 10px", borderRadius: 99,
              fontSize: 12.5, fontWeight: 500, cursor: "pointer",
              border: `1px solid ${activeSegment === chip.id ? C.ink : C.line}`,
              background: activeSegment === chip.id ? C.ink : C.bg,
              color: activeSegment === chip.id ? "white" : C.ink2,
              transition: "all .1s ease",
            }}>
              {chip.label}
              <span style={{ fontFamily: "ui-monospace,monospace", fontSize: 10, padding: "0px 5px", borderRadius: 99, background: activeSegment === chip.id ? "rgba(255,255,255,0.2)" : C.bg3, color: activeSegment === chip.id ? "white" : C.ink3, fontWeight: 600 }}>
                {chip.count}
              </span>
            </button>
          ))}
        </div>
      </div>

      {viewMode === "health" ? (
        /* ── HEALTH VIEW ─────────────────────────────── */
        <Card style={{ marginBottom: 16 }}>
          <CardHead title="Vista de salud detallada" subtitle={`${clientesProcesados.length} clientes`} />
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12.5 }}>
              <thead>
                <tr>
                  {["Cliente", "Estado de salud", "LTV", "Última actividad", "Días sin contacto", ""].map((h, i) => (
                    <th key={i} style={{ padding: "9px 16px", textAlign: "left", fontFamily: "ui-monospace,monospace", fontSize: 10, fontWeight: 500, color: C.ink3, letterSpacing: "0.06em", textTransform: "uppercase", borderBottom: `1px solid ${C.line2}`, background: C.bg2, whiteSpace: "nowrap" }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {clientesProcesados.slice(0, 20).map(client => {
                  const isActive = client.effectiveStatus === "ACTIVE" || client.effectiveStatus === "VIP"
                  const isRisk = client.effectiveStatus === "FOLLOW_UP"
                  const healthColor = isActive ? C.accent : isRisk ? C.warn : C.red
                  const healthLabel = isActive ? (client.effectiveStatus === "VIP" ? "Champion" : "Saludable") : isRisk ? "En riesgo" : "Churn alto"
                  const daysSince = Math.floor((referenceDate.getTime() - new Date(client.updatedAt).getTime()) / 86_400_000)
                  return (
                    <tr key={client.id} onClick={() => router.push(`/dashboard/clients/${client.id}`)} style={{ cursor: "pointer", transition: "background .1s" }}
                      onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = C.bg2 }}
                      onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = "transparent" }}
                    >
                      <td style={{ padding: "11px 16px", borderBottom: `1px solid ${C.line3}` }}>
                        <div style={{ fontWeight: 550, color: C.ink }}>{client.name || "Sin nombre"}</div>
                        <div style={{ fontFamily: "ui-monospace,monospace", fontSize: 10.5, color: C.ink3 }}>{client.email || "—"}</div>
                      </td>
                      <td style={{ padding: "11px 16px", borderBottom: `1px solid ${C.line3}` }}>
                        <span style={{ display: "inline-flex", alignItems: "center", gap: 5, padding: "2px 8px", borderRadius: 99, fontSize: 11, fontWeight: 500, background: isActive ? C.accentSoft : isRisk ? C.warnSoft : C.redSoft, color: healthColor }}>
                          <span style={{ width: 5, height: 5, borderRadius: 99, background: healthColor, display: "inline-block" }} />
                          {healthLabel}
                        </span>
                      </td>
                      <td style={{ padding: "11px 16px", borderBottom: `1px solid ${C.line3}`, fontFamily: "ui-monospace,monospace", fontSize: 12.5, fontWeight: 600, color: C.ink }}>
                        {fmtEur((client as any).invoiceRevenue || client.totalSpent || 0)}
                      </td>
                      <td style={{ padding: "11px 16px", borderBottom: `1px solid ${C.line3}`, fontFamily: "ui-monospace,monospace", fontSize: 11, color: C.ink3 }}>
                        {new Date(client.updatedAt).toLocaleDateString("es-ES", { day: "numeric", month: "short" })}
                      </td>
                      <td style={{ padding: "11px 16px", borderBottom: `1px solid ${C.line3}`, fontFamily: "ui-monospace,monospace", fontSize: 12, fontWeight: 500, color: daysSince > 30 ? C.red : daysSince > 14 ? C.warn : C.accentInk }}>
                        {daysSince}d
                      </td>
                      <td style={{ padding: "11px 16px", borderBottom: `1px solid ${C.line3}` }}>
                        <button style={{ width: 26, height: 26, borderRadius: 5, display: "grid", placeItems: "center", background: "none", border: "none", cursor: "pointer", color: C.ink3 }} onClick={e => e.stopPropagation()}>
                          <MoreVertical size={14} />
                        </button>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </Card>
      ) : viewMode === "cohort" ? (
        /* ── COHORT VIEW ─────────────────────────────── */
        <Card style={{ marginBottom: 16 }}>
          <CardHead
            title="Retención por cohorte"
            subtitle="% que sigue activo cada mes desde su alta · últimos 6 trimestres"
          />
          <div style={{ padding: 18 }}>
            {cohortData.length === 0 ? (
              <div style={{ textAlign: "center", color: C.ink3, fontSize: 13, padding: "32px 0" }}>Sin datos de cohortes</div>
            ) : (
              <>
                <div style={{ display: "grid", gridTemplateColumns: "72px repeat(12, 1fr)", gap: 3, marginBottom: 6 }}>
                  <div />
                  {Array.from({ length: 12 }, (_, i) => (
                    <div key={i} style={{ fontFamily: "ui-monospace,monospace", fontSize: 9.5, color: C.ink4, textAlign: "center", letterSpacing: "0.04em" }}>M{i}</div>
                  ))}
                </div>
                {cohortData.map(co => (
                  <div key={co.co} style={{ display: "grid", gridTemplateColumns: "72px repeat(12, 1fr)", gap: 3, marginBottom: 3 }}>
                    <div style={{ fontFamily: "ui-monospace,monospace", fontSize: 10.5, color: C.ink3, display: "flex", alignItems: "center" }}>
                      {co.co}
                    </div>
                    {co.ret.map((p, i) => {
                      const lvl = cohortLevel(p as number | null)
                      return (
                        <div key={i} style={{ height: 28, borderRadius: 4, background: lvl < 0 ? C.bg2 : COHORT_COLORS[lvl] ?? C.bg3, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "ui-monospace,monospace", fontSize: 10, fontWeight: 500, color: lvl >= 4 ? "white" : C.ink2 }}>
                          {p !== null ? p : ""}
                        </div>
                      )
                    })}
                  </div>
                ))}
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: 14, fontFamily: "ui-monospace,monospace", fontSize: 10.5, color: C.ink3 }}>
                  <span>Cohorte ordenada por trimestre de alta</span>
                  <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
                    <span>0%</span>
                    {COHORT_COLORS.map((c, i) => (
                      <span key={i} style={{ display: "inline-block", width: 14, height: 14, borderRadius: 3, background: c }} />
                    ))}
                    <span>100%</span>
                  </div>
                </div>
              </>
            )}
          </div>
        </Card>
      ) : viewMode === "list" && (
        /* ── LIST VIEW ───────────────────────────────── */
        <>
          {/* Table */}
          <Card style={{ marginBottom: 16 }}>
            <div style={{ padding: "14px 18px", display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: `1px solid ${C.line2}`, gap: 12, flexWrap: "wrap" }}>
              <div>
                <h3 style={{ fontWeight: 600, letterSpacing: "-0.012em", fontSize: 13.5, margin: 0, color: C.ink }}>Mis clientes</h3>
                <div style={{ fontSize: 11.5, color: C.ink3, fontFamily: "ui-monospace,monospace", marginTop: 2 }}>{total} {total === 1 ? "resultado" : "resultados"}{loading ? " · cargando…" : ""}</div>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 6, flexWrap: "wrap" }}>
                {[["Sector", "Todos"], ["Owner", "Equipo"], ["Plan", "Cualquiera"], ["Estado", "Activo"]].map(([label, val]) => (
                  <div key={label} style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "5px 10px", border: `1px solid ${C.line}`, borderRadius: 6, background: C.bg, fontSize: 11.5, color: C.ink3, cursor: "pointer" }}>
                    <span>{label}</span><span style={{ color: C.ink, fontWeight: 550 }}>{val}</span>
                    <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M6 9l6 6 6-6" /></svg>
                  </div>
                ))}
              </div>
            </div>
            {/* Filters */}
            <div style={{ padding: "12px 18px", borderBottom: `1px solid ${C.line2}`, background: C.bg2 }}>
              <ClientsFilters
                currentFilters={currentFilters}
                searchValue={searchTerm}
                onSearchChange={setSearchTerm}
                statusValue={statusFilter}
                onStatusChange={setStatusFilter}
                sortValue={`${sortBy}-${sortOrder}`}
                onSortChange={handleSortChange}
              />
            </div>
            <ClientsTable clients={clientesProcesados} onClientUpdate={handleClientUpdate} />
            {hasMore && (
              <div style={{ display: "flex", justifyContent: "center", padding: "14px 18px", borderTop: `1px solid ${C.line2}` }}>
                <button
                  type="button"
                  onClick={loadMore}
                  disabled={loadingMore}
                  style={{ padding: "8px 16px", borderRadius: 6, border: `1px solid ${C.line}`, background: C.bg, color: C.ink2, fontSize: 12.5, fontWeight: 550, cursor: loadingMore ? "default" : "pointer", opacity: loadingMore ? 0.6 : 1 }}
                >
                  {loadingMore ? "Cargando…" : `Cargar más (${items.length} de ${total})`}
                </button>
              </div>
            )}
          </Card>

          {/* Cohort heatmap at bottom */}
          {cohortData.length > 0 && (
            <Card>
              <CardHead
                title="Retención por cohorte"
                subtitle="% que sigue activo cada mes desde su alta · últimos 6 trimestres"
              />
              <div style={{ padding: 18 }}>
                <div style={{ display: "grid", gridTemplateColumns: "72px repeat(12, 1fr)", gap: 3, marginBottom: 6 }}>
                  <div />
                  {Array.from({ length: 12 }, (_, i) => (
                    <div key={i} style={{ fontFamily: "ui-monospace,monospace", fontSize: 9.5, color: C.ink4, textAlign: "center" }}>M{i}</div>
                  ))}
                </div>
                {cohortData.map(co => (
                  <div key={co.co} style={{ display: "grid", gridTemplateColumns: "72px repeat(12, 1fr)", gap: 3, marginBottom: 3 }}>
                    <div style={{ fontFamily: "ui-monospace,monospace", fontSize: 10.5, color: C.ink3, display: "flex", alignItems: "center" }}>{co.co}</div>
                    {co.ret.map((p, i) => {
                      const lvl = cohortLevel(p as number | null)
                      return (
                        <div key={i} style={{ height: 26, borderRadius: 3, background: lvl < 0 ? C.bg2 : COHORT_COLORS[lvl] ?? C.bg3, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "ui-monospace,monospace", fontSize: 9.5, fontWeight: 500, color: lvl >= 4 ? "white" : C.ink3 }}>
                          {p !== null ? p : ""}
                        </div>
                      )
                    })}
                  </div>
                ))}
                <div style={{ display: "flex", justifyContent: "flex-end", gap: 4, alignItems: "center", marginTop: 12, fontFamily: "ui-monospace,monospace", fontSize: 10.5, color: C.ink3 }}>
                  <span>0%</span>
                  {COHORT_COLORS.map((c, i) => <span key={i} style={{ display: "inline-block", width: 12, height: 12, borderRadius: 2, background: c }} />)}
                  <span>100%</span>
                </div>
              </div>
            </Card>
          )}
        </>
      )}

    </div>
  )
}
