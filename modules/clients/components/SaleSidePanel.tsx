"use client"

import { useState, useEffect, useCallback } from "react"
import { X, DollarSign, Calendar, CreditCard, FileText, Trash2, User, AlertCircle, ExternalLink } from "lucide-react"
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
 const [saleInvoice, setSaleInvoice] = useState<{ id: string; number: string; total: number; status: string } | null>(null)
 const [loadingInvoice, setLoadingInvoice] = useState(false)

 useEffect(() => {
 setIsMounted(true)
 }, [])

 const loadSaleInvoice = useCallback(async () => {
 if (!sale?.id) return
 setLoadingInvoice(true)
 try {
 const res = await fetch(`/api/billing?saleId=${encodeURIComponent(sale.id)}`, { credentials: "include" })
 const data = await res.json().catch(() => ({}))
 const list = Array.isArray(data.invoices) ? data.invoices : []
 const first = list[0]
 setSaleInvoice(first ? { id: first.id, number: first.number ?? first.id, total: Number(first.total ?? 0), status: first.status ?? "" } : null)
 } catch {
 setSaleInvoice(null)
 } finally {
 setLoadingInvoice(false)
 }
 }, [sale?.id])

 useEffect(() => {
 if (sale?.id && isOpen) loadSaleInvoice()
 }, [sale?.id, isOpen, loadSaleInvoice])

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
 className={`fixed inset-0 bg-[var(--bg-card)] z-[60] transition-opacity duration-300 ${isOpen ? "opacity-100" : "opacity-0 pointer-events-none"}`}
 onClick={onClose}
 />

 {/* Panel */}
 <div
 className={`fixed inset-y-0 right-0 w-full sm:w-[450px] bg-zinc-900 border-l border-[var(--border-subtle)] shadow-sm transform transition-transform duration-300 z-[61] ${isOpen ? "translate-x-0" : "translate-x-full"}`}
 >
 <div className="h-full flex flex-col">
 {/* Header */}
 <div className="p-6 border-b border-[var(--border-subtle)] bg-[var(--bg-card)]">
 <div className="flex items-start justify-between mb-4">
 <h2 className="text-xl font-bold text-[var(--text-primary)] flex-1 mr-4">{sale.product}</h2>
 <button
 onClick={onClose}
 className="p-2 hover:bg-[var(--bg-card)] rounded-lg transition-colors text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
 >
 <X className="h-5 w-5" />
 </button>
 </div>

 <div className="flex items-center gap-3">
 <span className="text-3xl font-mono text-[var(--text-primary)] font-light">
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
 <h3 className="text-sm font-semibold text-[var(--text-secondary)] uppercase tracking-wider">Detalles</h3>

 <div className="grid gap-4">
 <div className="flex items-center gap-3 text-sm">
 <div className="w-8 h-8 rounded-full bg-[var(--bg-card)] flex items-center justify-center">
 <Calendar className="h-4 w-4 text-[var(--text-secondary)]" />
 </div>
 <div>
 <p className="text-[var(--text-secondary)] text-xs">Fecha</p>
 <p className="text-[var(--text-primary)]">
 {isMounted ? formatDate(new Date(sale.saleDate), "d 'de' MMMM, yyyy", { locale: es }) : ""}
 </p>
 </div>
 </div>

 <div className="flex items-center gap-3 text-sm">
 <div className="w-8 h-8 rounded-full bg-[var(--bg-card)] flex items-center justify-center">
 <User className="h-4 w-4 text-[var(--text-secondary)]" />
 </div>
 <div>
 <p className="text-[var(--text-secondary)] text-xs">Cliente</p>
 <p className="text-[var(--text-primary)]">{sale.clientName}</p>
 </div>
 </div>

 <div className="flex items-center gap-3 text-sm">
 <div className="w-8 h-8 rounded-full bg-[var(--bg-card)] flex items-center justify-center">
 <CreditCard className="h-4 w-4 text-[var(--text-secondary)]" />
 </div>
 <div>
 <p className="text-[var(--text-secondary)] text-xs">Método de Pago</p>
 <p className="text-[var(--text-primary)]">{sale.paymentMethod || "Manual"}</p>
 </div>
 </div>
 </div>
 </div>

 <div className="h-[1px] bg-[var(--bg-card)] w-full" />

 {/* Factura emitida */}
 <div className="space-y-3">
 <h3 className="text-sm font-semibold text-[var(--text-secondary)] uppercase tracking-wider">Factura emitida</h3>
 {loadingInvoice ? (
 <p className="text-sm text-[var(--text-secondary)]">Cargando…</p>
 ) : saleInvoice ? (
 <a
 href={`/dashboard/finance/billing?invoice=${saleInvoice.id}`}
 className="flex items-center justify-between p-4 rounded-lg bg-[var(--bg-card)] border border-[var(--border-subtle)] hover:bg-[var(--bg-card)] transition-colors"
 >
 <div className="flex items-center gap-3">
 <FileText className="h-5 w-5 text-[var(--text-secondary)]" />
 <div>
 <p className="font-medium text-[var(--text-primary)]">{saleInvoice.number}</p>
 <p className="text-xs text-[var(--text-secondary)]">{saleInvoice.status}</p>
 </div>
 </div>
 <ExternalLink className="h-4 w-4 text-[var(--text-secondary)]" />
 </a>
 ) : (
 <div className="border border-dashed border-[var(--border-subtle)] rounded-lg p-6 flex flex-col items-center justify-center text-center bg-[var(--bg-card)]">
 <FileText className="h-8 w-8 text-[var(--text-secondary)] mb-2" />
 <p className="text-sm text-[var(--text-secondary)]">No hay factura vinculada a este pedido</p>
 <a href="/dashboard/finance/billing" className="text-[var(--accent)] text-xs mt-1 hover:underline">Ir a facturación</a>
 </div>
 )}
 </div>

 {/* Notes */}
 {sale.notes && (
 <div className="space-y-2">
 <h3 className="text-sm font-semibold text-[var(--text-secondary)] uppercase tracking-wider">Notas</h3>
 <div className="bg-[var(--bg-card)] rounded-lg p-4 border border-[var(--border-subtle)]">
 <p className="text-sm text-[var(--text-secondary)] whitespace-pre-wrap">{sale.notes}</p>
 </div>
 </div>
 )}
 </div>

 {/* Footer Actions */}
 <div className="p-6 border-t border-[var(--border-subtle)] bg-zinc-900">
 {!isConfirmingDelete ? (
 <Button
 variant="ghost"
 onClick={() => setIsConfirmingDelete(true)}
 className="w-full text-[var(--critical)] hover:text-[var(--critical)] hover:bg-[var(--bg-card)]"
 >
 <Trash2 className="h-4 w-4 mr-2" />
 Eliminar Venta
 </Button>
 ) : (
 <div className="space-y-3 bg-[var(--bg-card)] p-4 rounded-lg border border-[var(--critical)]">
 <p className="text-sm text-[var(--critical)] text-center">
 ¿Estás seguro? Esta acción es irreversible.
 </p>
 <div className="flex gap-2">
 <Button
 variant="outline"
 onClick={() => setIsConfirmingDelete(false)}
 className="flex-1 bg-transparent border-[var(--critical)] text-[var(--critical)] hover:bg-[var(--bg-card)]"
 >
 Cancelar
 </Button>
 <Button
 onClick={handleDelete}
 className="flex-1 bg-[var(--bg-card)] hover:bg-[var(--bg-card)] text-[var(--text-primary)] border-none"
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
