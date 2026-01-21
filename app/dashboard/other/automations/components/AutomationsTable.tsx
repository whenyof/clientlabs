"use client"

import { useMemo } from "react"
import { mockAutomations, formatCurrency, getAutomationsByCategory, getAutomationsByStatus } from "../mock"
import { AutomationStatusBadge } from "./AutomationStatusBadge"
import {
  PencilIcon,
  PlayIcon,
  PauseIcon,
  TrashIcon,
  DocumentDuplicateIcon,
  EyeIcon,
  CogIcon
} from "@heroicons/react/24/outline"
import { motion } from "framer-motion"

interface AutomationsTableProps {
  searchTerm: string
  categoryFilter: string
  statusFilter: string
}

export default function AutomationsTable({
  searchTerm,
  categoryFilter,
  statusFilter
}: AutomationsTableProps) {
  const filteredAutomations = useMemo(() => {
    let filtered = mockAutomations

    // Filtrar por búsqueda
    if (searchTerm) {
      filtered = filtered.filter(automation =>
        automation.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        automation.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        automation.triggerType.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    // Filtrar por categoría
    if (categoryFilter !== 'all') {
      filtered = filtered.filter(automation => automation.category === categoryFilter)
    }

    // Filtrar por estado
    if (statusFilter !== 'all') {
      filtered = filtered.filter(automation => automation.status === statusFilter)
    }

    return filtered
  }, [searchTerm, categoryFilter, statusFilter])

  const getTriggerLabel = (triggerType: string) => {
    const labels: Record<string, string> = {
      new_lead: 'Nuevo Lead',
      client_won: 'Cliente Ganado',
      cart_abandoned: 'Carrito Abandonado',
      call_completed: 'Llamada Finalizada',
      new_order: 'Nuevo Pedido',
      new_ticket: 'Nuevo Ticket',
      scheduled: 'Programado',
      webhook: 'Webhook'
    }
    return labels[triggerType] || triggerType
  }

  const getActionsSummary = (actions: any[]) => {
    if (actions.length === 0) return 'Sin acciones'
    if (actions.length === 1) return `${actions[0].type}`
    return `${actions.length} acciones`
  }

  const handleAction = (action: string, automationId: string) => {
    console.log(`${action} automation:`, automationId)
  }

  return (
    <motion.div
      className="bg-gray-800/50 backdrop-blur-sm rounded-2xl border border-gray-700/50 overflow-hidden"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.4, duration: 0.5 }}
    >
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-900/50">
            <tr>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">
                Automatización
              </th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">
                Trigger
              </th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">
                Acciones
              </th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">
                Estado
              </th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">
                Ejecuciones
              </th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">
                Éxito
              </th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">
                Ingresos
              </th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">
                Acciones
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-700/50">
            {filteredAutomations.map((automation, index) => (
              <motion.tr
                key={automation.id}
                className="hover:bg-gray-700/30 transition-colors"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 * index, duration: 0.3 }}
              >
                <td className="px-6 py-4">
                  <div>
                    <div className="text-white font-medium">{automation.name}</div>
                    <div className="text-gray-400 text-sm max-w-xs truncate">
                      {automation.description}
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-500/20 text-blue-400">
                    {getTriggerLabel(automation.triggerType)}
                  </span>
                </td>
                <td className="px-6 py-4 text-gray-300">
                  {getActionsSummary(automation.actions)}
                </td>
                <td className="px-6 py-4">
                  <AutomationStatusBadge status={automation.status} />
                </td>
                <td className="px-6 py-4 text-gray-300">
                  {automation.runs.toLocaleString('es-ES')}
                </td>
                <td className="px-6 py-4">
                  <span className={`text-sm font-medium ${
                    automation.successRate >= 90 ? 'text-green-400' :
                    automation.successRate >= 70 ? 'text-yellow-400' : 'text-red-400'
                  }`}>
                    {automation.successRate}%
                  </span>
                </td>
                <td className="px-6 py-4">
                  <div className="text-white font-medium">
                    {formatCurrency(automation.revenueGenerated)}
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-2">
                    <motion.button
                      onClick={() => handleAction('view', automation.id)}
                      className="p-1.5 text-gray-400 hover:text-blue-400 hover:bg-blue-600/20 rounded-lg transition-colors"
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                    >
                      <EyeIcon className="w-4 h-4" />
                    </motion.button>

                    <motion.button
                      onClick={() => handleAction('edit', automation.id)}
                      className="p-1.5 text-gray-400 hover:text-blue-400 hover:bg-blue-600/20 rounded-lg transition-colors"
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                    >
                      <PencilIcon className="w-4 h-4" />
                    </motion.button>

                    <motion.button
                      onClick={() => handleAction('duplicate', automation.id)}
                      className="p-1.5 text-gray-400 hover:text-purple-400 hover:bg-purple-600/20 rounded-lg transition-colors"
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                    >
                      <DocumentDuplicateIcon className="w-4 h-4" />
                    </motion.button>

                    <motion.button
                      onClick={() => handleAction(automation.status === 'active' ? 'pause' : 'play', automation.id)}
                      className={`p-1.5 rounded-lg transition-colors ${
                        automation.status === 'active'
                          ? 'text-orange-400 hover:bg-orange-600/20'
                          : 'text-green-400 hover:bg-green-600/20'
                      }`}
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                    >
                      {automation.status === 'active' ? (
                        <PauseIcon className="w-4 h-4" />
                      ) : (
                        <PlayIcon className="w-4 h-4" />
                      )}
                    </motion.button>

                    <motion.button
                      onClick={() => handleAction('delete', automation.id)}
                      className="p-1.5 text-gray-400 hover:text-red-400 hover:bg-red-600/20 rounded-lg transition-colors"
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

      {filteredAutomations.length === 0 && (
        <motion.div
          className="text-center py-12"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.3 }}
        >
          <CogIcon className="w-12 h-12 text-gray-500 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-400 mb-2">
            No se encontraron automatizaciones
          </h3>
          <p className="text-gray-500">
            No hay automatizaciones que coincidan con tu búsqueda.
          </p>
        </motion.div>
      )}

      {/* Resumen */}
      {filteredAutomations.length > 0 && (
        <motion.div
          className="bg-gray-900/50 px-6 py-4 border-t border-gray-700/50"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6, duration: 0.3 }}
        >
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-400">
              {filteredAutomations.length} automatización{filteredAutomations.length > 1 ? 'es' : ''} encontrada{filteredAutomations.length > 1 ? 's' : ''}
            </span>
            <div className="flex items-center gap-6">
              <span className="text-gray-400">
                Total ejecuciones: <span className="text-white font-medium">
                  {filteredAutomations.reduce((sum, a) => sum + a.runs, 0).toLocaleString('es-ES')}
                </span>
              </span>
              <span className="text-gray-400">
                Ingresos generados: <span className="text-white font-medium">
                  {formatCurrency(filteredAutomations.reduce((sum, a) => sum + a.revenueGenerated, 0))}
                </span>
              </span>
            </div>
          </div>
        </motion.div>
      )}
    </motion.div>
  )
}