"use client"

import { useRouter } from "next/navigation"
import { TrendingUp, Clock } from "lucide-react"
import { cn } from "@/lib/utils"

const currencyFmt = new Intl.NumberFormat("es-ES", {
  style: "currency",
  currency: "EUR",
  maximumFractionDigits: 0,
})

interface Props {
  invoicedThisMonth: number
  invoicedPrevMonth: number
  pendingCobro: number
  pendingCobroCount: number
}

function KPICard({
  dot,
  label,
  value,
  valueColor,
  sublabel,
  icon: Icon,
  accentColor,
  href,
}: {
  dot: string
  label: string
  value: string
  valueColor: string
  sublabel: string
  icon: React.ElementType
  accentColor: string
  href: string
}) {
  const router = useRouter()

  return (
    <div
      className="relative cursor-pointer overflow-hidden rounded-xl border border-slate-200 bg-white p-4 transition-all duration-200 hover:shadow-[0_2px_10px_rgba(31,169,122,0.06)] group"
      onClick={() => router.push(href)}
    >
      <div className="mb-3 flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          <div className={cn("h-1.5 w-1.5 rounded-full", dot)} />
          <span className="text-[9px] font-semibold uppercase tracking-[0.1em] text-slate-400">
            {label}
          </span>
        </div>
        <div className="flex h-6 w-6 items-center justify-center rounded-lg bg-slate-50 transition-colors group-hover:bg-[#E1F5EE]">
          <Icon className="h-3 w-3 text-slate-400 transition-colors group-hover:text-[#1FA97A]" />
        </div>
      </div>

      <div className={cn("mb-1.5 text-[30px] font-bold leading-none tracking-tight", valueColor)}>
        {value}
      </div>

      <p className="text-[10px] text-slate-400">{sublabel}</p>

      <div className={cn("absolute bottom-0 left-0 right-0 h-[2px] opacity-0 transition-opacity group-hover:opacity-100", accentColor)} />
    </div>
  )
}

export function DashboardKPIs({ invoicedThisMonth, invoicedPrevMonth, pendingCobro, pendingCobroCount }: Props) {
  const pct = invoicedPrevMonth > 0
    ? Math.round(((invoicedThisMonth - invoicedPrevMonth) / invoicedPrevMonth) * 100)
    : 0
  const sign = pct >= 0 ? "+" : ""

  return (
    <>
      <KPICard
        dot="bg-[#1FA97A]"
        label="Facturado este mes"
        value={currencyFmt.format(invoicedThisMonth)}
        valueColor="text-[#1FA97A]"
        sublabel={invoicedPrevMonth > 0 ? `${sign}${pct}% vs mes anterior` : "Sin datos del mes anterior"}
        icon={TrendingUp}
        accentColor="bg-[#1FA97A]"
        href="/dashboard/finance"
      />
      <KPICard
        dot="bg-amber-400"
        label="Pendiente cobro"
        value={currencyFmt.format(pendingCobro)}
        valueColor={pendingCobro > 0 ? "text-[#D9A441]" : "text-slate-400"}
        sublabel={`${pendingCobroCount} factura${pendingCobroCount !== 1 ? "s" : ""} enviada${pendingCobroCount !== 1 ? "s" : ""}`}
        icon={Clock}
        accentColor="bg-amber-400"
        href="/dashboard/finance"
      />
    </>
  )
}

export function DashboardKPIsSkeleton() {
  return (
    <>
      {[1, 2].map((i) => (
        <div key={i} className="rounded-xl border border-slate-200 bg-white p-4">
          <div className="mb-3 flex items-center justify-between">
            <div className="h-2.5 w-28 animate-pulse rounded bg-slate-100" />
            <div className="h-6 w-6 animate-pulse rounded-lg bg-slate-100" />
          </div>
          <div className="mb-1.5 h-9 w-24 animate-pulse rounded bg-slate-100" />
          <div className="h-2.5 w-32 animate-pulse rounded bg-slate-100" />
        </div>
      ))}
    </>
  )
}
