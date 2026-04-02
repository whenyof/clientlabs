"use client"

import { useRouter } from "next/navigation"
import { Users, TrendingUp, Clock, AlertTriangle } from "lucide-react"
import { cn } from "@/lib/utils"

interface KPI {
  label: string
  value: string
  sublabel: string
  icon: React.ElementType
  href: string
  valueColor?: string
  showTrend?: boolean
}

interface Props {
  leadsActive: number
  leadsNewThisWeek: number
  invoicedThisMonth: number
  invoicedPrevMonth: number
  pendingCobro: number
  pendingCobroCount: number
  tasksHighPriority: number
}

const currencyFmt = new Intl.NumberFormat("es-ES", {
  style: "currency",
  currency: "EUR",
  maximumFractionDigits: 0,
})

export function DashboardKPIs({
  leadsActive,
  leadsNewThisWeek,
  invoicedThisMonth,
  invoicedPrevMonth,
  pendingCobro,
  pendingCobroCount,
  tasksHighPriority,
}: Props) {
  const router = useRouter()

  const invoiceIsUp = invoicedThisMonth >= invoicedPrevMonth

  const kpis: KPI[] = [
    {
      label: "Leads activos",
      value: String(leadsActive),
      sublabel: `${leadsNewThisWeek} nuevos esta semana`,
      icon: Users,
      href: "/dashboard/leads",
      showTrend: leadsNewThisWeek > 0,
    },
    {
      label: "Facturado este mes",
      value: currencyFmt.format(invoicedThisMonth),
      sublabel: `vs mes anterior: ${currencyFmt.format(invoicedPrevMonth)}`,
      icon: TrendingUp,
      href: "/dashboard/finance",
      valueColor: invoiceIsUp ? "text-[#1FA97A]" : "text-slate-900",
      showTrend: invoiceIsUp,
    },
    {
      label: "Pendiente de cobro",
      value: currencyFmt.format(pendingCobro),
      sublabel: `${pendingCobroCount} factura${pendingCobroCount !== 1 ? "s" : ""} pendiente${pendingCobroCount !== 1 ? "s" : ""}`,
      icon: Clock,
      href: "/dashboard/finance",
      valueColor: pendingCobro > 0 ? "text-amber-600" : "text-slate-900",
    },
    {
      label: "Tareas prioritarias",
      value: String(tasksHighPriority),
      sublabel: "requieren atención hoy",
      icon: AlertTriangle,
      href: "/dashboard/tasks",
      valueColor: tasksHighPriority > 0 ? "text-red-500" : "text-slate-900",
    },
  ]

  return (
    <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
      {kpis.map((kpi) => {
        const Icon = kpi.icon
        return (
          <div
            key={kpi.label}
            className="cursor-pointer rounded-xl border border-slate-200 bg-white p-4 transition-all duration-200 hover:border-[#1FA97A]/40 hover:shadow-[0_2px_12px_rgba(31,169,122,0.06)] group"
            onClick={() => router.push(kpi.href)}
          >
            <div className="mb-3 flex items-center justify-between">
              <span className="text-[11px] font-medium uppercase tracking-[0.08em] text-slate-500">
                {kpi.label}
              </span>
              <div className="flex h-7 w-7 items-center justify-center rounded-lg border border-slate-100 bg-slate-50 transition-colors group-hover:border-[#1FA97A]/20 group-hover:bg-[#E1F5EE]">
                <Icon className="h-3.5 w-3.5 text-slate-400 transition-colors group-hover:text-[#1FA97A]" />
              </div>
            </div>

            <div className={cn("mb-1.5 text-[28px] font-semibold leading-none tracking-tight", kpi.valueColor ?? "text-slate-900")}>
              {kpi.value}
            </div>

            <p className="flex items-center gap-1.5 text-[12px] text-slate-500">
              {kpi.showTrend && (
                <TrendingUp className="h-3 w-3 text-[#1FA97A]" />
              )}
              {kpi.sublabel}
            </p>
          </div>
        )
      })}
    </div>
  )
}

export function DashboardKPIsSkeleton() {
  return (
    <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} className="rounded-xl border border-slate-200 bg-white p-4">
          <div className="mb-3 flex items-center justify-between">
            <div className="h-3 w-24 animate-pulse rounded bg-slate-100" />
            <div className="h-7 w-7 animate-pulse rounded-lg bg-slate-100" />
          </div>
          <div className="mb-1.5 h-8 w-20 animate-pulse rounded bg-slate-100" />
          <div className="h-3 w-32 animate-pulse rounded bg-slate-100" />
        </div>
      ))}
    </div>
  )
}
