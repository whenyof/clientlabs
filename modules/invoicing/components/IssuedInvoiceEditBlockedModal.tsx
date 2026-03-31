"use client"

import { LockClosedIcon, ArrowRightIcon } from "@heroicons/react/24/outline"
import Link from "next/link"

interface IssuedInvoiceEditBlockedModalProps {
  open: boolean
  onClose: () => void
  onCreateRectificativa?: () => void
}

/**
 * Shown when the user attempts to edit an issued/paid/cancelled invoice.
 * Explains that a rectificativa (credit note) must be created instead.
 */
export function IssuedInvoiceEditBlockedModal({
  open,
  onClose,
  onCreateRectificativa,
}: IssuedInvoiceEditBlockedModalProps) {
  if (!open) return null

  return (
    <>
      <div
        aria-hidden
        className="fixed inset-0 z-50 bg-black/60"
        onClick={onClose}
      />
      <div
        role="dialog"
        aria-labelledby="issued-edit-blocked-title"
        aria-describedby="issued-edit-blocked-desc"
        className="fixed left-1/2 top-1/2 z-50 w-full max-w-md -translate-x-1/2 -translate-y-1/2 rounded-xl border border-slate-200 bg-white shadow-lg overflow-hidden"
      >
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
          <h2 id="issued-edit-blocked-title" className="text-[17px] font-semibold text-slate-900">
            Factura emitida
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
            aria-label="Cerrar"
          >
            <LockClosedIcon className="h-4 w-4" aria-hidden />
          </button>
        </div>
        <div className="px-6 py-5">
          <p id="issued-edit-blocked-desc" className="text-[14px] text-slate-600">
            No se puede modificar una factura emitida. Para corregir errores debe crear una factura rectificativa.
          </p>
        </div>
        <div className="px-6 py-4 border-t border-slate-100 flex justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="border border-slate-200 text-slate-700 rounded-xl px-5 py-2.5 text-[13px] hover:bg-slate-50 transition-colors"
          >
            Cancelar
          </button>
          {onCreateRectificativa ? (
            <button
              type="button"
              onClick={() => {
                onClose()
                onCreateRectificativa()
              }}
              className="flex items-center gap-1.5 bg-[#1FA97A] text-white rounded-xl px-5 py-2.5 text-[13px] font-medium hover:bg-[#178f68] transition-colors"
            >
              <ArrowRightIcon className="h-4 w-4" aria-hidden />
              Crear rectificativa
            </button>
          ) : (
            <Link
              href="/dashboard/finance/invoicing"
              onClick={onClose}
              className="flex items-center gap-1.5 bg-[#1FA97A] text-white rounded-xl px-5 py-2.5 text-[13px] font-medium hover:bg-[#178f68] transition-colors"
            >
              <ArrowRightIcon className="h-4 w-4" aria-hidden />
              Crear rectificativa
            </Link>
          )}
        </div>
      </div>
    </>
  )
}
