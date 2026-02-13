/**
 * Payment behaviour service: load client invoices, compute metrics + risk, upsert profile.
 * Call recalculate(clientId) when: invoice paid, invoice issued, or (optionally) overdue.
 */

import { prisma } from "@/lib/prisma"
import type { InvoiceForBehaviour } from "./payment-behaviour.engine"
import {
  computeMetrics,
  computeRiskScore,
  riskScoreToLevel,
  type RiskLevel,
} from "./payment-behaviour.engine"
import * as profileRepo from "./client-payment-profile.repository"
import type { ClientPaymentProfileRow } from "./client-payment-profile.repository"

export type PaymentProfileResult = ClientPaymentProfileRow & { riskLevel: RiskLevel }

async function loadInvoicesForClient(clientId: string): Promise<InvoiceForBehaviour[]> {
  const rows = await prisma.invoice.findMany({
    where: { clientId, type: "CUSTOMER" },
    include: { payments: true },
    orderBy: { dueDate: "desc" },
  })
  return rows.map((inv) => ({
    id: inv.id,
    total: inv.total,
    issueDate: inv.issueDate,
    dueDate: inv.dueDate,
    paidAt: inv.paidAt,
    status: inv.status,
    type: inv.type,
    payments: inv.payments.map((p) => ({ amount: p.amount, paidAt: p.paidAt })),
  }))
}

/**
 * Recalculate payment profile for a client and persist it.
 * Safe to call on every payment, issue, or when opening client/invoice.
 */
export async function recalculate(clientId: string): Promise<ClientPaymentProfileRow | null> {
  const client = await prisma.client.findUnique({
    where: { id: clientId },
    select: { id: true },
  })
  if (!client) return null

  const invoices = await loadInvoicesForClient(clientId)
  const today = new Date()
  const metrics = computeMetrics(invoices, today)
  const riskScore = computeRiskScore(metrics)

  return profileRepo.upsertProfile(clientId, metrics, riskScore)
}

/**
 * Get payment profile for a client. If not found or stale, recalculate first (e.g. when opening client).
 */
export async function getProfile(
  clientId: string,
  options: { recalculateIfMissing?: boolean } = {}
): Promise<PaymentProfileResult | null> {
  const existing = await profileRepo.getByClientId(clientId)
  if (existing) {
    return {
      ...existing,
      riskLevel: riskScoreToLevel(existing.riskScore),
    }
  }
  if (options.recalculateIfMissing) {
    const updated = await recalculate(clientId)
    if (updated) {
      return {
        ...updated,
        riskLevel: riskScoreToLevel(updated.riskScore),
      }
    }
  }
  return null
}

/**
 * Get profiles for multiple clients (e.g. invoice list). Does not auto-recalculate.
 */
export async function getProfilesByClientIds(
  clientIds: string[]
): Promise<Map<string, PaymentProfileResult>> {
  const map = await profileRepo.getByClientIds(clientIds)
  const result = new Map<string, PaymentProfileResult>()
  for (const [id, row] of map) {
    result.set(id, { ...row, riskLevel: riskScoreToLevel(row.riskScore) })
  }
  return result
}

export { riskScoreToLevel, type RiskLevel }
