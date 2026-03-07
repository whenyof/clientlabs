"use client"

import { formatSaleCurrency } from "../utils"

type Mode = "sales" | "purchases"

type Props = {
  mode?: Mode
  active?: boolean
  payload?: ReadonlyArray<{ name?: string; value?: number; dataKey?: string }>
  label?: string | number | undefined
  labelFormatter?: (label: string) => string
}

export function SalesMegaTooltip({ mode = "sales", active, payload, label, labelFormatter }: Props) {
  if (!active || !payload?.length || label == null) return null

  const isPurchases = mode === "purchases"
  const displayLabel = labelFormatter ? labelFormatter(String(label)) : String(label)
  const revenue = Number(payload.find((p) => p.dataKey === "revenue")?.value ?? 0)
  const salesCount = Number(payload.find((p) => p.dataKey === "salesCount")?.value ?? 0)
  const avgTicket = Number(payload.find((p) => p.dataKey === "avgTicket")?.value ?? 0)
  const forecastBase = payload.find((p) => p.dataKey === "forecastBase")?.value as number | undefined

  return (
    <div className="rounded-lg border border-white/15 bg-zinc-900/95 px-4 py-3 shadow-xl backdrop-blur">
      <p className="text-base font-semibold text-white mb-3">{displayLabel}</p>
      <dl className="space-y-1.5 text-sm">
        <div className="flex justify-between gap-4">
          <span className="text-white/55">{isPurchases ? "Gastos" : "Revenue"}</span>
          <span className="font-medium text-white tabular-nums">{formatSaleCurrency(revenue)}</span>
        </div>
        <div className="flex justify-between gap-4">
          <span className="text-white/55">{isPurchases ? "Órdenes" : "Sales"}</span>
          <span className="font-medium text-white tabular-nums">{salesCount}</span>
        </div>
        <div className="flex justify-between gap-4">
          <span className="text-white/55">{isPurchases ? "Coste medio" : "Avg ticket"}</span>
          <span className="font-medium text-white tabular-nums">{formatSaleCurrency(avgTicket)}</span>
        </div>
        {forecastBase != null && forecastBase > 0 && (
          <div className="flex justify-between gap-4 pt-1 border-t border-white/10">
            <span className="text-white/55">Forecast</span>
            <span className="font-medium text-violet-300 tabular-nums">{formatSaleCurrency(forecastBase)}</span>
          </div>
        )}
      </dl>
    </div>
  )
}
