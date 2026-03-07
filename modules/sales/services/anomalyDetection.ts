/**
 * Detección de anomalías en ventas mediante reglas estadísticas.
 * Sin IA ficticia. Solo Prisma y umbrales claros (±30%, etc.).
 */

import { prisma } from "@/lib/prisma"

const PAID_STATUSES = ["PAGADO", "PAID"] as const
const BASELINE_DAYS = 30
const THRESHOLD_PCT = 0.3
const CLIENT_INACTIVE_MULTIPLIER = 2

export type AnomalyType =
  | "REVENUE_DROP"
  | "REVENUE_SPIKE"
  | "SALES_DROP"
  | "SALES_SPIKE"
  | "TICKET_LOW"
  | "TICKET_HIGH"
  | "CLIENT_INACTIVE"

export type AnomalySeverity = "HIGH" | "MEDIUM" | "LOW"

export type SalesAnomaly = {
  type: AnomalyType
  severity: AnomalySeverity
  title: string
  description: string
  confidence: number
}

export type AnomalyDateRange = { from: Date; to: Date }

function safeNum(value: unknown): number {
  if (value == null || typeof value !== "number") return 0
  if (!Number.isFinite(value) || value < 0) return 0
  return value
}

async function aggregatePeriod(
  userId: string,
  from: Date,
  to: Date
): Promise<{ revenue: number; count: number }> {
  const result = await prisma.sale.aggregate({
    where: {
      userId,
      saleDate: { gte: from, lte: to },
      status: { in: [...PAID_STATUSES] },
    },
    _sum: { total: true },
    _count: true,
  })
  const revenue = safeNum(result._sum.total)
  const count = result._count
  return { revenue, count }
}

async function getClientPurchaseCounts(
  userId: string,
  from: Date,
  to: Date
): Promise<Map<string, number>> {
  const sales = await prisma.sale.findMany({
    where: {
      userId,
      clientId: { not: null },
      saleDate: { gte: from, lte: to },
      status: { in: [...PAID_STATUSES] },
    },
    select: { clientId: true },
  })
  const map = new Map<string, number>()
  for (const s of sales) {
    const id = s.clientId!
    map.set(id, (map.get(id) ?? 0) + 1)
  }
  return map
}

/**
 * Detecta anomalías comparando el periodo actual con la línea base (últimos 30 días).
 * Si no hay datos suficientes, devuelve [].
 */
export async function detectSalesAnomalies(
  userId: string,
  dateRange: AnomalyDateRange
): Promise<SalesAnomaly[]> {
  const { from, to } = dateRange
  const periodMs = to.getTime() - from.getTime()
  const periodDays = Math.max(1, Math.ceil(periodMs / (24 * 60 * 60 * 1000)))

  const baselineTo = new Date(to)
  const baselineFrom = new Date(baselineTo)
  baselineFrom.setDate(baselineFrom.getDate() - BASELINE_DAYS)

  const [baseline, current, baselineClients, currentClients] = await Promise.all([
    aggregatePeriod(userId, baselineFrom, baselineTo),
    aggregatePeriod(userId, from, to),
    getClientPurchaseCounts(userId, baselineFrom, baselineTo),
    getClientPurchaseCounts(userId, from, to),
  ])

  const anomalies: SalesAnomaly[] = []

  const baselineDailyRevenue = baseline.revenue / BASELINE_DAYS
  const baselineDailySales = baseline.count / BASELINE_DAYS
  const baselineTicket =
    baseline.count > 0 ? baseline.revenue / baseline.count : 0

  const currentDailyRevenue = current.revenue / periodDays
  const currentDailySales = current.count / periodDays
  const currentTicket =
    current.count > 0 ? current.revenue / current.count : 0

  const lowRev = baselineDailyRevenue * (1 - THRESHOLD_PCT)
  const highRev = baselineDailyRevenue * (1 + THRESHOLD_PCT)
  const lowSales = baselineDailySales * (1 - THRESHOLD_PCT)
  const highSales = baselineDailySales * (1 + THRESHOLD_PCT)
  const lowTicket = baselineTicket * (1 - THRESHOLD_PCT)
  const highTicket = baselineTicket * (1 + THRESHOLD_PCT)

  if (baseline.count > 0 || baseline.revenue > 0) {
    if (currentDailyRevenue < lowRev && baselineDailyRevenue > 0) {
      const pct = Math.round(
        ((baselineDailyRevenue - currentDailyRevenue) / baselineDailyRevenue) *
          100
      )
      anomalies.push({
        type: "REVENUE_DROP",
        severity: pct >= 50 ? "HIGH" : "MEDIUM",
        title: "Caída de ingresos",
        description: `Ingresos diarios actuales ~${pct}% por debajo de la media de los últimos ${BASELINE_DAYS} días.`,
        confidence: Math.min(0.95, 0.7 + pct / 200),
      })
    }
    if (currentDailyRevenue > highRev && baselineDailyRevenue > 0) {
      const pct = Math.round(
        ((currentDailyRevenue - baselineDailyRevenue) / baselineDailyRevenue) *
          100
      )
      anomalies.push({
        type: "REVENUE_SPIKE",
        severity: pct >= 50 ? "HIGH" : "MEDIUM",
        title: "Pico de ingresos",
        description: `Ingresos diarios actuales ~${pct}% por encima de la media de los últimos ${BASELINE_DAYS} días.`,
        confidence: Math.min(0.95, 0.7 + pct / 200),
      })
    }

    if (currentDailySales < lowSales && baselineDailySales > 0) {
      const pct = Math.round(
        ((baselineDailySales - currentDailySales) / baselineDailySales) * 100
      )
      anomalies.push({
        type: "SALES_DROP",
        severity: pct >= 50 ? "HIGH" : "MEDIUM",
        title: "Caída de número de ventas",
        description: `Ventas diarias actuales ~${pct}% por debajo de la media de los últimos ${BASELINE_DAYS} días.`,
        confidence: Math.min(0.95, 0.7 + pct / 200),
      })
    }
    if (currentDailySales > highSales && baselineDailySales > 0) {
      const pct = Math.round(
        ((currentDailySales - baselineDailySales) / baselineDailySales) * 100
      )
      anomalies.push({
        type: "SALES_SPIKE",
        severity: pct >= 50 ? "HIGH" : "MEDIUM",
        title: "Pico de ventas",
        description: `Ventas diarias actuales ~${pct}% por encima de la media de los últimos ${BASELINE_DAYS} días.`,
        confidence: Math.min(0.95, 0.7 + pct / 200),
      })
    }

    if (
      baselineTicket > 0 &&
      current.count > 0 &&
      (currentTicket < lowTicket || currentTicket > highTicket)
    ) {
      if (currentTicket < lowTicket) {
        anomalies.push({
          type: "TICKET_LOW",
          severity: "MEDIUM",
          title: "Ticket medio bajo",
          description: `El ticket medio actual está por debajo del rango habitual (media últimos ${BASELINE_DAYS} días).`,
          confidence: 0.78,
        })
      } else {
        anomalies.push({
          type: "TICKET_HIGH",
          severity: "MEDIUM",
          title: "Ticket medio alto",
          description: `El ticket medio actual está por encima del rango habitual (media últimos ${BASELINE_DAYS} días).`,
          confidence: 0.78,
        })
      }
    }
  }

  let inactiveCount = 0
  for (const [clientId, baselineCount] of baselineClients) {
    if (baselineCount === 0) continue
    const currentCount = currentClients.get(clientId) ?? 0
    if (currentCount > 0) continue
    const avgDaysBetween = BASELINE_DAYS / baselineCount
    const thresholdDays = avgDaysBetween * CLIENT_INACTIVE_MULTIPLIER
    if (periodDays >= thresholdDays) inactiveCount++
  }
  if (inactiveCount > 0) {
    anomalies.push({
      type: "CLIENT_INACTIVE",
      severity: inactiveCount >= 5 ? "HIGH" : "MEDIUM",
      title: "Clientes inactivos",
      description: `${inactiveCount} cliente(s) superan 2x su frecuencia habitual de compra sin comprar en el periodo actual.`,
      confidence: 0.82,
    })
  }

  const severityOrder = { HIGH: 0, MEDIUM: 1, LOW: 2 }
  anomalies.sort(
    (a, b) => severityOrder[a.severity] - severityOrder[b.severity]
  )

  return anomalies
}
