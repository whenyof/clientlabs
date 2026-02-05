"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import {
  SparklesIcon,
  XMarkIcon,
  ChatBubbleLeftRightIcon,
  CpuChipIcon,
  BellIcon,
  LightBulbIcon
} from "@heroicons/react/24/outline"
import { useRouter, usePathname } from "next/navigation"
import { useAssistant } from "@/context/AssistantContext"
import { cn } from "@/lib/utils"

export function AiFloatingAssistant() {
  const [isOpen, setIsOpen] = useState(false)
  const [showTooltip, setShowTooltip] = useState(false)
  const router = useRouter()
  const pathname = usePathname()
  const { suggestions } = useAssistant()
  const [position, setPosition] = useState({ x: 0, y: 0 })

  useEffect(() => {
    const saved = localStorage.getItem("ai-assistant-pos")
    if (saved) {
      try {
        const parsed = JSON.parse(saved)
        setPosition(parsed)
      } catch (e) {
        // ignore error
      }
    }
  }, [])

  // Only show in dashboard routes
  const isDashboard = pathname?.startsWith("/dashboard")

  // Show tooltip after 3 seconds if not in dashboard? 
  // User says only visible in dashboard.
  useEffect(() => {
    if (!isDashboard) return;

    const timer = setTimeout(() => {
      if (!isOpen) {
        setShowTooltip(true)
        setTimeout(() => setShowTooltip(false), 4000)
      }
    }, 3000)

    return () => clearTimeout(timer)
  }, [isOpen, isDashboard])

  const handleQuickAction = (action: string) => {
    switch (action) {
      case 'chat':
        setIsOpen(true)
        break
      case 'insights':
        router.push('/dashboard/other/ai-assistant?tab=insights')
        setIsOpen(false)
        break
      default:
        break
    }
  }

  if (!isDashboard) return null

  return (
    <>
      {/* Floating Button - Positioned ARRIBA DERECHA */}
      <motion.div
        drag
        dragMomentum={false}

        // To properly save position, we need to bind x and y to state.
        style={{ x: position.x, y: position.y, touchAction: "none" }}
        onDragEnd={(_, info) => {
          // We track the accumulated drag
          const newX = position.x + info.offset.x;
          const newY = position.y + info.offset.y;
          setPosition({ x: newX, y: newY });
          localStorage.setItem("ai-assistant-pos", JSON.stringify({ x: newX, y: newY }));
        }}
        className="fixed top-6 right-6 z-[60]"
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 0.5, type: "spring", stiffness: 300 }}
      >
        {/* Tooltip */}
        <AnimatePresence>
          {showTooltip && (
            <motion.div
              className="absolute top-16 right-0 bg-gray-950/90 backdrop-blur-md text-white px-4 py-3 rounded-2xl shadow-2xl border border-white/10 whitespace-nowrap z-50 overflow-hidden"
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
            >
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-purple-500 rounded-full animate-pulse" />
                <span className="text-xs font-semibold tracking-wide uppercase">Asistente Activo</span>
              </div>
              <div className="mt-1 text-sm font-medium text-white/80">¿Cómo puedo ayudarte hoy?</div>

              {/* Arrow */}
              <div className="absolute -top-1 right-5 w-2 h-2 bg-gray-950/90 border-t border-l border-white/10 rotate-45"></div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Main Button */}
        <motion.button
          onClick={() => setIsOpen(!isOpen)}
          className={cn(
            "relative w-12 h-12 rounded-full shadow-2xl flex items-center justify-center text-white transition-all duration-500 border border-white/10",
            isOpen
              ? "bg-zinc-900 border-white/20"
              : "bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-600 hover:shadow-purple-500/20"
          )}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          {/* Active Suggestions Pulse */}
          {!isOpen && suggestions.length > 0 && (
            <motion.div
              className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full border-2 border-white flex items-center justify-center"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
            >
              <span className="text-[10px] font-bold text-white">{suggestions.length}</span>
            </motion.div>
          )}

          {/* Pulsing background (only when suggestions) */}
          {!isOpen && suggestions.length > 0 && (
            <motion.div
              className="absolute inset-0 bg-purple-500 rounded-full -z-10"
              animate={{
                scale: [1, 1.4, 1],
                opacity: [0.3, 0, 0.3]
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: "easeInOut"
              }}
            />
          )}

          {/* Icon */}
          <div className="relative z-10">
            {isOpen ? (
              <XMarkIcon className="w-5 h-5" />
            ) : (
              <SparklesIcon className="w-5 h-5" />
            )}
          </div>
        </motion.button>

        <AnimatePresence>
          {isOpen && (
            <>
              {/* Invisible Backdrop to close on click outside */}
              <div
                className="fixed inset-0 z-[65]"
                onClick={() => setIsOpen(false)}
              />
              <motion.div
                className="absolute top-16 right-0 z-[70] origin-top-right"
                initial={{ opacity: 0, scale: 0.9, y: -20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9, y: -20 }}
                transition={{ type: "spring", damping: 25, stiffness: 300 }}
              >
                <div className="bg-zinc-950/95 backdrop-blur-2xl border border-white/10 rounded-[2rem] p-6 shadow-[0_20px_50px_rgba(0,0,0,0.5)] min-w-[320px] max-w-[400px]">
                  {/* Speech Bubble Arrow */}
                  <div className="absolute -top-2 right-5 w-4 h-4 bg-zinc-950/95 border-t border-l border-white/10 rotate-45"></div>

                  {/* Header */}
                  <div className="flex items-center gap-4 mb-6">
                    <div className="h-10 w-10 bg-gradient-to-tr from-indigo-500 to-purple-500 rounded-2xl flex items-center justify-center shadow-lg shadow-indigo-500/20">
                      <CpuChipIcon className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h3 className="text-white font-bold tracking-tight">AI Assistant</h3>
                      <p className="text-white/40 text-[11px] uppercase tracking-widest font-bold">Smart Insights</p>
                    </div>
                  </div>

                  {/* Content: Suggestions or Default Actions */}
                  <div className="space-y-4 max-h-[400px] overflow-y-auto custom-scrollbar pr-1">
                    {suggestions.length > 0 ? (
                      <div className="space-y-3">
                        <div className="flex items-center gap-2 px-1 mb-2">
                          <LightBulbIcon className="w-4 h-4 text-amber-400" />
                          <span className="text-xs font-bold text-white/40 uppercase tracking-wider">Acciones Sugeridas</span>
                        </div>

                        {suggestions.map((s) => (
                          <div
                            key={s.id}
                            className="p-4 rounded-2xl bg-white/5 border border-white/5 hover:border-white/10 transition-all group"
                          >
                            <div className="flex items-start gap-4">
                              <div className={cn(
                                "mt-1 p-2 rounded-xl shrink-0",
                                s.priority === 'high' ? "bg-red-500/10 text-red-400" :
                                  s.priority === 'medium' ? "bg-amber-500/10 text-amber-400" :
                                    "bg-blue-500/10 text-blue-400"
                              )}>
                                <s.icon className="w-5 h-5" />
                              </div>
                              <div className="flex-1">
                                <p className="text-sm font-medium text-white/90 leading-relaxed mb-3">
                                  {s.text}
                                </p>
                                <button
                                  onClick={() => {
                                    s.onAction();
                                    setIsOpen(false);
                                  }}
                                  className="w-full py-2 px-4 rounded-xl bg-white/10 hover:bg-white text-xs font-bold text-white hover:text-black transition-all"
                                >
                                  {s.actionLabel}
                                </button>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="space-y-2">
                        <button
                          onClick={() => handleQuickAction('chat')}
                          className="w-full flex items-center gap-4 p-4 bg-white/5 hover:bg-white/10 rounded-2xl transition-all border border-white/5 group"
                        >
                          <ChatBubbleLeftRightIcon className="w-6 h-6 text-indigo-400 group-hover:scale-110 transition-transform" />
                          <div className="text-left">
                            <div className="text-white text-sm font-bold">Abrir Chat</div>
                            <div className="text-white/40 text-xs">Consultar datos del sistema</div>
                          </div>
                        </button>

                        <button
                          onClick={() => handleQuickAction('insights')}
                          className="w-full flex items-center gap-4 p-4 bg-white/5 hover:bg-white/10 rounded-2xl transition-all border border-white/5 group"
                        >
                          <SparklesIcon className="w-6 h-6 text-purple-400 group-hover:scale-110 transition-transform" />
                          <div className="text-left">
                            <div className="text-white text-sm font-bold">Ver Insights</div>
                            <div className="text-white/40 text-xs">Análisis global de clientes</div>
                          </div>
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Footer */}
                  <div className="mt-8 pt-6 border-t border-white/5 flex items-center justify-between">
                    <div className="text-[10px] text-white/30 font-medium uppercase tracking-widest flex items-center gap-2">
                      <div className="w-1 h-1 bg-green-500 rounded-full"></div>
                      Sistema Online
                    </div>
                    <button
                      onClick={() => {
                        router.push('/dashboard/other/ai-assistant');
                        setIsOpen(false);
                      }}
                      className="text-xs font-bold text-purple-400 hover:text-purple-300 transition-colors"
                    >
                      Ver todo →
                    </button>
                  </div>
                </div>
              </motion.div>
            </>
          )}
        </AnimatePresence>
      </motion.div>
    </>
  )
}