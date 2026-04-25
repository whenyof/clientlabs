import { getServerSession } from "next-auth"
import { redirect } from "next/navigation"
import { authOptions } from "@/lib/auth"
import PlanSelector from "./PlanSelector"

export default async function PlanPage() {
  const session = await getServerSession(authOptions)

  if (!session) {
    redirect("/auth")
  }

  // Returning users who already completed onboarding go straight to dashboard
  if (session.user.onboardingCompleted) {
    redirect("/dashboard")
  }

  return <PlanSelector />
}
