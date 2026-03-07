/**
 * Informe ejecutivo PDF — narrativa empresarial, listo para compartir.
 * Recibe métricas, forecast, objetivos e insights. No consulta Prisma.
 * Diseño: limpio, corporativo, morado (marca), jerarquía clara.
 */

import { jsPDF } from "jspdf"

export type ExecutivePDFPeriod = {
  label: string
  from: Date
  to: Date
}

export type ExecutivePDFKPIs = {
  revenue: number
  salesCount: number
  avgTicket: number
  growthPercent: number
  /** 0-100 si hay objetivo; null si no. */
  goalCompletionPct: number | null
}

export type ExecutivePDFChartPoint = {
  label: string
  revenue: number
  count: number
}

export type ExecutivePDFTopClient = {
  clientName: string
  revenue: number
  pctOfTotal: number
}

export type ExecutivePDFClientAnalysis = {
  topClients: ExecutivePDFTopClient[]
  newClientsCount: number
  recurrentClientsCount: number
  totalClients: number
}

export type ExecutivePDFAlert = {
  title: string
  description: string
  suggestion: string
}

export type ExecutivePDFOpportunity = {
  title: string
  description: string
  suggestion: string
}

export type ExecutivePDFInput = {
  companyName?: string
  sector?: string
  period: ExecutivePDFPeriod
  kpis: ExecutivePDFKPIs
  monthlyGoal?: number | null
  chartData: ExecutivePDFChartPoint[]
  clientAnalysis: ExecutivePDFClientAnalysis
  alerts: ExecutivePDFAlert[]
  opportunities: ExecutivePDFOpportunity[]
  /** Opcional: imagen del gráfico en base64. */
  chartImageDataUrl?: string
}

const MARGIN = 22
const PAGE_WIDTH = 210
const PAGE_HEIGHT = 297
const CONTENT_WIDTH = PAGE_WIDTH - MARGIN * 2

const PURPLE = { r: 139, g: 92, b: 246 }
const PURPLE_LIGHT = { r: 167, g: 139, b: 250 }
const GRAY_DARK = { r: 55, g: 65, b: 81 }
const GRAY_MID = { r: 107, g: 114, b: 128 }
const GRAY_LIGHT = { r: 156, g: 163, b: 175 }

function formatCurrency(value: number): string {
  return new Intl.NumberFormat("es-ES", {
    style: "currency",
    currency: "EUR",
    maximumFractionDigits: 0,
    minimumFractionDigits: 0,
  }).format(value)
}

function formatDate(d: Date): string {
  return new Intl.DateTimeFormat("es-ES", {
    dateStyle: "long",
  }).format(d)
}

function setGray(doc: jsPDF, level: "dark" | "mid" | "light") {
  const c = level === "dark" ? GRAY_DARK : level === "mid" ? GRAY_MID : GRAY_LIGHT
  doc.setTextColor(c.r, c.g, c.b)
}

function setPurple(doc: jsPDF, light = false) {
  const c = light ? PURPLE_LIGHT : PURPLE
  doc.setTextColor(c.r, c.g, c.b)
}

function sectionTitle(doc: jsPDF, title: string, y: number): number {
  doc.setFontSize(16)
  doc.setFont("helvetica", "bold")
  doc.setTextColor(PURPLE.r, PURPLE.g, PURPLE.b)
  doc.text(title, MARGIN, y)
  doc.setDrawColor(PURPLE.r, PURPLE.g, PURPLE.b)
  doc.setLineWidth(0.5)
  doc.line(MARGIN, y + 2, MARGIN + 40, y + 2)
  return y + 14
}

function ensurePage(doc: jsPDF, currentY: number, needed: number): number {
  if (currentY + needed > PAGE_HEIGHT - MARGIN) {
    doc.addPage()
    doc.setFillColor(255, 255, 255)
    doc.rect(0, 0, PAGE_WIDTH, PAGE_HEIGHT, "F")
    return MARGIN
  }
  return currentY
}

/** Genera el informe ejecutivo y devuelve el documento. Sin side effects. */
export function generateExecutivePDF(input: ExecutivePDFInput): jsPDF {
  const doc = new jsPDF({ unit: "mm", format: "a4" })
  const company = input.companyName?.trim() || "Mi negocio"
  const sector = input.sector?.trim() || "Ventas"
  const periodLabel = input.period.label
  const generatedAt = formatDate(new Date())

  // ----- 1) PORTADA -----
  doc.setFillColor(250, 250, 252)
  doc.rect(0, 0, PAGE_WIDTH, PAGE_HEIGHT, "F")
  doc.setFillColor(PURPLE.r, PURPLE.g, PURPLE.b)
  doc.rect(0, 0, PAGE_WIDTH, 72, "F")
  doc.setTextColor(255, 255, 255)
  doc.setFontSize(24)
  doc.setFont("helvetica", "bold")
  doc.text(company, MARGIN, 38)
  doc.setFontSize(12)
  doc.setFont("helvetica", "normal")
  doc.text(sector, MARGIN, 48)
  doc.setFontSize(11)
  doc.text(`Periodo: ${periodLabel}`, MARGIN, 58)
  doc.setTextColor(GRAY_DARK.r, GRAY_DARK.g, GRAY_DARK.b)
  doc.setFontSize(10)
  doc.text(`Generado: ${generatedAt}`, MARGIN, 95)
  doc.text("Generado por ClientLabs", MARGIN, 102)
  setPurple(doc, true)
  doc.setFontSize(9)
  doc.text("Informe ejecutivo comercial", MARGIN, 112)

  // ----- 2) RESUMEN EJECUTIVO -----
  doc.addPage()
  doc.setFillColor(255, 255, 255)
  doc.rect(0, 0, PAGE_WIDTH, PAGE_HEIGHT, "F")
  let y = sectionTitle(doc, "Resumen ejecutivo", 22)

  const k = input.kpis
  const cardW = CONTENT_WIDTH / 2 - 4
  const cardH = 28
  const cards = [
    { label: "Ingresos totales", value: formatCurrency(k.revenue) },
    { label: "Número de ventas", value: String(k.salesCount) },
    { label: "Ticket medio", value: formatCurrency(k.avgTicket) },
    {
      label: "Crecimiento vs periodo anterior",
      value: `${k.growthPercent >= 0 ? "+" : ""}${k.growthPercent}%`,
    },
    {
      label: "Cumplimiento objetivo mensual",
      value:
        k.goalCompletionPct != null
          ? `${Math.round(k.goalCompletionPct)}%`
          : "—",
    },
  ]
  let col = 0
  let rowY = y
  cards.forEach((card, i) => {
    const x = MARGIN + col * (cardW + 8)
    doc.setDrawColor(226, 232, 240)
    doc.setLineWidth(0.3)
    doc.setFillColor(249, 250, 251)
    doc.rect(x, rowY, cardW, cardH, "FD")
    setGray(doc, "mid")
    doc.setFontSize(8)
    doc.setFont("helvetica", "normal")
    doc.text(card.label, x + 5, rowY + 10)
    doc.setFontSize(12)
    doc.setFont("helvetica", "bold")
    doc.setTextColor(GRAY_DARK.r, GRAY_DARK.g, GRAY_DARK.b)
    doc.text(card.value, x + 5, rowY + 20)
    col++
    if (col > 1) {
      col = 0
      rowY += cardH + 6
    }
  })
  y = rowY + (col === 0 ? 0 : cardH + 6) + 18

  // ----- 3) EVOLUCIÓN DEL RENDIMIENTO -----
  y = sectionTitle(doc, "Evolución del rendimiento", y)
  if (input.chartImageDataUrl) {
    try {
      const chartH = 70
      doc.addImage(
        input.chartImageDataUrl,
        "PNG",
        MARGIN,
        y,
        CONTENT_WIDTH,
        chartH
      )
      y += chartH + 10
    } catch {
      y = addTextEvolution(doc, input.chartData, y)
    }
  } else {
    y = addTextEvolution(doc, input.chartData, y)
  }

  // ----- 4) ANÁLISIS DE CLIENTES -----
  y = ensurePage(doc, y, 60)
  y = sectionTitle(doc, "Análisis de clientes", y)
  const ca = input.clientAnalysis
  if (ca.topClients.length === 0 && ca.totalClients === 0) {
    setGray(doc, "light")
    doc.setFontSize(10)
    doc.setFont("helvetica", "normal")
    doc.text("Sin datos de clientes para este periodo.", MARGIN, y)
    y += 14
  } else {
    doc.setFontSize(10)
    doc.setFont("helvetica", "normal")
    ca.topClients.slice(0, 3).forEach((c, i) => {
      doc.setTextColor(GRAY_DARK.r, GRAY_DARK.g, GRAY_DARK.b)
      doc.text(`${i + 1}. ${c.clientName}`, MARGIN, y)
      const revStr = formatCurrency(c.revenue)
      const pctStr = `${c.pctOfTotal.toFixed(1)}% del total`
      doc.text(revStr, PAGE_WIDTH - MARGIN - doc.getTextWidth(revStr), y)
      setGray(doc, "mid")
      doc.setFontSize(8)
      doc.text(pctStr, PAGE_WIDTH - MARGIN - doc.getTextWidth(pctStr), y + 4)
      doc.setFontSize(10)
      y += 10
    })
    y += 8
    setGray(doc, "mid")
    doc.setFontSize(9)
    doc.text(
      `Nuevos: ${ca.newClientsCount} · Recurrentes: ${ca.recurrentClientsCount} (Total: ${ca.totalClients} clientes)`,
      MARGIN,
      y
    )
    y += 14
  }

  // ----- 5) RIESGOS Y ALERTAS -----
  y = ensurePage(doc, y, 50)
  y = sectionTitle(doc, "Riesgos y alertas", y)
  if (input.alerts.length === 0) {
    setGray(doc, "light")
    doc.setFontSize(10)
    doc.setFont("helvetica", "normal")
    doc.text("Ninguna alerta activa en este periodo.", MARGIN, y)
    y += 14
  } else {
    input.alerts.slice(0, 5).forEach((a) => {
      doc.setFontSize(10)
      doc.setFont("helvetica", "bold")
      doc.setTextColor(GRAY_DARK.r, GRAY_DARK.g, GRAY_DARK.b)
      doc.text(a.title, MARGIN, y)
      y += 6
      doc.setFont("helvetica", "normal")
      setGray(doc, "mid")
      doc.setFontSize(9)
      const descLines = doc.splitTextToSize(a.description, CONTENT_WIDTH - 4)
      doc.text(descLines, MARGIN + 2, y)
      y += descLines.length * 5 + 2
      doc.text(`→ ${a.suggestion}`, MARGIN + 2, y)
      y += 10
    })
  }

  // ----- 6) OPORTUNIDADES -----
  y = ensurePage(doc, y, 50)
  y = sectionTitle(doc, "Oportunidades", y)
  if (input.opportunities.length === 0) {
    setGray(doc, "light")
    doc.setFontSize(10)
    doc.setFont("helvetica", "normal")
    doc.text("No se han detectado oportunidades destacadas en este periodo.", MARGIN, y)
    y += 14
  } else {
    input.opportunities.slice(0, 5).forEach((o) => {
      doc.setFontSize(10)
      doc.setFont("helvetica", "bold")
      setPurple(doc)
      doc.text(o.title, MARGIN, y)
      y += 6
      doc.setFont("helvetica", "normal")
      setGray(doc, "mid")
      doc.setFontSize(9)
      const descLines = doc.splitTextToSize(o.description, CONTENT_WIDTH - 4)
      doc.text(descLines, MARGIN + 2, y)
      y += descLines.length * 5 + 2
      doc.text(`→ ${o.suggestion}`, MARGIN + 2, y)
      y += 10
    })
  }

  // ----- 7) CIERRE -----
  y = ensurePage(doc, y, 30)
  y += 10
  doc.setDrawColor(226, 232, 240)
  doc.setLineWidth(0.3)
  doc.line(MARGIN, y, PAGE_WIDTH - MARGIN, y)
  y += 12
  setGray(doc, "mid")
  doc.setFontSize(10)
  doc.setFont("helvetica", "normal")
  doc.text(
    "Este informe resume el estado comercial del negocio para el periodo seleccionado.",
    MARGIN,
    y
  )
  y += 8
  doc.setFontSize(9)
  doc.text("Generado por ClientLabs", MARGIN, y)

  return doc
}

function addTextEvolution(
  doc: jsPDF,
  chartData: ExecutivePDFChartPoint[],
  y: number
): number {
  setGray(doc, "mid")
  doc.setFontSize(10)
  doc.setFont("helvetica", "normal")
  if (!chartData.length) {
    doc.text("No hay datos de evolución para este periodo.", MARGIN, y)
    return y + 14
  }
  const totalRev = chartData.reduce((a, p) => a + p.revenue, 0)
  const totalCount = chartData.reduce((a, p) => a + p.count, 0)
  doc.text(
    `Ingresos totales en el periodo: ${formatCurrency(totalRev)}. Ventas: ${totalCount}.`,
    MARGIN,
    y
  )
  y += 8
  const maxRev = Math.max(...chartData.map((p) => p.revenue), 1)
  const topPoints = [...chartData].sort((a, b) => b.revenue - a.revenue).slice(0, 5)
  doc.setFontSize(9)
  topPoints.forEach((p) => {
    const pct = maxRev > 0 ? (p.revenue / maxRev) * 100 : 0
    doc.text(
      `${p.label}: ${formatCurrency(p.revenue)} (${p.count} ventas)`,
      MARGIN + 2,
      y
    )
    y += 6
  })
  return y + 10
}

/** Genera el PDF y dispara la descarga. Llamar desde el cliente. */
export function downloadExecutivePDF(
  input: ExecutivePDFInput,
  filename?: string
): void {
  const doc = generateExecutivePDF(input)
  const name =
    filename ??
    `informe-ejecutivo-${new Date().toISOString().slice(0, 10)}.pdf`
  doc.save(name)
}
