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

  return (
    <aside className="hidden w-[248px] flex-shrink-0 lg:flex lg:flex-col gap-4">
      {/* Clock + Progreso del mes */}
      <div className="relative overflow-hidden rounded-xl bg-[#0B1F2A]">
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: `linear-gradient(rgba(31,169,122,0.06) 1px, transparent 1px), linear-gradient(90deg, rgba(31,169,122,0.06) 1px, transparent 1px)`,
            backgroundSize: "28px 28px",
          }}
        />
        <div className="relative z-10 p-4">
          <div className="text-[32px] font-bold leading-none tracking-[-0.04em] text-white">
            {pad(now.getHours())}:{pad(now.getMinutes())}
          </div>
          <div className="mt-1 text-[10px] text-white/30 mb-4 capitalize">
            {now.toLocaleDateString("es-ES", { weekday: "long", day: "numeric", month: "long" })}
          </div>

          <div className="rounded-lg border border-[#1FA97A]/20 bg-[#1FA97A]/10 p-3">
            <div className="mb-2 flex items-center justify-between">
              <span className="text-[9px] uppercase tracking-[0.1em] text-white/35">
                {currentMonth} · día {dayOfMonth} de {daysInMonth}
              </span>
              <span className="text-[11px] font-semibold text-[#1FA97A]">{progress}%</span>
            </div>
            <div className="mb-2 h-[2px] overflow-hidden rounded-full bg-white/10">
              <div
                className="h-full rounded-full bg-[#1FA97A] transition-all"
                style={{ width: `${progress}%` }}
              />
            </div>
            <div className="flex justify-between">
              <span className="text-[9px] text-white/25">Progreso del mes</span>
              <span className="text-[9px] text-white/25">Quedan {daysLeft} días</span>
            </div>
          </div>

          <div className="mt-3 flex gap-4">
            <div>
              <div className="text-[9px] uppercase tracking-wider text-white/30 mb-0.5">Leads mes</div>
              <div className="text-[15px] font-bold text-[#1FA97A]">{leadsThisMonth}</div>
            </div>
            <div>
              <div className="text-[9px] uppercase tracking-wider text-white/30 mb-0.5">Facturado</div>
              <div className={cn("text-[15px] font-bold", invoicedThisMonth > 0 ? "text-white" : "text-white/30")}>
                {currencyFmt.format(invoicedThisMonth)}
              </div>
            </div>
          </div>

          <p className="mt-3 text-[9px] text-white/20">
            Quedan {daysLeft} días para {nextMonth}
          </p>
        </div>
      </div>

      {/* Salud del negocio */}
      <div className="rounded-xl border border-slate-200 bg-white p-4">
        <h3 className="mb-3 text-[10px] font-semibold uppercase tracking-[0.1em] text-slate-400">
          Salud del negocio
        </h3>
        {healthItems.map((item) => (
          <div
            key={item.label}
            className="flex items-center justify-between border-b border-slate-100 py-2 last:border-0"
          >
            <div className="flex items-center gap-2">
              <div className={cn("h-1.5 w-1.5 rounded-full", item.problem ? "bg-red-400" : "bg-[#1FA97A]")} />
              <span className="text-[12px] text-slate-600">{item.label}</span>
            </div>
            <span className={cn("text-[13px] font-semibold", item.problem ? "text-red-500" : "text-slate-900")}>
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
