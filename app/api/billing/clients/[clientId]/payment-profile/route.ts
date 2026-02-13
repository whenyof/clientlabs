import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import * as paymentBehaviour from "@/modules/invoicing/behaviour/payment-behaviour.service"
import { prisma } from "@/lib/prisma"

/**
 * GET /api/billing/clients/[clientId]/payment-profile
 * Returns payment behaviour profile for the client. Recalculates if missing (e.g. first time).
 * Caller must own the client (via userId).
 */
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ clientId: string }> }
) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }
  const { clientId } = await params
  const client = await prisma.client.findFirst({
    where: { id: clientId, userId: session.user.id },
    select: { id: true },
  })
  if (!client) {
    return NextResponse.json({ error: "Client not found" }, { status: 404 })
  }
  try {
    const profile = await paymentBehaviour.getProfile(clientId, {
      recalculateIfMissing: true,
    })
    if (!profile) {
      return NextResponse.json({ profile: null })
    }
    return NextResponse.json({
      profile: {
        clientId: profile.clientId,
        averageDelayDays: profile.averageDelayDays,
        lateRate: profile.lateRate,
        unpaidAmount: profile.unpaidAmount,
        lastPaymentAt: profile.lastPaymentAt?.toISOString() ?? null,
        riskScore: profile.riskScore,
        riskLevel: profile.riskLevel,
        totalHistoricalBilled: profile.totalHistoricalBilled,
        totalHistoricalPaid: profile.totalHistoricalPaid,
        updatedAt: profile.updatedAt.toISOString(),
      },
    })
  } catch (e) {
    console.error("Payment profile error:", e)
    return NextResponse.json({ error: "Failed to load payment profile" }, { status: 500 })
  }
}
