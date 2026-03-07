"use server"

import { getServerSession } from "next-auth"
import { revalidatePath } from "next/cache"
import { prisma } from "@/lib/prisma"
import { authOptions } from "@/lib/auth"
import { ensureUserExists } from "@/lib/ensure-user"

import { generateInvoiceFromSale } from "@/modules/billing/services/invoice-generator.service"
import { createInvoiceFromSale } from "@/modules/billing/services/finance-invoice"
import type { SaleCreateInput, SaleUpdateInput } from "../types"

async function checkAuth() {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) return null
  return session as { user: { id: string } }
}

/**
 * List all sales for the current user. Used by Sales page.
 */
export async function listSales() {
  const session = await checkAuth()
  if (!session) return []

  const sales = await prisma.sale.findMany({
    where: { userId: session.user.id },
    orderBy: { saleDate: "desc" },
    take: 500,
    include: {
      Client: {
        select: { id: true, name: true, email: true },
      },
    },
  })

  return sales as any[]
}

/**
 * Get a single sale by id (for side panel).
 */
export async function getSaleById(id: string) {
  const session = await checkAuth()
  if (!session) return null

  const sale = await prisma.sale.findFirst({
    where: { id, userId: session.user.id },
    include: {
      Client: {
        select: { id: true, name: true, email: true },
      },
    },
  })

  return sale
}

/**
 * Create a sale. Revalidates sales and client routes.
 */
export async function createSale(data: SaleCreateInput) {
  const session = await checkAuth()
  if (!session) return { success: false, error: "Unauthorized" }

  await ensureUserExists(session.user as any)

  const saleDate = data.saleDate ? new Date(data.saleDate) : new Date()
  const total = Number(data.total)

  const sale = await prisma.sale.create({
    data: {
      id: `sale_${Date.now()}_${Math.random().toString(36).slice(2, 11)}`,
      userId: session.user.id,
      clientId: data.clientId ?? null,
      clientName: data.clientName,
      clientEmail: data.clientEmail ?? null,
      product: data.product,
      category: data.category ?? null,
      price: total,
      total,
      discount: 0,
      tax: 0,
      currency: data.currency ?? "EUR",
      paymentMethod: "MANUAL",
      provider: "MANUAL",
      status: data.status ?? "PENDIENTE",
      notes: data.notes ?? null,
      saleDate,
      updatedAt: new Date(),
    },
  })

  if (data.clientId) {
    await recalculateClientTotalSpent(data.clientId)
  }

  console.log("SALE CREATED:", sale.id)
  console.log("CALLING createInvoiceFromSale")
  try {
    void generateInvoiceFromSale(sale.id).catch((err) => {
      console.error("Auto invoice from sale failed", sale.id, err)
    })
    void createInvoiceFromSale(sale.id, session.user.id).then((r) => {
      if (r) revalidatePath("/dashboard/finance")
    }).catch((err) => {
      console.error("Invoicing draft from sale failed", sale.id, err)
    })
  } catch (_) {
    // non-blocking
  }

  revalidatePath("/dashboard/other/sales")
  revalidatePath("/dashboard/other")
  revalidatePath("/dashboard/other/finance")
  revalidatePath("/dashboard/clients")
  return { success: true, sale }
}

/**
 * Update a sale (status, notes, etc.). Revalidates routes.
 */
export async function updateSale(id: string, data: SaleUpdateInput) {
  const session = await checkAuth()
  if (!session) return { success: false, error: "Unauthorized" }

  const existing = await prisma.sale.findFirst({
    where: { id, userId: session.user.id },
  })

  if (!existing) return { success: false, error: "Sale not found" }

  const updateData: Record<string, unknown> = {
    updatedAt: new Date(),
  }
  if (data.product !== undefined) updateData.product = data.product
  if (data.total !== undefined) {
    updateData.price = data.total
    updateData.total = data.total
  }
  if (data.status !== undefined) updateData.status = data.status
  if (data.notes !== undefined) updateData.notes = data.notes
  if (data.saleDate !== undefined) updateData.saleDate = new Date(data.saleDate)
  if (data.invoiceUrl !== undefined) updateData.invoiceUrl = data.invoiceUrl

  await prisma.sale.update({
    where: { id },
    data: updateData as any,
  })

  if (existing.clientId) {
    await recalculateClientTotalSpent(existing.clientId)
  }

  console.log("SALE UPDATED:", id)
  console.log("CALLING createInvoiceFromSale")
  try {
    void generateInvoiceFromSale(id).catch((err) => {
      console.error("Auto invoice from sale failed", id, err)
    })
    void createInvoiceFromSale(id, session.user.id).then((r) => {
      if (r) revalidatePath("/dashboard/finance")
    }).catch((err) => {
      console.error("Invoicing draft from sale failed", id, err)
    })
  } catch (_) {
    // non-blocking
  }

  revalidatePath("/dashboard/other/sales")
  revalidatePath("/dashboard/other")
  revalidatePath("/dashboard/other/finance")
  revalidatePath("/dashboard/clients")
  return { success: true }
}

async function recalculateClientTotalSpent(clientId: string) {
  const agg = await prisma.sale.aggregate({
    where: {
      clientId,
      OR: [{ status: "PAID" }, { status: "PAGADO" }],
    },
    _sum: { total: true },
  })
  const totalSpent = agg._sum.total ?? 0

  await prisma.client.update({
    where: { id: clientId },
    data: {
      totalSpent,
      updatedAt: new Date(),
    },
  })
  return totalSpent
}
