"use client"

import { motion } from "framer-motion"

interface ChartSkeletonProps {
  height?: string
  showTitle?: boolean
  showMetrics?: boolean
}

export function ChartSkeleton({
  height = "h-80",
  showTitle = true,
  showMetrics = true
}: ChartSkeletonProps) {
  return (
    <div className="bg-[var(--bg-main)] backdrop-blur-sm rounded-xl border border-[var(--border-subtle)] p-6">
      {/* Header skeleton */}
      {showTitle && (
        <div className="flex justify-between items-center mb-6">
          <div className="space-y-2">
            <motion.div
              className="h-6 bg-[var(--bg-surface)] rounded-lg w-48"
              animate={{
                opacity: [0.5, 1, 0.5],
              }}
              transition={{
                duration: 1.5,
                repeat: Infinity,
                ease: "easeInOut"
              }}
            />
            <motion.div
              className="h-4 bg-[var(--bg-surface)] rounded w-64"
              animate={{
                opacity: [0.5, 1, 0.5],
              }}
              transition={{
                duration: 1.5,
                repeat: Infinity,
                ease: "easeInOut",
                delay: 0.2
              }}
            />
          </div>
          <div className="flex gap-2">
            <motion.div
              className="h-8 bg-[var(--bg-surface)] rounded-lg w-20"
              animate={{
                opacity: [0.5, 1, 0.5],
              }}
              transition={{
                duration: 1.5,
                repeat: Infinity,
                ease: "easeInOut",
                delay: 0.4
              }}
            />
            <motion.div
              className="h-8 bg-[var(--bg-surface)] rounded-lg w-20"
              animate={{
                opacity: [0.5, 1, 0.5],
              }}
              transition={{
                duration: 1.5,
                repeat: Infinity,
                ease: "easeInOut",
                delay: 0.6
              }}
            />
          </div>
        </div>
      )}

      {/* Metrics skeleton */}
      {showMetrics && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          {[0, 1, 2].map((i) => (
            <motion.div
              key={i}
              className="bg-[var(--bg-surface)] rounded-lg p-4"
              animate={{
                opacity: [0.5, 1, 0.5],
              }}
              transition={{
                duration: 1.5,
                repeat: Infinity,
                ease: "easeInOut",
                delay: 0.1 * i
              }}
            >
              <div className="flex justify-between mb-2">
                <div className="h-4 bg-[var(--border-subtle)] rounded w-16" />
                <div className="h-4 bg-[var(--border-subtle)] rounded w-12" />
              </div>
              <div className="h-6 bg-[var(--border-subtle)] rounded w-20 mb-1" />
              <div className="h-3 bg-[var(--border-subtle)] rounded w-24" />
            </motion.div>
          ))}
        </div>
      )}

      {/* Chart skeleton */}
      <div className={`bg-[var(--bg-card)] rounded-lg border border-[var(--border-subtle)] p-4 ${height}`}>
        <div className="flex items-end justify-between h-full gap-1 pb-8">
          {Array.from({ length: 10 }, (_, i) => (
            <motion.div
              key={i}
              className="flex-1 bg-[var(--bg-surface)] rounded-t"
              style={{
                height: `${Math.random() * 60 + 20}%`
              }}
              animate={{
                opacity: [0.5, 1, 0.5],
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: "easeInOut",
                delay: i * 0.1
              }}
            />
          ))}
        </div>

        {/* X-axis labels skeleton */}
        <div className="flex justify-between mt-2">
          {Array.from({ length: 5 }, (_, i) => (
            <motion.div
              key={i}
              className="h-3 bg-[var(--border-subtle)] rounded w-8"
              animate={{
                opacity: [0.5, 1, 0.5],
              }}
              transition={{
                duration: 1.5,
                repeat: Infinity,
                ease: "easeInOut",
                delay: i * 0.2
              }}
            />
          ))}
        </div>
      </div>
    </div>
  )
}