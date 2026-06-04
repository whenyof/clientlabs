export const maxDuration = 10

import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { z } from "zod"

type Params = { params: Promise<{ id: string }> }

const UpdateSchema = z.object({
  name: z.string().min(1).max(100).trim().optional(),
  description: z.string().max(300).optional(),
  subject: z.string().min(1).max(200).trim().optional(),
  htmlContent: z.string().min(1).optional(),
  category: z.string().max(50).optional(),
})

export async function PATCH(req: NextRequest, { params }: Params) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) return NextResponse.json({ error: "No autorizado" }, { status: 401 })

  const { id } = await params
  const body = await req.json().catch(() => ({}))
  const parsed = UpdateSchema.safeParse(body)
  if (!parsed.success) return NextResponse.json({ error: "Datos inválidos" }, { status: 400 })

  const existing = await prisma.emailTemplate.findFirst({ where: { id, userId: session.user.id } })
  if (!existing) return NextResponse.json({ error: "No encontrado" }, { status: 404 })

  const updated = await prisma.emailTemplate.update({
    where: { id },
    data: parsed.data,
  })
  return NextResponse.json({ template: updated })
}

export async function DELETE(_req: NextRequest, { params }: Params) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) return NextResponse.json({ error: "No autorizado" }, { status: 401 })

  const { id } = await params
  const existing = await prisma.emailTemplate.findFirst({ where: { id, userId: session.user.id } })
  if (!existing) return NextResponse.json({ error: "No encontrado" }, { status: 404 })

  await prisma.emailTemplate.delete({ where: { id } })
  return NextResponse.json({ success: true })
}

// Increment usage count when a template is applied
export async function POST(_req: NextRequest, { params }: Params) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) return NextResponse.json({ error: "No autorizado" }, { status: 401 })

  const { id } = await params
  await prisma.emailTemplate
    .updateMany({ where: { id, userId: session.user.id }, data: { usageCount: { increment: 1 } } })
    .catch(() => {})

  return NextResponse.json({ success: true })
}
