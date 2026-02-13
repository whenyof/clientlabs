/**
 * Accounts Receivable Aging Report — server-side aggregation service.
 *
 * Computes aging buckets for unpaid invoices using PostgreSQL aggregation.
 * No client-side calculations. One query for buckets, one optional for drill-down.
 *
 * Buckets:
 *   current  — not yet due (dueDate >= today)
 *   0-30     — 0 to 30 days overdue
 *   31-60    — 31 to 60 days overdue
 *   61-90    — 61 to 90 days overdue
 *   90+      — more than 90 days overdue
 */

import { prisma } from "@/lib/prisma"

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface AgingBucket {
    label: "current" | "0-30" | "31-60" | "61-90" | "90+"
    amount: number
    count: number
}

export interface AgingInvoice {
    id: string
    number: string
    clientName: string | null
    clientId: string | null
    total: number
    paid: number
    remaining: number
    dueDate: string
    daysOverdue: number
    bucket: AgingBucket["label"]
}

export interface AgingReport {
    buckets: AgingBucket[]
    totalOutstanding: number
    /** True when ≥20% of outstanding is 60+ days overdue */
    dangerWarning: boolean
    /** Percentage of outstanding in 60+ days */
    dangerPercent: number
}

export interface AgingReportWithDrillDown extends AgingReport {
    invoices: AgingInvoice[]
}

// ---------------------------------------------------------------------------
// Bucket classification SQL (reused)
// ---------------------------------------------------------------------------

const BUCKET_CASE_SQL = `
  CASE
    WHEN i."dueDate" >= NOW() THEN 'current'
    WHEN EXTRACT(DAY FROM NOW() - i."dueDate") BETWEEN 0 AND 30 THEN '0-30'
    WHEN EXTRACT(DAY FROM NOW() - i."dueDate") BETWEEN 31 AND 60 THEN '31-60'
    WHEN EXTRACT(DAY FROM NOW() - i."dueDate") BETWEEN 61 AND 90 THEN '61-90'
    ELSE '90+'
  END
`

// ---------------------------------------------------------------------------
// Main aggregation — buckets only (fast)
// ---------------------------------------------------------------------------

export async function getAgingReport(userId: string): Promise<AgingReport> {
    type BucketRow = {
        bucket: string
        amount: number | null
        count: bigint
    }

    const rows = await prisma.$queryRawUnsafe<BucketRow[]>(
        `
    SELECT
      ${BUCKET_CASE_SQL} AS "bucket",
      COALESCE(SUM(
        i."total"::NUMERIC - COALESCE((
          SELECT SUM(p."amount"::NUMERIC)
          FROM "InvoicePayment" p
          WHERE p."invoiceId" = i."id"
        ), 0)
      ), 0)::FLOAT AS "amount",
      COUNT(*)::BIGINT AS "count"
    FROM "Invoice" i
    WHERE i."userId" = $1
      AND i."status" NOT IN ('PAID', 'CANCELED', 'DRAFT')
      AND i."type" = 'CUSTOMER'
    GROUP BY "bucket"
    ORDER BY
      CASE ${BUCKET_CASE_SQL}
        WHEN 'current' THEN 1
        WHEN '0-30' THEN 2
        WHEN '31-60' THEN 3
        WHEN '61-90' THEN 4
        WHEN '90+' THEN 5
      END
    `,
        userId
    )

    return buildReport(rows)
}

// ---------------------------------------------------------------------------
// Drill-down — buckets + individual invoices
// ---------------------------------------------------------------------------

export async function getAgingReportWithDrillDown(
    userId: string
): Promise<AgingReportWithDrillDown> {
    type InvoiceRow = {
        id: string
        number: string
        clientName: string | null
        clientId: string | null
        total: number
        paid: number
        remaining: number
        dueDate: Date
        daysOverdue: number
        bucket: string
    }

    // Single query: per-invoice data with bucket classification
    const invoiceRows = await prisma.$queryRawUnsafe<InvoiceRow[]>(
        `
    SELECT
      i."id",
      i."number",
      c."name" AS "clientName",
      i."clientId",
      i."total"::FLOAT AS "total",
      COALESCE((
        SELECT SUM(p."amount"::NUMERIC)
        FROM "InvoicePayment" p
        WHERE p."invoiceId" = i."id"
      ), 0)::FLOAT AS "paid",
      (i."total"::NUMERIC - COALESCE((
        SELECT SUM(p."amount"::NUMERIC)
        FROM "InvoicePayment" p
        WHERE p."invoiceId" = i."id"
      ), 0))::FLOAT AS "remaining",
      i."dueDate",
      GREATEST(EXTRACT(DAY FROM NOW() - i."dueDate"), 0)::INT AS "daysOverdue",
      ${BUCKET_CASE_SQL} AS "bucket"
    FROM "Invoice" i
    LEFT JOIN "Client" c ON c."id" = i."clientId"
    WHERE i."userId" = $1
      AND i."status" NOT IN ('PAID', 'CANCELED', 'DRAFT')
      AND i."type" = 'CUSTOMER'
    ORDER BY
      CASE ${BUCKET_CASE_SQL}
        WHEN 'current' THEN 1
        WHEN '0-30' THEN 2
        WHEN '31-60' THEN 3
        WHEN '61-90' THEN 4
        WHEN '90+' THEN 5
      END,
      i."dueDate" ASC
    `,
        userId
    )

    // Derive buckets from invoice rows (aggregation in JS since we already have the rows)
    const bucketMap = new Map<string, { amount: number; count: number }>()
    const orderedLabels: AgingBucket["label"][] = ["current", "0-30", "31-60", "61-90", "90+"]
    for (const label of orderedLabels) {
        bucketMap.set(label, { amount: 0, count: 0 })
    }

    const invoices: AgingInvoice[] = invoiceRows.map((r) => {
        const bucket = r.bucket as AgingBucket["label"]
        const entry = bucketMap.get(bucket)!
        entry.amount += r.remaining
        entry.count += 1
        return {
            id: r.id,
            number: r.number,
            clientName: r.clientName,
            clientId: r.clientId,
            total: Math.round(r.total * 100) / 100,
            paid: Math.round(r.paid * 100) / 100,
            remaining: Math.round(r.remaining * 100) / 100,
            dueDate: new Date(r.dueDate).toISOString().split("T")[0],
            daysOverdue: r.daysOverdue,
            bucket,
        }
    })

    const buckets: AgingBucket[] = orderedLabels.map((label) => {
        const entry = bucketMap.get(label)!
        return {
            label,
            amount: Math.round(entry.amount * 100) / 100,
            count: entry.count,
        }
    })

    const totalOutstanding = buckets.reduce((s, b) => s + b.amount, 0)
    const over60 = buckets
        .filter((b) => b.label === "61-90" || b.label === "90+")
        .reduce((s, b) => s + b.amount, 0)
    const dangerPercent = totalOutstanding > 0
        ? Math.round((over60 / totalOutstanding) * 10000) / 100
        : 0
    const dangerWarning = dangerPercent >= 20

    return {
        buckets,
        totalOutstanding: Math.round(totalOutstanding * 100) / 100,
        dangerWarning,
        dangerPercent,
        invoices,
    }
}

// ---------------------------------------------------------------------------
// Shared report builder (from bucket rows)
// ---------------------------------------------------------------------------

type BucketRow = { bucket: string; amount: number | null; count: bigint }

function buildReport(rows: BucketRow[]): AgingReport {
    const orderedLabels: AgingBucket["label"][] = ["current", "0-30", "31-60", "61-90", "90+"]
    const map = new Map<string, { amount: number; count: number }>()
    for (const label of orderedLabels) {
        map.set(label, { amount: 0, count: 0 })
    }

    for (const row of rows) {
        const entry = map.get(row.bucket)
        if (entry) {
            entry.amount = Math.round((row.amount ?? 0) * 100) / 100
            entry.count = Number(row.count)
        }
    }

    const buckets: AgingBucket[] = orderedLabels.map((label) => ({
        label,
        ...map.get(label)!,
    }))

    const totalOutstanding = buckets.reduce((s, b) => s + b.amount, 0)
    const over60 = buckets
        .filter((b) => b.label === "61-90" || b.label === "90+")
        .reduce((s, b) => s + b.amount, 0)
    const dangerPercent = totalOutstanding > 0
        ? Math.round((over60 / totalOutstanding) * 10000) / 100
        : 0

    return {
        buckets,
        totalOutstanding: Math.round(totalOutstanding * 100) / 100,
        dangerWarning: dangerPercent >= 20,
        dangerPercent,
    }
}
