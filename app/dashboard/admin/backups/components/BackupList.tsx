"use client"

import { motion } from "framer-motion"
import { BackupLogEntry } from "@/lib/backup-utils"
import {
  LockClosedIcon,
  LockOpenIcon,
  ArrowDownTrayIcon,
  EyeIcon,
  ClockIcon,
  ServerIcon
} from "@heroicons/react/24/outline"

interface BackupListProps {
  backups: BackupLogEntry[]
  loading: boolean
}

export function BackupList({ backups, loading }: BackupListProps) {
  const formatSize = (bytes: number) => {
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    if (bytes === 0) return '0 Bytes'
    const i = Math.floor(Math.log(bytes) / Math.log(1024))
    return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i]
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'encrypted':
        return <LockClosedIcon className="w-4 h-4 text-green-400" />
      case 'unencrypted':
        return <LockOpenIcon className="w-4 h-4 text-yellow-400" />
      default:
        return <ClockIcon className="w-4 h-4 text-[var(--text-secondary)]" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'encrypted':
        return 'bg-green-500/20 text-green-400 border-green-500/20'
      case 'unencrypted':
        return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/20'
      default:
        return 'bg-[var(--bg-main)]0/20 text-[var(--text-secondary)] border-[var(--border-subtle)]'
    }
  }

  if (loading) {
    return (
      <div className="space-y-4">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="bg-[var(--bg-main)] rounded-xl p-6">
            <div className="animate-pulse space-y-4">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 bg-[var(--bg-surface)] rounded-lg"></div>
                <div className="space-y-2 flex-1">
                  <div className="h-4 bg-[var(--bg-surface)] rounded w-1/4"></div>
                  <div className="h-3 bg-[var(--bg-surface)] rounded w-1/3"></div>
                </div>
              </div>
              <div className="flex gap-4">
                <div className="h-8 bg-[var(--bg-surface)] rounded w-20"></div>
                <div className="h-8 bg-[var(--bg-surface)] rounded w-16"></div>
              </div>
            </div>
          </div>
        ))}
      </div>
    )
  }

  if (backups.length === 0) {
    return (
      <motion.div
        className="text-center py-16 bg-[var(--bg-main)] backdrop-blur-sm border border-[var(--border-subtle)] rounded-2xl"
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
      >
        <ServerIcon className="w-16 h-16 text-[var(--text-primary)] mx-auto mb-4" />
        <h3 className="text-xl font-semibold text-[var(--text-primary)] mb-2">
          No hay backups
        </h3>
        <p className="text-[var(--text-secondary)] mb-6 max-w-md mx-auto">
          No se han creado backups todavía. Crea tu primer backup para asegurar tus datos.
        </p>
      </motion.div>
    )
  }

  return (
    <motion.div
      className="space-y-4"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3, duration: 0.5 }}
    >
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-[var(--text-primary)] mb-1">Lista de Backups</h3>
          <p className="text-sm text-[var(--text-secondary)]">
            {backups.length} backup{backups.length !== 1 ? 's' : ''} disponible{backups.length !== 1 ? 's' : ''}
          </p>
        </div>
      </div>

      <div className="space-y-3">
        {backups.map((backup, index) => (
          <motion.div
            key={backup.id}
            className="bg-[var(--bg-main)] backdrop-blur-sm border border-[var(--border-subtle)] rounded-xl p-6 hover:bg-[var(--bg-main)] transition-colors"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 * index, duration: 0.3 }}
            whileHover={{ y: -1 }}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className={`p-3 rounded-lg ${getStatusColor(backup.status)}`}>
                  {getStatusIcon(backup.status)}
                </div>

                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className="text-[var(--text-primary)] font-medium">
                      Backup {backup.id.split('_')[0]}
                    </h4>
                    <div className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(backup.status)}`}>
                      {backup.status === 'encrypted' ? 'Cifrado' : 'Sin cifrar'}
                    </div>
                  </div>
                  <div className="text-sm text-[var(--text-secondary)]">
                    {new Date(backup.timestamp).toLocaleString('es-ES')}
                  </div>
                  <div className="text-xs text-[var(--text-secondary)] mt-1">
                    {formatSize(backup.size)} • {backup.metadata.environment} • {backup.metadata.database_type}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <motion.button
                  className="p-2 text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-surface)] rounded-lg transition-colors"
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                >
                  <EyeIcon className="w-4 h-4" />
                </motion.button>

                <motion.button
                  className="p-2 text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-surface)] rounded-lg transition-colors"
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                >
                  <ArrowDownTrayIcon className="w-4 h-4" />
                </motion.button>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </motion.div>
  )
}