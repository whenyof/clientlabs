"use client"

import { useState, useEffect } from "react"
import { cn } from "@/lib/utils"
import { DashboardActivity } from "./DashboardActivity"

interface Props {
  activityFeed: {
    leads: Array<{ id: string; name: string | null; createdAt: string }>
    invoices: Array<{ id: string; number: string; total: string | number; updatedAt: string }>
    tasks: Array<{ id: string; title: string; updatedAt: string }>
  }
  kpis: {
    leadsNewThisWeek: number
    invoicesOverdue: number
    tasksOverdue: number
    clientsActive: number
  }
  leadsThisMonth: number
  invoicedThisMonth: number
}

const currencyFmt = new Intl.NumberFormat("es-ES", {
  style: "currency",
  currency: "EUR",
  maximumFractionDigits: 0,
})

function pad(n: number) {
  return String(n).padStart(2, "0")
}

const MONTHS_ES = ["Enero","Febrero","Marzo","Abril","Mayo","Junio","Julio","Agosto","Septiembre","Octubre","Noviembre","Diciembre"]

export function DashboardSidebar({ activityFeed, kpis, leadsThisMonth, invoicedThisMonth }: Props) {
  const [now, setNow] = useState(new Date())

  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 60000)
    return () => clearInterval(id)
  }, [])

  const daysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate()
  const dayOfMonth = now.getDate()
  const progress = Math.round((dayOfMonth / daysInMonth) * 100)
  const daysLeft = daysInMonth - dayOfMonth
  const currentMonth = MONTHS_ES[now.getMonth()]
  const nextMonth = MONTHS_ES[(now.getMonth() + 1) % 12]

  const healthItems = [
    { label: "Leads esta semana", value: kpis.leadsNewThisWeek, problem: false },
    { label: "Facturas vencidas", value: kpis.invoicesOverdue, problem: kpis.invoicesOverdue > 0 },
    { label: "Tareas atrasadas", value: kpis.tasksOverdue, problem: kpis.tasksOverdue > 0 },
    { label: "Clientes activos", value: kpis.clientsActive, problem: false },
  ]

  const healthScore = healthItems.filter((h) => !h.problem).length
  const healthPct = (healthScore / 4) * 100
  const healthColor =
    healthScore === 4 ? "#1FA97A" : healthScore === 3 ? "#D97706" : "#DC2626"
  const healthLabel =
    healthScore === 4 ? "Excelente" : healthScore === 3 ? "Buena" : healthScore === 2 ? "Regular" : "Atención"

  return (
    <aside className="hidden w-[248px] flex-shrink-0 lg:flex lg:flex-col gap-4">
      {/* Clock + Progreso del mes */}
      <div className="relative overflow-hidden rounded-xl bg-[#0B1F2A]">
        {/* Subtle grid texture */}
        <div
          className="pointer-events-none absolute inset-0"
          style={{
            backgroundImage: `linear-gradient(rgba(31,169,122,0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(31,169,122,0.05) 1px, transparent 1px)`,
            backgroundSize: "24px 24px",
          }}
        />
        {/* Top accent line */}
        <div className="absolute left-0 right-0 top-0 h-[2px] bg-[#1FA97A]/40" />

        <div className="relative z-10 p-4">
          {/* Clock */}
          <div className="mb-3">
            <div className="text-[38px] font-bold leading-none tracking-[-0.04em] text-white tabular-nums">
              {pad(now.getHours())}:{pad(now.getMinutes())}
            </div>
            <div className="mt-1 text-[10px] capitalize text-white/40">
              {now.toLocaleDateString("es-ES", { weekday: "long", day: "numeric", month: "long" })}
            </div>
          </div>

          {/* Month progress — inline, no nested card */}
          <div className="mb-4">
            <div className="mb-1.5 flex items-center justify-between">
              <span className="text-[9px] uppercase tracking-[0.08em] text-white/40">
                {currentMonth} · día {dayOfMonth}/{daysInMonth}
              </span>
              <span className="text-[11px] font-bold text-[#1FA97A]">{progress}%</span>
            </div>
            <div className="h-[3px] overflow-hidden rounded-full bg-white/[0.08]">
              <div
                className="h-full rounded-full bg-[#1FA97A] transition-all duration-700"
                style={{ width: `${progress}%` }}
              />
            </div>
            <p className="mt-1 text-[8px] text-white/25">
              Quedan {daysLeft} día{daysLeft !== 1 ? "s" : ""} para {nextMonth}
            </p>
          </div>

          {/* Stats grid */}
          <div className="grid grid-cols-2 gap-2">
            <div
              className="rounded-lg p-2.5"
              style={{ backgroundColor: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.07)" }}
            >
              <div className="mb-1.5 text-[8px] font-semibold uppercase tracking-[0.1em] text-white/30">
                Leads este mes
              </div>
              <div className="text-[24px] font-bold leading-none text-[#1FA97A] tabular-nums">
                {leadsThisMonth}
              </div>
            </div>
            <div
              className="rounded-lg p-2.5"
              style={{ backgroundColor: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.07)" }}
            >
              <div className="mb-1.5 text-[8px] font-semibold uppercase tracking-[0.1em] text-white/30">
                Facturado
              </div>
              <div className={cn("text-[16px] font-bold leading-none tabular-nums", invoicedThisMonth > 0 ? "text-white" : "text-white/25")}>
                {currencyFmt.format(invoicedThisMonth)}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Salud del negocio */}
      <div className="rounded-xl border border-slate-200 bg-white p-4">
        {/* Health score ring */}
        <div className="mb-3 flex items-center gap-3">
          <div
            className="relative h-10 w-10 flex-shrink-0 rounded-full"
            style={{
              background: `conic-gradient(${healthColor} ${healthPct * 3.6}deg, #E2E8F0 0deg)`,
            }}
          >
            <div className="absolute inset-1.5 flex items-center justify-center rounded-full bg-white">
              <span className="text-[9px] font-bold" style={{ color: healthColor }}>
                {healthScore}/4
              </span>
            </div>
          </div>
          <div>
            <p className="text-[13px] font-semibold text-slate-900">{healthLabel}</p>
            <p className="text-[9px] uppercase tracking-[0.08em] text-slate-400">Salud del negocio</p>
          </div>
        </div>

        {/* Items */}
        {healthItems.map((item) => (
          <div
            key={item.label}
            className="flex items-center justify-between border-b border-slate-100 py-2 last:border-0"
          >
            <div className="flex items-center gap-2">
              <div className={cn("h-1.5 w-1.5 rounded-full", item.problem ? "bg-red-400" : "bg-[#1FA97A]")} />
              <span className="text-[11px] text-slate-600">{item.label}</span>
            </div>
            <span className={cn("text-[12px] font-semibold", item.problem ? "text-red-500" : "text-slate-900")}>
              {item.value}
            </span>
          </div>
        ))}
      </div>

      {/* Actividad reciente */}
      <div className="rounded-xl border border-slate-200 bg-white p-4">
        <div className="mb-3 flex items-center gap-1.5">
          <h3 className="text-[10px] font-semibold uppercase tracking-[0.1em] text-slate-400">
            Actividad
          </h3>
          <span className="relative flex h-1.5 w-1.5">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#1FA97A] opacity-60" />
            <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-[#1FA97A]" />
          </span>
          <span className="text-[9px] text-slate-400">En vivo</span>
        </div>
        <DashboardActivity
          leads={activityFeed.leads}
          invoices={activityFeed.invoices}
          tasks={activityFeed.tasks}
        />
      </div>
    </aside>
  )
}
