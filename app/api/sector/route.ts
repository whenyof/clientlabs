import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

const VALID_SECTORS = [
  "otro",
  "restaurante",
  "gimnasio",
  "taller",
  "inmobiliaria",
  "tienda",
  "servicios",
  "eventos"
] as const

type ValidSector = (typeof VALID_SECTORS)[number]

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const { sector } = body

    if (!sector || !VALID_SECTORS.includes(sector as ValidSector)) {
      return NextResponse.json({ error: "Invalid sector" }, { status: 400 })
    }

    // Upsert BusinessProfile
    await prisma.businessProfile.upsert({
      where: { userId: session.user.id },
      update: { sector },
      create: {
        userId: session.user.id,
        sector,
        name: session.user.name || "Empresa",
      },
    })

    return NextResponse.json({
      success: true,
      redirect: `/dashboard/${sector}`,
    })
  } catch (error) {
    console.error("Sector selection error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}