export const dynamic = "force-dynamic"
export const maxDuration = 60
import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { sendEmail } from "@/lib/email"
import { recurringDraftReadyEmail } from "@/lib/email-templates"
import { generateDraftFromRecurring, type GenerateDraftResult } from "@/modules/invoicing/services/recurring.service"

/**
 * Cron de facturas recurrentes — auto-genera BORRADORES en la fecha programada.
 *
 * PRINCIPIO: NUNCA emite. Solo crea facturas en BORRADOR reutilizando el MISMO
 * servicio que el botón "Generar ahora" (generateDraftFromRecurring). El dueño
 * revisa y emite a mano. No toca Verifactu ni la numeración fiscal.
 *
 * - "hoy" se calcula en Europe/Madrid para que el día programado cuadre.
 * - Idempotente: el servicio avanza nextRunDate con guarda condicional, así que un
 *   reintento o ejecución solapada NO duplica el borrador; y un segundo disparo el
 *   mismo día no vuelve a seleccionar la plantilla (su nextRunDate ya es futura).
 * - Sin backfill: si nextRunDate quedó atrasada, genera UN borrador y salta a la
 *   próxima ocurrencia posterior a hoy.
 */

/** Email best-effort al DUEÑO con enlace al borrador para revisar/emitir. */
async function notifyOwner(userId: string, res: Extract<GenerateDraftResult, { ok: true }>): Promise<void> {
  const user = await prisma.user.findUnique({ where: { id: userId }, select: { email: true, name: true } })
  if (!user?.email) return
  // Base URL desde env (el cron no tiene request). Fallback al dominio real de prod
  // (clientlabs.io), NUNCA localhost. Confirmar NEXT_PUBLIC_APP_URL en Vercel.
  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "https://clientlabs.io"
  // Deep-link: abre ese borrador en el drawer (InvoiceView lee ?invoice=<id>).
  const link = `${appUrl}/dashboard/finance/invoicing?invoice=${res.invoiceId}`
  const totalFmt = res.total.toLocaleString("es-ES", { style: "currency", currency: "EUR" })
  const html = recurringDraftReadyEmail({ clientName: res.clientName, totalFmt, invoiceUrl: link, businessName: user.name })
  await sendEmail(user.email, "Factura recurrente en borrador lista para emitir", html)
}

export async function GET(request: NextRequest) {
  const authHeader = request.headers.get("authorization")
  const cronSecret = process.env.CRON_SECRET
  if (!cronSecret) return NextResponse.json({ error: "Not configured" }, { status: 503 })
  if (authHeader !== `Bearer ${cronSecret}`) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  // "Hoy" en Europe/Madrid → umbrales en UTC (nextRunDate se guarda como medianoche UTC).
  const madridYMD = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Europe/Madrid", year: "numeric", month: "2-digit", day: "2-digit",
  }).format(new Date())
  const endOfToday = new Date(`${madridYMD}T23:59:59.999Z`)
  const startOfToday = new Date(`${madridYMD}T00:00:00.000Z`)

  const due = await prisma.recurringInvoice.findMany({
    where: {
      status: "ACTIVE",
      nextRunDate: { lte: endOfToday },
      startDate: { lte: endOfToday },
      OR: [{ endDate: null }, { endDate: { gte: startOfToday } }],
    },
    select: { id: true, userId: true },
    take: 300,
  })

  let processed = 0
  let generated = 0
  let failed = 0
  for (const r of due) {
    processed++
    try {
      // advanceAfter = fin de hoy → salta a la próxima ocurrencia futura (sin volcar atrasos).
      const res = await generateDraftFromRecurring(r.id, r.userId, { advanceAfter: endOfToday })
      if (!res.ok) {
        // "claimed" = otra ejecución ya la generó (idempotencia): ni error ni duplicado.
        if (res.reason !== "claimed") {
          failed++
          console.error("[cron/recurring-invoices] no generada", r.id, res.reason)
        }
        continue
      }
      generated++
      // Email best-effort: su fallo NO rompe el cron ni revierte el borrador.
      await notifyOwner(r.userId, res).catch((e) => console.error("[cron/recurring-invoices] email fallo", r.id, e))
    } catch (e) {
      failed++
      console.error("[cron/recurring-invoices] error", r.id, e)
    }
  }

  return NextResponse.json({ ok: true, processed, generated, failed })
}
