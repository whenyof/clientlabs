"use client"

import { useSectorConfig } from "@/hooks/useSectorConfig"

import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import { motion } from 'framer-motion'

type RevenueChartProps = {
  data: { month: string; revenue: number }[]
}

export function RevenueChart({ data }: RevenueChartProps) {
  const { labels } = useSectorConfig()
  const chartData = data.map((d) => ({ ...d, revenue: d.revenue }))
  const hasData = chartData.length > 0 && chartData.some((d) => d.revenue > 0)

  return (
    <motion.div
      className="flex-1 flex flex-col h-full w-full"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2, duration: 0.5 }}
    >
      <div className="mb-6">
        <h3 className="text-xl font-bold text-[var(--text-primary)] mb-2">
          {labels.dashboard.charts.revenue.title}
        </h3>
        <p className="text-[var(--text-secondary)]">
          {labels.dashboard.charts.revenue.subtitle}
        </p>
      </div>

      {!hasData ? (
        <div className="flex-1 flex flex-col items-center justify-center text-[var(--text-secondary)]">
          <div className="w-16 h-16 mb-4 rounded-full bg-[var(--bg-main)] flex items-center justify-center">
            <svg className="w-8 h-8 text-[var(--border-subtle)]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
          </div>
          <p className="font-medium text-[var(--text-primary)]">{labels.common.noResults}</p>
          <p className="text-sm mt-1 text-[var(--text-secondary)]/70">Aún no hay datos financieros registrados para mostrar la evolución.</p>
        </div>
      ) : (
        <div className="flex-1 min-h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border-subtle)" vertical={false} />
              <XAxis dataKey="month" stroke="var(--text-secondary)" fontSize={12} tickLine={false} axisLine={false} dy={10} />
              <YAxis
                stroke="var(--text-secondary)"
                fontSize={12}
                tickFormatter={(value) => `${(value / 1000).toFixed(0)}k€`}
                tickLine={false}
                axisLine={false}
                dx={-10}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'var(--bg-card)',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: '12px',
                  color: 'var(--text-primary)',
                  boxShadow: 'var(--shadow-card)'
                }}
                itemStyle={{ color: 'var(--text-primary)' }}
                formatter={(value: number | undefined) => [`${(value || 0).toLocaleString()}€`, labels.dashboard.charts.revenue.series.income]}
              />
              <Line
                type="monotone"
                dataKey="revenue"
                stroke="var(--accent)"
                strokeWidth={3}
                dot={{ fill: 'var(--accent)', strokeWidth: 2, r: 4 }}
                activeDot={{ r: 6, fill: 'var(--accent)', stroke: 'var(--bg-card)', strokeWidth: 2 }}
                name={labels.dashboard.charts.revenue.series.income}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}
    </motion.div>
  )
}