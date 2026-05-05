export const maxDuration = 10
import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function GET() {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) {
    return NextResponse.json({ error: "No autenticado" }, { status: 401 })
  }

  try {
    const [templates, userTemplates, profile] = await Promise.all([
      prisma.invoiceTemplate.findMany({
        select: { id: true, slug: true, name: true, description: true, category: true, price: true, style: true, isDefault: true, sortOrder: true },
        orderBy: { sortOrder: "asc" },
      }),
      prisma.userTemplate.findMany({
        where: { userId: session.user.id },
        select: { templateId: true },
      }),
      prisma.businessProfile.findUnique({
        where: { userId: session.user.id },
        select: { activeTemplateId: true },
      }),
    ])

    const ownedIds = new Set(userTemplates.map(ut => ut.templateId))

    return NextResponse.json({
      templates: templates.map(t => ({
        ...t,
        owned: t.category === "free" || ownedIds.has(t.id),
      })),
      activeTemplateId: profile?.activeTemplateId ?? null,
    })
  } catch (err) {
    console.error("[api/templates]", err)
    return NextResponse.json({ error: "Error al cargar plantillas" }, { status: 500 })
  }
}
