/**
 * Client 360 — Sales list + KPIs (server-side only)
 *
 * Single Prisma query for all sales of a client, with Invoice relation
 * to determine if a "factura asociada" exists.
 */

import { prisma } from "@/lib/prisma"

// ---------------------------------------------------------------------------
// Return types
// ---------------------------------------------------------------------------

export interface ClientSaleRow {
    id: string
    product: string
    price: number
    discount: number
    tax: number
    total: number
    currency: string
    status: string
    saleDate: string
    paymentMethod: string
    notes: string | null
    /** First linked CUSTOMER invoice id, if any */
    invoiceId: string | null
}

export interface ClientSalesKPIs {
    /** Sum of all sale totals (historical) */
    totalPurchased: number
    /** Average sale total */
    averageTicket: number
    /** Count of sales */
    orderCount: number
    /** ISO date of most recent sale, null if none */
    lastPurchase: string | null
}

export interface ClientSalesData {
    sales: ClientSaleRow[]
    kpis: ClientSalesKPIs
}

// ---------------------------------------------------------------------------
// Service
// ---------------------------------------------------------------------------

export async function getClientSales(
    clientId: string,
    userId: string
): Promise<ClientSalesData> {
    const sales = await prisma.sale.findMany({
        where: {
            clientId,
            userId,
        },
        orderBy: { saleDate: "desc" },
        select: {
            id: true,
            product: true,
            price: true,
            discount: true,
            tax: true,
            total: true,
            currency: true,
            status: true,
            saleDate: true,
            paymentMethod: true,
            notes: true,
            Invoice: {
                where: { type: "CUSTOMER" },
                select: { id: true },
                take: 1,
            },
        },
    })

    const rows: ClientSaleRow[] = sales.map((s) => ({
        id: s.id,
        product: s.product,
        price: s.price,
        discount: s.discount,
        tax: s.tax,
        total: s.total,
        currency: s.currency,
        status: s.status,
        saleDate: s.saleDate.toISOString(),
        paymentMethod: s.paymentMethod,
        notes: s.notes,
        invoiceId: s.Invoice?.[0]?.id ?? null,
    }))

    // KPIs
    const totals = rows.map((r) => r.total)
    const totalPurchased = round2(totals.reduce((a, b) => a + b, 0))
    const orderCount = rows.length
    const averageTicket = orderCount > 0 ? round2(totalPurchased / orderCount) : 0
    const lastPurchase = rows.length > 0 ? rows[0].saleDate : null

    return {
        sales: rows,
        kpis: {
            totalPurchased,
            averageTicket,
            orderCount,
            lastPurchase,
        },
    }
}

function round2(v: number): number {
    return Math.round(v * 100) / 100
}
