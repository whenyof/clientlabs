// @ts-nocheck
"use client"

import { useState, useEffect, useOptimistic, startTransition, useMemo, useRef, useCallback } from "react"
import type { Client } from "@prisma/client"
import { motion, AnimatePresence } from "framer-motion"
import {
    X, Mail, Phone, Tag as TagIcon, Clock, DollarSign, TrendingUp,
    MessageSquare, Edit3, Save, Plus, ShoppingCart, Bell, CheckSquare,
    AlertTriangle, Star, UserPlus, Sparkles
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from "@/components/ui/dialog"
import { formatDistanceToNow, formatDate } from "date-fns"
import { es } from "date-fns/locale"
import { toast } from "sonner"

import { useRouter } from "next/navigation"
import { deriveClientStatus } from "@/lib/logic/client-status"
import { formatCurrency, cn } from "@/lib/utils"
import { useSectorConfig } from "@/hooks/useSectorConfig"
import { usePanelConfig } from "@/core/panel-contract/usePanelConfig"
import { RiskLevelSelector } from "./RiskLevelSelector"
import { TraitsSelector } from "./TraitsSelector"
import { updateClientData, addClientNote, addClientPurchase, getClientTimeline, updateClientStatus, getClientSales } from "../actions"
import { getTasks, createTask, toggleTaskCompletion, deleteTask } from "@/app/dashboard/tasks/actions"
import { useAssistant } from "@/context/AssistantContext"


import { StatusBadgeSelector } from "./StatusBadgeSelector"
import { PaymentStatusBadge } from "./PaymentStatusBadge"
import { ReminderDialog } from "./ReminderDialog"
import { CallDialog } from "./CallDialog"
import { EnhancedTimeline } from "./EnhancedTimeline"
import { SaleSidePanel } from "./SaleSidePanel"
import { SaleDialog } from "./SaleDialog"
import { TaskDialog } from "@/components/tasks/TaskDialog"
import { TaskCard, type Task } from "@/components/tasks/TaskCard"

type ClientWithLead = Client & {
    convertedFromLead: {
        id: string
        name: string | null
        convertedAt: Date | null
    } | null
    Task?: { id: string }[]
    Sale?: { id: string }[]
    clientTraits?: string[]
    riskLevel?: string | null
    isForgotten?: boolean
    daysSinceActivity?: number
}

type TimelineEvent = {
    id: string
    type: string
    title: string
    description: string
    date: Date
    amount?: number
    notes?: string | null
    icon?: string
    severity?: 'info' | 'success' | 'warning' | 'error'
}

type ClientSidePanelProps = {
    client: ClientWithLead | null
    isOpen: boolean
    onClose: () => void
    onClientUpdate?: (clientId: string, data: Partial<ClientWithLead>) => void
}


export function ClientSidePanel({ client, isOpen, onClose, onClientUpdate }: ClientSidePanelProps) {
    const { labels, features } = useSectorConfig()
    const panelConfig = usePanelConfig('client')

    const [isEditing, setIsEditing] = useState(false)
    const [editData, setEditData] = useState({ source: "", notes: "" })
    const [note, setNote] = useState("")
    const router = useRouter()
    const [activeTab, setActiveTab] = useState<"timeline" | "tasks" | "sales" | "notes">("timeline")
    const [serverTimeline, setServerTimeline] = useState<TimelineEvent[]>([])
    const [optimisticEvents, setOptimisticEvents] = useState<TimelineEvent[]>([])
    const [loadingTimeline, setLoadingTimeline] = useState(false)
    const [isMounted, setIsMounted] = useState(false)

    useEffect(() => {
        setIsMounted(true)
    }, [])

    // Reset state when client changes
    useEffect(() => {
        setTasks([])
        setOptimisticEvents([])
        setServerTimeline([])
        setIsEditing(false)
        setNote("")
        setPurchaseData({ concept: "", amount: 0, date: new Date().toISOString().split("T")[0], note: "" })
    }, [client?.id])

    // Derived timeline with safe sorting and duplicate prevention
    const timeline = useMemo(() => {
        const filteredOptimistic = optimisticEvents.filter(optEvent => {
            const hasDuplicate = serverTimeline.some(serverEvent => {
                if (serverEvent.type !== optEvent.type) return false
                if (serverEvent.description !== optEvent.description) return false
                const timeDiff = Math.abs(
                    new Date(serverEvent.date).getTime() - new Date(optEvent.date).getTime()
                )
                return timeDiff < 5000
            })
            return !hasDuplicate
        })

        const merged = [...filteredOptimistic, ...serverTimeline]
        const uniqueById = Array.from(
            new Map(merged.map(event => [event.id, event])).values()
        )

        return uniqueById.sort((a, b) => {
            const dateA = new Date(a.date).getTime()
            const dateB = new Date(b.date).getTime()
            return dateB - dateA
        })
    }, [optimisticEvents, serverTimeline])

    const loadTimeline = async () => {
        if (!client) return
        setLoadingTimeline(true)
        try {
            const data = await getClientTimeline(client.id)
            setServerTimeline(data)
        } catch (error) {
            console.error("Error loading timeline:", error)
        } finally {
            setLoadingTimeline(false)
        }
    }
    const [purchaseDialog, setPurchaseDialog] = useState(false)
    const [purchaseData, setPurchaseData] = useState({
        concept: "",
        amount: 0,
        date: new Date().toISOString().split("T")[0],
        note: "",
    })
    const [reminderDialog, setReminderDialog] = useState(false)
    const [callDialog, setCallDialog] = useState(false)
    const [noteDialog, setNoteDialog] = useState(false)
    const [quickNote, setQuickNote] = useState("")
    const [sales, setSales] = useState<any[]>([])
    const [loadingSales, setLoadingSales] = useState(false)
    const [saleDialog, setSaleDialog] = useState(false)
    const [editingSale, setEditingSale] = useState<any | null>(null)

    // Task State
    const [tasks, setTasks] = useState<Task[]>([])
    const tasksRef = useRef(tasks)
    useEffect(() => { tasksRef.current = tasks }, [tasks])

    const [taskDialog, setTaskDialog] = useState(false)

    // Sale Panel State
    const [selectedSale, setSelectedSale] = useState<any | null>(null)
    const { setSuggestions, clearSuggestions } = useAssistant()
    const [isSalePanelOpen, setIsSalePanelOpen] = useState(false)

    const normalizeStatus = (status: any): "ACTIVE" | "FOLLOW_UP" | "INACTIVE" | "VIP" => {
        const validStatuses = ["ACTIVE", "FOLLOW_UP", "INACTIVE", "VIP"]
        return validStatuses.includes(status) ? status : "INACTIVE"
    }

    const [optimisticStatus, setOptimisticStatus] = useOptimistic(
        client ? normalizeStatus(client.status) : "ACTIVE",
        (_state, newStatus: string) => newStatus as "ACTIVE" | "FOLLOW_UP" | "INACTIVE" | "VIP"
    )

    const handleStatusChange = async (newStatus: "ACTIVE" | "FOLLOW_UP" | "INACTIVE" | "VIP") => {
        if (!client) return
        startTransition(() => {
            setOptimisticStatus(newStatus)
        })
        if (onClientUpdate) {
            onClientUpdate(client.id, { status: newStatus, updatedAt: new Date() })
        }
        try {
            await updateClientStatus(client.id, newStatus)
            toast.success("Estado actualizado correctamente")
        } catch (error) {
            toast.error("Error al actualizar estado")
        }
    }

    const handleOptimisticTaskCreate = async (data: any) => {
        if (!client) return

        const tempId = `temp-task-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
        const optimisticTask: Task = {
            id: tempId,
            ...data,
            status: "PENDING",
            createdAt: new Date(),
            clientId: client.id,
            userId: "current",
            updatedAt: new Date(),
            type: data.type || "MANUAL",
            title: data.title
        } as any

        let newTasks: Task[] = []
        setTasks(prev => {
            newTasks = [optimisticTask, ...prev]
            return newTasks
        })

        const tempClient = { ...client, Task: newTasks, status: optimisticStatus }
        const newStatus = deriveClientStatus(tempClient)

        if (newStatus !== optimisticStatus) {
            startTransition(() => {
                setOptimisticStatus(newStatus)
            })
        }

        if (onClientUpdate) {
            onClientUpdate(client.id, {
                status: newStatus,
                Task: newTasks.map(t => ({ id: t.id, status: t.status })),
                updatedAt: new Date()
            })
        }

        toast.success("Tarea creada")

        try {
            const res = await createTask(data)
            setTasks(prev => prev.map(t => t.id === tempId ? { ...t, id: (res as any).taskId } : t))
        } catch (error) {
            setTasks(prev => {
                const rolledBack = prev.filter(t => t.id !== tempId)
                const rbClient = { ...client, Task: rolledBack, status: client.status as any }
                const rbStatus = deriveClientStatus(rbClient)

                startTransition(() => {
                    setOptimisticStatus(rbStatus)
                })
                if (onClientUpdate) {
                    onClientUpdate(client.id, {
                        status: rbStatus,
                        Task: rolledBack.map(t => ({ id: t.id, status: t.status }))
                    })
                }
                return rolledBack
            })
            toast.error("Error al guardar tarea en servidor")
        }
    }

    useEffect(() => {
        if (client?.id && isOpen) {
            if (tasksRef.current.length === 0) {
                getTasks({ clientId: client.id }).then(fetchedTasks => {
                    const unique = Array.from(new Map(fetchedTasks.map(t => [t.id, t])).values())
                    setTasks(unique)
                })
            }
        }
    }, [client?.id, isOpen])

    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = "hidden"
        } else {
            document.body.style.overflow = "unset"
        }
        return () => {
            document.body.style.overflow = "unset"
        }
    }, [isOpen])

    useEffect(() => {
        if (client && isOpen) {
            setEditData({
                source: client.source || "",
                notes: client.notes || "",
            })
            loadTimeline()
            loadSales()
        }
    }, [client, isOpen])

    const loadSales = async () => {
        if (!client) return
        setLoadingSales(true)
        try {
            const data = await getClientSales(client.id)
            setSales(data)
        } catch (error) {
            console.error("Error loading sales:", error)
        } finally {
            setLoadingSales(false)
        }
    }

    const handleSaleSuccess = (newSale?: any) => {
        if (!client) return
        if (newSale) {
            const oldSale = sales.find(s => s.id === newSale.id);
            const isNew = !oldSale;
            setSales(prev => {
                if (isNew) return [newSale, ...prev];
                return prev.map(s => s.id === newSale.id ? newSale : s);
            });
            if (isNew) {
                const newEvent: TimelineEvent = {
                    id: newSale.id,
                    type: "SALE",
                    title: "Compra registrada",
                    description: newSale.product,
                    date: new Date(),
                    amount: newSale.total,
                    notes: newSale.notes,
                    icon: "shopping-cart"
                };
                setOptimisticEvents(prev => [newEvent, ...prev]);
            }
            if (onClientUpdate) {
                const isPaidStatus = (status: string) => status === 'PAID' || status === 'PAGADO';
                let diff = 0;
                if (isNew) {
                    if (isPaidStatus(newSale.status)) diff = Number(newSale.total);
                } else {
                    const wasPaid = isPaidStatus(oldSale.status);
                    const isNowPaid = isPaidStatus(newSale.status);
                    if (wasPaid && isNowPaid) diff = Number(newSale.total) - Number(oldSale.total);
                    else if (!wasPaid && isNowPaid) diff = Number(newSale.total);
                    else if (wasPaid && !isNowPaid) diff = -Number(oldSale.total);
                }
                const currentTotal = Number(client.totalSpent || 0)
                const newTotal = currentTotal + diff
                if (diff !== 0 || isNew) {
                    onClientUpdate(client.id, {
                        totalSpent: newTotal,
                        updatedAt: new Date(),
                        Sale: isNew ? [...(client.Sale || []), { id: newSale.id }] : client.Sale
                    })
                    router.refresh()
                }
            }
            if (isNew) {
                setTimeout(() => {
                    loadTimeline().then(() => {
                        setOptimisticEvents(prev => prev.filter(e => e.id !== newSale.id))
                    })
                }, 1000)
            }
        } else {
            loadSales()
            loadTimeline()
        }
    }

    const handleSaleClick = (sale: any) => {
        setSelectedSale(sale)
        setIsSalePanelOpen(true)
    }

    const handleSaleStatusChange = (saleId: string, newStatus: string) => {
        const sale = sales.find(s => s.id === saleId)
        if (!sale || !client) return
        const oldStatus = sale.status
        const isPaidStatus = (status: string) => status === 'PAID' || status === 'PAGADO'
        const isOldPaid = isPaidStatus(oldStatus)
        const isNewPaid = isPaidStatus(newStatus)
        let diff = 0
        if (isOldPaid && !isNewPaid) diff = -sale.total
        if (!isOldPaid && isNewPaid) diff = sale.total
        setSales(prev => prev.map(s => s.id === saleId ? { ...s, status: newStatus } : s))
        if (diff !== 0 && onClientUpdate) {
            const currentTotal = Number(client.totalSpent || 0)
            onClientUpdate(client.id, {
                totalSpent: currentTotal + diff,
                updatedAt: new Date()
            })
            router.refresh()
        }
    }

    const handleSaleDelete = (saleId: string) => {
        const sale = sales.find(s => s.id === saleId)
        if (!sale || !client) return
        const isPaidStatus = (status: string) => status === 'PAID' || status === 'PAGADO'
        const isPaid = isPaidStatus(sale.status)
        setSales(prev => prev.filter(s => s.id !== saleId))
        if (onClientUpdate) {
            const currentTotal = Number(client.totalSpent || 0)
            onClientUpdate(client.id, {
                totalSpent: isPaid ? currentTotal - (Number(sale.total) || 0) : currentTotal,
                updatedAt: new Date(),
                Sale: (client.Sale || []).filter((s: any) => s.id !== saleId)
            })
            router.refresh()
        }
    }

    const handleAddNote = async () => {
        if (!client || !note.trim()) return
        const tempId = `temp-note-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
        const newEvent: TimelineEvent = {
            id: tempId,
            type: "NOTE",
            title: "Nota añadida",
            description: note,
            date: new Date(),
            icon: "message-square"
        }
        setOptimisticEvents(prev => [newEvent, ...prev])
        const currentNote = note
        setNote("")
        if (onClientUpdate) {
            onClientUpdate(client.id, { updatedAt: new Date() })
        }
        try {
            await addClientNote(client.id, currentNote)
            toast.success("Nota añadida correctamente")
            setTimeout(() => {
                loadTimeline().then(() => {
                    setOptimisticEvents(prev => prev.filter(e => e.id !== tempId))
                })
            }, 1000)
        } catch (error) {
            toast.error("Error al añadir nota")
            setOptimisticEvents(prev => prev.filter(e => e.id !== tempId))
            setNote(currentNote)
        }
    }

    const handleQuickNote = async () => {
        if (!client || !quickNote.trim()) return
        const tempId = `temp-quick-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
        const newEvent: TimelineEvent = {
            id: tempId,
            type: "NOTE",
            title: "Nota añadida",
            description: quickNote,
            date: new Date(),
            icon: "message-square"
        }
        setOptimisticEvents(prev => [newEvent, ...prev])
        const currentQuickNote = quickNote
        setQuickNote("")
        setNoteDialog(false)
        if (onClientUpdate) {
            onClientUpdate(client.id, { updatedAt: new Date() })
        }
        try {
            await addClientNote(client.id, currentQuickNote)
            toast.success("Nota añadida")
            setTimeout(() => {
                loadTimeline().then(() => {
                    setOptimisticEvents(prev => prev.filter(e => e.id !== tempId))
                })
            }, 1000)
        } catch (error) {
            toast.error("Error al añadir nota")
            setOptimisticEvents(prev => prev.filter(e => e.id !== tempId))
            setQuickNote(currentQuickNote)
        }
    }

    const handleAddPurchase = async () => {
        if (!client || !purchaseData.concept || purchaseData.amount <= 0) {
            toast.error("Completa todos los campos")
            return
        }
        const previousTotal = client.totalSpent || 0
        const amount = purchaseData.amount
        const tempId = `temp-sale-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
        const optimisticSale = {
            id: tempId,
            product: purchaseData.concept,
            total: purchaseData.amount,
            notes: purchaseData.note,
            createdAt: new Date(),
            saleDate: new Date(purchaseData.date)
        }
        const newEvent: TimelineEvent = {
            id: tempId,
            type: "SALE",
            title: "Compra registrada",
            description: purchaseData.concept,
            date: new Date(),
            amount: purchaseData.amount,
            notes: purchaseData.note,
            icon: "shopping-cart"
        }
        setOptimisticEvents(prev => [newEvent, ...prev])
        setSales(prev => [optimisticSale, ...prev])
        setPurchaseDialog(false)
        setPurchaseData({ concept: "", amount: 0, date: new Date().toISOString().split("T")[0], note: "" })
        if (onClientUpdate) {
            onClientUpdate(client.id, { totalSpent: previousTotal + amount, updatedAt: new Date() })
        }
        try {
            await addClientPurchase(client.id, {
                concept: optimisticSale.product,
                amount: amount,
                date: new Date(optimisticSale.saleDate),
                note: optimisticSale.notes,
            })
            toast.success("Compra registrada correctamente")
            setTimeout(() => {
                loadTimeline().then(() => {
                    setOptimisticEvents(prev => prev.filter(e => e.id !== tempId))
                })
                loadSales()
            }, 1000)
        } catch (error) {
            toast.error("Error al registrar compra")
            setOptimisticEvents(prev => prev.filter(e => e.id !== tempId))
            setSales(prev => prev.filter(s => s.id !== tempId))
            if (onClientUpdate) {
                onClientUpdate(client.id, { totalSpent: previousTotal, updatedAt: new Date() })
            }
        }
    }

    const handleTraitsChange = async (newTraits: string[]) => {
        if (!client) return
        onClientUpdate?.(client.id, { clientTraits: newTraits })
        try {
            await updateClientData(client.id, { clientTraits: newTraits })
        } catch (error) {
            toast.error("Error al actualizar perfil")
        }
    }

    const handleRiskChange = async (newRisk: string) => {
        if (!client) return
        onClientUpdate?.(client.id, { riskLevel: newRisk })
        try {
            const riskLabels = { LOW: "🟢 Buen momento", MEDIUM: "🟠 Sin contacto", HIGH: "🔴 Riesgo perderlo" }
            const timestamp = new Date().toISOString()
            const logEntry = `\n[SYSTEM:${timestamp}] Cambio de Riesgo: ${riskLabels[newRisk as keyof typeof riskLabels]}`
            await updateClientData(client.id, {
                riskLevel: newRisk,
                notes: (client.notes || "") + logEntry
            })
            toast.success("Prioridad actualizada")
        } catch (error) {
            toast.error("Error al actualizar prioridad")
        }
    }

    const processTaskChange = useCallback((nextTasks: Task[]) => {
        setTasks(nextTasks)
        if (!client) return
        const tempClient = { ...client, Task: nextTasks, status: optimisticStatus }
        const newStatus = deriveClientStatus(tempClient)

        if (newStatus !== optimisticStatus) {
            startTransition(() => {
                setOptimisticStatus(newStatus)
            })
        }
        if (onClientUpdate) {
            onClientUpdate(client.id, {
                status: newStatus,
                Task: nextTasks.map(t => ({ id: t.id, status: t.status })),
                updatedAt: new Date()
            })
        }
        if (newStatus !== optimisticStatus) {
            updateClientStatus(client.id, newStatus).catch(console.error)
        }
    }, [client, optimisticStatus, onClientUpdate, setOptimisticStatus])

    const handleTaskUpdate = useCallback(async (taskId: string, status: "PENDING" | "DONE") => {
        const currentTasks = tasksRef.current
        const taskToUpdate = currentTasks.find(t => t.id === taskId)
        if (!taskToUpdate) return
        const nextTasks: Task[] = currentTasks.map(t =>
            t.id === taskId ? { ...t, status: status as Task["status"] } : t
        )
        processTaskChange(nextTasks)
        try {
            await toggleTaskCompletion(taskId, status === "DONE")
        } catch (err) {
            console.error("Failed to update task", err)
            toast.error("Error al actualizar tarea")
            const revertedTasks: Task[] = tasksRef.current.map(t =>
                t.id === taskId ? { ...t, status: taskToUpdate.status } : t
            )
            processTaskChange(revertedTasks)
        }
    }, [processTaskChange])

    const handleTaskDelete = useCallback(async (taskId: string) => {
        const currentTasks = tasksRef.current
        const taskToDelete = currentTasks.find(t => t.id === taskId)
        if (!taskToDelete) return
        const nextTasks = currentTasks.filter(t => t.id !== taskId)
        processTaskChange(nextTasks)
        try {
            await deleteTask(taskId)
            toast.success("Tarea eliminada")
        } catch (err) {
            console.error("Failed to delete task", err)
            toast.error("Error al eliminar tarea")
            const revertedTasks = [...tasksRef.current, taskToDelete]
            processTaskChange(revertedTasks)
        }
    }, [processTaskChange])

    const handleTaskSuccess = useCallback((newTask: Task, replaceId?: string) => {
        const currentTasks = tasksRef.current
        let nextTasks = [...currentTasks]
        if (replaceId) {
            nextTasks = nextTasks.filter(t => t.id !== replaceId)
        }
        const exists = nextTasks.some(t => t.id === newTask.id)
        if (exists) {
            nextTasks = nextTasks.map(t => t.id === newTask.id ? newTask : t)
        } else {
            nextTasks = [newTask, ...nextTasks]
        }
        processTaskChange(nextTasks)
    }, [processTaskChange])

    const dismissedSuggestions = useMemo(() => {
        if (!client?.notes) return [];
        const match = client.notes.match(/\[DISMISSED_SUGGESTIONS:([^\]]+)\]/);
        return match ? match[1].split(",") : [];
    }, [client?.notes]);

    const suggestions = useMemo(() => {
        if (!client) return [];
        const list = [];
        const status = optimisticStatus;
        const hasSales = (client.Sale && client.Sale.length > 0) || (client.totalSpent || 0) > 0;
        const hasTasks = tasks.length > 0;
        const isForgotten = (client as any).isForgotten;
        const daysSinceActivity = (client as any).daysSinceActivity || 0;

        if (isForgotten) {
            list.push({
                id: "forgotten",
                priority: "high" as const,
                icon: AlertTriangle,
                text: `Este cliente lleva ${daysSinceActivity} días sin seguimiento`,
                actionLabel: "Crear tarea",
                onAction: () => setTaskDialog(true)
            });
        }
        if (status === "FOLLOW_UP" && !hasTasks) {
            list.push({
                id: "followup_no_tasks",
                priority: "high" as const,
                icon: CheckSquare,
                text: "Cliente en seguimiento pero sin tareas pendientes",
                actionLabel: "Programar tarea",
                onAction: () => setTaskDialog(true)
            });
        }
        if (status === "ACTIVE" && !hasSales) {
            list.push({
                id: "active_no_sales",
                priority: "medium" as const,
                icon: DollarSign,
                text: "Cliente activo pero sin compras registradas",
                actionLabel: "Registrar venta",
                onAction: () => setSaleDialog(true)
            });
        }
        if (status === "VIP" && daysSinceActivity > 7) {
            list.push({
                id: "vip_no_contact",
                priority: "medium" as const,
                icon: Star,
                text: "VIP sin contacto reciente (más de 7 días)",
                actionLabel: "Llamar ahora",
                onAction: () => setCallDialog(true)
            });
        }
        if (daysSinceActivity <= 1 && !hasTasks && !hasSales) {
            list.push({
                id: "new_client",
                priority: "low" as const,
                icon: UserPlus,
                text: "Nuevo cliente: Inicia el primer contacto",
                actionLabel: "Enviar email",
                onAction: () => {
                    if (client.email) window.location.href = `mailto:${client.email}`;
                }
            });
        }
        return list.filter(s => !dismissedSuggestions.includes(s.id)).slice(0, 2);
    }, [client, optimisticStatus, tasks, dismissedSuggestions]);

    useEffect(() => {
        if (isOpen && suggestions.length > 0) {
            setSuggestions(suggestions);
        }
        return () => {
            clearSuggestions();
        }
    }, [isOpen, suggestions, setSuggestions, clearSuggestions]);

    if (!client) return null

    const thirtyDaysAgo = new Date()
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)
    const displayLastActivity = client.updatedAt || client.createdAt
    const displayTotalSpent = client.totalSpent || 0
    const isActive = displayLastActivity >= thirtyDaysAgo
    const isForgottenBadge = (client as any).isForgotten
    const daysSinceActivityBadge = (client as any).daysSinceActivity || 0

    return (
        <>
            <TaskDialog
                open={taskDialog}
                onOpenChange={setTaskDialog}
                clientId={client.id}
                onSubmit={handleOptimisticTaskCreate}
            />

            <ReminderDialog
                clientId={client.id}
                isOpen={reminderDialog}
                onClose={() => setReminderDialog(false)}
                onSuccess={(task, replaceId) => {
                    if (task) handleTaskSuccess(task, replaceId)
                    loadTimeline()
                }}
            />

            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40"
                        onClick={onClose}
                    />
                )}
            </AnimatePresence>

            <motion.div
                initial={{ x: "100%" }}
                animate={{ x: isOpen ? 0 : "100%" }}
                transition={{ type: "spring", stiffness: 350, damping: 35, mass: 0.8 }}
                className={`fixed inset-y-0 right-0 w-full md:w-[600px] bg-zinc-950 border-l border-white/10 shadow-2xl z-50 ${isOpen ? "pointer-events-auto" : "pointer-events-none"}`}
            >
                <div className="h-full flex flex-col overflow-hidden bg-zinc-950">
                    <div className="p-8 border-b border-white/5 bg-gradient-to-b from-white/5 to-transparent shrink-0">
                        <div className="flex items-start justify-between mb-6">
                            <div className="flex-1">
                                <div className="flex flex-wrap items-center gap-3 mb-3">
                                    <h2 className="text-3xl font-bold text-white tracking-tight">{client.name || "Sin nombre"}</h2>
                                    <div className="flex items-center gap-2">
                                        <StatusBadgeSelector
                                            currentStatus={optimisticStatus as "ACTIVE" | "FOLLOW_UP" | "INACTIVE" | "VIP"}
                                            onStatusChange={handleStatusChange}
                                        />
                                        <RiskLevelSelector
                                            currentLevel={(client as any).riskLevel || "LOW"}
                                            onChange={handleRiskChange}
                                        />
                                    </div>
                                </div>
                                <div className="mb-6">
                                    <div className="flex items-center gap-2 mb-2">
                                        <Sparkles className="h-3 w-3 text-indigo-400" />
                                        <p className="text-[10px] font-bold text-white/20 uppercase tracking-[0.2em] leading-none">Perfil Humano</p>
                                    </div>
                                    <TraitsSelector
                                        traits={(client as any).clientTraits || []}
                                        onChange={handleTraitsChange}
                                    />
                                </div>
                                <p className="text-sm text-white/40 mb-4">
                                    Cliente desde {isMounted ? formatDistanceToNow(client.createdAt, { addSuffix: true, locale: es }) : ""}
                                </p>
                                <div className="flex flex-wrap gap-4">
                                    {client.email && (
                                        <a href={`mailto:${client.email}`} className="text-sm text-white/60 hover:text-blue-400 transition-colors flex items-center gap-2 group">
                                            <div className="p-1.5 rounded-md bg-white/5 group-hover:bg-blue-500/10 transition-colors">
                                                <Mail className="h-3.5 w-3.5" />
                                            </div>
                                            {client.email}
                                        </a>
                                    )}
                                    {client.phone && (
                                        <a href={`tel:${client.phone}`} className="text-sm text-white/60 hover:text-green-400 transition-colors flex items-center gap-2 group">
                                            <div className="p-1.5 rounded-md bg-white/5 group-hover:bg-green-500/10 transition-colors">
                                                <Phone className="h-3.5 w-3.5" />
                                            </div>
                                            {client.phone}
                                        </a>
                                    )}
                                </div>
                            </div>
                            <button onClick={onClose} className="p-2.5 hover:bg-white/10 rounded-xl transition-all text-white/40 hover:text-white">
                                <X className="h-5 w-5" />
                            </button>
                        </div>
                        <div className="flex gap-3">
                            <Button onClick={() => setNoteDialog(true)} className="flex-1 bg-white/5 border border-white/10 hover:bg-white/10 h-11 rounded-xl">
                                <MessageSquare className="h-4 w-4 mr-2 text-blue-400" /> Nota
                            </Button>
                            <Button onClick={() => setReminderDialog(true)} className="flex-1 bg-white/5 border border-white/10 hover:bg-white/10 h-11 rounded-xl">
                                <Bell className="h-4 w-4 mr-2 text-amber-400" /> Recordatorio
                            </Button>
                            <Button onClick={() => setCallDialog(true)} className="flex-1 bg-white/5 border border-white/10 hover:bg-white/10 h-11 rounded-xl">
                                <Phone className="h-4 w-4 mr-2 text-green-400" /> Llamada
                            </Button>
                            <Button onClick={() => setSaleDialog(true)} className="flex-1 bg-indigo-600 hover:bg-indigo-500 text-white h-11 rounded-xl border-none">
                                <DollarSign className="h-4 w-4 mr-2" /> Venta
                            </Button>
                        </div>
                    </div>

                    <div className="flex-1 overflow-y-auto custom-scrollbar bg-zinc-950 pb-20">
                        <div className="px-8 pt-6 sticky top-0 bg-zinc-950 z-20 pb-4">
                            <div className="flex bg-white/5 p-1 rounded-xl border border-white/10 backdrop-blur-md">
                                <button
                                    onClick={() => setActiveTab("timeline")}
                                    className={cn(
                                        "flex-1 flex items-center justify-center gap-2 py-2.5 text-xs font-bold rounded-lg transition-all",
                                        activeTab === "timeline" ? "bg-white text-black shadow-xl" : "text-white/40 hover:text-white/60"
                                    )}
                                >
                                    <Clock className="h-3.5 w-3.5" /> Timeline
                                </button>
                                {panelConfig.featureFlags.hasTasks && (
                                    <button
                                        onClick={() => setActiveTab("tasks")}
                                        className={cn(
                                            "flex-1 flex items-center justify-center gap-2 py-2.5 text-xs font-bold rounded-lg transition-all",
                                            activeTab === "tasks" ? "bg-white text-black shadow-xl" : "text-white/40 hover:text-white/60"
                                        )}
                                    >
                                        <CheckSquare className="h-3.5 w-3.5" /> Tareas
                                    </button>
                                )}
                                {features.modules.sales && (
                                    <button
                                        onClick={() => setActiveTab("sales")}
                                        className={cn(
                                            "flex-1 flex items-center justify-center gap-2 py-2.5 text-xs font-bold rounded-lg transition-all",
                                            activeTab === "sales" ? "bg-white text-black shadow-xl" : "text-white/40 hover:text-white/60"
                                        )}
                                    >
                                        <ShoppingCart className="h-3.5 w-3.5" /> {labels.orders.plural}
                                    </button>
                                )}
                                {panelConfig.featureFlags.hasNotes && (
                                    <button
                                        onClick={() => setActiveTab("notes")}
                                        className={cn(
                                            "flex-1 flex items-center justify-center gap-2 py-2.5 text-xs font-bold rounded-lg transition-all",
                                            activeTab === "notes" ? "bg-white text-black shadow-xl" : "text-white/40 hover:text-white/60"
                                        )}
                                    >
                                        <MessageSquare className="h-3.5 w-3.5" /> Notas
                                    </button>
                                )}
                            </div>
                        </div>

                        <div className="p-8 border-b border-white/5">
                            <div className="bg-white/5 rounded-2xl p-5 border border-white/5 shadow-inner">
                                <div className="grid grid-cols-2 md:grid-cols-3 gap-y-6 gap-x-4">
                                    <div className="space-y-1">
                                        <p className="text-[10px] font-bold text-white/30 uppercase tracking-wider">Estado</p>
                                        <div className="flex items-center">
                                            {client.status === "ACTIVE" && <span className="text-sm font-bold text-emerald-400">Activo</span>}
                                            {client.status === "FOLLOW_UP" && <span className="text-sm font-bold text-blue-400">Seguimiento</span>}
                                            {client.status === "INACTIVE" && <span className="text-sm font-bold text-zinc-500">Inactivo</span>}
                                            {client.status === "VIP" && <span className="text-sm font-bold text-amber-400">VIP</span>}
                                        </div>
                                    </div>
                                    <div className="space-y-1">
                                        <p className="text-[10px] font-bold text-white/30 uppercase tracking-wider">Total Facturado</p>
                                        <p className="text-sm font-bold text-white tracking-tight">
                                            {isMounted ? formatCurrency(displayTotalSpent, client.currency || 'EUR') : ""}
                                        </p>
                                    </div>
                                    <div className="space-y-1">
                                        <p className="text-[10px] font-bold text-white/30 uppercase tracking-wider">Compras</p>
                                        <p className="text-sm font-bold text-white">
                                            {sales.length} <span className="text-white/30 font-normal">items</span>
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {isForgottenBadge && (
                            <div className="m-8 bg-amber-500/10 border border-amber-500/20 p-4 rounded-2xl">
                                <div className="flex items-start gap-4">
                                    <AlertTriangle className="h-5 w-5 text-amber-500" />
                                    <div>
                                        <h4 className="text-sm font-bold text-amber-500">Sin seguimiento activo</h4>
                                        <p className="text-xs text-amber-500/70 mt-1">No hay actividad desde hace {daysSinceActivityBadge} días.</p>
                                    </div>
                                </div>
                            </div>
                        )}

                        <div className="p-8 space-y-12">
                            {activeTab === "timeline" && (
                                <div className="relative pl-2">
                                    <EnhancedTimeline events={timeline} />
                                </div>
                            )}

                            {activeTab === "tasks" && (
                                <div className="space-y-6">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-2">
                                            <CheckSquare className="h-4 w-4 text-indigo-400" />
                                            <h3 className="text-xs font-bold text-white/40 uppercase tracking-[0.2em]">Tareas Pendientes</h3>
                                        </div>
                                        <Button onClick={() => setTaskDialog(true)} size="sm" className="bg-indigo-600 text-white rounded-xl">
                                            <Plus className="h-3.5 w-3.5 mr-2" /> Crear Tarea
                                        </Button>
                                    </div>
                                    <div className="space-y-3">
                                        {tasks.map(task => (
                                            <TaskCard key={task.id} task={task} onUpdate={handleTaskUpdate} onDelete={handleTaskDelete} />
                                        ))}
                                        {tasks.length === 0 && (
                                            <div className="text-center py-8 border border-dashed border-white/5 rounded-2xl">
                                                <p className="text-xs text-white/30">No hay tareas pendientes</p>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}

                            {activeTab === "sales" && (
                                <div className="space-y-6">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-2">
                                            <ShoppingCart className="h-4 w-4 text-emerald-400" />
                                            <h3 className="text-xs font-bold text-white/40 uppercase tracking-[0.2em]">Historial de {labels.orders.plural}</h3>
                                        </div>
                                        <Button onClick={() => setSaleDialog(true)} size="sm" className="bg-emerald-600 text-white rounded-xl">
                                            <Plus className="h-3.5 w-3.5 mr-2" /> {labels.orders.singular}
                                        </Button>
                                    </div>
                                    <div className="space-y-3">
                                        {sales.map(sale => (
                                            <div key={sale.id} className="p-4 rounded-2xl bg-white/5 border border-white/5 cursor-pointer" onClick={() => handleSaleClick(sale)}>
                                                <div className="flex justify-between items-start">
                                                    <div>
                                                        <p className="font-bold text-white text-sm">{sale.product}</p>
                                                        <p className="text-[10px] text-white/40 mt-1">{isMounted ? formatDate(new Date(sale.saleDate), "dd MMM yyyy", { locale: es }) : ""}</p>
                                                    </div>
                                                    <p className="font-bold text-white text-sm">{formatCurrency(sale.total, sale.currency || 'EUR')}</p>
                                                </div>
                                                <div className="mt-4 pt-3 border-t border-white/5 flex items-center justify-between">
                                                    <PaymentStatusBadge saleId={sale.id} initialStatus={sale.status} onStatusChange={(newStatus) => handleSaleStatusChange(sale.id, newStatus)} />
                                                    <Clock className="h-3 w-3 text-white/20" />
                                                </div>
                                            </div>
                                        ))}
                                        {sales.length === 0 && (
                                            <div className="text-center py-8 border border-dashed border-white/5 rounded-2xl">
                                                <p className="text-xs text-white/30">No hay registros</p>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}

                            {activeTab === "notes" && (
                                <div className="space-y-6">
                                    <div className="flex items-center gap-2">
                                        <MessageSquare className="h-4 w-4 text-blue-400" />
                                        <h3 className="text-xs font-bold text-white/40 uppercase tracking-[0.2em]">Notas</h3>
                                    </div>
                                    <div className="space-y-4">
                                        <Textarea
                                            placeholder="Escribir nota..."
                                            value={note}
                                            onChange={(e) => setNote(e.target.value)}
                                            className="bg-white/5 border-white/10 text-white min-h-[100px] rounded-2xl"
                                        />
                                        <div className="flex justify-end">
                                            <Button onClick={handleAddNote} disabled={!note.trim()} className="bg-white text-black rounded-xl">Guardar Nota</Button>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </motion.div>

            <CallDialog
                clientId={client.id}
                isOpen={callDialog}
                onClose={() => setCallDialog(false)}
                onSuccess={() => {
                    const tempId = `temp-call-${Date.now()}`
                    setOptimisticEvents(prev => [{
                        id: tempId,
                        type: "CALL",
                        title: "Llamada",
                        description: "Interacción registrada",
                        date: new Date(),
                        icon: "phone"
                    }, ...prev])
                    if (onClientUpdate) onClientUpdate(client.id, { updatedAt: new Date() })
                    setTimeout(() => {
                        loadTimeline().then(() => {
                            setOptimisticEvents(prev => prev.filter(e => e.id !== tempId))
                        })
                    }, 1000)
                }}
            />

            <Dialog open={noteDialog} onOpenChange={setNoteDialog}>
                <DialogContent className="bg-zinc-900 border-white/10">
                    <DialogHeader><DialogTitle className="text-white">Añadir Nota Rápida</DialogTitle></DialogHeader>
                    <div className="py-4">
                        <Textarea
                            value={quickNote}
                            onChange={(e) => setQuickNote(e.target.value)}
                            placeholder="Escribe una nota..."
                            className="bg-white/5 border-white/10 text-white"
                            rows={4}
                            autoFocus
                        />
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setNoteDialog(false)} className="bg-white/5 border-white/10 text-white">Cancelar</Button>
                        <Button onClick={handleQuickNote} disabled={!quickNote.trim()} className="bg-blue-600">Añadir Nota</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            <SaleDialog
                clientId={client.id}
                sale={editingSale}
                isOpen={saleDialog}
                onClose={handleCloseSaleDialog}
                onSuccess={handleSaleSuccess}
            />

            <SaleSidePanel
                sale={selectedSale}
                isOpen={isSalePanelOpen}
                onClose={() => setIsSalePanelOpen(false)}
                onStatusChange={handleSaleStatusChange}
                onDelete={handleSaleDelete}
            />
        </>
    )
}
