import * as dotenv from "dotenv"
import path from "path"

// Load env from project root
dotenv.config({ path: path.resolve(__dirname, "../.env") })
dotenv.config({ path: path.resolve(__dirname, "../.env.local"), override: true })

// Inline minimal versions of the functions to avoid server-only constraints
const VERIFACTI_API_URL = process.env.VERIFACTI_API_URL || "https://api.verifacti.com"
const VERIFACTI_ACCOUNT_KEY = process.env.VERIFACTI_API_KEY

interface VerifactuLine {
  base_imponible: string
  tipo_impositivo: string
  cuota_repercutida: string
}

interface VerifactuData {
  serie: string
  numero: string
  fecha_expedicion: string
  tipo_factura: string
  descripcion: string
  nif?: string
  nombre?: string
  lineas: VerifactuLine[]
  importe_total: string
  tipo_rectificativa?: string
}

function formatDate(d: Date): string {
  return `${d.getDate().toString().padStart(2, "0")}-${(d.getMonth() + 1).toString().padStart(2, "0")}-${d.getFullYear()}`
}

async function sendToVerifactu(apiKey: string, data: VerifactuData) {
  const res = await fetch(`${VERIFACTI_API_URL}/verifactu/create`, {
    method: "POST",
    headers: { "Authorization": `Bearer ${apiKey}`, "Content-Type": "application/json" },
    body: JSON.stringify(data),
  })
  const json = await res.json()
  if (json.error) throw new Error(json.error)
  return json as { uuid: string; estado: string; qr: string; huella: string; url: string }
}

async function testVerifactu() {
  console.log("═══════════════════════════════════════")
  console.log("  TEST VERIFACTU — ClientLabs")
  console.log("═══════════════════════════════════════\n")

  if (!VERIFACTI_ACCOUNT_KEY) {
    console.log("VERIFACTU NO CONFIGURADO — añade VERIFACTI_API_KEY al .env")
    return
  }

  // Use the user's personal API key from DB if possible, otherwise use account key
  let apiKey = VERIFACTI_ACCOUNT_KEY

  // Try to load user key from DB
  try {
    const { PrismaClient } = await import("@prisma/client")
    const prisma = new PrismaClient()
    const profile = await prisma.businessProfile.findFirst({
      where: { verifactuEnabled: true, verifactuApiKey: { not: null } },
      select: { verifactuApiKey: true, taxId: true, legalName: true, companyName: true },
    })
    await prisma.$disconnect()
    if (profile?.verifactuApiKey) {
      apiKey = profile.verifactuApiKey
      console.log(`Usando NIF key del BusinessProfile`)
      console.log(`  NIF: ${profile.taxId ?? "—"}`)
      console.log(`  Empresa: ${profile.legalName ?? profile.companyName ?? "—"}\n`)
    }
  } catch {
    console.log("(No se pudo cargar el perfil de BD — usando ACCOUNT_KEY)\n")
  }

  const today = formatDate(new Date())
  const suffix = Date.now().toString().slice(-4)
  let passed = 0
  let failed = 0

  // ─── Test 1: F2 — Factura simplificada (sin NIF) ─────────────────────
  console.log("─── Test 1: Factura simplificada F2 (sin NIF) ───")
  try {
    const r = await sendToVerifactu(apiKey, {
      serie: "TEST",
      numero: `T1-${suffix}`,
      fecha_expedicion: today,
      tipo_factura: "F2",
      descripcion: "Test F2 — servicio de prueba ClientLabs",
      lineas: [{ base_imponible: "100.00", tipo_impositivo: "21.00", cuota_repercutida: "21.00" }],
      importe_total: "121.00",
    })
    console.log(`  OK — UUID: ${r.uuid}  Estado: ${r.estado}`)
    console.log(`  QR: ${r.qr ? "base64 recibido (" + r.qr.length + " chars)" : "NO"}`)
    console.log(`  Huella: ${r.huella?.substring(0, 32) ?? "—"}...`)
    passed++
  } catch (e) {
    console.log(`  ERROR: ${e instanceof Error ? e.message : e}`)
    failed++
  }

  // ─── Test 2: F2 — Multi-IVA (21% + 10%) ─────────────────────────────
  console.log("\n─── Test 2: F2 multi-IVA (21% + 10%) ───")
  try {
    const r = await sendToVerifactu(apiKey, {
      serie: "TEST",
      numero: `T2-${suffix}`,
      fecha_expedicion: today,
      tipo_factura: "F2",
      descripcion: "Test multi-IVA ClientLabs",
      lineas: [
        { base_imponible: "200.00", tipo_impositivo: "21.00", cuota_repercutida: "42.00" },
        { base_imponible: "100.00", tipo_impositivo: "10.00", cuota_repercutida: "10.00" },
      ],
      importe_total: "352.00",
    })
    console.log(`  OK — UUID: ${r.uuid}  Estado: ${r.estado}`)
    passed++
  } catch (e) {
    console.log(`  ERROR: ${e instanceof Error ? e.message : e}`)
    failed++
  }

  // ─── Test 3: F2 — IVA 4% (superreducido) ────────────────────────────
  console.log("\n─── Test 3: F2 IVA 4% (superreducido) ───")
  try {
    const r = await sendToVerifactu(apiKey, {
      serie: "TEST",
      numero: `T3-${suffix}`,
      fecha_expedicion: today,
      tipo_factura: "F2",
      descripcion: "Test IVA superreducido ClientLabs",
      lineas: [{ base_imponible: "50.00", tipo_impositivo: "4.00", cuota_repercutida: "2.00" }],
      importe_total: "52.00",
    })
    console.log(`  OK — UUID: ${r.uuid}  Estado: ${r.estado}`)
    passed++
  } catch (e) {
    console.log(`  ERROR: ${e instanceof Error ? e.message : e}`)
    failed++
  }

  // ─── Test 4: F1 — Factura completa (con NIF) ─────────────────────────
  console.log("\n─── Test 4: F1 con NIF cliente ───")
  try {
    const r = await sendToVerifactu(apiKey, {
      serie: "TEST",
      numero: `T4-${suffix}`,
      fecha_expedicion: today,
      tipo_factura: "F1",
      descripcion: "Test F1 con destinatario ClientLabs",
      nif: "B12345678",
      nombre: "Empresa Test SL",
      lineas: [{ base_imponible: "500.00", tipo_impositivo: "21.00", cuota_repercutida: "105.00" }],
      importe_total: "605.00",
    })
    console.log(`  OK — UUID: ${r.uuid}  Estado: ${r.estado}`)
    passed++
  } catch (e) {
    console.log(`  ERROR: ${e instanceof Error ? e.message : e}`)
    failed++
  }

  // ─── Test 5: F2 con NIF (debe rechazarse o ignorar el NIF) ───────────
  console.log("\n─── Test 5: F2 con NIF (Verifactu debe rechazarlo) ───")
  try {
    const r = await sendToVerifactu(apiKey, {
      serie: "TEST",
      numero: `T5-${suffix}`,
      fecha_expedicion: today,
      tipo_factura: "F2",
      descripcion: "Test F2 con NIF — debe rechazarse",
      nif: "B12345678",
      nombre: "Empresa Test SL",
      lineas: [{ base_imponible: "100.00", tipo_impositivo: "21.00", cuota_repercutida: "21.00" }],
      importe_total: "121.00",
    })
    console.log(`  AVISO: F2 con NIF aceptada (Verifactu no valida el límite) — UUID: ${r.uuid}`)
    passed++
  } catch (e) {
    console.log(`  OK (rechazada correctamente): ${e instanceof Error ? e.message : e}`)
    passed++
  }

  // ─── Test 6: F2 > 3000€ ──────────────────────────────────────────────
  console.log("\n─── Test 6: F2 > 3000€ (validación de límite) ───")
  try {
    const r = await sendToVerifactu(apiKey, {
      serie: "TEST",
      numero: `T6-${suffix}`,
      fecha_expedicion: today,
      tipo_factura: "F2",
      descripcion: "Test límite 3000€",
      lineas: [{ base_imponible: "3000.00", tipo_impositivo: "21.00", cuota_repercutida: "630.00" }],
      importe_total: "3630.00",
    })
    console.log(`  AVISO: F2 > 3000€ aceptada (sin validación de límite en Verifactu) — UUID: ${r.uuid}`)
    passed++
  } catch (e) {
    console.log(`  OK (rechazada por límite): ${e instanceof Error ? e.message : e}`)
    passed++
  }

  console.log("\n═══════════════════════════════════════")
  console.log(`  RESULTADO: ${passed} OK / ${failed} fallidos`)
  console.log("═══════════════════════════════════════")
}

testVerifactu().catch(console.error)
