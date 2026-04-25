export const maxDuration = 10
import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma, safePrismaQuery } from "@/lib/prisma"
import { PLAN_LIMITS } from "@/lib/plan-gates"

export async function GET() {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 })
  }

  const userId = session.user.id

  const user = await safePrismaQuery(() =>
    prisma.user.findUnique({
      where: { id: userId },
      select: { plan: true },
    })
  )

  const plan = user?.plan ?? "FREE"
  const limits = PLAN_LIMITS[plan as keyof typeof PLAN_LIMITS] ?? PLAN_LIMITS.FREE

  const [leadsCount, clientsCount, teamCount, automationsCount] = await safePrismaQuery(() =>
    Promise.all([
      prisma.lead.count({ where: { userId } }),
      prisma.client.count({ where: { userId } }),
      prisma.teamMember.count({ where: { userId } }),
      prisma.automation.count({ where: { userId, active: true } }),
    ])
  )

  const usage = [
    {
      label: "Leads",
      current: leadsCount,
      limit: limits.maxLeadsTotal === Infinity ? -1 : limits.maxLeadsTotal,
      unit: "",
    },
    {
      label: "Clientes",
      current: clientsCount,
      limit: limits.maxClients === Infinity ? -1 : limits.maxClients,
      unit: "",
    },
    {
      label: "Miembros del equipo",
      current: teamCount,
      limit: limits.maxUsers,
      unit: "",
    },
    {
      label: "Automatizaciones activas",
      current: automationsCount,
      limit: limits.maxActiveAutomations === Infinity ? -1 : limits.maxActiveAutomations,
      unit: "",
    },
    {
      label: "Almacenamiento",
      current: 0,
      limit: limits.storageGB,
      unit: "GB",
    },
  ]

  return NextResponse.json({ success: true, usage, plan })
}
