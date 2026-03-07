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
        className="fixed left-1/2 top-1/2 z-50 w-full max-w-lg -translate-x-1/2 -translate-y-1/2 rounded-xl border border-white/10 bg-[#0f0f12] shadow-2xl overflow-hidden"
      >
        <div className="flex items-center justify-between px-5 py-4 border-b border-white/10">
          <div>
            <h2 className="text-lg font-semibold text-white">Crear factura</h2>
            <p className="text-sm text-white/60 mt-0.5">Elige cómo quieres generarla</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-lg text-white/60 hover:text-white hover:bg-white/10"
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
            className="flex-1 flex flex-col items-start gap-2 rounded-xl border border-white/10 bg-white/[0.02] p-4 text-left hover:bg-white/[0.06] hover:border-white/20 transition-colors"
          >
            <span className="inline-flex items-center justify-center w-10 h-10 rounded-lg bg-white/10 text-white">
              <PencilSquareIcon className="w-5 h-5" />
            </span>
            <span className="text-sm font-medium text-white">Manual</span>
            <p className="text-xs text-white/60">
              Crea la factura introduciendo los datos manualmente.
            </p>
            <span className="text-sm font-medium text-white/90 mt-1">Continuar manual</span>
          </button>

          <button
            type="button"
            onClick={() => {
              onClose()
              onFromSale()
            }}
            className="flex-1 flex flex-col items-start gap-2 rounded-xl border border-white/10 bg-white/[0.02] p-4 text-left hover:bg-white/[0.06] hover:border-white/20 transition-colors"
          >
            <span className="inline-flex items-center justify-center w-10 h-10 rounded-lg bg-white/10 text-white">
              <ShoppingCartIcon className="w-5 h-5" />
            </span>
            <span className="text-sm font-medium text-white">Desde venta</span>
            <p className="text-xs text-white/60">
              Genera automáticamente la factura usando una venta existente.
            </p>
            <span className="text-sm font-medium text-white/90 mt-1">Elegir venta</span>
          </button>
        </div>
      </div>
    </>
  )
}
