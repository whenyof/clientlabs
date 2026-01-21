"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import {
  PlusIcon,
  XMarkIcon,
  EnvelopeIcon,
  ChatBubbleLeftIcon,
  DocumentTextIcon,
  CloudArrowUpIcon,
  WrenchScrewdriverIcon,
  BoltIcon
} from "@heroicons/react/24/outline"

interface AutomationAction {
  id: string
  type: string
  config: Record<string, any>
  order: number
}

interface ActionBuilderProps {
  actions: AutomationAction[]
  onActionsChange: (actions: AutomationAction[]) => void
}

const actionTypes = [
  {
    id: 'email_send',
    name: 'Enviar Email',
    description: 'Envía un email personalizado',
    icon: EnvelopeIcon,
    color: 'from-blue-500 to-cyan-600',
    category: 'communication'
  },
  {
    id: 'whatsapp_message',
    name: 'Mensaje WhatsApp',
    description: 'Envía mensaje por WhatsApp',
    icon: ChatBubbleLeftIcon,
    color: 'from-green-500 to-emerald-600',
    category: 'communication'
  },
  {
    id: 'generate_invoice',
    name: 'Generar Factura',
    description: 'Crea factura automáticamente',
    icon: DocumentTextIcon,
    color: 'from-purple-500 to-indigo-600',
    category: 'business'
  },
  {
    id: 'update_status',
    name: 'Cambiar Estado',
    description: 'Actualiza estado del registro',
    icon: WrenchScrewdriverIcon,
    color: 'from-orange-500 to-amber-600',
    category: 'business'
  },
  {
    id: 'slack_notification',
    name: 'Notificación Slack',
    description: 'Envía mensaje a Slack',
    icon: CloudArrowUpIcon,
    color: 'from-pink-500 to-rose-600',
    category: 'communication'
  },
  {
    id: 'webhook_call',
    name: 'Llamada API',
    description: 'Hace llamada a API externa',
    icon: BoltIcon,
    color: 'from-indigo-500 to-purple-600',
    category: 'integration'
  }
]

export function ActionBuilder({ actions, onActionsChange }: ActionBuilderProps) {
  const [showActionSelector, setShowActionSelector] = useState(false)

  const addAction = (actionType: string) => {
    const newAction: AutomationAction = {
      id: `action-${Date.now()}`,
      type: actionType,
      config: getDefaultConfig(actionType),
      order: actions.length
    }
    onActionsChange([...actions, newAction])
    setShowActionSelector(false)
  }

  const removeAction = (actionId: string) => {
    onActionsChange(actions.filter(action => action.id !== actionId))
  }

  const updateActionConfig = (actionId: string, config: Record<string, any>) => {
    onActionsChange(
      actions.map(action =>
        action.id === actionId
          ? { ...action, config: { ...action.config, ...config } }
          : action
      )
    )
  }

  const getDefaultConfig = (actionType: string) => {
    const defaults: Record<string, Record<string, any>> = {
      email_send: {
        template: 'default',
        subject: 'Notificación automática',
        delay: 0
      },
      whatsapp_message: {
        message: 'Mensaje automático',
        delay: 0
      },
      generate_invoice: {
        template: 'standard',
        dueDays: 30
      },
      update_status: {
        newStatus: 'processed'
      },
      slack_notification: {
        channel: 'general',
        message: 'Notificación automática'
      },
      webhook_call: {
        url: '',
        method: 'POST'
      }
    }
    return defaults[actionType] || {}
  }

  const getActionDisplay = (action: AutomationAction) => {
    const actionType = actionTypes.find(type => type.id === action.type)
    if (!actionType) return { name: action.type, icon: BoltIcon, color: 'from-gray-500 to-slate-600' }

    return {
      name: actionType.name,
      icon: actionType.icon,
      color: actionType.color
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-white mb-2">
          ¿Qué acciones ejecutar?
        </h3>
        <p className="text-gray-400 text-sm">
          Arrastra y configura las acciones que se ejecutarán automáticamente
        </p>
      </div>

      {/* Actions List */}
      <div className="space-y-4">
        {actions.map((action, index) => {
          const display = getActionDisplay(action)
          const Icon = display.icon

          return (
            <motion.div
              key={action.id}
              className="bg-gray-800/50 border border-gray-700/50 rounded-xl p-4"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ delay: index * 0.1 }}
            >
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-4">
                  <div className={`p-2 rounded-lg bg-gradient-to-br ${display.color}`}>
                    <Icon className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h4 className="text-white font-medium">{display.name}</h4>
                    <p className="text-gray-400 text-sm">Acción {index + 1}</p>
                  </div>
                </div>

                <button
                  onClick={() => removeAction(action.id)}
                  className="p-2 text-gray-400 hover:text-red-400 hover:bg-red-600/20 rounded-lg transition-colors"
                >
                  <XMarkIcon className="w-4 h-4" />
                </button>
              </div>

              {/* Action Config */}
              <div className="space-y-3">
                {action.type === 'email_send' && (
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs text-gray-400 mb-1">Asunto</label>
                      <input
                        type="text"
                        value={action.config.subject || ''}
                        onChange={(e) => updateActionConfig(action.id, { subject: e.target.value })}
                        className="w-full px-2 py-1 bg-gray-700/50 border border-gray-600 rounded text-white text-sm focus:outline-none focus:ring-1 focus:ring-purple-500"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-gray-400 mb-1">Retraso (horas)</label>
                      <input
                        type="number"
                        value={action.config.delay || 0}
                        onChange={(e) => updateActionConfig(action.id, { delay: parseInt(e.target.value) })}
                        className="w-full px-2 py-1 bg-gray-700/50 border border-gray-600 rounded text-white text-sm focus:outline-none focus:ring-1 focus:ring-purple-500"
                      />
                    </div>
                  </div>
                )}

                {action.type === 'whatsapp_message' && (
                  <div>
                    <label className="block text-xs text-gray-400 mb-1">Mensaje</label>
                    <textarea
                      value={action.config.message || ''}
                      onChange={(e) => updateActionConfig(action.id, { message: e.target.value })}
                      rows={2}
                      className="w-full px-2 py-1 bg-gray-700/50 border border-gray-600 rounded text-white text-sm focus:outline-none focus:ring-1 focus:ring-purple-500 resize-none"
                    />
                  </div>
                )}

                {action.type === 'slack_notification' && (
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs text-gray-400 mb-1">Canal</label>
                      <input
                        type="text"
                        value={action.config.channel || ''}
                        onChange={(e) => updateActionConfig(action.id, { channel: e.target.value })}
                        placeholder="#general"
                        className="w-full px-2 py-1 bg-gray-700/50 border border-gray-600 rounded text-white text-sm focus:outline-none focus:ring-1 focus:ring-purple-500"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-gray-400 mb-1">Mensaje</label>
                      <input
                        type="text"
                        value={action.config.message || ''}
                        onChange={(e) => updateActionConfig(action.id, { message: e.target.value })}
                        className="w-full px-2 py-1 bg-gray-700/50 border border-gray-600 rounded text-white text-sm focus:outline-none focus:ring-1 focus:ring-purple-500"
                      />
                    </div>
                  </div>
                )}

                {action.type === 'webhook_call' && (
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs text-gray-400 mb-1">URL</label>
                      <input
                        type="url"
                        value={action.config.url || ''}
                        onChange={(e) => updateActionConfig(action.id, { url: e.target.value })}
                        placeholder="https://api.example.com/webhook"
                        className="w-full px-2 py-1 bg-gray-700/50 border border-gray-600 rounded text-white text-sm focus:outline-none focus:ring-1 focus:ring-purple-500"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-gray-400 mb-1">Método</label>
                      <select
                        value={action.config.method || 'POST'}
                        onChange={(e) => updateActionConfig(action.id, { method: e.target.value })}
                        className="w-full px-2 py-1 bg-gray-700/50 border border-gray-600 rounded text-white text-sm focus:outline-none focus:ring-1 focus:ring-purple-500"
                      >
                        <option value="GET">GET</option>
                        <option value="POST">POST</option>
                        <option value="PUT">PUT</option>
                        <option value="PATCH">PATCH</option>
                      </select>
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          )
        })}
      </div>

      {/* Add Action Button */}
      <motion.button
        onClick={() => setShowActionSelector(!showActionSelector)}
        className="w-full flex items-center justify-center gap-3 p-4 bg-gray-800/30 hover:bg-gray-700/30 border border-gray-600/30 hover:border-purple-500/50 rounded-xl transition-all duration-300 group"
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
      >
        <PlusIcon className="w-5 h-5 text-purple-400 group-hover:text-purple-300" />
        <span className="text-white font-medium">Añadir Acción</span>
      </motion.button>

      {/* Action Selector */}
      <AnimatePresence>
        {showActionSelector && (
          <motion.div
            className="grid grid-cols-1 md:grid-cols-2 gap-4"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
          >
            {actionTypes.map((actionType) => {
              const Icon = actionType.icon

              return (
                <motion.button
                  key={actionType.id}
                  onClick={() => addAction(actionType.id)}
                  className="flex items-start gap-3 p-4 bg-gray-800/50 hover:bg-gray-700/50 border border-gray-700/50 rounded-xl transition-colors group"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <div className={`p-2 rounded-lg bg-gradient-to-br ${actionType.color} flex-shrink-0`}>
                    <Icon className="w-5 h-5 text-white" />
                  </div>

                  <div className="text-left">
                    <h4 className="text-white font-medium mb-1 group-hover:text-purple-400">
                      {actionType.name}
                    </h4>
                    <p className="text-gray-400 text-sm">
                      {actionType.description}
                    </p>
                  </div>
                </motion.button>
              )
            })}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}