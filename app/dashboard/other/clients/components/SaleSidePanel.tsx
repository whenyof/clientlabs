"use client"

import { useState, useEffect } from "react"
import { X, DollarSign, Calendar, CreditCard, FileText, Trash2, User, AlertCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { formatDate } from "date-fns"
import { es } from "date-fns/locale"
import { PaymentStatusBadge } from "./PaymentStatusBadge"
import { toast } from "sonner"
import { deleteClientSale } from "../actions"

type SaleSidePanelProps = {
    sale: any | null // Type properly if possible
    isOpen: boolean
    onClose: () => void
    onStatusChange: (saleId: string, newStatus: string) => void
    onDelete: (saleId: string) => void
}

export function SaleSidePanel({ sale, isOpen, onClose, onStatusChange, onDelete }: SaleSidePanelProps) {
    const [isDeleting, setIsDeleting] = useState(false)
    const [isConfirmingDelete, setIsConfirmingDelete] = useState(false)
    const [isMounted, setIsMounted] = useState(false)

    useEffect(() => {
        setIsMounted(true)
    }, [])

    if (!isOpen || !sale) return null

    const initialStatus = sale.status

    const handleDelete = async () => {
        setIsDeleting(true)
        try {
            await deleteClientSale(sale.id)
            onDelete(sale.id)
            onClose()
            toast.success("Venta eliminada correctamente")
        } catch (error) {
            toast.error("Error al eliminar venta")
        } finally {
            setIsDeleting(false)
            setIsConfirmingDelete(false)
        }
    }

    return (
        <>
            {/* Backdrop */}
            <div
                className={`fixed inset-0 bg-black/50 z-[60] transition-opacity duration-300 ${isOpen ? "opacity-100" : "opacity-0 pointer-events-none"}`}
                onClick={onClose}
            />

            {/* Panel */}
            <div
                className={`fixed inset-y-0 right-0 w-full sm:w-[450px] bg-zinc-900 border-l border-white/10 shadow-2xl transform transition-transform duration-300 z-[61] ${isOpen ? "translate-x-0" : "translate-x-full"}`}
            >
                <div className="h-full flex flex-col">
                    {/* Header */}
                    <div className="p-6 border-b border-white/10 bg-white/5">
                        <div className="flex items-start justify-between mb-4">
                            <h2 className="text-xl font-bold text-white flex-1 mr-4">{sale.product}</h2>
                            <button
                                onClick={onClose}
                                className="p-2 hover:bg-white/10 rounded-lg transition-colors text-white/60 hover:text-white"
                            >
                                <X className="h-5 w-5" />
                            </button>
                        </div>

                        <div className="flex items-center gap-3">
                            <span className="text-3xl font-mono text-white font-light">
                                {isMounted ? new Intl.NumberFormat('es-ES', { style: 'currency', currency: sale.currency || 'EUR' }).format(sale.total) : ""}
                            </span>
                            <div onClick={(e) => e.stopPropagation()}>
                                <PaymentStatusBadge
                                    saleId={sale.id}
                                    initialStatus={initialStatus}
                                    onStatusChange={(newStatus) => onStatusChange(sale.id, newStatus)}
                                />
                            </div>
                        </div>
                    </div>

                    {/* Content */}
                    <div className="flex-1 overflow-y-auto p-6 space-y-8">

                        {/* Details */}
                        <div className="space-y-4">
                            <h3 className="text-sm font-semibold text-white/40 uppercase tracking-wider">Detalles</h3>

                            <div className="grid gap-4">
                                <div className="flex items-center gap-3 text-sm">
                                    <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center">
                                        <Calendar className="h-4 w-4 text-white/60" />
                                    </div>
                                    <div>
                                        <p className="text-white/40 text-xs">Fecha</p>
                                        <p className="text-white">
                                            {isMounted ? formatDate(new Date(sale.saleDate), "d 'de' MMMM, yyyy", { locale: es }) : ""}
                                        </p>
                                    </div>
                                </div>

                                <div className="flex items-center gap-3 text-sm">
                                    <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center">
                                        <User className="h-4 w-4 text-white/60" />
                                    </div>
                                    <div>
                                        <p className="text-white/40 text-xs">Cliente</p>
                                        <p className="text-white">{sale.clientName}</p>
                                    </div>
                                </div>

                                <div className="flex items-center gap-3 text-sm">
                                    <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center">
                                        <CreditCard className="h-4 w-4 text-white/60" />
                                    </div>
                                    <div>
                                        <p className="text-white/40 text-xs">Método de Pago</p>
                                        <p className="text-white">{sale.paymentMethod || "Manual"}</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="h-[1px] bg-white/10 w-full" />

                        {/* Invoice Placeholder */}
                        <div className="space-y-3">
                            <h3 className="text-sm font-semibold text-white/40 uppercase tracking-wider">Facturación</h3>
                            <div className="border border-dashed border-white/10 rounded-lg p-6 flex flex-col items-center justify-center text-center bg-white/5">
                                <FileText className="h-8 w-8 text-white/20 mb-2" />
                                <p className="text-sm text-white/60">No hay factura adjunta</p>
                                <Button variant="link" className="text-blue-400 h-auto p-0 text-xs mt-1">
                                    Subir factura (Próximamente)
                                </Button>
                            </div>
                        </div>

                        {/* Notes */}
                        {sale.notes && (
                            <div className="space-y-2">
                                <h3 className="text-sm font-semibold text-white/40 uppercase tracking-wider">Notas</h3>
                                <div className="bg-white/5 rounded-lg p-4 border border-white/5">
                                    <p className="text-sm text-white/80 whitespace-pre-wrap">{sale.notes}</p>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Footer Actions */}
                    <div className="p-6 border-t border-white/10 bg-zinc-900">
                        {!isConfirmingDelete ? (
                            <Button
                                variant="ghost"
                                onClick={() => setIsConfirmingDelete(true)}
                                className="w-full text-red-400 hover:text-red-300 hover:bg-red-500/10"
                            >
                                <Trash2 className="h-4 w-4 mr-2" />
                                Eliminar Venta
                            </Button>
                        ) : (
                            <div className="space-y-3 bg-red-500/10 p-4 rounded-lg border border-red-500/20">
                                <p className="text-sm text-red-200 text-center">
                                    ¿Estás seguro? Esta acción es irreversible.
                                </p>
                                <div className="flex gap-2">
                                    <Button
                                        variant="outline"
                                        onClick={() => setIsConfirmingDelete(false)}
                                        className="flex-1 bg-transparent border-red-500/30 text-red-300 hover:bg-red-500/20"
                                    >
                                        Cancelar
                                    </Button>
                                    <Button
                                        onClick={handleDelete}
                                        className="flex-1 bg-red-600 hover:bg-red-700 text-white border-none"
                                        disabled={isDeleting}
                                    >
                                        {isDeleting ? "Eliminando..." : "Confirmar"}
                                    </Button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </>
    )
}
