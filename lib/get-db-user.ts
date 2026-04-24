import { cache } from "react"
import { prisma, safePrismaQuery } from "@/lib/prisma"

/**
 * Request-scoped cache: one Prisma user lookup per request.
 * Used by dashboard layout to avoid opening a new connection on every navigation.
 * React cache() deduplicates calls with the same userId within the same request tree.
 * safePrismaQuery retries on Neon cold-start (P1001) before failing.
 */
export const getDbUserForSession = cache(async (userId: string) => {
  return safePrismaQuery(
    () => prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, onboardingCompleted: true },
    }),
    3,   // up to 3 retries
    800  // 800ms initial delay, doubles each retry
  )
})
