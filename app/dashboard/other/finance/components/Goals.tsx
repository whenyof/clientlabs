"use client"

import { motion } from "framer-motion"
import { mockFinancialGoals, formatCurrency, getGoalProgress } from "../mock"
import {
  TrophyIcon,
  TagIcon,
  ClockIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon
} from "@heroicons/react/24/outline"

export function Goals() {
  const getGoalStatus = (current: number, target: number, deadline: Date) => {
    const progress = getGoalProgress(current, target)
    const daysRemaining = Math.ceil((deadline.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))

    if (progress >= 100) return { status: 'completed', color: 'text-green-400', bg: 'bg-green-500/10', border: 'border-green-500/20' }
    if (daysRemaining < 0) return { status: 'overdue', color: 'text-red-400', bg: 'bg-red-500/10', border: 'border-red-500/20' }
    if (daysRemaining <= 30) return { status: 'urgent', color: 'text-orange-400', bg: 'bg-orange-500/10', border: 'border-orange-500/20' }
    return { status: 'on_track', color: 'text-blue-400', bg: 'bg-blue-500/10', border: 'border-blue-500/20' }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return CheckCircleIcon
      case 'overdue':
        return ExclamationTriangleIcon
      case 'urgent':
        return ClockIcon
      default:
        return TagIcon
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case 'completed':
        return 'Completado'
      case 'overdue':
        return 'Vencido'
      case 'urgent':
        return 'Urgente'
      default:
        return 'En curso'
    }
  }

  return (
    <motion.div
      className="bg-gray-800/50 backdrop-blur-sm rounded-2xl border border-gray-700/50 p-6"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.7, duration: 0.5 }}
    >
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-xl font-bold text-white mb-2">Objetivos Financieros</h3>
          <p className="text-gray-400 text-sm">Metas y hitos a alcanzar</p>
        </div>
        <div className="text-sm text-gray-400">
          {mockFinancialGoals.filter(g => getGoalProgress(g.current, g.target) < 100).length} pendientes
        </div>
      </div>

      <div className="space-y-6">
        {mockFinancialGoals.map((goal, index) => {
          const progress = getGoalProgress(goal.current, goal.target)
          const status = getGoalStatus(goal.current, goal.target, goal.deadline)
          const StatusIcon = getStatusIcon(status.status)
          const daysRemaining = Math.ceil((goal.deadline.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))

          return (
            <motion.div
              key={index}
              className={`p-6 rounded-xl border ${status.bg} ${status.border} transition-all duration-300 hover:scale-105`}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8 + (index * 0.1), duration: 0.3 }}
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-start gap-4">
                  <div className={`p-3 rounded-lg ${status.bg}`}>
                    <StatusIcon className={`w-6 h-6 ${status.color}`} />
                  </div>

                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h4 className="text-xl font-bold text-white">{goal.title}</h4>
                      <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${status.bg} ${status.border} ${status.color}`}>
                        {getStatusText(status.status)}
                      </span>
                    </div>

                    {goal.description && (
                      <p className="text-gray-400 text-sm mb-3">{goal.description}</p>
                    )}

                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <div className="text-gray-400">Progreso actual</div>
                        <div className="text-white font-semibold">
                          {formatCurrency(goal.current)}
                        </div>
                      </div>
                      <div>
                        <div className="text-gray-400">Objetivo total</div>
                        <div className="text-white font-semibold">
                          {formatCurrency(goal.target)}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="text-right">
                  <div className="text-3xl font-bold text-white mb-1">
                    {progress.toFixed(0)}%
                  </div>
                  <div className="text-sm text-gray-400">completado</div>
                </div>
              </div>

              {/* Progress Bar */}
              <div className="mb-4">
                <div className="flex items-center justify-between text-sm mb-2">
                  <span className="text-gray-400">Progreso</span>
                  <span className="text-white font-semibold">
                    {formatCurrency(goal.current)} / {formatCurrency(goal.target)}
                  </span>
                </div>

                <div className="w-full bg-gray-700 rounded-full h-3">
                  <motion.div
                    className={`h-3 rounded-full ${status.color.replace('text-', 'bg-')}`}
                    style={{ width: `${Math.min(progress, 100)}%` }}
                    initial={{ width: 0 }}
                    animate={{ width: `${Math.min(progress, 100)}%` }}
                    transition={{ delay: 1.0 + (index * 0.1), duration: 1.0 }}
                  />
                </div>
              </div>

              {/* Timeline */}
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2">
                  <ClockIcon className="w-4 h-4 text-gray-400" />
                  <span className="text-gray-400">
                    {daysRemaining > 0
                      ? `${daysRemaining} días restantes`
                      : daysRemaining === 0
                        ? 'Vence hoy'
                        : `${Math.abs(daysRemaining)} días vencido`
                    }
                  </span>
                </div>

                <div className="text-gray-400">
                  Vence: {goal.deadline.toLocaleDateString('es-ES')}
                </div>
              </div>

              {/* Achievement Badge */}
              {progress >= 100 && (
                <motion.div
                  className="mt-4 flex items-center justify-center gap-2 p-3 bg-yellow-500/10 border border-yellow-500/20 rounded-lg"
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 1.2, duration: 0.5 }}
                >
                  <TrophyIcon className="w-5 h-5 text-yellow-400" />
                  <span className="text-yellow-400 font-semibold">¡Objetivo alcanzado!</span>
                </motion.div>
              )}
            </motion.div>
          )
        })}
      </div>

      {/* Summary */}
      <motion.div
        className="mt-6 p-4 bg-gray-900/50 rounded-xl border border-gray-700/50"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.0, duration: 0.5 }}
      >
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
          <div>
            <div className="text-2xl font-bold text-green-400">
              {mockFinancialGoals.filter(g => getGoalProgress(g.current, g.target) >= 100).length}
            </div>
            <div className="text-xs text-gray-400">Completados</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-blue-400">
              {mockFinancialGoals.filter(g => {
                const progress = getGoalProgress(g.current, g.target)
                const daysRemaining = Math.ceil((g.deadline.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))
                return progress < 100 && daysRemaining > 30
              }).length}
            </div>
            <div className="text-xs text-gray-400">En curso</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-orange-400">
              {mockFinancialGoals.filter(g => {
                const progress = getGoalProgress(g.current, g.target)
                const daysRemaining = Math.ceil((g.deadline.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))
                return progress < 100 && daysRemaining <= 30 && daysRemaining >= 0
              }).length}
            </div>
            <div className="text-xs text-gray-400">Urgentes</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-red-400">
              {mockFinancialGoals.filter(g => {
                const progress = getGoalProgress(g.current, g.target)
                const daysRemaining = Math.ceil((g.deadline.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))
                return progress < 100 && daysRemaining < 0
              }).length}
            </div>
            <div className="text-xs text-gray-400">Vencidos</div>
          </div>
        </div>
      </motion.div>
    </motion.div>
  )
}