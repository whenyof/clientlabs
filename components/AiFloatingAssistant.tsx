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
 className="absolute top-16 right-0 bg-gray-950/90 backdrop- text-[var(--text-primary)] px-4 py-3 rounded-2xl shadow-sm border border-[var(--border-subtle)] whitespace-nowrap z-50 overflow-hidden"
 initial={{ opacity: 0, y: -10 }}
 animate={{ opacity: 1, y: 0 }}
 exit={{ opacity: 0, y: -10 }}
 transition={{ duration: 0.2 }}
 >
 <div className="flex items-center gap-2">
 <div className="w-2 h-2 bg-[var(--accent-soft)]-primary rounded-full animate-pulse" />
 <span className="text-xs font-semibold tracking-wide uppercase">Asistente Activo</span>
 </div>
 <div className="mt-1 text-sm font-medium text-[var(--text-secondary)]">¿Cómo puedo ayudarte hoy?</div>

 {/* Arrow */}
 <div className="absolute -top-1 right-5 w-2 h-2 bg-gray-950/90 border-t border-l border-[var(--border-subtle)] rotate-45"></div>
 </motion.div>
 )}
 </AnimatePresence>

 {/* Main Button */}
 <motion.button
 onClick={() => setIsOpen(!isOpen)}
 className={cn(
 "relative w-12 h-12 rounded-full shadow-sm flex items-center justify-center text-[var(--text-primary)] transition-all duration-500 border border-[var(--border-subtle)]",
 isOpen
 ? "bg-zinc-900 border-[var(--border-subtle)]"
 : "bg-[var(--bg-card)] hover:shadow-accent-primary/20"
 )}
 whileHover={{ scale: 1.05 }}
 whileTap={{ scale: 0.95 }}
 >
 {/* Active Suggestions Pulse */}
 {!isOpen && suggestions.length > 0 && (
 <motion.div
 className="absolute -top-1 -right-1 w-4 h-4 bg-[var(--bg-card)] rounded-full border-2 border-white flex items-center justify-center"
 initial={{ scale: 0 }}
 animate={{ scale: 1 }}
 >
 <span className="text-[10px] font-bold text-[var(--text-primary)]">{suggestions.length}</span>
 </motion.div>
 )}

 {/* Pulsing background (only when suggestions) */}
 {!isOpen && suggestions.length > 0 && (
 <motion.div
 className="absolute inset-0 bg-[var(--accent-soft)]-primary rounded-full -z-10"
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
 <div className="bg-zinc-950/95 backdrop- border border-[var(--border-subtle)] rounded-[2rem] p-6 shadow-sm min-w-[320px] max-w-[400px]">
 {/* Speech Bubble Arrow */}
 <div className="absolute -top-2 right-5 w-4 h-4 bg-zinc-950/95 border-t border-l border-[var(--border-subtle)] rotate-45"></div>

 {/* Header */}
 <div className="flex items-center gap-4 mb-6">
 <div className="h-10 w-10 bg-[var(--bg-card)] rounded-2xl flex items-center justify-center shadow-sm shadow-indigo-500/20">
 <CpuChipIcon className="w-6 h-6 text-[var(--text-primary)]" />
 </div>
 <div>
 <h3 className="text-[var(--text-primary)] font-bold tracking-tight">AI Assistant</h3>
 <p className="text-[var(--text-secondary)] text-[11px] uppercase tracking-widest font-bold">Smart Insights</p>
 </div>
 </div>

 {/* Content: Suggestions or Default Actions */}
 <div className="space-y-4 max-h-[400px] overflow-y-auto custom-scrollbar pr-1">
 {suggestions.length > 0 ? (
 <div className="space-y-3">
 <div className="flex items-center gap-2 px-1 mb-2">
 <LightBulbIcon className="w-4 h-4 text-[var(--text-secondary)]" />
 <span className="text-xs font-bold text-[var(--text-secondary)] uppercase tracking-wider">Acciones Sugeridas</span>
 </div>

 {suggestions.map((s) => (
 <div
 key={s.id}
 className="p-4 rounded-2xl bg-[var(--bg-card)] border border-[var(--border-subtle)] hover:border-[var(--border-subtle)] transition-all group"
 >
 <div className="flex items-start gap-4">
 <div className={cn(
 "mt-1 p-2 rounded-xl shrink-0",
 s.priority === 'high' ? "bg-[var(--bg-card)] text-[var(--critical)]" :
 s.priority === 'medium' ? "bg-[var(--bg-card)] text-[var(--text-secondary)]" :
 "bg-[var(--bg-card)] text-[var(--accent)]"
 )}>
 <s.icon className="w-5 h-5" />
 </div>
 <div className="flex-1">
 <p className="text-sm font-medium text-[var(--text-secondary)] leading-relaxed mb-3">
 {s.text}
 </p>
 <button
 onClick={() => {
 s.onAction();
 setIsOpen(false);
 }}
 className="w-full py-2 px-4 rounded-xl bg-[var(--bg-card)] hover:bg-[var(--bg-card)] text-xs font-bold text-[white] hover:text-black transition-all"
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
 className="w-full flex items-center gap-4 p-4 bg-[var(--bg-card)] hover:bg-[var(--bg-card)] rounded-2xl transition-all border border-[var(--border-subtle)] group"
 >
 <ChatBubbleLeftRightIcon className="w-6 h-6 text-[var(--accent)] group-hover:scale-110 transition-transform" />
 <div className="text-left">
 <div className="text-[var(--text-primary)] text-sm font-bold">Abrir Chat</div>
 <div className="text-[var(--text-secondary)] text-xs">Consultar datos del sistema</div>
 </div>
 </button>

 <button
 onClick={() => handleQuickAction('insights')}
 className="w-full flex items-center gap-4 p-4 bg-[var(--bg-card)] hover:bg-[var(--bg-card)] rounded-2xl transition-all border border-[var(--border-subtle)] group"
 >
 <SparklesIcon className="w-6 h-6 text-[var(--accent)]-hover group-hover:scale-110 transition-transform" />
 <div className="text-left">
 <div className="text-[var(--text-primary)] text-sm font-bold">Ver Insights</div>
 <div className="text-[var(--text-secondary)] text-xs">Análisis global de clientes</div>
 </div>
 </button>
 </div>
 )}
 </div>

 {/* Footer */}
 <div className="mt-8 pt-6 border-t border-[var(--border-subtle)] flex items-center justify-between">
 <div className="text-[10px] text-[var(--text-secondary)] font-medium uppercase tracking-widest flex items-center gap-2">
 <div className="w-1 h-1 bg-green-500 rounded-full"></div>
 Sistema Online
 </div>
 <button
 onClick={() => {
 router.push('/dashboard/other/ai-assistant');
 setIsOpen(false);
 }}
 className="text-xs font-bold text-[var(--accent)]-hover hover:text-[var(--accent)]-primary transition-colors"
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