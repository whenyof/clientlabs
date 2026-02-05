"use client"

import { useState } from "react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { MoreVertical, Edit, Check, Trash2, ShoppingCart } from "lucide-react"
import { format } from "date-fns"
import { es } from "date-fns/locale"
import { toast } from "sonner"
import { deleteClientSale, markSaleAsPaid } from "../actions"
import { DeleteConfirmDialog } from "@/components/ui/delete-confirm-dialog"

type Sale = {
    id: string
    product: string
    total: number
    saleDate: Date
    status: string
    notes: string | null
}

type SalesListProps = {
    sales: Sale[]
    onEdit: (sale: Sale) => void
    onUpdate: () => void
}

const STATUS_CONFIG: Record<string, { label: string; color: string }> = {
    PAID: { label: "Pagado", color: "bg-green-500/20 text-green-400 border-green-500/30" },
    PENDING: { label: "Pendiente", color: "bg-amber-500/20 text-amber-400 border-amber-500/30" },
    CANCELED: { label: "Cancelado", color: "bg-red-500/20 text-red-400 border-red-500/30" },
    PAGADO: { label: "Pagado", color: "bg-green-500/20 text-green-400 border-green-500/30" },
}

export function SalesList({ sales, onEdit, onUpdate }: SalesListProps) {
    const [deletingId, setDeletingId] = useState<string | null>(null)
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
    const [saleToDelete, setSaleToDelete] = useState<string | null>(null)

    const handleDeleteClick = (saleId: string) => {
        setSaleToDelete(saleId)
        setDeleteDialogOpen(true)
    }

    const handleDeleteConfirm = async () => {
        if (!saleToDelete) return

        setDeletingId(saleToDelete)
        try {
            await deleteClientSale(saleToDelete)
            toast.success("Venta eliminada")
            onUpdate()
        } catch (error) {
            toast.error("Error al eliminar venta")
        } finally {
            setDeletingId(null)
            setSaleToDelete(null)
        }
    }

    const handleMarkAsPaid = async (saleId: string) => {
        try {
            await markSaleAsPaid(saleId)
            toast.success("Venta marcada como pagada")
            onUpdate()
        } catch (error) {
            toast.error("Error al actualizar venta")
        }
    }

    if (sales.length === 0) {
        return (
            <div className="text-center py-8 border border-white/10 rounded-lg bg-white/5">
                <ShoppingCart className="h-12 w-12 mx-auto text-white/20 mb-2" />
                <p className="text-white/60 text-sm">
                    Este cliente aún no tiene ventas registradas
                </p>
            </div>
        )
    }

    const totalPaid = sales
        .filter((s) => s.status === "PAID" || s.status === "PAGADO")
        .reduce((sum, s) => sum + s.total, 0)

    return (
        <div className="space-y-3">
            {/* Total */}
            <div className="flex items-center justify-between p-3 rounded-lg bg-green-500/10 border border-green-500/20">
                <span className="text-sm text-white/80">Total gastado</span>
                <span className="text-lg font-bold text-green-400">
                    €{totalPaid.toLocaleString('es-ES', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </span>
            </div>

            {/* Sales List */}
            <div className="space-y-2">
                {sales.map((sale) => {
                    const statusConfig = STATUS_CONFIG[sale.status] || STATUS_CONFIG.PAID

                    return (
                        <div
                            key={sale.id}
                            className="flex items-center justify-between p-3 rounded-lg border border-white/10 bg-white/5 hover:bg-white/10 transition-colors"
                        >
                            <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 mb-1">
                                    <p className="text-sm font-medium text-white truncate">
                                        {sale.product}
                                    </p>
                                    <Badge className={`${statusConfig.color} text-xs`}>
                                        {statusConfig.label}
                                    </Badge>
                                </div>
                                <div className="flex items-center gap-3 text-xs text-white/40">
                                    <span>{format(new Date(sale.saleDate), "dd MMM yyyy", { locale: es })}</span>
                                    <span className="font-semibold text-white">
                                        €{sale.total.toLocaleString('es-ES', { minimumFractionDigits: 2 })}
                                    </span>
                                </div>
                            </div>

                            {/* Actions Menu */}
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        className="h-8 w-8 p-0 text-white/60 hover:text-white hover:bg-white/10"
                                        disabled={deletingId === sale.id}
                                    >
                                        <MoreVertical className="h-4 w-4" />
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end" className="bg-zinc-900 border-white/10">
                                    <DropdownMenuItem
                                        onClick={() => onEdit(sale)}
                                        className="text-white hover:bg-white/10 cursor-pointer"
                                    >
                                        <Edit className="h-4 w-4 mr-2" />
                                        Editar
                                    </DropdownMenuItem>
                                    {sale.status !== "PAID" && sale.status !== "PAGADO" && (
                                        <DropdownMenuItem
                                            onClick={() => handleMarkAsPaid(sale.id)}
                                            className="text-green-400 hover:bg-white/10 cursor-pointer"
                                        >
                                            <Check className="h-4 w-4 mr-2" />
                                            Marcar como pagada
                                        </DropdownMenuItem>
                                    )}
                                    <DropdownMenuItem
                                        onClick={() => handleDeleteClick(sale.id)}
                                        className="text-red-400 hover:bg-white/10 cursor-pointer"
                                    >
                                        <Trash2 className="h-4 w-4 mr-2" />
                                        Eliminar
                                    </DropdownMenuItem>
                                </DropdownMenuContent>
                            </DropdownMenu>
                        </div>
                    )
                })}
            </div>

            <DeleteConfirmDialog
                open={deleteDialogOpen}
                onOpenChange={setDeleteDialogOpen}
                onConfirm={handleDeleteConfirm}
                title="¿Eliminar venta?"
                description="Esta acción no se puede deshacer. La venta será eliminada permanentemente."
            />
        </div>
    )
}
