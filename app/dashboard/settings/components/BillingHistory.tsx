"use client"

import { useState } from "react"
import {
  CreditCardIcon,
  ArrowDownTrayIcon,
  CheckCircleIcon,
  XCircleIcon,
  ClockIcon,
  DocumentIcon
} from "@heroicons/react/24/outline"
import { cn } from "@/lib/utils"

interface Payment {
  id: string
  amount: number
  currency: string
  status: 'succeeded' | 'pending' | 'failed'
  invoiceUrl?: string
  createdAt: string
  description: string
}

export function BillingHistory() {
  const [payments] = useState<Payment[]>([
    { id: 'pi_1234567890', amount: 2900, currency: 'EUR', status: 'succeeded', invoiceUrl: '#', createdAt: '2025-01-15', description: 'Plan Pro - Enero 2025' },
    { id: 'pi_0987654321', amount: 2900, currency: 'EUR', status: 'succeeded', invoiceUrl: '#', createdAt: '2024-12-15', description: 'Plan Pro - Diciembre 2024' },
    { id: 'pi_1111111111', amount: 2900, currency: 'EUR', status: 'succeeded', invoiceUrl: '#', createdAt: '2024-11-15', description: 'Plan Pro - Noviembre 2024' },
    { id: 'pi_2222222222', amount: 1500, currency: 'EUR', status: 'succeeded', invoiceUrl: '#', createdAt: '2024-10-15', description: 'Plan Starter - Octubre 2024' },
    { id: 'pi_3333333333', amount: 1500, currency: 'EUR', status: 'succeeded', invoiceUrl: '#', createdAt: '2024-09-15', description: 'Plan Starter - Septiembre 2024' }
  ])

  const getStatusText = (status: string) => {
    if (status === 'succeeded') return 'Pagado'
    if (status === 'pending') return 'Pendiente'
    return 'Fallido'
  }

  const formatCurrency = (amount: number, currency: string) => {
    return new Intl.NumberFormat('es-ES', {
      style: 'currency',
      currency,
      minimumFractionDigits: 0
    }).format(amount / 100)
  }

  const handleDownloadInvoice = (paymentId: string) => {
    console.log('Downloading invoice for payment:', paymentId)
  }

  const totalPaid = payments.filter(p => p.status === 'succeeded').reduce((sum, p) => sum + p.amount, 0)

  return (
    <div className="space-y-6">
      {/* Section Header */}
      <div>
        <h2 className="text-lg font-semibold text-[#0B1F2A]">Historial de facturación</h2>
        <p className="text-sm text-slate-500 mt-0.5">Historial de pagos y descarga de comprobantes.</p>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-white rounded-xl border border-slate-200 p-4 text-center">
          <div className="text-lg font-bold text-[#0B1F2A]">{formatCurrency(totalPaid, 'EUR')}</div>
          <div className="text-xs text-slate-500 mt-0.5">Total pagado</div>
        </div>
        <div className="bg-white rounded-xl border border-slate-200 p-4 text-center">
          <div className="text-lg font-bold text-[var(--accent)]">{payments.filter(p => p.status === 'succeeded').length}</div>
          <div className="text-xs text-slate-500 mt-0.5">Pagos exitosos</div>
        </div>
        <div className="bg-white rounded-xl border border-slate-200 p-4 text-center">
          <div className="text-lg font-bold text-[#0B1F2A]">Pro</div>
          <div className="text-xs text-slate-500 mt-0.5">Plan activo</div>
        </div>
      </div>

      {/* Payment Method */}
      <div className="bg-white rounded-xl border border-slate-200 p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-12 h-8 bg-slate-50 border border-slate-200 rounded-lg flex items-center justify-center">
              <CreditCardIcon className="w-5 h-5 text-slate-400" />
            </div>
            <div>
              <div className="text-sm font-semibold text-[#0B1F2A]">
                Visa •••• 4242
              </div>
              <div className="text-xs text-slate-500 mt-0.5">Expira 12/2026</div>
            </div>
          </div>
          <span className="text-[10px] font-semibold text-[var(--accent)] bg-[var(--accent)]/10 px-2 py-0.5 rounded uppercase">
            Verificado
          </span>
        </div>
      </div>

      {/* Payments Table */}
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
        <table className="w-full text-left">
          <thead>
            <tr className="border-b border-slate-100 text-xs font-medium text-slate-500 uppercase">
              <th className="px-6 py-3">Concepto</th>
              <th className="px-6 py-3">Fecha</th>
              <th className="px-6 py-3">Estado</th>
              <th className="px-6 py-3 text-right">Importe</th>
              <th className="px-6 py-3"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {payments.map((payment) => (
              <tr key={payment.id} className="group hover:bg-slate-50 transition-colors">
                <td className="px-6 py-4">
                  <div className="text-sm font-semibold text-[#0B1F2A]">{payment.description}</div>
                  <div className="text-xs text-slate-400 font-mono mt-0.5">{payment.id}</div>
                </td>
                <td className="px-6 py-4">
                  <span className="text-sm text-slate-600">{new Date(payment.createdAt).toLocaleDateString('es-ES')}</span>
                </td>
                <td className="px-6 py-4">
                  <span className={cn(
                    "inline-flex items-center gap-1.5 text-[10px] font-semibold uppercase px-2 py-0.5 rounded",
                    payment.status === 'succeeded' ? "bg-emerald-50 text-emerald-600" :
                      payment.status === 'pending' ? "bg-amber-50 text-amber-600" :
                        "bg-red-50 text-red-600"
                  )}>
                    {payment.status === 'succeeded' ? <CheckCircleIcon className="w-3 h-3" /> :
                      payment.status === 'pending' ? <ClockIcon className="w-3 h-3" /> :
                        <XCircleIcon className="w-3 h-3" />}
                    {getStatusText(payment.status)}
                  </span>
                </td>
                <td className="px-6 py-4 text-right">
                  <span className="text-sm font-semibold text-[#0B1F2A]">{formatCurrency(payment.amount, payment.currency)}</span>
                </td>
                <td className="px-6 py-4 text-right">
                  {payment.status === 'succeeded' && payment.invoiceUrl && (
                    <button
                      onClick={() => handleDownloadInvoice(payment.id)}
                      className="p-2 text-slate-400 hover:text-[var(--accent)] border border-slate-200 rounded-lg transition-colors bg-white opacity-0 group-hover:opacity-100"
                    >
                      <ArrowDownTrayIcon className="w-4 h-4" />
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {payments.length === 0 && (
          <div className="p-12 text-center">
            <DocumentIcon className="w-10 h-10 text-slate-200 mx-auto mb-3" />
            <p className="text-sm text-slate-400">Sin registros de facturación.</p>
          </div>
        )}
      </div>
    </div>
  )
}