/**
 * Client 360 — Timeline data loader (server-side only)
 *
 * Aggregates all client events into a single chronological feed:
 *   - Client creation
 *   - Sales
 *   - Invoices (issued, paid, overdue)
 *   - Payments
 *
 * All fetched in parallel from existing tables — no new models.
 * Ordered chronologically descending (newest first).
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

export interface TimelineEvent {
    id: string
    type: TimelineEventType
    date: string // ISO
    /** Human-readable title */
    title: string
    /** Optional subtitle / description */
    subtitle: string | null
    /** Amount in EUR, if applicable */
    amount: number | null
    /** Currency */
    currency: string
    /** Resource id for navigation (invoiceId, saleId, paymentId) */
    resourceId: string | null
    /** Resource type for building navigation URL */
    resourceType: "client" | "sale" | "invoice" | "payment" | null
}

// ---------------------------------------------------------------------------
// Service
// ---------------------------------------------------------------------------

export async function getClientTimeline(
    clientId: string,
    userId: string,
): Promise<TimelineEvent[]> {
    // ── Parallel data load ──
    const [client, sales, invoices, payments] = await Promise.all([
        // Client creation date
        prisma.client.findFirst({
            where: { id: clientId, userId },
            select: { id: true, name: true, createdAt: true },
        }),

        // Sales
        prisma.sale.findMany({
            where: { clientId, userId },
            select: {
                id: true,
                product: true,
                total: true,
                currency: true,
                saleDate: true,
                status: true,
            },
            orderBy: { saleDate: "desc" },
        }),

        // Invoices (CUSTOMER, non-draft)
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
    ])

    const events: TimelineEvent[] = []
    const now = new Date()

    // ── 1. Client creation ──
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

    // ── 2. Sales ──
    for (const sale of sales) {
        events.push({
            id: `sale-${sale.id}`,
            type: "sale",
            date: sale.saleDate.toISOString(),
            title: `Venta: ${sale.product}`,
            subtitle: sale.status,
            amount: round2(sale.total),
            currency: sale.currency,
            resourceId: sale.id,
            resourceType: "sale",
        })
    }

    // ── 3. Invoices ──
    for (const inv of invoices) {
        const total = round2(Number(inv.total))

        // Issued event
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

        // Paid event (if applicable)
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

        // Overdue event (due date passed + not paid)
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

    // ── 4. Payments ──
    for (const pay of payments) {
        events.push({
            id: `payment-${pay.id}`,
            type: "payment",
            date: pay.paidAt.toISOString(),
            title: `Pago registrado`,
            subtitle: `Factura ${pay.Invoice.number}${pay.method ? ` · ${pay.method}` : ""}`,
            amount: round2(Number(pay.amount)),
            currency: pay.Invoice.currency,
            resourceId: pay.invoiceId,
            resourceType: "invoice",
        })
    }

    // ── Sort descending by date ──
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
