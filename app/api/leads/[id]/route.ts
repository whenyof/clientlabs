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

    await invalidateCachedData(`leads-kpis-${session.user.id}`)
    return NextResponse.json(updated)
  } catch (error) {
    console.error("Error updating lead:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
