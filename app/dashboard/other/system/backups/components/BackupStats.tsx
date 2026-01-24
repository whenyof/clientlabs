"use client"

import { motion } from "framer-motion"
import {
  ServerIcon,
  CloudIcon,
  ClockIcon,
  CheckCircleIcon,
  XCircleIcon,
  ExclamationTriangleIcon
} from "@heroicons/react/24/outline"

interface BackupStatus {
  localBackups: Array<{ name: string; size: number; modified: string }>
  cloudBackups: Array<{ name: string; size: number }>
  cronStatus: string
  lastBackup: string | null
  totalLocal: number
  totalCloud: number
  cloudError?: string
  timestamp: string
}

interface BackupStatsProps {
  status: BackupStatus | null
}

export function BackupStats({ status }: BackupStatsProps) {
  if (!status) return null

  const formatSize = (bytes: number) => {
    const sizes = ['B', 'KB', 'MB', 'GB']
    if (bytes === 0) return '0 B'
    const i = Math.floor(Math.log(bytes) / Math.log(1024))
    return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i]
  }

  const getCronIcon = (status: string) => {
    switch (status) {
      case 'active':
        return <CheckCircleIcon className="w-5 h-5 text-green-400" />
      case 'inactive':
        return <XCircleIcon className="w-5 h-5 text-red-400" />
      default:
        return <ExclamationTriangleIcon className="w-5 h-5 text-yellow-400" />
    }
  }

  const getCronColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'text-green-400 bg-green-500/10 border-green-500/20'
      case 'inactive':
        return 'text-red-400 bg-red-500/10 border-red-500/20'
      default:
        return 'text-yellow-400 bg-yellow-500/10 border-yellow-500/20'
    }
  }

  const stats = [
    {
      label: 'Backups Locales',
      value: status.totalLocal.toString(),
      icon: ServerIcon,
      color: 'text-blue-400 bg-blue-500/10 border-blue-500/20',
      description: 'Archivos ZIP locales'
    },
    {
      label: 'Backups en Nube',
      value: status.totalCloud.toString(),
      icon: CloudIcon,
      color: 'text-purple-400 bg-purple-500/10 border-purple-500/20',
      description: 'Google Drive cifrado'
    },
    {
      label: 'Último Backup',
      value: status.lastBackup ? new Date(status.lastBackup.replace(/_/g, ' ').replace('.zip', '')).toLocaleDateString('es-ES') : 'Nunca',
      icon: ClockIcon,
      color: 'text-orange-400 bg-orange-500/10 border-orange-500/20',
      description: 'Backup más reciente'
    },
    {
      label: 'Estado del Cron',
      value: status.cronStatus === 'active' ? 'Activo' : status.cronStatus === 'inactive' ? 'Inactivo' : 'Error',
      icon: getCronIcon(status.cronStatus),
      color: getCronColor(status.cronStatus),
      description: 'Backup automático diario'
    }
  ]

  return (
    <motion.div
      className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      {stats.map((stat, index) => {
        const Icon = stat.icon

        return (
          <motion.div
            key={stat.label}
            className="bg-gray-800/30 backdrop-blur-sm border border-gray-700/30 rounded-xl p-6 hover:bg-gray-800/50 transition-colors"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 * index, duration: 0.5 }}
            whileHover={{ y: -2 }}
          >
            <div className="flex items-center justify-between mb-4">
              <div className={`p-3 rounded-lg ${stat.color}`}>
                <Icon className="w-5 h-5" />
              </div>
            </div>

            <div>
              <div className="text-2xl font-bold text-white mb-1">
                {stat.value}
              </div>
              <div className="text-sm text-gray-400 mb-1">
                {stat.label}
              </div>
              <div className="text-xs text-gray-500">
                {stat.description}
              </div>
            </div>
          </motion.div>
        )
      })}
    </motion.div>
  )
}