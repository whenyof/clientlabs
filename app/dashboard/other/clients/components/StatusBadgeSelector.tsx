"use client"

import { useState } from "react"
import { Badge } from "@/components/ui/badge"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Check } from "lucide-react"

type ClientStatus = "ACTIVE" | "FOLLOW_UP" | "INACTIVE" | "VIP"

type StatusBadgeSelectorProps = {
    currentStatus: ClientStatus
    onStatusChange: (newStatus: ClientStatus) => Promise<void>
    disabled?: boolean
}

const STATUS_CONFIG = {
    ACTIVE: {
        label: "Activo",
        color: "bg-green-500/20 text-green-400 border-green-500/30",
        hoverColor: "hover:bg-green-500/30",
    },
    FOLLOW_UP: {
        label: "Seguimiento",
        color: "bg-amber-500/20 text-amber-400 border-amber-500/30",
        hoverColor: "hover:bg-amber-500/30",
    },
    INACTIVE: {
        label: "Inactivo",
        color: "bg-gray-500/20 text-gray-400 border-gray-500/30",
        hoverColor: "hover:bg-gray-500/30",
    },
    VIP: {
        label: "VIP",
        color: "bg-purple-500/20 text-purple-400 border-purple-500/30",
        hoverColor: "hover:bg-purple-500/30",
    },
}

export function StatusBadgeSelector({
    currentStatus,
    onStatusChange,
    disabled = false,
}: StatusBadgeSelectorProps) {
    const [isChanging, setIsChanging] = useState(false)

    const handleStatusChange = async (newStatus: ClientStatus) => {
        if (newStatus === currentStatus || isChanging) return

        setIsChanging(true)
        try {
            await onStatusChange(newStatus)
        } catch (error) {
            console.error("Error changing status:", error)
        } finally {
            setIsChanging(false)
        }
    }

    // Defensive fallback for invalid/legacy status values
    const config = STATUS_CONFIG[currentStatus] ?? STATUS_CONFIG["INACTIVE"]

    // Log unknown statuses in development
    if (process.env.NODE_ENV === "development" && !STATUS_CONFIG[currentStatus]) {
        console.warn("[StatusBadgeSelector] Unknown client status:", currentStatus)
    }

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild disabled={disabled || isChanging}>
                <button
                    className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium border transition-all duration-300 ease-out active:scale-95 ${config.color} ${config.hoverColor} cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed items-center gap-1.5`}
                    onClick={(e) => e.stopPropagation()}
                >
                    <span className={`w-1.5 h-1.5 rounded-full ${config.color.replace('bg-', 'bg-opacity-100 bg-').replace('/20', '')} animate-pulse`} />
                    {config.label}
                </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="bg-zinc-900 border-white/10">
                {(Object.keys(STATUS_CONFIG) as ClientStatus[]).map((status) => {
                    const statusConfig = STATUS_CONFIG[status]
                    const isActive = status === currentStatus

                    return (
                        <DropdownMenuItem
                            key={status}
                            onClick={() => handleStatusChange(status)}
                            className="flex items-center justify-between gap-3 text-white hover:bg-white/10 cursor-pointer"
                        >
                            <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium border ${statusConfig.color}`}>
                                {statusConfig.label}
                            </span>
                            {isActive && <Check className="h-4 w-4 text-green-400" />}
                        </DropdownMenuItem>
                    )
                })}
            </DropdownMenuContent>
        </DropdownMenu>
    )
}
