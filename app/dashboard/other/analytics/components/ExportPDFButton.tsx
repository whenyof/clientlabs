"use client"

import { useState } from "react"
import { DocumentArrowDownIcon } from "@heroicons/react/24/outline"
import { motion } from "framer-motion"
import html2canvas from 'html2canvas'
import jsPDF from 'jspdf'

interface ExportPDFButtonProps {
  selectedRange: string
  onExport?: () => void
}

export function ExportPDFButton({ selectedRange, onExport }: ExportPDFButtonProps) {
  const [isExporting, setIsExporting] = useState(false)

  const getRangeLabel = (range: string) => {
    const labels = {
      "1d": "Hoy",
      "7d": "Últimos 7 días",
      "15d": "Últimos 15 días",
      "30d": "Últimos 30 días",
      "90d": "Últimos 90 días",
      "1y": "Último año",
      "custom": "Rango personalizado"
    }
    return labels[range as keyof typeof labels] || range
  }

  const generatePDF = async () => {
    setIsExporting(true)
    try {
      const element = document.querySelector('[data-pdf-content="true"]') as HTMLElement

      if (!element) {
        console.error('No se encontró el elemento para exportar')
        return
      }

      // Capturar el contenido
      const canvas = await html2canvas(element, {
        scale: 2,
        useCORS: true,
        backgroundColor: '#0f172a', // bg-gray-900
        width: 1200,
        height: 1600
      })

      // Crear PDF
      const imgData = canvas.toDataURL('image/png')
      const pdf = new jsPDF('p', 'mm', 'a4')

      // Dimensiones A4
      const pdfWidth = pdf.internal.pageSize.getWidth()
      const pdfHeight = pdf.internal.pageSize.getHeight()

      // Calcular dimensiones de la imagen
      const imgWidth = canvas.width
      const imgHeight = canvas.height
      const ratio = Math.min(pdfWidth / imgWidth, pdfHeight / imgHeight)
      const imgX = (pdfWidth - imgWidth * ratio) / 2
      const imgY = 20

      // Agregar título y metadata
      pdf.setFontSize(20)
      pdf.setTextColor(255, 255, 255)
      pdf.text('Informe de Analytics - ClientLabs', 20, 15)

      pdf.setFontSize(12)
      pdf.setTextColor(156, 163, 175) // text-gray-400
      pdf.text(`Rango: ${getRangeLabel(selectedRange)}`, 20, 25)
      pdf.text(`Generado: ${new Date().toLocaleDateString('es-ES')}`, 20, 32)

      // Agregar imagen del dashboard
      pdf.addImage(imgData, 'PNG', imgX, imgY, imgWidth * ratio, imgHeight * ratio)

      // Descargar PDF
      pdf.save(`analytics-${selectedRange}-${new Date().toISOString().split('T')[0]}.pdf`)

      onExport?.()
    } catch (error) {
      console.error('Error generando PDF:', error)
    } finally {
      setIsExporting(false)
    }
  }

  return (
    <motion.button
      onClick={generatePDF}
      disabled={isExporting}
      className="flex items-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 disabled:bg-purple-800 text-white font-medium rounded-lg transition-colors disabled:cursor-not-allowed"
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
    >
      {isExporting ? (
        <>
          <div className="w-4 h-4 border border-white border-t-transparent rounded-full animate-spin" />
          <span>Generando PDF...</span>
        </>
      ) : (
        <>
          <DocumentArrowDownIcon className="w-4 h-4" />
          <span>Exportar informe</span>
        </>
      )}
    </motion.button>
  )
}