export const maxDuration = 25
export const dynamic = "force-dynamic"

import { type NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

// Periodos para exportar. Presets relativos (último mes/trimestre/semestre/año)
// + rango personalizado (from/to). Se mantienen las claves antiguas (7d…YTD) por
// compatibilidad con enlaces previos.
const startOfDay = (d: Date) => { const x = new Date(d); x.setHours(0, 0, 0, 0); return x }
const endOfDay = (d: Date) => { const x = new Date(d); x.setHours(23, 59, 59, 999); return x }
const subMonths = (d: Date, n: number) => new Date(d.getFullYear(), d.getMonth() - n, d.getDate())

function resolveRange(sp: URLSearchParams): { from: Date; to: Date; key: string; label: string } {
  const now = new Date()
  // Rango personalizado: ?from=YYYY-MM-DD&to=YYYY-MM-DD
  const fromStr = sp.get("from")
  const toStr = sp.get("to")
  if (fromStr && toStr) {
    const f = new Date(fromStr)
    const t = new Date(toStr)
    if (!isNaN(f.getTime()) && !isNaN(t.getTime()) && f <= t) {
      return {
        from: startOfDay(f), to: endOfDay(t), key: "personalizado",
        label: `${f.toLocaleDateString("es-ES")} – ${t.toLocaleDateString("es-ES")}`,
      }
    }
  }
  const p = sp.get("period") ?? "1m"
  let from: Date
  let label: string
  switch (p) {
    case "7d":  from = new Date(now.getTime() - 7 * 86_400_000); label = "Últimos 7 días"; break
    case "30d": from = new Date(now.getTime() - 30 * 86_400_000); label = "Últimos 30 días"; break
    case "MTD": from = new Date(now.getFullYear(), now.getMonth(), 1); label = "Mes en curso"; break
    case "QTD": from = new Date(now.getFullYear(), Math.floor(now.getMonth() / 3) * 3, 1); label = "Trimestre en curso"; break
    case "YTD": from = new Date(now.getFullYear(), 0, 1); label = "Año en curso"; break
    case "3m":  from = subMonths(now, 3); label = "Último trimestre"; break
    case "6m":  from = subMonths(now, 6); label = "Último semestre"; break
    case "12m": from = subMonths(now, 12); label = "Último año"; break
    case "1m":
    default:    from = subMonths(now, 1); label = "Último mes"; break
  }
  return { from, to: now, key: p, label }
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

  const format = req.nextUrl.searchParams.get("format")
  if (format !== "xlsx" && format !== "pdf") {
    return NextResponse.json({ error: "Formato no válido: usa xlsx o pdf" }, { status: 400 })
  }

  const { from, to, key: rangeKey, label: periodLabel } = resolveRange(req.nextUrl.searchParams)
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
    const dateStr        = now.toISOString().split("T")[0]
    const fmtEurStr      = (n: number) => `${new Intl.NumberFormat("es-ES").format(Math.round(n))} €`

    // ── Serie de 12 meses: SIEMPRE últimos 12 meses (independiente del periodo).
    //    Solo `invoicedAmount` y `leadsCreated` son del periodo; el resto (clientes,
    //    vencidas, pendiente, esta serie) son totales/independientes.
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

    // ════════════════ XLSX (pro) ════════════════
    if (format === "xlsx") {
      const ExcelJS = (await import("exceljs")).default
      const wb = new ExcelJS.Workbook()
      wb.creator = "ClientLabs"
      wb.created = now

      const TEAL = "FF0F766E", WHITE = "FFFFFFFF", ZEBRA = "FFF6FAF9", MUTED = "FF6B7280"
      const EUR = '#,##0.00\\ "€"'
      const PCT = "0.0%"
      const styleHeader = (ws: import("exceljs").Worksheet) => {
        const row = ws.getRow(1)
        row.height = 22
        row.eachCell((c) => {
          c.font = { bold: true, color: { argb: WHITE }, size: 11 }
          c.fill = { type: "pattern", pattern: "solid", fgColor: { argb: TEAL } }
          c.alignment = { vertical: "middle" }
        })
        ws.views = [{ state: "frozen", ySplit: 1 }]
      }
      const zebra = (ws: import("exceljs").Worksheet) => {
        for (let r = 2; r <= ws.rowCount; r++) {
          if (r % 2 === 1) ws.getRow(r).eachCell((c) => { c.fill = { type: "pattern", pattern: "solid", fgColor: { argb: ZEBRA } } })
        }
      }
      const dataBar = (ws: import("exceljs").Worksheet, col: string) => {
        ws.addConditionalFormatting({
          ref: `${col}2:${col}${ws.rowCount}`,
          rules: [{ type: "dataBar", cfvo: [{ type: "min" }, { type: "max" }], color: { argb: TEAL } }],
        } as unknown as Parameters<import("exceljs").Worksheet["addConditionalFormatting"]>[0])
      }

      // ── Portada ──
      const cover = wb.addWorksheet("Resumen")
      cover.columns = [{ width: 30 }, { width: 28 }]
      cover.mergeCells("A1:B1")
      const title = cover.getCell("A1")
      title.value = "ClientLabs · Informe de negocio"
      title.font = { bold: true, size: 18, color: { argb: TEAL } }
      cover.getRow(1).height = 26
      const meta: [string, string | number, string?][] = [
        ["Periodo", periodLabel],
        ["Generado", now.toLocaleDateString("es-ES", { year: "numeric", month: "long", day: "numeric" })],
        ["", ""],
        ["Ingresos del periodo", invoicedAmount, EUR],
        ["Leads nuevos (periodo)", leadsCreated],
        ["Tasa de conversión", convRate / 100, PCT],
        ["Cobros pendientes (total)", pendingAmount, EUR],
        ["Clientes en cartera (total)", clientsActive],
      ]
      meta.forEach(([k, v, fmt], i) => {
        const row = cover.getRow(i + 3)
        row.getCell(1).value = k
        row.getCell(1).font = { color: { argb: MUTED }, size: 11 }
        const c = row.getCell(2)
        c.value = v
        if (fmt) c.numFmt = fmt
        c.font = { bold: true, size: 11 }
      })

      // ── KPIs ──
      const s1 = wb.addWorksheet("KPIs")
      s1.columns = [{ header: "Métrica", key: "label", width: 34 }, { header: "Valor", key: "value", width: 22 }]
      const addKpi = (label: string, value: number, fmt?: string) => {
        const r = s1.addRow({ label, value })
        if (fmt) r.getCell(2).numFmt = fmt
      }
      addKpi(`Ingresos (${periodLabel})`, invoicedAmount, EUR)
      addKpi("Leads nuevos (periodo)", leadsCreated)
      addKpi("Tasa de conversión", convRate / 100, PCT)
      addKpi("Leads activos (total)", leadsActive)
      addKpi("Clientes en cartera (total)", clientsActive)
      addKpi("Cobros pendientes (total)", pendingAmount, EUR)
      addKpi("Facturas vencidas (total)", overdueCount)
      addKpi("Tareas urgentes HIGH (total)", urgentTasks)
      styleHeader(s1); zebra(s1)

      // ── Facturación 12 meses + barras de datos ──
      const s2 = wb.addWorksheet("Facturación 12 meses")
      s2.columns = [
        { header: "Mes", key: "month", width: 14 },
        { header: "Ingresos", key: "revenue", width: 18 },
        { header: "Gráfico", key: "bar", width: 46 },
      ]
      revenueMonths.forEach((r) => {
        const row = s2.addRow({ month: r.month, revenue: r.revenue, bar: r.revenue })
        row.getCell(2).numFmt = EUR
        row.getCell(3).numFmt = EUR
      })
      styleHeader(s2); zebra(s2); dataBar(s2, "C")

      // ── Pipeline ──
      const s3 = wb.addWorksheet("Pipeline")
      s3.columns = [
        { header: "Etapa", key: "stage", width: 22 },
        { header: "Leads", key: "count", width: 12 },
        { header: "Gráfico", key: "bar", width: 40 },
      ]
      STAGE_LABELS.forEach(([k, v]) => { const n = pipelineMap.get(k) ?? 0; s3.addRow({ stage: v, count: n, bar: n }) })
      styleHeader(s3); zebra(s3); dataBar(s3, "C")

      // ── Origen ──
      const s4 = wb.addWorksheet("Origen")
      s4.columns = [
        { header: "Fuente", key: "source", width: 26 },
        { header: "Leads", key: "count", width: 12 },
        { header: "Gráfico", key: "bar", width: 40 },
      ]
      ;(sourceList.length ? sourceList : [{ source: "—", count: 0 }]).forEach((r) =>
        s4.addRow({ source: r.source, count: r.count, bar: r.count }))
      styleHeader(s4); zebra(s4); dataBar(s4, "C")

      const buffer = await wb.xlsx.writeBuffer()
      return new NextResponse(buffer as ArrayBuffer, {
        headers: {
          "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
          "Content-Disposition": `attachment; filename="informe-${rangeKey}-${dateStr}.xlsx"`,
        },
      })
    }

    // ════════════════ PDF (pro) ════════════════
    const { jsPDF } = await import("jspdf")
    const pdf = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" })
    const PW = 210, PH = 297, M = 16, TOP = 40, BOTTOM = 16
    type RGB = [number, number, number]
    const TEAL: RGB = [15, 118, 110], TEAL_SOFT: RGB = [231, 242, 239]
    const INK: RGB = [17, 17, 17], INK2: RGB = [64, 64, 64], INK3: RGB = [115, 115, 115], LINE: RGB = [228, 231, 230]
    let cy = TOP

    const fill = (c: RGB) => pdf.setFillColor(c[0], c[1], c[2])
    const drawC = (c: RGB) => pdf.setDrawColor(c[0], c[1], c[2])
    const font = (size: number, bold: boolean, c: RGB = INK) => {
      pdf.setFontSize(size); pdf.setFont("helvetica", bold ? "bold" : "normal"); pdf.setTextColor(c[0], c[1], c[2])
    }

    const drawHeader = () => {
      fill(TEAL); pdf.rect(0, 0, PW, 26, "F")
      // marca: tres cuadraditos + nombre
      fill([159, 207, 200]); pdf.roundedRect(M, 9.5, 3, 3, 0.6, 0.6, "F")
      fill([120, 180, 170]); pdf.roundedRect(M + 4, 9.5, 3, 3, 0.6, 0.6, "F")
      fill([255, 255, 255]); pdf.roundedRect(M + 8, 9.5, 3, 3, 0.6, 0.6, "F")
      font(13, true, [255, 255, 255]); pdf.text("ClientLabs", M + 15, 12.4)
      font(8, false, [225, 238, 234]); pdf.text("Informe de negocio", M + 15, 17.4)
      font(8.5, true, [255, 255, 255]); pdf.text(periodLabel, PW - M, 11.6, { align: "right" })
      font(7.5, false, [210, 228, 223]); pdf.text(
        now.toLocaleDateString("es-ES", { year: "numeric", month: "long", day: "numeric" }), PW - M, 16.8, { align: "right" })
    }
    const ensure = (h: number) => { if (cy + h > PH - BOTTOM) { pdf.addPage(); drawHeader(); cy = TOP } }
    const sectionTitle = (t: string) => {
      ensure(12)
      font(11, true, TEAL); pdf.text(t, M, cy)
      drawC(LINE); pdf.setLineWidth(0.3); pdf.line(M, cy + 2.5, PW - M, cy + 2.5)
      cy += 9
    }

    drawHeader()

    // KPI cards
    const cardGrid = (title: string, cards: Array<{ label: string; value: string; accent?: boolean }>) => {
      sectionTitle(title)
      const gap = 6, perRow = 3, cardW = (PW - 2 * M - gap * (perRow - 1)) / perRow, cardH = 21
      for (let i = 0; i < cards.length; i += perRow) {
        const row = cards.slice(i, i + perRow)
        ensure(cardH + 2)
        row.forEach((c, j) => {
          const x = M + j * (cardW + gap), y = cy
          fill([250, 251, 250]); drawC(LINE); pdf.setLineWidth(0.3)
          pdf.roundedRect(x, y, cardW, cardH, 2, 2, "FD")
          font(7, false, INK3); pdf.text(c.label.toUpperCase(), x + 5, y + 7)
          font(15.5, true, c.accent ? TEAL : INK); pdf.text(c.value, x + 5, y + 16)
        })
        cy += cardH + gap
      }
    }

    cardGrid("Principales", [
      { label: "Ingresos · periodo", value: fmtEurStr(invoicedAmount), accent: true },
      { label: "Leads nuevos", value: String(leadsCreated) },
      { label: "Conversión", value: `${convRate.toFixed(1)}%` },
    ])
    cardGrid("Salud de cartera", [
      { label: "Clientes (total)", value: String(clientsActive) },
      { label: "Cobros pendientes", value: fmtEurStr(pendingAmount), accent: true },
      { label: "Facturas vencidas", value: String(overdueCount) },
      { label: "Leads activos", value: String(leadsActive) },
      { label: "Tareas urgentes", value: String(urgentTasks) },
    ])

    // Bar chart 12 meses
    sectionTitle("Facturación · últimos 12 meses")
    {
      const chartH = 46
      ensure(chartH + 12)
      const chartW = PW - 2 * M, baseY = cy + chartH, n = revenueMonths.length
      const maxRev = Math.max(...revenueMonths.map((r) => r.revenue), 1)
      font(6.5, false, INK3); pdf.text(fmtEurStr(maxRev), M, cy + 1)
      drawC(LINE); pdf.setLineWidth(0.3); pdf.line(M, baseY, M + chartW, baseY)
      const slot = chartW / n, barW = slot * 0.55
      revenueMonths.forEach((r, i) => {
        const h = (r.revenue / maxRev) * (chartH - 4)
        const x = M + i * slot + (slot - barW) / 2
        fill(TEAL); pdf.roundedRect(x, baseY - Math.max(h, 0.3), barW, Math.max(h, 0.3), 0.5, 0.5, "F")
        font(6, false, INK3); pdf.text(r.month, M + i * slot + slot / 2, baseY + 4, { align: "center" })
      })
      cy = baseY + 10
    }

    // Mini-barras horizontales (pipeline / origen)
    const hBars = (title: string, rows: Array<{ label: string; value: number }>) => {
      sectionTitle(title)
      const max = Math.max(...rows.map((r) => r.value), 1)
      const labelW = 44, barMax = PW - 2 * M - labelW - 16
      rows.forEach((r) => {
        ensure(7)
        font(8.5, false, INK2); pdf.text(r.label.length > 26 ? r.label.slice(0, 25) + "…" : r.label, M, cy)
        fill(TEAL_SOFT); pdf.roundedRect(M + labelW, cy - 3, barMax, 3.4, 0.6, 0.6, "F")
        fill(TEAL); pdf.roundedRect(M + labelW, cy - 3, Math.max((r.value / max) * barMax, 0.4), 3.4, 0.6, 0.6, "F")
        font(8.5, true, INK); pdf.text(String(r.value), M + labelW + barMax + 3, cy)
        cy += 7
      })
    }
    hBars("Pipeline por etapa", STAGE_LABELS.map(([k, v]) => ({ label: v, value: pipelineMap.get(k) ?? 0 })))
    if (sourceList.length > 0) hBars("Origen de oportunidades", sourceList.slice(0, 8).map((s) => ({ label: s.source, value: s.count })))

    // Footer en todas las páginas
    const totalPages = pdf.getNumberOfPages()
    for (let i = 1; i <= totalPages; i++) {
      pdf.setPage(i)
      font(7, false, [160, 160, 160])
      pdf.text("ClientLabs · Confidencial", M, PH - 7)
      pdf.text(`${i} / ${totalPages}`, PW - M, PH - 7, { align: "right" })
    }

    const pdfOutput = pdf.output("arraybuffer")
    return new NextResponse(pdfOutput, {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="informe-${rangeKey}-${dateStr}.pdf"`,
      },
    })
  } catch (err) {
    console.error("[GET /api/dashboard/export]:", err)
    return NextResponse.json({ error: "Error al generar el informe" }, { status: 500 })
  }
}
