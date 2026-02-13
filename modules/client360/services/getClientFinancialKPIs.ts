/**
 * Client 360 — Financial KPIs (server-side only)
 *
 * Computes all 6 client KPIs in a single DB round-trip using raw SQL
 * aggregation against the Invoice + InvoicePayment tables.
 *
 * Only CUSTOMER-type invoices are included. DRAFTs and CANCELED excluded.
 */

import { prisma } from "@/lib/prisma"

// ---------------------------------------------------------------------------
// Return type
// ---------------------------------------------------------------------------

export interface ClientFinancialKPIs {
    /** Sum of all non-cancelled CUSTOMER invoice totals (historical) */
    totalRevenue: number
    /** Same but only invoices issued from Jan 1 of current year */
    revenueYTD: number
    /** Outstanding amount on invoices not fully paid (issued, not cancelled) */
    pending: number
    /** Outstanding amount on invoices past due date and not fully paid */
    overdue: number
    /** Average days between issueDate and paidAt (for fully paid invoices) */
    avgPaymentDays: number
    /** Revenue minus cost (sale price – sale discount). Null if no sales linked. */
    profitability: number | null
}

// ---------------------------------------------------------------------------
// Main query
// ---------------------------------------------------------------------------

export async function getClientFinancialKPIs(
    clientId: string,
    userId: string
): Promise<ClientFinancialKPIs> {
    // Single raw query that computes all aggregations in one go
    type Row = {
        totalRevenue: number | null
        revenueYTD: number | null
        pending: number | null
        overdue: number | null
        avgPaymentDays: number | null
        totalSalesCost: number | null
        hasSales: boolean
    }

    const rows = await prisma.$queryRawUnsafe<Row[]>(
        `
    WITH
      -- All CUSTOMER invoices for this client (excl DRAFT + CANCELED)
      inv AS (
        SELECT
          i."id",
          i."total"::NUMERIC          AS "total",
          i."issueDate",
          i."dueDate",
          i."paidAt",
          i."status",
          i."saleId",
          COALESCE((
            SELECT SUM(p."amount"::NUMERIC)
            FROM "InvoicePayment" p
            WHERE p."invoiceId" = i."id"
          ), 0)                        AS "paidAmount"
        FROM "Invoice" i
        WHERE i."userId"   = $1
          AND i."clientId" = $2
          AND i."type"     = 'CUSTOMER'
          AND i."status"  NOT IN ('DRAFT', 'CANCELED')
      ),

      -- Sales linked to the client
      sales AS (
        SELECT
          COALESCE(SUM(s."total"::NUMERIC - s."price"::NUMERIC), 0) AS "costDiff",
          COUNT(*) > 0 AS "hasSales"
        FROM "Sale" s
        WHERE s."userId"   = $1
          AND s."clientId" = $2
      )

    SELECT
      -- 1) Total Revenue (historical)
      COALESCE(SUM(inv."total"), 0)::FLOAT AS "totalRevenue",

      -- 2) Revenue YTD
      COALESCE(SUM(
        CASE WHEN inv."issueDate" >= DATE_TRUNC('year', NOW())
             THEN inv."total" ELSE 0 END
      ), 0)::FLOAT AS "revenueYTD",

      -- 3) Pending (outstanding = total - paid, for unpaid invoices)
      COALESCE(SUM(
        CASE WHEN inv."status" NOT IN ('PAID')
             THEN inv."total" - inv."paidAmount"
             ELSE 0 END
      ), 0)::FLOAT AS "pending",

      -- 4) Overdue (past due + not fully paid)
      COALESCE(SUM(
        CASE WHEN inv."status" NOT IN ('PAID')
              AND inv."dueDate" < NOW()
             THEN inv."total" - inv."paidAmount"
             ELSE 0 END
      ), 0)::FLOAT AS "overdue",

      -- 5) Avg payment days (only for PAID invoices with paidAt)
      (
        SELECT AVG(
          EXTRACT(DAY FROM (sub."paidAt" - sub."issueDate"))
        )::FLOAT
        FROM inv sub
        WHERE sub."status" = 'PAID' AND sub."paidAt" IS NOT NULL
      ) AS "avgPaymentDays",

      -- 6) Profitability helper: total cost difference from sales
      sales."costDiff"::FLOAT   AS "totalSalesCost",
      sales."hasSales"          AS "hasSales"

    FROM inv, sales
    GROUP BY sales."costDiff", sales."hasSales"
    `,
        userId,
        clientId
    )

    // If the query returns no rows it means the client has zero invoices
    const r = rows[0]
    if (!r) {
        return {
            totalRevenue: 0,
            revenueYTD: 0,
            pending: 0,
            overdue: 0,
            avgPaymentDays: 0,
            profitability: null,
        }
    }

    const totalRevenue = round2(r.totalRevenue ?? 0)

    return {
        totalRevenue,
        revenueYTD: round2(r.revenueYTD ?? 0),
        pending: round2(r.pending ?? 0),
        overdue: round2(r.overdue ?? 0),
        avgPaymentDays: Math.round(r.avgPaymentDays ?? 0),
        profitability: r.hasSales ? round2(totalRevenue - (r.totalSalesCost ?? 0)) : null,
    }
}

// ---------------------------------------------------------------------------
// Util
// ---------------------------------------------------------------------------

function round2(v: number): number {
    return Math.round(v * 100) / 100
}
