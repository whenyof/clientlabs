"use client"

import { Badge } from "@/components/ui/badge"
import { AlertTriangle, AlertCircle, Bell, DollarSign, Clock, Flag } from "lucide-react"
import { cn } from "@/lib/utils"

type ProviderAlert = {
    type: "BUDGET_EXCEEDED" | "BUDGET_WARNING" | "UNUSUAL_SPENDING" | "REMINDER_DUE" | "CRITICAL_PROVIDER" | "OVERDUE_TASK"
    severity: "LOW" | "MEDIUM" | "HIGH"
    message: string
    details?: string
}

type ProviderAlertsProps = {
    alerts: ProviderAlert[]
    automaticStatus?: "NORMAL" | "ATENCIÓN" | "CRÍTICO"
}

const ALERT_ICONS = {
    BUDGET_EXCEEDED: DollarSign,
    BUDGET_WARNING: DollarSign,
    UNUSUAL_SPENDING: AlertCircle,
    REMINDER_DUE: Bell,
    CRITICAL_PROVIDER: Flag,
    OVERDUE_TASK: Clock
}

const SEVERITY_CONFIG = {
    HIGH: {
        bg: "bg-red-500/10",
        border: "border-red-500/30",
        text: "text-red-400",
        iconBg: "bg-red-500/20"
    },
    MEDIUM: {
        bg: "bg-amber-500/10",
        border: "border-amber-500/30",
        text: "text-amber-400",
        iconBg: "bg-amber-500/20"
    },
    LOW: {
        bg: "bg-blue-500/10",
        border: "border-blue-500/30",
        text: "text-blue-400",
        iconBg: "bg-blue-500/20"
    }
}

const STATUS_CONFIG = {
    CRÍTICO: {
        bg: "bg-red-500/20",
        border: "border-red-500/50",
        text: "text-red-400",
        label: "Estado Crítico"
    },
    ATENCIÓN: {
        bg: "bg-amber-500/20",
        border: "border-amber-500/50",
        text: "text-amber-400",
        label: "Requiere Atención"
    },
    NORMAL: {
        bg: "bg-green-500/20",
        border: "border-green-500/50",
        text: "text-green-400",
        label: "Estado Normal"
    }
}

export function ProviderAlerts({ alerts, automaticStatus = "NORMAL" }: ProviderAlertsProps) {
    if (alerts.length === 0 && automaticStatus === "NORMAL") {
        return (
            <div className="rounded-xl border border-white/10 bg-white/5 p-6">
                <div className="flex items-center gap-3 mb-3">
                    <div className="h-8 w-8 rounded-lg bg-green-500/20 flex items-center justify-center">
                        <AlertCircle className="h-4 w-4 text-green-400" />
                    </div>
                    <h3 className="text-lg font-semibold text-white">Estado del Proveedor</h3>
                </div>
                <div className="flex items-center gap-2">
                    <Badge className="bg-green-500/20 text-green-400 border-green-500/30">
                        ✓ Todo OK
                    </Badge>
                    <span className="text-sm text-white/60">Sin alertas activas</span>
                </div>
            </div>
        )
    }

    const statusConfig = STATUS_CONFIG[automaticStatus]

    return (
        <div className="space-y-4">
            {/* Automatic Status Banner */}
            {automaticStatus !== "NORMAL" && (
                <div className={cn(
                    "rounded-xl border p-4",
                    statusConfig.bg,
                    statusConfig.border
                )}>
                    <div className="flex items-center gap-3">
                        <AlertTriangle className={cn("h-5 w-5", statusConfig.text)} />
                        <div>
                            <p className={cn("font-semibold", statusConfig.text)}>
                                {statusConfig.label}
                            </p>
                            <p className="text-sm text-white/60 mt-1">
                                {alerts.length} alerta{alerts.length !== 1 ? 's' : ''} activa{alerts.length !== 1 ? 's' : ''}
                            </p>
                        </div>
                    </div>
                </div>
            )}

            {/* Alerts List */}
            <div className="rounded-xl border border-white/10 bg-white/5 p-6">
                <div className="flex items-center gap-3 mb-4">
                    <div className="h-8 w-8 rounded-lg bg-white/10 flex items-center justify-center">
                        <AlertCircle className="h-4 w-4 text-white/60" />
                    </div>
                    <h3 className="text-lg font-semibold text-white">Alertas Activas</h3>
                </div>

                <div className="space-y-3">
                    {alerts.map((alert, index) => {
                        const Icon = ALERT_ICONS[alert.type]
                        const config = SEVERITY_CONFIG[alert.severity]

                        return (
                            <div
                                key={index}
                                className={cn(
                                    "rounded-lg border p-4 transition-all duration-200 hover:bg-white/[0.03]",
                                    config.bg,
                                    config.border
                                )}
                            >
                                <div className="flex items-start gap-3">
                                    <div className={cn(
                                        "h-8 w-8 rounded-lg flex items-center justify-center flex-shrink-0",
                                        config.iconBg
                                    )}>
                                        <Icon className={cn("h-4 w-4", config.text)} />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className={cn("font-medium", config.text)}>
                                            {alert.message}
                                        </p>
                                        {alert.details && (
                                            <p className="text-sm text-white/60 mt-1">
                                                {alert.details}
                                            </p>
                                        )}
                                    </div>
                                    <Badge
                                        variant="outline"
                                        className={cn("text-xs flex-shrink-0", config.text)}
                                    >
                                        {alert.severity}
                                    </Badge>
                                </div>
                            </div>
                        )
                    })}
                </div>
            </div>
        </div>
    )
}
