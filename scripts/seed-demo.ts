/**
 * DEMO seed for the account iyanrimada5@gmail.com — a small Spanish marketing/
 * design agency that has been using ClientLabs for ~5 months (Jan–Jun 2026).
 *
 * Standalone. Direct Prisma against DIRECT_DATABASE_URL. NOT part of the build.
 * Pure INSERTs: it does NOT trigger Verifactu, send emails or touch Stripe.
 * Every created row carries an id prefixed with `seeddemo_` so scripts/unseed-demo.ts
 * can delete EXACTLY this seed.
 *
 *   npx tsx scripts/seed-demo.ts
 */
import { PrismaClient } from "@prisma/client"
import { readFileSync } from "fs"
import { resolve } from "path"

// ── load DIRECT_DATABASE_URL from .env.local / .env (no dotenv dependency) ──
function loadEnv(file: string) {
  try {
    for (const line of readFileSync(resolve(process.cwd(), file), "utf8").split("\n")) {
      const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/)
      if (m && !process.env[m[1]]) process.env[m[1]] = m[2].replace(/^["']|["']$/g, "")
    }
  } catch {}
}
loadEnv(".env.local")
loadEnv(".env")

const DB = process.env.DIRECT_DATABASE_URL || process.env.DATABASE_URL
if (!DB) throw new Error("No DIRECT_DATABASE_URL / DATABASE_URL")
const prisma = new PrismaClient({ datasources: { db: { url: DB } } })

const EMAIL = "iyanrimada5@gmail.com"
const PFX = "seeddemo_"
let SEQ = 0
const id = (k: string) => `${PFX}${k}_${String(++SEQ).padStart(5, "0")}`

// ── helpers ──
const rnd = (a: number, b: number) => Math.floor(Math.random() * (b - a + 1)) + a
const pick = <T,>(a: T[]): T => a[Math.floor(Math.random() * a.length)]
const r2 = (n: number) => Math.round(n * 100) / 100
const chance = (p: number) => Math.random() < p
function dayIn(year: number, month: number) {
  const d = new Date(Date.UTC(year, month, rnd(1, 27), rnd(8, 18), rnd(0, 59)))
  return d
}
const NIF_L = "TRWAGMYFPDXBNJZSQVHLCKE"
function genNIF() {
  const n = rnd(10_000_000, 99_999_999)
  return `${n}${NIF_L[n % 23]}`
}
function genCIF() {
  const digits = Array.from({ length: 7 }, () => rnd(0, 9))
  let sumEven = 0, sumOdd = 0
  digits.forEach((d, i) => {
    if ((i + 1) % 2 === 0) sumEven += d
    else { const x = d * 2; sumOdd += x > 9 ? x - 9 : x }
  })
  const ctrl = (10 - ((sumEven + sumOdd) % 10)) % 10
  return `B${digits.join("")}${ctrl}` // B = S.L. → control numérico
}

const PROVINCES: [string, string, string][] = [
  ["Madrid", "Madrid", "28013"], ["Barcelona", "Barcelona", "08007"],
  ["Valencia", "Valencia", "46004"], ["Sevilla", "Sevilla", "41001"],
  ["Málaga", "Málaga", "29015"], ["Zaragoza", "Zaragoza", "50001"],
  ["Bizkaia", "Bilbao", "48001"], ["A Coruña", "A Coruña", "15001"],
  ["Murcia", "Murcia", "30004"], ["Alicante", "Alicante", "03001"],
  ["Valladolid", "Valladolid", "47001"], ["Granada", "Granada", "18001"],
]
const STREETS = ["Calle Mayor", "Avenida de la Constitución", "Calle Gran Vía", "Calle del Carmen",
  "Paseo de Gracia", "Calle Serrano", "Avenida Diagonal", "Calle Colón", "Plaza España", "Calle Larios"]
const addr = () => `${pick(STREETS)} ${rnd(1, 180)}, ${rnd(1, 6)}º`

const FIRST = ["Lucía", "Hugo", "Martina", "Mateo", "Sofía", "Daniel", "Paula", "Pablo", "Carla", "Álvaro",
  "Marta", "Javier", "Elena", "Sergio", "Nuria", "Diego", "Cristina", "Raúl", "Andrea", "Iván",
  "Beatriz", "Adrián", "Laura", "Marcos", "Sara", "Rubén", "Patricia", "Jorge", "Irene", "Víctor"]
const LAST = ["García", "Martínez", "López", "Sánchez", "Pérez", "Gómez", "Fernández", "Ruiz", "Díaz",
  "Moreno", "Álvarez", "Romero", "Torres", "Navarro", "Vega", "Castro", "Ortega", "Gil", "Serrano", "Molina"]
const person = () => `${pick(FIRST)} ${pick(LAST)} ${pick(LAST)}`

// Clientes típicos de una agencia de marketing/diseño
const CLIENT_COMPANIES = [
  "Restaurante El Rincón", "Clínica Dental Sonrisa", "Gimnasio FitZone", "Inmobiliaria Costa Azul",
  "Bodegas Vega Alta", "Floristería Lila", "Academia de Idiomas Oxford", "Panadería La Espiga",
  "Óptica VisualPro", "Ferretería Industrial Sur", "Hotel Mirador del Mar", "Peluquería Estilo",
  "Asesoría Contable Núñez", "Taller Mecánico RuedaFácil", "Cafetería Aroma", "Tienda Moda Urbana",
  "Centro de Fisioterapia ReHab", "Veterinaria Patitas", "Pastelería Dulce Hogar", "Joyería Brillante",
  "Carpintería Madera Noble", "Inmobiliaria Hogar", "Restaurante Sabor Mediterráneo", "Clínica Estética Bella",
  "Escuela Infantil Pequeños", "Librería Páginas", "Estudio de Yoga Namaste", "Cervecería Artesana Lúpulo",
  "Distribuciones AlimentaSur", "Bufete Legal Martín & Asociados", "Agencia de Viajes Mundo",
  "Concesionario AutoCentro", "Spa Relax Total", "Heladería Frescor", "Tienda de Bicis RuedaLibre"]

// Proveedores de una agencia
const PROVIDERS = [
  ["Gráficas del Sur, Imprenta", "Impresión"], ["Adobe Systems Ibérica", "Software"],
  ["Hostinger España", "Hosting"], ["Estudio Fotográfico LuzClara", "Fotografía"],
  ["Papelería Central", "Material"], ["Meta Platforms Ireland", "Publicidad"],
  ["Google Ads", "Publicidad"], ["Gestoría Fiscal López", "Servicios profesionales"],
  ["Coworking La Nave", "Alquiler"], ["Freelance Copywriting Vega", "Redacción"],
  ["Rotulación e Impresión Big", "Impresión"], ["Banco de Imágenes StockPro", "Software"],
  ["Mensajería ExpressYa", "Logística"], ["Telefónica Empresas", "Telecomunicaciones"],
  ["Endesa Energía", "Suministros"], ["Freelance Ilustración Sol", "Diseño"],
  ["Productora Audiovisual Foco", "Vídeo"], ["Agencia de Medios PlanMedia", "Publicidad"],
  ["Asesoría Laboral RRHH+", "Servicios profesionales"], ["Suministros Informáticos PCBox", "Equipos"]]

// Productos / servicios de la agencia (precio sin IVA)
const SERVICES: [string, number, number, boolean][] = [
  ["Diseño de logotipo", 450, 21, true], ["Identidad corporativa completa", 1200, 21, true],
  ["Gestión de redes sociales (mensual)", 350, 21, true], ["Campaña Google Ads (gestión mensual)", 400, 21, true],
  ["Campaña Meta Ads (gestión mensual)", 380, 21, true], ["Diseño web corporativa", 2200, 21, true],
  ["Tienda online (e-commerce)", 3500, 21, true], ["Posicionamiento SEO (mensual)", 500, 21, true],
  ["Email marketing (campaña)", 280, 21, true], ["Sesión de fotografía de producto", 600, 21, true],
  ["Vídeo promocional", 1500, 21, true], ["Redacción de contenidos (pack)", 320, 21, true],
  ["Mantenimiento web (mensual)", 90, 21, true], ["Diseño de catálogo", 750, 21, true],
  ["Diseño de packaging", 850, 21, true], ["Branding para evento", 1100, 21, true],
  ["Consultoría de marketing (hora)", 75, 21, true], ["Cartelería y folletos", 280, 21, true],
  ["Plan de marketing digital", 1800, 21, true], ["Auditoría de marca", 650, 21, true],
  ["Diseño de newsletter", 180, 21, true], ["Gestión de comunidad (mensual)", 300, 21, true],
  ["Rediseño de logotipo", 380, 21, true], ["Landing page promocional", 700, 21, true],
  ["Reportaje fotográfico evento", 900, 21, true], ["Formación interna (jornada)", 95, 10, true],
  ["Libro de marca impreso", 540, 4, false], ["Manual corporativo (impresión)", 320, 4, false],
  ["Tarjetas de visita (pack 1000)", 60, 21, false], ["Material de oficina personalizado", 140, 21, false]]

const GASTO_CATS = ["Software", "Publicidad", "Impresión", "Suministros", "Alquiler",
  "Servicios profesionales", "Material", "Telecomunicaciones", "Logística", "Equipos"]

const manifest: Record<string, number> = {}
const bump = (k: string, n = 1) => (manifest[k] = (manifest[k] ?? 0) + n)

async function main() {
  const user = await prisma.user.findUnique({ where: { email: EMAIL }, select: { id: true, name: true } })
  if (!user) throw new Error(`Usuario ${EMAIL} no encontrado`)
  const userId = user.id
  console.log(`Usuario: ${EMAIL} (${userId})`)

  // pre-flight: avoid double-seeding
  const existing = await prisma.invoice.count({ where: { userId, id: { startsWith: PFX } } })
  if (existing > 0) throw new Error(`Ya existe seed demo (${existing} facturas con prefijo ${PFX}). Ejecuta unseed-demo primero.`)

  // ── BusinessProfile (emisor) ──
  let bp = await prisma.businessProfile.findUnique({ where: { userId } })
  let createdBP = false
  const EMISOR = {
    legalName: "Estudio Marea, Marketing y Diseño S.L.",
    companyName: "Estudio Marea",
    taxId: genCIF(),
    address: "Calle Gran Vía 42, 3º",
    city: "Madrid", province: "Madrid", postalCode: "28013", country: "España",
    email: EMAIL, phone: "+34 910 123 456",
    iban: "ES7621000418401234567891",
  }
  if (!bp) {
    bp = await prisma.businessProfile.create({
      data: {
        id: id("bp"), userId, sector: "online", name: EMISOR.companyName,
        companyName: EMISOR.companyName, legalName: EMISOR.legalName, taxId: EMISOR.taxId,
        address: EMISOR.address, city: EMISOR.city, province: EMISOR.province,
        postalCode: EMISOR.postalCode, country: EMISOR.country, email: EMISOR.email,
        phone: EMISOR.phone, iban: EMISOR.iban, ivaRegime: "GENERAL",
      },
    })
    createdBP = true
    bump("businessProfile")
  }
  const emisorSnap = {
    legalName: bp.legalName ?? EMISOR.legalName, name: bp.companyName ?? EMISOR.companyName,
    taxId: bp.taxId ?? EMISOR.taxId, address: bp.address ?? EMISOR.address,
    city: bp.city ?? EMISOR.city, province: bp.province ?? EMISOR.province,
    postalCode: bp.postalCode ?? EMISOR.postalCode, country: bp.country ?? EMISOR.country,
    email: bp.email ?? EMISOR.email, iban: bp.iban ?? EMISOR.iban,
  }

  // ── Invoice series (counter) ──
  const series = await prisma.invoiceSeries.create({
    data: { id: id("series"), userId, name: "Facturas Demo 2026", prefix: "FAC", nextNumber: 1, year: 2026, isDefault: false },
  })
  bump("invoiceSeries")

  // ── Clients (~50) ──
  type Cli = { id: string; name: string; isCompany: boolean }
  const clients: Cli[] = []
  for (let i = 0; i < 50; i++) {
    const isCompany = chance(0.72)
    const [prov, city, cp] = pick(PROVINCES)
    const companyName = isCompany ? `${pick(CLIENT_COMPANIES)} ${pick(["S.L.", "S.L.", "S.A.", ""])}`.trim() : null
    const contact = person()
    const cid = id("cli")
    await prisma.client.create({
      data: {
        id: cid, userId, name: isCompany ? companyName! : contact,
        companyName, legalName: companyName, email: `cliente${i + 1}@${isCompany ? "empresa" : "correo"}.es`,
        phone: `+34 6${rnd(10, 99)} ${rnd(100, 999)} ${rnd(100, 999)}`,
        taxId: isCompany ? genCIF() : genNIF(), legalType: isCompany ? "company" : "individual",
        address: addr(), city, province: prov, postalCode: cp, country: "España",
        status: "ACTIVE", source: pick(["WEB", "REFERRAL", "MANUAL", "INSTAGRAM"]),
        isVip: chance(0.15), isFiscalComplete: true, currency: "EUR",
        createdAt: dayIn(2026, rnd(0, 4)),
      },
    })
    clients.push({ id: cid, name: isCompany ? companyName! : contact, isCompany })
    bump("clients")
  }

  // ── Providers (~20) + 1-3 products each ──
  const providers: { id: string; name: string }[] = []
  for (const [name, type] of PROVIDERS) {
    const pid = id("prov")
    await prisma.provider.create({
      data: {
        id: pid, userId, name, type, status: "ACTIVE",
        dependencyLevel: pick(["LOW", "MEDIUM", "HIGH"] as const),
        operationalState: "OK", contactEmail: `info@${name.split(/[ ,]/)[0].toLowerCase()}.es`,
        contactPhone: `+34 9${rnd(10, 99)} ${rnd(100, 999)} ${rnd(100, 999)}`,
        monthlyCost: chance(0.4) ? rnd(50, 600) : null,
        notes: `Proveedor de ${type.toLowerCase()}.`, createdAt: dayIn(2026, rnd(0, 2)),
      },
    })
    providers.push({ id: pid, name })
    bump("providers")
    for (let k = 0; k < rnd(1, 3); k++) {
      await prisma.providerProduct.create({
        data: {
          id: id("provprod"), providerId: pid, userId, name: `${type} ${pick(["Pro", "Básico", "Mensual", "Premium"])}`,
          code: `${type.slice(0, 3).toUpperCase()}-${rnd(100, 999)}`, unit: "ud",
          price: rnd(10, 400), category: type, isActive: true,
        },
      })
      bump("providerProducts")
    }
  }

  // ── Products / services (~30) ──
  const products: { id: string; name: string; price: number; tax: number }[] = []
  for (const [name, price, tax, isService] of SERVICES) {
    const prid = id("prod")
    await prisma.product.create({
      data: {
        id: prid, userId, name, description: `${name} para clientes de la agencia.`,
        price, taxRate: tax, unit: isService ? "servicio" : "ud",
        category: tax === 21 ? "Servicios" : "Otros", isService, active: true,
      },
    })
    products.push({ id: prid, name, price, tax })
    bump("products")
  }

  // ── Customer invoices (~180) across 5 months ──
  let invNo = 0
  let revPaid = 0, revPending = 0
  for (let month = 0; month <= 5; month++) {
    const perMonth = month === 5 ? 24 : rnd(28, 34) // junio en curso (menos)
    for (let j = 0; j < perMonth; j++) {
      const client = pick(clients)
      const nLines = rnd(1, 4)
      const lines = Array.from({ length: nLines }, () => {
        const p = pick(products)
        const qty = p.name.includes("hora") || p.name.includes("jornada") ? rnd(2, 12) : rnd(1, 3)
        const tax = chance(0.85) ? p.tax : pick([21, 10, 4, 0])
        const sub = r2(qty * p.price)
        const taxAmt = r2(sub * tax / 100)
        return { desc: p.name, qty, unitPrice: p.price, tax, sub, taxAmt, total: r2(sub + taxAmt), ref: p.id }
      })
      const subtotal = r2(lines.reduce((s, l) => s + l.sub, 0))
      const taxAmount = r2(lines.reduce((s, l) => s + l.taxAmt, 0))
      // retención IRPF: solo a empresas (B2B), ~70% de ellas
      const irpfRate = client.isCompany && chance(0.7) ? 15 : 0
      const irpfAmount = r2(subtotal * irpfRate / 100)
      const total = r2(subtotal + taxAmount - irpfAmount)
      const issueDate = dayIn(2026, month)
      const dueDate = new Date(issueDate.getTime() + 30 * 86400_000)
      const now = new Date("2026-06-20T00:00:00Z")
      // estado: pagada 70% / pendiente 20% / vencida 10% (vencida solo si dueDate pasada)
      let status: "PAID" | "SENT" | "OVERDUE"
      const roll = Math.random()
      if (roll < 0.7) status = "PAID"
      else if (dueDate < now && roll < 0.85) status = "OVERDUE"
      else status = "SENT"
      invNo++
      const number = `FAC-2026-${String(invNo).padStart(4, "0")}`
      const iid = id("inv")
      const itemsSnap = lines.map(l => ({ description: l.desc, quantity: l.qty, unitPrice: l.unitPrice, taxPercent: l.tax, subtotal: l.sub, taxAmount: l.taxAmt, total: l.total }))
      const clientFull = await prisma.client.findUnique({ where: { id: client.id }, select: { name: true, taxId: true, address: true, city: true, province: true, postalCode: true } })
      await prisma.invoice.create({
        data: {
          id: iid, userId, number, series: "FAC", clientId: client.id, type: "CUSTOMER",
          issueDate, dueDate, currency: "EUR",
          subtotal, taxAmount, taxTotal: taxAmount, total, discount: 0,
          irpfRate, irpfAmount, status,
          paidAt: status === "PAID" ? new Date(issueDate.getTime() + rnd(2, 28) * 86400_000) : null,
          paymentMethod: pick(["transfer", "card", "transfer", "cash"]),
          invoiceDocType: "F1", issuedAt: issueDate,
          issuedCompanySnapshot: emisorSnap, issuedClientSnapshot: clientFull as object,
          issuedItemsSnapshot: itemsSnap, issuedTotalsSnapshot: { subtotal, taxAmount, irpfAmount, total },
          notes: "Gracias por confiar en Estudio Marea.",
          createdAt: issueDate, lines: {
            create: lines.map(l => ({
              id: id("invline"), description: l.desc, quantity: l.qty, unitPrice: l.unitPrice,
              taxPercent: l.tax, subtotal: l.sub, taxAmount: l.taxAmt, total: l.total, productRef: l.ref,
            })),
          },
        },
      })
      bump("invoices"); bump("invoiceLines", nLines)
      if (status === "PAID") {
        await prisma.invoicePayment.create({
          data: { id: id("invpay"), invoiceId: iid, amount: total, method: pick(["transfer", "card"]),
            reference: number, paidAt: new Date(issueDate.getTime() + rnd(2, 28) * 86400_000) },
        })
        bump("invoicePayments"); revPaid += total
      } else revPending += total
    }
  }

  // ── Provider expenses (~100) — VENDOR invoices + linked payments ──
  for (let month = 0; month <= 5; month++) {
    const perMonth = month === 5 ? 14 : rnd(16, 19)
    for (let j = 0; j < perMonth; j++) {
      const prov = pick(providers)
      const cat = pick(GASTO_CATS)
      const base = rnd(30, 1400)
      const tax = chance(0.8) ? 21 : 10
      const taxAmt = r2(base * tax / 100)
      const total = r2(base + taxAmt)
      const issueDate = dayIn(2026, month)
      const dueDate = new Date(issueDate.getTime() + 30 * 86400_000)
      const paid = chance(0.8)
      const gid = id("gasto")
      let providerPaymentId: string | null = null
      if (paid) {
        const pp = await prisma.providerPayment.create({
          data: { id: id("provpay"), providerId: prov.id, userId, amount: total,
            paymentDate: new Date(issueDate.getTime() + rnd(1, 25) * 86400_000),
            concept: `${cat} — factura proveedor`, method: pick(["transfer", "card", "domiciliacion"]), status: "PAID" },
        })
        providerPaymentId = pp.id
        bump("providerPayments")
      }
      await prisma.invoice.create({
        data: {
          id: gid, userId, number: `G-2026-${String(SEQ).padStart(4, "0")}`, series: "REC",
          type: "VENDOR", providerId: prov.id, providerName: prov.name, providerPaymentId,
          issueDate, dueDate, currency: "EUR",
          subtotal: base, taxAmount: taxAmt, taxTotal: taxAmt, total, discount: 0, irpfRate: 0, irpfAmount: 0,
          status: paid ? "PAID" : "SENT", paidAt: paid ? new Date(issueDate.getTime() + rnd(1, 25) * 86400_000) : null,
          notes: `Gasto · ${cat}`, createdAt: issueDate,
          lines: { create: [{ id: id("gline"), description: `${cat} — ${prov.name}`, quantity: 1, unitPrice: base, taxPercent: tax, subtotal: base, taxAmount: taxAmt, total }] },
        },
      })
      bump("gastos"); bump("invoiceLines")
    }
  }

  // ── Leads (~30) ──
  const leadStatuses = ["NEW", "CONTACTED", "INTERESTED", "QUALIFIED", "STALLED", "LOST", "CONVERTED"] as const
  for (let i = 0; i < 30; i++) {
    const st = pick(leadStatuses)
    const converted = st === "CONVERTED"
    const createdAt = dayIn(2026, rnd(0, 5))
    await prisma.lead.create({
      data: {
        id: id("lead"), userId, name: person(), email: `lead${i + 1}@empresa.es`,
        phone: `+34 6${rnd(10, 99)} ${rnd(100, 999)} ${rnd(100, 999)}`,
        message: pick(["Quiero rediseñar mi marca", "Necesito gestión de redes", "Presupuesto para web", "Campaña de Google Ads", "Vídeo promocional"]),
        source: pick(["WEB", "INSTAGRAM", "REFERRAL", "GOOGLE"]),
        status: st, leadStatus: st, temperature: pick(["HOT", "WARM", "COLD"] as const),
        converted, convertedAt: converted ? createdAt : null,
        clientId: converted ? pick(clients).id : null,
        estimatedValue: rnd(300, 4000), score: rnd(10, 95), priority: pick(["LOW", "MEDIUM", "HIGH"]),
        createdAt,
      },
    })
    bump("leads")
  }

  // ── Quotes / presupuestos (~15) ──
  let qNo = 0
  for (let i = 0; i < 15; i++) {
    const client = pick(clients)
    qNo++
    const nItems = rnd(1, 3)
    const items = Array.from({ length: nItems }, () => {
      const p = pick(products); const qty = rnd(1, 3)
      return { description: p.name, quantity: qty, unitPrice: p.price, taxRate: p.tax, subtotal: r2(qty * p.price), ref: p.id }
    })
    const subtotal = r2(items.reduce((s, it) => s + it.subtotal, 0))
    const taxTotal = r2(items.reduce((s, it) => s + it.subtotal * it.taxRate / 100, 0))
    const irpfRate = client.isCompany && chance(0.5) ? 15 : 0
    const irpfAmount = r2(subtotal * irpfRate / 100)
    const total = r2(subtotal + taxTotal - irpfAmount)
    const issueDate = dayIn(2026, rnd(0, 5))
    await prisma.quote.create({
      data: {
        id: id("quote"), userId, clientId: client.id, number: `P-2026-${String(qNo).padStart(3, "0")}`,
        series: "P", status: pick(["ACCEPTED", "SENT", "DRAFT", "REJECTED", "ACCEPTED"] as const),
        issueDate, validUntil: new Date(issueDate.getTime() + 30 * 86400_000),
        subtotal, taxTotal, irpfRate, irpfAmount, total, createdAt: issueDate,
        notes: "Presupuesto sin compromiso. Válido 30 días.",
        items: { create: items.map(it => ({ id: id("qitem"), productId: it.ref, description: it.description, quantity: it.quantity, unitPrice: it.unitPrice, taxRate: it.taxRate, subtotal: it.subtotal, productRef: it.ref })) },
      },
    })
    bump("quotes"); bump("quoteItems", nItems)
  }

  // ── Recurring invoices (~5) ──
  for (let i = 0; i < 5; i++) {
    const client = pick(clients)
    const svc = pick(products.filter(p => p.name.includes("mensual")))
    const start = dayIn(2026, rnd(0, 1))
    await prisma.recurringInvoice.create({
      data: {
        id: id("recinv"), userId, clientId: client.id, type: "F1", frequency: "MONTHLY",
        dayOfMonth: rnd(1, 28), startDate: start, nextRunDate: new Date("2026-07-01T09:00:00Z"),
        status: "ACTIVE", irpfRate: client.isCompany ? 15 : 0, currency: "EUR",
        notes: `Servicio recurrente: ${svc?.name ?? "Gestión mensual"}`,
        generatedCount: rnd(3, 5), lastGeneratedAt: dayIn(2026, 5),
        items: { create: [{ id: id("recitem"), description: svc?.name ?? "Gestión mensual", quantity: 1, unitPrice: svc?.price ?? 350, taxPercent: 21, discountPercent: 0 }] },
      },
    })
    bump("recurringInvoices")
  }

  // ── update series counter ──
  await prisma.invoiceSeries.update({ where: { id: series.id }, data: { nextNumber: invNo + 1 } })

  console.log("\n── RESUMEN ──")
  for (const [k, v] of Object.entries(manifest)) console.log(`  ${k.padEnd(18)} ${v}`)
  console.log(`\n  Facturación cobrada (PAID):   ${revPaid.toLocaleString("es-ES", { minimumFractionDigits: 2 })} €`)
  console.log(`  Facturación pendiente/vencida: ${revPending.toLocaleString("es-ES", { minimumFractionDigits: 2 })} €`)
  console.log(`  Serie FAC nextNumber → ${invNo + 1}`)
  console.log(`  BusinessProfile ${createdBP ? "CREADO" : "ya existía (no modificado)"}`)
  console.log("\n  Rango de fechas: 2026-01 → 2026-06")
  console.log("  Verifactu: NO disparado · Emails: NO · Stripe: NO (solo INSERTs)")
}

main()
  .then(() => prisma.$disconnect())
  .catch(async (e) => { console.error(e); await prisma.$disconnect(); process.exit(1) })
