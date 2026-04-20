export const maxDuration = 15
import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { seedAutomations } from "@/lib/automations/seedAutomations"

const EXPECTED = 20

export async function GET() {
  const session = await getServerSession(authOptions)
  console.log("=== GET /api/automatizaciones ===")
  console.log("Session userId:", session?.user?.id)
  if (!session?.user?.id) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 })
  }

  const userId = session.user.id

  // Siempre sincroniza — el upsert no duplica, solo actualiza
  await seedAutomations(userId).catch(console.error)

  const countAfterSeed = await prisma.automatizacion.count({ where: { userId } })
  console.log("Count en DB:", countAfterSeed)

  const automatizaciones = await prisma.automatizacion.findMany({
    where: { userId },
    orderBy: { createdAt: "asc" },
    include: {
      logs: {
        orderBy: { ejecutadaEn: "desc" },
        take: 5,
        select: {
          id: true,
          ejecutadaEn: true,
          resultado: true,
          detalle: true,
          entidadTipo: true,
        },
      },
    },
  })

  // Log de actividad reciente global (últimas 20 del usuario)
  const actividadReciente = await prisma.automatizacionLog.findMany({
    where: { automatizacion: { userId } },
    orderBy: { ejecutadaEn: "desc" },
    take: 20,
    select: {
      id: true,
      ejecutadaEn: true,
      resultado: true,
      detalle: true,
      entidadTipo: true,
      automatizacion: { select: { nombre: true } },
    },
  })

  console.log("Devolviendo:", automatizaciones.length, "automatizaciones")
  return NextResponse.json({ automatizaciones, actividadReciente })
}
