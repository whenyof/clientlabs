"use client"

import { motion } from "framer-motion"
import { mockLeadScores, formatCurrency } from "../mock"

export function HotLeadsTable() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-2xl font-bold text-white mb-2">Ranking de Leads</h3>
          <p className="text-gray-400">Top oportunidades clasificadas por IA</p>
        </div>
      </div>

      <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl border border-gray-700/50 p-6">
        <div className="text-center py-8">
          <div className="text-gray-400">
            Ranking de leads con {mockLeadScores.length} leads analizados
          </div>
          <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4">
            {mockLeadScores.slice(0, 3).map((lead, index) => (
              <motion.div
                key={lead.id}
                className="bg-gray-900/50 rounded-lg p-4"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <div className="text-white font-semibold">{lead.name}</div>
                <div className="text-gray-400 text-sm">{lead.company}</div>
                <div className="text-purple-400 font-bold mt-2">Score: {lead.score}</div>
                <div className="text-green-400 text-sm">{formatCurrency(lead.predictedValue)}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}