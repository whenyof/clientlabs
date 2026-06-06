import { PrismaClient } from "@prisma/client"

const prisma = new PrismaClient()

async function main() {
  const invoice = await prisma.invoice.findFirst({
    select: { id: true, number: true, userId: true }
  })
  if (!invoice) { console.error("No hay facturas en la BD"); return }

  console.log("Usando factura:", invoice.number, invoice.id)

  const now = new Date()

  // 1. Token EXPIRADO
  const expired = await prisma.documentView.create({
    data: {
      type: "INVOICE",
      documentId: invoice.id,
      userId: invoice.userId,
      recipientEmail: "test-expired@clientlabs.io",
      recipientName: "Cliente Expirado",
      status: "SENT",
      expiresAt: new Date(now.getTime() - 24 * 60 * 60 * 1000),
    },
    select: { token: true }
  })
  console.log("EXPIRADO  →", expired.token)

  // 2. Token ACEPTADO
  const accepted = await prisma.documentView.create({
    data: {
      type: "INVOICE",
      documentId: invoice.id,
      userId: invoice.userId,
      recipientEmail: "test-accepted@clientlabs.io",
      recipientName: "Cliente Aceptado",
      status: "ACCEPTED",
      expiresAt: new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000),
      decidedAt: now,
      signatureName: "María García López",
      signatureIp: "127.0.0.1",
    },
    select: { token: true }
  })
  console.log("ACEPTADO  →", accepted.token)

  // 3. Token RECHAZADO
  const rejected = await prisma.documentView.create({
    data: {
      type: "INVOICE",
      documentId: invoice.id,
      userId: invoice.userId,
      recipientEmail: "test-rejected@clientlabs.io",
      recipientName: "Cliente Rechazado",
      status: "REJECTED",
      expiresAt: new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000),
      decidedAt: now,
      rejectionReason: "El precio no se ajusta a nuestro presupuesto.",
      signatureIp: "127.0.0.1",
    },
    select: { token: true }
  })
  console.log("RECHAZADO →", rejected.token)

  // 4. Token PENDIENTE (vista limpia)
  const pending = await prisma.documentView.create({
    data: {
      type: "INVOICE",
      documentId: invoice.id,
      userId: invoice.userId,
      recipientEmail: "test-pending@clientlabs.io",
      recipientName: "Cliente Pendiente",
      status: "SENT",
      expiresAt: new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000),
    },
    select: { token: true }
  })
  console.log("PENDIENTE →", pending.token)

  const base = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000"
  console.log("\nURLs de prueba:")
  console.log("  Expirado  →", `${base}/doc/${expired.token}`)
  console.log("  Aceptado  →", `${base}/doc/${accepted.token}`)
  console.log("  Rechazado →", `${base}/doc/${rejected.token}`)
  console.log("  Pendiente →", `${base}/doc/${pending.token}`)
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
