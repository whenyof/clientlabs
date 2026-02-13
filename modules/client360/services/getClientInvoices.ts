/**
 * Client 360 — Invoice list data loader (server-side only)
 *
 * Returns all CUSTOMER invoices for a given client, sorted by issueDate DESC.
 * Single Prisma query with payment aggregation.
 */

import { prisma } from "@/lib/prisma"

// ---------------------------------------------------------------------------
// Return type
// ---------------------------------------------------------------------------

export interface ClientInvoiceRow {
    id: string
    number: string
    issueDate: string
    dueDate: string
    status: string
    total: number
    paid: number
    pending: number
    currency: string
    isDraft: boolean
    pdfUrl: string | null
}

// ---------------------------------------------------------------------------
// Service
// ---------------------------------------------------------------------------

export async function getClientInvoices(
    clientId: string,
    userId: string
): Promise<ClientInvoiceRow[]> {
    const invoices = await prisma.invoice.findMany({
        where: {
            clientId,
            userId,
            type: "CUSTOMER",
        },
        orderBy: { issueDate: "desc" },
        select: {
            id: true,
            number: true,
            issueDate: true,
            dueDate: true,
            status: true,
            total: true,
            currency: true,
            pdfUrl: true,
            payments: {
                select: { amount: true },
            },
        },
    })

    return invoices.map((inv) => {
        const total = Number(inv.total)
        const paid = inv.payments.reduce((sum, p) => sum + Number(p.amount), 0)
        const pending = Math.max(0, total - paid)

        return {
            id: inv.id,
            number: inv.number,
            issueDate: inv.issueDate.toISOString(),
            dueDate: inv.dueDate.toISOString(),
            status: inv.status,
            total: Math.round(total * 100) / 100,
            paid: Math.round(paid * 100) / 100,
            pending: Math.round(pending * 100) / 100,
            currency: inv.currency,
            isDraft: inv.status === "DRAFT",
            pdfUrl: inv.pdfUrl,
        }
    })
}
