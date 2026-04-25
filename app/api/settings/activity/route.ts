export const maxDuration = 10
import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma, safePrismaQuery } from "@/lib/prisma"
import { getUserWorkspace } from "@/lib/get-workspace"

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 })
  }

  const { searchParams } = new URL(req.url)
  const page = Math.max(1, parseInt(searchParams.get("page") ?? "1"))
  const filterUserId = searchParams.get("userId") ?? undefined
  const filterEntity = searchParams.get("entity") ?? undefined
  const pageSize = 20

  const result = await getUserWorkspace(session.user.id)
  if (!result) {
    return NextResponse.json({ logs: [], total: 0, hasMore: false })
  }

  const { workspace } = result

  const where: Record<string, unknown> = { workspaceId: workspace.id }
  if (filterUserId) where.userId = filterUserId
  if (filterEntity) where.entity = filterEntity

  const [logs, total] = await safePrismaQuery(() =>
    Promise.all([
      prisma.activityLog.findMany({
        where,
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * pageSize,
        take: pageSize,
        include: {
          user: {
            select: { id: true, name: true, email: true, image: true },
          },
        },
      }),
      prisma.activityLog.count({ where }),
    ])
  )

  // Get member roles for color coding
  const memberRoles = workspace.members.reduce<Record<string, string>>((acc, m) => {
    acc[m.userId] = m.role
    return acc
  }, {})

  const enrichedLogs = logs.map((log) => ({
    ...log,
    userRole: memberRoles[log.userId] ?? "USER",
  }))

  return NextResponse.json({
    logs: enrichedLogs,
    total,
    hasMore: page * pageSize < total,
    page,
  })
}
