"use client"

import { useState, useOptimistic, startTransition } from "react"
import { Badge } from "@/components/ui/badge"
import {
 DropdownMenu,
 DropdownMenuContent,
 DropdownMenuItem,
 DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Loader2 } from "lucide-react"
import { updateSaleStatus } from "../actions"
import { toast } from "sonner"

type PaymentStatusBadgeProps = {
 saleId: string
 initialStatus: string
 onStatusChange?: (newStatus: string) => void
}

export function PaymentStatusBadge({ saleId, initialStatus, onStatusChange }: PaymentStatusBadgeProps) {
 const [loading, setLoading] = useState(false)

 // Normalize status for consistent comparison
 const normalize = (s: string) => {
 if (s === "PAGADO") return "PAID"
 return s
 }

 const [optimisticStatus, setOptimisticStatus] = useOptimistic(
 normalize(initialStatus),
 (state, newStatus: string) => newStatus
 )

 const handleStatusChange = async (newStatus: string) => {
 if (loading) return

 startTransition(() => {
 setOptimisticStatus(newStatus)
 })

 if (onStatusChange) onStatusChange(newStatus)
 setLoading(true)

 try {
 await updateSaleStatus(saleId, newStatus)
 toast.success("Estado actualizado")
 } catch (error) {
 toast.error("Error al actualizar estado")
 // Revert is complex with optimistic, usually we just let the next server revalidation fix it, 
 // or we could track previous state. Simple optimistic is usually enough.
 } finally {
 setLoading(false)
 }
 }

 const getStatusConfig = (status: string) => {
 switch (status) {
 case "PAID":
 case "PAGADO":
 return { label: "PAGADO", className: "bg-[var(--accent-soft)] text-[var(--accent)] border-[var(--accent)] hover:bg-[var(--accent-soft)]" }
 case "PENDING":
 return { label: "PENDIENTE", className: "bg-[var(--bg-card)] text-[var(--text-secondary)] border-[var(--border-subtle)] hover:bg-[var(--bg-card)]" }
 case "CANCELLED":
 case "CANCELED":
 return { label: "CANCELADO", className: "bg-[var(--bg-card)] text-[var(--critical)] border-[var(--critical)] hover:bg-[var(--bg-card)]" }
 default:
 return { label: status, className: "bg-[var(--bg-card)] text-[var(--text-secondary)] border-[var(--border-subtle)]" }
 }
 }

 const config = getStatusConfig(optimisticStatus)

 return (
 <DropdownMenu>
 <DropdownMenuTrigger disabled={loading}>
 <Badge variant="outline" className={`cursor-pointer transition-colors ${config.className}`}>
 {loading && <Loader2 className="w-3 h-3 mr-1 animate-spin" />}
 {config.label}
 </Badge>
 </DropdownMenuTrigger>
 <DropdownMenuContent className="bg-zinc-900 border-[var(--border-subtle)]">
 <DropdownMenuItem
 onClick={() => handleStatusChange("PENDING")}
 className="text-[var(--text-secondary)] hover:bg-[var(--bg-card)] cursor-pointer"
 >
 PENDIENTE
 </DropdownMenuItem>
 <DropdownMenuItem
 onClick={() => handleStatusChange("PAID")}
 className="text-[var(--accent)] hover:bg-[var(--accent-soft)] cursor-pointer"
 >
 PAGADO
 </DropdownMenuItem>
 <DropdownMenuItem
 onClick={() => handleStatusChange("CANCELLED")}
 className="text-[var(--critical)] hover:bg-[var(--bg-card)] cursor-pointer"
 >
 CANCELADO
 </DropdownMenuItem>
 </DropdownMenuContent>
 </DropdownMenu>
 )
}
