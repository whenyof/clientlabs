"use client"

import Link from "next/link"
import { ArrowRightIcon } from "@heroicons/react/24/outline"

const FISCAL_TOOLTIP = "Completa los datos fiscales del cliente"

interface FiscalWarningProps {
  clientId: string
  isFiscalComplete: boolean
  onFix?: () => void
}

/**
 * Shows a warning banner when the client does not have minimum legal data for invoicing (Spain).
 * Return null when isFiscalComplete is true.
 */
export function FiscalWarning({ clientId, isFiscalComplete, onFix }: FiscalWarningProps) {
  if (isFiscalComplete) return null

  return (
    <div
      className="rounded-xl border border-amber-500/30 bg-amber-500/10 px-4 py-3"
      role="alert"
      aria-live="polite"
    >
      <p className="text-sm font-medium text-amber-200/95">
        ⚠ Datos fiscales incompletos
      </p>
      <p className="text-xs text-amber-200/80 mt-1">
        Este cliente no tiene la información mínima obligatoria para emitir una factura legal.
      </p>
      {onFix ? (
        <button
          type="button"
          onClick={onFix}
          className="mt-3 inline-flex items-center gap-1.5 rounded-lg border border-amber-500/40 bg-amber-500/20 px-3 py-2 text-sm font-medium text-amber-200 hover:bg-amber-500/30 transition-colors"
        >
          <ArrowRightIcon className="w-4 h-4 shrink-0" aria-hidden />
          → Completar datos en esta factura
        </button>
      ) : (
        <Link
          href={`/dashboard/clients/${clientId}`}
          className="mt-3 inline-flex items-center gap-1.5 rounded-lg border border-amber-500/40 bg-amber-500/20 px-3 py-2 text-sm font-medium text-amber-200 hover:bg-amber-500/30 transition-colors"
        >
          <ArrowRightIcon className="w-4 h-4 shrink-0" aria-hidden />
          → Completar datos del cliente
        </Link>
      )}
    </div>
  )
}

/** Tooltip text for disabled invoice actions when client is not fiscally complete. */
export const FISCAL_DISABLED_TOOLTIP = FISCAL_TOOLTIP
