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

  const userId = session.user.id
  const redirectUri = `${process.env.NEXTAUTH_URL}/api/banking/callback`

  try {
    // ── STEP 1: Token de cliente ───────────────────────────────────────────
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
      console.error("Tink token error:", tokenData)
      return NextResponse.json(
        { error: "Error obteniendo token de Tink. Verifica las credenciales en Tink Console." },
        { status: 500 }
      )
    }

    const clientToken: string = tokenData.access_token

    // ── STEP 2: Crear usuario — obtener user_id INTERNO de Tink ───────────
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

    // user_id es el ID INTERNO de Tink (distinto del external_user_id)
    let tinkUserId: string = userData.user_id ?? userData.id ?? ""

    if (!tinkUserId && userData.errorCode) {
      // Usuario ya existe — buscarlo por external_user_id
      const existingRes = await fetch(
        `${TINK_API}/api/v1/user?external_user_id=${encodeURIComponent(userId)}`,
        { headers: { Authorization: `Bearer ${clientToken}` } }
      )
      const existingData = await existingRes.json()
      tinkUserId = existingData.id ?? existingData.user_id ?? ""

      if (!tinkUserId) {
        console.error("Tink user lookup failed:", existingData, "create error:", userData)
        return NextResponse.json(
          { error: `No se pudo crear ni encontrar el usuario Tink: ${JSON.stringify(userData)}` },
          { status: 500 }
        )
      }
    }

    if (!tinkUserId) {
      console.error("Tink user/create error:", userRes.status, userData)
      return NextResponse.json(
        { error: `Error creando usuario Tink: ${JSON.stringify(userData)}` },
        { status: 500 }
      )
    }

    // ── STEP 3: Authorization grant — SOLO user_id interno ────────────────
    // No pasar id_hint ni external_user_id — Tink rechaza con
    // oauth.multiple_user_ids_specified si se envían varios identificadores
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

    if (!authData.code) {
      console.error("Tink auth-grant error:", authData)
      return NextResponse.json(
        { error: `Auth grant error: ${JSON.stringify(authData)}` },
        { status: 500 }
      )
    }

    // ── STEP 4: Construir URL de Tink Link ─────────────────────────────────
    const params = new URLSearchParams({
      client_id: TINK_CLIENT_ID,
      redirect_uri: redirectUri,
      authorization_code: authData.code,
      market: "ES",
      locale: "es_ES",
    })
    const tinkUrl = `https://link.tink.com/1.0/transactions/connect-accounts?${params}`

    // ── STEP 5: Guardar conexión pendiente ─────────────────────────────────
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
    }).catch((err) => console.error("DB save error:", err))

    return NextResponse.json({ url: tinkUrl, tinkUserId })
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Error desconocido"
    console.error("Banking connect error:", err)
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
