"use client"

import { motion } from "framer-motion"
import {
  CloudIcon,
  ServerIcon,
  ArrowPathIcon,
  ExclamationTriangleIcon
} from "@heroicons/react/24/outline"

interface LocalBackup {
  name: string
  size: number
  modified: string
}

interface CloudBackup {
  name: string
  size: number
}

interface BackupHistoryProps {
  localBackups: LocalBackup[]
  cloudBackups: CloudBackup[]
  onRollback: (backupName: string) => void
  runningRollback: boolean
}

export function BackupHistory({
  localBackups,
  cloudBackups,
  onRollback,
  runningRollback
}: BackupHistoryProps) {
  const formatSize = (bytes: number) => {
    const sizes = ['B', 'KB', 'MB', 'GB']
    if (bytes === 0) return '0 B'
    const i = Math.floor(Math.log(bytes) / Math.log(1024))
    return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i]
  }

  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString)
      return date.toLocaleString('es-ES')
    } catch {
      return dateString
    }
  }

  const extractDateFromBackup = (backupName: string) => {
    const match = backupName.match(/backup_(\d{4}-\d{2}-\d{2})_(\d{2}-\d{2}-\d{2})/)
    if (match) {
      return `${match[1]} ${match[2].replace(/-/g, ':')}`
    }
    return backupName
  }

  return (
    <div className="space-y-8">
      {/* Cloud Backups */}
      <motion.div
        className="bg-gray-800/30 backdrop-blur-sm border border-gray-700/30 rounded-2xl p-8"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="flex items-center gap-3 mb-6">
          <CloudIcon className="w-6 h-6 text-purple-400" />
          <div>
            <h3 className="text-lg font-semibold text-white">Backups en Google Drive</h3>
            <p className="text-gray-400 text-sm">
              Backups disponibles para restauración ({cloudBackups.length} totales)
            </p>
          </div>
        </div>

        {cloudBackups.length === 0 ? (
          <div className="text-center py-8">
            <CloudIcon className="w-16 h-16 text-gray-600 mx-auto mb-4" />
            <p className="text-gray-400">No hay backups en la nube</p>
          </div>
        ) : (
          <div className="space-y-3">
            {cloudBackups.map((backup, index) => (
              <motion.div
                key={backup.name}
                className="bg-gray-800/50 rounded-lg p-4 hover:bg-gray-800/70 transition-colors"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 * index, duration: 0.3 }}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="p-2 bg-purple-500/20 rounded-lg">
                      <CloudIcon className="w-5 h-5 text-purple-400" />
                    </div>
                    <div>
                      <div className="text-white font-medium">{backup.name}</div>
                      <div className="text-sm text-gray-400">
                        {formatSize(backup.size)} • {extractDateFromBackup(backup.name)}
                      </div>
                    </div>
                  </div>

                  <motion.button
                    onClick={() => onRollback(backup.name)}
                    disabled={runningRollback}
                    className="px-4 py-2 bg-red-600/20 hover:bg-red-600/30 border border-red-500/20 text-red-400 hover:text-red-300 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <ArrowPathIcon className="w-4 h-4" />
                    <span className="text-sm">
                      {runningRollback ? 'Restaurando...' : 'Rollback'}
                    </span>
                  </motion.button>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </motion.div>

      {/* Local Backups */}
      <motion.div
        className="bg-gray-800/30 backdrop-blur-sm border border-gray-700/30 rounded-2xl p-8"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2, duration: 0.5 }}
      >
        <div className="flex items-center gap-3 mb-6">
          <ServerIcon className="w-6 h-6 text-blue-400" />
          <div>
            <h3 className="text-lg font-semibold text-white">Backups Locales</h3>
            <p className="text-gray-400 text-sm">
              Archivos ZIP en el servidor local ({localBackups.length} totales)
            </p>
          </div>
        </div>

        {localBackups.length === 0 ? (
          <div className="text-center py-8">
            <ServerIcon className="w-16 h-16 text-gray-600 mx-auto mb-4" />
            <p className="text-gray-400">No hay backups locales</p>
          </div>
        ) : (
          <div className="space-y-3">
            {localBackups.map((backup, index) => (
              <motion.div
                key={backup.name}
                className="bg-gray-800/50 rounded-lg p-4"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 * index, duration: 0.3 }}
              >
                <div className="flex items-center gap-4">
                  <div className="p-2 bg-blue-500/20 rounded-lg">
                    <ServerIcon className="w-5 h-5 text-blue-400" />
                  </div>
                  <div className="flex-1">
                    <div className="text-white font-medium">{backup.name}</div>
                    <div className="text-sm text-gray-400">
                      {formatSize(backup.size)} • Modificado: {formatDate(backup.modified)}
                    </div>
                  </div>
                  <div className="text-xs text-gray-500">
                    Local
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </motion.div>

      {/* Warning */}
      <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-xl p-4">
        <div className="flex items-start gap-3">
          <ExclamationTriangleIcon className="w-5 h-5 text-yellow-400 mt-0.5" />
          <div>
            <h4 className="text-sm font-medium text-yellow-400 mb-1">
              Operaciones Destructivas
            </h4>
            <p className="text-sm text-gray-400">
              El rollback sobrescribirá todos los archivos actuales. Asegúrate de tener backups adicionales antes de proceder.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}