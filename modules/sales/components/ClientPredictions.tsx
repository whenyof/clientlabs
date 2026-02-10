"use client"

import { Crown, Heart, TrendingUp, AlertTriangle, UserX } from "lucide-react"
import { cn } from "@/lib/utils"
import type { ClientPredictionsResult, ClientSegment } from "../services/clientPredictions"

type Props = {
  data: ClientPredictionsResult | null
}

const SEGMENT_CONFIG: Record<
  ClientSegment,
  { label: string; icon: typeof Crown; className: string }
> = {
  VIP: {
    label: "VIP",
    icon: Crown,
    className: "border-violet-500/30 bg-violet-500/10 text-violet-400",
  },
  LOYAL: {
    label: "Leales",
    icon: Heart,
    className: "border-emerald-500/30 bg-emerald-500/10 text-emerald-400",
  },
  OPPORTUNITY: {
    label: "Oportunidad",
    icon: TrendingUp,
    className: "border-amber-500/30 bg-amber-500/10 text-amber-400",
  },
  RISK: {
    label: "En riesgo",
    icon: AlertTriangle,
    className: "border-amber-500/30 bg-amber-500/10 text-amber-400",
  },
  LOST: {
    label: "Perdidos",
    icon: UserX,
    className: "border-rose-500/30 bg-rose-500/10 text-rose-400",
  },
}

function formatDate(iso: string): string {
  try {
    const d = new Date(iso)
    return d.toLocaleDateString("es-ES", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    })
  } catch {
    return "—"
  }
}

function formatCurrency(value: number): string {
  return new Intl.NumberFormat("es-ES", {
    style: "currency",
    currency: "EUR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value)
}

export function ClientPredictions({ data }: Props) {
  if (!data) return null

  const { segments, clients } = data
  const cards: { key: ClientSegment; count: number }[] = [
    { key: "VIP", count: segments.VIP },
    { key: "LOYAL", count: segments.LOYAL },
    { key: "OPPORTUNITY", count: segments.OPPORTUNITY },
    { key: "RISK", count: segments.RISK },
    { key: "LOST", count: segments.LOST },
  ]

  return (
    <div className="rounded-xl border border-white/10 bg-white/5 backdrop-blur overflow-hidden">
      <div className="px-4 py-3 border-b border-white/10">
        <h3 className="text-sm font-medium text-white/80">
          Predicción por cliente
        </h3>
      </div>
      <div className="p-4 space-y-4">
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
          {cards.map(({ key, count }) => {
            const config = SEGMENT_CONFIG[key as ClientSegment]
            const Icon = config.icon
            return (
              <div
                key={key}
                className={cn(
                  "rounded-lg border px-3 py-2.5 flex items-center gap-2",
                  config.className
                )}
              >
                <Icon className="h-4 w-4 shrink-0" />
                <div className="min-w-0">
                  <p className="text-xs font-medium opacity-90">{config.label}</p>
                  <p className="text-lg font-semibold tabular-nums">{count}</p>
                </div>
              </div>
            )
          })}
        </div>

        {clients.length === 0 ? (
          <p className="text-sm text-white/60 py-4">
            No hay clientes con ventas asociadas en el periodo.
          </p>
        ) : (
          <div className="overflow-x-auto rounded-lg border border-white/10">
            <table className="w-full">
              <thead>
                <tr className="border-b border-white/10 bg-zinc-900/80">
                  <th className="text-left text-[11px] font-medium text-white/50 uppercase tracking-wider py-2.5 px-3">
                    Cliente
                  </th>
                  <th className="text-left text-[11px] font-medium text-white/50 uppercase tracking-wider py-2.5 px-3 hidden sm:table-cell">
                    Email
                  </th>
                  <th className="text-left text-[11px] font-medium text-white/50 uppercase tracking-wider py-2.5 px-3">
                    Última compra
                  </th>
                  <th className="text-right text-[11px] font-medium text-white/50 uppercase tracking-wider py-2.5 px-3">
                    Total
                  </th>
                  <th className="text-right text-[11px] font-medium text-white/50 uppercase tracking-wider py-2.5 px-3">
                    Compras
                  </th>
                  <th className="text-left text-[11px] font-medium text-white/50 uppercase tracking-wider py-2.5 px-3">
                    Segmento
                  </th>
                </tr>
              </thead>
              <tbody>
                {clients.map((c) => {
                  const segConfig = SEGMENT_CONFIG[c.segment]
                  return (
                    <tr
                      key={c.clientId}
                      className="border-b border-white/5 hover:bg-white/5"
                    >
                      <td className="py-2.5 px-3 text-sm text-white/90">
                        {c.name}
                      </td>
                      <td className="py-2.5 px-3 text-sm text-white/60 hidden sm:table-cell truncate max-w-[180px]">
                        {c.email ?? "—"}
                      </td>
                      <td className="py-2.5 px-3 text-sm text-white/70 tabular-nums">
                        {formatDate(c.lastPurchase)}
                      </td>
                      <td className="py-2.5 px-3 text-sm text-white/90 text-right tabular-nums">
                        {formatCurrency(c.totalSpent)}
                      </td>
                      <td className="py-2.5 px-3 text-sm text-white/70 text-right tabular-nums">
                        {c.purchases}
                      </td>
                      <td className="py-2.5 px-3">
                        <span
                          className={cn(
                            "inline-flex items-center gap-1 rounded-md border px-2 py-0.5 text-xs font-medium",
                            segConfig.className
                          )}
                        >
                          {segConfig.label}
                        </span>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
