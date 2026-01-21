"use client"

import { useState } from "react"
import { XMarkIcon, MagnifyingGlassIcon, FunnelIcon } from "@heroicons/react/24/outline"
import { motion, AnimatePresence } from "framer-motion"
import { mockAutomationLogs, getAutomationLogs } from "../mock"

interface LogsPanelProps {
  onClose: () => void
}

export function LogsPanel({ onClose }: LogsPanelProps) {
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [automationFilter, setAutomationFilter] = useState<string>("all")

  const logs = getAutomationLogs()

  const filteredLogs = logs.filter(log => {
    const matchesSearch = log.automationId.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         log.status.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (log.error && log.error.toLowerCase().includes(searchTerm.toLowerCase()))

    const matchesStatus = statusFilter === "all" || log.status === statusFilter

    return matchesSearch && matchesStatus
  })

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'success':
        return 'bg-green-500/20 text-green-400 border-green-500/30'
      case 'error':
        return 'bg-red-500/20 text-red-400 border-red-500/30'
      case 'running':
        return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30'
      default:
        return 'bg-gray-500/20 text-gray-400 border-gray-500/30'
    }
  }

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'success':
        return 'Éxito'
      case 'error':
        return 'Error'
      case 'running':
        return 'Ejecutándose'
      default:
        return status
    }
  }

  const formatDuration = (ms: number) => {
    if (ms < 1000) return `${ms}ms`
    return `${(ms / 1000).toFixed(1)}s`
  }

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 z-50 overflow-y-auto"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      >
        <div className="flex min-h-screen items-center justify-center p-4">
          {/* Backdrop */}
          <motion.div
            className="fixed inset-0 bg-black/50 backdrop-blur-sm"
            onClick={onClose}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          />

          {/* Modal */}
          <motion.div
            className="relative w-full max-w-6xl bg-gray-900 rounded-2xl border border-gray-700 shadow-2xl max-h-[90vh] overflow-hidden"
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ duration: 0.3 }}
          >
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-700">
              <div className="flex items-center gap-3">
                <FunnelIcon className="w-6 h-6 text-purple-400" />
                <div>
                  <h2 className="text-xl font-bold text-white">
                    Logs de Automatizaciones
                  </h2>
                  <p className="text-gray-400 text-sm">
                    Historial detallado de ejecuciones y resultados
                  </p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="p-2 text-gray-400 hover:text-white hover:bg-gray-800 rounded-lg transition-colors"
              >
                <XMarkIcon className="w-5 h-5" />
              </button>
            </div>

            {/* Filters */}
            <div className="p-6 border-b border-gray-700/50">
              <div className="flex flex-col lg:flex-row gap-4">
                <div className="flex-1">
                  <div className="relative">
                    <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Buscar en logs..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full pl-9 pr-4 py-2 bg-gray-700/50 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    />
                  </div>
                </div>

                <div>
                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="px-3 py-2 bg-gray-700/50 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  >
                    <option value="all">Todos los estados</option>
                    <option value="success">Éxito</option>
                    <option value="error">Error</option>
                    <option value="running">Ejecutándose</option>
                  </select>
                </div>

                <div>
                  <select
                    value={automationFilter}
                    onChange={(e) => setAutomationFilter(e.target.value)}
                    className="px-3 py-2 bg-gray-700/50 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  >
                    <option value="all">Todas las automatizaciones</option>
                    <option value="lead-whatsapp-email">Lead → WhatsApp + Email</option>
                    <option value="client-invoice-contract">Cliente → Factura + Contrato</option>
                    <option value="abandoned-cart-reminder">Carrito Abandonado</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Logs Table */}
            <div className="overflow-y-auto max-h-[calc(90vh-200px)]">
              <div className="p-6">
                <div className="space-y-3">
                  {filteredLogs.map((log, index) => (
                    <motion.div
                      key={log.id}
                      className="bg-gray-800/30 rounded-lg p-4 border border-gray-700/30"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05, duration: 0.3 }}
                    >
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-3">
                          <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(log.status)}`}>
                            {getStatusLabel(log.status)}
                          </span>
                          <span className="text-white font-medium">
                            Automatización #{log.automationId}
                          </span>
                        </div>

                        <div className="text-right">
                          <div className="text-gray-400 text-sm">
                            {new Date(log.createdAt).toLocaleString('es-ES')}
                          </div>
                          <div className="text-gray-400 text-xs">
                            {formatDuration(log.executionTime)}
                          </div>
                        </div>
                      </div>

                      {log.result && (
                        <div className="bg-gray-700/30 rounded p-3 mb-3">
                          <div className="text-green-400 text-sm font-medium mb-1">Resultado:</div>
                          <pre className="text-gray-300 text-xs whitespace-pre-wrap">
                            {JSON.stringify(log.result, null, 2)}
                          </pre>
                        </div>
                      )}

                      {log.error && (
                        <div className="bg-red-900/20 border border-red-500/30 rounded p-3">
                          <div className="text-red-400 text-sm font-medium mb-1">Error:</div>
                          <div className="text-red-300 text-sm">{log.error}</div>
                        </div>
                      )}
                    </motion.div>
                  ))}
                </div>

                {filteredLogs.length === 0 && (
                  <motion.div
                    className="text-center py-12"
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.3 }}
                  >
                    <FunnelIcon className="w-12 h-12 text-gray-500 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-400 mb-2">
                      No se encontraron logs
                    </h3>
                    <p className="text-gray-500">
                      No hay logs que coincidan con tu búsqueda.
                    </p>
                  </motion.div>
                )}
              </div>
            </div>

            {/* Footer */}
            <div className="p-6 border-t border-gray-700/50 bg-gray-800/50">
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-400">
                  {filteredLogs.length} logs encontrados
                </span>
                <div className="flex items-center gap-4">
                  <span className="text-gray-400">
                    Tasa de éxito: <span className="text-green-400 font-medium">
                      {filteredLogs.length > 0
                        ? Math.round((filteredLogs.filter(l => l.status === 'success').length / filteredLogs.length) * 100)
                        : 0}%
                    </span>
                  </span>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </motion.div>
    </AnimatePresence>
  )
}