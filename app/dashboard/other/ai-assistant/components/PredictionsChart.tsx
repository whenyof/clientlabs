"use client"

import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Area, AreaChart } from 'recharts'
import { motion } from 'framer-motion'
import { AnimatedCard } from "../../analytics/components/AnimatedCard"
import { mockPredictions, formatCurrency } from "../mock"
import { ChartBarIcon, ArrowTrendingUpIcon } from "@heroicons/react/24/outline"

export function PredictionsChart() {
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload
      return (
        <div className="bg-gray-900 border border-gray-700 rounded-lg p-3 shadow-lg">
          <p className="text-white font-medium">{`Mes: ${label}`}</p>
          <p className="text-green-400">
            {`Ingresos: ${formatCurrency(data.predictedRevenue)}`}
          </p>
          <p className="text-blue-400 text-sm">
            {`Confianza: ${data.confidence}%`}
          </p>
          <div className="mt-2 text-xs text-gray-400">
            <p>Factores:</p>
            <ul className="list-disc list-inside">
              {data.factors.map((factor: string, index: number) => (
                <li key={index}>{factor}</li>
              ))}
            </ul>
          </div>
        </div>
      )
    }
    return null
  }

  const currentMonth = new Date().toLocaleString('es-ES', { month: 'short' })
  const currentPrediction = mockPredictions.find(p => p.month.toLowerCase() === currentMonth.toLowerCase())

  return (
    <div className="space-y-6">
      {/* Current Month Prediction */}
      <AnimatedCard delay={0.1}>
        <div className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <motion.div
                className="p-3 bg-gradient-to-br from-green-500/20 to-emerald-600/20 rounded-lg border border-green-500/30"
                whileHover={{ scale: 1.05 }}
              >
                <ArrowTrendingUpIcon className="w-6 h-6 text-green-400" />
              </motion.div>
              <div>
                <h3 className="text-2xl font-bold text-white">
                  Predicción del Mes Actual
                </h3>
                <p className="text-gray-400 text-sm">
                  Basado en tendencias y factores actuales
                </p>
              </div>
            </div>
          </div>

          {currentPrediction ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-gray-800/50 rounded-lg p-4">
                <div className="text-2xl font-bold text-green-400 mb-1">
                  {formatCurrency(currentPrediction.predictedRevenue)}
                </div>
                <div className="text-sm text-gray-400">Ingresos Predichos</div>
              </div>

              <div className="bg-gray-800/50 rounded-lg p-4">
                <div className="text-2xl font-bold text-blue-400 mb-1">
                  {currentPrediction.confidence}%
                </div>
                <div className="text-sm text-gray-400">Nivel de Confianza</div>
              </div>

              <div className="bg-gray-800/50 rounded-lg p-4">
                <div className="text-lg font-semibold text-white mb-2">Factores Clave</div>
                <ul className="text-sm text-gray-400 space-y-1">
                  {currentPrediction.factors.slice(0, 2).map((factor, index) => (
                    <li key={index} className="flex items-center gap-2">
                      <div className="w-1.5 h-1.5 bg-purple-400 rounded-full" />
                      {factor}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          ) : (
            <div className="text-center py-8">
              <ChartBarIcon className="w-12 h-12 text-gray-500 mx-auto mb-4" />
              <p className="text-gray-400">No hay predicción disponible para el mes actual</p>
            </div>
          )}
        </div>
      </AnimatedCard>

      {/* Predictions Chart */}
      <AnimatedCard delay={0.2}>
        <div className="p-6">
          <div className="mb-6">
            <h3 className="text-2xl font-bold text-white mb-2">
              Tendencia de Ingresos
            </h3>
            <p className="text-gray-400">
              Predicciones mensuales basadas en datos históricos y tendencias
            </p>
          </div>

          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={mockPredictions}>
                <defs>
                  <linearGradient id="predictionGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#8B5CF6" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#8B5CF6" stopOpacity={0.1}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis
                  dataKey="month"
                  stroke="#9CA3AF"
                  fontSize={12}
                />
                <YAxis
                  stroke="#9CA3AF"
                  fontSize={12}
                  tickFormatter={(value) => `${(value / 1000).toFixed(0)}k€`}
                />
                <Tooltip content={<CustomTooltip />} />
                <Area
                  type="monotone"
                  dataKey="predictedRevenue"
                  stroke="#8B5CF6"
                  strokeWidth={3}
                  fill="url(#predictionGradient)"
                />
                <Line
                  type="monotone"
                  dataKey="predictedRevenue"
                  stroke="#8B5CF6"
                  strokeWidth={3}
                  dot={{ fill: '#8B5CF6', strokeWidth: 2, r: 4 }}
                  activeDot={{ r: 6, stroke: '#8B5CF6', strokeWidth: 2 }}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          {/* Confidence Indicators */}
          <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-4">
            {mockPredictions.map((prediction, index) => (
              <motion.div
                key={prediction.month}
                className="bg-gray-800/50 rounded-lg p-4 text-center"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.3 + (index * 0.1), duration: 0.3 }}
              >
                <div className="text-lg font-bold text-white mb-1">
                  {prediction.month}
                </div>
                <div className="text-sm text-gray-400 mb-2">
                  {formatCurrency(prediction.predictedRevenue)}
                </div>
                <div className="flex items-center justify-center gap-2">
                  <div className="text-xs text-blue-400">
                    {prediction.confidence}%
                  </div>
                  <div className="w-8 h-1 bg-gray-700 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full ${
                        prediction.confidence >= 80 ? 'bg-green-500' :
                        prediction.confidence >= 60 ? 'bg-yellow-500' : 'bg-red-500'
                      }`}
                      style={{ width: `${prediction.confidence}%` }}
                    />
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </AnimatedCard>
    </div>
  )
}