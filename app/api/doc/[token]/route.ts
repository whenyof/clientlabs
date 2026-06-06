export const maxDuration = 10

import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import {
  getDocumentData,
  notifyDocumentOpened,
  notifyInvoiceReceivedByClient,
  onDocumentAccepted,
  onDocumentRejected,
  makeSignatureHash,
} from "@/lib/document-tracking"

type Params = { params: Promise<{ token: string }> }

export async function GET(_req: NextRequest, { params }: Params) {
  try {
    const { token } = await params

    const view = await prisma.documentView.findUnique({
      where: { token },
      select: {
        id: true, token: true, type: true, documentId: true, userId: true,
        recipientEmail: true, recipientName: true,
        status: true, sentAt: true, emailOpenedAt: true, docOpenedAt: true,
        viewCount: true, decidedAt: true, signatureName: true,
        rejectionReason: true, expiresAt: true,
        user: { select: { name: true, email: true } }
      }
    })

    if (!view) {
      return NextResponse.json({ error: "not_found" }, { status: 404 })
    }

    if (view.expiresAt && view.expiresAt < new Date()) {
      return NextResponse.json({ error: "expired" }, { status: 410 })
    }

    const isFirstOpen = !view.docOpenedAt

    if (view.status === "SENT" || view.status === "EMAIL_OPENED") {
      await prisma.documentView.update({
        where: { token },
        data: {
          status: "DOC_OPENED",
          docOpenedAt: view.docOpenedAt ?? new Date(),
          viewCount: { increment: 1 }
        }
      })

      if (isFirstOpen) {
        notifyDocumentOpened(view).catch(() => {})

        // Email de recepción al cliente — solo facturas, primera apertura
        if (view.type === "INVOICE") {
          const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "https://app.clientlabs.io"
          getDocumentData("INVOICE", view.documentId).then(async (invData) => {
            const inv = invData as Record<string, unknown> | null
            if (!inv) return
            const dueDate = inv.dueDate
              ? new Intl.DateTimeFormat("es-ES", { day: "numeric", month: "long", year: "numeric" }).format(new Date(inv.dueDate as string))
              : undefined
            await notifyInvoiceReceivedByClient({
              recipientEmail: view.recipientEmail,
              recipientName: view.recipientName,
              senderName: view.user.name ?? "Tu proveedor",
              senderEmail: view.user.email ?? "",
              number: (inv.number as string) ?? "",
              total: Number(inv.total ?? 0),
              dueDate,
              docUrl: `${appUrl}/doc/${token}`,
            })
          }).catch(() => {})
        }
      }
    } else {
      await prisma.documentView.update({
        where: { token },
        data: { viewCount: { increment: 1 } }
      })
    }

    const documentData = await getDocumentData(view.type, view.documentId)

    return NextResponse.json({
      view: {
        id: view.id,
        type: view.type,
        status: view.status,
        recipientName: view.recipientName,
        decidedAt: view.decidedAt,
        signatureName: view.signatureName,
        rejectionReason: view.rejectionReason,
        expiresAt: view.expiresAt,
      },
      document: documentData,
      sender: { name: view.user.name }  // no email del autónomo en respuesta pública
    })
  } catch (err) {
    console.error("[doc/token] GET error:", err)
    return NextResponse.json({ error: "internal" }, { status: 500 })
  }
}

const ALLOWED_ACTIONS = ["accept", "reject", "download"] as const
type PostAction = typeof ALLOWED_ACTIONS[number]

export async function POST(req: NextRequest, { params }: Params) {
  const { token } = await params
  const body = await req.json()
  const { action, signatureName, reason } = body as {
    action: PostAction
    signatureName?: string
    reason?: string
  }

  if (!ALLOWED_ACTIONS.includes(action as PostAction)) {
    return NextResponse.json({ error: "invalid_action" }, { status: 400 })
  }

  const view = await prisma.documentView.findUnique({
    where: { token },
    select: {
      id: true, token: true, documentId: true, userId: true, type: true,
      status: true, expiresAt: true, recipientEmail: true, recipientName: true,
      sentAt: true, emailOpenedAt: true, docOpenedAt: true,
      viewCount: true, decidedAt: true, signatureName: true,
      signatureIp: true, signatureHash: true, rejectionReason: true,
      reminderCount: true, lastReminderAt: true, createdAt: true, updatedAt: true
    }
  })

  if (!view) return NextResponse.json({ error: "not_found" }, { status: 404 })

  if (view.expiresAt && view.expiresAt < new Date()) {
    return NextResponse.json({ error: "expired" }, { status: 410 })
  }

  if (view.status === "ACCEPTED" || view.status === "REJECTED") {
    return NextResponse.json({ error: "already_decided" }, { status: 409 })
  }

  const ip = req.headers.get("x-forwarded-for") ?? "unknown"

  if (action === "accept") {
    if (!signatureName || signatureName.trim().length < 2) {
      return NextResponse.json({ error: "signature_required" }, { status: 422 })
    }
    const hash = makeSignatureHash(view.documentId, signatureName, ip)

    await prisma.documentView.update({
      where: { token },
      data: {
        status: "ACCEPTED",
        decidedAt: new Date(),
        signatureName,
        signatureIp: ip,
        signatureHash: hash
      }
    })

    onDocumentAccepted(view, signatureName).catch(() => {})

  } else if (action === "reject") {
    await prisma.documentView.update({
      where: { token },
      data: {
        status: "REJECTED",
        decidedAt: new Date(),
        signatureIp: ip,
        rejectionReason: reason ?? null
      }
    })

    onDocumentRejected(view, reason).catch(() => {})

  } else if (action === "download") {
    await prisma.documentView.update({
      where: { token },
      data: { downloadedAt: new Date() }
    })
  }

  return NextResponse.json({ ok: true })
}
