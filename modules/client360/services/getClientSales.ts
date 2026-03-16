/**
 * Client 360 — Sales list + KPIs (server-side only)
 *
 * Modern architecture:
 *
 * Sale
 *   └ SaleItem
 *
 * Sale stores totals.
 * SaleItem stores product lines.
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
  totalPurchased: number
  averageTicket: number
  orderCount: number
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
    include: {
      items: true,
      Invoice: {
        where: { type: "CUSTOMER" },
        select: { id: true },
        take: 1,
      },
    },
  })

  const rows: ClientSaleRow[] = sales.map((sale) => {
    const itemCount = sale.items.length

    const productLabel =
      itemCount === 1
        ? sale.items[0]?.product ?? "Producto"
        : `Pedido (${itemCount} productos)`

    const subtotal = Number(sale.subtotal ?? 0)
    const discount = Number(sale.discount ?? 0)
    const tax = Number(sale.taxTotal ?? 0)
    const total = Number(sale.total ?? 0)

    return {
      id: sale.id,
      product: productLabel,
      price: subtotal,
      discount,
      tax,
      total,
      currency: sale.currency,
      status: sale.status,
      saleDate: sale.saleDate.toISOString(),
      paymentMethod: sale.paymentMethod,
      notes: sale.notes,
      invoiceId: sale.Invoice?.[0]?.id ?? null,
    }
  })

  // -------------------------------------------------------------------------
  // KPIs
  // -------------------------------------------------------------------------

  const totals = rows.map((r) => r.total)

  const totalPurchased = round2(totals.reduce((a, b) => a + b, 0))

  const orderCount = rows.length

  const averageTicket =
    orderCount > 0 ? round2(totalPurchased / orderCount) : 0

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

// ---------------------------------------------------------------------------
// Utils
// ---------------------------------------------------------------------------

function round2(v: number): number {
  return Math.round(v * 100) / 100
}