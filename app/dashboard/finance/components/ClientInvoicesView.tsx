"use client"

import { useState, useEffect, useCallback } from "react"
import { FileText, Receipt } from "lucide-react"
import { cn } from "@/lib/utils"

type InvoiceStatus = "DRAFT" | "SENT" | "PAID" | "OVERDUE" | "CANCELLED" | "RECTIFICATION"

type Invoice = {
  id: string
  number: string
  status: InvoiceStatus
  issueDate: string
  dueDate: string
  total: string | number
  pdfUrl?: string | null
}

const STATUS_BADGE: Partial<Record<InvoiceStatus, string>> = {
  DRAFT: "bg-slate-100 text-slate-600",
  SENT: "bg-blue-50 text-blue-700 border border-blue-200",
  PAID: "bg-[#E1F5EE] text-[#0F6E56] border border-[#9FE1CB]",
  OVERDUE: "bg-red-50 text-red-700 border border-red-200",
  CANCELLED: "bg-slate-100 text-slate-500",
  RECTIFICATION: "bg-purple-50 text-purple-700 border border-purple-200",
}

const STATUS_LABEL: Partial<Record<InvoiceStatus, string>> = {
  DRAFT: "Borrador",
  SENT: "Enviada",
  PAID: "Pagada",
  OVERDUE: "Vencida",
  CANCELLED: "Cancelada",
  RECTIFICATION: "Rectificativa",
}

function fmt(n: string | number) {
  return new Intl.NumberFormat("es-ES", { style: "currency", currency: "EUR" }).format(Number(n))
}

function fmtDate(d: string) {
  return new Intl.DateTimeFormat("es-ES", { day: "2-digit", month: "2-digit", year: "numeric" }).format(new Date(d))
}

type Props = { clientId?: string }

export function ClientInvoicesView({ clientId }: Props) {
  const [invoices, setInvoices] = useState<Invoice[]>([])
  const [loading, setLoading] = useState(false)

  const fetchInvoices = useCallback(async () => {
    if (!clientId) { setInvoices([]); return }
    setLoading(true)
    try {
      const res = await fetch(`/api/clients/${clientId}/invoices`)
      const data = await res.json()
      if (data.invoices) setInvoices(data.invoices)
    } finally {
      setLoading(false)
    }
  }, [clientId])

  useEffect(() => { fetchInvoices() }, [fetchInvoices])

  if (!clientId) {
    return (
      <div className="flex flex-col items-center justify-center py-16 rounded-xl border border-slate-200 bg-white text-center">
        <Receipt className="h-8 w-8 text-slate-300 mb-3" />
        <p className="text-[13px] text-slate-500">Selecciona un cliente para ver sus facturas</p>
      </div>
    )
  }

  return (
    <div className="rounded-xl border border-slate-200 bg-white overflow-hidden">
      {loading ? (
        <div className="py-12 text-center text-[13px] text-slate-400 animate-pulse">Cargando...</div>
      ) : invoices.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <div className="w-12 h-12 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-center mb-4">
            <Receipt className="h-5 w-5 text-slate-400" />
          </div>
          <p className="text-[14px] font-medium text-slate-700 mb-1">No hay facturas</p>
          <p className="text-[12px] text-slate-400">Las facturas de este cliente aparecerán aquí</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full min-w-[600px]">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50">
                {["Número", "Fecha", "Vencimiento", "Importe", "Estado", ""].map((h) => (
                  <th key={h} className="py-3 px-4 text-left text-[10px] font-medium text-slate-400 uppercase tracking-wider">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {invoices.map((inv) => (
                <tr key={inv.id} className="border-b border-slate-100 hover:bg-slate-50/50 transition-colors">
                  <td className="py-3.5 px-4 font-mono text-[12px] text-slate-700 font-medium">{inv.number}</td>
                  <td className="py-3.5 px-4 text-[12px] text-slate-500">{fmtDate(inv.issueDate)}</td>
                  <td className="py-3.5 px-4 text-[12px] text-slate-500">{fmtDate(inv.dueDate)}</td>
                  <td className="py-3.5 px-4 text-[13px] font-semibold text-slate-900 text-right tabular-nums">{fmt(inv.total)}</td>
                  <td className="py-3.5 px-4">
                    <span className={cn(
                      "inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-medium",
                      STATUS_BADGE[inv.status] ?? "bg-slate-100 text-slate-600"
                    )}>
                      {STATUS_LABEL[inv.status] ?? inv.status}
                    </span>
                  </td>
                  <td className="py-3.5 px-4">
                    <button
                      onClick={() => window.open(`/api/invoicing/${inv.id}/pdf`, "_blank")}
                      className="p-1.5 rounded-md hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors"
                      title="Ver PDF"
                    >
                      <FileText className="h-3.5 w-3.5" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
