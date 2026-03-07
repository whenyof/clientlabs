import { getServerSession } from "next-auth"
import { redirect } from "next/navigation"
import { authOptions } from "@/lib/auth"
import { getDbUserForSession } from "@/lib/get-db-user"
import DashboardShell from "@/components/layout/DashboardShell"

/**
 * Single source of truth for dashboard access (SERVER ONLY).
 * - No auth → /auth
 * - No DB user → /auth
 * - Onboarding incomplete → /onboarding/sector (DB-backed; no JWT here to avoid loops)
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
    redirect("/onboarding/sector")
  }

  return <DashboardShell>{children}</DashboardShell>
}