"use client"

import { useState, useEffect } from "react"
import { useSectorConfig } from "@/hooks/useSectorConfig"
import { DashboardContainer } from "@/components/layout/DashboardContainer"
import { AnalyticsKPIs } from "./components/AnalyticsKPIs"
import { DateRangePicker } from "./components/DateRangePicker"
import { MainChart } from "./components/MainChart"
import { FunnelChart } from "./components/FunnelChart"
import { SectionTabs } from "./components/SectionTabs"
import { ActivityTable } from "./components/ActivityTable"
import { AiInsights } from "./components/AiInsights"
import { ExportButtons } from "./components/ExportButtons"
import { AnimatedCard } from "./components/AnimatedCard"
import { ChartSkeleton } from "./components/ChartSkeleton"
import {
  DocumentArrowDownIcon,
  TableCellsIcon
} from "@heroicons/react/24/outline"
import { motion } from "framer-motion"
import { ExportData } from "./lib/exportUtils"

/** Analytics/reports has no dedicated backend — no mock data. */
export default function AnalyticsPage() {
  const { labels } = useSectorConfig()
  const a = labels.analytics
  const [selectedRange, setSelectedRange] = useState("7d")
  const [isLoading, setIsLoading] = useState(false)
  const [analyticsData] = useState<ExportData | null>(null)

  const handleRangeChange = async (range: string) => {
    setIsLoading(true)
    setSelectedRange(range)
    setIsLoading(false)
  }

  return (
    <DashboardContainer>
      <div className="mb-8">
        <h1 className="text-2xl font-semibold text-white">{a.pageTitle}</h1>
        <p className="text-sm text-white/60">
          {a.pageSubtitle}
        </p>
      </div>

      <AnimatedCard className="p-6" delay={0.1}>
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3, duration: 0.5 }}
          >
            <h1 className="text-3xl font-bold bg-gradient-to-r from-white to-purple-200 bg-clip-text text-transparent">
              {a.pageTitle}
            </h1>
            <p className="text-gray-400 text-lg">
              {a.pageSubtitle}
            </p>
          </motion.div>

          <motion.div
            className="flex items-center gap-4"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4, duration: 0.5 }}
          >
            <DateRangePicker
              selectedRange={selectedRange}
              onRangeChange={handleRangeChange}
            />

            <div className="flex gap-3">
              <motion.button
                className="flex items-center gap-2 px-4 py-2 bg-gray-800 hover:bg-gray-700 text-gray-300 hover:text-white rounded-lg transition-colors border border-gray-600"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <TableCellsIcon className="w-4 h-4" />
                Exportar CSV
              </motion.button>
            </div>
          </motion.div>
        </div>
      </AnimatedCard>

        {/* KPIs */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.5 }}
        >
          <AnalyticsKPIs selectedRange={selectedRange} />
        </motion.div>

        {/* Main Chart */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.5 }}
        >
          {isLoading ? (
            <ChartSkeleton />
          ) : (
            <MainChart selectedRange={selectedRange} />
          )}
        </motion.div>

        {/* Funnel Chart */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.5 }}
        >
          <FunnelChart selectedRange={selectedRange} />
        </motion.div>

        {/* Section Tabs */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.5 }}
        >
          <SectionTabs selectedRange={selectedRange} />
        </motion.div>

        {/* Activity Table */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6, duration: 0.5 }}
        >
          <ActivityTable selectedRange={selectedRange} />
        </motion.div>

        {/* Export: no data until backend exists */}
        {analyticsData && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7, duration: 0.5 }}
          >
            <ExportButtons
              data={analyticsData}
              onExportStart={() => setIsLoading(true)}
              onExportEnd={() => setIsLoading(false)}
            />
          </motion.div>
        )}

        {/* AI Insights */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8, duration: 0.5 }}
        >
          <AiInsights />
        </motion.div>
    </DashboardContainer>
  )
}