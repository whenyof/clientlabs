"use client"

import { useState } from "react"
import { XMarkIcon, PlusIcon } from "@heroicons/react/24/outline"
import { motion, AnimatePresence } from "framer-motion"

interface AutomationAction {
  id: string
  type: string
  config: Record<string, any>
  order: number
}

interface CreateAutomationModalProps {
  onClose: () => void
}

export function CreateAutomationModal({ onClose }: CreateAutomationModalProps) {
  const [automation, setAutomation] = useState({
    name: '',
    description: '',
    triggerType: '',
    triggerConfig: {},
    actions: [] as AutomationAction[]
  })

  const handleSave = () => {
    console.log('Guardando automatización:', automation)
    onClose()
  }

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 z-50 overflow-y-auto"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      >
        <div className="flex min-h-screen items-center justify-center p-4">
          {/* Backdrop */}
          <motion.div
            className="fixed inset-0 bg-black/50 backdrop-blur-sm"
            onClick={onClose}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          />

          {/* Modal */}
          <motion.div
            className="relative w-full max-w-2xl bg-gray-900 rounded-2xl border border-gray-700 shadow-2xl max-h-[90vh] overflow-hidden"
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ duration: 0.3 }}
          >
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-700">
              <div>
                <h2 className="text-xl font-bold text-white">
                  Crear Automatización
                </h2>
                <p className="text-gray-400 text-sm">
                  Construye flujos inteligentes para automatizar tu negocio
                </p>
              </div>
              <button
                onClick={onClose}
                className="p-2 text-gray-400 hover:text-white hover:bg-gray-800 rounded-lg transition-colors"
              >
                <XMarkIcon className="w-5 h-5" />
              </button>
            </div>

            {/* Content */}
            <div className="p-6">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-1">
                    Nombre *
                  </label>
                  <input
                    type="text"
                    value={automation.name}
                    onChange={(e) => setAutomation(prev => ({ ...prev, name: e.target.value }))}
                    className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    placeholder="Ej: Lead → WhatsApp Automático"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-1">
                    Descripción
                  </label>
                  <textarea
                    value={automation.description}
                    onChange={(e) => setAutomation(prev => ({ ...prev, description: e.target.value }))}
                    rows={3}
                    className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none"
                    placeholder="Describe qué hace esta automatización..."
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-1">
                    Trigger
                  </label>
                  <select
                    value={automation.triggerType}
                    onChange={(e) => setAutomation(prev => ({ ...prev, triggerType: e.target.value }))}
                    className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  >
                    <option value="">Seleccionar trigger</option>
                    <option value="new_lead">Nuevo Lead</option>
                    <option value="client_won">Cliente Ganado</option>
                    <option value="cart_abandoned">Carrito Abandonado</option>
                    <option value="new_order">Nuevo Pedido</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="flex items-center justify-end gap-4 p-6 border-t border-gray-700">
              <button
                onClick={onClose}
                className="px-4 py-2 text-gray-400 hover:text-white border border-gray-600 rounded-lg hover:bg-gray-700 transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={handleSave}
                disabled={!automation.name || !automation.triggerType}
                className="px-6 py-2 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white font-semibold rounded-lg transition-all duration-300 shadow-lg hover:shadow-purple-500/25"
              >
                Crear Automatización
              </button>
            </div>
          </motion.div>
        </div>
      </motion.div>
    </AnimatePresence>
  )
}