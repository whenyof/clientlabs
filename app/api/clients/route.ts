import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export const dynamic = "force-dynamic"
export const maxDuration = 30

/** GET /api/clients — returns id + name list for the current user */
export async function GET() {
  console.warn("[api/clients] handler invoked")
  const session = await getServerSession(authOptions)
  console.warn("[api/clients] userId:", session?.user?.id ?? "NULL")
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const clients = await prisma.client.findMany({
    where: { userId: session.user.id },
    select: { id: true, name: true },
    orderBy: { name: "asc" },
    take: 200,
  })

  console.warn("[api/clients] returned", clients.length, "clients")
  return NextResponse.json(clients)
}
