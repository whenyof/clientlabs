/**
 * Invoicing KPI Service — executive financial metrics.
 *
 * ALL calculations are server-side via aggregation queries.
 * No client-side math. No full-list fetches.
 *
 * KPIs:
 *  1. outstanding  — sum of unpaid invoices
 *  2. overdue      — sum of unpaid invoices past due
 *  3. collected    — sum paid in the selected period
 *  4. collectionRate — paid / issued in the period (0–100)
 *  5. avgDaysToPay — average(paidAt - issueDate) in days
 *  6. riskExposure — outstanding from HIGH risk clients (riskScore > 50)
 */

import { prisma } from "@/lib/prisma"

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type KPIPeriod = "month" | "quarter" | "year" | "custom"

export interface KPITimeFilter {
    period: KPIPeriod
    /** Required when period === "custom" */
    from?: string // ISO date
    to?: string   // ISO date
}

export interface InvoicingKPIs {
    outstanding: number
    overdue: number
    collected: number
    collectionRate: number   // 0–100
    avgDaysToPay: number | null
    riskExposure: number
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function resolveDateRange(filter: KPITimeFilter): { from: Date; to: Date } {
    const now = new Date()

    switch (filter.period) {
        case "month": {
            const from = new Date(now.getFullYear(), now.getMonth(), 1)
            const to = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999)
            return { from, to }
        }
        case "quarter": {
            const q = Math.floor(now.getMonth() / 3)
            const from = new Date(now.getFullYear(), q * 3, 1)
            const to = new Date(now.getFullYear(), q * 3 + 3, 0, 23, 59, 59, 999)
            return { from, to }
        }
        case "year": {
            const from = new Date(now.getFullYear(), 0, 1)
            const to = new Date(now.getFullYear(), 11, 31, 23, 59, 59, 999)
            return { from, to }
        }
        case "custom": {
            if (!filter.from || !filter.to) {
                throw new Error("Custom period requires from and to dates")
            }
            return {
                from: new Date(filter.from),
                to: new Date(new Date(filter.to).setHours(23, 59, 59, 999)),
            }
        }
    }
}

const HIGH_RISK_THRESHOLD = 51

// ---------------------------------------------------------------------------
// Main aggregation
// ---------------------------------------------------------------------------

export async function getExecutiveKPIs(
    userId: string,
    filter: KPITimeFilter
): Promise<InvoicingKPIs> {
    const { from, to } = resolveDateRange(filter)
    const now = new Date()

    // Run all aggregation queries in parallel
    const [
        outstandingResult,
        overdueResult,
        collectedResult,
        issuedInPeriodResult,
        paidInPeriodResult,
        avgDaysResult,
        riskResult,
    ] = await Promise.all([
        // 1) OUTSTANDING — sum(total - paid) for not-paid & not-cancelled invoices
        prisma.$queryRaw<[{ total: number | null }]>`
      SELECT COALESCE(SUM(
        i."total"::NUMERIC - COALESCE((
          SELECT SUM(p."amount"::NUMERIC) FROM "InvoicePayment" p WHERE p."invoiceId" = i."id"
        ), 0)
      ), 0)::FLOAT AS "total"
      FROM "Invoice" i
      WHERE i."userId" = ${userId}
        AND i."status" NOT IN ('PAID', 'CANCELED', 'DRAFT')
        AND i."type" = 'CUSTOMER'
    `,

        // 2) OVERDUE — same as outstanding but also dueDate < now
        prisma.$queryRaw<[{ total: number | null }]>`
      SELECT COALESCE(SUM(
        i."total"::NUMERIC - COALESCE((
          SELECT SUM(p."amount"::NUMERIC) FROM "InvoicePayment" p WHERE p."invoiceId" = i."id"
        ), 0)
      ), 0)::FLOAT AS "total"
      FROM "Invoice" i
      WHERE i."userId" = ${userId}
        AND i."status" NOT IN ('PAID', 'CANCELED', 'DRAFT')
        AND i."type" = 'CUSTOMER'
        AND i."dueDate" < ${now}
    `,

        // 3) COLLECTED in period — sum of total for invoices PAID within the date range
        prisma.$queryRaw<[{ total: number | null }]>`
      SELECT COALESCE(SUM(i."total"::NUMERIC), 0)::FLOAT AS "total"
      FROM "Invoice" i
      WHERE i."userId" = ${userId}
        AND i."status" = 'PAID'
        AND i."type" = 'CUSTOMER'
        AND i."paidAt" >= ${from}
        AND i."paidAt" <= ${to}
    `,

        // 4a) Count of invoices issued in period (for collection rate denominator)
        prisma.$queryRaw<[{ cnt: bigint }]>`
      SELECT COUNT(*)::BIGINT AS "cnt"
      FROM "Invoice" i
      WHERE i."userId" = ${userId}
        AND i."type" = 'CUSTOMER'
        AND i."status" != 'DRAFT'
        AND i."issueDate" >= ${from}
        AND i."issueDate" <= ${to}
    `,

        // 4b) Count of invoices paid in period (for collection rate numerator)
        prisma.$queryRaw<[{ cnt: bigint }]>`
      SELECT COUNT(*)::BIGINT AS "cnt"
      FROM "Invoice" i
      WHERE i."userId" = ${userId}
        AND i."type" = 'CUSTOMER'
        AND i."status" = 'PAID'
        AND i."paidAt" >= ${from}
        AND i."paidAt" <= ${to}
    `,

        // 5) AVG DAYS TO PAY — average(paidAt - issueDate) for paid invoices
        prisma.$queryRaw<[{ avg_days: number | null }]>`
      SELECT AVG(EXTRACT(EPOCH FROM (i."paidAt" - i."issueDate")) / 86400)::FLOAT AS "avg_days"
      FROM "Invoice" i
      WHERE i."userId" = ${userId}
        AND i."status" = 'PAID'
        AND i."type" = 'CUSTOMER'
        AND i."paidAt" IS NOT NULL
    `,

        // 6) RISK EXPOSURE — outstanding from clients with riskScore > threshold
        prisma.$queryRaw<[{ total: number | null }]>`
      SELECT COALESCE(SUM(
        i."total"::NUMERIC - COALESCE((
          SELECT SUM(p."amount"::NUMERIC) FROM "InvoicePayment" p WHERE p."invoiceId" = i."id"
        ), 0)
      ), 0)::FLOAT AS "total"
      FROM "Invoice" i
      INNER JOIN "ClientPaymentProfile" cpp ON cpp."clientId" = i."clientId"
      WHERE i."userId" = ${userId}
        AND i."status" NOT IN ('PAID', 'CANCELED', 'DRAFT')
        AND i."type" = 'CUSTOMER'
        AND cpp."riskScore" >= ${HIGH_RISK_THRESHOLD}
    `,
    ])

    // Parse results
    const outstanding = outstandingResult[0]?.total ?? 0
    const overdue = overdueResult[0]?.total ?? 0
    const collected = collectedResult[0]?.total ?? 0

    const issuedCount = Number(issuedInPeriodResult[0]?.cnt ?? BigInt(0))
    const paidCount = Number(paidInPeriodResult[0]?.cnt ?? BigInt(0))
    const collectionRate = issuedCount > 0
        ? Math.round((paidCount / issuedCount) * 10000) / 100
        : 0

    const avgDaysRaw = avgDaysResult[0]?.avg_days
    const avgDaysToPay = avgDaysRaw != null ? Math.round(avgDaysRaw * 10) / 10 : null

    const riskExposure = riskResult[0]?.total ?? 0

    return {
        outstanding: Math.round(outstanding * 100) / 100,
        overdue: Math.round(overdue * 100) / 100,
        collected: Math.round(collected * 100) / 100,
        collectionRate,
        avgDaysToPay,
        riskExposure: Math.round(riskExposure * 100) / 100,
    }
}
