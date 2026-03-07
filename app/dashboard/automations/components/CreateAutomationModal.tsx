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
            className="fixed inset-0 bg-[var(--bg-card)]/40 backdrop-blur-sm"
            onClick={onClose}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          />

          {/* Modal */}
          <motion.div
            className="relative w-full max-w-2xl bg-[var(--bg-card)] rounded-xl border border-[var(--border-subtle)] shadow-[var(--shadow-card)] max-h-[90vh] overflow-hidden"
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ duration: 0.3 }}
          >
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-[var(--border-subtle)]">
              <div>
                <h2 className="text-xl font-bold text-[var(--text-primary)]">
                  Crear Automatización
                </h2>
                <p className="text-[var(--text-secondary)] text-sm">
                  Construye flujos inteligentes para automatizar tu negocio
                </p>
              </div>
              <button
                onClick={onClose}
                className="p-2 text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-main)] rounded-lg transition-colors"
              >
                <XMarkIcon className="w-5 h-5" />
              </button>
            </div>

            {/* Content */}
            <div className="p-6">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1">
                    Nombre *
                  </label>
                  <input
                    type="text"
                    value={automation.name}
                    onChange={(e) => setAutomation(prev => ({ ...prev, name: e.target.value }))}
                    className="w-full px-3 py-2 bg-[var(--bg-main)] border border-[var(--border-subtle)] rounded-lg text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                    placeholder="Ej: Lead → WhatsApp Automático"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1">
                    Descripción
                  </label>
                  <textarea
                    value={automation.description}
                    onChange={(e) => setAutomation(prev => ({ ...prev, description: e.target.value }))}
                    rows={3}
                    className="w-full px-3 py-2 bg-[var(--bg-main)] border border-[var(--border-subtle)] rounded-lg text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent resize-none"
                    placeholder="Describe qué hace esta automatización..."
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1">
                    Trigger
                  </label>
                  <select
                    value={automation.triggerType}
                    onChange={(e) => setAutomation(prev => ({ ...prev, triggerType: e.target.value }))}
                    className="w-full px-3 py-2 bg-[var(--bg-main)] border border-[var(--border-subtle)] rounded-lg text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
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
            <div className="flex items-center justify-end gap-4 p-6 border-t border-[var(--border-subtle)]">
              <button
                onClick={onClose}
                className="px-4 py-2 text-[var(--text-secondary)] hover:text-[var(--text-primary)] border border-[var(--border-subtle)] rounded-lg hover:bg-[var(--bg-surface)] transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={handleSave}
                disabled={!automation.name || !automation.triggerType}
                className="px-6 py-2 bg-emerald-500 hover:bg-emerald-600 disabled:bg-[var(--bg-surface)] disabled:cursor-not-allowed text-white font-semibold rounded-lg transition-all duration-300 shadow-[0_0_40px_rgba(16,185,129,0.25)]"
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