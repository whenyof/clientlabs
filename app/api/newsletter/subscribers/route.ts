export const maxDuration = 15

import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function GET() {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 })
  }

  const [suscriptores, total] = await Promise.all([
    prisma.newsletterSubscriber.findMany({
      where: { userId: session.user.id, activo: true },
      orderBy: { creadoEn: "desc" },
      select: {
        id: true,
        email: true,
        nombre: true,
        fuente: true,
        creadoEn: true,
      },
    }),
    prisma.newsletterSubscriber.count({
      where: { userId: session.user.id, activo: true },
    }),
  ])

  return NextResponse.json({ suscriptores, total })
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 })
  }

  const { email, nombre, fuente } = await req.json()

  if (!email) {
    return NextResponse.json({ error: "Email requerido" }, { status: 400 })
  }

  const suscriptor = await prisma.newsletterSubscriber.upsert({
    where: {
      userId_email: {
        userId: session.user.id,
        email: email.toLowerCase().trim(),
      },
    },
    update: {
      activo: true,
      nombre: nombre || undefined,
    },
    create: {
      userId: session.user.id,
      email: email.toLowerCase().trim(),
      nombre: nombre || null,
      fuente: fuente || "manual",
      activo: true,
      confirmado: true,
    },
  })

  return NextResponse.json(suscriptor)
}
