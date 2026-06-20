"use client"

import { useState, useEffect, useCallback } from "react"
import { Download, FileSpreadsheet, FileText, Users, Truck, Loader2, BarChart3 } from "lucide-react"
import { toast } from "sonner"
import { getReportsOverview, type ReportsOverview, type ReportsPeriod } from "../actions/getReportsOverview"

// ─── Design tokens (alineados con el resto del dashboard) ──────────────────
const C = {
  bg: "#ffffff", bg2: "#fafafa", bg3: "#f5f5f5",
  ink: "#0a0a0a", ink2: "#404040", ink3: "#737373", ink4: "#a3a3a3", ink5: "#d4d4d4",
  line: "#e8e8e8", line2: "#eeeeee", line3: "#f3f3f3",
  accent: "#16986e", accentSoft: "#ecf6f1", accentInk: "#0d7a56",
  warn: "#c2410c", red: "#b91c1c",
}

const PERIODS: Array<{ id: ReportsPeriod; label: string }> = [
  { id: "7d", label: "7d" },
  { id: "30d", label: "30d" },
  { id: "MTD", label: "MTD" },
  { id: "QTD", label: "QTD" },
  { id: "YTD", label: "YTD" },
]

// Periodos del selector de EXPORTACIÓN (independiente del periodo en pantalla)
type ExportPeriod = "1m" | "3m" | "6m" | "12m" | "custom"
const EXPORT_PERIODS: Array<{ id: ExportPeriod; label: string }> = [
  { id: "1m", label: "Último mes" },
  { id: "3m", label: "Trimestre" },
  { id: "6m", label: "Semestre" },
  { id: "12m", label: "Año" },
  { id: "custom", label: "Personalizado" },
]

const fmtEur = (n: number) =>
  n.toLocaleString("es-ES", { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + " €"

const fmtEurCompact = (n: number) =>
  n >= 1_000_000 ? `${(n / 1_000_000).toFixed(1)}M €` : n >= 10_000 ? `${(n / 1_000).toFixed(1)}k €` : fmtEur(n)

/** Delta % real periodo vs periodo anterior. null cuando no hay base de comparación. */
function calcDelta(current: number, previous: number): number | null {
  if (previous === 0) return null
  return Number((((current - previous) / previous) * 100).toFixed(1))
}

function DeltaTag({ delta }: { delta: number | null }) {
  if (delta === null) {
    return <span style={{ fontFamily: "ui-monospace,monospace", fontSize: 11, color: C.ink4 }}>sin periodo anterior</span>
  }
  return (
    <span style={{ fontFamily: "ui-monospace,monospace", fontSize: 11, color: delta >= 0 ? C.accentInk : C.warn }}>
      {delta >= 0 ? "+" : ""}{delta}% <span style={{ color: C.ink4 }}>vs ant.</span>
    </span>
  )
}

function KpiCard({ label, value, delta }: { label: string; value: string; delta?: number | null }) {
  return (
    <div style={{ background: C.bg, border: `1px solid ${C.line}`, borderRadius: 10, padding: "14px 16px", display: "flex", flexDirection: "column", gap: 4 }}>
      <div style={{ fontFamily: "ui-monospace,monospace", fontSize: 10.5, color: C.ink4, letterSpacing: "0.03em" }}>{label}</div>
      <div style={{ fontSize: 20, fontWeight: 600, letterSpacing: "-0.02em", color: C.ink, lineHeight: 1.1 }}>{value}</div>
      {delta !== undefined && <DeltaTag delta={delta} />}
    </div>
  )
}

function EmptyState({ message }: { message: string }) {
  return (
    <div style={{ padding: "28px 18px", display: "flex", flexDirection: "column", alignItems: "center", gap: 8, color: C.ink4 }}>
      <BarChart3 size={18} strokeWidth={1.5} />
      <span style={{ fontSize: 12.5 }}>{message}</span>
    </div>
  )
}

// ─── Gráfica SVG: ingresos cobrados últimos 12 meses (datos reales) ────────
function RevenueChart({ series }: { series: ReportsOverview["monthlySeries"] }) {
  const H = 160, W = 700, PAD_X = 8, PAD_Y = 16
  const hasData = series.some((m) => m.revenue > 0)
  if (!hasData) {
    return <EmptyState message="Aún no hay facturas cobradas en los últimos 12 meses." />
  }
  const maxRev = Math.max(...series.map((m) => m.revenue), 1)
  const pts = series.map((m, i) => ({
    x: PAD_X + (i / (series.length - 1)) * (W - PAD_X * 2),
    y: PAD_Y + (1 - m.revenue / maxRev) * (H - PAD_Y * 2),
  }))
  const polyline = pts.map((p) => `${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(" ")
  const area = `M${pts.map((p) => `${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(" L")} L${pts[pts.length - 1].x.toFixed(1)},${H - PAD_Y} L${pts[0].x.toFixed(1)},${H - PAD_Y} Z`
  return (
    <div style={{ padding: "12px 18px 8px" }}>
      <svg viewBox={`0 0 ${W} ${H}`} style={{ width: "100%", height: H, display: "block" }} preserveAspectRatio="none">
        <defs>
          <linearGradient id="repAreaGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={C.accent} stopOpacity="0.18" />
            <stop offset="100%" stopColor={C.accent} stopOpacity="0" />
          </linearGradient>
        </defs>
        <path d={area} fill="url(#repAreaGrad)" />
        <polyline points={polyline} fill="none" stroke={C.accent} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        {pts.map((pt, i) => (
          <circle key={i} cx={pt.x} cy={pt.y} r="3" fill={C.accent} stroke="white" strokeWidth="1.5">
            <title>{`${series[i].month}: ${fmtEur(series[i].revenue)}`}</title>
          </circle>
        ))}
        {series.map((m, i) => (
          <text key={i} x={PAD_X + (i / (series.length - 1)) * (W - PAD_X * 2)} y={H - 2} textAnchor="middle" style={{ fontSize: 9, fill: C.ink4, fontFamily: "ui-monospace,monospace" }}>
            {m.month}
          </text>
        ))}
      </svg>
    </div>
  )
}

// ─── Main ───────────────────────────────────────────────────────────────────
export function ReportingView() {
  const [data, setData] = useState<ReportsOverview | null>(null)
  const [loading, setLoading] = useState(true)
  const [period, setPeriod] = useState<ReportsPeriod>("MTD")
  const [exporting, setExporting] = useState<"xlsx" | "pdf" | null>(null)
  // Modal de exportación: formato elegido (abre el modal) + periodo a exportar
  const [exportFmt, setExportFmt] = useState<"xlsx" | "pdf" | null>(null)
  const [expPeriod, setExpPeriod] = useState<ExportPeriod>("1m")
  const [expFrom, setExpFrom] = useState("")
  const [expTo, setExpTo] = useState("")

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    getReportsOverview(period)
      .then((d) => { if (!cancelled) setData(d) })
      .catch(() => { if (!cancelled) toast.error("Error al cargar los informes") })
      .finally(() => { if (!cancelled) setLoading(false) })
    return () => { cancelled = true }
  }, [period])

  // Exporta el periodo elegido en el modal (preset relativo o rango personalizado).
  const runExport = useCallback(async () => {
    if (!exportFmt) return
    if (expPeriod === "custom" && (!expFrom || !expTo || expFrom > expTo)) {
      toast.error("Elige un rango de fechas válido (desde ≤ hasta)")
      return
    }
    const fmt = exportFmt
    setExporting(fmt)
    try {
      const qs = new URLSearchParams({ format: fmt })
      if (expPeriod === "custom") { qs.set("from", expFrom); qs.set("to", expTo) }
      else qs.set("period", expPeriod)
      const res = await fetch(`/api/dashboard/export?${qs.toString()}`)
      if (!res.ok) throw new Error("export failed")
      const blob = await res.blob()
      const a = document.createElement("a")
      a.href = URL.createObjectURL(blob)
      const tag = expPeriod === "custom" ? `${expFrom}_${expTo}` : expPeriod
      a.download = `informe-${tag}-${new Date().toISOString().split("T")[0]}.${fmt}`
      a.click()
      URL.revokeObjectURL(a.href)
      setExportFmt(null)
    } catch {
      toast.error("No se pudo generar la exportación")
    } finally {
      setExporting(null)
    }
  }, [exportFmt, expPeriod, expFrom, expTo])

  const revDelta = data ? calcDelta(data.revenue.current, data.revenue.previous) : null
  const leadsDelta = data ? calcDelta(data.leads.created, data.leads.prevCreated) : null
  const clientsDelta = data ? calcDelta(data.clients.newInPeriod, data.clients.prevNew) : null

  return (
    <div style={{ fontFamily: "var(--font-geist-sans, ui-sans-serif, system-ui, sans-serif)" }}>

      {/* ── HEADER ──────────────────────────────────────────────────────── */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: 22, gap: 20, paddingBottom: 18, borderBottom: `1px solid ${C.line2}`, flexWrap: "wrap" }}>
        <div>
          <h1 style={{ fontWeight: 600, letterSpacing: "-0.022em", fontSize: 26, lineHeight: 1.1, margin: 0, color: C.ink }}>Informes</h1>
          <div style={{ marginTop: 6, fontSize: 12.5, color: C.ink3 }}>
            Resumen de negocio con datos reales · periodo {period}
          </div>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
          <div style={{ display: "inline-flex", background: C.bg2, border: `1px solid ${C.line}`, borderRadius: 7, padding: 2 }}>
            {PERIODS.map((p) => {
              const active = period === p.id
              return (
                <button key={p.id} onClick={() => setPeriod(p.id)} style={{
                  padding: "4px 10px", borderRadius: 5, fontFamily: "ui-monospace,monospace",
                  fontSize: 11.5, color: active ? C.ink : C.ink3, fontWeight: 500,
                  background: active ? "white" : "transparent",
                  boxShadow: active ? `0 0 0 1px ${C.line} inset, 0 1px 2px rgba(0,0,0,.04)` : "none",
                  border: "none", cursor: "pointer",
                }}>
                  {p.label}
                </button>
              )
            })}
          </div>
          <button onClick={() => setExportFmt("xlsx")} disabled={exporting !== null} style={{ display: "inline-flex", alignItems: "center", gap: 7, padding: "7px 12px", borderRadius: 6, background: C.bg, border: `1px solid ${C.line}`, color: C.ink2, fontWeight: 550, fontSize: 12.5, cursor: exporting ? "wait" : "pointer", opacity: exporting && exporting !== "xlsx" ? 0.6 : 1 }}>
            {exporting === "xlsx" ? <Loader2 size={12} className="animate-spin" /> : <FileSpreadsheet size={12} strokeWidth={2} />}
            Exportar Excel
          </button>
          <button onClick={() => setExportFmt("pdf")} disabled={exporting !== null} style={{ display: "inline-flex", alignItems: "center", gap: 7, padding: "7px 12px", borderRadius: 6, background: C.ink, color: "white", fontWeight: 550, fontSize: 12.5, border: "none", cursor: exporting ? "wait" : "pointer", opacity: exporting && exporting !== "pdf" ? 0.6 : 1 }}>
            {exporting === "pdf" ? <Loader2 size={12} className="animate-spin" /> : <Download size={12} strokeWidth={2} />}
            Exportar PDF
          </button>
        </div>
      </div>

      {/* ── LOADING SKELETON ─────────────────────────────────────────────── */}
      {loading || !data ? (
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))", gap: 10 }}>
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} style={{ height: 84, background: C.bg2, borderRadius: 10, border: `1px solid ${C.line}` }} />
            ))}
          </div>
          {[220, 200, 180].map((h, i) => (
            <div key={i} style={{ height: h, background: C.bg2, borderRadius: 10, border: `1px solid ${C.line}` }} />
          ))}
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>

          {/* ── KPI STRIP (datos reales con deltas reales) ────────────────── */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))", gap: 10 }}>
            <KpiCard label={`Ingresos cobrados · ${period}`} value={fmtEurCompact(data.revenue.current)} delta={revDelta} />
            <KpiCard label={`Facturas emitidas · ${period}`} value={String(data.invoices.issued)} />
            <KpiCard label={`Leads nuevos · ${period}`} value={String(data.leads.created)} delta={leadsDelta} />
            <KpiCard
              label={`Conversión de leads · ${period}`}
              value={data.leads.conversionRate !== null ? `${data.leads.conversionRate}%` : "—"}
            />
            <KpiCard label={`Clientes nuevos · ${period}`} value={String(data.clients.newInPeriod)} delta={clientsDelta} />
          </div>

          {/* ── INGRESOS 12 MESES ─────────────────────────────────────────── */}
          <div style={{ background: C.bg, border: `1px solid ${C.line}`, borderRadius: 10, overflow: "hidden" }}>
            <div style={{ padding: "14px 18px", borderBottom: `1px solid ${C.line2}` }}>
              <h3 style={{ fontWeight: 600, letterSpacing: "-0.012em", fontSize: 13.5, margin: 0, color: C.ink }}>Ingresos cobrados por mes</h3>
              <div style={{ fontFamily: "ui-monospace,monospace", fontSize: 11, color: C.ink3, marginTop: 2 }}>
                Últimos 12 meses · facturas pagadas (paidAt)
              </div>
            </div>
            <RevenueChart series={data.monthlySeries} />
          </div>

          {/* ── FACTURACIÓN + TOP CLIENTES ────────────────────────────────── */}
          <div className="rep-grid" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>

            {/* Facturación */}
            <div style={{ background: C.bg, border: `1px solid ${C.line}`, borderRadius: 10, overflow: "hidden" }}>
              <div style={{ padding: "14px 18px", borderBottom: `1px solid ${C.line2}` }}>
                <h3 style={{ fontWeight: 600, fontSize: 13.5, letterSpacing: "-0.012em", margin: 0, color: C.ink }}>Facturación</h3>
                <div style={{ fontFamily: "ui-monospace,monospace", fontSize: 11, color: C.ink3, marginTop: 2 }}>Estado de facturas · periodo {period}</div>
              </div>
              <div style={{ padding: "8px 18px 14px" }}>
                {[
                  { label: `Emitidas (${period})`, value: String(data.invoices.issued), color: C.ink },
                  { label: `Pagadas (${period})`, value: String(data.invoices.paid), color: C.accentInk },
                  { label: "Vencidas (total)", value: String(data.invoices.overdue), color: data.invoices.overdue > 0 ? C.red : C.ink },
                  { label: `Pendiente de cobro (${data.invoices.pendingCount} fact.)`, value: fmtEur(data.invoices.pendingAmount), color: data.invoices.pendingAmount > 0 ? C.warn : C.ink },
                ].map((row, i, arr) => (
                  <div key={row.label} style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", padding: "9px 0", borderBottom: i < arr.length - 1 ? `1px solid ${C.line3}` : "none" }}>
                    <span style={{ fontSize: 12.5, color: C.ink3 }}>{row.label}</span>
                    <span style={{ fontFamily: "ui-monospace,monospace", fontSize: 13, fontWeight: 600, color: row.color }}>{row.value}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Top clientes */}
            <div style={{ background: C.bg, border: `1px solid ${C.line}`, borderRadius: 10, overflow: "hidden" }}>
              <div style={{ padding: "14px 18px", borderBottom: `1px solid ${C.line2}` }}>
                <h3 style={{ fontWeight: 600, fontSize: 13.5, letterSpacing: "-0.012em", margin: 0, color: C.ink }}>Top clientes por ingresos</h3>
                <div style={{ fontFamily: "ui-monospace,monospace", fontSize: 11, color: C.ink3, marginTop: 2 }}>Facturas cobradas · periodo {period}</div>
              </div>
              {data.topClients.length === 0 ? (
                <EmptyState message="Sin cobros en este periodo." />
              ) : (
                <div style={{ padding: "8px 18px 14px" }}>
                  {data.topClients.map((c, i, arr) => {
                    const maxRev = arr[0]?.revenue || 1
                    return (
                      <div key={`${c.name}-${i}`} style={{ padding: "8px 0", borderBottom: i < arr.length - 1 ? `1px solid ${C.line3}` : "none" }}>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 4 }}>
                          <span style={{ fontSize: 12.5, color: C.ink2, fontWeight: 500, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", maxWidth: "60%" }}>{c.name}</span>
                          <span style={{ fontFamily: "ui-monospace,monospace", fontSize: 11.5, color: C.ink }}>
                            {fmtEurCompact(c.revenue)} <span style={{ color: C.ink4 }}>· {c.count} fact.</span>
                          </span>
                        </div>
                        <div style={{ height: 5, background: C.bg3, borderRadius: 99, overflow: "hidden" }}>
                          <div style={{ height: "100%", borderRadius: 99, width: `${Math.max(4, (c.revenue / maxRev) * 100)}%`, background: i === 0 ? C.accent : C.line }} />
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </div>
          </div>

          {/* ── CARTERA: clientes y proveedores ───────────────────────────── */}
          <div className="rep-grid" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
            <div style={{ background: C.bg, border: `1px solid ${C.line}`, borderRadius: 10, padding: "14px 18px", display: "flex", alignItems: "center", gap: 14 }}>
              <div style={{ width: 34, height: 34, borderRadius: 8, background: C.accentSoft, display: "grid", placeItems: "center", color: C.accentInk, flexShrink: 0 }}>
                <Users size={16} strokeWidth={1.8} />
              </div>
              <div>
                <div style={{ fontSize: 17, fontWeight: 600, color: C.ink, letterSpacing: "-0.02em" }}>{data.clients.total}</div>
                <div style={{ fontSize: 11.5, color: C.ink3 }}>Clientes en cartera · {data.clients.newInPeriod} nuevos en {period}</div>
              </div>
            </div>
            <div style={{ background: C.bg, border: `1px solid ${C.line}`, borderRadius: 10, padding: "14px 18px", display: "flex", alignItems: "center", gap: 14 }}>
              <div style={{ width: 34, height: 34, borderRadius: 8, background: C.bg3, display: "grid", placeItems: "center", color: C.ink2, flexShrink: 0 }}>
                <Truck size={16} strokeWidth={1.8} />
              </div>
              <div>
                <div style={{ fontSize: 17, fontWeight: 600, color: C.ink, letterSpacing: "-0.02em" }}>{data.providers.total}</div>
                <div style={{ fontSize: 11.5, color: C.ink3 }}>Proveedores · {data.providers.active} activos</div>
              </div>
            </div>
          </div>

          {/* ── LEADS ─────────────────────────────────────────────────────── */}
          <div style={{ background: C.bg, border: `1px solid ${C.line}`, borderRadius: 10, overflow: "hidden" }}>
            <div style={{ padding: "14px 18px", borderBottom: `1px solid ${C.line2}` }}>
              <h3 style={{ fontWeight: 600, fontSize: 13.5, letterSpacing: "-0.012em", margin: 0, color: C.ink }}>Leads y conversión</h3>
              <div style={{ fontFamily: "ui-monospace,monospace", fontSize: 11, color: C.ink3, marginTop: 2 }}>Periodo {period} vs periodo anterior</div>
            </div>
            {data.leads.created === 0 && data.leads.converted === 0 ? (
              <EmptyState message="Sin actividad de leads en este periodo." />
            ) : (
              <div style={{ padding: "8px 18px 14px", display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))", gap: 14 }}>
                {[
                  { label: "Leads creados", value: String(data.leads.created), prev: `ant. ${data.leads.prevCreated}` },
                  { label: "Convertidos a cliente", value: String(data.leads.converted), prev: `ant. ${data.leads.prevConverted}` },
                  { label: "Tasa de conversión", value: data.leads.conversionRate !== null ? `${data.leads.conversionRate}%` : "—", prev: "" },
                ].map((b) => (
                  <div key={b.label} style={{ padding: "10px 0" }}>
                    <div style={{ fontFamily: "ui-monospace,monospace", fontSize: 10.5, color: C.ink4 }}>{b.label}</div>
                    <div style={{ fontSize: 18, fontWeight: 600, color: C.ink, marginTop: 2 }}>{b.value}</div>
                    {b.prev && <div style={{ fontFamily: "ui-monospace,monospace", fontSize: 10.5, color: C.ink4, marginTop: 2 }}>{b.prev}</div>}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── MODAL: elegir periodo a exportar ──────────────────────────────── */}
      {exportFmt && (
        <div
          onClick={() => { if (!exporting) setExportFmt(null) }}
          style={{ position: "fixed", inset: 0, background: "rgba(10,10,10,0.45)", display: "grid", placeItems: "center", zIndex: 1000, padding: 16 }}
        >
          <div onClick={(e) => e.stopPropagation()} role="dialog" aria-modal="true" style={{ background: C.bg, borderRadius: 12, border: `1px solid ${C.line}`, width: "100%", maxWidth: 430, padding: 22, boxShadow: "0 20px 50px -20px rgba(0,0,0,.35)" }}>
            <h3 style={{ margin: 0, fontSize: 16, fontWeight: 600, color: C.ink, letterSpacing: "-0.01em" }}>
              Exportar {exportFmt === "xlsx" ? "Excel" : "PDF"}
            </h3>
            <p style={{ margin: "6px 0 16px", fontSize: 12.5, color: C.ink3 }}>¿Qué periodo quieres exportar?</p>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
              {EXPORT_PERIODS.map((o) => {
                const active = expPeriod === o.id
                return (
                  <button
                    key={o.id}
                    onClick={() => setExpPeriod(o.id)}
                    style={{
                      padding: "10px 12px", borderRadius: 8, fontSize: 13, fontWeight: 550, textAlign: "left",
                      border: `1px solid ${active ? C.accent : C.line}`,
                      background: active ? C.accentSoft : C.bg, color: active ? C.accentInk : C.ink2,
                      cursor: "pointer", gridColumn: o.id === "custom" ? "1 / -1" : "auto",
                    }}
                  >
                    {o.label}
                  </button>
                )
              })}
            </div>

            {expPeriod === "custom" && (
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginTop: 12 }}>
                <label style={{ fontSize: 11.5, color: C.ink3 }}>
                  Desde
                  <input type="date" value={expFrom} max={expTo || undefined} onChange={(e) => setExpFrom(e.target.value)}
                    style={{ width: "100%", marginTop: 4, padding: "8px 10px", borderRadius: 7, border: `1px solid ${C.line}`, fontSize: 13, color: C.ink }} />
                </label>
                <label style={{ fontSize: 11.5, color: C.ink3 }}>
                  Hasta
                  <input type="date" value={expTo} min={expFrom || undefined} onChange={(e) => setExpTo(e.target.value)}
                    style={{ width: "100%", marginTop: 4, padding: "8px 10px", borderRadius: 7, border: `1px solid ${C.line}`, fontSize: 13, color: C.ink }} />
                </label>
              </div>
            )}

            <div style={{ display: "flex", justifyContent: "flex-end", gap: 8, marginTop: 20 }}>
              <button onClick={() => setExportFmt(null)} disabled={exporting !== null}
                style={{ padding: "8px 14px", borderRadius: 7, border: `1px solid ${C.line}`, background: C.bg, color: C.ink2, fontSize: 12.5, fontWeight: 550, cursor: exporting ? "wait" : "pointer" }}>
                Cancelar
              </button>
              <button onClick={runExport} disabled={exporting !== null}
                style={{ display: "inline-flex", alignItems: "center", gap: 7, padding: "8px 16px", borderRadius: 7, border: "none", background: C.ink, color: "white", fontSize: 12.5, fontWeight: 600, cursor: exporting ? "wait" : "pointer" }}>
                {exporting ? <Loader2 size={12} className="animate-spin" /> : <Download size={12} strokeWidth={2} />}
                Exportar
              </button>
            </div>
          </div>
        </div>
      )}

      <style>{`
        @media (max-width: 860px) { .rep-grid { grid-template-columns: 1fr !important; } }
      `}</style>
    </div>
  )
}
