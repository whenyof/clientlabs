export const maxDuration = 10

import { NextResponse } from "next/server"
import { z } from "zod"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

const updateFormSchema = z.object({
  nombre: z.string().min(1).max(200).trim().optional(),
  descripcion: z.string().max(500).trim().optional(),
  fields: z.array(
    z.object({
      key: z.string().min(1).max(50),
      label: z.string().min(1).max(100),
      type: z.enum(["text", "email", "tel", "textarea"]),
      required: z.boolean().default(false),
    })
  ).min(1).max(20).optional(),
  successMessage: z.string().max(300).trim().optional(),
  redirectUrl: z.string().url().optional().or(z.literal("")),
  active: z.boolean().optional(),
})

export async function PATCH(req: Request, props: { params: Promise<{ id: string }> }) {
  const params = await props.params
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    const existing = await prisma.publicForm.findFirst({
      where: { id: params.id, userId: session.user.id },
      select: { id: true },
    })
    if (!existing) return NextResponse.json({ error: "No encontrado" }, { status: 404 })

    const raw = await req.json()
    const parsed = updateFormSchema.safeParse(raw)
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Datos no válidos" }, { status: 400 })
    }

    const updated = await prisma.publicForm.update({
      where: { id: params.id },
      data: {
        ...(parsed.data.nombre !== undefined && { nombre: parsed.data.nombre }),
        ...(parsed.data.descripcion !== undefined && { descripcion: parsed.data.descripcion }),
        ...(parsed.data.fields !== undefined && { fields: parsed.data.fields }),
        ...(parsed.data.successMessage !== undefined && { successMessage: parsed.data.successMessage }),
        ...(parsed.data.redirectUrl !== undefined && { redirectUrl: parsed.data.redirectUrl || null }),
        ...(parsed.data.active !== undefined && { active: parsed.data.active }),
      },
      select: { id: true, token: true, nombre: true, active: true, submissions: true, createdAt: true, fields: true, successMessage: true },
    })

    return NextResponse.json(updated)
  } catch (err) {
    console.error("PATCH /api/forms/[id] error:", err)
    return NextResponse.json({ error: "Error interno" }, { status: 500 })
  }
}

export async function DELETE(_req: Request, props: { params: Promise<{ id: string }> }) {
  const params = await props.params
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    const existing = await prisma.publicForm.findFirst({
      where: { id: params.id, userId: session.user.id },
      select: { id: true },
    })
    if (!existing) return NextResponse.json({ error: "No encontrado" }, { status: 404 })

    await prisma.publicForm.delete({ where: { id: params.id } })
    return NextResponse.json({ ok: true })
  } catch (err) {
    console.error("DELETE /api/forms/[id] error:", err)
    return NextResponse.json({ error: "Error interno" }, { status: 500 })
  }
}
