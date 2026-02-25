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
}

const TYPE_ICONS = {
 SERVICE: Wrench,
 PRODUCT: Package,
 SOFTWARE: Code,
 OTHER: HelpCircle
}

function ProvidersTableComponent({ providers, onProviderClick, onProviderUpdate }: ProvidersTableProps) {
 const { labels } = useSectorConfig()

 const TYPE_LABELS = labels.providers.types
 const STATUS_CONFIG: Record<string, { label: string, color: string }> = {
 OK: { label: labels.providers.status.ACTIVE, color: "bg-green-500/20 text-green-400 border-green-500/30" },
 ACTIVE: { label: labels.providers.status.ACTIVE, color: "bg-green-500/20 text-green-400 border-green-500/30" },
 PAUSED: { label: labels.providers.status.PAUSED, color: "bg-[var(--bg-card)] text-[var(--text-secondary)] border-[var(--border-subtle)]" },
 PENDING: { label: "Pendiente", color: "bg-[var(--bg-card)] text-[var(--text-secondary)] border-[var(--border-subtle)]" },
 ISSUE: { label: "Problema", color: "bg-[var(--bg-card)] text-[var(--critical)] border-[var(--critical)]" },
 BLOCKED: { label: labels.providers.status.BLOCKED, color: "bg-[var(--bg-card)] text-[var(--critical)] border-[var(--critical)]" }
 }

 const DEPENDENCY_CONFIG: Record<string, { label: string, color: string }> = {
 LOW: { label: labels.providers.dependency.LOW, color: "bg-gray-500/20 text-[var(--text-secondary)]" },
 MEDIUM: { label: labels.providers.dependency.MEDIUM, color: "bg-[var(--bg-card)] text-[var(--accent)]" },
 HIGH: { label: labels.providers.dependency.HIGH, color: "bg-[var(--bg-card)] text-[var(--critical)]" },
 CRITICAL: { label: labels.providers.dependency.CRITICAL, color: "bg-[var(--bg-card)] text-[var(--critical)] border-[var(--critical)]" }
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

 if (providers.length === 0) {
 return (
 <div className="rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-card)] p-12 text-center backdrop-blur">
 <Package className="h-12 w-12 mx-auto text-[var(--text-secondary)] mb-4" />
 <p className="text-[var(--text-secondary)] text-lg mb-2">{labels.providers.emptyState}</p>
 <p className="text-[var(--text-secondary)] text-sm">
 {labels.common.noResults}
 </p>
 </div>
 )
 }

 return (
 <>
 <div className="rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-card)] backdrop-blur overflow-hidden">
 <div className="overflow-x-auto">
 <table className="w-full">
 <thead>
 <tr className="border-b border-[var(--border-subtle)]">
 <th className="text-left p-4 text-sm font-medium text-[var(--text-secondary)]">{labels.providers.singular}</th>
 <th className="text-left p-4 text-sm font-medium text-[var(--text-secondary)]">{labels.providers.fields.monthlyCost}</th>
 <th className="text-left p-4 text-sm font-medium text-[var(--text-secondary)]">{labels.providers.fields.status}</th>
 <th className="text-left p-4 text-sm font-medium text-[var(--text-secondary)]">{labels.providers.fields.dependencyLevel}</th>
 <th className="text-left p-4 text-sm font-medium text-[var(--text-secondary)]">Última acción</th>
 <th className="text-right p-4 text-sm font-medium text-[var(--text-secondary)]">Acciones</th>
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
 className="border-b border-[var(--border-subtle)] hover:bg-[var(--bg-card)]/[0.08] transition-all duration-200 ease-out cursor-pointer group"
 onClick={() => onProviderClick(provider)}
 >
 {/* Provider Name */}
 <td className="p-4">
 <div className="flex items-center gap-3">
 <div className="h-10 w-10 rounded-lg bg-[var(--bg-card)] border border-[var(--border-subtle)] flex items-center justify-center">
 <TypeIcon className="h-5 w-5 text-[var(--text-secondary)]" />
 </div>
 <div>
 <p className="text-[var(--text-primary)] font-semibold">{provider.name}</p>
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
 <p className="text-[var(--text-primary)] font-semibold">
 {formatCurrency(provider.monthlyCost)}
 </p>
 <p className="text-xs text-[var(--text-secondary)]">
 {formatCurrency(provider.monthlyCost * 12)}/año
 </p>
 </div>
 ) : (
 <span className="text-[var(--text-secondary)] text-sm">Sin definir</span>
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
 <span className="text-sm text-[var(--text-secondary)]">
 {formatDistanceToNow(new Date(provider.updatedAt), {
 addSuffix: true,
 locale: es
 })}
 </span>
 </td>

 {/* Acciones rápidas: siempre visibles, solo iconos con tooltips */}
 <td className="p-4" onClick={(e) => e.stopPropagation()}>
 <div className="flex items-center justify-end gap-1">
 <Button
 size="sm"
 variant="ghost"
 title={labels.providers.actions.newOrder}
 className="h-8 w-8 p-0 text-[var(--accent)] hover:text-[var(--accent)] hover:bg-[var(--bg-card)] border border-transparent hover:border-blue-500/20"
 onClick={(e) => { e.stopPropagation(); setOrderDialogProvider(provider) }}
 >
 <ShoppingBag className="h-4 w-4" />
 </Button>
 <Button
 size="sm"
 variant="ghost"
 title={labels.providers.actions.newTask}
 className="h-8 w-8 p-0 text-[var(--text-secondary)] hover:text-[var(--text-secondary)] hover:bg-[var(--bg-card)] border border-transparent hover:border-[var(--border-subtle)]"
 onClick={(e) => { e.stopPropagation(); setTaskDialogProvider(provider) }}
 >
 <CheckSquare className="h-4 w-4" />
 </Button>
 <Button
 size="sm"
 variant="ghost"
 title="Enviar email"
 className="h-8 w-8 p-0 text-green-400 hover:text-green-300 hover:bg-green-500/10 border border-transparent hover:border-green-500/20"
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

 {/* Results count */}
 <div className="text-sm text-[var(--text-secondary)] text-center p-4 border-t border-[var(--border-subtle)]">
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

 </>
 )
}

export const ProvidersTable = memo(ProvidersTableComponent)