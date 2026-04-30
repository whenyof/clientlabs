"use client"

import { useRouter } from "next/navigation"
import { ArrowUpRight, ArrowDownRight, ExternalLink } from "lucide-react"

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

export function DashboardKPIs({
  invoicedThisMonth,
  invoicedPrevMonth,
  pendingCobro,
  pendingCobroCount,
}: Props) {
  const router = useRouter()
  const beneficio = Math.max(0, invoicedThisMonth - pendingCobro)
  const vsAnterior =
    invoicedPrevMonth > 0
      ? Math.round(((invoicedThisMonth - invoicedPrevMonth) / invoicedPrevMonth) * 100)
      : 0
  const isUp = vsAnterior >= 0

  const ref = Math.max(invoicedThisMonth, 1)
  const pendingPct = Math.min(100, Math.round((pendingCobro / ref) * 100))
  const beneficioPct = Math.min(100, Math.round((beneficio / ref) * 100))

  const hasData = invoicedThisMonth > 0

  const rows: Array<{
    label: string
    subtitle: string
    subtitleColor: string
    value: number
    color: string
    trackColor: string
    barPct: number
  }> = [
    {
      label: "Facturado",
      subtitle: "Total emitido este mes",
      subtitleColor: "#94A3B8",
      value: invoicedThisMonth,
      color: "#1FA97A",
      trackColor: "#E8F8F2",
      barPct: hasData ? 100 : 0,
    },
    {
      label: "Pendiente cobro",
      subtitle: hasData ? `${pendingPct}% aún por cobrar` : "Sin facturas pendientes",
      subtitleColor: pendingPct > 60 ? "#D97706" : "#94A3B8",
      value: pendingCobro,
      color: pendingPct > 60 ? "#D97706" : "#F59E0B",
      trackColor: "#FEF3C7",
      barPct: hasData ? pendingPct : 0,
    },
    {
      label: "Beneficio neto",
      subtitle: hasData ? `${beneficioPct}% ya cobrado` : "Sin datos este mes",
      subtitleColor: beneficioPct > 40 ? "#1FA97A" : "#94A3B8",
      value: beneficio,
      color: "#2563EB",
      trackColor: "#DBEAFE",
      barPct: hasData ? beneficioPct : 0,
    },
  ]

  return (
    <div
      className="group flex h-full cursor-pointer flex-col justify-between rounded-xl border border-slate-200 bg-white p-4 transition-all duration-200 hover:border-[#1FA97A]/20 hover:shadow-[0_2px_16px_rgba(31,169,122,0.08)]"
      onClick={() => router.push("/dashboard/finance")}
    >
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <p className="text-[9px] font-semibold uppercase tracking-[0.12em] text-slate-400">
            Resumen financiero · {new Date().toLocaleString("es-ES", { month: "long" })}
          </p>
          <div className="mt-1.5 flex items-baseline gap-2 flex-wrap">
            <span className="text-[22px] sm:text-[30px] font-bold leading-none tracking-tight text-[#1FA97A]">
              {currencyFmt.format(invoicedThisMonth)}
            </span>
            {invoicedPrevMonth > 0 && (
              <div
                className={`flex items-center gap-0.5 rounded-md px-1.5 py-0.5 text-[10px] font-semibold ${
                  isUp
                    ? "bg-[#ECFDF5] text-[#1FA97A]"
                    : "bg-red-50 text-red-500"
                }`}
              >
                {isUp ? <ArrowUpRight className="h-3 w-3" /> : <ArrowDownRight className="h-3 w-3" />}
                {isUp ? "+" : ""}{vsAnterior}% vs anterior
              </div>
            )}
          </div>
        </div>
        <div className="flex items-center gap-1 rounded-md border border-slate-100 px-2 py-1 text-[9px] font-medium text-slate-400 transition-colors group-hover:border-[#1FA97A]/30 group-hover:text-[#1FA97A]">
          <ExternalLink className="h-2.5 w-2.5" />
          Finanzas
        </div>
      </div>

      {/* Bars */}
      <div className="mt-5 space-y-4">
        {rows.map((row) => (
          <div key={row.label}>
            <div className="mb-1.5 flex items-baseline justify-between">
              <div className="flex items-baseline gap-2">
                <span className="text-[11px] font-medium text-slate-700">{row.label}</span>
                <span className="text-[9px]" style={{ color: row.subtitleColor }}>
                  {row.subtitle}
                </span>
              </div>
              <span className="text-[12px] font-bold tabular-nums" style={{ color: row.color }}>
                {currencyFmt.format(row.value)}
              </span>
            </div>
            <div
              className="relative h-[8px] overflow-hidden rounded-full"
              style={{ backgroundColor: row.trackColor }}
            >
              <div
                className="absolute left-0 top-0 h-full rounded-full transition-all duration-700"
                style={{ width: `${row.barPct}%`, backgroundColor: row.color }}
              />
            </div>
          </div>
        ))}
      </div>

      {/* Footer */}
      <div className="mt-4 flex items-center justify-between border-t border-slate-100 pt-3">
        <span className="text-[9px] text-slate-400">
          {pendingCobroCount > 0
            ? `${pendingCobroCount} factura${pendingCobroCount !== 1 ? "s" : ""} pendiente${pendingCobroCount !== 1 ? "s" : ""} de cobro`
            : "Sin facturas pendientes"}
        </span>
        <span className="text-[9px] font-medium text-[#1FA97A]">Ver finanzas →</span>
      </div>
    </div>
  )
}

export function DashboardKPIsSkeleton() {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4">
      <div className="mb-5 flex items-start justify-between">
        <div className="space-y-2">
          <div className="h-2 w-32 animate-pulse rounded bg-slate-100" />
          <div className="h-8 w-36 animate-pulse rounded bg-slate-100" />
        </div>
        <div className="h-6 w-16 animate-pulse rounded bg-slate-100" />
      </div>
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <div key={i}>
            <div className="mb-1.5 flex justify-between">
              <div className="h-2.5 w-24 animate-pulse rounded bg-slate-100" />
              <div className="h-2.5 w-16 animate-pulse rounded bg-slate-100" />
            </div>
            <div className="h-2 w-full animate-pulse rounded-full bg-slate-100" />
          </div>
        ))}
      </div>
    </div>
  )
}
