export const maxDuration = 15

import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

const TINK_CLIENT_ID = process.env.TINK_CLIENT_ID!
const TINK_CLIENT_SECRET = process.env.TINK_CLIENT_SECRET!
const TINK_API = "https://api.tink.com"

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 })
  }

  const userId = session.user.id

  try {
    // 1 — Token de cliente (scope: authorization:grant)
    const tokenRes = await fetch(`${TINK_API}/api/v1/oauth/token`, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        client_id: TINK_CLIENT_ID,
        client_secret: TINK_CLIENT_SECRET,
        grant_type: "client_credentials",
        scope: "authorization:grant",
      }),
    })

    const tokenData = await tokenRes.json()
    const clientToken: string = tokenData.access_token

    if (!clientToken) {
      throw new Error(`No se pudo obtener token de cliente: ${JSON.stringify(tokenData)}`)
    }

    // 2 — Crear usuario en Tink (idempotente por external_user_id)
    const userRes = await fetch(`${TINK_API}/api/v1/user/create`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${clientToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        external_user_id: userId,
        market: "ES",
        locale: "es_ES",
      }),
    })

    const userData = await userRes.json()
    // Si el usuario ya existe Tink devuelve 409 con el user_id
    const tinkUserId: string = userData.user_id ?? userData.id ?? userData.external_user_id

    if (!tinkUserId) {
      throw new Error(`No se pudo obtener tinkUserId: ${JSON.stringify(userData)}`)
    }

    // 3 — Authorization grant para el usuario
    const authRes = await fetch(`${TINK_API}/api/v1/oauth/authorization-grant`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${clientToken}`,
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({
        user_id: tinkUserId,
        scope: "accounts:read,transactions:read,balances:read,credentials:read",
      }),
    })

    const authData = await authRes.json()
    const authCode: string = authData.code

    if (!authCode) {
      throw new Error(`No se pudo obtener authorization code: ${JSON.stringify(authData)}`)
    }

    // 4 — Construir URL de Tink Link
    const redirectUri = `${process.env.NEXTAUTH_URL}/api/banking/callback`
    const tinkUrl =
      `https://link.tink.com/1.0/transactions/connect-accounts` +
      `?client_id=${encodeURIComponent(TINK_CLIENT_ID)}` +
      `&redirect_uri=${encodeURIComponent(redirectUri)}` +
      `&authorization_code=${encodeURIComponent(authCode)}` +
      `&market=ES` +
      `&locale=es_ES`

    // 5 — Guardar conexión pendiente
    await prisma.bankConnection.upsert({
      where: { userId },
      create: {
        userId,
        institutionId: "tink",
        requisitionId: `tink-${userId}`,
        tinkUserId,
        status: "PENDING",
      },
      update: {
        tinkUserId,
        status: "PENDING",
        authCode: null,
        accessToken: null,
        tokenExpiresAt: null,
      },
    })

    return NextResponse.json({ url: tinkUrl })
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Error"
    console.error("Tink connect error:", err)
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
