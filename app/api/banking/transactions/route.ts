export const maxDuration = 20

import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

const TINK_API = "https://api.tink.com"

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
      select: { accessToken: true, tokenExpiresAt: true },
    })

    if (!connection?.accessToken) {
      return NextResponse.json({ error: "No hay banco conectado" }, { status: 404 })
    }

    // Comprueba expiración (margen de 5 min)
    if (connection.tokenExpiresAt && connection.tokenExpiresAt < new Date(Date.now() + 300_000)) {
      return NextResponse.json({ error: "Token expirado — reconecta el banco" }, { status: 401 })
    }

    const token = connection.accessToken

    // Cuentas y saldos
    const accountsRes = await fetch(`${TINK_API}/data/v2/accounts`, {
      headers: { Authorization: `Bearer ${token}` },
    })
    const accountsData = await accountsRes.json()
    const accounts: TinkAccount[] = accountsData.accounts ?? []

    // Transacciones (últimas 100)
    const txRes = await fetch(`${TINK_API}/data/v2/transactions?pageSize=100`, {
      headers: { Authorization: `Bearer ${token}` },
    })
    const txData = await txRes.json()
    const transactions: TinkTransaction[] = txData.transactions ?? []

    // Mapear saldos
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

    // Mapear transacciones
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
