import jsPDF from 'jspdf'
import ExcelJS from 'exceljs'

export interface ExportData {
  title: string
  dateRange: string
  kpis: Array<{
    label: string
    value: string
    change?: string
  }>
  chartData: Array<{
    label: string
    value: number
    secondaryValue?: number
  }>
  tableData: Array<Record<string, any>>
  summary?: {
    totalRecords: number
    totalValue: number
    averageValue: number
    conversionRate?: number
  }
}

// Exportar a PDF
export async function exportToPDF(data: ExportData): Promise<void> {
  const pdf = new jsPDF('p', 'mm', 'a4')
  const pageWidth = pdf.internal.pageSize.getWidth()
  const pageHeight = pdf.internal.pageSize.getHeight()
  let yPosition = 20

  // Función auxiliar para añadir texto con salto de página automático
  const addText = (text: string, fontSize = 12, fontStyle: 'normal' | 'bold' = 'normal') => {
    pdf.setFontSize(fontSize)
    pdf.setFont('helvetica', fontStyle)

    const lines = pdf.splitTextToSize(text, pageWidth - 40)
    const lineHeight = fontSize * 0.5

    lines.forEach((line: string) => {
      if (yPosition > pageHeight - 30) {
        pdf.addPage()
        yPosition = 20
      }
      pdf.text(line, 20, yPosition)
      yPosition += lineHeight
    })

    yPosition += 5 // Espacio extra
  }

  // Header
  pdf.setFontSize(20)
  pdf.setFont('helvetica', 'bold')
  pdf.text('ClientLabs - Analytics', 20, yPosition)
  yPosition += 15

  pdf.setFontSize(16)
  pdf.setFont('helvetica', 'normal')
  pdf.text(data.title, 20, yPosition)
  yPosition += 10

  pdf.setFontSize(10)
  pdf.setTextColor(100, 100, 100)
  pdf.text(`Rango: ${data.dateRange}`, 20, yPosition)
  yPosition += 5
  pdf.text(`Generado: ${new Date().toLocaleDateString('es-ES')}`, 20, yPosition)
  yPosition += 15

  // KPIs
  pdf.setTextColor(0, 0, 0)
  addText('MÉTRICAS PRINCIPALES', 14, 'bold')
  yPosition += 5

  data.kpis.forEach(kpi => {
    addText(`${kpi.label}: ${kpi.value}`, 12, 'bold')
    if (kpi.change) {
      addText(`Cambio: ${kpi.change}`, 10)
    }
    yPosition += 5
  })

  yPosition += 10

  // Datos del gráfico (simplificado)
  addText('DATOS DEL GRÁFICO', 14, 'bold')
  yPosition += 5

  data.chartData.slice(0, 10).forEach(point => {
    addText(`${point.label}: ${point.value}${point.secondaryValue ? ` (${point.secondaryValue})` : ''}`, 10)
  })

  yPosition += 10

  // Tabla de datos (primeros 20 registros)
  addText('DATOS DETALLADOS', 14, 'bold')
  yPosition += 5

  // Headers de tabla
  const tableHeaders = Object.keys(data.tableData[0] || {}).slice(0, 4)
  let xPosition = 20

  pdf.setFontSize(9)
  pdf.setFont('helvetica', 'bold')
  tableHeaders.forEach(header => {
    pdf.text(header, xPosition, yPosition)
    xPosition += 40
  })

  yPosition += 8

  // Datos de tabla
  pdf.setFont('helvetica', 'normal')
  data.tableData.slice(0, 20).forEach(row => {
    if (yPosition > pageHeight - 30) {
      pdf.addPage()
      yPosition = 20
    }

    xPosition = 20
    tableHeaders.forEach((header, index) => {
      const value = String(row[header] || '')
      pdf.text(value.substring(0, 12), xPosition, yPosition)
      xPosition += 40
    })

    yPosition += 6
  })

  // Summary
  if (data.summary) {
    yPosition += 10
    addText('RESUMEN EJECUTIVO', 14, 'bold')
    yPosition += 5

    addText(`Total de registros: ${data.summary.totalRecords}`, 10)
    addText(`Valor total: €${data.summary.totalValue.toLocaleString('es-ES')}`, 10)
    addText(`Valor promedio: €${data.summary.averageValue.toLocaleString('es-ES')}`, 10)
    if (data.summary.conversionRate) {
      addText(`Tasa de conversión: ${data.summary.conversionRate}%`, 10)
    }
  }

  // Footer
  const footerY = pageHeight - 15
  pdf.setFontSize(8)
  pdf.setTextColor(100, 100, 100)
  pdf.text('Reporte generado automáticamente por ClientLabs', 20, footerY)
  pdf.text('Confidencial - Solo para uso interno', 20, footerY + 5)

  // Descargar
  const fileName = `analytics-${new Date().toISOString().split('T')[0]}.pdf`
  pdf.save(fileName)
}

// Exportar a Excel
export async function exportToExcel(data: ExportData): Promise<void> {
  const workbook = new ExcelJS.Workbook()

  // Hoja de resumen
  const summarySheet = workbook.addWorksheet('Resumen')
  const summaryRows: (string | number)[][] = [
    ['ClientLabs - Analytics'],
    [data.title],
    [''],
    ['Información General'],
    ['Rango:', data.dateRange],
    ['Generado:', new Date().toLocaleDateString('es-ES')],
    [''],
    ['Métricas Principales'],
  ]
  data.kpis.forEach(kpi => {
    summaryRows.push([kpi.label, kpi.value])
    if (kpi.change) summaryRows.push(['Cambio', kpi.change])
    summaryRows.push([''])
  })
  if (data.summary) {
    summaryRows.push(['Resumen Ejecutivo'])
    summaryRows.push(['Total de registros', data.summary.totalRecords])
    summaryRows.push(['Valor total', data.summary.totalValue])
    summaryRows.push(['Valor promedio', data.summary.averageValue])
    if (data.summary.conversionRate) {
      summaryRows.push(['Tasa de conversión', `${data.summary.conversionRate}%`])
    }
  }
  summaryRows.forEach(row => summarySheet.addRow(row))

  // Hoja de datos
  const tableHeaders = Object.keys(data.tableData[0] || {})
  const dataSheet = workbook.addWorksheet('Datos')
  dataSheet.addRow(tableHeaders)
  data.tableData.forEach(row => dataSheet.addRow(tableHeaders.map(h => row[h] ?? '')))

  // Hoja de gráfico
  const chartSheet = workbook.addWorksheet('Gráfico')
  chartSheet.addRow(['Etiqueta', 'Valor', 'Valor Secundario'])
  data.chartData.forEach(point => chartSheet.addRow([point.label, point.value, point.secondaryValue ?? '']))

  // Descargar como blob en el navegador
  const buffer = await workbook.xlsx.writeBuffer()
  const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `analytics-${new Date().toISOString().split('T')[0]}.xlsx`
  a.click()
  URL.revokeObjectURL(url)
}

// Exportar a CSV
export function exportToCSV(data: ExportData): void {
  const headers = Object.keys(data.tableData[0] || {})
  const rows = data.tableData.map(row =>
    headers.map(header => `"${String(row[header] || '')}"`)
  )

  const csvContent = [headers, ...rows]
    .map(row => row.join(','))
    .join('\n')

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
  const link = document.createElement('a')

  if (link.download !== undefined) {
    const url = URL.createObjectURL(blob)
    link.setAttribute('href', url)
    link.setAttribute('download', `analytics-${new Date().toISOString().split('T')[0]}.csv`)
    link.style.visibility = 'hidden'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }
}