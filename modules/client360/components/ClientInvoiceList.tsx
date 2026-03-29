"use client"

import { useState, useCallback } from "react"
import { useRouter } from "next/navigation"
import { Eye, Pencil, Banknote, ArrowDownToLine, FileText } from "lucide-react"
import { Button } from "@/components/ui/button"
import { formatCurrency, formatDate } from "@/app/dashboard/finance/lib/formatters"
import { invoiceStatusLabel } from "@domains/invoicing"
import { getBaseUrl } from "@/lib/api/baseUrl"
import type { ClientInvoiceRow } from "../services/getClientInvoices"

const STATUS_STYLES: Record<string, string> = {
  DRAFT:    "bg-[var(--bg-surface)] text-[var(--text-secondary)] border-[var(--border-subtle)]",
  SENT:     "bg-blue-50 text-blue-700 border-blue-200",
  VIEWED:   "bg-sky-50 text-sky-700 border-sky-200",
  PARTIAL:  "bg-amber-50 text-amber-700 border-amber-200",
  PAID:     "bg-[var(--accent-soft)] text-[var(--accent)] border-[var(--accent)]",
  OVERDUE:  "bg-red-50 text-red-700 border-red-200",
  CANCELED: "bg-[var(--bg-surface)] text-[var(--text-secondary)] border-[var(--border-subtle)]",
}

const ICON_BTN = "h-8 w-8 p-0 text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-surface)] shrink-0"

interface ClientInvoiceListProps {
  invoices: ClientInvoiceRow[]
  clientId: string
}

export function ClientInvoiceList({ invoices, clientId }: ClientInvoiceListProps) {
  const router = useRouter()
  const [downloading, setDownloading] = useState<string | null>(null)

  const handleView = useCallback((id: string) => {
    router.push(`/dashboard/finance/billing?invoice=${id}`)
  }, [router])

  const handleEdit = useCallback((id: string) => {
    router.push(`/dashboard/finance/billing?invoice=${id}&edit=true`)
  }, [router])

  const handleRegisterPayment = useCallback((id: string) => {
    router.push(`/dashboard/finance/billing?invoice=${id}&payment=true`)
  }, [router])

  const handleDownloadPdf = useCallback(async (id: string) => {
    try {
      setDownloading(id)
      const res = await fetch(`${getBaseUrl()}/api/invoicing/${id}/pdf`, { credentials: "include" })
      if (!res.ok) throw new Error("PDF generation failed")
      const blob = await res.blob()
      const url = URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = url
      a.download = `factura-${id}.pdf`
      a.click()
      URL.revokeObjectURL(url)
    } catch (err) {
      console.error("PDF download error:", err)
    } finally {
      setDownloading(null)
    }
  }, [])

  if (invoices.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 gap-2 text-[var(--text-secondary)]">
        <FileText className="h-8 w-8 opacity-30" />
        <p className="text-sm">No hay facturas registradas</p>
      </div>
    )
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-left text-sm">
        <thead>
          <tr className="border-b border-[var(--border-subtle)]">
            {["Número", "Emisión", "Vencimiento", "Estado", "Total", "Pagado", "Pendiente", ""].map((h) => (
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
          {invoices.map((inv) => {
            const statusStyle = STATUS_STYLES[inv.status] ?? STATUS_STYLES["DRAFT"]
            return (
              <tr
                key={inv.id}
                onClick={() => handleView(inv.id)}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); handleView(inv.id) } }}
                aria-label={`Ver factura ${inv.number}`}
                className={[
                  "border-b border-[var(--border-subtle)] transition-colors cursor-pointer",
                  "hover:bg-[var(--bg-surface)]",
                  inv.status === "CANCELED" ? "opacity-50" : "",
                ].join(" ")}
              >
                <td className="py-3 px-4 font-medium text-[var(--text-primary)] whitespace-nowrap">
                  {inv.isDraft ? "Borrador" : inv.number}
                </td>
                <td className="py-3 px-4 text-[var(--text-secondary)] whitespace-nowrap">
                  {formatDate(inv.issueDate)}
                </td>
                <td className="py-3 px-4 text-[var(--text-secondary)] whitespace-nowrap">
                  {formatDate(inv.dueDate)}
                </td>
                <td className="py-3 px-4">
                  <span className={`inline-flex items-center rounded-md border px-2 py-0.5 text-[11px] font-semibold ${statusStyle}`}>
                    {invoiceStatusLabel(inv.status)}
                  </span>
                </td>
                <td className="py-3 px-4 text-right tabular-nums font-medium text-[var(--text-primary)] whitespace-nowrap">
                  {formatCurrency(inv.total, inv.currency)}
                </td>
                <td className="py-3 px-4 text-right tabular-nums text-[var(--accent)] whitespace-nowrap">
                  {formatCurrency(inv.paid, inv.currency)}
                </td>
                <td className="py-3 px-4 text-right tabular-nums text-[var(--text-secondary)] whitespace-nowrap">
                  {formatCurrency(inv.pending, inv.currency)}
                </td>
                <td className="py-3 px-4 text-right" onClick={(e) => e.stopPropagation()}>
                  <div className="flex items-center justify-end gap-0.5">
                    <Button variant="ghost" size="sm" className={ICON_BTN} title="Ver" onClick={() => handleView(inv.id)}>
                      <Eye className="h-3.5 w-3.5" />
                    </Button>
                    {inv.isDraft && (
                      <Button variant="ghost" size="sm" className={ICON_BTN} title="Editar" onClick={() => handleEdit(inv.id)}>
                        <Pencil className="h-3.5 w-3.5" />
                      </Button>
                    )}
                    {inv.status !== "PAID" && inv.status !== "CANCELED" && (
                      <Button variant="ghost" size="sm" className={ICON_BTN} title="Registrar pago" onClick={() => handleRegisterPayment(inv.id)}>
                        <Banknote className="h-3.5 w-3.5" />
                      </Button>
                    )}
                    <Button variant="ghost" size="sm" className={ICON_BTN} title="Descargar PDF" disabled={downloading === inv.id} onClick={() => handleDownloadPdf(inv.id)}>
                      <ArrowDownToLine className={`h-3.5 w-3.5 ${downloading === inv.id ? "animate-pulse" : ""}`} />
                    </Button>
                  </div>
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}
