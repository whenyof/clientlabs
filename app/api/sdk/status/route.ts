export const maxDuration = 5
import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { prisma } from "@/lib/prisma"
import { authOptions } from "@/lib/auth"
import { logger } from "@/lib/logger"
import { SDK_INSTALLATION_STATUS } from "@/lib/events/sdkInstallationConstants"
import { getCachedData, setCachedData } from "@/lib/redis-cache"

const DISCONNECTED_THRESHOLD_MS = 5 * 60 * 1000 // 5 minutes

/**
 * 📡 API Route: GET /api/sdk/status
 * Real-time SDK installation verification.
 * - ?domain=... (authenticated): returns SdkInstallation status for dashboard.
 * - ?key=... (legacy): returns SdkConnection connected/last_seen for script check.
 */
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const domain = searchParams.get("domain")
    const key = searchParams.get("key")

    if (domain) {
      const session = await getServerSession(authOptions)
      if (!session?.user?.id) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
      }

      const cacheKey = `sdk-status-domain-${session.user.id}-${domain}`
      const cached = await getCachedData<object>(cacheKey)
      if (cached) return NextResponse.json(cached)

      const installation = await prisma.sdkInstallation.findUnique({
        where: {
          userId_domain: {
            userId: session.user.id,
            domain,
          },
        },
      })

      if (!installation) {
        const result = { status: SDK_INSTALLATION_STATUS.NOT_INSTALLED, lastSeenAt: null, lastEventAt: null }
        await setCachedData(cacheKey, result, 10)
        return NextResponse.json(result)
      }

      const now = Date.now()
      const lastSeenTs = installation.lastSeenAt?.getTime() ?? 0
      const isDisconnected = now - lastSeenTs > DISCONNECTED_THRESHOLD_MS

      const result = {
        status: isDisconnected ? SDK_INSTALLATION_STATUS.DISCONNECTED : installation.status,
        lastSeenAt: installation.lastSeenAt,
        lastEventAt: installation.lastEventAt,
      }
      await setCachedData(cacheKey, result, 10)
      return NextResponse.json(result)
    }

    if (key) {
      const cacheKey = `sdk-status-key-${key}`
      const cached = await getCachedData<object>(cacheKey)
      if (cached) return NextResponse.json(cached)

      const connection = await prisma.sdkConnection.findFirst({
        where: { apiKey: key },
        orderBy: { lastSeen: "desc" },
      })

      if (!connection) {
        const result = { connected: false, last_seen: null, domain: null }
        await setCachedData(cacheKey, result, 10)
        return NextResponse.json(result)
      }

      const now = Date.now()
      const lastSeenTs = connection.lastSeen.getTime()
      const isFresh = now - lastSeenTs <= 2 * 60 * 1000

      const result = { connected: isFresh, last_seen: connection.lastSeen, domain: connection.domain }
      await setCachedData(cacheKey, result, 10)
      return NextResponse.json(result)
    }

    return NextResponse.json({ error: "Missing domain or key" }, { status: 400 })
  } catch (err) {
    logger.error("sdk_status_fail", "Failed to fetch SDK status", undefined, {
      error: err instanceof Error ? err.message : "unknown",
    })
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
