"use client"
import { getBaseUrl } from "@/lib/api/baseUrl"


import { useState, useEffect, useOptimistic, useTransition, useMemo } from "react"
import { useRouter } from "next/navigation"
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { X, ArrowLeft, Package, Wrench, Code, HelpCircle, Plus, MessageSquare, CreditCard, ShoppingBag, CheckCircle2, Circle, FileText, ExternalLink, Download, Eye, AlertTriangle, ShieldCheck, Activity, Target, ChevronDown, ChevronUp, Phone, Mail, Globe, Upload, Calendar, Clock, DollarSign, Trash2 } from "lucide-react"
import {
    getProviderOrders,
    getProviderTimeline,
    getProviderTasks,
    getProviderFiles,
    getProviderProducts,
    getProviderEmailTemplates,
    toggleProviderTaskStatus,
    deleteProviderEmailTemplate,
    setDefaultProviderEmailTemplate,
    addProviderNote,
    registerProviderFile,
    registerProviderPayment,
    completeProviderOrder,
    cancelProviderOrder,
    markOrderSent,
    updateProviderOrderStatus,
    getProviderAlertsAction,
    updateProvider,
    updateProviderProduct,
    deleteProviderFile,
    deleteProviderOrder,
    getProviderOrder,
} from "../actions"
import { format, startOfMonth, subMonths } from "date-fns"
import { es } from "date-fns/locale"
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts"
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
import { CreateProviderProductDialog } from "./CreateProviderProductDialog"
import { CreateEditTemplateDialog, type ProviderEmailTemplateRow } from "./CreateEditTemplateDialog"
import { RegisterOrderDialog } from "./RegisterOrderDialog"
import { FilePreviewModal } from "./FilePreviewModal"
import { FileUploadDialog } from "./FileUploadDialog"
import { EditProviderProductDialog, type ProviderProductRow } from "./EditProviderProductDialog"
import { ImportProductsDialog } from "./ImportProductsDialog"
import { CreateProviderOrderDialog } from "./orders/CreateProviderOrderDialog"
import { ConfirmSendOrderModal } from "./orders/ConfirmSendOrderModal"
import {
    ProviderSummaryTab,
    ProviderOrdersTab,
    ProviderProductsTab,
    ProviderTemplatesTab,
    ProviderFilesTab,
    ProviderTasksTab,
    ProviderTimelineTab,
    type RuntimeAlert,
} from "./tabs"

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
    /** When true, render as page content (no Sheet); header shows back instead of close */
    embeddedInPage?: boolean
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

export function ProviderSidePanel({ provider, open, onClose, onUpdate, initialTab, initialDialog, embeddedInPage }: ProviderSidePanelProps) {
    const { labels } = useSectorConfig()
    const router = useRouter()
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

    const [activeTab, setActiveTab] = useState<"summary" | "orders" | "tasks" | "timeline" | "files" | "productos" | "plantillas">(mappedTab || "summary")
    const [timeline, setTimeline] = useState<any[]>([])
    const [orders, setOrders] = useState<Order[]>([])
    const [tasks, setTasks] = useState<Task[]>([])
    const [filesData, setFilesData] = useState<{ grouped: { orders: any[], payments: any[], general: any[] } }>({ grouped: { orders: [], payments: [], general: [] } })
    const [loadingTimeline, setLoadingTimeline] = useState(false)
    const [loadingOrders, setLoadingOrders] = useState(false)
    const [loadingTasks, setLoadingTasks] = useState(false)
    const [loadingFiles, setLoadingFiles] = useState(false)
    const [products, setProducts] = useState<Array<{ id: string; name: string; code: string; unit: string | null; price: number; description: string | null; category: string | null; isActive: boolean }>>([])
    const [loadingProducts, setLoadingProducts] = useState(false)
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
    const [showProductDialog, setShowProductDialog] = useState(false)
    const [templates, setTemplates] = useState<ProviderEmailTemplateRow[]>([])
    const [loadingTemplates, setLoadingTemplates] = useState(false)
    const [showTemplateDialog, setShowTemplateDialog] = useState(false)
    const [templateToEdit, setTemplateToEdit] = useState<ProviderEmailTemplateRow | null>(null)
    const [productSearchTerm, setProductSearchTerm] = useState("")
    const [showImportProductsDialog, setShowImportProductsDialog] = useState(false)
    const [productToEdit, setProductToEdit] = useState<ProviderProductRow | null>(null)
    const [showEditProductDialog, setShowEditProductDialog] = useState(false)
    const [showNewOrderModal, setShowNewOrderModal] = useState(false)
    const [draftOrderIdToOpen, setDraftOrderIdToOpen] = useState<string | null>(null)
    const [pendingConfirmOrder, setPendingConfirmOrder] = useState<{ orderId: string; providerId: string } | null>(null)
    const [confirmSendLoading, setConfirmSendLoading] = useState(false)
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
            const res = await fetch(`${getBaseUrl()}/api/billing?providerId=${encodeURIComponent(provider.id)}`, { credentials: "include" })
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
            loadProducts()
            loadTemplates()
            loadInsights()
            loadProviderInvoices()
        }
    }, [open, provider.id])

    const clearPendingConfirmStorage = () => {
        try {
            sessionStorage.removeItem("providerOrderPendingConfirm")
        } catch (_) {}
    }

    useEffect(() => {
        if (!provider?.id) return
        try {
            const raw = sessionStorage.getItem("providerOrderPendingConfirm")
            if (!raw) return
            const data = JSON.parse(raw) as { orderId: string; providerId: string; at?: number }
            if (data.providerId === provider.id) setPendingConfirmOrder({ orderId: data.orderId, providerId: data.providerId })
        } catch (_) {}
    }, [provider?.id, open])

    // Detect return to the app (e.g. after opening mail client) using window focus
    useEffect(() => {
        const onFocus = () => {
            if (!provider?.id) return
            try {
                const raw = sessionStorage.getItem("providerOrderPendingConfirm")
                if (!raw) return
                const data = JSON.parse(raw) as { orderId: string; providerId: string }
                if (data.providerId === provider.id) {
                    setPendingConfirmOrder({ orderId: data.orderId, providerId: data.providerId })
                }
            } catch (_) {}
        }
        window.addEventListener("focus", onFocus)
        return () => window.removeEventListener("focus", onFocus)
    }, [provider?.id])

    useEffect(() => {
        const onVisible = () => {
            if (document.visibilityState !== "visible" || !provider?.id) return
            try {
                const raw = sessionStorage.getItem("providerOrderPendingConfirm")
                if (!raw) return
                const data = JSON.parse(raw) as { orderId: string; providerId: string }
                if (data.providerId === provider.id) setPendingConfirmOrder({ orderId: data.orderId, providerId: data.providerId })
            } catch (_) {}
        }
        document.addEventListener("visibilitychange", onVisible)
        return () => document.removeEventListener("visibilitychange", onVisible)
    }, [provider?.id])

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

    const loadProducts = async () => {
        setLoadingProducts(true)
        try {
            const res = await getProviderProducts(provider.id)
            if (res.success && res.products) {
                setProducts(res.products)
            }
        } catch (error) {
            console.error("Error loading products:", error)
        } finally {
            setLoadingProducts(false)
        }
    }

    const loadTemplates = async () => {
        setLoadingTemplates(true)
        try {
            const res = await getProviderEmailTemplates(provider.id)
            if (res.success && res.templates) setTemplates(res.templates)
            else setTemplates([])
        } catch (error) {
            console.error("Error loading templates:", error)
            setTemplates([])
        } finally {
            setLoadingTemplates(false)
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
            concept: order.description
                ? `Pago pedido: ${order.description}`
                : ""
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
        cat === "INVOICE"
            ? "Factura"
            : cat === "ORDER"
                ? "Albarán"
                : cat === "ORDER_SHEET"
                    ? "Hoja de pedido"
                    : cat === "CONTRACT"
                        ? "Contrato"
                        : "Recibo u otros"

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

    const summaryData = useMemo(() => {
        const lastOrder = orders.length > 0
            ? orders.reduce((latest, o) => (new Date(o.orderDate) > new Date(latest.orderDate) ? o : latest))
            : null
        const daysSinceLastOrder = lastOrder
            ? Math.floor((Date.now() - new Date(lastOrder.orderDate).getTime()) / (1000 * 60 * 60 * 24))
            : null
        const issueOrders = orders.filter((o) => o.status === "ISSUE").length
        const healthScore =
            provider.operationalState === "RISK" || issueOrders > 0
                ? "red"
                : provider.operationalState === "ATTENTION" || pendingOrdersCount > 2 || pendingTasksCount > 3
                    ? "yellow"
                    : "green"
        const pendingPaymentsCount = orders.filter((o) => o.status === "RECEIVED" && !o.payment).length
        const operationalSubtext =
            healthScore === "green" ? "Todo al día" : healthScore === "yellow" ? "Requiere atención" : "Revisar incidencias"
        const runtimeAlerts: RuntimeAlert[] = []
        for (const o of orders) {
            if (o.status !== "PENDING") continue
            const days = Math.floor((Date.now() - new Date(o.orderDate).getTime()) / (1000 * 60 * 60 * 24))
            if (days >= 7) {
                runtimeAlerts.push({
                    id: `order-stale-${o.id}`,
                    severity: days >= 14 ? "error" : "warning",
                    message: `Pedido pendiente desde hace ${days} días${o.description ? ` (${o.description})` : ""}`,
                    action: { label: "Ver pedido", onClick: () => { setActiveTab("orders"); setExpandedOrderId(o.id) } },
                })
            }
        }
        for (const o of orders) {
            if (o.status !== "ISSUE") continue
            runtimeAlerts.push({
                id: `order-issue-${o.id}`,
                severity: "error",
                message: `Pedido con incidencia${o.description ? `: ${o.description}` : ""}`,
                action: { label: "Resolver", onClick: () => { setActiveTab("orders"); setExpandedOrderId(o.id) } },
            })
        }
        for (const o of orders) {
            if (o.status !== "RECEIVED" || o.payment) continue
            const days = Math.floor((Date.now() - new Date(o.orderDate).getTime()) / (1000 * 60 * 60 * 24))
            if (days >= 5) {
                runtimeAlerts.push({
                    id: `order-nopay-${o.id}`,
                    severity: "warning",
                    message: `Pedido recibido hace ${days} días sin pago registrado`,
                    action: { label: "Ver pedido", onClick: () => { setActiveTab("orders"); setExpandedOrderId(o.id) } },
                })
            }
        }
        if (
            (provider.dependencyLevel === "CRITICAL" || provider.dependencyLevel === "HIGH") &&
            daysSinceLastOrder !== null &&
            daysSinceLastOrder > 30
        ) {
            runtimeAlerts.push({
                id: "critical-inactive",
                severity: "warning",
                message: `Proveedor ${provider.dependencyLevel === "CRITICAL" ? "crítico" : "de alta dependencia"} sin pedidos desde hace ${daysSinceLastOrder} días`,
                action: { label: "Nuevo pedido", onClick: () => setShowNewOrderModal(true) },
            })
        }
        if (
            (provider.dependencyLevel === "CRITICAL" || provider.dependencyLevel === "HIGH") &&
            !provider.hasAlternative
        ) {
            runtimeAlerts.push({
                id: "no-contingency",
                severity: provider.dependencyLevel === "CRITICAL" ? "error" : "warning",
                message: `Sin plan de contingencia para proveedor ${provider.dependencyLevel === "CRITICAL" ? "crítico" : "de alta dependencia"}`,
            })
        }
        const overdueTasks = optimisticTasks.filter(
            (t) => t.status !== "DONE" && t.dueDate && new Date(t.dueDate) < new Date()
        )
        if (overdueTasks.length > 0) {
            runtimeAlerts.push({
                id: "overdue-tasks",
                severity: "warning",
                message: `${overdueTasks.length} tarea${overdueTasks.length > 1 ? "s" : ""} vencida${overdueTasks.length > 1 ? "s" : ""}`,
                action: { label: "Ver tareas", onClick: () => setActiveTab("tasks") },
            })
        }
        if (provider.monthlyCost && provider.monthlyCost > 0) {
            const now = new Date()
            const startOfMonthDate = startOfMonth(now)
            const paidThisMonth = orders
                .filter((o) => o.payment && new Date(o.payment.paymentDate) >= startOfMonthDate)
                .reduce((sum, o) => sum + (o.payment?.amount ?? 0), 0)
            if (paidThisMonth > provider.monthlyCost * 2) {
                runtimeAlerts.push({
                    id: "cost-anomaly",
                    severity: "warning",
                    message: `Gasto este mes (${formatCurrency(paidThisMonth)}) supera el doble del coste mensual estimado (${formatCurrency(provider.monthlyCost)})`,
                    action: { label: "Ver pedidos", onClick: () => setActiveTab("orders") },
                })
            }
        }
        runtimeAlerts.sort((a, b) => (a.severity === "error" ? 0 : 1) - (b.severity === "error" ? 0 : 1))
        const purchaseChartData: { month: string; gasto: number; pedidos: number }[] = []
        for (let i = 5; i >= 0; i--) {
            const d = subMonths(new Date(), i)
            const start = startOfMonth(d)
            const end = startOfMonth(subMonths(d, -1))
            const inMonth = orders.filter((o) => {
                const paid = o.payment?.amount
                if (!paid) return false
                const orderDate = new Date(o.orderDate).getTime()
                return orderDate >= start.getTime() && orderDate < end.getTime()
            })
            const gasto = inMonth.reduce((s, o) => s + (o.payment?.amount ?? 0), 0)
            purchaseChartData.push({
                month: format(d, "MMM", { locale: es }),
                gasto: Math.round(gasto * 100) / 100,
                pedidos: inMonth.length,
            })
        }
        const recentActivityText = lastOrder
            ? `Último pedido hace ${daysSinceLastOrder === 0 ? "menos de un día" : `${daysSinceLastOrder}d`}`
            : optimisticTasks.length > 0
                ? `${optimisticTasks.length} tarea${optimisticTasks.length === 1 ? "" : "s"}`
                : "Sin actividad reciente"
        const suggestedAction =
            pendingOrdersCount > 0
                ? { message: `Tienes ${pendingOrdersCount} ${labels.orders.plural.toLowerCase()} pendientes de recepción o pago.`, onClick: () => setActiveTab("orders") }
                : pendingTasksCount > 0
                    ? { message: `Hay ${pendingTasksCount} tareas de seguimiento que requieren tu atención.`, onClick: () => setActiveTab("tasks") }
                    : { message: "La operativa está al día. ¿Necesitas reponer stock?", onClick: () => setShowNewOrderModal(true) }
        return {
            daysSinceLastOrder,
            pendingPaymentsCount,
            operationalSubtext,
            purchaseChartData,
            runtimeAlerts,
            suggestedAction,
            recentActivityText,
        }
    }, [provider, orders, optimisticTasks, pendingOrdersCount, pendingTasksCount, formatCurrency, labels.orders.plural])

    const showPanel = open || embeddedInPage
    if (!showPanel) return null

    const isLight = !!embeddedInPage
    const headerBg = isLight ? "bg-white border-b border-neutral-100" : "bg-zinc-950 border-b border-white/10"
    const tabBarBg = isLight ? "bg-white border-b border-neutral-100" : "bg-zinc-950 border-b border-white/10"
    const tabActive = isLight ? "border-[var(--accent)] text-[var(--text-primary)] font-medium" : "border-blue-500 text-white"
    const tabInactive = isLight ? "border-transparent text-neutral-500 hover:text-neutral-900" : "border-transparent text-white/60 hover:text-white"
    const contentBg = isLight ? "flex-1 overflow-y-auto" : "flex-1 overflow-y-auto custom-scrollbar"

    const headerContent = (
        <>
            <div className="flex items-start gap-5">
                {!embeddedInPage && (
                    <div className={cn(
                        "h-12 w-12 rounded-lg flex items-center justify-center shrink-0",
                        "bg-white/5 border border-white/10"
                    )}>
                        <TypeIcon className="h-6 w-6 text-white/60" />
                    </div>
                )}
                <div className="min-w-0">
                    {embeddedInPage ? (
                        <h1 className={cn("text-xl font-semibold tracking-tight", isLight ? "text-neutral-900" : "text-white")}>
                            {provider.name}
                        </h1>
                    ) : (
                        <SheetTitle className="text-white text-xl">{provider.name}</SheetTitle>
                    )}
                    <div className="flex items-center gap-2 mt-3 flex-wrap">
                        <Badge className={cn("text-[10px] h-5 font-medium", statusConfig.color)}>
                            {statusConfig.label}
                        </Badge>
                        <Badge variant="outline" className={cn("text-[10px] h-5 font-medium", dependencyConfig.color)}>
                            Dep. {dependencyConfig.label}
                        </Badge>
                        {provider.isCritical && (
                            <Badge className="text-[10px] h-5 font-medium bg-red-600/20 text-red-400 border-red-500/30">
                                CRÍTICO
                            </Badge>
                        )}
                    </div>
                </div>
            </div>
            <div className="flex items-center gap-3">
                {embeddedInPage && (
                    <>
                        <Button
                            size="sm"
                            className="bg-[var(--accent)] hover:opacity-90 text-white shadow-sm"
                            onClick={() => setShowNewOrderModal(true)}
                        >
                            <ShoppingBag className="h-4 w-4 mr-1.5" />
                            Nuevo pedido
                        </Button>
                        <Button
                            variant="ghost"
                            size="sm"
                            className="text-neutral-500 hover:text-neutral-900 hover:bg-neutral-100"
                            onClick={() => setShowTaskDialog(true)}
                        >
                            <Plus className="h-3.5 w-3.5 mr-1" />
                            Nueva tarea
                        </Button>
                    </>
                )}
                {!embeddedInPage && (
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={onClose}
                        className="text-white/60 hover:text-white hover:bg-white/10"
                        title="Cerrar"
                    >
                        <X className="h-5 w-5" />
                    </Button>
                )}
            </div>
        </>
    )

    const innerContent = (
        <>
                    {/* Sheet layout: header + tabs + content */}
                    {!embeddedInPage && (
                        <>
                            <div className={cn("z-10 flex flex-col p-6 rounded-t-xl", headerBg)}>
                                <div className="flex items-start justify-between gap-6">
                                    {headerContent}
                                </div>
                            </div>
                            <div className={cn("px-6 sm:px-8", tabBarBg)}>
                                <div className="flex gap-1 overflow-x-auto -mb-px">
                                    {[
                                        { id: "summary", label: "Resumen" },
                                        { id: "orders", label: labels.orders.title + " y Pagos" },
                                        { id: "productos", label: "Productos" },
                                        { id: "plantillas", label: "Plantillas" },
                                        { id: "files", label: "Archivos" },
                                        { id: "tasks", label: labels.nav.tasks },
                                        { id: "timeline", label: "Timeline" }
                                    ].map((tab) => (
                                        <button
                                            key={tab.id}
                                            onClick={() => setActiveTab(tab.id as any)}
                                            className={cn(
                                                "px-4 py-3 text-sm font-medium border-b-2 transition-colors whitespace-nowrap",
                                                activeTab === tab.id ? tabActive : tabInactive
                                            )}
                                        >
                                            {tab.label}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </>
                    )}

                    {/* Page layout: Hero + KPIs + Tabs — mismo gap-4 que el padre (tabs → contenido) */}
                    {embeddedInPage && (
                        <div className="flex flex-col gap-4">
                            <div className="bg-white rounded-xl border border-neutral-100 shadow-[0_1px_2px_rgba(0,0,0,0.04)] overflow-hidden">
                                <div className="p-4 sm:p-5">
                                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                                        <div className="flex items-start gap-3 min-w-0">
                                            <div className="h-11 w-11 rounded-lg bg-neutral-100 border border-neutral-100 flex items-center justify-center shrink-0">
                                                <TypeIcon className="h-5 w-5 text-neutral-500" />
                                            </div>
                                            <div className="min-w-0">
                                                <h1 className="text-xl sm:text-2xl font-semibold text-neutral-900 tracking-tight">
                                                    {provider.name}
                                                </h1>
                                                {(provider.type || provider.contactEmail) && (
                                                    <p className="mt-0.5 text-xs text-neutral-500">
                                                        {[provider.type, provider.contactEmail].filter(Boolean).join(" · ")}
                                                    </p>
                                                )}
                                                <div className="flex items-center gap-2 mt-2 flex-wrap">
                                                    <Badge className={cn("text-[11px] h-5 font-medium", statusConfig.color)}>
                                                        {statusConfig.label}
                                                    </Badge>
                                                    <Badge variant="outline" className={cn("text-[11px] h-5 font-medium border-neutral-200 text-neutral-700", dependencyConfig.color)}>
                                                        Dep. {dependencyConfig.label}
                                                    </Badge>
                                                    {provider.isCritical && (
                                                        <Badge className="text-[11px] h-5 font-medium bg-red-50 text-red-600 border-red-200">
                                                            CRÍTICO
                                                        </Badge>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-2 shrink-0">
                                            <Button
                                                size="sm"
                                                className="bg-[var(--accent)] hover:opacity-90 text-white shadow-sm"
                                                onClick={() => setShowNewOrderModal(true)}
                                            >
                                                <ShoppingBag className="h-4 w-4 mr-1.5" />
                                                Nuevo pedido
                                            </Button>
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                className="border-neutral-200 text-neutral-700 hover:bg-neutral-50"
                                                onClick={() => setShowTaskDialog(true)}
                                            >
                                                <Plus className="h-4 w-4 mr-1.5" />
                                                Nueva tarea
                                            </Button>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* 4 KPI cards — grid independiente, estilo SaaS premium */}
                            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                                <div className="bg-white rounded-xl border border-neutral-100 shadow-[0_1px_2px_rgba(0,0,0,0.04)] p-4 min-h-[72px] flex flex-col justify-center">
                                    <p className="text-[11px] font-medium text-neutral-400 uppercase tracking-wider">Coste mensual</p>
                                    <p className="mt-1 text-lg font-semibold text-neutral-900 tracking-tight">
                                        {provider.monthlyCost != null ? formatCurrency(provider.monthlyCost) : "—"}
                                    </p>
                                </div>
                                <div className="bg-white rounded-xl border border-neutral-100 shadow-[0_1px_2px_rgba(0,0,0,0.04)] p-4 min-h-[72px] flex flex-col justify-center">
                                    <p className="text-[11px] font-medium text-neutral-400 uppercase tracking-wider">Último pedido</p>
                                    <p className="mt-1 text-lg font-semibold text-neutral-900 tracking-tight">
                                        {provider.lastOrderDate
                                            ? format(new Date(provider.lastOrderDate), "d MMM yyyy", { locale: es })
                                            : "—"}
                                    </p>
                                </div>
                                <div className="bg-white rounded-xl border border-neutral-100 shadow-[0_1px_2px_rgba(0,0,0,0.04)] p-4 min-h-[72px] flex flex-col justify-center">
                                    <p className="text-[11px] font-medium text-neutral-400 uppercase tracking-wider">Pendientes</p>
                                    <p className="mt-1 text-lg font-semibold text-neutral-900 tracking-tight">
                                        {pendingOrdersCount} ped · {pendingTasksCount} tar
                                    </p>
                                </div>
                                <div className="bg-white rounded-xl border border-neutral-100 shadow-[0_1px_2px_rgba(0,0,0,0.04)] p-4 min-h-[72px] flex flex-col justify-center">
                                    <p className="text-[11px] font-medium text-neutral-400 uppercase tracking-wider">Dependencia</p>
                                    <p className={cn(
                                        "mt-1 text-lg font-semibold tracking-tight",
                                        provider.dependencyLevel === "CRITICAL" ? "text-red-600" :
                                        provider.dependencyLevel === "HIGH" ? "text-amber-600" :
                                        provider.dependencyLevel === "MEDIUM" ? "text-blue-600" : "text-neutral-900"
                                    )}>
                                        {dependencyConfig.label}
                                    </p>
                                </div>
                            </div>

                            <div className="bg-white rounded-lg border border-neutral-100 shadow-[0_1px_2px_rgba(0,0,0,0.04)] overflow-hidden">
                                <div className="px-4 sm:px-5 flex justify-center overflow-x-auto -mb-px min-w-0">
                                    <div className="flex gap-1 flex-nowrap shrink-0">
                                        {[
                                            { id: "summary", label: "Resumen" },
                                            { id: "orders", label: labels.orders.title + " y Pagos" },
                                            { id: "productos", label: "Productos" },
                                            { id: "plantillas", label: "Plantillas" },
                                            { id: "files", label: "Archivos" },
                                            { id: "tasks", label: labels.nav.tasks },
                                            { id: "timeline", label: "Timeline" }
                                        ].map((tab) => (
                                            <button
                                                key={tab.id}
                                                onClick={() => setActiveTab(tab.id as any)}
                                                className={cn(
                                                    "px-3 py-2.5 text-sm font-medium border-b-2 transition-colors whitespace-nowrap shrink-0",
                                                    activeTab === tab.id ? "border-[var(--accent)] text-neutral-900 font-medium" : "border-transparent text-neutral-500 hover:text-neutral-900"
                                                )}
                                            >
                                                {tab.label}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            </div>
                            </div>
                    )}

                    {/* Scrollable Content — tabs delegados a componentes */}
                    <div className={contentBg}>
                        {orders.some((o) => o.status === "PENDING_SEND_CONFIRMATION") && !pendingConfirmOrder && (
                            <div className="mx-4 sm:mx-5 mt-3 flex items-center justify-between gap-3 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-900">
                                <span>Tienes un pedido pendiente de confirmar envío.</span>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    className="shrink-0 border-amber-300 hover:bg-amber-100"
                                    onClick={() => {
                                        const order = orders.find((o) => o.status === "PENDING_SEND_CONFIRMATION")
                                        if (order) setPendingConfirmOrder({ orderId: order.id, providerId: provider.id })
                                    }}
                                >
                                    Confirmar ahora
                                </Button>
                            </div>
                        )}
                        {activeTab === "summary" && (
                            <ProviderSummaryTab
                                isLight={isLight}
                                hasOrderEmail={!!provider.contactEmail?.trim()}
                                hasCatalog={products.length > 0}
                                hasDefaultTemplate={templates.some((t) => t.isDefault)}
                                onNewOrder={() => setShowNewOrderModal(true)}
                                onAddEmail={() => toast.info("Configura el correo del proveedor en la ficha de contacto.")}
                                onImportProducts={() => { setActiveTab("productos"); setShowImportProductsDialog(true) }}
                                onCreateTemplate={() => { setActiveTab("plantillas"); setTemplateToEdit(null); setShowTemplateDialog(true) }}
                                operationalSubtext={summaryData.operationalSubtext}
                                daysSinceLastOrder={summaryData.daysSinceLastOrder}
                                pendingOrdersCount={pendingOrdersCount}
                                productsCount={products.length}
                                pendingPaymentsCount={summaryData.pendingPaymentsCount}
                                loadingProducts={loadingProducts}
                                purchaseChartData={summaryData.purchaseChartData}
                                suggestionMessage={summaryData.suggestedAction.message}
                                suggestionOnClick={summaryData.suggestedAction.onClick}
                                runtimeAlerts={summaryData.runtimeAlerts}
                                onAddProduct={() => setShowProductDialog(true)}
                                onGoToProductos={() => setActiveTab("productos")}
                                onQuickOrder={() => setShowNewOrderModal(true)}
                                onQuickTask={() => setShowTaskDialog(true)}
                                onQuickNote={() => setShowNoteDialog(true)}
                                onQuickFile={() => { setFileUploadContext({ entityType: "PROVIDER", entityId: provider.id }); setShowFileDialog(true) }}
                                contactEmail={provider.contactEmail}
                                contactPhone={provider.contactPhone}
                                dependencyLevel={provider.dependencyLevel}
                                operationalState={provider.operationalState}
                                affectedArea={provider.affectedArea}
                                hasAlternative={provider.hasAlternative}
                                recentActivityText={summaryData.recentActivityText}
                                onViewTimeline={() => setActiveTab("timeline")}
                                notesContent={provider.notes}
                            />
                        )}

                        {activeTab === "orders" && (
                            <ProviderOrdersTab
                                isLight={isLight}
                                loading={loadingOrders}
                                orders={orders as import("@/modules/providers/types").ProviderOrderRow[]}
                                expandedOrderId={expandedOrderId}
                                labels={{ orders: { plural: (labels as any).orders?.plural ?? (labels as any).orders?.title ?? "Pedidos" }, providers: { actions: { newOrder: (labels as any).providers?.actions?.newOrder ?? "Nuevo pedido", markReceived: "Marcar recibido" } } }}
                                formatCurrency={formatCurrency}
                                fileCategoryLabel={fileCategoryLabel}
                                onNewOrder={() => setShowNewOrderModal(true)}
                                onExpandOrder={(id) => setExpandedOrderId(id || null)}
                                onMarkReceived={async (id) => { const r = await completeProviderOrder(id, "RECEIVED"); if (r.success) { loadData(); toast.success("Pedido marcado recibido") } else toast.error(r?.error) }}
                                onCancelOrder={async (id) => { const r = await cancelProviderOrder(id); if (r.success) { loadData(); toast.success("Pedido cancelado") } else toast.error(r?.error) }}
                                onRegisterPayment={(order) => setOrderForPayment(order)}
                                onUploadInvoice={(orderId) => { setFileUploadContext({ entityType: "ORDER", entityId: orderId, presetCategory: "INVOICE" }); setShowFileDialog(true) }}
                                onUploadOrderFile={(orderId) => { setFileUploadContext({ entityType: "ORDER", entityId: orderId, presetCategory: "ORDER" }); setShowFileDialog(true) }}
                                onPreviewFile={(file) => setSelectedFile(file)}
                                onDeleteFile={(file) => setFileToDelete(file)}
                                onConfirmSendOrder={(orderId) => setPendingConfirmOrder({ orderId, providerId: provider.id })}
                                onOpenDraft={(order) => { setDraftOrderIdToOpen(order.id); setShowNewOrderModal(true) }}
                                onDeleteOrder={async (orderId) => {
                                    const r = await deleteProviderOrder(orderId)
                                    if (r.success) { loadOrders(); loadData(); toast.success("Pedido eliminado") }
                                    else toast.error(r?.error ?? "Error al eliminar")
                                }}
                            />
                        )}

                        {activeTab === "productos" && (
                            <ProviderProductsTab
                                isLight={isLight}
                                loading={loadingProducts}
                                products={products as import("@/modules/providers/types").ProviderProductRow[]}
                                searchTerm={productSearchTerm}
                                onSearchChange={setProductSearchTerm}
                                onAddProduct={() => setShowProductDialog(true)}
                                onImport={() => setShowImportProductsDialog(true)}
                                onDownloadTemplate={() => {
                                    const headers = "codigo,nombre,categoria,unidad,precio,descripcion"
                                    const sample = "EJ-001,Ejemplo producto,Material,ud,10.50,Descripción opcional"
                                    const csv = [headers, sample].join("\n")
                                    const blob = new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8" })
                                    const url = URL.createObjectURL(blob)
                                    const a = document.createElement("a")
                                    a.href = url
                                    a.download = "plantilla-productos-proveedor.csv"
                                    a.click()
                                    URL.revokeObjectURL(url)
                                }}
                                onEdit={(p) => { setProductToEdit(p as ProviderProductRow); setShowEditProductDialog(true) }}
                                onToggleActive={async (p) => {
                                    const res = await updateProviderProduct(p.id, { isActive: !p.isActive })
                                    if (res.success) { loadProducts(); router.refresh(); toast.success(p.isActive ? "Producto desactivado" : "Producto activado") }
                                    else toast.error(res.error)
                                }}
                            />
                        )}

                        {activeTab === "plantillas" && (
                            <ProviderTemplatesTab
                                isLight={isLight}
                                loading={loadingTemplates}
                                templates={templates as import("@/modules/providers/types").ProviderTemplateRow[]}
                                onCreateTemplate={() => { setTemplateToEdit(null); setShowTemplateDialog(true) }}
                                onSetDefault={async (templateId) => {
                                    const res = await setDefaultProviderEmailTemplate(provider.id, templateId)
                                    if (res.success) { loadTemplates(); toast.success("Plantilla predeterminada"); router.refresh() }
                                    else toast.error(res.error)
                                }}
                                onEdit={(t) => { setTemplateToEdit(t); setShowTemplateDialog(true) }}
                                onDelete={async (t) => {
                                    if (!confirm("¿Eliminar esta plantilla?")) return
                                    const res = await deleteProviderEmailTemplate(t.id)
                                    if (res.success) { loadTemplates(); toast.success("Plantilla eliminada"); router.refresh() }
                                    else toast.error(res.error)
                                }}
                            />
                        )}

                        {activeTab === "files" && (
                            <ProviderFilesTab
                                isLight={isLight}
                                loadingFiles={loadingFiles}
                                loadingInvoices={loadingProviderInvoices}
                                providerInvoices={providerInvoices}
                                groupedFiles={filesData.grouped}
                                collapsedGroups={collapsedFileGroups}
                                formatCurrency={formatCurrency}
                                fileCategoryLabel={fileCategoryLabel}
                                onUploadProvider={() => { setFileUploadContext({ entityType: "PROVIDER", entityId: provider.id }); setShowFileDialog(true) }}
                                onUploadOrder={(orderId, presetCategory) => { setFileUploadContext({ entityType: "ORDER", entityId: orderId, presetCategory }); setShowFileDialog(true) }}
                                onUploadPayment={(paymentId) => { setFileUploadContext({ entityType: "PAYMENT", entityId: paymentId }); setShowFileDialog(true) }}
                                onToggleGroup={(key) => setCollapsedFileGroups((prev) => ({ ...prev, [key]: !prev[key] }))}
                                onPreviewFile={(file) => setSelectedFile(file)}
                                onDeleteFile={(file) => setFileToDelete(file)}
                            />
                        )}

                        {activeTab === "tasks" && (
                            <ProviderTasksTab
                                isLight={isLight}
                                loading={loadingTasks}
                                tasks={optimisticTasks}
                                isPending={isPending}
                                labels={labels}
                                onNewTask={() => setShowTaskDialog(true)}
                                onToggleTask={handleToggleTask}
                            />
                        )}

                        {activeTab === "timeline" && (
                            <ProviderTimelineTab
                                isLight={isLight}
                                loading={loadingTimeline}
                                events={timeline}
                                formatCurrency={formatCurrency}
                                onAddNote={() => setShowNoteDialog(true)}
                                onAddFile={() => { setFileUploadContext({ entityType: "PROVIDER", entityId: provider.id }); setShowFileDialog(true) }}
                                onNavigateToOrder={(orderId) => { setActiveTab("orders"); setExpandedOrderId(orderId) }}
                                onNavigateToPayment={(paymentId) => {
                                    setActiveTab("orders")
                                    const linked = orders.find((o) => o.payment?.id === paymentId)
                                    if (linked) setExpandedOrderId(linked.id)
                                }}
                                onNavigateToTask={() => setActiveTab("tasks")}
                                onViewNote={(content) => setSelectedNoteContent(content)}
                                onPreviewFile={(file) => setSelectedFile(file)}
                                onMarkOrderReceived={async (orderId) => {
                                    const res = await completeProviderOrder(orderId, "RECEIVED")
                                    if (res.success) {
                                        toast.success("Pedido marcado como recibido")
                                        loadTimeline()
                                        loadOrders()
                                    }
                                }}
                                onCancelOrder={async (orderId) => {
                                    const res = await cancelProviderOrder(orderId)
                                    if (res.success) {
                                        toast.success("Pedido cancelado")
                                        loadTimeline()
                                        loadOrders()
                                    }
                                }}
                                onResolveOrderIssue={async (orderId) => {
                                    const res = await completeProviderOrder(orderId, "RECEIVED")
                                    if (res.success) {
                                        toast.success("Incidencia resuelta")
                                        loadTimeline()
                                        loadOrders()
                                    }
                                }}
                                onToggleTask={async (taskId, completed) => {
                                    const res = await toggleProviderTaskStatus(taskId, completed)
                                    if (res.success) {
                                        toast.success(completed ? "Tarea completada" : "Tarea reabierta")
                                        loadTimeline()
                                        loadTasks()
                                    }
                                }}
                            />
                        )}
                    </div>
                </>
    )

    return (
        <>
            {embeddedInPage ? (
                <div className="w-full flex flex-col min-h-[50vh] gap-4">
                    {innerContent}
                </div>
            ) : (
                <Sheet open={open} onOpenChange={onClose}>
                    <SheetContent side="right" className="w-full sm:max-w-2xl bg-zinc-950 border-l border-white/10 p-0 flex flex-col focus:outline-none">
                        {innerContent}
                    </SheetContent>
                </Sheet>
            )}

            {/* Dialogs */}
            <RegisterOrderDialog
                open={showOrderDialog}
                onOpenChange={setShowOrderDialog}
                providerId={provider.id}
                providerName={provider.name}
                onSuccess={loadData}
            />

            <EditProviderProductDialog
                providerId={provider.id}
                providerName={provider.name}
                product={productToEdit}
                open={showEditProductDialog}
                onOpenChange={(o) => { if (!o) setProductToEdit(null); setShowEditProductDialog(o) }}
                onSuccess={loadProducts}
            />

            <ImportProductsDialog
                providerId={provider.id}
                providerName={provider.name}
                open={showImportProductsDialog}
                onOpenChange={setShowImportProductsDialog}
                onSuccess={loadProducts}
            />

            <CreateProviderOrderDialog
                open={showNewOrderModal}
                onOpenChange={(open) => { if (!open) setDraftOrderIdToOpen(null); setShowNewOrderModal(open) }}
                providerId={provider.id}
                providerName={provider.name}
                contactEmail={provider.contactEmail}
                products={products}
                templates={templates}
                initialDraftOrderId={draftOrderIdToOpen}
                onSaveDraft={() => { setShowNewOrderModal(false); setDraftOrderIdToOpen(null); loadOrders(); loadData() }}
                onCreateTemplate={() => { setShowNewOrderModal(false); setActiveTab("plantillas"); setTemplateToEdit(null); setShowTemplateDialog(true) }}
            />

            <ConfirmSendOrderModal
                open={!!pendingConfirmOrder && pendingConfirmOrder.providerId === provider.id}
                onOpenChange={(open) => { if (!open) setPendingConfirmOrder(null) }}
                onConfirmSent={async () => {
                    if (!pendingConfirmOrder) return
                    setConfirmSendLoading(true)
                    try {
                        // Ensure the order is in PENDING_SEND_CONFIRMATION before marking as SENT
                        const ensurePending = await updateProviderOrderStatus(pendingConfirmOrder.orderId, "PENDING_SEND_CONFIRMATION")
                        if (!ensurePending.success) {
                            toast.error(ensurePending.error ?? "No se pudo preparar el pedido para confirmar el envío.")
                            return
                        }

                        const res = await markOrderSent(pendingConfirmOrder.orderId)
                        if (res.success) {
                            clearPendingConfirmStorage()
                            setPendingConfirmOrder(null)
                            loadOrders()
                            loadData()
                            toast.success("Pedido marcado como enviado")
                        } else {
                            toast.error(res.error ?? "Error al actualizar")
                        }
                    } finally {
                        setConfirmSendLoading(false)
                    }
                }}
                onKeepEditing={async () => {
                    if (!pendingConfirmOrder) return
                    setConfirmSendLoading(true)
                    try {
                        const res = await updateProviderOrderStatus(pendingConfirmOrder.orderId, "DRAFT")
                        if (res.success) {
                            clearPendingConfirmStorage()
                            setPendingConfirmOrder(null)
                            loadOrders()
                            loadData()
                            toast.info("Pedido en borrador. Puedes seguir editándolo.")
                        } else {
                            toast.error(res.error ?? "Error al actualizar")
                        }
                    } finally {
                        setConfirmSendLoading(false)
                    }
                }}
                loading={confirmSendLoading}
            />

            <CreateTaskDialog
                open={showTaskDialog}
                onOpenChange={setShowTaskDialog}
                providerId={provider.id}
                providerName={provider.name}
                onSuccess={loadData}
            />

            <CreateProviderProductDialog
                open={showProductDialog}
                onOpenChange={setShowProductDialog}
                providerId={provider.id}
                providerName={provider.name}
                onSuccess={loadProducts}
            />

            <CreateEditTemplateDialog
                open={showTemplateDialog}
                onOpenChange={(open) => { setShowTemplateDialog(open); if (!open) setTemplateToEdit(null) }}
                providerId={provider.id}
                providerName={provider.name}
                template={templateToEdit}
                onSuccess={loadTemplates}
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
                    <div className="bg-teal-500/10 border border-teal-500/20 rounded-lg p-4 max-h-[60vh] overflow-y-auto">
                        <p className="text-sm text-white/90 whitespace-pre-wrap">{selectedNoteContent}</p>
                    </div>
                </DialogContent>
            </Dialog>

            {/* Modal: Registrar pago (RECEIVED/SENT → PAID solo vía pago) */}
            <Dialog open={!!orderForPayment} onOpenChange={(open) => !open && setOrderForPayment(null)}>
                <DialogContent className="max-w-md bg-[var(--bg-card)] border-[var(--border-main)]">
                    <DialogHeader>
                        <DialogTitle className="text-[var(--text-primary)] text-base sm:text-lg">
                            Marcar pedido como pagado
                        </DialogTitle>
                        <p className="text-xs text-[var(--text-secondary)]">
                            Registra el pago de este pedido. Puedes ajustar el importe o la fecha si es necesario.
                        </p>
                    </DialogHeader>
                    <form onSubmit={handleRegisterPaymentSubmit} className="space-y-4">
                        <div className="space-y-2">
                            <Label className="text-[var(--text-secondary)] text-xs font-medium">
                                Importe (€)
                            </Label>
                            <Input
                                type="number"
                                step="0.01"
                                min="0"
                                value={paymentForm.amount || ""}
                                onChange={(e) =>
                                    setPaymentForm((prev) => ({
                                        ...prev,
                                        amount: parseFloat(e.target.value) || 0,
                                    }))
                                }
                                className="bg-[var(--bg-main)] border-[var(--border-main)] text-[var(--text-primary)] placeholder:text-[var(--text-muted)]"
                                required
                            />
                        </div>
                        <div className="space-y-2">
                            <Label className="text-[var(--text-secondary)] text-xs font-medium">
                                Fecha de pago
                            </Label>
                            <Input
                                type="date"
                                value={paymentForm.paymentDate}
                                onChange={(e) =>
                                    setPaymentForm((prev) => ({
                                        ...prev,
                                        paymentDate: e.target.value,
                                    }))
                                }
                                className="bg-[var(--bg-main)] border-[var(--border-main)] text-[var(--text-primary)] placeholder:text-[var(--text-muted)]"
                                required
                            />
                        </div>
                        <div className="space-y-2">
                            <Label className="text-[var(--text-secondary)] text-xs font-medium">
                                Concepto (opcional)
                            </Label>
                            <Input
                                value={paymentForm.concept}
                                onChange={(e) =>
                                    setPaymentForm((prev) => ({
                                        ...prev,
                                        concept: e.target.value,
                                    }))
                                }
                                className="bg-[var(--bg-main)] border-[var(--border-main)] text-[var(--text-primary)] placeholder:text-[var(--text-muted)]"
                                placeholder="Ej: Pago pedido proveedor"
                            />
                        </div>
                        <DialogFooter className="pt-4 border-t border-[var(--border-subtle)]">
                            <Button
                                type="button"
                                variant="ghost"
                                onClick={() => setOrderForPayment(null)}
                                className="text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
                            >
                                {labels.common.cancel}
                            </Button>
                            <Button
                                type="submit"
                                disabled={paymentSubmitting}
                                className="bg-[var(--accent)] text-white hover:opacity-90"
                            >
                                {paymentSubmitting ? labels.common.loading : "Confirmar pago"}
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>
        </>
    )
}
