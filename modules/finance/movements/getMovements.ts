/**
 * Ledger: real money movement only (cash executed).
 * - Income: Sales (PAGADO/PAID).
 * - Expenses: ProviderPayment + Transaction EXPENSE only. Never ProviderOrder (commitments).
 * Double-count fix: orders and their payments must not both appear; ledger = payments + expenses.
 */

import { prisma } from "@/lib/prisma"
import type { Movement, GetMovementsParams, MovementSortField, MovementSortDir } from "./types"

/** Must match finance-aggregator PAID_SALE_STATUSES so movements = KPI income source */
const PAID_SALE_STATUSES = ["PAGADO", "PAID"] as const

const PAID_STATUSES = new Set(["PAGADO", "PAID", "COMPLETED", "RECEIVED"])

function toStatus(s: string): "paid" | "pending" {
  const u = (s || "").toUpperCase()
  return PAID_STATUSES.has(u) ? "paid" : "pending"
}

function matchesSearch(text: string | null | undefined, q: string): boolean {
  if (!q?.trim() || !text) return false
  return text.trim().toLowerCase().includes(q.trim().toLowerCase())
}

/** Invoices: no Invoice model in DB yet; extend here when added. */
async function fetchInvoices(_userId: string, _from: Date, _to: Date): Promise<Movement[]> {
  return []
}

/**
 * Fetch and normalize all financial records into a single Movement[].
 * Sources: sales (income), providerPayments (expense), transactions EXPENSE (expense).
 * ProviderOrder is NOT included — only executed cash (providerPayment) and manual expenses.
 */
export async function getMovements(params: GetMovementsParams): Promise<Movement[]> {
  const { userId, from, to, search, filters, sortBy = "date", sortDir = "desc" } = params

  const [sales, purchases, invoices, transactions] = await Promise.all([
    prisma.sale.findMany({
      where: {
        userId,
        saleDate: { gte: from, lte: to },
        status: { in: [...PAID_SALE_STATUSES] },
      },
      select: {
        id: true,
        total: true,
        saleDate: true,
        clientName: true,
        clientId: true,
        status: true,
        product: true,
      },
      orderBy: { saleDate: "desc" },
    }),
    prisma.providerPayment.findMany({
      where: { userId, paymentDate: { gte: from, lte: to } },
      select: {
        id: true,
        amount: true,
        paymentDate: true,
        concept: true,
        status: true,
        Provider: { select: { name: true } },
      },
      orderBy: { paymentDate: "desc" },
    }),
    fetchInvoices(userId, from, to),
    prisma.transaction.findMany({
      where: {
        userId,
        type: "EXPENSE",
        date: { gte: from, lte: to },
      },
      select: {
        id: true,
        type: true,
        amount: true,
        date: true,
        concept: true,
        category: true,
        status: true,
        Client: { select: { name: true } },
      },
      orderBy: { date: "desc" },
    }),
  ])

  const items: Movement[] = []

  for (const s of sales) {
    items.push({
      id: `sale-${s.id}`,
      date: s.saleDate.toISOString(),
      type: "income",
      amount: Number(s.total) ?? 0,
      contactName: s.clientName || null,
      contactType: "client",
      concept: s.product || "Venta",
      category: undefined,
      status: toStatus(s.status),
      originModule: "sale",
      originId: s.id,
    })
  }

  for (const p of purchases) {
    const contactName = (p.Provider as { name?: string } | null)?.name ?? null
    items.push({
      id: `purchase-${p.id}`,
      date: p.paymentDate.toISOString(),
      type: "expense",
      amount: -(Number(p.amount) ?? 0),
      contactName,
      contactType: "supplier",
      concept: p.concept || "Pago proveedor",
      category: undefined,
      status: toStatus(p.status),
      originModule: "purchase",
      originId: p.id,
    })
  }

  items.push(...invoices)

  for (const t of transactions) {
    const contactName = (t.Client as { name?: string } | null)?.name ?? null
    items.push({
      id: `tx-${t.id}`,
      date: t.date.toISOString(),
      type: "expense",
      amount: -Math.abs(Number(t.amount)),
      contactName,
      contactType: contactName ? "client" : null,
      concept: t.concept || "Gasto",
      category: t.category || undefined,
      status: toStatus(t.status),
      originModule: "manual",
      originId: t.id,
    })
  }

  let result = items

  if (search?.trim()) {
    const q = search.trim()
    result = result.filter(
      (m) =>
        matchesSearch(m.contactName, q) ||
        matchesSearch(m.concept, q) ||
        matchesSearch(m.category, q)
    )
  }

  if (filters?.type) result = result.filter((m) => m.type === filters.type)
  if (filters?.status) result = result.filter((m) => m.status === filters.status)
  if (filters?.originModule) result = result.filter((m) => m.originModule === filters.originModule)

  const mult = sortDir === "asc" ? 1 : -1
  result.sort((a, b) => {
    switch (sortBy) {
      case "date":
        return mult * (new Date(a.date).getTime() - new Date(b.date).getTime())
      case "amount":
        return mult * (Math.abs(a.amount) - Math.abs(b.amount))
      case "concept":
        return mult * (a.concept || "").localeCompare(b.concept || "")
      case "contact":
        return mult * (a.contactName || "").localeCompare(b.contactName || "")
      default:
        return mult * (new Date(a.date).getTime() - new Date(b.date).getTime())
    }
  })

  if (typeof process !== "undefined") {
    // Keep aggregation logic; avoid noisy logging in production.
  }
  return result
}
