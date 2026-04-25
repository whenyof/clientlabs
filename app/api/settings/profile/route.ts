export const maxDuration = 10
import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma, safePrismaQuery } from "@/lib/prisma"
import { z } from "zod"

const profileSchema = z.object({
  name: z.string().min(1, "El nombre es obligatorio").max(200).trim().optional(),
  phone: z.string().max(50).trim().nullable().optional(),
})

export async function GET() {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 })
  }

  const user = await safePrismaQuery(() =>
    prisma.user.findUnique({
      where: { id: session.user.id },
      select: { id: true, name: true, email: true, phone: true, image: true, plan: true, role: true, createdAt: true },
    })
  )

  if (!user) {
    return NextResponse.json({ error: "Usuario no encontrado" }, { status: 404 })
  }

  return NextResponse.json({ success: true, user })
}

export async function PATCH(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 })
  }

  const body = await req.json().catch(() => ({}))
  const parsed = profileSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: "Datos inválidos", details: parsed.error.flatten() }, { status: 400 })
  }

  const { name, phone } = parsed.data
  const updateData: Record<string, unknown> = {}
  if (name !== undefined) updateData.name = name
  if (phone !== undefined) updateData.phone = phone

  const user = await safePrismaQuery(() =>
    prisma.user.update({
      where: { id: session.user.id },
      data: updateData,
      select: { id: true, name: true, email: true, phone: true, image: true, plan: true, role: true },
    })
  )

  return NextResponse.json({ success: true, user })
}
