export const maxDuration = 10
export const dynamic = "force-dynamic"

import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { getCachedData, setCachedData } from "@/lib/redis-cache"

const MONTH_NAMES = ["Ene", "Feb", "Mar", "Abr", "May", "Jun", "Jul", "Ago", "Sep", "Oct", "Nov", "Dic"]

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    const userId = session.user.id
    const cacheKey = `email-analytics-v2-${userId}`
    const cached = await getCachedData(cacheKey)
    if (cached) return NextResponse.json(cached, { headers: { "X-Cache": "HIT" } })

    // ── Campaign IDs for this user ──────────────────────────────────────────
    const campaigns = await prisma.emailCampaign.findMany({
      where: { userId },
      select: {
        id: true, nombre: true, sentAt: true,
        totalEnviados: true, totalAbiertos: true, totalClicks: true,
      },
      orderBy: { sentAt: "desc" },
    })

    const campaignIds = campaigns.map(c => c.id)

    // ── Parallel queries ────────────────────────────────────────────────────
    const [opens, clicks, bounces, unsubscribes, subscribers] = await Promise.all([
      campaignIds.length > 0
        ? prisma.emailOpen.findMany({
            where: { campaignId: { in: campaignIds } },
            select: { campaignId: true, openedAt: true },
          })
        : Promise.resolve([]),
      campaignIds.length > 0
        ? prisma.emailClick.findMany({
            where: { campaignId: { in: campaignIds } },
            select: { campaignId: true },
          })
        : Promise.resolve([]),
      campaignIds.length > 0
        ? prisma.emailBounce.count({ where: { campaignId: { in: campaignIds } } })
        : Promise.resolve(0),
      prisma.emailUnsubscribe.count({ where: { campaignId: { in: campaignIds } } }),
      prisma.newsletterSubscriber.findMany({
        where: { userId },
        select: { creadoEn: true, activo: true, bajaEn: true },
        orderBy: { creadoEn: "asc" },
      }),
    ])

    // ── Global summary ──────────────────────────────────────────────────────
    const totalSent = campaigns.reduce((s, c) => s + c.totalEnviados, 0)
    const totalOpens = opens.length
    const totalClicks = clicks.length
    const totalUnsubscribes = unsubscribes
    const totalBounces = bounces

    const sentCampaigns = campaigns.filter(c => c.totalEnviados > 0)
    const avgOpenRate =
      sentCampaigns.length > 0
        ? Math.round((sentCampaigns.reduce((s, c) => s + (c.totalAbiertos / c.totalEnviados) * 100, 0) / sentCampaigns.length) * 10) / 10
        : 0
    const avgClickRate =
      sentCampaigns.length > 0
        ? Math.round((sentCampaigns.reduce((s, c) => s + (c.totalClicks / c.totalEnviados) * 100, 0) / sentCampaigns.length) * 10) / 10
        : 0
    const avgUnsubRate = totalSent > 0 ? Math.round((totalUnsubscribes / totalSent) * 1000) / 10 : 0

    const summary = {
      totalCampaigns: campaigns.length,
      totalSent,
      totalOpens,
      totalClicks,
      totalUnsubscribes,
      totalBounces,
      avgOpenRate,
      avgClickRate,
      avgUnsubRate,
    }

    // ── Subscriber growth (last 12 months) ──────────────────────────────────
    const now = new Date()
    const subscriberGrowth: { month: string; subscribers: number; unsubscribes: number }[] = []
    for (let i = 11; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1)
      const nextMonth = new Date(now.getFullYear(), now.getMonth() - i + 1, 1)
      const monthSubs = subscribers.filter(s => s.creadoEn >= d && s.creadoEn < nextMonth).length
      const monthUnsubs = subscribers.filter(
        s => s.bajaEn && s.bajaEn >= d && s.bajaEn < nextMonth,
      ).length
      subscriberGrowth.push({ month: MONTH_NAMES[d.getMonth()], subscribers: monthSubs, unsubscribes: monthUnsubs })
    }

    // ── Campaign performance (last 10) ──────────────────────────────────────
    const opensByCampaign = new Map<string, number>()
    const clicksByCampaign = new Map<string, number>()
    opens.forEach(o => opensByCampaign.set(o.campaignId, (opensByCampaign.get(o.campaignId) ?? 0) + 1))
    clicks.forEach(c => clicksByCampaign.set(c.campaignId, (clicksByCampaign.get(c.campaignId) ?? 0) + 1))

    const campaignPerformance = campaigns.slice(0, 10).map(c => {
      const sent = c.totalEnviados
      const opensCount = opensByCampaign.get(c.id) ?? c.totalAbiertos
      const clicksCount = clicksByCampaign.get(c.id) ?? c.totalClicks
      const openRate = sent > 0 ? Math.round((opensCount / sent) * 1000) / 10 : 0
      const clickRate = sent > 0 ? Math.round((clicksCount / sent) * 1000) / 10 : 0
      return {
        id: c.id,
        name: c.nombre,
        sentAt: c.sentAt,
        sent,
        opens: opensCount,
        clicks: clicksCount,
        unsubscribes: 0,
        openRate,
        clickRate,
      }
    })

    // ── Best send hours ─────────────────────────────────────────────────────
    const hourCounts = new Array<number>(24).fill(0)
    opens.forEach(o => {
      const hour = new Date(o.openedAt).getHours()
      hourCounts[hour]++
    })
    const bestHours = hourCounts.map((count, hour) => ({ hour, opens: count }))

    const result = { summary, subscriberGrowth, campaignPerformance, bestHours }
    await setCachedData(cacheKey, result, 60)
    return NextResponse.json(result)
  } catch (error) {
    console.error("[api/email/analytics] GET error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
