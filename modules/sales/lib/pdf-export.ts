/**
 * Executive PDF Export for Sales module.
 * Generates a professional business report from real metrics. No mock data.
 */

import { jsPDF } from "jspdf"

export type SalesExecutivePDFPeriod = {
  label: string
  from: Date
  to: Date
}

export type SalesExecutivePDFKPIs = {
  revenue: number
  salesCount: number
  avgTicket: number
  growthPercent: number
}

export type SalesExecutivePDFChartPoint = {
  label: string
  revenue?: number
  count?: number
}

export type SalesExecutivePDFTopClient = {
  clientName: string
  revenue: number
}

export type SalesExecutivePDFAlert = {
  title: string
  description: string
  suggestion: string
}

export type SalesExecutivePDFOpportunity = {
  title: string
  description: string
  suggestion: string
}

export type SalesExecutivePDFData = {
  companyName?: string
  period: SalesExecutivePDFPeriod
  kpis: SalesExecutivePDFKPIs
  chartsData: SalesExecutivePDFChartPoint[]
  topClients: SalesExecutivePDFTopClient[]
  alerts: SalesExecutivePDFAlert[]
  opportunities: SalesExecutivePDFOpportunity[]
  /** Optional base64 data URL of the main chart image (e.g. from canvas). */
  chartImageDataUrl?: string
}

const MARGIN = 20
const PAGE_WIDTH = 210
const PAGE_HEIGHT = 297
const CONTENT_WIDTH = PAGE_WIDTH - MARGIN * 2

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

/**
 * Generates the Sales Executive Report PDF and returns the document for save/download.
 * No UI. Pure service. Call from client only (uses jsPDF).
 */
export function generateSalesExecutivePDF(data: SalesExecutivePDFData): jsPDF {
  const doc = new jsPDF({ unit: "mm", format: "a4" })
  const companyName = data.companyName ?? "Company"

  // --- Page 1: Cover ---
  doc.setFillColor(255, 255, 255)
  doc.rect(0, 0, PAGE_WIDTH, PAGE_HEIGHT, "F")
  doc.setTextColor(30, 30, 30)
  doc.setFontSize(28)
  doc.setFont("helvetica", "bold")
  doc.text(companyName, MARGIN, 50)
  doc.setFontSize(22)
  doc.text("Sales Executive Report", MARGIN, 70)
  doc.setFontSize(12)
  doc.setFont("helvetica", "normal")
  doc.setTextColor(80, 80, 80)
  doc.text(`Period: ${data.period.label}`, MARGIN, 95)
  doc.text(`Generated: ${formatDate(new Date())}`, MARGIN, 105)

  // --- Page 2: Executive Summary ---
  doc.addPage()
  doc.setFillColor(255, 255, 255)
  doc.rect(0, 0, PAGE_WIDTH, PAGE_HEIGHT, "F")
  doc.setTextColor(30, 30, 30)
  doc.setFontSize(18)
  doc.setFont("helvetica", "bold")
  doc.text("Executive Summary", MARGIN, 25)
  doc.setFontSize(11)
  doc.setFont("helvetica", "normal")
  doc.setTextColor(50, 50, 50)
  let y = 40
  doc.text(`Total revenue: ${formatCurrency(data.kpis.revenue)}`, MARGIN, y)
  y += 10
  doc.text(`Number of sales: ${data.kpis.salesCount}`, MARGIN, y)
  y += 10
  doc.text(`Average ticket: ${formatCurrency(data.kpis.avgTicket)}`, MARGIN, y)
  y += 10
  doc.text(`Growth rate: ${data.kpis.growthPercent > 0 ? "+" : ""}${data.kpis.growthPercent}%`, MARGIN, y)
  y += 18
  doc.setFont("helvetica", "bold")
  if (data.kpis.growthPercent > 0) {
    doc.text("Revenue increased compared to previous period.", MARGIN, y)
  } else if (data.kpis.growthPercent < 0) {
    doc.text("Revenue decreased. Attention required.", MARGIN, y)
  } else {
    doc.text("Revenue flat vs previous period.", MARGIN, y)
  }

  // --- Page 3: Sales Evolution ---
  doc.addPage()
  doc.setFillColor(255, 255, 255)
  doc.rect(0, 0, PAGE_WIDTH, PAGE_HEIGHT, "F")
  doc.setTextColor(30, 30, 30)
  doc.setFontSize(18)
  doc.setFont("helvetica", "bold")
  doc.text("Sales Evolution", MARGIN, 25)
  if (data.chartImageDataUrl) {
    try {
      doc.addImage(data.chartImageDataUrl, "PNG", MARGIN, 32, CONTENT_WIDTH, 100)
    } catch {
      doc.setFontSize(10)
      doc.setFont("helvetica", "normal")
      doc.setTextColor(100, 100, 100)
      doc.text("Chart available in dashboard.", MARGIN, 80)
    }
  } else {
    doc.setFontSize(10)
    doc.setFont("helvetica", "normal")
    doc.setTextColor(100, 100, 100)
    doc.text("Chart available in dashboard.", MARGIN, 45)
  }

  // --- Page 4: Client Analysis ---
  doc.addPage()
  doc.setFillColor(255, 255, 255)
  doc.rect(0, 0, PAGE_WIDTH, PAGE_HEIGHT, "F")
  doc.setTextColor(30, 30, 30)
  doc.setFontSize(18)
  doc.setFont("helvetica", "bold")
  doc.text("Client Analysis", MARGIN, 25)
  doc.setFontSize(10)
  doc.setFont("helvetica", "normal")
  doc.setTextColor(80, 80, 80)
  doc.text("Top clients by revenue", MARGIN, 35)
  let clientY = 48
  if (data.topClients.length === 0) {
    doc.text("No client data for this period.", MARGIN, clientY)
  } else {
    data.topClients.slice(0, 15).forEach((c, i) => {
      if (clientY > PAGE_HEIGHT - 25) return
      doc.setTextColor(40, 40, 40)
      doc.text(`${i + 1}. ${c.clientName}`, MARGIN, clientY)
      doc.text(formatCurrency(c.revenue), PAGE_WIDTH - MARGIN - 25, clientY)
      clientY += 8
    })
  }

  // --- Page 5: Alerts & Opportunities ---
  doc.addPage()
  doc.setFillColor(255, 255, 255)
  doc.rect(0, 0, PAGE_WIDTH, PAGE_HEIGHT, "F")
  doc.setTextColor(30, 30, 30)
  doc.setFontSize(18)
  doc.setFont("helvetica", "bold")
  doc.text("Alerts & Opportunities", MARGIN, 25)
  let alertY = 38
  doc.setFontSize(12)
  doc.setFont("helvetica", "bold")
  doc.text("Alerts", MARGIN, alertY)
  alertY += 8
  doc.setFontSize(10)
  doc.setFont("helvetica", "normal")
  if (data.alerts.length === 0) {
    doc.setTextColor(100, 100, 100)
    doc.text("No active alerts.", MARGIN, alertY)
    alertY += 12
  } else {
    data.alerts.forEach((a) => {
      if (alertY > PAGE_HEIGHT - 40) return
      doc.setTextColor(50, 50, 50)
      doc.text(a.title, MARGIN, alertY)
      alertY += 6
      doc.setFontSize(9)
      doc.text(a.description, MARGIN + 2, alertY)
      alertY += 5
      doc.text(a.suggestion, MARGIN + 2, alertY)
      alertY += 10
      doc.setFontSize(10)
    })
  }
  alertY += 10
  doc.setFontSize(12)
  doc.setFont("helvetica", "bold")
  doc.text("Growth Opportunities", MARGIN, alertY)
  alertY += 8
  doc.setFontSize(10)
  doc.setFont("helvetica", "normal")
  if (data.opportunities.length === 0) {
    doc.setTextColor(100, 100, 100)
    doc.text("No major growth opportunities detected.", MARGIN, alertY)
  } else {
    data.opportunities.forEach((o) => {
      if (alertY > PAGE_HEIGHT - 25) return
      doc.setTextColor(50, 50, 50)
      doc.text(o.title, MARGIN, alertY)
      alertY += 6
      doc.setFontSize(9)
      doc.text(o.description, MARGIN + 2, alertY)
      alertY += 5
      doc.text(o.suggestion, MARGIN + 2, alertY)
      alertY += 10
      doc.setFontSize(10)
    })
  }

  return doc
}

/**
 * Generates the PDF and triggers download with the given filename.
 * Call from client only.
 */
export function downloadSalesExecutivePDF(data: SalesExecutivePDFData, filename?: string): void {
  const doc = generateSalesExecutivePDF(data)
  const name = filename ?? `sales-executive-report-${new Date().toISOString().slice(0, 10)}.pdf`
  doc.save(name)
}
