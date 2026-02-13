/**
 * ClientPaymentProfile repository: upsert and get by clientId.
 */

import { prisma } from "@/lib/prisma"
import type { PaymentBehaviourMetrics } from "./payment-behaviour.engine"

export type ClientPaymentProfileRow = {
  id: string
  clientId: string
  averageDelayDays: number
  lateRate: number
  unpaidAmount: number
  lastPaymentAt: Date | null
  riskScore: number
  totalHistoricalBilled: number
  totalHistoricalPaid: number
  updatedAt: Date
}

export async function upsertProfile(
  clientId: string,
  metrics: PaymentBehaviourMetrics,
  riskScore: number
): Promise<ClientPaymentProfileRow> {
  const row = await prisma.clientPaymentProfile.upsert({
    where: { clientId },
    create: {
      clientId,
      averageDelayDays: metrics.averagePaymentDelayDays,
      lateRate: metrics.latePaymentRate,
      unpaidAmount: metrics.unpaidAmount,
      lastPaymentAt: metrics.lastPaymentAt,
      riskScore,
      totalHistoricalBilled: metrics.totalHistoricalBilled,
      totalHistoricalPaid: metrics.totalHistoricalPaid,
    },
    update: {
      averageDelayDays: metrics.averagePaymentDelayDays,
      lateRate: metrics.latePaymentRate,
      unpaidAmount: metrics.unpaidAmount,
      lastPaymentAt: metrics.lastPaymentAt,
      riskScore,
      totalHistoricalBilled: metrics.totalHistoricalBilled,
      totalHistoricalPaid: metrics.totalHistoricalPaid,
    },
  })
  return {
    id: row.id,
    clientId: row.clientId,
    averageDelayDays: row.averageDelayDays,
    lateRate: row.lateRate,
    unpaidAmount: Number(row.unpaidAmount),
    lastPaymentAt: row.lastPaymentAt,
    riskScore: row.riskScore,
    totalHistoricalBilled: Number(row.totalHistoricalBilled),
    totalHistoricalPaid: Number(row.totalHistoricalPaid),
    updatedAt: row.updatedAt,
  }
}

export async function getByClientId(
  clientId: string
): Promise<ClientPaymentProfileRow | null> {
  const row = await prisma.clientPaymentProfile.findUnique({
    where: { clientId },
  })
  if (!row) return null
  return {
    id: row.id,
    clientId: row.clientId,
    averageDelayDays: row.averageDelayDays,
    lateRate: row.lateRate,
    unpaidAmount: Number(row.unpaidAmount),
    lastPaymentAt: row.lastPaymentAt,
    riskScore: row.riskScore,
    totalHistoricalBilled: Number(row.totalHistoricalBilled),
    totalHistoricalPaid: Number(row.totalHistoricalPaid),
    updatedAt: row.updatedAt,
  }
}

export async function getByClientIds(
  clientIds: string[]
): Promise<Map<string, ClientPaymentProfileRow>> {
  if (clientIds.length === 0) return new Map()
  const rows = await prisma.clientPaymentProfile.findMany({
    where: { clientId: { in: clientIds } },
  })
  const map = new Map<string, ClientPaymentProfileRow>()
  for (const row of rows) {
    map.set(row.clientId, {
      id: row.id,
      clientId: row.clientId,
      averageDelayDays: row.averageDelayDays,
      lateRate: row.lateRate,
      unpaidAmount: Number(row.unpaidAmount),
      lastPaymentAt: row.lastPaymentAt,
      riskScore: row.riskScore,
      totalHistoricalBilled: Number(row.totalHistoricalBilled),
      totalHistoricalPaid: Number(row.totalHistoricalPaid),
      updatedAt: row.updatedAt,
    })
  }
  return map
}
