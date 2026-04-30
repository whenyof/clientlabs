export const maxDuration = 10
import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { createVerifactuInvoice, formatDateForVerifactu } from "@/lib/verifactu"

async function nextInvoiceNumber(userId: string): Promise<{ number: string; series: string }> {
  const series = "F"
  const year = new Date().getFullYear()
  const last = await prisma.invoice.findFirst({
    where: { userId, series, number: { startsWith: `F-${year}-` } },
    orderBy: { createdAt: "desc" },
    select: { number: true },
  })
  const seq = last ? parseInt(last.number.split("-")[2] ?? "0") + 1 : 1
  return { number: `F-${year}-${String(seq).padStart(3, "0")}`, series }
}

export async function POST(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  const { id } = await params

  const note = await prisma.deliveryNote.findFirst({
    where: { id, userId: session.user.id, deletedAt: null },
    include: { items: true },
  })
  if (!note) return NextResponse.json({ error: "Not found" }, { status: 404 })
  if (note.status === "CONVERTED") return NextResponse.json({ error: "Already converted" }, { status: 400 })

  const { number, series } = await nextInvoiceNumber(session.user.id)
  const issueDate = new Date()
  const dueDate = new Date(issueDate)
  dueDate.setDate(dueDate.getDate() + 30)

  const totalAmount = note.items.reduce((sum, i) => {
    const sub = i.quantity * i.unitPrice
    return sum + sub + sub * 0.21
  }, 0)
  const subtotal = note.items.reduce((s, i) => s + i.quantity * i.unitPrice, 0)
  const taxAmount = totalAmount - subtotal

  const invoice = await prisma.invoice.create({
    data: {
      userId: session.user.id,
      clientId: note.clientId,
      number,
      series,
      issueDate,
      dueDate,
      currency: "EUR",
      subtotal,
      taxAmount,
      total: totalAmount,
      notes: note.notes,
      status: "DRAFT",
      type: "CUSTOMER",
      lines: {
        create: note.items.map((item) => {
          const lineSub = item.quantity * item.unitPrice
          const lineTax = lineSub * 0.21
          return {
            description: item.description,
            quantity: item.quantity,
            unitPrice: item.unitPrice,
            taxPercent: 21,
            subtotal: lineSub,
            taxAmount: lineTax,
            total: lineSub + lineTax,
          }
        }),
      },
    },
  })

  await prisma.deliveryNote.update({
    where: { id },
    data: { status: "CONVERTED", convertedToInvoiceId: invoice.id },
  })

  const bizProfile = await prisma.businessProfile.findUnique({
    where: { userId: session.user.id },
    select: { verifactuEnabled: true, verifactuApiKey: true },
  })

  if (bizProfile?.verifactuEnabled && bizProfile.verifactuApiKey) {
    createVerifactuInvoice(bizProfile.verifactuApiKey, {
      serie: series || "CL",
      numero: number,
      fecha_expedicion: formatDateForVerifactu(issueDate),
      tipo_factura: "F1",
      descripcion: "Factura ClientLabs",
      lineas: [{
        base_imponible: subtotal.toFixed(2),
        tipo_impositivo: "21.00",
        cuota_repercutida: taxAmount.toFixed(2),
      }],
      importe_total: totalAmount.toFixed(2),
    }).then(async (result) => {
      await prisma.invoice.update({
        where: { id: invoice.id },
        data: {
          verifactuUuid: result.uuid,
          verifactuStatus: result.estado,
          verifactuQr: result.qr || null,
          verifactuHuella: result.huella || null,
          verifactuUrl: result.url || null,
          verifactuSentAt: new Date(),
        },
      })
    }).catch((err) => {
      console.error("[Verifactu] Error al enviar factura:", err instanceof Error ? err.message : err)
    })
  }

  return NextResponse.json({ success: true, invoiceId: invoice.id, invoiceNumber: number })
}
