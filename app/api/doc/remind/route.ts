export const maxDuration = 10

import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { sendEmail } from "@/lib/email"

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const body = await req.json()
  const { viewId } = body as { viewId?: string }

  if (!viewId) {
    return NextResponse.json({ error: "Missing viewId" }, { status: 400 })
  }

  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "https://app.clientlabs.io"

  const view = await prisma.documentView.findFirst({
    where: { id: viewId, userId: session.user.id },
    select: {
      id: true, token: true, type: true, reminderCount: true,
      status: true,
      recipientEmail: true, recipientName: true,
      user: { select: { name: true } }
    }
  })

  if (!view) {
    return NextResponse.json({ error: "Not found" }, { status: 404 })
  }

  if (view.status === "ACCEPTED" || view.status === "REJECTED" || view.status === "EXPIRED") {
    return NextResponse.json({ error: "document_already_decided" }, { status: 409 })
  }

  if (view.reminderCount >= 3) {
    return NextResponse.json({ error: "max_reminders_reached" }, { status: 429 })
  }

  const typeLabel = view.type === "INVOICE" ? "factura" : "presupuesto"
  const senderName = view.user.name ?? "Tu proveedor"
  const docUrl = `${appUrl}/doc/${view.token}`

  const html = `
    <div style="font-family:'Inter',sans-serif;max-width:520px;margin:0 auto;padding:32px 16px;background:#F6F8FA">
      <div style="background:#fff;border-radius:12px;border:1px solid #E5E9ED;padding:32px">
        <p style="font-size:22px;font-weight:800;color:#0B1F2A;margin:0 0 12px">Recordatorio pendiente</p>
        <p style="font-size:15px;color:#3F4D58;line-height:1.6;margin:0 0 24px">
          Hola <strong>${view.recipientName}</strong>, <strong>${senderName}</strong> te ha enviado un ${typeLabel} pendiente de revision.
        </p>
        <a href="${docUrl}" style="display:inline-block;background:#0F766E;color:#fff;padding:12px 24px;border-radius:8px;font-weight:600;font-size:15px;text-decoration:none">Ver ${typeLabel}</a>
      </div>
    </div>
  `

  await sendEmail(view.recipientEmail, `Recordatorio: tienes un ${typeLabel} pendiente`, html)

  await prisma.documentView.update({
    where: { id: view.id },
    data: { reminderCount: { increment: 1 }, lastReminderAt: new Date() }
  })

  return NextResponse.json({ ok: true })
}
