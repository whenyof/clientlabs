// @ts-nocheck
"use client"

import { FunnelIcon } from "@heroicons/react/24/outline"
import { motion } from "framer-motion"
import { AnimatedCard } from "./AnimatedCard"

interface FunnelChartProps {
  selectedRange: string
}

/** No funnel backend — empty state. */
export function FunnelChart({ selectedRange: _selectedRange }: FunnelChartProps) {
  const data: { stage: string; count: number; label: string }[] = []

  return (
    <AnimatedCard className="p-6" delay={0.4}>
      <div className="flex items-center gap-3 mb-6">
        <motion.div
          className="p-2 bg-purple-600/20 rounded-lg"
          whileHover={{ scale: 1.1, rotate: 5 }}
        >
          <FunnelIcon className="w-5 h-5 text-purple-400" />
        </motion.div>

        <div>
          <h3 className="text-xl font-bold text-white">
            Embudo de conversión
          </h3>
          <p className="text-gray-400 text-sm">
            De visitantes a ventas cerradas
          </p>
        </div>
      </div>

      {data.length === 0 ? (
        <div className="py-12 text-center text-gray-400">
          <p className="text-white/80">Sin datos de embudo</p>
          <p className="text-sm mt-1">No hay métricas de visitantes/embudo en el backend.</p>
        </div>
      ) : (
      <div className="space-y-4">
        {data.map((stage, index) => {
          const width = 100 - index * 15
          const nextStage = data[index + 1]
          const dropoffRate = nextStage
            ? ((stage.count - nextStage.count) / stage.count) * 100
            : 0

          return (
            <FunnelStage
              key={stage.stage}
              stage={stage}
              index={index}
              width={width}
              nextStage={nextStage}
              dropoffRate={dropoffRate}
            />
          )
        })}
      </div>
      )}
    </AnimatedCard>
  )
}

// Separate component to use the hook
function FunnelStage({
  stage,
  index,
  width,
  nextStage,
  dropoffRate
}: {
  stage: any
  index: number
  width: number
  nextStage: any
  dropoffRate: number
}) {
  const formattedCount = useClientNumber(stage.count, "es-ES")

  return (
    <motion.div
      className="relative"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.15 * index }}
    >
      <div className="flex justify-between mb-2">
        <span className="text-white font-medium">
          {stage.stage}
        </span>

        <div className="text-right">
          <div className="text-white font-bold">
            {formattedCount}
          </div>
          <div className="text-gray-400 text-sm">
            {stage.conversion}% conversión
          </div>
        </div>
      </div>

      <div className="relative h-8 bg-gray-700/50 rounded-lg">
        <motion.div
          className="h-full rounded-lg"
          style={{
            width: `${width}%`,
            backgroundColor: stage.color,
            marginLeft: `${(100 - width) / 2}%`,
          }}
          initial={{ width: 0 }}
          animate={{ width: `${width}%` }}
        />

        {nextStage && (
          <div className="absolute inset-0 flex items-center justify-center text-xs text-white bg-black/40 rounded">
            -{dropoffRate.toFixed(1)}% dropoff
          </div>
        )}
      </div>
    </motion.div>
  )
}