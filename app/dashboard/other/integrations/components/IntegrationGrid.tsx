// @ts-nocheck
"use client"

import { motion } from "framer-motion"
import {
  CheckCircleIcon,
  XCircleIcon,
  ExclamationTriangleIcon,
  ClockIcon,
  CogIcon,
  ChartBarIcon,
  ArrowRightIcon,
  BoltIcon
} from "@heroicons/react/24/outline"

interface IntegrationGridProps {
  selectedCategory: string
  onIntegrationAction: (integration: any, action: string) => void
  integrations?: Array<{ id: string; name: string; provider: string; status: string; category?: string; lastSync?: string }>
}

function getStatusColor(s: string) {
  return s === 'connected' ? 'bg-green-500/20 text-green-400' : s === 'error' ? 'bg-red-500/20 text-red-400' : s === 'pending' ? 'bg-yellow-500/20 text-yellow-400' : 'bg-gray-500/20 text-gray-400'
}
function getStatusText(s: string) {
  return s === 'connected' ? 'Conectada' : s === 'disconnected' ? 'Desconectada' : s === 'error' ? 'Error' : 'Pendiente'
}
const formatNumber = (n: number) => n.toLocaleString('es-ES')
const formatCurrency = (n: number) => '€' + (n ?? 0).toLocaleString('es-ES')

export function IntegrationGrid({ selectedCategory, onIntegrationAction, integrations = [] }: IntegrationGridProps) {
  const list = integrations as Array<{ id: string; name: string; provider: string; status: string; category?: string }>
  const filteredIntegrations = selectedCategory === 'all'
    ? list
    : list.filter(integration => (integration.category || '') === selectedCategory)

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'connected':
        return CheckCircleIcon
      case 'disconnected':
        return XCircleIcon
      case 'error':
        return ExclamationTriangleIcon
      case 'pending':
        return ClockIcon
      default:
        return XCircleIcon
    }
  }

  const getActionButtons = (integration: any) => {
    switch (integration.status) {
      case 'connected':
        return (
          <>
            <motion.button
              onClick={() => onIntegrationAction(integration, 'configure')}
              className="flex items-center gap-2 px-3 py-2 bg-blue-500/20 hover:bg-blue-500/30 text-blue-400 hover:text-blue-300 rounded-lg transition-colors text-sm"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <CogIcon className="w-4 h-4" />
              Configurar
            </motion.button>
            <motion.button
              onClick={() => onIntegrationAction(integration, 'logs')}
              className="flex items-center gap-2 px-3 py-2 bg-gray-500/20 hover:bg-gray-500/30 text-gray-400 hover:text-gray-300 rounded-lg transition-colors text-sm"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <ChartBarIcon className="w-4 h-4" />
              Logs
            </motion.button>
            <motion.button
              onClick={() => onIntegrationAction(integration, 'disconnect')}
              className="flex items-center gap-2 px-3 py-2 bg-red-500/20 hover:bg-red-500/30 text-red-400 hover:text-red-300 rounded-lg transition-colors text-sm"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              Desconectar
            </motion.button>
          </>
        )
      case 'disconnected':
        return (
          <motion.button
            onClick={() => onIntegrationAction(integration, 'connect')}
            className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors text-sm font-medium"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <CheckCircleIcon className="w-4 h-4" />
            Conectar
          </motion.button>
        )
      case 'error':
        return (
          <>
            <motion.button
              onClick={() => onIntegrationAction(integration, 'retry')}
              className="flex items-center gap-2 px-3 py-2 bg-orange-500/20 hover:bg-orange-500/30 text-orange-400 hover:text-orange-300 rounded-lg transition-colors text-sm"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <ArrowRightIcon className="w-4 h-4" />
              Reintentar
            </motion.button>
            <motion.button
              onClick={() => onIntegrationAction(integration, 'logs')}
              className="flex items-center gap-2 px-3 py-2 bg-gray-500/20 hover:bg-gray-500/30 text-gray-400 hover:text-gray-300 rounded-lg transition-colors text-sm"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <ChartBarIcon className="w-4 h-4" />
              Logs
            </motion.button>
          </>
        )
      case 'pending':
        return (
          <div className="flex items-center gap-2 px-4 py-2 bg-yellow-500/20 text-yellow-400 rounded-lg text-sm">
            <BoltIcon className="w-4 h-4 animate-pulse" />
            Configurando...
          </div>
        )
      default:
        return null
    }
  }

  return (
    <motion.div
      className="space-y-6"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2, duration: 0.5 }}
    >
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-2xl font-bold text-white mb-2">
            Integraciones Disponibles
          </h3>
          <p className="text-gray-400">
            {filteredIntegrations.length} integraciones encontradas
          </p>
          {filteredIntegrations.length === 0 && (
            <p className="text-white/60 text-sm mt-2">Conecta integraciones desde el panel para verlas aquí.</p>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredIntegrations.map((integration, index) => {
          const StatusIcon = getStatusIcon(integration.status)

          return (
            <motion.div
              key={integration.id}
              className="bg-gray-800/50 backdrop-blur-sm rounded-2xl border border-gray-700/50 p-6 hover:border-gray-600/50 transition-all duration-300 group"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 + (index * 0.1), duration: 0.5 }}
              whileHover={{ y: -2 }}
            >
              {/* Header */}
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-blue-600 rounded-xl flex items-center justify-center text-xl shadow-lg">
                    {integration.logo}
                  </div>
                  <div>
                    <h4 className="text-lg font-semibold text-white">{integration.name}</h4>
                    <div className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(integration.status)}`}>
                      <StatusIcon className="w-3 h-3 mr-1" />
                      {getStatusText(integration.status)}
                    </div>
                  </div>
                </div>
              </div>

              {/* Description */}
              <p className="text-gray-400 text-sm mb-4 leading-relaxed">
                {integration.description}
              </p>

              {/* Features */}
              <div className="mb-4">
                <div className="flex flex-wrap gap-1">
                  {integration.features.slice(0, 2).map((feature, featureIndex) => (
                    <span
                      key={featureIndex}
                      className="px-2 py-1 bg-purple-500/10 text-purple-400 text-xs rounded-full"
                    >
                      {feature}
                    </span>
                  ))}
                  {integration.features.length > 2 && (
                    <span className="px-2 py-1 bg-gray-500/10 text-gray-400 text-xs rounded-full">
                      +{integration.features.length - 2} más
                    </span>
                  )}
                </div>
              </div>

              {/* Usage Stats */}
              {integration.status === 'connected' && (
                <div className="grid grid-cols-2 gap-4 mb-4 p-3 bg-gray-900/50 rounded-lg">
                  <div>
                    <div className="text-xs text-gray-400">Requests</div>
                    <div className="text-sm font-semibold text-white">
                      {formatNumber((integration as any).usage?.requests ?? 0)}
                    </div>
                  </div>
                  <div>
                    <div className="text-xs text-gray-400">Revenue</div>
                    <div className="text-sm font-semibold text-green-400">
                      {formatCurrency((integration as any).usage?.revenue ?? 0)}
                    </div>
                  </div>
                </div>
              )}

              {/* Error Message */}
              {integration.status === 'error' && integration.errorMessage && (
                <div className="mb-4 p-3 bg-red-500/10 border border-red-500/20 rounded-lg">
                  <div className="text-xs text-red-400 font-medium mb-1">Error de conexión</div>
                  <div className="text-xs text-gray-400">{integration.errorMessage}</div>
                </div>
              )}

              {/* Last Sync */}
              {integration.lastSync && (
                <div className="text-xs text-gray-500 mb-4">
                  Última sincronización: {new Date(integration.lastSync).toLocaleDateString('es-ES')}
                </div>
              )}

              {/* Actions */}
              <div className="flex flex-wrap gap-2">
                {getActionButtons(integration)}
              </div>
            </motion.div>
          )
        })}
      </div>

      {filteredIntegrations.length === 0 && (
        <motion.div
          className="text-center py-12 bg-gray-800/30 rounded-2xl border border-gray-700/30"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
        >
          <div className="text-6xl mb-4">🔍</div>
          <h4 className="text-lg font-medium text-gray-400 mb-2">
            No se encontraron integraciones
          </h4>
          <p className="text-gray-500">
            No hay integraciones disponibles en esta categoría.
          </p>
        </motion.div>
      )}
    </motion.div>
  )
}