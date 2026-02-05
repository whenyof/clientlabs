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
                return { label: "PAGADO", className: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20 hover:bg-emerald-500/20" }
            case "PENDING":
                return { label: "PENDIENTE", className: "bg-amber-500/10 text-amber-400 border-amber-500/20 hover:bg-amber-500/20" }
            case "CANCELLED":
            case "CANCELED":
                return { label: "CANCELADO", className: "bg-red-500/10 text-red-400 border-red-500/20 hover:bg-red-500/20" }
            default:
                return { label: status, className: "bg-white/10 text-white/60 border-white/10" }
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
            <DropdownMenuContent className="bg-zinc-900 border-white/10">
                <DropdownMenuItem
                    onClick={() => handleStatusChange("PENDING")}
                    className="text-amber-400 hover:bg-amber-500/10 cursor-pointer"
                >
                    PENDIENTE
                </DropdownMenuItem>
                <DropdownMenuItem
                    onClick={() => handleStatusChange("PAID")}
                    className="text-emerald-400 hover:bg-emerald-500/10 cursor-pointer"
                >
                    PAGADO
                </DropdownMenuItem>
                <DropdownMenuItem
                    onClick={() => handleStatusChange("CANCELLED")}
                    className="text-red-400 hover:bg-red-500/10 cursor-pointer"
                >
                    CANCELADO
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    )
}
