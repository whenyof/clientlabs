"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
    ShoppingBag,
    CheckSquare,
    MessageSquare,
    ChevronRight,
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
import { AddNoteDialog } from "./AddNoteDialog"

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
    _count: {
        payments: number
        tasks: number
    }
}

type ProvidersTableProps = {
    providers: Provider[]
    onProviderClick: (provider: Provider) => void
    onProviderUpdate: (providerId: string, data: any) => void
}

const TYPE_ICONS = {
    SERVICE: Wrench,
    PRODUCT: Package,
    SOFTWARE: Code,
    OTHER: HelpCircle
}

export function ProvidersTable({ providers, onProviderClick, onProviderUpdate }: ProvidersTableProps) {
    const { labels } = useSectorConfig()

    const TYPE_LABELS = labels.providers.types
    const STATUS_CONFIG: Record<string, { label: string, color: string }> = {
        OK: { label: labels.providers.status.ACTIVE, color: "bg-green-500/20 text-green-400 border-green-500/30" },
        ACTIVE: { label: labels.providers.status.ACTIVE, color: "bg-green-500/20 text-green-400 border-green-500/30" },
        PAUSED: { label: labels.providers.status.PAUSED, color: "bg-amber-500/20 text-amber-400 border-amber-500/30" },
        PENDING: { label: "Pendiente", color: "bg-amber-500/20 text-amber-400 border-amber-500/30" },
        ISSUE: { label: "Problema", color: "bg-red-500/20 text-red-400 border-red-500/30" },
        BLOCKED: { label: labels.providers.status.BLOCKED, color: "bg-red-500/20 text-red-400 border-red-500/30" }
    }

    const DEPENDENCY_CONFIG: Record<string, { label: string, color: string }> = {
        LOW: { label: labels.providers.dependency.LOW, color: "bg-gray-500/20 text-gray-400" },
        MEDIUM: { label: labels.providers.dependency.MEDIUM, color: "bg-blue-500/20 text-blue-400" },
        HIGH: { label: labels.providers.dependency.HIGH, color: "bg-red-500/20 text-red-400" },
        CRITICAL: { label: labels.providers.dependency.CRITICAL, color: "bg-red-600/30 text-red-500 border-red-500/30" }
    }

    const [orderDialogProvider, setOrderDialogProvider] = useState<Provider | null>(null)
    const [taskDialogProvider, setTaskDialogProvider] = useState<Provider | null>(null)
    const [noteDialogProvider, setNoteDialogProvider] = useState<Provider | null>(null)

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('es-ES', {
            style: 'currency',
            currency: 'EUR',
            minimumFractionDigits: 0,
            maximumFractionDigits: 0
        }).format(amount)
    }

    if (providers.length === 0) {
        return (
            <div className="rounded-xl border border-white/10 bg-white/5 p-12 text-center backdrop-blur">
                <Package className="h-12 w-12 mx-auto text-white/20 mb-4" />
                <p className="text-white/60 text-lg mb-2">{labels.providers.emptyState}</p>
                <p className="text-white/40 text-sm">
                    {labels.common.noResults}
                </p>
            </div>
        )
    }

    return (
        <>
            <div className="rounded-xl border border-white/10 bg-white/5 backdrop-blur overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead>
                            <tr className="border-b border-white/10">
                                <th className="text-left p-4 text-sm font-medium text-white/80">{labels.providers.singular}</th>
                                <th className="text-left p-4 text-sm font-medium text-white/80">{labels.providers.fields.monthlyCost}</th>
                                <th className="text-left p-4 text-sm font-medium text-white/80">{labels.providers.fields.status}</th>
                                <th className="text-left p-4 text-sm font-medium text-white/80">{labels.providers.fields.dependencyLevel}</th>
                                <th className="text-left p-4 text-sm font-medium text-white/80">Última acción</th>
                                <th className="text-right p-4 text-sm font-medium text-white/80">Acciones</th>
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
                                        className="border-b border-white/5 hover:bg-white/[0.08] transition-all duration-200 ease-out cursor-pointer group"
                                        onClick={() => onProviderClick(provider)}
                                    >
                                        {/* Provider Name */}
                                        <td className="p-4">
                                            <div className="flex items-center gap-3">
                                                <div className="h-10 w-10 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center">
                                                    <TypeIcon className="h-5 w-5 text-white/60" />
                                                </div>
                                                <div>
                                                    <p className="text-white font-semibold">{provider.name}</p>
                                                    <p className="text-xs text-white/40">
                                                        {TYPE_LABELS[provider.type as keyof typeof TYPE_LABELS]}
                                                    </p>
                                                </div>
                                            </div>
                                        </td>

                                        {/* Monthly Cost */}
                                        <td className="p-4">
                                            {provider.monthlyCost ? (
                                                <div>
                                                    <p className="text-white font-semibold">
                                                        {formatCurrency(provider.monthlyCost)}
                                                    </p>
                                                    <p className="text-xs text-white/40">
                                                        {formatCurrency(provider.monthlyCost * 12)}/año
                                                    </p>
                                                </div>
                                            ) : (
                                                <span className="text-white/40 text-sm">Sin definir</span>
                                            )}
                                        </td>

                                        {/* Status */}
                                        <td className="p-4">
                                            <Badge className={cn("text-xs", statusConfig.color)}>
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
                                            <span className="text-sm text-white/60">
                                                {formatDistanceToNow(new Date(provider.updatedAt), {
                                                    addSuffix: true,
                                                    locale: es
                                                })}
                                            </span>
                                        </td>

                                        {/* Quick Actions */}
                                        <td className="p-4" onClick={(e) => e.stopPropagation()}>
                                            <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                <Button
                                                    size="sm"
                                                    variant="ghost"
                                                    className="h-8 px-2 text-white/60 hover:text-white hover:bg-white/10"
                                                    title={labels.providers.actions.newOrder}
                                                    onClick={() => setOrderDialogProvider(provider)}
                                                >
                                                    <ShoppingBag className="h-4 w-4" />
                                                </Button>
                                                <Button
                                                    size="sm"
                                                    variant="ghost"
                                                    className="h-8 px-2 text-white/60 hover:text-white hover:bg-white/10"
                                                    title={labels.providers.actions.newTask}
                                                    onClick={() => setTaskDialogProvider(provider)}
                                                >
                                                    <CheckSquare className="h-4 w-4" />
                                                </Button>
                                                <Button
                                                    size="sm"
                                                    variant="ghost"
                                                    className="h-8 px-2 text-white/60 hover:text-white hover:bg-white/10"
                                                    title={labels.providers.actions.addNote}
                                                    onClick={() => setNoteDialogProvider(provider)}
                                                >
                                                    <MessageSquare className="h-4 w-4" />
                                                </Button>
                                                <Button
                                                    size="sm"
                                                    variant="ghost"
                                                    className="h-8 px-2 text-white/60 hover:text-white hover:bg-white/10"
                                                    onClick={() => onProviderClick(provider)}
                                                >
                                                    <ChevronRight className="h-4 w-4" />
                                                </Button>
                                            </div>
                                        </td>
                                    </tr>
                                )
                            })}
                        </tbody>
                    </table>
                </div>

                {/* Results count */}
                <div className="text-sm text-white/60 text-center p-4 border-t border-white/5">
                    Mostrando {providers.length} {providers.length !== 1 ? labels.providers.plural.toLowerCase() : labels.providers.singular.toLowerCase()}
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

            {noteDialogProvider && (
                <AddNoteDialog
                    providerId={noteDialogProvider.id}
                    providerName={noteDialogProvider.name}
                    open={!!noteDialogProvider}
                    onOpenChange={(open) => !open && setNoteDialogProvider(null)}
                    onSuccess={() => onProviderUpdate(noteDialogProvider.id, {})}
                />
            )}
        </>
    )
}

