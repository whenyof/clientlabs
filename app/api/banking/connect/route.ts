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

  try {
    const redirectUri = `${process.env.NEXTAUTH_URL}/api/banking/callback`

    // ── STEP 1: Token de cliente con scopes correctos ──────────────────────
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

    // ── STEP 2: Crear o recuperar usuario Tink ─────────────────────────────
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

    const userText = await userRes.text()
    let userData: Record<string, unknown>
    try {
      userData = JSON.parse(userText)
    } catch {
      userData = { raw: userText }
    }

    // Tink devuelve user_id en creación nueva o en el objeto de error para ya-existente
    let tinkUserId: string =
      (userData.user_id as string) ??
      (userData.id as string) ??
      ""

    if (!tinkUserId) {
      // Usuario ya existente: Tink devuelve error pero permite continuar
      const msg = String((userData.error as Record<string, unknown>)?.message ?? userData.message ?? "")
      const isAlreadyExists =
        msg.toLowerCase().includes("already exists") ||
        (userData.errorCode as string) === "USER_ALREADY_EXISTS" ||
        userRes.status === 409

      if (isAlreadyExists) {
        // Tink acepta external_user_id como id_hint en el auth grant
        tinkUserId = userId
      } else {
        console.error("Tink user/create error:", userRes.status, userText)
        return NextResponse.json(
          { error: `Error creando usuario Tink (${userRes.status}): ${userText.slice(0, 200)}` },
          { status: 500 }
        )
      }
    }

    // ── STEP 3: Authorization grant ────────────────────────────────────────
    const authRes = await fetch(`${TINK_API}/api/v1/oauth/authorization-grant`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${clientToken}`,
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({
        grant_type: "urn:ietf:params:oauth:grant-type:jwt-bearer",
        actor_client_id: TINK_CLIENT_ID,
        id_hint: tinkUserId,
        response_type: "code",
        scope: "accounts:read,transactions:read,balances:read,credentials:read",
      }),
    })

    const authData = await authRes.json()

    if (!authData.code) {
      console.error("Tink auth-grant error:", authData)
      return NextResponse.json(
        { error: `Error generando código de autorización: ${JSON.stringify(authData)}` },
        { status: 500 }
      )
    }

    // ── STEP 4: Construir URL de Tink Link ─────────────────────────────────
    const tinkUrl = new URL("https://link.tink.com/1.0/transactions/connect-accounts")
    tinkUrl.searchParams.set("client_id", TINK_CLIENT_ID)
    tinkUrl.searchParams.set("redirect_uri", redirectUri)
    tinkUrl.searchParams.set("authorization_code", authData.code)
    tinkUrl.searchParams.set("market", "ES")
    tinkUrl.searchParams.set("locale", "es_ES")

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
    })

    return NextResponse.json({ url: tinkUrl.toString(), tinkUserId })
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Error desconocido"
    console.error("Banking connect error:", err)
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
