/**
 * Client 360 — Payments data loader (server-side only)
 *
 * Returns all InvoicePayments linked to CUSTOMER invoices of this client.
 * Single Prisma query. KPIs computed in-memory from the same result.
 */

import { prisma } from "@/lib/prisma"

// ---------------------------------------------------------------------------
// Return types
// ---------------------------------------------------------------------------

export interface ClientPaymentRow {
    id: string
    paidAt: string
    method: string
    reference: string | null
    amount: number
    currency: string
    /** Linked invoice id */
    invoiceId: string
    invoiceNumber: string
    /** Sale id linked to the invoice (if any) */
    saleId: string | null
}

export interface ClientPaymentsKPIs {
    /** Sum of all payment amounts (historical) */
    totalPaid: number
    /** Sum of payments this calendar month */
    paidThisMonth: number
    /** Average payment amount */
    averagePayment: number
    /** ISO date of most recent payment, null if none */
    lastPayment: string | null
}

export interface ClientPaymentsData {
    payments: ClientPaymentRow[]
    kpis: ClientPaymentsKPIs
}

// ---------------------------------------------------------------------------
// Service
// ---------------------------------------------------------------------------

export async function getClientPayments(
    clientId: string,
    userId: string
): Promise<ClientPaymentsData> {
    const raw = await prisma.invoicePayment.findMany({
        where: {
            Invoice: {
                clientId,
                userId,
                type: "CUSTOMER",
            },
        },
        orderBy: { paidAt: "desc" },
        select: {
            id: true,
            paidAt: true,
            method: true,
            reference: true,
            amount: true,
            invoiceId: true,
            Invoice: {
                select: {
                    number: true,
                    currency: true,
                    saleId: true,
                },
            },
        },
    })

    const payments: ClientPaymentRow[] = raw.map((p) => ({
        id: p.id,
        paidAt: p.paidAt.toISOString(),
        method: p.method,
        reference: p.reference,
        amount: round2(Number(p.amount)),
        currency: p.Invoice.currency,
        invoiceId: p.invoiceId,
        invoiceNumber: p.Invoice.number,
        saleId: p.Invoice.saleId,
    }))

    // KPIs
    const now = new Date()
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1)

    const amounts = payments.map((p) => p.amount)
    const totalPaid = round2(amounts.reduce((a, b) => a + b, 0))
    const paidThisMonth = round2(
        payments
            .filter((p) => new Date(p.paidAt) >= monthStart)
            .reduce((s, p) => s + p.amount, 0)
    )
    const averagePayment = amounts.length > 0 ? round2(totalPaid / amounts.length) : 0
    const lastPayment = payments.length > 0 ? payments[0].paidAt : null

    return {
        payments,
        kpis: {
            totalPaid,
            paidThisMonth,
            averagePayment,
            lastPayment,
        },
    }
}

function round2(v: number): number {
    return Math.round(v * 100) / 100
}
