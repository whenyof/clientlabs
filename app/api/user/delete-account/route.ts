export const maxDuration = 15
import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { Ratelimit } from "@upstash/ratelimit"
import { Redis } from "@upstash/redis"

const limiter = new Ratelimit({
  redis: Redis.fromEnv(),
  limiter: Ratelimit.slidingWindow(3, "1 h"),
  prefix: "clientlabs:delete-account",
})

export async function DELETE() {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 })
  }

  const { success } = await limiter.limit(session.user.id)
  if (!success) {
    return NextResponse.json({ error: "Demasiados intentos. Espera 1 hora." }, { status: 429 })
  }

  await prisma.user.delete({ where: { id: session.user.id } })

  return NextResponse.json({ success: true })
}
