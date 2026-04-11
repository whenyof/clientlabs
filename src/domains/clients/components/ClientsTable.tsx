"use client"

import { useState, useEffect, useCallback, memo } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import type { Client } from "@prisma/client"
import { useSectorConfig } from "@/hooks/useSectorConfig"
import { Checkbox } from "@/components/ui/checkbox"
import { AlertTriangle, Star } from "lucide-react"
import { formatDistanceToNow } from "date-fns"
import { es } from "date-fns/locale"
import { ClientRowActions } from "@/modules/clients/components/ClientRowActions"
import {
  calculateClientScore,
  mapClientToScoreInput,
} from "../scoring/client-score"
import { StatusBadgeSelector, type ClientStatus } from "@/components/StatusBadgeSelector"

export type ClientWithLead = Client & {
  convertedFromLead?: { id: string; name: string | null; convertedAt: Date | null } | null
  isForgotten?: boolean
  daysSinceActivity?: number
  riskLevel?: string | null
  clientTraits?: string[]
}

interface ClientsTableProps {
  clients: ClientWithLead[]
  onClientUpdate?: (clientId: string, data: Partial<ClientWithLead>) => void
}

function getInitial(name: string | null, email: string | null): string {
  if (name?.trim()) return name.charAt(0).toUpperCase()
  if (email?.trim()) return email.charAt(0).toUpperCase()
  return "?"
}

/** Strong revenue display: €20K, €1.5M */
function formatRevenueStrong(value: number, currency: string = "EUR"): string {
  const sym = currency === "EUR" ? "€" : currency
  if (value >= 1_000_000) return `${sym}${(value / 1_000_000).toFixed(1).replace(/\.0$/, "")}M`
  if (value >= 1_000) return `${sym}${Math.round(value / 1_000)}K`
  return new Intl.NumberFormat("es-ES", { style: "currency", currency: currency || "EUR", maximumFractionDigits: 0 }).format(value)
}

type BackendStatus = "ACTIVE" | "FOLLOW_UP" | "INACTIVE" | "VIP"

function normalizeStatus(status: unknown): BackendStatus {
  const valid: BackendStatus[] = ["ACTIVE", "FOLLOW_UP", "INACTIVE", "VIP"]
  return valid.includes(String(status) as BackendStatus) ? (status as BackendStatus) : "INACTIVE"
}

function backendToClientStatus(backend: BackendStatus): ClientStatus {
  if (backend === "ACTIVE" || backend === "VIP") return "active"
  if (backend === "INACTIVE") return "inactive"
  return "risk"
}

function ClientsTableComponent({ clients }: ClientsTableProps) {
  const router = useRouter()
  const { labels } = useSectorConfig()
  const [selectedClients, setSelectedClients] = useState<string[]>([])
  const [isMounted, setIsMounted] = useState(false)
  useEffect(() => setIsMounted(true), [])

  const handleSelectAll = (checked: boolean) => {
    setSelectedClients(checked ? clients.map((c) => c.id) : [])
  }

  const handleToggleSelection = useCallback((clientId: string, checked: boolean) => {
    setSelectedClients((prev) => (checked ? [...prev, clientId] : prev.filter((id) => id !== clientId)))
  }, [])


  if (clients.length === 0) {
    return (
      <div className="rounded-xl border border-neutral-200 bg-white p-12 text-center shadow-sm">
        <p className="text-neutral-600">
          No se encontraron clientes
        </p>
        <p className="mt-1 text-sm text-neutral-500">
          Los clientes aparecerán aquí cuando se registren en tu negocio.
        </p>
      </div>
    )
  }

  return (
    <div className="rounded-xl border border-neutral-200 bg-white shadow-sm overflow-visible">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-neutral-200 bg-neutral-50/80">
              <th className="w-10 px-4 py-3">
                <Checkbox
                  checked={selectedClients.length > 0 && selectedClients.length === clients.length}
                  onCheckedChange={handleSelectAll}
                  className="border-neutral-300"
                />
              </th>
              <th className="px-4 py-3 text-left text-sm font-medium text-neutral-600 min-w-[220px]">Cliente</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-neutral-600">Ingresos</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-neutral-600">Estado</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-neutral-600">Última actividad</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-neutral-600">Puntuación</th>
              <th className="px-4 py-3 text-right text-sm font-medium text-neutral-600">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {clients.map((client) => {
              const lastActivity = new Date(client.updatedAt || client.createdAt)
              const isForgotten = client.isForgotten
              const daysSince = client.daysSinceActivity ?? Math.floor((Date.now() - lastActivity.getTime()) / (1000 * 60 * 60 * 24))
              return (
                <tr
                  key={client.id}
                  className="group border-b border-neutral-100 transition-colors hover:bg-neutral-50 cursor-pointer"
                  onClick={() => router.push(`/dashboard/clients/${client.id}`)}
                >
                  <td className="px-4 py-4" onClick={(e) => e.stopPropagation()}>
                    <Checkbox
                      checked={selectedClients.includes(client.id)}
                      onCheckedChange={(c) => handleToggleSelection(client.id, c as boolean)}
                      className="border-neutral-300"
                    />
                  </td>
                  <td className="px-4 py-4">
                    <div className="flex items-center gap-3 min-w-0">
                      <div
                        className="h-9 w-9 shrink-0 rounded-full bg-neutral-200 flex items-center justify-center text-sm font-medium text-neutral-700"
                        aria-hidden
                      >
                        {getInitial(client.name, client.email)}
                      </div>
                      <div className="flex flex-col min-w-0 leading-tight">
                        <Link
                          href={`/dashboard/clients/${client.id}`}
                          onClick={(e) => e.stopPropagation()}
                          className="font-medium text-neutral-900 hover:underline cursor-pointer truncate"
                        >
                          <span className="flex items-center gap-1.5">
                            {client.name || labels.common.noResults}
                            {client.status === "VIP" && (
                              <Star className="h-3 w-3 fill-amber-400 text-amber-400 shrink-0" aria-label="VIP" />
                            )}
                          </span>
                        </Link>
                        <span className="text-sm text-neutral-500 truncate">{client.email || "—"}</span>
                        {client.companyName && (
                          <span className="text-xs text-neutral-400 truncate mt-0.5">{client.companyName}</span>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-4 tabular-nums">
                    {isMounted ? (
                      <div className="flex flex-col">
                        <span className="font-semibold text-neutral-900">
                          {formatRevenueStrong(client.totalSpent ?? 0, client.currency ?? "EUR")}
                        </span>
                        {typeof (client as ClientWithLead & { revenueTrendPercent?: number }).revenueTrendPercent === "number" && (
                          <span className="text-xs text-neutral-500">
                            {(client as ClientWithLead & { revenueTrendPercent: number }).revenueTrendPercent >= 0 ? "+" : ""}
                            {(client as ClientWithLead & { revenueTrendPercent: number }).revenueTrendPercent}% este mes
                          </span>
                        )}
                      </div>
                    ) : "—"}
                  </td>
                  <td className="px-4 py-4">
                    <StatusBadgeSelector
                      currentStatus={backendToClientStatus(normalizeStatus(client.status))}
                    />
                  </td>
                  <td className="px-4 py-4">
                    <div className="flex flex-col gap-1">
                      <div className="flex items-center gap-2 text-sm text-neutral-500">
                        <span
                          className={`h-2 w-2 shrink-0 rounded-full ${
                            daysSince < 7 ? "bg-emerald-500" : "bg-neutral-400"
                          }`}
                          aria-hidden
                        />
                        {isMounted ? formatDistanceToNow(lastActivity, { addSuffix: true, locale: es }) : ""}
                      </div>
                      {isForgotten && (
                        <span className="inline-flex items-center gap-1.5 rounded-md border border-amber-200 bg-amber-50 px-2 py-0.5 text-xs text-amber-800">
                          <AlertTriangle className="h-3 w-3" />
                          {daysSince} días sin actividad
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-4">
                    {(() => {
                      const score = calculateClientScore(mapClientToScoreInput(client))
                      const scoreClass =
                        score >= 80
                          ? "bg-emerald-100 text-emerald-700"
                          : score >= 50
                          ? "bg-amber-100 text-amber-700"
                          : "bg-red-100 text-red-700"
                      return (
                        <span
                          className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium ${scoreClass}`}
                          title={`Score: ${score}`}
                        >
                          <span
                            className={`h-2 w-2 shrink-0 rounded-full ${
                              score >= 80 ? "bg-emerald-500" : score >= 50 ? "bg-amber-500" : "bg-red-500"
                            }`}
                            aria-hidden
                          />
                          {score}
                        </span>
                      )
                    })()}
                  </td>
                  <td className="px-4 py-4 text-right" onClick={(e) => e.stopPropagation()}>
                    <div className="flex items-center justify-end gap-3 text-neutral-400">
                      <ClientRowActions client={client} />
                    </div>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
      <div className="border-t border-neutral-200 bg-neutral-50/50 px-4 py-3 text-center text-sm text-neutral-500">
        Mostrando {clients.length}{" "}
        {clients.length !== 1 ? labels.clients.plural.toLowerCase() : labels.clients.singular.toLowerCase()}
        {selectedClients.length > 0 && (
          <span className="ml-2 text-neutral-700">
            · {selectedClients.length} seleccionado{selectedClients.length !== 1 ? "s" : ""}
          </span>
        )}
      </div>
    </div>
  )
}

export const ClientsTable = memo(ClientsTableComponent)
