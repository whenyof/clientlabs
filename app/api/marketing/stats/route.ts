export const maxDuration = 10
export const dynamic = "force-dynamic"

import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

function formatSource(source: string | null): string {
  const map: Record<string, string> = {
    WEB: "Web / Formulario",
    LINKEDIN: "LinkedIn",
    REFERRAL: "Referidos",
    MANUAL: "Manual",
    EMAIL: "Email",
    WHATSAPP: "WhatsApp",
    INSTAGRAM: "Instagram",
    FACEBOOK: "Facebook",
    GOOGLE: "Google Ads",
    OTHER: "Otros",
  }
  return map[(source ?? "").toUpperCase()] ?? source ?? "Otros"
}

export async function GET() {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  const userId = session.user.id

  const now = new Date()
  const startOfThisMonth = new Date(now.getFullYear(), now.getMonth(), 1)
  const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1)

  const [
    totalLeads,
    leadsThisMonth,
    leadsLastMonth,
    campaignAgg,
    recentCampaigns,
    leadSources,
  ] = await Promise.all([
    prisma.lead.count({ where: { userId } }),
    prisma.lead.count({ where: { userId, createdAt: { gte: startOfThisMonth } } }),
    prisma.lead.count({ where: { userId, createdAt: { gte: startOfLastMonth, lt: startOfThisMonth } } }),
    prisma.emailCampaign.aggregate({
      where: { userId },
      _sum: { totalEnviados: true, totalAbiertos: true, totalClicks: true },
    }),
    prisma.emailCampaign.findMany({
      where: { userId },
      select: {
        id: true, nombre: true, estado: true,
        totalEnviados: true, totalAbiertos: true, totalClicks: true,
        sentAt: true, scheduledAt: true, recipientFilter: true,
      },
      orderBy: { updatedAt: "desc" },
      take: 3,
    }),
    prisma.lead.groupBy({
      by: ["source"],
      where: { userId, createdAt: { gte: startOfThisMonth } },
      _count: { id: true },
      orderBy: { _count: { id: "desc" } },
      take: 4,
    }),
  ])

  const totalEnviados = campaignAgg._sum.totalEnviados ?? 0
  const totalAbiertos = campaignAgg._sum.totalAbiertos ?? 0
  const totalClicks = campaignAgg._sum.totalClicks ?? 0
  const tasaApertura = totalEnviados > 0 ? Math.round((totalAbiertos / totalEnviados) * 1000) / 10 : 0
  const ctr = totalEnviados > 0 ? Math.round((totalClicks / totalEnviados) * 1000) / 10 : 0

  const fuentes = leadSources.map((s) => ({
    nombre: formatSource(s.source),
    cantidad: s._count.id,
    porcentaje: leadsThisMonth > 0 ? Math.round((s._count.id / leadsThisMonth) * 100) : 0,
  }))

  return NextResponse.json({
    kpis: {
      totalContactos: totalLeads,
      totalContactosDiff: leadsLastMonth > 0 ? leadsThisMonth - leadsLastMonth : null,
      emailsEnviados: totalEnviados,
      tasaApertura,
      ctr,
      leadsGenerados: leadsThisMonth,
      leadsGeneradosDiff: leadsLastMonth > 0 ? leadsThisMonth - leadsLastMonth : null,
    },
    campanasRecientes: recentCampaigns.map((c) => ({
      ...c,
      aperturaPct: c.totalEnviados > 0 ? Math.round((c.totalAbiertos / c.totalEnviados) * 100) : null,
    })),
    fuentes,
  })
}
