"use client"

import { useState, useEffect } from "react"
import { DashboardActivity } from "./DashboardActivity"
import { DashboardHealth } from "./DashboardHealth"

interface Lead {
  id: string
  name: string | null
  createdAt: string
}

interface Invoice {
  id: string
  number: string
  total: string | number
  updatedAt: string
}

interface Task {
  id: string
  title: string
  updatedAt: string
}

interface Props {
  activityFeed: {
    leads: Lead[]
    invoices: Invoice[]
    tasks: Task[]
  }
  kpis: {
    leadsNewThisWeek: number
    invoicesOverdue: number
    tasksOverdue: number
    clientsActive: number
  }
}

const LAUNCH_DATE = new Date("2026-06-23T00:00:00")

function getDaysToLaunch(): number {
  const diff = LAUNCH_DATE.getTime() - Date.now()
  return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)))
}

function getMonthProgress(): number {
  const now = new Date()
  const totalDays = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate()
  return Math.round((now.getDate() / totalDays) * 100)
}

function formatTime(date: Date): string {
  return date.toLocaleTimeString("es-ES", { hour: "2-digit", minute: "2-digit" })
}

function formatDateFull(date: Date): string {
  return date.toLocaleDateString("es-ES", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  })
}

export function DashboardSidebar({ activityFeed, kpis }: Props) {
  const [now, setNow] = useState(new Date())

  useEffect(() => {
    const interval = setInterval(() => setNow(new Date()), 60000)
    return () => clearInterval(interval)
  }, [])

  const daysToLaunch = getDaysToLaunch()
  const monthProgress = getMonthProgress()

  return (
    <aside className="hidden w-[272px] flex-shrink-0 lg:flex lg:flex-col gap-4">
      {/* Resumen del día */}
      <div className="rounded-xl bg-[#0B1F2A] p-5">
        <p className="mb-0.5 text-[22px] font-semibold tracking-tight text-white">
          {formatTime(now)}
        </p>
        <p className="text-[12px] capitalize text-slate-400">{formatDateFull(now)}</p>

        <div className="mt-4 border-t border-white/10 pt-4">
          <div className="mb-2 flex items-center justify-between">
            <span className="text-[11px] text-slate-400">Lanzamiento</span>
            <span className="text-[11px] font-semibold text-[#1FA97A]">
              {daysToLaunch}d restantes
            </span>
          </div>

          <div className="mb-4 h-1 rounded-full bg-white/10 overflow-hidden">
            <div
              className="h-full rounded-full bg-[#1FA97A]"
              style={{
                width: `${Math.max(2, 100 - (daysToLaunch / 83) * 100)}%`,
              }}
            />
          </div>

          <div className="flex items-center justify-between">
            <span className="text-[11px] text-slate-400">Mes actual</span>
            <span className="text-[11px] font-semibold text-white">{monthProgress}%</span>
          </div>
          <div className="mt-2 h-1 rounded-full bg-white/10 overflow-hidden">
            <div
              className="h-full rounded-full bg-white/40"
              style={{ width: `${monthProgress}%` }}
            />
          </div>
        </div>
      </div>

      {/* Actividad reciente */}
      <div className="rounded-xl border border-slate-200 bg-white p-5">
        <h3 className="mb-4 text-[13px] font-semibold text-slate-900">Actividad reciente</h3>
        <DashboardActivity
          leads={activityFeed.leads}
          invoices={activityFeed.invoices}
          tasks={activityFeed.tasks}
        />
      </div>

      {/* Salud del negocio */}
      <div className="rounded-xl border border-slate-200 bg-white p-5">
        <h3 className="mb-1 text-[13px] font-semibold text-slate-900">Salud del negocio</h3>
        <DashboardHealth
          leadsThisWeek={kpis.leadsNewThisWeek}
          invoicesOverdue={kpis.invoicesOverdue}
          tasksOverdue={kpis.tasksOverdue}
          clientsActive={kpis.clientsActive}
        />
      </div>
    </aside>
  )
}
