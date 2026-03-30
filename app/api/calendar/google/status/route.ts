import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export const dynamic = "force-dynamic"

export async function GET() {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) {
    return NextResponse.json({ connected: false }, { status: 401 })
  }

  const integration = await prisma.calendarIntegration.findUnique({
    where: { userId: session.user.id },
    select: { createdAt: true },
  })

  return NextResponse.json({ connected: !!integration, connectedAt: integration?.createdAt ?? null })
}
