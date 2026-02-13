"use client"

import { useSectorConfig } from "@/hooks/useSectorConfig"

import { useState, useMemo, useEffect, useCallback, memo } from "react"
import type { Client } from "@prisma/client"
import { ClientRowActions } from "./ClientRowActions"
import { StatusBadgeSelector } from "./StatusBadgeSelector"
import { Checkbox } from "@/components/ui/checkbox"
import { Badge } from "@/components/ui/badge"
import { Mail, Phone, AlertTriangle, ArrowUp, ArrowDown } from "lucide-react"
import { formatDistanceToNow } from "date-fns"
import { es } from "date-fns/locale"
import { toast } from "sonner"
import { updateClientStatus } from "../actions"
import { formatCurrency } from "@/lib/utils"
import { ClientRow } from "./ClientRow"

type ClientWithLead = Client & {
  convertedFromLead: {
    id: string
    name: string | null
    convertedAt: Date | null
  } | null
  isForgotten?: boolean
  daysSinceActivity?: number
  riskLevel?: string | null
  clientTraits?: string[]
}

type ClientsTableProps = {
  clients: ClientWithLead[]
  onClientUpdate?: (clientId: string, data: Partial<ClientWithLead>) => void
  onClientClick?: (client: ClientWithLead) => void
}

function ClientsTableComponent({ clients, onClientUpdate, onClientClick }: ClientsTableProps) {
  const { labels } = useSectorConfig()
  const [selectedClients, setSelectedClients] = useState<string[]>([])
  const [isMounted, setIsMounted] = useState(false)

  useEffect(() => {
    setIsMounted(true)
  }, [])


  // Sorting State
  const [sort, setSort] = useState<{ key: string; dir: "asc" | "desc" }>({
    key: "updatedAt", // Default sort
    dir: "desc",
  })

  // Normalize status to prevent crashes with legacy/invalid data
  const normalizeStatus = (status: any): "ACTIVE" | "FOLLOW_UP" | "INACTIVE" | "VIP" => {
    const validStatuses = ["ACTIVE", "FOLLOW_UP", "INACTIVE", "VIP"]
    return validStatuses.includes(status) ? status : "INACTIVE"
  }

  const handleStatusChange = async (clientId: string, newStatus: "ACTIVE" | "FOLLOW_UP" | "INACTIVE" | "VIP") => {
    // Optimistic update via parent
    if (onClientUpdate) {
      onClientUpdate(clientId, { status: newStatus, updatedAt: new Date() })
    }

    try {
      await updateClientStatus(clientId, newStatus)
      toast.success("Estado actualizado correctamente")
    } catch (error) {
      toast.error("Error al actualizar estado")
      // Revert is complex without keeping previous state history, 
      // but usually server revalidation fixes it or we could undo here if we tracked it.
      // For now, reliance on parent state is enough.
    }
  }

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedClients(clients.map((c) => c.id))
    } else {
      setSelectedClients([])
    }
  }

  const handleSelectClient = (clientId: string, checked: boolean) => {
    if (checked) {
      setSelectedClients([...selectedClients, clientId])
    } else {
      setSelectedClients(selectedClients.filter((id) => id !== clientId))
    }
  }

  const handleClientClick = (client: ClientWithLead) => {
    if (onClientClick) {
      onClientClick(client)
    }
  }

  const handleSort = (key: string) => {
    setSort((prev) => ({
      key,
      dir: prev.key === key && prev.dir === "desc" ? "asc" : "desc",
    }))
  }

  // Sorted Clients
  const sortedClients = useMemo(() => {
    return [...clients].sort((a, b) => {
      let aValue: any = a[sort.key as keyof ClientWithLead]
      let bValue: any = b[sort.key as keyof ClientWithLead]

      // Handle specific keys
      if (sort.key === "value") {
        aValue = a.totalSpent || 0
        bValue = b.totalSpent || 0
      } else if (sort.key === "lastActivity") {
        aValue = new Date(a.updatedAt || a.createdAt).getTime()
        bValue = new Date(b.updatedAt || b.createdAt).getTime()
      } else if (sort.key === "status") {
        aValue = normalizeStatus(a.status)
        bValue = normalizeStatus(b.status)
      } else if (sort.key === "tags") {
        // rudimentary sort by tag count or first tag? let's do vip check
        aValue = (a.totalSpent || 0) > 10000 ? 1 : 0
        bValue = (b.totalSpent || 0) > 10000 ? 1 : 0
      }

      if (aValue === bValue) return 0

      const comparison = aValue > bValue ? 1 : -1
      return sort.dir === "asc" ? comparison : -comparison
    })
  }, [clients, sort])

  // Render Sort Icon
  const SortIcon = ({ columnKey }: { columnKey: string }) => {
    const isActive = sort.key === columnKey
    const isAsc = sort.dir === "asc"

    return (
      <ArrowUp
        className={`h-3 w-3 inline ml-1 transition-all duration-200 ${isActive
          ? "opacity-100 text-emerald-400 transform-none"
          : "opacity-0 group-hover:opacity-30 -translate-y-1 group-hover:translate-y-0"
          } ${isActive && !isAsc ? "rotate-180" : "rotate-0"
          }`}
      />
    )
  }

  // Header Component
  const SortableHeader = ({ label, columnKey, className = "" }: { label: string, columnKey: string, className?: string }) => (
    <th
      className={`text-left p-4 text-sm font-medium text-white/80 cursor-pointer hover:text-white transition-colors select-none group ${className}`}
      onClick={() => handleSort(columnKey)}
    >
      <div className="flex items-center gap-1">
        {label}
        <SortIcon columnKey={columnKey} />
      </div>
    </th>
  )

  const handleToggleSelection = useCallback((clientId: string, checked: boolean) => {
    setSelectedClients(prev =>
      checked ? [...prev, clientId] : prev.filter(id => id !== clientId)
    )
  }, [])

  // Stable handlers for Row
  // We can't easily make handleStatusChange stable if it depends on onClientUpdate which might change?
  // Usually onClientUpdate is stable from parent.
  // We will assume it is or wrap it.

  if (clients.length === 0) {
    return (
      <div className="rounded-xl border border-white/10 bg-white/5 p-12 text-center backdrop-blur">
        <p className="text-white/60">{labels.common.noResults} {labels.clients.plural.toLowerCase()}</p>
        <p className="text-white/40 text-sm mt-1">
          {labels.clients.plural} se crean automáticamente al convertir {labels.leads.plural.toLowerCase()}
        </p>
      </div>
    )
  }

  return (
    <>
      <div className="rounded-xl border border-white/10 bg-white/5 backdrop-blur overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-white/10">
                <th className="text-left p-4 w-12">
                  <Checkbox
                    checked={selectedClients.length > 0 && selectedClients.length === clients.length}
                    onCheckedChange={handleSelectAll}
                    className="border-white/20"
                  />
                </th>
                <SortableHeader label={labels.clients.singular} columnKey="name" />
                <SortableHeader label="Estado" columnKey="status" />
                <SortableHeader label="Última Actividad" columnKey="lastActivity" />
                <SortableHeader label="Valor" columnKey="value" />
                <th className="text-right p-4 text-sm font-medium text-white/80">{labels.common.actions}</th>
              </tr>
            </thead>
            <tbody>
              {sortedClients.map((client) => (
                <ClientRow
                  key={client.id}
                  client={client}
                  isSelected={selectedClients.includes(client.id)}
                  onSelect={handleToggleSelection}
                  onClick={onClientClick}
                  onStatusChange={handleStatusChange}
                  isMounted={isMounted}
                  normalizeStatus={normalizeStatus}
                />
              ))}
            </tbody>
          </table>
        </div>
      </div>


      {/* Results count */}
      <div className="text-sm text-white/60 text-center mt-4">
        Mostrando {clients.length} {clients.length !== 1 ? labels.clients.plural.toLowerCase() : labels.clients.singular.toLowerCase()}
        {selectedClients.length > 0 && (
          <span className="ml-2 text-blue-400">
            · {selectedClients.length} seleccionado{selectedClients.length !== 1 ? "s" : ""}
          </span>
        )}
      </div>

    </>
  )
}

export const ClientsTable = memo(ClientsTableComponent)
