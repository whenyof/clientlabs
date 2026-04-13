export const maxDuration = 30

import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { getRequisition } from "@/lib/banking/gocardless"

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl
  const ref = searchParams.get("ref") ?? ""

  const baseUrl = process.env.NEXTAUTH_URL ?? ""

  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.redirect(`${baseUrl}/login`)
    }

    if (!ref) {
      return NextResponse.redirect(`${baseUrl}/dashboard/finance/banco?error=missing_ref`)
    }

    const requisition = await getRequisition(ref)

    // "LN" = Linked (connected successfully)
    if (requisition.status === "LN") {
      await prisma.bankConnection.updateMany({
        where: { requisitionId: ref, userId: session.user.id },
        data: {
          status: "CONNECTED",
          accountIds: requisition.accounts,
          connectedAt: new Date(),
        },
      })

      return NextResponse.redirect(
        `${baseUrl}/dashboard/finance/banco?success=true`
      )
    }

    return NextResponse.redirect(
      `${baseUrl}/dashboard/finance/banco?error=not_linked&status=${requisition.status}`
    )
  } catch (err) {
    console.error("Banking callback error:", err)
    return NextResponse.redirect(`${baseUrl}/dashboard/finance/banco?error=server`)
  }
}
