"use client"

import { useState, useEffect, useOptimistic, useTransition } from "react"
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { X, Package, Wrench, Code, HelpCircle, Plus, MessageSquare, CreditCard, ShoppingBag, CheckCircle2, Circle, FileText, ExternalLink, Download, Eye, AlertTriangle, ShieldCheck, Activity, Target, ChevronDown, ChevronUp, Phone, Mail, Globe, Upload, Calendar, Clock, DollarSign } from "lucide-react"
import {
    getProviderOrders,
    getProviderTimeline,
    getProviderTasks,
    toggleProviderTaskStatus,
    addProviderNote,
    registerProviderFile,
    completeProviderOrder,
    cancelProviderOrder
} from "../actions"
import { format } from "date-fns"
import { es } from "date-fns/locale"
import { toast } from "sonner"

import { cn } from "@/lib/utils"
import { useSectorConfig } from "@/hooks/useSectorConfig"
import { usePanelConfig } from "@/core/panel-contract/usePanelConfig"
import { PROVIDER_PANEL_CONFIG } from "@/core/panel-contract/registry"

import { AddNoteDialog } from "./AddNoteDialog"
import { CreateTaskDialog } from "./CreateTaskDialog"
import { RegisterOrderDialog } from "./RegisterOrderDialog"
import { FilePreviewModal } from "./FilePreviewModal"
import { FileUploadDialog } from "./FileUploadDialog"

type Provider = {
    id: string
    name: string
    type: string | null
    monthlyCost: number | null
    status: string
    dependencyLevel: string
    operationalState: string
    isCritical: boolean
    affectedArea?: string | null
    lastOrderDate?: Date | null
    contactEmail?: string | null
    contactPhone?: string | null
    website?: string | null
    notes?: string | null
    createdAt: Date
    updatedAt: Date
}

type ProviderSidePanelProps = {
    provider: Provider
    open: boolean
    onClose: () => void
    onUpdate: (providerId: string, data: any) => void
}

type Task = {
    id: string
    title: string
    description?: string | null
    status: string
    priority: string
    dueDate?: Date | null
}

type Order = {
    id: string
    description?: string | null
    amount: number
    orderDate: Date
    status: string
    type: string
    payment?: {
        id: string
        amount: number
        paymentDate: Date
        concept?: string | null
    } | null
    files?: {
        id: string
        name: string
        url: string
        category: string
    }[]
}

const TYPE_ICONS = {
    SERVICE: Wrench,
    PRODUCT: Package,
    SOFTWARE: Code,
    OTHER: HelpCircle
}

const DEPENDENCY_CONFIG = {
    LOW: { label: "Baja", color: "bg-gray-500/20 text-gray-400" },
    MEDIUM: { label: "Media", color: "bg-blue-500/20 text-blue-400" },
    HIGH: { label: "Alta", color: "bg-red-500/20 text-red-400" },
    CRITICAL: { label: "Crítica", color: "bg-red-600/30 text-red-500 border-red-500/30" }
}

export function ProviderSidePanel({ provider, open, onClose, onUpdate }: ProviderSidePanelProps) {
    const { labels, features } = useSectorConfig()
    const panelConfig = usePanelConfig('provider')

    const STATUS_CONFIG: Record<string, { label: string, color: string }> = {
        OK: { label: labels.providers.status.ACTIVE, color: "bg-green-500/20 text-green-400 border-green-500/30" },
        ACTIVE: { label: labels.providers.status.ACTIVE, color: "bg-green-500/20 text-green-400 border-green-500/30" },
        PAUSED: { label: labels.providers.status.PAUSED, color: "bg-amber-500/20 text-amber-400 border-amber-500/30" },
        PENDING: { label: "Pendiente", color: "bg-amber-500/20 text-amber-400 border-amber-500/30" },
        ISSUE: { label: "Problema", color: "bg-red-500/20 text-red-500 border-red-500/30 font-bold" },
        BLOCKED: { label: labels.providers.status.BLOCKED, color: "bg-red-500/20 text-red-500 border-red-500/30 font-bold" }
    }

    const TypeIcon = TYPE_ICONS[provider.type as keyof typeof TYPE_ICONS] || HelpCircle
    const statusConfig = STATUS_CONFIG[provider.status as keyof typeof STATUS_CONFIG] || STATUS_CONFIG.OK
    const dependencyConfig = DEPENDENCY_CONFIG[provider.dependencyLevel as keyof typeof DEPENDENCY_CONFIG] || DEPENDENCY_CONFIG.LOW

    const [activeTab, setActiveTab] = useState<"summary" | "orders" | "tasks" | "timeline">("summary")
    const [timeline, setTimeline] = useState<any[]>([])
    const [orders, setOrders] = useState<Order[]>([])
    const [tasks, setTasks] = useState<Task[]>([])
    const [loadingTimeline, setLoadingTimeline] = useState(false)
    const [loadingOrders, setLoadingOrders] = useState(false)
    const [loadingTasks, setLoadingTasks] = useState(false)

    // Dialog States
    const [showOrderDialog, setShowOrderDialog] = useState(false)
    const [showTaskDialog, setShowTaskDialog] = useState(false)
    const [showNoteDialog, setShowNoteDialog] = useState(false)
    const [showFileDialog, setShowFileDialog] = useState(false)
    const [selectedFile, setSelectedFile] = useState<any | null>(null)
    const [fileUploadContext, setFileUploadContext] = useState<{ entityType: 'PROVIDER' | 'ORDER', entityId: string } | null>(null)

    // Expanded Order/Payment states
    const [expandedOrderId, setExpandedOrderId] = useState<string | null>(null)

    // Optimistic UI for tasks
    const [optimisticTasks, setOptimisticTasks] = useOptimistic(
        tasks,
        (state: Task[], { taskId, completed }: { taskId: string, completed: boolean }) => {
            return state.map(t =>
                t.id === taskId
                    ? { ...t, status: completed ? 'DONE' : 'PENDING' }
                    : t
            )
        }
    )
    const [isPending, startTransition] = useTransition()

    useEffect(() => {
        if (open && provider.id) {
            loadTimeline()
            loadOrders()
            loadTasks()
        }
    }, [open, provider.id])

    const loadTimeline = async () => {
        setLoadingTimeline(true)
        try {
            const tData = await getProviderTimeline(provider.id)
            setTimeline(tData)
        } catch (error) {
            console.error("Error loading timeline:", error)
        } finally {
            setLoadingTimeline(false)
        }
    }

    const loadOrders = async () => {
        setLoadingOrders(true)
        try {
            const oData = await getProviderOrders(provider.id)
            setOrders(oData.success && oData.orders ? oData.orders : [])
        } catch (error) {
            console.error("Error loading orders:", error)
        } finally {
            setLoadingOrders(false)
        }
    }

    const loadTasks = async () => {
        setLoadingTasks(true)
        try {
            const tsData = await getProviderTasks(provider.id)
            setTasks(tsData.success && tsData.tasks ? tsData.tasks : [])
        } catch (error) {
            console.error("Error loading tasks:", error)
        } finally {
            setLoadingTasks(false)
        }
    }

    const loadData = async () => {
        return Promise.all([loadTimeline(), loadOrders(), loadTasks()])
    }

    const handleToggleTask = async (taskId: string, completed: boolean) => {
        // Optimistic update
        startTransition(() => {
            setOptimisticTasks({ taskId, completed })
        })

        try {
            const res = await toggleProviderTaskStatus(taskId, completed)
            if (res.success && res.task) {
                // Replace state with actual server response for consistency
                setTasks(prev => prev.map(t =>
                    t.id === taskId
                        ? { ...t, status: res.task.status }
                        : t
                ))
                toast.success(completed ? "Tarea completada" : "Tarea reabierta")
                // Refresh timeline to show task status change
                loadTimeline()
                onUpdate(provider.id, {})
            } else {
                // Revert optimistic update on error by reloading from server
                await loadTasks()
                toast.error(res.error || "Error al actualizar tarea")
            }
        } catch (error) {
            // Revert on exception
            await loadTasks()
            toast.error("Error al actualizar tarea")
        }
    }

    const handleCompleteOrder = async (orderId: string, newStatus: "COMPLETED" | "RECEIVED" = "COMPLETED") => {
        try {
            const res = await completeProviderOrder(orderId, newStatus)
            if (res.success && res.order) {
                const statusLabel = newStatus === "RECEIVED" ? "Pedido marcado como recibido" : "Pedido marcado como completado"
                toast.success(statusLabel)
                // Update local state immediately with server response
                setOrders(prev => prev.map(o =>
                    o.id === orderId ? { ...o, status: res.order.status } : o
                ))
                loadTimeline()
                onUpdate(provider.id, {})
            } else {
                toast.error(res.error || "Error al actualizar pedido")
            }
        } catch (error) {
            toast.error("Error al actualizar pedido")
        }
    }

    const handleCancelOrder = async (orderId: string) => {
        try {
            const res = await cancelProviderOrder(orderId)
            if (res.success && res.order) {
                toast.success("Pedido cancelado")
                // Update local state immediately
                setOrders(prev => prev.map(o =>
                    o.id === orderId ? { ...o, status: res.order.status } : o
                ))
                loadTimeline()
                onUpdate(provider.id, {})
            } else {
                toast.error(res.error || "Error al cancelar pedido")
            }
        } catch (error) {
            toast.error("Error al cancelar pedido")
        }
    }

    const handleRegisterFile = async (fileData: { name: string, url: string, category: string }) => {
        if (!fileUploadContext) return

        const res = await registerProviderFile({
            providerId: provider.id,
            name: fileData.name,
            url: fileData.url,
            category: fileData.category as any,
            orderId: fileUploadContext.entityType === 'ORDER' ? fileUploadContext.entityId : undefined
        })

        if (res.success) {
            toast.success("Archivo registrado con éxito.")
            if (fileUploadContext.entityType === 'ORDER') {
                loadOrders()
            }
            loadTimeline()
            setShowFileDialog(false)
            setFileUploadContext(null)
        } else {
            toast.error(res.error || "Error al registrar el archivo.")
        }
    }

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('es-ES', {
            style: 'currency',
            currency: 'EUR',
            minimumFractionDigits: 0,
            maximumFractionDigits: 0
        }).format(amount)
    }

    const pendingTasksCount = optimisticTasks.filter(t => t.status !== 'DONE').length
    const pendingOrdersCount = orders.filter(o => o.status === 'PENDING').length
    const lastPayment = orders.find(o => o.payment)?.payment

    return (
        <>
            <Sheet open={open} onOpenChange={onClose}>
                <SheetContent
                    side="right"
                    className="w-full sm:max-w-2xl bg-zinc-950 border-l border-white/10 p-0 flex flex-col focus:outline-none"
                >
                    {/* Header */}
                    <SheetHeader className="z-10 bg-zinc-950 border-b border-white/10 p-6">
                        <div className="flex items-start justify-between">
                            <div className="flex items-start gap-4">
                                <div className="h-12 w-12 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center">
                                    <TypeIcon className="h-6 w-6 text-white/60" />
                                </div>
                                <div>
                                    <SheetTitle className="text-white text-xl">{provider.name}</SheetTitle>
                                    <div className="flex items-center gap-2 mt-2">
                                        <Badge className={cn("text-[10px] h-5", statusConfig.color)}>
                                            {statusConfig.label}
                                        </Badge>
                                        <Badge variant="outline" className={cn("text-[10px] h-5", dependencyConfig.color)}>
                                            Dep. {dependencyConfig.label}
                                        </Badge>
                                        {provider.isCritical && (
                                            <Badge className="text-[10px] h-5 bg-red-600/20 text-red-400 border-red-500/30">
                                                CRÍTICO
                                            </Badge>
                                        )}
                                    </div>
                                </div>
                            </div>
                            <Button
                                variant="ghost"
                                size="icon"
                                onClick={onClose}
                                className="text-white/60 hover:text-white hover:bg-white/10"
                            >
                                <X className="h-5 w-5" />
                            </Button>
                        </div>
                    </SheetHeader>

                    {/* Tabs */}
                    <div className="border-b border-white/10 px-6 bg-zinc-950">
                        <div className="flex gap-4">
                            {[
                                { id: "summary", label: "Resumen" },
                                { id: "orders", label: "Pedidos y Pagos" },
                                { id: "tasks", label: "Tareas" },
                                { id: "timeline", label: "Timeline" }
                            ].map((tab) => (
                                <button
                                    key={tab.id}
                                    onClick={() => setActiveTab(tab.id as any)}
                                    className={cn(
                                        "px-4 py-3 text-sm font-medium border-b-2 transition-colors",
                                        activeTab === tab.id
                                            ? "border-blue-500 text-white"
                                            : "border-transparent text-white/60 hover:text-white"
                                    )}
                                >
                                    {tab.label}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Scrollable Content */}
                    <div className="flex-1 overflow-y-auto custom-scrollbar">
                        {activeTab === "summary" && (
                            <div className="p-6 space-y-6">
                                {/* PROVIDER INFO SECTION - Now at the top */}
                                {(provider.contactEmail || provider.contactPhone || provider.website) && (
                                    <div className="rounded-lg border border-white/10 bg-white/5 p-4">
                                        <h3 className="text-sm font-medium text-white/60 mb-3">Contacto</h3>
                                        <div className="space-y-2">
                                            {provider.contactEmail && (
                                                <div className="flex items-center gap-2">
                                                    <Mail className="h-4 w-4 text-white/40" />
                                                    <a href={`mailto:${provider.contactEmail}`} className="text-white hover:text-blue-400 transition-colors">
                                                        {provider.contactEmail}
                                                    </a>
                                                </div>
                                            )}
                                            {provider.contactPhone && (
                                                <div className="flex items-center gap-2">
                                                    <Phone className="h-4 w-4 text-white/40" />
                                                    <a href={`tel:${provider.contactPhone}`} className="text-white hover:text-blue-400 transition-colors">
                                                        {provider.contactPhone}
                                                    </a>
                                                </div>
                                            )}
                                            {provider.website && (
                                                <div className="flex items-center gap-2">
                                                    <Globe className="h-4 w-4 text-white/40" />
                                                    <a
                                                        href={provider.website}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="text-blue-400 hover:underline flex items-center gap-1"
                                                    >
                                                        {provider.website}
                                                        <ExternalLink className="h-3 w-3" />
                                                    </a>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                )}

                                {/* Key Metrics - Dependency, Last Payment, Pending */}
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                                    <div className="bg-white/5 border border-white/10 rounded-lg p-3">
                                        <p className="text-[10px] text-white/40 uppercase mb-1">Dependencia</p>
                                        <p className={cn("text-lg font-bold",
                                            provider.dependencyLevel === 'HIGH' || provider.dependencyLevel === 'CRITICAL'
                                                ? "text-red-400"
                                                : provider.dependencyLevel === 'MEDIUM'
                                                    ? "text-blue-400"
                                                    : "text-white/60"
                                        )}>
                                            {dependencyConfig.label}
                                        </p>
                                    </div>
                                    <div className="bg-white/5 border border-white/10 rounded-lg p-3">
                                        <p className="text-[10px] text-white/40 uppercase mb-1">Último pago</p>
                                        <p className="text-sm font-semibold text-white truncate">
                                            {lastPayment
                                                ? format(new Date(lastPayment.paymentDate), 'dd/MM/yy', { locale: es })
                                                : 'Sin pagos'}
                                        </p>
                                    </div>
                                    <div className="bg-white/5 border border-white/10 rounded-lg p-3">
                                        <p className="text-[10px] text-white/40 uppercase mb-1">Pendientes</p>
                                        <p className={cn("text-lg font-bold",
                                            pendingOrdersCount > 0 ? "text-amber-400" : "text-green-400"
                                        )}>
                                            {pendingOrdersCount} pedidos
                                        </p>
                                    </div>
                                    <div className="bg-white/5 border border-white/10 rounded-lg p-3">
                                        <p className="text-[10px] text-white/40 uppercase mb-1">Tareas</p>
                                        <p className={cn("text-lg font-bold",
                                            pendingTasksCount > 0 ? "text-amber-400" : "text-green-400"
                                        )}>
                                            {pendingTasksCount} pendientes
                                        </p>
                                    </div>
                                </div>

                                {/* Quick Actions - Moved up */}
                                <div className="space-y-3">
                                    <h3 className="text-xs font-bold text-white/30 uppercase tracking-widest px-1">Acciones Rápidas</h3>
                                    <div className="grid grid-cols-2 gap-3">
                                        <Button
                                            onClick={() => setShowOrderDialog(true)}
                                            variant="outline"
                                            className="bg-white/5 border-white/10 text-white hover:bg-white/10 justify-start gap-2 h-12"
                                        >
                                            <ShoppingBag className="h-4 w-4 text-blue-400" />
                                            Nuevo Pedido
                                        </Button>
                                        <Button
                                            onClick={() => setShowTaskDialog(true)}
                                            variant="outline"
                                            className="bg-white/5 border-white/10 text-white hover:bg-white/10 justify-start gap-2 h-12"
                                        >
                                            <CheckCircle2 className="h-4 w-4 text-amber-400" />
                                            Nueva Tarea
                                        </Button>
                                        <Button
                                            onClick={() => setShowNoteDialog(true)}
                                            variant="outline"
                                            className="bg-white/5 border-white/10 text-white hover:bg-white/10 justify-start gap-2 h-12"
                                        >
                                            <MessageSquare className="h-4 w-4 text-purple-400" />
                                            Añadir Nota
                                        </Button>
                                        <Button
                                            onClick={() => {
                                                setFileUploadContext({ entityType: 'PROVIDER', entityId: provider.id })
                                                setShowFileDialog(true)
                                            }}
                                            variant="outline"
                                            className="bg-white/5 border-white/10 text-white hover:bg-white/10 justify-start gap-2 h-12"
                                        >
                                            <Upload className="h-4 w-4 text-green-400" />
                                            Subir Archivo
                                        </Button>
                                    </div>
                                </div>

                                {/* Cost Summary */}
                                <div className="rounded-lg border border-white/10 bg-white/5 p-4">
                                    <h3 className="text-sm font-medium text-white/60 mb-3">Costes</h3>
                                    <div className="space-y-2">
                                        <div className="flex justify-between items-center">
                                            <span className="text-white/60 text-sm">Mensual</span>
                                            <span className="text-white font-bold text-lg">
                                                {provider.monthlyCost ? formatCurrency(provider.monthlyCost) : "—"}
                                            </span>
                                        </div>
                                        {provider.monthlyCost && (
                                            <div className="flex justify-between items-center pt-2 border-t border-white/5">
                                                <span className="text-white/40 text-xs text-uppercase tracking-wider">ANUAL ESTIMADO</span>
                                                <span className="text-white/60 font-medium">
                                                    {formatCurrency(provider.monthlyCost * 12)}
                                                </span>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* Notes */}
                                {provider.notes && (
                                    <div className="rounded-lg border border-white/10 bg-white/5 p-4">
                                        <h3 className="text-sm font-medium text-white/60 mb-3">Notas maestras</h3>
                                        <p className="text-white/80 text-sm whitespace-pre-wrap">{provider.notes}</p>
                                    </div>
                                )}
                            </div>
                        )}

                        {activeTab === "orders" && (
                            <div className="p-6 space-y-4">
                                {loadingOrders ? (
                                    <div className="space-y-3">
                                        {[1, 2, 3].map(i => (
                                            <div key={i} className="h-[100px] w-full bg-white/5 border border-white/10 rounded-lg animate-pulse" />
                                        ))}
                                    </div>
                                ) : (
                                    <>
                                        <div className="flex justify-between items-center mb-4">
                                            <h3 className="text-white font-medium">Historial de Pedidos</h3>
                                        </div>
                                        {/* Action Buttons based on Contract */}
                                        <div className="flex flex-wrap gap-2 mb-6">
                                            {panelConfig.allowedActions.map(action => (
                                                <Button
                                                    key={action.id}
                                                    size="sm"
                                                    className={cn(
                                                        "bg-white/5 text-white border-white/10 hover:bg-white/10 flex-1",
                                                        action.critical ? "hover:border-red-500/50 hover:bg-red-500/10" : "hover:border-blue-500/50 hover:bg-blue-500/10"
                                                    )}
                                                    onClick={() => {
                                                        if (action.id === 'new-order') setShowOrderDialog(true)
                                                        if (action.id === 'new-task') setShowTaskDialog(true)
                                                        if (action.id === 'add-note') setShowNoteDialog(true)
                                                        if (action.id === 'upload-file') {
                                                            setFileUploadContext({ entityType: 'PROVIDER', entityId: provider.id })
                                                            setShowFileDialog(true)
                                                        }
                                                    }}
                                                >
                                                    {action.id === 'new-order' && <ShoppingBag className="h-4 w-4 mr-2" />}
                                                    {action.id === 'new-task' && <Plus className="h-4 w-4 mr-2" />}
                                                    {action.id === 'add-note' && <MessageSquare className="h-4 w-4 mr-2" />}
                                                    {action.id === 'upload-file' && <Plus className="h-4 w-4 mr-2" />}
                                                    {action.label}
                                                </Button>
                                            ))}
                                        </div>
                                        {orders.length === 0 ? (
                                            <div className="text-center py-12 text-white/20 border-2 border-dashed border-white/5 rounded-xl">
                                                <ShoppingBag className="h-12 w-12 mx-auto mb-3 opacity-20" />
                                                <p>No hay pedidos registrados</p>
                                            </div>
                                        ) : (
                                            <div className="space-y-3">
                                                {orders.map(order => (
                                                    <div
                                                        key={order.id}
                                                        className={cn(
                                                            "rounded-lg border bg-white/5 overflow-hidden transition-all",
                                                            expandedOrderId === order.id
                                                                ? "border-blue-500/30"
                                                                : "border-white/10 hover:border-white/20"
                                                        )}
                                                    >
                                                        {/* Order Header - Clickable */}
                                                        <button
                                                            onClick={() => setExpandedOrderId(expandedOrderId === order.id ? null : order.id)}
                                                            className="w-full p-4 text-left"
                                                        >
                                                            <div className="flex justify-between items-start">
                                                                <div className="flex-1">
                                                                    <span className="text-[10px] text-white/40 uppercase tracking-wider">
                                                                        {format(new Date(order.orderDate), 'PPP', { locale: es })}
                                                                    </span>
                                                                    <h4 className="text-white font-medium mt-0.5">{order.description || "Pedido sin descripción"}</h4>
                                                                </div>
                                                                <div className="text-right flex items-start gap-2">
                                                                    <div>
                                                                        <p className="text-white font-bold">{formatCurrency(order.amount)}</p>
                                                                        <Badge className={cn(
                                                                            "text-[10px] py-0 px-1.5",
                                                                            order.status === 'COMPLETED' ? "bg-green-500/20 text-green-400 border-green-500/30" :
                                                                                order.status === 'RECEIVED' ? "bg-blue-500/20 text-blue-400 border-blue-500/30" :
                                                                                    order.status === 'CANCELLED' ? "bg-red-500/20 text-red-400 border-red-500/30" :
                                                                                        "bg-amber-500/20 text-amber-400 border-amber-500/30"
                                                                        )}>
                                                                            {order.status === 'COMPLETED' ? 'PAGADO' :
                                                                                order.status === 'RECEIVED' ? 'RECIBIDO' :
                                                                                    order.status === 'CANCELLED' ? 'CANCELADO' : 'PENDIENTE'}
                                                                        </Badge>
                                                                    </div>
                                                                    {expandedOrderId === order.id
                                                                        ? <ChevronUp className="h-4 w-4 text-white/40" />
                                                                        : <ChevronDown className="h-4 w-4 text-white/40" />
                                                                    }
                                                                </div>
                                                            </div>
                                                        </button>

                                                        {/* Expanded Order Details */}
                                                        {expandedOrderId === order.id && (
                                                            <div className="px-4 pb-4 space-y-4 border-t border-white/5 pt-4">
                                                                {/* Order Info Grid */}
                                                                <div className="grid grid-cols-2 gap-3">
                                                                    <div className="bg-white/5 rounded-lg p-3">
                                                                        <p className="text-[10px] text-white/40 uppercase mb-1">Tipo</p>
                                                                        <p className="text-white text-sm">{order.type === 'RECURRING' ? 'Recurrente' : 'Puntual'}</p>
                                                                    </div>
                                                                    <div className="bg-white/5 rounded-lg p-3">
                                                                        <p className="text-[10px] text-white/40 uppercase mb-1">ID Pedido</p>
                                                                        <p className="text-white text-sm font-mono">{order.id.slice(-8).toUpperCase()}</p>
                                                                    </div>
                                                                </div>

                                                                {/* Payment Info */}
                                                                {order.payment && (
                                                                    <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-3">
                                                                        <div className="flex items-center gap-2 mb-2">
                                                                            <CreditCard className="h-4 w-4 text-green-400" />
                                                                            <span className="text-sm font-medium text-green-400">Pago vinculado</span>
                                                                        </div>
                                                                        <div className="grid grid-cols-2 gap-2 text-sm">
                                                                            <div>
                                                                                <p className="text-white/40 text-xs">Importe</p>
                                                                                <p className="text-white font-bold">{formatCurrency(order.payment.amount)}</p>
                                                                            </div>
                                                                            <div>
                                                                                <p className="text-white/40 text-xs">Fecha</p>
                                                                                <p className="text-white">{format(new Date(order.payment.paymentDate), 'dd/MM/yyyy', { locale: es })}</p>
                                                                            </div>
                                                                        </div>
                                                                    </div>
                                                                )}

                                                                {/* Files */}
                                                                <div className="space-y-2">
                                                                    <p className="text-[10px] text-white/40 uppercase tracking-wider">Archivos adjuntos</p>
                                                                    <div className="flex flex-wrap gap-2">
                                                                        {order.files && order.files.map((file) => (
                                                                            <button
                                                                                key={file.id}
                                                                                onClick={() => setSelectedFile(file)}
                                                                                className="flex items-center gap-2 bg-white/5 border border-white/10 rounded px-2 py-1 text-[10px] text-white/60 hover:text-white hover:border-white/30 transition-colors"
                                                                            >
                                                                                <FileText className="h-3 w-3" />
                                                                                {file.name}
                                                                            </button>
                                                                        ))}
                                                                        <button
                                                                            className="flex items-center gap-1 text-[10px] text-white/40 hover:text-white px-2 py-1 border border-dashed border-white/10 rounded"
                                                                            onClick={() => {
                                                                                setFileUploadContext({ entityType: 'ORDER', entityId: order.id })
                                                                                setShowFileDialog(true)
                                                                            }}
                                                                        >
                                                                            <Plus className="h-3 w-3" /> Subir factura
                                                                        </button>
                                                                    </div>
                                                                </div>

                                                                {/* Actions based on status */}
                                                                {order.status === 'PENDING' && (
                                                                    <div className="flex gap-2 pt-2">
                                                                        <Button
                                                                            onClick={() => handleCompleteOrder(order.id, "RECEIVED")}
                                                                            size="sm"
                                                                            className="flex-1 bg-blue-500/20 text-blue-400 border border-blue-500/30 hover:bg-blue-500/30"
                                                                        >
                                                                            <Package className="h-4 w-4 mr-2" />
                                                                            Marcar Recibido
                                                                        </Button>
                                                                        <Button
                                                                            onClick={() => handleCompleteOrder(order.id, "COMPLETED")}
                                                                            size="sm"
                                                                            className="flex-1 bg-green-500/20 text-green-400 border border-green-500/30 hover:bg-green-500/30"
                                                                        >
                                                                            <CheckCircle2 className="h-4 w-4 mr-2" />
                                                                            Marcar Pagado
                                                                        </Button>
                                                                        <Button
                                                                            onClick={() => handleCancelOrder(order.id)}
                                                                            size="sm"
                                                                            variant="outline"
                                                                            className="border-red-500/30 text-red-400 hover:bg-red-500/10"
                                                                        >
                                                                            <X className="h-4 w-4" />
                                                                        </Button>
                                                                    </div>
                                                                )}
                                                                {order.status === 'RECEIVED' && (
                                                                    <div className="flex gap-2 pt-2">
                                                                        <Button
                                                                            onClick={() => handleCompleteOrder(order.id, "COMPLETED")}
                                                                            size="sm"
                                                                            className="flex-1 bg-green-500/20 text-green-400 border border-green-500/30 hover:bg-green-500/30"
                                                                        >
                                                                            <CheckCircle2 className="h-4 w-4 mr-2" />
                                                                            Marcar Pagado
                                                                        </Button>
                                                                        <Button
                                                                            onClick={() => handleCancelOrder(order.id)}
                                                                            size="sm"
                                                                            variant="outline"
                                                                            className="border-red-500/30 text-red-400 hover:bg-red-500/10"
                                                                        >
                                                                            <X className="h-4 w-4 mr-2" />
                                                                            Cancelar
                                                                        </Button>
                                                                    </div>
                                                                )}
                                                            </div>
                                                        )}
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </>
                                )}
                            </div>
                        )}

                        {activeTab === "tasks" && (
                            <div className="p-6 space-y-4">
                                {loadingTasks ? (
                                    <div className="space-y-2">
                                        {[1, 2, 3, 4].map(i => (
                                            <div key={i} className="h-[60px] w-full bg-white/5 border border-white/10 rounded-lg animate-pulse" />
                                        ))}
                                    </div>
                                ) : (
                                    <>
                                        <div className="flex justify-between items-center mb-4">
                                            <h3 className="text-white font-medium">Tareas y Seguimiento</h3>
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                className="bg-white/5 text-white border-white/10 hover:bg-white/10"
                                                onClick={() => setShowTaskDialog(true)}
                                            >
                                                <Plus className="h-4 w-4 mr-2" /> Nueva Tarea
                                            </Button>
                                        </div>

                                        {optimisticTasks.length === 0 ? (
                                            <div className="text-center py-12 text-white/20 border-2 border-dashed border-white/5 rounded-xl">
                                                <CheckCircle2 className="h-12 w-12 mx-auto mb-3 opacity-20" />
                                                <p>No hay tareas registradas</p>
                                            </div>
                                        ) : (
                                            <div className="space-y-2">
                                                {optimisticTasks.map(task => (
                                                    <div
                                                        key={task.id}
                                                        className={cn(
                                                            "flex items-center gap-3 p-3 rounded-lg bg-white/5 border group transition-all",
                                                            task.status === 'DONE'
                                                                ? "border-green-500/20 bg-green-500/5"
                                                                : "border-white/10 hover:border-white/20"
                                                        )}
                                                    >
                                                        <button
                                                            onClick={() => handleToggleTask(task.id, task.status !== 'DONE')}
                                                            className="transition-all hover:scale-110"
                                                            disabled={isPending}
                                                        >
                                                            {task.status === 'DONE' ? (
                                                                <CheckCircle2 className="h-5 w-5 text-green-500 shadow-[0_0_8px_rgba(34,197,94,0.3)]" />
                                                            ) : (
                                                                <Circle className="h-5 w-5 text-white/20 hover:text-white/40" />
                                                            )}
                                                        </button>
                                                        <div className="flex-1 min-w-0">
                                                            <h4 className={cn(
                                                                "text-sm font-medium truncate transition-all",
                                                                task.status === 'DONE'
                                                                    ? "line-through text-white/30"
                                                                    : "text-white"
                                                            )}>
                                                                {task.title}
                                                            </h4>
                                                            <div className="flex items-center gap-2 mt-0.5">
                                                                {task.dueDate && (
                                                                    <p className="text-[10px] text-white/40">Vence: {format(new Date(task.dueDate), 'd MMM')}</p>
                                                                )}
                                                                <Badge variant="outline" className={cn(
                                                                    "text-[9px] py-0 px-1 leading-none h-4",
                                                                    task.priority === 'HIGH' ? "border-red-500/50 text-red-400" :
                                                                        task.priority === 'MEDIUM' ? "border-amber-500/50 text-amber-400" :
                                                                            "border-blue-500/50 text-blue-400"
                                                                )}>
                                                                    {task.priority}
                                                                </Badge>
                                                            </div>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </>
                                )}
                            </div>
                        )}

                        {activeTab === "timeline" && (
                            <div className="p-6 space-y-6">
                                {loadingTimeline ? (
                                    <div className="space-y-6 pl-6 border-l border-white/10 ml-3">
                                        {[1, 2, 3].map(i => (
                                            <div key={i} className="h-[80px] w-full bg-white/5 border border-white/10 rounded-lg animate-pulse" />
                                        ))}
                                    </div>
                                ) : (
                                    <>
                                        <div className="flex justify-between items-center mb-4">
                                            <h3 className="text-white font-medium">Timeline de Actividad</h3>
                                            <div className="flex gap-2">
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    className="text-white/40 hover:text-white text-xs"
                                                    onClick={() => setShowNoteDialog(true)}
                                                >
                                                    <MessageSquare className="h-3.5 w-3.5 mr-1" /> Nota
                                                </Button>
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    className="text-white/40 hover:text-white text-xs"
                                                    onClick={() => {
                                                        setFileUploadContext({ entityType: 'PROVIDER', entityId: provider.id })
                                                        setShowFileDialog(true)
                                                    }}
                                                >
                                                    <Plus className="h-3.5 w-3.5 mr-1" /> Archivo
                                                </Button>
                                            </div>
                                        </div>

                                        {timeline.length === 0 ? (
                                            <div className="text-center py-12 text-white/20 border-2 border-dashed border-white/5 rounded-xl">
                                                <MessageSquare className="h-12 w-12 mx-auto mb-3 opacity-20" />
                                                <p>Sin actividad reciente</p>
                                            </div>
                                        ) : (
                                            <div className="relative pl-6 space-y-6 border-l border-white/10 ml-3">
                                                {timeline.map((event, idx) => (
                                                    <div key={event.id} className="relative group/item">
                                                        {/* Line connection */}
                                                        <div className={cn(
                                                            "absolute -left-[31px] h-4 w-4 rounded-full border-2 bg-zinc-950 flex items-center justify-center z-10 transition-transform group-hover/item:scale-110",
                                                            event.type === 'ORDER' ? "border-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.5)]" :
                                                                event.type === 'PAYMENT' ? "border-green-500 shadow-[0_0_8px_rgba(34,197,94,0.5)]" :
                                                                    event.type === 'TASK' ? "border-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.5)]" :
                                                                        event.type === 'CONTACT_LOG' ? "border-purple-500 shadow-[0_0_8px_rgba(168,85,247,0.5)]" :
                                                                            event.type === 'NOTE' ? "border-indigo-500 shadow-[0_0_8px_rgba(99,102,241,0.5)]" :
                                                                                "border-white/20"
                                                        )}>
                                                            {event.type === 'ORDER' && <ShoppingBag className="h-2 w-2 text-blue-500" />}
                                                            {event.type === 'PAYMENT' && <CreditCard className="h-2 w-2 text-green-500" />}
                                                            {event.type === 'TASK' && <CheckCircle2 className="h-2 w-2 text-amber-500" />}
                                                            {event.type === 'NOTE' && <MessageSquare className="h-2 w-2 text-indigo-500" />}
                                                            {(event.type === 'FILE_ADDED' || event.type === 'FILE') && <FileText className="h-2 w-2 text-white/40" />}
                                                            {event.type === 'CONTACT_LOG' && <MessageSquare className="h-2 w-2 text-purple-500" />}
                                                        </div>

                                                        <div className={cn(
                                                            "bg-white/5 border border-white/10 rounded-lg p-3 hover:bg-white/[0.08] transition-all",
                                                            event.severity === 'success' ? "border-green-500/20" :
                                                                event.severity === 'warning' ? "border-amber-500/20" :
                                                                    event.severity === 'error' ? "border-red-500/20" :
                                                                        event.severity === 'info' ? "border-blue-500/20" : ""
                                                        )}>
                                                            <div className="flex justify-between items-start">
                                                                <div className="flex-1 min-w-0">
                                                                    <div className="flex items-center gap-2 mb-1">
                                                                        <h4 className="text-xs font-semibold text-white/90 truncate">{event.title}</h4>
                                                                        {event.statusLabel && (
                                                                            <Badge className={cn(
                                                                                "text-[10px] px-1 py-0 h-4 border-white/5",
                                                                                event.status === 'COMPLETED' ? "bg-green-500/20 text-green-400" :
                                                                                    event.status === 'RECEIVED' ? "bg-blue-500/20 text-blue-400" :
                                                                                        event.status === 'CANCELLED' ? "bg-red-500/20 text-red-400" :
                                                                                            "bg-amber-500/20 text-amber-400"
                                                                            )}>
                                                                                {event.statusLabel}
                                                                            </Badge>
                                                                        )}
                                                                        {event.type === 'TASK' && (
                                                                            <Badge className={cn(
                                                                                "text-[10px] px-1 py-0 h-4 border-white/5",
                                                                                event.status === 'DONE' ? "bg-green-500/20 text-green-400" : "bg-amber-500/20 text-amber-400"
                                                                            )}>
                                                                                {event.status === 'DONE' ? "Completada" : "Pendiente"}
                                                                            </Badge>
                                                                        )}
                                                                    </div>

                                                                    {/* NOTE: Show full content */}
                                                                    {event.type === 'NOTE' && event.content ? (
                                                                        <div className="bg-indigo-500/10 border border-indigo-500/20 rounded-md p-2 mt-2">
                                                                            <p className="text-sm text-white/80 whitespace-pre-wrap">{event.content}</p>
                                                                        </div>
                                                                    ) : (
                                                                        <p className="text-sm text-white/60 line-clamp-2">{event.description}</p>
                                                                    )}
                                                                </div>
                                                                <span className="text-[10px] text-white/30 whitespace-nowrap ml-4">
                                                                    {format(new Date(event.date), 'd MMM HH:mm', { locale: es })}
                                                                </span>
                                                            </div>

                                                            {/* Direct Actions */}
                                                            <div className="mt-3 pt-2 border-t border-white/5 flex flex-wrap gap-2">
                                                                {event.type === 'ORDER' && event.status === 'PENDING' && (
                                                                    <>
                                                                        <Button
                                                                            onClick={async () => {
                                                                                const res = await completeProviderOrder(event.entityId, "COMPLETED")
                                                                                if (res.success) {
                                                                                    toast.success("Pedido completado")
                                                                                    loadTimeline()
                                                                                    loadOrders()
                                                                                }
                                                                            }}
                                                                            size="sm"
                                                                            variant="outline"
                                                                            className="h-7 px-2 text-[10px] border-green-500/30 text-green-400 hover:bg-green-500/10"
                                                                        >
                                                                            <CheckCircle2 className="h-3 w-3 mr-1" /> Completar
                                                                        </Button>
                                                                        <Button
                                                                            onClick={async () => {
                                                                                const res = await cancelProviderOrder(event.entityId)
                                                                                if (res.success) {
                                                                                    toast.success("Pedido cancelado")
                                                                                    loadTimeline()
                                                                                    loadOrders()
                                                                                }
                                                                            }}
                                                                            size="sm"
                                                                            variant="outline"
                                                                            className="h-7 px-2 text-[10px] border-red-500/30 text-red-400 hover:bg-red-500/10"
                                                                        >
                                                                            <X className="h-3 w-3 mr-1" /> Cancelar
                                                                        </Button>
                                                                    </>
                                                                )}

                                                                {event.type === 'TASK' && (
                                                                    <Button
                                                                        onClick={async () => {
                                                                            const res = await toggleProviderTaskStatus(event.entityId, event.status !== 'DONE')
                                                                            if (res.success) {
                                                                                toast.success(event.status === 'DONE' ? "Tarea reabierta" : "Tarea completada")
                                                                                loadTimeline()
                                                                                loadTasks()
                                                                            }
                                                                        }}
                                                                        size="sm"
                                                                        variant="outline"
                                                                        className={cn(
                                                                            "h-7 px-2 text-[10px]",
                                                                            event.status === 'DONE' ? "border-white/20 text-white/60" : "border-blue-500/30 text-blue-400 hover:bg-blue-500/10"
                                                                        )}
                                                                    >
                                                                        {event.status === 'DONE' ? <Circle className="h-3 w-3 mr-1" /> : <CheckCircle2 className="h-3 w-3 mr-1" />}
                                                                        {event.status === 'DONE' ? "Reabrir" : "Completar"}
                                                                    </Button>
                                                                )}

                                                                {(event.type === 'FILE_ADDED' || event.type === 'FILE') && (
                                                                    <>
                                                                        <Button
                                                                            onClick={() => setSelectedFile({ id: event.entityId, name: event.title, url: event.url, category: 'ARCHIVO' })}
                                                                            size="sm"
                                                                            variant="outline"
                                                                            className="h-7 px-2 text-[10px] border-blue-500/30 text-blue-400 hover:bg-blue-500/10"
                                                                        >
                                                                            <Eye className="h-3 w-3 mr-1" /> Previsualizar
                                                                        </Button>
                                                                        <a
                                                                            href={event.url}
                                                                            download
                                                                            className="inline-flex items-center justify-center rounded-md text-xs font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 border border-white/10 bg-transparent shadow-sm hover:bg-accent hover:text-accent-foreground h-7 px-2 text-[10px] text-white/40 hover:text-white"
                                                                        >
                                                                            <Download className="h-3 w-3 mr-1" /> Descargar
                                                                        </a>
                                                                    </>
                                                                )}

                                                                {(event.type === 'ORDER' || event.type === 'PAYMENT' || event.type === 'TASK') && (
                                                                    <Button
                                                                        onClick={() => {
                                                                            if (event.type === 'ORDER' || event.type === 'PAYMENT') setActiveTab('orders')
                                                                            if (event.type === 'TASK') setActiveTab('tasks')
                                                                        }}
                                                                        size="sm"
                                                                        variant="ghost"
                                                                        className="h-7 px-2 text-[10px] text-white/20 hover:text-white ml-auto"
                                                                    >
                                                                        <ExternalLink className="h-3 w-3 mr-1" /> Detalle
                                                                    </Button>
                                                                )}
                                                            </div>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </>
                                )}
                            </div>
                        )}
                    </div>
                </SheetContent>
            </Sheet>

            {/* Dialogs */}
            <RegisterOrderDialog
                open={showOrderDialog}
                onOpenChange={setShowOrderDialog}
                providerId={provider.id}
                providerName={provider.name}
                onSuccess={loadData}
            />

            <CreateTaskDialog
                open={showTaskDialog}
                onOpenChange={setShowTaskDialog}
                providerId={provider.id}
                providerName={provider.name}
                onSuccess={loadData}
            />

            <AddNoteDialog
                open={showNoteDialog}
                onOpenChange={setShowNoteDialog}
                providerId={provider.id}
                providerName={provider.name}
                onSuccess={loadData}
            />

            <FileUploadDialog
                open={showFileDialog}
                onOpenChange={setShowFileDialog}
                onSuccess={handleRegisterFile}
                providerId={provider.id}
                entityType={fileUploadContext?.entityType || 'PROVIDER'}
                entityId={fileUploadContext?.entityId || provider.id}
            />

            <FilePreviewModal
                open={!!selectedFile}
                onOpenChange={(open) => !open && setSelectedFile(null)}
                file={selectedFile}
            />
        </>
    )
}
