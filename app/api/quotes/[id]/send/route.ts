export const maxDuration = 10
import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { sendEmail } from "@/lib/email"
import { quoteToClientEmail } from "@/lib/email-templates"

export async function POST(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  const { id } = await params

  const quote = await prisma.quote.findFirst({
    where: { id, userId: session.user.id },
    select: {
      id: true,
      number: true,
      total: true,
      status: true,
      validUntil: true,
      client: { select: { email: true, name: true } },
      user: { select: { name: true, email: true } },
    },
  })
  if (!quote) return NextResponse.json({ error: "Not found" }, { status: 404 })
  if (quote.status !== "DRAFT") return NextResponse.json({ error: "Only DRAFT quotes can be sent" }, { status: 400 })

  const updated = await prisma.quote.update({ where: { id }, data: { status: "SENT" } })

  if (quote.client.email) {
    const profile = await prisma.businessProfile.findUnique({
      where: { userId: session.user.id },
      select: { companyName: true, name: true, legalName: true, logoUrl: true },
    })
    const businessName =
      profile?.companyName ?? profile?.name ?? quote.user.name ?? profile?.legalName ?? "Tu negocio"
    const clientName = quote.client.name || "Cliente"
    const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "https://app.clientlabs.io"

    // Create DocumentView for tracking — degradación elegante si falla
    let docUrl = `${appUrl}/dashboard/finance/presupuestos`
    try {
      const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
      const docView = await prisma.documentView.create({
        data: {
          type: "QUOTE",
          documentId: quote.id,
          userId: session.user.id,
          recipientEmail: quote.client.email,
          recipientName: clientName,
          expiresAt
        },
        select: { token: true }
      })
      docUrl = `${appUrl}/doc/${docView.token}`
    } catch (e) {
      console.error("[quote/send] DocumentView creation failed:", e)
    }

    const html = quoteToClientEmail({
      clientName,
      quoteNumber: quote.number,
      total: typeof quote.total === "number" ? quote.total : Number(quote.total),
      businessName,
      docUrl,
      expiresAt: quote.validUntil,
      senderEmail: quote.user.email,
      logoUrl: profile?.logoUrl,
    })

    sendEmail(
      quote.client.email,
      `Presupuesto ${quote.number} de ${businessName}`,
      html
    ).catch(() => {})
  }

  return NextResponse.json({ success: true, quote: updated })
}
