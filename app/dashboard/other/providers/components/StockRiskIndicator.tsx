"use client"

import { Badge } from "@/components/ui/badge"
import { AlertTriangle, Clock, CheckCircle, TrendingDown, Package } from "lucide-react"
import { cn } from "@/lib/utils"
import { motion } from "framer-motion"

type StockRiskLevel = "OK" | "REPONER_PRONTO" | "RIESGO"

type StockRiskBadgeProps = {
    level: StockRiskLevel
    message: string
    daysSinceLastOrder: number
    daysUntilReorder: number | null
    variant?: "compact" | "detailed"
    showIcon?: boolean
}

const RISK_CONFIG = {
    RIESGO: {
        label: "Riesgo",
        color: "bg-red-500/20 text-red-400 border-red-500/30",
        icon: AlertTriangle,
        iconColor: "text-red-400",
        pulse: true
    },
    REPONER_PRONTO: {
        label: "Reponer Pronto",
        color: "bg-amber-500/20 text-amber-400 border-amber-500/30",
        icon: Clock,
        iconColor: "text-amber-400",
        pulse: false
    },
    OK: {
        label: "Stock OK",
        color: "bg-green-500/20 text-green-400 border-green-500/30",
        icon: CheckCircle,
        iconColor: "text-green-400",
        pulse: false
    }
}

export function StockRiskBadge({
    level,
    message,
    daysSinceLastOrder,
    daysUntilReorder,
    variant = "compact",
    showIcon = true
}: StockRiskBadgeProps) {
    const config = RISK_CONFIG[level]
    const Icon = config.icon

    if (variant === "compact") {
        return (
            <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.2 }}
            >
                <Badge
                    className={cn(
                        "text-xs font-medium transition-all duration-200 hover:scale-105",
                        config.color,
                        config.pulse && "animate-pulse"
                    )}
                >
                    {showIcon && <Icon className="h-3 w-3 mr-1" />}
                    {config.label}
                </Badge>
            </motion.div>
        )
    }

    // Detailed variant for panel
    return (
        <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className={cn(
                "rounded-lg border p-4 transition-all duration-200",
                config.color,
                config.pulse && "animate-pulse"
            )}
        >
            <div className="flex items-start gap-3">
                <div className={cn(
                    "h-10 w-10 rounded-lg flex items-center justify-center flex-shrink-0",
                    level === "RIESGO" && "bg-red-500/20",
                    level === "REPONER_PRONTO" && "bg-amber-500/20",
                    level === "OK" && "bg-green-500/20"
                )}>
                    <Icon className={cn("h-5 w-5", config.iconColor)} />
                </div>

                <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                        <h4 className={cn("font-semibold", config.iconColor)}>
                            {config.label}
                        </h4>
                        {level === "RIESGO" && (
                            <Badge variant="outline" className="text-xs border-red-500/30 text-red-400">
                                Urgente
                            </Badge>
                        )}
                    </div>

                    <p className="text-sm text-white/80 mb-2">
                        {message}
                    </p>

                    <div className="flex items-center gap-4 text-xs text-white/60">
                        <div className="flex items-center gap-1">
                            <TrendingDown className="h-3 w-3" />
                            <span>{daysSinceLastOrder} días sin pedido</span>
                        </div>
                        {daysUntilReorder !== null && daysUntilReorder > 0 && (
                            <div className="flex items-center gap-1">
                                <Package className="h-3 w-3" />
                                <span>{daysUntilReorder} días restantes</span>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </motion.div>
    )
}

type StockRiskIndicatorProps = {
    level: StockRiskLevel
    message: string
    daysSinceLastOrder: number
    daysUntilReorder: number | null
    recommendedAction?: string
    onActionClick?: () => void
}

export function StockRiskIndicator({
    level,
    message,
    daysSinceLastOrder,
    daysUntilReorder,
    recommendedAction,
    onActionClick
}: StockRiskIndicatorProps) {
    if (level === "OK") {
        return (
            <div className="rounded-lg border border-white/10 bg-white/5 p-4">
                <div className="flex items-center gap-3">
                    <div className="h-8 w-8 rounded-lg bg-green-500/20 flex items-center justify-center">
                        <CheckCircle className="h-4 w-4 text-green-400" />
                    </div>
                    <div>
                        <p className="text-sm font-medium text-white">Stock OK</p>
                        <p className="text-xs text-white/60">
                            {daysUntilReorder !== null && `${daysUntilReorder} días hasta próximo pedido`}
                        </p>
                    </div>
                </div>
            </div>
        )
    }

    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3 }}
            className={cn(
                "rounded-xl border p-6",
                level === "RIESGO" && "border-red-500/30 bg-red-500/10",
                level === "REPONER_PRONTO" && "border-amber-500/30 bg-amber-500/10"
            )}
        >
            <StockRiskBadge
                level={level}
                message={message}
                daysSinceLastOrder={daysSinceLastOrder}
                daysUntilReorder={daysUntilReorder}
                variant="detailed"
            />

            {recommendedAction && onActionClick && (
                <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={onActionClick}
                    className={cn(
                        "mt-4 w-full px-4 py-3 rounded-lg font-medium transition-all duration-200",
                        "flex items-center justify-center gap-2",
                        level === "RIESGO" && "bg-red-500 hover:bg-red-600 text-white",
                        level === "REPONER_PRONTO" && "bg-amber-500 hover:bg-amber-600 text-white"
                    )}
                >
                    <Package className="h-4 w-4" />
                    {recommendedAction}
                </motion.button>
            )}
        </motion.div>
    )
}
