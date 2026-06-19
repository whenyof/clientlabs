import { Suspense } from "react"
import { getServerSession } from "next-auth"
import { redirect } from "next/navigation"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import PlanSelector from "./PlanSelector"

type SP = Promise<{ plan?: string; period?: string }>

export default async function PlanPage({ searchParams }: { searchParams: SP }) {
  const session = await getServerSession(authOptions)
  const sp = await searchParams

  if (!session?.user?.id) {
    // Keep the chosen plan/period through login, then return here to start checkout.
    const qs = new URLSearchParams()
    if (sp.plan) qs.set("plan", sp.plan)
    if (sp.period) qs.set("period", sp.period)
    const back = qs.toString() ? `/plan?${qs.toString()}` : "/plan"
    redirect(`/auth?callbackUrl=${encodeURIComponent(back)}`)
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

  return (
    <Suspense>
      <PlanSelector />
    </Suspense>
  )
}
