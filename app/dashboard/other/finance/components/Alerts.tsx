"use client"

import { motion } from "framer-motion"
import { mockFinanceAlerts, getAlertSeverityColor } from "../mock"
import {
  ExclamationTriangleIcon,
  InformationCircleIcon,
  CheckCircleIcon,
  XMarkIcon,
  BellIcon
} from "@heroicons/react/24/outline"

export function Alerts() {
  const handleDismissAlert = (alertId: string) => {
    console.log('Dismiss alert:', alertId)
  }

  const handleActionAlert = (alertId: string) => {
    console.log('Action alert:', alertId)
  }

  const getAlertIcon = (type: string) => {
    switch (type) {
      case 'HIGH_EXPENSE':
        return ExclamationTriangleIcon
      case 'BUDGET_EXCEEDED':
        return ExclamationTriangleIcon
      case 'CASHFLOW_RISK':
        return ExclamationTriangleIcon
      case 'UNUSUAL_PATTERN':
        return InformationCircleIcon
      case 'GOAL_DEADLINE':
        return BellIcon
      case 'RECURRING_PAYMENT':
        return InformationCircleIcon
      default:
        return InformationCircleIcon
    }
  }

  const getAlertActionText = (type: string) => {
    switch (type) {
      case 'HIGH_EXPENSE':
        return 'Revisar gastos'
      case 'BUDGET_EXCEEDED':
        return 'Ajustar presupuesto'
      case 'CASHFLOW_RISK':
        return 'Ver pronóstico'
      case 'UNUSUAL_PATTERN':
        return 'Analizar patrón'
      case 'GOAL_DEADLINE':
        return 'Ver objetivos'
      case 'RECURRING_PAYMENT':
        return 'Programar pago'
      default:
        return 'Ver detalles'
    }
  }

  return (
    <motion.div
      className="bg-gray-800/50 backdrop-blur-sm rounded-2xl border border-gray-700/50 p-6"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.8, duration: 0.5 }}
    >
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-xl font-bold text-white mb-2">Alertas Financieras</h3>
          <p className="text-gray-400 text-sm">Notificaciones importantes</p>
        </div>
        <div className="text-sm text-gray-400">
          {mockFinanceAlerts.filter(a => !a.read).length} sin leer
        </div>
      </div>

      {mockFinanceAlerts.length === 0 ? (
        <div className="text-center py-12">
          <CheckCircleIcon className="w-12 h-12 text-green-400 mx-auto mb-4" />
          <h4 className="text-lg font-medium text-gray-400 mb-2">
            Todo en orden
          </h4>
          <p className="text-gray-500">
            No hay alertas activas en este momento.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {mockFinanceAlerts.map((alert, index) => {
            const AlertIcon = getAlertIcon(alert.type)
            const severityColor = getAlertSeverityColor(alert.severity)

            return (
              <motion.div
                key={index}
                className={`p-4 rounded-xl border ${severityColor} transition-all duration-300 hover:scale-105`}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.9 + (index * 0.1), duration: 0.3 }}
              >
                <div className="flex items-start gap-4">
                  <div className="p-2 bg-gray-900/50 rounded-lg">
                    <AlertIcon className="w-5 h-5 text-current" />
                  </div>

                  <div className="flex-1">
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex-1">
                        <h4 className="text-white font-semibold mb-1">
                          {alert.message}
                        </h4>
                        <div className="flex items-center gap-2 text-sm">
                          <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${severityColor}`}>
                            {alert.severity}
                          </span>
                          <span className="text-gray-400">
                            {new Date(alert.createdAt).toLocaleDateString('es-ES', {
                              day: '2-digit',
                              month: 'short',
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <motion.button
                          onClick={() => handleActionAlert(index.toString())}
                          className="px-3 py-1 bg-purple-600/20 hover:bg-purple-600/30 text-purple-400 hover:text-purple-300 text-sm rounded-lg transition-colors"
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                        >
                          {getAlertActionText(alert.type)}
                        </motion.button>

                        <motion.button
                          onClick={() => handleDismissAlert(index.toString())}
                          className="p-1 text-gray-400 hover:text-gray-300 hover:bg-gray-700/50 rounded-lg transition-colors"
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                        >
                          <XMarkIcon className="w-4 h-4" />
                        </motion.button>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            )
          })}
        </div>
      )}

      {/* Summary */}
      <motion.div
        className="mt-6 p-4 bg-gray-900/50 rounded-xl border border-gray-700/50"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.1, duration: 0.5 }}
      >
        <div className="grid grid-cols-3 gap-4 text-center">
          <div>
            <div className="text-2xl font-bold text-red-400">
              {mockFinanceAlerts.filter(a => a.severity === 'CRITICAL').length}
            </div>
            <div className="text-xs text-gray-400">Críticas</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-orange-400">
              {mockFinanceAlerts.filter(a => a.severity === 'HIGH').length}
            </div>
            <div className="text-xs text-gray-400">Altas</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-blue-400">
              {mockFinanceAlerts.filter(a => a.severity === 'MEDIUM' || a.severity === 'LOW').length}
            </div>
            <div className="text-xs text-gray-400">Bajas</div>
          </div>
        </div>
      </motion.div>
    </motion.div>
  )
}