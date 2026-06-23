export const maxDuration = 10
export const dynamic = "force-dynamic"

import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

async function getUserId() {
  const session = await getServerSession(authOptions)
  return session?.user?.id ?? null
}

/** GET /api/projects — list projects where user is owner or member */
export async function GET() {
  try {
    const userId = await getUserId()
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    const projects = await prisma.project.findMany({
      where: {
        OR: [
          { userId },
          { members: { some: { userId } } },
        ],
      },
      include: {
        members: {
          include: {
            user: { select: { id: true, name: true, email: true, image: true } },
          },
        },
        _count: { select: { tasks: true } },
      },
      orderBy: { createdAt: "desc" },
    })

    // Conteo de tareas DONE por proyecto en una sola query (evita N+1)
    const completedGroups = await prisma.task.groupBy({
      by: ["projectId"],
      where: { projectId: { in: projects.map((p) => p.id) }, status: "DONE" },
      _count: { _all: true },
    })
    const completedMap = new Map(
      completedGroups.map((g) => [g.projectId, g._count._all]),
    )

    const result = projects.map((p) => {
      const completedCount = completedMap.get(p.id) ?? 0
      return {
        ...p,
        totalTasks: p._count.tasks,
        completedTasks: completedCount,
        progress: p._count.tasks > 0 ? Math.round((completedCount / p._count.tasks) * 100) : 0,
      }
    })

    return NextResponse.json(result)
  } catch (error) {
    console.error("[GET /api/projects]:", error)
    return NextResponse.json({ error: "Failed to load projects" }, { status: 500 })
  }
}

/** POST /api/projects — create a project */
export async function POST(request: NextRequest) {
  try {
    const userId = await getUserId()
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    const body = await request.json()
    const { name, description, color, status, startDate, endDate, clientId, memberIds } = body

    if (!name || typeof name !== "string" || !name.trim()) {
      return NextResponse.json({ error: "name is required" }, { status: 400 })
    }

    const project = await prisma.project.create({
      data: {
        name: name.trim(),
        description: description?.trim() ?? null,
        color: color ?? "#0F766E",
        status: status ?? "ACTIVE",
        startDate: startDate ? new Date(startDate) : null,
        endDate: endDate ? new Date(endDate) : null,
        userId,
        clientId: clientId ?? null,
        members: {
          create: (Array.isArray(memberIds) ? memberIds : [])
            .filter((id: string) => id !== userId)
            .map((id: string) => ({ userId: id, role: "member" })),
        },
      },
      include: {
        members: {
          include: {
            user: { select: { id: true, name: true, email: true, image: true } },
          },
        },
      },
    })

    return NextResponse.json(project, { status: 201 })
  } catch (error) {
    console.error("[POST /api/projects]:", error)
    return NextResponse.json({ error: "Failed to create project" }, { status: 500 })
  }
}
