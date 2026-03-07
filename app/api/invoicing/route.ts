import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import * as invoiceService from "@/modules/invoicing/services/invoice.service"
import { computeDueState } from "@/modules/invoicing/utils/due-engine"
import type { CreateInvoiceInput } from "@/modules/invoicing/types"

export const dynamic = "force-dynamic"

function remainingAmount(inv: { total: number; payments: Array<{ amount: number }> }): number {
  const paid = inv.payments.reduce((s, p) => s + p.amount, 0)
  return Math.max(0, inv.total - paid)
}

function sortByDuePriority<T extends { dueInfo: { state: string; isOverdue: boolean; isDueToday: boolean }; dueDate: string | Date }>(
  invoices: T[]
): T[] {
  const due = new Date()
  due.setHours(0, 0, 0, 0)
  return [...invoices].sort((a, b) => {
    const sa = a.dueInfo.state
    const sb = b.dueInfo.state
    if (sa === "paid") return 1
    if (sb === "paid") return -1
    const overdueA = a.dueInfo.isOverdue ? 0 : 1
    const overdueB = b.dueInfo.isOverdue ? 0 : 1
    if (overdueA !== overdueB) return overdueA - overdueB
    const todayA = a.dueInfo.isDueToday ? 0 : 1
    const todayB = b.dueInfo.isDueToday ? 0 : 1
    if (todayA !== todayB) return todayA - todayB
    const dateA = new Date(a.dueDate).getTime()
    const dateB = new Date(b.dueDate).getTime()
    return dateA - dateB
  })
}

function getDateRange(period: string) {
  const now = new Date()
  const endOfDay = (d: Date) => new Date(d.getFullYear(), d.getMonth(), d.getDate(), 23, 59, 59, 999)
  switch (period) {
    case "week": {
      const from = new Date(now)
      from.setDate(from.getDate() - 6)
      from.setHours(0, 0, 0, 0)
      return { from, to: endOfDay(now) }
    }
    case "quarter": {
      const q = Math.floor(now.getMonth() / 3)
      return {
        from: new Date(now.getFullYear(), q * 3, 1),
        to: endOfDay(new Date(now.getFullYear(), q * 3 + 3, 0)),
      }
    }
    case "year":
      return {
        from: new Date(now.getFullYear(), 0, 1),
        to: endOfDay(new Date(now.getFullYear(), 11, 31)),
      }
    default:
      return {
        from: new Date(now.getFullYear(), now.getMonth(), 1),
        to: endOfDay(new Date(now.getFullYear(), now.getMonth() + 1, 0)),
      }
  }
}

export async function GET(request: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    const userId = session.user.id
    const { searchParams } = new URL(request.url)
    const clientId = searchParams.get("clientId") ?? undefined
    const providerId = searchParams.get("providerId") ?? undefined
    const saleId = searchParams.get("saleId") ?? undefined
    const providerOrderId = searchParams.get("providerOrderId") ?? undefined

    const raw = await prisma.invoice.findMany({
      where: { userId },
      select: { id: true },
    })
    if (raw.length === 0 && !clientId && !providerId && !saleId && !providerOrderId) {
      const sales = await prisma.sale.findMany({
        where: { userId, clientId: { not: null } },
        select: { id: true },
      })
      for (const sale of sales) {
        try {
          await invoiceService.createInvoiceFromSale(sale.id, userId)
        } catch (e) {
          console.error("Backfill createInvoiceFromSale failed", sale.id, e)
        }
      }
    }

    const list = await invoiceService.listInvoices(userId, {
      limit: 500,
      ...(clientId && { clientId }),
      ...(providerId && { providerId }),
      ...(saleId && { saleId }),
      ...(providerOrderId && { providerOrderId }),
    })
    const withDue = list.map((inv) => ({
      ...inv,
      dueInfo: computeDueState({ status: inv.status, dueDate: inv.dueDate }),
    }))
    const sorted = sortByDuePriority(withDue)

    let amountOverdue = 0
    let amountDueToday = 0
    let amountDueSoon = 0
    let overdueCount = 0
    let dueTodayCount = 0
    let upcomingCount = 0
    for (const inv of withDue) {
      const rem = remainingAmount(inv)
      if (inv.dueInfo.state === "paid") continue
      if (inv.dueInfo.isOverdue) {
        amountOverdue += rem
        overdueCount++
      } else if (inv.dueInfo.isDueToday) {
        amountDueToday += rem
        dueTodayCount++
      } else if (inv.dueInfo.isDueSoon) {
        amountDueSoon += rem
        upcomingCount++
      }
    }

    const customersCount = sorted.filter((i) => i.type === "CUSTOMER").length
    const vendorsCount = sorted.filter((i) => i.type === "VENDOR").length
    if (process.env.NODE_ENV === "development") {
      console.log("INVOICE LIST LOADED")
      console.log("customers count", customersCount)
      console.log("vendors count", vendorsCount)
      console.log("OVERDUE COUNT:", overdueCount)
      console.log("DUE TODAY:", dueTodayCount)
      console.log("UPCOMING:", upcomingCount)
    }

    return NextResponse.json({
      success: true,
      invoices: sorted,
      dueSummary: {
        amountOverdue,
        amountDueToday,
        amountDueSoon,
      },
    })
  } catch (e) {
    console.error("Invoicing list error:", e)
    return NextResponse.json({ error: "Failed to list invoices" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }
  let body: unknown
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 })
  }
  const b = body as Record<string, unknown>
  const clientId = typeof b.clientId === "string" ? b.clientId : undefined
  const saleId = typeof b.saleId === "string" && b.saleId.length > 0 ? b.saleId : null
  const series = (typeof b.series === "string" ? b.series : "INV") || "INV"
  const issueDate = b.issueDate ? new Date(b.issueDate as string) : new Date()
  const dueDate = b.dueDate ? new Date(b.dueDate as string) : (() => { const d = new Date(); d.setDate(d.getDate() + 30); return d })()
  const serviceDate = b.serviceDate ? new Date(b.serviceDate as string) : null
  const currency = (typeof b.currency === "string" ? b.currency : "EUR") || "EUR"
  const invoiceLanguage = typeof b.invoiceLanguage === "string" && b.invoiceLanguage.trim() ? b.invoiceLanguage.trim() : null
  const notes = typeof b.notes === "string" ? b.notes : null
  const terms = typeof b.terms === "string" ? b.terms : null
  const paymentMethod = typeof b.paymentMethod === "string" ? b.paymentMethod : null
  const iban = typeof b.iban === "string" ? b.iban : null
  const bic = typeof b.bic === "string" ? b.bic : null
  const paymentReference = typeof b.paymentReference === "string" ? b.paymentReference : null
  const priceMode = (b.priceMode === "total" ? "total" : "base") as "base" | "total"
  const rawLines = Array.isArray(b.lines) ? b.lines : []
  const lines = rawLines.map((l: Record<string, unknown>) => ({
    description: String(l.description ?? ""),
    quantity: Number(l.quantity) || 0,
    unitPrice: Number(l.unitPrice) || 0,
    discountPercent: l.discountPercent != null ? Number(l.discountPercent) : undefined,
    taxPercent: Number(l.taxPercent) || 0,
    lineTotal: l.lineTotal != null ? Number(l.lineTotal) : undefined,
    priceMode: (l.priceMode === "total" ? "total" : undefined) as "base" | "total" | undefined,
  })) as import("@/modules/invoicing/types").InvoiceLineInput[]
  if (!clientId || lines.length === 0) {
    return NextResponse.json({ error: "clientId and at least one line required" }, { status: 400 })
  }
  const rawSnapshot = b.clientSnapshot
  const clientSnapshot: CreateInvoiceInput["clientSnapshot"] =
    rawSnapshot != null && typeof rawSnapshot === "object" && !Array.isArray(rawSnapshot)
      ? {
          name: typeof (rawSnapshot as Record<string, unknown>).name === "string" ? (rawSnapshot as Record<string, unknown>).name as string : null,
          legalName: typeof (rawSnapshot as Record<string, unknown>).legalName === "string" ? (rawSnapshot as Record<string, unknown>).legalName as string : null,
          taxId: typeof (rawSnapshot as Record<string, unknown>).taxId === "string" ? (rawSnapshot as Record<string, unknown>).taxId as string : null,
          address: typeof (rawSnapshot as Record<string, unknown>).address === "string" ? (rawSnapshot as Record<string, unknown>).address as string : null,
          city: typeof (rawSnapshot as Record<string, unknown>).city === "string" ? (rawSnapshot as Record<string, unknown>).city as string : null,
          postalCode: typeof (rawSnapshot as Record<string, unknown>).postalCode === "string" ? (rawSnapshot as Record<string, unknown>).postalCode as string : null,
          country: typeof (rawSnapshot as Record<string, unknown>).country === "string" ? (rawSnapshot as Record<string, unknown>).country as string : null,
          email: typeof (rawSnapshot as Record<string, unknown>).email === "string" ? (rawSnapshot as Record<string, unknown>).email as string : null,
        }
      : undefined
  const input: CreateInvoiceInput = {
    userId: session.user.id,
    clientId,
    saleId: saleId ?? undefined,
    series,
    issueDate,
    dueDate,
    serviceDate,
    currency,
    invoiceLanguage: invoiceLanguage ?? undefined,
    priceMode,
    notes,
    terms,
    paymentMethod,
    iban,
    bic,
    paymentReference,
    clientSnapshot: clientSnapshot ?? undefined,
    lines,
  }
  try {
    const result = await invoiceService.createInvoice(input)
    if (!result) return NextResponse.json({ error: "Failed to create invoice" }, { status: 500 })
    return NextResponse.json({ success: true, id: result.id, number: result.number })
  } catch (e) {
    console.error("Invoicing create error:", e)
    return NextResponse.json({ error: "Failed to create invoice" }, { status: 500 })
  }
}
