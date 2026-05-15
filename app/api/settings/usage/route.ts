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

  const plan = user?.plan ?? "STARTER"
  const limits = PLAN_LIMITS[plan as keyof typeof PLAN_LIMITS] ?? PLAN_LIMITS.STARTER

  const startOfMonth = new Date()
  startOfMonth.setDate(1)
  startOfMonth.setHours(0, 0, 0, 0)

  const [leadsCount, clientsCount, providersCount, invoicesThisMonth, tasksCount, teamCount, automationsCount, templatesCount] = await safePrismaQuery(() =>
    Promise.all([
      prisma.lead.count({ where: { userId } }),
      prisma.client.count({ where: { userId } }),
      prisma.provider.count({ where: { userId } }),
      prisma.invoice.count({
        where: { userId, createdAt: { gte: startOfMonth } },
      }),
      prisma.task.count({ where: { userId } }),
      prisma.teamMember.count({ where: { userId } }),
      prisma.automation.count({ where: { userId, active: true } }),
      prisma.userTemplate.count({ where: { userId } }),
    ])
  )

  const usage = [
    {
      label: "Leads",
      current: leadsCount,
      limit: limits.maxLeadsTotal,
      unit: "",
    },
    {
      label: "Clientes activos",
      current: clientsCount,
      limit: limits.maxClients,
      unit: "",
    },
    {
      label: "Proveedores",
      current: providersCount,
      limit: limits.maxProviders,
      unit: "",
    },
    {
      label: "Facturas este mes",
      current: invoicesThisMonth,
      limit: limits.maxInvoicesPerMonth,
      unit: "",
    },
    {
      label: "Tareas",
      current: tasksCount,
      limit: limits.maxTasks,
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
      limit: limits.maxActiveAutomations,
      unit: "",
    },
    {
      label: "Plantillas de documento",
      current: templatesCount,
      limit: limits.maxTemplates,
      unit: "",
    },
  ]

  return NextResponse.json({ success: true, usage, plan })
}
