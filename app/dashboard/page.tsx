"use client"

import { useMemo, useState, useEffect, useCallback } from "react"
import { useSectorConfig } from "@/hooks/useSectorConfig"
import { KPICard } from "./components/KPICard"
import { RevenueChart } from "./components/RevenueChart"
import { ActivityFeed } from "./components/ActivityFeed"
import { QuickActions } from "./components/QuickActions"
import { SystemStatus } from "./components/SystemStatus"
import { AIInsights } from "./components/AIInsights"

const DEFAULT_KPI_ORDER = ['income', 'sales', 'clients', 'leads', 'tasks', 'bots'] as const
const currencyFmt = new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 })

export default function Dashboard() {
  const { labels, features, dashboard: dashboardConfig } = useSectorConfig()
  const [stats, setStats] = useState<{
    income: number
    incomeChange: number
    salesCount: number
    salesChange: number
    clientsCount: number
    leadsCount: number
    tasksCount: number
    botsCount: number
    revenueByMonth?: { month: string; revenue: number }[]
    monthlyRevenueTarget: number
  } | null>(null)
  const [loading, setLoading] = useState(true)

  const fetchStats = useCallback(() => {
    fetch('/api/dashboard/stats')
      .then((res) => res.ok ? res.json() : Promise.reject(new Error('Failed to load')))
      .then((data) => setStats(data))
      .catch(() => setStats(null))
  }, [])

  useEffect(() => {
    let cancelled = false
    fetch('/api/dashboard/stats')
      .then((res) => res.ok ? res.json() : Promise.reject(new Error('Failed to load')))
      .then((data) => { if (!cancelled) setStats(data) })
      .catch(() => { if (!cancelled) setStats(null) })
      .finally(() => { if (!cancelled) setLoading(false) })
    return () => { cancelled = true }
  }, [])

  useEffect(() => {
    const onFocus = () => fetchStats()
    window.addEventListener('focus', onFocus)
    return () => window.removeEventListener('focus', onFocus)
  }, [fetchStats])

  const kpiItems = useMemo(() => {
    const order = dashboardConfig?.kpiOrder ?? DEFAULT_KPI_ORDER
    const s = stats
    const items: Array<{ id: string; title: string; value: string; change: { value: number; isPositive: boolean }; description: string }> = [
      { id: 'income', title: labels.finance.income, value: s ? currencyFmt.format(s.income) : '—', change: s ? { value: Math.round(s.incomeChange * 10) / 10, isPositive: s.incomeChange >= 0 } : { value: 0, isPositive: true }, description: labels.dashboard.kpis.incomeDescription },
      { id: 'sales', title: labels.sales.plural, value: s ? String(s.salesCount) : '—', change: s ? { value: Math.round(s.salesChange * 10) / 10, isPositive: s.salesChange >= 0 } : { value: 0, isPositive: true }, description: labels.dashboard.kpis.salesDescription },
      { id: 'clients', title: labels.clients.plural, value: s ? String(s.clientsCount) : '—', change: { value: 0, isPositive: true }, description: labels.dashboard.kpis.clientsDescription },
      { id: 'leads', title: labels.leads.plural, value: s ? String(s.leadsCount) : '—', change: { value: 0, isPositive: true }, description: labels.dashboard.kpis.leadsDescription },
      { id: 'tasks', title: labels.tasks.plural, value: s ? String(s.tasksCount) : '—', change: { value: 0, isPositive: true }, description: labels.dashboard.kpis.tasksDescription },
      { id: 'bots', title: labels.dashboard.kpis.botsTitle, value: s ? String(s.botsCount) : '—', change: { value: 0, isPositive: true }, description: labels.dashboard.kpis.botsDescription },
    ]
    const byId = Object.fromEntries(items.map((i) => [i.id, i]))
    const visible = order.filter((id) => id === 'bots' ? features.modules.automations : true)
    return visible.map((id) => byId[id]).filter(Boolean)
  }, [labels, features.modules.automations, dashboardConfig?.kpiOrder, stats])

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[280px]">
        <div className="h-10 w-10 animate-spin rounded-full border-2 border-neutral-200 border-t-neutral-900" />
      </div>
    )
  }

  const incomeItem = kpiItems.find((k) => k.id === 'income')
  const otherItems = kpiItems.filter((k) => k.id !== 'income')

  return (
    <div className="mx-auto w-full max-w-[1400px] space-y-8">
      {/* 1. Métricas principales */}
      <section className="space-y-4">
        <h2 className="text-xl font-semibold text-neutral-900">
          {labels.dashboard.sections.metrics}
        </h2>
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {incomeItem && (
            <div className="rounded-xl border-2 border-neutral-900 bg-white p-6 shadow-sm">
              <KPICard
                title={incomeItem.title}
                value={incomeItem.value}
                change={incomeItem.change}
                description={incomeItem.description}
              />
            </div>
          )}
          {otherItems.slice(0, 3).map((item) => (
            <div
              key={item.id}
              className="rounded-xl border border-neutral-200 bg-white p-6 shadow-sm"
            >
              <KPICard
                title={item.title}
                value={item.value}
                change={item.change}
                description={item.description}
              />
            </div>
          ))}
        </div>
      </section>

      {/* 2. Análisis de rendimiento */}
      <section className="space-y-4">
        <h2 className="text-xl font-semibold text-neutral-900">
          {labels.dashboard.sections.analysis}
        </h2>
        <div className="flex min-h-[400px] flex-col rounded-xl border border-neutral-200 bg-white p-6 shadow-sm">
          <RevenueChart data={stats?.revenueByMonth ?? []} monthlyRevenueTarget={stats?.monthlyRevenueTarget ?? 0} />
        </div>
      </section>

      {/* 3. Inteligencia artificial + Actividad */}
      <section className="space-y-4">
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <div className="flex flex-col rounded-xl border border-neutral-200 bg-white p-6 shadow-sm">
            <h2 className="mb-4 text-xl font-semibold text-neutral-900">
              {labels.dashboard.sections.ai}
            </h2>
            {features.modules.aiInsights ? (
              <AIInsights />
            ) : (
              <div className="flex flex-1 items-center justify-center text-sm text-neutral-500">
                Módulo de inteligencia desactivado
              </div>
            )}
          </div>
          <div className="flex flex-col rounded-xl border border-neutral-200 bg-white p-6 shadow-sm">
            <h2 className="mb-4 text-xl font-semibold text-neutral-900">
              {labels.dashboard.sections.activity}
            </h2>
            <div className="min-h-0 flex-1">
              <ActivityFeed />
            </div>
          </div>
        </div>
      </section>

      {/* 4. Acciones rápidas + Estado del sistema */}
      <section>
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <div className="rounded-xl border border-neutral-200 bg-white p-6 shadow-sm">
            <QuickActions />
          </div>
          <div className="rounded-xl border border-neutral-200 bg-white p-6 shadow-sm">
            <SystemStatus />
          </div>
        </div>
      </section>
    </div>
  )
}