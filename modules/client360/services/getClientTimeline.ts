/**
 * Client 360 — Timeline data loader (server-side only)
 *
 * Aggregates all client events into a single chronological feed:
 * - Client creation
 * - Sales
 * - Invoices
 * - Payments
 *
 * Modern architecture:
 *
 * Sale
 *   └ SaleItem
 */

import { prisma } from "@/lib/prisma"

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type TimelineEventType =
  | "creation"
  | "sale"
  | "invoice_issued"
  | "invoice_paid"
  | "invoice_overdue"
  | "payment"
  | "task_created"
  | "note_added"
  | "interaction_logged"
  | "email_sent"

export interface TimelineEvent {
  id: string
  type: TimelineEventType
  date: string
  title: string
  subtitle: string | null
  amount: number | null
  currency: string
  resourceId: string | null
  resourceType: "client" | "sale" | "invoice" | "payment" | "task" | null
}

// ---------------------------------------------------------------------------
// Service
// ---------------------------------------------------------------------------

export async function getClientTimeline(
  clientId: string,
  userId: string
): Promise<TimelineEvent[]> {
  const [client, sales, invoices, payments, tasks] = await Promise.all([
    // Client (include notes for parsing)
    prisma.client.findFirst({
      where: { id: clientId, userId },
      select: {
        id: true,
        name: true,
        createdAt: true,
        notes: true,
      },
    }),

    // Sales (items fetched separately for product label)
    prisma.sale.findMany({
      where: { clientId, userId },
      orderBy: { saleDate: "desc" },
    }),

    // Invoices
    prisma.invoice.findMany({
      where: {
        clientId,
        userId,
        type: "CUSTOMER",
        status: { notIn: ["DRAFT"] },
      },
      select: {
        id: true,
        number: true,
        total: true,
        currency: true,
        issueDate: true,
        dueDate: true,
        paidAt: true,
        status: true,
      },
      orderBy: { issueDate: "desc" },
    }),

    // Payments
    prisma.invoicePayment.findMany({
      where: {
        Invoice: {
          clientId,
          userId,
          type: "CUSTOMER",
        },
      },
      select: {
        id: true,
        amount: true,
        paidAt: true,
        method: true,
        invoiceId: true,
        Invoice: {
          select: {
            number: true,
            currency: true,
          },
        },
      },
      orderBy: { paidAt: "desc" },
    }),

    // Tasks for this client
    prisma.task.findMany({
      where: { clientId, userId },
      select: {
        id: true,
        title: true,
        status: true,
        dueDate: true,
        createdAt: true,
      },
      orderBy: { createdAt: "desc" },
    }),
  ])

  const saleIds = sales.map((s) => s.id)
  // PrismaClient from @/lib/prisma may not expose saleItem in generated types; schema has SaleItem. Cast for findMany.
  type PrismaWithSaleItem = { saleItem: { findMany: (args: { where: { saleId: { in: string[] } } }) => Promise<{ saleId: string; product: string | null }[]> } }
  const saleItems =
    saleIds.length > 0
      ? await (prisma as unknown as PrismaWithSaleItem).saleItem.findMany({ where: { saleId: { in: saleIds } } })
      : []
  const itemsBySaleId = saleItems.reduce(
    (acc: Record<string, typeof saleItems>, item: (typeof saleItems)[number]) => {
      if (!acc[item.saleId]) acc[item.saleId] = []
      acc[item.saleId].push(item)
      return acc
    },
    {} as Record<string, typeof saleItems>
  )

  const events: TimelineEvent[] = []
  const now = new Date()

  // ---------------------------------------------------------------------------
  // Client creation
  // ---------------------------------------------------------------------------

  if (client) {
    events.push({
      id: `creation-${client.id}`,
      type: "creation",
      date: client.createdAt.toISOString(),
      title: "Cliente creado",
      subtitle: client.name ?? null,
      amount: null,
      currency: "EUR",
      resourceId: client.id,
      resourceType: "client",
    })
  }

  // ---------------------------------------------------------------------------
  // Sales
  // ---------------------------------------------------------------------------

  for (const sale of sales) {
    const items = itemsBySaleId[sale.id] ?? []
    const itemCount = items.length
    const label =
      itemCount === 1
        ? items[0]?.product ?? "Producto"
        : `Pedido (${itemCount} productos)`

    events.push({
      id: `sale-${sale.id}`,
      type: "sale",
      date: sale.saleDate.toISOString(),
      title: `Venta: ${label}`,
      subtitle: sale.status,
      amount: round2(Number(sale.total)),
      currency: sale.currency,
      resourceId: sale.id,
      resourceType: "sale",
    })
  }

  // ---------------------------------------------------------------------------
  // Invoices
  // ---------------------------------------------------------------------------

  for (const inv of invoices) {
    const total = round2(Number(inv.total))

    events.push({
      id: `inv-issued-${inv.id}`,
      type: "invoice_issued",
      date: inv.issueDate.toISOString(),
      title: `Factura ${inv.number} emitida`,
      subtitle: inv.status === "CANCELED" ? "Cancelada" : null,
      amount: total,
      currency: inv.currency,
      resourceId: inv.id,
      resourceType: "invoice",
    })

    if (inv.paidAt && inv.status === "PAID") {
      events.push({
        id: `inv-paid-${inv.id}`,
        type: "invoice_paid",
        date: inv.paidAt.toISOString(),
        title: `Factura ${inv.number} pagada`,
        subtitle: null,
        amount: total,
        currency: inv.currency,
        resourceId: inv.id,
        resourceType: "invoice",
      })
    }

    if (inv.dueDate < now && inv.status !== "PAID" && inv.status !== "CANCELED") {
      events.push({
        id: `inv-overdue-${inv.id}`,
        type: "invoice_overdue",
        date: inv.dueDate.toISOString(),
        title: `Factura ${inv.number} vencida`,
        subtitle: `Desde ${formatRelativeDate(inv.dueDate)}`,
        amount: total,
        currency: inv.currency,
        resourceId: inv.id,
        resourceType: "invoice",
      })
    }
  }

  // ---------------------------------------------------------------------------
  // Payments
  // ---------------------------------------------------------------------------

  for (const pay of payments) {
    events.push({
      id: `payment-${pay.id}`,
      type: "payment",
      date: pay.paidAt.toISOString(),
      title: "Pago registrado",
      subtitle: `Factura ${pay.Invoice.number}${
        pay.method ? ` · ${pay.method}` : ""
      }`,
      amount: round2(Number(pay.amount)),
      currency: pay.Invoice.currency,
      resourceId: pay.invoiceId,
      resourceType: "invoice",
    })
  }

  // ---------------------------------------------------------------------------
  // Tasks
  // ---------------------------------------------------------------------------

  for (const task of tasks) {
    events.push({
      id: `task-${task.id}`,
      type: "task_created",
      date: task.createdAt.toISOString(),
      title: task.title?.trim() || "Tarea",
      subtitle: task.dueDate ? `Vence ${task.dueDate.toLocaleDateString("es-ES")}` : task.status,
      amount: null,
      currency: "EUR",
      resourceId: task.id,
      resourceType: "task",
    })
  }

  // ---------------------------------------------------------------------------
  // Client.notes parsing contract (write side: modules/clients/actions)
  // - [NOTE:ISO] content
  // - [INTERACTION:ISO] TYPE - content  (TYPE: CALL|MEETING|EMAIL|WHATSAPP|VISITA)
  // - [EMAIL_SENT:ISO] to|subject - preview
  // Invalid timestamps are skipped. Malformed lines are ignored.
  // ---------------------------------------------------------------------------

  const notesText = client?.notes ?? ""
  if (notesText) {
    let m: RegExpExecArray | null
    const noteRegex = /\[NOTE:([^\]]+)\]\s*([^\n]*)/g
    while ((m = noteRegex.exec(notesText)) !== null) {
      const dateStr = m[1].trim()
      const date = parseTimestamp(dateStr)
      if (date) {
        events.push({
          id: `note-${dateStr}-${m.index}`,
          type: "note_added",
          date: date.toISOString(),
          title: "Nota añadida",
          subtitle: m[2].trim() || null,
          amount: null,
          currency: "EUR",
          resourceId: null,
          resourceType: null,
        })
      }
    }

    const interactionRegex = /\[INTERACTION:([^\]]+)\]\s*(\w+)\s*-\s*([^\n]*)/g
    while ((m = interactionRegex.exec(notesText)) !== null) {
      const dateStr = m[1].trim()
      const date = parseTimestamp(dateStr)
      const interactionType = m[2].trim()
      const content = m[3].trim()
      if (date) {
        const typeLabel = interactionTypeLabels[interactionType] ?? interactionType
        events.push({
          id: `interaction-${dateStr}-${m.index}`,
          type: "interaction_logged",
          date: date.toISOString(),
          title: typeLabel,
          subtitle: content || null,
          amount: null,
          currency: "EUR",
          resourceId: null,
          resourceType: null,
        })
      }
    }

    const emailRegex = /\[EMAIL_SENT:([^\]]+)\]\s*([^\n]+)/g
    while ((m = emailRegex.exec(notesText)) !== null) {
      const dateStr = m[1].trim()
      const date = parseTimestamp(dateStr)
      const rest = m[2].trim()
      const pipeIdx = rest.indexOf("|")
      const to = pipeIdx >= 0 ? rest.slice(0, pipeIdx).trim() : ""
      const afterPipe = pipeIdx >= 0 ? rest.slice(pipeIdx + 1) : rest
      const dashIdx = afterPipe.indexOf(" - ")
      const subject = dashIdx >= 0 ? afterPipe.slice(0, dashIdx).trim() : afterPipe
      const preview = dashIdx >= 0 ? afterPipe.slice(dashIdx + 3).trim() : ""
      if (date) {
        events.push({
          id: `email-${dateStr}-${m.index}`,
          type: "email_sent",
          date: date.toISOString(),
          title: subject || "Email enviado",
          subtitle: to ? `Para: ${to}` : preview || null,
          amount: null,
          currency: "EUR",
          resourceId: null,
          resourceType: null,
        })
      }
    }
  }

  // ---------------------------------------------------------------------------
  // Sort newest first
  // ---------------------------------------------------------------------------

  events.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())

  return events
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function round2(v: number): number {
  return Math.round(v * 100) / 100
}

function formatRelativeDate(date: Date): string {
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))

  if (diffDays === 0) return "hoy"
  if (diffDays === 1) return "ayer"
  if (diffDays < 7) return `hace ${diffDays} días`
  if (diffDays < 30) return `hace ${Math.floor(diffDays / 7)} sem.`
  if (diffDays < 365) return `hace ${Math.floor(diffDays / 30)} meses`
  return `hace ${Math.floor(diffDays / 365)} años`
}

function parseTimestamp(iso: string): Date | null {
  const d = new Date(iso)
  return isNaN(d.getTime()) ? null : d
}

const interactionTypeLabels: Record<string, string> = {
  CALL: "Llamada",
  MEETING: "Reunión",
  EMAIL: "Email",
  WHATSAPP: "WhatsApp",
  VISITA: "Visita",
}