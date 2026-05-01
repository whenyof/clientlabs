/**
 * Script: Test completo de todos los tipos de factura Verifactu
 * Uso: npx tsx scripts/test-verifactu-complete.ts
 */
import * as dotenv from "dotenv"
import * as path from "path"

dotenv.config({ path: path.resolve(process.cwd(), ".env.local") })
dotenv.config({ path: path.resolve(process.cwd(), ".env") })

import { PrismaClient } from "@prisma/client"
import {
  createVerifactuInvoice,
  getVerifactuStatus,
  cancelVerifactuInvoice,
  formatDateForVerifactu,
  type VerifactuCreateData,
  type VerifactuResponse,
  type VerifactuStatusResponse,
} from "../lib/verifactu"

const prisma = new PrismaClient()

// ══════════════════════════════════════
// CONFIG
// ══════════════════════════════════════

const TODAY = formatDateForVerifactu(new Date())
const TS    = Date.now().toString().slice(-6)
const SERIE = `TST${TS}`

// NIF y nombre deben coincidir con los datos registrados en AEAT del perfil
// (self-billing scenario: usamos nuestro propio NIF para evitar validación de terceros)
const TEST_NIF    = "53514356A"
const TEST_NOMBRE = "ClientLabs"

// Línea 21% → base 642.15 + cuota 134.85 = 777.00
const L21: VerifactuCreateData["lineas"][0] = {
  base_imponible:   "642.15",
  tipo_impositivo:  "21",
  cuota_repercutida: "134.85",
}
// Multi-IVA: (400+84) + (250+25) + (17.31+0.69) = 484 + 275 + 18 = 777.00
const L21m = { base_imponible: "400.00",  tipo_impositivo: "21", cuota_repercutida: "84.00" }
const L10m = { base_imponible: "250.00",  tipo_impositivo: "10", cuota_repercutida: "25.00" }
const L4m  = { base_imponible:  "17.31",  tipo_impositivo:  "4", cuota_repercutida:  "0.69" }

// ══════════════════════════════════════
// TYPES
// ══════════════════════════════════════

type TestStatus = "OK" | "FAIL" | "WARN"

type TestResult = {
  name:     string
  status:   TestStatus
  response?: unknown
  error?:   string
  uuid?:    string
}

const results: TestResult[] = []

// ══════════════════════════════════════
// HELPERS
// ══════════════════════════════════════

function bar(char = "═", n = 62) { return char.repeat(n) }

function section(title: string) {
  console.log(`\n${bar()}`)
  console.log(`  ${title}`)
  console.log(bar())
}

async function runTest(
  name: string,
  fn: () => Promise<unknown>,
  opts: { expectFail?: boolean } = {}
): Promise<{ ok: boolean; uuid?: string; data?: unknown }> {
  section(`TEST: ${name}`)
  try {
    const data = await fn()
    const res = data as (VerifactuResponse | VerifactuStatusResponse) & { error?: string }

    if (res?.error && !opts.expectFail) {
      console.log(`  RESULTADO: FAIL`)
      console.log(`  Error: ${res.error}`)
      results.push({ name, status: "FAIL", response: data, error: res.error })
      return { ok: false, data }
    }

    if (opts.expectFail) {
      if (res?.error) {
        console.log(`  RESULTADO: WARN (error esperado — ${res.error})`)
        results.push({ name, status: "WARN", response: data, error: res.error })
      } else {
        console.log(`  RESULTADO: WARN (se esperaba error pero la API lo aceptó)`)
        results.push({ name, status: "WARN", response: data })
      }
      return { ok: true, data }
    }

    const r = res as VerifactuResponse
    console.log(`  RESULTADO: OK`)
    if (r.estado) console.log(`  Estado:  ${r.estado}`)
    if (r.uuid)   console.log(`  UUID:    ${r.uuid}`)
    if (r.url)    console.log(`  URL:     ${r.url}`)
    if (r.huella) console.log(`  Huella:  ${r.huella.slice(0, 32)}...`)

    results.push({ name, status: "OK", response: data, uuid: r.uuid })
    return { ok: true, uuid: r.uuid, data }
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : String(e)
    console.log(`  RESULTADO: FAIL`)
    console.log(`  Error: ${msg}`)
    results.push({ name, status: "FAIL", error: msg })
    return { ok: false }
  }
}

function skip(name: string, reason: string) {
  console.log(`\n  [SKIP] ${name}`)
  console.log(`         → ${reason}`)
  results.push({ name, status: "WARN", error: `Skipped: ${reason}` })
}

// ══════════════════════════════════════
// GET API KEY
// ══════════════════════════════════════

async function getNifApiKey(): Promise<string> {
  const profile = await prisma.businessProfile.findFirst({
    where: { verifactuEnabled: true, verifactuApiKey: { not: null } },
    select: { verifactuApiKey: true },
  })
  if (profile?.verifactuApiKey) return profile.verifactuApiKey

  const envKey = process.env.VERIFACTI_API_KEY
  if (envKey) return envKey

  throw new Error("No hay VERIFACTI_API_KEY en env ni BusinessProfile con verifactuApiKey configurado")
}

// ══════════════════════════════════════
// MAIN
// ══════════════════════════════════════

async function main() {
  console.log("╔══════════════════════════════════════════════════════════════╗")
  console.log("║   TEST COMPLETO VERIFACTU — TODOS LOS TIPOS DE FACTURA      ║")
  console.log("╚══════════════════════════════════════════════════════════════╝")
  console.log(`\nSerie de prueba : ${SERIE}`)
  console.log(`Fecha           : ${TODAY}`)

  let nifApiKey: string
  try {
    nifApiKey = await getNifApiKey()
    const masked = `${nifApiKey.slice(0, 10)}...${nifApiKey.slice(-4)}`
    console.log(`NIF API Key     : ${masked}`)
    console.log(`Modo            : ${nifApiKey.startsWith("vf_test_") ? "TEST / sandbox" : "PRODUCCIÓN"}`)
  } catch (e: unknown) {
    console.error("\nERROR:", e instanceof Error ? e.message : e)
    await prisma.$disconnect()
    process.exit(1)
  }

  // Guardamos referencias para tests posteriores
  let f1Uuid: string | undefined
  let f2Uuid: string | undefined

  // ─────────────────────────────────────────────────────────────
  // TEST 1 — F1 factura completa (NIF, 21%)
  // ─────────────────────────────────────────────────────────────
  const t1 = await runTest("F1 — Factura completa (NIF, 21% IVA, 777€)", () =>
    createVerifactuInvoice(nifApiKey, {
      serie:            SERIE,
      numero:           "F1-001",
      fecha_expedicion: TODAY,
      tipo_factura:     "F1",
      descripcion:      "Servicio de consultoría empresarial",
      nif:              TEST_NIF,
      nombre:           TEST_NOMBRE,
      lineas:           [L21],
      importe_total:    "777",
    })
  )
  if (t1.ok) f1Uuid = t1.uuid

  // ─────────────────────────────────────────────────────────────
  // TEST 2 — F2 simplificada sin NIF (21%)
  // ─────────────────────────────────────────────────────────────
  const t2 = await runTest("F2 — Factura simplificada (sin NIF, 21% IVA, 777€)", () =>
    createVerifactuInvoice(nifApiKey, {
      serie:            SERIE,
      numero:           "F2-001",
      fecha_expedicion: TODAY,
      tipo_factura:     "F2",
      descripcion:      "Venta al público — servicio estético",
      lineas:           [L21],
      importe_total:    "777",
    })
  )
  if (t2.ok) f2Uuid = t2.uuid

  // ─────────────────────────────────────────────────────────────
  // TEST 3 — F2 10% IVA
  // base 706.36 + cuota 70.64 = 777.00
  // ─────────────────────────────────────────────────────────────
  await runTest("F2 — Factura simplificada (10% IVA, 777€)", () =>
    createVerifactuInvoice(nifApiKey, {
      serie:            SERIE,
      numero:           "F2-002",
      fecha_expedicion: TODAY,
      tipo_factura:     "F2",
      descripcion:      "Servicio de hostelería — tipo reducido",
      lineas:           [{ base_imponible: "706.36", tipo_impositivo: "10", cuota_repercutida: "70.64" }],
      importe_total:    "777",
    })
  )

  // ─────────────────────────────────────────────────────────────
  // TEST 4 — F2 4% IVA
  // base 747.11 + cuota 29.89 = 777.00
  // ─────────────────────────────────────────────────────────────
  await runTest("F2 — Factura simplificada (4% IVA, 777€)", () =>
    createVerifactuInvoice(nifApiKey, {
      serie:            SERIE,
      numero:           "F2-003",
      fecha_expedicion: TODAY,
      tipo_factura:     "F2",
      descripcion:      "Venta de producto de primera necesidad",
      lineas:           [{ base_imponible: "747.11", tipo_impositivo: "4", cuota_repercutida: "29.89" }],
      importe_total:    "777",
    })
  )

  // ─────────────────────────────────────────────────────────────
  // TEST 5 — F2 multi-IVA (21% + 10% + 4%)
  // 484 + 275 + 18 = 777.00
  // ─────────────────────────────────────────────────────────────
  const t5 = await runTest("F2 — Multi-IVA (21%+10%+4%, total 777€)", () =>
    createVerifactuInvoice(nifApiKey, {
      serie:            SERIE,
      numero:           "F2-004",
      fecha_expedicion: TODAY,
      tipo_factura:     "F2",
      descripcion:      "Venta mixta con distintos tipos de IVA",
      lineas:           [L21m, L10m, L4m],
      importe_total:    "777",
    })
  )

  // ─────────────────────────────────────────────────────────────
  // TEST 6 — F2 > 3.000€ (límite legal — esperamos rechazo)
  // ─────────────────────────────────────────────────────────────
  await runTest("F2 > 3.000€ (límite legal — se espera error o advertencia)", () =>
    createVerifactuInvoice(nifApiKey, {
      serie:            SERIE,
      numero:           "F2-BIG",
      fecha_expedicion: TODAY,
      tipo_factura:     "F2",
      descripcion:      "Test límite factura simplificada — importe prohibido",
      lineas:           [{ base_imponible: "2479.34", tipo_impositivo: "21", cuota_repercutida: "520.66" }],
      importe_total:    "3000",
    }),
    { expectFail: true }
  )

  // ─────────────────────────────────────────────────────────────
  // TEST 7 — R1 rectificativa de F1 (por diferencias)
  // ─────────────────────────────────────────────────────────────
  if (f1Uuid) {
    await runTest("R1 — Rectificativa de F1 (por diferencias, -777€)", () =>
      createVerifactuInvoice(nifApiKey, {
        serie:                     SERIE,
        numero:                    "R1-001",
        fecha_expedicion:          TODAY,
        tipo_factura:              "R1",
        descripcion:               "Rectificación por error en tipo impositivo aplicado",
        nif:                       TEST_NIF,
        nombre:                    TEST_NOMBRE,
        lineas:                    [{ base_imponible: "-642.15", tipo_impositivo: "21", cuota_repercutida: "-134.85" }],
        importe_total:             "-777",
        tipo_rectificativa:        "I",
        factura_rectificada_serie:  SERIE,
        factura_rectificada_numero: "F1-001",
        factura_rectificada_fecha:  TODAY,
        importe_rectificativa: {
          base_rectificada:  "-642.15",
          cuota_rectificada: "-134.85",
        },
      })
    )
  } else {
    skip("R1 — Rectificativa de F1 (por diferencias, -777€)", "F1-001 no se creó correctamente")
  }

  // ─────────────────────────────────────────────────────────────
  // TEST 8 — R4 rectificativa (otras causas, por sustitución)
  // ─────────────────────────────────────────────────────────────
  await runTest("R4 — Rectificativa (otras causas, por sustitución, 777€)", () =>
    createVerifactuInvoice(nifApiKey, {
      serie:                     SERIE,
      numero:                    "R4-001",
      fecha_expedicion:          TODAY,
      tipo_factura:              "R4",
      descripcion:               "Rectificación por error en nombre del destinatario",
      nif:                       TEST_NIF,
      nombre:                    TEST_NOMBRE,
      lineas:                    [L21],
      importe_total:             "777",
      tipo_rectificativa:        "S",
      factura_rectificada_serie:  SERIE,
      factura_rectificada_numero: "F1-001",
      factura_rectificada_fecha:  TODAY,
      importe_rectificativa: {
        base_rectificada:  "642.15",
        cuota_rectificada: "134.85",
      },
    })
  )

  // ─────────────────────────────────────────────────────────────
  // TEST 9 — R5 rectificativa de F2 (por diferencias)
  // Nota: importe_rectificativa SOLO se usa con tipo_rectificativa "S".
  //       Para método "I" (diferencias) se omite ese campo.
  // ─────────────────────────────────────────────────────────────
  if (f2Uuid) {
    await runTest("R5 — Rectificativa de F2 (por diferencias, -777€)", () =>
      createVerifactuInvoice(nifApiKey, {
        serie:                     SERIE,
        numero:                    "R5-001",
        fecha_expedicion:          TODAY,
        tipo_factura:              "R5",
        descripcion:               "Rectificación de factura simplificada por importe incorrecto",
        lineas:                    [{ base_imponible: "-642.15", tipo_impositivo: "21", cuota_repercutida: "-134.85" }],
        importe_total:             "-777",
        tipo_rectificativa:        "I",
        factura_rectificada_serie:  SERIE,
        factura_rectificada_numero: "F2-001",
        factura_rectificada_fecha:  TODAY,
        // importe_rectificativa omitido: solo válido con tipo_rectificativa "S"
      })
    )
  } else {
    skip("R5 — Rectificativa de F2 (por diferencias, -777€)", "F2-001 no se creó correctamente")
  }

  // ─────────────────────────────────────────────────────────────
  // TEST 10 — STATUS: consultar estado (F1 o F2 como fallback)
  // ─────────────────────────────────────────────────────────────
  const statusUuid = f1Uuid ?? f2Uuid
  const statusLabel = f1Uuid ? "F1" : "F2"
  if (statusUuid) {
    await runTest(`STATUS — Consulta estado UUID ${statusLabel} (${statusUuid.slice(0, 8)}...)`, async () => {
      const status = await getVerifactuStatus(nifApiKey, statusUuid)
      const s = status as VerifactuStatusResponse
      console.log(`  Estado:  ${s.estado}`)
      if (s.mensaje_error) console.log(`  Error:   ${s.mensaje_error}`)
      return status
    })
  } else {
    skip("STATUS — Consulta estado", "Ninguna factura se creó correctamente")
  }

  // ─────────────────────────────────────────────────────────────
  // TEST 11 — ANULACIÓN: cancelar F2 multi-IVA (F2-004)
  // ─────────────────────────────────────────────────────────────
  const multiIvaOk = t5.ok
  if (multiIvaOk) {
    await runTest("ANULACIÓN — Cancelar F2 multi-IVA (F2-004)", () =>
      cancelVerifactuInvoice(nifApiKey, SERIE, "F2-004", TODAY)
    )
  } else {
    skip("ANULACIÓN — Cancelar F2 multi-IVA (F2-004)", "F2-004 no se creó correctamente")
  }

  // ══════════════════════════════════════
  // INFORME FINAL
  // ══════════════════════════════════════

  console.log("\n\n╔══════════════════════════════════════════════════════════════╗")
  console.log("║                       INFORME FINAL                         ║")
  console.log("╚══════════════════════════════════════════════════════════════╝\n")

  const ok   = results.filter(r => r.status === "OK").length
  const warn = results.filter(r => r.status === "WARN").length
  const fail = results.filter(r => r.status === "FAIL").length

  console.log(`  Tests ejecutados : ${results.length}`)
  console.log(`  OK               : ${ok}`)
  console.log(`  WARN/SKIP        : ${warn}  (esperados o skipped)`)
  console.log(`  FAIL             : ${fail}`)
  console.log("")

  for (const r of results) {
    const icon = r.status === "OK" ? "✓" : r.status === "WARN" ? "~" : "✗"
    console.log(`  [${icon}] ${r.name}`)
    if (r.error) console.log(`       → ${r.error}`)
    if (r.uuid)  console.log(`       → UUID: ${r.uuid}`)
  }

  console.log("")
  if (fail === 0) {
    console.log("  Todos los tests completados. Sin errores inesperados.")
  } else {
    console.log(`  ${fail} test(s) fallaron. Revisa los errores en el log.`)
  }
  console.log("")

  await prisma.$disconnect()
}

main().catch(e => {
  console.error("ERROR FATAL:", e)
  process.exit(1)
})
