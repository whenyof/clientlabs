export const maxDuration = 25
export const dynamic = "force-dynamic"

import { type NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

type PeriodKey = "7d" | "30d" | "MTD" | "QTD" | "YTD"
const VALID_PERIODS: PeriodKey[] = ["7d", "30d", "MTD", "QTD", "YTD"]

function getPeriodRange(period: PeriodKey): { from: Date; to: Date } {
  const now = new Date()
  let from: Date
  if (period === "7d")       from = new Date(now.getTime() - 7 * 86_400_000)
  else if (period === "30d") from = new Date(now.getTime() - 30 * 86_400_000)
  else if (period === "QTD") from = new Date(now.getFullYear(), Math.floor(now.getMonth() / 3) * 3, 1)
  else if (period === "YTD") from = new Date(now.getFullYear(), 0, 1)
  else                       from = new Date(now.getFullYear(), now.getMonth(), 1)
  return { from, to: now }
}

const PERIOD_LABELS: Record<string, string> = {
  "7d": "Últimos 7 días", "30d": "Últimos 30 días",
  MTD: "Mes en curso", QTD: "Trimestre en curso", YTD: "Año en curso",
}
const STAGE_LABELS: [string, string][] = [
  ["NEW", "Nuevo"], ["CONTACTED", "Contactado"], ["QUALIFIED", "Cualificado"],
  ["CONVERTED", "Ganado"], ["LOST", "Perdido"],
]
const MONTHS_ES = ["Ene", "Feb", "Mar", "Abr", "May", "Jun", "Jul", "Ago", "Sep", "Oct", "Nov", "Dic"]

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) return NextResponse.json({ error: "No autorizado" }, { status: 401 })
  const userId = session.user.id

  const rawPeriod = req.nextUrl.searchParams.get("period") ?? "MTD"
  const period = (VALID_PERIODS.includes(rawPeriod as PeriodKey) ? rawPeriod : "MTD") as PeriodKey
  const format = req.nextUrl.searchParams.get("format")
  if (format !== "xlsx" && format !== "pdf") {
    return NextResponse.json({ error: "Formato no válido: usa xlsx o pdf" }, { status: 400 })
  }

  const { from, to } = getPeriodRange(period)
  const now = new Date()
  const twelveMonthsAgo = new Date(now.getFullYear() - 1, now.getMonth(), 1)

  try {
    const [
      leadsActive,
      clientsActive,
      invoicedAgg,
      leadsCreated,
      conversions,
      pipelineGroups,
      sourcesGroups,
      overdueCount,
      pendingAgg,
      urgentTasks,
      revenueRaw,
    ] = await Promise.all([
      prisma.lead.count({ where: { userId, leadStatus: { in: ["QUALIFIED", "CONTACTED"] } } }),
      prisma.client.count({ where: { userId } }),
      prisma.invoice.aggregate({
        where: { userId, status: "PAID", type: "CUSTOMER", paidAt: { gte: from, lte: to } },
        _sum: { total: true },
      }),
      prisma.lead.count({ where: { userId, createdAt: { gte: from, lte: to } } }),
      prisma.lead.count({ where: { userId, leadStatus: "CONVERTED", updatedAt: { gte: from, lte: to } } }),
      prisma.lead.groupBy({ by: ["leadStatus"], where: { userId }, _count: { _all: true } }),
      prisma.lead.groupBy({ by: ["source"], where: { userId }, _count: { _all: true } }),
      prisma.invoice.count({ where: { userId, status: "OVERDUE", type: "CUSTOMER" } }),
      prisma.invoice.aggregate({
        where: { userId, status: { in: ["SENT", "OVERDUE"] }, type: "CUSTOMER" },
        _sum: { total: true },
      }),
      prisma.task.count({ where: { userId, priority: "HIGH", status: { not: "DONE" } } }),
      prisma.$queryRaw<Array<{ month: Date; revenue: number }>>`
        SELECT DATE_TRUNC('month', "paidAt") AS month,
               COALESCE(SUM(CAST(total AS FLOAT)), 0) AS revenue
        FROM "Invoice"
        WHERE "userId" = ${userId}
          AND "status" = 'PAID' AND "type" = 'CUSTOMER'
          AND "paidAt" IS NOT NULL AND "paidAt" >= ${twelveMonthsAgo}
        GROUP BY DATE_TRUNC('month', "paidAt") ORDER BY month ASC
      `,
    ])

    const invoicedAmount = Number(invoicedAgg._sum.total ?? 0)
    const pendingAmount  = Number(pendingAgg._sum.total ?? 0)
    const convRate       = leadsCreated > 0 ? (conversions / leadsCreated) * 100 : 0
    const periodLabel    = PERIOD_LABELS[period] ?? period
    const dateStr        = now.toISOString().split("T")[0]
    const fmtEurStr      = (n: number) => `${new Intl.NumberFormat("es-ES").format(Math.round(n))} €`

    const chartMap = new Map(
      revenueRaw.map((r) => {
        const d = new Date(r.month)
        return [`${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`, Number(r.revenue)]
      }),
    )
    const revenueMonths = Array.from({ length: 12 }, (_, i) => {
      const d = new Date(now.getFullYear(), now.getMonth() - 11 + i, 1)
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`
      return { month: MONTHS_ES[d.getMonth()], revenue: chartMap.get(key) ?? 0 }
    })

    const pipelineMap = new Map(pipelineGroups.map((r) => [String(r.leadStatus), r._count._all]))

    const sourceList = sourcesGroups
      .filter((r) => r.source)
      .map((r) => ({ source: r.source as string, count: r._count._all }))
      .sort((a, b) => b.count - a.count)

    // ── XLSX ────────────────────────────────────────────────────────────────
    if (format === "xlsx") {
      const ExcelJS = (await import("exceljs")).default
      const wb = new ExcelJS.Workbook()
      wb.creator = "ClientLabs"
      wb.created = now

      const s1 = wb.addWorksheet("Resumen KPIs")
      s1.columns = [
        { header: "Métrica", key: "label", width: 32 },
        { header: "Valor", key: "value", width: 24 },
      ]
      s1.getRow(1).font = { bold: true }
      s1.addRows([
        { label: "Periodo", value: periodLabel },
        { label: "Leads activos", value: leadsActive },
        { label: "Clientes activos", value: clientsActive },
        { label: `Ingresos (${periodLabel})`, value: invoicedAmount },
        { label: "Tasa de conversión", value: `${convRate.toFixed(1)} %` },
        { label: "Leads nuevos (periodo)", value: leadsCreated },
        { label: "Cobros pendientes (€)", value: pendingAmount },
        { label: "Facturas vencidas", value: overdueCount },
        { label: "Tareas urgentes (HIGH)", value: urgentTasks },
      ])

      const s2 = wb.addWorksheet("Facturación 12 meses")
      s2.columns = [
        { header: "Mes", key: "month", width: 12 },
        { header: "Ingresos (€)", key: "revenue", width: 18 },
      ]
      s2.getRow(1).font = { bold: true }
      revenueMonths.forEach((r) => s2.addRow(r))

      const s3 = wb.addWorksheet("Pipeline")
      s3.columns = [
        { header: "Etapa", key: "stage", width: 20 },
        { header: "Leads", key: "count", width: 12 },
      ]
      s3.getRow(1).font = { bold: true }
      STAGE_LABELS.forEach(([k, v]) => s3.addRow({ stage: v, count: pipelineMap.get(k) ?? 0 }))

      const s4 = wb.addWorksheet("Origen")
      s4.columns = [
        { header: "Fuente", key: "source", width: 24 },
        { header: "Leads", key: "count", width: 12 },
      ]
      s4.getRow(1).font = { bold: true }
      sourceList.forEach((r) => s4.addRow(r))

      const buffer = await wb.xlsx.writeBuffer()
      return new NextResponse(buffer as ArrayBuffer, {
        headers: {
          "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
          "Content-Disposition": `attachment; filename="dashboard-${period}-${dateStr}.xlsx"`,
        },
      })
    }

    // ── PDF ─────────────────────────────────────────────────────────────────
    const { jsPDF } = await import("jspdf")
    const pdf = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" })
    const PW = 210, PH = 297, M = 18, COL2 = 130
    let cy = 18

    const addPage = () => { pdf.addPage(); cy = 18 }
    const checkY = (h = 8) => { if (cy + h > PH - 14) addPage() }

    const setStyle = (size: number, bold: boolean, r = 0, g = 0, b = 0) => {
      pdf.setFontSize(size)
      pdf.setFont("helvetica", bold ? "bold" : "normal")
      pdf.setTextColor(r, g, b)
    }

    const dataRow = (label: string, value: string) => {
      checkY(7)
      setStyle(9.5, false, 70, 70, 70)
      pdf.text(label, M, cy)
      setStyle(9.5, true, 10, 10, 10)
      pdf.text(value, COL2, cy)
      cy += 6.5
    }

    const section = (title: string) => {
      checkY(14)
      cy += 5
      pdf.setFillColor(240, 248, 245)
      pdf.rect(M, cy - 5, PW - 2 * M, 7.5, "F")
      setStyle(10, true, 13, 105, 72)
      pdf.text(title, M, cy)
      cy += 9
    }

    // Header band
    pdf.setFillColor(22, 152, 110)
    pdf.rect(0, 0, PW, 16, "F")
    setStyle(11, true, 255, 255, 255)
    pdf.text("ClientLabs — Resumen de Dashboard", M, cy)
    cy = 26

    setStyle(9, false, 110, 110, 110)
    pdf.text(`Periodo: ${periodLabel}`, M, cy)
    cy += 5.5
    pdf.text(
      `Generado: ${now.toLocaleDateString("es-ES", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}`,
      M, cy,
    )
    cy += 12

    section("KPIs PRINCIPALES")
    dataRow("Leads activos", String(leadsActive))
    dataRow("Clientes activos", String(clientsActive))
    dataRow(`Ingresos — ${periodLabel}`, fmtEurStr(invoicedAmount))
    dataRow("Tasa de conversión", `${convRate.toFixed(1)} %`)
    dataRow("Leads nuevos (periodo)", String(leadsCreated))

    section("SALUD DE CARTERA")
    dataRow("Cobros pendientes", fmtEurStr(pendingAmount))
    dataRow("Facturas vencidas", String(overdueCount))
    dataRow("Tareas urgentes (HIGH)", String(urgentTasks))

    section("FACTURACIÓN — ÚLTIMOS 12 MESES")
    const maxRev = Math.max(...revenueMonths.map((r) => r.revenue), 1)
    const barAreaW = PW - 2 * M - 54
    revenueMonths.forEach(({ month, revenue }) => {
      checkY(6)
      setStyle(8.5, false, 90, 90, 90)
      pdf.text(month, M, cy)
      const barW = (revenue / maxRev) * barAreaW
      if (barW > 0.5) {
        pdf.setFillColor(22, 152, 110)
        pdf.rect(M + 12, cy - 3.5, barW, 3.5, "F")
      }
      setStyle(8.5, false, 50, 50, 50)
      pdf.text(fmtEurStr(revenue), M + 12 + barAreaW + 2, cy)
      cy += 5.5
    })

    section("PIPELINE POR ETAPA")
    STAGE_LABELS.forEach(([k, v]) => dataRow(v, `${pipelineMap.get(k) ?? 0} leads`))

    if (sourceList.length > 0) {
      section("ORIGEN DE OPORTUNIDADES")
      sourceList.slice(0, 8).forEach(({ source, count }) => dataRow(source, String(count)))
    }

    const totalPages = pdf.getNumberOfPages()
    for (let i = 1; i <= totalPages; i++) {
      pdf.setPage(i)
      setStyle(7, false, 160, 160, 160)
      pdf.text(`ClientLabs · Generado ${now.toLocaleDateString("es-ES")} · Confidencial`, M, PH - 6)
      pdf.text(`${i} / ${totalPages}`, PW - M, PH - 6, { align: "right" })
    }

    const pdfOutput = pdf.output("arraybuffer")
    return new NextResponse(pdfOutput, {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="dashboard-${period}-${dateStr}.pdf"`,
      },
    })
  } catch (err) {
    console.error("[GET /api/dashboard/export]:", err)
    return NextResponse.json({ error: "Error al generar el informe" }, { status: 500 })
  }
}
