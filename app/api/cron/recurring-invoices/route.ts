export const dynamic = "force-dynamic"
export const maxDuration = 60
import { NextRequest, NextResponse } from "next/server"

/**
 * Cron de facturas recurrentes — DESACTIVADO en esta fase.
 *
 * En esta fase la generación es SOLO manual on-demand ("Generar ahora" en la UI,
 * POST /api/billing/recurring/[id]/generate). No hay auto-generación ni
 * auto-emisión por cron.
 *
 * Para reactivarlo en el futuro, reutilizar la MISMA lógica que el endpoint de
 * generación manual:
 *   - filtrar plantillas con status ACTIVE y nextRunDate <= now
 *   - por cada una, invoiceService.createInvoice(...) → BORRADOR (nunca emitir aquí)
 *   - avanzar con computeNextRunDate (modules/invoicing/utils/recurringSchedule)
 *     e incrementar generatedCount / lastGeneratedAt; marcar ENDED si supera endDate
 * La emisión a Verifactu debe seguir siendo un paso aparte y revisable.
 */
export async function GET(request: NextRequest) {
  const authHeader = request.headers.get("authorization")
  const cronSecret = process.env.CRON_SECRET
  if (!cronSecret) {
    return NextResponse.json({ error: "Not configured" }, { status: 503 })
  }
  if (authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  // Desactivado a propósito: la generación es manual en esta fase.
  return NextResponse.json({ ok: true, disabled: true, processed: 0, created: 0 })
}
