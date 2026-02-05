"use client"

import { useMemo, useState, useEffect, useCallback } from "react"
import { useSectorConfig } from "@/hooks/useSectorConfig"
import { KPICard } from "./components/KPICard"
import { RevenueChart } from "./components/RevenueChart"
import { FunnelChart } from "./components/FunnelChart"
import { ActivityFeed } from "./components/ActivityFeed"
import { QuickActions } from "./components/QuickActions"
import { SystemStatus } from "./components/SystemStatus"
import { AIInsights } from "./components/AIInsights"

const DEFAULT_KPI_ORDER = ['income', 'sales', 'clients', 'leads', 'tasks', 'bots'] as const
const currencyFmt = new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 })

export default function OtherDashboard() {
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
    const items: Array<{ id: string; title: string; value: string; change: { value: number; isPositive: boolean }; icon: string; description: string }> = [
      { id: 'income', title: labels.finance.income, value: s ? currencyFmt.format(s.income) : '—', change: s ? { value: Math.round(s.incomeChange * 10) / 10, isPositive: s.incomeChange >= 0 } : { value: 0, isPositive: true }, icon: '💰', description: labels.dashboard.kpis.incomeDescription },
      { id: 'sales', title: labels.sales.plural, value: s ? String(s.salesCount) : '—', change: s ? { value: Math.round(s.salesChange * 10) / 10, isPositive: s.salesChange >= 0 } : { value: 0, isPositive: true }, icon: '🛒', description: labels.dashboard.kpis.salesDescription },
      { id: 'clients', title: labels.clients.plural, value: s ? String(s.clientsCount) : '—', change: { value: 0, isPositive: true }, icon: '👥', description: labels.dashboard.kpis.clientsDescription },
      { id: 'leads', title: labels.leads.plural, value: s ? String(s.leadsCount) : '—', change: { value: 0, isPositive: true }, icon: '🎯', description: labels.dashboard.kpis.leadsDescription },
      { id: 'tasks', title: labels.tasks.plural, value: s ? String(s.tasksCount) : '—', change: { value: 0, isPositive: true }, icon: '📋', description: labels.dashboard.kpis.tasksDescription },
      { id: 'bots', title: labels.dashboard.kpis.botsTitle, value: s ? String(s.botsCount) : '—', change: { value: 0, isPositive: true }, icon: '🤖', description: labels.dashboard.kpis.botsDescription },
    ]
    const byId = Object.fromEntries(items.map((i) => [i.id, i]))
    const visible = order.filter((id) => id === 'bots' ? features.modules.automations : true)
    return visible.map((id) => byId[id]).filter(Boolean)
  }, [labels, features.modules.automations, dashboardConfig?.kpiOrder, stats])

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[200px]">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-purple-500" />
      </div>
    )
  }

  return (
    <div className="space-y-12">
      {/* KPI Cards - orden y visibilidad desde SectorConfig */}
      <section>
        <h2 className="text-xl font-semibold text-white mb-6">{labels.dashboard.sections.metrics}</h2>
        <div className="
          grid
          grid-cols-1
          sm:grid-cols-2
          xl:grid-cols-6
          gap-6
        ">
          {kpiItems.map((item) => (
            <KPICard
              key={item.id}
              title={item.title}
              value={item.value}
              change={item.change}
              icon={item.icon}
              description={item.description}
            />
          ))}
        </div>
      </section>

      {/* Charts Section */}
      <section>
        <h2 className="text-xl font-semibold text-white mb-6">{labels.dashboard.sections.analysis}</h2>
        <div className="
          grid
          grid-cols-1
          xl:grid-cols-2
          gap-8
        ">
          <div className="
            bg-white/5
            backdrop-blur-xl
            border border-white/10
            rounded-2xl
            p-8
          ">
            <RevenueChart data={stats?.revenueByMonth ?? []} />
          </div>
          <div className="
            bg-white/5
            backdrop-blur-xl
            border border-white/10
            rounded-2xl
            p-8
          ">
            <FunnelChart />
          </div>
        </div>
      </section>

      {/* Activity & Insights Section */}
      <section>
        <h2 className="text-xl font-semibold text-white mb-6">{labels.dashboard.sections.activity}</h2>
        <div className="
          grid
          grid-cols-1
          xl:grid-cols-3
          gap-8
        ">
          <div className="
            bg-white/5
            backdrop-blur-xl
            border border-white/10
            rounded-2xl
            p-8
          ">
            <ActivityFeed />
          </div>
          <div className="
            bg-white/5
            backdrop-blur-xl
            border border-white/10
            rounded-2xl
            p-8
          ">
            <QuickActions />
          </div>
          <div className="
            bg-white/5
            backdrop-blur-xl
            border border-white/10
            rounded-2xl
            p-8
          ">
            <SystemStatus />
          </div>
        </div>
      </section>

      {/* AI Insights Section */}
      {features.modules.aiInsights && (
        <section>
          <h2 className="text-xl font-semibold text-white mb-6">{labels.dashboard.sections.ai}</h2>
          <div className="
            bg-white/5
            backdrop-blur-xl
            border border-white/10
            rounded-2xl
            p-8
          ">
            <AIInsights />
          </div>
        </section>
      )}
    </div>
  )
}