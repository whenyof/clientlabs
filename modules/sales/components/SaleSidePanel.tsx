"use client"

import { useState, useRef } from "react"
import { useRouter } from "next/navigation"
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"
import { X, DollarSign, User, Package, Calendar, FileText, CheckCircle, Upload, Download } from "lucide-react"
import { toast } from "sonner"
import { useSectorConfig } from "@/hooks/useSectorConfig"
import { formatSaleCurrency, getPaymentStatusLabel, formatSaleDateDisplayLong } from "../utils"
import { updateSale } from "../actions/sales.actions"
import type { Sale } from "../types"

type Props = {
 sale: Sale | null
 open: boolean
 onClose: () => void
 onSaleUpdate?: (saleId: string, data: Partial<Sale>) => void
}

export function SaleSidePanel({ sale, open, onClose, onSaleUpdate }: Props) {
 const { labels } = useSectorConfig()
 const sl = labels.sales
 const router = useRouter()
 const [note, setNote] = useState("")
 const [savingNote, setSavingNote] = useState(false)
 const [savingStatus, setSavingStatus] = useState(false)
 const [uploadingInvoice, setUploadingInvoice] = useState(false)
 const fileInputRef = useRef<HTMLInputElement>(null)

 if (!sale) return null

 const isPaid =
 (sale.status || "").toUpperCase() === "PAGADO" || (sale.status || "").toUpperCase() === "PAID"
 const statusLabel = getPaymentStatusLabel(sale.status, sl)

 const handleMarkPaid = async () => {
 setSavingStatus(true)
 try {
 const result = await updateSale(sale.id, { status: "PAGADO" })
 if (result.success) {
 onSaleUpdate?.(sale.id, { status: "PAGADO" })
 router.refresh()
 toast.success(labels.common.success ?? "Actualizado")
 } else {
 toast.error(result.error ?? labels.common.error)
 }
 } catch {
 toast.error(labels.common.error ?? "Error")
 } finally {
 setSavingStatus(false)
 }
 }

 const handleInvoiceUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
 const file = e.target.files?.[0]
 if (!file) return
 setUploadingInvoice(true)
 try {
 const formData = new FormData()
 formData.set("file", file)
 const res = await fetch(`/api/sales/${sale.id}/invoice`, {
 method: "POST",
 body: formData,
 })
 if (!res.ok) {
 const err = await res.json().catch(() => ({}))
 throw new Error(err.error ?? "Upload failed")
 }
 const { url } = await res.json()
 onSaleUpdate?.(sale.id, { invoiceUrl: url })
 router.refresh()
 toast.success("Factura subida")
 } catch (err) {
 toast.error(err instanceof Error ? err.message : "Error al subir")
 } finally {
 setUploadingInvoice(false)
 e.target.value = ""
 }
 }

 const handleSaveNote = async () => {
 if (!note.trim()) return
 setSavingNote(true)
 try {
 const existingNotes = sale.notes ? `${sale.notes}\n` : ""
 const result = await updateSale(sale.id, {
 notes: `${existingNotes}${note.trim()}`,
 })
 if (result.success) {
 onSaleUpdate?.(sale.id, { notes: `${existingNotes}${note.trim()}` })
 setNote("")
 router.refresh()
 toast.success(labels.common.success ?? "Nota añadida")
 } else {
 toast.error(result.error ?? labels.common.error)
 }
 } catch {
 toast.error(labels.common.error ?? "Error")
 } finally {
 setSavingNote(false)
 }
 }

 return (
 <Sheet open={open} onOpenChange={(o) => !o && onClose()}>
 <SheetContent
 side="right"
 className="w-full sm:max-w-2xl bg-zinc-950 border-l border-[var(--border-subtle)] p-0 flex flex-col focus:outline-none"
 >
 <SheetHeader className="z-10 bg-zinc-950 border-b border-[var(--border-subtle)] p-6">
 <div className="flex items-start justify-between">
 <div className="flex-1 min-w-0">
 <SheetTitle className="text-[var(--text-primary)] text-xl truncate">{sale.product}</SheetTitle>
 <p className="text-sm text-[var(--text-secondary)] truncate mt-1">{sale.clientName}</p>
 {sale.clientEmail && (
 <p className="text-sm text-[var(--text-secondary)] truncate">{sale.clientEmail}</p>
 )}
 <div className="flex items-center gap-2 mt-3">
 <Badge
 className={
 isPaid
 ? "bg-green-500/20 text-green-400 border-green-500/40 text-[10px] h-5"
 : "bg-[var(--bg-card)] text-[var(--text-secondary)] border-[var(--border-subtle)] text-[10px] h-5"
 }
 >
 {statusLabel}
 </Badge>
 <span className="text-lg font-bold text-[var(--text-primary)]">
 {formatSaleCurrency(Number(sale.total), sale.currency)}
 </span>
 </div>
 </div>
 <Button
 variant="ghost"
 size="icon"
 onClick={onClose}
 className="text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-card)] shrink-0"
 >
 <X className="h-5 w-5" />
 </Button>
 </div>
 </SheetHeader>

 <div className="flex-1 overflow-y-auto p-6 space-y-6">
 <div className="rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-card)] p-4 space-y-3">
 <div className="flex items-center gap-2 text-sm text-[var(--text-secondary)]">
 <User className="h-4 w-4" />
 <span>{sl.table.client}</span>
 </div>
 <p className="text-[var(--text-primary)] font-medium">{sale.clientName}</p>
 {sale.Client && (
 <a
 href={`/dashboard/clients?highlight=${sale.Client.id}`}
 className="text-xs text-violet-400 hover:underline"
 >
 Ver cliente
 </a>
 )}

 <div className="flex items-center gap-2 text-sm text-[var(--text-secondary)] mt-3">
 <Package className="h-4 w-4" />
 <span>{sl.table.product}</span>
 </div>
 <p className="text-[var(--text-primary)]">{sale.product}</p>

 <div className="flex items-center gap-2 text-sm text-[var(--text-secondary)] mt-3">
 <Calendar className="h-4 w-4" />
 <span>{sl.table.date}</span>
 </div>
 <p className="text-[var(--text-primary)]">
 {formatSaleDateDisplayLong(sale.saleDate)}
 </p>
 <div className="flex items-center gap-2 text-sm text-[var(--text-secondary)] mt-3">
 <span>Método de pago</span>
 </div>
 <p className="text-[var(--text-primary)] text-sm">{sale.paymentMethod || "—"}</p>
 </div>

 <div className="rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-card)] p-4 space-y-3">
 <h3 className="text-sm font-medium text-[var(--text-secondary)] flex items-center gap-2">
 <FileText className="h-4 w-4" />
 Factura
 </h3>
 {sale.invoiceUrl ? (
 <a
 href={sale.invoiceUrl}
 download
 target="_blank"
 rel="noopener noreferrer"
 className="inline-flex items-center gap-2 text-sm text-violet-400 hover:text-violet-300"
 >
 <Download className="h-4 w-4" />
 Descargar factura
 </a>
 ) : (
 <div>
 <input
 ref={fileInputRef}
 type="file"
 accept=".pdf,.png,.jpg,.jpeg"
 className="hidden"
 onChange={handleInvoiceUpload}
 disabled={uploadingInvoice}
 />
 <Button
 type="button"
 variant="outline"
 size="sm"
 disabled={uploadingInvoice}
 onClick={() => fileInputRef.current?.click()}
 className="border-[var(--border-subtle)] text-[var(--text-secondary)] hover:bg-[var(--bg-card)]"
 >
 <Upload className="h-4 w-4 mr-2" />
 {uploadingInvoice ? "Subiendo…" : "Subir factura"}
 </Button>
 </div>
 )}
 </div>

 {!isPaid && (
 <Button
 onClick={handleMarkPaid}
 disabled={savingStatus}
 className="w-full bg-green-500/20 text-green-400 border border-green-500/30 hover:bg-green-500/30"
 >
 <CheckCircle className="h-4 w-4 mr-2" />
 {sl.paymentStatus?.PAGADO ?? "Marcar como pagado"}
 </Button>
 )}

 <div>
 <h3 className="text-sm font-medium text-[var(--text-secondary)] mb-2 flex items-center gap-2">
 <FileText className="h-4 w-4" />
 {sl.ui.recentNotes}
 </h3>
 {sale.notes && (
 <div className="rounded-lg bg-[var(--bg-card)] border border-[var(--border-subtle)] p-3 mb-3">
 <p className="text-sm text-[var(--text-secondary)] whitespace-pre-wrap">{sale.notes}</p>
 </div>
 )}
 <Textarea
 value={note}
 onChange={(e) => setNote(e.target.value)}
 placeholder="Añadir nota..."
 className="bg-[var(--bg-card)] border-[var(--border-subtle)] text-[var(--text-primary)] resize-none mb-2"
 rows={3}
 />
 <Button
 onClick={handleSaveNote}
 disabled={!note.trim() || savingNote}
 size="sm"
 className="bg-[var(--bg-card)] border-[var(--border-subtle)] text-[var(--text-primary)] hover:bg-[var(--bg-card)]"
 >
 {savingNote ? labels.common.loading : "Guardar nota"}
 </Button>
 </div>
 </div>
 </SheetContent>
 </Sheet>
 )
}
