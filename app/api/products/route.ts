export const maxDuration = 10
import { NextRequest, NextResponse } from "next/server"
import { z } from "zod"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { isAllowedVatRate, ALLOWED_VAT_RATES } from "@/modules/invoicing/utils/vatRates"

const createProductSchema = z.object({
  name: z.string().min(1, "Nombre requerido").max(200).trim(),
  description: z.string().max(2000).trim().nullish(),
  price: z.number({ error: "Precio requerido" }).min(0).max(999999),
  taxRate: z.number().nullish().transform(v => v ?? 21).refine(isAllowedVatRate, {
    message: `Tipo de IVA no válido. Permitidos: ${ALLOWED_VAT_RATES.join(", ")}`,
  }),
  unit: z.string().max(50).nullish().transform(v => v ?? "ud"),
  category: z.string().max(100).nullish(),
  isService: z.boolean().nullish().transform(v => v ?? false),
})

export async function GET() {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const products = await prisma.product.findMany({
    where: { userId: session.user.id, deletedAt: null },
    orderBy: { name: "asc" },
  })
  return NextResponse.json({ success: true, products })
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  try {
    const raw = await req.json()
    const parsed = createProductSchema.safeParse(raw)
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message ?? "Datos no válidos" },
        { status: 400 }
      )
    }
    const { name, description, price, taxRate, unit, category, isService } = parsed.data

    const product = await prisma.product.create({
      data: {
        userId: session.user.id,
        name,
        description: description ?? null,
        price,
        taxRate,
        unit,
        category: category ?? null,
        isService,
      },
    })
    return NextResponse.json({ success: true, product }, { status: 201 })
  } catch (e) {
    console.error("POST /api/products", e)
    return NextResponse.json({ error: "Error interno" }, { status: 500 })
  }
}
