"use client"

import { motion } from "framer-motion"
import { ArrowRightIcon } from "@heroicons/react/24/outline"

interface Automation {
  name: string
  triggerType: string
  actions: Array<{ type: string }>
}

interface AutomationFlowProps {
  automation: Automation
}

const triggerLabels: Record<string, string> = {
  new_lead: 'Nuevo Lead',
  client_won: 'Cliente Ganado',
  cart_abandoned: 'Carrito Abandonado',
  call_completed: 'Llamada Finalizada',
  new_order: 'Nuevo Pedido',
  new_ticket: 'Nuevo Ticket',
  scheduled: 'Programado',
  webhook: 'Webhook'
}

const actionLabels: Record<string, string> = {
  email_send: '📧 Email',
  whatsapp_message: '💬 WhatsApp',
  generate_invoice: '📄 Factura',
  update_status: '🔄 Estado',
  slack_notification: '💬 Slack',
  webhook_call: '🌐 API'
}

export function AutomationFlow({ automation }: AutomationFlowProps) {
  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-white mb-2">
          Flujo de Automatización
        </h3>
        <p className="text-gray-400 text-sm">
          Vista previa del flujo que se ejecutará
        </p>
      </div>

      {/* Visual Flow */}
      <div className="bg-gray-800/50 rounded-xl p-6 border border-gray-700/50">
        <div className="flex flex-col md:flex-row items-center justify-center gap-4 md:gap-8">
          {/* Trigger */}
          <motion.div
            className="flex flex-col items-center"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.1 }}
          >
            <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-cyan-600 rounded-full flex items-center justify-center mb-3 shadow-lg">
              <span className="text-2xl">⚡</span>
            </div>
            <div className="text-center">
              <div className="text-white font-medium text-sm mb-1">Trigger</div>
              <div className="text-gray-400 text-xs">
                {triggerLabels[automation.triggerType] || automation.triggerType}
              </div>
            </div>
          </motion.div>

          {/* Arrow */}
          <motion.div
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.3 }}
          >
            <ArrowRightIcon className="w-6 h-6 text-purple-400 hidden md:block" />
            <div className="w-px h-8 bg-purple-400 md:hidden"></div>
          </motion.div>

          {/* Actions */}
          <div className="flex flex-wrap gap-4 justify-center">
            {automation.actions.map((action, index) => (
              <motion.div
                key={index}
                className="flex flex-col items-center"
                initial={{ opacity: 0, scale: 0.8, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                transition={{ delay: 0.5 + (index * 0.1) }}
              >
                <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-lg flex items-center justify-center mb-2 shadow-lg">
                  <span className="text-lg">
                    {actionLabels[action.type]?.split(' ')[0] || '⚙️'}
                  </span>
                </div>
                <div className="text-center">
                  <div className="text-white font-medium text-xs">
                    {actionLabels[action.type]?.split(' ')[1] || action.type}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Flow Summary */}
        <motion.div
          className="mt-6 p-4 bg-gray-700/30 rounded-lg"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
        >
          <div className="text-center text-sm">
            <span className="text-gray-400">Flujo: </span>
            <span className="text-white font-medium">
              {triggerLabels[automation.triggerType] || automation.triggerType}
            </span>
            <span className="text-gray-400 mx-2">→</span>
            <span className="text-white font-medium">
              {automation.actions.length} acción{automation.actions.length !== 1 ? 'es' : ''}
            </span>
          </div>
        </motion.div>
      </div>

      {/* Action Details */}
      {automation.actions.length > 0 && (
        <motion.div
          className="space-y-3"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.0 }}
        >
          <h4 className="text-white font-medium">Acciones Configuradas:</h4>
          <div className="space-y-2">
            {automation.actions.map((action, index) => (
              <motion.div
                key={index}
                className="flex items-center gap-3 p-3 bg-gray-800/30 rounded-lg"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 1.1 + (index * 0.1) }}
              >
                <span className="text-lg">
                  {actionLabels[action.type]?.split(' ')[0] || '⚙️'}
                </span>
                <span className="text-white text-sm">
                  {actionLabels[action.type]?.substring(2) || action.type}
                </span>
                <span className="text-gray-400 text-xs ml-auto">
                  Acción {index + 1}
                </span>
              </motion.div>
            ))}
          </div>
        </motion.div>
      )}
    </div>
  )
}