export const maxDuration = 10
import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { gateFeature, gateLimit } from "@/lib/api-gate"

export async function PATCH(
  _: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const featureGate = await gateFeature("automations")
  if (!featureGate.allowed) return featureGate.error!

  const session = await getServerSession(authOptions)
  if (!session?.user?.id) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 })
  }

  const { id } = await params

  const auto = await prisma.automatizacion.findUnique({
    where: { id },
    select: { id: true, userId: true, activa: true },
  })

  if (!auto || auto.userId !== session.user.id) {
    return NextResponse.json({ error: "No encontrado" }, { status: 404 })
  }

  // Only check limit when activating (not deactivating)
  if (!auto.activa) {
    const limitGate = await gateLimit("maxActiveAutomations", (userId) =>
      prisma.automatizacion.count({ where: { userId, activa: true } }).catch(() => 0)
    )
    if (!limitGate.allowed) return limitGate.error!
  }

  const updated = await prisma.automatizacion.update({
    where: { id },
    data: { activa: !auto.activa },
  })

  return NextResponse.json(updated)
}
