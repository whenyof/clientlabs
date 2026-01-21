"use client"

import { useState, useEffect } from "react"
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
import { getKPIsForRange, getChartDataForRange, formatValue } from "./mock"
import { ExportData } from "./lib/exportUtils"

export default function AnalyticsPage() {
  const [selectedRange, setSelectedRange] = useState("7d")
  const [isLoading, setIsLoading] = useState(false)
  const [analyticsData, setAnalyticsData] = useState<ExportData | null>(null)

  const handleRangeChange = async (range: string) => {
    setIsLoading(true)
    // Simular carga al cambiar rango
    await new Promise(resolve => setTimeout(resolve, 500))
    setSelectedRange(range)
    setIsLoading(false)
  }

  // Preparar datos para exportación
  useEffect(() => {
    const kpis = getKPIsForRange(selectedRange)
    const chartData = getChartDataForRange(selectedRange)

    const exportData: ExportData = {
      title: `Análisis Analytics - ${selectedRange}`,
      dateRange: selectedRange,
      kpis: [
        {
          label: 'Ingresos Totales',
          value: formatValue(kpis.totalRevenue, 'currency'),
          change: `+${kpis.revenueGrowth}%`
        },
        {
          label: 'Leads Nuevos',
          value: kpis.newLeads.toString(),
          change: '+12.5%'
        },
        {
          label: 'Conversión',
          value: `${kpis.conversionRate}%`,
          change: `+${kpis.conversionRate}%`
        },
        {
          label: 'Crecimiento',
          value: `+${kpis.revenueGrowth}%`,
          change: `+${kpis.revenueGrowth}%`
        }
      ],
      chartData: chartData.map(point => ({
        label: point.date,
        value: point.revenue,
        secondaryValue: point.leads
      })),
      tableData: Array.from({ length: 25 }, (_, i) => ({
        fecha: new Date(Date.now() - (24 - i) * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        evento: ['Nueva venta', 'Lead convertido', 'Email enviado', 'Cliente registrado'][Math.floor(Math.random() * 4)],
        usuario: ['María García', 'Carlos Rodríguez', 'Ana López'][Math.floor(Math.random() * 3)],
        impacto: Math.floor(Math.random() * 2000) + 100,
        tipo: Math.random() > 0.5 ? 'manual' : 'automatic'
      })),
      summary: {
        totalRecords: 245,
        totalValue: kpis.totalRevenue,
        averageValue: Math.round(kpis.totalRevenue / 245),
        conversionRate: kpis.conversionRate
      }
    }

    setAnalyticsData(exportData)
  }, [selectedRange])

  return (
    <motion.div
      className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900/20 to-gray-900 p-6"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <AnimatedCard className="p-6" delay={0.1}>
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3, duration: 0.5 }}
            >
              <h1 className="text-3xl font-bold bg-gradient-to-r from-white to-purple-200 bg-clip-text text-transparent">
                Analítica avanzada
              </h1>
              <p className="text-gray-400 text-lg">
                Métricas inteligentes y reportes ejecutivos para toma de decisiones
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

        {/* Export Buttons */}
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
      </div>
    </motion.div>
  )
}