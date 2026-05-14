export const maxDuration = 10
export const dynamic = "force-dynamic"
import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function PATCH(
  request: NextRequest,
  props: { params: Promise<{ id: string; contactId: string }> }
) {
  const params = await props.params
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 })
    }

    const lead = await prisma.lead.findFirst({
      where: { id: params.id, userId: session.user.id },
      select: { id: true },
    })
    if (!lead) {
      return NextResponse.json({ error: "Lead no encontrado" }, { status: 404 })
    }

    const existing = await prisma.leadContact.findFirst({
      where: { id: params.contactId, leadId: params.id },
      select: { id: true },
    })
    if (!existing) {
      return NextResponse.json({ error: "Contacto no encontrado" }, { status: 404 })
    }

    const body = await request.json()
    const { name, email, phone, role, isPrimary } = body

    const data: Record<string, unknown> = {}
    if (name !== undefined) data.name = name
    if (email !== undefined) data.email = email
    if (phone !== undefined) data.phone = phone
    if (role !== undefined) data.role = role
    if (isPrimary !== undefined) data.isPrimary = isPrimary

    if (Object.keys(data).length === 0) {
      return NextResponse.json({ error: "No hay campos para actualizar" }, { status: 400 })
    }

    if (isPrimary === true) {
      await prisma.leadContact.updateMany({
        where: { leadId: params.id, isPrimary: true },
        data: { isPrimary: false },
      })
    }

    const contact = await prisma.leadContact.update({
      where: { id: params.contactId },
      data,
      select: {
        id: true,
        leadId: true,
        name: true,
        email: true,
        phone: true,
        role: true,
        isPrimary: true,
        createdAt: true,
      },
    })

    return NextResponse.json(contact)
  } catch (error) {
    console.error("Error al actualizar contacto:", error)
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 })
  }
}

export async function DELETE(
  _req: NextRequest,
  props: { params: Promise<{ id: string; contactId: string }> }
) {
  const params = await props.params
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 })
    }

    const lead = await prisma.lead.findFirst({
      where: { id: params.id, userId: session.user.id },
      select: { id: true },
    })
    if (!lead) {
      return NextResponse.json({ error: "Lead no encontrado" }, { status: 404 })
    }

    const result = await prisma.leadContact.deleteMany({
      where: { id: params.contactId, leadId: params.id },
    })

    if (result.count === 0) {
      return NextResponse.json({ error: "Contacto no encontrado" }, { status: 404 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error al eliminar contacto:", error)
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 })
  }
}
