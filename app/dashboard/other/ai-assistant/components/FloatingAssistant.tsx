"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { useRouter } from "next/navigation"

export function AiFloatingAssistant() {
  const [isOpen, setIsOpen] = useState(false)
  const router = useRouter()

  const quickActions = [
    {
      id: 'leads',
      label: 'Leads Calientes',
      action: () => {
        router.push('/dashboard/other/ai-assistant?tab=leads')
        setIsOpen(false)
      }
    },
    {
      id: 'insights',
      label: 'Ver Insights',
      action: () => {
        router.push('/dashboard/other/ai-assistant?tab=insights')
        setIsOpen(false)
      }
    },
    {
      id: 'chat',
      label: 'Chat Completo',
      action: () => {
        router.push('/dashboard/other/ai-assistant?tab=chat')
        setIsOpen(false)
      }
    }
  ]

  return (
    <>
      <motion.div
        className="fixed bottom-6 right-6 z-50"
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ delay: 2, type: "spring", stiffness: 300 }}
      >
        <motion.button
          onClick={() => setIsOpen(!isOpen)}
          className="relative w-14 h-14 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 rounded-full shadow-lg hover:shadow-purple-500/25 flex items-center justify-center text-white transition-all duration-300"
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          animate={isOpen ? { rotate: 45 } : { rotate: 0 }}
        >
          <div className="relative z-10">
            {isOpen ? (
              <span className="text-xl">✕</span>
            ) : (
              <span className="text-xl">⚡</span>
            )}
          </div>
        </motion.button>
      </motion.div>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            className="fixed bottom-24 right-6 z-40"
            initial={{ opacity: 0, scale: 0.8, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: 20 }}
            transition={{ duration: 0.2 }}
          >
            <div className="bg-gray-900/95 backdrop-blur-xl border border-gray-700/50 rounded-2xl shadow-2xl min-w-[300px]">
              <div className="p-4 border-b border-gray-700/50">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-purple-600/20 rounded-lg">
                    <span className="text-purple-400 text-lg">⚡</span>
                  </div>
                  <div className="flex-1">
                    <div className="text-white font-semibold text-sm">Asistente IA</div>
                    <div className="text-gray-400 text-xs">Siempre disponible</div>
                  </div>
                </div>
              </div>

              <div className="p-4 border-b border-gray-700/50">
                <div className="grid grid-cols-1 gap-2">
                  {quickActions.map((action, index) => (
                    <motion.button
                      key={action.id}
                      onClick={action.action}
                      className="flex items-center gap-2 p-3 bg-gray-800/50 hover:bg-gray-700/50 rounded-lg transition-colors text-left"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1, duration: 0.3 }}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <span className="text-purple-400">💡</span>
                      <span className="text-white text-sm">{action.label}</span>
                    </motion.button>
                  ))}
                </div>
              </div>

              <div className="p-4 border-t border-gray-700/50 bg-gray-800/30">
                <button
                  onClick={() => router.push('/dashboard/other/ai-assistant')}
                  className="w-full text-center text-purple-400 hover:text-purple-300 text-sm font-medium transition-colors"
                >
                  Abrir panel completo →
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}