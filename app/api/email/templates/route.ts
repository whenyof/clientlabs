export const maxDuration = 10

import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { z } from "zod"
import { gateFeature } from "@/lib/api-gate"

const SYSTEM_TEMPLATES = [
  {
    id: "sys-welcome",
    name: "Bienvenida",
    description: "Email de bienvenida para nuevos clientes",
    subject: "Bienvenido/a, {{nombre}} 👋",
    category: "bienvenida",
    isDefault: true,
    htmlContent: `<h2>¡Hola, {{nombre}}!</h2><p>Nos alegra mucho tenerte con nosotros.</p><p>Somos <strong>{{negocio}}</strong> y estamos aquí para ayudarte en todo lo que necesites.</p><p>Si tienes cualquier pregunta, responde a este email y te atendemos encantados.</p><p>Un saludo,<br>El equipo de {{negocio}}</p>`,
  },
  {
    id: "sys-promo",
    name: "Promoción",
    description: "Anuncia una oferta o descuento especial",
    subject: "🎉 Oferta especial para ti, {{nombre}}",
    category: "promo",
    isDefault: true,
    htmlContent: `<h2>Tenemos algo especial para ti</h2><p>Hola {{nombre}},</p><p>Esta semana tenemos una oferta exclusiva que no querrás perderte.</p><p><strong>[Describe tu oferta aquí — beneficio principal primero, precio después]</strong></p><p>Esta oferta es válida hasta el <strong>[fecha]</strong>. No dejes que se te escape.</p><p>Un saludo,<br>{{usuario.nombre}}</p>`,
  },
  {
    id: "sys-followup",
    name: "Seguimiento de lead",
    description: "Seguimiento tras primer contacto",
    subject: "Seguimos en contacto, {{nombre}}",
    category: "seguimiento",
    isDefault: true,
    htmlContent: `<p>Hola {{nombre}},</p><p>Me pongo en contacto contigo para hacer seguimiento de nuestra conversación anterior.</p><p>¿Tienes alguna pregunta que pueda responderte? Estoy a tu disposición para cualquier duda.</p><p>Quedo atento/a a tu respuesta.</p><p>Un saludo,<br>{{usuario.nombre}}</p>`,
  },
  {
    id: "sys-newsletter",
    name: "Newsletter mensual",
    description: "Plantilla de newsletter mensual",
    subject: "📰 Noticias de {{negocio}} — [Mes]",
    category: "newsletter",
    isDefault: true,
    htmlContent: `<h1>Novedades de [Mes]</h1><p>Hola {{nombre}},</p><h2>🚀 Novedades del mes</h2><p>[Escribe aquí las novedades principales de este mes]</p><h2>💡 Consejo del mes</h2><p>[Comparte un consejo útil para tu audiencia]</p><h2>📅 Próximos eventos</h2><p>[Menciona próximas fechas o eventos relevantes]</p><p>Hasta el próximo mes,<br>{{negocio}}</p>`,
  },
]

export async function GET() {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) return NextResponse.json({ error: "No autorizado" }, { status: 401 })

  const custom = await prisma.emailTemplate.findMany({
    where: { userId: session.user.id },
    orderBy: [{ usageCount: "desc" }, { createdAt: "desc" }],
    select: {
      id: true, name: true, description: true, subject: true,
      htmlContent: true, category: true, isDefault: true,
      usageCount: true, createdAt: true,
    },
  })

  return NextResponse.json({
    custom,
    system: SYSTEM_TEMPLATES,
  })
}

const CreateSchema = z.object({
  name: z.string().min(1).max(100).trim(),
  description: z.string().max(300).optional(),
  subject: z.string().min(1).max(200).trim(),
  htmlContent: z.string().min(1),
  category: z.string().max(50).optional(),
})

export async function POST(req: NextRequest) {
  const __planGate = await gateFeature("emailMarketing")
  if (!__planGate.allowed) return __planGate.error!
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) return NextResponse.json({ error: "No autorizado" }, { status: 401 })

  const body = await req.json().catch(() => ({}))
  const parsed = CreateSchema.safeParse(body)
  if (!parsed.success) return NextResponse.json({ error: "Datos inválidos" }, { status: 400 })

  const template = await prisma.emailTemplate.create({
    data: { userId: session.user.id, ...parsed.data },
  })

  return NextResponse.json({ template }, { status: 201 })
}
