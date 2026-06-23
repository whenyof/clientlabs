export const maxDuration = 30

import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { sendEmail } from "@/lib/sendpulse"
import { bDocument } from "@/lib/email/archetypes"

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 })
  }
  const { id } = await params

  let body: Record<string, unknown> = {}
  try {
    body = await request.json()
  } catch {
    // body optional
  }
  const { emailTo, message } = body as { emailTo?: string; message?: string }

  try {
    const invoice = await prisma.invoice.findUnique({
      where: { id, userId: session.user.id },
      select: {
        id: true,
        number: true,
        total: true,
        subtotal: true,
        taxAmount: true,
        irpfAmount: true,
        irpfRate: true,
        currency: true,
        issueDate: true,
        dueDate: true,
        issuedAt: true,
        status: true,
        iban: true,
        pdfUrl: true,
        Client: { select: { name: true, email: true } },
        User: { select: { name: true, email: true } },
      },
    })

    if (!invoice) {
      return NextResponse.json({ error: "Factura no encontrada" }, { status: 404 })
    }

    const destinatario = emailTo?.trim() || invoice.Client?.email || null
    if (!destinatario) {
      return NextResponse.json(
        { error: "No hay email del cliente. Añade el email en el cuerpo de la petición." },
        { status: 400 }
      )
    }

    const emisorNombre = session.user.name || invoice.User?.name || "Tu proveedor"
    const pdfUrl =
      invoice.pdfUrl ||
      `${process.env.NEXTAUTH_URL}/api/billing/${id}/pdf`

    const fmt = (n: number) =>
      new Intl.NumberFormat("es-ES", { style: "currency", currency: invoice.currency }).format(n)

    const total = Number(invoice.total)
    const subtotal = Number(invoice.subtotal)
    const taxAmount = Number(invoice.taxAmount)
    const irpfAmount = Number(invoice.irpfAmount ?? 0)
    const irpfRate = Number(invoice.irpfRate ?? 0)
    const issueDate = new Date(invoice.issueDate).toLocaleDateString("es-ES")
    const dueDate = new Date(invoice.dueDate).toLocaleDateString("es-ES")

    const esc = (s: string) =>
      s
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")

    const meta: { label: string; value: string }[] = [
      { label: "Fecha emisión", value: issueDate },
      { label: "Vencimiento", value: dueDate },
      { label: "Base imponible", value: fmt(subtotal) },
      { label: "IVA", value: fmt(taxAmount) },
    ]
    if (irpfRate > 0) {
      meta.push({ label: `Retención IRPF (${irpfRate}%)`, value: `-${fmt(irpfAmount)}` })
    }

    const introText = message?.trim()
      ? `${emisorNombre} te ha enviado la factura ${invoice.number} por un importe de ${fmt(
          total
        )}. «${message.trim()}»`
      : `${emisorNombre} te ha enviado la factura ${invoice.number} por un importe de ${fmt(
          total
        )}.`

    const legalParts: string[] = []
    if (invoice.iban) {
      legalParts.push(`Datos de pago — IBAN: ${esc(invoice.iban)}`)
    }
    legalParts.push(`Este email ha sido enviado por ${esc(emisorNombre)} a través de ClientLabs.`)
    const legalHtml = legalParts.join("<br/>")

    const html = bDocument({
      title: `Factura ${invoice.number}`,
      preheader: `${emisorNombre} te ha enviado la factura ${invoice.number} (${fmt(total)}).`,
      business: { name: emisorNombre },
      docTypeLabel: "Factura",
      amountLabel: "Total a pagar",
      amount: fmt(total),
      intro: introText,
      meta,
      buttons: [{ href: pdfUrl, label: "Descargar factura PDF", variant: "dark" }],
      legalHtml,
    })

    await sendEmail({
      to: destinatario,
      subject: `Factura ${invoice.number} de ${emisorNombre}`,
      html,
      fromName: emisorNombre,
    })

    await prisma.invoice.update({
      where: { id },
      data: {
        sentAt: new Date(),
        ...(invoice.status === "DRAFT" && { status: "SENT", issuedAt: new Date() }),
      },
    })

    return NextResponse.json({
      success: true,
      message: `Factura enviada a ${destinatario}`,
    })
  } catch (err: unknown) {
    console.error("Send invoice error:", err)
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Error al enviar la factura" },
      { status: 500 }
    )
  }
}
