import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export const dynamic = "force-dynamic"
export const maxDuration = 15

function withTimeout<T>(p: Promise<T>, ms: number): Promise<T> {
  return Promise.race([
    p,
    new Promise<T>((_, reject) =>
      setTimeout(() => reject(new Error("Database timeout — inténtalo de nuevo")), ms)
    ),
  ])
}

/** GET /api/clients — returns id + name list for the current user. Supports ?q= for name search. */
export async function GET(request: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const { searchParams } = new URL(request.url)
  const q = searchParams.get("q")?.trim()

  const clients = await prisma.client.findMany({
    where: {
      userId: session.user.id,
      ...(q ? { name: { contains: q, mode: "insensitive" } } : {}),
    },
    select: { id: true, name: true },
    orderBy: { name: "asc" },
    take: 200,
  })

  return NextResponse.json(clients)
}

/** POST /api/clients — creates a client manually */
export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 })
    }

    const body = await req.json()

    if (!body.name?.trim()) {
      return NextResponse.json({ error: "Nombre requerido" }, { status: 400 })
    }

    const client = await withTimeout(
      prisma.client.create({
        data: {
          userId: session.user.id,
          name: body.name.trim(),
          email: body.email?.trim() || null,
          phone: body.phone?.trim() || null,
          status: "ACTIVE",
          totalSpent: body.totalSpent ? parseFloat(body.totalSpent) : 0,
        },
      }),
      12000
    )

    return NextResponse.json(client)
  } catch (err: any) {
    console.error("POST /api/clients error:", err)
    return NextResponse.json({ error: err.message || "Error interno" }, { status: 500 })
  }
}
