export const maxDuration = 10

import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { isVerifactuEnabled, isVerifactuTest, resolveVerifactuApiKey } from "@/lib/verifactu"

export async function GET() {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 })
  }

  const apiKey = await resolveVerifactuApiKey(session.user.id)
  const enabled = !!apiKey
  const testMode = apiKey?.startsWith("vf_test_") ?? isVerifactuTest()

  return NextResponse.json({
    enabled,
    testMode,
    configured: isVerifactuEnabled(),
  })
}
