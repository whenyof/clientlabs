export const maxDuration = 10
import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function GET() {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 })
  }
  try {
    const perfil = await prisma.businessProfile.findUnique({
      where: { userId: session.user.id },
      select: {
        taxId: true,
        legalName: true,
        companyName: true,
        address: true,
        city: true,
        postalCode: true,
        phone: true,
        ivaRegime: true,
        epigrafIAE: true,
      },
    })
    return NextResponse.json({ success: true, perfil: perfil ?? {} })
  } catch (e) {
    console.error("perfil-fiscal GET error:", e)
    return NextResponse.json({ error: "Error interno" }, { status: 500 })
  }
}

export async function PATCH(request: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 })
  }
  let body: unknown
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: "JSON inválido" }, { status: 400 })
  }
  const b = body as Record<string, unknown>
  const data: Record<string, unknown> = {}
  if (typeof b.taxId === "string") data.taxId = b.taxId.trim()
  if (typeof b.legalName === "string") data.legalName = b.legalName.trim()
  if (typeof b.companyName === "string") data.companyName = b.companyName.trim()
  if (typeof b.address === "string") data.address = b.address.trim()
  if (typeof b.city === "string") data.city = b.city.trim()
  if (typeof b.postalCode === "string") data.postalCode = b.postalCode.trim()
  if (typeof b.phone === "string") data.phone = b.phone.trim()
  if (typeof b.ivaRegime === "string") data.ivaRegime = b.ivaRegime
  if (typeof b.epigrafIAE === "string") data.epigrafIAE = b.epigrafIAE.trim()

  try {
    await prisma.businessProfile.upsert({
      where: { userId: session.user.id },
      create: { userId: session.user.id, sector: "general", ...data },
      update: data,
    })
    return NextResponse.json({ success: true })
  } catch (e) {
    console.error("perfil-fiscal PATCH error:", e)
    return NextResponse.json({ error: "Error guardando perfil" }, { status: 500 })
  }
}
