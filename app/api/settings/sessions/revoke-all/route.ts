export const maxDuration = 10

import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { revokeAllOtherSessions } from "@/lib/auth/session-tracking"

export async function POST() {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) {
    return NextResponse.json({ error: "No autenticado" }, { status: 401 })
  }

  const jti = (session as { jti?: string }).jti
  if (!jti) {
    return NextResponse.json({ error: "Sesión inválida" }, { status: 400 })
  }

  await revokeAllOtherSessions(session.user.id, jti)
  return NextResponse.json({ success: true })
}
