/**
 * Script de datos de demo para iyanrimada5@gmail.com
 * Ejecutar: npx tsx prisma/seed-demo.ts
 */

import { PrismaClient, LeadStatus, InvoiceStatus, TaskPriority, TaskStatus, TaskType } from "@prisma/client"
import { randomUUID } from "crypto"

const prisma = new PrismaClient()

function uid() { return randomUUID() }

function daysAgo(n: number) {
  const d = new Date()
  d.setDate(d.getDate() - n)
  return d
}

function daysFromNow(n: number) {
  const d = new Date()
  d.setDate(d.getDate() + n)
  return d
}

async function main() {
  const user = await prisma.user.findUnique({
    where: { email: "iyanrimada5@gmail.com" },
    select: { id: true, name: true },
  })
  if (!user) throw new Error("Usuario no encontrado: iyanrimada5@gmail.com")
  console.log(`✓ Usuario encontrado: ${user.name} (${user.id})`)
  const userId = user.id

  // ─── CLIENTES ─────────────────────────────────────────────────────────────

  const clientsData = [
    { name: "Grupo Nexum SL", email: "hola@nexum.es", phone: "+34 91 234 56 78", status: "ACTIVE", companyName: "Grupo Nexum SL" },
    { name: "Creativos Del Sur", email: "info@creativosdelsur.com", phone: "+34 95 876 54 32", status: "ACTIVE", companyName: "Creativos Del Sur SL" },
    { name: "TechVentures Madrid", email: "contacto@techventures.es", phone: "+34 91 555 12 34", status: "ACTIVE", companyName: "TechVentures Madrid" },
    { name: "Florencia Vega", email: "florencia@florenciavega.com", phone: "+34 666 123 456", status: "ACTIVE" },
    { name: "Estudio Forma", email: "hola@estudioforma.es", phone: "+34 93 456 78 90", status: "ACTIVE", companyName: "Estudio Forma SL" },
  ]

  const clients = []
  for (const c of clientsData) {
    const existing = await prisma.client.findFirst({ where: { userId, email: c.email } })
    if (existing) {
      clients.push(existing)
      console.log(`  · Cliente ya existe: ${c.name}`)
    } else {
      const created = await prisma.client.create({
        data: { id: uid(), userId, ...c, createdAt: daysAgo(Math.floor(Math.random() * 90) + 30), updatedAt: new Date() },
      })
      clients.push(created)
      console.log(`  + Cliente creado: ${c.name}`)
    }
  }

  // ─── LEADS ────────────────────────────────────────────────────────────────

  const leadsData: Array<{
    name: string; email: string; phone?: string
    leadStatus: LeadStatus; source: string; message?: string; daysAgo_: number
  }> = [
    { name: "Carlos Mendoza", email: "carlos.mendoza@email.com", phone: "+34 612 345 678", leadStatus: "NEW", source: "WEB", message: "Interesado en diseño de marca y packaging", daysAgo_: 1 },
    { name: "Ana Ruiz García", email: "ana.ruiz@empresa.es", phone: "+34 655 234 567", leadStatus: "NEW", source: "INSTAGRAM", message: "Me ha llegado vuestro portfolio, me encanta el estilo", daysAgo_: 2 },
    { name: "Marco Ferretti", email: "marco@ferretti-import.it", phone: "+34 698 765 432", leadStatus: "NEW", source: "REFERRAL", daysAgo_: 3 },
    { name: "Lucía Sánchez", email: "lucia@decorarte.com", phone: "+34 677 123 456", leadStatus: "CONTACTED", source: "WEB", message: "Necesito rediseño web completo + branding", daysAgo_: 5 },
    { name: "Pedro Alonso Vega", email: "pedro@alonsovega.es", phone: "+34 666 987 654", leadStatus: "CONTACTED", source: "LINKEDIN", daysAgo_: 6 },
    { name: "Sandra Morales", email: "s.morales@grupomorales.com", phone: "+34 634 567 890", leadStatus: "CONTACTED", source: "WEB", message: "Proyecto de app mobile para hostelería", daysAgo_: 8 },
    { name: "Alberto Cisneros", email: "alberto@cisneros-law.es", phone: "+34 611 222 333", leadStatus: "QUALIFIED", source: "REFERRAL", message: "Recomendación de Florencia, necesita identidad corporativa", daysAgo_: 12 },
    { name: "Inma Delgado", email: "inma@inmaDelgado.com", phone: "+34 687 654 321", leadStatus: "QUALIFIED", source: "WEB", message: "E-commerce de moda, presupuesto 8000€-15000€", daysAgo_: 14 },
    { name: "Javier Romero", email: "javier.romero@startuptech.es", phone: "+34 645 321 987", leadStatus: "QUALIFIED", source: "INSTAGRAM", daysAgo_: 16 },
    { name: "María Castellano", email: "maria@castellano-arquitectos.com", phone: "+34 633 111 222", leadStatus: "CONVERTED", source: "REFERRAL", message: "Proyecto completo de comunicación corporativa", daysAgo_: 25 },
    { name: "David Nieto Pons", email: "david@nietodesign.es", phone: "+34 612 988 765", leadStatus: "CONVERTED", source: "WEB", daysAgo_: 30 },
    { name: "Elena Torres", email: "elena@torresrestauracion.es", phone: "+34 698 234 567", leadStatus: "CONVERTED", source: "LINKEDIN", daysAgo_: 35 },
    { name: "Roberto Fuentes", email: "roberto@fuentes.co", phone: "+34 677 456 789", leadStatus: "LOST", source: "WEB", message: "Decidió trabajar con otro estudio por precio", daysAgo_: 20 },
    { name: "Patricia Vidal", email: "patricia@vidalconsulting.es", phone: "+34 655 789 012", leadStatus: "LOST", source: "INSTAGRAM", daysAgo_: 22 },
  ]

  for (const l of leadsData) {
    const existing = await prisma.lead.findFirst({ where: { userId, email: l.email } })
    if (existing) {
      console.log(`  · Lead ya existe: ${l.name}`)
      continue
    }
    const createdAt = daysAgo(l.daysAgo_)
    await prisma.lead.create({
      data: {
        id: uid(),
        userId,
        name: l.name,
        email: l.email,
        phone: l.phone,
        message: l.message,
        source: l.source,
        leadStatus: l.leadStatus,
        status: l.leadStatus,
        priority: "MEDIUM",
        converted: l.leadStatus === "CONVERTED",
        convertedAt: l.leadStatus === "CONVERTED" ? daysAgo(l.daysAgo_ - 5) : null,
        createdAt,
        updatedAt: new Date(),
      },
    })
    console.log(`  + Lead creado: ${l.name} (${l.leadStatus})`)
  }

  // ─── FACTURAS ─────────────────────────────────────────────────────────────

  const now = new Date()
  const thisMonth = now.getMonth()
  const thisYear = now.getFullYear()

  const invoicesData = [
    // Este mes — PAID (cuentan en facturado)
    { clientIdx: 0, number: "2026-041", total: 3200, subtotal: 2644.63, tax: 555.37, status: "PAID" as InvoiceStatus, daysAgoIssue: 20, daysAgodue: 10, paidDaysAgo: 5 },
    { clientIdx: 1, number: "2026-042", total: 1850, subtotal: 1528.93, tax: 321.07, status: "PAID" as InvoiceStatus, daysAgoIssue: 15, daysAgodue: 5, paidDaysAgo: 2 },
    { clientIdx: 2, number: "2026-043", total: 5500, subtotal: 4545.45, tax: 954.55, status: "PAID" as InvoiceStatus, daysAgoIssue: 10, daysAgodue: 0, paidDaysAgo: 1 },
    // Este mes — SENT (cuentan en facturado y pendiente)
    { clientIdx: 3, number: "2026-044", total: 2100, subtotal: 1735.54, tax: 364.46, status: "SENT" as InvoiceStatus, daysAgoIssue: 8, daysAgodue: 22, paidDaysAgo: null },
    { clientIdx: 4, number: "2026-045", total: 4800, subtotal: 3966.94, tax: 833.06, status: "SENT" as InvoiceStatus, daysAgoIssue: 5, daysAgodue: 25, paidDaysAgo: null },
    // Este mes — OVERDUE
    { clientIdx: 0, number: "2026-046", total: 1200, subtotal: 991.74, tax: 208.26, status: "OVERDUE" as InvoiceStatus, daysAgoIssue: 35, daysAgodue: 5, paidDaysAgo: null },
    // Mes anterior — PAID (van al mes anterior para la comparación)
    { clientIdx: 1, number: "2026-031", total: 2800, subtotal: 2314.05, tax: 485.95, status: "PAID" as InvoiceStatus, daysAgoIssue: 45, daysAgodue: 35, paidDaysAgo: 30, prevMonth: true },
    { clientIdx: 2, number: "2026-032", total: 1600, subtotal: 1322.31, tax: 277.69, status: "PAID" as InvoiceStatus, daysAgoIssue: 50, daysAgodue: 40, paidDaysAgo: 35, prevMonth: true },
    { clientIdx: 3, number: "2026-033", total: 3900, subtotal: 3223.14, tax: 676.86, status: "PAID" as InvoiceStatus, daysAgoIssue: 55, daysAgodue: 45, paidDaysAgo: 40, prevMonth: true },
  ]

  for (const inv of invoicesData) {
    const existing = await prisma.invoice.findFirst({ where: { userId, number: inv.number } })
    if (existing) {
      console.log(`  · Factura ya existe: ${inv.number}`)
      continue
    }
    const issueDate = daysAgo(inv.daysAgoIssue)
    const dueDate = daysFromNow(30 - inv.daysAgoIssue) // 30 days from issue
    const dueDateActual = new Date(issueDate); dueDateActual.setDate(dueDateActual.getDate() + 30)
    const paidAt = inv.paidDaysAgo !== null ? daysAgo(inv.paidDaysAgo) : null
    const client = clients[inv.clientIdx]

    await prisma.invoice.create({
      data: {
        id: uid(),
        userId,
        clientId: client.id,
        number: inv.number,
        series: "2026",
        issueDate,
        dueDate: dueDateActual,
        subtotal: inv.subtotal,
        taxAmount: inv.tax,
        total: inv.total,
        status: inv.status,
        paidAt,
        type: "CUSTOMER",
        currency: "EUR",
        createdAt: issueDate,
        updatedAt: new Date(),
      },
    })
    console.log(`  + Factura creada: ${inv.number} (${inv.status}, ${inv.total}€)`)
  }

  // ─── VENTAS (Sale model — finance panel reads from here) ──────────────────

  const salesData: Array<{
    clientIdx: number; total: number; status: string; daysAgoSale: number; concept: string
  }> = [
    // Este mes — PAID
    { clientIdx: 0, total: 3200, status: "PAID", daysAgoSale: 20, concept: "Proyecto identidad corporativa Grupo Nexum" },
    { clientIdx: 1, total: 1850, status: "PAID", daysAgoSale: 15, concept: "Diseño web Creativos del Sur" },
    { clientIdx: 2, total: 5500, status: "PAID", daysAgoSale: 10, concept: "Branding completo TechVentures Madrid" },
    // Este mes — pendiente cobro
    { clientIdx: 3, total: 2100, status: "PENDING", daysAgoSale: 8, concept: "Diseño packaging Florencia Vega" },
    { clientIdx: 4, total: 4800, status: "PENDING", daysAgoSale: 5, concept: "Rediseño web Estudio Forma" },
    // Mes anterior — PAID
    { clientIdx: 1, total: 2800, status: "PAID", daysAgoSale: 45, concept: "Materiales campaña Creativos del Sur" },
    { clientIdx: 2, total: 1600, status: "PAID", daysAgoSale: 50, concept: "Motion graphics TechVentures" },
    { clientIdx: 3, total: 3900, status: "PAID", daysAgoSale: 55, concept: "Fotografía producto Florencia Vega" },
  ]

  for (const s of salesData) {
    const client = clients[s.clientIdx]
    const saleDate = daysAgo(s.daysAgoSale)
    const existing = await prisma.sale.findFirst({
      where: { userId, clientId: client.id, saleDate, total: s.total },
    })
    if (existing) {
      console.log(`  · Venta ya existe: ${s.concept.substring(0, 40)}`)
      continue
    }
    await prisma.sale.create({
      data: {
        id: uid(),
        userId,
        clientId: client.id,
        clientName: client.name ?? "",
        clientEmail: client.email ?? undefined,
        subtotal: Math.round((s.total / 1.21) * 100) / 100,
        taxTotal: Math.round((s.total - s.total / 1.21) * 100) / 100,
        total: s.total,
        discount: 0,
        paymentMethod: "TRANSFERENCIA",
        status: s.status,
        saleDate,
        notes: s.concept,
        createdAt: saleDate,
        updatedAt: new Date(),
      },
    })
    console.log(`  + Venta creada: ${s.concept.substring(0, 45)} (${s.status}, ${s.total}€)`)
  }

  // ─── TAREAS ────────────────────────────────────────────────────────────────

  const tasksData: Array<{
    title: string; priority: TaskPriority; status: TaskStatus; type: TaskType; dueDaysFromNow: number
  }> = [
    { title: "Llamar a Alberto Cisneros para cerrar presupuesto", priority: "URGENT", status: "PENDING", type: "CALL", dueDaysFromNow: 0 },
    { title: "Enviar propuesta diseño web a Inma Delgado", priority: "HIGH", status: "PENDING", type: "EMAIL", dueDaysFromNow: 1 },
    { title: "Reunión kickoff proyecto Grupo Nexum", priority: "HIGH", status: "PENDING", type: "MEETING", dueDaysFromNow: 2 },
    { title: "Revisar y aprobar identidad corporativa Creativos del Sur", priority: "HIGH", status: "IN_PROGRESS", type: "MANUAL", dueDaysFromNow: 3 },
    { title: "Follow-up leads Instagram esta semana", priority: "MEDIUM", status: "PENDING", type: "EMAIL", dueDaysFromNow: 1 },
    { title: "Preparar factura mes de mayo para TechVentures", priority: "MEDIUM", status: "PENDING", type: "MANUAL", dueDaysFromNow: 5 },
    { title: "Actualizar portfolio con proyectos Q1 2026", priority: "LOW", status: "PENDING", type: "MANUAL", dueDaysFromNow: 14 },
    // Atrasada
    { title: "Seguimiento presupuesto Sandra Morales (sin respuesta)", priority: "HIGH", status: "PENDING", type: "CALL", dueDaysFromNow: -3 },
  ]

  for (const t of tasksData) {
    const existing = await prisma.task.findFirst({ where: { userId, title: t.title } })
    if (existing) {
      console.log(`  · Tarea ya existe: ${t.title.substring(0, 40)}`)
      continue
    }
    await prisma.task.create({
      data: {
        id: uid(),
        userId,
        title: t.title,
        priority: t.priority,
        status: t.status,
        type: t.type,
        dueDate: daysFromNow(t.dueDaysFromNow),
        createdAt: daysAgo(5),
        updatedAt: new Date(),
      },
    })
    console.log(`  + Tarea creada: ${t.title.substring(0, 50)} (${t.priority})`)
  }

  console.log("\n✅ Seed completado con éxito")
  console.log("\nResumen:")
  const totalLeads = await prisma.lead.count({ where: { userId } })
  const totalClients = await prisma.client.count({ where: { userId } })
  const totalInvoices = await prisma.invoice.count({ where: { userId } })
  const totalTasks = await prisma.task.count({ where: { userId } })
  const totalSales = await prisma.sale.count({ where: { userId } })
  console.log(`  · Leads:    ${totalLeads}`)
  console.log(`  · Clientes: ${totalClients}`)
  console.log(`  · Facturas: ${totalInvoices}`)
  console.log(`  · Ventas:   ${totalSales}`)
  console.log(`  · Tareas:   ${totalTasks}`)
}

main()
  .catch((e) => { console.error("❌ Error:", e.message); process.exit(1) })
  .finally(() => prisma.$disconnect())
