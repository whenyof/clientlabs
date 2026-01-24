import { getServerSession } from "next-auth"
import { redirect } from "next/navigation"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  // ✅ SERVER-SIDE AUTH + ONBOARDING GUARD
  // Middleware only checks token presence; this enforces DB-backed user + onboarding
  const session = await getServerSession(authOptions)

  if (!session?.user?.id) {
    redirect("/auth")
  }

  const dbUser = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { id: true, onboardingCompleted: true },
  })

  if (!dbUser) {
    // No DB user should ever reach the dashboard
    redirect("/auth?error=user_missing")
  }

  if (!dbUser.onboardingCompleted) {
    // Force onboarding before any dashboard access
    redirect("/select-sector")
  }

  return children
}