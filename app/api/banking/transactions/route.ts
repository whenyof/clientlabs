export const maxDuration = 30

import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { getBalances, getTransactions } from "@/lib/banking/gocardless"

export async function GET() {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 })
  }

  try {
    const connection = await prisma.bankConnection.findFirst({
      where: { userId: session.user.id, status: "CONNECTED" },
      select: { id: true, accountIds: true, institutionName: true },
    })

    if (!connection || connection.accountIds.length === 0) {
      return NextResponse.json({ error: "No hay banco conectado" }, { status: 404 })
    }

    const [transactionsResults, balancesResults] = await Promise.allSettled([
      Promise.all(connection.accountIds.map((id) => getTransactions(id))),
      Promise.all(connection.accountIds.map((id) => getBalances(id))),
    ])

    const allTransactions =
      transactionsResults.status === "fulfilled"
        ? transactionsResults.value.flatMap((d) => d.transactions.booked)
        : []

    const allBalances =
      balancesResults.status === "fulfilled"
        ? balancesResults.value.flatMap((d) => d.balances)
        : []

    return NextResponse.json({
      transactions: allTransactions,
      balances: allBalances,
      institutionName: connection.institutionName,
    })
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Error"
    console.error("Banking transactions error:", err)
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
