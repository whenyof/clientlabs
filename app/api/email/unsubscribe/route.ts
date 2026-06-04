export const maxDuration = 10
export const dynamic = "force-dynamic"

import { NextRequest } from "next/server"
import { prisma } from "@/lib/prisma"

const PAGE = (message: string, sub: string) => `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>${message}</title>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
      background: #f9fafb;
      display: flex; align-items: center; justify-content: center;
      min-height: 100vh; padding: 1rem;
    }
    .card {
      background: white; border-radius: 12px; padding: 2.5rem 2rem;
      max-width: 420px; width: 100%; text-align: center;
      box-shadow: 0 1px 3px rgba(0,0,0,.08), 0 4px 16px rgba(0,0,0,.04);
    }
    .icon { font-size: 2.5rem; margin-bottom: 1rem; }
    h1 { font-size: 1.25rem; color: #111827; margin-bottom: .5rem; }
    p { color: #6b7280; font-size: .9375rem; line-height: 1.6; }
    .small { font-size: .8125rem; color: #9ca3af; margin-top: 1.25rem; }
  </style>
</head>
<body>
  <div class="card">
    <div class="icon">✓</div>
    <h1>${message}</h1>
    <p>${sub}</p>
    <p class="small">Si fue un error, puedes volver a suscribirte en cualquier momento desde nuestra web.</p>
  </div>
</body>
</html>`

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl
  const encodedEmail = searchParams.get("e") ?? ""
  const subscriberId = searchParams.get("s") ?? ""
  const campaignId = searchParams.get("c") ?? ""

  const html = (msg: string, sub: string) =>
    new Response(PAGE(msg, sub), { headers: { "Content-Type": "text/html; charset=utf-8" } })

  try {
    // Unsubscribe by subscriber ID (newsletter)
    if (subscriberId) {
      const sub = await prisma.newsletterSubscriber.findUnique({ where: { id: subscriberId } })
      if (!sub) return html("Enlace no válido", "No encontramos tu suscripción.")

      await prisma.newsletterSubscriber.update({
        where: { id: subscriberId },
        data: { activo: false, bajaEn: new Date() },
      })
      await prisma.emailUnsubscribe
        .create({ data: { email: sub.email, subscriberId, campaignId: campaignId || null } })
        .catch(() => {})

      return html("Te has dado de baja correctamente", "Has sido eliminado de nuestra lista. No recibirás más emails de marketing.")
    }

    // Unsubscribe by email (campaign recipients without subscriber record)
    if (encodedEmail) {
      const email = Buffer.from(encodedEmail, "base64").toString("utf8")
      if (!email.includes("@")) return html("Enlace no válido", "El enlace de baja no es válido.")

      await prisma.newsletterSubscriber.updateMany({
        where: { email },
        data: { activo: false, bajaEn: new Date() },
      })
      await prisma.emailUnsubscribe
        .create({ data: { email, campaignId: campaignId || null } })
        .catch(() => {})

      return html("Te has dado de baja correctamente", "Has sido eliminado de nuestra lista. No recibirás más emails de marketing.")
    }

    return html("Enlace no válido", "El enlace de baja no es válido o ya ha caducado.")
  } catch (err) {
    console.error("[email/unsubscribe]", err)
    return html("Ha ocurrido un error", "Inténtalo de nuevo o contáctanos directamente.")
  }
}
