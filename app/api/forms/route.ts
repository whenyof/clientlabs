export const maxDuration = 10

import { NextResponse } from "next/server"
import { z } from "zod"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

const createFormSchema = z.object({
  nombre: z.string().min(1).max(200).trim(),
  descripcion: z.string().max(500).trim().optional(),
  fields: z.array(
    z.object({
      key: z.string().min(1).max(50),
      label: z.string().min(1).max(100),
      type: z.enum(["text", "email", "tel", "textarea"]),
      required: z.boolean().default(false),
    })
  ).min(1).max(20),
  successMessage: z.string().max(300).trim().optional(),
  redirectUrl: z.string().url().optional().or(z.literal("")),
})

export async function GET() {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const forms = await prisma.publicForm.findMany({
    where: { userId: session.user.id },
    select: {
      id: true,
      token: true,
      nombre: true,
      descripcion: true,
      active: true,
      submissions: true,
      createdAt: true,
      fields: true,
      successMessage: true,
      redirectUrl: true,
    },
    orderBy: { createdAt: "desc" },
    take: 50,
  })

  return NextResponse.json(forms)
}

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    const raw = await req.json()
    const parsed = createFormSchema.safeParse(raw)
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Datos no válidos" }, { status: 400 })
    }

    const form = await prisma.publicForm.create({
      data: {
        userId: session.user.id,
        nombre: parsed.data.nombre,
        descripcion: parsed.data.descripcion || null,
        fields: parsed.data.fields,
        successMessage: parsed.data.successMessage || "Gracias, te contactaremos pronto.",
        redirectUrl: parsed.data.redirectUrl || null,
      },
      select: { id: true, token: true, nombre: true, active: true, submissions: true, createdAt: true, fields: true, successMessage: true, redirectUrl: true, descripcion: true },
    })

    return NextResponse.json(form)
  } catch (err) {
    console.error("POST /api/forms error:", err)
    return NextResponse.json({ error: "Error interno" }, { status: 500 })
  }
}
