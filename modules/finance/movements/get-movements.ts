/**
 * Ledger movements: aggregate from Sales, ProviderPayments, Transactions.
 * Read-only; no schema changes. Maps all sources to unified Movement type.
 */

import { prisma } from "@/lib/prisma"
import type { Movement, GetMovementsParams, MovementSortField, MovementSortDir } from "./types"

const PAID_STATUSES = new Set(["PAGADO", "PAID", "COMPLETED"])
const PENDING_STATUSES = new Set(["PENDING", "PENDIENTE", "PENDIENT"])

function toStatus(s: string): "paid" | "pending" {
  const u = (s || "").toUpperCase()
  return PAID_STATUSES.has(u) ? "paid" : "pending"
}

function normalizeSearch(s: string): string {
  return s.trim().toLowerCase()
}

function matchesSearch(text: string | null | undefined, search: string): boolean {
  if (!search || !text) return false
  return normalizeSearch(text).includes(normalizeSearch(search))
}

export async function getUnifiedMovementsForLedger(
  params: GetMovementsParams
): Promise<Movement[]> {
  const { userId, from, to, search, filters, sortBy = "date", sortDir = "desc" } = params

  const [sales, providerPayments, transactions] = await Promise.all([
    prisma.sale.findMany({
      where: { userId, saleDate: { gte: from, lte: to } },
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
    prisma.transaction.findMany({
      where: { userId, date: { gte: from, lte: to } },
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

  for (const p of providerPayments) {
    const name = (p.Provider as { name?: string } | null)?.name ?? null
    items.push({
      id: `payment-${p.id}`,
      date: p.paymentDate.toISOString(),
      type: "expense",
      amount: -(Number(p.amount) ?? 0),
      contactName: name,
      contactType: "supplier",
      concept: p.concept || "Pago proveedor",
      category: undefined,
      status: toStatus(p.status),
      originModule: "purchase",
      originId: p.id,
    })
  }

  for (const t of transactions) {
    const isIncome = t.type === "INCOME"
    const clientName = (t.Client as { name?: string } | null)?.name ?? null
    items.push({
      id: `tx-${t.id}`,
      date: t.date.toISOString(),
      type: isIncome ? "income" : "expense",
      amount: isIncome ? Number(t.amount) : -Math.abs(Number(t.amount)),
      contactName: clientName,
      contactType: clientName ? "client" : null,
      concept: t.concept || (isIncome ? "Ingreso" : "Gasto"),
      category: t.category || undefined,
      status: toStatus(t.status),
      originModule: "manual",
      originId: t.id,
    })
  }

  let result = items

  if (search && search.trim()) {
    const q = search.trim().toLowerCase()
    result = result.filter(
      (m) =>
        matchesSearch(m.contactName, q) ||
        matchesSearch(m.concept, q) ||
        matchesSearch(m.category, q)
    )
  }

  if (filters?.type) {
    result = result.filter((m) => m.type === filters.type)
  }
  if (filters?.status) {
    result = result.filter((m) => m.status === filters.status)
  }
  if (filters?.originModule) {
    result = result.filter((m) => m.originModule === filters.originModule)
  }

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

  return result
}
