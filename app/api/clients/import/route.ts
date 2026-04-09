import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export const dynamic = "force-dynamic"
export const maxDuration = 30

/** POST /api/clients/import — bulk creates clients from parsed CSV data */
export async function POST(request: NextRequest) {
  const session = await getServerSession(authOptions)
  const userId = session?.user?.id
  if (!userId) return NextResponse.json({ error: "No autorizado" }, { status: 401 })

  const { clients } = await request.json()

  if (!Array.isArray(clients) || clients.length === 0) {
    return NextResponse.json({ error: "No hay clientes para importar" }, { status: 400 })
  }

  const valid = clients.filter((c: any) => c.name?.trim())

  if (valid.length === 0) {
    return NextResponse.json({ error: "Ningún cliente tiene nombre" }, { status: 400 })
  }

  const created = await prisma.$transaction(
    valid.map((c: any) =>
      prisma.client.create({
        data: {
          userId,
          name: c.name.trim(),
          email: c.email || null,
          phone: c.phone || null,
          legalType: c.legalType || null,
          taxId: c.taxId || null,
          source: c.source || "import",
          notes: c.notes || null,
          status: "ACTIVE",
          totalSpent: 0,
          country: "España",
        },
        select: { id: true, name: true },
      })
    )
  )

  return NextResponse.json({ created: created.length, clients: created })
}
