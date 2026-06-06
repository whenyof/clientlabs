import { createHash } from "crypto"
import { prisma } from "@/lib/prisma"
import { sendEmail } from "@/lib/email"
import {
  documentOpenedEmail,
  quoteAcceptedToSenderEmail,
  quoteRejectedToSenderEmail,
  quoteAcceptedToRecipientEmail,
  quoteRejectedToRecipientEmail,
  invoiceReceivedByClientEmail,
} from "@/lib/email-templates"
import type { DocumentViewType, DocumentViewStatus } from "@prisma/client"

type NotifyView = {
  userId: string
  documentId: string
  recipientName: string
  recipientEmail: string
  type: DocumentViewType
}

type DecisionView = {
  id: string
  token: string
  documentId: string
  userId: string
  type: DocumentViewType
  status: DocumentViewStatus
  recipientEmail: string
  recipientName: string
  sentAt: Date
  emailOpenedAt: Date | null
  docOpenedAt: Date | null
  viewCount: number
  decidedAt: Date | null
  signatureName: string | null
  signatureIp: string | null
  signatureHash: string | null
  rejectionReason: string | null
  reminderCount: number
  lastReminderAt: Date | null
  createdAt: Date
  updatedAt: Date
}

export async function getDocumentData(type: DocumentViewType, documentId: string) {
  if (type === "INVOICE") {
    const inv = await prisma.invoice.findUnique({
      where: { id: documentId },
      select: {
        id: true, number: true, issueDate: true, dueDate: true,
        subtotal: true, taxAmount: true, total: true,
        notes: true, terms: true, currency: true, paymentMethod: true,
        // No iban, no status, no snapshots fiscales
        Client: { select: { name: true, address: true, city: true, taxId: true } },
        User: {
          select: {
            name: true,
            // No email del autónomo
            BusinessProfile: { select: { companyName: true, address: true, city: true, taxId: true, phone: true } }
          }
        },
        items: { select: { product: true, quantity: true, price: true, taxRate: true, lineTotal: true } }
      }
    })
    return inv
  }

  if (type === "QUOTE") {
    const quote = await prisma.quote.findUnique({
      where: { id: documentId },
      select: {
        id: true, number: true, issueDate: true, validUntil: true,
        subtotal: true, taxTotal: true, total: true,
        notes: true, terms: true, irpfRate: true, irpfAmount: true,
        // No status, no email del cliente ni del autónomo
        client: { select: { name: true, address: true, city: true, taxId: true } },
        user: {
          select: {
            name: true,
            BusinessProfile: { select: { companyName: true, address: true, city: true, taxId: true, phone: true } }
          }
        },
        items: { select: { description: true, quantity: true, unitPrice: true, taxRate: true, subtotal: true } }
      }
    })
    return quote
  }

  return null
}

export async function notifyDocumentOpened(view: NotifyView) {
  const user = await prisma.user.findUnique({
    where: { id: view.userId },
    select: { email: true, name: true }
  })
  if (!user?.email) return

  const typeLabel = view.type === "INVOICE" ? "factura" : "presupuesto"
  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "https://app.clientlabs.io"

  const dashboardUrl = view.type === "INVOICE"
    ? `${appUrl}/dashboard/finance/invoicing/${view.documentId}`
    : `${appUrl}/dashboard/finance/presupuestos/${view.documentId}`

  const html = documentOpenedEmail({
    senderName: user.name ?? "tú",
    recipientName: view.recipientName,
    recipientEmail: view.recipientEmail,
    docType: view.type === "INVOICE" ? "INVOICE" : "QUOTE",
    dashboardUrl,
  })

  await sendEmail(user.email, `${view.recipientName} ha visto tu ${typeLabel}`, html).catch(() => {})
}

export async function onDocumentAccepted(view: DecisionView, signatureName: string) {
  const user = await prisma.user.findUnique({
    where: { id: view.userId },
    select: { email: true, name: true }
  })

  if (view.type === "QUOTE") {
    const quote = await prisma.quote.findUnique({
      where: { id: view.documentId },
      select: {
        id: true, number: true, subtotal: true, taxTotal: true, total: true,
        notes: true, terms: true, irpfRate: true, irpfAmount: true,
        clientId: true,
        items: {
          select: { description: true, quantity: true, unitPrice: true, taxRate: true, subtotal: true }
        }
      }
    })

    if (quote) {
      // Update quote status
      await prisma.quote.update({
        where: { id: quote.id },
        data: { status: "ACCEPTED" }
      })

      // Create invoice draft from accepted quote (GAP B)
      try {
        const series = await prisma.invoiceSeries.findFirst({
          where: { userId: view.userId, isDefault: true },
          select: { prefix: true, year: true }
        })
        const seriesPrefix = series?.prefix ?? "F"
        const seriesYear = series?.year ?? new Date().getFullYear()

        const dueDate = new Date()
        dueDate.setDate(dueDate.getDate() + 30)

        const subtotal = quote.subtotal
        const taxAmount = quote.taxTotal
        const total = quote.total

        const invoice = await prisma.invoice.create({
          data: {
            userId: view.userId,
            clientId: quote.clientId,
            number: "BORRADOR",
            series: seriesPrefix,
            issueDate: new Date(),
            dueDate,
            status: "DRAFT",
            subtotal,
            taxAmount,
            taxTotal: taxAmount,
            total,
            notes: quote.notes ?? undefined,
            terms: quote.terms ?? undefined,
            irpfRate: quote.irpfRate ?? 0,
            irpfAmount: quote.irpfAmount ?? 0,
            discount: 0,
          },
          select: { id: true }
        })

        // Create invoice items
        if (quote.items.length > 0) {
          await prisma.invoiceItem.createMany({
            data: quote.items.map((item) => ({
              invoiceId: invoice.id,
              product: item.description,
              quantity: Math.round(item.quantity),
              price: item.unitPrice,
              taxRate: Math.round(item.taxRate),
              lineTotal: item.subtotal,
            }))
          })
        }

        // Link quote to invoice
        await prisma.quote.update({
          where: { id: quote.id },
          data: { convertedToInvoiceId: invoice.id }
        })
      } catch (err) {
        console.error("[document-tracking] Failed to create invoice draft from quote:", err)
      }
    }
  }

  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "https://app.clientlabs.io"

  // Necesitamos docNumber y total para los emails — buscar datos del documento
  let docNumber = ""
  let docTotal = 0
  let docHash = ""
  if (view.type === "QUOTE") {
    const q = await prisma.quote.findUnique({ where: { id: view.documentId }, select: { number: true, total: true } })
    docNumber = q?.number ?? ""
    docTotal = q?.total != null ? Number(q.total) : 0
    docHash = view.signatureHash ?? ""
  } else {
    const inv = await prisma.invoice.findUnique({ where: { id: view.documentId }, select: { number: true, total: true } })
    docNumber = inv?.number ?? ""
    docTotal = inv?.total != null ? Number(inv.total) : 0
    docHash = view.signatureHash ?? ""
  }

  const senderName = user?.name ?? "Tu proveedor"
  const senderEmail = user?.email ?? ""
  const docUrl = `${appUrl}/doc/${view.token}`

  // Email al autónomo
  if (user?.email && view.type === "QUOTE") {
    const html = quoteAcceptedToSenderEmail({
      senderName,
      recipientName: view.recipientName,
      recipientEmail: view.recipientEmail,
      quoteNumber: docNumber,
      total: docTotal,
      signatureName,
      signatureHash: docHash,
      acceptedAt: view.decidedAt ?? new Date(),
      invoicingUrl: `${appUrl}/dashboard/finance/invoicing`,
      quotesUrl: `${appUrl}/dashboard/finance/presupuestos/${view.documentId}`,
    })
    await sendEmail(user.email, `${view.recipientName} ha aceptado el presupuesto ${docNumber}`, html).catch(() => {})
  }

  // Email de confirmación al cliente (presupuesto aceptado)
  if (view.type === "QUOTE") {
    const decidedFmt = new Intl.DateTimeFormat("es-ES", {
      day: "numeric", month: "long", year: "numeric", hour: "2-digit", minute: "2-digit",
    }).format(view.decidedAt ?? new Date())
    const html = quoteAcceptedToRecipientEmail({
      recipientName: view.recipientName,
      senderName,
      senderEmail,
      number: docNumber,
      total: docTotal,
      decidedAt: decidedFmt,
      docUrl,
    })
    await sendEmail(view.recipientEmail, `Confirmado — trabajamos juntos`, html).catch(() => {})
  }
}

export async function onDocumentRejected(view: DecisionView, reason?: string) {
  if (view.type === "QUOTE") {
    await prisma.quote.update({
      where: { id: view.documentId },
      data: { status: "REJECTED" }
    }).catch(() => {})
  }

  const user = await prisma.user.findUnique({
    where: { id: view.userId },
    select: { email: true, name: true }
  })

  if (user?.email) {
    const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "https://app.clientlabs.io"

    let docNumber = ""
    let docTotal = 0
    if (view.type === "QUOTE") {
      const q = await prisma.quote.findUnique({ where: { id: view.documentId }, select: { number: true, total: true } })
      docNumber = q?.number ?? ""
      docTotal = q?.total != null ? Number(q.total) : 0
    } else {
      const inv = await prisma.invoice.findUnique({ where: { id: view.documentId }, select: { number: true, total: true } })
      docNumber = inv?.number ?? ""
      docTotal = inv?.total != null ? Number(inv.total) : 0
    }

    const rejectedDashboardUrl = view.type === "INVOICE"
      ? `${appUrl}/dashboard/finance/invoicing/${view.documentId}`
      : `${appUrl}/dashboard/finance/presupuestos/${view.documentId}`

    const html = quoteRejectedToSenderEmail({
      senderName: user.name ?? "tú",
      recipientName: view.recipientName,
      recipientEmail: view.recipientEmail,
      quoteNumber: docNumber,
      total: docTotal,
      rejectionReason: reason,
      dashboardUrl: rejectedDashboardUrl,
    })
    const typeLabel = view.type === "INVOICE" ? "factura" : "presupuesto"
    await sendEmail(user.email, `${view.recipientName} ha rechazado tu ${typeLabel} ${docNumber}`, html).catch(() => {})
  }

  // Email al cliente confirmando que se recibió el rechazo
  if (view.type === "QUOTE") {
    const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "https://app.clientlabs.io"
    const user2 = await prisma.user.findUnique({ where: { id: view.userId }, select: { name: true, email: true } })
    const q = await prisma.quote.findUnique({ where: { id: view.documentId }, select: { number: true } })
    const html = quoteRejectedToRecipientEmail({
      recipientName: view.recipientName,
      senderName: user2?.name ?? "Tu proveedor",
      senderEmail: user2?.email ?? "",
      number: q?.number ?? "",
      docUrl: `${appUrl}/doc/${view.token}`,
    })
    await sendEmail(view.recipientEmail, `Recibimos tu respuesta — ${q?.number ?? ""}`, html).catch(() => {})
  }
}

export async function notifyInvoiceReceivedByClient(params: {
  recipientEmail: string
  recipientName: string
  senderName: string
  senderEmail: string
  number: string
  total: number
  dueDate?: string
  docUrl: string
}): Promise<void> {
  const html = invoiceReceivedByClientEmail(params)
  await sendEmail(
    params.recipientEmail,
    `Tu factura de ${params.senderName} está disponible`,
    html,
  ).catch(() => {})
}

export function makeSignatureHash(documentId: string, signatureName: string, ip: string) {
  return createHash("sha256")
    .update(`${documentId}:${signatureName}:${ip}:${Date.now()}`)
    .digest("hex")
}
