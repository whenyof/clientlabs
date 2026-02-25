"use client"

import { XMarkIcon, PencilSquareIcon, ShoppingCartIcon } from "@heroicons/react/24/outline"

interface CreateInvoiceSelectorDialogProps {
 open: boolean
 onClose: () => void
 onManual: () => void
 onFromSale: () => void
}

export function CreateInvoiceSelectorDialog({
 open,
 onClose,
 onManual,
 onFromSale,
}: CreateInvoiceSelectorDialogProps) {
 if (!open) return null

 return (
 <>
 <div
 aria-hidden
 className="fixed inset-0 z-40 bg-[var(--bg-card)]"
 onClick={onClose}
 />
 <div
 role="dialog"
 aria-label="Crear factura"
 className="fixed left-1/2 top-1/2 z-50 w-full max-w-lg -translate-x-1/2 -translate-y-1/2 rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-main)] shadow-sm overflow-hidden"
 >
 <div className="flex items-center justify-between px-5 py-4 border-b border-[var(--border-subtle)]">
 <div>
 <h2 className="text-lg font-semibold text-[var(--text-primary)]">Crear factura</h2>
 <p className="text-sm text-[var(--text-secondary)] mt-0.5">Elige cómo quieres generarla</p>
 </div>
 <button
 type="button"
 onClick={onClose}
 className="p-2 rounded-lg text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-card)]"
 aria-label="Cerrar"
 >
 <XMarkIcon className="w-5 h-5" />
 </button>
 </div>

 <div className="p-5 flex flex-col sm:flex-row gap-4">
 <button
 type="button"
 onClick={() => {
 onClose()
 onManual()
 }}
 className="flex-1 flex flex-col items-start gap-2 rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-card)]/[0.02] p-4 text-left hover:bg-[var(--bg-card)]/[0.06] hover:border-[var(--border-subtle)] transition-colors"
 >
 <span className="inline-flex items-center justify-center w-10 h-10 rounded-lg bg-[var(--bg-card)] text-[var(--text-primary)]">
 <PencilSquareIcon className="w-5 h-5" />
 </span>
 <span className="text-sm font-medium text-[var(--text-primary)]">Manual</span>
 <p className="text-xs text-[var(--text-secondary)]">
 Crea la factura introduciendo los datos manualmente.
 </p>
 <span className="text-sm font-medium text-[var(--text-secondary)] mt-1">Continuar manual</span>
 </button>

 <button
 type="button"
 onClick={() => {
 onClose()
 onFromSale()
 }}
 className="flex-1 flex flex-col items-start gap-2 rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-card)]/[0.02] p-4 text-left hover:bg-[var(--bg-card)]/[0.06] hover:border-[var(--border-subtle)] transition-colors"
 >
 <span className="inline-flex items-center justify-center w-10 h-10 rounded-lg bg-[var(--bg-card)] text-[var(--text-primary)]">
 <ShoppingCartIcon className="w-5 h-5" />
 </span>
 <span className="text-sm font-medium text-[var(--text-primary)]">Desde venta</span>
 <p className="text-xs text-[var(--text-secondary)]">
 Genera automáticamente la factura usando una venta existente.
 </p>
 <span className="text-sm font-medium text-[var(--text-secondary)] mt-1">Elegir venta</span>
 </button>
 </div>
 </div>
 </>
 )
}
