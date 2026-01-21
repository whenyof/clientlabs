"use client"

import { FunnelChart as RechartsFunnelChart, Funnel, LabelList, ResponsiveContainer, Tooltip } from 'recharts'
import { motion } from 'framer-motion'

const FUNNEL_DATA = [
  { name: 'Visitantes', value: 1000, fill: '#8B5CF6' },
  { name: 'Leads', value: 250, fill: '#A855F7' },
  { name: 'Oportunidades', value: 80, fill: '#C084FC' },
  { name: 'Ventas', value: 25, fill: '#DDD6FE' }
]

export function FunnelChart() {
  return (
    <motion.div
      className="bg-gray-800/50 backdrop-blur-sm rounded-2xl border border-gray-700/50 p-6"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3, duration: 0.5 }}
    >
      <div className="mb-6">
        <h3 className="text-xl font-bold text-white mb-2">
          Embudo de Conversión
        </h3>
        <p className="text-gray-400">
          Flujo de visitantes a ventas
        </p>
      </div>

      <div className="h-80">
        <ResponsiveContainer width="100%" height="100%">
          <RechartsFunnelChart>
            <Tooltip
              contentStyle={{
                backgroundColor: '#1F2937',
                border: '1px solid #374151',
                borderRadius: '8px',
                color: '#F9FAFB'
              }}
              formatter={(value: number | undefined) => [`${(value || 0).toLocaleString()}`, 'Cantidad']}
            />
            <Funnel
              dataKey="value"
              data={FUNNEL_DATA}
              isAnimationActive
            >
              <LabelList
                position="center"
                fill="#ffffff"
                stroke="none"
                fontSize={14}
              />
            </Funnel>
          </RechartsFunnelChart>
        </ResponsiveContainer>
      </div>

      <div className="mt-6 grid grid-cols-2 lg:grid-cols-4 gap-4">
        {FUNNEL_DATA.map((item, index) => (
          <motion.div
            key={item.name}
            className="text-center"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.5 + (index * 0.1), duration: 0.3 }}
          >
            <div
              className="w-4 h-4 rounded-full mx-auto mb-2"
              style={{ backgroundColor: item.fill }}
            />
            <div className="text-2xl font-bold text-white">
              {item.value.toLocaleString()}
            </div>
            <div className="text-sm text-gray-400">
              {item.name}
            </div>
          </motion.div>
        ))}
      </div>
    </motion.div>
  )
}