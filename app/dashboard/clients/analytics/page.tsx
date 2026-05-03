"use client"

import { useEffect, useState } from "react"
import { Users, DollarSign, TrendingUp, UserCheck } from "lucide-react"
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
  kpis: { total: number; active: number; newThisMonth: number; totalRevenue: number; avgRevenue: number }
  byMonth: { month: string; total: number }[]
  topClients: { name: string; revenue: number }[]
  bySource: { name: string; value: number; color: string }[]
  byRisk: { name: string; value: number; color: string }[]
}

const C = "bg-[var(--bg-card)] border border-[var(--border-subtle)] rounded-xl p-5"
const tip = { background: "var(--bg-card)", border: "0.5px solid var(--border-subtle)", borderRadius: 8, fontSize: 12 }
const ax = { fontSize: 11, fill: "var(--text-secondary)" }
const Skel = () => <div className="h-52 bg-[var(--bg-surface)] rounded-lg animate-pulse" />
const eur = (n: number) => new Intl.NumberFormat("es-ES", { style: "currency", currency: "EUR", maximumFractionDigits: 0 }).format(n)

export default function ClientsAnalyticsPage() {
  const [data, setData] = useState<Data | null>(null)
  const [loading, setLoading] = useState(true)
  const [range, setRange] = useState("12M")

  useEffect(() => {
    fetch("/api/clients/analytics").then(r => r.json()).then(d => { setData(d); setLoading(false) }).catch(() => setLoading(false))
  }, [])

  const sparkMonths = (data?.byMonth ?? []).map(m => m.total)
  const withCum = (data?.byMonth ?? []).reduce((acc: { month: string; total: number; cum: number }[], m, i) => {
    acc.push({ ...m, cum: (acc[i - 1]?.cum ?? 0) + m.total })
    return acc
  }, [])
  const totalSrc = (data?.bySource ?? []).reduce((s, x) => s + x.value, 0)
  const maxRev = Math.max(...(data?.topClients ?? []).map(c => c.revenue), 1)

  return (
    <div className="p-6 w-full space-y-5">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-[11px] text-[var(--text-secondary)] mb-1">Dashboard / <span className="text-[var(--text-primary)]">Clientes</span></p>
          <h1 className="text-2xl font-bold text-[var(--text-primary)] tracking-tight">Analíticas de Clientes</h1>
          <p className="text-sm text-[var(--text-secondary)] mt-0.5">Crecimiento, valor de vida y riesgo de tu base de clientes</p>
        </div>
        <TimeToggle value={range} onChange={setRange} options={["30D", "90D", "12M", "TODO"]} />
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <KPICard title="Total clientes"   value={data?.kpis.total ?? 0}               sparkData={sparkMonths} sparkColor="#3B82F6" trend={data?.kpis.newThisMonth ? Math.round((data.kpis.newThisMonth / Math.max(data.kpis.total - data.kpis.newThisMonth, 1)) * 100) : undefined} trendLabel="vs mes anterior" loading={loading} />
        <KPICard title="Clientes activos" value={data?.kpis.active ?? 0}              badge={data ? `${Math.round((data.kpis.active / Math.max(data.kpis.total, 1)) * 100)}% del total` : undefined} badgeColor="#1FA97A" loading={loading} />
        <KPICard title="Revenue total"    value={loading ? "—" : eur(data?.kpis.totalRevenue ?? 0)} sparkData={sparkMonths.map((v, i) => sparkMonths.slice(0, i + 1).reduce((s, x) => s + x, 0))} sparkColor="#1FA97A" loading={loading} />
        <KPICard title="Revenue medio"    value={loading ? "—" : eur(data?.kpis.avgRevenue ?? 0)}  badge="por cliente" badgeColor="#3B82F6" loading={loading} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className={`${C} lg:col-span-2`}>
          <div className="flex items-start justify-between mb-4">
            <div>
              <p className="text-[13px] font-semibold text-[var(--text-primary)]">Adquisición mensual de clientes</p>
              <p className="text-xs text-[var(--text-secondary)] mt-0.5">Barras = nuevos por mes · Línea = acumulado total</p>
            </div>
            <p className="text-xs text-[var(--text-secondary)]">Nuevos este mes: <span className="font-bold text-[var(--text-primary)]">{data?.kpis.newThisMonth ?? 0}</span></p>
          </div>
          {loading ? <Skel /> : (
            <div className="h-52">
              <RC width="100%" height="100%">
                <CC data={withCum} margin={{ top: 4, right: 4, left: -12, bottom: 0 }}>
                  <RX dataKey="month" tick={ax} axisLine={false} tickLine={false} />
                  <RY yAxisId="left" allowDecimals={false} tick={ax} axisLine={false} tickLine={false} />
                  <RY yAxisId="right" orientation="right" allowDecimals={false} tick={ax} axisLine={false} tickLine={false} />
                  <RT contentStyle={tip} />
                  <RBar yAxisId="left" dataKey="total" fill="#3B82F6" fillOpacity={0.85} radius={[4, 4, 0, 0]} name="Nuevos" maxBarSize={28} />
                  <RLine yAxisId="right" type="monotone" dataKey="cum" stroke="#1FA97A" strokeWidth={2} dot={{ fill: "#1FA97A", r: 3 }} name="Acumulado" />
                </CC>
              </RC>
            </div>
          )}
        </div>

        <div className={C}>
          <p className="text-[13px] font-semibold text-[var(--text-primary)] mb-1">Por origen</p>
          <p className="text-xs text-[var(--text-secondary)] mb-3">Cómo llegaron tus clientes</p>
          {loading ? <Skel /> : (data?.bySource?.length ?? 0) === 0 ? <div className="h-52 grid place-items-center text-xs text-[var(--text-secondary)]">Sin datos</div> : (
            <div className="flex flex-col items-center">
              <div className="relative w-36 h-36">
                <RC width="100%" height="100%">
                  <PC>
                    <RPie data={data?.bySource ?? []} cx="50%" cy="50%" innerRadius={44} outerRadius={68} dataKey="value" paddingAngle={3}>
                      {(data?.bySource ?? []).map((e, i) => <RCell key={i} fill={e.color} />)}
                    </RPie>
                    <RT contentStyle={tip} />
                  </PC>
                </RC>
                <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                  <p className="text-[10px] text-[var(--text-secondary)] uppercase tracking-wider">Total</p>
                  <p className="text-xl font-bold text-[var(--text-primary)]">{totalSrc}</p>
                </div>
              </div>
              <div className="w-full space-y-1.5 mt-3">
                {(data?.bySource ?? []).map((s, i) => (
                  <div key={i} className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2"><span className="w-2 h-2 rounded-full shrink-0" style={{ background: s.color }} /><span className="text-[var(--text-secondary)] truncate max-w-[80px]">{s.name}</span></div>
                    <div className="flex items-center gap-2"><span className="font-semibold text-[var(--text-primary)]">{s.value}</span><span className="text-[var(--text-secondary)]">{totalSrc > 0 ? `${Math.round((s.value / totalSrc) * 100)}%` : ""}</span></div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className={C}>
          <p className="text-[13px] font-semibold text-[var(--text-primary)] mb-1">Top clientes por revenue</p>
          <p className="text-xs text-[var(--text-secondary)] mb-4">Los 5 clientes que más ingresos han generado</p>
          {loading ? <Skel /> : (data?.topClients?.length ?? 0) === 0 ? <div className="h-52 grid place-items-center text-xs text-[var(--text-secondary)]">Sin datos de facturación</div> : (
            <div className="space-y-3">
              {(data?.topClients ?? []).map((c, i) => {
                const w = Math.max((c.revenue / maxRev) * 100, 6)
                return (
                  <div key={i} className="flex items-center gap-2.5">
                    <span className="w-5 h-5 rounded-full text-[10px] font-bold flex items-center justify-center shrink-0" style={{ background: "#3B82F618", color: "#3B82F6" }}>{i + 1}</span>
                    <p className="text-[11px] text-[var(--text-secondary)] w-28 shrink-0 truncate">{c.name}</p>
                    <div className="flex-1 h-6 bg-[var(--bg-surface)] rounded overflow-hidden">
                      <div className="h-full rounded flex items-center px-2 transition-all" style={{ width: `${w}%`, background: "#3B82F6" }}>
                        <span className="text-[10px] font-bold text-white whitespace-nowrap">{eur(c.revenue)}</span>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
        <div className={C}>
          <p className="text-[13px] font-semibold text-[var(--text-primary)] mb-1">Nivel de riesgo</p>
          <p className="text-xs text-[var(--text-secondary)] mb-4">Clasificación de salud de cada cliente</p>
          {loading ? <Skel /> : (data?.byRisk?.length ?? 0) === 0 ? <div className="h-52 grid place-items-center text-xs text-[var(--text-secondary)]">Sin datos</div> : (
            <div className="space-y-3">
              {(data?.byRisk ?? []).map((r, i) => {
                const total = (data?.byRisk ?? []).reduce((s, x) => s + x.value, 0)
                const pct = total > 0 ? Math.round((r.value / total) * 100) : 0
                return (
                  <div key={i}>
                    <div className="flex justify-between mb-1.5">
                      <div className="flex items-center gap-2"><span className="w-2 h-2 rounded-full" style={{ background: r.color }} /><span className="text-xs font-medium text-[var(--text-primary)]">{r.name}</span></div>
                      <span className="text-xs font-bold" style={{ color: r.color }}>{r.value} <span className="text-[var(--text-secondary)] font-normal">({pct}%)</span></span>
                    </div>
                    <div className="h-1.5 bg-[var(--bg-surface)] rounded-full overflow-hidden">
                      <div className="h-full rounded-full" style={{ width: `${pct}%`, background: r.color }} />
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
