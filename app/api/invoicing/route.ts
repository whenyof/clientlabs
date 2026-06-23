export const maxDuration = 10
import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import * as invoiceService from "@/modules/invoicing/services/invoice.service"
import { computeDueState } from "@domains/invoicing"
import type { CreateInvoiceInput } from "@domains/invoicing"
import { gateLimit } from "@/lib/api-gate"
import { getUserWorkspace } from "@/lib/get-workspace"
import { checkPermission } from "@/lib/check-permission"
import { isAllowedVatRate, ALLOWED_VAT_RATES } from "@/modules/invoicing/utils/vatRates"

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

    // GET de solo lectura: la factura se crea en el origen al crear la venta
    // (sales API, sales.actions, addClientPurchase, createClientSale y
    // createOrderFlow con generateInvoice). Para datos legacy existe el script
    // manual invoiceService.backfillInvoicesFromSales(userId).
    const list = await invoiceService.listInvoices(userId, {
      limit: 500,
      ...(clientId && { clientId }),
      ...(providerId && { providerId }),
      ...(saleId && { saleId }),
      ...(providerOrderId && { providerOrderId }),
    })
    const withDue = list.map((inv) => {
      const dueInfo = computeDueState({ status: inv.status, dueDate: inv.dueDate })
      // Promote SENT/VIEWED to OVERDUE in the response when the due date has passed.
      // The DB keeps "SENT" until a payment triggers recomputeStatus; this ensures
      // the UI filter and KPI counter see the correct effective status.
      const effectiveStatus =
        dueInfo.isOverdue && (inv.status === "SENT" || inv.status === "VIEWED")
          ? "OVERDUE"
          : inv.status
      return { ...inv, status: effectiveStatus, dueInfo }
    })
    const sorted = sortByDuePriority(withDue)

    // Nº de pedido asociado a cada factura de cliente (PurchaseOrder.convertedToInvoiceId).
    const customerInvoiceIds = sorted.filter((i) => i.type === "CUSTOMER").map((i) => i.id)
    const linkedOrders = customerInvoiceIds.length
      ? await prisma.purchaseOrder.findMany({
          where: { userId, convertedToInvoiceId: { in: customerInvoiceIds } },
          select: { number: true, convertedToInvoiceId: true },
        })
      : []
    const orderNumberByInvoice = Object.fromEntries(
      linkedOrders.map((o) => [o.convertedToInvoiceId, o.number]),
    )
    const sortedWithOrder = sorted.map((i) => ({ ...i, orderNumber: orderNumberByInvoice[i.id] ?? null }))

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
    }

    return NextResponse.json({
      success: true,
      invoices: sortedWithOrder,
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
  const gate = await gateLimit("maxInvoicesPerMonth", (userId) => {
    const start = new Date()
    start.setDate(1)
    start.setHours(0, 0, 0, 0)
    return prisma.invoice.count({ where: { userId, createdAt: { gte: start } } })
  })
  if (!gate.allowed) return gate.error!

  const session = await getServerSession(authOptions)
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const wsResult = await getUserWorkspace(session.user.id)
  if (wsResult && wsResult.role !== "OWNER") {
    const allowed = await checkPermission(session.user.id, wsResult.workspace.id, "createInvoices")
    if (!allowed) {
      return NextResponse.json({ error: "Sin permisos para crear facturas", upgradeUrl: "/precios" }, { status: 403 })
    }
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
  const invoiceDocType = typeof b.invoiceDocType === "string" ? b.invoiceDocType : "F1"
  const rawLines = Array.isArray(b.lines) ? b.lines : []
  const lines = rawLines.map((l: Record<string, unknown>) => ({
    description: String(l.description ?? ""),
    quantity: Number(l.quantity) || 0,
    unitPrice: Number(l.unitPrice) || 0,
    discountPercent: l.discountPercent != null ? Number(l.discountPercent) : undefined,
    taxPercent: Number(l.taxPercent) || 0,
    lineTotal: l.lineTotal != null ? Number(l.lineTotal) : undefined,
    priceMode: (l.priceMode === "total" ? "total" : undefined) as "base" | "total" | undefined,
  })) as import("@domains/invoicing").InvoiceLineInput[]
  if (!clientId || lines.length === 0) {
    return NextResponse.json({ error: "clientId and at least one line required" }, { status: 400 })
  }
  // Tipos de IVA cerrados a los valores legales que acepta Verifacti
  const invalidVat = lines.find((l) => !isAllowedVatRate(l.taxPercent))
  if (invalidVat) {
    return NextResponse.json(
      { error: `Tipo de IVA no válido: ${invalidVat.taxPercent}%. Valores permitidos: ${ALLOWED_VAT_RATES.join(", ")}` },
      { status: 400 }
    )
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
    invoiceDocType,
  }
  const irpfRate = typeof b.irpfRate === "number" ? b.irpfRate : 0
  const irpfAmount = typeof b.irpfAmount === "number" ? b.irpfAmount : 0
  try {
    const result = await invoiceService.createInvoice(input)
    if (!result) return NextResponse.json({ error: "Failed to create invoice" }, { status: 500 })
    if (irpfRate > 0 || irpfAmount > 0) {
      await prisma.invoice.update({
        where: { id: result.id },
        data: { irpfRate, irpfAmount },
      })
    }
    return NextResponse.json({ success: true, id: result.id, number: result.number })
  } catch (e) {
    console.error("Invoicing create error:", e)
    return NextResponse.json({ error: "Failed to create invoice" }, { status: 500 })
  }
}
