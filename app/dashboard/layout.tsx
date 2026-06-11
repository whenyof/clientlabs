export const maxDuration = 30

import { getServerSession } from "next-auth"
import { redirect } from "next/navigation"
import { authOptions } from "@/lib/auth"
import { getDbUserForSession } from "@/lib/get-db-user"
import DashboardShell from "@/components/layout/DashboardShell"

/**
 * Single source of truth for dashboard access (SERVER ONLY).
 * - No auth → /auth
 * - No DB user → /auth
 * - Workspace member (invited seat) → always allowed in (seat paid by owner)
 * - No Stripe subscription + onboarding incomplete → /plan (pick a plan first)
 * - Has Stripe subscription + onboarding incomplete → /onboarding
 */
export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await getServerSession(authOptions)

  if (!session?.user?.id) {
    redirect("/auth")
  }

  const dbUser = await getDbUserForSession(session.user.id)

  if (!dbUser) {
    redirect("/auth?error=user_missing")
  }

  if (!dbUser.onboardingCompleted) {
    // Team members (workspace seat paid by the owner) never go through
    // plan selection or owner onboarding — they enter the dashboard directly.
    const { prisma, safePrismaQuery } = await import("@/lib/prisma")
    const membership = await safePrismaQuery(() =>
      prisma.workspaceMember.findFirst({
        where: { userId: session.user.id, status: "ACTIVE" },
        select: { id: true },
      })
    )
    if (!membership) {
      // No Stripe subscription yet → must pick a plan before onboarding
      if (!dbUser.stripeSubscriptionId) {
        redirect("/plan")
      }
      redirect("/onboarding")
    }
  }

  return <DashboardShell>{children}</DashboardShell>
}