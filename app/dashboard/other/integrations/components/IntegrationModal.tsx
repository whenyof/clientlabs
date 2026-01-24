"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { XMarkIcon, KeyIcon, CogIcon, ArrowPathIcon } from "@heroicons/react/24/outline"

interface IntegrationModalProps {
  integration: any
  isOpen: boolean
  onClose: () => void
}

export function IntegrationModal({ integration, isOpen, onClose }: IntegrationModalProps) {
  const [activeTab, setActiveTab] = useState<'connect' | 'configure' | 'logs'>('connect')
  const [apiKey, setApiKey] = useState('')
  const [webhookUrl, setWebhookUrl] = useState('')

  if (!integration) return null

  const handleConnect = () => {
    console.log('Connecting to:', integration.name)
    onClose()
  }

  const handleDisconnect = () => {
    console.log('Disconnecting from:', integration.name)
    onClose()
  }

  const handleSaveConfig = () => {
    console.log('Saving config for:', integration.name)
    onClose()
  }

  const renderContent = () => {
    switch (activeTab) {
      case 'connect':
        return (
          <div className="space-y-6">
            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-blue-600 rounded-2xl flex items-center justify-center text-2xl mx-auto mb-4">
                {integration.logo}
              </div>
              <h3 className="text-xl font-bold text-white mb-2">
                {integration.action === 'add' ? 'Añadir Integración' : `Configurar ${integration.name}`}
              </h3>
              <p className="text-gray-400">
                {integration.description}
              </p>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">
                  API Key
                </label>
                <div className="relative">
                  <KeyIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="password"
                    value={apiKey}
                    onChange={(e) => setApiKey(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 bg-gray-800 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
                    placeholder="Ingresa tu API key"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">
                  Webhook URL (opcional)
                </label>
                <input
                  type="url"
                  value={webhookUrl}
                  onChange={(e) => setWebhookUrl(e.target.value)}
                  className="w-full px-4 py-3 bg-gray-800 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
                  placeholder="https://tuapp.com/webhook"
                />
              </div>
            </div>

            <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-4">
              <h4 className="text-blue-400 font-medium mb-2">Permisos requeridos</h4>
              <ul className="text-sm text-gray-400 space-y-1">
                <li>• Lectura de datos</li>
                <li>• Envío de webhooks</li>
                <li>• Sincronización automática</li>
              </ul>
            </div>

            <div className="flex gap-3">
              <button
                onClick={onClose}
                className="flex-1 px-4 py-3 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={handleConnect}
                className="flex-1 px-4 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors"
              >
                {integration.action === 'connect' ? 'Conectar' : 'Añadir Integración'}
              </button>
            </div>
          </div>
        )

      case 'configure':
        return (
          <div className="space-y-6">
            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-blue-600 rounded-2xl flex items-center justify-center text-2xl mx-auto mb-4">
                {integration.logo}
              </div>
              <h3 className="text-xl font-bold text-white mb-2">
                Configuración de {integration.name}
              </h3>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">
                  Frecuencia de sincronización
                </label>
                <select className="w-full px-4 py-3 bg-gray-800 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500">
                  <option value="realtime">Tiempo real</option>
                  <option value="hourly">Cada hora</option>
                  <option value="daily">Diario</option>
                  <option value="weekly">Semanal</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">
                  Notificaciones
                </label>
                <div className="space-y-2">
                  <label className="flex items-center">
                    <input type="checkbox" className="mr-2" defaultChecked />
                    <span className="text-sm text-gray-300">Errores de sincronización</span>
                  </label>
                  <label className="flex items-center">
                    <input type="checkbox" className="mr-2" defaultChecked />
                    <span className="text-sm text-gray-300">Cambios importantes</span>
                  </label>
                  <label className="flex items-center">
                    <input type="checkbox" className="mr-2" />
                    <span className="text-sm text-gray-300">Reportes semanales</span>
                  </label>
                </div>
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={onClose}
                className="flex-1 px-4 py-3 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={handleSaveConfig}
                className="flex-1 px-4 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors"
              >
                Guardar Configuración
              </button>
            </div>
          </div>
        )

      case 'logs':
        return (
          <div className="space-y-6">
            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-blue-600 rounded-2xl flex items-center justify-center text-2xl mx-auto mb-4">
                {integration.logo}
              </div>
              <h3 className="text-xl font-bold text-white mb-2">
                Logs de {integration.name}
              </h3>
            </div>

            <div className="max-h-64 overflow-y-auto space-y-3">
              <div className="p-3 bg-green-500/10 border border-green-500/20 rounded-lg">
                <div className="flex items-center justify-between">
                  <span className="text-green-400 text-sm font-medium">Sincronización exitosa</span>
                  <span className="text-xs text-gray-400">Hace 5 min</span>
                </div>
                <div className="text-xs text-gray-400 mt-1">25 registros sincronizados</div>
              </div>

              <div className="p-3 bg-blue-500/10 border border-blue-500/20 rounded-lg">
                <div className="flex items-center justify-between">
                  <span className="text-blue-400 text-sm font-medium">Webhook recibido</span>
                  <span className="text-xs text-gray-400">Hace 1h</span>
                </div>
                <div className="text-xs text-gray-400 mt-1">Pago confirmado - €250.00</div>
              </div>

              <div className="p-3 bg-orange-500/10 border border-orange-500/20 rounded-lg">
                <div className="flex items-center justify-between">
                  <span className="text-orange-400 text-sm font-medium">Error temporal</span>
                  <span className="text-xs text-gray-400">Hace 2h</span>
                </div>
                <div className="text-xs text-gray-400 mt-1">Rate limit excedido - reintentando automáticamente</div>
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setActiveTab('connect')}
                className="flex-1 px-4 py-3 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors"
              >
                Configurar
              </button>
              <button
                onClick={onClose}
                className="flex-1 px-4 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors"
              >
                Cerrar
              </button>
            </div>
          </div>
        )

      default:
        return null
    }
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />

          {/* Modal */}
          <motion.div
            className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-gray-900 rounded-2xl border border-gray-700 shadow-2xl z-50 w-full max-w-md"
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            {/* Tabs */}
            {integration.status === 'connected' && (
              <div className="flex border-b border-gray-700">
                <button
                  onClick={() => setActiveTab('connect')}
                  className={`flex-1 py-3 px-4 text-sm font-medium transition-colors ${
                    activeTab === 'connect' ? 'text-purple-400 border-b-2 border-purple-400' : 'text-gray-400 hover:text-white'
                  }`}
                >
                  Conectar
                </button>
                <button
                  onClick={() => setActiveTab('configure')}
                  className={`flex-1 py-3 px-4 text-sm font-medium transition-colors ${
                    activeTab === 'configure' ? 'text-purple-400 border-b-2 border-purple-400' : 'text-gray-400 hover:text-white'
                  }`}
                >
                  Configurar
                </button>
                <button
                  onClick={() => setActiveTab('logs')}
                  className={`flex-1 py-3 px-4 text-sm font-medium transition-colors ${
                    activeTab === 'logs' ? 'text-purple-400 border-b-2 border-purple-400' : 'text-gray-400 hover:text-white'
                  }`}
                >
                  Logs
                </button>
              </div>
            )}

            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <div></div>
                <button
                  onClick={onClose}
                  className="p-2 text-gray-400 hover:text-white hover:bg-gray-800 rounded-lg transition-colors"
                >
                  <XMarkIcon className="w-5 h-5" />
                </button>
              </div>

              {renderContent()}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}