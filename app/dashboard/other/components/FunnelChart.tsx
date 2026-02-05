"use client"

import { FunnelChart as RechartsFunnelChart, Funnel, LabelList, ResponsiveContainer, Tooltip } from 'recharts'
import { motion } from 'framer-motion'
import { ClientNumber } from "@/components/ClientNumber"
import { useSectorConfig } from "@/hooks/useSectorConfig"

type FunnelChartProps = {
  /** Real funnel steps from DB. If empty, shows empty state. */
  data?: { name: string; value: number; fill: string }[]
}

export function FunnelChart({ data = [] }: FunnelChartProps) {
  const { labels } = useSectorConfig()
  const hasData = data.length > 0 && data.some((d) => d.value > 0)

  return (
    <motion.div
      className="bg-gray-800/50 backdrop-blur-sm rounded-2xl border border-gray-700/50 p-6"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3, duration: 0.5 }}
    >
      <div className="mb-6">
        <h3 className="text-xl font-bold text-white mb-2">
          {labels.dashboard.charts.funnel.title}
        </h3>
        <p className="text-gray-400">
          {labels.dashboard.charts.funnel.subtitle}
        </p>
      </div>

      {!hasData ? (
        <div className="h-80 flex items-center justify-center text-gray-500 text-sm">
          {labels.common.noResults}
        </div>
      ) : (
        <>
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
                  formatter={(value: number | undefined) => [`${(value || 0).toLocaleString()}`, labels.dashboard.charts.funnel.quantityLabel]}
                />
                <Funnel dataKey="value" data={data} isAnimationActive>
                  <LabelList position="center" fill="#ffffff" stroke="none" fontSize={14} />
                </Funnel>
              </RechartsFunnelChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-6 grid grid-cols-2 lg:grid-cols-4 gap-4">
            {data.map((item, index) => (
              <motion.div
                key={item.name}
                className="text-center"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.5 + index * 0.1, duration: 0.3 }}
              >
                <div className="w-4 h-4 rounded-full mx-auto mb-2" style={{ backgroundColor: item.fill }} />
                <div className="text-2xl font-bold text-white">
                  <ClientNumber value={item.value} />
                </div>
                <div className="text-sm text-gray-400">{item.name}</div>
              </motion.div>
            ))}
          </div>
        </>
      )}
    </motion.div>
  )
}