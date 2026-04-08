export const maxDuration = 10
import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { invalidateCachedData } from "@/lib/redis-cache"

export async function PATCH(
  request: NextRequest,
  props: { params: Promise<{ id: string }> }
) {
  const params = await props.params
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const lead = await prisma.lead.findFirst({
      where: { id: params.id, userId: session.user.id },
    })
    if (!lead) {
      return NextResponse.json({ error: "Lead not found" }, { status: 404 })
    }

    const body = await request.json()

    const allowedFields = ["name", "email", "phone", "source", "leadStatus", "converted"] as const
    const data: Record<string, unknown> = {}

    for (const field of allowedFields) {
      if (body[field] !== undefined) {
        data[field] = body[field]
      }
    }

    // Keep deprecated status field in sync
    if (data.leadStatus) {
      data.status = data.leadStatus
    }

    if (Object.keys(data).length === 0) {
      return NextResponse.json({ error: "No fields to update" }, { status: 400 })
    }

    data.lastActionAt = new Date()

    const updated = await prisma.lead.update({
      where: { id: params.id },
      data,
    })

    // Register activity for the update (fire-and-forget)
    const fieldLabels: Record<string, string> = {
      name: "Nombre", email: "Email", phone: "Teléfono",
      source: "Fuente", leadStatus: "Estado",
    }
    const changed = Object.keys(data)
      .filter(f => f !== "lastActionAt" && f !== "status")
      .map(f => fieldLabels[f] ?? f)
    if (changed.length > 0) {
      prisma.activity.create({
        data: {
          userId: session.user.id,
          leadId: params.id,
          type: "LEAD_UPDATE",
          title: `Datos actualizados: ${changed.join(", ")}`,
          description: null,
        },
      }).catch(() => {})
    }

    // Re-score if status changed
    if (data.leadStatus) {
      const uid = session.user!.id
      import('@/lib/scoring/updateLeadScore')
        .then(({ updateLeadScore }) => updateLeadScore(params.id, uid))
        .catch(() => {})
    }

    // Fire-and-forget — don't let a slow/down Redis block the response
    invalidateCachedData(`leads-kpis-${session.user.id}`).catch(() => {})
    return NextResponse.json(updated)
  } catch (error) {
    console.error("Error updating lead:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
