// ---------------------------------------------------------------------------
// Analytics Module — Repository (Unified & Accounting Correct)
// ---------------------------------------------------------------------------
// Pure data-access functions. No business logic.
// Uses prisma.invoice and prisma.invoicePayment exclusively.
// ---------------------------------------------------------------------------

import { prisma } from "@/lib/prisma";
import type { InvoiceStatus, InvoiceType } from "@prisma/client";

/** Shape of a minimal invoice row returned by `getInvoicesByDate`. */
export interface InvoiceRow {
 id: string;
 type: InvoiceType;
 status: InvoiceStatus;
 total: unknown;
 issueDate: Date;
 paidAt?: Date | null;
}

// ── Invoice queries ────────────────────────────────────────────────────────

/**
 * Returns customer invoices for a user filtered by `issueDate` range.
 */
export async function getInvoicesByDate(
 userId: string,
 from: Date,
 to: Date,
): Promise<InvoiceRow[]> {
 try {
 const rows = await prisma.invoice.findMany({
 where: {
 userId,
 type: "CUSTOMER",
 issuedAt: { gte: from, lte: to },
 },
 select: {
 id: true,
 type: true,
 status: true,
 total: true,
 issuedAt: true,
 paidAt: true,
 },
 orderBy: { issuedAt: "asc" },
 });
 // Map issuedAt to issueDate for compatibility with existing code
 return rows.map(r => ({ ...r, issueDate: r.issuedAt || new Date() }));
 } catch {
 return [];
 }
}

/**
 * Returns customer invoices that received payments within a date range.
 * Used for the revenue chart (Cash Flow).
 */
export async function getPaidInvoicesBetweenDates(
 userId: string,
 from: Date,
 to: Date,
): Promise<InvoiceRow[]> {
 try {
 const payments = await prisma.invoicePayment.findMany({
 where: {
 paidAt: { gte: from, lte: to },
 Invoice: {
 userId,
 type: "CUSTOMER"
 }
 },
 include: {
 Invoice: true
 },
 orderBy: { paidAt: "asc" },
 });

 return payments.map(p => ({
 id: p.Invoice.id,
 type: p.Invoice.type,
 status: p.Invoice.status,
 total: p.amount, // Using payment amount as the value for the chart bucket
 issueDate: p.paidAt, // Using payment date for chronological series
 }));
 } catch {
 return [];
 }
}

/**
 * Aggregates CASH FLOW (sum of payments) for CUSTOMER invoices in range.
 */
export async function getRevenueBetweenDates(
 userId: string,
 from: Date,
 to: Date,
): Promise<number> {
 try {
 const result = await prisma.invoicePayment.aggregate({
 where: {
 paidAt: { gte: from, lte: to },
 Invoice: {
 userId,
 type: "CUSTOMER"
 }
 },
 _sum: { amount: true },
 });
 return result._sum.amount ? Number(result._sum.amount) : 0;
 } catch {
 return 0;
 }
}

/**
 * Aggregates ISSUED revenue (sum of totals) for CUSTOMER invoices in range.
 */
export async function getIssuedRevenueBetweenDates(
 userId: string,
 from: Date,
 to: Date,
): Promise<number> {
 try {
 const result = await prisma.invoice.aggregate({
 where: {
 userId,
 type: "CUSTOMER",
 status: { notIn: ["DRAFT", "CANCELED"] as any },
 issuedAt: { gte: from, lte: to }
 },
 _sum: { total: true },
 });
 return result._sum.total ? Number(result._sum.total) : 0;
 } catch {
 return 0;
 }
}

/**
 * Counts distinct invoices that received at least one payment in the range.
 * Refactored to avoid groupBy errors.
 */
export async function countInvoicesWithPayments(
 userId: string,
 from: Date,
 to: Date,
): Promise<number> {
 try {
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
 });
 const uniqueInvoices = new Set(payments.map(p => p.invoiceId));
 return uniqueInvoices.size;
 } catch {
 return 0;
 }
}

/**
 * Counts invoices matching a specific status within a date range.
 */
export async function countInvoicesByStatus(
 userId: string,
 status: InvoiceStatus,
 from: Date,
 to: Date,
): Promise<number> {
 try {
 return await prisma.invoice.count({
 where: {
 userId,
 status,
 issuedAt: { gte: from, lte: to },
 },
 });
 } catch {
 return 0;
 }
}

/**
 * Counts all invoices (any status except DRAFT) for a user in date range.
 */
export async function countAllInvoices(
 userId: string,
 from: Date,
 to: Date,
): Promise<number> {
 try {
 return await prisma.invoice.count({
 where: {
 userId,
 status: { not: "DRAFT" as any },
 issuedAt: { gte: from, lte: to },
 },
 });
 } catch {
 return 0;
 }
}

// ── Lead & Client queries (Unchanged) ───────────────────────────────────────────

export async function getLeadsBetweenDates(userId: string, from: Date, to: Date): Promise<number> {
 try {
 return await prisma.lead.count({ where: { userId, createdAt: { gte: from, lte: to } } });
 } catch { return 0; }
}

export async function countConvertedLeads(userId: string, from: Date, to: Date): Promise<number> {
 try {
 return await prisma.lead.count({ where: { userId, converted: true, convertedAt: { gte: from, lte: to } } });
 } catch { return 0; }
}

export async function countNewClients(userId: string, from: Date, to: Date): Promise<number> {
 try {
 return await prisma.client.count({ where: { userId, createdAt: { gte: from, lte: to } } });
 } catch { return 0; }
}
