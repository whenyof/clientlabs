
import React, { memo } from "react"
import { Checkbox } from "@/components/ui/checkbox"
import { StatusBadgeSelector } from "./StatusBadgeSelector"
import { ClientRowActions } from "./ClientRowActions"
import { Mail, Phone, AlertTriangle } from "lucide-react"
import { formatDistanceToNow } from "date-fns"
import { es } from "date-fns/locale"
import { formatCurrency } from "@/lib/utils"
import type { Client } from "@prisma/client"

// Use same type definition as Parent
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

type ClientRowProps = {
  client: ClientWithLead
  isSelected: boolean
  onSelect: (id: string, checked: boolean) => void
  onClick?: (client: ClientWithLead) => void
  onStatusChange: (id: string, status: "ACTIVE" | "FOLLOW_UP" | "INACTIVE" | "VIP") => Promise<void>
  isMounted: boolean
  normalizeStatus: (status: any) => "ACTIVE" | "FOLLOW_UP" | "INACTIVE" | "VIP"
}

export const ClientRow = memo(function ClientRow({
  client,
  isSelected,
  onSelect,
  onClick,
  onStatusChange,
  isMounted,
  normalizeStatus
}: ClientRowProps) {
  const lastActivity = new Date(client.updatedAt || client.createdAt)
  const isForgotten = client.isForgotten
  const daysSinceActivity = client.daysSinceActivity || Math.floor(
    (Date.now() - lastActivity.getTime()) / (1000 * 60 * 60 * 24)
  )

  // Helper for safe formatting
  const safeFormatCurrency = (amount: number) => {
    if (!isMounted) return ""
    return formatCurrency(amount, client.currency || "EUR")
  }

  return (
    <tr
      className="border-b border-white/5 hover:bg-white/[0.08] hover:shadow-sm transition-all duration-200 ease-out cursor-pointer group relative active:scale-[0.99]"
      onClick={() => onClick?.(client)}
      style={{
        transform: 'translateZ(0)', // Force GPU acceleration
      }}
    >
      {/* Checkbox */}
      <td className="p-4" onClick={(e) => e.stopPropagation()}>
        <Checkbox
          checked={isSelected}
          onCheckedChange={(checked) => onSelect(client.id, checked as boolean)}
          className="border-white/20 transition-all duration-200 hover:border-white/40 active:scale-90"
        />
      </td>

      {/* Cliente */}
      <td className="p-4">
        <div className="transition-all duration-200 group-hover:translate-x-1">
          <div className="flex items-center gap-2 mb-1">
            <p className="text-white font-semibold transition-colors duration-200 group-hover:text-white/95">{client.name || "Sin nombre"}</p>
            {client.riskLevel === "MEDIUM" && (
              <span
                title="Sin contacto reciente"
                className="cursor-help transition-transform duration-200 hover:scale-110"
              >
                🟠
              </span>
            )}
            {client.riskLevel === "HIGH" && (
              <span
                title="Riesgo de pérdida"
                className="cursor-help shadow-sm transition-transform duration-200 hover:scale-110 animate-pulse"
              >
                🔴
              </span>
            )}
          </div>
          <div className="flex items-center gap-3 text-xs text-white/60 transition-colors duration-200 group-hover:text-white/70">
            {client.email && (
              <span className="flex items-center gap-1 transition-transform duration-200 hover:translate-x-0.5">
                <Mail className="h-3 w-3" />
                {client.email}
              </span>
            )}
            {client.phone && (
              <span className="flex items-center gap-1 transition-transform duration-200 hover:translate-x-0.5">
                <Phone className="h-3 w-3" />
                {client.phone}
              </span>
            )}
          </div>
        </div>
      </td>

      {/* Estado */}
      <td className="p-4" onClick={(e) => e.stopPropagation()}>
        <div className="transition-all duration-200 hover:scale-105 origin-left">
          <StatusBadgeSelector
            currentStatus={normalizeStatus(client.status)}
            onStatusChange={(newStatus) => onStatusChange(client.id, newStatus)}
          />
        </div>
      </td>

      {/* Última Actividad */}
      <td className="p-4">
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-2">
            <p className="text-sm text-white/80 transition-colors duration-200 group-hover:text-white/90">
              {isMounted ? formatDistanceToNow(lastActivity, {
                addSuffix: true,
                locale: es,
              }) : ""}
            </p>
          </div>
          {isForgotten && (
            <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-amber-500/10 border border-amber-500/20 w-fit animate-pulse transition-all duration-300 hover:bg-amber-500/20">
              <AlertTriangle className="h-3 w-3 text-amber-500" />
              <span className="text-[10px] font-medium text-amber-500">
                ⚠️ {daysSinceActivity} días sin actividad
              </span>
            </div>
          )}
        </div>
      </td>

      {/* Valor */}
      <td className="p-4">
        <p className="text-white font-semibold transition-all duration-200 group-hover:text-emerald-400 group-hover:scale-105 inline-block">
          {safeFormatCurrency(client.totalSpent || 0)}
        </p>
      </td>

      {/* Acciones */}
      <td className="p-4 text-right" onClick={(e) => e.stopPropagation()}>
        <div className="inline-block transition-all duration-150 hover:scale-110 active:scale-95 opacity-0 group-hover:opacity-100">
          <ClientRowActions client={client} />
        </div>
      </td>
    </tr>
  )
})
