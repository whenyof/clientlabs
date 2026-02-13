"use client"

import { useState, useEffect, useOptimistic, useTransition } from "react"
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { X, Package, Wrench, Code, HelpCircle, Plus, MessageSquare, CreditCard, ShoppingBag, CheckCircle2, Circle, FileText, ExternalLink, Download, Eye, AlertTriangle, ShieldCheck, Activity, Target, ChevronDown, ChevronUp, Phone, Mail, Globe, Upload, Calendar, Clock, DollarSign, Trash2 } from "lucide-react"
import {
    getProviderOrders,
    getProviderTimeline,
    getProviderTasks,
    getProviderFiles,
    toggleProviderTaskStatus,
    addProviderNote,
    registerProviderFile,
    registerProviderPayment,
    completeProviderOrder,
    cancelProviderOrder,
    getProviderAlertsAction,
    updateProvider,
    deleteProviderFile
} from "../actions"
import { format } from "date-fns"
import { es } from "date-fns/locale"
import { toast } from "sonner"

import { cn } from "@/lib/utils"
import { useSectorConfig } from "@/hooks/useSectorConfig"

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import {
    AlertDialog,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
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
    hasAlternative?: boolean
    createdAt: Date
    updatedAt: Date
}

type ProviderSidePanelProps = {
    provider: Provider | null
    open: boolean
    onClose: () => void
    onUpdate: (providerId: string, data: any) => void
    initialTab?: "summary" | "orders" | "tasks" | "timeline" | "payments" | "files" | "automations"
    initialDialog?: "payment" | "note" | "task" | "order"
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
    invoice?: { id: string; number: string; status: string; total?: unknown } | null
    files?: {
        id: string
        name: string
        url: string
        category: string
        createdAt?: Date
    }[]
}

const TYPE_ICONS = {
    SERVICE: Wrench,
    PRODUCT: Package,
    SOFTWARE: Code,
    OTHER: HelpCircle
}

export function ProviderSidePanel({ provider, open, onClose, onUpdate, initialTab, initialDialog }: ProviderSidePanelProps) {
    const { labels } = useSectorConfig()
    if (!provider) return null

    const STATUS_CONFIG = {
        OK: { label: labels.providers.status.ACTIVE, color: "bg-green-500/20 text-green-400 border-green-500/30" },
        ACTIVE: { label: labels.providers.status.ACTIVE, color: "bg-green-500/20 text-green-400 border-green-500/30" },
        PENDING: { label: labels.providers.status.PENDING, color: "bg-amber-500/20 text-amber-400 border-amber-500/30" },
        ISSUE: { label: "Incidencia", color: "bg-red-500/20 text-red-400 border-red-500/30" },
        PAUSED: { label: labels.providers.status.PAUSED, color: "bg-gray-500/20 text-gray-400 border-white/10" },
        BLOCKED: { label: labels.providers.status.BLOCKED, color: "bg-red-500/20 text-red-500 border-red-500/30 font-bold" }
    }

    const DEPENDENCY_CONFIG = {
        LOW: { label: labels.providers.dependency.LOW, color: "text-green-400 bg-green-500/10 border-green-500/20" },
        MEDIUM: { label: labels.providers.dependency.MEDIUM, color: "text-blue-400 bg-blue-500/10 border-blue-500/20" },
        HIGH: { label: labels.providers.dependency.HIGH, color: "text-orange-400 bg-orange-500/10 border-orange-500/20" },
        CRITICAL: { label: labels.providers.dependency.CRITICAL, color: "text-red-400 bg-red-500/10 border-red-500/20" }
    }

    const OPERATIONAL_STATE_CONFIG = {
        STABLE: { label: "Estable", color: "bg-green-500/20 text-green-400" },
        ATTENTION: { label: "Atención", color: "bg-amber-500/20 text-amber-400" },
        RISK: { label: "Crítico", color: "bg-red-500/20 text-red-400" }
    }

    const TypeIcon = TYPE_ICONS[provider.type as keyof typeof TYPE_ICONS] || HelpCircle
    const statusConfig = STATUS_CONFIG[provider.status as keyof typeof STATUS_CONFIG] || STATUS_CONFIG.OK
    const dependencyConfig = DEPENDENCY_CONFIG[provider.dependencyLevel as keyof typeof DEPENDENCY_CONFIG] || DEPENDENCY_CONFIG.LOW

    // Map initialTab if needed
    const mappedTab = initialTab === 'payments' ? 'orders' :
        initialTab === 'files' ? 'files' :
        initialTab === 'automations' ? 'summary' :
            initialTab

    const [activeTab, setActiveTab] = useState<"summary" | "orders" | "tasks" | "timeline" | "files">(mappedTab || "summary")
    const [timeline, setTimeline] = useState<any[]>([])
    const [orders, setOrders] = useState<Order[]>([])
    const [tasks, setTasks] = useState<Task[]>([])
    const [filesData, setFilesData] = useState<{ grouped: { orders: any[], payments: any[], general: any[] } }>({ grouped: { orders: [], payments: [], general: [] } })
    const [loadingTimeline, setLoadingTimeline] = useState(false)
    const [loadingOrders, setLoadingOrders] = useState(false)
    const [loadingTasks, setLoadingTasks] = useState(false)
    const [loadingFiles, setLoadingFiles] = useState(false)
    const [providerInvoices, setProviderInvoices] = useState<Array<{ id: string; number: string; total: number; status: string }>>([])
    const [loadingProviderInvoices, setLoadingProviderInvoices] = useState(false)
    const [insights, setInsights] = useState<any>(null)
    const [loadingInsights, setLoadingInsights] = useState(false)
    const [isEditing, setIsEditing] = useState(false)

    // Dialog States
    const [showOrderDialog, setShowOrderDialog] = useState(false)
    const [showTaskDialog, setShowTaskDialog] = useState(false)
    const [showNoteDialog, setShowNoteDialog] = useState(false)
    const [showFileDialog, setShowFileDialog] = useState(false)
    const [selectedFile, setSelectedFile] = useState<any | null>(null)
    const [fileToDelete, setFileToDelete] = useState<{ id: string; name: string } | null>(null)
    const [fileUploadContext, setFileUploadContext] = useState<{ entityType: 'PROVIDER' | 'ORDER' | 'PAYMENT', entityId: string, presetCategory?: 'INVOICE' | 'ORDER' } | null>(null)

    // Expanded Order/Payment states
    const [expandedOrderId, setExpandedOrderId] = useState<string | null>(null)
    // Registrar pago: order para el que se abre el diálogo
    const [orderForPayment, setOrderForPayment] = useState<Order | null>(null)
    const [paymentForm, setPaymentForm] = useState({ amount: 0, paymentDate: format(new Date(), "yyyy-MM-dd"), concept: "" })
    const [paymentSubmitting, setPaymentSubmitting] = useState(false)
    // Note modal (timeline click → full content)
    const [selectedNoteContent, setSelectedNoteContent] = useState<string | null>(null)
    // Collapsible file groups (order/payment ids)
    const [collapsedFileGroups, setCollapsedFileGroups] = useState<Record<string, boolean>>({})

    // Sync active tab with initialTab prop
    useEffect(() => {
        if (initialTab) {
            const tab = initialTab === 'payments' ? 'orders' :
                initialTab === 'files' ? 'files' :
                initialTab === 'automations' ? 'summary' :
                    initialTab;
            setActiveTab(tab as any);
        }
    }, [initialTab])

    // Handle initial dialogs
    useEffect(() => {
        if (open && initialDialog) {
            if (initialDialog === 'order') setShowOrderDialog(true)
            if (initialDialog === 'task') setShowTaskDialog(true)
            if (initialDialog === 'note') setShowNoteDialog(true)
            // 'payment' triggers orders tab usually or special dialog
            if (initialDialog === 'payment') {
                setActiveTab('orders')
                setShowOrderDialog(true) // For now, or a special payment dialog if we had one
            }
        }
    }, [open, initialDialog])

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

    const loadProviderInvoices = async () => {
        if (!provider?.id) return
        setLoadingProviderInvoices(true)
        try {
            const res = await fetch(`/api/billing?providerId=${encodeURIComponent(provider.id)}`, { credentials: "include" })
            const data = await res.json().catch(() => ({}))
            const list = Array.isArray(data.invoices) ? data.invoices : []
            setProviderInvoices(list.map((inv: any) => ({ id: inv.id, number: inv.number ?? inv.id, total: Number(inv.total ?? 0), status: inv.status ?? "" })))
        } catch {
            setProviderInvoices([])
        } finally {
            setLoadingProviderInvoices(false)
        }
    }

    useEffect(() => {
        if (open && provider.id) {
            loadTimeline()
            loadOrders()
            loadTasks()
            loadFiles()
            loadInsights()
            loadProviderInvoices()
        }
    }, [open, provider.id])

    const loadInsights = async () => {
        setLoadingInsights(true)
        try {
            const res = await getProviderAlertsAction(provider.id)
            if (res.success) {
                setInsights(res)
            }
        } catch (error) {
            console.error("Error loading insights:", error)
        } finally {
            setLoadingInsights(false)
        }
    }

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

    const loadFiles = async () => {
        setLoadingFiles(true)
        try {
            const fData = await getProviderFiles(provider.id)
            if (fData.success) {
                setFilesData({ grouped: fData.grouped })
            }
        } catch (error) {
            console.error("Error loading files:", error)
        } finally {
            setLoadingFiles(false)
        }
    }

    const loadData = async () => {
        return Promise.all([loadTimeline(), loadOrders(), loadTasks(), loadFiles()])
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

    const handleCompleteOrder = async (orderId: string, newStatus?: "COMPLETED" | "RECEIVED") => {
        try {
            const res = await completeProviderOrder(orderId, newStatus ?? "COMPLETED")
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

    const handleOpenRegisterPayment = (order: Order) => {
        setOrderForPayment(order)
        setPaymentForm({
            amount: order.amount,
            paymentDate: format(new Date(), "yyyy-MM-dd"),
            concept: order.description || ""
        })
    }

    const handleRegisterPaymentSubmit = async (e: React.FormEvent) => {
        if (!orderForPayment) return
        e.preventDefault()
        setPaymentSubmitting(true)
        try {
            const res = await registerProviderPayment({
                providerId: provider.id,
                orderId: orderForPayment.id,
                amount: paymentForm.amount,
                paymentDate: new Date(paymentForm.paymentDate),
                concept: paymentForm.concept || undefined,
                status: "PAID"
            })
            if (res.success) {
                toast.success("Pago registrado. Pedido actualizado.")
                setOrderForPayment(null)
                loadOrders()
                loadTimeline()
                onUpdate(provider.id, {})
            } else {
                toast.error(res.error || "Error al registrar pago")
            }
        } catch (error) {
            toast.error("Error al registrar pago")
        } finally {
            setPaymentSubmitting(false)
        }
    }

    const handleRegisterFile = async (fileData: { name: string, url: string, category: string } | { name: string, url: string, category: string }[]) => {
        if (!fileUploadContext) return

        const items = Array.isArray(fileData) ? fileData : [fileData]
        let allOk = true
        for (const item of items) {
            const res = await registerProviderFile({
                providerId: provider.id,
                name: item.name,
                url: item.url,
                category: item.category as any,
                orderId: fileUploadContext.entityType === 'ORDER' ? fileUploadContext.entityId : undefined,
                paymentId: fileUploadContext.entityType === 'PAYMENT' ? fileUploadContext.entityId : undefined,
            })
            if (!res.success) {
                toast.error(res.error || "Error al registrar el archivo.")
                allOk = false
            }
        }
        if (allOk) {
            loadOrders()
            loadTimeline()
            loadFiles()
            loadProviderInvoices()
            setShowFileDialog(false)
            setFileUploadContext(null)
        }
    }

    const handleDeleteFile = async (fileId: string) => {
        const res = await deleteProviderFile(fileId)
        if (res.success) {
            loadOrders()
            loadTimeline()
            loadFiles()
            setFileToDelete(null)
            if (selectedFile?.id === fileId) setSelectedFile(null)
            toast.success("Archivo eliminado")
        } else {
            toast.error(res.error || "Error al eliminar")
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

    const fileCategoryLabel = (cat: string) =>
        cat === "INVOICE" ? "Factura" : cat === "ORDER" ? "Albarán" : cat === "CONTRACT" ? "Contrato" : "Recibo u otros"

    const pendingTasksCount = optimisticTasks.filter(t => t.status !== 'DONE').length
    const pendingOrdersCount = orders.filter(o => o.status === 'PENDING').length

    // Find last payment more reliably
    const lastPayment = [...orders]
        .filter(o => o.payment)
        .sort((a, b) => new Date(b.orderDate).getTime() - new Date(a.orderDate).getTime())[0]?.payment

    const getSuggestedAction = () => {
        if (pendingOrdersCount > 0) {
            return {
                label: `Gestionar ${pendingOrdersCount} ${labels.orders.plural.toLowerCase()}`,
                onClick: () => setActiveTab('orders'),
                message: `Tienes ${pendingOrdersCount} ${labels.orders.plural.toLowerCase()} pendientes de recepción o pago.`
            }
        }
        if (pendingTasksCount > 0) {
            return {
                label: `Revisar ${pendingTasksCount} tareas`,
                onClick: () => setActiveTab('tasks'),
                message: `Hay ${pendingTasksCount} tareas de seguimiento que requieren tu atención.`
            }
        }
        return {
            label: "Registrar nuevo pedido",
            onClick: () => setShowOrderDialog(true),
            message: "La operativa está al día. ¿Necesitas reponer stock?"
        }
    }

    const suggestedAction = getSuggestedAction()

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
                                { id: "orders", label: labels.orders.title + " y Pagos" },
                                { id: "files", label: "Archivos" },
                                { id: "tasks", label: labels.nav.tasks },
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
                        {activeTab === "summary" && (() => {
                            // ── Compute all metrics from real data ──
                            const totalSpent = orders.reduce((sum, o) => {
                                if (o.payment) return sum + o.payment.amount
                                return sum
                            }, 0)
                            const lastOrder = orders.length > 0
                                ? orders.reduce((latest, o) => new Date(o.orderDate) > new Date(latest.orderDate) ? o : latest)
                                : null
                            const daysSinceLastOrder = lastOrder
                                ? Math.floor((Date.now() - new Date(lastOrder.orderDate).getTime()) / (1000 * 60 * 60 * 24))
                                : null
                            const issueOrders = orders.filter(o => o.status === 'ISSUE').length

                            // Operational health: green / yellow / red
                            const healthScore = (() => {
                                if (provider.operationalState === 'RISK' || issueOrders > 0) return 'red'
                                if (provider.operationalState === 'ATTENTION' || pendingOrdersCount > 2 || pendingTasksCount > 3) return 'yellow'
                                return 'green'
                            })()
                            const healthConfig = {
                                green: { label: 'Operativo', color: 'bg-green-500', text: 'text-green-400', bg: 'bg-green-500/10 border-green-500/20' },
                                yellow: { label: 'Atención', color: 'bg-amber-500', text: 'text-amber-400', bg: 'bg-amber-500/10 border-amber-500/20' },
                                red: { label: 'Riesgo', color: 'bg-red-500', text: 'text-red-400', bg: 'bg-red-500/10 border-red-500/20' },
                            }[healthScore]

                            // ── Runtime alerts engine ──
                            // Calculated from loaded data, no persistence, auto-resolve
                            type RuntimeAlert = { id: string; severity: 'warning' | 'error'; message: string; action?: { label: string; onClick: () => void } }
                            const runtimeAlerts: RuntimeAlert[] = []

                            // 1. Pending orders > 7 days
                            for (const o of orders) {
                                if (o.status !== 'PENDING') continue
                                const days = Math.floor((Date.now() - new Date(o.orderDate).getTime()) / (1000 * 60 * 60 * 24))
                                if (days >= 7) {
                                    runtimeAlerts.push({
                                        id: `order-stale-${o.id}`,
                                        severity: days >= 14 ? 'error' : 'warning',
                                        message: `Pedido pendiente desde hace ${days} días${o.description ? ` (${o.description})` : ''}`,
                                        action: { label: 'Ver pedido', onClick: () => { setActiveTab('orders'); setExpandedOrderId(o.id) } }
                                    })
                                }
                            }

                            // 2. Orders with ISSUE status
                            for (const o of orders) {
                                if (o.status !== 'ISSUE') continue
                                runtimeAlerts.push({
                                    id: `order-issue-${o.id}`,
                                    severity: 'error',
                                    message: `Pedido con incidencia${o.description ? `: ${o.description}` : ''}`,
                                    action: { label: 'Resolver', onClick: () => { setActiveTab('orders'); setExpandedOrderId(o.id) } }
                                })
                            }

                            // 3. Received orders without payment (> 5 days)
                            for (const o of orders) {
                                if (o.status !== 'RECEIVED' || o.payment) continue
                                const days = Math.floor((Date.now() - new Date(o.orderDate).getTime()) / (1000 * 60 * 60 * 24))
                                if (days >= 5) {
                                    runtimeAlerts.push({
                                        id: `order-nopay-${o.id}`,
                                        severity: 'warning',
                                        message: `Pedido recibido hace ${days} días sin pago registrado`,
                                        action: { label: 'Ver pedido', onClick: () => { setActiveTab('orders'); setExpandedOrderId(o.id) } }
                                    })
                                }
                            }

                            // 4. Critical provider without activity (> 30 days)
                            if ((provider.dependencyLevel === 'CRITICAL' || provider.dependencyLevel === 'HIGH') && daysSinceLastOrder !== null && daysSinceLastOrder > 30) {
                                runtimeAlerts.push({
                                    id: 'critical-inactive',
                                    severity: 'warning',
                                    message: `Proveedor ${provider.dependencyLevel === 'CRITICAL' ? 'crítico' : 'de alta dependencia'} sin pedidos desde hace ${daysSinceLastOrder} días`,
                                    action: { label: 'Nuevo pedido', onClick: () => setShowOrderDialog(true) }
                                })
                            }

                            // 5. Critical provider without contingency plan
                            if ((provider.dependencyLevel === 'CRITICAL' || provider.dependencyLevel === 'HIGH') && !provider.hasAlternative) {
                                runtimeAlerts.push({
                                    id: 'no-contingency',
                                    severity: provider.dependencyLevel === 'CRITICAL' ? 'error' : 'warning',
                                    message: `Sin plan de contingencia para proveedor ${provider.dependencyLevel === 'CRITICAL' ? 'crítico' : 'de alta dependencia'}`,
                                })
                            }

                            // 6. Overdue tasks
                            const overdueTasks = optimisticTasks.filter(t => t.status !== 'DONE' && t.dueDate && new Date(t.dueDate) < new Date())
                            if (overdueTasks.length > 0) {
                                runtimeAlerts.push({
                                    id: 'overdue-tasks',
                                    severity: 'warning',
                                    message: `${overdueTasks.length} tarea${overdueTasks.length > 1 ? 's' : ''} vencida${overdueTasks.length > 1 ? 's' : ''}`,
                                    action: { label: 'Ver tareas', onClick: () => setActiveTab('tasks') }
                                })
                            }

                            // 7. Monthly cost anomaly: if total paid this month > 2x monthlyCost
                            if (provider.monthlyCost && provider.monthlyCost > 0) {
                                const now = new Date()
                                const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)
                                const paidThisMonth = orders
                                    .filter(o => o.payment && new Date(o.payment.paymentDate) >= startOfMonth)
                                    .reduce((sum, o) => sum + (o.payment?.amount ?? 0), 0)
                                if (paidThisMonth > provider.monthlyCost * 2) {
                                    runtimeAlerts.push({
                                        id: 'cost-anomaly',
                                        severity: 'warning',
                                        message: `Gasto este mes (${formatCurrency(paidThisMonth)}) supera el doble del coste mensual estimado (${formatCurrency(provider.monthlyCost)})`,
                                        action: { label: 'Ver pedidos', onClick: () => setActiveTab('orders') }
                                    })
                                }
                            }

                            // Sort: errors first, then warnings
                            runtimeAlerts.sort((a, b) => (a.severity === 'error' ? 0 : 1) - (b.severity === 'error' ? 0 : 1))

                            return (
                            <div className="p-6 space-y-6">

                                {/* ═══════════ EXECUTIVE SUMMARY ═══════════ */}
                                <div className={cn("rounded-xl border p-4", healthConfig.bg)}>
                                    {/* Health indicator + cost */}
                                    <div className="flex items-center justify-between mb-4">
                                        <div className="flex items-center gap-2.5">
                                            <div className={cn("h-2.5 w-2.5 rounded-full shadow-[0_0_8px]", healthConfig.color,
                                                healthScore === 'green' ? "shadow-green-500/40" :
                                                healthScore === 'yellow' ? "shadow-amber-500/40 animate-pulse" :
                                                "shadow-red-500/40 animate-pulse"
                                            )} />
                                            <span className={cn("text-xs font-bold uppercase tracking-widest", healthConfig.text)}>
                                                {healthConfig.label}
                                            </span>
                                            {runtimeAlerts.length > 0 && (
                                                <Badge className={cn(
                                                    "text-[9px] px-1.5 py-0 h-4 border-0 ml-1",
                                                    runtimeAlerts.some(a => a.severity === 'error')
                                                        ? "bg-red-500/20 text-red-400"
                                                        : "bg-amber-500/20 text-amber-400"
                                                )}>
                                                    {runtimeAlerts.length} alerta{runtimeAlerts.length > 1 ? 's' : ''}
                                                </Badge>
                                            )}
                                        </div>
                                        <div className="text-right">
                                            <p className="text-white font-bold text-lg leading-none">
                                                {provider.monthlyCost ? formatCurrency(provider.monthlyCost) : "—"}
                                            </p>
                                            <p className="text-[10px] text-white/30 mt-0.5">coste / mes</p>
                                        </div>
                                    </div>

                                    {/* 6 KPI pills */}
                                    <div className="grid grid-cols-3 gap-2">
                                        {/* Dependency */}
                                        <div className="bg-black/20 rounded-lg px-3 py-2">
                                            <p className="text-[9px] text-white/35 uppercase tracking-wider">Dependencia</p>
                                            <p className={cn("text-sm font-bold mt-0.5",
                                                provider.dependencyLevel === 'CRITICAL' ? "text-red-400" :
                                                provider.dependencyLevel === 'HIGH' ? "text-orange-400" :
                                                provider.dependencyLevel === 'MEDIUM' ? "text-blue-400" :
                                                "text-green-400"
                                            )}>
                                                {dependencyConfig.label}
                                            </p>
                                        </div>

                                        {/* Operational state */}
                                        <div className="bg-black/20 rounded-lg px-3 py-2">
                                            <p className="text-[9px] text-white/35 uppercase tracking-wider">Estado</p>
                                            <p className={cn("text-sm font-bold mt-0.5",
                                                provider.operationalState === 'RISK' ? "text-red-400" :
                                                provider.operationalState === 'ATTENTION' ? "text-amber-400" :
                                                "text-green-400"
                                            )}>
                                                {provider.operationalState === 'OK' ? 'Estable' :
                                                 provider.operationalState === 'ATTENTION' ? 'Atención' : 'Riesgo'}
                                            </p>
                                        </div>

                                        {/* Last order */}
                                        <div className="bg-black/20 rounded-lg px-3 py-2">
                                            <p className="text-[9px] text-white/35 uppercase tracking-wider">Último pedido</p>
                                            <p className={cn("text-sm font-bold mt-0.5",
                                                daysSinceLastOrder === null ? "text-white/30" :
                                                daysSinceLastOrder > 30 ? "text-amber-400" :
                                                "text-white/80"
                                            )}>
                                                {daysSinceLastOrder !== null
                                                    ? daysSinceLastOrder === 0 ? "Hoy" : `Hace ${daysSinceLastOrder}d`
                                                    : "—"}
                                            </p>
                                        </div>

                                        {/* Last payment */}
                                        <div className="bg-black/20 rounded-lg px-3 py-2">
                                            <p className="text-[9px] text-white/35 uppercase tracking-wider">Último pago</p>
                                            <p className="text-sm font-bold mt-0.5 text-white/80">
                                                {lastPayment
                                                    ? format(new Date(lastPayment.paymentDate), 'dd/MM/yy', { locale: es })
                                                    : "—"}
                                            </p>
                                        </div>

                                        {/* Pending orders + tasks */}
                                        <div className="bg-black/20 rounded-lg px-3 py-2">
                                            <p className="text-[9px] text-white/35 uppercase tracking-wider">Pendientes</p>
                                            <div className="flex items-baseline gap-1.5 mt-0.5">
                                                <span className={cn("text-sm font-bold",
                                                    pendingOrdersCount > 0 ? "text-amber-400" : "text-green-400"
                                                )}>
                                                    {pendingOrdersCount}
                                                </span>
                                                <span className="text-[9px] text-white/25">ped</span>
                                                <span className="text-white/15 mx-0.5">/</span>
                                                <span className={cn("text-sm font-bold",
                                                    pendingTasksCount > 0 ? "text-amber-400" : "text-green-400"
                                                )}>
                                                    {pendingTasksCount}
                                                </span>
                                                <span className="text-[9px] text-white/25">tar</span>
                                            </div>
                                        </div>

                                        {/* Total spent */}
                                        <div className="bg-black/20 rounded-lg px-3 py-2">
                                            <p className="text-[9px] text-white/35 uppercase tracking-wider">Pagado total</p>
                                            <p className="text-sm font-bold mt-0.5 text-white/80">
                                                {totalSpent > 0 ? formatCurrency(totalSpent) : "—"}
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                {/* ═══════════ SUGGESTED ACTION ═══════════ */}
                                <button
                                    onClick={suggestedAction.onClick}
                                    className="w-full text-left bg-gradient-to-r from-blue-600/15 to-indigo-600/10 border border-blue-500/20 rounded-xl p-4 hover:border-blue-500/40 transition-all group"
                                >
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <p className="text-[10px] text-blue-400/60 uppercase tracking-widest font-bold mb-1">Acción recomendada</p>
                                            <p className="text-sm text-white font-medium">{suggestedAction.message}</p>
                                        </div>
                                        <ExternalLink className="h-4 w-4 text-blue-400/0 group-hover:text-blue-400/60 transition-colors shrink-0 ml-4" />
                                    </div>
                                </button>

                                {/* ═══════════ QUICK ACTIONS ═══════════ */}
                                <div className="grid grid-cols-4 gap-2">
                                    <button onClick={() => setShowOrderDialog(true)} className="flex flex-col items-center gap-1.5 p-3 rounded-lg bg-white/[0.03] border border-white/[0.06] hover:bg-blue-500/10 hover:border-blue-500/20 transition-all group">
                                        <ShoppingBag className="h-5 w-5 text-blue-400/60 group-hover:text-blue-400" />
                                        <span className="text-[10px] text-zinc-400 group-hover:text-white">Pedido</span>
                                    </button>
                                    <button onClick={() => setShowTaskDialog(true)} className="flex flex-col items-center gap-1.5 p-3 rounded-lg bg-white/[0.03] border border-white/[0.06] hover:bg-amber-500/10 hover:border-amber-500/20 transition-all group">
                                        <CheckCircle2 className="h-5 w-5 text-amber-400/60 group-hover:text-amber-400" />
                                        <span className="text-[10px] text-zinc-400 group-hover:text-white">Tarea</span>
                                    </button>
                                    <button onClick={() => setShowNoteDialog(true)} className="flex flex-col items-center gap-1.5 p-3 rounded-lg bg-white/[0.03] border border-white/[0.06] hover:bg-purple-500/10 hover:border-purple-500/20 transition-all group">
                                        <MessageSquare className="h-5 w-5 text-purple-400/60 group-hover:text-purple-400" />
                                        <span className="text-[10px] text-zinc-400 group-hover:text-white">Nota</span>
                                    </button>
                                    <button onClick={() => { setFileUploadContext({ entityType: 'PROVIDER', entityId: provider.id }); setShowFileDialog(true) }} className="flex flex-col items-center gap-1.5 p-3 rounded-lg bg-white/[0.03] border border-white/[0.06] hover:bg-green-500/10 hover:border-green-500/20 transition-all group">
                                        <Upload className="h-5 w-5 text-green-400/60 group-hover:text-green-400" />
                                        <span className="text-[10px] text-zinc-400 group-hover:text-white">Archivo</span>
                                    </button>
                                </div>

                                {/* ═══════════ RISK ANALYSIS (only for non-LOW) ═══════════ */}
                                {provider.dependencyLevel !== 'LOW' && (
                                    <div className={cn(
                                        "rounded-lg border p-4",
                                        provider.operationalState === 'RISK' ? "bg-red-500/5 border-red-500/15" :
                                        provider.operationalState === 'ATTENTION' ? "bg-amber-500/5 border-amber-500/15" :
                                        "bg-white/[0.02] border-white/[0.08]"
                                    )}>
                                        <div className="flex items-center gap-2 mb-2">
                                            <Activity className={cn("h-4 w-4",
                                                provider.operationalState === 'RISK' ? "text-red-400" :
                                                provider.operationalState === 'ATTENTION' ? "text-amber-400" : "text-blue-400"
                                            )} />
                                            <h3 className="text-sm font-medium text-white">Riesgo operativo</h3>
                                        </div>
                                        <div className="grid grid-cols-2 gap-3 mt-3">
                                            <div>
                                                <p className="text-[10px] text-white/35 uppercase">Área afectada</p>
                                                <p className="text-xs text-white/70 mt-0.5">{provider.affectedArea || "—"}</p>
                                            </div>
                                            <div>
                                                <p className="text-[10px] text-white/35 uppercase">Contingencia</p>
                                                <div className="flex items-center gap-1.5 mt-0.5">
                                                    <div className={cn("h-1.5 w-1.5 rounded-full",
                                                        provider.hasAlternative ? "bg-green-500" : "bg-amber-500 animate-pulse"
                                                    )} />
                                                    <span className="text-xs text-white/70">
                                                        {provider.hasAlternative ? "Alternativas listas" : "Sin alternativas"}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {/* ═══════════ RUNTIME ALERTS ═══════════ */}
                                {runtimeAlerts.length > 0 && (
                                    <div className="space-y-2">
                                        <div className="flex items-center gap-2 mb-1">
                                            <AlertTriangle className="h-3.5 w-3.5 text-amber-400" />
                                            <h3 className="text-[10px] font-bold text-white/40 uppercase tracking-widest">
                                                {runtimeAlerts.length} alerta{runtimeAlerts.length > 1 ? 's' : ''}
                                            </h3>
                                        </div>
                                        {runtimeAlerts.map((alert) => (
                                            <div
                                                key={alert.id}
                                                className={cn(
                                                    "flex items-start gap-3 rounded-lg border p-3",
                                                    alert.severity === 'error'
                                                        ? "bg-red-500/5 border-red-500/15"
                                                        : "bg-amber-500/5 border-amber-500/15"
                                                )}
                                            >
                                                <div className={cn(
                                                    "mt-0.5 h-1.5 w-1.5 rounded-full shrink-0",
                                                    alert.severity === 'error' ? "bg-red-500 shadow-[0_0_6px] shadow-red-500/50" : "bg-amber-500 shadow-[0_0_6px] shadow-amber-500/50"
                                                )} />
                                                <div className="flex-1 min-w-0">
                                                    <p className={cn(
                                                        "text-xs leading-relaxed",
                                                        alert.severity === 'error' ? "text-red-200/80" : "text-amber-200/80"
                                                    )}>
                                                        {alert.message}
                                                    </p>
                                                    {alert.action && (
                                                        <button
                                                            onClick={alert.action.onClick}
                                                            className={cn(
                                                                "mt-1.5 text-[10px] font-medium flex items-center gap-1 transition-colors",
                                                                alert.severity === 'error'
                                                                    ? "text-red-400/60 hover:text-red-400"
                                                                    : "text-amber-400/60 hover:text-amber-400"
                                                            )}
                                                        >
                                                            {alert.action.label} <ExternalLink className="h-2.5 w-2.5" />
                                                        </button>
                                                    )}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}

                                {/* ═══════════ CONTACT ═══════════ */}
                                {(provider.contactEmail || provider.contactPhone) && (
                                    <div className="flex items-center gap-4 rounded-lg bg-white/[0.02] border border-white/[0.06] px-4 py-3">
                                        {provider.contactEmail && (
                                            <a href={`mailto:${provider.contactEmail}`} className="flex items-center gap-2 text-xs text-white/50 hover:text-blue-400 transition-colors">
                                                <Mail className="h-3.5 w-3.5" /> {provider.contactEmail}
                                            </a>
                                        )}
                                        {provider.contactPhone && (
                                            <a href={`tel:${provider.contactPhone}`} className="flex items-center gap-2 text-xs text-white/50 hover:text-blue-400 transition-colors">
                                                <Phone className="h-3.5 w-3.5" /> {provider.contactPhone}
                                            </a>
                                        )}
                                    </div>
                                )}

                                {/* ═══════════ NOTES ═══════════ */}
                                {provider.notes && (
                                    <div className="rounded-lg border border-white/[0.06] bg-white/[0.02] p-4">
                                        <h3 className="text-[10px] font-bold text-white/30 uppercase tracking-widest mb-2">Notas</h3>
                                        <p className="text-white/70 text-xs whitespace-pre-wrap leading-relaxed">{provider.notes}</p>
                                    </div>
                                )}
                            </div>
                            )
                        })()}

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
                                            <h3 className="text-white font-medium">Historial de {labels.orders.plural}</h3>
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                className="bg-white/5 text-white border-white/10 hover:bg-white/10"
                                                onClick={() => setShowOrderDialog(true)}
                                            >
                                                <Plus className="h-4 w-4 mr-2" /> {labels.providers.actions.newOrder}
                                            </Button>
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
                                                                            order.status === 'PAID' || order.status === 'CLOSED' ? "bg-green-500/20 text-green-400 border-green-500/30" :
                                                                            order.status === 'COMPLETED' ? "bg-green-500/20 text-green-400 border-green-500/30" :
                                                                            order.status === 'RECEIVED' ? "bg-blue-500/20 text-blue-400 border-blue-500/30" :
                                                                            order.status === 'ISSUE' ? "bg-orange-500/20 text-orange-400 border-orange-500/30" :
                                                                            order.status === 'CANCELLED' ? "bg-red-500/20 text-red-400 border-red-500/30" :
                                                                            order.status === 'DRAFT' ? "bg-gray-500/20 text-gray-400 border-gray-500/30" :
                                                                            "bg-amber-500/20 text-amber-400 border-amber-500/30"
                                                                        )}>
                                                                            {order.status === 'PAID' || order.status === 'CLOSED' ? 'PAGADO' :
                                                                            order.status === 'COMPLETED' ? 'PAGADO' :
                                                                            order.status === 'RECEIVED' ? 'RECIBIDO' :
                                                                            order.status === 'ISSUE' ? 'INCIDENCIA' :
                                                                            order.status === 'CANCELLED' ? 'CANCELADO' :
                                                                            order.status === 'DRAFT' ? 'BORRADOR' : 'PENDIENTE'}
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

                                                                {/* Factura asociada */}
                                                                {order.invoice && (
                                                                    <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-3">
                                                                        <div className="flex items-center justify-between gap-2">
                                                                            <div className="flex items-center gap-2">
                                                                                <FileText className="h-4 w-4 text-blue-400" />
                                                                                <span className="text-sm font-medium text-blue-400">Factura asociada</span>
                                                                            </div>
                                                                            <a
                                                                                href={`/dashboard/finance/billing?invoice=${order.invoice.id}`}
                                                                                className="text-xs text-blue-300 hover:text-blue-200 flex items-center gap-1"
                                                                            >
                                                                                {order.invoice.number}
                                                                                <ExternalLink className="h-3 w-3" />
                                                                            </a>
                                                                        </div>
                                                                        <p className="text-[10px] text-white/50 mt-1">{order.invoice.status}</p>
                                                                    </div>
                                                                )}

                                                                {/* Files */}
                                                                <div className="space-y-2">
                                                                    <p className="text-[10px] text-white/40 uppercase tracking-wider">Archivos adjuntos</p>
                                                                    <div className="flex flex-wrap gap-2 items-center">
                                                                        {order.files && order.files.map((file: { id: string; name: string; url?: string; category: string; createdAt?: Date }) => (
                                                                            <div key={file.id} className="flex items-center gap-1 bg-white/5 border border-white/10 rounded px-2 py-1.5 text-[11px] text-zinc-200 hover:border-white/30 transition-colors">
                                                                                <button type="button" onClick={() => setSelectedFile(file)} className="flex items-center gap-2 min-w-0 text-left flex-1">
                                                                                    <FileText className="h-3 w-3 text-blue-400 shrink-0" />
                                                                                    <span className="truncate max-w-[120px]">{file.name}</span>
                                                                                    <span className="text-white/50 shrink-0">{fileCategoryLabel(file.category)}</span>
                                                                                    {file.createdAt && <span className="text-white/40 shrink-0">{format(new Date(file.createdAt), 'dd/MM/yy', { locale: es })}</span>}
                                                                                </button>
                                                                                {file.url && (
                                                                                    <a href={file.url} download={file.name} className="p-0.5 text-blue-400 hover:text-blue-300 shrink-0" title="Descargar"><Download className="h-3 w-3" /></a>
                                                                                )}
                                                                                <button type="button" onClick={(e) => { e.stopPropagation(); setFileToDelete({ id: file.id, name: file.name }) }} className="p-0.5 text-red-400 hover:text-red-300 shrink-0" title="Eliminar"><Trash2 className="h-3 w-3" /></button>
                                                                            </div>
                                                                        ))}
                                                                        <div className="flex gap-2">
                                                                            <Button
                                                                                type="button"
                                                                                size="sm"
                                                                                variant="outline"
                                                                                className="text-[11px] border-blue-500/40 text-blue-300 bg-blue-500/10 hover:bg-blue-500/20 hover:text-blue-200"
                                                                                onClick={() => {
                                                                                    setFileUploadContext({ entityType: 'ORDER', entityId: order.id, presetCategory: 'INVOICE' })
                                                                                    setShowFileDialog(true)
                                                                                }}
                                                                            >
                                                                                <Upload className="h-3.5 w-3.5 mr-1.5" /> Subir factura
                                                                            </Button>
                                                                            <Button
                                                                                type="button"
                                                                                size="sm"
                                                                                variant="outline"
                                                                                className="text-[11px] border-amber-500/40 text-amber-300 bg-amber-500/10 hover:bg-amber-500/20 hover:text-amber-200"
                                                                                onClick={() => {
                                                                                    setFileUploadContext({ entityType: 'ORDER', entityId: order.id, presetCategory: 'ORDER' })
                                                                                    setShowFileDialog(true)
                                                                                }}
                                                                            >
                                                                                <Upload className="h-3.5 w-3.5 mr-1.5" /> Subir albarán
                                                                            </Button>
                                                                        </div>
                                                                    </div>
                                                                </div>

                                                                {/* Actions based on order status — contextual buttons */}
                                                                {(order.status === 'DRAFT') && (
                                                                    <div className="flex gap-2 pt-2">
                                                                        <Button
                                                                            onClick={() => handleCompleteOrder(order.id, "RECEIVED")}
                                                                            size="sm"
                                                                            className="flex-1 bg-amber-500/20 text-amber-400 border border-amber-500/30 hover:bg-amber-500/30"
                                                                        >
                                                                            Confirmar pedido
                                                                        </Button>
                                                                    </div>
                                                                )}
                                                                {(order.status === 'PENDING') && (
                                                                    <div className="flex gap-2 pt-2">
                                                                        <Button
                                                                            onClick={() => handleCompleteOrder(order.id, "RECEIVED")}
                                                                            size="sm"
                                                                            className="flex-1 bg-blue-500/20 text-blue-400 border border-blue-500/30 hover:bg-blue-500/30"
                                                                        >
                                                                            <Package className="h-4 w-4 mr-2" />
                                                                            {labels.providers.actions.markReceived}
                                                                        </Button>
                                                                        <Button
                                                                            onClick={() => handleCancelOrder(order.id)}
                                                                            size="sm"
                                                                            variant="outline"
                                                                            className="border-red-500/30 text-red-400 hover:bg-red-500/10"
                                                                        >
                                                                            <X className="h-4 w-4 mr-1.5" />
                                                                            Cancelar
                                                                        </Button>
                                                                    </div>
                                                                )}
                                                                {(order.status === 'RECEIVED') && (
                                                                    <div className="flex gap-2 pt-2">
                                                                        <Button
                                                                            onClick={() => handleOpenRegisterPayment(order)}
                                                                            size="sm"
                                                                            className="flex-1 bg-green-500/20 text-green-400 border border-green-500/30 hover:bg-green-500/30"
                                                                        >
                                                                            <CreditCard className="h-4 w-4 mr-2" />
                                                                            Registrar pago
                                                                        </Button>
                                                                    </div>
                                                                )}
                                                                {(order.status === 'ISSUE') && (
                                                                    <div className="flex gap-2 pt-2">
                                                                        <Button
                                                                            onClick={() => handleCompleteOrder(order.id, "RECEIVED")}
                                                                            size="sm"
                                                                            className="flex-1 bg-blue-500/20 text-blue-400 border border-blue-500/30 hover:bg-blue-500/30"
                                                                        >
                                                                            Resolver → Pendiente
                                                                        </Button>
                                                                        <Button
                                                                            onClick={() => handleCancelOrder(order.id)}
                                                                            size="sm"
                                                                            variant="outline"
                                                                            className="border-red-500/30 text-red-400 hover:bg-red-500/10"
                                                                        >
                                                                            <X className="h-4 w-4 mr-1.5" />
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

                        {activeTab === "files" && (
                            <div className="p-6 space-y-6">
                                {/* Facturas recibidas (billing module) */}
                                <div className="space-y-3">
                                    <h4 className="text-xs font-bold text-green-400/80 uppercase tracking-widest flex items-center gap-2">
                                        <FileText className="h-3.5 w-3.5" /> Facturas recibidas
                                    </h4>
                                    {loadingProviderInvoices ? (
                                        <p className="text-xs text-white/40">Cargando…</p>
                                    ) : providerInvoices.length === 0 ? (
                                        <p className="text-xs text-white/40">Ninguna factura vinculada a este proveedor</p>
                                    ) : (
                                        <div className="space-y-2">
                                            {providerInvoices.map((inv) => (
                                                <a
                                                    key={inv.id}
                                                    href={`/dashboard/finance/billing?invoice=${inv.id}`}
                                                    className="flex items-center justify-between p-3 rounded-lg bg-white/5 border border-white/10 hover:bg-white/10 transition-colors"
                                                >
                                                    <span className="text-sm font-medium text-white">{inv.number}</span>
                                                    <Badge variant="outline" className="text-[10px] border-white/20 text-white/70">{inv.status}</Badge>
                                                    <ExternalLink className="h-3.5 w-3.5 text-white/40" />
                                                </a>
                                            ))}
                                        </div>
                                    )}
                                </div>
                                {loadingFiles ? (
                                    <div className="space-y-3">
                                        {[1, 2, 3].map(i => (
                                            <div key={i} className="h-20 w-full bg-white/5 border border-white/10 rounded-lg animate-pulse" />
                                        ))}
                                    </div>
                                ) : (
                                    <>
                                        {/* Header */}
                                        <div className="flex justify-between items-center">
                                            <h3 className="text-white font-medium">Documentos del proveedor</h3>
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                className="border-blue-500/40 text-blue-300 bg-blue-500/10 hover:bg-blue-500/20 hover:text-blue-200"
                                                onClick={() => {
                                                    setFileUploadContext({ entityType: 'PROVIDER', entityId: provider.id })
                                                    setShowFileDialog(true)
                                                }}
                                            >
                                                <Upload className="h-4 w-4 mr-2" /> Subir archivo
                                            </Button>
                                        </div>

                                        {/* Section: Order Files (colapsable por pedido) */}
                                        {filesData.grouped.orders.length > 0 && (
                                            <div className="space-y-3">
                                                <h4 className="text-xs font-bold text-blue-400/80 uppercase tracking-widest flex items-center gap-2">
                                                    <ShoppingBag className="h-3.5 w-3.5" /> Archivos de Pedidos
                                                </h4>
                                                {filesData.grouped.orders.map((group: any) => {
                                                    const orderKey = `order-${group.order?.id || 'unknown'}`
                                                    const isCollapsed = collapsedFileGroups[orderKey]
                                                    return (
                                                        <div key={orderKey} className="rounded-lg border border-blue-500/10 bg-blue-500/5 overflow-hidden">
                                                            <div
                                                                role="button"
                                                                tabIndex={0}
                                                                onClick={() => setCollapsedFileGroups(prev => ({ ...prev, [orderKey]: !prev[orderKey] }))}
                                                                onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); setCollapsedFileGroups(prev => ({ ...prev, [orderKey]: !prev[orderKey] })) } }}
                                                                className="w-full p-3 flex items-center justify-between text-left hover:bg-blue-500/10 transition-colors cursor-pointer"
                                                            >
                                                                <div className="flex items-center gap-2 min-w-0">
                                                                    {isCollapsed ? <ChevronDown className="h-4 w-4 text-blue-400 shrink-0" /> : <ChevronUp className="h-4 w-4 text-blue-400 shrink-0" />}
                                                                    <ShoppingBag className="h-3.5 w-3.5 text-blue-400 shrink-0" />
                                                                    <span className="text-xs font-medium text-white/80 truncate">
                                                                        {group.order?.description || `Pedido #${group.order?.id?.slice(-4).toUpperCase()}`}
                                                                    </span>
                                                                    {group.order?.amount != null && (
                                                                        <span className="text-[10px] text-white/40 font-mono shrink-0">{formatCurrency(group.order.amount)}</span>
                                                                    )}
                                                                    <span className="text-[10px] text-white/30">({group.files?.length ?? 0})</span>
                                                                </div>
                                                                <Button
                                                                    type="button"
                                                                    variant="ghost"
                                                                    size="sm"
                                                                    onClick={(e) => { e.stopPropagation(); e.preventDefault(); setFileUploadContext({ entityType: 'ORDER', entityId: group.order.id }); setShowFileDialog(true) }}
                                                                    className="text-xs text-blue-300 hover:text-blue-200 hover:bg-blue-500/10 shrink-0"
                                                                >
                                                                    <Plus className="h-3 w-3 mr-1" /> Adjuntar
                                                                </Button>
                                                            </div>
                                                            {!isCollapsed && (
                                                                <div className="px-3 pb-3 flex flex-col gap-2">
                                                                    {group.files?.map((file: any) => (
                                                                        <div
                                                                            key={file.id}
                                                                            className="flex items-center gap-2 bg-white/5 border border-white/10 rounded px-2.5 py-1.5 text-[11px] text-zinc-200 hover:border-blue-500/30 hover:bg-blue-500/10 transition-all group/file w-full"
                                                                        >
                                                                            <button type="button" onClick={() => setSelectedFile(file)} className="flex items-center gap-2 min-w-0 flex-1 text-left">
                                                                                <FileText className="h-3.5 w-3.5 text-blue-400 shrink-0" />
                                                                                <span className="truncate flex-1 min-w-0">{file.name}</span>
                                                                                <span className="text-blue-300/80 shrink-0">{fileCategoryLabel(file.category)}</span>
                                                                                {file.createdAt && <span className="text-white/50 shrink-0">{format(new Date(file.createdAt), 'dd/MM/yyyy', { locale: es })}</span>}
                                                                            </button>
                                                                            <a href={file.url} download={file.name} className="shrink-0 text-blue-400 hover:text-blue-300 p-1" title="Descargar">
                                                                                <Download className="h-3.5 w-3.5" />
                                                                            </a>
                                                                            <button type="button" onClick={() => setFileToDelete({ id: file.id, name: file.name })} className="shrink-0 text-red-400 hover:text-red-300 p-1" title="Eliminar">
                                                                                <Trash2 className="h-3.5 w-3.5" />
                                                                            </button>
                                                                        </div>
                                                                    ))}
                                                                </div>
                                                            )}
                                                        </div>
                                                    )
                                                })}
                                            </div>
                                        )}

                                        {/* Section: Payment Files (colapsable por pago) */}
                                        {filesData.grouped.payments.length > 0 && (
                                            <div className="space-y-3">
                                                <h4 className="text-xs font-bold text-green-400/80 uppercase tracking-widest flex items-center gap-2">
                                                    <CreditCard className="h-3.5 w-3.5" /> Justificantes de Pago
                                                </h4>
                                                {filesData.grouped.payments.map((group: any) => {
                                                    const payKey = `payment-${group.payment?.id || 'unknown'}`
                                                    const isCollapsed = collapsedFileGroups[payKey]
                                                    return (
                                                        <div key={payKey} className="rounded-lg border border-green-500/10 bg-green-500/5 overflow-hidden">
                                                            <div
                                                                role="button"
                                                                tabIndex={0}
                                                                onClick={() => setCollapsedFileGroups(prev => ({ ...prev, [payKey]: !prev[payKey] }))}
                                                                onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); setCollapsedFileGroups(prev => ({ ...prev, [payKey]: !prev[payKey] })) } }}
                                                                className="w-full p-3 flex items-center justify-between text-left hover:bg-green-500/10 transition-colors cursor-pointer"
                                                            >
                                                                <div className="flex items-center gap-2 min-w-0">
                                                                    {isCollapsed ? <ChevronDown className="h-4 w-4 text-green-400 shrink-0" /> : <ChevronUp className="h-4 w-4 text-green-400 shrink-0" />}
                                                                    <CreditCard className="h-3.5 w-3.5 text-green-400 shrink-0" />
                                                                    <span className="text-xs font-medium text-white/80 truncate">{group.payment?.concept || 'Pago'}</span>
                                                                    {group.payment?.amount != null && (
                                                                        <span className="text-[10px] text-white/40 font-mono shrink-0">{formatCurrency(group.payment.amount)}</span>
                                                                    )}
                                                                    {group.payment?.status && (
                                                                        <Badge className={cn("text-[8px] px-1 py-0 h-3.5 border-0 shrink-0",
                                                                            group.payment.status === 'PAID' ? "bg-green-500/20 text-green-400" :
                                                                            group.payment.status === 'FAILED' ? "bg-red-500/20 text-red-400" :
                                                                            "bg-amber-500/20 text-amber-400"
                                                                        )}>
                                                                            {group.payment.status === 'PAID' ? 'Pagado' : group.payment.status === 'FAILED' ? 'Fallido' : 'Pendiente'}
                                                                        </Badge>
                                                                    )}
                                                                    <span className="text-[10px] text-white/30">({group.files?.length ?? 0})</span>
                                                                </div>
                                                                <Button
                                                                    type="button"
                                                                    variant="ghost"
                                                                    size="sm"
                                                                    onClick={(e) => { e.stopPropagation(); e.preventDefault(); setFileUploadContext({ entityType: 'PAYMENT', entityId: group.payment.id }); setShowFileDialog(true) }}
                                                                    className="text-xs text-green-300 hover:text-green-200 hover:bg-green-500/10 shrink-0"
                                                                >
                                                                    <Plus className="h-3 w-3 mr-1" /> Adjuntar
                                                                </Button>
                                                            </div>
                                                            {!isCollapsed && (
                                                                <div className="px-3 pb-3 flex flex-col gap-2">
                                                                    {group.files?.map((file: any) => (
                                                                        <div
                                                                            key={file.id}
                                                                            className="flex items-center gap-2 bg-white/5 border border-white/10 rounded px-2.5 py-1.5 text-[11px] text-zinc-200 hover:border-green-500/30 hover:bg-green-500/10 transition-all group/file w-full"
                                                                        >
                                                                            <button type="button" onClick={() => setSelectedFile(file)} className="flex items-center gap-2 min-w-0 flex-1 text-left">
                                                                                <FileText className="h-3.5 w-3.5 text-green-400 shrink-0" />
                                                                                <span className="truncate flex-1 min-w-0">{file.name}</span>
                                                                                <span className="text-green-300/80 shrink-0">{fileCategoryLabel(file.category)}</span>
                                                                                {file.createdAt && <span className="text-white/50 shrink-0">{format(new Date(file.createdAt), 'dd/MM/yyyy', { locale: es })}</span>}
                                                                            </button>
                                                                            <a href={file.url} download={file.name} className="shrink-0 text-green-400 hover:text-green-300 p-1" title="Descargar">
                                                                                <Download className="h-3.5 w-3.5" />
                                                                            </a>
                                                                            <button type="button" onClick={() => setFileToDelete({ id: file.id, name: file.name })} className="shrink-0 text-red-400 hover:text-red-300 p-1" title="Eliminar">
                                                                                <Trash2 className="h-3.5 w-3.5" />
                                                                            </button>
                                                                        </div>
                                                                    ))}
                                                                </div>
                                                            )}
                                                        </div>
                                                    )
                                                })}
                                            </div>
                                        )}

                                        {/* Section: General Files (solo con contexto explícito) */}
                                        <div className="space-y-3">
                                            <h4 className="text-xs font-bold text-white/30 uppercase tracking-widest flex items-center gap-2">
                                                <FileText className="h-3.5 w-3.5" /> Documentos Generales
                                            </h4>
                                            {filesData.grouped.general.length === 0 ? (
                                                <div className="text-center py-8 text-white/20 border border-dashed border-white/10 rounded-lg">
                                                    <FileText className="h-8 w-8 mx-auto mb-2 opacity-30" />
                                                    <p className="text-xs">Sin documentos generales</p>
                                                    <Button
                                                        type="button"
                                                        variant="outline"
                                                        size="sm"
                                                        onClick={() => {
                                                            setFileUploadContext({ entityType: 'PROVIDER', entityId: provider.id })
                                                            setShowFileDialog(true)
                                                        }}
                                                        className="mt-2 text-xs text-purple-300 border-purple-500/30 bg-purple-500/10 hover:bg-purple-500/20"
                                                    >
                                                        <Plus className="h-3 w-3 mr-1" /> Subir documento
                                                    </Button>
                                                </div>
                                            ) : (
                                                <div className="space-y-1.5">
                                                    {filesData.grouped.general.map((file: any) => (
                                                        <div
                                                            key={file.id}
                                                            className="w-full flex items-center justify-between gap-3 bg-white/[0.03] border border-white/[0.08] rounded-lg px-3 py-2.5 hover:bg-white/[0.06] hover:border-white/[0.15] transition-all group/file"
                                                        >
                                                            <button
                                                                type="button"
                                                                onClick={() => setSelectedFile(file)}
                                                                className="flex items-center gap-3 min-w-0 flex-1 text-left"
                                                            >
                                                                <FileText className="h-4 w-4 text-zinc-400 group-hover/file:text-white shrink-0" />
                                                                <div className="min-w-0">
                                                                    <p className="text-xs text-white/80 truncate">{file.name}</p>
                                                                    <p className="text-[10px] text-zinc-500">{format(new Date(file.createdAt), 'd MMM yyyy', { locale: es })}</p>
                                                                </div>
                                                            </button>
                                                            <div className="flex items-center gap-2 shrink-0">
                                                                <span className="text-[11px] text-zinc-400">{fileCategoryLabel(file.category)}</span>
                                                                <a href={file.url} download={file.name} className="p-1 text-zinc-500 hover:text-white" title="Descargar">
                                                                    <Download className="h-3.5 w-3.5" />
                                                                </a>
                                                                <button type="button" onClick={() => setSelectedFile(file)} className="p-1 text-zinc-500 hover:text-white" title="Vista previa">
                                                                    <Eye className="h-3.5 w-3.5" />
                                                                </button>
                                                                <button type="button" onClick={() => setFileToDelete({ id: file.id, name: file.name })} className="p-1 text-red-400 hover:text-red-300" title="Eliminar">
                                                                    <Trash2 className="h-3.5 w-3.5" />
                                                                </button>
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            )}
                                        </div>

                                        {/* Total count */}
                                        {(filesData.grouped.orders.length + filesData.grouped.payments.length + filesData.grouped.general.length) === 0 && (
                                            <div className="text-center py-12 text-white/20 border-2 border-dashed border-white/5 rounded-xl">
                                                <Upload className="h-12 w-12 mx-auto mb-3 opacity-20" />
                                                <p className="text-sm">Sin archivos</p>
                                                <p className="text-xs text-white/15 mt-1">Sube facturas, albaranes o contratos</p>
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
                                            <h3 className="text-white font-medium">{labels.nav.tasks} y Seguimiento</h3>
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                className="bg-white/5 text-white border-white/10 hover:bg-white/10"
                                                onClick={() => setShowTaskDialog(true)}
                                            >
                                                <Plus className="h-4 w-4 mr-2" /> {labels.providers.actions.newTask}
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
                                            <div className="relative pl-6 space-y-4 border-l border-white/10 ml-3">
                                                {timeline.map((event: any) => {
                                                    // Determine if this event is navigable
                                                    const isClickable = !!(
                                                        (event.type === 'ORDER' && event.entityId) ||
                                                        (event.type === 'PAYMENT' && event.entityId) ||
                                                        (event.type === 'TASK' && event.entityId) ||
                                                        (event.type === 'NOTE' && event.content) ||
                                                        (event.type === 'CONTACT_LOG') ||
                                                        (event.type === 'FILE_ADDED' && event.entityId)
                                                    )

                                                    // Navigate handler
                                                    const handleNavigate = () => {
                                                        if (!isClickable) return
                                                        if (event.type === 'ORDER' && event.entityId) {
                                                            setActiveTab('orders')
                                                            setExpandedOrderId(event.entityId)
                                                        }
                                                        if (event.type === 'PAYMENT' && event.entityId) {
                                                            setActiveTab('orders')
                                                            const linkedOrder = orders.find(o => o.payment?.id === event.entityId)
                                                            if (linkedOrder) setExpandedOrderId(linkedOrder.id)
                                                        }
                                                        if (event.type === 'TASK' && event.entityId) {
                                                            setActiveTab('tasks')
                                                        }
                                                        if (event.type === 'NOTE' && event.content) {
                                                            setSelectedNoteContent(event.content)
                                                        }
                                                        if (event.type === 'FILE_ADDED' && event.entityId && event.url) {
                                                            setSelectedFile({ id: event.entityId, name: event.name || event.title || 'Archivo', url: event.url, category: event.category || 'OTHER' })
                                                        }
                                                    }

                                                    // CTA label
                                                    const ctaLabel =
                                                        event.type === 'ORDER' ? 'Ver pedido' :
                                                        event.type === 'PAYMENT' ? 'Ver pago' :
                                                        event.type === 'TASK' ? 'Ver tarea' :
                                                        event.type === 'NOTE' ? 'Ver nota' :
                                                        event.type === 'FILE_ADDED' ? 'Ver archivo' :
                                                        null

                                                    // Status badge config
                                                    const statusBadgeColor =
                                                        event.status === 'CLOSED' || event.status === 'COMPLETED' || event.status === 'PAID' ? "bg-green-500/20 text-green-400" :
                                                        event.status === 'RECEIVED' ? "bg-blue-500/20 text-blue-400" :
                                                        event.status === 'ISSUE' || event.status === 'FAILED' ? "bg-orange-500/20 text-orange-400" :
                                                        event.status === 'CANCELLED' ? "bg-red-500/20 text-red-400" :
                                                        event.status === 'DRAFT' ? "bg-gray-500/20 text-gray-400" :
                                                        event.status === 'DONE' ? "bg-green-500/20 text-green-400" :
                                                        event.status === 'PENDING' ? "bg-amber-500/20 text-amber-400" :
                                                        null

                                                    // Dot colors by type
                                                    const dotColor =
                                                        event.type === 'ORDER' ? "border-blue-500 shadow-[0_0_6px_rgba(59,130,246,0.4)]" :
                                                        event.type === 'PAYMENT' ? "border-green-500 shadow-[0_0_6px_rgba(34,197,94,0.4)]" :
                                                        event.type === 'TASK' ? "border-amber-500 shadow-[0_0_6px_rgba(245,158,11,0.4)]" :
                                                        event.type === 'NOTE' ? "border-indigo-500 shadow-[0_0_6px_rgba(99,102,241,0.4)]" :
                                                        event.type === 'CONTACT_LOG' ? "border-purple-500 shadow-[0_0_6px_rgba(168,85,247,0.4)]" :
                                                        "border-white/20"

                                                    return (
                                                        <div key={event.id} className="relative group/item">
                                                            {/* Timeline dot */}
                                                            <div className={cn(
                                                                "absolute -left-[31px] h-4 w-4 rounded-full border-2 bg-zinc-950 flex items-center justify-center z-10 transition-transform group-hover/item:scale-110",
                                                                dotColor
                                                            )}>
                                                                {event.type === 'ORDER' && <ShoppingBag className="h-2 w-2 text-blue-500" />}
                                                                {event.type === 'PAYMENT' && <CreditCard className="h-2 w-2 text-green-500" />}
                                                                {event.type === 'TASK' && <CheckCircle2 className="h-2 w-2 text-amber-500" />}
                                                                {event.type === 'NOTE' && <MessageSquare className="h-2 w-2 text-indigo-500" />}
                                                                {event.type === 'CONTACT_LOG' && <MessageSquare className="h-2 w-2 text-purple-500" />}
                                                                {(event.type === 'FILE_ADDED' || event.type === 'FILE') && <FileText className="h-2 w-2 text-white/40" />}
                                                            </div>

                                                            {/* Card — clickable wrapper */}
                                                            <div
                                                                onClick={isClickable ? handleNavigate : undefined}
                                                                className={cn(
                                                                    "rounded-lg border p-3 transition-all",
                                                                    "bg-white/[0.03] border-white/[0.08]",
                                                                    isClickable && "cursor-pointer hover:bg-white/[0.07] hover:border-white/[0.15] hover:shadow-lg hover:shadow-black/20",
                                                                    event.importance === 'HIGH' && "border-blue-500/20"
                                                                )}
                                                            >
                                                                {/* Header row */}
                                                                <div className="flex items-start justify-between gap-3">
                                                                    <div className="flex-1 min-w-0">
                                                                        {/* Title + badges */}
                                                                        <div className="flex items-center gap-2 flex-wrap">
                                                                            <h4 className="text-xs font-semibold text-white/90 truncate">{event.title}</h4>
                                                                            {event.statusLabel && statusBadgeColor && (
                                                                                <Badge className={cn("text-[10px] px-1.5 py-0 h-4 border-0", statusBadgeColor)}>
                                                                                    {event.statusLabel}
                                                                                </Badge>
                                                                            )}
                                                                            {event.type === 'TASK' && !event.statusLabel && (
                                                                                <Badge className={cn("text-[10px] px-1.5 py-0 h-4 border-0",
                                                                                    event.status === 'DONE' ? "bg-green-500/20 text-green-400" : "bg-amber-500/20 text-amber-400"
                                                                                )}>
                                                                                    {event.status === 'DONE' ? "Completada" : "Pendiente"}
                                                                                </Badge>
                                                                            )}
                                                                            {event.amount != null && (
                                                                                <span className="text-[10px] font-mono text-white/50">{event.amount.toLocaleString('es-ES', { style: 'currency', currency: 'EUR' })}</span>
                                                                            )}
                                                                        </div>

                                                                        {/* Description or note content */}
                                                                        {event.type === 'NOTE' && event.content ? (
                                                                            <div className="bg-indigo-500/10 border border-indigo-500/20 rounded-md p-2 mt-2">
                                                                                <p className="text-xs text-white/80 whitespace-pre-wrap line-clamp-3">{event.content}</p>
                                                                            </div>
                                                                        ) : event.description ? (
                                                                            <p className="text-xs text-white/50 mt-1 line-clamp-2">{event.description}</p>
                                                                        ) : null}
                                                                    </div>

                                                                    {/* Right side: time + CTA */}
                                                                    <div className="flex flex-col items-end gap-1 shrink-0">
                                                                        <span className="text-[10px] text-white/25">
                                                                            {format(new Date(event.date), 'd MMM HH:mm', { locale: es })}
                                                                        </span>
                                                                        {isClickable && ctaLabel && (
                                                                            <span className="text-[10px] text-white/0 group-hover/item:text-purple-400 transition-colors flex items-center gap-1">
                                                                                {ctaLabel} <ExternalLink className="h-2.5 w-2.5" />
                                                                            </span>
                                                                        )}
                                                                    </div>
                                                                </div>

                                                                {/* Inline actions — only for actionable states */}
                                                                {(
                                                                    (event.type === 'ORDER' && (event.status === 'PENDING' || event.status === 'ISSUE')) ||
                                                                    (event.type === 'TASK' && event.entityId)
                                                                ) && (
                                                                    <div className="mt-2 pt-2 border-t border-white/5 flex flex-wrap gap-1.5" onClick={(e) => e.stopPropagation()}>
                                                                        {event.type === 'ORDER' && event.status === 'PENDING' && (
                                                                            <>
                                                                                <Button
                                                                                    onClick={async () => {
                                                                                        const res = await completeProviderOrder(event.entityId, "RECEIVED")
                                                                                        if (res.success) {
                                                                                            toast.success("Pedido marcado como recibido")
                                                                                            loadTimeline()
                                                                                            loadOrders()
                                                                                        }
                                                                                    }}
                                                                                    size="sm"
                                                                                    variant="outline"
                                                                                    className="h-6 px-2 text-[10px] border-blue-500/30 text-blue-400 hover:bg-blue-500/10"
                                                                                >
                                                                                    <Package className="h-2.5 w-2.5 mr-1" /> Recibido
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
                                                                                    className="h-6 px-2 text-[10px] border-red-500/30 text-red-400 hover:bg-red-500/10"
                                                                                >
                                                                                    <X className="h-2.5 w-2.5 mr-1" /> Cancelar
                                                                                </Button>
                                                                            </>
                                                                        )}
                                                                        {event.type === 'ORDER' && event.status === 'ISSUE' && (
                                                                            <Button
                                                                                onClick={async () => {
                                                                                    const res = await completeProviderOrder(event.entityId, "RECEIVED")
                                                                                    if (res.success) {
                                                                                        toast.success("Incidencia resuelta")
                                                                                        loadTimeline()
                                                                                        loadOrders()
                                                                                    }
                                                                                }}
                                                                                size="sm"
                                                                                variant="outline"
                                                                                className="h-6 px-2 text-[10px] border-blue-500/30 text-blue-400 hover:bg-blue-500/10"
                                                                            >
                                                                                <CheckCircle2 className="h-2.5 w-2.5 mr-1" /> Resolver
                                                                            </Button>
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
                                                                                    "h-6 px-2 text-[10px]",
                                                                                    event.status === 'DONE' ? "border-white/20 text-white/50" : "border-blue-500/30 text-blue-400 hover:bg-blue-500/10"
                                                                                )}
                                                                            >
                                                                                {event.status === 'DONE' ? <Circle className="h-2.5 w-2.5 mr-1" /> : <CheckCircle2 className="h-2.5 w-2.5 mr-1" />}
                                                                                {event.status === 'DONE' ? "Reabrir" : "Completar"}
                                                                            </Button>
                                                                        )}
                                                                    </div>
                                                                )}
                                                            </div>
                                                        </div>
                                                    )
                                                })}
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
                presetCategory={fileUploadContext?.presetCategory}
            />

            <FilePreviewModal
                open={!!selectedFile}
                onOpenChange={(open) => !open && setSelectedFile(null)}
                file={selectedFile}
            />

            <AlertDialog open={!!fileToDelete} onOpenChange={(open) => !open && setFileToDelete(null)}>
                <AlertDialogContent className="bg-zinc-900 border-white/10">
                    <AlertDialogHeader>
                        <AlertDialogTitle className="text-white">Eliminar archivo</AlertDialogTitle>
                        <AlertDialogDescription className="text-zinc-400">
                            ¿Eliminar &quot;{fileToDelete?.name}&quot;? Esta acción no se puede deshacer.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel className="text-zinc-300 border-zinc-600 hover:bg-zinc-800">Cancelar</AlertDialogCancel>
                        <Button
                            type="button"
                            onClick={() => { if (fileToDelete) handleDeleteFile(fileToDelete.id) }}
                            className="bg-red-600 hover:bg-red-700 text-white"
                        >
                            Eliminar
                        </Button>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>

            {/* Modal: nota completa al hacer click en evento NOTE del timeline */}
            <Dialog open={!!selectedNoteContent} onOpenChange={(open) => !open && setSelectedNoteContent(null)}>
                <DialogContent className="bg-zinc-900 border-white/10 max-w-md">
                    <DialogHeader>
                        <DialogTitle className="text-white">Nota</DialogTitle>
                    </DialogHeader>
                    <div className="bg-indigo-500/10 border border-indigo-500/20 rounded-lg p-4 max-h-[60vh] overflow-y-auto">
                        <p className="text-sm text-white/90 whitespace-pre-wrap">{selectedNoteContent}</p>
                    </div>
                </DialogContent>
            </Dialog>

            {/* Modal: Registrar pago (RECEIVED → PAID solo vía pago) */}
            <Dialog open={!!orderForPayment} onOpenChange={(open) => !open && setOrderForPayment(null)}>
                <DialogContent className="bg-zinc-900 border-white/10 max-w-md">
                    <DialogHeader>
                        <DialogTitle className="text-white">Registrar pago</DialogTitle>
                        <p className="text-xs text-zinc-400">Al completar, el pedido pasará a Pagado.</p>
                    </DialogHeader>
                    <form onSubmit={handleRegisterPaymentSubmit} className="space-y-4">
                        <div className="space-y-2">
                            <Label className="text-zinc-400">Importe (€)</Label>
                            <Input
                                type="number"
                                step="0.01"
                                min="0"
                                value={paymentForm.amount || ""}
                                onChange={(e) => setPaymentForm(prev => ({ ...prev, amount: parseFloat(e.target.value) || 0 }))}
                                className="bg-zinc-800 border-white/5 text-white"
                                required
                            />
                        </div>
                        <div className="space-y-2">
                            <Label className="text-zinc-400">Fecha de pago</Label>
                            <Input
                                type="date"
                                value={paymentForm.paymentDate}
                                onChange={(e) => setPaymentForm(prev => ({ ...prev, paymentDate: e.target.value }))}
                                className="bg-zinc-800 border-white/5 text-white"
                                required
                            />
                        </div>
                        <div className="space-y-2">
                            <Label className="text-zinc-400">Concepto (opcional)</Label>
                            <Input
                                value={paymentForm.concept}
                                onChange={(e) => setPaymentForm(prev => ({ ...prev, concept: e.target.value }))}
                                className="bg-zinc-800 border-white/5 text-white"
                                placeholder="Ej: Pago factura enero"
                            />
                        </div>
                        <DialogFooter className="pt-4 border-t border-white/5">
                            <Button type="button" variant="ghost" onClick={() => setOrderForPayment(null)} className="text-zinc-400 hover:text-white">
                                {labels.common.cancel}
                            </Button>
                            <Button type="submit" disabled={paymentSubmitting} className="bg-green-500 hover:bg-green-600 text-white">
                                {paymentSubmitting ? labels.common.loading : "Registrar pago"}
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>
        </>
    )
}
