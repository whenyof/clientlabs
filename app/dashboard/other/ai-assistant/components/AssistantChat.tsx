"use client"

import { useState, useRef, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { AnimatedCard } from "../../analytics/components/AnimatedCard"
import { mockChatHistory, ChatMessage } from "../mock"
import {
  PaperAirplaneIcon,
  MicrophoneIcon,
  SparklesIcon,
  UserIcon,
  CpuChipIcon
} from "@heroicons/react/24/outline"

export function AssistantChat() {
  const [messages, setMessages] = useState<ChatMessage[]>(mockChatHistory)
  const [inputMessage, setInputMessage] = useState("")
  const [isTyping, setIsTyping] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const handleSendMessage = async () => {
    if (!inputMessage.trim()) return

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: inputMessage,
      timestamp: new Date().toISOString()
    }

    setMessages(prev => [...prev, userMessage])
    setInputMessage("")
    setIsTyping(true)

    // Simulate AI response
    setTimeout(() => {
      const aiResponse: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: generateAiResponse(inputMessage),
        timestamp: new Date().toISOString()
      }
      setMessages(prev => [...prev, aiResponse])
      setIsTyping(false)
    }, 1500)
  }

  const generateAiResponse = (userInput: string): string => {
    const input = userInput.toLowerCase()

    if (input.includes('leads') || input.includes('lead')) {
      return "Analizando tus leads... Tengo 3 leads calientes con scores superiores al 80%. El más prometedor es María García de InnovateTech con un score de 95%. ¿Te gustaría que genere un email personalizado para ella?"
    }

    if (input.includes('ingresos') || input.includes('ventas') || input.includes('revenue')) {
      return "Basándome en las tendencias actuales, predigo €45,230 en ingresos para este mes con un 88% de confianza. Los factores principales son: crecimiento de leads calientes (+15%), renovación de clientes existentes (+8%), y campañas de marketing activas."
    }

    if (input.includes('email') || input.includes('correo')) {
      return "Puedo generar emails personalizados basados en el perfil de cada lead. Por ejemplo, para leads técnicos puedo enfocarme en características técnicas, mientras que para leads de negocio puedo destacar ROI y casos de éxito. ¿Para qué lead te gustaría generar un email?"
    }

    if (input.includes('riesgo') || input.includes('churn') || input.includes('clientes')) {
      return "He identificado 2 clientes con riesgo de churn. TechCorp S.L. no ha tenido actividad en 30 días (probabilidad de churn: 75%). ¿Te gustaría que programe un seguimiento automático o genere un email de re-engagement?"
    }

    return "Estoy aquí para ayudarte con el análisis de ventas, generación de leads, predicciones de ingresos, y recomendaciones de acciones. ¿En qué área te gustaría que te ayude específicamente?"
  }

  const formatTime = (timestamp: string) => {
    return new Date(timestamp).toLocaleTimeString('es-ES', {
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  return (
    <AnimatedCard className="h-[600px] flex flex-col">
      <div className="p-6 border-b border-gray-700/50">
        <div className="flex items-center gap-3 mb-2">
          <div className="p-2 bg-purple-600/20 rounded-lg">
            <SparklesIcon className="w-5 h-5 text-purple-400" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-white">
              Asistente IA
            </h3>
            <p className="text-gray-400 text-sm">
              Tu compañero inteligente para ventas y análisis
            </p>
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-6 space-y-4">
        <AnimatePresence>
          {messages.map((message) => (
            <motion.div
              key={message.id}
              className={`flex items-start gap-3 ${
                message.role === 'user' ? 'justify-end' : 'justify-start'
              }`}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              {message.role === 'assistant' && (
                <div className="p-2 bg-purple-600/20 rounded-lg">
                  <CpuChipIcon className="w-4 h-4 text-purple-400" />
                </div>
              )}

              <div
                className={`max-w-xs lg:max-w-md px-4 py-3 rounded-2xl ${
                  message.role === 'user'
                    ? 'bg-purple-600 text-white'
                    : 'bg-gray-800/50 text-gray-200 border border-gray-700/50'
                }`}
              >
                <p className="text-sm leading-relaxed">{message.content}</p>
                <span className={`text-xs mt-2 block ${
                  message.role === 'user' ? 'text-purple-200' : 'text-gray-400'
                }`}>
                  {formatTime(message.timestamp)}
                </span>
              </div>

              {message.role === 'user' && (
                <div className="p-2 bg-gray-600 rounded-lg">
                  <UserIcon className="w-4 h-4 text-gray-300" />
                </div>
              )}
            </motion.div>
          ))}
        </AnimatePresence>

        {/* Typing Indicator */}
        <AnimatePresence>
          {isTyping && (
            <motion.div
              className="flex items-start gap-3 justify-start"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              <div className="p-2 bg-purple-600/20 rounded-lg">
                <CpuChipIcon className="w-4 h-4 text-purple-400" />
              </div>
              <div className="bg-gray-800/50 px-4 py-3 rounded-2xl border border-gray-700/50">
                <div className="flex space-x-1">
                  <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                  <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                  <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="p-6 border-t border-gray-700/50">
        <div className="flex items-center gap-3">
          <div className="flex-1 relative">
            <input
              type="text"
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
              placeholder="Pregúntame sobre leads, predicciones, emails..."
              className="w-full px-4 py-3 bg-gray-800/50 border border-gray-700 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            />
          </div>

          <motion.button
            onClick={handleSendMessage}
            disabled={!inputMessage.trim() || isTyping}
            className="p-3 bg-purple-600 hover:bg-purple-700 disabled:bg-gray-600 disabled:cursor-not-allowed rounded-xl transition-colors"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <PaperAirplaneIcon className="w-5 h-5 text-white" />
          </motion.button>
        </div>

        <div className="mt-3 text-xs text-gray-500 text-center">
          <div className="flex items-center justify-center gap-4">
            <span className="flex items-center gap-1">
              <SparklesIcon className="w-3 h-3" />
              IA Activa
            </span>
            <span>•</span>
            <span>Pregunta sobre ventas, leads o predicciones</span>
          </div>
        </div>
      </div>
    </AnimatedCard>
  )
}