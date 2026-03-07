/**
 * Predicción por cliente: segmentación basada en reglas (RFM-style).
 * Sin IA externa, sin APIs, sin ML. Solo ventas reales desde Prisma.
 */

import { prisma } from "@/lib/prisma"

const PAID_STATUSES = ["PAGADO", "PAID"] as const

export type ClientSegment =
  | "VIP"
  | "LOYAL"
  | "OPPORTUNITY"
  | "RISK"
  | "LOST"

export type ClientPredictionItem = {
  clientId: string
  name: string
  email: string | null
  lastPurchase: string
  totalSpent: number
  purchases: number
  segment: ClientSegment
}

export type ClientPredictionsResult = {
  segments: {
    VIP: number
    LOYAL: number
    OPPORTUNITY: number
    RISK: number
    LOST: number
  }
  clients: ClientPredictionItem[]
}

const RECENCY_LOST_DAYS = 180
const RECENCY_RISK_DAYS = 90
const RECENCY_VIP_DAYS = 30
const RECENCY_LOYAL_DAYS = 90
const MIN_FREQ_VIP = 5
const MIN_FREQ_LOYAL = 3
const VIP_TOP_PERCENT = 0.25

export async function buildClientPredictions(
  userId: string
): Promise<ClientPredictionsResult> {
  const sales = await prisma.sale.findMany({
    where: {
      userId,
      clientId: { not: null },
      status: { in: [...PAID_STATUSES] },
    },
    select: {
      clientId: true,
      clientName: true,
      clientEmail: true,
      saleDate: true,
      total: true,
      amount: true,
    },
    orderBy: { saleDate: "desc" },
  })

  const byClient = new Map<
    string,
    { name: string; email: string | null; dates: Date[]; totalSpent: number }
  >()

  for (const s of sales) {
    const cid = s.clientId!
    const amount = Number(s.amount ?? s.total ?? 0)
    const existing = byClient.get(cid)
    if (existing) {
      existing.dates.push(s.saleDate)
      existing.totalSpent += amount
      if (s.clientName?.trim()) existing.name = s.clientName
      if (s.clientEmail?.trim()) existing.email = s.clientEmail
    } else {
      byClient.set(cid, {
        name: s.clientName?.trim() || "Sin nombre",
        email: s.clientEmail?.trim() ?? null,
        dates: [s.saleDate],
        totalSpent: amount,
      })
    }
  }

  const now = new Date()
  const oneDayMs = 24 * 60 * 60 * 1000

  const aggregated: Array<{
    clientId: string
    name: string
    email: string | null
    lastPurchase: Date
    totalSpent: number
    purchases: number
    recencyDays: number
  }> = []

  for (const [clientId, data] of byClient.entries()) {
    const lastPurchase = new Date(
      Math.max(...data.dates.map((d) => d.getTime()))
    )
    const recencyDays = Math.floor(
      (now.getTime() - lastPurchase.getTime()) / oneDayMs
    )
    aggregated.push({
      clientId,
      name: data.name,
      email: data.email,
      lastPurchase,
      totalSpent: data.totalSpent,
      purchases: data.dates.length,
      recencyDays,
    })
  }

  const vipCandidates = aggregated.filter(
    (c) => c.purchases >= MIN_FREQ_VIP && c.recencyDays <= RECENCY_VIP_DAYS
  )
  const sortedVipBySpent = [...vipCandidates].sort(
    (a, b) => b.totalSpent - a.totalSpent
  )
  const vipCount = sortedVipBySpent.length
  const vipTopIndex = Math.max(
    0,
    Math.floor(vipCount * (1 - VIP_TOP_PERCENT)) - 1
  )
  const minSpentForVip =
    vipCount > 0 ? sortedVipBySpent[vipTopIndex]?.totalSpent ?? 0 : 0

  const segments: ClientPredictionsResult["segments"] = {
    VIP: 0,
    LOYAL: 0,
    OPPORTUNITY: 0,
    RISK: 0,
    LOST: 0,
  }

  const clients: ClientPredictionItem[] = aggregated.map((c) => {
    const segment = assignSegment(c, minSpentForVip)
    segments[segment]++
    return {
      clientId: c.clientId,
      name: c.name,
      email: c.email,
      lastPurchase: c.lastPurchase.toISOString(),
      totalSpent: c.totalSpent,
      purchases: c.purchases,
      segment,
    }
  })

  return { segments, clients }
}

function assignSegment(
  c: {
    recencyDays: number
    purchases: number
    totalSpent: number
  },
  minSpentForVip: number
): ClientSegment {
  if (c.recencyDays > RECENCY_LOST_DAYS) return "LOST"
  if (c.recencyDays > RECENCY_RISK_DAYS) return "RISK"

  const vipOk =
    c.purchases >= MIN_FREQ_VIP &&
    c.recencyDays <= RECENCY_VIP_DAYS &&
    c.totalSpent >= minSpentForVip
  if (vipOk) return "VIP"

  if (c.purchases >= MIN_FREQ_LOYAL && c.recencyDays <= RECENCY_LOYAL_DAYS) {
    return "LOYAL"
  }

  if (c.recencyDays <= RECENCY_LOYAL_DAYS) return "OPPORTUNITY"

  return "RISK"
}
