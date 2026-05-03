"use client"

import { useEffect, useState } from "react"
import { Target, Flame, Users, Clock } from "lucide-react"
import { KPICard } from "@/components/analytics/KPICard"
import { TimeToggle } from "@/components/analytics/TimeToggle"
import dynamic from "next/dynamic"

const RC  = dynamic(() => import("recharts").then(m => m.ResponsiveContainer),  { ssr: false })
const CC  = dynamic(() => import("recharts").then(m => m.ComposedChart),         { ssr: false })
const BC  = dynamic(() => import("recharts").then(m => m.BarChart),              { ssr: false })
const RBar= dynamic(() => import("recharts").then(m => m.Bar),                   { ssr: false })
const RLine=dynamic(() => import("recharts").then(m => m.Line),                  { ssr: false })
const RX  = dynamic(() => import("recharts").then(m => m.XAxis),                 { ssr: false })
const RY  = dynamic(() => import("recharts").then(m => m.YAxis),                 { ssr: false })
const RT  = dynamic(() => import("recharts").then(m => m.Tooltip),               { ssr: false })
const PC  = dynamic(() => import("recharts").then(m => m.PieChart),              { ssr: false })
const RPie= dynamic(() => import("recharts").then(m => m.Pie),                   { ssr: false })
const RCell=dynamic(() => import("recharts").then(m => m.Cell),                  { ssr: false })

interface Data {
  kpis: { total: number; newThisWeek: number; converted: number; conversionRate: number; stalled: number; lost: number }
  funnel: { label: string; value: number; color: string }[]
  temperature: { name: string; value: number; color: string }[]
  daily: { date: string; total: number }[]
  bySrc: { name: string; value: number }[]
}

const C = "bg-[var(--bg-card)] border border-[var(--border-subtle)] rounded-xl p-5"
const tip = { background: "var(--bg-card)", border: "0.5px solid var(--border-subtle)", borderRadius: 8, fontSize: 12 }
const ax = { fontSize: 11, fill: "var(--text-secondary)" }
const Skel = ({ h = 52 }: { h?: number }) => <div className={`h-${h} bg-[var(--bg-surface)] rounded-lg animate-pulse`} />

function Funnel({ steps }: { steps: { label: string; value: number; color: string }[] }) {
  const max = Math.max(...steps.map(s => s.value), 1)
  return (
    <div className="space-y-2.5 mt-1">
      {steps.map((s, i) => {
        const w = Math.max((s.value / max) * 100, s.value > 0 ? 6 : 0)
        const rate = i > 0 && steps[i - 1].value > 0 ? `${Math.round((s.value / steps[i - 1].value) * 100)}%` : ""
        return (
          <div key={i} className="flex items-center gap-2.5">
            <p className="text-[11px] text-[var(--text-secondary)] w-20 shrink-0 text-right">{s.label}</p>
            <div className="flex-1 h-7 bg-[var(--bg-surface)] rounded-md overflow-hidden">
              <div className="h-full rounded-md flex items-center px-2.5 transition-all" style={{ width: `${w}%`, background: s.color }}>
                <span className="text-[11px] font-bold text-white">{s.value}</span>
              </div>
            </div>
            <p className="text-[11px] font-semibold text-[var(--text-secondary)] w-8 shrink-0">{rate}</p>
          </div>
        )
      })}
    </div>
  )
}

export default function LeadsAnalyticsPage() {
  const [data, setData] = useState<Data | null>(null)
  const [loading, setLoading] = useState(true)
  const [range, setRange] = useState("30D")

  useEffect(() => {
    fetch("/api/leads/analytics").then(r => r.json()).then(d => { setData(d); setLoading(false) }).catch(() => setLoading(false))
  }, [])

  const sparkTotal = (data?.daily ?? []).slice(-12).map(d => d.total)
  const withAvg = (data?.daily ?? []).map((d, i, arr) => ({
    ...d,
    avg: Math.round(arr.slice(Math.max(0, i - 2), i + 1).reduce((s, x) => s + x.total, 0) / Math.min(3, i + 1)),
  }))
  const totalFunnel = (data?.funnel ?? []).reduce((s, f) => s + f.value, 0)

  return (
    <div className="p-6 w-full space-y-5">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-[11px] text-[var(--text-secondary)] mb-1">Dashboard / <span className="text-[var(--text-primary)]">Leads</span></p>
          <h1 className="text-2xl font-bold text-[var(--text-primary)] tracking-tight">Analíticas de Leads</h1>
          <p className="text-sm text-[var(--text-secondary)] mt-0.5">Pipeline de ventas y conversión · datos actualizados</p>
        </div>
        <TimeToggle value={range} onChange={setRange} />
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <KPICard title="Total leads"       value={loading ? "—" : data?.kpis.total ?? 0}          sparkData={sparkTotal} sparkColor="#1FA97A" trend={data?.kpis.newThisWeek ? Math.round((data.kpis.newThisWeek / Math.max(data.kpis.total - data.kpis.newThisWeek, 1)) * 100) : undefined} trendLabel="vs semana ant." loading={loading} />
        <KPICard title="Convertidos"       value={loading ? "—" : data?.kpis.converted ?? 0}      badge={`${data?.kpis.conversionRate ?? 0}% tasa`} badgeColor="#1FA97A" sparkData={sparkTotal.map((_, i) => i * 0.3)} sparkColor="#8B5CF6" loading={loading} />
        <KPICard title="Nuevos esta semana" value={loading ? "—" : data?.kpis.newThisWeek ?? 0}   sparkData={sparkTotal.slice(-6)} sparkColor="#3B82F6" loading={loading} />
        <KPICard title="Estancados"        value={loading ? "—" : data?.kpis.stalled ?? 0}        badge={data?.kpis.stalled ? "+7 días sin actividad" : undefined} badgeColor="#F59E0B" loading={loading} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className={`${C} lg:col-span-2`}>
          <div className="flex items-start justify-between mb-4">
            <div>
              <p className="text-[13px] font-semibold text-[var(--text-primary)]">Nuevos leads por día</p>
              <p className="text-xs text-[var(--text-secondary)] mt-0.5">Barras = captación diaria · Línea = media móvil 3 días</p>
            </div>
            <p className="text-xs text-[var(--text-secondary)]">Total: <span className="font-bold text-[var(--text-primary)]">{data?.kpis.total ?? 0}</span></p>
          </div>
          {loading ? <Skel h={52} /> : (
            <div className="h-52">
              <RC width="100%" height="100%">
                <CC data={withAvg} margin={{ top: 4, right: 4, left: -18, bottom: 0 }}>
                  <RX dataKey="date" tick={ax} axisLine={false} tickLine={false} interval="preserveStartEnd" />
                  <RY allowDecimals={false} tick={ax} axisLine={false} tickLine={false} />
                  <RT contentStyle={tip} />
                  <RBar dataKey="total" fill="#1FA97A" fillOpacity={0.85} radius={[3, 3, 0, 0]} name="Leads" maxBarSize={20} />
                  <RLine type="monotone" dataKey="avg" stroke="#3B82F6" strokeWidth={2} dot={false} name="Media 3d" />
                </CC>
              </RC>
            </div>
          )}
        </div>

        <div className={C}>
          <p className="text-[13px] font-semibold text-[var(--text-primary)] mb-1">Por estado</p>
          <p className="text-xs text-[var(--text-secondary)] mb-3">Distribución del pipeline</p>
          {loading ? <Skel /> : (data?.funnel?.length ?? 0) === 0 ? <div className="h-48 grid place-items-center text-xs text-[var(--text-secondary)]">Sin datos</div> : (
            <div className="flex flex-col items-center">
              <div className="relative w-36 h-36">
                <RC width="100%" height="100%">
                  <PC>
                    <RPie data={data?.funnel ?? []} cx="50%" cy="50%" innerRadius={44} outerRadius={68} dataKey="value" paddingAngle={3}>
                      {(data?.funnel ?? []).map((e, i) => <RCell key={i} fill={e.color} />)}
                    </RPie>
                    <RT contentStyle={tip} />
                  </PC>
                </RC>
                <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                  <p className="text-[10px] text-[var(--text-secondary)] uppercase tracking-wider">Total</p>
                  <p className="text-xl font-bold text-[var(--text-primary)]">{totalFunnel}</p>
                </div>
              </div>
              <div className="w-full space-y-1.5 mt-3">
                {(data?.funnel ?? []).map((f, i) => (
                  <div key={i} className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2"><span className="w-2 h-2 rounded-full" style={{ background: f.color }} /><span className="text-[var(--text-secondary)]">{f.label}</span></div>
                    <div className="flex items-center gap-2"><span className="font-semibold text-[var(--text-primary)]">{f.value}</span><span className="text-[var(--text-secondary)]">{totalFunnel > 0 ? `${Math.round((f.value / totalFunnel) * 100)}%` : ""}</span></div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className={C}>
          <p className="text-[13px] font-semibold text-[var(--text-primary)] mb-1">Embudo del pipeline</p>
          <p className="text-xs text-[var(--text-secondary)] mb-4">Conversión entre etapas · % avance al siguiente paso</p>
          {loading ? <Skel /> : <Funnel steps={data?.funnel ?? []} />}
        </div>
        <div className={C}>
          <p className="text-[13px] font-semibold text-[var(--text-primary)] mb-1">Origen de leads</p>
          <p className="text-xs text-[var(--text-secondary)] mb-3">Canales que más leads generan</p>
          {loading ? <Skel /> : (data?.bySrc?.length ?? 0) === 0 ? <div className="h-44 grid place-items-center text-xs text-[var(--text-secondary)]">Sin datos de origen</div> : (
            <div className="h-44">
              <RC width="100%" height="100%">
                <BC data={data?.bySrc ?? []} layout="vertical" margin={{ top: 0, right: 12, left: 4, bottom: 0 }}>
                  <RX type="number" allowDecimals={false} tick={ax} axisLine={false} tickLine={false} />
                  <RY type="category" dataKey="name" tick={ax} axisLine={false} tickLine={false} width={64} />
                  <RT contentStyle={tip} />
                  <RBar dataKey="value" fill="#1FA97A" fillOpacity={0.8} radius={[0, 4, 4, 0]} name="Leads" maxBarSize={14} />
                </BC>
              </RC>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
