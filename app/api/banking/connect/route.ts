export const maxDuration = 15

import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import crypto from "crypto"

const TINK_CLIENT_ID = process.env.TINK_CLIENT_ID!

function signState(userId: string): string {
  const secret = process.env.NEXTAUTH_SECRET ?? process.env.AUTH_SECRET ?? ""
  const hmac = crypto.createHmac("sha256", secret).update(userId).digest("hex")
  // Format: "userId.hmac" encoded as base64
  return Buffer.from(`${userId}.${hmac}`).toString("base64url")
}

export async function POST() {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 })
  }

  const redirectUri = `${process.env.NEXTAUTH_URL}/api/banking/callback`
  const state = signState(session.user.id)

  const params = new URLSearchParams({
    client_id: TINK_CLIENT_ID,
    redirect_uri: redirectUri,
    market: "ES",
    locale: "es_ES",
    state,
  })

  const tinkUrl = `https://link.tink.com/1.0/transactions/connect-accounts?${params}`

  return NextResponse.json({ url: tinkUrl })
}
