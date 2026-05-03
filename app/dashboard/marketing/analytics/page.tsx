"use client"

import { useEffect, useState } from "react"
import { Megaphone, Send, Eye, MousePointer, Users } from "lucide-react"
import { KPICard } from "@/components/analytics/KPICard"
import dynamic from "next/dynamic"

const RC  = dynamic(() => import("recharts").then(m => m.ResponsiveContainer),  { ssr: false })
const BC  = dynamic(() => import("recharts").then(m => m.BarChart),              { ssr: false })
const RBar= dynamic(() => import("recharts").then(m => m.Bar),                   { ssr: false })
const RX  = dynamic(() => import("recharts").then(m => m.XAxis),                 { ssr: false })
const RY  = dynamic(() => import("recharts").then(m => m.YAxis),                 { ssr: false })
const RT  = dynamic(() => import("recharts").then(m => m.Tooltip),               { ssr: false })
const RL  = dynamic(() => import("recharts").then(m => m.Legend),                { ssr: false })
const PC  = dynamic(() => import("recharts").then(m => m.PieChart),              { ssr: false })
const RPie= dynamic(() => import("recharts").then(m => m.Pie),                   { ssr: false })
const RCell=dynamic(() => import("recharts").then(m => m.Cell),                  { ssr: false })

interface Data {
  kpis: { total: number; sent: number; totalSent: number; avgOpenRate: number; avgClickRate: number }
  byEdition: { name: string; apertura: number; clicks: number }[]
  byStatus: { name: string; value: number; color: string }[]
}

const C = "bg-[var(--bg-card)] border border-[var(--border-subtle)] rounded-xl p-5"
const tip = { background: "var(--bg-card)", border: "0.5px solid var(--border-subtle)", borderRadius: 8, fontSize: 12 }
const ax = { fontSize: 11, fill: "var(--text-secondary)" }
const Skel = () => <div className="h-52 bg-[var(--bg-surface)] rounded-lg animate-pulse" />

function EngagementBar({ label, value, max, color }: { label: string; value: number; max: number; color: string }) {
  const pct = max > 0 ? Math.round((value / max) * 100) : 0
  return (
    <div>
      <div className="flex justify-between mb-1.5 text-xs">
        <div className="flex items-center gap-2"><span className="w-2 h-2 rounded-full shrink-0" style={{ background: color }} /><span className="font-medium text-[var(--text-primary)]">{label}</span></div>
        <div className="flex items-center gap-2"><span className="font-bold text-[var(--text-primary)]">{value.toLocaleString("es-ES")}</span><span className="text-[var(--text-secondary)]">{pct}%</span></div>
      </div>
      <div className="h-2.5 bg-[var(--bg-surface)] rounded-full overflow-hidden">
        <div className="h-full rounded-full transition-all duration-500" style={{ width: `${pct}%`, background: color }} />
      </div>
    </div>
  )
}

export default function MarketingAnalyticsPage() {
  const [data, setData] = useState<Data | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch("/api/marketing/analytics").then(r => r.json()).then(d => { setData(d); setLoading(false) }).catch(() => setLoading(false))
  }, [])

  const totalSent = data?.kpis.totalSent ?? 0
  const opened  = Math.round(totalSent * ((data?.kpis.avgOpenRate  ?? 0) / 100))
  const clicked = Math.round(totalSent * ((data?.kpis.avgClickRate ?? 0) / 100))
  const totalStatus = (data?.byStatus ?? []).reduce((s, x) => s + x.value, 0)

  return (
    <div className="p-6 w-full space-y-5">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-[11px] text-[var(--text-secondary)] mb-1">Dashboard / <span className="text-[var(--text-primary)]">Marketing</span></p>
          <h1 className="text-2xl font-bold text-[var(--text-primary)] tracking-tight">Analíticas de Marketing</h1>
          <p className="text-sm text-[var(--text-secondary)] mt-0.5">Rendimiento de newsletters, alcance y engagement por campaña</p>
        </div>
        <div className="flex items-center gap-6 text-right">
          <div><p className="text-xs text-[var(--text-secondary)]">Apertura media</p><p className="text-2xl font-bold text-[#1FA97A]">{data?.kpis.avgOpenRate ?? 0}%</p></div>
          <div><p className="text-xs text-[var(--text-secondary)]">Clicks medio</p><p className="text-2xl font-bold text-[#3B82F6]">{data?.kpis.avgClickRate ?? 0}%</p></div>
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        <KPICard title="Newsletters"   value={data?.kpis.total ?? 0}   loading={loading} />
        <KPICard title="Enviadas"      value={data?.kpis.sent ?? 0}    badge={data?.kpis.total ? `${Math.round(((data.kpis.sent) / data.kpis.total) * 100)}% del total` : undefined} badgeColor="#1FA97A" loading={loading} />
        <KPICard title="Destinatarios" value={(totalSent).toLocaleString("es-ES")} badge="envíos totales" badgeColor="#8B5CF6" loading={loading} />
        <KPICard title="Tasa apertura" value={`${data?.kpis.avgOpenRate ?? 0}%`}  sparkColor="#1FA97A" loading={loading} />
        <KPICard title="Tasa clicks"   value={`${data?.kpis.avgClickRate ?? 0}%`} sparkColor="#3B82F6" loading={loading} />
      </div>

      <div className={C}>
        <div className="flex items-start justify-between mb-4">
          <div>
            <p className="text-[13px] font-semibold text-[var(--text-primary)]">Apertura vs. Clicks por newsletter</p>
            <p className="text-xs text-[var(--text-secondary)] mt-0.5">Últimas 6 campañas enviadas · comparativa de engagement</p>
          </div>
        </div>
        {loading ? <div className="h-56 bg-[var(--bg-surface)] rounded-lg animate-pulse" /> : (data?.byEdition?.length ?? 0) === 0
          ? <div className="h-56 grid place-items-center"><div className="text-center"><Send size={28} className="mx-auto mb-2 opacity-20 text-[var(--text-secondary)]" /><p className="text-xs text-[var(--text-secondary)]">Aún no has enviado ninguna newsletter</p></div></div>
          : (
            <div className="h-56">
              <RC width="100%" height="100%">
                <BC data={data?.byEdition ?? []} margin={{ top: 4, right: 4, left: -14, bottom: 0 }} barGap={4}>
                  <RX dataKey="name" tick={ax} axisLine={false} tickLine={false} />
                  <RY tick={ax} axisLine={false} tickLine={false} unit="%" domain={[0, 100]} />
                  <RT contentStyle={tip} formatter={(v) => [`${v}%`]} />
                  <RL wrapperStyle={{ fontSize: 11, paddingTop: 8 }} />
                  <RBar dataKey="apertura" fill="#1FA97A" fillOpacity={0.85} radius={[4, 4, 0, 0]} name="Apertura" maxBarSize={24} />
                  <RBar dataKey="clicks"   fill="#3B82F6" fillOpacity={0.85} radius={[4, 4, 0, 0]} name="Clicks"   maxBarSize={24} />
                </BC>
              </RC>
            </div>
          )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className={C}>
          <p className="text-[13px] font-semibold text-[var(--text-primary)] mb-1">Embudo de engagement</p>
          <p className="text-xs text-[var(--text-secondary)] mb-5">Del total enviado cuántos abrieron y cuántos hicieron click</p>
          {loading ? <Skel /> : totalSent === 0
            ? <div className="h-40 grid place-items-center text-xs text-[var(--text-secondary)]">Sin envíos realizados</div>
            : (
              <div className="space-y-4">
                <EngagementBar label="Enviados"  value={totalSent} max={totalSent} color="#06B6D4" />
                <EngagementBar label="Abiertos"  value={opened}    max={totalSent} color="#1FA97A" />
                <EngagementBar label="Clicks"    value={clicked}   max={totalSent} color="#3B82F6" />
              </div>
            )}
        </div>

        <div className={C}>
          <p className="text-[13px] font-semibold text-[var(--text-primary)] mb-1">Por estado</p>
          <p className="text-xs text-[var(--text-secondary)] mb-3">Distribución de newsletters por situación actual</p>
          {loading ? <Skel /> : (data?.byStatus?.length ?? 0) === 0 ? <div className="h-52 grid place-items-center text-xs text-[var(--text-secondary)]">Sin datos</div> : (
            <div className="flex items-center gap-5">
              <div className="relative w-36 h-36 shrink-0">
                <RC width="100%" height="100%">
                  <PC>
                    <RPie data={data?.byStatus ?? []} cx="50%" cy="50%" innerRadius={44} outerRadius={68} dataKey="value" paddingAngle={4}>
                      {(data?.byStatus ?? []).map((e, i) => <RCell key={i} fill={e.color} />)}
                    </RPie>
                    <RT contentStyle={tip} />
                  </PC>
                </RC>
                <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                  <p className="text-[10px] text-[var(--text-secondary)] uppercase">Total</p>
                  <p className="text-xl font-bold text-[var(--text-primary)]">{totalStatus}</p>
                </div>
              </div>
              <div className="flex-1 space-y-2">
                {(data?.byStatus ?? []).map((s, i) => {
                  const pct = totalStatus > 0 ? Math.round((s.value / totalStatus) * 100) : 0
                  return (
                    <div key={i} className="p-2.5 rounded-lg" style={{ background: s.color + "12" }}>
                      <div className="flex justify-between items-center mb-1">
                        <div className="flex items-center gap-2"><span className="w-2 h-2 rounded-full" style={{ background: s.color }} /><span className="text-xs font-semibold text-[var(--text-primary)]">{s.name}</span></div>
                        <span className="text-sm font-bold" style={{ color: s.color }}>{s.value}</span>
                      </div>
                      <p className="text-[10px] text-[var(--text-secondary)]">{pct}% del total</p>
                    </div>
                  )
                })}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
