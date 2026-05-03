"use client"

import { useEffect, useState } from "react"
import { Zap, CheckCircle2, Activity, BarChart2 } from "lucide-react"
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
  kpis: { total: number; active: number; totalExecutions: number; successRate: number }
  byAuto: { name: string; total: number }[]
  activity: { date: string; total: number }[]
  byResult: { name: string; value: number; color: string }[]
}

const C = "bg-[var(--bg-card)] border border-[var(--border-subtle)] rounded-xl p-5"
const tip = { background: "var(--bg-card)", border: "0.5px solid var(--border-subtle)", borderRadius: 8, fontSize: 12 }
const ax = { fontSize: 11, fill: "var(--text-secondary)" }
const Skel = () => <div className="h-52 bg-[var(--bg-surface)] rounded-lg animate-pulse" />

export default function AutomatizacionesAnalyticsPage() {
  const [data, setData] = useState<Data | null>(null)
  const [loading, setLoading] = useState(true)
  const [range, setRange] = useState("30D")

  useEffect(() => {
    fetch("/api/automatizaciones/analytics").then(r => r.json()).then(d => { setData(d); setLoading(false) }).catch(() => setLoading(false))
  }, [])

  const rate = data?.kpis.successRate ?? 100
  const rateColor = rate >= 90 ? "#1FA97A" : rate >= 70 ? "#F59E0B" : "#EF4444"
  const sparkActivity = (data?.activity ?? []).slice(-12).map(d => d.total)
  const withSuccess = (data?.activity ?? []).map(d => ({ ...d, tasa: rate }))
  const totalResults = (data?.byResult ?? []).reduce((s, x) => s + x.value, 0)

  return (
    <div className="p-6 w-full space-y-5">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-[11px] text-[var(--text-secondary)] mb-1">Dashboard / <span className="text-[var(--text-primary)]">Automatizaciones</span></p>
          <h1 className="text-2xl font-bold text-[var(--text-primary)] tracking-tight">Analíticas de Automatizaciones</h1>
          <p className="text-sm text-[var(--text-secondary)] mt-0.5">Actividad, rendimiento y fiabilidad de tus flujos automatizados</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="text-right">
            <p className="text-xs text-[var(--text-secondary)]">Tasa de éxito</p>
            <p className="text-2xl font-bold" style={{ color: rateColor }}>{rate}%</p>
          </div>
          <TimeToggle value={range} onChange={setRange} />
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <KPICard title="Total"             value={data?.kpis.total ?? 0}           badge={`${data?.kpis.active ?? 0} activas`} badgeColor="#1FA97A" loading={loading} />
        <KPICard title="Activas"           value={data?.kpis.active ?? 0}          badge={data?.kpis.total ? `${Math.round(((data.kpis.active) / data.kpis.total) * 100)}% activación` : undefined} badgeColor="#8B5CF6" loading={loading} />
        <KPICard title="Ejecuciones"       value={(data?.kpis.totalExecutions ?? 0).toLocaleString("es-ES")} sparkData={sparkActivity} sparkColor="#8B5CF6" loading={loading} />
        <KPICard title="Tasa de éxito"     value={`${rate}%`}                      badge={rate >= 90 ? "Excelente" : rate >= 70 ? "Aceptable" : "Revisar"} badgeColor={rateColor} loading={loading} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className={`${C} lg:col-span-2`}>
          <div className="flex items-start justify-between mb-4">
            <div>
              <p className="text-[13px] font-semibold text-[var(--text-primary)]">Actividad de ejecuciones — últimos 14 días</p>
              <p className="text-xs text-[var(--text-secondary)] mt-0.5">Barras = ejecuciones diarias · Línea = tasa de éxito media</p>
            </div>
            <p className="text-xs text-[var(--text-secondary)]">Total 30d: <span className="font-bold text-[var(--text-primary)]">{(data?.activity ?? []).reduce((s, d) => s + d.total, 0)}</span></p>
          </div>
          {loading ? <Skel /> : (
            <div className="h-52">
              <RC width="100%" height="100%">
                <CC data={withSuccess} margin={{ top: 4, right: 4, left: -14, bottom: 0 }}>
                  <RX dataKey="date" tick={ax} axisLine={false} tickLine={false} interval="preserveStartEnd" />
                  <RY yAxisId="left" allowDecimals={false} tick={ax} axisLine={false} tickLine={false} />
                  <RY yAxisId="right" orientation="right" tick={{ ...ax, fill: rateColor }} axisLine={false} tickLine={false} domain={[0, 100]} unit="%" />
                  <RT contentStyle={tip} />
                  <RBar yAxisId="left" dataKey="total" fill="#8B5CF6" fillOpacity={0.8} radius={[3, 3, 0, 0]} name="Ejecuciones" maxBarSize={18} />
                  <RLine yAxisId="right" type="monotone" dataKey="tasa" stroke={rateColor} strokeWidth={2} strokeDasharray="4 2" dot={false} name="Éxito %" />
                </CC>
              </RC>
            </div>
          )}
        </div>

        <div className={C}>
          <p className="text-[13px] font-semibold text-[var(--text-primary)] mb-1">Resultados</p>
          <p className="text-xs text-[var(--text-secondary)] mb-3">Últimos 30 días</p>
          {loading ? <Skel /> : (data?.byResult?.length ?? 0) === 0
            ? (
              <div className="h-52 flex flex-col items-center justify-center gap-2">
                <CheckCircle2 size={32} style={{ color: "#1FA97A" }} />
                <p className="text-xs text-[var(--text-secondary)] text-center">Sin ejecuciones en los últimos 30 días</p>
              </div>
            ) : (
              <div className="flex flex-col items-center">
                <div className="relative w-36 h-36">
                  <RC width="100%" height="100%">
                    <PC>
                      <RPie data={data?.byResult ?? []} cx="50%" cy="50%" innerRadius={44} outerRadius={68} dataKey="value" paddingAngle={4}>
                        {(data?.byResult ?? []).map((e, i) => <RCell key={i} fill={e.color} />)}
                      </RPie>
                      <RT contentStyle={tip} />
                    </PC>
                  </RC>
                  <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                    <p className="text-[10px] text-[var(--text-secondary)] uppercase">Total</p>
                    <p className="text-xl font-bold text-[var(--text-primary)]">{totalResults}</p>
                  </div>
                </div>
                <div className="w-full space-y-2 mt-3">
                  {(data?.byResult ?? []).map((r, i) => (
                    <div key={i} className="flex items-center justify-between p-2.5 rounded-lg" style={{ background: r.color + "12" }}>
                      <div className="flex items-center gap-2"><span className="w-2 h-2 rounded-full" style={{ background: r.color }} /><span className="text-xs font-medium text-[var(--text-primary)]">{r.name}</span></div>
                      <span className="text-sm font-bold" style={{ color: r.color }}>{r.value}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
        </div>
      </div>

      <div className={C}>
        <p className="text-[13px] font-semibold text-[var(--text-primary)] mb-1">Ejecuciones por automatización</p>
        <p className="text-xs text-[var(--text-secondary)] mb-4">Top 8 flujos con mayor actividad histórica</p>
        {loading ? <Skel /> : (data?.byAuto?.length ?? 0) === 0
          ? <div className="h-48 grid place-items-center text-xs text-[var(--text-secondary)]">Sin ejecuciones registradas aún</div>
          : (
            <div className="h-48">
              <RC width="100%" height="100%">
                <BC data={data?.byAuto ?? []} layout="vertical" margin={{ top: 0, right: 12, left: 4, bottom: 0 }}>
                  <RX type="number" allowDecimals={false} tick={ax} axisLine={false} tickLine={false} />
                  <RY type="category" dataKey="name" tick={ax} axisLine={false} tickLine={false} width={104} />
                  <RT contentStyle={tip} />
                  <RBar dataKey="total" fill="#8B5CF6" fillOpacity={0.85} radius={[0, 5, 5, 0]} name="Ejecuciones" maxBarSize={14} />
                </BC>
              </RC>
            </div>
          )}
      </div>
    </div>
  )
}
