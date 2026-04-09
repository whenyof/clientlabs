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
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) return NextResponse.json({ error: "No autorizado" }, { status: 401 })

  const body = await request.json()
  const {
    name, email, phone, notes,
    legalType, taxId, address, city, postalCode,
    country, companyName, legalName, source,
  } = body

  if (!name?.trim()) {
    return NextResponse.json({ error: "El nombre es obligatorio" }, { status: 400 })
  }

  const client = await prisma.client.create({
    data: {
      userId: session.user.id,
      name: name.trim(),
      email: email?.trim() || null,
      phone: phone?.trim() || null,
      notes: notes?.trim() || null,
      legalType: legalType || null,
      taxId: taxId?.trim() || null,
      address: address?.trim() || null,
      city: city?.trim() || null,
      postalCode: postalCode?.trim() || null,
      country: country?.trim() || "España",
      companyName: companyName?.trim() || null,
      legalName: legalName?.trim() || null,
      source: source || "manual",
      status: "ACTIVE",
      totalSpent: 0,
    },
    select: { id: true, name: true, email: true, phone: true, status: true, createdAt: true },
  })

  return NextResponse.json(client)
}
