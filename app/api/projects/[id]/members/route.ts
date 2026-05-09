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

/** POST /api/projects/[id]/members — add a member */
export async function POST(request: NextRequest, { params }: Params) {
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

    const { memberId, role } = await request.json()
    if (!memberId) return NextResponse.json({ error: "memberId required" }, { status: 400 })

    const member = await prisma.projectMember.upsert({
      where: { projectId_userId: { projectId: id, userId: memberId } },
      create: { projectId: id, userId: memberId, role: role ?? "member" },
      update: { role: role ?? "member" },
      include: { user: { select: { id: true, name: true, email: true, image: true } } },
    })

    return NextResponse.json(member, { status: 201 })
  } catch (error) {
    console.error("[POST /api/projects/[id]/members]:", error)
    return NextResponse.json({ error: "Failed to add member" }, { status: 500 })
  }
}

/** DELETE /api/projects/[id]/members?memberId=xxx — remove a member */
export async function DELETE(request: NextRequest, { params }: Params) {
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

    const memberId = new URL(request.url).searchParams.get("memberId")
    if (!memberId) return NextResponse.json({ error: "memberId required" }, { status: 400 })

    await prisma.projectMember.deleteMany({
      where: { projectId: id, userId: memberId },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("[DELETE /api/projects/[id]/members]:", error)
    return NextResponse.json({ error: "Failed to remove member" }, { status: 500 })
  }
}
