"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import {
  SparklesIcon,
  XMarkIcon,
  ChatBubbleLeftRightIcon,
  CpuChipIcon
} from "@heroicons/react/24/outline"
import { useRouter } from "next/navigation"

export function AiFloatingAssistant() {
  const [isOpen, setIsOpen] = useState(false)
  const [showTooltip, setShowTooltip] = useState(false)
  const router = useRouter()

  // Show tooltip after 3 seconds
  useEffect(() => {
    const timer = setTimeout(() => {
      if (!isOpen) {
        setShowTooltip(true)
        setTimeout(() => setShowTooltip(false), 4000)
      }
    }, 3000)

    return () => clearTimeout(timer)
  }, [isOpen])

  const handleQuickAction = (action: string) => {
    switch (action) {
      case 'chat':
        setIsOpen(true)
        break
      case 'insights':
        router.push('/dashboard/other/ai-assistant?tab=insights')
        setIsOpen(false)
        break
      case 'leads':
        router.push('/dashboard/other/ai-assistant?tab=leads')
        setIsOpen(false)
        break
      default:
        break
    }
  }

  return (
    <>
      {/* Floating Button */}
      <motion.div
        className="fixed bottom-6 right-6 z-50"
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ delay: 1, type: "spring", stiffness: 300 }}
      >
        {/* Tooltip */}
        <AnimatePresence>
          {showTooltip && (
            <motion.div
              className="absolute bottom-full right-0 mb-3 bg-gray-900 text-white px-4 py-2 rounded-lg shadow-lg border border-gray-700 whitespace-nowrap"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
              transition={{ duration: 0.2 }}
            >
              <div className="text-sm font-medium">¿Necesitas ayuda con ventas?</div>
              <div className="absolute top-full right-4 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-900"></div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Main Button */}
        <motion.button
          onClick={() => setIsOpen(!isOpen)}
          className="relative w-14 h-14 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 rounded-full shadow-lg hover:shadow-purple-500/25 flex items-center justify-center text-white transition-all duration-300"
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          animate={isOpen ? { rotate: 45 } : { rotate: 0 }}
        >
          {/* Pulsing background */}
          <motion.div
            className="absolute inset-0 bg-gradient-to-r from-purple-600 to-blue-600 rounded-full"
            animate={{
              scale: [1, 1.2, 1],
              opacity: [0.7, 0.3, 0.7]
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          />

          {/* Icon */}
          <div className="relative z-10">
            {isOpen ? (
              <XMarkIcon className="w-6 h-6" />
            ) : (
              <SparklesIcon className="w-6 h-6" />
            )}
          </div>
        </motion.button>
      </motion.div>

      {/* Expanded Menu */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            className="fixed bottom-24 right-6 z-40"
            initial={{ opacity: 0, scale: 0.8, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: 20 }}
            transition={{ duration: 0.2 }}
          >
            <div className="bg-gray-900/95 backdrop-blur-xl border border-gray-700/50 rounded-2xl p-4 shadow-2xl min-w-[280px]">
              {/* Header */}
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-purple-600/20 rounded-lg">
                  <CpuChipIcon className="w-5 h-5 text-purple-400" />
                </div>
                <div>
                  <div className="text-white font-semibold text-sm">Asistente IA</div>
                  <div className="text-gray-400 text-xs">Listo para ayudar</div>
                </div>
              </div>

              {/* Quick Actions */}
              <div className="space-y-2">
                <motion.button
                  onClick={() => handleQuickAction('chat')}
                  className="w-full flex items-center gap-3 p-3 bg-gray-800/50 hover:bg-gray-700/50 rounded-lg transition-colors text-left"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <ChatBubbleLeftRightIcon className="w-5 h-5 text-blue-400" />
                  <div>
                    <div className="text-white text-sm font-medium">Chat con IA</div>
                    <div className="text-gray-400 text-xs">Pregunta sobre ventas</div>
                  </div>
                </motion.button>

                <motion.button
                  onClick={() => handleQuickAction('insights')}
                  className="w-full flex items-center gap-3 p-3 bg-gray-800/50 hover:bg-gray-700/50 rounded-lg transition-colors text-left"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <SparklesIcon className="w-5 h-5 text-green-400" />
                  <div>
                    <div className="text-white text-sm font-medium">Ver Insights</div>
                    <div className="text-gray-400 text-xs">Análisis inteligente</div>
                  </div>
                </motion.button>

                <motion.button
                  onClick={() => handleQuickAction('leads')}
                  className="w-full flex items-center gap-3 p-3 bg-gray-800/50 hover:bg-gray-700/50 rounded-lg transition-colors text-left"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <ChatBubbleLeftRightIcon className="w-5 h-5 text-orange-400" />
                  <div>
                    <div className="text-white text-sm font-medium">Leads Calientes</div>
                    <div className="text-gray-400 text-xs">Oportunidades urgentes</div>
                  </div>
                </motion.button>
              </div>

              {/* Footer */}
              <div className="mt-4 pt-3 border-t border-gray-700/50">
                <button
                  onClick={() => router.push('/dashboard/other/ai-assistant')}
                  className="w-full text-center text-purple-400 hover:text-purple-300 text-sm font-medium transition-colors"
                >
                  Ver panel completo →
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}