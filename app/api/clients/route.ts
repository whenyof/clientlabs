import { NextRequest, NextResponse } from "next/server"
import { z } from "zod"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { gateLimit } from "@/lib/api-gate"
import { notifyClientCreated } from "@/lib/notification-service"

const createClientSchema = z.object({
  name: z.string().min(1, "Nombre requerido").max(200).trim(),
  email: z.string().email("Email no válido").max(255).optional().or(z.literal("")),
  phone: z.string().max(50).trim().optional(),
  totalSpent: z.union([z.string().max(20), z.number()]).optional(),
  taxId: z.string().max(20).trim().optional(),
  legalName: z.string().max(300).trim().optional(),
  companyName: z.string().max(300).trim().optional(),
  address: z.string().max(500).trim().optional(),
  city: z.string().max(100).trim().optional(),
  postalCode: z.string().max(20).trim().optional(),
  country: z.string().max(100).trim().optional(),
  notes: z.string().max(2000).trim().optional(),
})

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
    const gate = await gateLimit("maxClients", (userId) =>
      prisma.client.count({ where: { userId } })
    )
    if (!gate.allowed) return gate.error!

    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 })
    }

    const raw = await req.json()
    const parsed = createClientSchema.safeParse(raw)
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message ?? "Datos no válidos" },
        { status: 400 }
      )
    }
    const { name, email, phone, totalSpent, taxId, legalName, companyName, address, city, postalCode, country, notes } = parsed.data
    const isFiscalComplete = !!(taxId && (legalName || companyName))

    const client = await withTimeout(
      prisma.client.create({
        data: {
          userId: session.user.id,
          name,
          email: email || null,
          phone: phone || null,
          status: "ACTIVE",
          totalSpent: totalSpent !== undefined ? parseFloat(String(totalSpent)) : 0,
          taxId: taxId || null,
          legalName: legalName || null,
          companyName: companyName || null,
          address: address || null,
          city: city || null,
          postalCode: postalCode || null,
          country: country || null,
          additionalInfo: notes || null,
          isFiscalComplete,
        },
      }),
      12000
    )

    notifyClientCreated(session.user.id, client.name ?? "Cliente", client.id).catch(() => {})
    return NextResponse.json(client)
  } catch (err) {
    console.error("POST /api/clients error:", err)
    return NextResponse.json({ error: "Error interno" }, { status: 500 })
  }
}
