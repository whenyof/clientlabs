"use client"

import { motion } from "framer-motion"
import {
  CpuChipIcon,
  SparklesIcon,
  PlayIcon,
  ArrowPathIcon
} from "@heroicons/react/24/outline"

export function AssistantHeader() {
  const handleForceAnalysis = () => {
    // Mock action
    console.log('Forzando análisis completo...')
  }

  const handleConfigure = () => {
    // Mock action
    console.log('Abriendo configuración...')
  }

  return (
    <motion.div
      className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-purple-600/10 via-blue-600/10 to-purple-600/10 border border-purple-500/20 backdrop-blur-sm"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.1, duration: 0.5 }}
    >
      {/* Background Effects */}
      <div className="absolute inset-0 bg-gradient-to-r from-purple-600/5 to-blue-600/5" />
      <div className="absolute -top-20 -right-20 w-40 h-40 bg-purple-500/20 rounded-full blur-3xl" />
      <div className="absolute -bottom-20 -left-20 w-32 h-32 bg-blue-500/20 rounded-full blur-3xl" />

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
              <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-blue-600 rounded-2xl flex items-center justify-center shadow-lg">
                <CpuChipIcon className="w-8 h-8 text-white" />
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
                  Asistente IA Avanzado
                </h1>
                <div className="flex items-center gap-2 px-3 py-1 bg-green-500/20 rounded-full border border-green-500/30">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                  <span className="text-sm text-green-400 font-medium">IA Activa</span>
                </div>
              </div>

              <p className="text-gray-400 text-lg max-w-2xl">
                Inteligencia artificial especializada en optimizar tus ventas.
                Analiza datos en tiempo real, predice comportamientos y automatiza acciones estratégicas.
              </p>
            </div>
          </motion.div>

          {/* Right Side */}
          <motion.div
            className="flex items-center gap-4"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4, duration: 0.5 }}
          >
            {/* Stats */}
            <div className="hidden lg:flex items-center gap-6">
              <div className="text-center">
                <div className="text-2xl font-bold text-white">89%</div>
                <div className="text-sm text-gray-400">Precisión</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-400">24</div>
                <div className="text-sm text-gray-400">Insights/h</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-400">156</div>
                <div className="text-sm text-gray-400">Automatizaciones</div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-3">
              <motion.button
                onClick={handleForceAnalysis}
                className="flex items-center gap-2 px-4 py-2 bg-gray-800/50 hover:bg-gray-700/50 border border-gray-600 rounded-xl text-gray-300 hover:text-white transition-colors"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <ArrowPathIcon className="w-4 h-4" />
                <span className="hidden sm:inline">Forzar Análisis</span>
              </motion.button>

              <motion.button
                onClick={handleConfigure}
                className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white font-semibold rounded-xl transition-all duration-300 shadow-lg hover:shadow-purple-500/25"
                whileHover={{ scale: 1.05, y: -2 }}
                whileTap={{ scale: 0.95 }}
              >
                <SparklesIcon className="w-5 h-5" />
                Configurar IA
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
            <div className="text-lg font-bold text-white">€45,200</div>
            <div className="text-sm text-gray-400">Ingresos Predichos</div>
          </div>
          <div className="bg-gray-800/30 rounded-xl p-4 text-center">
            <div className="text-lg font-bold text-green-400">12</div>
            <div className="text-sm text-gray-400">Leads Calientes</div>
          </div>
          <div className="bg-gray-800/30 rounded-xl p-4 text-center">
            <div className="text-lg font-bold text-yellow-400">8</div>
            <div className="text-sm text-gray-400">Recomendaciones</div>
          </div>
          <div className="bg-gray-800/30 rounded-xl p-4 text-center">
            <div className="text-lg font-bold text-blue-400">94%</div>
            <div className="text-sm text-gray-400">Tasa Éxito</div>
          </div>
        </motion.div>
      </div>
    </motion.div>
  )
}