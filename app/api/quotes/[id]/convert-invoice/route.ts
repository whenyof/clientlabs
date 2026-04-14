export const maxDuration = 10
import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

async function nextInvoiceNumber(userId: string): Promise<{ number: string; series: string }> {
  const series = "FAC"
  const year = new Date().getFullYear()
  const last = await prisma.invoice.findFirst({
    where: { userId, series, number: { startsWith: `FAC-${year}-` } },
    orderBy: { createdAt: "desc" },
    select: { number: true },
  })
  const seq = last ? parseInt(last.number.split("-")[2] ?? "0") + 1 : 1
  return { number: `FAC-${year}-${String(seq).padStart(3, "0")}`, series }
}

export async function POST(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  const { id } = await params

  const quote = await prisma.quote.findFirst({
    where: { id, userId: session.user.id, deletedAt: null },
    include: { items: true },
  })
  if (!quote) return NextResponse.json({ error: "Not found" }, { status: 404 })
  if (quote.status === "CONVERTED") return NextResponse.json({ error: "Already converted" }, { status: 400 })

  const { number, series } = await nextInvoiceNumber(session.user.id)
  const issueDate = new Date()
  const dueDate = new Date(issueDate)
  dueDate.setDate(dueDate.getDate() + 30)

  const invoice = await prisma.invoice.create({
    data: {
      userId: session.user.id,
      clientId: quote.clientId,
      number,
      series,
      issueDate,
      dueDate,
      currency: "EUR",
      subtotal: quote.subtotal,
      taxAmount: quote.taxTotal,
      total: quote.total,
      notes: quote.notes,
      terms: quote.terms,
      status: "DRAFT",
      type: "CUSTOMER",
      lines: {
        create: quote.items.map((item) => ({
          description: item.description,
          quantity: item.quantity,
          unitPrice: item.unitPrice,
          taxPercent: item.taxRate,
          subtotal: item.subtotal,
          taxAmount: item.subtotal * (item.taxRate / 100),
          total: item.subtotal * (1 + item.taxRate / 100),
        })),
      },
    },
  })

  await prisma.quote.update({
    where: { id },
    data: { status: "CONVERTED", convertedToInvoiceId: invoice.id },
  })

  return NextResponse.json({ success: true, invoiceId: invoice.id, invoiceNumber: number })
}
