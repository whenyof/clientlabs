export const maxDuration = 15
import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { z } from "zod"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import * as invoiceService from "@/modules/invoicing/services/invoice.service"
import { getNextDocumentNumber } from "@/lib/counters/document-counter"
import { getF1ClientFiscalBlock } from "@/lib/clients/calculateFiscalCompleteness"

const poLineSchema = z.object({
  productId: z.string().optional(),
  description: z.string().min(1).max(500),
  quantity: z.number().positive().max(99999),
  unitPrice: z.number().min(0).max(9999999),
  taxRate: z.number().min(0).max(100).optional(),
})

const createPurchaseOrderSchema = z.object({
  clientId: z.string().min(1),
  notes: z.string().max(5000).optional().nullable(),
  items: z.array(poLineSchema).max(200).default([]),
  createQuote: z.boolean().optional().default(false),
  createOrder: z.boolean().optional().default(true),
  createDeliveryNote: z.boolean().optional().default(false),
  createInvoice: z.boolean().optional().default(false),
  invoiceDocType: z.enum(["F1", "F2"]).optional().default("F1"),
  irpfRate: z.number().min(0).max(100).optional().default(0),
})

function nextPONumber(userId: string): Promise<string> {
  return getNextDocumentNumber(userId, "PED")
}

function nextQuoteNumber(userId: string): Promise<string> {
  return getNextDocumentNumber(userId, "P")
}

function nextDNNumber(userId: string): Promise<string> {
  return getNextDocumentNumber(userId, "ALB")
}


export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const { searchParams } = req.nextUrl
  const clientId = searchParams.get("clientId")
  const status = searchParams.get("status")
  const search = searchParams.get("search")

  const orders = await prisma.purchaseOrder.findMany({
    where: {
      userId: session.user.id,
      deletedAt: null,
      ...(clientId && { clientId }),
      ...(status && { status: status as never }),
      ...(search && {
        OR: [
          { number: { contains: search, mode: "insensitive" } },
          { client: { name: { contains: search, mode: "insensitive" } } },
        ],
      }),
    },
    select: {
      id: true, number: true, status: true, issueDate: true, total: true, notes: true,
      convertedToDeliveryNoteId: true, convertedToInvoiceId: true,
      client: { select: { id: true, name: true, email: true } },
      quote: { select: { id: true, number: true, convertedToDeliveryNoteId: true, convertedToInvoiceId: true } },
    },
    orderBy: { createdAt: "desc" },
  })

  // Albarán/factura vinculados: directos del pedido o los generados desde su presupuesto
  // (para que el modal "Generar documentos" no ofrezca duplicados ya creados).
  const dnIdOf = (o: (typeof orders)[number]) => o.convertedToDeliveryNoteId ?? o.quote?.convertedToDeliveryNoteId ?? null
  const invIdOf = (o: (typeof orders)[number]) => o.convertedToInvoiceId ?? o.quote?.convertedToInvoiceId ?? null
  const dnIds = orders.map(dnIdOf).filter(Boolean) as string[]
  const invIds = orders.map(invIdOf).filter(Boolean) as string[]
  const [dns, invs] = await Promise.all([
    dnIds.length ? prisma.deliveryNote.findMany({ where: { id: { in: dnIds } }, select: { id: true, number: true, status: true } }) : [],
    invIds.length ? prisma.invoice.findMany({ where: { id: { in: invIds } }, select: { id: true, number: true, status: true } }) : [],
  ])
  const dnMap = new Map(dns.map(d => [d.id, d]))
  const invMap = new Map(invs.map(i => [i.id, i]))

  const enriched = orders.map(o => {
    const dnId = dnIdOf(o)
    const invId = invIdOf(o)
    return {
      ...o,
      deliveryNote: dnId ? (dnMap.get(dnId) ?? null) : null,
      invoice: invId ? (invMap.get(invId) ?? null) : null,
    }
  })

  return NextResponse.json({ success: true, orders: enriched })
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  try {
    const body = await req.json()
    const parsed = createPurchaseOrderSchema.safeParse(body)
    if (!parsed.success) return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Datos inválidos" }, { status: 400 })
    const {
      clientId, notes, items,
      createQuote,
      createOrder,
      createDeliveryNote,
      createInvoice,
      invoiceDocType,
      irpfRate,
    } = parsed.data

    // F1 (completa) exige datos fiscales del cliente; F2 no. Se comprueba ANTES de
    // crear nada para no dejar pedido/albarán huérfanos si la factura no puede generarse.
    if (createInvoice && invoiceDocType !== "F2") {
      const fiscalClient = await prisma.client.findUnique({
        where: { id: clientId },
        select: { legalName: true, taxId: true, address: true, postalCode: true, city: true, country: true },
      })
      const block = getF1ClientFiscalBlock(fiscalClient)
      if (block) return NextResponse.json({ error: block, needsClientFiscalData: true, clientId }, { status: 400 })
    }

    type ItemInput = { productId?: string; description: string; quantity: number; unitPrice: number; taxRate?: number }
    const lineItems: ItemInput[] = items
    let subtotal = 0
    let taxTotal = 0
    const computed = lineItems.map((item: ItemInput) => {
      const taxRate = item.taxRate ?? 21
      const qty = Number(item.quantity) || 1
      const price = Number(item.unitPrice) || 0
      const lineSub = qty * price
      subtotal += lineSub
      taxTotal += lineSub * (taxRate / 100)
      return { ...item, quantity: qty, unitPrice: price, taxRate, subtotal: lineSub }
    })
    const irpfAmount = subtotal * (irpfRate / 100)
    const total = subtotal + taxTotal - irpfAmount

    // Optionally create quote first so PO and other docs can link to it
    let quoteId: string | null = null
    let quoteRef: { id: string; number: string } | null = null
    if (createQuote) {
      const qNumber = await nextQuoteNumber(session.user.id)
      const issueDate = new Date()
      const validUntil = new Date(issueDate)
      validUntil.setDate(validUntil.getDate() + 30)
      const q = await prisma.quote.create({
        data: {
          userId: session.user.id, clientId, number: qNumber,
          validUntil, subtotal, taxTotal, total,
          irpfRate: irpfRate > 0 ? irpfRate : 0,
          irpfAmount: irpfRate > 0 ? irpfAmount : 0,
          notes: notes ?? null,
          items: {
            create: computed.map(i => ({
              productId: i.productId ?? null, description: i.description,
              quantity: i.quantity, unitPrice: i.unitPrice, taxRate: i.taxRate, subtotal: i.subtotal,
            })),
          },
        },
        select: { id: true, number: true },
      })
      quoteId = q.id
      quoteRef = q
    }

    // Create the PurchaseOrder (optional)
    let order: { id: string; number: string } | null = null
    if (createOrder) {
      const poNumber = await nextPONumber(session.user.id)
      order = await prisma.purchaseOrder.create({
        data: {
          userId: session.user.id, clientId,
          ...(quoteId && { quoteId }),
          number: poNumber, subtotal, taxTotal, total,
          notes: notes ?? null,
          items: {
            create: computed.map(i => ({
              productId: i.productId ?? null, description: i.description,
              quantity: i.quantity, unitPrice: i.unitPrice, taxRate: i.taxRate, subtotal: i.subtotal,
            })),
          },
        },
        select: { id: true, number: true },
      })
    }

    // Optionally create DeliveryNote
    let dnRef: { id: string; number: string } | null = null
    if (createDeliveryNote) {
      const dnNumber = await nextDNNumber(session.user.id)
      const dn = await prisma.deliveryNote.create({
        data: {
          userId: session.user.id, clientId,
          ...(quoteId && { quoteId }),
          number: dnNumber, notes: notes ?? null,
          items: {
            create: computed.map(i => ({
              productId: i.productId ?? null, description: i.description,
              quantity: i.quantity, unitPrice: i.unitPrice, delivered: true,
            })),
          },
        },
        select: { id: true, number: true },
      })
      dnRef = dn
      if (quoteId) {
        await prisma.quote.update({ where: { id: quoteId }, data: { convertedToDeliveryNoteId: dn.id } })
      }
    }

    // Optionally create Invoice as draft via service (sets BORRADOR number, invoiceDocType, client snapshot)
    let invoiceRef: { id: string; number: string } | null = null
    if (createInvoice) {
      const client = await prisma.client.findUnique({
        where: { id: clientId },
        select: { name: true, legalName: true, taxId: true, email: true, address: true, city: true, postalCode: true, country: true },
      })
      const issueDate = new Date()
      const dueDate = new Date(issueDate)
      dueDate.setDate(dueDate.getDate() + 30)
      const created = await invoiceService.createInvoice({
        userId: session.user.id, clientId, series: "INV",
        issueDate, dueDate, currency: "EUR",
        notes: notes ?? null,
        invoiceDocType: invoiceDocType === "F2" ? "F2" : "F1",
        clientSnapshot: client ? {
          name: client.name ?? null, legalName: client.legalName ?? null, taxId: client.taxId ?? null,
          email: client.email ?? null, address: client.address ?? null, city: client.city ?? null,
          postalCode: client.postalCode ?? null, country: client.country ?? null,
        } : null,
        lines: computed.map(i => ({
          description: i.description, quantity: i.quantity, unitPrice: i.unitPrice, taxPercent: i.taxRate,
        })),
      })
      if (created) {
        invoiceRef = created
        if (irpfRate > 0) {
          await prisma.invoice.update({
            where: { id: created.id },
            data: { irpfRate, irpfAmount },
          })
        }
        if (quoteId) {
          await prisma.quote.update({ where: { id: quoteId }, data: { convertedToInvoiceId: created.id } })
        }
      }
    }

    const fiscalWarning = invoiceRef
      ? await invoiceService.getDraftFiscalWarning(session.user.id, clientId)
      : null

    return NextResponse.json({
      success: true,
      order,
      quote: quoteRef,
      deliveryNote: dnRef,
      invoice: invoiceRef,
      fiscalWarning,
    }, { status: 201 })
  } catch (e) {
    console.error("POST /api/purchase-orders", e)
    return NextResponse.json({ error: "Failed to create purchase order" }, { status: 500 })
  }
}
