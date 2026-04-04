import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export const dynamic = "force-dynamic"
export const maxDuration = 30

/** GET /api/providers — returns id + name list for the current user */
export async function GET() {
  console.warn("[api/providers] handler invoked")
  const session = await getServerSession(authOptions)
  console.warn("[api/providers] userId:", session?.user?.id ?? "NULL")
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const providers = await prisma.provider.findMany({
    where: { userId: session.user.id },
    select: { id: true, name: true },
    orderBy: { name: "asc" },
    take: 200,
  })

  console.warn("[api/providers] returned", providers.length, "providers")
  return NextResponse.json(providers)
}
