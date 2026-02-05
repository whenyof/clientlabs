"use client"

import { Brain, Sparkles, TrendingUp, AlertTriangle, Lightbulb, Zap, X, Check } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import { cn } from "@/lib/utils"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ProviderInsight } from "@/lib/provider-insights"

interface ProviderInsightsProps {
    insights: ProviderInsight[]
    onAction: (action: string) => void
    onIgnore: (id: string) => void
    isLoading?: boolean
}

export function ProviderInsights({
    insights,
    onAction,
    onIgnore,
    isLoading = false
}: ProviderInsightsProps) {
    if (isLoading) {
        return (
            <div className="space-y-3 animate-pulse">
                {[1, 2].map(i => (
                    <div key={i} className="h-24 bg-white/5 rounded-xl border border-white/10" />
                ))}
            </div>
        )
    }

    if (insights.length === 0) {
        return (
            <div className="rounded-xl border border-white/5 bg-white/5 p-8 text-center">
                <Brain className="h-8 w-8 text-white/20 mx-auto mb-3" />
                <p className="text-sm text-white/40">No hay nuevas sugerencias en este momento.</p>
            </div>
        )
    }

    const getIcon = (type: string) => {
        switch (type) {
            case "RISK": return AlertTriangle
            case "OPPORTUNITY": return Lightbulb
            case "ALERT": return Zap
            default: return Sparkles
        }
    }

    const getColor = (type: string) => {
        switch (type) {
            case "RISK": return "text-red-400 bg-red-500/10 border-red-500/20"
            case "OPPORTUNITY": return "text-blue-400 bg-blue-500/10 border-blue-500/20"
            case "ALERT": return "text-amber-400 bg-amber-500/10 border-amber-500/20"
            default: return "text-purple-400 bg-purple-500/10 border-purple-500/20"
        }
    }

    return (
        <div className="space-y-3">
            <AnimatePresence mode="popLayout">
                {insights.map((insight) => {
                    const Icon = getIcon(insight.type)
                    const colors = getColor(insight.type)

                    return (
                        <motion.div
                            key={insight.id}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            className={cn(
                                "group relative overflow-hidden rounded-xl border p-4 transition-all duration-300",
                                colors,
                                "hover:shadow-[0_0_20px_rgba(168,85,247,0.15)] bg-white/5"
                            )}
                        >
                            {/* Priority Glow */}
                            {insight.priority > 80 && (
                                <div className="absolute -right-8 -top-8 h-16 w-16 bg-white/10 blur-2xl rounded-full" />
                            )}

                            <div className="flex gap-4">
                                <div className={cn(
                                    "flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border shadow-sm",
                                    colors
                                )}>
                                    <Icon className="h-5 w-5" />
                                </div>

                                <div className="flex-1 space-y-1">
                                    <div className="flex items-center justify-between">
                                        <h4 className="text-sm font-semibold text-white">
                                            {insight.title}
                                        </h4>
                                        <button
                                            onClick={() => onIgnore(insight.id)}
                                            className="text-white/20 hover:text-white/60 transition-colors"
                                            title="Ignorar"
                                        >
                                            <X className="h-3.5 w-3.5" />
                                        </button>
                                    </div>

                                    <p className="text-xs text-white/70 leading-relaxed">
                                        {insight.message}
                                    </p>

                                    <div className="mt-3 pt-3 border-t border-white/5 flex items-center justify-between gap-4">
                                        <p className="text-[10px] text-white/30 italic line-clamp-2 pr-2">
                                            {insight.reason}
                                        </p>

                                        {insight.action !== "NONE" && (
                                            <Button
                                                size="sm"
                                                variant="outline"
                                                onClick={() => onAction(insight.action)}
                                                className="h-7 px-3 text-[11px] border-white/10 hover:bg-white/10 text-white shrink-0"
                                            >
                                                {insight.actionLabel || "Ver más"}
                                            </Button>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    )
                })}
            </AnimatePresence>
        </div>
    )
}
