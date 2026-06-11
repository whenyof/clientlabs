// One-off: asigna referralCode/panelToken a filas legacy de la waitlist y
// marca confirmedAt = createdAt (se apuntaron antes del doble opt-in).
// Ejecutar UNA vez tras `prisma db push` y borrar.
import { PrismaClient } from "@prisma/client"
import { generateReferralCode, generatePanelToken, isUniqueConstraintError, TOKEN_MAX_RETRIES } from "../lib/waitlist/tokens"

const prisma = new PrismaClient()

async function main() {
  const legacy = await prisma.waitlistEntry.findMany({
    where: { OR: [{ referralCode: null }, { panelToken: null }, { confirmedAt: null }] },
    select: { id: true, email: true, referralCode: true, panelToken: true, confirmedAt: true, createdAt: true },
  })
  console.log(`Filas a backfillear: ${legacy.length}`)

  let ok = 0
  for (const row of legacy) {
    for (let attempt = 0; attempt < TOKEN_MAX_RETRIES; attempt++) {
      try {
        await prisma.waitlistEntry.update({
          where: { id: row.id },
          data: {
            referralCode: row.referralCode ?? generateReferralCode(),
            panelToken: row.panelToken ?? generatePanelToken(),
            confirmedAt: row.confirmedAt ?? row.createdAt,
          },
        })
        ok++
        break
      } catch (err) {
        if (isUniqueConstraintError(err)) continue
        throw err
      }
    }
  }
  console.log(`Backfill completado: ${ok}/${legacy.length}`)
}

main().finally(() => prisma.$disconnect())
