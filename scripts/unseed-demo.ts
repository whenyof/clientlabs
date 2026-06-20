/**
 * Teardown for scripts/seed-demo.ts. Deletes EXACTLY the demo seed of
 * iyanrimada5@gmail.com — every row whose id starts with `seeddemo_` (and that
 * belongs to this user). Pre-launch cleanup. Pure DELETEs.
 *
 *   npx tsx scripts/unseed-demo.ts
 */
import { PrismaClient } from "@prisma/client"
import { readFileSync } from "fs"
import { resolve } from "path"

function loadEnv(file: string) {
  try {
    for (const line of readFileSync(resolve(process.cwd(), file), "utf8").split("\n")) {
      const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/)
      if (m && !process.env[m[1]]) process.env[m[1]] = m[2].replace(/^["']|["']$/g, "")
    }
  } catch {}
}
loadEnv(".env.local"); loadEnv(".env")

const DB = process.env.DIRECT_DATABASE_URL || process.env.DATABASE_URL
if (!DB) throw new Error("No DIRECT_DATABASE_URL / DATABASE_URL")
const prisma = new PrismaClient({ datasources: { db: { url: DB } } })

const EMAIL = "iyanrimada5@gmail.com"
const PFX = "seeddemo_"

async function main() {
  const user = await prisma.user.findUnique({ where: { email: EMAIL }, select: { id: true } })
  if (!user) throw new Error(`Usuario ${EMAIL} no encontrado`)
  const userId = user.id
  const W = { userId, id: { startsWith: PFX } }
  const removed: Record<string, number> = {}
  const log = (k: string, r: { count: number }) => (removed[k] = r.count)

  // Orden seguro por FKs (los hijos caen por cascade desde sus padres):
  // invoices (CUSTOMER+VENDOR) -> cascade lines/items/payments/events.
  log("invoices (+líneas/pagos/eventos)", await prisma.invoice.deleteMany({ where: W }))
  // pagos a proveedores (ya sin facturas que los referencien)
  log("providerPayments", await prisma.providerPayment.deleteMany({ where: W }))
  // presupuestos -> cascade items
  log("quotes (+items)", await prisma.quote.deleteMany({ where: W }))
  // recurrentes -> cascade items
  log("recurringInvoices (+items)", await prisma.recurringInvoice.deleteMany({ where: W }))
  // leads
  log("leads", await prisma.lead.deleteMany({ where: W }))
  // clientes (tras facturas/quotes/leads)
  log("clients", await prisma.client.deleteMany({ where: W }))
  // productos
  log("products", await prisma.product.deleteMany({ where: W }))
  // productos de proveedor (por si quedaran) + proveedores (cascade productos)
  log("providerProducts", await prisma.providerProduct.deleteMany({ where: W }))
  log("providers", await prisma.provider.deleteMany({ where: W }))
  // serie
  log("invoiceSeries", await prisma.invoiceSeries.deleteMany({ where: W }))
  // BusinessProfile SOLO si lo creó el seed (id con prefijo)
  log("businessProfile", await prisma.businessProfile.deleteMany({ where: W }))

  console.log("── TEARDOWN (borrados) ──")
  let total = 0
  for (const [k, v] of Object.entries(removed)) { console.log(`  ${k.padEnd(34)} ${v}`); total += v }
  console.log(`\n  Filas borradas directamente: ${total} (los hijos en cascade no se cuentan aquí).`)

  const leftover = await prisma.invoice.count({ where: W })
  console.log(`  Facturas con prefijo restantes: ${leftover} (debe ser 0).`)
}

main()
  .then(() => prisma.$disconnect())
  .catch(async (e) => { console.error(e); await prisma.$disconnect(); process.exit(1) })
