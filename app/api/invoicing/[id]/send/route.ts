export const maxDuration = 25

import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { sendEmail } from "@/lib/email"
import { invoiceToClientEmail } from "@/lib/email-templates"
import { generateInvoicePDF } from "@/modules/invoicing/pdf/generator"

export async function POST(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { id } = await params
  const userId = session.user.id

  const invoice = await prisma.invoice.findFirst({
    where: { id, userId },
    select: {
      id: true,
      number: true,
      total: true,
      status: true,
      dueDate: true,
      Client: { select: { name: true, email: true } },
    },
  })

  if (!invoice) {
    return NextResponse.json({ error: "Factura no encontrada" }, { status: 404 })
  }

  if (!invoice.Client?.email) {
    return NextResponse.json({ error: "El cliente no tiene email registrado" }, { status: 422 })
  }

  const profile = await prisma.businessProfile.findUnique({
    where: { userId },
    select: { companyName: true, name: true, legalName: true, logoUrl: true },
  })
  const businessName = profile?.companyName ?? profile?.name ?? profile?.legalName ?? "Tu negocio"

  let pdfBuffer: Buffer | null = null
  try {
    const result = await generateInvoicePDF(id, userId)
    if (result) pdfBuffer = result.buffer
  } catch (e) {
    console.error("[invoice/send] PDF generation failed:", e)
  }

  const clientName    = invoice.Client.name ?? "Cliente"
  const invoiceNumber = invoice.number ?? id
  const total         = typeof invoice.total === "number" ? invoice.total : Number(invoice.total)

  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "https://app.clientlabs.io"

  // Create DocumentView for tracking — degradación elegante si falla
  let docUrl = `${appUrl}/dashboard/finance/invoicing`
  try {
    const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
    const docView = await prisma.documentView.create({
      data: {
        type: "INVOICE",
        documentId: invoice.id,
        userId,
        recipientEmail: invoice.Client.email,
        recipientName: clientName,
        expiresAt
      },
      select: { token: true }
    })
    docUrl = `${appUrl}/doc/${docView.token}`
  } catch (e) {
    console.error("[invoice/send] DocumentView creation failed:", e)
  }

  const dueDateFmt = invoice.dueDate
    ? new Intl.DateTimeFormat("es-ES", { day: "numeric", month: "long", year: "numeric" }).format(new Date(invoice.dueDate))
    : null

  const html = invoiceToClientEmail({
    clientName,
    invoiceNumber,
    total,
    businessName,
    docUrl,
    dueDate: dueDateFmt,
    logoUrl: profile?.logoUrl,
  })

  await sendEmail(
    invoice.Client.email,
    `Factura ${invoiceNumber} de ${businessName}`,
    html,
    undefined,
    undefined,
    undefined,
    pdfBuffer
      ? [{ filename: `factura-${invoiceNumber.replace(/[^a-zA-Z0-9_-]/g, "_")}.pdf`, content: pdfBuffer.toString("base64") }]
      : undefined
  )

  return NextResponse.json({ success: true })
}
