export const maxDuration = 10

import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { isVerifactuEnabled, isVerifactuTest } from "@/lib/verifactu"

export async function GET() {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 })
  }

  const profile = await prisma.businessProfile.findUnique({
    where: { userId: session.user.id },
    select: { verifactuEnabled: true, verifactuApiKey: true },
  })

  const enabled = profile?.verifactuEnabled ?? false
  const apiKey = enabled ? (profile?.verifactuApiKey ?? null) : null
  const testMode = apiKey?.startsWith("vf_test_") ?? isVerifactuTest()

  return NextResponse.json({
    enabled,
    testMode,
    configured: isVerifactuEnabled(),
  })
}
