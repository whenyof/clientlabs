import { PrismaClient } from "@prisma/client"
import { Resend } from "resend"
import {
  invoiceToClientEmail,
  quoteToClientEmail,
  documentOpenedEmail,
  quoteAcceptedToSenderEmail,
  quoteRejectedToSenderEmail,
  acceptanceConfirmationEmail,
  quoteAcceptedToRecipientEmail,
  quoteRejectedToRecipientEmail,
  invoiceReceivedByClientEmail,
} from "../lib/email-templates"

const prisma = new PrismaClient()
const resend = new Resend(process.env.RESEND_API_KEY)
const TO = "iyanrimada5@gmail.com"
const FROM = process.env.RESEND_FROM_EMAIL ?? "ClientLabs <onboarding@resend.dev>"
const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000"

async function main() {
  const user = await prisma.user.findFirst({ where: { email: "iyanrimada5@gmail.com" } })
  if (!user) { console.error("Usuario no encontrado"); return }

  const views = await prisma.documentView.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: "desc" },
    take: 10,
  })

  const invoiceView = views.find(v => v.type === "INVOICE")
  const quoteView   = views.find(v => v.type === "QUOTE")

  if (!invoiceView || !quoteView) {
    console.error("Faltan DocumentViews. Ejecuta el PASO 1 primero.")
    return
  }

  console.log(`Invoice view: ${invoiceView.token}`)
  console.log(`Quote view:   ${quoteView.token}\n`)

  const inv = await prisma.invoice.findUnique({
    where: { id: invoiceView.documentId },
    include: { Client: { select: { name: true } } }
  })
  const quote = await prisma.quote.findUnique({
    where: { id: quoteView.documentId },
    include: { client: { select: { name: true } } }
  })

  const senderName  = user.name ?? "Tu empresa"
  const senderEmail = user.email

  const invDocUrl  = `${APP_URL}/doc/${invoiceView.token}`
  const invPixel   = `${APP_URL}/api/doc/${invoiceView.token}/pixel`
  const quoteDocUrl = `${APP_URL}/doc/${quoteView.token}`
  const quotePixel  = `${APP_URL}/api/doc/${quoteView.token}/pixel`
  const invoicingUrl = `${APP_URL}/dashboard/finance/invoicing`
  const quotesUrl    = `${APP_URL}/dashboard/finance/presupuestos/${quoteView.documentId}`

  const dueDateFmt = inv?.dueDate
    ? new Intl.DateTimeFormat("es-ES", { day: "numeric", month: "long", year: "numeric" }).format(new Date(inv.dueDate))
    : undefined

  const now = new Date()
  const nowFmt = new Intl.DateTimeFormat("es-ES", {
    day: "numeric", month: "long", year: "numeric", hour: "2-digit", minute: "2-digit"
  }).format(now)

  const emails: { label: string; subject: string; html: string }[] = [
    {
      label: "1. Factura al cliente",
      subject: `Factura ${inv?.number ?? "FAC-TEST"} de ${senderName}`,
      html: invoiceToClientEmail({
        clientName: invoiceView.recipientName,
        invoiceNumber: inv?.number ?? "FAC-TEST",
        total: Number(inv?.total ?? 0),
        businessName: senderName,
        docUrl: invDocUrl,
        pixelUrl: invPixel,
        dueDate: dueDateFmt,
        senderEmail,
      }),
    },
    {
      label: "2. Presupuesto al cliente",
      subject: `Presupuesto ${quote?.number ?? "P-TEST"} de ${senderName}`,
      html: quoteToClientEmail({
        clientName: quoteView.recipientName,
        quoteNumber: quote?.number ?? "P-TEST",
        total: Number(quote?.total ?? 0),
        businessName: senderName,
        docUrl: quoteDocUrl,
        pixelUrl: quotePixel,
        expiresAt: quoteView.expiresAt,
        senderEmail,
      }),
    },
    {
      label: "3. Documento abierto (al autónomo)",
      subject: `${quoteView.recipientName} ha abierto tu presupuesto`,
      html: documentOpenedEmail({
        senderName,
        recipientName: quoteView.recipientName,
        recipientEmail: TO,
        docType: "QUOTE",
        docNumber: quote?.number,
        total: Number(quote?.total ?? 0),
        dashboardUrl: quotesUrl,
      }),
    },
    {
      label: "4. Presupuesto aceptado (al autónomo)",
      subject: `✅ ${quoteView.recipientName} ha aceptado el presupuesto ${quote?.number}`,
      html: quoteAcceptedToSenderEmail({
        senderName,
        recipientName: quoteView.recipientName,
        recipientEmail: TO,
        quoteNumber: quote?.number ?? "P-TEST",
        total: Number(quote?.total ?? 0),
        signatureName: "Juan García Martínez (test)",
        signatureHash: "a3f9c2e1b0d8f7a6c5e4d3b2a1f9e8d7c6b5a4e3d2c1b0a9f8e7d6c5b4a3f2e1",
        acceptedAt: now,
        invoicingUrl,
        quotesUrl,
      }),
    },
    {
      label: "5. Presupuesto rechazado (al autónomo)",
      subject: `${quoteView.recipientName} ha rechazado el presupuesto ${quote?.number}`,
      html: quoteRejectedToSenderEmail({
        senderName,
        recipientName: quoteView.recipientName,
        recipientEmail: TO,
        quoteNumber: quote?.number ?? "P-TEST",
        total: Number(quote?.total ?? 0),
        rejectionReason: "El precio no se ajusta a nuestro presupuesto actual.",
        dashboardUrl: quotesUrl,
      }),
    },
    {
      label: "6. Confirmación aceptación (al cliente) — legacy",
      subject: `Confirmación de aceptación — ${quote?.number ?? "P-TEST"}`,
      html: acceptanceConfirmationEmail({
        businessName: senderName,
        recipientName: quoteView.recipientName,
        docNumber: quote?.number ?? "P-TEST",
        senderName,
        signatureName: "Juan García Martínez (test)",
        acceptedAt: now,
        docUrl: quoteDocUrl,
      }),
    },
    {
      label: "7. Presupuesto aceptado (al cliente) — nuevo",
      subject: "Confirmado — trabajamos juntos 🤝",
      html: quoteAcceptedToRecipientEmail({
        recipientName: quoteView.recipientName,
        senderName,
        senderEmail,
        number: quote?.number ?? "P-TEST",
        total: Number(quote?.total ?? 0),
        decidedAt: new Intl.DateTimeFormat("es-ES", {
          day: "numeric", month: "long", year: "numeric", hour: "2-digit", minute: "2-digit",
        }).format(now),
        docUrl: quoteDocUrl,
      }),
    },
    {
      label: "8. Presupuesto rechazado (al cliente)",
      subject: `Recibimos tu respuesta — ${quote?.number ?? "P-TEST"}`,
      html: quoteRejectedToRecipientEmail({
        recipientName: quoteView.recipientName,
        senderName,
        senderEmail,
        number: quote?.number ?? "P-TEST",
        docUrl: quoteDocUrl,
      }),
    },
    {
      label: "9. Factura recibida (al cliente)",
      subject: `Tu factura de ${senderName} está disponible`,
      html: invoiceReceivedByClientEmail({
        recipientName: invoiceView.recipientName,
        senderName,
        senderEmail,
        number: inv?.number ?? "FAC-TEST",
        total: Number(inv?.total ?? 0),
        dueDate: inv?.dueDate
          ? new Intl.DateTimeFormat("es-ES", { day: "numeric", month: "long", year: "numeric" }).format(new Date(inv.dueDate))
          : undefined,
        docUrl: invDocUrl,
      }),
    },
  ]

  for (const email of emails) {
    const { error } = await resend.emails.send({ from: FROM, to: TO, subject: email.subject, html: email.html })
    if (error) console.error(`  ✗ ${email.label}:`, error.message)
    else        console.log(`  ✓ ${email.label}`)
    await new Promise(r => setTimeout(r, 500))
  }

  console.log(`\n✓ ${emails.length} emails enviados a ${TO}`)
  console.log(`\nURLs para verificar:`)
  console.log(`  Factura:     ${invDocUrl}`)
  console.log(`  Presupuesto: ${quoteDocUrl}`)
}

main().catch(console.error).finally(() => prisma.$disconnect())
