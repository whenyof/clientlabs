"use client"

import { useState } from "react"
import { Search, Plus, TrendingUp, CheckCircle2, AlertTriangle, AlertCircle } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { ProvidersTable } from "./ProvidersTable"
import { ProviderSidePanel } from "./ProviderSidePanel"
import { CreateProviderDialog } from "./CreateProviderDialog"
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
    const [providers, setProviders] = useState<Provider[]>(initialProviders)
    const [searchTerm, setSearchTerm] = useState("")
    const [kpis, setKPIs] = useState(initialKPIs)
    const [selectedProvider, setSelectedProvider] = useState<Provider | null>(null)
    const [isCreateOpen, setIsCreateOpen] = useState(false)

    const filteredProviders = providers.filter((p: Provider) =>
        p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (p.type && p.type.toLowerCase().includes(searchTerm.toLowerCase()))
    )

    const handleProviderUpdate = (providerId: string, data: Partial<Provider>) => {
        setProviders((prev: Provider[]) => prev.map((p: Provider) =>
            p.id === providerId ? { ...p, ...data } : p
        ))

        // Recalculate KPIs if status or cost changed
        if (data.status !== undefined || data.monthlyCost !== undefined) {
            const updatedProviders = providers.map((p: Provider) =>
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
        <div className="space-y-8">
            {/* Barra de búsqueda + botón "Nuevo proveedor" a la misma altura */}
            <div className="flex flex-wrap items-center gap-3">
                <div className="relative flex-1 min-w-[200px] max-w-md">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
                    <Input
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        placeholder={`Buscar ${labels.providers.plural.toLowerCase()}...`}
                        className="bg-white/5 border-white/10 text-white pl-10 h-11"
                    />
                </div>
                <Button
                    onClick={() => setIsCreateOpen(true)}
                    className="h-11 px-6 shrink-0 bg-blue-500 hover:bg-blue-600 text-white font-semibold shadow-[0_0_20px_rgba(59,130,246,0.2)]"
                >
                    <Plus className="h-4 w-4 mr-2" />
                    {labels.providers.newButton}
                </Button>
            </div>

            {/* KPIs */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {/* Total Monthly Cost */}
                <div className="rounded-xl border border-white/10 bg-gradient-to-br from-blue-500/10 to-blue-600/5 p-6 backdrop-blur">
                    <div className="flex items-center justify-between mb-2">
                        <span className="text-sm text-white/60">{labels.providers.fields.monthlyCost}</span>
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
                        <span className="text-sm text-white/60">{labels.providers.status.ACTIVE}</span>
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
                        {labels.providers.dependency.HIGH.toLowerCase()} dependencia
                    </p>
                </div>
            </div>

            {/* Table */}
            <ProvidersTable
                providers={filteredProviders}
                onProviderClick={(p: Provider) => setSelectedProvider(p)}
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

            {/* Create Dialog */}
            <CreateProviderDialog
                open={isCreateOpen}
                onOpenChange={setIsCreateOpen}
                onProviderCreated={(newP: Provider) => {
                    setProviders((prev: Provider[]) => [newP, ...prev])
                    recalculateKPIs([newP, ...providers])
                }}
            />
        </div>
    )
}



