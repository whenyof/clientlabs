/**
 * Client 360 — Profitability analysis (server-side only)
 *
 * Revenue  = SUM of CUSTOMER invoice totals (excl DRAFT + CANCELED)
 * Cost     = SUM of Sale (price - discount) linked to this client
 * Profit   = Revenue - Cost (if cost data exists)
 * Margin   = Profit / Revenue × 100
 *
 * Monthly breakdown computed for best/worst month + trend.
 * Single DB round-trip via raw SQL.
 */

import { prisma } from "@/lib/prisma"

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface MonthBucket {
    /** YYYY-MM */
    month: string
    /** Display label, e.g. "Ene 2026" */
    label: string
    revenue: number
    cost: number
    profit: number
}

export type ProfitTrend = "up" | "down" | "stable"

export interface ClientProfitability {
    /** Total invoiced revenue */
    totalRevenue: number
    /** Total cost from sales (null if no sales) */
    totalCost: number | null
    /** Revenue - Cost (null if no sales) */
    profit: number | null
    /** (Profit / Revenue) × 100, null if no revenue or no sales */
    marginPercent: number | null
    /** Whether cost data is available */
    hasCostData: boolean

    // ── Monthly KPIs ──
    /** Month with highest revenue */
    bestMonth: MonthBucket | null
    /** Month with lowest revenue (among months with activity) */
    worstMonth: MonthBucket | null
    /** Recent trend comparing last 3 months average vs previous 3 */
    trend: ProfitTrend
    /** Monthly buckets (last 12 months), ordered chronologically */
    months: MonthBucket[]
}

// ---------------------------------------------------------------------------
// Month formatting
// ---------------------------------------------------------------------------

const MONTH_NAMES_ES = [
    "Ene", "Feb", "Mar", "Abr", "May", "Jun",
    "Jul", "Ago", "Sep", "Oct", "Nov", "Dic",
]

function formatMonthLabel(yyyymm: string): string {
    const [year, month] = yyyymm.split("-")
    const idx = parseInt(month, 10) - 1
    return `${MONTH_NAMES_ES[idx]} ${year}`
}

// ---------------------------------------------------------------------------
// Main query
// ---------------------------------------------------------------------------

export async function getClientProfitability(
    clientId: string,
    userId: string,
): Promise<ClientProfitability> {
    // ── 1. Aggregate totals ──
    type TotalsRow = {
        totalRevenue: number | null
        totalCost: number | null
        hasSales: boolean
    }

    const totalsRows = await prisma.$queryRawUnsafe<TotalsRow[]>(
        `
    SELECT
      COALESCE((
        SELECT SUM(i."total"::NUMERIC)::FLOAT
        FROM "Invoice" i
        WHERE i."userId"   = $1
          AND i."clientId" = $2
          AND i."type"     = 'CUSTOMER'
          AND i."status"  NOT IN ('DRAFT', 'CANCELED')
      ), 0) AS "totalRevenue",

      COALESCE((
        SELECT SUM(s."price" - s."discount")::FLOAT
        FROM "Sale" s
        WHERE s."userId"   = $1
          AND s."clientId" = $2
      ), 0) AS "totalCost",

      (
        SELECT COUNT(*) > 0
        FROM "Sale" s
        WHERE s."userId"   = $1
          AND s."clientId" = $2
      ) AS "hasSales"
    `,
        userId,
        clientId,
    )

    // ── 2. Monthly breakdown (last 12 months) ──
    type MonthRow = {
        month: string
        revenue: number | null
        cost: number | null
    }

    const monthRows = await prisma.$queryRawUnsafe<MonthRow[]>(
        `
    WITH months AS (
      SELECT TO_CHAR(d, 'YYYY-MM') AS "month"
      FROM generate_series(
        DATE_TRUNC('month', NOW()) - INTERVAL '11 months',
        DATE_TRUNC('month', NOW()),
        '1 month'
      ) d
    ),
    inv_monthly AS (
      SELECT
        TO_CHAR(i."issueDate", 'YYYY-MM') AS "month",
        SUM(i."total"::NUMERIC)::FLOAT    AS "revenue"
      FROM "Invoice" i
      WHERE i."userId"   = $1
        AND i."clientId" = $2
        AND i."type"     = 'CUSTOMER'
        AND i."status"  NOT IN ('DRAFT', 'CANCELED')
        AND i."issueDate" >= DATE_TRUNC('month', NOW()) - INTERVAL '11 months'
      GROUP BY 1
    ),
    sale_monthly AS (
      SELECT
        TO_CHAR(s."saleDate", 'YYYY-MM') AS "month",
        SUM(s."price" - s."discount")::FLOAT AS "cost"
      FROM "Sale" s
      WHERE s."userId"   = $1
        AND s."clientId" = $2
        AND s."saleDate" >= DATE_TRUNC('month', NOW()) - INTERVAL '11 months'
      GROUP BY 1
    )
    SELECT
      m."month",
      COALESCE(inv."revenue", 0)::FLOAT AS "revenue",
      COALESCE(sal."cost", 0)::FLOAT    AS "cost"
    FROM months m
    LEFT JOIN inv_monthly inv ON inv."month" = m."month"
    LEFT JOIN sale_monthly sal ON sal."month" = m."month"
    ORDER BY m."month" ASC
    `,
        userId,
        clientId,
    )

    // ── Build result ──
    const t = totalsRows[0]
    const totalRevenue = round2(t?.totalRevenue ?? 0)
    const totalCost = round2(t?.totalCost ?? 0)
    const hasCostData = t?.hasSales ?? false

    const profit = hasCostData ? round2(totalRevenue - totalCost) : null
    const marginPercent =
        hasCostData && totalRevenue > 0
            ? round2(((totalRevenue - totalCost) / totalRevenue) * 100)
            : null

    // Monthly buckets
    const months: MonthBucket[] = monthRows.map((r) => ({
        month: r.month,
        label: formatMonthLabel(r.month),
        revenue: round2(r.revenue ?? 0),
        cost: round2(r.cost ?? 0),
        profit: round2((r.revenue ?? 0) - (r.cost ?? 0)),
    }))

    // Best / worst month (only months with revenue > 0)
    const activeMonths = months.filter((m) => m.revenue > 0)
    let bestMonth: MonthBucket | null = null
    let worstMonth: MonthBucket | null = null

    if (activeMonths.length > 0) {
        bestMonth = activeMonths.reduce((a, b) => (b.revenue > a.revenue ? b : a))
        worstMonth = activeMonths.reduce((a, b) => (b.revenue < a.revenue ? b : a))
        // If best === worst (only 1 active month), don't show worst
        if (bestMonth.month === worstMonth.month) worstMonth = null
    }

    // Trend: compare last 3 months avg vs previous 3
    const trend = computeTrend(months)

    return {
        totalRevenue,
        totalCost: hasCostData ? totalCost : null,
        profit,
        marginPercent,
        hasCostData,
        bestMonth,
        worstMonth,
        trend,
        months,
    }
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function computeTrend(months: MonthBucket[]): ProfitTrend {
    if (months.length < 6) return "stable"

    const recent = months.slice(-3)
    const previous = months.slice(-6, -3)

    const avgRecent = recent.reduce((s, m) => s + m.revenue, 0) / 3
    const avgPrevious = previous.reduce((s, m) => s + m.revenue, 0) / 3

    if (avgPrevious === 0 && avgRecent === 0) return "stable"
    if (avgPrevious === 0) return "up"

    const changePercent = ((avgRecent - avgPrevious) / avgPrevious) * 100

    if (changePercent > 5) return "up"
    if (changePercent < -5) return "down"
    return "stable"
}

function round2(v: number): number {
    return Math.round(v * 100) / 100
}
