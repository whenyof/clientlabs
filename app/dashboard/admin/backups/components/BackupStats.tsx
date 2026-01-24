"use client"

import { motion } from "framer-motion"
import { BackupLogEntry } from "@/lib/backup-utils"
import {
  DocumentIcon,
  LockClosedIcon,
  ClockIcon,
  ServerIcon
} from "@heroicons/react/24/outline"

interface BackupStatsProps {
  backups: BackupLogEntry[]
}

export function BackupStats({ backups }: BackupStatsProps) {
  const totalBackups = backups.length
  const encryptedBackups = backups.filter(b => b.status === 'encrypted').length
  const lastBackup = backups[0]?.timestamp
  const totalSize = backups.reduce((sum, b) => sum + b.size, 0)

  const formatSize = (bytes: number) => {
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    if (bytes === 0) return '0 Bytes'
    const i = Math.floor(Math.log(bytes) / Math.log(1024))
    return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i]
  }

  const stats = [
    {
      label: 'Total Backups',
      value: totalBackups.toString(),
      icon: DocumentIcon,
      color: 'text-blue-400 bg-blue-500/10 border-blue-500/20',
      description: 'Backups creados'
    },
    {
      label: 'Cifrados',
      value: encryptedBackups.toString(),
      icon: LockClosedIcon,
      color: 'text-green-400 bg-green-500/10 border-green-500/20',
      description: 'Backups seguros'
    },
    {
      label: 'Espacio Total',
      value: formatSize(totalSize),
      icon: ServerIcon,
      color: 'text-purple-400 bg-purple-500/10 border-purple-500/20',
      description: 'Almacenamiento usado'
    },
    {
      label: 'Último Backup',
      value: lastBackup ? new Date(lastBackup).toLocaleDateString('es-ES') : 'Nunca',
      icon: ClockIcon,
      color: 'text-orange-400 bg-orange-500/10 border-orange-500/20',
      description: 'Backup más reciente'
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