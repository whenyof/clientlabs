export const maxDuration = 10
import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { invalidateCachedData } from "@/lib/redis-cache"
import { updateLeadScore } from "@/lib/scoring/updateLeadScore"
import { sendLeadConvertedEmail } from "@/lib/email-service"

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

    // Valor estimado (€) — acepta número o string numérico; "" lo limpia a null
    if (body.estimatedValue !== undefined) {
      if (body.estimatedValue === null || body.estimatedValue === "") {
        data.estimatedValue = null
      } else {
        const parsedValue = parseFloat(String(body.estimatedValue).replace(",", "."))
        if (!Number.isFinite(parsedValue) || parsedValue < 0 || parsedValue > 999_999_999) {
          return NextResponse.json({ error: "estimatedValue no válido" }, { status: 400 })
        }
        data.estimatedValue = parsedValue
      }
    }

    if (Array.isArray(body.tags)) {
      data.tags = body.tags.filter((t: unknown) => typeof t === "string" && (t as string).trim().length > 0)
    }

    // Keep deprecated status field in sync
    if (data.leadStatus) {
      data.status = data.leadStatus
    }

    if (Object.keys(data).length === 0 && !Array.isArray(body.tags)) {
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
      source: "Fuente", leadStatus: "Estado", estimatedValue: "Valor estimado",
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
      updateLeadScore(params.id, uid).catch(() => {})
    }

    // Notify user when lead is converted to client
    if (data.leadStatus === "CONVERTED") {
      const user = await prisma.user.findUnique({
        where: { id: session.user.id },
        select: { email: true, name: true },
      })
      if (user?.email) {
        sendLeadConvertedEmail(user.email, user.name ?? "Usuario", lead.name ?? "Lead").catch(() => {})
      }
    }

    // Fire-and-forget — don't let a slow/down Redis block the response
    invalidateCachedData(`leads-kpis-${session.user.id}`).catch(() => {})
    return NextResponse.json(updated)
  } catch (error) {
    console.error("Error updating lead:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
