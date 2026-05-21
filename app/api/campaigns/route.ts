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

export async function GET() {
  try {
    const userId = await getUserId()
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    const campaigns = await prisma.emailCampaign.findMany({
      where: { userId },
      select: {
        id: true, nombre: true, asunto: true, recipientFilter: true,
        estado: true, scheduledAt: true, sentAt: true,
        totalEnviados: true, totalAbiertos: true, totalClicks: true, totalErrores: true,
        createdAt: true, updatedAt: true,
      },
      orderBy: { createdAt: "desc" },
      take: 100,
    })

    return NextResponse.json(campaigns)
  } catch (error) {
    console.error("[GET /api/campaigns]:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const userId = await getUserId()
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    const body = await request.json()
    const { nombre, asunto, contenido, recipientFilter, estado, scheduledAt } = body

    if (!nombre?.trim() || !asunto?.trim()) {
      return NextResponse.json({ error: "nombre y asunto son requeridos" }, { status: 400 })
    }

    const campaign = await prisma.emailCampaign.create({
      data: {
        userId,
        nombre: nombre.trim(),
        asunto: asunto.trim(),
        contenido: contenido ?? "",
        recipientFilter: recipientFilter ?? { type: "all" },
        estado: estado ?? "borrador",
        scheduledAt: scheduledAt ? new Date(scheduledAt) : null,
      },
      select: {
        id: true, nombre: true, asunto: true, recipientFilter: true,
        estado: true, scheduledAt: true, sentAt: true,
        totalEnviados: true, totalAbiertos: true, totalClicks: true, totalErrores: true,
        createdAt: true,
      },
    })

    return NextResponse.json(campaign, { status: 201 })
  } catch (error) {
    console.error("[POST /api/campaigns]:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
