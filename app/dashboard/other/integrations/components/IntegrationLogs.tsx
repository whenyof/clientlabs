"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { mockIntegrationLogs } from "../mock"
import {
  CheckCircleIcon,
  XCircleIcon,
  ArrowPathIcon,
  ExclamationTriangleIcon,
  ClockIcon,
  FunnelIcon
} from "@heroicons/react/24/outline"

export function IntegrationLogs() {
  const [filter, setFilter] = useState<'all' | 'success' | 'error'>('all')

  const getLogIcon = (type: string, success: boolean) => {
    if (!success) return XCircleIcon

    switch (type) {
      case 'connect':
        return CheckCircleIcon
      case 'sync':
        return ArrowPathIcon
      case 'webhook':
        return ClockIcon
      case 'error':
        return ExclamationTriangleIcon
      default:
        return ArrowPathIcon
    }
  }

  const getLogColor = (type: string, success: boolean) => {
    if (!success) return 'text-red-400 bg-red-500/10 border-red-500/20'

    switch (type) {
      case 'connect':
        return 'text-green-400 bg-green-500/10 border-green-500/20'
      case 'sync':
        return 'text-blue-400 bg-blue-500/10 border-blue-500/20'
      case 'webhook':
        return 'text-purple-400 bg-purple-500/10 border-purple-500/20'
      case 'error':
        return 'text-orange-400 bg-orange-500/10 border-orange-500/20'
      default:
        return 'text-gray-400 bg-gray-500/10 border-gray-500/20'
    }
  }

  const filteredLogs = filter === 'all'
    ? mockIntegrationLogs
    : mockIntegrationLogs.filter(log =>
        filter === 'success' ? log.success : !log.success
      )

  return (
    <motion.div
      className="space-y-6"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.1, duration: 0.5 }}
    >
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-2xl font-bold text-white mb-2">Logs de Integración</h3>
          <p className="text-gray-400">Historial completo de actividades</p>
        </div>

        <div className="flex items-center gap-3">
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value as typeof filter)}
            className="px-4 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
          >
            <option value="all">Todos</option>
            <option value="success">Exitosos</option>
            <option value="error">Errores</option>
          </select>
        </div>
      </div>

      <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl border border-gray-700/50 overflow-hidden">
        <div className="p-6 space-y-4">
          {filteredLogs.map((log, index) => {
            const LogIcon = getLogIcon(log.type, log.success)
            const colorClass = getLogColor(log.type, log.success)

            return (
              <motion.div
                key={log.id}
                className={`p-4 rounded-xl border ${colorClass} transition-all duration-300`}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05, duration: 0.3 }}
              >
                <div className="flex items-start gap-4">
                  <div className="p-2 bg-gray-900/50 rounded-lg">
                    <LogIcon className="w-5 h-5" />
                  </div>

                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-1">
                      <h4 className="text-white font-medium">{log.action}</h4>
                      <span className="text-xs text-gray-400">
                        {new Date(log.timestamp).toLocaleString('es-ES')}
                      </span>
                    </div>

                    {log.data && (
                      <div className="text-sm text-gray-400 mb-2">
                        {typeof log.data === 'string' ? log.data : JSON.stringify(log.data)}
                      </div>
                    )}

                    {log.error && (
                      <div className="text-sm text-red-400 bg-red-500/10 p-2 rounded border border-red-500/20">
                        {log.error}
                      </div>
                    )}

                    <div className="flex items-center gap-2 mt-2">
                      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                        log.success
                          ? 'bg-green-500/20 text-green-400'
                          : 'bg-red-500/20 text-red-400'
                      }`}>
                        {log.type.toUpperCase()}
                      </span>
                      <span className="text-xs text-gray-500">
                        ID: {log.id}
                      </span>
                    </div>
                  </div>
                </div>
              </motion.div>
            )
          })}
        </div>
      </div>
    </motion.div>
  )
}