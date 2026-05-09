export const dynamic = "force-dynamic"
export const maxDuration = 60
import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { createInvoice } from "@/modules/invoicing/services/invoice.service"

function addFrequency(date: Date, frequency: string): Date {
  const d = new Date(date)
  switch (frequency) {
    case "WEEKLY": d.setDate(d.getDate() + 7); break
    case "MONTHLY": d.setMonth(d.getMonth() + 1); break
    case "QUARTERLY": d.setMonth(d.getMonth() + 3); break
    case "YEARLY": d.setFullYear(d.getFullYear() + 1); break
  }
  return d
}

export async function GET(request: NextRequest) {
  const authHeader = request.headers.get("authorization")
  const cronSecret = process.env.CRON_SECRET
  if (!cronSecret) {
    return NextResponse.json({ error: "Not configured" }, { status: 503 })
  }
  if (authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const now = new Date()
  const due = await prisma.recurringInvoice.findMany({
    where: { active: true, nextRunAt: { lte: now } },
    include: { items: true },
  })

  let created = 0
  let errors = 0

  for (const ri of due) {
    try {
      const client = await prisma.client.findFirst({
        where: { id: ri.clientId },
        select: { id: true, name: true, taxId: true, email: true, address: true, city: true, postalCode: true, country: true, legalName: true },
      })
      if (!client) { errors++; continue }

      const dueDate = new Date(now)
      dueDate.setDate(dueDate.getDate() + 30)
      await createInvoice({
        userId: ri.userId,
        clientId: ri.clientId,
        series: "FAC",
        issueDate: now,
        dueDate,
        currency: ri.currency,
        notes: ri.notes ?? undefined,
        terms: ri.terms ?? undefined,
        clientSnapshot: {
          name: client.name ?? null,
          legalName: client.legalName ?? null,
          taxId: client.taxId ?? null,
          address: client.address ?? null,
          city: client.city ?? null,
          postalCode: client.postalCode ?? null,
          country: client.country ?? null,
          email: client.email ?? null,
        },
        lines: ri.items.map((item) => ({
          description: item.description,
          quantity: item.quantity,
          unitPrice: item.unitPrice,
          taxPercent: item.taxPercent,
          discountPercent: item.discountPercent,
        })),
      })

      await prisma.recurringInvoice.update({
        where: { id: ri.id },
        data: {
          lastRunAt: now,
          nextRunAt: addFrequency(ri.nextRunAt, ri.frequency),
        },
      })

      created++
    } catch (err) {
      console.error("[cron/recurring-invoices] error for ri", ri.id, err)
      errors++
    }
  }

  return NextResponse.json({ ok: true, created, errors, processed: due.length })
}
