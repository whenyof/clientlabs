"use client"

import { useState, useEffect } from "react"
import { FileText, ExternalLink } from "lucide-react"
import { cn } from "@/lib/utils"

type DocType = "quote" | "purchase_order" | "delivery_note" | "invoice"

type Document = {
  id: string
  number: string
  status: string
  issueDate: string
  amount: number
  docType: DocType
  createdAt: string
}

const DOC_TYPE_BADGE: Record<DocType, string> = {
  quote: "bg-blue-50 text-blue-700 border border-blue-200",
  purchase_order: "bg-amber-50 text-amber-700 border border-amber-200",
  delivery_note: "bg-purple-50 text-purple-700 border border-purple-200",
  invoice: "bg-[#E1F5EE] text-[#0F6E56] border border-[#9FE1CB]",
}

const DOC_TYPE_LABEL: Record<DocType, string> = {
  quote: "Presupuesto",
  purchase_order: "Hoja pedido",
  delivery_note: "Albarán",
  invoice: "Factura",
}

const PDF_ENDPOINT: Record<DocType, string> = {
  quote: "/api/quotes",
  purchase_order: "/api/purchase-orders",
  delivery_note: "/api/delivery-notes",
  invoice: "/api/invoicing",
}

function fmt(n: number) {
  if (!n) return "—"
  return new Intl.NumberFormat("es-ES", { style: "currency", currency: "EUR" }).format(n)
}

function fmtDate(d: string) {
  return new Intl.DateTimeFormat("es-ES", { day: "2-digit", month: "2-digit", year: "numeric" }).format(new Date(d))
}

interface Props {
  clientId: string
}

export function ClientDocumentsList({ clientId }: Props) {
  const [docs, setDocs] = useState<Document[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch(`/api/clients/${clientId}/documents`)
      .then(r => r.json())
      .then(d => { if (d.documents) setDocs(d.documents) })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [clientId])

  if (loading) {
    return <div className="py-8 text-center text-[13px] text-[var(--text-secondary)] animate-pulse">Cargando...</div>
  }

  if (docs.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-10 text-center">
        <div className="w-10 h-10 rounded-xl bg-[var(--bg-surface)] border border-[var(--border-subtle)] flex items-center justify-center mb-3">
          <FileText className="h-5 w-5 text-[var(--text-secondary)]" />
        </div>
        <p className="text-[13px] font-medium text-[var(--text-primary)] mb-1">Sin documentos</p>
        <p className="text-[12px] text-[var(--text-secondary)]">Los documentos comerciales del cliente aparecerán aquí</p>
      </div>
    )
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[560px]">
        <thead>
          <tr className="border-b border-[var(--border-subtle)]">
            {["Tipo", "Número", "Fecha", "Importe", "Estado", ""].map(h => (
              <th key={h} className="py-2.5 px-3 text-left text-[10px] font-medium text-[var(--text-secondary)] uppercase tracking-wider">
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {docs.map((doc) => (
            <tr key={doc.docType + doc.id} className="border-b border-[var(--border-subtle)] hover:bg-[var(--bg-surface)] transition-colors">
              <td className="py-3 px-3">
                <span className={cn(
                  "inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-medium",
                  DOC_TYPE_BADGE[doc.docType]
                )}>
                  {DOC_TYPE_LABEL[doc.docType]}
                </span>
              </td>
              <td className="py-3 px-3 font-mono text-[12px] text-[var(--text-primary)] font-medium">{doc.number}</td>
              <td className="py-3 px-3 text-[12px] text-[var(--text-secondary)]">{fmtDate(doc.issueDate)}</td>
              <td className="py-3 px-3 text-[12px] font-semibold text-[var(--text-primary)] tabular-nums text-right">{fmt(doc.amount)}</td>
              <td className="py-3 px-3 text-[11px] text-[var(--text-secondary)]">{doc.status}</td>
              <td className="py-3 px-3">
                <button
                  onClick={() => window.open(`${PDF_ENDPOINT[doc.docType]}/${doc.id}/pdf`, "_blank")}
                  className="p-1 rounded hover:bg-[var(--bg-surface)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors"
                  title="Ver PDF"
                >
                  <ExternalLink className="h-3.5 w-3.5" />
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
