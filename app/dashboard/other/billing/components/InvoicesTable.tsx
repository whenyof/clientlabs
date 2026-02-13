"use client"

import { useState } from "react"
import { PaymentStatusBadge } from "./PaymentStatusBadge"
import { SendToHaciendaButton } from "./SendToHaciendaButton"
import {
  DocumentTextIcon,
  EyeIcon,
  PencilIcon,
  TrashIcon,
  EnvelopeIcon,
  ArrowDownTrayIcon
} from "@heroicons/react/24/outline"

/** API invoice shape: Client, issueDate, or legacy mock shape: client, date */
export type InvoiceRow = {
  id: string
  number: string
  status?: string
  total?: number
  Client?: { name?: string | null; email?: string | null; nif?: string | null }
  client?: { name?: string; email?: string; nif?: string }
  issueDate?: Date | string
  date?: string
  origin?: string
  haciendaStatus?: string
}

interface InvoicesTableProps {
  searchTerm: string
  statusFilter?: string
  invoices?: InvoiceRow[]
}

export function InvoicesTable({ searchTerm, statusFilter, invoices = [] }: InvoicesTableProps) {
  const [selectedInvoices, setSelectedInvoices] = useState<string[]>([])

  const name = (inv: InvoiceRow) => inv.Client?.name ?? inv.client?.name ?? ""
  const email = (inv: InvoiceRow) => inv.Client?.email ?? inv.client?.email ?? ""
  const dateStr = (inv: InvoiceRow) => inv.issueDate != null ? String(inv.issueDate) : (inv.date ?? "")

  const filteredInvoices = invoices.filter((invoice) => {
    const matchesSearch =
      (invoice.number ?? "").toLowerCase().includes(searchTerm.toLowerCase()) ||
      name(invoice).toLowerCase().includes(searchTerm.toLowerCase()) ||
      email(invoice).toLowerCase().includes(searchTerm.toLowerCase())
    const status = (invoice.status ?? "").toLowerCase()
    const matchesStatus = !statusFilter || statusFilter === "all" || status === statusFilter.toLowerCase()
    return matchesSearch && matchesStatus
  })

  const toggleInvoiceSelection = (invoiceId: string) => {
    setSelectedInvoices(prev =>
      prev.includes(invoiceId)
        ? prev.filter(id => id !== invoiceId)
        : [...prev, invoiceId]
    )
  }

  const toggleAllSelection = () => {
    if (selectedInvoices.length === filteredInvoices.length) {
      setSelectedInvoices([])
    } else {
      setSelectedInvoices(filteredInvoices.map(inv => inv.id))
    }
  }

  return (
    <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl border border-gray-700/50 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-900/50">
            <tr>
              <th className="px-6 py-4 text-left">
                <input
                  type="checkbox"
                  checked={selectedInvoices.length === filteredInvoices.length && filteredInvoices.length > 0}
                  onChange={toggleAllSelection}
                  className="rounded border-gray-600 bg-gray-700 text-purple-600 focus:ring-purple-500"
                />
              </th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">
                Nº Factura
              </th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">
                Cliente
              </th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">
                Fecha
              </th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">
                Total
              </th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">
                Estado
              </th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">
                Origen
              </th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">
                Hacienda
              </th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">
                Acciones
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-700/50">
            {filteredInvoices.length === 0 ? (
              <tr>
                <td colSpan={9} className="px-6 py-16 text-center text-gray-400">
                  <p className="text-white/80 font-medium">Sin facturas</p>
                  <p className="text-sm mt-1">No hay modelo de facturas en la base de datos. Este panel mostrará datos cuando exista backend.</p>
                </td>
              </tr>
            ) : filteredInvoices.map((invoice) => (
              <tr
                key={invoice.id}
                className="hover:bg-gray-700/30 transition-colors duration-200"
              >
                <td className="px-6 py-4">
                  <input
                    type="checkbox"
                    checked={selectedInvoices.includes(invoice.id)}
                    onChange={() => toggleInvoiceSelection(invoice.id)}
                    className="rounded border-gray-600 bg-gray-700 text-purple-600 focus:ring-purple-500"
                  />
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center">
                    <DocumentTextIcon className="w-5 h-5 text-gray-400 mr-3" />
                    <span className="text-white font-medium">{invoice.number}</span>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div>
                    <div className="text-white font-medium">{name(invoice)}</div>
                    <div className="text-gray-400 text-sm">{invoice.Client?.nif ?? invoice.client?.nif ?? ""}</div>
                  </div>
                </td>
                <td className="px-6 py-4 text-gray-300">
                  {dateStr(invoice) ? new Date(dateStr(invoice)).toLocaleDateString("es-ES") : ""}
                </td>
                <td className="px-6 py-4">
                  <span className="text-white font-semibold">
                    €{Number(invoice.total ?? 0).toLocaleString("es-ES")}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <PaymentStatusBadge
                    status={
                      (() => {
                        const s = (invoice.status ?? "draft").toLowerCase().replace("canceled", "cancelled")
                        const allowed = ["draft", "issued", "sent", "paid", "overdue", "cancelled"] as const
                        return allowed.includes(s as (typeof allowed)[number]) ? (s as (typeof allowed)[number]) : "draft"
                      })()
                    }
                  />
                </td>
                <td className="px-6 py-4">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    (invoice.origin ?? "manual") === "automatic"
                      ? "bg-blue-500/20 text-blue-400"
                      : "bg-purple-500/20 text-purple-400"
                  }`}>
                    {(invoice.origin ?? "manual") === "automatic" ? "Automática" : "Manual"}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <SendToHaciendaButton
                    invoiceId={invoice.id}
                    status={(invoice.haciendaStatus === "sent" || invoice.haciendaStatus === "accepted" || invoice.haciendaStatus === "rejected" ? invoice.haciendaStatus : "pending") as "pending" | "sent" | "accepted" | "rejected"}
                  />
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-2">
                    <button className="p-1.5 text-gray-400 hover:text-white hover:bg-gray-600 rounded-lg transition-colors">
                      <EyeIcon className="w-4 h-4" />
                    </button>
                    <button className="p-1.5 text-gray-400 hover:text-white hover:bg-gray-600 rounded-lg transition-colors">
                      <PencilIcon className="w-4 h-4" />
                    </button>
                    <button className="p-1.5 text-gray-400 hover:text-red-400 hover:bg-red-600/20 rounded-lg transition-colors">
                      <TrashIcon className="w-4 h-4" />
                    </button>
                    <button className="p-1.5 text-gray-400 hover:text-blue-400 hover:bg-blue-600/20 rounded-lg transition-colors">
                      <EnvelopeIcon className="w-4 h-4" />
                    </button>
                    <button className="p-1.5 text-gray-400 hover:text-green-400 hover:bg-green-600/20 rounded-lg transition-colors">
                      <ArrowDownTrayIcon className="w-4 h-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {filteredInvoices.length === 0 && (
        <div className="text-center py-12">
          <DocumentTextIcon className="w-12 h-12 text-gray-500 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-400 mb-2">
            No se encontraron facturas
          </h3>
          <p className="text-gray-500">
            No hay facturas que coincidan con tu búsqueda.
          </p>
        </div>
      )}

      {/* Bulk actions */}
      {selectedInvoices.length > 0 && (
        <div className="bg-gray-900/50 px-6 py-4 border-t border-gray-700/50">
          <div className="flex items-center justify-between">
            <span className="text-gray-400">
              {selectedInvoices.length} factura{selectedInvoices.length > 1 ? 's' : ''} seleccionada{selectedInvoices.length > 1 ? 's' : ''}
            </span>
            <div className="flex gap-3">
              <button className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition-colors">
                Enviar por email
              </button>
              <button className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white text-sm font-medium rounded-lg transition-colors">
                Descargar PDF
              </button>
              <button className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white text-sm font-medium rounded-lg transition-colors">
                Eliminar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}