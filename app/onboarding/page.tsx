import { redirect } from "next/navigation"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import OnboardingWizard from "./OnboardingWizard"

export default async function OnboardingPage() {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) redirect("/auth")

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { onboardingCompleted: true },
  })

  if (!user) redirect("/auth?error=user_missing")
  if (user.onboardingCompleted) redirect("/dashboard")

  return <OnboardingWizard />
}
