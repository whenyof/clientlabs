export const maxDuration = 10
import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { z } from "zod"

const schema = z.object({ templateId: z.string().min(1) })

export async function PATCH(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) {
    return NextResponse.json({ error: "No autenticado" }, { status: 401 })
  }

  const body = await req.json().catch(() => ({}))
  const parsed = schema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: "templateId requerido" }, { status: 400 })
  }

  const { templateId } = parsed.data

  try {
    const template = await prisma.invoiceTemplate.findUnique({ where: { id: templateId }, select: { id: true, category: true } })
    if (!template) {
      return NextResponse.json({ error: "Plantilla no encontrada" }, { status: 404 })
    }

    if (template.category === "premium") {
      const owned = await prisma.userTemplate.findUnique({
        where: { userId_templateId: { userId: session.user.id, templateId } },
      })
      if (!owned) {
        return NextResponse.json({ error: "No tienes acceso a esta plantilla" }, { status: 403 })
      }
    }

    await prisma.businessProfile.upsert({
      where: { userId: session.user.id },
      update: { activeTemplateId: templateId },
      create: { userId: session.user.id, sector: "general", activeTemplateId: templateId },
    })

    return NextResponse.json({ success: true })
  } catch (err) {
    console.error("[api/templates/activate]", err)
    return NextResponse.json({ error: "Error al activar plantilla" }, { status: 500 })
  }
}
