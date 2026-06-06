import { PrismaClient } from "@prisma/client"
import { Resend } from "resend"
import {
  invoiceToClientEmail,
  quoteToClientEmail,
  documentOpenedEmail,
  quoteAcceptedToSenderEmail,
  quoteRejectedToSenderEmail,
  acceptanceConfirmationEmail,
} from "../lib/email-templates"

const prisma = new PrismaClient()
const resend = new Resend(process.env.RESEND_API_KEY)
const TO = "iyanrimada@gmail.com"
const FROM = process.env.RESEND_FROM_EMAIL ?? "ClientLabs <onboarding@resend.dev>"
const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? "https://app.clientlabs.io"

async function send(subject: string, html: string) {
  const { error } = await resend.emails.send({ from: FROM, to: TO, subject, html })
  if (error) {
    console.error(`  ✗ ${subject}:`, error.message)
  } else {
    console.log(`  ✓ ${subject}`)
  }
}

async function getRealToken(type: "INVOICE" | "QUOTE"): Promise<{ token: string } | null> {
  return prisma.documentView.findFirst({
    where: { type, status: "SENT" },
    orderBy: { createdAt: "desc" },
    select: { token: true },
  })
}

async function createTestToken(type: "INVOICE" | "QUOTE", userId: string, documentId: string): Promise<string> {
  const view = await prisma.documentView.create({
    data: {
      type,
      status: "SENT",
      userId,
      documentId,
      recipientName: "Iyan Rimada",
      recipientEmail: TO,
      sentAt: new Date(),
    },
    select: { token: true },
  })
  return view.token
}

async function main() {
  console.log(`Enviando 6 emails de prueba a ${TO}...\n`)

  // Intentar obtener tokens reales de la BD
  const invoiceView = await getRealToken("INVOICE")
  const quoteView = await getRealToken("QUOTE")

  // Si no hay tokens reales, crear uno usando el primer documento disponible
  let invoiceToken = invoiceView?.token
  let quoteToken = quoteView?.token

  if (!invoiceToken) {
    const user = await prisma.user.findFirst({ select: { id: true } })
    const invoice = await prisma.invoice.findFirst({
      where: { userId: user?.id },
      select: { id: true },
    })
    if (user && invoice) {
      console.log("  ℹ No hay DocumentViews SENT de INVOICE — creando token de prueba...")
      invoiceToken = await createTestToken("INVOICE", user.id, invoice.id)
    }
  }

  if (!quoteToken) {
    const user = await prisma.user.findFirst({ select: { id: true } })
    const quote = await prisma.quote.findFirst({
      where: { userId: user?.id },
      select: { id: true },
    })
    if (user && quote) {
      console.log("  ℹ No hay DocumentViews SENT de QUOTE — creando token de prueba...")
      quoteToken = await createTestToken("QUOTE", user.id, quote.id)
    }
  }

  const invoiceDocUrl = invoiceToken ? `${APP_URL}/doc/${invoiceToken}` : `${APP_URL}/doc/NO_TOKEN`
  const invoicePixelUrl = invoiceToken ? `${APP_URL}/api/doc/${invoiceToken}/pixel` : ""
  const quoteDocUrl = quoteToken ? `${APP_URL}/doc/${quoteToken}` : `${APP_URL}/doc/NO_TOKEN`
  const quotePixelUrl = quoteToken ? `${APP_URL}/api/doc/${quoteToken}/pixel` : ""

  console.log(`  → Invoice token: ${invoiceToken ?? "NO_TOKEN"}`)
  console.log(`  → Quote token:   ${quoteToken ?? "NO_TOKEN"}\n`)

  const businessName = "Taller Creativo SL"
  const clientName = "Iyan Rimada"
  const now = new Date()

  // EMAIL 1 — Factura al cliente
  await send(
    "[TEST 1/6] Factura FAC-2025-0042 de Taller Creativo SL",
    invoiceToClientEmail({
      clientName,
      invoiceNumber: "FAC-2025-0042",
      total: 1250.00,
      businessName,
      docUrl: invoiceDocUrl,
      pixelUrl: invoicePixelUrl,
      dueDate: "15 de julio de 2026",
      senderEmail: "hola@tallercreativo.es",
    })
  )

  // EMAIL 2 — Presupuesto al cliente
  await send(
    "[TEST 2/6] Presupuesto PRE-2025-0018 de Taller Creativo SL",
    quoteToClientEmail({
      clientName,
      quoteNumber: "PRE-2025-0018",
      total: 3750.00,
      businessName,
      docUrl: quoteDocUrl,
      pixelUrl: quotePixelUrl,
      expiresAt: new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000),
      senderEmail: "hola@tallercreativo.es",
    })
  )

  // EMAIL 3 — Documento abierto (al autónomo)
  await send(
    "[TEST 3/6] Iyan Rimada ha visto tu presupuesto",
    documentOpenedEmail({
      senderName: "Pablo García",
      recipientName: clientName,
      recipientEmail: TO,
      docType: "QUOTE",
      docNumber: "PRE-2025-0018",
      total: 3750.00,
      dashboardUrl: `${APP_URL}/dashboard/finance/presupuestos`,
    })
  )

  // EMAIL 4 — Presupuesto aceptado (al autónomo)
  await send(
    "[TEST 4/6] ✅ Iyan Rimada ha aceptado el presupuesto PRE-2025-0018",
    quoteAcceptedToSenderEmail({
      senderName: "Pablo García",
      recipientName: clientName,
      recipientEmail: TO,
      quoteNumber: "PRE-2025-0018",
      total: 3750.00,
      signatureName: "Iyan Rimada Serrano",
      signatureHash: "a3f9c2e1b0d8f7a6c5e4d3b2a1f9e8d7c6b5a4e3d2c1b0a9f8e7d6c5b4a3f2e1",
      acceptedAt: now,
      invoicingUrl: `${APP_URL}/dashboard/finance/invoicing`,
    })
  )

  // EMAIL 5 — Presupuesto rechazado (al autónomo)
  await send(
    "[TEST 5/6] Iyan Rimada ha rechazado el presupuesto PRE-2025-0017",
    quoteRejectedToSenderEmail({
      senderName: "Pablo García",
      recipientName: clientName,
      recipientEmail: TO,
      quoteNumber: "PRE-2025-0017",
      total: 2100.00,
      rejectionReason: "El precio no se ajusta a nuestro presupuesto actual. Lo retomaremos en el próximo trimestre.",
      dashboardUrl: `${APP_URL}/dashboard/finance/presupuestos`,
    })
  )

  // EMAIL 6 — Confirmación de aceptación (al cliente)
  await send(
    "[TEST 6/6] Confirmación de aceptación — PRE-2025-0018",
    acceptanceConfirmationEmail({
      businessName,
      recipientName: clientName,
      docNumber: "PRE-2025-0018",
      senderName: "Pablo García",
      signatureName: "Iyan Rimada Serrano",
      acceptedAt: now,
      docUrl: quoteDocUrl,
    })
  )

  console.log("\nListo.")
}

main().catch(console.error).finally(() => prisma.$disconnect())
