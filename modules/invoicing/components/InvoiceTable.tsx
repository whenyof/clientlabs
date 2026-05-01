"use client"

import { memo, useState, useMemo } from "react"
import { FileText, ChevronUp, ChevronDown, ChevronsUpDown } from "lucide-react"
import { InvoiceRow, type InvoiceRowActionCallbacks } from "./InvoiceRow"
import type { InvoiceListItem } from "./types"

export interface InvoiceTableProps {
  invoices: InvoiceListItem[]
  selectedId: string | null
  loading?: boolean
  onSelectInvoice: (id: string) => void
  onDownloadPdf: (invoiceId: string) => void
  onDeleteInvoice: (invoiceId: string) => void
  onCreateClick?: () => void
}

type SortField = "type" | "number" | "contact" | "issueDate" | "dueDate" | "total" | "status"
type SortDir = "asc" | "desc"

function getContactName(inv: InvoiceListItem): string {
  if (inv.type === "VENDOR") return inv.Provider?.name ?? ""
  return inv.Client?.name ?? inv.Client?.email ?? ""
}

function sortInvoices(invoices: InvoiceListItem[], field: SortField, dir: SortDir): InvoiceListItem[] {
  const sorted = [...invoices].sort((a, b) => {
    let cmp = 0
    switch (field) {
      case "type":
        cmp = a.type.localeCompare(b.type)
        break
      case "number":
        cmp = a.number.localeCompare(b.number, "es", { numeric: true })
        break
      case "contact":
        cmp = getContactName(a).localeCompare(getContactName(b), "es")
        break
      case "issueDate":
        cmp = a.issueDate.localeCompare(b.issueDate)
        break
      case "dueDate":
        cmp = a.dueDate.localeCompare(b.dueDate)
        break
      case "total":
        cmp = a.total - b.total
        break
      case "status":
        cmp = a.status.localeCompare(b.status)
        break
    }
    return dir === "asc" ? cmp : -cmp
  })
  return sorted
}

function SortHeader({
  label,
  field,
  active,
  dir,
  align = "left",
  onClick,
}: {
  label: string
  field: SortField
  active: boolean
  dir: SortDir
  align?: "left" | "right"
  onClick: (f: SortField) => void
}) {
  return (
    <th className={`py-3 px-4 text-${align} text-[10px] font-medium text-slate-400 uppercase tracking-wider`}>
      <button
        type="button"
        onClick={() => onClick(field)}
        className={`inline-flex items-center gap-1 hover:text-slate-700 transition-colors select-none ${align === "right" ? "flex-row-reverse" : ""} ${active ? "text-slate-700" : ""}`}
      >
        {label}
        {active ? (
          dir === "asc"
            ? <ChevronUp className="h-3 w-3 shrink-0" />
            : <ChevronDown className="h-3 w-3 shrink-0" />
        ) : (
          <ChevronsUpDown className="h-3 w-3 shrink-0 opacity-40" />
        )}
      </button>
    </th>
  )
}

function InvoiceTableComponent({
  invoices,
  selectedId,
  onSelectInvoice,
  onDownloadPdf,
  onDeleteInvoice,
  onCreateClick,
  loading,
}: InvoiceTableProps) {
  const [sortField, setSortField] = useState<SortField>("issueDate")
  const [sortDir, setSortDir] = useState<SortDir>("desc")

  const handleSort = (field: SortField) => {
    if (field === sortField) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"))
    } else {
      setSortField(field)
      setSortDir("desc")
    }
  }

  const sorted = useMemo(() => sortInvoices(invoices, sortField, sortDir), [invoices, sortField, sortDir])

  if (loading) {
    return (
      <div className="rounded-xl border border-slate-200 bg-white overflow-hidden">
        <div className="px-4 py-8 text-center text-slate-400 text-sm animate-pulse">
          Cargando facturas…
        </div>
      </div>
    )
  }

  if (invoices.length === 0) {
    return (
      <div className="rounded-xl border border-slate-200 bg-white overflow-hidden">
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <div className="w-12 h-12 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-center mb-4">
            <FileText className="h-5 w-5 text-slate-400" />
          </div>
          <p className="text-[14px] font-medium text-slate-700 mb-1">No hay facturas todavía</p>
          <p className="text-[12px] text-slate-400 mb-4">
            Crea tu primera factura profesional en menos de 30 segundos
          </p>
          {onCreateClick && (
            <button
              type="button"
              onClick={onCreateClick}
              className="inline-flex items-center gap-2 px-4 py-2 bg-[#1FA97A] text-white rounded-lg text-[12px] font-medium hover:bg-[#178f68] transition-colors"
            >
              Nueva factura
            </button>
          )}
        </div>
      </div>
    )
  }

  const buildActions = (inv: InvoiceListItem): InvoiceRowActionCallbacks => ({
    onView: () => onSelectInvoice(inv.id),
    onDownloadPdf,
    onDelete: onDeleteInvoice,
  })

  return (
    <div className="rounded-xl border border-slate-200 bg-white overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[900px]" role="table" aria-label="Lista de facturas">
          <thead>
            <tr className="border-b border-slate-100 bg-slate-50">
              <SortHeader label="Tipo"          field="type"      active={sortField === "type"}      dir={sortDir} onClick={handleSort} />
              <SortHeader label="Número"        field="number"    active={sortField === "number"}    dir={sortDir} onClick={handleSort} />
              <SortHeader label="Contacto"      field="contact"   active={sortField === "contact"}   dir={sortDir} onClick={handleSort} />
              <SortHeader label="Fecha emisión" field="issueDate" active={sortField === "issueDate"} dir={sortDir} onClick={handleSort} />
              <SortHeader label="Vencimiento"   field="dueDate"   active={sortField === "dueDate"}   dir={sortDir} onClick={handleSort} />
              <SortHeader label="Importe"       field="total"     active={sortField === "total"}     dir={sortDir} onClick={handleSort} align="right" />
              <SortHeader label="Estado"        field="status"    active={sortField === "status"}    dir={sortDir} onClick={handleSort} />
              <th className="py-3 px-4 text-right text-[10px] font-medium text-slate-400 uppercase tracking-wider w-0">
                Acciones
              </th>
            </tr>
          </thead>
          <tbody>
            {sorted.map((inv) => (
              <InvoiceRow
                key={inv.id}
                invoice={inv}
                isSelected={selectedId === inv.id}
                actions={buildActions(inv)}
              />
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

export const InvoiceTable = memo(InvoiceTableComponent)
