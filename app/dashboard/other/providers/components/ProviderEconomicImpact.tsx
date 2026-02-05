"use client"

import { useEffect, useState } from "react"
import { getProviderEconomicImpact } from "@/app/dashboard/providers/actions"
import { TrendingUp, TrendingDown, Minus } from "lucide-react"
import { cn } from "@/lib/utils"

interface ProviderEconomicImpactProps {
    providerId: string
    refreshTrigger?: number
}

export function ProviderEconomicImpact({ providerId, refreshTrigger }: ProviderEconomicImpactProps) {
    const [data, setData] = useState<any>(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        loadData()
    }, [providerId, refreshTrigger])

    const loadData = async () => {
        setLoading(true)
        try {
            const result = await getProviderEconomicImpact(providerId)
            if (result.success) {
                setData(result.data)
            }
        } catch (error) {
            console.error(error)
        } finally {
            setLoading(false)
        }
    }

    if (loading) return (
        <div className="grid grid-cols-2 gap-4 animate-pulse">
            <div className="h-20 bg-white/5 rounded-xl border border-white/5" />
            <div className="h-20 bg-white/5 rounded-xl border border-white/5" />
            <div className="col-span-2 h-20 bg-white/5 rounded-xl border border-white/5" />
        </div>
    )

    if (!data) return null

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('es-ES', {
            style: 'currency',
            currency: 'EUR',
            maximumFractionDigits: 0
        }).format(amount)
    }

    const { indicator } = data

    return (
        <div className="space-y-4">
            {/* Risk / Opportunity Indicator */}
            {indicator && (
                <div className={cn(
                    "p-4 rounded-xl border flex items-center gap-4 transition-colors",
                    indicator.level === "RED" ? "bg-red-500/10 border-red-500/20 text-red-100" :
                        indicator.level === "ORANGE" ? "bg-amber-500/10 border-amber-500/20 text-amber-100" :
                            indicator.level === "BLUE" ? "bg-blue-500/10 border-blue-500/20 text-blue-100" :
                                "bg-green-500/10 border-green-500/20 text-green-100"
                )}>
                    <div className={cn(
                        "w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0 text-white shadow-inner",
                        indicator.level === "RED" ? "bg-red-500/20" :
                            indicator.level === "ORANGE" ? "bg-amber-500/20" :
                                indicator.level === "BLUE" ? "bg-blue-500/20" :
                                    "bg-green-500/20"
                    )}>
                        {indicator.level === "RED" && <TrendingUp className="w-6 h-6" />}
                        {indicator.level === "ORANGE" && <Minus className="w-6 h-6" />}
                        {indicator.level === "BLUE" && <TrendingDown className="w-6 h-6" />}
                        {indicator.level === "GREEN" && <TrendingDown className="w-6 h-6" />}
                    </div>
                    <div>
                        <div className="uppercase text-[10px] font-bold tracking-wider opacity-60">Estado</div>
                        <div className="text-lg font-bold leading-tight">{indicator.label}</div>
                        <div className="text-sm opacity-80 mt-1">{indicator.reason}</div>
                    </div>
                </div>
            )}

            <div className="grid grid-cols-2 gap-3">
                {/* Total Spend */}
                <div className="p-4 rounded-xl bg-white/5 border border-white/10 space-y-1">
                    <span className="text-[10px] text-white/40 font-bold uppercase tracking-wider">Gasto anual (12m)</span>
                    <div className="flex items-center gap-2">
                        <span className="text-xl font-bold text-white tracking-tight">
                            {formatCurrency(data.totalSpendL12M)}
                        </span>
                    </div>
                </div>

                {/* Monthly Average */}
                <div className="p-4 rounded-xl bg-white/5 border border-white/10 space-y-1">
                    <span className="text-[10px] text-white/40 font-bold uppercase tracking-wider">Media mensual</span>
                    <div className="flex items-center gap-2">
                        <span className="text-xl font-bold text-white tracking-tight">
                            {formatCurrency(data.monthlyAverage)}
                        </span>
                    </div>
                </div>

                {/* Impact & Trend */}
                <div className="col-span-2 p-4 rounded-xl bg-white/5 border border-white/10 flex items-center justify-between">
                    <div>
                        <span className="text-[10px] text-white/40 font-bold uppercase tracking-wider">Impacto en costes</span>
                        <div className="flex items-baseline gap-2 mt-1">
                            <span className="text-2xl font-bold text-white tracking-tight">
                                {data.spendPercentage.toFixed(1)}%
                            </span>
                            <span className="text-xs text-white/40">del total</span>
                        </div>
                    </div>

                    <div className="text-right">
                        <div className={cn(
                            "inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium border transition-colors",
                            data.trend === 'UP' ? "bg-red-500/10 text-red-400 border-red-500/20" :
                                data.trend === 'DOWN' ? "bg-green-500/10 text-green-400 border-green-500/20" :
                                    "bg-white/5 text-white/60 border-white/10"
                        )}>
                            {data.trend === 'UP' && <TrendingUp className="w-3.5 h-3.5" />}
                            {data.trend === 'DOWN' && <TrendingDown className="w-3.5 h-3.5" />}
                            {data.trend === 'STABLE' && <Minus className="w-3.5 h-3.5" />}
                            <span>
                                {data.trend === 'UP' ? 'En aumento' :
                                    data.trend === 'DOWN' ? 'En descenso' :
                                        'Estable'}
                            </span>
                        </div>
                        <div className="mt-1 text-[10px] text-white/30">
                            vs 3 meses anteriores
                        </div>
                    </div>
                </div>
            </div>
            {data.budgetLimit > 0 && (
                <div className="p-3 rounded-lg bg-white/5 border border-white/10 flex items-center justify-between">
                    <div>
                        <span className="text-[10px] text-white/40 font-bold uppercase tracking-wider">Límite mensual</span>
                        <div className="text-sm font-semibold text-white mt-1">
                            {formatCurrency(data.budgetLimit)}
                        </div>
                    </div>
                    <div className="text-right">
                        <div className={cn(
                            "text-xs font-bold px-2 py-1 rounded",
                            data.monthlyAverage > data.budgetLimit
                                ? "bg-red-500/20 text-red-400"
                                : "bg-green-500/20 text-green-400"
                        )}>
                            {data.monthlyAverage > data.budgetLimit
                                ? `+${((data.monthlyAverage - data.budgetLimit) / data.budgetLimit * 100).toFixed(0)}% Excedido`
                                : `${((data.budgetLimit - data.monthlyAverage) / data.budgetLimit * 100).toFixed(0)}% Disponible`
                            }
                        </div>
                    </div>
                </div>
            )}
        </div> // Closes space-y-4
    )
}
