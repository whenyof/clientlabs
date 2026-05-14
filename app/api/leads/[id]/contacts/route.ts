export const maxDuration = 10
export const dynamic = "force-dynamic"
import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function GET(
  _req: NextRequest,
  props: { params: Promise<{ id: string }> }
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

    const contacts = await prisma.leadContact.findMany({
      where: { leadId: params.id },
      orderBy: [{ isPrimary: "desc" }, { createdAt: "asc" }],
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

    return NextResponse.json(contacts)
  } catch (error) {
    console.error("Error al obtener contactos:", error)
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 })
  }
}

export async function POST(
  request: NextRequest,
  props: { params: Promise<{ id: string }> }
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

    const body = await request.json()
    const { name, email, phone, role, isPrimary } = body

    if (!name) {
      return NextResponse.json({ error: "El nombre es obligatorio" }, { status: 400 })
    }

    if (isPrimary) {
      await prisma.leadContact.updateMany({
        where: { leadId: params.id, isPrimary: true },
        data: { isPrimary: false },
      })
    }

    const contact = await prisma.leadContact.create({
      data: {
        leadId: params.id,
        name,
        email: email ?? null,
        phone: phone ?? null,
        role: role ?? null,
        isPrimary: isPrimary ?? false,
      },
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

    return NextResponse.json(contact, { status: 201 })
  } catch (error) {
    console.error("Error al crear contacto:", error)
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 })
  }
}
