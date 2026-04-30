export const maxDuration = 10

import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { getVerifactuStatus, resolveVerifactuApiKey } from "@/lib/verifactu"

export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 })
  }

  const { id } = await params

  const invoice = await prisma.invoice.findUnique({
    where: { id },
    select: { verifactuUuid: true, verifactuStatus: true, userId: true },
  })

  if (!invoice || invoice.userId !== session.user.id) {
    return NextResponse.json({ error: "No encontrado" }, { status: 404 })
  }

  if (!invoice.verifactuUuid) {
    return NextResponse.json({ status: "not_sent" })
  }

  if (invoice.verifactuStatus === "Aceptado") {
    return NextResponse.json({ status: "Aceptado" })
  }

  const apiKey = await resolveVerifactuApiKey(session.user.id)

  if (!apiKey) {
    return NextResponse.json({ error: "Verifactu no configurado" }, { status: 503 })
  }

  try {
    const status = await getVerifactuStatus(apiKey, invoice.verifactuUuid)

    if (status.estado !== invoice.verifactuStatus) {
      await prisma.invoice.update({
        where: { id },
        data: { verifactuStatus: status.estado },
      })
    }

    return NextResponse.json(status)
  } catch {
    return NextResponse.json({ error: "Error consultando estado" }, { status: 500 })
  }
}
