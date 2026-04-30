"use client"

import { useState, useEffect } from "react"
import { useSearchParams } from "next/navigation"
import { Suspense } from "react"
import { DashboardView } from "./components/DashboardView"

export interface SummaryData {
  kpis: {
    leadsActive: number
    leadsNewThisWeek: number
    leadsThisMonth: number
    invoicedThisMonth: number
    invoicedPrevMonth: number
    pendingCobro: number
    pendingCobroCount: number
    tasksHighPriority: number
    tasksOverdue: number
    invoicesOverdue: number
    clientsActive: number
  }
  leadsByStatus: {
    NEW: number
    CONTACTED: number
    QUALIFIED: number
    CONVERTED: number
    LOST: number
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
      <div className="flex gap-5">
        <div className="min-w-0 flex-1 space-y-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
            <div className="space-y-2">
              <div className="h-6 w-52 animate-pulse rounded-lg bg-slate-100" />
              <div className="h-3.5 w-36 animate-pulse rounded-lg bg-slate-100" />
            </div>
            <div className="flex gap-2">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-8 w-20 sm:w-28 animate-pulse rounded-lg bg-slate-100" />
              ))}
            </div>
          </div>
          <div className="h-[108px] animate-pulse rounded-xl bg-slate-100" />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="md:col-span-2 h-[180px] animate-pulse rounded-xl bg-slate-100" />
            <div className="h-[180px] animate-pulse rounded-xl bg-slate-100" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="h-[240px] animate-pulse rounded-xl bg-slate-100" />
            <div className="h-[240px] animate-pulse rounded-xl bg-slate-100" />
          </div>
        </div>
        <div className="hidden w-[248px] flex-shrink-0 space-y-4 lg:block">
          <div className="h-[220px] animate-pulse rounded-xl bg-slate-100" />
          <div className="h-[160px] animate-pulse rounded-xl bg-slate-100" />
          <div className="h-[200px] animate-pulse rounded-xl bg-slate-100" />
        </div>
      </div>
    </div>
  )
}

function UpgradeToast() {
  const searchParams = useSearchParams()
  const upgrade = searchParams?.get("upgrade")
  const plan = searchParams?.get("plan")
  const [visible, setVisible] = useState(upgrade === "success")

  // Remove ?upgrade=success from URL without re-render
  useEffect(() => {
    if (upgrade === "success" && typeof window !== "undefined") {
      const url = new URL(window.location.href)
      url.searchParams.delete("upgrade")
      url.searchParams.delete("plan")
      window.history.replaceState({}, "", url.toString())
      // Clear cached plan info so TrialBanner re-fetches
      sessionStorage.removeItem("cl_plan_banner")
    }
  }, [upgrade])

  if (!visible) return null

  return (
    <div
      className="fixed bottom-6 right-6 z-50 flex items-center gap-3 rounded-xl px-5 py-4 shadow-lg text-[13px] font-medium text-white"
      style={{ background: "#1FA97A", maxWidth: 360 }}
    >
      <span className="text-lg">🎉</span>
      <span>
        {plan
          ? `¡Bienvenido al plan ${plan.charAt(0).toUpperCase() + plan.slice(1)}! Tu cuenta está activa.`
          : "¡Suscripción activada con éxito!"}
      </span>
      <button
        onClick={() => setVisible(false)}
        className="ml-2 shrink-0 opacity-70 hover:opacity-100 transition-opacity text-white"
        aria-label="Cerrar"
      >
        ✕
      </button>
    </div>
  )
}

function DashboardPageInner() {
  const [data, setData] = useState<SummaryData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)

  useEffect(() => {
    fetch("/api/dashboard/summary")
      .then((r) => {
        if (!r.ok) throw new Error("Error")
        return r.json()
      })
      .then((json: SummaryData) => setData(json))
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

export default function DashboardPage() {
  return (
    <>
      <Suspense fallback={null}>
        <UpgradeToast />
      </Suspense>
      <Suspense fallback={<DashboardSkeleton />}>
        <DashboardPageInner />
      </Suspense>
    </>
  )
}
