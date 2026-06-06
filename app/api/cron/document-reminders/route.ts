export const maxDuration = 60

import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { sendEmail } from "@/lib/email"

export async function GET(req: NextRequest) {
  const authHeader = req.headers.get("authorization")
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const now = new Date()
  const h24 = new Date(now.getTime() - 24 * 60 * 60 * 1000)
  const h48 = new Date(now.getTime() - 48 * 60 * 60 * 1000)
  const h72 = new Date(now.getTime() - 72 * 60 * 60 * 1000)
  const in2days = new Date(now.getTime() + 2 * 24 * 60 * 60 * 1000)
  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "https://app.clientlabs.io"

  let sent = 0

  // 1. Documento visto pero sin decisión tras 48h → recordatorio al cliente
  const viewedNeedingReminder = await prisma.documentView.findMany({
    where: {
      status: "DOC_OPENED",
      decidedAt: null,
      docOpenedAt: { lt: h48 },
      reminderCount: { lt: 2 },
      type: "QUOTE",
      OR: [{ lastReminderAt: null }, { lastReminderAt: { lt: h24 } }]
    },
    select: {
      id: true, token: true, recipientEmail: true, recipientName: true,
      user: { select: { name: true } }
    }
  })

  for (const v of viewedNeedingReminder) {
    const senderName = v.user.name ?? "Tu proveedor"
    const docUrl = `${appUrl}/doc/${v.token}`
    const html = `
      <div style="font-family:'Inter',sans-serif;max-width:520px;margin:0 auto;padding:32px 16px;background:#F6F8FA">
        <div style="background:#fff;border-radius:12px;border:1px solid #E5E9ED;padding:32px">
          <p style="font-size:22px;font-weight:800;color:#0B1F2A;margin:0 0 12px">Recordatorio de presupuesto</p>
          <p style="font-size:15px;color:#3F4D58;line-height:1.6;margin:0 0 24px">
            Hola <strong>${v.recipientName}</strong>, queremos recordarte que tienes un presupuesto pendiente de revisión de <strong>${senderName}</strong>.
          </p>
          <a href="${docUrl}" style="display:inline-block;background:#0F766E;color:#fff;padding:12px 24px;border-radius:8px;font-weight:600;font-size:15px;text-decoration:none">Ver presupuesto</a>
        </div>
      </div>
    `
    await sendEmail(v.recipientEmail, `Recordatorio: tienes un presupuesto pendiente`, html).catch(() => {})
    await prisma.documentView.update({
      where: { id: v.id },
      data: { reminderCount: { increment: 1 }, lastReminderAt: now }
    })
    sent++
  }

  // 2. Enviado pero sin abrir tras 72h y sin recordatorio → recordatorio al cliente
  const sentNeedingReminder = await prisma.documentView.findMany({
    where: {
      status: { in: ["SENT", "EMAIL_OPENED"] },
      decidedAt: null,
      sentAt: { lt: h72 },
      reminderCount: 0,
      type: "QUOTE"
    },
    select: {
      id: true, token: true, recipientEmail: true, recipientName: true,
      user: { select: { name: true } }
    }
  })

  for (const v of sentNeedingReminder) {
    const senderName = v.user.name ?? "Tu proveedor"
    const docUrl = `${appUrl}/doc/${v.token}`
    const html = `
      <div style="font-family:'Inter',sans-serif;max-width:520px;margin:0 auto;padding:32px 16px;background:#F6F8FA">
        <div style="background:#fff;border-radius:12px;border:1px solid #E5E9ED;padding:32px">
          <p style="font-size:22px;font-weight:800;color:#0B1F2A;margin:0 0 12px">¿Has podido revisar el presupuesto?</p>
          <p style="font-size:15px;color:#3F4D58;line-height:1.6;margin:0 0 24px">
            Hola <strong>${v.recipientName}</strong>, <strong>${senderName}</strong> te envió un presupuesto hace unos días y aún no lo has revisado.
          </p>
          <a href="${docUrl}" style="display:inline-block;background:#0F766E;color:#fff;padding:12px 24px;border-radius:8px;font-weight:600;font-size:15px;text-decoration:none">Ver presupuesto</a>
        </div>
      </div>
    `
    await sendEmail(v.recipientEmail, `Tienes un presupuesto sin revisar`, html).catch(() => {})
    await prisma.documentView.update({
      where: { id: v.id },
      data: { reminderCount: { increment: 1 }, lastReminderAt: now }
    })
    sent++
  }

  // 3. Expiran en 2 días → aviso al autónomo
  const expiringSoon = await prisma.documentView.findMany({
    where: {
      expiresAt: { lte: in2days, gt: now },
      status: { notIn: ["ACCEPTED", "REJECTED", "EXPIRED"] }
    },
    select: {
      id: true, type: true, recipientName: true,
      user: { select: { email: true, name: true } }
    }
  })

  for (const v of expiringSoon) {
    if (!v.user.email) continue
    const typeLabel = v.type === "INVOICE" ? "factura" : "presupuesto"
    const html = `
      <div style="font-family:'Inter',sans-serif;max-width:520px;margin:0 auto;padding:32px 16px;background:#F6F8FA">
        <div style="background:#fff;border-radius:12px;border:1px solid #E5E9ED;padding:32px">
          <p style="font-size:22px;font-weight:800;color:#0B1F2A;margin:0 0 12px">Documento próximo a expirar</p>
          <p style="font-size:15px;color:#3F4D58;line-height:1.6;margin:0 0 24px">
            El ${typeLabel} enviado a <strong>${v.recipientName}</strong> expira en menos de 2 días sin respuesta.
          </p>
          <a href="${appUrl}/dashboard" style="display:inline-block;background:#0F766E;color:#fff;padding:12px 24px;border-radius:8px;font-weight:600;font-size:15px;text-decoration:none">Ver en el panel</a>
        </div>
      </div>
    `
    await sendEmail(v.user.email, `Tu ${typeLabel} a ${v.recipientName} expira pronto`, html).catch(() => {})
  }

  return NextResponse.json({ ok: true, sent, expiringSoon: expiringSoon.length })
}
