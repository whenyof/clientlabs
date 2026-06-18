import { prisma } from "@/lib/prisma"

export type Quarter = "q1" | "q2" | "q3" | "q4"

export function isQuarter(s: string): s is Quarter {
  return s === "q1" || s === "q2" || s === "q3" || s === "q4"
}

export function quarterToNum(q: Quarter): 1 | 2 | 3 | 4 {
  return ({ q1: 1, q2: 2, q3: 3, q4: 4 } as const)[q]
}

export function getQuarterDateRange(q: Quarter, year: number): { start: Date; end: Date } {
  switch (q) {
    case "q1": return { start: new Date(year, 0, 1), end: new Date(year, 2, 31, 23, 59, 59) }
    case "q2": return { start: new Date(year, 3, 1), end: new Date(year, 5, 30, 23, 59, 59) }
    case "q3": return { start: new Date(year, 6, 1), end: new Date(year, 8, 30, 23, 59, 59) }
    case "q4": return { start: new Date(year, 9, 1), end: new Date(year, 11, 31, 23, 59, 59) }
  }
}

export function getDeadline(q: Quarter, year: number): Date {
  switch (q) {
    case "q1": return new Date(year, 3, 20)
    case "q2": return new Date(year, 6, 20)
    case "q3": return new Date(year, 9, 20)
    case "q4": return new Date(year + 1, 0, 30)
  }
}

// Estados que NO computan en las liquidaciones (idéntico a los ficheros AEAT):
// los borradores y las facturas anuladas quedan fuera de repercutido, soportado,
// ingresos y gastos. Fuente única para panel y exports → no pueden divergir.
export const NON_FISCAL_STATUSES = ["DRAFT", "CANCELED"] as const

const r2 = (n: number) => +n.toFixed(2)

export type FacturaRow = {
  id: string
  numero: string
  cliente: string
  fecha: string
  base: number
  iva: number
  total: number
  estado: string
}

export type GastoRow = {
  id: string
  fecha: string
  proveedor: string
  concepto: string
  base: number
  iva: number
  total: number
}

export type QuarterFiscals = {
  quarter: Quarter
  year: number
  deadline: Date
  iva: {
    base4: number; cuota4: number
    base10: number; cuota10: number
    base21: number; cuota21: number
    baseImponibleVentas: number; ivaRepercutido: number
    baseImponibleCompras: number; ivaSoportado: number
    ivaResult: number
  }
  irpf: {
    ingresosAcumulados: number
    gastosDeducibles: number
    rendimientoNeto: number
    irpf20: number
    retenciones: number
    pagosAnteriores: number
    irpfResult: number
  }
  facturas: FacturaRow[]
  gastos: GastoRow[]
}

/**
 * Cálculo ÚNICO de las cifras trimestrales (modelos 303 y 130) para un usuario.
 * Usado por el panel y por los exports 303/130: lo que se ve = lo que se presenta.
 *
 * Criterios (= ficheros AEAT):
 *  - Excluye facturas en estado DRAFT/CANCELED en todos los importes.
 *  - 303: por trimestre, IVA repercutido desglosado por tipo desde las líneas
 *    (fallback 21% si la factura no tiene líneas); soportado = gastos VENDOR.
 *  - 130: acumulado del año hasta fin de trimestre; retenciones reales (irpfAmount).
 */
export async function computeQuarterFiscals(
  userId: string,
  quarter: Quarter,
  year: number
): Promise<QuarterFiscals> {
  const { start, end } = getQuarterDateRange(quarter, year)
  const yearStart = new Date(year, 0, 1)
  const excluded = [...NON_FISCAL_STATUSES]

  const [facturasRaw, gastosRaw, facturasAno, gastosAno] = await Promise.all([
    // Ventas del trimestre (IVA repercutido) — con líneas para el desglose por tipo
    prisma.invoice.findMany({
      where: {
        userId,
        type: "CUSTOMER",
        isRectification: false,
        issueDate: { gte: start, lte: end },
        status: { notIn: excluded },
      },
      select: {
        id: true,
        number: true,
        issueDate: true,
        subtotal: true,
        taxAmount: true,
        total: true,
        status: true,
        Client: { select: { name: true, email: true } },
        lines: { select: { taxPercent: true, subtotal: true, taxAmount: true } },
      },
      orderBy: { issueDate: "asc" },
    }),
    // Gastos del trimestre (IVA soportado)
    prisma.invoice.findMany({
      where: {
        userId,
        type: "VENDOR",
        issueDate: { gte: start, lte: end },
        status: { notIn: excluded },
      },
      select: {
        id: true,
        number: true,
        issueDate: true,
        subtotal: true,
        taxAmount: true,
        total: true,
        Provider: { select: { name: true } },
        lines: { select: { description: true }, take: 1 },
      },
      orderBy: { issueDate: "asc" },
    }),
    // Ventas acumuladas del año hasta fin de trimestre (IRPF 130)
    prisma.invoice.findMany({
      where: {
        userId,
        type: "CUSTOMER",
        isRectification: false,
        issueDate: { gte: yearStart, lte: end },
        status: { notIn: excluded },
      },
      select: { subtotal: true, irpfAmount: true },
    }),
    // Gastos acumulados del año hasta fin de trimestre (IRPF 130)
    prisma.invoice.findMany({
      where: {
        userId,
        type: "VENDOR",
        issueDate: { gte: yearStart, lte: end },
        status: { notIn: excluded },
      },
      select: { subtotal: true },
    }),
  ])

  // --- 303: desglose por tipo de IVA desde las líneas ---
  let base4 = 0, cuota4 = 0, base10 = 0, cuota10 = 0, base21 = 0, cuota21 = 0
  for (const f of facturasRaw) {
    if (f.lines.length > 0) {
      for (const l of f.lines) {
        const rate = Number(l.taxPercent ?? 21)
        const b = Number(l.subtotal ?? 0)
        const c = Number(l.taxAmount ?? 0)
        if (rate <= 4) { base4 += b; cuota4 += c }
        else if (rate <= 10) { base10 += b; cuota10 += c }
        else { base21 += b; cuota21 += c }
      }
    } else {
      base21 += Number(f.subtotal ?? 0)
      cuota21 += Number(f.taxAmount ?? 0)
    }
  }
  const baseImponibleVentas = base4 + base10 + base21
  const ivaRepercutido = cuota4 + cuota10 + cuota21
  const baseImponibleCompras = gastosRaw.reduce((s, g) => s + Number(g.subtotal), 0)
  const ivaSoportado = gastosRaw.reduce((s, g) => s + Number(g.taxAmount), 0)
  const ivaResult = ivaRepercutido - ivaSoportado

  // --- 130: acumulado del año, retenciones reales ---
  const ingresosAcumulados = facturasAno.reduce((s, f) => s + Number(f.subtotal ?? 0), 0)
  const gastosDeducibles = gastosAno.reduce((s, g) => s + Number(g.subtotal ?? 0), 0)
  const rendimientoNeto = ingresosAcumulados - gastosDeducibles
  const irpf20 = rendimientoNeto > 0 ? rendimientoNeto * 0.2 : 0
  const retenciones = facturasAno.reduce((s, f) => s + Number(f.irpfAmount ?? 0), 0)
  // pagosAnteriores: hoy 0 (pendiente de decisión fiscal — ver diagnóstico)
  const pagosAnteriores = 0
  const irpfResult = Math.max(0, irpf20 - retenciones - pagosAnteriores)

  return {
    quarter,
    year,
    deadline: getDeadline(quarter, year),
    iva: {
      base4: r2(base4), cuota4: r2(cuota4),
      base10: r2(base10), cuota10: r2(cuota10),
      base21: r2(base21), cuota21: r2(cuota21),
      baseImponibleVentas: r2(baseImponibleVentas),
      ivaRepercutido: r2(ivaRepercutido),
      baseImponibleCompras: r2(baseImponibleCompras),
      ivaSoportado: r2(ivaSoportado),
      ivaResult: r2(ivaResult),
    },
    irpf: {
      ingresosAcumulados: r2(ingresosAcumulados),
      gastosDeducibles: r2(gastosDeducibles),
      rendimientoNeto: r2(rendimientoNeto),
      irpf20: r2(irpf20),
      retenciones: r2(retenciones),
      pagosAnteriores,
      irpfResult: r2(irpfResult),
    },
    facturas: facturasRaw.map((f) => ({
      id: f.id,
      numero: f.number,
      cliente: f.Client?.name ?? f.Client?.email ?? "—",
      fecha: f.issueDate.toISOString(),
      base: r2(Number(f.subtotal)),
      iva: r2(Number(f.taxAmount)),
      total: r2(Number(f.total)),
      estado: f.status,
    })),
    gastos: gastosRaw.map((g) => ({
      id: g.id,
      fecha: g.issueDate.toISOString(),
      proveedor: g.Provider?.name ?? "—",
      concepto: g.lines[0]?.description ?? g.number,
      base: r2(Number(g.subtotal)),
      iva: r2(Number(g.taxAmount)),
      total: r2(Number(g.total)),
    })),
  }
}
