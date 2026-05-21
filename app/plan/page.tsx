import { getServerSession } from "next-auth"
import { redirect } from "next/navigation"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import PlanSelector from "./PlanSelector"

export default async function PlanPage() {
  const session = await getServerSession(authOptions)

  if (!session?.user?.id) {
    redirect("/auth")
  }

  // Read fresh data from DB — JWT can be stale right after Stripe webhook
  const dbUser = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { onboardingCompleted: true, stripeSubscriptionId: true },
  })

  if (!dbUser) redirect("/auth?error=user_missing")

  // Already completed onboarding → dashboard
  if (dbUser.onboardingCompleted) redirect("/dashboard")

  // Went through Stripe checkout but hasn't finished onboarding yet
  if (dbUser.stripeSubscriptionId) redirect("/onboarding")

  return <PlanSelector />
}
