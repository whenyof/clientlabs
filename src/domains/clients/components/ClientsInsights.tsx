"use client"

import { useMemo } from "react"
import { TrendingUp, UserX, AlertTriangle } from "lucide-react"
import { formatCurrency } from "@/lib/utils"
import { calculateClientScore, mapClientToScoreInput } from "../scoring/client-score"

interface ClientSummary {
  id: string
  name: string | null
  totalSpent: number | null
  updatedAt: Date
  createdAt: Date
  status: string
  isForgotten?: boolean
  Sale?: { id: string }[]
}

function formatLastActivity(updatedAt: Date, createdAt: Date): string {
  const last = new Date(updatedAt || createdAt)
  const now = Date.now()
  const days = Math.floor((now - last.getTime()) / (1000 * 60 * 60 * 24))
  if (days === 0) return "Hoy"
  if (days === 1) return "Ayer"
  if (days < 30) return `Hace ${days} días`
  return last.toLocaleDateString("es-ES", { day: "numeric", month: "short" })
}

interface ClientsInsightsProps {
  clients: ClientSummary[]
}

const PLACEHOLDER = "Sin datos aún"

export function ClientsInsights({ clients }: ClientsInsightsProps) {
  const { topByRevenue, inactive, atRisk } = useMemo(() => {
    const withScore = clients.map((c) => ({
      ...c,
      _score: calculateClientScore(mapClientToScoreInput(c)),
    }))
    const topByScore = withScore
      .filter((c) => c._score >= 80)
      .sort((a, b) => (b.totalSpent ?? 0) - (a.totalSpent ?? 0))
    const top = topByScore.length > 0 ? topByScore.slice(0, 5) : withScore
      .filter((c) => (c.totalSpent ?? 0) > 0)
      .sort((a, b) => (b.totalSpent ?? 0) - (a.totalSpent ?? 0))
      .slice(0, 5)
    const now = Date.now()
    const inactiveList = clients.filter((c) => {
      const last = new Date(c.updatedAt || c.createdAt).getTime()
      const days = (now - last) / (1000 * 60 * 60 * 24)
      return days > 30 || c.status === "INACTIVE"
    })
    const riskByScore = withScore.filter((c) => c._score < 40)
    const riskLegacy = clients.filter((c) => c.isForgotten || (c.status === "FOLLOW_UP"))
    const riskIds = new Set([...riskByScore.map((c) => c.id), ...riskLegacy.map((c) => c.id)])
    const atRisk = withScore.filter((c) => riskIds.has(c.id)).slice(0, 5)
    return { topByRevenue: top, inactive: inactiveList, atRisk }
  }, [clients])

  return (
    <div className="flex flex-col space-y-6">
      <div className="rounded-xl border border-neutral-200 bg-white p-6 shadow-sm">
        <h3 className="mb-3 flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-neutral-500">
          <TrendingUp className="h-3.5 w-3.5" />
          Top clientes por ingresos
        </h3>
        <ul className="space-y-2 text-sm">
          {topByRevenue.length === 0 ? (
            <li className="italic text-gray-500">{PLACEHOLDER}</li>
          ) : (
            topByRevenue.map((c, index) => (
              <li key={c.id} className="flex items-center justify-between gap-2">
                <span className="truncate text-neutral-700">{index + 1}. {c.name || "—"}</span>
                <span className="shrink-0 font-medium text-neutral-900">
                  {formatCurrency(c.totalSpent ?? 0)}
                </span>
              </li>
            ))
          )}
        </ul>
      </div>

      <div className="rounded-xl border border-neutral-200 bg-white p-6 shadow-sm">
        <h3 className="mb-3 flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-neutral-500">
          <UserX className="h-3.5 w-3.5" />
          Clientes inactivos
        </h3>
        <ul className="space-y-2 text-sm">
          {inactive.length === 0 ? (
            <li className="italic text-gray-500">{PLACEHOLDER}</li>
          ) : (
            inactive.slice(0, 5).map((c) => (
              <li key={c.id} className="flex flex-col gap-0.5">
                <span className="truncate font-medium text-neutral-900">{c.name || "—"}</span>
                <span className="text-xs text-neutral-500">
                  {formatLastActivity(c.updatedAt, c.createdAt)}
                </span>
              </li>
            ))
          )}
        </ul>
      </div>

      <div className="rounded-xl border border-neutral-200 bg-white p-6 shadow-sm">
        <h3 className="mb-3 flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-neutral-500">
          <AlertTriangle className="h-3.5 w-3.5" />
          Clientes en riesgo
        </h3>
        <ul className="space-y-2 text-sm">
          {atRisk.length === 0 ? (
            <li className="italic text-gray-500">{PLACEHOLDER}</li>
          ) : (
            atRisk.slice(0, 5).map((c) => (
              <li key={c.id} className="flex flex-col gap-0.5">
                <span className="truncate font-medium text-neutral-900">{c.name || "—"}</span>
                <span className="text-xs text-neutral-500">
                  {c.isForgotten ? "Sin actividad reciente" : "En seguimiento"}
                </span>
              </li>
            ))
          )}
        </ul>
      </div>
    </div>
  )
}
