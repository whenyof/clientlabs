"use client"

import { motion } from "framer-motion"
import { mockCashflowForecasts, formatCurrency } from "../mock"
import {
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon,
  ChartBarIcon,
  CalendarIcon,
  ArrowUpIcon,
  ArrowDownIcon,
  ExclamationTriangleIcon
} from "@heroicons/react/24/outline"

export function Forecast() {
  return (
    <motion.div
      className="bg-gray-800/50 backdrop-blur-sm rounded-2xl border border-gray-700/50 p-6"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.6, duration: 0.5 }}
    >
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-xl font-bold text-white mb-2">Pronóstico Financiero</h3>
          <p className="text-gray-400 text-sm">Predicciones de flujo de caja</p>
        </div>
        <div className="flex items-center gap-2 text-sm text-gray-400">
          <CalendarIcon className="w-4 h-4" />
          <span>Próximos 6 meses</span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        {/* Current Month */}
        <motion.div
          className="p-4 bg-gradient-to-br from-blue-500/10 to-purple-500/10 border border-blue-500/20 rounded-xl"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.7, duration: 0.5 }}
        >
          <div className="flex items-center gap-3 mb-3">
            <ChartBarIcon className="w-5 h-5 text-blue-400" />
            <span className="text-blue-400 font-semibold">Este mes</span>
          </div>
          <div className="text-2xl font-bold text-white mb-1">
            {formatCurrency(mockCashflowForecasts[0]?.predictedNet || 0)}
          </div>
          <div className="text-sm text-gray-400">Flujo neto previsto</div>
          <div className="mt-2 flex items-center gap-1">
            {(mockCashflowForecasts[0]?.predictedNet || 0) >= 0 ? (
              <ArrowUpIcon className="w-4 h-4 text-green-400" />
            ) : (
              <ArrowDownIcon className="w-4 h-4 text-red-400" />
            )}
            <span className={`text-sm ${
              (mockCashflowForecasts[0]?.predictedNet || 0) >= 0 ? 'text-green-400' : 'text-red-400'
            }`}>
              {(mockCashflowForecasts[0]?.predictedNet || 0) >= 0 ? 'Positivo' : 'Negativo'}
            </span>
          </div>
        </motion.div>

        {/* Next Month */}
        <motion.div
          className="p-4 bg-gradient-to-br from-green-500/10 to-emerald-500/10 border border-green-500/20 rounded-xl"
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.8, duration: 0.5 }}
        >
          <div className="flex items-center gap-3 mb-3">
            <ArrowTrendingUpIcon className="w-5 h-5 text-green-400" />
            <span className="text-green-400 font-semibold">Próximo mes</span>
          </div>
          <div className="text-2xl font-bold text-white mb-1">
            {formatCurrency(mockCashflowForecasts[1]?.predictedNet || 0)}
          </div>
          <div className="text-sm text-gray-400">Proyección mejorada</div>
          <div className="mt-2 flex items-center gap-1">
            <span className="text-xs text-gray-400">
              Confianza: {(mockCashflowForecasts[1]?.confidence || 0) * 100}%
            </span>
          </div>
        </motion.div>
      </div>

      {/* Forecast Timeline */}
      <div className="space-y-4">
        {mockCashflowForecasts.map((forecast, index) => (
          <motion.div
            key={index}
            className="p-4 bg-gray-900/50 rounded-xl border border-gray-700/50 hover:border-gray-600/50 transition-colors"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.9 + (index * 0.1), duration: 0.3 }}
          >
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-lg ${
                  forecast.predictedNet >= 0 ? 'bg-green-500/20' : 'bg-red-500/20'
                }`}>
                  {forecast.predictedNet >= 0 ? (
                    <ArrowTrendingUpIcon className={`w-4 h-4 text-green-400`} />
                  ) : (
                    <ArrowTrendingDownIcon className={`w-4 h-4 text-red-400`} />
                  )}
                </div>
                <div>
                  <div className="text-white font-medium">
                    {forecast.date.toLocaleDateString('es-ES', { month: 'long', year: 'numeric' })}
                  </div>
                  <div className="text-sm text-gray-400">
                    Confianza: {(forecast.confidence * 100).toFixed(0)}%
                  </div>
                </div>
              </div>

              <div className="text-right">
                <div className={`text-xl font-bold ${
                  forecast.predictedNet >= 0 ? 'text-green-400' : 'text-red-400'
                }`}>
                  {formatCurrency(forecast.predictedNet)}
                </div>
                <div className="text-xs text-gray-400">Flujo neto</div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <div className="text-gray-400">Ingresos previstos</div>
                <div className="text-green-400 font-semibold">
                  {formatCurrency(forecast.predictedIncome)}
                </div>
              </div>
              <div>
                <div className="text-gray-400">Gastos previstos</div>
                <div className="text-red-400 font-semibold">
                  {formatCurrency(forecast.predictedExpense)}
                </div>
              </div>
            </div>

            {/* Factors */}
            <div className="mt-3 pt-3 border-t border-gray-700/50">
              <div className="text-xs text-gray-400 mb-2">Factores considerados:</div>
              <div className="flex flex-wrap gap-2">
                {forecast.factors.map((factor, factorIndex) => (
                  <span
                    key={factorIndex}
                    className="px-2 py-1 bg-purple-500/10 text-purple-400 text-xs rounded-full"
                  >
                    {factor}
                  </span>
                ))}
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Alert */}
      <motion.div
        className="mt-6 p-4 bg-orange-500/10 border border-orange-500/20 rounded-xl"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1.2, duration: 0.5 }}
      >
        <div className="flex items-center gap-3">
          <ExclamationTriangleIcon className="w-5 h-5 text-orange-400" />
          <div>
            <div className="text-orange-400 font-medium">Atención requerida</div>
            <div className="text-sm text-gray-400">
              Proyección de flujo negativo en 2 meses. Considera estrategias de reducción de gastos.
            </div>
          </div>
        </div>
      </motion.div>
    </motion.div>
  )
}