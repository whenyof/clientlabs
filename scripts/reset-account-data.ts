/**
 * reset-account-data.ts
 *
 * Limpia los datos transaccionales de CRM + finanzas de UNA cuenta y deja
 * un único lead, un único cliente y un único proveedor de ejemplo.
 *
 * BORRA (solo de la cuenta indicada):
 *   - Facturas (+ líneas, items, pagos, eventos, recordatorios)
 *   - Presupuestos / Albaranes / Pedidos de cliente (+ sus líneas)
 *   - Facturas de suscripción internas (BillingInvoice + items/pagos)
 *   - Ventas y transacciones financieras (ClientSale, Sale, Transaction)
 *   - Proveedores (+ todo su subárbol: pedidos, pagos, productos, notas, etc.)
 *   - Clientes (+ perfiles de pago)
 *   - Leads (+ todo su subárbol: actividades, scores, alertas, etc.)
 *
 * NO TOCA: usuario, plan, suscripción, perfil de empresa, API keys, websites,
 * series de facturación, presupuestos de gasto, objetivos ni configuración.
 *
 * Uso:
 *   DRY_RUN=1 npx tsx scripts/reset-account-data.ts iyanrimada5@gmail.com   # inventario, no borra
 *   npx tsx scripts/reset-account-data.ts iyanrimada5@gmail.com             # ejecuta el borrado
 */
import { PrismaClient } from "@prisma/client"

const prisma = new PrismaClient()

const email = (process.argv[2] || "iyanrimada5@gmail.com").trim().toLowerCase()
const DRY_RUN = process.env.DRY_RUN === "1"

async function main() {
  const user = await prisma.user.findFirst({
    where: { email: { equals: email, mode: "insensitive" } },
    select: { id: true, email: true, name: true },
  })

  if (!user) {
    console.error(`✗ No existe ninguna cuenta con email "${email}".`)
    const similar = await prisma.user.findMany({
      where: { email: { contains: "iyanrimada", mode: "insensitive" } },
      select: { email: true },
    })
    console.error(
      similar.length
        ? `  Cuentas parecidas encontradas: ${similar.map((u) => u.email).join(", ")}`
        : "  No hay cuentas que contengan 'iyanrimada'.",
    )
    process.exitCode = 1
    return
  }

  const userId = user.id
  console.log(`Cuenta: ${user.email} (${user.name ?? "sin nombre"}) — id ${userId}`)

  // ── Inventario ──
  const [
    invoices, quotes, deliveryNotes, purchaseOrders, billingInvoices,
    clientSales, sales, transactions, providers, clients, leads,
  ] = await Promise.all([
    prisma.invoice.count({ where: { userId } }),
    prisma.quote.count({ where: { userId } }),
    prisma.deliveryNote.count({ where: { userId } }),
    prisma.purchaseOrder.count({ where: { userId } }),
    prisma.billingInvoice.count({ where: { userId } }),
    prisma.clientSale.count({ where: { userId } }),
    prisma.sale.count({ where: { userId } }),
    prisma.transaction.count({ where: { userId } }),
    prisma.provider.count({ where: { userId } }),
    prisma.client.count({ where: { userId } }),
    prisma.lead.count({ where: { userId } }),
  ])

  console.log("\nInventario actual:")
  console.table({
    facturas: invoices, presupuestos: quotes, albaranes: deliveryNotes,
    pedidos: purchaseOrders, facturasSuscripcion: billingInvoices,
    clientSales, ventas: sales, transacciones: transactions,
    proveedores: providers, clientes: clients, leads,
  })

  if (DRY_RUN) {
    console.log("\nDRY_RUN=1 → no se ha borrado nada.")
    return
  }

  // ── Borrado en orden hijo→padre, atómico ──
  console.log("\nBorrando...")
  const result = await prisma.$transaction(
    [
      prisma.invoice.deleteMany({ where: { userId } }),
      prisma.quote.deleteMany({ where: { userId } }),
      prisma.deliveryNote.deleteMany({ where: { userId } }),
      prisma.purchaseOrder.deleteMany({ where: { userId } }),
      prisma.billingInvoice.deleteMany({ where: { userId } }),
      prisma.transaction.deleteMany({ where: { userId } }),
      prisma.clientSale.deleteMany({ where: { userId } }),
      prisma.sale.deleteMany({ where: { userId } }),
      prisma.provider.deleteMany({ where: { userId } }),
      prisma.client.deleteMany({ where: { userId } }),
      prisma.lead.deleteMany({ where: { userId } }),
    ],
    { timeout: 30_000 },
  )

  const labels = [
    "facturas", "presupuestos", "albaranes", "pedidos", "facturasSuscripcion",
    "transacciones", "clientSales", "ventas", "proveedores", "clientes", "leads",
  ]
  console.log("Borrados:")
  console.table(Object.fromEntries(labels.map((l, i) => [l, result[i].count])))

  // ── Crear un ejemplo de cada ──
  const [lead, client, provider] = await prisma.$transaction([
    prisma.lead.create({
      data: {
        userId,
        name: "Lead de ejemplo",
        email: "lead.ejemplo@clientlabs.io",
        phone: "+34 600 000 001",
        source: "MANUAL",
        notes: "Registro de ejemplo creado tras el reset de la cuenta.",
      },
      select: { id: true, name: true },
    }),
    prisma.client.create({
      data: {
        userId,
        name: "Cliente de ejemplo",
        email: "cliente.ejemplo@clientlabs.io",
        phone: "+34 600 000 002",
        status: "ACTIVE",
        notes: "Registro de ejemplo creado tras el reset de la cuenta.",
      },
      select: { id: true, name: true },
    }),
    prisma.provider.create({
      data: {
        userId,
        name: "Proveedor de ejemplo",
        contactEmail: "proveedor.ejemplo@clientlabs.io",
        contactPhone: "+34 600 000 003",
        notes: "Registro de ejemplo creado tras el reset de la cuenta.",
      },
      select: { id: true, name: true },
    }),
  ])

  console.log("\nCreados de ejemplo:")
  console.table({ lead: lead.name, cliente: client.name, proveedor: provider.name })
  console.log("\n✓ Reset completado.")
}

main()
  .catch((e) => {
    console.error("✗ Error en el reset:", e)
    process.exitCode = 1
  })
  .finally(() => prisma.$disconnect())
