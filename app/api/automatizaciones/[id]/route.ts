export const maxDuration = 10
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

  try {
    const updated = await prisma.automatizacion.update({
      where: { id, userId: session.user.id },
      data: {
        ...(body.config !== undefined ? { config: body.config } : {}),
        ...(body.nombre !== undefined ? { nombre: body.nombre } : {}),
      },
    })
    return NextResponse.json(updated)
  } catch (err: unknown) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Error" },
      { status: 500 }
    )
  }
}
