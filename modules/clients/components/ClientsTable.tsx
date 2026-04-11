"use client"

import { useSectorConfig } from "@/hooks/useSectorConfig"

import { useState, useEffect, useCallback, memo } from "react"
import type { Client } from "@prisma/client"
import { ClientRowActions } from "./ClientRowActions"
import { Checkbox } from "@/components/ui/checkbox"
import { Badge } from "@/components/ui/badge"
import { Mail, Phone, AlertTriangle } from "lucide-react"
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
                <th className="text-left p-4 text-sm font-medium text-white/80">{labels.clients.singular}</th>
                <th className="text-left p-4 text-sm font-medium text-white/80">Estado</th>
                <th className="text-left p-4 text-sm font-medium text-white/80">Última Actividad</th>
                <th className="text-left p-4 text-sm font-medium text-white/80">Valor</th>
                <th className="text-right p-4 text-sm font-medium text-white/80">{labels.common.actions}</th>
              </tr>
            </thead>
            <tbody>
              {clients.map((client) => (
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
