"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import {
  CogIcon,
  PlayIcon,
  PauseIcon,
  PlusIcon,
  ArrowPathIcon,
  BellIcon,
  ChartBarIcon,
  CurrencyEuroIcon
} from "@heroicons/react/24/outline"

export function AutomationFinance() {
  const [automations, setAutomations] = useState([
    {
      id: '1',
      name: 'Detección de gastos inusuales',
      description: 'Identifica automáticamente transacciones por encima del promedio',
      type: 'monitoring',
      status: 'active',
      triggers: ['Transacción > 2x promedio mensual'],
      actions: ['Enviar notificación', 'Marcar para revisión']
    },
    {
      id: '2',
      name: 'Recordatorios de pagos recurrentes',
      description: 'Notifica 3 días antes de vencimiento de gastos fijos',
      type: 'reminder',
      status: 'active',
      triggers: ['3 días antes de pago recurrente'],
      actions: ['Enviar email recordatorio', 'Crear tarea pendiente']
    },
    {
      id: '3',
      name: 'Análisis semanal de presupuesto',
      description: 'Genera reporte semanal de cumplimiento presupuestario',
      type: 'reporting',
      status: 'paused',
      triggers: ['Cada lunes a las 9:00'],
      actions: ['Generar reporte PDF', 'Enviar por email']
    },
    {
      id: '4',
      name: 'Clasificación automática de gastos',
      description: 'Asigna categorías automáticamente basándose en patrones',
      type: 'classification',
      status: 'active',
      triggers: ['Nueva transacción sin categoría'],
      actions: ['Analizar descripción', 'Asignar categoría', 'Actualizar registro']
    }
  ])

  const [showCreateModal, setShowCreateModal] = useState(false)

  const handleToggleAutomation = (automationId: string) => {
    setAutomations(prev =>
      prev.map(auto =>
        auto.id === automationId
          ? { ...auto, status: auto.status === 'active' ? 'paused' : 'active' }
          : auto
      )
    )
  }

  const getAutomationIcon = (type: string) => {
    switch (type) {
      case 'monitoring':
        return ChartBarIcon
      case 'reminder':
        return BellIcon
      case 'reporting':
        return ArrowPathIcon
      case 'classification':
        return CogIcon
      default:
        return CogIcon
    }
  }

  const getAutomationColor = (type: string) => {
    switch (type) {
      case 'monitoring':
        return 'text-red-400 bg-red-500/10 border-red-500/20'
      case 'reminder':
        return 'text-blue-400 bg-blue-500/10 border-blue-500/20'
      case 'reporting':
        return 'text-green-400 bg-green-500/10 border-green-500/20'
      case 'classification':
        return 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20'
      default:
        return 'text-[var(--text-secondary)] bg-[var(--bg-main)]0/10 border-[var(--border-subtle)]'
    }
  }

  return (
    <motion.div
      className="bg-[var(--bg-main)] backdrop-blur-sm rounded-xl border border-[var(--border-subtle)] p-6"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.9, duration: 0.5 }}
    >
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-xl font-bold text-[var(--text-primary)] mb-2">Automatizaciones Financieras</h3>
          <p className="text-[var(--text-secondary)] text-sm">Procesos inteligentes que optimizan tu gestión</p>
        </div>

        <motion.button
          onClick={() => setShowCreateModal(true)}
          className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-emerald-600 to-blue-600 hover:from-emerald-700 hover:to-blue-700 text-[var(--text-primary)] font-semibold rounded-xl transition-all duration-300 shadow-[var(--shadow-card)] hover:shadow-emerald-500/25"
          whileHover={{ scale: 1.05, y: -2 }}
          whileTap={{ scale: 0.95 }}
        >
          <PlusIcon className="w-5 h-5" />
          Nueva Automatización
        </motion.button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <motion.div className="p-4 bg-[var(--bg-card)] rounded-xl text-center">
          <div className="text-2xl font-bold text-green-400 mb-1">
            {automations.filter(a => a.status === 'active').length}
          </div>
          <div className="text-sm text-[var(--text-secondary)]">Activas</div>
        </motion.div>
        <motion.div className="p-4 bg-[var(--bg-card)] rounded-xl text-center">
          <div className="text-2xl font-bold text-blue-400 mb-1">
            {automations.reduce((sum, a) => sum + a.triggers.length, 0)}
          </div>
          <div className="text-sm text-[var(--text-secondary)]">Triggers</div>
        </motion.div>
        <motion.div className="p-4 bg-[var(--bg-card)] rounded-xl text-center">
          <div className="text-2xl font-bold text-emerald-400 mb-1">
            {automations.reduce((sum, a) => sum + a.actions.length, 0)}
          </div>
          <div className="text-sm text-[var(--text-secondary)]">Acciones</div>
        </motion.div>
        <motion.div className="p-4 bg-[var(--bg-card)] rounded-xl text-center">
          <div className="text-2xl font-bold text-orange-400 mb-1">
            94%
          </div>
          <div className="text-sm text-[var(--text-secondary)]">Precisión</div>
        </motion.div>
      </div>

      {/* Automations List */}
      <div className="space-y-4">
        {automations.map((automation, index) => {
          const AutomationIcon = getAutomationIcon(automation.type)
          const colorClasses = getAutomationColor(automation.type)

          return (
            <motion.div
              key={automation.id}
              className="p-6 bg-[var(--bg-card)] rounded-xl border border-[var(--border-subtle)] hover:border-[var(--border-subtle)] transition-all duration-300"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.0 + (index * 0.1), duration: 0.3 }}
              whileHover={{ y: -2 }}
            >
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-4">
                  <div className={`p-3 rounded-lg ${colorClasses}`}>
                    <AutomationIcon className="w-6 h-6" />
                  </div>

                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-1">
                      <h4 className="text-[var(--text-primary)] font-semibold">{automation.name}</h4>
                      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                        automation.status === 'active'
                          ? 'bg-green-500/20 text-green-400'
                          : 'bg-yellow-500/20 text-yellow-400'
                      }`}>
                        {automation.status === 'active' ? 'Activa' : 'Pausada'}
                      </span>
                    </div>
                    <p className="text-[var(--text-secondary)] text-sm">{automation.description}</p>
                  </div>
                </div>

                <motion.button
                  onClick={() => handleToggleAutomation(automation.id)}
                  className={`p-3 rounded-lg transition-colors ${
                    automation.status === 'active'
                      ? 'text-green-400 hover:bg-green-600/20'
                      : 'text-[var(--text-secondary)] hover:bg-[var(--border-subtle)]'
                  }`}
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                >
                  {automation.status === 'active' ? (
                    <PauseIcon className="w-5 h-5" />
                  ) : (
                    <PlayIcon className="w-5 h-5" />
                  )}
                </motion.button>
              </div>

              {/* Triggers and Actions */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <div className="text-sm text-[var(--text-secondary)] mb-2">Triggers:</div>
                  <div className="space-y-1">
                    {automation.triggers.map((trigger, triggerIndex) => (
                      <div key={triggerIndex} className="flex items-center gap-2 text-sm">
                        <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
                        <span className="text-[var(--text-secondary)]">{trigger}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <div className="text-sm text-[var(--text-secondary)] mb-2">Acciones:</div>
                  <div className="space-y-1">
                    {automation.actions.map((action, actionIndex) => (
                      <div key={actionIndex} className="flex items-center gap-2 text-sm">
                        <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                        <span className="text-[var(--text-secondary)]">{action}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Performance */}
              <div className="mt-4 pt-4 border-t border-[var(--border-subtle)]">
                <div className="grid grid-cols-3 gap-4 text-center">
                  <div>
                    <div className="text-lg font-bold text-[var(--text-primary)]">127</div>
                    <div className="text-xs text-[var(--text-secondary)]">Ejecuciones</div>
                  </div>
                  <div>
                    <div className="text-lg font-bold text-green-400">95%</div>
                    <div className="text-xs text-[var(--text-secondary)]">Éxito</div>
                  </div>
                  <div>
                    <div className="text-lg font-bold text-blue-400">2.3s</div>
                    <div className="text-xs text-[var(--text-secondary)]">Tiempo promedio</div>
                  </div>
                </div>
              </div>
            </motion.div>
          )
        })}
      </div>

      {/* AI Insights */}
      <motion.div
        className="mt-6 p-4 bg-gradient-to-r from-emerald-500/10 to-blue-500/10 border border-emerald-500/20 rounded-xl"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1.2, duration: 0.5 }}
      >
        <div className="flex items-center gap-3 mb-3">
          <CurrencyEuroIcon className="w-5 h-5 text-emerald-400" />
          <span className="text-emerald-400 font-semibold">Recomendación IA</span>
        </div>
        <p className="text-[var(--text-secondary)] text-sm">
          Basándome en tus patrones, recomiendo crear una automatización para categorizar gastos de "Viajes y representación"
          automáticamente. Esto reduciría el tiempo de revisión manual en un 40%.
        </p>
        <div className="mt-3 flex gap-3">
          <button className="px-4 py-2 bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-400 hover:text-emerald-300 text-sm rounded-lg transition-colors">
            Crear automatización
          </button>
          <button className="px-4 py-2 bg-[var(--border-subtle)] hover:bg-[var(--border-subtle)] text-[var(--text-secondary)] hover:text-[var(--text-secondary)] text-sm rounded-lg transition-colors">
            Ignorar
          </button>
        </div>
      </motion.div>

      {/* Create Modal Placeholder */}
      {showCreateModal && (
        <motion.div
          className="fixed inset-0 bg-[var(--bg-card)]/40 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.div
            className="bg-[var(--bg-card)] rounded-xl p-6 max-w-md w-full"
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
          >
            <h3 className="text-xl font-bold text-[var(--text-primary)] mb-4">Crear Automatización</h3>
            <p className="text-[var(--text-secondary)] mb-6">
              Esta funcionalidad estará disponible próximamente con el módulo de IA avanzada.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowCreateModal(false)}
                className="flex-1 px-4 py-2 bg-[var(--bg-surface)] hover:bg-[var(--bg-surface)] text-[var(--text-primary)] rounded-lg transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={() => setShowCreateModal(false)}
                className="flex-1 px-4 py-2 bg-emerald-600 hover:bg-emerald-600 text-[var(--text-primary)] rounded-lg transition-colors"
              >
                Crear
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </motion.div>
  )
}