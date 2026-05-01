"use client"

import Link from "next/link"
import { ExclamationTriangleIcon, ArrowRightIcon } from "@heroicons/react/24/outline"

const FISCAL_TOOLTIP = "Completa los datos fiscales del cliente"

interface FiscalWarningProps {
  clientId: string
  isFiscalComplete: boolean
  onFix?: () => void
}

export function FiscalWarning({ clientId, isFiscalComplete, onFix }: FiscalWarningProps) {
  if (isFiscalComplete) return null

  return (
    <div
      className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3"
      role="alert"
      aria-live="polite"
    >
      <div className="flex items-start gap-2.5">
        <ExclamationTriangleIcon className="h-4 w-4 text-amber-600 mt-0.5 shrink-0" />
        <div className="min-w-0">
          <p className="text-sm font-semibold text-amber-800">
            Datos fiscales incompletos
          </p>
          <p className="text-xs text-amber-700 mt-0.5">
            Este cliente no tiene la información mínima obligatoria para emitir una factura legal.
          </p>
          {onFix ? (
            <button
              type="button"
              onClick={onFix}
              className="mt-2.5 inline-flex items-center gap-1.5 rounded-lg bg-amber-100 border border-amber-300 px-3 py-1.5 text-xs font-medium text-amber-800 hover:bg-amber-200 transition-colors"
            >
              Completar datos en esta factura
              <ArrowRightIcon className="w-3.5 h-3.5 shrink-0" aria-hidden />
            </button>
          ) : (
            <Link
              href={`/dashboard/clients/${clientId}`}
              className="mt-2.5 inline-flex items-center gap-1.5 rounded-lg bg-amber-100 border border-amber-300 px-3 py-1.5 text-xs font-medium text-amber-800 hover:bg-amber-200 transition-colors"
            >
              Completar datos del cliente
              <ArrowRightIcon className="w-3.5 h-3.5 shrink-0" aria-hidden />
            </Link>
          )}
        </div>
      </div>
    </div>
  )
}

export const FISCAL_DISABLED_TOOLTIP = FISCAL_TOOLTIP
