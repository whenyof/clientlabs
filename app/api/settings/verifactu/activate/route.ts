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

  const { nif, nombre } = parsed.data

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

    await prisma.businessProfile.update({
      where: { id: profile.id },
      data: {
        verifactuApiKey: result.api_key,
        verifactuEnabled: true,
        verifactuActivatedAt: new Date(),
        taxId: nif,
        legalName: nombre,
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
