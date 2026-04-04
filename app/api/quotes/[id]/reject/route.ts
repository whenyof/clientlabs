export const maxDuration = 10
import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function POST(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  const { id } = await params

  const quote = await prisma.quote.findFirst({ where: { id, userId: session.user.id } })
  if (!quote) return NextResponse.json({ error: "Not found" }, { status: 404 })

  const updated = await prisma.quote.update({ where: { id }, data: { status: "REJECTED" } })
  return NextResponse.json({ success: true, quote: updated })
}
