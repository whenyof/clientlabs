export const maxDuration = 30
export const dynamic = "force-dynamic"

import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { renderTemplate } from "@/lib/automations/engine"
import { sendEmail } from "@/lib/email"

type Params = { params: Promise<{ id: string }> }

async function getUserId() {
  const session = await getServerSession(authOptions)
  return session?.user?.id ?? null
}

async function resolveRecipients(userId: string, recipientFilter: { type: string; value?: string }): Promise<{ email: string; name: string | null }[]> {
  const type = recipientFilter?.type ?? "all"

  if (type === "all") {
    const clients = await prisma.client.findMany({
      where: { userId, email: { not: null } },
      select: { email: true, name: true },
      take: 500,
    })
    return clients.filter(c => c.email).map(c => ({ email: c.email!, name: c.name }))
  }

  if (type === "leads") {
    const leads = await prisma.lead.findMany({
      where: { userId, email: { not: null }, converted: false },
      select: { email: true, name: true },
      take: 500,
    })
    return leads.filter(l => l.email).map(l => ({ email: l.email!, name: l.name }))
  }

  if (type === "estado" && recipientFilter.value) {
    const clients = await prisma.client.findMany({
      where: { userId, status: recipientFilter.value, email: { not: null } },
      select: { email: true, name: true },
      take: 500,
    })
    return clients.filter(c => c.email).map(c => ({ email: c.email!, name: c.name }))
  }

  return []
}

export async function POST(_req: NextRequest, { params }: Params) {
  try {
    const { id } = await params
    const userId = await getUserId()
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    const campaign = await prisma.emailCampaign.findFirst({ where: { id, userId } })
    if (!campaign) return NextResponse.json({ error: "Not found" }, { status: 404 })
    if (campaign.estado === "enviada") return NextResponse.json({ error: "Ya fue enviada" }, { status: 400 })

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { name: true, email: true },
    })

    const recipients = await resolveRecipients(userId, campaign.recipientFilter as { type: string; value?: string })
    if (recipients.length === 0) {
      return NextResponse.json({ error: "Sin destinatarios" }, { status: 400 })
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
            "usuario.nombre": user?.name ?? "Tu proveedor",
          }
          const asunto = renderTemplate(campaign.asunto, vars)
          const cuerpo = renderTemplate(campaign.contenido, vars)
          await sendEmail(r.email, asunto, cuerpo)
        })
      )
      enviados += results.filter(r => r.status === "fulfilled").length
      errores += results.filter(r => r.status === "rejected").length
    }

    await prisma.emailCampaign.update({
      where: { id },
      data: {
        estado: "enviada",
        sentAt: new Date(),
        totalEnviados: enviados,
        totalErrores: errores,
      },
    })

    return NextResponse.json({ success: true, enviados, errores })
  } catch (error) {
    console.error("[POST /api/campaigns/[id]/send]:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
