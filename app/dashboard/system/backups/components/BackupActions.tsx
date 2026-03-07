"use client"

import { motion } from "framer-motion"
import {
  CloudArrowUpIcon,
  ArrowPathIcon,
  ShieldCheckIcon,
  ServerIcon
} from "@heroicons/react/24/outline"

interface BackupActionsProps {
  onRunBackup: () => void
  runningBackup: boolean
}

export function BackupActions({ onRunBackup, runningBackup }: BackupActionsProps) {
  const actions = [
    {
      title: 'Ejecutar Backup',
      description: 'Crear backup manual completo del proyecto',
      icon: CloudArrowUpIcon,
      action: onRunBackup,
      variant: 'primary' as const,
      disabled: runningBackup
    },
    {
      title: 'Recargar Estado',
      description: 'Actualizar información del sistema de backups',
      icon: ArrowPathIcon,
      action: () => window.location.reload(),
      variant: 'secondary' as const,
      disabled: false
    },
    {
      title: 'Verificar Sistema',
      description: 'Comprobar integridad del sistema de backups',
      icon: ShieldCheckIcon,
      action: () => console.log('System check'),
      variant: 'secondary' as const,
      disabled: false
    },
    {
      title: 'Limpiar Logs',
      description: 'Eliminar logs antiguos del sistema',
      icon: ServerIcon,
      action: () => console.log('Clean logs'),
      variant: 'danger' as const,
      disabled: false
    }
  ]

  const getButtonStyles = (variant: string, disabled: boolean) => {
    const baseStyles = "w-full px-6 py-4 rounded-xl font-semibold transition-all duration-300 flex items-center justify-center gap-3"

    if (disabled) {
      return `${baseStyles} bg-[var(--bg-surface)] cursor-not-allowed text-[var(--text-secondary)]`
    }

    switch (variant) {
      case 'primary':
        return `${baseStyles} bg-gradient-to-r from-emerald-600 to-blue-600 hover:from-emerald-700 hover:to-blue-700 text-[var(--text-primary)] shadow-[var(--shadow-card)] hover:shadow-emerald-500/25`
      case 'secondary':
        return `${baseStyles} bg-[var(--bg-main)] hover:bg-[var(--bg-surface)] border border-[var(--border-subtle)] text-[var(--text-secondary)] hover:text-[var(--text-primary)]`
      case 'danger':
        return `${baseStyles} bg-red-600/20 hover:bg-red-600/30 border border-red-500/20 text-red-400 hover:text-red-300`
      default:
        return baseStyles
    }
  }

  return (
    <motion.div
      className="bg-[var(--bg-main)] backdrop-blur-sm border border-[var(--border-subtle)] rounded-xl p-8"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2, duration: 0.5 }}
    >
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-[var(--text-primary)] mb-2">Acciones del Sistema</h3>
        <p className="text-[var(--text-secondary)] text-sm">
          Gestiona el sistema de backups de manera segura y controlada
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {actions.map((action, index) => {
          const Icon = action.icon

          return (
            <motion.div
              key={action.title}
              className="space-y-3"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 * index, duration: 0.5 }}
            >
              <motion.button
                onClick={action.disabled ? undefined : action.action}
                disabled={action.disabled}
                className={getButtonStyles(action.variant, action.disabled)}
                whileHover={!action.disabled ? { scale: 1.02 } : {}}
                whileTap={!action.disabled ? { scale: 0.98 } : {}}
              >
                <Icon className={`w-5 h-5 ${action.disabled ? 'animate-spin' : ''}`} />
                <span className="text-sm">
                  {action.disabled ? 'Procesando...' : action.title}
                </span>
              </motion.button>

              <div className="text-center">
                <p className="text-xs text-[var(--text-secondary)] leading-tight">
                  {action.description}
                </p>
              </div>
            </motion.div>
          )
        })}
      </div>

      {/* Security Notice */}
      <div className="mt-8 p-4 bg-blue-500/10 border border-blue-500/20 rounded-lg">
        <div className="flex items-start gap-3">
          <ShieldCheckIcon className="w-5 h-5 text-blue-400 mt-0.5" />
          <div>
            <h4 className="text-sm font-medium text-blue-400 mb-1">
              Área de Administración Segura
            </h4>
            <p className="text-sm text-[var(--text-secondary)]">
              Estas acciones afectan el sistema de backups completo. Todas las operaciones son auditadas y requieren permisos de administrador.
            </p>
          </div>
        </div>
      </div>
    </motion.div>
  )
}