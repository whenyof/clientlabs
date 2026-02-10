"use client"

import { useRouter } from "next/navigation"
import { XMarkIcon, ArrowTopRightOnSquareIcon } from "@heroicons/react/24/outline"
import { formatCurrency, formatDate, getAmountColor } from "../../lib/formatters"
import type { Movement } from "@/modules/finance/movements"

const ORIGIN_LABELS: Record<Movement["originModule"], string> = {
  sale: "Venta",
  purchase: "Compra",
  invoice: "Factura",
  manual: "Manual",
  provider_order: "Pedido proveedor",
}

const STATUS_LABELS: Record<Movement["status"], string> = {
  paid: "Pagado",
  pending: "Pendiente",
}

function getOriginHref(m: Movement): string | null {
  if (!m.originId) return null
  switch (m.originModule) {
    case "sale":
      return "/dashboard/other/sales"
    case "purchase":
    case "provider_order":
      return "/dashboard/providers"
    case "invoice":
      return "/dashboard/finance/billing"
    case "manual":
      return "/dashboard/finance?view=transactions"
    default:
      return null
  }
}

interface MovementDetailsDrawerProps {
  movement: Movement | null
  open: boolean
  onClose: () => void
}

export function MovementDetailsDrawer({ movement, open, onClose }: MovementDetailsDrawerProps) {
  const router = useRouter()

  if (!movement) return null

  const href = getOriginHref(movement)

  const handleJumpToOrigin = () => {
    if (href) {
      onClose()
      router.push(href)
    }
  }

  return (
    <>
      {/* Backdrop */}
      <div
        aria-hidden
        className={`fixed inset-0 z-40 bg-black/50 transition-opacity ${open ? "opacity-100" : "opacity-0 pointer-events-none"}`}
        onClick={onClose}
      />
      {/* Panel */}
      <aside
        role="dialog"
        aria-label="Detalle del movimiento"
        className={`
          fixed top-0 right-0 z-50 h-full w-full max-w-md
          bg-[#0f0f12] border-l border-white/10
          shadow-2xl flex flex-col
          transition-transform duration-200 ease-out
          ${open ? "translate-x-0" : "translate-x-full"}
        `}
      >
        <div className="flex items-center justify-between px-5 py-4 border-b border-white/10">
          <h2 className="text-base font-semibold text-white">Detalle del movimiento</h2>
          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-lg text-white/60 hover:text-white hover:bg-white/10 transition-colors"
            aria-label="Cerrar"
          >
            <XMarkIcon className="w-5 h-5" />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto px-5 py-6 space-y-6">
          <div>
            <p className="text-xs font-medium text-white/50 uppercase tracking-wider mb-1">Importe</p>
            <p className={`text-2xl font-bold tabular-nums ${getAmountColor(movement.amount)}`}>
              {movement.amount >= 0 ? "+" : ""}{formatCurrency(movement.amount)}
            </p>
          </div>
          <div>
            <p className="text-xs font-medium text-white/50 uppercase tracking-wider mb-1">Fecha</p>
            <p className="text-sm text-white/90">{formatDate(movement.date)}</p>
          </div>
          <div>
            <p className="text-xs font-medium text-white/50 uppercase tracking-wider mb-1">Estado</p>
            <p className="text-sm text-white/90">{STATUS_LABELS[movement.status]}</p>
          </div>
          <div>
            <p className="text-xs font-medium text-white/50 uppercase tracking-wider mb-1">
              {movement.contactType === "client" ? "Cliente" : movement.contactType === "supplier" ? "Proveedor" : "Contacto"}
            </p>
            <p className="text-sm text-white/90">{movement.contactName || "—"}</p>
          </div>
          <div>
            <p className="text-xs font-medium text-white/50 uppercase tracking-wider mb-1">Concepto</p>
            <p className="text-sm text-white/90">{movement.concept}</p>
          </div>
          {movement.category && (
            <div>
              <p className="text-xs font-medium text-white/50 uppercase tracking-wider mb-1">Categoría</p>
              <p className="text-sm text-white/90">{movement.category}</p>
            </div>
          )}
          <div>
            <p className="text-xs font-medium text-white/50 uppercase tracking-wider mb-1">Origen</p>
            <p className="text-sm text-white/90">{ORIGIN_LABELS[movement.originModule]}</p>
          </div>
          {href && (
            <div className="pt-4 border-t border-white/10">
              <button
                type="button"
                onClick={handleJumpToOrigin}
                className="flex items-center gap-2 text-sm font-medium text-violet-400 hover:text-violet-300 transition-colors"
              >
                <ArrowTopRightOnSquareIcon className="w-4 h-4" />
                Ir al {ORIGIN_LABELS[movement.originModule]}
              </button>
            </div>
          )}
        </div>
      </aside>
    </>
  )
}
