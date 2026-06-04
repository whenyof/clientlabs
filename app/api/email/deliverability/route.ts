export const maxDuration = 10
export const dynamic = "force-dynamic"

import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { getCachedData, setCachedData } from "@/lib/redis-cache"

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    const userId = session.user.id
    const cacheKey = `email-deliverability-${userId}`
    const cached = await getCachedData(cacheKey)
    if (cached) return NextResponse.json(cached, { headers: { "X-Cache": "HIT" } })

    const campaignIds = await prisma.emailCampaign.findMany({
      where: { userId },
      select: { id: true, totalEnviados: true },
    })
    const ids = campaignIds.map(c => c.id)
    const totalSent = campaignIds.reduce((s, c) => s + c.totalEnviados, 0)

    const [activeCount, inactiveCount, bounceCount, unsubCount] = await Promise.all([
      prisma.newsletterSubscriber.count({ where: { userId, activo: true } }),
      prisma.newsletterSubscriber.count({ where: { userId, activo: false } }),
      ids.length > 0 ? prisma.emailBounce.count({ where: { campaignId: { in: ids } } }) : Promise.resolve(0),
      ids.length > 0 ? prisma.emailUnsubscribe.count({ where: { campaignId: { in: ids } } }) : Promise.resolve(0),
    ])

    const bounceRate = totalSent > 0 ? Math.round((bounceCount / totalSent) * 1000) / 10 : 0
    const unsubRate = totalSent > 0 ? Math.round((unsubCount / totalSent) * 1000) / 10 : 0

    // Generate recommendations based on real data
    const recommendations: { type: "warning" | "info" | "success"; message: string }[] = []

    if (bounceRate > 5) recommendations.push({ type: "warning", message: "Tasa de rebote alta. Considera limpiar tu lista." })
    else if (bounceRate <= 2 && totalSent > 0) recommendations.push({ type: "success", message: "Tasa de rebote saludable. Sigue así." })

    const openRates = campaignIds.filter(c => c.totalEnviados > 0)
    if (openRates.length === 0) {
      recommendations.push({ type: "info", message: "Envía tu primera campaña para obtener métricas de engagement." })
    }

    const totalActive = activeCount
    if (totalActive < 10) {
      recommendations.push({ type: "info", message: "Añade el formulario de suscripción a tu web para crecer." })
    }
    if (inactiveCount > totalActive * 0.3 && inactiveCount > 5) {
      recommendations.push({ type: "warning", message: "Muchos suscriptores inactivos. Considera una campaña de reactivación." })
    }
    if (unsubRate > 2) {
      recommendations.push({ type: "warning", message: "Tasa de bajas elevada. Prueba a segmentar mejor tu audiencia." })
    }

    const result = {
      subscribers: { active: activeCount, inactive: inactiveCount, total: activeCount + inactiveCount },
      bounceRate,
      unsubRate,
      totalSent,
      recommendations,
    }

    await setCachedData(cacheKey, result, 60)
    return NextResponse.json(result)
  } catch (error) {
    console.error("[api/email/deliverability] GET error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
