
import React, { memo } from "react"
import { Checkbox } from "@/components/ui/checkbox"
import { StatusBadgeSelector } from "./StatusBadgeSelector"
import { ClientRowActions } from "./ClientRowActions"
import { Mail, Phone, AlertTriangle } from "lucide-react"
import { formatDistanceToNow } from "date-fns"
import { es } from "date-fns/locale"
import { formatCurrency } from "@/lib/utils"
import type { Client } from "@prisma/client"
import { useSectorConfig } from "@/hooks/useSectorConfig"

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
 const { labels } = useSectorConfig()
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
 className="border-b border-[var(--border-subtle)] hover:bg-[var(--bg-card)]/[0.08] hover:shadow-sm transition-all duration-200 ease-out cursor-pointer group relative active:scale-[0.99]"
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
 className="border-[var(--border-subtle)] transition-all duration-200 hover:border-[var(--border-subtle)] active:scale-90"
 />
 </td>

 {/* Cliente */}
 <td className="p-4">
 <div className="transition-all duration-200 group-hover:translate-x-1">
 <div className="flex items-center gap-2 mb-1">
 <p className="text-[var(--text-primary)] font-semibold transition-colors duration-200 group-hover:text-[var(--text-secondary)]">{client.name || labels.common.noResults}</p>
 {client.riskLevel === "MEDIUM" && (
 <span
 className="cursor-help transition-transform duration-200 hover:scale-110"
 >
 🟠
 </span>
 )}
 {client.riskLevel === "HIGH" && (
 <span
 className="cursor-help shadow-sm transition-transform duration-200 hover:scale-110 animate-pulse"
 >
 🔴
 </span>
 )}
 </div>
 <div className="flex items-center gap-3 text-xs text-[var(--text-secondary)] transition-colors duration-200 group-hover:text-[var(--text-secondary)]">
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
 <p className="text-sm text-[var(--text-secondary)] transition-colors duration-200 group-hover:text-[var(--text-secondary)]">
 {isMounted ? formatDistanceToNow(lastActivity, {
 addSuffix: true,
 locale: es,
 }) : ""}
 </p>
 </div>
 {isForgotten && (
 <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-[var(--bg-card)] border border-[var(--border-subtle)] w-fit animate-pulse transition-all duration-300 hover:bg-[var(--bg-card)]">
 <AlertTriangle className="h-3 w-3 text-[var(--text-secondary)]" />
 <span className="text-[10px] font-medium text-[var(--text-secondary)]">
 ⚠️ {daysSinceActivity} días {labels.common.noResults ? labels.common.noResults.toLowerCase() : "sin"} actividad
 </span>
 </div>
 )}
 </div>
 </td>

 {/* Valor */}
 <td className="p-4">
 <p className="text-[var(--text-primary)] font-semibold transition-all duration-200 group-hover:text-[var(--accent)] group-hover:scale-105 inline-block">
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
