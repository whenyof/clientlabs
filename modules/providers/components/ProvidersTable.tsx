"use client"

import { useState, memo } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
    ShoppingBag,
    CheckSquare,
    Mail,
    Package,
    Wrench,
    Code,
    HelpCircle
} from "lucide-react"
import { formatDistanceToNow } from "date-fns"
import { es } from "date-fns/locale"
import { cn } from "@/lib/utils"
import { RegisterOrderDialog } from "./RegisterOrderDialog"
import { CreateTaskDialog } from "./CreateTaskDialog"

import { useSectorConfig } from "@/hooks/useSectorConfig"

type Provider = {
    id: string
    name: string
    type: string | null
    monthlyCost: number | null
    dependencyLevel: string
    status: string
    isCritical: boolean
    operationalState: string
    createdAt: Date
    updatedAt: Date
    payments: any[]
    tasks: any[]
    contactEmail?: string | null
    _count: {
        payments: number
        tasks: number
    }
}

type ProvidersTableProps = {
    providers: Provider[]
    onProviderClick: (provider: Provider) => void
    onProviderUpdate: (providerId: string, data: any) => void
    resultCount?: number
    totalCount?: number
    hasActiveFilters?: boolean
    embedded?: boolean
    labels?: {
        singular?: string
        plural?: string
        types?: Record<string, string>
        status?: Record<string, string>
        dependency?: Record<string, string>
        fields?: Record<string, string>
        actions?: Record<string, string>
        emptyState?: string
    }
}

const TYPE_ICONS = {
    SERVICE: Wrench,
    PRODUCT: Package,
    SOFTWARE: Code,
    OTHER: HelpCircle
}

function ProvidersTableComponent({
    providers,
    onProviderClick,
    onProviderUpdate,
    resultCount,
    totalCount,
    hasActiveFilters,
    embedded,
    labels: labelsProp,
}: ProvidersTableProps) {
    const sectorLabels = useSectorConfig().labels
    const labels = labelsProp ?? sectorLabels.providers

    const TYPE_LABELS = labels.types ?? { SERVICE: "Servicio", PRODUCT: "Producto", SOFTWARE: "Software", OTHER: "Otro" }
    const statusLabels = labels.status ?? {}
    const dependencyLabels = labels.dependency ?? {}
    const STATUS_CONFIG: Record<string, { label: string, color: string }> = {
        OK: { label: statusLabels.ACTIVE ?? "Estable", color: "bg-emerald-100 text-emerald-800 border-emerald-200" },
        ACTIVE: { label: statusLabels.ACTIVE ?? "Activo", color: "bg-emerald-100 text-emerald-800 border-emerald-200" },
        PAUSED: { label: statusLabels.PAUSED ?? "Pausado", color: "bg-amber-100 text-amber-800 border-amber-200" },
        PENDING: { label: "Pendiente", color: "bg-amber-100 text-amber-800 border-amber-200" },
        ISSUE: { label: "Problema", color: "bg-red-100 text-red-800 border-red-200" },
        BLOCKED: { label: statusLabels.BLOCKED ?? "Bloqueado", color: "bg-red-100 text-red-800 border-red-200" }
    }

    const DEPENDENCY_CONFIG: Record<string, { label: string, color: string }> = {
        LOW: { label: dependencyLabels.LOW ?? "Baja", color: "bg-neutral-100 text-neutral-700 border-neutral-200" },
        MEDIUM: { label: dependencyLabels.MEDIUM ?? "Media", color: "bg-sky-100 text-sky-800 border-sky-200" },
        HIGH: { label: dependencyLabels.HIGH ?? "Alta", color: "bg-red-100 text-red-800 border-red-200" },
        CRITICAL: { label: dependencyLabels.CRITICAL ?? "Crítica", color: "bg-red-100 text-red-900 border-red-300" }
    }

    const [orderDialogProvider, setOrderDialogProvider] = useState<Provider | null>(null)
    const [taskDialogProvider, setTaskDialogProvider] = useState<Provider | null>(null)

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('es-ES', {
            style: 'currency',
            currency: 'EUR',
            minimumFractionDigits: 0,
            maximumFractionDigits: 0
        }).format(amount)
    }

    if (providers.length === 0 && !embedded) {
        return (
            <div className="rounded-xl bg-white p-8 text-center shadow-sm">
                <Package className="h-12 w-12 mx-auto text-neutral-400 mb-4" />
                <p className="text-[var(--text-primary)] text-lg font-medium mb-2">{labels.emptyState ?? "No hay resultados"}</p>
                <p className="text-sm text-[var(--text-secondary)]">Ajusta los filtros para ver más</p>
            </div>
        )
    }

    return (
        <>
            <div className={cn(embedded ? "overflow-hidden" : "rounded-xl bg-white overflow-hidden shadow-sm")}>
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead>
                            <tr className="bg-neutral-50/80">
                                <th className="text-left p-3.5 text-xs font-medium uppercase tracking-wide text-neutral-500">{labels.singular ?? "Proveedor"}</th>
                                <th className="text-left p-3.5 text-xs font-medium uppercase tracking-wide text-neutral-500">{labels.fields?.monthlyCost ?? "Coste mensual"}</th>
                                <th className="text-left p-3.5 text-xs font-medium uppercase tracking-wide text-neutral-500">{labels.fields?.status ?? "Estado"}</th>
                                <th className="text-left p-3.5 text-xs font-medium uppercase tracking-wide text-neutral-500">{labels.fields?.dependencyLevel ?? "Dependencia"}</th>
                                <th className="text-left p-3.5 text-xs font-medium uppercase tracking-wide text-neutral-500">Última acción</th>
                                <th className="text-right p-3.5 text-xs font-medium uppercase tracking-wide text-neutral-500">Acciones</th>
                            </tr>
                        </thead>
                        <tbody>
                            {providers.map((provider) => {
                                const TypeIcon = TYPE_ICONS[provider.type as keyof typeof TYPE_ICONS] || HelpCircle
                                const statusConfig = STATUS_CONFIG[provider.status as keyof typeof STATUS_CONFIG] || STATUS_CONFIG.OK
                                const dependencyConfig = DEPENDENCY_CONFIG[provider.dependencyLevel as keyof typeof DEPENDENCY_CONFIG] || DEPENDENCY_CONFIG.LOW

                                return (
                                    <tr
                                        key={provider.id}
                                        className="border-b border-neutral-100/80 hover:bg-white/60 transition-colors duration-150 cursor-pointer group"
                                        onClick={() => onProviderClick(provider)}
                                    >
                                        {/* Provider Name */}
                                        <td className="p-4">
                                            <div className="flex items-center gap-3">
                                                <div className="h-10 w-10 rounded-lg bg-neutral-100/80 flex items-center justify-center">
                                                    <TypeIcon className="h-5 w-5 text-[var(--text-secondary)]" />
                                                </div>
                                                <div>
                                                    <p className="font-semibold text-[var(--text-primary)]">{provider.name}</p>
                                                    <p className="text-xs text-[var(--text-secondary)]">
                                                        {TYPE_LABELS[provider.type as keyof typeof TYPE_LABELS]}
                                                    </p>
                                                </div>
                                            </div>
                                        </td>

                                        {/* Monthly Cost */}
                                        <td className="p-4">
                                            {provider.monthlyCost ? (
                                                <div>
                                                    <p className="font-semibold text-[var(--text-primary)]">
                                                        {formatCurrency(provider.monthlyCost)}
                                                    </p>
                                                    <p className="text-xs text-[var(--text-secondary)]">
                                                        {formatCurrency(provider.monthlyCost * 12)}/año
                                                    </p>
                                                </div>
                                            ) : (
                                                <span className="text-sm text-[var(--text-secondary)]">Sin definir</span>
                                            )}
                                        </td>

                                        {/* Status */}
                                        <td className="p-4">
                                            <Badge className={cn("text-xs border", statusConfig.color)}>
                                                {statusConfig.label}
                                            </Badge>
                                        </td>

                                        {/* Dependency */}
                                        <td className="p-4">
                                            <Badge variant="outline" className={cn("text-xs", dependencyConfig.color)}>
                                                {dependencyConfig.label}
                                            </Badge>
                                        </td>

                                        {/* Last Activity */}
                                        <td className="p-4">
                                            <span className="text-sm text-[var(--text-secondary)]">
                                                {formatDistanceToNow(new Date(provider.updatedAt), {
                                                    addSuffix: true,
                                                    locale: es
                                                })}
                                            </span>
                                        </td>

                                        {/* Acciones rápidas */}
                                        <td className="p-4" onClick={(e) => e.stopPropagation()}>
                                            <div className="flex items-center justify-end gap-1">
                                                <Button
                                                    size="sm"
                                                    variant="ghost"
                                                    title={labels.actions?.newOrder ?? "Nuevo pedido"}
                                                    className="h-8 w-8 p-0 text-[var(--accent)] hover:bg-[var(--accent-soft)]"
                                                    onClick={(e) => { e.stopPropagation(); setOrderDialogProvider(provider) }}
                                                >
                                                    <ShoppingBag className="h-4 w-4" />
                                                </Button>
                                                <Button
                                                    size="sm"
                                                    variant="ghost"
                                                    title={labels.actions?.newTask ?? "Nueva tarea"}
                                                    className="h-8 w-8 p-0 text-amber-600 hover:bg-amber-50"
                                                    onClick={(e) => { e.stopPropagation(); setTaskDialogProvider(provider) }}
                                                >
                                                    <CheckSquare className="h-4 w-4" />
                                                </Button>
                                                <Button
                                                    size="sm"
                                                    variant="ghost"
                                                    title="Enviar email"
                                                    className="h-8 w-8 p-0 text-emerald-600 hover:bg-emerald-50"
                                                    onClick={(e) => {
                                                        e.stopPropagation()
                                                        if (provider.contactEmail) {
                                                            window.location.href = `mailto:${provider.contactEmail}`
                                                        } else {
                                                            onProviderClick(provider)
                                                        }
                                                    }}
                                                >
                                                    <Mail className="h-4 w-4" />
                                                </Button>
                                            </div>
                                        </td>
                                    </tr>
                                )
                            })}
                        </tbody>
                    </table>
                </div>

                {/* Results count + hint */}
                <div className="flex flex-wrap items-center justify-between gap-2 border-t border-neutral-100 bg-white/50 px-4 py-2.5">
                    <span className="text-sm text-neutral-500">
                        {totalCount != null && hasActiveFilters
                            ? `Mostrando ${resultCount ?? providers.length} de ${totalCount}`
                            : `Mostrando ${providers.length}`}{" "}
                        {providers.length === 1 ? labels.singular?.toLowerCase() : labels.plural?.toLowerCase()}
                    </span>
                    <span className="text-xs text-neutral-400">Clic en fila para ver detalle</span>
                </div>
            </div>

            {/* Dialogs */}
            {orderDialogProvider && (
                <RegisterOrderDialog
                    providerId={orderDialogProvider.id}
                    providerName={orderDialogProvider.name}
                    open={!!orderDialogProvider}
                    onOpenChange={(open) => !open && setOrderDialogProvider(null)}
                    onSuccess={() => onProviderUpdate(orderDialogProvider.id, {})}
                />
            )}

            {taskDialogProvider && (
                <CreateTaskDialog
                    providerId={taskDialogProvider.id}
                    providerName={taskDialogProvider.name}
                    open={!!taskDialogProvider}
                    onOpenChange={(open) => !open && setTaskDialogProvider(null)}
                    onSuccess={() => onProviderUpdate(taskDialogProvider.id, {})}
                />
            )}

        </>
    )
}

export const ProvidersTable = memo(ProvidersTableComponent)