"use client"

import { useEffect, useState, useMemo } from "react"
import { Send, Eye, MousePointer, UserMinus, TrendingUp, Clock } from "lucide-react"
import dynamic from "next/dynamic"

const RC  = dynamic(() => import("recharts").then(m => m.ResponsiveContainer),  { ssr: false })
const BC  = dynamic(() => import("recharts").then(m => m.BarChart),             { ssr: false })
const LC  = dynamic(() => import("recharts").then(m => m.LineChart),            { ssr: false })
const RBar= dynamic(() => import("recharts").then(m => m.Bar),                  { ssr: false })
const RLine=dynamic(() => import("recharts").then(m => m.Line),                 { ssr: false })
const RX  = dynamic(() => import("recharts").then(m => m.XAxis),                { ssr: false })
const RY  = dynamic(() => import("recharts").then(m => m.YAxis),                { ssr: false })
const RT  = dynamic(() => import("recharts").then(m => m.Tooltip),              { ssr: false })
const RL  = dynamic(() => import("recharts").then(m => m.Legend),               { ssr: false })
const RRef= dynamic(() => import("recharts").then(m => m.ReferenceLine),        { ssr: false })

// ── Types ──────────────────────────────────────────────────────────────────────

interface Summary {
  totalCampaigns: number
  totalSent: number
  totalOpens: number
  totalClicks: number
  totalUnsubscribes: number
  totalBounces: number
  avgOpenRate: number
  avgClickRate: number
  avgUnsubRate: number
}

interface SubscriberMonth { month: string; subscribers: number; unsubscribes: number }
interface CampaignRow {
  id: string; name: string; sentAt: string | null
  sent: number; opens: number; clicks: number
  openRate: number; clickRate: number
}
interface HourData { hour: number; opens: number }

interface Data {
  summary: Summary
  subscriberGrowth: SubscriberMonth[]
  campaignPerformance: CampaignRow[]
  bestHours: HourData[]
}

// ── Design tokens ──────────────────────────────────────────────────────────────

const C = "bg-[var(--bg-card)] border border-[var(--border-subtle)] rounded-xl p-5"
const tip = { background: "var(--bg-card)", border: "0.5px solid var(--border-subtle)", borderRadius: 8, fontSize: 12 }
const ax = { fontSize: 11, fill: "var(--text-secondary)" }
const Skel = ({ h = 52 }: { h?: number }) => (
  <div className={`h-${h} bg-[var(--bg-surface)] rounded-lg animate-pulse`} style={{ height: h }} />
)

// ── KPI Card ───────────────────────────────────────────────────────────────────

function KPI({ title, value, sub, loading, icon: Icon, color = "#1FA97A" }: {
  title: string; value: string | number; sub?: string; loading?: boolean
  icon: React.ElementType; color?: string
}) {
  return (
    <div className={C}>
      <div className="flex items-start justify-between mb-3">
        <p className="text-xs text-[var(--text-secondary)] font-medium">{title}</p>
        <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: color + "18" }}>
          <Icon className="w-3.5 h-3.5" style={{ color }} />
        </div>
      </div>
      {loading ? <Skel h={28} /> : (
        <p className="text-2xl font-bold text-[var(--text-primary)] tabular-nums">{value}</p>
      )}
      {sub && !loading && (
        <p className="text-xs text-[var(--text-secondary)] mt-1">{sub}</p>
      )}
    </div>
  )
}

// ── Sort key ───────────────────────────────────────────────────────────────────

type SortKey = "openRate" | "clickRate" | "sent" | "sentAt"

// ── Page ──────────────────────────────────────────────────────────────────────

export default function EmailAnalyticsPage() {
  const [data, setData] = useState<Data | null>(null)
  const [loading, setLoading] = useState(true)
  const [sortKey, setSortKey] = useState<SortKey>("sentAt")
  const [sortAsc, setSortAsc] = useState(false)

  useEffect(() => {
    fetch("/api/email/analytics")
      .then(r => r.json())
      .then((d: Data) => { setData(d); setLoading(false) })
      .catch(() => setLoading(false))
  }, [])

  const s = data?.summary

  // Best hours: find top 3
  const topHours = useMemo(() => {
    if (!data?.bestHours) return new Set<number>()
    const sorted = [...data.bestHours].sort((a, b) => b.opens - a.opens)
    return new Set(sorted.slice(0, 3).map(h => h.hour))
  }, [data])

  // Sorted campaign table
  const sortedCampaigns = useMemo(() => {
    if (!data?.campaignPerformance) return []
    return [...data.campaignPerformance].sort((a, b) => {
      const va = a[sortKey] as number | string | null
      const vb = b[sortKey] as number | string | null
      if (va == null) return 1
      if (vb == null) return -1
      if (va < vb) return sortAsc ? -1 : 1
      if (va > vb) return sortAsc ? 1 : -1
      return 0
    })
  }, [data, sortKey, sortAsc])

  const handleSort = (key: SortKey) => {
    if (sortKey === key) setSortAsc(v => !v)
    else { setSortKey(key); setSortAsc(false) }
  }

  const fmtDate = (d: string | null) => d ? new Date(d).toLocaleDateString("es-ES", { day: "numeric", month: "short" }) : "—"

  return (
    <div className="p-6 w-full space-y-5">

      {/* Header */}
      <div>
        <p className="text-[11px] text-[var(--text-secondary)] mb-1">
          Dashboard / Marketing / <span className="text-[var(--text-primary)]">Analíticas</span>
        </p>
        <h1 className="text-2xl font-bold text-[var(--text-primary)] tracking-tight">Analíticas de Email</h1>
        <p className="text-sm text-[var(--text-secondary)] mt-0.5">
          Métricas reales de campañas, suscriptores y engagement
        </p>
      </div>

      {/* KPI row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <KPI title="Total enviados" value={s?.totalSent.toLocaleString("es-ES") ?? "—"} sub={`${s?.totalCampaigns ?? 0} campañas`} loading={loading} icon={Send} color="#3B82F6" />
        <KPI title="Tasa de apertura" value={s ? `${s.avgOpenRate}%` : "—"} sub={`${s?.totalOpens.toLocaleString("es-ES") ?? 0} aperturas`} loading={loading} icon={Eye} color="#1FA97A" />
        <KPI title="Tasa de clicks" value={s ? `${s.avgClickRate}%` : "—"} sub={`${s?.totalClicks.toLocaleString("es-ES") ?? 0} clicks`} loading={loading} icon={MousePointer} color="#8B5CF6" />
        <KPI title="Tasa de bajas" value={s ? `${s.avgUnsubRate}%` : "—"} sub={`${s?.totalUnsubscribes ?? 0} bajas · ${s?.totalBounces ?? 0} rebotes`} loading={loading} icon={UserMinus} color="#EF4444" />
      </div>

      {/* Subscriber growth chart */}
      <div className={C}>
        <div className="flex items-start justify-between mb-4">
          <div>
            <p className="text-[13px] font-semibold text-[var(--text-primary)] flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-[#1FA97A]" />
              Crecimiento de suscriptores
            </p>
            <p className="text-xs text-[var(--text-secondary)] mt-0.5">Últimos 12 meses — nuevas altas vs bajas</p>
          </div>
        </div>
        {loading ? <Skel h={200} /> : (
          <div style={{ height: 200 }}>
            <RC width="100%" height="100%">
              <LC data={data?.subscriberGrowth ?? []} margin={{ top: 4, right: 4, left: -14, bottom: 0 }}>
                <RX dataKey="month" tick={ax} axisLine={false} tickLine={false} />
                <RY tick={ax} axisLine={false} tickLine={false} />
                <RT contentStyle={tip} />
                <RL wrapperStyle={{ fontSize: 11, paddingTop: 8 }} />
                <RLine type="monotone" dataKey="subscribers" stroke="#1FA97A" strokeWidth={2} dot={false} name="Nuevos suscriptores" />
                <RLine type="monotone" dataKey="unsubscribes" stroke="#EF4444" strokeWidth={2} dot={false} name="Bajas" />
              </LC>
            </RC>
          </div>
        )}
      </div>

      {/* Campaign performance table + best hours */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">

        {/* Campaign table */}
        <div className={`${C} lg:col-span-2 !p-0 overflow-hidden`}>
          <div className="p-5 pb-3">
            <p className="text-[13px] font-semibold text-[var(--text-primary)]">Rendimiento por campaña</p>
            <p className="text-xs text-[var(--text-secondary)] mt-0.5">Últimas 10 campañas · haz clic en una columna para ordenar</p>
          </div>
          {loading ? (
            <div className="p-5 pt-0 space-y-2">{[...Array(5)].map((_, i) => <Skel key={i} h={32} />)}</div>
          ) : sortedCampaigns.length === 0 ? (
            <div className="h-40 grid place-items-center text-xs text-[var(--text-secondary)]">Sin campañas enviadas aún</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr className="border-b border-[var(--border-subtle)]">
                    {([
                      { label: "Campaña", key: null },
                      { label: "Enviados", key: "sent" as SortKey },
                      { label: "Open rate", key: "openRate" as SortKey },
                      { label: "Click rate", key: "clickRate" as SortKey },
                      { label: "Fecha", key: "sentAt" as SortKey },
                    ] as const).map(col => (
                      <th
                        key={col.label}
                        onClick={col.key ? () => handleSort(col.key!) : undefined}
                        className={`text-left px-4 py-2.5 text-[11px] font-medium text-[var(--text-secondary)] ${col.key ? "cursor-pointer hover:text-[var(--text-primary)]" : ""}`}
                      >
                        {col.label}
                        {col.key && sortKey === col.key && (
                          <span className="ml-1">{sortAsc ? "↑" : "↓"}</span>
                        )}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {sortedCampaigns.map((c, i) => (
                    <tr key={c.id} className={`border-b border-[var(--border-subtle)] hover:bg-[var(--bg-surface)] transition-colors ${i % 2 === 0 ? "" : "bg-[var(--bg-surface)]/30"}`}>
                      <td className="px-4 py-2.5 max-w-[160px]">
                        <p className="font-medium text-[var(--text-primary)] truncate">{c.name}</p>
                      </td>
                      <td className="px-4 py-2.5 text-[var(--text-secondary)] tabular-nums">
                        {c.sent > 0 ? c.sent.toLocaleString("es-ES") : "—"}
                      </td>
                      <td className="px-4 py-2.5">
                        <span className={`font-semibold ${c.openRate >= 20 ? "text-[#1FA97A]" : c.openRate > 0 ? "text-[var(--text-primary)]" : "text-[var(--text-secondary)]"}`}>
                          {c.openRate > 0 ? `${c.openRate}%` : "—"}
                        </span>
                      </td>
                      <td className="px-4 py-2.5">
                        <span className={`font-semibold ${c.clickRate >= 5 ? "text-[#8B5CF6]" : c.clickRate > 0 ? "text-[var(--text-primary)]" : "text-[var(--text-secondary)]"}`}>
                          {c.clickRate > 0 ? `${c.clickRate}%` : "—"}
                        </span>
                      </td>
                      <td className="px-4 py-2.5 text-[var(--text-secondary)]">{fmtDate(c.sentAt)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Best hours chart */}
        <div className={C}>
          <p className="text-[13px] font-semibold text-[var(--text-primary)] flex items-center gap-2 mb-1">
            <Clock className="w-4 h-4 text-[#F59E0B]" />
            Mejores horarios
          </p>
          <p className="text-xs text-[var(--text-secondary)] mb-4">Aperturas por hora del día</p>
          {loading ? <Skel h={200} /> : (data?.bestHours ?? []).every(h => h.opens === 0) ? (
            <div className="h-52 grid place-items-center text-xs text-[var(--text-secondary)]">
              Sin datos de aperturas aún
            </div>
          ) : (
            <div style={{ height: 200 }}>
              <RC width="100%" height="100%">
                <BC data={data?.bestHours ?? []} margin={{ top: 4, right: 4, left: -18, bottom: 0 }}>
                  <RX dataKey="hour" tick={{ ...ax, fontSize: 9 }} axisLine={false} tickLine={false} tickFormatter={h => `${h}h`} interval={3} />
                  <RY tick={ax} axisLine={false} tickLine={false} />
                  <RT contentStyle={tip} formatter={(v, _, p) => [v, `${(p.payload as HourData).hour}:00h`]} />
                  <RBar
                    dataKey="opens"
                    radius={[2, 2, 0, 0]}
                    maxBarSize={14}
                    name="Aperturas"
                    fill="#F59E0B"
                    fillOpacity={0.8}
                    // highlight top hours
                    label={false}
                  />
                </BC>
              </RC>
            </div>
          )}
          {!loading && data && data.bestHours.some(h => h.opens > 0) && (
            <div className="mt-3 pt-3 border-t border-[var(--border-subtle)]">
              <p className="text-[11px] font-medium text-[var(--text-secondary)] mb-1.5">Top horarios</p>
              <div className="space-y-1">
                {[...data.bestHours]
                  .sort((a, b) => b.opens - a.opens)
                  .slice(0, 3)
                  .filter(h => h.opens > 0)
                  .map(h => (
                    <div key={h.hour} className="flex items-center justify-between text-xs">
                      <span className="text-[var(--text-primary)] font-medium">{h.hour.toString().padStart(2, "0")}:00h</span>
                      <span className="text-[#F59E0B] font-semibold">{h.opens} aperturas</span>
                    </div>
                  ))}
              </div>
            </div>
          )}
        </div>
      </div>

    </div>
  )
}
