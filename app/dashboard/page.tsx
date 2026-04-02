"use client"

import { useState, useEffect } from "react"
import { DashboardView } from "./components/DashboardView"
import { DashboardKPIsSkeleton } from "./components/DashboardKPIs"
import { DashboardTasksSkeleton } from "./components/DashboardTasks"
import { DashboardLeadsSkeleton } from "./components/DashboardLeads"

interface SummaryData {
  kpis: {
    leadsActive: number
    leadsNewThisWeek: number
    invoicedThisMonth: number
    invoicedPrevMonth: number
    pendingCobro: number
    pendingCobroCount: number
    tasksHighPriority: number
    tasksOverdue: number
    invoicesOverdue: number
    clientsActive: number
  }
  leadsRecent: Array<{
    id: string
    name: string | null
    email: string | null
    leadStatus: string
    createdAt: string
  }>
  tasksHighPriority: Array<{
    id: string
    title: string
    dueDate: string | null
    priority: string
    type: string
  }>
  activityFeed: {
    leads: Array<{ id: string; name: string | null; createdAt: string }>
    invoices: Array<{ id: string; number: string; total: string | number; updatedAt: string }>
    tasks: Array<{ id: string; title: string; updatedAt: string }>
  }
  meta: {
    userName: string
    currentDate: string
  }
}

function DashboardSkeleton() {
  return (
    <div className="mx-auto w-full max-w-[1400px]">
      <div className="flex gap-6">
        <div className="min-w-0 flex-1 space-y-5">
          {/* Header skeleton */}
          <div className="flex items-start justify-between">
            <div className="space-y-2">
              <div className="h-7 w-56 animate-pulse rounded-lg bg-slate-100" />
              <div className="h-4 w-40 animate-pulse rounded-lg bg-slate-100" />
            </div>
            <div className="flex gap-2">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-8 w-28 animate-pulse rounded-lg bg-slate-100" />
              ))}
            </div>
          </div>

          <DashboardKPIsSkeleton />

          {/* Chart skeleton */}
          <div className="h-[320px] animate-pulse rounded-xl bg-slate-100" />

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <DashboardTasksSkeleton />
            <DashboardLeadsSkeleton />
          </div>
        </div>

        {/* Sidebar skeleton */}
        <div className="hidden w-[272px] flex-shrink-0 space-y-4 lg:block">
          <div className="h-[200px] animate-pulse rounded-xl bg-slate-100" />
          <div className="h-[240px] animate-pulse rounded-xl bg-slate-100" />
          <div className="h-[180px] animate-pulse rounded-xl bg-slate-100" />
        </div>
      </div>
    </div>
  )
}

export default function DashboardPage() {
  const [data, setData] = useState<SummaryData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)

  useEffect(() => {
    fetch("/api/dashboard/summary")
      .then((r) => {
        if (!r.ok) throw new Error("Error")
        return r.json()
      })
      .then((json: SummaryData) => {
        setData(json)
      })
      .catch(() => setError(true))
      .finally(() => setLoading(false))
  }, [])

  if (loading) return <DashboardSkeleton />

  if (error || !data) {
    return (
      <div className="flex min-h-[300px] items-center justify-center">
        <p className="text-[13px] text-slate-500">No se pudieron cargar los datos del panel.</p>
      </div>
    )
  }

  return <DashboardView data={data} />
}
