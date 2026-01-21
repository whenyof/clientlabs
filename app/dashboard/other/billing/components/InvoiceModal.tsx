"use client"

import { useState } from "react"
import { XMarkIcon, PlusIcon, MinusIcon } from "@heroicons/react/24/outline"
import { InvoiceLinesEditor } from "./InvoiceLinesEditor"
import { type Invoice, type InvoiceLine } from "../mock"
import { calculateInvoiceTotals } from "../lib/calculations"

interface InvoiceModalProps {
  isOpen: boolean
  onClose: () => void
  invoice?: Invoice
}

interface Client {
  name: string
  nif: string
  address: string
  email: string
}

interface Company {
  name: string
  nif: string
  address: string
}

export function InvoiceModal({ isOpen, onClose, invoice }: InvoiceModalProps) {
  const [client, setClient] = useState<Client>(invoice?.client || {
    name: '',
    nif: '',
    address: '',
    email: ''
  })

  const [company] = useState<Company>({
    name: 'Mi Empresa SL',
    nif: 'A87654321',
    address: 'Gran Vía 456, Barcelona'
  })

  const [lines, setLines] = useState<InvoiceLine[]>(invoice?.lines || [
    {
      id: '1',
      description: '',
      quantity: 1,
      unitPrice: 0,
      taxRate: 21,
      total: 0
    }
  ])

  const [date, setDate] = useState(invoice?.date || new Date().toISOString().split('T')[0])
  const [dueDate, setDueDate] = useState(invoice?.dueDate || '')
  const [paymentTerms, setPaymentTerms] = useState(invoice?.paymentTerms || '30 días')
  const [notes, setNotes] = useState(invoice?.notes || '')
  const [isDraft, setIsDraft] = useState(!invoice || invoice.status === 'draft')

  const totals = calculateInvoiceTotals(lines)

  const handleSubmit = async (status: 'draft' | 'issued') => {
    const invoiceData: Partial<Invoice> = {
      client,
      company,
      date,
      dueDate,
      status,
      lines,
      ...totals,
      currency: 'EUR',
      paymentTerms,
      notes,
      origin: 'manual'
    }

    console.log('Guardando factura:', invoiceData)
    // Aquí iría la llamada a la API
    onClose()
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex min-h-screen items-center justify-center p-4">
        {/* Backdrop */}
        <div
          className="fixed inset-0 bg-black/50 backdrop-blur-sm"
          onClick={onClose}
        />

        {/* Modal */}
        <div className="relative w-full max-w-4xl bg-gray-900 rounded-2xl border border-gray-700 shadow-2xl">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-700">
            <h2 className="text-xl font-bold text-white">
              {invoice ? 'Editar Factura' : 'Nueva Factura'}
            </h2>
            <button
              onClick={onClose}
              className="p-2 text-gray-400 hover:text-white hover:bg-gray-800 rounded-lg transition-colors"
            >
              <XMarkIcon className="w-5 h-5" />
            </button>
          </div>

          {/* Content */}
          <div className="p-6 max-h-[70vh] overflow-y-auto">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Company Info */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-white">Empresa</h3>
                <div className="space-y-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-1">
                      Nombre de la empresa
                    </label>
                    <input
                      type="text"
                      value={company.name}
                      readOnly
                      className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-1">
                      NIF/CIF
                    </label>
                    <input
                      type="text"
                      value={company.nif}
                      readOnly
                      className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-1">
                      Dirección
                    </label>
                    <textarea
                      value={company.address}
                      readOnly
                      rows={2}
                      className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white resize-none"
                    />
                  </div>
                </div>
              </div>

              {/* Client Info */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-white">Cliente</h3>
                <div className="space-y-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-1">
                      Nombre del cliente *
                    </label>
                    <input
                      type="text"
                      value={client.name}
                      onChange={(e) => setClient({...client, name: e.target.value})}
                      className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      placeholder="Ej: Tech Solutions SL"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-1">
                      NIF/CIF *
                    </label>
                    <input
                      type="text"
                      value={client.nif}
                      onChange={(e) => setClient({...client, nif: e.target.value})}
                      className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      placeholder="Ej: B12345678"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-1">
                      Email *
                    </label>
                    <input
                      type="email"
                      value={client.email}
                      onChange={(e) => setClient({...client, email: e.target.value})}
                      className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      placeholder="cliente@email.com"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-1">
                      Dirección *
                    </label>
                    <textarea
                      value={client.address}
                      onChange={(e) => setClient({...client, address: e.target.value})}
                      rows={2}
                      className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none"
                      placeholder="Dirección completa del cliente"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Dates */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-8">
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">
                  Fecha de emisión *
                </label>
                <input
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">
                  Fecha de vencimiento *
                </label>
                <input
                  type="date"
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                  className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">
                  Términos de pago
                </label>
                <select
                  value={paymentTerms}
                  onChange={(e) => setPaymentTerms(e.target.value)}
                  className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                >
                  <option value="7 días">7 días</option>
                  <option value="15 días">15 días</option>
                  <option value="30 días">30 días</option>
                  <option value="60 días">60 días</option>
                  <option value="Contado">Contado</option>
                </select>
              </div>
            </div>

            {/* Invoice Lines */}
            <div className="mt-8">
              <h3 className="text-lg font-semibold text-white mb-4">Líneas de factura</h3>
              <InvoiceLinesEditor lines={lines} onChange={setLines} />
            </div>

            {/* Notes */}
            <div className="mt-8">
              <label className="block text-sm font-medium text-gray-400 mb-1">
                Notas
              </label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={3}
                className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none"
                placeholder="Notas adicionales para la factura..."
              />
            </div>

            {/* Totals */}
            <div className="mt-8 bg-gray-800/50 rounded-xl p-6 border border-gray-700">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="text-center md:text-left">
                  <div className="text-sm text-gray-400">Subtotal</div>
                  <div className="text-xl font-bold text-white">
                    €{totals.subtotal.toLocaleString('es-ES')}
                  </div>
                </div>
                <div className="text-center md:text-left">
                  <div className="text-sm text-gray-400">IVA ({lines[0]?.taxRate || 21}%)</div>
                  <div className="text-xl font-bold text-blue-400">
                    €{totals.taxAmount.toLocaleString('es-ES')}
                  </div>
                </div>
                <div className="text-center md:text-left md:border-l md:border-gray-700 md:pl-4">
                  <div className="text-sm text-gray-400">Total</div>
                  <div className="text-2xl font-bold text-green-400">
                    €{totals.total.toLocaleString('es-ES')}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between p-6 border-t border-gray-700">
            <div className="flex items-center gap-3">
              <label className="flex items-center gap-2 text-sm text-gray-400">
                <input
                  type="checkbox"
                  checked={isDraft}
                  onChange={(e) => setIsDraft(e.target.checked)}
                  className="rounded border-gray-600 bg-gray-700 text-purple-600 focus:ring-purple-500"
                />
                Guardar como borrador
              </label>
            </div>

            <div className="flex gap-3">
              <button
                onClick={onClose}
                className="px-4 py-2 text-gray-400 hover:text-white border border-gray-600 rounded-lg hover:bg-gray-700 transition-colors"
              >
                Cancelar
              </button>
              {isDraft && (
                <button
                  onClick={() => handleSubmit('draft')}
                  className="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition-colors"
                >
                  Guardar borrador
                </button>
              )}
              <button
                onClick={() => handleSubmit('issued')}
                className="px-6 py-2 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white font-semibold rounded-lg transition-all duration-300 shadow-lg hover:shadow-purple-500/25"
              >
                {isDraft ? 'Emitir factura' : 'Guardar cambios'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}