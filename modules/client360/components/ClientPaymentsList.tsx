"use client"

import { useCallback } from "react"
import { useRouter } from "next/navigation"
import { FileText, ShoppingBag, Banknote } from "lucide-react"
import { Button } from "@/components/ui/button"
import { formatCurrency, formatDate } from "@/app/dashboard/finance/lib/formatters"
import type { ClientPaymentRow, ClientPaymentsKPIs } from "../services/getClientPayments"

const METHOD_LABELS: Record<string, string> = {
  transfer: "Transferencia", TRANSFER: "Transferencia",
  card:     "Tarjeta",       CARD:     "Tarjeta",
  cash:     "Efectivo",      CASH:     "Efectivo",
  check:    "Cheque",        CHECK:    "Cheque",
  bizum:    "Bizum",         BIZUM:    "Bizum",
  paypal:   "PayPal",        PAYPAL:   "PayPal",
  other:    "Otro",          OTHER:    "Otro",
}

const ICON_BTN = "h-8 w-8 p-0 text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-surface)] shrink-0"

interface ClientPaymentsListProps {
  payments: ClientPaymentRow[]
  kpis: ClientPaymentsKPIs
}

export function ClientPaymentsList({ payments }: ClientPaymentsListProps) {
  const router = useRouter()

  const handleViewInvoice = useCallback((id: string) => {
    router.push(`/dashboard/finance/billing?invoice=${id}`)
  }, [router])

  const handleViewSale = useCallback((id: string) => {
    router.push(`/dashboard/sales?sale=${id}`)
  }, [router])

  if (payments.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 gap-2 text-[var(--text-secondary)]">
        <Banknote className="h-8 w-8 opacity-30" />
        <p className="text-sm">No hay pagos registrados</p>
      </div>
    )
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-left text-sm">
        <thead>
          <tr className="border-b border-[var(--border-subtle)]">
            {["Fecha", "Método", "Referencia", "Factura", "Importe", ""].map((h) => (
              <th
                key={h}
                className="py-2.5 px-4 text-[11px] font-semibold text-[var(--text-secondary)] uppercase tracking-wider whitespace-nowrap last:w-0"
              >
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {payments.map((p) => (
            <tr
              key={p.id}
              className="border-b border-[var(--border-subtle)] transition-colors hover:bg-[var(--bg-surface)]"
            >
              <td className="py-3 px-4 text-[var(--text-secondary)] whitespace-nowrap">
                {formatDate(p.paidAt)}
              </td>
              <td className="py-3 px-4">
                <span className="inline-flex items-center rounded-md border border-[var(--border-subtle)] bg-[var(--bg-surface)] px-2 py-0.5 text-[11px] font-medium text-[var(--text-secondary)]">
                  {METHOD_LABELS[p.method] ?? p.method}
                </span>
              </td>
              <td className="py-3 px-4 text-[var(--text-secondary)] max-w-[160px] truncate" title={p.reference ?? ""}>
                {p.reference || "—"}
              </td>
              <td className="py-3 px-4">
                <button
                  className="text-sm font-medium text-[var(--accent)] hover:underline transition-colors"
                  onClick={() => handleViewInvoice(p.invoiceId)}
                >
                  {p.invoiceNumber}
                </button>
              </td>
              <td className="py-3 px-4 text-right tabular-nums font-semibold text-[var(--accent)] whitespace-nowrap">
                {formatCurrency(p.amount, p.currency)}
              </td>
              <td className="py-3 px-4 text-right">
                <div className="flex items-center justify-end gap-0.5">
                  <Button variant="ghost" size="sm" className={ICON_BTN} title={`Ver factura ${p.invoiceNumber}`} onClick={() => handleViewInvoice(p.invoiceId)}>
                    <FileText className="h-3.5 w-3.5" />
                  </Button>
                  {p.saleId && (
                    <Button variant="ghost" size="sm" className={ICON_BTN} title="Ver venta" onClick={() => handleViewSale(p.saleId!)}>
                      <ShoppingBag className="h-3.5 w-3.5" />
                    </Button>
                  )}
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
