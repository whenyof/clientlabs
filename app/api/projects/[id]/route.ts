export const maxDuration = 10
export const dynamic = "force-dynamic"

import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

type Params = { params: Promise<{ id: string }> }

async function getUserId() {
  const session = await getServerSession(authOptions)
  return session?.user?.id ?? null
}

/** GET /api/projects/[id] */
export async function GET(_req: NextRequest, { params }: Params) {
  try {
    const { id } = await params
    const userId = await getUserId()
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    const project = await prisma.project.findFirst({
      where: {
        id,
        OR: [{ userId }, { members: { some: { userId } } }],
      },
      include: {
        members: {
          include: {
            user: { select: { id: true, name: true, email: true, image: true } },
          },
        },
        tasks: {
          include: {
            Client: { select: { id: true, name: true } },
            Lead: { select: { id: true, name: true } },
            assignees: {
              include: {
                user: { select: { id: true, name: true, email: true, image: true } },
              },
            },
          },
          orderBy: [{ dueDate: { sort: "asc", nulls: "last" } }, { createdAt: "desc" }],
        },
      },
    })

    if (!project) return NextResponse.json({ error: "Not found" }, { status: 404 })
    return NextResponse.json(project)
  } catch (error) {
    console.error("[GET /api/projects/[id]]:", error)
    return NextResponse.json({ error: "Failed to load project" }, { status: 500 })
  }
}

/** PATCH /api/projects/[id] */
export async function PATCH(request: NextRequest, { params }: Params) {
  try {
    const { id } = await params
    const userId = await getUserId()
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    const project = await prisma.project.findFirst({
      where: {
        id,
        OR: [{ userId }, { members: { some: { userId, role: { in: ["owner", "admin"] } } } }],
      },
    })
    if (!project) return NextResponse.json({ error: "Not found or insufficient permissions" }, { status: 404 })

    const body = await request.json()
    const { name, description, color, status, startDate, endDate, clientId } = body

    const updated = await prisma.project.update({
      where: { id },
      data: {
        ...(name !== undefined && { name: name.trim() }),
        ...(description !== undefined && { description: description?.trim() ?? null }),
        ...(color !== undefined && { color }),
        ...(status !== undefined && { status }),
        ...(startDate !== undefined && { startDate: startDate ? new Date(startDate) : null }),
        ...(endDate !== undefined && { endDate: endDate ? new Date(endDate) : null }),
        ...(clientId !== undefined && { clientId: clientId ?? null }),
      },
      include: {
        members: {
          include: {
            user: { select: { id: true, name: true, email: true, image: true } },
          },
        },
      },
    })

    return NextResponse.json(updated)
  } catch (error) {
    console.error("[PATCH /api/projects/[id]]:", error)
    return NextResponse.json({ error: "Failed to update project" }, { status: 500 })
  }
}

/** DELETE /api/projects/[id] — only project owner */
export async function DELETE(_req: NextRequest, { params }: Params) {
  try {
    const { id } = await params
    const userId = await getUserId()
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    const project = await prisma.project.findFirst({
      where: { id, userId },
    })
    if (!project) return NextResponse.json({ error: "Not found or insufficient permissions" }, { status: 404 })

    await prisma.project.delete({ where: { id } })
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("[DELETE /api/projects/[id]]:", error)
    return NextResponse.json({ error: "Failed to delete project" }, { status: 500 })
  }
}
