"use client"

import { motion } from "framer-motion"
import { mockAutomationRules } from "../mock"

export function AutomationsPanel() {
  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-2xl font-bold text-[var(--text-primary)] mb-2">Automatizaciones IA</h3>
          <p className="text-[var(--text-secondary)]">Flujos inteligentes que trabajan por ti</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <motion.div className="bg-gradient-to-br from-green-500/10 to-emerald-600/10 border border-green-500/20 rounded-xl p-6 text-center">
          <div className="text-3xl font-bold text-[var(--text-primary)] mb-1">{mockAutomationRules.filter(a => a.status === 'active').length}</div>
          <div className="text-sm text-[var(--text-secondary)]">Activas</div>
        </motion.div>
        <motion.div className="bg-gradient-to-br from-blue-500/10 to-indigo-600/10 border border-blue-500/20 rounded-xl p-6 text-center">
          <div className="text-3xl font-bold text-[var(--text-primary)] mb-1">{mockAutomationRules.reduce((sum, a) => sum + a.executions, 0)}</div>
          <div className="text-sm text-[var(--text-secondary)]">Ejecuciones</div>
        </motion.div>
        <motion.div className="bg-gradient-to-br from-emerald-500/10 to-violet-600/10 border border-emerald-500/20 rounded-xl p-6 text-center">
          <div className="text-3xl font-bold text-[var(--text-primary)] mb-1">{Math.round(mockAutomationRules.reduce((sum, a) => sum + a.successRate, 0) / mockAutomationRules.length)}%</div>
          <div className="text-sm text-[var(--text-secondary)]">Éxito promedio</div>
        </motion.div>
        <motion.div className="bg-gradient-to-br from-orange-500/10 to-amber-600/10 border border-orange-500/20 rounded-xl p-6 text-center">
          <div className="text-3xl font-bold text-[var(--text-primary)] mb-1">24h</div>
          <div className="text-sm text-[var(--text-secondary)]">Tiempo ahorrado</div>
        </motion.div>
      </div>

      <div className="space-y-4">
        {mockAutomationRules.map((automation, index) => (
          <motion.div
            key={automation.id}
            className="bg-[var(--bg-main)] backdrop-blur-sm rounded-xl border border-[var(--border-subtle)] p-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1, duration: 0.5 }}
          >
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-lg font-semibold text-[var(--text-primary)] mb-1">
                  {automation.name}
                </h4>
                <p className="text-[var(--text-secondary)] text-sm">
                  {automation.description}
                </p>
                <div className="flex items-center gap-4 mt-2 text-sm">
                  <span className="text-[var(--text-secondary)]">Ejecuciones: {automation.executions}</span>
                  <span className="text-green-400">Éxito: {automation.successRate}%</span>
                </div>
              </div>
              <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
                automation.status === 'active' ? 'bg-green-500/20 text-green-400' :
                automation.status === 'paused' ? 'bg-yellow-500/20 text-yellow-400' :
                'bg-[var(--bg-main)]0/20 text-[var(--text-secondary)]'
              }`}>
                {automation.status === 'active' ? 'Activa' :
                 automation.status === 'paused' ? 'Pausada' : 'Borrador'}
              </span>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  )
}