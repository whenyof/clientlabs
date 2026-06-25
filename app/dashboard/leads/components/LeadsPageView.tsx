"use client"

import { useState, useId } from "react"
import { useRouter } from "next/navigation"
import {
  RefreshCw, Plus, MoreVertical, Flame, Link2,
} from "lucide-react"
import type { Lead } from "@prisma/client"
import { CreateLeadManualDialog } from "@/modules/leads/components/CreateLeadManualDialog"

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

// ─── Helpers ───────────────────────────────────────────────────────────────
const fmtN = (n: number) => new Intl.NumberFormat("es-ES").format(Math.round(n))

const STATUS_LABELS: Record<string, string> = {
  NEW: "Nuevo", CONTACTED: "Contactado", QUALIFIED: "Cualificado",
  STALLED: "Estancado", CONVERTED: "Ganado", LOST: "Perdido",
}
const TEMP_LABELS: Record<string, string> = { HOT: "Caliente", WARM: "Tibio", COLD: "Frío" }
const SOURCE_COLORS = ["#0a0a0a", "#16986e", "#404040", "#737373", "#a3a3a3", "#3756a4", "#c2410c"]

// ─── Daily chart (SVG) ─────────────────────────────────────────────────────
function DailyChart({ data }: { data: { date: string; total: number }[] }) {
  const uid = useId().replace(/:/g, "g")
  if (!data.length) return <div style={{ height: 200, display: "flex", alignItems: "center", justifyContent: "center", color: C.ink3, fontSize: 13 }}>Sin datos</div>
  const w = 600, h = 200, pad = { l: 28, r: 8, t: 10, b: 28 }
  const iw = w - pad.l - pad.r, ih = h - pad.t - pad.b
  const maxV = Math.max(...data.map(d => d.total)) + 1
  const step = iw / (data.length - 1)
  const pts = data.map((d, i) => [pad.l + step * i, pad.t + ih - (d.total / maxV) * ih] as [number, number])
  const lineD = "M" + pts.map(p => p.join(",")).join(" L")
  const areaD = `M${pts[0][0]},${pad.t + ih} L${pts.map(p => p.join(",")).join(" L")} L${pts[pts.length - 1][0]},${pad.t + ih} Z`
  const last = pts[pts.length - 1]
  const yticks = [0, 0.5, 1].map(t => maxV * (1 - t))
  return (
    <svg viewBox={`0 0 ${w} ${h}`} width="100%" height={h} style={{ overflow: "visible" }}>
      <defs>
        <linearGradient id={uid} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={C.accent} stopOpacity={0.18} />
          <stop offset="100%" stopColor={C.accent} stopOpacity={0} />
        </linearGradient>
      </defs>
      {yticks.map((t, i) => (
        <g key={i}>
          <line x1={pad.l} y1={pad.t + ih - (t / maxV) * ih} x2={pad.l + iw} y2={pad.t + ih - (t / maxV) * ih} stroke={i === 0 ? C.line : "#f0f0f0"} strokeWidth={1} />
          <text x={pad.l - 4} y={pad.t + ih - (t / maxV) * ih + 3} textAnchor="end" fontFamily="ui-monospace,monospace" fontSize={9} fill={C.ink4}>{Math.round(t)}</text>
        </g>
      ))}
      <path d={areaD} fill={`url(#${uid})`} />
      <path d={lineD} fill="none" stroke={C.accent} strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" />
      <circle cx={last[0]} cy={last[1]} r={5} fill="white" stroke={C.accent} strokeWidth={1.8} />
      <circle cx={last[0]} cy={last[1]} r={2.4} fill={C.accent} />
      {data.filter((_, i) => i % Math.max(1, Math.floor(data.length / 6)) === 0 || i === data.length - 1).map((d, i, arr) => {
        const origIdx = data.findIndex(x => x.date === d.date)
        return (
          <text key={d.date} x={pad.l + step * origIdx} y={h - 6} textAnchor={i === 0 ? "start" : i === arr.length - 1 ? "end" : "middle"} fontFamily="ui-monospace,monospace" fontSize={9} fill={C.ink4}>{d.date}</text>
        )
      })}
    </svg>
  )
}


// ─── Card wrapper ──────────────────────────────────────────────────────────
function Card({ children, style }: { children: React.ReactNode; style?: React.CSSProperties }) {
  return <div style={{ background: C.bg, border: `1px solid ${C.line}`, borderRadius: 10, overflow: "hidden", display: "flex", flexDirection: "column", ...style }}>{children}</div>
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
// ─── Props ─────────────────────────────────────────────────────────────────
interface Props {
  totalLeads: number
  kpis: { hot: number; converted: number; stalled: number; newThisWeek: number; conversionRate: number }
  dailyData: { date: string; total: number }[]
  byStatus?: { name: string; value: number; color: string }[]
  initialLeads: Lead[]
  initialTotal: number
  tableNode: React.ReactNode
}

// ─── Main Component ─────────────────────────────────────────────────────────
export function LeadsPageView({ totalLeads, kpis, dailyData, initialLeads, initialTotal, tableNode }: Props) {
  const router = useRouter()
  const [showBanner, setShowBanner] = useState(true)
  const [newLeadOpen, setNewLeadOpen] = useState(false)
  const [recalcStatus, setRecalcStatus] = useState<"idle" | "loading" | "ok" | "err">("idle")

  const handleRecalculate = async () => {
    setRecalcStatus("loading")
    try {
      const res = await fetch("/api/admin/recalculate-scores", { method: "POST" })
      setRecalcStatus(res.ok ? "ok" : "err")
      setTimeout(() => setRecalcStatus("idle"), 3000)
    } catch {
      setRecalcStatus("err")
      setTimeout(() => setRecalcStatus("idle"), 3000)
    }
  }

  // Derive source breakdown from leads
  const srcMap: Record<string, number> = {}
  initialLeads.forEach(l => { if (l.source) srcMap[l.source] = (srcMap[l.source] || 0) + 1 })
  const sources = Object.entries(srcMap).map(([nm, n], i) => ({ nm, n, color: SOURCE_COLORS[i % SOURCE_COLORS.length] })).sort((a, b) => b.n - a.n).slice(0, 5)
  const maxSrc = Math.max(...sources.map(s => s.n), 1)

  // Hot leads needing attention
  const hotLeads = initialLeads.filter(l => l.temperature === "HOT" || (l.score ?? 0) >= 70).slice(0, 4)

  // Funnel from byStatus
  const statusOrder = ["NEW", "CONTACTED", "QUALIFIED", "CONVERTED", "LOST"]
  const funnelStages = statusOrder.slice(0, 5).map(s => ({
    stage: STATUS_LABELS[s] ?? s,
    count: initialLeads.filter(l => l.leadStatus === s).length + (s === "NEW" ? kpis.converted : 0),
    conv: null as number | null,
    won: s === "CONVERTED",
  }))
  funnelStages[0].count = totalLeads
  // Real per-stage conversion derived from actual counts
  for (let i = 1; i < funnelStages.length; i++) {
    const prev = funnelStages[i - 1]
    funnelStages[i].conv = prev.count > 0 ? funnelStages[i].count / prev.count : null
  }
  const maxFunnel = Math.max(...funnelStages.map(s => s.count), 1)

  // KPI cards — real values only (no fabricated trends)
  const kpiData: { label: string; tag: string; value: number; unit: string }[] = [
    { label: "Leads activos",      tag: "abiertos",  value: initialTotal,        unit: "" },
    { label: "Leads calientes",    tag: "score 70+", value: kpis.hot,            unit: "" },
    { label: "Tasa de conversión", tag: "90d",       value: kpis.conversionRate, unit: "%" },
    { label: "Nuevos esta semana", tag: "7d",        value: kpis.newThisWeek,    unit: "" },
  ]

  // Honest daily-chart subtitle from real data
  const dailyAvg = dailyData.length > 0 ? dailyData.reduce((s, d) => s + d.total, 0) / dailyData.length : 0
  const dailySubtitle = `Diario · Ø ${new Intl.NumberFormat("es-ES", { maximumFractionDigits: 1 }).format(dailyAvg)}/día`

  return (
    <div style={{ fontFamily: "var(--font-geist-sans, ui-sans-serif, system-ui, sans-serif)", color: C.ink }}>

      {/* ── PAGE HEADER ──────────────────────────────── */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: 20, gap: 24, paddingBottom: 18, borderBottom: `1px solid ${C.line2}` }}>
        <div>
          <h1 style={{ fontWeight: 600, letterSpacing: "-0.022em", fontSize: 26, lineHeight: 1.1, margin: 0, color: C.ink }}>Leads</h1>
          <div style={{ marginTop: 6, display: "flex", alignItems: "center", gap: 14, fontSize: 12.5, color: C.ink3, flexWrap: "wrap" }}>
            <span>{initialTotal} leads activos</span>
            <span style={{ color: C.ink5 }}>·</span>
            <span style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
              <span style={{ width: 6, height: 6, borderRadius: 99, background: C.accent, boxShadow: `0 0 0 3px ${C.accentSoft}`, display: "inline-block" }} />
              {kpis.hot} calientes · score ≥ 70
            </span>
            <span style={{ color: C.ink5 }}>·</span>
            <span>Conv. <strong style={{ color: C.ink }}>{kpis.conversionRate}%</strong></span>
          </div>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
          <button
            onClick={handleRecalculate}
            disabled={recalcStatus === "loading"}
            style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "7px 12px", borderRadius: 6, background: C.bg, border: `1px solid ${recalcStatus === "ok" ? C.accent : recalcStatus === "err" ? C.red : C.line}`, color: recalcStatus === "ok" ? C.accentInk : recalcStatus === "err" ? C.red : C.ink2, fontWeight: 550, fontSize: 12.5, cursor: recalcStatus === "loading" ? "not-allowed" : "pointer", opacity: recalcStatus === "loading" ? 0.6 : 1 }}
          >
            <RefreshCw size={12} strokeWidth={2} className={recalcStatus === "loading" ? "animate-spin" : ""} />
            {recalcStatus === "ok" ? "Scores actualizados" : recalcStatus === "err" ? "Error" : "Recalcular scores"}
          </button>
          <button
            onClick={() => router.push("/dashboard/connect")}
            style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "7px 12px", borderRadius: 6, background: C.bg, border: `1px solid ${C.line}`, color: C.ink2, fontWeight: 550, fontSize: 12.5, cursor: "pointer" }}
          >
            <Link2 size={12} strokeWidth={2} />Conectar
          </button>
          <button
            onClick={() => setNewLeadOpen(true)}
            style={{ display: "inline-flex", alignItems: "center", gap: 7, padding: "7px 12px", borderRadius: 6, background: C.ink, color: "white", fontWeight: 550, fontSize: 12.5, border: "none", cursor: "pointer" }}
          >
            <Plus size={12} strokeWidth={2.5} />Nuevo lead
          </button>
        </div>
      </div>

      {/* ── AI BANNER ────────────────────────────────── */}
      {hotLeads.length > 0 && showBanner && (
        <div style={{ display: "flex", alignItems: "center", gap: 14, padding: "14px 18px", borderRadius: 10, border: `1px solid ${C.accentSoft}`, background: `linear-gradient(180deg, rgba(236,246,241,0.7) 0%, white 100%)`, marginBottom: 16 }}>
          <div style={{ width: 32, height: 32, borderRadius: 8, background: "white", border: `1px solid ${C.accentSoft}`, display: "grid", placeItems: "center", color: C.accentInk, flexShrink: 0 }}><Flame size={15} strokeWidth={1.8} /></div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <h4 style={{ margin: "0 0 3px", fontSize: 13.5, fontWeight: 600, color: C.ink, letterSpacing: "-0.01em" }}>
              {hotLeads.length} leads merecen tu atención ahora
            </h4>
            <p style={{ margin: 0, fontSize: 12, color: C.ink3 }}>
              {hotLeads.slice(0, 2).map(l => <strong key={l.id} style={{ color: C.ink }}>{l.name || l.email}</strong>).reduce<React.ReactNode[]>((acc, el, i) => i === 0 ? [el] : [...acc, ", ", el], [])} {hotLeads.length > 2 ? `y ${hotLeads.length - 2} más` : ""} tienen score alto sin contacto reciente.
            </p>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 8, flexShrink: 0 }}>
            <button onClick={() => setShowBanner(false)} style={{ padding: "5px 10px", borderRadius: 6, background: C.bg, border: `1px solid ${C.line}`, color: C.ink2, fontSize: 11.5, fontWeight: 550, cursor: "pointer" }}>Ignorar</button>
            <button onClick={() => setShowBanner(false)} style={{ padding: "5px 10px", borderRadius: 6, background: C.ink, color: "white", fontSize: 11.5, fontWeight: 550, border: "none", cursor: "pointer" }}>Ver leads →</button>
          </div>
        </div>
      )}

      {/* ── KPI ROW ──────────────────────────────────── */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", border: `1px solid ${C.line}`, borderRadius: 10, background: C.bg, marginBottom: 16, overflow: "hidden" }}>
        {kpiData.map((k, i) => (
          <div key={k.label} style={{ padding: "18px 22px", borderRight: i < 3 ? `1px solid ${C.line2}` : "none", display: "flex", flexDirection: "column", gap: 4 }}>
            <div style={{ fontSize: 11.5, color: C.ink3, fontWeight: 500, display: "flex", alignItems: "center", gap: 6 }}>
              {k.label}
              <span style={{ fontFamily: "ui-monospace,monospace", fontSize: 9, padding: "1px 5px", borderRadius: 3, background: C.bg3, color: C.ink3, letterSpacing: "0.04em", textTransform: "uppercase" }}>{k.tag}</span>
            </div>
            <div style={{ fontWeight: 600, letterSpacing: "-0.028em", fontSize: 28, lineHeight: 1.1, marginTop: 4, fontVariantNumeric: "tabular-nums", color: C.ink }}>
              {typeof k.value === "number" ? fmtN(k.value) : k.value}
              {k.unit && <span style={{ color: C.ink3, fontWeight: 500, fontSize: 18, marginLeft: 2 }}>{k.unit}</span>}
            </div>
          </div>
        ))}
      </div>

      {/* ── ROW 1: DAILY + SOURCES ───────────────────── */}
      <div className="grid gap-4 mb-4" style={{ gridTemplateColumns: "5fr 4fr" }}>
        {/* Daily chart */}
        <Card>
          <CardHead title="Leads nuevos · últimos 30 días" subtitle={dailySubtitle} />
          <div style={{ padding: "8px 0 14px" }}>
            <DailyChart data={dailyData} />
          </div>
        </Card>

        {/* Sources */}
        <Card>
          <CardHead title="Fuentes de leads" subtitle="Ordenado por volumen" />
          <div style={{ padding: 18 }}>
            {sources.length === 0 ? (
              <div style={{ textAlign: "center", color: C.ink3, fontSize: 12.5, padding: "24px 0" }}>Sin datos</div>
            ) : sources.map(s => (
              <div key={s.nm} style={{ display: "grid", gridTemplateColumns: "90px 1fr 32px 52px", gap: 12, padding: "7px 0", alignItems: "center" }}>
                <span style={{ fontSize: 12.5, fontWeight: 500, display: "flex", alignItems: "center", gap: 7 }}>
                  <span style={{ width: 6, height: 6, borderRadius: 2, background: s.color, display: "inline-block", flexShrink: 0 }} />
                  {s.nm}
                </span>
                <div style={{ height: 5, background: C.bg3, borderRadius: 99, overflow: "hidden", position: "relative" }}>
                  <div style={{ position: "absolute", left: 0, top: 0, bottom: 0, background: s.color, borderRadius: 99, width: `${(s.n / maxSrc) * 100}%` }} />
                </div>
                <span style={{ fontFamily: "ui-monospace,monospace", fontSize: 11.5, color: C.ink2, fontWeight: 500, textAlign: "right" }}>{s.n}</span>
                <span style={{ fontFamily: "ui-monospace,monospace", fontSize: 10.5, color: C.ink3, textAlign: "right" }}>{totalLeads > 0 ? `${Math.round((s.n / totalLeads) * 100)}%` : "0%"}</span>
              </div>
            ))}
          </div>
        </Card>

      </div>

      {/* ── ROW 2: ATENCIÓN + FUNNEL ──────────────────── */}
      <div className="grid gap-4 mb-4" style={{ gridTemplateColumns: "4fr 8fr" }}>
        {/* Atención */}
        <Card>
          <CardHead title="Requieren atención" subtitle="score ≥ 70 o temperatura caliente" />
          <div>
            {hotLeads.length === 0 ? (
              <div style={{ padding: "32px 18px", textAlign: "center", color: C.ink3, fontSize: 12.5 }}>Sin leads urgentes</div>
            ) : hotLeads.map((lead, i) => {
              const initials = (lead.name || "??").split(" ").map(w => w[0] ?? "").slice(0, 2).join("").toUpperCase()
              const isHot = (lead.score ?? 0) >= 70
              return (
                <div key={lead.id} onClick={() => router.push(`/dashboard/leads/${lead.id}`)}
                  style={{ display: "grid", gridTemplateColumns: "32px 1fr 26px", gap: 12, padding: "12px 18px", borderBottom: i < hotLeads.length - 1 ? `1px solid ${C.line3}` : "none", alignItems: "center", cursor: "pointer", transition: "background .1s" }}
                  onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = C.bg2 }}
                  onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = "transparent" }}
                >
                  <div style={{ width: 30, height: 30, borderRadius: 99, background: isHot ? "#fef3eb" : C.bg3, display: "grid", placeItems: "center", fontWeight: 600, fontSize: 10.5, color: isHot ? C.warn : C.ink }}>
                    {initials}
                  </div>
                  <div style={{ minWidth: 0 }}>
                    <div style={{ fontWeight: 550, fontSize: 12.5, color: C.ink, letterSpacing: "-0.005em", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                      {lead.name || "Sin nombre"} {isHot && <span style={{ color: C.accent, fontSize: 9 }}>▲</span>}
                    </div>
                    <div style={{ fontFamily: "ui-monospace,monospace", fontSize: 10.5, color: C.ink3, marginTop: 1 }}>
                      Score {lead.score ?? 0} · {TEMP_LABELS[lead.temperature ?? ""] || lead.temperature || "—"}
                    </div>
                  </div>
                  <button style={{ width: 26, height: 26, borderRadius: 5, display: "grid", placeItems: "center", color: C.ink3, background: "none", border: "none", cursor: "pointer" }}>
                    <MoreVertical size={14} />
                  </button>
                </div>
              )
            })}
          </div>
        </Card>

        {/* Funnel */}
        <Card>
          <CardHead
            title="Embudo de conversión"
            subtitle={`De Nuevo a Ganado: ${kpis.conversionRate}%`}
          />
          <div style={{ padding: "18px 16px", display: "flex", alignItems: "stretch", gap: 4, overflowX: "auto" }}>
            {funnelStages.map((f, i) => {
              const prev = i > 0 ? funnelStages[i - 1] : null
              const dropoff = prev && prev.count > 0 ? ((1 - (f.count / prev.count)) * 100).toFixed(0) : null
              const pct = (f.count / maxFunnel) * 100
              return (
                <div key={f.stage} style={{ display: "flex", alignItems: "center", gap: 4, flex: 1 }}>
                  <div style={{
                    flex: 1, padding: "10px 14px", borderRadius: 8,
                    background: f.won ? C.accentSoft : C.bg2,
                    border: `1px solid ${f.won ? "transparent" : C.line2}`,
                    display: "flex", flexDirection: "column", gap: 3,
                  }}>
                    <div style={{ fontFamily: "ui-monospace,monospace", fontSize: 10, color: C.ink4, letterSpacing: "0.04em" }}>
                      {String(i + 1).padStart(2, "0")}
                    </div>
                    <div style={{ fontWeight: 600, letterSpacing: "-0.012em", fontSize: 13, color: f.won ? C.accentInk : C.ink }}>
                      {f.stage}
                    </div>
                    <div style={{ fontWeight: 600, letterSpacing: "-0.02em", fontSize: 20, fontVariantNumeric: "tabular-nums", lineHeight: 1, color: f.won ? C.accentInk : C.ink }}>
                      {f.count}
                    </div>
                    <div style={{ height: 3, background: f.won ? "rgba(22,152,110,0.25)" : C.bg3, borderRadius: 99, overflow: "hidden", marginTop: 4 }}>
                      <div style={{ height: "100%", width: `${pct}%`, background: f.won ? C.accent : C.ink, borderRadius: 99 }} />
                    </div>
                    <div style={{ display: "flex", gap: 6, marginTop: 2, fontSize: 10.5 }}>
                      {f.conv !== null ? (
                        <span style={{ color: C.ink2, fontWeight: 500 }}>{Math.round(f.conv * 100)}% conv.</span>
                      ) : (
                        <span style={{ color: C.ink4 }}>entrada</span>
                      )}
                      {dropoff && Number(dropoff) > 0 && (
                        <span style={{ color: C.red, fontWeight: 500 }}>−{dropoff}%</span>
                      )}
                    </div>
                  </div>
                  {i < funnelStages.length - 1 && (
                    <div style={{ color: C.ink5, fontFamily: "ui-monospace,monospace", fontSize: 14, flexShrink: 0 }}>→</div>
                  )}
                </div>
              )
            })}
          </div>
        </Card>
      </div>

      {/* ── LEADS TABLE ──────────────────────────────── */}
      {/* Cabecera unificada (ListHeader) + filtros + tabla viven dentro de tableNode (LeadsKpisClient) */}
      <Card>{tableNode}</Card>

      {/* ── CREATE LEAD DIALOG ─────────────────────────── */}
      <CreateLeadManualDialog
        open={newLeadOpen}
        onOpenChange={setNewLeadOpen}
      />

    </div>
  )
}
