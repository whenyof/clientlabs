export const maxDuration = 30

import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { createAgreement, createRequisition, getInstitutions } from "@/lib/banking/gocardless"

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 })
    }

    const { institutionId, institutionName, redirectUrl } = await req.json()

    if (!institutionId) {
      return NextResponse.json({ error: "institutionId requerido" }, { status: 400 })
    }

    const callbackUrl =
      redirectUrl ??
      `${process.env.NEXTAUTH_URL}/api/banking/callback`

    const agreement = await createAgreement(institutionId)

    const requisition = await createRequisition({
      redirect: callbackUrl,
      institutionId,
      agreementId: agreement.id,
      reference: session.user.id,
    })

    // Upsert: si ya había una conexión pendiente para este banco, la reemplaza
    await prisma.bankConnection.upsert({
      where: { requisitionId: requisition.id },
      create: {
        userId: session.user.id,
        institutionId,
        institutionName: institutionName ?? null,
        requisitionId: requisition.id,
        agreementId: agreement.id,
        accountIds: [],
        status: "PENDING",
      },
      update: {
        status: "PENDING",
        agreementId: agreement.id,
        accountIds: [],
      },
    })

    return NextResponse.json({ link: requisition.link, requisitionId: requisition.id })
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Error"
    console.error("Banking connect error:", err)
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
