export const maxDuration = 20

import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

const TINK_CLIENT_ID = process.env.TINK_CLIENT_ID!
const TINK_CLIENT_SECRET = process.env.TINK_CLIENT_SECRET!

type TinkAccount = {
  id: string
  name: string
  type: string
  balances?: {
    available?: { amount?: { value?: { unscaledValue?: number; scale?: number }; currencyCode?: string } }
    booked?: { amount?: { value?: { unscaledValue?: number; scale?: number }; currencyCode?: string } }
  }
  identifiers?: { iban?: { iban?: string } }
}

type TinkTransaction = {
  id: string
  descriptions?: { display?: string; original?: string }
  dates?: { booked?: string; value?: string }
  amount?: { value?: { unscaledValue?: number; scale?: number }; currencyCode?: string }
  status?: string
}

function toEuros(unscaledValue = 0, scale = 2): number {
  return unscaledValue / Math.pow(10, scale)
}

export async function GET() {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 })
  }

  try {
    const connection = await prisma.bankConnection.findFirst({
      where: { userId: session.user.id, status: "CONNECTED" },
      select: { authCode: true, accessToken: true, tokenExpiresAt: true },
    })

    if (!connection) {
      return NextResponse.json({ error: "No hay banco conectado" }, { status: 404 })
    }

    // Si ya tenemos accessToken vigente, úsalo directamente
    let userToken: string | null = null

    if (
      connection.accessToken &&
      connection.tokenExpiresAt &&
      connection.tokenExpiresAt > new Date(Date.now() + 300_000)
    ) {
      userToken = connection.accessToken
    } else if (connection.authCode) {
      // Intercambia el code por access_token
      const tokenRes = await fetch("https://api.tink.com/api/v1/oauth/token", {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: new URLSearchParams({
          code: connection.authCode,
          client_id: TINK_CLIENT_ID,
          client_secret: TINK_CLIENT_SECRET,
          grant_type: "authorization_code",
        }),
      })

      const tokenData = await tokenRes.json()

      if (!tokenData.access_token) {
        // El code expiró — hay que reconectar
        await prisma.bankConnection.update({
          where: { userId: session.user.id },
          data: { status: "EXPIRED" },
        }).catch(() => {})

        return NextResponse.json(
          { error: "La conexión bancaria ha expirado. Reconecta tu banco.", expired: true },
          { status: 401 }
        )
      }

      userToken = tokenData.access_token as string
      const expiresIn: number = tokenData.expires_in ?? 3600

      // Guarda el access_token para reutilizarlo
      await prisma.bankConnection.update({
        where: { userId: session.user.id },
        data: {
          accessToken: userToken,
          tokenExpiresAt: new Date(Date.now() + expiresIn * 1000),
          authCode: null,
        },
      }).catch(() => {})
    } else {
      return NextResponse.json({ error: "No hay banco conectado" }, { status: 404 })
    }

    if (!userToken) {
      return NextResponse.json({ error: "No hay banco conectado" }, { status: 404 })
    }

    // Cuentas y transacciones en paralelo
    const [accountsRes, txRes] = await Promise.all([
      fetch("https://api.tink.com/data/v2/accounts", {
        headers: { Authorization: `Bearer ${userToken}` },
      }),
      fetch("https://api.tink.com/data/v2/transactions?pageSize=100", {
        headers: { Authorization: `Bearer ${userToken}` },
      }),
    ])

    const accountsData = await accountsRes.json()
    const txData = await txRes.json()

    const accounts: TinkAccount[] = accountsData.accounts ?? []
    const transactions: TinkTransaction[] = txData.transactions ?? []

    const balances = accounts.map((a) => {
      const av = a.balances?.available?.amount
      const bk = a.balances?.booked?.amount
      const amount = av ?? bk
      return {
        name: a.name,
        iban: a.identifiers?.iban?.iban ?? null,
        amount: amount?.value?.unscaledValue ?? 0,
        scale: amount?.value?.scale ?? 2,
        currency: amount?.currencyCode ?? "EUR",
        amountEuros: toEuros(
          amount?.value?.unscaledValue ?? 0,
          amount?.value?.scale ?? 2
        ),
      }
    })

    const txMapped = transactions.map((tx) => ({
      id: tx.id,
      label: tx.descriptions?.display ?? tx.descriptions?.original ?? "Movimiento",
      date: tx.dates?.booked ?? tx.dates?.value ?? "",
      amountEuros: toEuros(
        tx.amount?.value?.unscaledValue ?? 0,
        tx.amount?.value?.scale ?? 2
      ),
      currency: tx.amount?.currencyCode ?? "EUR",
      status: tx.status ?? "BOOKED",
    }))

    return NextResponse.json({ balances, transactions: txMapped })
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Error"
    console.error("Tink transactions error:", err)
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
