export const maxDuration = 10
import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { z } from "zod"

const styleSchema = z.object({
  headerBg: z.string(),
  headerText: z.string(),
  accentColor: z.string(),
  bodyBg: z.string(),
  bodyText: z.string(),
  tableBorderColor: z.string(),
  tableHeaderBg: z.string(),
  tableHeaderText: z.string(),
  tableAltRowBg: z.string(),
  fontFamily: z.enum(["helvetica", "times"]).default("helvetica"),
  logoPosition: z.enum(["left", "center", "right"]).default("left"),
  qrPosition: z.enum(["top-right", "bottom-left", "bottom-right"]).default("bottom-right"),
  layout: z.enum(["standard", "compact", "modern", "minimal", "luxury"]).default("standard"),
  showBorders: z.boolean().default(true),
  roundedCorners: z.boolean().default(false),
}).passthrough()

const schema = z.object({
  name: z.string().min(1).max(60),
  description: z.string().max(200).optional(),
  style: styleSchema,
})

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) {
    return NextResponse.json({ error: "No autenticado" }, { status: 401 })
  }

  const body = await req.json().catch(() => ({}))
  const parsed = schema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: "Datos de plantilla inválidos", details: parsed.error.flatten() }, { status: 400 })
  }

  try {
    const slug = `custom-${session.user.id}-${Date.now()}`
    const template = await prisma.invoiceTemplate.create({
      data: {
        slug,
        name: parsed.data.name,
        description: parsed.data.description,
        category: "free",
        price: 0,
        style: parsed.data.style as Record<string, string>,
        sortOrder: 999,
      },
    })

    await prisma.userTemplate.create({
      data: { userId: session.user.id, templateId: template.id },
    })

    return NextResponse.json({ success: true, template: { id: template.id, slug: template.slug } })
  } catch (err) {
    console.error("[api/templates/import]", err)
    return NextResponse.json({ error: "Error al importar plantilla" }, { status: 500 })
  }
}
