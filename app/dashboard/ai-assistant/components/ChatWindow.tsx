"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { mockChatHistory } from "../mock"

export function ChatWindow() {
  const [messages] = useState(mockChatHistory.slice(0, 5))

  return (
    <motion.div
      className="bg-[var(--bg-main)] backdrop-blur-sm rounded-xl border border-[var(--border-subtle)] overflow-hidden"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2, duration: 0.5 }}
    >
      <div className="h-[500px] flex flex-col">
        <div className="p-4 border-b border-[var(--border-subtle)] bg-[var(--bg-card)]">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-emerald-600/20 rounded-lg">
              <span className="text-emerald-400 text-lg">🤖</span>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-[var(--text-primary)]">Chat con IA</h3>
              <p className="text-[var(--text-secondary)] text-sm">Conversación inteligente en tiempo real</p>
            </div>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-md px-4 py-3 rounded-xl ${
                  message.role === 'user'
                    ? 'bg-emerald-600 text-[var(--text-primary)]'
                    : 'bg-[var(--bg-surface)] text-[var(--text-secondary)] border border-[var(--border-subtle)]'
                }`}
              >
                <div className="text-sm leading-relaxed whitespace-pre-line">
                  {message.content}
                </div>
                <div className={`text-xs mt-2 ${
                  message.role === 'user' ? 'text-purple-200' : 'text-[var(--text-secondary)]'
                }`}>
                  {new Date(message.timestamp).toLocaleTimeString('es-ES', {
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="p-4 border-t border-[var(--border-subtle)]">
          <div className="flex items-center gap-3">
            <div className="flex-1">
              <input
                type="text"
                placeholder="Pregúntame sobre leads, ventas, predicciones..."
                className="w-full px-4 py-3 bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-xl text-[var(--text-primary)] placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                disabled
              />
            </div>
            <button
              className="p-3 bg-emerald-600/50 rounded-xl cursor-not-allowed"
              disabled
            >
              <span className="text-emerald-400">📤</span>
            </button>
          </div>

          <div className="mt-3 text-xs text-[var(--text-secondary)] text-center">
            <div className="flex items-center justify-center gap-4">
              <span className="flex items-center gap-1">
                <span>⚡</span>
                IA Activa
              </span>
              <span>•</span>
              <span>Pregunta sobre ventas, leads o análisis</span>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  )
}