import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export const dynamic = "force-dynamic"
export const maxDuration = 10

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
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 })
    }

    const body = await request.json()

    if (!body.name?.trim()) {
      return NextResponse.json({ error: "El nombre es obligatorio" }, { status: 400 })
    }

    const client = await prisma.client.create({
      data: {
        userId: session.user.id,
        name: body.name.trim(),
        email: body.email?.trim() || null,
        phone: body.phone?.trim() || null,
        notes: body.notes?.trim() || null,
        legalType: body.legalType || null,
        taxId: body.taxId?.trim() || null,
        address: body.address?.trim() || null,
        city: body.city?.trim() || null,
        postalCode: body.postalCode?.trim() || null,
        country: body.country?.trim() || "España",
        companyName: body.companyName?.trim() || null,
        legalName: body.legalName?.trim() || null,
        source: "manual",
        status: "ACTIVE",
        totalSpent: body.estimatedValue ? parseFloat(body.estimatedValue) : 0,
      },
      select: { id: true, name: true, email: true, phone: true, status: true, createdAt: true },
    })

    return NextResponse.json(client)
  } catch (err: any) {
    console.error("Error POST /api/clients:", err)
    return NextResponse.json({ error: err.message || "Error interno del servidor" }, { status: 500 })
  }
}
