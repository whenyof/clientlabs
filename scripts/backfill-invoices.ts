/**
 * Backfill de facturas (Invoice) desde ventas (Sale) que aún no tienen una.
 *
 * El GET de /api/invoicing ya NO hace este backfill (es de solo lectura). Las
 * ventas crean su factura en el origen; este script cubre datos legacy o
 * reparaciones puntuales. backfillInvoicesFromSales es idempotente: salta las
 * ventas que ya tienen factura, así que es seguro re-ejecutarlo.
 *
 * Uso:
 *   npm run backfill-invoices                # todos los usuarios
 *   npm run backfill-invoices -- <userId>    # solo un usuario
 *   npx tsx --tsconfig scripts/tsconfig.json scripts/backfill-invoices.ts <userId>
 */

import "dotenv/config"
import { prisma } from "@/lib/prisma"
import { backfillInvoicesFromSales } from "@/modules/invoicing/services/invoice.service"

async function main() {
  const argUserId = process.argv[2]?.trim()

  const userIds = argUserId
    ? [argUserId]
    : (
        await prisma.user.findMany({ select: { id: true } })
      ).map((u) => u.id)

  console.log(
    argUserId
      ? `Backfill de facturas para el usuario ${argUserId}...`
      : `Backfill de facturas para ${userIds.length} usuarios...`,
  )

  let totalCreated = 0
  let usersWithCreations = 0

  for (const userId of userIds) {
    try {
      const created = await backfillInvoicesFromSales(userId)
      if (created > 0) {
        usersWithCreations++
        totalCreated += created
        console.log(`  ${userId}: ${created} factura(s) creada(s)`)
      }
    } catch (e) {
      console.error(`  ${userId}: fallo en el backfill`, e)
    }
  }

  console.log("-----------------------------------")
  console.log(`Usuarios revisados:        ${userIds.length}`)
  console.log(`Usuarios con altas:        ${usersWithCreations}`)
  console.log(`Facturas creadas (total):  ${totalCreated}`)
  console.log("-----------------------------------")
}

main()
  .catch((e) => {
    console.error("Error fatal en backfill-invoices:", e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
