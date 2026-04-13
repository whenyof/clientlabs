"use client"

/**
 * InvoicePreview — modal standalone embebible.
 *
 * Diferente al page-based /dashboard/finance/invoicing/[id]/preview:
 * este componente se puede abrir desde cualquier contexto sin navegar.
 *
 * Uso:
 *   <InvoicePreviewModal invoiceId={id} onClose={() => setId(null)} />
 */

import { useEffect, useState, useCallback } from "react"
import { X, Download, CheckCircle2, RefreshCw } from "lucide-react"
import { InvoicePreview, type InvoicePreviewCompany } from "@domains/invoicing"
import type { InvoiceDetail } from "@domains/invoicing"
import { getBaseUrl } from "@/lib/api/baseUrl"
import { toast } from "sonner"

interface InvoicePreviewModalProps {
  invoiceId: string | null
  onClose: () => void
  /** Called after marking as paid — parent can refresh its list */
  onPaid?: (invoiceId: string) => void
}

export function InvoicePreviewModal({ invoiceId, onClose, onPaid }: InvoicePreviewModalProps) {
  const [invoice, setInvoice] = useState<InvoiceDetail | null>(null)
  const [company, setCompany] = useState<InvoicePreviewCompany | null>(null)
  const [loading, setLoading] = useState(false)
  const [paying, setPaying] = useState(false)

  const load = useCallback(async (id: string) => {
    setLoading(true)
    setInvoice(null)
    try {
      const [invoiceRes, brandingRes] = await Promise.all([
        fetch(`${getBaseUrl()}/api/billing/${id}`, { credentials: "include" }),
        fetch(`${getBaseUrl()}/api/billing/branding`, { credentials: "include" }),
      ])
      const [invoiceData, brandingData] = await Promise.all([
        invoiceRes.ok ? invoiceRes.json() : null,
        brandingRes.ok ? brandingRes.json() : null,
      ])
      if (invoiceData?.success && invoiceData.invoice) {
        setInvoice(invoiceData.invoice)
      }
      if (brandingData?.success && brandingData.company) {
        setCompany({
          companyName: brandingData.company.companyName ?? "",
          taxId: brandingData.company.taxId ?? "",
          address: brandingData.company.address ?? "",
          email: brandingData.company.email ?? "",
          phone: brandingData.company.phone ?? "",
          logoUrl: brandingData.company.logoUrl ?? null,
        })
      }
    } catch {
      toast.error("No se pudo cargar la factura")
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    if (invoiceId) {
      load(invoiceId)
    } else {
      setInvoice(null)
    }
  }, [invoiceId, load])

  // Cerrar con Escape
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose()
    }
    document.addEventListener("keydown", handler)
    return () => document.removeEventListener("keydown", handler)
  }, [onClose])

  const handleDownload = useCallback(() => {
    if (!invoiceId) return
    window.open(`/api/billing/${invoiceId}/pdf`, "_blank", "noopener,noreferrer")
  }, [invoiceId])

  const handleMarkAsPaid = useCallback(async () => {
    if (!invoice || !invoiceId) return
    const remaining = invoice.total - invoice.payments.reduce((s, p) => s + p.amount, 0)
    if (remaining <= 0) return

    setPaying(true)
    try {
      const res = await fetch(`${getBaseUrl()}/api/billing/invoices/${invoiceId}/pay`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ amount: remaining, method: "TRANSFERENCIA" }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error ?? "Error al registrar pago")
      toast.success("Factura marcada como pagada")
      onPaid?.(invoiceId)
      onClose()
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Error al pagar")
    } finally {
      setPaying(false)
    }
  }, [invoice, invoiceId, onClose, onPaid])

  if (!invoiceId) return null

  const isPaid = invoice?.status === "PAID" || invoice?.status === "CANCELLED"
  const canPay = invoice && !isPaid

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Overlay */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
        aria-hidden
      />

      {/* Modal */}
      <div className="relative bg-zinc-100 rounded-xl w-full max-w-3xl max-h-[92vh] flex flex-col shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3.5 bg-white rounded-t-xl border-b border-slate-100 shrink-0">
          <div className="flex items-center gap-3">
            <span className="text-[14px] font-semibold text-slate-900">
              {loading ? "Cargando..." : (invoice?.number ?? "Factura")}
            </span>
            {invoice && (
              <StatusBadge status={invoice.status} />
            )}
          </div>
          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={handleDownload}
              disabled={loading || !invoice}
              className="flex items-center gap-1.5 px-3 py-1.5 text-[12px] font-medium border border-slate-200 rounded-lg text-slate-600 hover:border-slate-300 hover:text-slate-800 transition-colors disabled:opacity-40"
            >
              <Download className="h-3.5 w-3.5" />
              PDF
            </button>
            {canPay && (
              <button
                type="button"
                onClick={handleMarkAsPaid}
                disabled={paying}
                className="flex items-center gap-1.5 px-3 py-1.5 text-[12px] font-medium bg-[#1FA97A] hover:bg-[#178a64] text-white rounded-lg transition-colors disabled:opacity-60"
              >
                {paying ? (
                  <RefreshCw className="h-3.5 w-3.5 animate-spin" />
                ) : (
                  <CheckCircle2 className="h-3.5 w-3.5" />
                )}
                Marcar pagada
              </button>
            )}
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="overflow-y-auto flex-1 py-5 px-4">
          {loading && (
            <div className="flex items-center justify-center py-20 text-slate-400 text-[13px] animate-pulse">
              Cargando factura...
            </div>
          )}
          {!loading && !invoice && (
            <div className="flex items-center justify-center py-20 text-slate-400 text-[13px]">
              No se encontro la factura
            </div>
          )}
          {!loading && invoice && (
            <div className="max-w-2xl mx-auto">
              <InvoicePreview invoice={invoice} company={company} />
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

function StatusBadge({ status }: { status: string }) {
  const styles: Record<string, string> = {
    DRAFT: "bg-slate-100 text-slate-600",
    SENT: "bg-blue-50 text-blue-700 border border-blue-200",
    VIEWED: "bg-sky-50 text-sky-700 border border-sky-200",
    PARTIAL: "bg-amber-50 text-amber-700 border border-amber-200",
    PAID: "bg-[#E1F5EE] text-[#0F6E56] border border-[#9FE1CB]",
    OVERDUE: "bg-red-50 text-red-700 border border-red-200",
    CANCELED: "bg-slate-100 text-slate-500",
    CANCELLED: "bg-slate-100 text-slate-500",
  }
  const labels: Record<string, string> = {
    DRAFT: "Borrador",
    SENT: "Enviada",
    VIEWED: "Vista",
    PARTIAL: "Pago parcial",
    PAID: "Pagada",
    OVERDUE: "Vencida",
    CANCELED: "Cancelada",
    CANCELLED: "Cancelada",
  }
  const cls = styles[status] ?? "bg-slate-100 text-slate-600"
  const label = labels[status] ?? status
  return (
    <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-medium ${cls}`}>
      {label}
    </span>
  )
}
