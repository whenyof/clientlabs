"use client"

import { useCallback } from "react"
import { useRouter } from "next/navigation"
import { FileText, ShoppingBag } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
 BanknotesIcon,
 InboxIcon,
 CurrencyEuroIcon,
 CalendarDaysIcon,
 ArrowTrendingUpIcon,
 ClockIcon,
} from "@heroicons/react/24/outline"
import { formatCurrency, formatDate } from "@/app/dashboard/finance/lib/formatters"
import type { ClientPaymentRow, ClientPaymentsKPIs } from "../services/getClientPayments"

// ---------------------------------------------------------------------------
// Method labels
// ---------------------------------------------------------------------------

const METHOD_LABELS: Record<string, string> = {
 transfer: "Transferencia",
 card: "Tarjeta",
 cash: "Efectivo",
 check: "Cheque",
 other: "Otro",
 TRANSFER: "Transferencia",
 CARD: "Tarjeta",
 CASH: "Efectivo",
 CHECK: "Cheque",
 OTHER: "Otro",
 bizum: "Bizum",
 BIZUM: "Bizum",
 paypal: "PayPal",
 PAYPAL: "PayPal",
}

const ICON_BTN =
 "h-8 w-8 p-0 text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-card)] shrink-0"

// ---------------------------------------------------------------------------
// Mini-KPI strip
// ---------------------------------------------------------------------------

function PaymentsKpiCards({ kpis }: { kpis: ClientPaymentsKPIs }) {
 const cards = [
 {
 id: "total-paid",
 label: "Total pagado",
 value: formatCurrency(kpis.totalPaid),
 icon: CurrencyEuroIcon,
 gradient: " ",
 bg: " ",
 },
 {
 id: "paid-month",
 label: "Este mes",
 value: formatCurrency(kpis.paidThisMonth),
 icon: CalendarDaysIcon,
 gradient: " ",
 bg: " ",
 },
 {
 id: "avg-payment",
 label: "Promedio de pago",
 value: formatCurrency(kpis.averagePayment),
 icon: ArrowTrendingUpIcon,
 gradient: " ",
 bg: " ",
 },
 {
 id: "last-payment",
 label: "Último pago",
 value: kpis.lastPayment ? formatDate(kpis.lastPayment) : "—",
 icon: ClockIcon,
 gradient: " ",
 bg: " ",
 },
 ]

 return (
 <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 px-6 pb-4">
 {cards.map((c) => {
 const Icon = c.icon
 return (
 <div
 key={c.id}
 className="relative overflow-hidden rounded-xl bg-[var(--bg-card)]/60 border border-[var(--border-subtle)] p-4"
 >
 <div className={`absolute inset-0 bg-[var(--bg-card)] ${c.bg} opacity-40`} />
 <div className="relative flex items-center gap-3">
 <div className={`p-2 rounded-lg bg-[var(--bg-card)] ${c.gradient} shadow-md`}>
 <Icon className="w-4 h-4 text-[var(--text-primary)]" />
 </div>
 <div>
 <div className="text-lg font-bold text-[var(--text-primary)]">{c.value}</div>
 <div className="text-[11px] text-[var(--text-secondary)] font-medium leading-tight">{c.label}</div>
 </div>
 </div>
 </div>
 )
 })}
 </div>
 )
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

interface ClientPaymentsListProps {
 payments: ClientPaymentRow[]
 kpis: ClientPaymentsKPIs
}

export function ClientPaymentsList({ payments, kpis }: ClientPaymentsListProps) {
 const router = useRouter()

 const handleViewInvoice = useCallback(
 (invoiceId: string) => {
 router.push(`/dashboard/finance/billing?invoice=${invoiceId}`)
 },
 [router]
 )

 const handleViewSale = useCallback(
 (saleId: string) => {
 router.push(`/dashboard/sales?sale=${saleId}`)
 },
 [router]
 )

 // ── Empty state ──────────────────────────────────────────────────────

 if (payments.length === 0) {
 return (
      <div className="text-xs text-[var(--text-secondary)]">
        No se han registrado pagos de este cliente todavía.
      </div>
 )
 }

 // ── Table ────────────────────────────────────────────────────────────

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-left text-sm">
 <thead>
 <tr className="border-b border-[var(--border-subtle)]">
 <th className="py-3 px-4 text-xs font-semibold text-[var(--text-secondary)] uppercase tracking-wider">
 Fecha
 </th>
 <th className="py-3 px-4 text-xs font-semibold text-[var(--text-secondary)] uppercase tracking-wider">
 Método
 </th>
 <th className="py-3 px-4 text-xs font-semibold text-[var(--text-secondary)] uppercase tracking-wider">
 Referencia
 </th>
 <th className="py-3 px-4 text-xs font-semibold text-[var(--text-secondary)] uppercase tracking-wider">
 Factura
 </th>
 <th className="py-3 px-4 text-xs font-semibold text-[var(--text-secondary)] uppercase tracking-wider text-right">
 Importe
 </th>
 <th className="py-3 px-4 text-xs font-semibold text-[var(--text-secondary)] uppercase tracking-wider text-right">
 Acciones
 </th>
 </tr>
 </thead>
 <tbody>
 {payments.map((p) => (
            <tr
              key={p.id}
              className="border-b border-[var(--border-subtle)] transition-colors hover:bg-neutral-50"
            >
 {/* Date */}
 <td className="py-3.5 px-4 text-sm text-[var(--text-secondary)] whitespace-nowrap">
 {formatDate(p.paidAt)}
 </td>

 {/* Method */}
 <td className="py-3.5 px-4">
 <span className="inline-flex items-center rounded-md border border-[var(--border-subtle)] bg-[var(--bg-card)] border border-[var(--border-subtle)] px-2.5 py-0.5 text-xs font-semibold text-gray-300">
 {METHOD_LABELS[p.method] ?? p.method}
 </span>
 </td>

 {/* Reference */}
 <td className="py-3.5 px-4 text-sm text-[var(--text-secondary)] max-w-[160px] truncate" title={p.reference ?? ""}>
 {p.reference || "—"}
 </td>

 {/* Invoice number */}
 <td className="py-3.5 px-4">
 <button
 className="text-sm font-medium text-[var(--accent)] hover:text-[var(--accent)] hover:underline transition-colors"
 onClick={() => handleViewInvoice(p.invoiceId)}
 >
 {p.invoiceNumber}
 </button>
 </td>

 {/* Amount */}
 <td className="py-3.5 px-4 text-sm font-bold tabular-nums text-right whitespace-nowrap text-[var(--accent)]">
 {formatCurrency(p.amount, p.currency)}
 </td>

 {/* Actions */}
 <td className="py-3.5 px-4 text-right w-0">
 <div className="flex items-center justify-end gap-0.5">
 {/* View invoice */}
 <Button
 variant="ghost"
 size="sm"
 className={ICON_BTN}
 title={`Ver factura ${p.invoiceNumber}`}
 onClick={() => handleViewInvoice(p.invoiceId)}
 >
 <FileText className="h-4 w-4" />
 </Button>

 {/* View sale (if linked) */}
 {p.saleId && (
 <Button
 variant="ghost"
 size="sm"
 className={ICON_BTN}
 title="Ver venta asociada"
 onClick={() => handleViewSale(p.saleId!)}
 >
 <ShoppingBag className="h-4 w-4" />
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
