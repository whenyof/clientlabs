"use client"

import { motion } from "framer-motion"
import {
  DocumentTextIcon,
  ArrowPathIcon
} from "@heroicons/react/24/outline"

interface BackupLogsProps {
  logs: string[]
}

export function BackupLogs({ logs }: BackupLogsProps) {
  const formatLogEntry = (logEntry: string) => {
    try {
      const parsed = JSON.parse(logEntry)
      return {
        timestamp: new Date(parsed.timestamp).toLocaleString('es-ES'),
        level: parsed.level,
        message: parsed.message,
        data: parsed
      }
    } catch {
      // If not JSON, treat as plain text
      return {
        timestamp: new Date().toLocaleString('es-ES'),
        level: 'info',
        message: logEntry,
        data: {}
      }
    }
  }

  const getLevelColor = (level: string) => {
    switch (level.toLowerCase()) {
      case 'error':
        return 'text-red-400'
      case 'warn':
      case 'warning':
        return 'text-yellow-400'
      case 'info':
        return 'text-blue-400'
      case 'debug':
        return 'text-gray-400'
      default:
        return 'text-gray-300'
    }
  }

  const getLevelBg = (level: string) => {
    switch (level.toLowerCase()) {
      case 'error':
        return 'bg-red-500/10 border-red-500/20'
      case 'warn':
      case 'warning':
        return 'bg-yellow-500/10 border-yellow-500/20'
      case 'info':
        return 'bg-blue-500/10 border-blue-500/20'
      case 'debug':
        return 'bg-gray-500/10 border-gray-500/20'
      default:
        return 'bg-gray-800/50 border-gray-700/50'
    }
  }

  return (
    <motion.div
      className="bg-gray-800/30 backdrop-blur-sm border border-gray-700/30 rounded-2xl p-8"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <DocumentTextIcon className="w-6 h-6 text-green-400" />
          <div>
            <h3 className="text-lg font-semibold text-white">Logs del Sistema</h3>
            <p className="text-gray-400 text-sm">
              Historial de operaciones del sistema de backups ({logs.length} entradas)
            </p>
          </div>
        </div>

        <motion.button
          onClick={() => window.location.reload()}
          className="p-2 text-gray-400 hover:text-white hover:bg-gray-700/50 rounded-lg transition-colors"
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
        >
          <ArrowPathIcon className="w-5 h-5" />
        </motion.button>
      </div>

      {logs.length === 0 ? (
        <div className="text-center py-16">
          <DocumentTextIcon className="w-16 h-16 text-gray-600 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-white mb-2">
            No hay logs disponibles
          </h3>
          <p className="text-gray-400 mb-6 max-w-md mx-auto">
            Los logs del sistema de backups aparecerán aquí después de ejecutar operaciones.
          </p>
        </div>
      ) : (
        <div className="space-y-3 max-h-96 overflow-y-auto">
          {logs.slice(-50).reverse().map((logEntry, index) => {
            const formatted = formatLogEntry(logEntry)

            return (
              <motion.div
                key={index}
                className={`rounded-lg p-4 border ${getLevelBg(formatted.level)}`}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.02 * index, duration: 0.3 }}
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className={`text-xs font-medium px-2 py-1 rounded ${getLevelBg(formatted.level)} ${getLevelColor(formatted.level)}`}>
                        {formatted.level.toUpperCase()}
                      </span>
                      <span className="text-xs text-gray-500">
                        {formatted.timestamp}
                      </span>
                    </div>
                    <p className="text-sm text-gray-300 break-words">
                      {formatted.message}
                    </p>
                    {formatted.data && Object.keys(formatted.data).length > 2 && (
                      <details className="mt-2">
                        <summary className="text-xs text-gray-500 cursor-pointer hover:text-gray-400">
                          Mostrar detalles
                        </summary>
                        <pre className="mt-2 text-xs text-gray-400 bg-gray-900/50 p-2 rounded overflow-x-auto">
                          {JSON.stringify(formatted.data, null, 2)}
                        </pre>
                      </details>
                    )}
                  </div>
                </div>
              </motion.div>
            )
          })}
        </div>
      )}

      {logs.length > 50 && (
        <div className="mt-4 text-center">
          <p className="text-xs text-gray-500">
            Mostrando las últimas 50 entradas de {logs.length} totales
          </p>
        </div>
      )}
    </motion.div>
  )
}