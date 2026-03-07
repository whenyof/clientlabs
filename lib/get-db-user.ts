import { cache } from "react"
import { prisma } from "@/lib/prisma"

/**
 * Request-scoped cache: one Prisma user lookup per request.
 * Used by dashboard layout to avoid opening a new connection on every navigation.
 * React cache() deduplicates calls with the same userId within the same request tree.
 */
export const getDbUserForSession = cache(async (userId: string) => {
  return prisma.user.findUnique({
    where: { id: userId },
    select: { id: true, onboardingCompleted: true },
  })
})
