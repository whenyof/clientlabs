/**
 * Generador de fichero oficial Modelo 130 (IRPF pago fraccionado) — formato BOE
 * El fichero .130 generado se importa directamente en la Sede Electrónica AEAT.
 *
 * IMPORTANTE: El Modelo 130 usa datos ACUMULADOS del año en curso,
 * no solo del trimestre actual.
 */

export interface Modelo130Data {
  // Identificación
  nif: string
  nombre: string
  ejercicio: number
  trimestre: 1 | 2 | 3 | 4

  // Casilla 01: Ingresos computables acumulados desde el 1 de enero
  c01_ingresosAcumulados: number

  // Casilla 05: Gastos deducibles acumulados desde el 1 de enero
  c05_gastosAcumulados: number

  // Casilla 11: Retenciones soportadas acumuladas
  // (IRPF que te han retenido en las facturas emitidas)
  c11_retenciones?: number

  // Casilla 13: Pagos fraccionados de trimestres anteriores del mismo año
  // (resultados positivos del 130 de trimestres previos ya ingresados)
  c13_pagosPrevios?: number
}

/** Formatea un número como entero en céntimos, relleno con ceros por la izquierda. */
function formatNum(n: number, len: number): string {
  const abs = Math.round(Math.abs(n) * 100)
  return abs.toString().padStart(len, "0")
}

/**
 * Genera el contenido del fichero .130 en formato texto plano (BOE).
 */
export function generarFichero130(data: Modelo130Data): string {
  const periodo = `${data.trimestre}T`
  const nif = data.nif.toUpperCase().padEnd(9).substring(0, 9)
  const nombre = (data.nombre ?? "").substring(0, 40).padEnd(40)

  // Casilla 07: Rendimiento neto (ingresos - gastos, mínimo 0)
  const rendimientoNeto = Math.max(0, data.c01_ingresosAcumulados - data.c05_gastosAcumulados)

  // Casilla 08: 20% del rendimiento neto
  const pago20 = rendimientoNeto * 0.20

  // Casilla 14: Resultado = cuota 20% - retenciones - pagos anteriores (mínimo 0)
  const resultado = Math.max(
    0,
    pago20 - (data.c11_retenciones ?? 0) - (data.c13_pagosPrevios ?? 0)
  )

  const tipoDeclaracion = resultado > 0 ? "I" : "N"
  const ejercicioStr = data.ejercicio.toString()

  const lineas: string[] = []

  // ─── Tipo 1: Registro identificativo ──────────────────────────────────────
  let tipo1 = ""
  tipo1 += "13"               // Identificador modelo 130 (2)
  tipo1 += ejercicioStr       // Ejercicio fiscal (4)
  tipo1 += periodo.padEnd(2)  // Período (2): "1T", "2T", "3T", "4T"
  tipo1 += nif                // NIF (9)
  tipo1 += nombre             // Nombre / razón social (40)
  tipo1 += tipoDeclaracion    // Tipo declaración (1): I/N
  lineas.push(tipo1)

  // ─── Tipo 2: Registro de datos ────────────────────────────────────────────
  let tipo2 = ""
  tipo2 += "13"
  tipo2 += ejercicioStr
  tipo2 += periodo.padEnd(2)
  tipo2 += nif

  tipo2 += formatNum(data.c01_ingresosAcumulados, 13) // C01 — Ingresos acumulados
  tipo2 += formatNum(data.c05_gastosAcumulados, 13)   // C05 — Gastos deducibles acumulados
  tipo2 += formatNum(rendimientoNeto, 13)             // C07 — Rendimiento neto
  tipo2 += formatNum(pago20, 13)                      // C08 — 20% rendimiento neto
  tipo2 += formatNum(data.c11_retenciones ?? 0, 13)   // C11 — Retenciones soportadas
  tipo2 += formatNum(data.c13_pagosPrevios ?? 0, 13)  // C13 — Pagos fraccionados previos
  tipo2 += formatNum(resultado, 13)                   // C14 — Resultado a ingresar

  lineas.push(tipo2)

  return lineas.join("\r\n") + "\r\n"
}

/** Nombre oficial del fichero según nomenclatura AEAT: NIF_EJERCICIO_PERIODO.130 */
export function nombreFichero130(nif: string, ejercicio: number, trimestre: number): string {
  return `${nif.toUpperCase()}_${ejercicio}_${trimestre}T.130`
}
