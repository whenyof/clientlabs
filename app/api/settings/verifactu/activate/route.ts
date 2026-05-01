import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { createVerifactuNif, isVerifactuConfigured } from "@/lib/verifactu"
import { z } from "zod"

export const maxDuration = 30

const schema = z.object({
  nif: z.string().min(8).max(15),
  nombre: z.string().min(2).max(200),
  direccion: z.string().max(300).optional(),
  cp: z.string().max(10).optional(),
  ciudad: z.string().max(100).optional(),
  provincia: z.string().max(100).optional(),
  signedBy: z.string().min(2).max(200).optional(),
  agreementAccepted: z.literal(true).optional(),
  declaracionAccepted: z.literal(true).optional(),
})

export async function POST(request: Request) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 })
  }

  if (!isVerifactuConfigured()) {
    return NextResponse.json({ error: "Verifactu no está configurado en el servidor" }, { status: 503 })
  }

  const body = await request.json()
  const parsed = schema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: "NIF y nombre fiscal son obligatorios" }, { status: 400 })
  }

  const { nif, nombre, signedBy, direccion, cp, ciudad, provincia } = parsed.data

  const profile = await prisma.businessProfile.findUnique({
    where: { userId: session.user.id },
    select: { id: true, verifactuEnabled: true },
  })

  if (!profile) {
    return NextResponse.json({ error: "Perfil de empresa no encontrado. Configura primero los datos de empresa." }, { status: 404 })
  }

  if (profile.verifactuEnabled) {
    return NextResponse.json({ error: "Verifactu ya está activado para este perfil" }, { status: 400 })
  }

  try {
    const result = await createVerifactuNif(nif, nombre)

    const now = new Date()
    await prisma.businessProfile.update({
      where: { id: profile.id },
      data: {
        verifactuApiKey: result.api_key,
        verifactuEnabled: true,
        verifactuActivatedAt: now,
        verifactuAgreementAccepted: true,
        verifactuAgreementAcceptedAt: now,
        verifactuAgreementSignedBy: signedBy ?? nombre,
        verifactuAgreementSignedNif: nif,
        taxId: nif,
        legalName: nombre,
        ...(direccion && { address: direccion }),
        ...(cp && { postalCode: cp }),
        ...(ciudad && { city: ciudad }),
        ...(provincia && { country: provincia }),
      },
    })

    return NextResponse.json({ success: true, message: "Verifactu activado correctamente" })
  } catch (error) {
    console.error("[Verifactu] Error al activar:", error instanceof Error ? error.message : error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Error al activar Verifactu" },
      { status: 500 }
    )
  }
}
