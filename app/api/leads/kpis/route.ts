export const dynamic = "force-dynamic"

import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function GET() {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const userId = session.user.id

  const [total, hot, converted, stalled] = await Promise.all([
    prisma.lead.count({ where: { userId } }),
    prisma.lead.count({ where: { userId, temperature: "HOT" } }),
    prisma.lead.count({ where: { userId, leadStatus: "CONVERTED" } }),
    prisma.lead.count({
      where: {
        userId,
        NOT: { leadStatus: { in: ["CONVERTED", "LOST"] } },
        OR: [
          { lastActionAt: null },
          { lastActionAt: { lt: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000) } },
        ],
      },
    }),
  ])

  return NextResponse.json({ total, hot, converted, stalled })
}
