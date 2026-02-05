"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Plus, Check, Clock, AlertTriangle, X, ShoppingBag, FileText, Calendar as CalendarIcon, DollarSign } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { toast } from "sonner"
import { format } from "date-fns"
import { es } from "date-fns/locale"
import { cn } from "@/lib/utils"
// import { Calendar } from "@/components/ui/calendar"
import { createProviderOrder, getProviderOrders, completeProviderOrder, cancelProviderOrder } from "@/app/dashboard/providers/actions"

type Order = {
    id: string
    orderDate: Date
    status: "PENDING" | "COMPLETED" | "RECEIVED" | "CANCELLED" | "PAID" | "DELAYED"
    type: "ONE_TIME" | "RECURRING" | "ONE_OFF" | "MATERIAL" | "SERVICE" | "SUBSCRIPTION"
    description?: string | null
    amount?: number | null
    expectedDeliveryDate?: Date | null
}

interface ProviderOrdersProps {
    providerId: string
    isCompact?: boolean
}

export function ProviderOrders({ providerId, isCompact = false }: ProviderOrdersProps) {
    const [orders, setOrders] = useState<Order[]>([])
    const [loading, setLoading] = useState(true)
    const [isCreating, setIsCreating] = useState(false)
    const [newOrder, setNewOrder] = useState<{
        type: "ONE_OFF" | "RECURRING" | "URGENT"
        description: string
        amount: string
        orderDate: Date
        expectedDeliveryDate?: Date
        createPayment: boolean
    }>({
        type: "ONE_OFF",
        description: "",
        amount: "",
        orderDate: new Date(),
        createPayment: false
    })

    const loadOrders = async () => {
        setLoading(true)
        const result = await getProviderOrders(providerId)
        if (result.success && result.orders) {
            setOrders(result.orders.map((o: any) => ({
                ...o,
                orderDate: new Date(o.orderDate),
                expectedDeliveryDate: o.expectedDeliveryDate ? new Date(o.expectedDeliveryDate) : null
            })))
        }
        setLoading(false)
    }

    useEffect(() => {
        loadOrders()
    }, [providerId])

    const handleCreate = async () => {
        if (!newOrder.description) {
            toast.error("Añade una descripción")
            return
        }
        if (!newOrder.amount) {
            toast.error("Indica el importe del pedido")
            return
        }

        // Map local type to Prisma enum (ONE_OFF/URGENT -> ONE_TIME)
        const prismaType = newOrder.type === 'RECURRING' ? 'RECURRING' : 'ONE_TIME'

        const result = await createProviderOrder({
            providerId,
            orderDate: newOrder.orderDate,
            expectedDeliveryDate: newOrder.expectedDeliveryDate,
            type: prismaType as any,
            description: newOrder.description,
            amount: parseFloat(newOrder.amount),
            status: "PENDING",
        })

        if (result.success) {
            toast.success("Pedido creado correctamente")
            setIsCreating(false)
            setNewOrder({
                type: "ONE_OFF",
                description: "",
                amount: "",
                orderDate: new Date(),
                createPayment: false
            })
            // Optimistic update
            loadOrders()
        } else {
            toast.error("Error al crear pedido")
        }
    }

    const getStatusColor = (status: string) => {
        switch (status) {
            case "COMPLETED":
            case "PAID": return "bg-green-500/10 text-green-400 border-green-500/20"
            case "RECEIVED": return "bg-blue-500/10 text-blue-400 border-blue-500/20"
            case "PENDING": return "bg-amber-500/10 text-amber-400 border-amber-500/20"
            case "CANCELLED": return "bg-zinc-500/10 text-zinc-400 border-zinc-500/20"
            case "DELAYED": return "bg-red-500/10 text-red-400 border-red-500/20"
            default: return "bg-zinc-500/10 text-zinc-400"
        }
    }

    const getStatusLabel = (status: string) => {
        switch (status) {
            case "COMPLETED":
            case "PAID": return "Pagado"
            case "RECEIVED": return "Recibido"
            case "PENDING": return "Pendiente"
            case "CANCELLED": return "Cancelado"
            case "DELAYED": return "Retrasado"
            default: return status
        }
    }

    const getTypeLabel = (type: string) => {
        switch (type) {
            case "ONE_TIME":
            case "ONE_OFF": return "Puntual"
            case "RECURRING":
            case "SUBSCRIPTION": return "Recurrente"
            case "MATERIAL": return "Material"
            case "SERVICE": return "Servicio"
            default: return type
        }
    }

    // 🔥 DEBUG: Log when these actions are called
    const handleCompleteOrder = async (orderId: string, newStatus: "COMPLETED" | "RECEIVED") => {
        console.log("🔥🔥🔥 PROVIDER_ORDERS - handleCompleteOrder CALLED 🔥🔥🔥", { orderId, newStatus })
        try {
            const result = await completeProviderOrder(orderId, newStatus)
            console.log("🔥 completeProviderOrder RESULT:", result)
            if (result.success) {
                toast.success(newStatus === "RECEIVED" ? "Pedido marcado como recibido" : "Pedido marcado como pagado")
                loadOrders() // Refresh the list
            } else {
                toast.error(result.error || "Error al actualizar pedido")
            }
        } catch (error) {
            console.error("🔥 ERROR:", error)
            toast.error("Error al actualizar pedido")
        }
    }

    const handleCancelOrder = async (orderId: string) => {
        console.log("🔥🔥🔥 PROVIDER_ORDERS - handleCancelOrder CALLED 🔥🔥🔥", { orderId })
        try {
            const result = await cancelProviderOrder(orderId)
            console.log("🔥 cancelProviderOrder RESULT:", result)
            if (result.success) {
                toast.success("Pedido cancelado")
                loadOrders()
            } else {
                toast.error(result.error || "Error al cancelar pedido")
            }
        } catch (error) {
            console.error("🔥 ERROR:", error)
            toast.error("Error al cancelar pedido")
        }
    }

    return (
        <div className="space-y-6">
            {!isCompact && (
                <div className="flex items-center justify-between">
                    <h3 className="text-lg font-medium text-white flex items-center gap-2">
                        <ShoppingBag className="h-5 w-5 text-purple-400" />
                        Historial de Pedidos
                    </h3>
                    <Button onClick={() => setIsCreating(true)} size="sm" className="bg-purple-600 hover:bg-purple-700 text-white">
                        <Plus className="h-4 w-4 mr-2" />
                        Nuevo Pedido
                    </Button>
                </div>
            )}

            {isCreating && (
                <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-zinc-900/50 border border-white/10 rounded-xl p-4 space-y-4"
                >
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label className="text-xs text-white/60">Tipo</Label>
                            <Select
                                value={newOrder.type}
                                onValueChange={(v: any) => setNewOrder({ ...newOrder, type: v })}
                            >
                                <SelectTrigger className="bg-white/5 border-white/10 text-white">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent className="bg-zinc-900 border-white/10">
                                    <SelectItem value="ONE_OFF" className="text-white">Puntual</SelectItem>
                                    <SelectItem value="RECURRING" className="text-white">Recurrente</SelectItem>
                                    <SelectItem value="URGENT" className="text-white">Urgente</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2">
                            <Label className="text-xs text-white/60">Importe (€)</Label>
                            <Input
                                type="number"
                                placeholder="0.00"
                                className="bg-white/5 border-white/10 text-white"
                                value={newOrder.amount}
                                onChange={(e) => setNewOrder({ ...newOrder, amount: e.target.value })}
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label className="text-xs text-white/60">Descripción / Referencia</Label>
                        <Textarea
                            placeholder="Detalles del pedido..."
                            className="bg-white/5 border-white/10 text-white resize-none h-20"
                            value={newOrder.description}
                            onChange={(e) => setNewOrder({ ...newOrder, description: e.target.value })}
                        />
                    </div>

                    {/* Auto-Payment Toggle */}
                    <div className="flex items-center gap-2 m-1 p-2 rounded-lg bg-white/5 border border-white/5">
                        <input
                            type="checkbox"
                            checked={newOrder.createPayment}
                            onChange={(e) => setNewOrder({ ...newOrder, createPayment: e.target.checked })}
                            className="rounded border-white/20 bg-black/40 text-purple-600 focus:ring-purple-500/50"
                            id="createPaymentCheck"
                        />
                        <label htmlFor="createPaymentCheck" className="text-xs text-white/80 cursor-pointer select-none">
                            Generar pago automáticamente ahora
                        </label>
                    </div>

                    <div className="flex justify-end gap-2 pt-2">
                        <Button variant="ghost" size="sm" onClick={() => setIsCreating(false)} className="text-white/60 hover:text-white">
                            Cancelar
                        </Button>
                        <Button size="sm" onClick={handleCreate} className="bg-purple-600 hover:bg-purple-700 text-white">
                            Crear Pedido
                        </Button>
                    </div>
                </motion.div>
            )}

            <div className="space-y-3">
                {loading ? (
                    <div className="text-center py-8 text-white/40">Cargando pedidos...</div>
                ) : orders.length === 0 ? (
                    <div className="text-center py-8 bg-dashed bg-white/5 rounded-xl border border-dashed border-white/10">
                        <ShoppingBag className="h-8 w-8 text-white/20 mx-auto mb-2" />
                        <p className="text-white/40 text-sm">No hay pedidos registrados</p>
                        {isCompact && (
                            <Button variant="link" onClick={() => setIsCreating(true)} className="text-purple-400 text-xs mt-1">
                                Registrar el primero
                            </Button>
                        )}
                    </div>
                ) : (
                    orders.map((order) => (
                        <div
                            key={order.id}
                            className="group relative bg-white/5 border border-white/5 hover:border-white/10 rounded-xl p-4 transition-all hover:bg-white/[0.08]"
                        >
                            <div className="flex justify-between items-start mb-2">
                                <div className="flex items-center gap-2">
                                    <div className={cn(
                                        "h-8 w-8 rounded-full flex items-center justify-center bg-white/10",
                                        (order.type === 'RECURRING' || order.type === 'SUBSCRIPTION') && "text-blue-400 bg-blue-500/10",
                                        order.type === 'SERVICE' && "text-purple-400 bg-purple-500/10",
                                        (order.type === 'ONE_OFF' || order.type === 'ONE_TIME') && "text-emerald-400 bg-emerald-500/10"
                                    )}>
                                        <ShoppingBag className="h-4 w-4" />
                                    </div>
                                    <div>
                                        <h4 className="text-sm font-medium text-white">
                                            {getTypeLabel(order.type)}
                                        </h4>
                                        <span className="text-xs text-white/40">
                                            {format(order.orderDate, "d MMM yyyy", { locale: es })}
                                        </span>
                                    </div>
                                </div>
                                <div className={cn(
                                    "px-2 py-0.5 rounded-full text-[10px] font-medium border uppercase tracking-wide",
                                    getStatusColor(order.status)
                                )}>
                                    {getStatusLabel(order.status)}
                                </div>
                            </div>

                            {order.description && (
                                <p className="text-sm text-white/70 mb-3 pl-10 line-clamp-2">
                                    {order.description}
                                </p>
                            )}

                            <div className="flex items-center justify-between pl-10">
                                <div className="flex items-center gap-4">
                                    {order.amount && (
                                        <div className="flex items-center gap-1.5 text-xs text-white/60 bg-white/5 px-2 py-1 rounded-md">
                                            <DollarSign className="h-3 w-3" />
                                            <span>{order.amount}€</span>
                                        </div>
                                    )}
                                    {order.expectedDeliveryDate && (
                                        <div className="flex items-center gap-1.5 text-xs text-white/60 bg-white/5 px-2 py-1 rounded-md">
                                            <Clock className="h-3 w-3" />
                                            <span>Entrega: {format(order.expectedDeliveryDate, "d MMM", { locale: es })}</span>
                                        </div>
                                    )}
                                </div>

                                {/* ACTION BUTTONS */}
                                {order.status === 'PENDING' && (
                                    <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <Button
                                            size="sm"
                                            variant="ghost"
                                            onClick={() => handleCompleteOrder(order.id, "RECEIVED")}
                                            className="h-7 px-2 text-xs bg-blue-500/10 text-blue-400 hover:bg-blue-500/20 hover:text-blue-300"
                                        >
                                            <Check className="h-3 w-3 mr-1" />
                                            Recibido
                                        </Button>
                                        <Button
                                            size="sm"
                                            variant="ghost"
                                            onClick={() => handleCompleteOrder(order.id, "COMPLETED")}
                                            className="h-7 px-2 text-xs bg-green-500/10 text-green-400 hover:bg-green-500/20 hover:text-green-300"
                                        >
                                            <Check className="h-3 w-3 mr-1" />
                                            Pagado
                                        </Button>
                                        <Button
                                            size="sm"
                                            variant="ghost"
                                            onClick={() => handleCancelOrder(order.id)}
                                            className="h-7 px-2 text-xs text-zinc-400 hover:bg-red-500/20 hover:text-red-400"
                                        >
                                            <X className="h-3 w-3" />
                                        </Button>
                                    </div>
                                )}
                                {order.status === 'RECEIVED' && (
                                    <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <Button
                                            size="sm"
                                            variant="ghost"
                                            onClick={() => handleCompleteOrder(order.id, "COMPLETED")}
                                            className="h-7 px-2 text-xs bg-green-500/10 text-green-400 hover:bg-green-500/20 hover:text-green-300"
                                        >
                                            <Check className="h-3 w-3 mr-1" />
                                            Marcar Pagado
                                        </Button>
                                        <Button
                                            size="sm"
                                            variant="ghost"
                                            onClick={() => handleCancelOrder(order.id)}
                                            className="h-7 px-2 text-xs text-zinc-400 hover:bg-red-500/20 hover:text-red-400"
                                        >
                                            <X className="h-3 w-3 mr-1" />
                                            Cancelar
                                        </Button>
                                    </div>
                                )}
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    )
}
