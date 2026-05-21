export const maxDuration = 60
export const dynamic = "force-dynamic"

import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { renderTemplate } from "@/lib/automations/engine"
import { sendEmail } from "@/lib/email"

export async function GET(request: Request) {
  const authHeader = request.headers.get("authorization")
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    const now = new Date()
    const campaigns = await prisma.emailCampaign.findMany({
      where: {
        estado: "programada",
        scheduledAt: { lte: now },
      },
      select: {
        id: true, userId: true, nombre: true, asunto: true, contenido: true, recipientFilter: true,
        user: { select: { name: true, email: true } },
      },
      take: 10,
    })

    let processed = 0

    for (const campaign of campaigns) {
      try {
        const filter = campaign.recipientFilter as { type: string; value?: string }
        let recipients: { email: string; name: string | null }[] = []

        if (filter.type === "all") {
          const clients = await prisma.client.findMany({
            where: { userId: campaign.userId, email: { not: null } },
            select: { email: true, name: true },
            take: 500,
          })
          recipients = clients.filter(c => c.email).map(c => ({ email: c.email!, name: c.name }))
        } else if (filter.type === "leads") {
          const leads = await prisma.lead.findMany({
            where: { userId: campaign.userId, email: { not: null }, converted: false },
            select: { email: true, name: true },
            take: 500,
          })
          recipients = leads.filter(l => l.email).map(l => ({ email: l.email!, name: l.name }))
        }

        let enviados = 0
        let errores = 0

        const BATCH = 50
        for (let i = 0; i < recipients.length; i += BATCH) {
          const batch = recipients.slice(i, i + BATCH)
          const results = await Promise.allSettled(
            batch.map(async (r) => {
              const vars = {
                nombre: r.name ?? r.email,
                email: r.email,
                "usuario.nombre": campaign.user?.name ?? "Tu proveedor",
              }
              await sendEmail(
                r.email,
                renderTemplate(campaign.asunto, vars),
                renderTemplate(campaign.contenido, vars),
              )
            })
          )
          enviados += results.filter(r => r.status === "fulfilled").length
          errores += results.filter(r => r.status === "rejected").length
        }

        await prisma.emailCampaign.update({
          where: { id: campaign.id },
          data: { estado: "enviada", sentAt: now, totalEnviados: enviados, totalErrores: errores },
        })

        processed++
      } catch (err) {
        console.error(`[cron/send-campaigns] error campaign ${campaign.id}:`, err)
        await prisma.emailCampaign.update({
          where: { id: campaign.id },
          data: { estado: "error" },
        }).catch(() => null)
      }
    }

    return NextResponse.json({ success: true, processed })
  } catch (error) {
    console.error("[cron/send-campaigns]:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
