"use client"

import { useEffect, useState } from "react"
import { Building2, ShieldAlert, DollarSign, AlertOctagon } from "lucide-react"
import { KPICard } from "@/components/analytics/KPICard"
import dynamic from "next/dynamic"

const RC  = dynamic(() => import("recharts").then(m => m.ResponsiveContainer),  { ssr: false })
const BC  = dynamic(() => import("recharts").then(m => m.BarChart),              { ssr: false })
const RBar= dynamic(() => import("recharts").then(m => m.Bar),                   { ssr: false })
const RX  = dynamic(() => import("recharts").then(m => m.XAxis),                 { ssr: false })
const RY  = dynamic(() => import("recharts").then(m => m.YAxis),                 { ssr: false })
const RT  = dynamic(() => import("recharts").then(m => m.Tooltip),               { ssr: false })
const PC  = dynamic(() => import("recharts").then(m => m.PieChart),              { ssr: false })
const RPie= dynamic(() => import("recharts").then(m => m.Pie),                   { ssr: false })
const RCell=dynamic(() => import("recharts").then(m => m.Cell),                  { ssr: false })

interface Data {
  kpis: { total: number; active: number; critical: number; atRisk: number; totalMonthlyCost: number }
  byCost: { name: string; cost: number; critical: boolean }[]
  byDependency: { name: string; value: number; color: string }[]
  byOperationalState: { key: string; name: string; value: number; color: string }[]
}

const C = "bg-[var(--bg-card)] border border-[var(--border-subtle)] rounded-xl p-5"
const tip = { background: "var(--bg-card)", border: "0.5px solid var(--border-subtle)", borderRadius: 8, fontSize: 12 }
const ax = { fontSize: 11, fill: "var(--text-secondary)" }
const Skel = () => <div className="h-52 bg-[var(--bg-surface)] rounded-lg animate-pulse" />
const eur = (n: number) => new Intl.NumberFormat("es-ES", { style: "currency", currency: "EUR", maximumFractionDigits: 0 }).format(n)

export default function ProvidersAnalyticsPage() {
  const [data, setData] = useState<Data | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch("/api/providers/analytics").then(r => r.json()).then(d => { setData(d); setLoading(false) }).catch(() => setLoading(false))
  }, [])

  const totalDep = (data?.byDependency ?? []).reduce((s, x) => s + x.value, 0)
  const criticalPct = data?.kpis.total ? Math.round((data.kpis.critical / data.kpis.total) * 100) : 0

  return (
    <div className="p-6 w-full space-y-5">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-[11px] text-[var(--text-secondary)] mb-1">Dashboard / <span className="text-[var(--text-primary)]">Proveedores</span></p>
          <h1 className="text-2xl font-bold text-[var(--text-primary)] tracking-tight">Analíticas de Proveedores</h1>
          <p className="text-sm text-[var(--text-secondary)] mt-0.5">Control de costes, dependencias y estado operacional</p>
        </div>
        <div className="text-right">
          <p className="text-xs text-[var(--text-secondary)]">Coste mensual total</p>
          <p className="text-2xl font-bold text-[var(--text-primary)]">{loading ? "—" : eur(data?.kpis.totalMonthlyCost ?? 0)}</p>
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <KPICard title="Total proveedores" value={data?.kpis.total ?? 0}    badge={`${data?.kpis.active ?? 0} activos`} badgeColor="#1FA97A" loading={loading} />
        <KPICard title="Coste mensual"     value={loading ? "—" : eur(data?.kpis.totalMonthlyCost ?? 0)} loading={loading} sparkColor="#F59E0B" />
        <KPICard title="Críticos"          value={data?.kpis.critical ?? 0} badge={criticalPct ? `${criticalPct}% del total` : undefined} badgeColor="#EF4444" loading={loading} />
        <KPICard title="En riesgo"         value={data?.kpis.atRisk ?? 0}   badge={data?.kpis.atRisk ? "requieren atención" : undefined} badgeColor="#F59E0B" loading={loading} />
      </div>

      <div className={C}>
        <div className="flex items-start justify-between mb-4">
          <div>
            <p className="text-[13px] font-semibold text-[var(--text-primary)]">Ranking de coste mensual</p>
            <p className="text-xs text-[var(--text-secondary)] mt-0.5">Ordenado de mayor a menor · Rojo = proveedor crítico</p>
          </div>
          <p className="text-xs text-[var(--text-secondary)]">{data?.byCost?.length ?? 0} proveedores con coste</p>
        </div>
        {loading ? <Skel /> : (data?.byCost?.length ?? 0) === 0
          ? <div className="h-52 grid place-items-center text-xs text-[var(--text-secondary)]">No hay costes configurados aún</div>
          : (
            <div className="h-64">
              <RC width="100%" height="100%">
                <BC data={data?.byCost ?? []} layout="vertical" margin={{ top: 0, right: 16, left: 4, bottom: 0 }}>
                  <RX type="number" tick={ax} axisLine={false} tickLine={false} tickFormatter={v => `${v}€`} />
                  <RY type="category" dataKey="name" tick={ax} axisLine={false} tickLine={false} width={96} />
                  <RT contentStyle={tip} formatter={(v) => [`${v}€/mes`, "Coste"]} />
                  <RBar dataKey="cost" radius={[0, 5, 5, 0]} name="Coste mensual" maxBarSize={18}>
                    {(data?.byCost ?? []).map((e, i) => <RCell key={i} fill={e.critical ? "#EF4444" : "#F59E0B"} fillOpacity={e.critical ? 0.9 : 0.75} />)}
                  </RBar>
                </BC>
              </RC>
            </div>
          )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className={C}>
          <p className="text-[13px] font-semibold text-[var(--text-primary)] mb-1">Nivel de dependencia</p>
          <p className="text-xs text-[var(--text-secondary)] mb-3">Riesgo operacional si el proveedor falla o desaparece</p>
          {loading ? <Skel /> : (data?.byDependency?.length ?? 0) === 0 ? <div className="h-52 grid place-items-center text-xs text-[var(--text-secondary)]">Sin datos</div> : (
            <div className="flex items-center gap-6">
              <div className="relative w-40 h-40 shrink-0">
                <RC width="100%" height="100%">
                  <PC>
                    <RPie data={data?.byDependency ?? []} cx="50%" cy="50%" innerRadius={44} outerRadius={68} dataKey="value" paddingAngle={4}>
                      {(data?.byDependency ?? []).map((e, i) => <RCell key={i} fill={e.color} />)}
                    </RPie>
                    <RT contentStyle={tip} />
                  </PC>
                </RC>
                <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                  <p className="text-[10px] text-[var(--text-secondary)] uppercase tracking-wider">Total</p>
                  <p className="text-xl font-bold text-[var(--text-primary)]">{totalDep}</p>
                </div>
              </div>
              <div className="flex-1 space-y-2.5">
                {(data?.byDependency ?? []).map((d, i) => {
                  const pct = totalDep > 0 ? Math.round((d.value / totalDep) * 100) : 0
                  return (
                    <div key={i} className="p-2.5 rounded-lg flex items-center justify-between" style={{ background: d.color + "12" }}>
                      <div className="flex items-center gap-2"><span className="w-2 h-2 rounded-full" style={{ background: d.color }} /><span className="text-xs font-medium text-[var(--text-primary)]">{d.name}</span></div>
                      <span className="text-sm font-bold" style={{ color: d.color }}>{d.value} <span className="text-xs font-normal text-[var(--text-secondary)]">({pct}%)</span></span>
                    </div>
                  )
                })}
              </div>
            </div>
          )}
        </div>

        <div className={C}>
          <p className="text-[13px] font-semibold text-[var(--text-primary)] mb-1">Estado operacional</p>
          <p className="text-xs text-[var(--text-secondary)] mb-4">Situación actual de cada proveedor en tu stack</p>
          {loading ? <Skel /> : (data?.byOperationalState?.length ?? 0) === 0 ? <div className="h-52 grid place-items-center text-xs text-[var(--text-secondary)]">Sin datos</div> : (
            <div className="space-y-4 mt-2">
              {(data?.byOperationalState ?? []).map((s, i) => {
                const total = (data?.byOperationalState ?? []).reduce((a, x) => a + x.value, 0)
                const pct = total > 0 ? Math.round((s.value / total) * 100) : 0
                return (
                  <div key={i}>
                    <div className="flex items-center justify-between mb-1.5">
                      <div className="flex items-center gap-2"><span className="w-2 h-2 rounded-full" style={{ background: s.color }} /><span className="text-xs font-semibold text-[var(--text-primary)]">{s.name}</span></div>
                      <span className="text-sm font-bold" style={{ color: s.color }}>{s.value} <span className="text-xs font-normal text-[var(--text-secondary)]">({pct}%)</span></span>
                    </div>
                    <div className="h-2 bg-[var(--bg-surface)] rounded-full overflow-hidden">
                      <div className="h-full rounded-full transition-all" style={{ width: `${pct}%`, background: s.color }} />
                    </div>
                  </div>
                )
              })}
              <div className="pt-2 border-t border-[var(--border-subtle)]">
                <p className="text-[11px] text-[var(--text-secondary)]">Total registrados: <span className="font-bold text-[var(--text-primary)]">{data?.kpis.total ?? 0}</span> proveedores</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
