"use client"

import { useState } from "react"
import { ExportData, exportToPDF, exportToExcel, exportToCSV } from "../lib/exportUtils"
import {
  DocumentArrowDownIcon,
  TableCellsIcon,
  DocumentTextIcon
} from "@heroicons/react/24/outline"
import { motion } from "framer-motion"

interface ExportButtonsProps {
  data: ExportData
  onExportStart?: () => void
  onExportEnd?: () => void
}

export function ExportButtons({ data, onExportStart, onExportEnd }: ExportButtonsProps) {
  const [isExporting, setIsExporting] = useState<string | null>(null)

  const handleExport = async (format: 'pdf' | 'excel' | 'csv') => {
    setIsExporting(format)
    onExportStart?.()

    try {
      switch (format) {
        case 'pdf':
          await exportToPDF(data)
          break
        case 'excel':
          exportToExcel(data)
          break
        case 'csv':
          exportToCSV(data)
          break
      }

      // Mostrar notificación de éxito (puedes implementar un toast aquí)
      console.log(`✅ Reporte exportado como ${format.toUpperCase()}`)
    } catch (error) {
      console.error(`❌ Error exportando ${format}:`, error)
      // Mostrar notificación de error
    } finally {
      setIsExporting(null)
      onExportEnd?.()
    }
  }

  const exportOptions = [
    {
      id: 'pdf',
      label: 'Exportar PDF',
      icon: DocumentArrowDownIcon,
      description: 'Informe completo con gráficos',
      color: 'hover:bg-red-600/20 hover:border-red-500/50'
    },
    {
      id: 'excel',
      label: 'Exportar Excel',
      icon: TableCellsIcon,
      description: 'Datos en formato de hoja de cálculo',
      color: 'hover:bg-green-600/20 hover:border-green-500/50'
    },
    {
      id: 'csv',
      label: 'Exportar CSV',
      icon: DocumentTextIcon,
      description: 'Datos en formato CSV simple',
      color: 'hover:bg-blue-600/20 hover:border-blue-500/50'
    }
  ]

  return (
    <motion.div
      className="bg-gray-800/50 backdrop-blur-sm rounded-2xl border border-gray-700/50 p-6"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.7, duration: 0.5 }}
    >
      <div className="flex items-center gap-3 mb-6">
        <DocumentArrowDownIcon className="w-5 h-5 text-purple-400" />
        <div>
          <h3 className="text-xl font-bold text-white">Exportar Analytics</h3>
          <p className="text-gray-400 text-sm">
            Descarga el análisis en diferentes formatos
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {exportOptions.map((option) => {
          const Icon = option.icon
          const isLoading = isExporting === option.id

          return (
            <motion.button
              key={option.id}
              onClick={() => handleExport(option.id as any)}
              disabled={isLoading}
              className={`group relative p-4 bg-gray-700/30 border border-gray-600/30 rounded-xl transition-all duration-300 ${option.color} disabled:opacity-50 disabled:cursor-not-allowed`}
              whileHover={{ scale: 1.02, y: -2 }}
              whileTap={{ scale: 0.98 }}
            >
              <div className="flex flex-col items-center text-center space-y-3">
                <motion.div
                  className={`p-3 bg-gray-600/50 rounded-lg ${isLoading ? 'animate-pulse' : ''}`}
                  whileHover={{ scale: 1.1, rotate: 5 }}
                  transition={{ type: "spring", stiffness: 400 }}
                >
                  {isLoading ? (
                    <div className="w-6 h-6 border border-current border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <Icon className="w-6 h-6 text-gray-300 group-hover:text-white" />
                  )}
                </motion.div>

                <div>
                  <div className="text-white font-medium text-sm mb-1">
                    {option.label}
                  </div>
                  <div className="text-gray-400 text-xs">
                    {option.description}
                  </div>
                </div>
              </div>

              {/* Hover effect overlay */}
              <div className="absolute inset-0 bg-gradient-to-br from-transparent to-white/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-xl" />
            </motion.button>
          )
        })}
      </div>

      {/* Información adicional */}
      <motion.div
        className="mt-6 p-4 bg-gray-700/20 rounded-lg border border-gray-600/30"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.8, duration: 0.3 }}
      >
        <div className="text-sm text-gray-400">
          <div className="flex items-center justify-between mb-2">
            <span>Reporte:</span>
            <span className="text-white font-medium">{data.title}</span>
          </div>
          <div className="flex items-center justify-between mb-2">
            <span>Rango:</span>
            <span className="text-white font-medium">{data.dateRange}</span>
          </div>
          <div className="flex items-center justify-between">
            <span>Registros:</span>
            <span className="text-white font-medium">{data.summary?.totalRecords || data.tableData.length}</span>
          </div>
        </div>
      </motion.div>
    </motion.div>
  )
}