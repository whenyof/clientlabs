export const maxDuration = 10
import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { sendQuoteSentEmail } from "@/lib/email-service"

export async function POST(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  const { id } = await params

  const quote = await prisma.quote.findFirst({
    where: { id, userId: session.user.id },
    select: {
      id: true,
      number: true,
      total: true,
      status: true,
      client: { select: { email: true, name: true } },
      user: { select: { name: true } },
    },
  })
  if (!quote) return NextResponse.json({ error: "Not found" }, { status: 404 })
  if (quote.status !== "DRAFT") return NextResponse.json({ error: "Only DRAFT quotes can be sent" }, { status: 400 })

  const updated = await prisma.quote.update({ where: { id }, data: { status: "SENT" } })

  if (quote.client.email) {
    const businessName = quote.user.name || "ClientLabs"
    sendQuoteSentEmail(
      quote.client.email,
      quote.client.name || "Cliente",
      quote.number,
      quote.total,
      businessName
    ).catch(() => {})
  }

  return NextResponse.json({ success: true, quote: updated })
}
