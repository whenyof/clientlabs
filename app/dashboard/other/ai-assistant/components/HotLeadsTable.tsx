"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { AnimatedCard } from "../../analytics/components/AnimatedCard"
import { mockLeadScores, formatCurrency, getScoreColor } from "../mock"
import {
  PhoneIcon,
  EnvelopeIcon,
  UserIcon,
  BuildingOfficeIcon,
  FireIcon,
  BoltIcon,
  SparklesIcon
} from "@heroicons/react/24/outline"

export function HotLeadsTable() {
  const [sortBy, setSortBy] = useState<'score' | 'value' | 'activity'>('score')

  const sortedLeads = [...mockLeadScores].sort((a, b) => {
    switch (sortBy) {
      case 'score':
        return b.score - a.score
      case 'value':
        return b.predictedValue - a.predictedValue
      case 'activity':
        return new Date(b.lastActivity).getTime() - new Date(a.lastActivity).getTime()
      default:
        return 0
    }
  })

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'hot':
        return <FireIcon className="w-4 h-4 text-red-400" />
      case 'warm':
        return <BoltIcon className="w-4 h-4 text-yellow-400" />
      case 'cold':
        return <SparklesIcon className="w-4 h-4 text-blue-400" />
      default:
        return <UserIcon className="w-4 h-4 text-gray-400" />
    }
  }

  const getCategoryStyle = (category: string) => {
    switch (category) {
      case 'hot':
        return 'bg-red-500/20 text-red-400 border-red-500/30'
      case 'warm':
        return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30'
      case 'cold':
        return 'bg-blue-500/20 text-blue-400 border-blue-500/30'
      default:
        return 'bg-gray-500/20 text-gray-400 border-gray-500/30'
    }
  }

  const handleAction = (action: string, leadId: string) => {
    console.log(`${action} for lead:`, leadId)
  }

  return (
    <AnimatedCard>
      <div className="p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-2xl font-bold text-white mb-2">
              Leads por Prioridad
            </h3>
            <p className="text-gray-400">
              Leads clasificados por score de conversión
            </p>
          </div>

          <div className="flex items-center gap-3">
            <label className="text-sm text-gray-400">Ordenar por:</label>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as typeof sortBy)}
              className="px-3 py-2 bg-gray-700/50 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
            >
              <option value="score">Score</option>
              <option value="value">Valor</option>
              <option value="activity">Actividad</option>
            </select>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-900/50">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">
                  Lead
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">
                  Score
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">
                  Valor Estimado
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">
                  Última Actividad
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">
                  Próxima Acción
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-700/50">
              {sortedLeads.map((lead, index) => (
                <motion.tr
                  key={lead.id}
                  className="hover:bg-gray-700/30 transition-colors"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05, duration: 0.3 }}
                >
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="flex items-center gap-2">
                        {getCategoryIcon(lead.category)}
                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border ${getCategoryStyle(lead.category)}`}>
                          {lead.category.toUpperCase()}
                        </span>
                      </div>
                      <div>
                        <div className="text-white font-medium">{lead.name}</div>
                        <div className="text-gray-400 text-sm flex items-center gap-1">
                          <BuildingOfficeIcon className="w-3 h-3" />
                          {lead.company}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className={`text-lg font-bold ${getScoreColor(lead.score)}`}>
                        {lead.score}
                      </div>
                      <div className="w-16 bg-gray-700 rounded-full h-2">
                        <div
                          className={`h-2 rounded-full ${lead.score >= 80 ? 'bg-green-500' : lead.score >= 60 ? 'bg-yellow-500' : 'bg-red-500'}`}
                          style={{ width: `${lead.score}%` }}
                        />
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-white font-semibold">
                      {formatCurrency(lead.predictedValue)}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-gray-300">
                    <div className="text-sm">
                      {new Date(lead.lastActivity).toLocaleDateString('es-ES')}
                    </div>
                    <div className="text-xs text-gray-500">
                      {new Date(lead.lastActivity).toLocaleTimeString('es-ES', {
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-purple-400 text-sm font-medium">
                      {lead.nextAction}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <motion.button
                        onClick={() => handleAction('call', lead.id)}
                        className="p-2 text-gray-400 hover:text-green-400 hover:bg-green-600/20 rounded-lg transition-colors"
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                      >
                        <PhoneIcon className="w-4 h-4" />
                      </motion.button>

                      <motion.button
                        onClick={() => handleAction('email', lead.id)}
                        className="p-2 text-gray-400 hover:text-blue-400 hover:bg-blue-600/20 rounded-lg transition-colors"
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                      >
                        <EnvelopeIcon className="w-4 h-4" />
                      </motion.button>
                    </div>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="mt-6 flex items-center justify-between text-sm text-gray-400">
          <span>
            {sortedLeads.length} leads analizados
          </span>
          <div className="flex items-center gap-4">
            <span>
              Valor total estimado: <span className="text-white font-semibold">
                {formatCurrency(sortedLeads.reduce((sum, lead) => sum + lead.predictedValue, 0))}
              </span>
            </span>
          </div>
        </div>
      </div>
    </AnimatedCard>
  )
}