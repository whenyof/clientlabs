export const maxDuration = 15

import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function POST(req: Request) {
  try {
    const { slug, email, nombre, fuente } = await req.json()

    if (!email || !slug) {
      return NextResponse.json(
        { error: "Email y slug requeridos" },
        { status: 400 }
      )
    }

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
