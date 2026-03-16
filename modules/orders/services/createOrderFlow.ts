"use server"

import { prismaDirect as prisma } from "@/lib/prisma-direct"
import { Prisma } from "@prisma/client"
import { v4 as uuid } from "uuid"

export type CreateOrderFlowItem = {
  product: string
  quantity: number
  price: number
  taxRate?: number
}

export type CreateOrderFlowInput = {
  clientId: string
  userId: string
  notes?: string
  generateInvoice: boolean
  registerPayment: boolean
  items?: CreateOrderFlowItem[]
  discountPercent?: number
}

export type CreateOrderFlowResult = {
  saleId: string
  invoiceId: string | null
  paymentId: string | null
}

function addDays(date: Date, days: number): Date {
  const d = new Date(date)
  d.setDate(d.getDate() + days)
  return d
}

function safeNumber(value: number, min = 0, max = Infinity) {
  if (!Number.isFinite(value)) return min
  return Math.min(Math.max(value, min), max)
}

function dec(n: number) {
  return new Prisma.Decimal(n.toFixed(2))
}

export async function createOrderFlow(
  input: CreateOrderFlowInput
): Promise<CreateOrderFlowResult> {

  const {
    clientId,
    userId,
    notes,
    generateInvoice,
    registerPayment,
    items,
    discountPercent
  } = input

  if (!items || items.length === 0) {
    throw new Error("Order requires at least one item")
  }

  const normalizedItems: CreateOrderFlowItem[] = items.map((item) => ({
    product: item.product?.trim() ?? "",
    quantity: safeNumber(item.quantity, 0),
    price: safeNumber(item.price, 0),
    taxRate: safeNumber(item.taxRate ?? 0, 0, 100)
  }))

  const invalid = normalizedItems.some(
    i => !i.product || i.quantity <= 0 || i.price <= 0
  )

  if (invalid) {
    throw new Error("Invalid order items")
  }

  const subtotal = normalizedItems.reduce(
    (acc, i) => acc + i.quantity * i.price,
    0
  )

  const discountPct = safeNumber(discountPercent ?? 0, 0, 100)

  const discountAmount = subtotal * (discountPct / 100)

  const taxableBase = subtotal - discountAmount

  const taxTotal = normalizedItems.reduce((acc, item) => {

    const base = item.quantity * item.price
    const proportion = base / subtotal

    const baseAfterDiscount = taxableBase * proportion

    return acc + (baseAfterDiscount * item.taxRate) / 100

  }, 0)

  const total = taxableBase + taxTotal

  if (total < 0) {
    throw new Error("Total cannot be negative")
  }

  return prisma.$transaction(async (tx) => {

    const now = new Date()

    const saleId = uuid()

    const sale = await tx.sale.create({
      data: {
        id: saleId,
        userId,
        clientId,
        clientName: "",
        clientEmail: null,
        subtotal: dec(subtotal),
        discount: dec(discountAmount),
        taxTotal: dec(taxTotal),
        total: dec(total),
        amount: dec(total),
        currency: "EUR",
        provider: "MANUAL",
        paymentMethod: "manual",
        status: "PENDIENTE",
        stripePaymentId: null,
        stripeCustomerId: null,
        metadata: null,
        notes: notes ?? null,
        saleDate: now,
        createdAt: now
      }
    })

    for (const item of normalizedItems) {

      const base = item.quantity * item.price

      await tx.saleItem.create({
        data: {
          id: uuid(),
          saleId: sale.id,
          product: item.product,
          quantity: item.quantity,
          price: dec(item.price),
          taxRate: item.taxRate ?? 0,
          lineTotal: dec(base)
        }
      })

    }

    let invoiceId: string | null = null
    let paymentId: string | null = null

    if (generateInvoice) {

      let series = await tx.invoiceSeries.findFirst({
        where: { userId }
      })

      if (!series) {

        series = await tx.invoiceSeries.create({
          data: {
            userId,
            name: "DEFAULT",
            prefix: "C",
            nextNumber: 1
          }
        })

      }

      const invoiceNumber = `${series.prefix}${series.nextNumber}`

      await tx.invoiceSeries.update({
        where: { id: series.id },
        data: { nextNumber: series.nextNumber + 1 }
      })

      const issueDate = now
      const dueDate = addDays(now, 30)

      const invoice = await tx.invoice.create({
        data: {
          id: uuid(),
          userId,
          number: invoiceNumber,
          series: series.name,
          clientId,
          saleId: sale.id,
          issueDate,
          dueDate,
          currency: "EUR",
          subtotal: dec(subtotal),
          taxAmount: dec(taxTotal),
          taxTotal: dec(taxTotal),
          discount: dec(discountAmount),
          total: dec(total),
          status: registerPayment ? "PAID" : "SENT",
          notes: notes ?? null,
          paidAt: registerPayment ? now : null,
          type: "CUSTOMER",
          issuedAt: issueDate,
          paymentMethod: "manual",
          isRectification: false
        }
      })

      invoiceId = invoice.id

      for (const item of normalizedItems) {

        const base = item.quantity * item.price
        const taxAmount = (base * item.taxRate) / 100
        const totalWithTax = base + taxAmount

        await tx.invoiceLine.create({
          data: {
            id: uuid(),
            invoiceId: invoice.id,
            description: item.product,
            quantity: new Prisma.Decimal(item.quantity),
            unitPrice: dec(item.price),
            taxPercent: dec(item.taxRate),
            subtotal: dec(base),
            taxAmount: dec(taxAmount),
            total: dec(totalWithTax)
          }
        })

        await tx.invoiceItem.create({
          data: {
            id: uuid(),
            invoiceId: invoice.id,
            product: item.product,
            quantity: item.quantity,
            price: dec(item.price),
            taxRate: item.taxRate ?? 0,
            lineTotal: dec(base),
            createdAt: now
          }
        })

      }

      if (registerPayment) {

        const payment = await tx.invoicePayment.create({
          data: {
            id: uuid(),
            invoiceId: invoice.id,
            amount: dec(total),
            method: "manual",
            paidAt: now
          }
        })

        paymentId = payment.id

      }

    }

    return {
      saleId: sale.id,
      invoiceId,
      paymentId
    }

  })
}