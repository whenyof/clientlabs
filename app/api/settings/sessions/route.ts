export const maxDuration = 10

import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import {
  listActiveSessions,
  parseUserAgent,
  deriveSessionToken,
} from "@/lib/auth/session-tracking"
import { getCachedData, setCachedData } from "@/lib/redis-cache"

export async function GET() {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) {
    return NextResponse.json({ error: "No autenticado" }, { status: 401 })
  }

  const cacheKey = `sessions:${session.user.id}`
  const cached = await getCachedData<object[]>(cacheKey)
  if (cached) {
    return NextResponse.json({ sessions: cached })
  }

  const sessions = await listActiveSessions(session.user.id)
  const jti = (session as { jti?: string }).jti

  const enriched = sessions.map((s) => ({
    ...s,
    deviceName: parseUserAgent(s.userAgent),
    isCurrent: jti ? s.sessionToken === deriveSessionToken(jti) : false,
  }))

  await setCachedData(cacheKey, enriched, 30)
  return NextResponse.json({ sessions: enriched })
}
