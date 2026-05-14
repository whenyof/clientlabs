export const maxDuration = 10
import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export const dynamic = "force-dynamic"

// GET /api/leads/[id]/custom-field-values
export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 })
  }

  const { id: leadId } = await params

  try {
    const lead = await prisma.lead.findFirst({
      where: { id: leadId, userId: session.user.id },
      select: { id: true },
    })

    if (!lead) {
      return NextResponse.json({ error: "Lead no encontrado" }, { status: 404 })
    }

    const values = await prisma.customFieldValue.findMany({
      where: { leadId },
      select: {
        id: true,
        value: true,
        customFieldId: true,
        entityId: true,
        customField: {
          select: {
            name: true,
            type: true,
            options: true,
            entity: true,
          },
        },
      },
    })

    return NextResponse.json({ values })
  } catch (e) {
    console.error("[api/leads/[id]/custom-field-values] GET error:", e)
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 })
  }
}

// POST /api/leads/[id]/custom-field-values
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 })
  }

  const { id: leadId } = await params

  try {
    const lead = await prisma.lead.findFirst({
      where: { id: leadId, userId: session.user.id },
      select: { id: true },
    })

    if (!lead) {
      return NextResponse.json({ error: "Lead no encontrado" }, { status: 404 })
    }

    const body = await req.json()
    const { customFieldId, value } = body

    if (!customFieldId || typeof customFieldId !== "string") {
      return NextResponse.json({ error: "customFieldId es obligatorio" }, { status: 400 })
    }

    if (value === undefined || value === null) {
      return NextResponse.json({ error: "El valor es obligatorio" }, { status: 400 })
    }

    const field = await prisma.customField.findFirst({
      where: { id: customFieldId, userId: session.user.id },
      select: { id: true },
    })

    if (!field) {
      return NextResponse.json({ error: "Campo personalizado no encontrado" }, { status: 404 })
    }

    const upserted = await prisma.customFieldValue.upsert({
      where: {
        customFieldId_entityId: {
          customFieldId,
          entityId: leadId,
        },
      },
      create: {
        customFieldId,
        entityId: leadId,
        leadId,
        value,
      },
      update: { value },
      select: {
        id: true,
        value: true,
        customFieldId: true,
        entityId: true,
        customField: {
          select: {
            name: true,
            type: true,
            options: true,
            entity: true,
          },
        },
      },
    })

    return NextResponse.json({ value: upserted }, { status: 200 })
  } catch (e) {
    console.error("[api/leads/[id]/custom-field-values] POST error:", e)
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 })
  }
}
