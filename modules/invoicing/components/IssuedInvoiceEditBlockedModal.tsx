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
 className="fixed inset-0 z-50 bg-[var(--bg-card)]"
 onClick={onClose}
 />
 <div
 role="dialog"
 aria-labelledby="issued-edit-blocked-title"
 aria-describedby="issued-edit-blocked-desc"
 className="fixed left-1/2 top-1/2 z-50 w-full max-w-md -translate-x-1/2 -translate-y-1/2 rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-main)] p-6 shadow-sm"
 >
 <div className="flex items-start gap-3">
 <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[var(--bg-card)]">
 <LockClosedIcon className="h-5 w-5 text-[var(--text-secondary)]" aria-hidden />
 </div>
 <div className="min-w-0 flex-1">
 <h2 id="issued-edit-blocked-title" className="text-base font-semibold text-[var(--text-primary)]">
 No se puede modificar una factura emitida
 </h2>
 <p id="issued-edit-blocked-desc" className="mt-2 text-sm text-[var(--text-secondary)]">
 Debe crear una factura rectificativa.
 </p>
 <div className="mt-4 flex flex-wrap gap-2">
 {onCreateRectificativa ? (
 <button
 type="button"
 onClick={() => {
 onClose()
 onCreateRectificativa()
 }}
 className="inline-flex items-center gap-1.5 rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-card)] px-3 py-2 text-sm font-medium text-[var(--text-secondary)] hover:bg-[var(--bg-card)] transition-colors"
 >
 <ArrowRightIcon className="h-4 w-4" aria-hidden />
 Crear rectificativa
 </button>
 ) : (
 <Link
 href="/dashboard/finance/invoicing"
 onClick={onClose}
 className="inline-flex items-center gap-1.5 rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-card)] px-3 py-2 text-sm font-medium text-[var(--text-secondary)] hover:bg-[var(--bg-card)] transition-colors"
 >
 <ArrowRightIcon className="h-4 w-4" aria-hidden />
 Crear rectificativa
 </Link>
 )}
 <button
 type="button"
 onClick={onClose}
 className="rounded-lg border border-[var(--border-subtle)] px-3 py-2 text-sm text-[var(--text-secondary)] hover:bg-[var(--bg-card)] transition-colors"
 >
 Cerrar
 </button>
 </div>
 </div>
 </div>
 </div>
 </>
 )
}
