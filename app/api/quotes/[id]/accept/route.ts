export const maxDuration = 10
import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { sendEmail } from "@/lib/email"
import { quoteAcceptedToSenderEmail } from "@/lib/email-templates"

export async function POST(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  const { id } = await params

  const quote = await prisma.quote.findFirst({
    where: { id, userId: session.user.id },
    include: { client: { select: { name: true, email: true } } },
  })
  if (!quote) return NextResponse.json({ error: "Not found" }, { status: 404 })

  const wasAccepted = quote.status === "ACCEPTED"
  const updated = await prisma.quote.update({ where: { id }, data: { status: "ACCEPTED" } })

  // Aviso al dueño del workspace de que el presupuesto fue aceptado (cambio manual).
  // El portal ya lo envía desde document-tracking; aquí cubrimos la aceptación manual.
  // Best-effort: solo en la transición a ACCEPTED y sin que su fallo rompa la respuesta.
  if (!wasAccepted) {
    try {
      const owner = await prisma.user.findUnique({
        where: { id: session.user.id },
        select: { email: true, name: true },
      })
      if (owner?.email) {
        const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "https://app.clientlabs.io"
        const html = quoteAcceptedToSenderEmail({
          senderName: owner.name ?? "Usuario",
          recipientName: quote.client?.name ?? quote.client?.email ?? "Cliente",
          recipientEmail: quote.client?.email ?? "",
          quoteNumber: quote.number,
          total: Number(quote.total),
          signatureName: "Aceptado manualmente",
          signatureHash: "",
          acceptedAt: new Date(),
          invoicingUrl: `${appUrl}/dashboard/finance/invoicing`,
          quotesUrl: `${appUrl}/dashboard/finance/presupuestos/${id}`,
        })
        await sendEmail(
          owner.email,
          `${quote.client?.name ?? "El cliente"} ha aceptado el presupuesto ${quote.number}`,
          html,
        ).catch(() => {})
      }
    } catch (e) {
      console.error("Quote accepted email error:", e)
    }
  }

  return NextResponse.json({ success: true, quote: updated })
}
