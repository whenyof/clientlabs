export const maxDuration = 15

import { NextResponse } from "next/server"
import { z } from "zod"
import { prisma } from "@/lib/prisma"

const subscribeSchema = z.object({
  slug: z.string().min(1).max(100).trim(),
  email: z.string().email("Email no válido").max(255),
  nombre: z.string().max(200).trim().optional(),
  fuente: z.string().max(100).optional(),
})

export async function POST(req: Request) {
  try {
    const raw = await req.json()
    const parsed = subscribeSchema.safeParse(raw)

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message ?? "Datos no válidos" },
        { status: 400 }
      )
    }

    const { slug, email, nombre, fuente } = parsed.data

    const users = await prisma.user.findMany({
      select: { id: true, name: true, email: true },
    })

    const user = users.find(u => {
      const userSlug = (u.name || u.email)
        .toLowerCase()
        .replace(/\s+/g, "-")
        .replace(/[^a-z0-9-]/g, "")
      return userSlug === slug || u.email.split("@")[0] === slug
    })

    if (!user) {
      return NextResponse.json(
        { error: "Newsletter no encontrada" },
        { status: 404 }
      )
    }

    await prisma.newsletterSubscriber.upsert({
      where: {
        userId_email: {
          userId: user.id,
          email: email.toLowerCase().trim(),
        },
      },
      update: {
        activo: true,
        nombre: nombre || undefined,
        bajaEn: null,
      },
      create: {
        userId: user.id,
        email: email.toLowerCase().trim(),
        nombre: nombre || null,
        fuente: fuente || "widget",
        activo: true,
        confirmado: true,
      },
    })

    return NextResponse.json({ ok: true })
  } catch (err: unknown) {
    console.error("Subscribe error:", err)
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Error interno" },
      { status: 500 }
    )
  }
}
