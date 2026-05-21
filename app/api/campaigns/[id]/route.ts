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

export async function GET(_req: NextRequest, { params }: Params) {
  try {
    const { id } = await params
    const userId = await getUserId()
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    const campaign = await prisma.emailCampaign.findFirst({
      where: { id, userId },
    })
    if (!campaign) return NextResponse.json({ error: "Not found" }, { status: 404 })

    return NextResponse.json(campaign)
  } catch (error) {
    console.error("[GET /api/campaigns/[id]]:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function PATCH(request: NextRequest, { params }: Params) {
  try {
    const { id } = await params
    const userId = await getUserId()
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    const existing = await prisma.emailCampaign.findFirst({ where: { id, userId } })
    if (!existing) return NextResponse.json({ error: "Not found" }, { status: 404 })

    const body = await request.json()
    const { nombre, asunto, contenido, recipientFilter, estado, scheduledAt } = body

    const updated = await prisma.emailCampaign.update({
      where: { id },
      data: {
        ...(nombre !== undefined && { nombre: nombre.trim() }),
        ...(asunto !== undefined && { asunto: asunto.trim() }),
        ...(contenido !== undefined && { contenido }),
        ...(recipientFilter !== undefined && { recipientFilter }),
        ...(estado !== undefined && { estado }),
        ...(scheduledAt !== undefined && { scheduledAt: scheduledAt ? new Date(scheduledAt) : null }),
      },
    })

    return NextResponse.json(updated)
  } catch (error) {
    console.error("[PATCH /api/campaigns/[id]]:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function DELETE(_req: NextRequest, { params }: Params) {
  try {
    const { id } = await params
    const userId = await getUserId()
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    const existing = await prisma.emailCampaign.findFirst({ where: { id, userId } })
    if (!existing) return NextResponse.json({ error: "Not found" }, { status: 404 })

    await prisma.emailCampaign.delete({ where: { id } })
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("[DELETE /api/campaigns/[id]]:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
