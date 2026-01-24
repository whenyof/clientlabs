"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import {
  PlusIcon,
  ArrowDownTrayIcon,
  DocumentArrowDownIcon,
  TableCellsIcon,
  CalendarIcon,
  FunnelIcon
} from "@heroicons/react/24/outline"

interface FinanceHeaderProps {
  onCreateTransaction: () => void
}

export function FinanceHeader({ onCreateTransaction }: FinanceHeaderProps) {
  const [selectedPeriod, setSelectedPeriod] = useState('month')

  const periodOptions = [
    { value: 'today', label: 'Hoy' },
    { value: 'week', label: '7 días' },
    { value: 'month', label: '30 días' },
    { value: 'quarter', label: 'Trimestre' },
    { value: 'year', label: 'Año' },
    { value: 'custom', label: 'Personalizado' }
  ]

  const handleExport = (format: 'pdf' | 'excel' | 'csv') => {
    console.log(`Exporting as ${format}`)
    // TODO: Implement export functionality
  }

  return (
    <motion.div
      className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-blue-600/10 via-purple-600/10 to-green-600/10 border border-blue-500/20 backdrop-blur-sm"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.1, duration: 0.5 }}
    >
      {/* Background Effects */}
      <div className="absolute inset-0 bg-gradient-to-r from-blue-600/5 to-purple-600/5" />
      <div className="absolute -top-20 -right-20 w-40 h-40 bg-blue-500/20 rounded-full blur-3xl" />
      <div className="absolute -bottom-20 -left-20 w-32 h-32 bg-green-500/20 rounded-full blur-3xl" />

      <div className="relative p-8">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          {/* Left Side */}
          <motion.div
            className="flex items-center gap-4"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3, duration: 0.5 }}
          >
            <div className="relative">
              <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg">
                <span className="text-2xl">💰</span>
              </div>
              {/* Pulsing indicator */}
              <motion.div
                className="absolute -top-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-gray-900"
                animate={{
                  scale: [1, 1.2, 1],
                  opacity: [1, 0.7, 1]
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
              />
            </div>

            <div>
              <div className="flex items-center gap-3 mb-2">
                <h1 className="text-3xl font-bold bg-gradient-to-r from-white to-purple-200 bg-clip-text text-transparent">
                  Finanzas Empresariales
                </h1>
                <div className="flex items-center gap-2 px-3 py-1 bg-green-500/20 rounded-full border border-green-500/30">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                  <span className="text-sm text-green-400 font-medium">Finanzas Activas</span>
                </div>
              </div>

              <p className="text-gray-400 text-lg max-w-2xl">
                Control total de ingresos, gastos y flujo de caja.
                Análisis inteligente y pronósticos precisos para decisiones estratégicas.
              </p>
            </div>
          </motion.div>

          {/* Right Side */}
          <motion.div
            className="flex flex-col sm:flex-row items-start sm:items-center gap-4"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4, duration: 0.5 }}
          >
            {/* Period Selector */}
            <div className="flex items-center gap-3">
              <CalendarIcon className="w-5 h-5 text-gray-400" />
              <select
                value={selectedPeriod}
                onChange={(e) => setSelectedPeriod(e.target.value)}
                className="px-4 py-2 bg-gray-800/50 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
              >
                {periodOptions.map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-3">
              {/* Export Dropdown */}
              <div className="relative group">
                <motion.button
                  className="flex items-center gap-2 px-4 py-2 bg-gray-800/50 hover:bg-gray-700/50 border border-gray-600 rounded-xl text-gray-300 hover:text-white transition-colors"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <ArrowDownTrayIcon className="w-4 h-4" />
                  <span className="hidden sm:inline">Exportar</span>
                </motion.button>

                <div className="absolute right-0 mt-2 w-48 bg-gray-800 border border-gray-700 rounded-lg shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-10">
                  <div className="py-1">
                    <button
                      onClick={() => handleExport('pdf')}
                      className="flex items-center gap-2 w-full px-4 py-2 text-left text-gray-300 hover:bg-gray-700 hover:text-white transition-colors"
                    >
                      <DocumentArrowDownIcon className="w-4 h-4" />
                      Exportar PDF
                    </button>
                    <button
                      onClick={() => handleExport('excel')}
                      className="flex items-center gap-2 w-full px-4 py-2 text-left text-gray-300 hover:bg-gray-700 hover:text-white transition-colors"
                    >
                      <TableCellsIcon className="w-4 h-4" />
                      Exportar Excel
                    </button>
                    <button
                      onClick={() => handleExport('csv')}
                      className="flex items-center gap-2 w-full px-4 py-2 text-left text-gray-300 hover:bg-gray-700 hover:text-white transition-colors"
                    >
                      <TableCellsIcon className="w-4 h-4" />
                      Exportar CSV
                    </button>
                  </div>
                </div>
              </div>

              <motion.button
                onClick={onCreateTransaction}
                className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold rounded-xl transition-all duration-300 shadow-lg hover:shadow-purple-500/25"
                whileHover={{ scale: 1.05, y: -2 }}
                whileTap={{ scale: 0.95 }}
              >
                <PlusIcon className="w-5 h-5" />
                Nuevo Movimiento
              </motion.button>
            </div>
          </motion.div>
        </div>

        {/* Bottom Stats Bar */}
        <motion.div
          className="mt-8 grid grid-cols-2 md:grid-cols-4 gap-4"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.5 }}
        >
          <div className="bg-gray-800/30 rounded-xl p-4 text-center">
            <div className="text-lg font-bold text-green-400">+€12,450</div>
            <div className="text-sm text-gray-400">Ingresos este mes</div>
          </div>
          <div className="bg-gray-800/30 rounded-xl p-4 text-center">
            <div className="text-lg font-bold text-red-400">-€8,320</div>
            <div className="text-sm text-gray-400">Gastos este mes</div>
          </div>
          <div className="bg-gray-800/30 rounded-xl p-4 text-center">
            <div className="text-lg font-bold text-blue-400">+€4,130</div>
            <div className="text-sm text-gray-400">Beneficio neto</div>
          </div>
          <div className="bg-gray-800/30 rounded-xl p-4 text-center">
            <div className="text-lg font-bold text-purple-400">87.5%</div>
            <div className="text-sm text-gray-400">Margen beneficio</div>
          </div>
        </motion.div>
      </div>
    </motion.div>
  )
}