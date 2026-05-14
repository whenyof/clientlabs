export const maxDuration = 10
import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export const dynamic = "force-dynamic"

// GET /api/custom-fields?entity=lead
export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 })
  }

  const { searchParams } = new URL(req.url)
  const entity = searchParams.get("entity")

  try {
    const fields = await prisma.customField.findMany({
      where: {
        userId: session.user.id,
        ...(entity ? { entity } : {}),
      },
      select: {
        id: true,
        name: true,
        type: true,
        options: true,
        entity: true,
        createdAt: true,
      },
      orderBy: { createdAt: "asc" },
    })

    return NextResponse.json({ fields })
  } catch (e) {
    console.error("[api/custom-fields] GET error:", e)
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 })
  }
}

// POST /api/custom-fields
export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 })
  }

  try {
    const body = await req.json()
    const { name, type, entity, options } = body

    if (!name || typeof name !== "string" || name.trim().length === 0) {
      return NextResponse.json({ error: "El nombre es obligatorio" }, { status: 400 })
    }

    const VALID_TYPES = ["text", "number", "date", "select"]
    if (!type || !VALID_TYPES.includes(type)) {
      return NextResponse.json(
        { error: "Tipo no válido. Debe ser: text, number, date o select" },
        { status: 400 }
      )
    }

    if (type === "select" && (!Array.isArray(options) || options.length === 0)) {
      return NextResponse.json(
        { error: "Los campos de tipo select requieren al menos una opción" },
        { status: 400 }
      )
    }

    const field = await prisma.customField.create({
      data: {
        userId: session.user.id,
        name: name.trim(),
        type,
        entity: entity ?? "lead",
        options: type === "select" ? options : undefined,
      },
      select: {
        id: true,
        name: true,
        type: true,
        options: true,
        entity: true,
        createdAt: true,
      },
    })

    return NextResponse.json({ field }, { status: 201 })
  } catch (e) {
    console.error("[api/custom-fields] POST error:", e)
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 })
  }
}
