"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { mockTransactions, formatCurrency, getTransactionTypeColor, getTransactionStatusColor } from "../mock"
import {
  MagnifyingGlassIcon,
  FunnelIcon,
  ArrowUpIcon,
  ArrowDownIcon,
  PencilIcon,
  TrashIcon,
  DocumentDuplicateIcon,
  PlusIcon
} from "@heroicons/react/24/outline"

export function TransactionsTable() {
  const [searchTerm, setSearchTerm] = useState("")
  const [sortBy, setSortBy] = useState<'date' | 'amount' | 'concept'>('date')
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc')
  const [filterType, setFilterType] = useState<'all' | 'INCOME' | 'EXPENSE'>('all')
  const [filterStatus, setFilterStatus] = useState<'all' | 'PENDING' | 'COMPLETED'>('all')

  // Filter and sort transactions
  const filteredTransactions = mockTransactions.filter(transaction => {
    const matchesSearch = transaction.concept.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         transaction.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (transaction.Client?.name || '').toLowerCase().includes(searchTerm.toLowerCase())

    const matchesType = filterType === 'all' || transaction.type === filterType
    const matchesStatus = filterStatus === 'all' || transaction.status === filterStatus

    return matchesSearch && matchesType && matchesStatus
  })

  const sortedTransactions = [...filteredTransactions].sort((a, b) => {
    let comparison = 0

    switch (sortBy) {
      case 'date':
        comparison = new Date(a.date).getTime() - new Date(b.date).getTime()
        break
      case 'amount':
        comparison = Math.abs(a.amount) - Math.abs(b.amount)
        break
      case 'concept':
        comparison = a.concept.localeCompare(b.concept)
        break
    }

    return sortOrder === 'asc' ? comparison : -comparison
  })

  const handleSort = (field: typeof sortBy) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')
    } else {
      setSortBy(field)
      setSortOrder('desc')
    }
  }

  const handleAction = (action: string, transactionId: string) => {
    console.log(`${action} for transaction:`, transactionId)
  }

  const SortIcon = ({ field }: { field: typeof sortBy }) => {
    if (sortBy !== field) return null
    return sortOrder === 'asc' ?
      <ArrowUpIcon className="w-4 h-4" /> :
      <ArrowDownIcon className="w-4 h-4" />
  }

  return (
    <motion.div
      className="space-y-6"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.1, duration: 0.5 }}
    >
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-2xl font-bold text-white mb-2">Movimientos Financieros</h3>
          <p className="text-gray-400">Historial completo de ingresos y gastos</p>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1">
          <div className="relative">
            <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Buscar por concepto, categoría o cliente..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 bg-gray-800/50 border border-gray-600 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
          </div>
        </div>

        <div className="flex items-center gap-3">
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value as typeof filterType)}
            className="px-4 py-3 bg-gray-800/50 border border-gray-600 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
          >
            <option value="all">Todos los tipos</option>
            <option value="INCOME">Ingresos</option>
            <option value="EXPENSE">Gastos</option>
          </select>

          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value as typeof filterStatus)}
            className="px-4 py-3 bg-gray-800/50 border border-gray-600 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
          >
            <option value="all">Todos los estados</option>
            <option value="PENDING">Pendientes</option>
            <option value="COMPLETED">Completados</option>
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl border border-gray-700/50 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-900/50">
              <tr>
                <th
                  className="px-6 py-4 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider cursor-pointer hover:text-white transition-colors"
                  onClick={() => handleSort('date')}
                >
                  <div className="flex items-center gap-2">
                    Fecha
                    <SortIcon field="date" />
                  </div>
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">
                  Tipo
                </th>
                <th
                  className="px-6 py-4 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider cursor-pointer hover:text-white transition-colors"
                  onClick={() => handleSort('concept')}
                >
                  <div className="flex items-center gap-2">
                    Concepto
                    <SortIcon field="concept" />
                  </div>
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">
                  Categoría
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">
                  Cliente
                </th>
                <th
                  className="px-6 py-4 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider cursor-pointer hover:text-white transition-colors"
                  onClick={() => handleSort('amount')}
                >
                  <div className="flex items-center gap-2">
                    Importe
                    <SortIcon field="amount" />
                  </div>
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">
                  Método
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">
                  Estado
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">
                  Origen
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-700/50">
              {sortedTransactions.map((transaction, index) => (
                <motion.tr
                  key={index}
                  className="hover:bg-gray-700/30 transition-colors group"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.02, duration: 0.3 }}
                >
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                    <div className="text-white font-medium">
                      {new Date(transaction.date).toLocaleDateString('es-ES')}
                    </div>
                    <div className="text-xs text-gray-500">
                      {new Date(transaction.date).toLocaleTimeString('es-ES', {
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      transaction.type === 'INCOME'
                        ? 'bg-green-500/20 text-green-400'
                        : 'bg-red-500/20 text-red-400'
                    }`}>
                      {transaction.type === 'INCOME' ? 'Ingreso' : 'Gasto'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-white font-medium">{transaction.concept}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                    {transaction.category}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    {transaction.Client ? (
                      <div className="text-white font-medium">{transaction.Client.name}</div>
                    ) : (
                      <span className="text-gray-500">Sin cliente</span>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className={`text-lg font-bold ${getTransactionTypeColor(transaction.type)}`}>
                      {formatCurrency(transaction.amount)}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                    {transaction.paymentMethod}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getTransactionStatusColor(transaction.status)}`}>
                      {transaction.status === 'COMPLETED' ? 'Completado' :
                       transaction.status === 'PENDING' ? 'Pendiente' : 'Cancelado'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      transaction.origin === 'AUTOMATIC'
                        ? 'bg-blue-500/20 text-blue-400'
                        : 'bg-gray-500/20 text-gray-400'
                    }`}>
                      {transaction.origin === 'AUTOMATIC' ? 'Automático' : 'Manual'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex items-center gap-2">
                      <motion.button
                        onClick={() => handleAction('edit', index.toString())}
                        className="p-1 text-gray-400 hover:text-blue-400 hover:bg-blue-600/20 rounded transition-colors"
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                      >
                        <PencilIcon className="w-4 h-4" />
                      </motion.button>

                      <motion.button
                        onClick={() => handleAction('duplicate', index.toString())}
                        className="p-1 text-gray-400 hover:text-purple-400 hover:bg-purple-600/20 rounded transition-colors"
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                      >
                        <DocumentDuplicateIcon className="w-4 h-4" />
                      </motion.button>

                      <motion.button
                        onClick={() => handleAction('delete', index.toString())}
                        className="p-1 text-gray-400 hover:text-red-400 hover:bg-red-600/20 rounded transition-colors"
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                      >
                        <TrashIcon className="w-4 h-4" />
                      </motion.button>
                    </div>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Summary */}
        <div className="bg-gray-900/50 px-6 py-4 border-t border-gray-700/50">
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-400">
              {sortedTransactions.length} movimientos mostrados
            </span>
            <div className="flex items-center gap-6">
              <span className="text-gray-400">
                Total ingresos: <span className="text-green-400 font-semibold">
                  {formatCurrency(sortedTransactions
                    .filter(t => t.type === 'INCOME')
                    .reduce((sum, t) => sum + t.amount, 0))}
                </span>
              </span>
              <span className="text-gray-400">
                Total gastos: <span className="text-red-400 font-semibold">
                  {formatCurrency(Math.abs(sortedTransactions
                    .filter(t => t.type === 'EXPENSE')
                    .reduce((sum, t) => sum + t.amount, 0)))}
                </span>
              </span>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  )
}