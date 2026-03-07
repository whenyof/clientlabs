import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { NextResponse } from "next/server"

export async function POST(req: Request) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { sector } = await req.json()

  if (!sector || typeof sector !== "string") {
    return NextResponse.json(
      { error: "Sector is required" },
      { status: 400 }
    )
  }

  await prisma.user.update({
    where: { id: session.user.id },
    data: {
      selectedSector: sector,
      onboardingCompleted: true,
    },
  })

  return NextResponse.json({ success: true })
}
