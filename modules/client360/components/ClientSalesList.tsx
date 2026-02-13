"use client"

import { useCallback } from "react"
import { useRouter } from "next/navigation"
import {
    Eye,
    Pencil,
    FileText,
    FilePlus2,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import {
    ShoppingBagIcon,
    InboxIcon,
    CurrencyEuroIcon,
    TicketIcon,
    HashtagIcon,
    CalendarDaysIcon,
} from "@heroicons/react/24/outline"
import { formatCurrency, formatDate } from "@/app/dashboard/other/finance/lib/formatters"
import type { ClientSaleRow, ClientSalesKPIs } from "../services/getClientSales"

// ---------------------------------------------------------------------------
// Status badge styles (reused from existing SalesList patterns)
// ---------------------------------------------------------------------------

const STATUS_STYLES: Record<string, { label: string; style: string }> = {
    PAID: { label: "Pagado", style: "bg-emerald-500/20 text-emerald-400 border-emerald-500/30" },
    PAGADO: { label: "Pagado", style: "bg-emerald-500/20 text-emerald-400 border-emerald-500/30" },
    PENDING: { label: "Pendiente", style: "bg-amber-500/20 text-amber-400 border-amber-500/30" },
    CANCELED: { label: "Cancelado", style: "bg-red-500/20 text-red-400 border-red-500/30" },
    CANCELADO: { label: "Cancelado", style: "bg-red-500/20 text-red-400 border-red-500/30" },
}

const ICON_BTN =
    "h-8 w-8 p-0 text-white/50 hover:text-white hover:bg-white/10 shrink-0"

// ---------------------------------------------------------------------------
// Mini-KPI strip (above table)
// ---------------------------------------------------------------------------

function SalesKpiCards({ kpis }: { kpis: ClientSalesKPIs }) {
    const cards = [
        {
            id: "total-purchased",
            label: "Total comprado",
            value: formatCurrency(kpis.totalPurchased),
            icon: CurrencyEuroIcon,
            gradient: "from-emerald-500 to-green-600",
            bg: "from-emerald-500/10 to-green-600/10",
        },
        {
            id: "avg-ticket",
            label: "Ticket medio",
            value: formatCurrency(kpis.averageTicket),
            icon: TicketIcon,
            gradient: "from-blue-500 to-indigo-600",
            bg: "from-blue-500/10 to-indigo-600/10",
        },
        {
            id: "order-count",
            label: "Pedidos",
            value: String(kpis.orderCount),
            icon: HashtagIcon,
            gradient: "from-violet-500 to-purple-600",
            bg: "from-violet-500/10 to-purple-600/10",
        },
        {
            id: "last-purchase",
            label: "Última compra",
            value: kpis.lastPurchase ? formatDate(kpis.lastPurchase) : "—",
            icon: CalendarDaysIcon,
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

interface ClientSalesListProps {
    sales: ClientSaleRow[]
    kpis: ClientSalesKPIs
    clientId: string
}

export function ClientSalesList({ sales, kpis, clientId }: ClientSalesListProps) {
    const router = useRouter()

    // ── Actions ──────────────────────────────────────────────────────────

    const handleView = useCallback(
        (saleId: string) => {
            router.push(`/dashboard/sales?sale=${saleId}`)
        },
        [router]
    )

    const handleEdit = useCallback(
        (saleId: string) => {
            router.push(`/dashboard/sales?sale=${saleId}&edit=true`)
        },
        [router]
    )

    const handleViewInvoice = useCallback(
        (invoiceId: string) => {
            router.push(`/dashboard/finance/billing?invoice=${invoiceId}`)
        },
        [router]
    )

    const handleCreateInvoice = useCallback(
        (saleId: string) => {
            router.push(`/dashboard/finance/billing?newFromSale=${saleId}&client=${clientId}`)
        },
        [router, clientId]
    )

    // ── Empty state ──────────────────────────────────────────────────────

    if (sales.length === 0) {
        return (
            <div
                id="client360-widget-sales"
                className="rounded-2xl bg-gray-800/50 backdrop-blur-sm border border-gray-700/50 overflow-hidden"
            >
                <div className="flex items-center gap-3 px-6 py-4 border-b border-gray-700/40">
                    <div className="p-2 rounded-lg bg-gradient-to-br from-violet-500 to-purple-600 shadow-md">
                        <ShoppingBagIcon className="w-4 h-4 text-white" />
                    </div>
                    <h3 className="text-sm font-bold text-white tracking-wide">
                        Ventas del cliente
                    </h3>
                </div>

                <div className="flex flex-col items-center justify-center py-16 px-6">
                    <div className="w-12 h-12 rounded-2xl mb-4 bg-gradient-to-br from-violet-500 to-purple-600 opacity-20 flex items-center justify-center">
                        <InboxIcon className="w-6 h-6 text-white" />
                    </div>
                    <p className="text-sm text-gray-400 font-medium">Sin ventas</p>
                    <p className="text-xs text-gray-500 mt-1">
                        Este cliente no tiene ventas registradas todavía
                    </p>
                </div>
            </div>
        )
    }

    // ── Table ────────────────────────────────────────────────────────────

    return (
        <div
            id="client360-widget-sales"
            className="rounded-2xl bg-gray-800/50 backdrop-blur-sm border border-gray-700/50 overflow-hidden"
        >
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-700/40">
                <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-gradient-to-br from-violet-500 to-purple-600 shadow-md">
                        <ShoppingBagIcon className="w-4 h-4 text-white" />
                    </div>
                    <h3 className="text-sm font-bold text-white tracking-wide">
                        Ventas del cliente
                    </h3>
                    <span className="text-xs text-gray-500 ml-1">
                        ({sales.length})
                    </span>
                </div>
            </div>

            {/* Mini KPIs */}
            <div className="pt-4">
                <SalesKpiCards kpis={kpis} />
            </div>

            {/* Scrollable table */}
            <div className="overflow-x-auto">
                <table className="w-full text-left">
                    <thead>
                        <tr className="border-b border-white/6">
                            <th className="py-3 px-4 text-xs font-semibold text-gray-400 uppercase tracking-wider">
                                Producto
                            </th>
                            <th className="py-3 px-4 text-xs font-semibold text-gray-400 uppercase tracking-wider">
                                Fecha
                            </th>
                            <th className="py-3 px-4 text-xs font-semibold text-gray-400 uppercase tracking-wider">
                                Estado
                            </th>
                            <th className="py-3 px-4 text-xs font-semibold text-gray-400 uppercase tracking-wider text-right">
                                Total
                            </th>
                            <th className="py-3 px-4 text-xs font-semibold text-gray-400 uppercase tracking-wider text-center">
                                Factura
                            </th>
                            <th className="py-3 px-4 text-xs font-semibold text-gray-400 uppercase tracking-wider text-right">
                                Acciones
                            </th>
                        </tr>
                    </thead>
                    <tbody>
                        {sales.map((sale) => {
                            const st = STATUS_STYLES[sale.status] ?? {
                                label: sale.status,
                                style: "bg-white/10 text-white/70 border-white/20",
                            }
                            const hasInvoice = !!sale.invoiceId

                            return (
                                <tr
                                    key={sale.id}
                                    className="border-b border-white/6 transition-colors hover:bg-white/[0.04] cursor-pointer"
                                    onClick={() => handleView(sale.id)}
                                    role="button"
                                    tabIndex={0}
                                    onKeyDown={(e) => {
                                        if (e.key === "Enter" || e.key === " ") {
                                            e.preventDefault()
                                            handleView(sale.id)
                                        }
                                    }}
                                    aria-label={`Ver venta ${sale.product}`}
                                >
                                    {/* Product */}
                                    <td className="py-3.5 px-4 text-sm font-medium text-white/90 max-w-[220px] truncate">
                                        {sale.product}
                                    </td>

                                    {/* Date */}
                                    <td className="py-3.5 px-4 text-sm text-white/70 whitespace-nowrap">
                                        {formatDate(sale.saleDate)}
                                    </td>

                                    {/* Status */}
                                    <td className="py-3.5 px-4">
                                        <span
                                            className={`inline-flex w-fit items-center rounded-md border px-2.5 py-0.5 text-xs font-semibold ${st.style}`}
                                        >
                                            {st.label}
                                        </span>
                                    </td>

                                    {/* Total */}
                                    <td className="py-3.5 px-4 text-sm font-medium tabular-nums text-right whitespace-nowrap text-white/90">
                                        {formatCurrency(sale.total, sale.currency)}
                                    </td>

                                    {/* Invoice association */}
                                    <td className="py-3.5 px-4 text-center">
                                        {hasInvoice ? (
                                            <span className="inline-flex items-center gap-1 rounded-md border border-emerald-500/30 bg-emerald-500/20 px-2 py-0.5 text-xs font-semibold text-emerald-400">
                                                Sí
                                            </span>
                                        ) : (
                                            <span className="inline-flex items-center gap-1 rounded-md border border-gray-600/40 bg-gray-700/30 px-2 py-0.5 text-xs font-semibold text-gray-500">
                                                No
                                            </span>
                                        )}
                                    </td>

                                    {/* Actions */}
                                    <td
                                        className="py-3.5 px-4 text-right w-0"
                                        onClick={(e) => e.stopPropagation()}
                                    >
                                        <div className="flex items-center justify-end gap-0.5">
                                            {/* View */}
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                className={ICON_BTN}
                                                title="Ver venta"
                                                onClick={() => handleView(sale.id)}
                                            >
                                                <Eye className="h-4 w-4" />
                                            </Button>

                                            {/* Edit */}
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                className={ICON_BTN}
                                                title="Editar venta"
                                                onClick={() => handleEdit(sale.id)}
                                            >
                                                <Pencil className="h-4 w-4" />
                                            </Button>

                                            {/* Invoice: view or create */}
                                            {hasInvoice ? (
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    className={ICON_BTN}
                                                    title="Ver factura asociada"
                                                    onClick={() => handleViewInvoice(sale.invoiceId!)}
                                                >
                                                    <FileText className="h-4 w-4 text-emerald-400/70" />
                                                </Button>
                                            ) : (
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    className={ICON_BTN}
                                                    title="Crear factura"
                                                    onClick={() => handleCreateInvoice(sale.id)}
                                                >
                                                    <FilePlus2 className="h-4 w-4 text-blue-400/70" />
                                                </Button>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            )
                        })}
                    </tbody>
                </table>
            </div>
        </div>
    )
}
