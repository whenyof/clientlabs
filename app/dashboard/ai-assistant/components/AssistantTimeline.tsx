"use client"

import { motion } from "framer-motion"
import { mockTimelineEvents } from "../mock"

export function AssistantTimeline() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-2xl font-bold text-[var(--text-primary)] mb-2">Historial de IA</h3>
          <p className="text-[var(--text-secondary)]">Actividad y decisiones del asistente inteligente</p>
        </div>
      </div>

      <div className="relative">
        <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-gradient-to-b from-emerald-500/50 to-transparent"></div>

        <div className="space-y-6">
          {mockTimelineEvents.map((event, index) => (
            <motion.div
              key={event.id}
              className="relative flex items-start gap-4"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1, duration: 0.5 }}
            >
              <div className="relative z-10 flex items-center justify-center w-12 h-12 rounded-full bg-emerald-600/20 border-2 border-[var(--border-subtle)]">
                <span className="text-emerald-400 text-lg">
                  {event.type === 'analysis' ? '🤖' :
                   event.type === 'recommendation' ? '💡' :
                   event.type === 'email' ? '📧' :
                   event.type === 'call' ? '📞' : '⚡'}
                </span>
              </div>

              <div className="flex-1 bg-[var(--bg-main)] backdrop-blur-sm rounded-xl border border-[var(--border-subtle)] p-6">
                <h4 className="text-lg font-semibold text-[var(--text-primary)] mb-2">
                  {event.title}
                </h4>
                <p className="text-[var(--text-secondary)] text-sm leading-relaxed mb-3">
                  {event.description}
                </p>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-[var(--text-secondary)]">
                    {new Date(event.timestamp).toLocaleString('es-ES')}
                  </span>
                  <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                    event.impact === 'positive' ? 'bg-green-500/20 text-green-400' :
                    event.impact === 'negative' ? 'bg-red-500/20 text-red-400' :
                    'bg-[var(--bg-main)]0/20 text-[var(--text-secondary)]'
                  }`}>
                    {event.impact === 'positive' ? 'Positivo' :
                     event.impact === 'negative' ? 'Negativo' : 'Neutral'}
                  </span>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  )
}