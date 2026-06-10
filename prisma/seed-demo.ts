/**
 * Seed de datos de demo para iyanrimada5@gmail.com
 * Ejecutar: npx tsx prisma/seed-demo.ts
 */

import { PrismaClient, LeadStatus, InvoiceStatus, TaskPriority, TaskStatus, TaskType } from "@prisma/client"
import { randomUUID } from "crypto"

const prisma = new PrismaClient()

const uid = () => randomUUID()

const daysAgo = (n: number) => {
  const d = new Date(); d.setDate(d.getDate() - n); return d
}
const daysFromNow = (n: number) => {
  const d = new Date(); d.setDate(d.getDate() + n); return d
}
// Devuelve primer día del mes offset meses atrás
const monthStart = (offset: number) => {
  const now = new Date()
  return new Date(now.getFullYear(), now.getMonth() - offset, 1)
}
const monthMid = (offset: number) => {
  const now = new Date()
  return new Date(now.getFullYear(), now.getMonth() - offset, 15)
}

async function main() {
  const user = await prisma.user.findUnique({
    where: { email: "iyanrimada5@gmail.com" },
    select: { id: true, name: true },
  })
  if (!user) throw new Error("Usuario no encontrado: iyanrimada5@gmail.com")
  console.log(`\n✓ Usuario: ${user.name} (${user.id})\n`)
  const userId = user.id

  // ── CLIENTES ──────────────────────────────────────────────────────────────────
  console.log("── CLIENTES ──")
  const clientsData = [
    { name: "Grupo Nexum SL",      email: "hola@nexum.es",              phone: "+34 91 234 56 78", companyName: "Grupo Nexum SL",      source: "REFERRAL", totalSpent: 14200 },
    { name: "Creativos Del Sur",   email: "info@creativosdelsur.com",   phone: "+34 95 876 54 32", companyName: "Creativos Del Sur SL", source: "WEB",      totalSpent: 9850  },
    { name: "TechVentures Madrid", email: "contacto@techventures.es",   phone: "+34 91 555 12 34", companyName: "TechVentures Madrid",  source: "LINKEDIN", totalSpent: 22400 },
    { name: "Florencia Vega",      email: "florencia@florenciavega.com",phone: "+34 666 123 456",  companyName: undefined,              source: "INSTAGRAM",totalSpent: 5900  },
    { name: "Estudio Forma",       email: "hola@estudioforma.es",       phone: "+34 93 456 78 90", companyName: "Estudio Forma SL",    source: "WEB",      totalSpent: 7300  },
    { name: "Restaurante Mirador", email: "gestion@miradorrestaurante.es", phone: "+34 91 678 90 12", companyName: "Mirador Madrid SL", source: "REFERRAL", totalSpent: 3600  },
    { name: "Clínica Salud Viva",  email: "admin@saludviva.es",         phone: "+34 93 321 65 43", companyName: "Clínica Salud Viva SL", source: "WEB",    totalSpent: 4100  },
  ]

  const clients: Array<{ id: string; name: string | null; email: string | null }> = []
  for (const c of clientsData) {
    const existing = await prisma.client.findFirst({ where: { userId, email: c.email } })
    if (existing) {
      clients.push(existing)
      console.log(`  · ya existe: ${c.name}`)
    } else {
      const created = await prisma.client.create({
        data: {
          id: uid(), userId,
          name: c.name, email: c.email, phone: c.phone,
          companyName: c.companyName ?? null,
          source: c.source, status: "ACTIVE",
          totalSpent: c.totalSpent,
          riskLevel: "LOW",
          createdAt: daysAgo(Math.floor(Math.random() * 120) + 60),
          updatedAt: new Date(),
        },
      })
      clients.push(created)
      console.log(`  + ${c.name}`)
    }
  }

  // ── LEADS ─────────────────────────────────────────────────────────────────────
  console.log("\n── LEADS ──")
  const leadsData: Array<{
    name: string; email: string; phone?: string
    leadStatus: LeadStatus; source: string; message?: string; daysAgo_: number
    estimatedValue?: number
  }> = [
    { name: "Carlos Mendoza",      email: "carlos.mendoza@email.com",         phone: "+34 612 345 678", leadStatus: "NEW",       source: "WEB",       message: "Interesado en diseño de marca y packaging", daysAgo_: 1,  estimatedValue: 3500 },
    { name: "Ana Ruiz García",     email: "ana.ruiz@empresa.es",              phone: "+34 655 234 567", leadStatus: "NEW",       source: "INSTAGRAM", message: "Me ha llegado vuestro portfolio, me encanta el estilo", daysAgo_: 2, estimatedValue: 2800 },
    { name: "Marco Ferretti",      email: "marco@ferretti-import.it",         phone: "+34 698 765 432", leadStatus: "NEW",       source: "REFERRAL",  daysAgo_: 3,  estimatedValue: 6000 },
    { name: "Belén Ríos Pardo",    email: "belen@riosjoyeria.es",             phone: "+34 677 890 123", leadStatus: "NEW",       source: "INSTAGRAM", message: "Joyería artesanal, quiero modernizar la marca", daysAgo_: 1, estimatedValue: 4200 },
    { name: "Lucía Sánchez",       email: "lucia@decorarte.com",              phone: "+34 677 123 456", leadStatus: "CONTACTED", source: "WEB",       message: "Necesita rediseño web + branding", daysAgo_: 5,  estimatedValue: 9000 },
    { name: "Pedro Alonso Vega",   email: "pedro@alonsovega.es",              phone: "+34 666 987 654", leadStatus: "CONTACTED", source: "LINKEDIN",  daysAgo_: 6,  estimatedValue: 1800 },
    { name: "Sandra Morales",      email: "s.morales@grupomorales.com",       phone: "+34 634 567 890", leadStatus: "CONTACTED", source: "WEB",       message: "App mobile para hostelería", daysAgo_: 8, estimatedValue: 15000 },
    { name: "Rodrigo Casas",       email: "rodrigo@casasconsulting.es",       phone: "+34 611 432 876", leadStatus: "CONTACTED", source: "REFERRAL",  daysAgo_: 4,  estimatedValue: 3200 },
    { name: "Alberto Cisneros",    email: "alberto@cisneros-law.es",          phone: "+34 611 222 333", leadStatus: "QUALIFIED", source: "REFERRAL",  message: "Recomendación de Florencia, identidad corporativa", daysAgo_: 12, estimatedValue: 7500 },
    { name: "Inma Delgado",        email: "inma@inmadelgado.com",             phone: "+34 687 654 321", leadStatus: "QUALIFIED", source: "WEB",       message: "E-commerce moda, presupuesto 8.000€-15.000€", daysAgo_: 14, estimatedValue: 12000 },
    { name: "Javier Romero",       email: "javier.romero@startuptech.es",     phone: "+34 645 321 987", leadStatus: "QUALIFIED", source: "INSTAGRAM", daysAgo_: 16, estimatedValue: 5500 },
    { name: "María Castellano",    email: "maria@castellano-arquitectos.com", phone: "+34 633 111 222", leadStatus: "CONVERTED", source: "REFERRAL",  message: "Proyecto completo comunicación corporativa", daysAgo_: 25, estimatedValue: 8000 },
    { name: "David Nieto Pons",    email: "david@nietodesign.es",             phone: "+34 612 988 765", leadStatus: "CONVERTED", source: "WEB",       daysAgo_: 30, estimatedValue: 4500 },
    { name: "Elena Torres",        email: "elena@torresrestauracion.es",      phone: "+34 698 234 567", leadStatus: "CONVERTED", source: "LINKEDIN",  daysAgo_: 35, estimatedValue: 6200 },
    { name: "Roberto Fuentes",     email: "roberto@fuentes.co",               phone: "+34 677 456 789", leadStatus: "LOST",      source: "WEB",       message: "Decidió trabajar con otro estudio por precio", daysAgo_: 20, estimatedValue: 3000 },
    { name: "Patricia Vidal",      email: "patricia@vidalconsulting.es",      phone: "+34 655 789 012", leadStatus: "LOST",      source: "INSTAGRAM", daysAgo_: 22, estimatedValue: 2200 },
    { name: "Tomás Egea Blanco",   email: "tomas@egeaconstructora.es",        phone: "+34 634 765 432", leadStatus: "LOST",      source: "WEB",       message: "Presupuesto demasiado alto según él", daysAgo_: 18, estimatedValue: 11000 },
  ]

  for (const l of leadsData) {
    const existing = await prisma.lead.findFirst({ where: { userId, email: l.email } })
    if (existing) { console.log(`  · ya existe: ${l.name}`); continue }
    await prisma.lead.create({
      data: {
        id: uid(), userId,
        name: l.name, email: l.email, phone: l.phone ?? null, message: l.message ?? null,
        source: l.source, leadStatus: l.leadStatus, status: l.leadStatus,
        priority: "MEDIUM", estimatedValue: l.estimatedValue ?? null,
        converted: l.leadStatus === "CONVERTED",
        convertedAt: l.leadStatus === "CONVERTED" ? daysAgo(l.daysAgo_ - 5) : null,
        createdAt: daysAgo(l.daysAgo_), updatedAt: new Date(),
      },
    })
    console.log(`  + ${l.name} (${l.leadStatus})`)
  }

  // ── PROVEEDORES ───────────────────────────────────────────────────────────────
  console.log("\n── PROVEEDORES ──")
  const providersData = [
    {
      name: "Adobe Systems Spain SL",
      type: "SOFTWARE",
      contactEmail: "cuentas@adobe.com",
      contactPhone: "+34 900 813 319",
      website: "adobe.com",
      monthlyCost: 72.49,
      notes: "Licencias Creative Cloud (Photoshop, Illustrator, XD, Premiere). Renovación anual.",
      dependencyLevel: "HIGH",
      isCritical: true,
    },
    {
      name: "OVHcloud Iberia",
      type: "HOSTING",
      contactEmail: "soporte@ovhcloud.com",
      contactPhone: "+34 910 050 050",
      website: "ovhcloud.com",
      monthlyCost: 89.00,
      notes: "VPS profesional (8 vCPU, 32 GB RAM, 400 GB NVMe). Plan anual prepagado.",
      dependencyLevel: "HIGH",
      isCritical: true,
    },
    {
      name: "Oficina Total SL",
      type: "MATERIAL",
      contactEmail: "pedidos@oficinotal.es",
      contactPhone: "+34 91 456 78 90",
      website: "oficinotal.es",
      monthlyCost: 120.00,
      notes: "Material de oficina, consumibles impresora, papel especial para presentaciones.",
      dependencyLevel: "LOW",
      isCritical: false,
    },
    {
      name: "Fotografía Estudio Blava",
      type: "SUBCONTRATACION",
      contactEmail: "hola@estudioblava.com",
      contactPhone: "+34 93 234 56 78",
      website: "estudioblava.com",
      monthlyCost: null,
      notes: "Fotógrafo freelance para proyectos de clientes que necesitan fotografía de producto o corporativa.",
      dependencyLevel: "MEDIUM",
      isCritical: false,
    },
    {
      name: "Contabilidad & Asesoría Ramos",
      type: "ASESORIA",
      contactEmail: "info@asesoriaramos.es",
      contactPhone: "+34 91 987 65 43",
      website: "asesoriaramos.es",
      monthlyCost: 180.00,
      notes: "Gestoría/asesoría fiscal y laboral. Trimestral IVA, anual IRPF.",
      dependencyLevel: "MEDIUM",
      isCritical: true,
    },
  ]

  const providers: Array<{ id: string; name: string }> = []
  for (const p of providersData) {
    const existing = await prisma.provider.findFirst({ where: { userId, name: p.name } })
    if (existing) {
      providers.push(existing)
      console.log(`  · ya existe: ${p.name}`)
    } else {
      const created = await prisma.provider.create({
        data: {
          id: uid(), userId,
          name: p.name,
          type: p.type,
          status: "ACTIVE",
          dependencyLevel: p.dependencyLevel as "LOW" | "MEDIUM" | "HIGH" | "CRITICAL",
          operationalState: "OK",
          monthlyCost: p.monthlyCost ?? null,
          contactEmail: p.contactEmail,
          contactPhone: p.contactPhone,
          website: p.website,
          notes: p.notes,
          isCritical: p.isCritical,
          createdAt: daysAgo(Math.floor(Math.random() * 180) + 90),
          updatedAt: new Date(),
        },
      })
      providers.push(created)
      console.log(`  + ${p.name}`)
    }
  }

  // ── FACTURAS A CLIENTES (históricas: 5 meses atrás → mes pasado) ───────────────
  console.log("\n── FACTURAS CLIENTES (históricas) ──")
  type InvData = {
    clientIdx: number; number: string; total: number; status: InvoiceStatus
    issueDate: Date; dueDate: Date; paidAt: Date | null; providerId?: string
  }

  const historicInvoices: InvData[] = [
    // ── 5 meses atrás (Enero 2026) ──────────────────────────
    { clientIdx: 0, number: "2026-001", total: 1800, status: "PAID", issueDate: monthStart(5), dueDate: new Date(monthStart(5).getTime() + 30*86400000), paidAt: monthMid(5) },
    { clientIdx: 2, number: "2026-002", total: 3200, status: "PAID", issueDate: new Date(monthStart(5).getTime() + 5*86400000), dueDate: new Date(monthStart(5).getTime() + 35*86400000), paidAt: new Date(monthMid(5).getTime() + 5*86400000) },
    // ── 4 meses atrás (Febrero 2026) ────────────────────────
    { clientIdx: 1, number: "2026-008", total: 2400, status: "PAID", issueDate: monthStart(4), dueDate: new Date(monthStart(4).getTime() + 30*86400000), paidAt: monthMid(4) },
    { clientIdx: 4, number: "2026-009", total: 1650, status: "PAID", issueDate: new Date(monthStart(4).getTime() + 8*86400000), dueDate: new Date(monthStart(4).getTime() + 38*86400000), paidAt: new Date(monthMid(4).getTime() + 4*86400000) },
    { clientIdx: 2, number: "2026-010", total: 4800, status: "PAID", issueDate: new Date(monthStart(4).getTime() + 12*86400000), dueDate: new Date(monthStart(4).getTime() + 42*86400000), paidAt: new Date(monthMid(4).getTime() + 8*86400000) },
    // ── 3 meses atrás (Marzo 2026) ──────────────────────────
    { clientIdx: 0, number: "2026-016", total: 3500, status: "PAID", issueDate: monthStart(3), dueDate: new Date(monthStart(3).getTime() + 30*86400000), paidAt: monthMid(3) },
    { clientIdx: 3, number: "2026-017", total: 1900, status: "PAID", issueDate: new Date(monthStart(3).getTime() + 7*86400000), dueDate: new Date(monthStart(3).getTime() + 37*86400000), paidAt: new Date(monthMid(3).getTime() + 3*86400000) },
    { clientIdx: 5, number: "2026-018", total: 2200, status: "PAID", issueDate: new Date(monthStart(3).getTime() + 14*86400000), dueDate: new Date(monthStart(3).getTime() + 44*86400000), paidAt: new Date(monthMid(3).getTime() + 10*86400000) },
    // ── 2 meses atrás (Abril 2026) ──────────────────────────
    { clientIdx: 2, number: "2026-024", total: 5500, status: "PAID", issueDate: monthStart(2), dueDate: new Date(monthStart(2).getTime() + 30*86400000), paidAt: monthMid(2) },
    { clientIdx: 1, number: "2026-025", total: 2800, status: "PAID", issueDate: new Date(monthStart(2).getTime() + 5*86400000), dueDate: new Date(monthStart(2).getTime() + 35*86400000), paidAt: new Date(monthMid(2).getTime() + 2*86400000) },
    { clientIdx: 6, number: "2026-026", total: 1400, status: "PAID", issueDate: new Date(monthStart(2).getTime() + 10*86400000), dueDate: new Date(monthStart(2).getTime() + 40*86400000), paidAt: new Date(monthMid(2).getTime() + 7*86400000) },
    // ── 1 mes atrás (Mayo 2026 — mes completo) ──────────────
    { clientIdx: 1, number: "2026-031", total: 2800, status: "PAID", issueDate: monthStart(1), dueDate: new Date(monthStart(1).getTime() + 30*86400000), paidAt: new Date(monthStart(1).getTime() + 15*86400000) },
    { clientIdx: 2, number: "2026-032", total: 4200, status: "PAID", issueDate: new Date(monthStart(1).getTime() + 5*86400000), dueDate: new Date(monthStart(1).getTime() + 35*86400000), paidAt: new Date(monthStart(1).getTime() + 20*86400000) },
    { clientIdx: 3, number: "2026-033", total: 1950, status: "PAID", issueDate: new Date(monthStart(1).getTime() + 10*86400000), dueDate: new Date(monthStart(1).getTime() + 40*86400000), paidAt: new Date(monthStart(1).getTime() + 25*86400000) },
    // ── Mes en curso (Junio 2026) ────────────────────────────
    { clientIdx: 0, number: "2026-041", total: 3200, status: "PAID",    issueDate: daysAgo(20), dueDate: daysFromNow(10), paidAt: daysAgo(5) },
    { clientIdx: 1, number: "2026-042", total: 1850, status: "PAID",    issueDate: daysAgo(15), dueDate: daysFromNow(15), paidAt: daysAgo(2) },
    { clientIdx: 2, number: "2026-043", total: 5500, status: "PAID",    issueDate: daysAgo(10), dueDate: daysFromNow(20), paidAt: daysAgo(1) },
    { clientIdx: 3, number: "2026-044", total: 2100, status: "SENT",    issueDate: daysAgo(8),  dueDate: daysFromNow(22), paidAt: null },
    { clientIdx: 4, number: "2026-045", total: 4800, status: "SENT",    issueDate: daysAgo(5),  dueDate: daysFromNow(25), paidAt: null },
    { clientIdx: 0, number: "2026-046", total: 1200, status: "OVERDUE", issueDate: daysAgo(45), dueDate: daysAgo(5),      paidAt: null },
  ]

  for (const inv of historicInvoices) {
    const existing = await prisma.invoice.findFirst({ where: { userId, number: inv.number } })
    if (existing) { console.log(`  · ya existe: ${inv.number}`); continue }
    const client = clients[inv.clientIdx]
    const sub = Math.round((inv.total / 1.21) * 100) / 100
    const tax = Math.round((inv.total - sub) * 100) / 100
    await prisma.invoice.create({
      data: {
        id: uid(), userId,
        clientId: client.id,
        number: inv.number, series: "2026",
        issueDate: inv.issueDate, dueDate: inv.dueDate,
        subtotal: sub, taxAmount: tax, total: inv.total,
        status: inv.status, paidAt: inv.paidAt,
        type: "CUSTOMER", currency: "EUR",
        createdAt: inv.issueDate, updatedAt: new Date(),
      },
    })
    console.log(`  + ${inv.number}  ${inv.total} €  ${inv.status}`)
  }

  // ── FACTURAS DE PROVEEDORES ────────────────────────────────────────────────────
  console.log("\n── FACTURAS PROVEEDORES ──")
  type ProvInv = { providerIdx: number; number: string; total: number; status: InvoiceStatus; issueDate: Date; paidAt: Date | null }

  const providerInvoices: ProvInv[] = [
    // Adobe (idx 0) — mensual últimos 3 meses
    { providerIdx: 0, number: "PROV-2026-014", total: 72.49,  status: "PAID", issueDate: monthMid(3), paidAt: new Date(monthMid(3).getTime() + 5*86400000) },
    { providerIdx: 0, number: "PROV-2026-021", total: 72.49,  status: "PAID", issueDate: monthMid(2), paidAt: new Date(monthMid(2).getTime() + 5*86400000) },
    { providerIdx: 0, number: "PROV-2026-028", total: 72.49,  status: "PAID", issueDate: monthMid(1), paidAt: new Date(monthMid(1).getTime() + 3*86400000) },
    { providerIdx: 0, number: "PROV-2026-037", total: 72.49,  status: "SENT", issueDate: daysAgo(10),  paidAt: null },
    // OVHcloud (idx 1) — trimestral
    { providerIdx: 1, number: "PROV-2026-011", total: 267.00, status: "PAID", issueDate: monthStart(4), paidAt: new Date(monthStart(4).getTime() + 7*86400000) },
    { providerIdx: 1, number: "PROV-2026-033", total: 267.00, status: "PAID", issueDate: monthStart(1), paidAt: new Date(monthStart(1).getTime() + 7*86400000) },
    // Oficina Total (idx 2) — bimensual
    { providerIdx: 2, number: "PROV-2026-009", total: 218.40, status: "PAID", issueDate: monthMid(4), paidAt: new Date(monthMid(4).getTime() + 10*86400000) },
    { providerIdx: 2, number: "PROV-2026-025", total: 183.60, status: "PAID", issueDate: monthMid(2), paidAt: new Date(monthMid(2).getTime() + 10*86400000) },
    { providerIdx: 2, number: "PROV-2026-039", total: 205.20, status: "SENT", issueDate: daysAgo(7),   paidAt: null },
    // Fotografía Estudio Blava (idx 3) — por proyecto
    { providerIdx: 3, number: "PROV-2026-016", total: 850.00, status: "PAID", issueDate: monthStart(3), paidAt: new Date(monthStart(3).getTime() + 14*86400000) },
    { providerIdx: 3, number: "PROV-2026-035", total: 1200.00,status: "PAID", issueDate: daysAgo(25),   paidAt: daysAgo(10) },
    // Asesoría Ramos (idx 4) — mensual
    { providerIdx: 4, number: "PROV-2026-013", total: 180.00, status: "PAID", issueDate: monthMid(3), paidAt: new Date(monthMid(3).getTime() + 7*86400000) },
    { providerIdx: 4, number: "PROV-2026-020", total: 180.00, status: "PAID", issueDate: monthMid(2), paidAt: new Date(monthMid(2).getTime() + 5*86400000) },
    { providerIdx: 4, number: "PROV-2026-027", total: 180.00, status: "PAID", issueDate: monthMid(1), paidAt: new Date(monthMid(1).getTime() + 5*86400000) },
    { providerIdx: 4, number: "PROV-2026-038", total: 180.00, status: "SENT", issueDate: daysAgo(5),   paidAt: null },
  ]

  for (const inv of providerInvoices) {
    const existing = await prisma.invoice.findFirst({ where: { userId, number: inv.number } })
    if (existing) { console.log(`  · ya existe: ${inv.number}`); continue }
    const provider = providers[inv.providerIdx]
    const sub = Math.round((inv.total / 1.21) * 100) / 100
    const tax = Math.round((inv.total - sub) * 100) / 100
    await prisma.invoice.create({
      data: {
        id: uid(), userId,
        providerId: provider.id,
        number: inv.number, series: "PROV-2026",
        issueDate: inv.issueDate, dueDate: new Date(inv.issueDate.getTime() + 30*86400000),
        subtotal: sub, taxAmount: tax, total: inv.total,
        status: inv.status, paidAt: inv.paidAt,
        type: "VENDOR", currency: "EUR",
        createdAt: inv.issueDate, updatedAt: new Date(),
      },
    })
    console.log(`  + ${inv.number}  ${inv.total} €  ${inv.status}  (${provider.name})`)
  }

  // ── TAREAS ─────────────────────────────────────────────────────────────────────
  console.log("\n── TAREAS ──")
  const tasksData: Array<{
    title: string; priority: TaskPriority; status: TaskStatus; type: TaskType; dueDaysFromNow: number
  }> = [
    { title: "Llamar a Alberto Cisneros para cerrar presupuesto",       priority: "URGENT", status: "PENDING",     type: "CALL",   dueDaysFromNow: 0  },
    { title: "Enviar propuesta diseño web a Inma Delgado",              priority: "HIGH",   status: "PENDING",     type: "EMAIL",  dueDaysFromNow: 1  },
    { title: "Reunión kickoff proyecto Grupo Nexum",                    priority: "HIGH",   status: "PENDING",     type: "MEETING",dueDaysFromNow: 2  },
    { title: "Revisar identidad corporativa Creativos del Sur",         priority: "HIGH",   status: "IN_PROGRESS", type: "MANUAL", dueDaysFromNow: 3  },
    { title: "Follow-up leads Instagram (semana actual)",               priority: "MEDIUM", status: "PENDING",     type: "EMAIL",  dueDaysFromNow: 1  },
    { title: "Preparar factura junio para TechVentures",                priority: "MEDIUM", status: "PENDING",     type: "MANUAL", dueDaysFromNow: 5  },
    { title: "Actualizar portfolio con proyectos Q1 2026",              priority: "LOW",    status: "PENDING",     type: "MANUAL", dueDaysFromNow: 14 },
    { title: "Reclamar factura vencida Grupo Nexum (2026-046)",         priority: "HIGH",   status: "PENDING",     type: "CALL",   dueDaysFromNow: 0  },
    { title: "Seguimiento presupuesto Sandra Morales (sin respuesta)",  priority: "HIGH",   status: "PENDING",     type: "CALL",   dueDaysFromNow: -3 },
    { title: "Renovar suscripción Adobe Creative Cloud",                priority: "MEDIUM", status: "PENDING",     type: "MANUAL", dueDaysFromNow: 10 },
    { title: "Pagar factura asesoría Ramos (PROV-2026-038)",            priority: "HIGH",   status: "PENDING",     type: "MANUAL", dueDaysFromNow: 2  },
  ]

  for (const t of tasksData) {
    const existing = await prisma.task.findFirst({ where: { userId, title: t.title } })
    if (existing) { console.log(`  · ya existe: ${t.title.slice(0, 50)}`); continue }
    await prisma.task.create({
      data: {
        id: uid(), userId,
        title: t.title, priority: t.priority, status: t.status, type: t.type,
        dueDate: daysFromNow(t.dueDaysFromNow),
        createdAt: daysAgo(5), updatedAt: new Date(),
      },
    })
    console.log(`  + ${t.title.slice(0, 55)}  (${t.priority})`)
  }

  // ── RESUMEN FINAL ──────────────────────────────────────────────────────────────
  const [totalLeads, totalClients, totalInvoicesCust, totalInvoicesProv, totalProviders, totalTasks] = await Promise.all([
    prisma.lead.count({ where: { userId } }),
    prisma.client.count({ where: { userId } }),
    prisma.invoice.count({ where: { userId, type: "CUSTOMER" } }),
    prisma.invoice.count({ where: { userId, type: "VENDOR" } }),
    prisma.provider.count({ where: { userId } }),
    prisma.task.count({ where: { userId } }),
  ])

  console.log("\n✅ Seed completado\n")
  console.log(`  Leads:                ${totalLeads}`)
  console.log(`  Clientes:             ${totalClients}`)
  console.log(`  Facturas a clientes:  ${totalInvoicesCust}`)
  console.log(`  Facturas proveedores: ${totalInvoicesProv}`)
  console.log(`  Proveedores:          ${totalProviders}`)
  console.log(`  Tareas:               ${totalTasks}`)
}

main()
  .catch((e) => { console.error("\n❌ Error:", e.message); process.exit(1) })
  .finally(() => prisma.$disconnect())
