export const maxDuration = 10
import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export const dynamic = "force-dynamic"

// PATCH /api/custom-fields/[fieldId]
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ fieldId: string }> }
) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 })
  }

  const { fieldId } = await params

  try {
    const existing = await prisma.customField.findFirst({
      where: { id: fieldId, userId: session.user.id },
      select: { id: true, type: true },
    })

    if (!existing) {
      return NextResponse.json({ error: "Campo no encontrado" }, { status: 404 })
    }

    const body = await req.json()
    const { name, options } = body

    if (name !== undefined && (typeof name !== "string" || name.trim().length === 0)) {
      return NextResponse.json({ error: "El nombre no puede estar vacío" }, { status: 400 })
    }

    if (
      options !== undefined &&
      existing.type === "select" &&
      (!Array.isArray(options) || options.length === 0)
    ) {
      return NextResponse.json(
        { error: "Los campos de tipo select requieren al menos una opción" },
        { status: 400 }
      )
    }

    const updated = await prisma.customField.update({
      where: { id: fieldId },
      data: {
        ...(name !== undefined && { name: name.trim() }),
        ...(options !== undefined && { options }),
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

    return NextResponse.json({ field: updated })
  } catch (e) {
    console.error("[api/custom-fields/[fieldId]] PATCH error:", e)
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 })
  }
}

// DELETE /api/custom-fields/[fieldId]
export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ fieldId: string }> }
) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 })
  }

  const { fieldId } = await params

  try {
    const existing = await prisma.customField.findFirst({
      where: { id: fieldId, userId: session.user.id },
      select: { id: true },
    })

    if (!existing) {
      return NextResponse.json({ error: "Campo no encontrado" }, { status: 404 })
    }

    await prisma.customField.delete({
      where: { id: fieldId },
    })

    return NextResponse.json({ success: true })
  } catch (e) {
    console.error("[api/custom-fields/[fieldId]] DELETE error:", e)
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 })
  }
}
