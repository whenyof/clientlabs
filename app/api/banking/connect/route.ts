export const maxDuration = 30

import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

const TINK_CLIENT_ID = process.env.TINK_CLIENT_ID!
const TINK_CLIENT_SECRET = process.env.TINK_CLIENT_SECRET!
const TINK_API = "https://api.tink.com"

export async function POST() {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 })
  }

  const externalUserId = session.user.id

  try {
    // STEP 1 — Token de cliente
    const tokenRes = await fetch(`${TINK_API}/api/v1/oauth/token`, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        client_id: TINK_CLIENT_ID,
        client_secret: TINK_CLIENT_SECRET,
        grant_type: "client_credentials",
        scope: "user:create,authorization:grant",
      }),
    })

    const tokenData = await tokenRes.json()

    if (!tokenData.access_token) {
      return NextResponse.json(
        { error: "Error de credenciales Tink. Verifica CLIENT_ID y CLIENT_SECRET." },
        { status: 500 }
      )
    }

    const clientToken: string = tokenData.access_token

    // STEP 2 — Intentar crear usuario.
    // Si ya existe no pasa nada — lo ignoramos y continuamos.
    await fetch(`${TINK_API}/api/v1/user/create`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${clientToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        external_user_id: externalUserId,
        market: "ES",
        locale: "es_ES",
      }),
    })
    // No importa si devuelve error porque el usuario ya existe —
    // el siguiente paso funciona igual con external_user_id

    // STEP 3 — Authorization grant usando external_user_id directamente
    // (funciona tanto si el usuario es nuevo como si ya existía)
    const authRes = await fetch(`${TINK_API}/api/v1/oauth/authorization-grant`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${clientToken}`,
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({
        external_user_id: externalUserId,
        scope: "accounts:read,transactions:read,balances:read,credentials:read",
      }),
    })

    const authData = await authRes.json()

    if (!authData.code) {
      console.error("Auth grant error:", authData)
      return NextResponse.json(
        { error: authData.errorMessage || "Error generando autorización Tink" },
        { status: 500 }
      )
    }

    // STEP 4 — Construir URL Tink Link
    const redirectUri = `${process.env.NEXTAUTH_URL}/api/banking/callback`

    const params = new URLSearchParams({
      client_id: TINK_CLIENT_ID,
      redirect_uri: redirectUri,
      authorization_code: authData.code,
      market: "ES",
      locale: "es_ES",
    })

    const tinkUrl = `https://link.tink.com/1.0/transactions/connect-accounts?${params}`

    // Guarda estado en DB
    await prisma.bankConnection.upsert({
      where: { userId: session.user.id },
      update: {
        status: "PENDING",
        updatedAt: new Date(),
      },
      create: {
        userId: session.user.id,
        institutionId: "tink",
        requisitionId: externalUserId,
        status: "PENDING",
      },
    }).catch((err) => console.error("DB error:", err))

    return NextResponse.json({ url: tinkUrl })
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Error desconocido"
    console.error("Connect error:", err)
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
