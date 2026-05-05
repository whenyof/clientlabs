export const maxDuration = 10
import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { z } from "zod"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

const schema = z.object({
  plan: z.enum(["STARTER", "PRO", "BUSINESS"]),
})

export async function POST(req: Request) {
  const session = await getServerSession(authOptions)

  if (!session?.user?.id) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 })
  }

  const body = await req.json().catch(() => ({}))
  const parsed = schema.safeParse({ plan: String(body.plan ?? "").toUpperCase() })

  if (!parsed.success) {
    return NextResponse.json({ error: "Plan no válido" }, { status: 400 })
  }

  await prisma.user.update({
    where: { id: session.user.id },
    data: { plan: parsed.data.plan },
  })

  return NextResponse.json({ success: true })
}
