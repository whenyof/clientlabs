export const maxDuration = 30
import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { stripe, getPriceId } from "@/lib/stripe"
import { z } from "zod"

const schema = z.object({
  plan: z.enum(["STARTER", "PRO", "BUSINESS"]),
  period: z.enum(["monthly", "yearly"]),
})

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) {
    return NextResponse.json({ error: "No autenticado" }, { status: 401 })
  }

  const body = await req.json().catch(() => ({}))
  const parsed = schema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: "plan y period son requeridos" }, { status: 400 })
  }

  const { plan, period } = parsed.data

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { stripeSubscriptionId: true },
  })

  if (!user?.stripeSubscriptionId) {
    return NextResponse.json({ error: "Sin suscripción activa" }, { status: 400 })
  }

  try {
    const priceId = getPriceId(plan, period)
    const subscription = await stripe.subscriptions.retrieve(user.stripeSubscriptionId)
    const itemId = subscription.items.data[0]?.id

    if (!itemId) {
      return NextResponse.json({ error: "Suscripción sin items" }, { status: 400 })
    }

    await stripe.subscriptions.update(user.stripeSubscriptionId, {
      items: [{ id: itemId, price: priceId }],
      proration_behavior: "none",
    })

    return NextResponse.json({ success: true })
  } catch (err) {
    const message = err instanceof Error ? err.message : "Error al cambiar el plan"
    console.error("[stripe/change-plan]", message)
    return NextResponse.json({ error: "No se pudo cambiar el plan. Inténtalo de nuevo." }, { status: 500 })
  }
}
