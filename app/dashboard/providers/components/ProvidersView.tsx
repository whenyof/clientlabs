"use client"

import { useState } from "react"
import { TrendingUp, CheckCircle2, AlertTriangle, AlertCircle } from "lucide-react"
import { ProvidersTable } from "./ProvidersTable"
import { ProviderSidePanel } from "@/modules/providers/components/ProviderSidePanel"
import { useSectorConfig } from "@/hooks/useSectorConfig"

type Provider = {
    id: string
    name: string
    type: string | null
    monthlyCost: number | null
    dependencyLevel: string
    isCritical: boolean
    operationalState: string
    status: string
    createdAt: Date
    updatedAt: Date
    payments: any[]
    tasks: any[]
    _count: {
        payments: number
        tasks: number
    }
}

type KPIs = {
    totalMonthlyCost: number
    totalAnnualCost: number
    activeProviders: number
    providersWithIssues: number
    criticalProviders: number
    totalProviders: number
}

type ProvidersViewProps = {
    initialProviders: Provider[]
    initialKPIs: KPIs
}

export function ProvidersView({ initialProviders, initialKPIs }: ProvidersViewProps) {
    const { labels } = useSectorConfig()
    const [providers, setProviders] = useState(initialProviders)
    const [kpis, setKPIs] = useState(initialKPIs)
    const [selectedProvider, setSelectedProvider] = useState<Provider | null>(null)

    const handleProviderUpdate = (providerId: string, data: Partial<Provider>) => {
        setProviders(prev => prev.map(p =>
            p.id === providerId ? { ...p, ...data } : p
        ))

        // Recalculate KPIs if status or cost changed
        if (data.status !== undefined || data.monthlyCost !== undefined) {
            const updatedProviders = providers.map(p =>
                p.id === providerId ? { ...p, ...data } : p
            )
            recalculateKPIs(updatedProviders)
        }
    }

    const recalculateKPIs = (providersList: Provider[]) => {
        const totalMonthlyCost = providersList.reduce((sum, p) => sum + (p.monthlyCost || 0), 0)
        const activeProviders = providersList.filter(p => p.status === 'OK' || p.status === 'ACTIVE').length
        const providersWithIssues = providersList.filter(p => p.status === 'ISSUE' || p.operationalState === 'RISK').length
        const criticalProviders = providersList.filter(p =>
            (p.dependencyLevel === 'HIGH' || p.dependencyLevel === 'CRITICAL' || p.isCritical) &&
            (p.status === 'PENDING' || p.status === 'ISSUE' || p.operationalState === 'ATTENTION' || p.operationalState === 'RISK')
        ).length

        setKPIs({
            totalMonthlyCost,
            totalAnnualCost: totalMonthlyCost * 12,
            activeProviders,
            providersWithIssues,
            criticalProviders,
            totalProviders: providersList.length
        })
    }

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('es-ES', {
            style: 'currency',
            currency: 'EUR',
            minimumFractionDigits: 0,
            maximumFractionDigits: 0
        }).format(amount)
    }

    return (
        <>
            {/* KPIs */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {/* Total Monthly Cost */}
                <div className="rounded-xl border border-white/10 bg-gradient-to-br from-blue-500/10 to-blue-600/5 p-6 backdrop-blur">
                    <div className="flex items-center justify-between mb-2">
                        <span className="text-sm text-white/60">Coste mensual</span>
                        <TrendingUp className="h-5 w-5 text-blue-400" />
                    </div>
                    <p className="text-3xl font-bold text-white">{formatCurrency(kpis.totalMonthlyCost)}</p>
                    <p className="text-xs text-white/40 mt-1">
                        {formatCurrency(kpis.totalAnnualCost)}/año
                    </p>
                </div>

                {/* Active Providers */}
                <div className="rounded-xl border border-white/10 bg-gradient-to-br from-green-500/10 to-green-600/5 p-6 backdrop-blur">
                    <div className="flex items-center justify-between mb-2">
                        <span className="text-sm text-white/60">Activos</span>
                        <CheckCircle2 className="h-5 w-5 text-green-400" />
                    </div>
                    <p className="text-3xl font-bold text-white">{kpis.activeProviders}</p>
                    <p className="text-xs text-white/40 mt-1">
                        de {kpis.totalProviders} {labels.providers.plural.toLowerCase()}
                    </p>
                </div>

                {/* Providers with Issues */}
                <div className="rounded-xl border border-white/10 bg-gradient-to-br from-amber-500/10 to-amber-600/5 p-6 backdrop-blur">
                    <div className="flex items-center justify-between mb-2">
                        <span className="text-sm text-white/60">Con incidencias</span>
                        <AlertTriangle className="h-5 w-5 text-amber-400" />
                    </div>
                    <p className="text-3xl font-bold text-white">{kpis.providersWithIssues}</p>
                    <p className="text-xs text-white/40 mt-1">
                        requieren atención
                    </p>
                </div>

                {/* Critical Providers */}
                <div className="rounded-xl border border-white/10 bg-gradient-to-br from-red-500/10 to-red-600/5 p-6 backdrop-blur">
                    <div className="flex items-center justify-between mb-2">
                        <span className="text-sm text-white/60">Críticos</span>
                        <AlertCircle className="h-5 w-5 text-red-400" />
                    </div>
                    <p className="text-3xl font-bold text-white">{kpis.criticalProviders}</p>
                    <p className="text-xs text-white/40 mt-1">
                        alta dependencia
                    </p>
                </div>
            </div>

            {/* Table */}
            <ProvidersTable
                providers={providers}
                onProviderClick={setSelectedProvider}
                onProviderUpdate={handleProviderUpdate}
            />

            {/* Side Panel */}
            {selectedProvider && (
                <ProviderSidePanel
                    provider={selectedProvider}
                    open={!!selectedProvider}
                    onClose={() => setSelectedProvider(null)}
                    onUpdate={handleProviderUpdate}
                />
            )}
        </>
    )
}
