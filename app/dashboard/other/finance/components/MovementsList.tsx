"use client"

import { formatCurrency, formatDate } from "../lib/formatters"
import { getAmountColor } from "../lib/formatters"
import { useFinanceData } from "../context/FinanceDataContext"
import { ArrowDownIcon, ArrowUpIcon, BanknotesIcon } from "@heroicons/react/24/outline"

type MovementType = "sale" | "expense" | "payment"

export function MovementsList() {
  const { movements } = useFinanceData()

  const typeLabel = (type: MovementType) => {
    switch (type) {
      case "sale":
        return "Venta"
      case "expense":
        return "Gasto"
      case "payment":
        return "Pago"
      default:
        return type
    }
  }

  return (
    <div className="rounded-xl border border-white/[0.08] bg-white/[0.02] overflow-hidden">
      <div className="border-b border-white/[0.06] px-4 py-3">
        <h3 className="text-sm font-semibold text-white">Movimientos</h3>
        <p className="text-xs text-white/50 mt-0.5">
          Ventas, gastos y pagos a proveedores en orden cronológico.
        </p>
      </div>
      <div className="divide-y divide-white/[0.06]">
        {movements.length === 0 ? (
          <div className="p-8 text-center text-white/50">
            <BanknotesIcon className="w-10 h-10 mx-auto mb-3 opacity-50" aria-hidden />
            <p className="text-sm font-medium text-white/70">Sin actividad en este período</p>
            <p className="text-xs mt-1">Los movimientos aparecerán aquí automáticamente.</p>
          </div>
        ) : (
          movements.map((m) => (
            <div
              key={m.id}
              className="flex items-center justify-between gap-4 px-4 py-3 hover:bg-white/[0.03] transition-colors"
            >
              <div className="flex items-center gap-3 min-w-0">
                <span
                  className={`
                    shrink-0 flex items-center justify-center w-8 h-8 rounded-lg
                    ${m.type === "sale" ? "bg-emerald-500/10 text-emerald-400" : "bg-red-500/10 text-red-400"}
                  `}
                >
                  {m.amount >= 0 ? (
                    <ArrowUpIcon className="w-4 h-4" aria-hidden />
                  ) : (
                    <ArrowDownIcon className="w-4 h-4" aria-hidden />
                  )}
                </span>
                <div className="min-w-0">
                  <p className="text-sm font-medium text-white truncate">{m.label}</p>
                  <p className="text-xs text-white/50">
                    {typeLabel(m.type)} · {formatDate(m.date)}
                  </p>
                </div>
              </div>
              <span className={`text-sm font-semibold tabular-nums shrink-0 ${getAmountColor(m.amount)}`}>
                {m.amount >= 0 ? "+" : ""}{formatCurrency(m.amount)}
              </span>
            </div>
          ))
        )}
      </div>
    </div>
  )
}
