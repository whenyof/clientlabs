/**
 * Client 360 — Financial Risk Score (server-side only)
 *
 * Computes a composite risk score (0–100) for a client based on:
 *   - Historical payment delays
 *   - Average payment days
 *   - Overdue invoices
 *   - Pending volume
 *
 * Single DB round-trip via raw SQL. No schema changes required.
 */

import { prisma } from "@/lib/prisma"

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type RiskLevel = "low" | "medium" | "high"

export interface ClientFinancialRisk {
    /** Composite risk score 0–100 */
    score: number
    /** Human-readable level */
    level: RiskLevel
    /** Label in Spanish */
    label: string

    // ── Indicators ──
    /** Average delay in days (for invoices paid after due date). 0 if none late. */
    avgDelayDays: number
    /** Worst single delay ever recorded (days). 0 if none late. */
    worstDelayDays: number
    /** Total invoices sent (non-draft, non-cancelled) */
    invoicesSent: number
    /** Total invoices fully paid */
    invoicesPaid: number
    /** Total overdue invoice count */
    overdueCount: number
    /** Total overdue amount (EUR) */
    overdueAmount: number
    /** Total pending amount (EUR) */
    pendingAmount: number
    /** Average days to payment (from issue to paid, for paid invoices) */
    avgPaymentDays: number

    /** Optional human-readable reasons (what contributes to the score) */
    reasons: string[]
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function scoreToLevel(score: number): RiskLevel {
    if (score <= 30) return "low"
    if (score <= 65) return "medium"
    return "high"
}

function levelToLabel(level: RiskLevel): string {
    switch (level) {
        case "low": return "Bajo"
        case "medium": return "Medio"
        case "high": return "Alto"
    }
}

// ---------------------------------------------------------------------------
// Main query
// ---------------------------------------------------------------------------

export async function getClientFinancialRisk(
    clientId: string,
    userId: string,
): Promise<ClientFinancialRisk> {
    type Row = {
        invoicesSent: number | null
        invoicesPaid: number | null
        overdueCount: number | null
        overdueAmount: number | null
        pendingAmount: number | null
        avgPaymentDays: number | null
        avgDelayDays: number | null
        worstDelayDays: number | null
        lateCount: number | null
        lateSharePercent: number | null
    }

    const rows = await prisma.$queryRawUnsafe<Row[]>(
        `
    WITH
      inv AS (
        SELECT
          i."id",
          i."total"::NUMERIC         AS "total",
          i."issueDate",
          i."dueDate",
          i."paidAt",
          i."status",
          COALESCE((
            SELECT SUM(p."amount"::NUMERIC)
            FROM "InvoicePayment" p
            WHERE p."invoiceId" = i."id"
          ), 0) AS "paidAmount"
        FROM "Invoice" i
        WHERE i."userId"   = $1
          AND i."clientId" = $2
          AND i."type"     = 'CUSTOMER'
          AND i."status"  NOT IN ('DRAFT', 'CANCELED')
      ),

      paid_inv AS (
        SELECT *,
          EXTRACT(DAY FROM ("paidAt" - "issueDate"))::INT AS "payDays",
          CASE
            WHEN "paidAt" > "dueDate"
            THEN EXTRACT(DAY FROM ("paidAt" - "dueDate"))::INT
            ELSE 0
          END AS "delayDays"
        FROM inv
        WHERE "status" = 'PAID' AND "paidAt" IS NOT NULL
      ),

      overdue AS (
        SELECT
          COUNT(*)::INT AS "cnt",
          COALESCE(SUM("total" - "paidAmount"), 0)::FLOAT AS "amt"
        FROM inv
        WHERE "status" NOT IN ('PAID')
          AND "dueDate" < NOW()
      ),

      pending AS (
        SELECT
          COALESCE(SUM("total" - "paidAmount"), 0)::FLOAT AS "amt"
        FROM inv
        WHERE "status" NOT IN ('PAID')
      )

    SELECT
      (SELECT COUNT(*)::INT FROM inv)              AS "invoicesSent",
      (SELECT COUNT(*)::INT FROM paid_inv)          AS "invoicesPaid",
      overdue."cnt"                                 AS "overdueCount",
      overdue."amt"                                 AS "overdueAmount",
      pending."amt"                                 AS "pendingAmount",

      (SELECT COALESCE(AVG("payDays"), 0)::FLOAT
       FROM paid_inv)                               AS "avgPaymentDays",

      (SELECT COALESCE(AVG(CASE WHEN "delayDays" > 0 THEN "delayDays" END), 0)::FLOAT
       FROM paid_inv)                               AS "avgDelayDays",

      (SELECT COALESCE(MAX("delayDays"), 0)::INT
       FROM paid_inv)                               AS "worstDelayDays",

      (SELECT COUNT(*)::INT
       FROM paid_inv WHERE "delayDays" > 0)         AS "lateCount",

      CASE
        WHEN (SELECT COUNT(*) FROM paid_inv) > 0
        THEN ((SELECT COUNT(*) FROM paid_inv WHERE "delayDays" > 0)::FLOAT
              / (SELECT COUNT(*) FROM paid_inv)::FLOAT * 100)
        ELSE 0
      END::FLOAT                                    AS "lateSharePercent"

    FROM overdue, pending
    `,
        userId,
        clientId,
    )

    const r = rows[0]

    // No data at all → minimal risk, no history
    if (!r || (r.invoicesSent ?? 0) === 0) {
        return {
            score: 0,
            level: "low",
            label: "Bajo",
            avgDelayDays: 0,
            worstDelayDays: 0,
            invoicesSent: 0,
            invoicesPaid: 0,
            overdueCount: 0,
            overdueAmount: 0,
            pendingAmount: 0,
            avgPaymentDays: 0,
            reasons: ["Sin historial de facturación"],
        }
    }

    // ── Scoring engine ──
    const reasons: string[] = []
    let score = 10 // base

    const invoicesSent = r.invoicesSent ?? 0
    const invoicesPaid = r.invoicesPaid ?? 0
    const overdueCount = r.overdueCount ?? 0
    const overdueAmount = round2(r.overdueAmount ?? 0)
    const pendingAmount = round2(r.pendingAmount ?? 0)
    const avgPaymentDays = Math.round(r.avgPaymentDays ?? 0)
    const avgDelayDays = Math.round(r.avgDelayDays ?? 0)
    const worstDelayDays = r.worstDelayDays ?? 0
    const lateCount = r.lateCount ?? 0
    const lateSharePercent = Math.round(r.lateSharePercent ?? 0)

    // R1: Overdue invoices exist
    if (overdueCount > 0) {
        score += Math.min(25, overdueCount * 10)
        reasons.push(
            overdueCount === 1
                ? `1 factura vencida (${formatEur(overdueAmount)})`
                : `${overdueCount} facturas vencidas (${formatEur(overdueAmount)})`,
        )
    }

    // R2: High overdue / total pending ratio
    if (pendingAmount > 0 && overdueAmount / pendingAmount > 0.5) {
        score += 10
        reasons.push("Más del 50% del volumen pendiente está vencido")
    }

    // R3: Average delay days
    if (avgDelayDays > 30) {
        score += 15
        reasons.push(`Retraso medio de ${avgDelayDays} días (>30)`)
    } else if (avgDelayDays > 15) {
        score += 8
        reasons.push(`Retraso medio de ${avgDelayDays} días (>15)`)
    } else if (avgDelayDays > 7) {
        score += 4
        reasons.push(`Retraso medio de ${avgDelayDays} días`)
    }

    // R4: Worst delay
    if (worstDelayDays > 60) {
        score += 10
        reasons.push(`Peor retraso histórico: ${worstDelayDays} días`)
    } else if (worstDelayDays > 30) {
        score += 5
        reasons.push(`Peor retraso histórico: ${worstDelayDays} días`)
    }

    // R5: High share of late payments
    if (lateSharePercent > 50) {
        score += 12
        reasons.push(`${lateSharePercent}% de facturas pagadas con retraso`)
    } else if (lateSharePercent > 25) {
        score += 6
        reasons.push(`${lateSharePercent}% de facturas pagadas con retraso`)
    }

    // R6: Average payment time > 30 days
    if (avgPaymentDays > 45) {
        score += 10
        reasons.push(`Tiempo medio de pago: ${avgPaymentDays} días (>45)`)
    } else if (avgPaymentDays > 30) {
        score += 5
        reasons.push(`Tiempo medio de pago: ${avgPaymentDays} días (>30)`)
    }

    // Positive signals (reduce score)
    if (lateCount === 0 && invoicesPaid >= 3) {
        score -= 10
        reasons.push("Historial limpio: sin retrasos registrados")
    }

    if (invoicesPaid > 0 && invoicesPaid === invoicesSent && overdueCount === 0) {
        score -= 5
        reasons.push("100% de facturas pagadas")
    }

    // Clamp
    score = Math.max(0, Math.min(100, Math.round(score)))
    const level = scoreToLevel(score)

    return {
        score,
        level,
        label: levelToLabel(level),
        avgDelayDays,
        worstDelayDays,
        invoicesSent,
        invoicesPaid,
        overdueCount,
        overdueAmount,
        pendingAmount,
        avgPaymentDays,
        reasons,
    }
}

// ---------------------------------------------------------------------------
// Utils
// ---------------------------------------------------------------------------

function round2(v: number): number {
    return Math.round(v * 100) / 100
}

function formatEur(v: number): string {
    return new Intl.NumberFormat("es-ES", {
        style: "currency",
        currency: "EUR",
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
    }).format(v)
}
