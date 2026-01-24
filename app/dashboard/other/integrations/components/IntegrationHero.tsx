"use client"

import { motion } from "framer-motion"
import { PlusIcon, CogIcon, CheckCircleIcon, SparklesIcon } from "@heroicons/react/24/outline"
import { mockIntegrationStats, formatNumber, formatCurrency } from "../mock"

interface IntegrationHeroProps {
  onAddIntegration: () => void
}

export function IntegrationHero({ onAddIntegration }: IntegrationHeroProps) {
  return (
    <motion.div
      className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-blue-600/10 via-purple-600/10 to-green-600/10 border border-blue-500/20 backdrop-blur-sm"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.1, duration: 0.5 }}
    >
      {/* Background Effects */}
      <div className="absolute inset-0 bg-gradient-to-r from-blue-600/5 to-purple-600/5" />
      <div className="absolute -top-20 -right-20 w-40 h-40 bg-blue-500/20 rounded-full blur-3xl" />
      <div className="absolute -bottom-20 -left-20 w-32 h-32 bg-green-500/20 rounded-full blur-3xl" />

      <div className="relative p-8">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          {/* Left Side */}
          <motion.div
            className="flex items-center gap-4"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3, duration: 0.5 }}
          >
            <div className="relative">
              <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg">
                <span className="text-2xl">🔗</span>
              </div>
              {/* Pulsing indicator */}
              <motion.div
                className="absolute -top-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-gray-900"
                animate={{
                  scale: [1, 1.2, 1],
                  opacity: [1, 0.7, 1]
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
              />
            </div>

            <div>
              <div className="flex items-center gap-3 mb-2">
                <h1 className="text-3xl font-bold bg-gradient-to-r from-white to-purple-200 bg-clip-text text-transparent">
                  Integraciones Empresariales
                </h1>
                <div className="flex items-center gap-2 px-3 py-1 bg-green-500/20 rounded-full border border-green-500/30">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                  <span className="text-sm text-green-400 font-medium">{mockIntegrationStats.totalConnected} Conectadas</span>
                </div>
              </div>

              <p className="text-gray-400 text-lg max-w-2xl">
                Conecta tus herramientas favoritas y automatiza procesos completos.
                Desde pagos hasta marketing, todo integrado en una sola plataforma.
              </p>
            </div>
          </motion.div>

          {/* Right Side */}
          <motion.div
            className="flex flex-col sm:flex-row items-start sm:items-center gap-4"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4, duration: 0.5 }}
          >
            {/* Status Badges */}
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2 px-3 py-2 bg-green-500/10 border border-green-500/20 rounded-lg">
                <CheckCircleIcon className="w-4 h-4 text-green-400" />
                <span className="text-sm text-green-400 font-medium">6 Activas</span>
              </div>
              <div className="flex items-center gap-2 px-3 py-2 bg-purple-500/10 border border-purple-500/20 rounded-lg">
                <SparklesIcon className="w-4 h-4 text-purple-400" />
                <span className="text-sm text-purple-400 font-medium">Recomendadas</span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-3">
              <motion.button
                onClick={() => console.log('Global settings')}
                className="flex items-center gap-2 px-4 py-2 bg-gray-800/50 hover:bg-gray-700/50 border border-gray-600 rounded-xl text-gray-300 hover:text-white transition-colors"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <CogIcon className="w-4 h-4" />
                <span className="hidden sm:inline">Configuración</span>
              </motion.button>

              <motion.button
                onClick={onAddIntegration}
                className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold rounded-xl transition-all duration-300 shadow-lg hover:shadow-purple-500/25"
                whileHover={{ scale: 1.05, y: -2 }}
                whileTap={{ scale: 0.95 }}
              >
                <PlusIcon className="w-5 h-5" />
                Añadir Integración
              </motion.button>
            </div>
          </motion.div>
        </div>

        {/* Bottom Stats Bar */}
        <motion.div
          className="mt-8 grid grid-cols-2 md:grid-cols-4 gap-4"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.5 }}
        >
          <div className="bg-gray-800/30 rounded-xl p-4 text-center">
            <div className="text-2xl font-bold text-green-400 mb-1">
              {formatCurrency(mockIntegrationStats.totalRevenue)}
            </div>
            <div className="text-sm text-gray-400">Ingresos generados</div>
          </div>
          <div className="bg-gray-800/30 rounded-xl p-4 text-center">
            <div className="text-2xl font-bold text-blue-400 mb-1">
              {formatNumber(mockIntegrationStats.totalRequests)}
            </div>
            <div className="text-sm text-gray-400">Total requests</div>
          </div>
          <div className="bg-gray-800/30 rounded-xl p-4 text-center">
            <div className="text-2xl font-bold text-purple-400 mb-1">
              {mockIntegrationStats.avgSuccessRate}%
            </div>
            <div className="text-sm text-gray-400">Tasa éxito</div>
          </div>
          <div className="bg-gray-800/30 rounded-xl p-4 text-center">
            <div className="text-2xl font-bold text-orange-400 mb-1">
              {mockIntegrationStats.topIntegration}
            </div>
            <div className="text-sm text-gray-400">Top integración</div>
          </div>
        </motion.div>
      </div>
    </motion.div>
  )
}