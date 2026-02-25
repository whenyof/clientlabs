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
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-[var(--accent)]" />
      </div>
    )
  }

  return (
    <div className="space-y-12">
      {/* 1. MÉTRICAS (Nivel 1) */}
      <section>
        <h2 className="text-xl font-semibold text-[var(--text-primary)] mb-6">{labels.dashboard.sections.metrics}</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6">
          {kpiItems.slice(0, 4).map((item) => (
            <div key={item.id} className="bg-[var(--bg-card)] border border-[var(--border-subtle)] shadow-[var(--shadow-card)] rounded-xl p-6">
              <KPICard
                title={item.title}
                value={item.value}
                change={item.change}
                icon={item.icon}
                description={item.description}
              />
            </div>
          ))}
        </div>
      </section>

      {/* 2. GRÁFICO DOMINANTE (Nivel 2) */}
      <section>
        <h2 className="text-xl font-semibold text-[var(--text-primary)] mb-6">{labels.dashboard.sections.analysis}</h2>
        <div className="bg-[var(--bg-card)] border border-[var(--border-subtle)] shadow-[var(--shadow-card)] rounded-xl p-8 min-h-[420px] flex flex-col">
          <RevenueChart data={stats?.revenueByMonth ?? []} />
        </div>
      </section>

      {/* 3. BLOQUE INFERIOR (Nivel 3) */}
      <section>
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
          {/* Izquierda: Diagnóstico Automático */}
          <div className="bg-[var(--bg-card)] border border-[var(--border-subtle)] shadow-[var(--shadow-card)] rounded-xl p-8 flex flex-col">
            <h2 className="text-lg font-semibold text-[var(--text-primary)] mb-6">{labels.dashboard.sections.ai}</h2>
            {features.modules.aiInsights ? (
              <AIInsights />
            ) : (
              <div className="flex-1 flex items-center justify-center text-[var(--text-secondary)]">
                Módulo de inteligencia desactivado
              </div>
            )}
          </div>

          {/* Derecha: Actividad Reciente */}
          <div className="bg-[var(--bg-card)] border border-[var(--border-subtle)] shadow-[var(--shadow-card)] rounded-xl p-8 flex flex-col">
            <h2 className="text-lg font-semibold text-[var(--text-primary)] mb-6">{labels.dashboard.sections.activity}</h2>
            <div className="flex-1 min-h-0">
              <ActivityFeed />
            </div>
          </div>
        </div>
      </section>

      {/* 4. BLOQUE SECUNDARIO */}
      <section className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        <div className="bg-[var(--bg-card)] border border-[var(--border-subtle)] shadow-[var(--shadow-card)] rounded-xl p-6">
          <QuickActions />
        </div>
        <div className="bg-[var(--bg-card)] border border-[var(--border-subtle)] shadow-[var(--shadow-card)] rounded-xl p-6">
          <SystemStatus />
        </div>
      </section>
    </div>
  )
}