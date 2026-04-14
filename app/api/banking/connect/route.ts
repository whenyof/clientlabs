export const maxDuration = 15

import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"

const TINK_CLIENT_ID = process.env.TINK_CLIENT_ID!

export async function POST() {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 })
  }

  // Flujo de acceso único — NO necesita crear usuarios ni authorization_code.
  // Solo client_id + redirect_uri.
  const redirectUri = `${process.env.NEXTAUTH_URL}/api/banking/callback`

  // Usa state para identificar al usuario en el callback
  const state = Buffer.from(session.user.id).toString("base64")

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
