export const maxDuration = 15

import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 })
  }

  const { id } = await params
  const body = await req.json()

  const edicion = await prisma.newsletterEdicion.update({
    where: { id, userId: session.user.id },
    data: {
      ...body,
      programadaPara: body.programadaPara
        ? new Date(body.programadaPara)
        : undefined,
      updatedAt: new Date(),
    },
  })

  return NextResponse.json(edicion)
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 })
  }

  const { id } = await params

  await prisma.newsletterEdicion.delete({
    where: { id, userId: session.user.id },
  })

  return NextResponse.json({ ok: true })
}
