export const maxDuration = 10
import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export const dynamic = "force-dynamic"

const DEFAULT_STAGES = [
  { name: "Nuevo", order: 0, color: "#0F766E" },
  { name: "Contactado", order: 1, color: "#3B82F6" },
  { name: "Calificado", order: 2, color: "#D9A441" },
  { name: "Negociando", order: 3, color: "#8B5CF6" },
]

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const userId = session.user.id

    let stages = await prisma.pipelineStage.findMany({
      where: { userId },
      orderBy: { order: "asc" },
      select: { id: true, name: true, order: true, color: true },
    })

    if (stages.length === 0) {
      await prisma.pipelineStage.createMany({
        data: DEFAULT_STAGES.map((s) => ({ ...s, userId })),
      })
      stages = await prisma.pipelineStage.findMany({
        where: { userId },
        orderBy: { order: "asc" },
        select: { id: true, name: true, order: true, color: true },
      })
    }

    const leads = await prisma.lead.findMany({
      where: { userId, converted: false },
      select: {
        id: true,
        name: true,
        email: true,
        leadStatus: true,
        score: true,
        temperature: true,
        stageId: true,
        createdAt: true,
        tags: true,
      },
      orderBy: { createdAt: "desc" },
      take: 200,
    })

    return NextResponse.json({ stages, leads })
  } catch (error) {
    console.error("[api/leads/kanban] GET error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
