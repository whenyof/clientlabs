// ─────────────────────────────────────────────────────────────
// Analytics Pro — Unified Repository (Accounting/Relational)
// ─────────────────────────────────────────────────────────────

import { prisma } from "@/lib/prisma"

/** Counts leads created within a date range. */
export async function countLeads(userId: string, from: Date, to: Date): Promise<number> {
 return await prisma.lead.count({ where: { userId, createdAt: { gte: from, lte: to } } })
}

/** Counts sales (closed deals) within a date range. */
export async function countSales(userId: string, from: Date, to: Date): Promise<number> {
 return await prisma.sale.count({ where: { userId, saleDate: { gte: from, lte: to } } })
}

/** 
 * Counts CUSTOMER invoices issued within a date range.
 * Excludes DRAFT and CANCELED status.
 */
export async function countInvoicesIssued(userId: string, from: Date, to: Date): Promise<number> {
 return await prisma.invoice.count({
 where: {
 userId,
 type: "CUSTOMER",
 status: { notIn: ["DRAFT", "CANCELED"] as any },
 issuedAt: { gte: from, lte: to }
 }
 })
}

/** 
 * Counts distinct invoices that received at least one payment in the range.
 * This represents the "Paid Invoices" step in the funnel.
 * Refactored to avoid groupBy errors.
 */
export async function countInvoicesWithPayments(userId: string, from: Date, to: Date): Promise<number> {
 const payments = await prisma.invoicePayment.findMany({
 where: {
 paidAt: { gte: from, lte: to },
 Invoice: {
 userId,
 type: "CUSTOMER"
 }
 },
 select: {
 invoiceId: true
 }
 })

 const uniqueInvoices = new Set(payments.map(p => p.invoiceId))
 return uniqueInvoices.size
}

/** 
 * Counts invoices currently marked as OVERDUE.
 */
export async function countOverdueInvoices(userId: string, from: Date, to: Date): Promise<number> {
 return await prisma.invoice.count({
 where: {
 userId,
 type: "CUSTOMER",
 status: "OVERDUE",
 dueDate: { gte: from, lte: to }
 }
 })
}

/** 
 * Sum of cash collected (amounts from InvoicePayment) in range.
 * This is the "Real Cash Flow".
 */
export async function getCollectedRevenue(userId: string, from: Date, to: Date): Promise<number> {
 const result = await prisma.invoicePayment.aggregate({
 where: {
 paidAt: { gte: from, lte: to },
 Invoice: {
 userId,
 type: "CUSTOMER"
 }
 },
 _sum: { amount: true }
 })
 return result._sum.amount ? Number(result._sum.amount) : 0
}

/** 
 * Sum of total revenue from ISSUED invoices (not DRAFT/CANCELED) in range.
 * Uses issuedAt for the accounting period.
 */
export async function getIssuedRevenue(userId: string, from: Date, to: Date): Promise<number> {
 const result = await prisma.invoice.aggregate({
 where: {
 userId,
 type: "CUSTOMER",
 status: { notIn: ["DRAFT", "CANCELED"] as any },
 issuedAt: { gte: from, lte: to }
 },
 _sum: { total: true }
 })
 return result._sum.total ? Number(result._sum.total) : 0
}

/** 
 * Sum of outstanding revenue for invoices in OVERDUE status.
 */
export async function getOverdueRevenue(userId: string, from: Date, to: Date): Promise<number> {
 const result = await prisma.invoice.aggregate({
 where: {
 userId,
 type: "CUSTOMER",
 status: "OVERDUE",
 dueDate: { gte: from, lte: to }
 },
 _sum: { total: true }
 })
 // Note: To be 100% correct, we should subtract payments made to those overdue invoices.
 // For simplicity in the first step of the summary, total of OVERDUE is used.
 return result._sum.total ? Number(result._sum.total) : 0
}

/** 
 * Counts unique clients with at least one payment in range.
 * Used for LTV calculation.
 * Refactored to avoid groupBy errors and align with user request.
 */
export async function countUniquePaidClients(userId: string, from: Date, to: Date): Promise<number> {
 const payments = await prisma.invoicePayment.findMany({
 where: {
 paidAt: { gte: from, lte: to },
 Invoice: {
 userId,
 type: "CUSTOMER",
 status: { not: "CANCELED" }
 }
 },
 select: {
 Invoice: {
 select: {
 clientId: true
 }
 }
 }
 })

 const uniqueClients = new Set<string>()

 for (const payment of payments) {
 if (payment.Invoice?.clientId) {
 uniqueClients.add(payment.Invoice.clientId)
 }
 }

 return uniqueClients.size
}

/** 
 * Returns daily collected revenue for the last 30 days.
 */
export async function getDailyCollectedRevenue(userId: string, from: Date, to: Date) {
 const payments = await prisma.invoicePayment.findMany({
 where: {
 paidAt: { gte: from, lte: to },
 Invoice: {
 userId,
 type: "CUSTOMER"
 }
 },
 select: {
 amount: true,
 paidAt: true
 }
 })

 const dailyMap = new Map<string, number>()
 payments.forEach(p => {
 const key = p.paidAt.toISOString().slice(0, 10)
 dailyMap.set(key, (dailyMap.get(key) || 0) + Number(p.amount))
 })

 return dailyMap
}

/** 
 * Returns revenue collected per client in range.
 */
export async function getRevenueByClient(userId: string, from: Date, to: Date) {
 const payments = await prisma.invoicePayment.findMany({
 where: {
 paidAt: { gte: from, lte: to },
 Invoice: {
 userId,
 type: "CUSTOMER"
 }
 },
 select: {
 amount: true,
 Invoice: {
 select: {
 clientId: true
 }
 }
 }
 })

 const clientMap = new Map<string, number>()
 payments.forEach(p => {
 if (!p.Invoice?.clientId) return
 const cid = p.Invoice.clientId
 clientMap.set(cid, (clientMap.get(cid) || 0) + Number(p.amount))
 })

 return clientMap
}
