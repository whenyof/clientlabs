export const maxDuration = 10
export const dynamic = "force-dynamic"
import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function PATCH(
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

    const existing = await prisma.leadContact.findFirst({
      where: { id: params.contactId, leadId: params.id },
      select: { id: true },
    })
    if (!existing) {
      return NextResponse.json({ error: "Contacto no encontrado" }, { status: 404 })
    }

    await prisma.leadContact.updateMany({
      where: { leadId: params.id, isPrimary: true },
      data: { isPrimary: false },
    })

    const contact = await prisma.leadContact.update({
      where: { id: params.contactId },
      data: { isPrimary: true },
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
    console.error("Error al establecer contacto principal:", error)
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 })
  }
}
