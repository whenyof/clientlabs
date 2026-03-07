"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { mockWorkflows } from "../mock"
import {
  ArrowRightIcon,
  PlayIcon,
  PauseIcon,
  PlusIcon,
  CogIcon,
  CheckCircleIcon
} from "@heroicons/react/24/outline"

export function WorkflowPanel() {
  const [workflows, setWorkflows] = useState(mockWorkflows)

  const handleToggleWorkflow = (workflowId: string) => {
    setWorkflows(prev =>
      prev.map(w =>
        w.id === workflowId
          ? { ...w, active: !w.active }
          : w
      )
    )
  }

  const handleCreateWorkflow = () => {
    console.log('Create new workflow')
  }

  return (
    <motion.div
      className="space-y-6"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.1, duration: 0.5 }}
    >
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-2xl font-bold text-[var(--text-primary)] mb-2">Automatizaciones</h3>
          <p className="text-[var(--text-secondary)]">Workflows inteligentes entre integraciones</p>
        </div>

        <motion.button
          onClick={handleCreateWorkflow}
          className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-emerald-600 to-blue-600 hover:from-emerald-700 hover:to-blue-700 text-[var(--text-primary)] font-semibold rounded-xl transition-all duration-300 shadow-[var(--shadow-card)] hover:shadow-emerald-500/25"
          whileHover={{ scale: 1.05, y: -2 }}
          whileTap={{ scale: 0.95 }}
        >
          <PlusIcon className="w-5 h-5" />
          Nuevo Workflow
        </motion.button>
      </div>

      <div className="space-y-6">
        {workflows.map((workflow, index) => (
          <motion.div
            key={workflow.id}
            className="bg-[var(--bg-main)] backdrop-blur-sm rounded-xl border border-[var(--border-subtle)] p-6 hover:border-[var(--border-subtle)] transition-all duration-300"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 + (index * 0.1), duration: 0.5 }}
            whileHover={{ y: -2 }}
          >
            <div className="flex items-center justify-between mb-6">
              <div>
                <h4 className="text-xl font-bold text-[var(--text-primary)] mb-1">{workflow.name}</h4>
                <p className="text-[var(--text-secondary)]">{workflow.description}</p>
              </div>

              <div className="flex items-center gap-4">
                <div className="text-right">
                  <div className="text-sm text-[var(--text-secondary)]">Ejecuciones</div>
                  <div className="text-lg font-bold text-[var(--text-primary)]">{workflow.executions}</div>
                </div>

                <motion.button
                  onClick={() => handleToggleWorkflow(workflow.id)}
                  className={`p-3 rounded-lg transition-colors ${
                    workflow.active
                      ? 'text-green-400 hover:bg-green-600/20'
                      : 'text-[var(--text-secondary)] hover:bg-[var(--border-subtle)]'
                  }`}
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                >
                  {workflow.active ? (
                    <PauseIcon className="w-5 h-5" />
                  ) : (
                    <PlayIcon className="w-5 h-5" />
                  )}
                </motion.button>
              </div>
            </div>

            {/* Workflow Visualization */}
            <div className="flex items-center justify-center mb-6">
              <div className="flex items-center gap-4 p-4 bg-[var(--bg-card)] rounded-xl">
                {/* Trigger */}
                <div className="text-center">
                  <div className="w-12 h-12 bg-blue-500/20 rounded-lg flex items-center justify-center mb-2">
                    <span className="text-blue-400 text-lg">🎯</span>
                  </div>
                  <div className="text-xs text-[var(--text-secondary)] mb-1">Trigger</div>
                  <div className="text-sm text-[var(--text-primary)] font-medium">{workflow.trigger.integration}</div>
                  <div className="text-xs text-[var(--text-secondary)]">{workflow.trigger.event}</div>
                </div>

                {/* Arrow */}
                <ArrowRightIcon className="w-6 h-6 text-[var(--text-secondary)]" />

                {/* Actions */}
                {workflow.actions.map((action, actionIndex) => (
                  <div key={actionIndex} className="text-center">
                    <div className="w-12 h-12 bg-green-500/20 rounded-lg flex items-center justify-center mb-2">
                      <span className="text-green-400 text-lg">⚡</span>
                    </div>
                    <div className="text-xs text-[var(--text-secondary)] mb-1">Action</div>
                    <div className="text-sm text-[var(--text-primary)] font-medium">{action.integration}</div>
                    <div className="text-xs text-[var(--text-secondary)]">{action.action}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Status and Stats */}
            <div className="grid grid-cols-3 gap-4 pt-4 border-t border-[var(--border-subtle)]">
              <div className="text-center">
                <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                  workflow.active
                    ? 'bg-green-500/20 text-green-400'
                    : 'bg-[var(--bg-main)]0/20 text-[var(--text-secondary)]'
                }`}>
                  {workflow.active ? 'Activo' : 'Pausado'}
                </div>
              </div>

              <div className="text-center">
                <div className="text-sm text-[var(--text-secondary)] mb-1">Última ejecución</div>
                <div className="text-sm text-[var(--text-primary)]">
                  {workflow.lastRun
                    ? new Date(workflow.lastRun).toLocaleDateString('es-ES')
                    : 'Nunca'
                  }
                </div>
              </div>

              <div className="text-center">
                <div className="text-sm text-[var(--text-secondary)] mb-1">Éxito</div>
                <div className="text-sm text-green-400">98%</div>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Empty State */}
      {workflows.length === 0 && (
        <motion.div
          className="text-center py-12 bg-[var(--bg-main)] rounded-xl border border-[var(--border-subtle)]"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
        >
          <div className="text-6xl mb-4">⚡</div>
          <h4 className="text-lg font-medium text-[var(--text-secondary)] mb-2">
            No hay automatizaciones
          </h4>
          <p className="text-[var(--text-secondary)] mb-6">
            Crea tu primer workflow para automatizar procesos entre integraciones.
          </p>
          <button
            onClick={handleCreateWorkflow}
            className="px-6 py-3 bg-emerald-600 hover:bg-emerald-600 text-[var(--text-primary)] rounded-lg transition-colors"
          >
            Crear Primera Automatización
          </button>
        </motion.div>
      )}
    </motion.div>
  )
}