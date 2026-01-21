"use client"

import { mockFunnelData } from "../mock"
import { FunnelIcon } from "@heroicons/react/24/outline"
import { motion } from "framer-motion"
import { AnimatedCard } from "./AnimatedCard"

interface FunnelChartProps {
  selectedRange: string
}

export function FunnelChart({ selectedRange }: FunnelChartProps) {
  const data = mockFunnelData

  return (
    <AnimatedCard className="p-6" delay={0.4}>
      <div className="flex items-center gap-3 mb-6">
        <motion.div
          className="p-2 bg-purple-600/20 rounded-lg"
          whileHover={{ scale: 1.1, rotate: 5 }}
          transition={{ type: "spring", stiffness: 300 }}
        >
          <FunnelIcon className="w-5 h-5 text-purple-400" />
        </motion.div>
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.6, duration: 0.5 }}
        >
          <h3 className="text-xl font-bold text-white">
            Embudo de conversión
          </h3>
          <p className="text-gray-400 text-sm">
            De visitantes a ventas cerradas
          </p>
        </motion.div>
      </div>

      <div className="space-y-4">
        {data.map((stage, index) => {
          const width = 100 - (index * 15) // Embudo que se estrecha
          const nextStage = data[index + 1]
          const dropoffRate = nextStage ? ((stage.count - nextStage.count) / stage.count * 100) : 0

          return (
            <motion.div
              key={stage.stage}
              className="relative"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 * index, duration: 0.5 }}
              whileHover={{ scale: 1.01 }}
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-3">
                  <motion.div
                    className="w-4 h-4 rounded-full border-2 border-white/20"
                    style={{ backgroundColor: stage.color }}
                    whileHover={{ scale: 1.2 }}
                    transition={{ type: "spring", stiffness: 400 }}
                  />
                  <span className="text-white font-medium">{stage.stage}</span>
                </div>
                <div className="text-right">
                  <motion.div
                    className="text-white font-bold"
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.3 + (0.1 * index), duration: 0.3 }}
                  >
                    {stage.count.toLocaleString('es-ES')}
                  </motion.div>
                  <div className="text-gray-400 text-sm">
                    {stage.conversion}% conversión
                  </div>
                </div>
              </div>

              {/* Barra del embudo */}
              <div className="relative h-8 bg-gray-700/50 rounded-lg overflow-hidden">
                <motion.div
                  className="h-full rounded-lg"
                  style={{
                    width: `${width}%`,
                    backgroundColor: stage.color,
                    marginLeft: `${(100 - width) / 2}%`
                  }}
                  initial={{ width: 0 }}
                  animate={{ width: `${width}%` }}
                  transition={{
                    delay: 0.5 + (0.1 * index),
                    duration: 1,
                    ease: "easeOut"
                  }}
                />

                {/* Información de dropoff */}
                {nextStage && (
                  <motion.div
                    className="absolute inset-0 flex items-center justify-center"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.8 + (0.1 * index), duration: 0.3 }}
                  >
                    <div className="bg-black/50 px-2 py-1 rounded text-xs text-white">
                      -{dropoffRate.toFixed(1)}% dropoff
                    </div>
                  </motion.div>
                )}
              </div>

              {/* Conectores del embudo */}
              {index < data.length - 1 && (
                <motion.div
                  className="flex justify-center py-1"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.4 * index, duration: 0.3 }}
                >
                  <div className="w-px h-2 bg-gray-600"></div>
                </motion.div>
              )}
            </motion.div>
          )
        })}
      </div>

      {/* Resumen */}
      <motion.div
        className="mt-6 grid grid-cols-2 gap-4 pt-4 border-t border-gray-700/50"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.8, duration: 0.5 }}
      >
        <motion.div
          className="text-center"
          whileHover={{ scale: 1.05 }}
        >
          <div className="text-2xl font-bold text-green-400 mb-1">
            {((data[data.length - 1].count / data[0].count) * 100).toFixed(1)}%
          </div>
          <div className="text-sm text-gray-400">Conversión total</div>
        </motion.div>
        <motion.div
          className="text-center"
          whileHover={{ scale: 1.05 }}
        >
          <div className="text-2xl font-bold text-red-400 mb-1">
            {((1 - data[data.length - 1].count / data[0].count) * 100).toFixed(1)}%
          </div>
          <div className="text-sm text-gray-400">Pérdida total</div>
        </motion.div>
      </motion.div>
    </AnimatedCard>
  )
}