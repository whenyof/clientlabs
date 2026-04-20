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

  const ediciones = await prisma.newsletterEdicion.findMany({
    where: { userId: session.user.id },
    orderBy: [{ programadaPara: "desc" }, { createdAt: "desc" }],
  })

  return NextResponse.json({ ediciones })
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 })
  }

  const { titulo, asunto, contenido, estado, programadaPara } = await req.json()

  const edicion = await prisma.newsletterEdicion.create({
    data: {
      userId: session.user.id,
      titulo: titulo || "Sin título",
      asunto: asunto || "",
      contenido: contenido || "",
      estado: estado || "borrador",
      programadaPara: programadaPara ? new Date(programadaPara) : null,
    },
  })

  return NextResponse.json(edicion)
}
