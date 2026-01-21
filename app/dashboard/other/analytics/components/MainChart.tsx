"use client"

import { useState } from "react"
import { getChartDataForRange, formatCurrency } from "../mock"
import {
  ChartBarIcon,
  ChartPieIcon,
  ArrowTrendingUpIcon
} from "@heroicons/react/24/outline"
import { motion } from "framer-motion"
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Area, AreaChart } from 'recharts'

interface MainChartProps {
  selectedRange: string
}

type Granularity = 'day' | 'week' | 'month'

export function MainChart({ selectedRange }: MainChartProps) {
  const [granularity, setGranularity] = useState<Granularity>('day')
  const [viewMode, setViewMode] = useState<'combined' | 'revenue' | 'leads'>('combined')
  const [isLoading, setIsLoading] = useState(false)

  const data = getChartDataForRange(selectedRange)

  // Calcular métricas para el período
  const totalRevenue = data.reduce((sum, item) => sum + item.revenue, 0)
  const totalLeads = data.reduce((sum, item) => sum + item.leads, 0)
  const avgConversion = data.length > 0 ? (totalLeads / data.length).toFixed(1) : '0'

  // Preparar datos para Recharts
  const chartData = data.slice(-10).map((point, index) => ({
    ...point,
    date: new Date(point.date).toLocaleDateString('es-ES', {
      month: 'short',
      day: 'numeric'
    })
  }))

  const handleGranularityChange = async (newGranularity: Granularity) => {
    setIsLoading(true)
    // Simular loading
    await new Promise(resolve => setTimeout(resolve, 500))
    setGranularity(newGranularity)
    setIsLoading(false)
  }

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-gray-800 border border-gray-600 rounded-lg p-3 shadow-lg"
        >
          <p className="text-white font-medium">{`Fecha: ${label}`}</p>
          {payload.map((entry: any, index: number) => (
            <p key={index} style={{ color: entry.color }} className="text-sm">
              {entry.name}: {entry.value}
            </p>
          ))}
        </motion.div>
      )
    }
    return null
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="bg-gray-800/50 backdrop-blur-sm rounded-2xl border border-gray-700/50 p-6"
    >
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-6">
        <div>
          <h3 className="text-xl font-bold text-white mb-1">
            Rendimiento del período
          </h3>
          <p className="text-gray-400 text-sm">
            Ingresos y leads generados
          </p>
        </div>

        <div className="flex items-center gap-3">
          {/* Vista */}
          <motion.div
            className="flex bg-gray-700/50 rounded-lg p-1"
            layout
          >
            {[
              { key: 'combined', label: 'Combinado', icon: ChartBarIcon },
              { key: 'revenue', label: 'Ingresos', icon: ArrowTrendingUpIcon },
              { key: 'leads', label: 'Leads', icon: ChartPieIcon }
            ].map(({ key, label, icon: Icon }) => (
              <motion.button
                key={key}
                onClick={() => setViewMode(key as any)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                  viewMode === key
                    ? 'bg-purple-600 text-white'
                    : 'text-gray-400 hover:text-white hover:bg-gray-600/50'
                }`}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Icon className="w-4 h-4" />
                {label}
              </motion.button>
            ))}
          </motion.div>

          {/* Granularidad */}
          <motion.div
            className="flex bg-gray-700/50 rounded-lg p-1"
            layout
          >
            {[
              { key: 'day', label: 'Día' },
              { key: 'week', label: 'Semana' },
              { key: 'month', label: 'Mes' }
            ].map(({ key, label }) => (
              <motion.button
                key={key}
                onClick={() => handleGranularityChange(key as Granularity)}
                className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                  granularity === key
                    ? 'bg-purple-600 text-white'
                    : 'text-gray-400 hover:text-white hover:bg-gray-600/50'
                }`}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                disabled={isLoading}
              >
                {isLoading && granularity === key ? (
                  <div className="w-4 h-4 border border-current border-t-transparent rounded-full animate-spin" />
                ) : (
                  label
                )}
              </motion.button>
            ))}
          </motion.div>
        </div>
      </div>

      {/* Métricas rápidas */}
      <motion.div
        className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2, duration: 0.5 }}
      >
        <motion.div
          className="bg-gray-700/30 rounded-lg p-4"
          whileHover={{ scale: 1.02 }}
          transition={{ type: "spring", stiffness: 300 }}
        >
          <div className="text-2xl font-bold text-green-400 mb-1">
            {formatCurrency(totalRevenue)}
          </div>
          <div className="text-sm text-gray-400">Ingresos totales</div>
        </motion.div>
        <motion.div
          className="bg-gray-700/30 rounded-lg p-4"
          whileHover={{ scale: 1.02 }}
          transition={{ type: "spring", stiffness: 300 }}
        >
          <div className="text-2xl font-bold text-blue-400 mb-1">
            {totalLeads}
          </div>
          <div className="text-sm text-gray-400">Leads generados</div>
        </motion.div>
        <motion.div
          className="bg-gray-700/30 rounded-lg p-4"
          whileHover={{ scale: 1.02 }}
          transition={{ type: "spring", stiffness: 300 }}
        >
          <div className="text-2xl font-bold text-purple-400 mb-1">
            {avgConversion}
          </div>
          <div className="text-sm text-gray-400">Conversión diaria</div>
        </motion.div>
      </motion.div>

      {/* Gráfico con Recharts */}
      <motion.div
        className="relative h-80 bg-gray-900/50 rounded-lg border border-gray-700/50 p-4"
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.4, duration: 0.5 }}
      >
        <ResponsiveContainer width="100%" height="100%">
          {viewMode === 'combined' ? (
            <AreaChart data={chartData}>
              <defs>
                <linearGradient id="revenueGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10B981" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#10B981" stopOpacity={0}/>
                </linearGradient>
                <linearGradient id="leadsGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#3B82F6" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis
                dataKey="date"
                stroke="#9CA3AF"
                fontSize={12}
              />
              <YAxis
                stroke="#9CA3AF"
                fontSize={12}
              />
              <Tooltip content={<CustomTooltip />} />
              <Area
                type="monotone"
                dataKey="revenue"
                stroke="#10B981"
                fillOpacity={1}
                fill="url(#revenueGradient)"
                strokeWidth={2}
                name="Ingresos"
              />
              <Bar
                dataKey="leads"
                fill="#3B82F6"
                opacity={0.7}
                name="Leads"
              />
            </AreaChart>
          ) : viewMode === 'revenue' ? (
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis
                dataKey="date"
                stroke="#9CA3AF"
                fontSize={12}
              />
              <YAxis
                stroke="#9CA3AF"
                fontSize={12}
              />
              <Tooltip content={<CustomTooltip />} />
              <Line
                type="monotone"
                dataKey="revenue"
                stroke="#10B981"
                strokeWidth={3}
                dot={{ fill: '#10B981', strokeWidth: 2, r: 4 }}
                activeDot={{ r: 6, stroke: '#10B981', strokeWidth: 2 }}
                name="Ingresos"
              />
            </LineChart>
          ) : (
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis
                dataKey="date"
                stroke="#9CA3AF"
                fontSize={12}
              />
              <YAxis
                stroke="#9CA3AF"
                fontSize={12}
              />
              <Tooltip content={<CustomTooltip />} />
              <Bar
                dataKey="leads"
                fill="#3B82F6"
                radius={[4, 4, 0, 0]}
                name="Leads"
              />
            </BarChart>
          )}
        </ResponsiveContainer>

        {/* Loading overlay */}
        {isLoading && (
          <motion.div
            className="absolute inset-0 bg-gray-900/80 flex items-center justify-center rounded-lg"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            <div className="flex items-center gap-2 text-white">
              <div className="w-5 h-5 border border-white border-t-transparent rounded-full animate-spin" />
              <span>Cargando datos...</span>
            </div>
          </motion.div>
        )}
      </motion.div>
    </motion.div>
  )
}