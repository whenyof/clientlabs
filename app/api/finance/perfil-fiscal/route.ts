export const maxDuration = 10
import { NextRequest, NextResponse } from "next/server"
import { z } from "zod"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { isValidSpanishTaxId } from "@/lib/invoicing/legalValidator"

const perfilSchema = z
  .object({
    taxId: z.string().trim().optional(),
    legalName: z.string().trim().optional(),
    companyName: z.string().trim().optional(),
    address: z.string().trim().optional(),
    city: z.string().trim().optional(),
    postalCode: z.string().trim().optional(),
    province: z.string().trim().optional(),
    country: z.string().trim().optional(),
    phone: z.string().trim().optional(),
    ivaRegime: z.string().optional(),
    epigrafIAE: z.string().trim().optional(),
  })
  .refine((d) => !d.taxId || isValidSpanishTaxId(d.taxId), {
    message: "NIF/CIF no válido (dígito de control incorrecto)",
    path: ["taxId"],
  })

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
        province: true,
        country: true,
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
  const parsed = perfilSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Datos inválidos" },
      { status: 400 }
    )
  }

  // Solo escribir los campos presentes en el body (undefined = no tocar)
  const p = parsed.data
  const data: Record<string, unknown> = {}
  for (const key of ["taxId", "legalName", "companyName", "address", "city", "postalCode", "province", "country", "phone", "ivaRegime", "epigrafIAE"] as const) {
    // Campo vaciado ("") → null, para que no quede "" en BD (rompe los fallbacks legales)
    if (p[key] !== undefined) data[key] = p[key] === "" ? null : p[key]
  }

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
