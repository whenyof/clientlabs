/**
 * Script: Re-test Verifactu — F1 y rectificativas con NIF real
 * Uso: npx tsx scripts/test-verifactu-f1.ts
 */
import * as dotenv from "dotenv"
import * as path from "path"

dotenv.config({ path: path.resolve(process.cwd(), ".env.local") })
dotenv.config({ path: path.resolve(process.cwd(), ".env") })

import { PrismaClient } from "@prisma/client"
import {
  createVerifactuInvoice,
  formatDateForVerifactu,
  type VerifactuResponse,
} from "../lib/verifactu"

const prisma = new PrismaClient()

// 777€ IVA incluido (21%)
const BASE_21  = 642.15
const IVA_21   = 134.85
const TOTAL    = 777.00

// NIF y nombre reales — deben coincidir con el censo AEAT
const NIF_REAL    = "53514356A"
const NOMBRE_REAL = "Iyan Rimada Serrano"

const HOY = formatDateForVerifactu(new Date())
const TS  = Date.now().toString().slice(-4)
let counter = 1

function num(): string {
  return `F1T-${TS}-${counter++}`
}

function sleep(ms: number) {
  return new Promise(r => setTimeout(r, ms))
}

interface Result {
  test:   string
  status: "OK" | "FAIL"
  uuid?:  string
  estado?: string
  error?: string
}

const results: Result[] = []

async function getNifApiKey(): Promise<string> {
  const profile = await prisma.businessProfile.findFirst({
    where: { verifactuEnabled: true, verifactuApiKey: { not: null } },
    select: { verifactuApiKey: true },
  })
  if (profile?.verifactuApiKey) return profile.verifactuApiKey
  const envKey = process.env.VERIFACTI_API_KEY
  if (envKey) return envKey
  throw new Error("No hay VERIFACTI_API_KEY en env ni BusinessProfile con verifactuApiKey")
}

function ok(test: string, r: VerifactuResponse) {
  console.log(`   OK  — UUID: ${r.uuid}  Estado: ${r.estado}`)
  results.push({ test, status: "OK", uuid: r.uuid, estado: r.estado })
}

function fail(test: string, e: unknown) {
  const msg = e instanceof Error ? e.message : String(e)
  console.log(`   FAIL: ${msg}`)
  results.push({ test, status: "FAIL", error: msg })
}

async function run() {
  console.log("╔══════════════════════════════════════════════════════════╗")
  console.log("║   RE-TEST VERIFACTU — F1 + R1 + R2 + R3 + R4(S) + R4(I) ║")
  console.log(`║   NIF: ${NIF_REAL} · Nombre: ${NOMBRE_REAL}   ║`)
  console.log("║   Todas las facturas: 777€ IVA incluido (21%)            ║")
  console.log("╚══════════════════════════════════════════════════════════╝\n")

  const nifApiKey = await getNifApiKey()
  const masked = `${nifApiKey.slice(0, 10)}...${nifApiKey.slice(-4)}`
  console.log(`NIF API Key : ${masked}`)
  console.log(`Modo        : ${nifApiKey.startsWith("vf_test_") ? "TEST / sandbox" : "PRODUCCIÓN"}`)
  console.log(`Fecha       : ${HOY}\n`)

  let f1Numero = ""

  // ═══════════════════════════════════════════════════════════
  // TEST 1: F1 — Factura completa con NIF real
  // ═══════════════════════════════════════════════════════════
  f1Numero = num()
  console.log(`─── Test 1: F1 — Factura completa (numero: ${f1Numero}) ───`)
  try {
    const r = await createVerifactuInvoice(nifApiKey, {
      serie:            "TEST",
      numero:           f1Numero,
      fecha_expedicion: HOY,
      tipo_factura:     "F1",
      descripcion:      "Test F1 completa — 777€",
      nif:              NIF_REAL,
      nombre:           NOMBRE_REAL,
      lineas: [{
        base_imponible:    BASE_21.toFixed(2),
        tipo_impositivo:   "21",
        cuota_repercutida: IVA_21.toFixed(2),
      }],
      importe_total: TOTAL.toFixed(2),
    })
    ok("F1 completa", r)
  } catch (e) { fail("F1 completa", e) }
  await sleep(1500)

  // ═══════════════════════════════════════════════════════════
  // TEST 2: R1 — Error legal/fiscal (por sustitución)
  // ═══════════════════════════════════════════════════════════
  console.log(`\n─── Test 2: R1 — Error legal/fiscal (sustitución, refs ${f1Numero}) ───`)
  try {
    const r = await createVerifactuInvoice(nifApiKey, {
      serie:            "TEST",
      numero:           num(),
      fecha_expedicion: HOY,
      tipo_factura:     "R1",
      descripcion:      "Test R1 — Error en tipo IVA aplicado",
      nif:              NIF_REAL,
      nombre:           NOMBRE_REAL,
      lineas: [{
        base_imponible:    (-BASE_21).toFixed(2),
        tipo_impositivo:   "21",
        cuota_repercutida: (-IVA_21).toFixed(2),
      }],
      importe_total:             (-TOTAL).toFixed(2),
      tipo_rectificativa:        "S",
      factura_rectificada_serie:  "TEST",
      factura_rectificada_numero: f1Numero,
      factura_rectificada_fecha:  HOY,
      importe_rectificativa: {
        base_rectificada:  BASE_21.toFixed(2),
        cuota_rectificada: IVA_21.toFixed(2),
      },
    })
    ok("R1 error legal (sust.)", r)
  } catch (e) { fail("R1 error legal (sust.)", e) }
  await sleep(1500)

  // ═══════════════════════════════════════════════════════════
  // TEST 3: R2 — Concurso de acreedores (por sustitución)
  // ═══════════════════════════════════════════════════════════
  console.log(`\n─── Test 3: R2 — Concurso de acreedores (sustitución) ───`)
  try {
    const r = await createVerifactuInvoice(nifApiKey, {
      serie:            "TEST",
      numero:           num(),
      fecha_expedicion: HOY,
      tipo_factura:     "R2",
      descripcion:      "Test R2 — Concurso de acreedores",
      nif:              NIF_REAL,
      nombre:           NOMBRE_REAL,
      lineas: [{
        base_imponible:    (-BASE_21).toFixed(2),
        tipo_impositivo:   "21",
        cuota_repercutida: (-IVA_21).toFixed(2),
      }],
      importe_total:             (-TOTAL).toFixed(2),
      tipo_rectificativa:        "S",
      factura_rectificada_serie:  "TEST",
      factura_rectificada_numero: f1Numero,
      factura_rectificada_fecha:  HOY,
      importe_rectificativa: {
        base_rectificada:  BASE_21.toFixed(2),
        cuota_rectificada: IVA_21.toFixed(2),
      },
    })
    ok("R2 concurso acreedores", r)
  } catch (e) { fail("R2 concurso acreedores", e) }
  await sleep(1500)

  // ═══════════════════════════════════════════════════════════
  // TEST 4: R3 — Crédito incobrable (por sustitución)
  // ═══════════════════════════════════════════════════════════
  console.log(`\n─── Test 4: R3 — Crédito incobrable (sustitución) ───`)
  try {
    const r = await createVerifactuInvoice(nifApiKey, {
      serie:            "TEST",
      numero:           num(),
      fecha_expedicion: HOY,
      tipo_factura:     "R3",
      descripcion:      "Test R3 — Crédito incobrable Art. 80.Cuatro LIVA",
      nif:              NIF_REAL,
      nombre:           NOMBRE_REAL,
      lineas: [{
        base_imponible:    (-BASE_21).toFixed(2),
        tipo_impositivo:   "21",
        cuota_repercutida: (-IVA_21).toFixed(2),
      }],
      importe_total:             (-TOTAL).toFixed(2),
      tipo_rectificativa:        "S",
      factura_rectificada_serie:  "TEST",
      factura_rectificada_numero: f1Numero,
      factura_rectificada_fecha:  HOY,
      importe_rectificativa: {
        base_rectificada:  BASE_21.toFixed(2),
        cuota_rectificada: IVA_21.toFixed(2),
      },
    })
    ok("R3 crédito incobrable", r)
  } catch (e) { fail("R3 crédito incobrable", e) }
  await sleep(1500)

  // ═══════════════════════════════════════════════════════════
  // TEST 5: R4 — Otras causas (por sustitución, -777€)
  // ═══════════════════════════════════════════════════════════
  console.log(`\n─── Test 5: R4 — Otras causas (sustitución, -777€) ───`)
  try {
    const r = await createVerifactuInvoice(nifApiKey, {
      serie:            "TEST",
      numero:           num(),
      fecha_expedicion: HOY,
      tipo_factura:     "R4",
      descripcion:      "Test R4 sustitución — Error en nombre del destinatario",
      nif:              NIF_REAL,
      nombre:           NOMBRE_REAL,
      lineas: [{
        base_imponible:    (-BASE_21).toFixed(2),
        tipo_impositivo:   "21",
        cuota_repercutida: (-IVA_21).toFixed(2),
      }],
      importe_total:             (-TOTAL).toFixed(2),
      tipo_rectificativa:        "S",
      factura_rectificada_serie:  "TEST",
      factura_rectificada_numero: f1Numero,
      factura_rectificada_fecha:  HOY,
      importe_rectificativa: {
        base_rectificada:  BASE_21.toFixed(2),
        cuota_rectificada: IVA_21.toFixed(2),
      },
    })
    ok("R4 otras causas (sust.)", r)
  } catch (e) { fail("R4 otras causas (sust.)", e) }
  await sleep(1500)

  // ═══════════════════════════════════════════════════════════
  // TEST 6: R4 — Otras causas (por diferencias, ajuste -60.50€)
  // Nota: método "I" → NO se incluye importe_rectificativa
  // ═══════════════════════════════════════════════════════════
  console.log(`\n─── Test 6: R4 — Otras causas (diferencias, ajuste -60.50€) ───`)
  try {
    const adjBase  = 50.00
    const adjIva   = 10.50
    const adjTotal = 60.50
    const r = await createVerifactuInvoice(nifApiKey, {
      serie:            "TEST",
      numero:           num(),
      fecha_expedicion: HOY,
      tipo_factura:     "R4",
      descripcion:      "Test R4 diferencias — Descuento posterior acordado",
      nif:              NIF_REAL,
      nombre:           NOMBRE_REAL,
      lineas: [{
        base_imponible:    (-adjBase).toFixed(2),
        tipo_impositivo:   "21",
        cuota_repercutida: (-adjIva).toFixed(2),
      }],
      importe_total:             (-adjTotal).toFixed(2),
      tipo_rectificativa:        "I",
      factura_rectificada_serie:  "TEST",
      factura_rectificada_numero: f1Numero,
      factura_rectificada_fecha:  HOY,
      // importe_rectificativa omitido: solo válido con tipo "S"
    })
    ok("R4 otras causas (dif.)", r)
  } catch (e) { fail("R4 otras causas (dif.)", e) }

  // ═══════════════════════════════════════════════════════════
  // INFORME FINAL
  // ═══════════════════════════════════════════════════════════
  const okCount   = results.filter(r => r.status === "OK").length
  const failCount = results.filter(r => r.status === "FAIL").length

  console.log("\n╔══════════════════════════════════════════════════════════╗")
  console.log("║               RE-TEST VERIFACTU — RESULTADOS            ║")
  console.log(`║  Total: ${results.length} | OK: ${okCount} | FAIL: ${failCount}${" ".repeat(42 - String(results.length).length - String(okCount).length - String(failCount).length)}║`)
  console.log("╠══════════════════════════════════════════════════════════╣")

  for (const r of results) {
    const icon = r.status === "OK" ? "OK  " : "FAIL"
    console.log(`║  [${icon}] ${r.test}`)
    if (r.uuid)  console.log(`║         UUID:  ${r.uuid}`)
    if (r.estado) console.log(`║         Estado: ${r.estado}`)
    if (r.error) console.log(`║         Error: ${r.error.slice(0, 80)}`)
  }

  console.log("╠══════════════════════════════════════════════════════════╣")
  if (failCount === 0) {
    console.log("║  TODOS LOS TESTS PASADOS                                 ║")
    console.log("║  F1 + R1 + R2 + R3 + R4(S) + R4(I) = TODO OK            ║")
  } else {
    console.log(`║  ${failCount} test(s) fallaron — revisar errores arriba               ║`)
  }
  console.log("╚══════════════════════════════════════════════════════════╝")

  await prisma.$disconnect()
}

run().catch(e => {
  console.error("ERROR FATAL:", e)
  process.exit(1)
})
