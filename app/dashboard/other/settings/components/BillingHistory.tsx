"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import {
  CreditCardIcon,
  ArrowDownTrayIcon,
  CheckCircleIcon,
  XCircleIcon,
  ClockIcon,
  DocumentIcon
} from "@heroicons/react/24/outline"

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
    {
      id: 'pi_1234567890',
      amount: 2900,
      currency: 'EUR',
      status: 'succeeded',
      invoiceUrl: '#',
      createdAt: '2025-01-15',
      description: 'Plan Pro - Enero 2025'
    },
    {
      id: 'pi_0987654321',
      amount: 2900,
      currency: 'EUR',
      status: 'succeeded',
      invoiceUrl: '#',
      createdAt: '2024-12-15',
      description: 'Plan Pro - Diciembre 2024'
    },
    {
      id: 'pi_1111111111',
      amount: 2900,
      currency: 'EUR',
      status: 'succeeded',
      invoiceUrl: '#',
      createdAt: '2024-11-15',
      description: 'Plan Pro - Noviembre 2024'
    },
    {
      id: 'pi_2222222222',
      amount: 1500,
      currency: 'EUR',
      status: 'succeeded',
      invoiceUrl: '#',
      createdAt: '2024-10-15',
      description: 'Plan Starter - Octubre 2024'
    },
    {
      id: 'pi_3333333333',
      amount: 1500,
      currency: 'EUR',
      status: 'succeeded',
      invoiceUrl: '#',
      createdAt: '2024-09-15',
      description: 'Plan Starter - Septiembre 2024'
    }
  ])

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'succeeded':
        return <CheckCircleIcon className="w-4 h-4 text-green-400" />
      case 'pending':
        return <ClockIcon className="w-4 h-4 text-yellow-400" />
      case 'failed':
        return <XCircleIcon className="w-4 h-4 text-red-400" />
      default:
        return null
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case 'succeeded':
        return 'Pagado'
      case 'pending':
        return 'Pendiente'
      case 'failed':
        return 'Fallido'
      default:
        return status
    }
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
    // TODO: Open invoice URL or trigger download
  }

  const totalPaid = payments
    .filter(p => p.status === 'succeeded')
    .reduce((sum, p) => sum + p.amount, 0)

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-white mb-2">Historial de pagos</h2>
        <p className="text-gray-400">Revisa tus facturas y pagos realizados</p>
      </div>

      {/* Billing Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <div className="bg-gray-900/50 rounded-xl p-4 text-center">
          <div className="text-2xl font-bold text-white mb-1">
            {formatCurrency(totalPaid, 'EUR')}
          </div>
          <div className="text-sm text-gray-400">Total pagado</div>
        </div>
        <div className="bg-gray-900/50 rounded-xl p-4 text-center">
          <div className="text-2xl font-bold text-green-400 mb-1">
            {payments.filter(p => p.status === 'succeeded').length}
          </div>
          <div className="text-sm text-gray-400">Pagos exitosos</div>
        </div>
        <div className="bg-gray-900/50 rounded-xl p-4 text-center">
          <div className="text-2xl font-bold text-blue-400 mb-1">Pro</div>
          <div className="text-sm text-gray-400">Plan actual</div>
        </div>
      </div>

      {/* Payment Method */}
      <div className="bg-gray-900/50 rounded-xl p-6 mb-8">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-12 h-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
              <CreditCardIcon className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="text-white font-medium">•••• •••• •••• 4242</div>
              <div className="text-sm text-gray-400">Visa • Expira 12/26</div>
            </div>
          </div>
          <div className="text-sm text-green-400 font-medium">Predeterminado</div>
        </div>
      </div>

      {/* Payments List */}
      <div className="bg-gray-900/50 rounded-xl overflow-hidden">
        <div className="p-6 border-b border-gray-700/50">
          <h3 className="text-lg font-semibold text-white">Historial de pagos</h3>
        </div>

        <div className="divide-y divide-gray-700/50">
          {payments.map((payment, index) => (
            <motion.div
              key={payment.id}
              className="p-6 hover:bg-gray-800/30 transition-colors"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 * index, duration: 0.3 }}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className={`p-2 rounded-lg ${
                    payment.status === 'succeeded'
                      ? 'bg-green-500/10'
                      : payment.status === 'pending'
                      ? 'bg-yellow-500/10'
                      : 'bg-red-500/10'
                  }`}>
                    {getStatusIcon(payment.status)}
                  </div>

                  <div>
                    <div className="text-white font-medium">{payment.description}</div>
                    <div className="text-sm text-gray-400">
                      {new Date(payment.createdAt).toLocaleDateString('es-ES')} •
                      ID: {payment.id.slice(-8)}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <div className="text-lg font-bold text-white">
                      {formatCurrency(payment.amount, payment.currency)}
                    </div>
                    <div className="text-sm text-gray-400 capitalize">
                      {getStatusText(payment.status)}
                    </div>
                  </div>

                  {payment.status === 'succeeded' && payment.invoiceUrl && (
                    <motion.button
                      onClick={() => handleDownloadInvoice(payment.id)}
                      className="p-2 text-gray-400 hover:text-white hover:bg-gray-700/50 rounded transition-colors"
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                    >
                      <ArrowDownTrayIcon className="w-4 h-4" />
                    </motion.button>
                  )}
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {payments.length === 0 && (
          <div className="p-12 text-center">
            <DocumentIcon className="w-12 h-12 text-gray-600 mx-auto mb-4" />
            <h4 className="text-lg font-medium text-gray-400 mb-2">
              No hay pagos registrados
            </h4>
            <p className="text-gray-500">
              Los pagos aparecerán aquí una vez que completes tu primera compra.
            </p>
          </div>
        )}
      </div>
    </motion.div>
  )
}