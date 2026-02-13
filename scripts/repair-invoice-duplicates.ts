/**
 * Repair Invoice duplicates: find (userId, saleId) duplicates, keep oldest,
 * move lines/payments/events/reminderLogs to kept, then delete duplicates.
 *
 * Run: npm run repair-invoice-duplicates
 * Or:  npx tsx scripts/repair-invoice-duplicates.ts
 *
 * Before running migrate after a failed unique-index migration:
 * 1. npx prisma migrate resolve --rolled-back 20260211180000_billing_list_erp_invoice_type
 * 2. npm run repair-invoice-duplicates
 * 3. npx prisma migrate deploy  (or migrate dev)
 */

import "dotenv/config"
import { PrismaClient } from "@prisma/client"

const prisma = new PrismaClient()

async function hasInvoiceReminderLogTable(): Promise<boolean> {
  const r = await prisma.$queryRaw<[{ exists: boolean }]>`
    SELECT EXISTS (
      SELECT 1 FROM information_schema.tables
      WHERE table_schema = 'public' AND table_name = 'InvoiceReminderLog'
    ) as exists`
  return r[0]?.exists ?? false
}

type DuplicateGroup = {
  userId: string
  saleId: string
  invoices: Array<{ id: string; createdAt: Date }>
}

async function findDuplicateGroups(): Promise<DuplicateGroup[]> {
  const withSale = await prisma.invoice.findMany({
    where: { saleId: { not: null } },
    select: { id: true, userId: true, saleId: true, createdAt: true },
    orderBy: { createdAt: "asc" },
  })

  const byKey = new Map<string, typeof withSale>()
  for (const inv of withSale) {
    const saleId = inv.saleId!
    const key = `${inv.userId}\t${saleId}`
    if (!byKey.has(key)) byKey.set(key, [])
    byKey.get(key)!.push(inv)
  }

  const groups: DuplicateGroup[] = []
  for (const [key, invoices] of byKey) {
    if (invoices.length <= 1) continue
    const [userId, saleId] = key.split("\t")
    groups.push({
      userId,
      saleId,
      invoices: invoices.map((i) => ({ id: i.id, createdAt: i.createdAt })),
    })
  }
  return groups
}

async function repair(): Promise<void> {
  const groups = await findDuplicateGroups()

  console.log("🔎 duplicates found:", groups.length, "groups")

  let invoicesRemoved = 0
  const migrateReminderLogs = await hasInvoiceReminderLogTable()

  for (const group of groups) {
    const sorted = [...group.invoices].sort(
      (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
    )
    const [keep, ...toRemove] = sorted
    const keepId = keep.id
    const removeIds = toRemove.map((i) => i.id)

    await prisma.$transaction(async (tx) => {

      for (const duplicateId of removeIds) {
        await tx.$executeRaw`UPDATE "InvoiceLine" SET "invoiceId" = ${keepId} WHERE "invoiceId" = ${duplicateId}`
        await tx.$executeRaw`UPDATE "InvoicePayment" SET "invoiceId" = ${keepId} WHERE "invoiceId" = ${duplicateId}`
        await tx.$executeRaw`UPDATE "InvoiceEvent" SET "invoiceId" = ${keepId} WHERE "invoiceId" = ${duplicateId}`

        if (migrateReminderLogs) {
          const dupLogs = await tx.invoiceReminderLog.findMany({
            where: { invoiceId: duplicateId },
            select: { id: true, ruleKey: true },
          })
          for (const log of dupLogs) {
            const existing = await tx.invoiceReminderLog.findUnique({
              where: {
                invoiceId_ruleKey: { invoiceId: keepId, ruleKey: log.ruleKey },
              },
            })
            if (existing) {
              await tx.invoiceReminderLog.delete({ where: { id: log.id } })
            } else {
              await tx.invoiceReminderLog.update({
                where: { id: log.id },
                data: { invoiceId: keepId },
              })
            }
          }
        }

        await tx.$executeRaw`DELETE FROM "Invoice" WHERE id = ${duplicateId}`
        invoicesRemoved += 1
      }
    })
  }

  console.log("🧹 invoices removed:", invoicesRemoved)
}

async function main() {
  try {
    await repair()
  } catch (e) {
    console.error("Repair failed:", e)
    process.exit(1)
  } finally {
    await prisma.$disconnect()
  }
}

main()
