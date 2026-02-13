"use client"

import { useState, useCallback } from "react"
import { useRouter } from "next/navigation"
import {
    Eye,
    Pencil,
    Banknote,
    ArrowDownToLine,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import {
    DocumentTextIcon,
    InboxIcon,
} from "@heroicons/react/24/outline"
import { formatCurrency, formatDate } from "@/app/dashboard/other/finance/lib/formatters"
import { invoiceStatusLabel } from "@/modules/invoicing/utils/invoiceStatusLabel"
import type { ClientInvoiceRow } from "../services/getClientInvoices"

// ---------------------------------------------------------------------------
// Status badge styles (reused from invoicing module)
// ---------------------------------------------------------------------------

const STATUS_STYLES: Record<string, string> = {
    DRAFT: "bg-gray-500/20 text-gray-400 border-gray-500/30",
    SENT: "bg-blue-500/20 text-blue-400 border-blue-500/30",
    VIEWED: "bg-sky-500/20 text-sky-400 border-sky-500/30",
    PARTIAL: "bg-amber-500/20 text-amber-400 border-amber-500/30",
    PAID: "bg-emerald-500/20 text-emerald-400 border-emerald-500/30",
    OVERDUE: "bg-red-500/20 text-red-400 border-red-500/30",
    CANCELED: "bg-zinc-700/80 text-zinc-400 border-zinc-600/50",
}

const ICON_BTN =
    "h-8 w-8 p-0 text-white/50 hover:text-white hover:bg-white/10 shrink-0"

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

interface ClientInvoiceListProps {
    invoices: ClientInvoiceRow[]
    clientId: string
}

export function ClientInvoiceList({ invoices, clientId }: ClientInvoiceListProps) {
    const router = useRouter()
    const [downloading, setDownloading] = useState<string | null>(null)

    // ── Actions ──────────────────────────────────────────────────────────

    const handleView = useCallback(
        (invoiceId: string) => {
            // Navigate to the invoicing view (reuse existing route)
            router.push(`/dashboard/finance/billing?invoice=${invoiceId}`)
        },
        [router]
    )

    const handleEdit = useCallback(
        (invoiceId: string) => {
            router.push(`/dashboard/finance/billing?invoice=${invoiceId}&edit=true`)
        },
        [router]
    )

    const handleRegisterPayment = useCallback(
        (invoiceId: string) => {
            router.push(
                `/dashboard/finance/billing?invoice=${invoiceId}&payment=true`
            )
        },
        [router]
    )

    const handleDownloadPdf = useCallback(
        async (invoiceId: string) => {
            try {
                setDownloading(invoiceId)
                const res = await fetch(`/api/invoicing/${invoiceId}/pdf`, {
                    credentials: "include",
                })
                if (!res.ok) throw new Error("PDF generation failed")
                const blob = await res.blob()
                const url = URL.createObjectURL(blob)
                const a = document.createElement("a")
                a.href = url
                a.download = `factura-${invoiceId}.pdf`
                a.click()
                URL.revokeObjectURL(url)
            } catch (err) {
                console.error("PDF download error:", err)
            } finally {
                setDownloading(null)
            }
        },
        []
    )

    // ── Empty state ──────────────────────────────────────────────────────

    if (invoices.length === 0) {
        return (
            <div
                id="client360-widget-invoices"
                className="rounded-2xl bg-gray-800/50 backdrop-blur-sm border border-gray-700/50 overflow-hidden"
            >
                {/* Header */}
                <div className="flex items-center gap-3 px-6 py-4 border-b border-gray-700/40">
                    <div className="p-2 rounded-lg bg-gradient-to-br from-blue-500 to-indigo-600 shadow-md">
                        <DocumentTextIcon className="w-4 h-4 text-white" />
                    </div>
                    <h3 className="text-sm font-bold text-white tracking-wide">
                        Facturas del cliente
                    </h3>
                </div>

                <div className="flex flex-col items-center justify-center py-16 px-6">
                    <div className="w-12 h-12 rounded-2xl mb-4 bg-gradient-to-br from-blue-500 to-indigo-600 opacity-20 flex items-center justify-center">
                        <InboxIcon className="w-6 h-6 text-white" />
                    </div>
                    <p className="text-sm text-gray-400 font-medium">
                        Sin facturas
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                        Este cliente no tiene facturas registradas todavía
                    </p>
                </div>
            </div>
        )
    }

    // ── Table ────────────────────────────────────────────────────────────

    return (
        <div
            id="client360-widget-invoices"
            className="rounded-2xl bg-gray-800/50 backdrop-blur-sm border border-gray-700/50 overflow-hidden"
        >
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-700/40">
                <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-gradient-to-br from-blue-500 to-indigo-600 shadow-md">
                        <DocumentTextIcon className="w-4 h-4 text-white" />
                    </div>
                    <h3 className="text-sm font-bold text-white tracking-wide">
                        Facturas del cliente
                    </h3>
                    <span className="text-xs text-gray-500 ml-1">
                        ({invoices.length})
                    </span>
                </div>
            </div>

            {/* Scrollable table */}
            <div className="overflow-x-auto">
                <table className="w-full text-left">
                    <thead>
                        <tr className="border-b border-white/6">
                            <th className="py-3 px-4 text-xs font-semibold text-gray-400 uppercase tracking-wider">
                                Número
                            </th>
                            <th className="py-3 px-4 text-xs font-semibold text-gray-400 uppercase tracking-wider">
                                Emisión
                            </th>
                            <th className="py-3 px-4 text-xs font-semibold text-gray-400 uppercase tracking-wider">
                                Vencimiento
                            </th>
                            <th className="py-3 px-4 text-xs font-semibold text-gray-400 uppercase tracking-wider">
                                Estado
                            </th>
                            <th className="py-3 px-4 text-xs font-semibold text-gray-400 uppercase tracking-wider text-right">
                                Total
                            </th>
                            <th className="py-3 px-4 text-xs font-semibold text-gray-400 uppercase tracking-wider text-right">
                                Pagado
                            </th>
                            <th className="py-3 px-4 text-xs font-semibold text-gray-400 uppercase tracking-wider text-right">
                                Pendiente
                            </th>
                            <th className="py-3 px-4 text-xs font-semibold text-gray-400 uppercase tracking-wider text-right">
                                Acciones
                            </th>
                        </tr>
                    </thead>
                    <tbody>
                        {invoices.map((inv) => {
                            const statusStyle =
                                STATUS_STYLES[inv.status] ??
                                "bg-white/10 text-white/70 border-white/20"
                            const isCanceled = inv.status === "CANCELED"

                            return (
                                <tr
                                    key={inv.id}
                                    className={`
                    border-b border-white/6 transition-colors
                    hover:bg-white/[0.04] cursor-pointer
                    ${isCanceled ? "opacity-50" : ""}
                  `}
                                    onClick={() => handleView(inv.id)}
                                    role="button"
                                    tabIndex={0}
                                    onKeyDown={(e) => {
                                        if (e.key === "Enter" || e.key === " ") {
                                            e.preventDefault()
                                            handleView(inv.id)
                                        }
                                    }}
                                    aria-label={`Ver factura ${inv.number}`}
                                >
                                    {/* Number */}
                                    <td className="py-3.5 px-4 text-sm font-medium text-white/90 whitespace-nowrap">
                                        {inv.isDraft ? "Borrador" : inv.number}
                                    </td>

                                    {/* Issue date */}
                                    <td className="py-3.5 px-4 text-sm text-white/70 whitespace-nowrap">
                                        {formatDate(inv.issueDate)}
                                    </td>

                                    {/* Due date */}
                                    <td className="py-3.5 px-4 text-sm text-white/70 whitespace-nowrap">
                                        {formatDate(inv.dueDate)}
                                    </td>

                                    {/* Status */}
                                    <td className="py-3.5 px-4">
                                        <span
                                            className={`inline-flex w-fit items-center rounded-md border px-2.5 py-0.5 text-xs font-semibold ${statusStyle}`}
                                        >
                                            {invoiceStatusLabel(inv.status)}
                                        </span>
                                    </td>

                                    {/* Total */}
                                    <td className="py-3.5 px-4 text-sm font-medium tabular-nums text-right whitespace-nowrap text-white/90">
                                        {formatCurrency(inv.total, inv.currency)}
                                    </td>

                                    {/* Paid */}
                                    <td className="py-3.5 px-4 text-sm tabular-nums text-right whitespace-nowrap text-emerald-400/80">
                                        {formatCurrency(inv.paid, inv.currency)}
                                    </td>

                                    {/* Pending */}
                                    <td className="py-3.5 px-4 text-sm font-medium tabular-nums text-right whitespace-nowrap">
                                        <span
                                            className={
                                                inv.pending > 0 ? "text-amber-400" : "text-white/50"
                                            }
                                        >
                                            {formatCurrency(inv.pending, inv.currency)}
                                        </span>
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
                                                title="Visualizar"
                                                onClick={() => handleView(inv.id)}
                                            >
                                                <Eye className="h-4 w-4" />
                                            </Button>

                                            {/* Edit — only drafts */}
                                            {inv.isDraft && (
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    className={ICON_BTN}
                                                    title="Editar"
                                                    onClick={() => handleEdit(inv.id)}
                                                >
                                                    <Pencil className="h-4 w-4" />
                                                </Button>
                                            )}

                                            {/* Register payment — not for paid/canceled */}
                                            {inv.status !== "PAID" && inv.status !== "CANCELED" && (
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    className={ICON_BTN}
                                                    title="Registrar pago"
                                                    onClick={() => handleRegisterPayment(inv.id)}
                                                >
                                                    <Banknote className="h-4 w-4" />
                                                </Button>
                                            )}

                                            {/* Download PDF */}
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                className={ICON_BTN}
                                                title="Descargar PDF"
                                                disabled={downloading === inv.id}
                                                onClick={() => handleDownloadPdf(inv.id)}
                                            >
                                                <ArrowDownToLine
                                                    className={`h-4 w-4 ${downloading === inv.id ? "animate-pulse" : ""
                                                        }`}
                                                />
                                            </Button>
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
