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
        className="fixed inset-0 z-40 bg-black/50"
        onClick={onClose}
      />
      <div
        role="dialog"
        aria-label="Crear factura"
        className="fixed left-1/2 top-1/2 z-50 w-full max-w-lg -translate-x-1/2 -translate-y-1/2 rounded-xl border border-slate-200 bg-white shadow-lg overflow-hidden"
      >
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
          <h2 className="text-[17px] font-semibold text-slate-900">Crear factura</h2>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
            aria-label="Cerrar"
          >
            <XMarkIcon className="w-4 h-4" />
          </button>
        </div>

        <div className="px-6 py-5 flex flex-col sm:flex-row gap-4">
          <button
            type="button"
            onClick={() => {
              onClose()
              onManual()
            }}
            className="flex-1 flex flex-col items-start gap-2 rounded-xl border border-slate-200 bg-white p-4 text-left hover:border-[#1FA97A]/40 hover:shadow-[0_2px_8px_rgba(31,169,122,0.08)] transition-all"
          >
            <span className="inline-flex items-center justify-center w-9 h-9 rounded-lg bg-slate-50 border border-slate-100 text-slate-500">
              <PencilSquareIcon className="w-4 h-4" />
            </span>
            <span className="text-[13px] font-medium text-slate-900">Manual</span>
            <p className="text-[12px] text-slate-500">
              Crea la factura introduciendo los datos manualmente.
            </p>
          </button>

          <button
            type="button"
            onClick={() => {
              onClose()
              onFromSale()
            }}
            className="flex-1 flex flex-col items-start gap-2 rounded-xl border border-slate-200 bg-white p-4 text-left hover:border-[#1FA97A]/40 hover:shadow-[0_2px_8px_rgba(31,169,122,0.08)] transition-all"
          >
            <span className="inline-flex items-center justify-center w-9 h-9 rounded-lg bg-slate-50 border border-slate-100 text-slate-500">
              <ShoppingCartIcon className="w-4 h-4" />
            </span>
            <span className="text-[13px] font-medium text-slate-900">Desde venta</span>
            <p className="text-[12px] text-slate-500">
              Genera automáticamente la factura usando una venta existente.
            </p>
          </button>
        </div>

        <div className="px-6 py-4 border-t border-slate-100 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="border border-slate-200 text-slate-700 rounded-xl px-5 py-2.5 text-[13px] hover:bg-slate-50 transition-colors"
          >
            Cancelar
          </button>
        </div>
      </div>
    </>
  )
}
