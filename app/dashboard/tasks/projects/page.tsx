import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { redirect } from "next/navigation"
import { DashboardContainer } from "@/components/layout/DashboardContainer"
import { ProjectsClient } from "./ProjectsClient"
import { prisma } from "@/lib/prisma"
import { effectivePlan } from "@/lib/api-gate"
import { hasFeature } from "@/lib/plan-gates"
import type { PlanType } from "@prisma/client"
import Link from "next/link"
import { Lock } from "lucide-react"

export const dynamic = "force-dynamic"

export default async function ProjectsPage() {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) redirect("/auth")

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { plan: true, planExpiresAt: true },
  })

  const { plan } = effectivePlan((user?.plan ?? "STARTER") as PlanType, user?.planExpiresAt ?? null)

  if (!hasFeature(plan, "projects")) {
    return (
      <DashboardContainer>
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-slate-100">
            <Lock className="h-6 w-6 text-slate-400" />
          </div>
          <h2 className="text-lg font-semibold text-[#0B1F2A]">Proyectos no disponible</h2>
          <p className="mt-2 max-w-sm text-sm text-slate-500">
            Los proyectos están disponibles desde el plan Pro. Actualiza tu plan para gestionar proyectos y asignar tareas a tu equipo.
          </p>
          <Link
            href="/plan"
            className="mt-6 inline-block rounded-lg bg-[#0F766E] px-5 py-2 text-sm font-medium text-white hover:bg-[#0E665F] transition-colors"
          >
            Ver planes
          </Link>
        </div>
      </DashboardContainer>
    )
  }

  return (
    <DashboardContainer>
      <ProjectsClient />
    </DashboardContainer>
  )
}
