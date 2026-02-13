import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { calculateFiscalCompleteness } from "@/lib/clients/calculateFiscalCompleteness"

/** Minimal client list for invoice creation/filters. */
export async function GET() {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }
  try {
    const clients = await prisma.client.findMany({
      where: { userId: session.user.id },
      select: {
        id: true,
        name: true,
        email: true,
        legalName: true,
        legalType: true,
        taxId: true,
        address: true,
        city: true,
        postalCode: true,
        country: true,
      },
      orderBy: { name: "asc" },
    })

    const computed = clients.map((c) => ({
      ...c,
      isFiscalComplete: calculateFiscalCompleteness(c),
    }))

    return NextResponse.json({ success: true, clients: computed })
  } catch (e) {
    console.error("Invoicing clients list error:", e)
    return NextResponse.json({ error: "Failed to load clients" }, { status: 500 })
  }
}
