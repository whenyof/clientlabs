import { subDays } from "date-fns"
import { prisma } from "@/lib/prisma"

const TEMPERATURE_WEIGHTS: Record<string, number> = {
  HOT: 0.8,
  WARM: 0.5,
  COLD: 0.2,
}

const TREND_MIN = 0.8
const TREND_MAX = 1.2
const CONSERVATIVE_FACTOR = 0.85
const OPTIMISTIC_FACTOR = 1.1

export type SalesForecastApiResult = {
  next30: {
    base: number
    conservative: number
    optimistic: number
  }
  confidence: "HIGH" | "MEDIUM" | "LOW"
}

function amountForSale(sale: { total: number; amount?: number | null }): number {
  return Number(sale.amount ?? sale.total ?? 0)
}

/**
 * Real sales forecast: historical sales + open leads weighted by temperature + recent trend.
 * Uses last 180 days paid sales, open leads (pipeline), and 14d vs 14d trend. No mocks.
 */
export async function calculateSalesForecast(userId: string): Promise<SalesForecastApiResult> {
  const now = new Date()
  const day180 = subDays(now, 180)
  const day30 = subDays(now, 30)
  const day14 = subDays(now, 14)
  const day28 = subDays(now, 28)

  const sales = await prisma.sale.findMany({
    where: {
      userId,
      status: { in: ["PAID", "PAGADO"] },
      saleDate: { gte: day180 },
    },
    orderBy: { saleDate: "asc" },
  })

  const last30 = sales.filter((s) => s.saleDate >= day30)
  const totalLast30 = last30.reduce((a, s) => a + amountForSale(s), 0)
  const avgDailyRevenue = last30.length > 0 ? totalLast30 / 30 : 0

  const leads = await prisma.lead.findMany({
    where: {
      userId,
      leadStatus: { notIn: ["CONVERTED", "LOST"] },
    },
  })

  const defaultLeadValue = last30.length > 0 ? totalLast30 / last30.length : 0
  const pipeline = leads.reduce((sum, lead) => {
    const weight = lead.temperature ? TEMPERATURE_WEIGHTS[lead.temperature] ?? 0.2 : 0.2
    const estimatedValue = defaultLeadValue
    return sum + estimatedValue * weight
  }, 0)

  const recent14 = sales.filter((s) => s.saleDate >= day14)
  const prev14 = sales.filter(
    (s) => s.saleDate >= day28 && s.saleDate < day14
  )
  const recentTotal = recent14.reduce((a, s) => a + amountForSale(s), 0)
  const prevTotal = prev14.reduce((a, s) => a + amountForSale(s), 0)
  const recentAvg = recent14.length > 0 ? recentTotal / 14 : 0
  const prevAvg = prev14.length > 0 ? prevTotal / 14 : 0
  const trendMultiplier = prevAvg === 0 ? 1 : recentAvg / prevAvg
  const trend = Math.min(Math.max(trendMultiplier, TREND_MIN), TREND_MAX)

  const base30 = avgDailyRevenue * 30 * trend + pipeline
  const conservative = base30 * CONSERVATIVE_FACTOR
  const optimistic = base30 * OPTIMISTIC_FACTOR

  const confidence: SalesForecastApiResult["confidence"] =
    sales.length > 20 && leads.length > 5
      ? "HIGH"
      : sales.length > 10
        ? "MEDIUM"
        : "LOW"

  return {
    next30: {
      base: Math.round(base30 * 100) / 100,
      conservative: Math.round(conservative * 100) / 100,
      optimistic: Math.round(optimistic * 100) / 100,
    },
    confidence,
  }
}
