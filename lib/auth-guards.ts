import { getServerSession } from "next-auth"
import { redirect } from "next/navigation"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

/**
 * Server-side guard that ensures a user exists in DB and has completed onboarding
 * Throws/redirects if user is missing or onboarding is incomplete
 */
export async function requireAuthenticatedUser() {
  const session = await getServerSession(authOptions)

  if (!session?.user?.id) {
    redirect("/auth")
  }

  const dbUser = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: {
      id: true,
      email: true,
      role: true,
      plan: true,
      onboardingCompleted: true,
      selectedSector: true
    }
  })

  if (!dbUser) {
    console.error(`User ${session.user.id} authenticated but not found in DB`)
    redirect("/auth?error=user_missing")
  }

  return {
    session,
    dbUser
  }
}

/**
 * Server-side guard for dashboard access - requires DB user + completed onboarding
 */
export async function requireOnboardedUser() {
  const { session, dbUser } = await requireAuthenticatedUser()

  if (!dbUser.onboardingCompleted) {
    redirect("/onboarding/sector")
  }

  return {
    session,
    dbUser
  }
}

/**
 * Server-side guard for admin access - requires DB user + ADMIN role
 */
export async function requireAdminUser() {
  const { session, dbUser } = await requireAuthenticatedUser()

  if (dbUser.role !== "ADMIN") {
    redirect("/dashboard/other?error=admin_required")
  }

  return {
    session,
    dbUser
  }
}

/**
 * Check if user needs onboarding (helper function)
 */
export async function checkOnboardingStatus(userId: string) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      onboardingCompleted: true,
      selectedSector: true
    }
  })

  return user
}

/**
 * Complete onboarding for a user
 */
export async function completeOnboarding(userId: string, selectedSector: string) {
  await prisma.user.update({
    where: { id: userId },
    data: {
      onboardingCompleted: true,
      selectedSector: selectedSector
    }
  })
}