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
import { formatCurrency, formatDate } from "@/app/dashboard/other/finance/lib/formatters"
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
    "h-8 w-8 p-0 text-white/50 hover:text-white hover:bg-white/10 shrink-0"

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
            gradient: "from-emerald-500 to-green-600",
            bg: "from-emerald-500/10 to-green-600/10",
        },
        {
            id: "paid-month",
            label: "Este mes",
            value: formatCurrency(kpis.paidThisMonth),
            icon: CalendarDaysIcon,
            gradient: "from-blue-500 to-indigo-600",
            bg: "from-blue-500/10 to-indigo-600/10",
        },
        {
            id: "avg-payment",
            label: "Promedio de pago",
            value: formatCurrency(kpis.averagePayment),
            icon: ArrowTrendingUpIcon,
            gradient: "from-violet-500 to-purple-600",
            bg: "from-violet-500/10 to-purple-600/10",
        },
        {
            id: "last-payment",
            label: "Último pago",
            value: kpis.lastPayment ? formatDate(kpis.lastPayment) : "—",
            icon: ClockIcon,
            gradient: "from-amber-500 to-orange-600",
            bg: "from-amber-500/10 to-orange-600/10",
        },
    ]

    return (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 px-6 pb-4">
            {cards.map((c) => {
                const Icon = c.icon
                return (
                    <div
                        key={c.id}
                        className="relative overflow-hidden rounded-xl bg-gray-800/60 border border-gray-700/40 p-4"
                    >
                        <div className={`absolute inset-0 bg-gradient-to-br ${c.bg} opacity-40`} />
                        <div className="relative flex items-center gap-3">
                            <div className={`p-2 rounded-lg bg-gradient-to-br ${c.gradient} shadow-md`}>
                                <Icon className="w-4 h-4 text-white" />
                            </div>
                            <div>
                                <div className="text-lg font-bold text-white">{c.value}</div>
                                <div className="text-[11px] text-gray-400 font-medium leading-tight">{c.label}</div>
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
            <div
                id="client360-widget-payments"
                className="rounded-2xl bg-gray-800/50 backdrop-blur-sm border border-gray-700/50 overflow-hidden"
            >
                <div className="flex items-center gap-3 px-6 py-4 border-b border-gray-700/40">
                    <div className="p-2 rounded-lg bg-gradient-to-br from-emerald-500 to-green-600 shadow-md">
                        <BanknotesIcon className="w-4 h-4 text-white" />
                    </div>
                    <h3 className="text-sm font-bold text-white tracking-wide">
                        Pagos del cliente
                    </h3>
                </div>

                <div className="flex flex-col items-center justify-center py-16 px-6">
                    <div className="w-12 h-12 rounded-2xl mb-4 bg-gradient-to-br from-emerald-500 to-green-600 opacity-20 flex items-center justify-center">
                        <InboxIcon className="w-6 h-6 text-white" />
                    </div>
                    <p className="text-sm text-gray-400 font-medium">Sin pagos</p>
                    <p className="text-xs text-gray-500 mt-1">
                        No se han registrado pagos de este cliente todavía
                    </p>
                </div>
            </div>
        )
    }

    // ── Table ────────────────────────────────────────────────────────────

    return (
        <div
            id="client360-widget-payments"
            className="rounded-2xl bg-gray-800/50 backdrop-blur-sm border border-gray-700/50 overflow-hidden"
        >
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-700/40">
                <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-gradient-to-br from-emerald-500 to-green-600 shadow-md">
                        <BanknotesIcon className="w-4 h-4 text-white" />
                    </div>
                    <h3 className="text-sm font-bold text-white tracking-wide">
                        Pagos del cliente
                    </h3>
                    <span className="text-xs text-gray-500 ml-1">
                        ({payments.length})
                    </span>
                </div>
            </div>

            {/* Mini KPIs */}
            <div className="pt-4">
                <PaymentsKpiCards kpis={kpis} />
            </div>

            {/* Scrollable table */}
            <div className="overflow-x-auto">
                <table className="w-full text-left">
                    <thead>
                        <tr className="border-b border-white/6">
                            <th className="py-3 px-4 text-xs font-semibold text-gray-400 uppercase tracking-wider">
                                Fecha
                            </th>
                            <th className="py-3 px-4 text-xs font-semibold text-gray-400 uppercase tracking-wider">
                                Método
                            </th>
                            <th className="py-3 px-4 text-xs font-semibold text-gray-400 uppercase tracking-wider">
                                Referencia
                            </th>
                            <th className="py-3 px-4 text-xs font-semibold text-gray-400 uppercase tracking-wider">
                                Factura
                            </th>
                            <th className="py-3 px-4 text-xs font-semibold text-gray-400 uppercase tracking-wider text-right">
                                Importe
                            </th>
                            <th className="py-3 px-4 text-xs font-semibold text-gray-400 uppercase tracking-wider text-right">
                                Acciones
                            </th>
                        </tr>
                    </thead>
                    <tbody>
                        {payments.map((p) => (
                            <tr
                                key={p.id}
                                className="border-b border-white/6 transition-colors hover:bg-white/[0.04]"
                            >
                                {/* Date */}
                                <td className="py-3.5 px-4 text-sm text-white/80 whitespace-nowrap">
                                    {formatDate(p.paidAt)}
                                </td>

                                {/* Method */}
                                <td className="py-3.5 px-4">
                                    <span className="inline-flex items-center rounded-md border border-gray-600/40 bg-gray-700/30 px-2.5 py-0.5 text-xs font-semibold text-gray-300">
                                        {METHOD_LABELS[p.method] ?? p.method}
                                    </span>
                                </td>

                                {/* Reference */}
                                <td className="py-3.5 px-4 text-sm text-white/60 max-w-[160px] truncate" title={p.reference ?? ""}>
                                    {p.reference || "—"}
                                </td>

                                {/* Invoice number */}
                                <td className="py-3.5 px-4">
                                    <button
                                        className="text-sm font-medium text-blue-400 hover:text-blue-300 hover:underline transition-colors"
                                        onClick={() => handleViewInvoice(p.invoiceId)}
                                    >
                                        {p.invoiceNumber}
                                    </button>
                                </td>

                                {/* Amount */}
                                <td className="py-3.5 px-4 text-sm font-bold tabular-nums text-right whitespace-nowrap text-emerald-400">
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
        </div>
    )
}
