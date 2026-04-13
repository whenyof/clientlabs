/**
 * Generador de fichero oficial Modelo 303 (IVA trimestral) — formato BOE
 * El fichero .303 generado se importa directamente en la Sede Electrónica AEAT.
 */

export interface Modelo303Data {
  // Identificación
  nif: string
  nombre: string
  ejercicio: number
  trimestre: 1 | 2 | 3 | 4

  // Casillas IVA devengado (ventas)
  c01_base4?: number     // Base al 4%
  c02_cuota4?: number    // Cuota al 4%
  c04_base10?: number    // Base al 10%
  c05_cuota10?: number   // Cuota al 10%
  c07_base21?: number    // Base al 21%
  c09_cuota21?: number   // Cuota al 21%

  // Casillas IVA deducible (gastos)
  c28_base?: number            // Base IVA gastos corrientes
  c29_cuota?: number           // Cuota IVA gastos corrientes
  c30_baseInversion?: number   // Base IVA bienes de inversión
  c31_cuotaInversion?: number  // Cuota IVA bienes de inversión

  // Cuotas pendientes de trimestres anteriores (c80)
  c80_cuotasAnteriores?: number
}

/** Formatea un número como entero en céntimos, relleno con ceros por la izquierda. */
function formatNum(n: number, len: number, allowNeg = false): string {
  const abs = Math.round(Math.abs(n) * 100)
  const str = abs.toString().padStart(len, "0")
  if (allowNeg && n < 0) {
    // Sustituye el primer '0' por '-' para indicar negativo
    return "-" + str.slice(1)
  }
  return str
}

/**
 * Genera el contenido del fichero .303 en formato texto plano (BOE).
 */
export function generarFichero303(data: Modelo303Data): string {
  const periodo = `${data.trimestre}T`
  const nif = data.nif.toUpperCase().padEnd(9).substring(0, 9)
  const nombre = (data.nombre ?? "").substring(0, 40).padEnd(40)

  const cuotaDevengada =
    (data.c02_cuota4 ?? 0) +
    (data.c05_cuota10 ?? 0) +
    (data.c09_cuota21 ?? 0)

  const cuotaDeducible =
    (data.c29_cuota ?? 0) +
    (data.c31_cuotaInversion ?? 0)

  const resultado = cuotaDevengada - cuotaDeducible

  const tipoDeclaracion =
    resultado > 0 ? "I" :
    resultado < 0 ? "C" : "N"

  const ejercicioStr = data.ejercicio.toString()

  const lineas: string[] = []

  // ─── Tipo 1: Registro identificativo ──────────────────────────────────────
  let tipo1 = ""
  tipo1 += "30"           // Identificador modelo (2)
  tipo1 += ejercicioStr   // Ejercicio fiscal (4)
  tipo1 += periodo.padEnd(2)  // Período (2): "1T", "2T", "3T", "4T"
  tipo1 += nif            // NIF (9)
  tipo1 += nombre         // Nombre / razón social (40)
  tipo1 += tipoDeclaracion // Tipo declaración (1): I/C/N
  lineas.push(tipo1)

  // ─── Tipo 2: Registro de datos ────────────────────────────────────────────
  let tipo2 = ""
  tipo2 += "30"
  tipo2 += ejercicioStr
  tipo2 += periodo.padEnd(2)
  tipo2 += nif

  // Casillas IVA devengado
  tipo2 += formatNum(data.c01_base4 ?? 0, 13)    // C01 — Base 4%
  tipo2 += formatNum(data.c02_cuota4 ?? 0, 13)   // C02 — Cuota 4%
  tipo2 += formatNum(data.c04_base10 ?? 0, 13)   // C04 — Base 10%
  tipo2 += formatNum(data.c05_cuota10 ?? 0, 13)  // C05 — Cuota 10%
  tipo2 += formatNum(data.c07_base21 ?? 0, 13)   // C07 — Base 21%
  tipo2 += formatNum(data.c09_cuota21 ?? 0, 13)  // C09 — Cuota 21%

  // Casillas IVA deducible
  tipo2 += formatNum(data.c28_base ?? 0, 13)           // C28 — Base compras
  tipo2 += formatNum(data.c29_cuota ?? 0, 13)          // C29 — Cuota compras
  tipo2 += formatNum(data.c30_baseInversion ?? 0, 13)  // C30 — Base inversión
  tipo2 += formatNum(data.c31_cuotaInversion ?? 0, 13) // C31 — Cuota inversión

  // Totales calculados
  tipo2 += formatNum(cuotaDevengada, 13)         // C47 — Total cuota devengada
  tipo2 += formatNum(cuotaDeducible, 13)         // C48 — Total cuota deducible
  tipo2 += formatNum(resultado, 13, true)        // C64 — Resultado (puede ser negativo)
  tipo2 += formatNum(resultado > 0 ? resultado : 0, 13) // C69 — A ingresar (nunca negativo)

  lineas.push(tipo2)

  return lineas.join("\r\n") + "\r\n"
}

/** Nombre oficial del fichero según nomenclatura AEAT: NIF_EJERCICIO_PERIODO.303 */
export function nombreFichero303(nif: string, ejercicio: number, trimestre: number): string {
  return `${nif.toUpperCase()}_${ejercicio}_${trimestre}T.303`
}
