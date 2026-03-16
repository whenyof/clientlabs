/**
 * Helpers for importing provider products from CSV/Excel.
 */

import type { ProviderProductImportRow } from "@/modules/providers/types"

export const EXPECTED_CSV_HEADERS = [
  "codigo",
  "nombre",
  "categoria",
  "unidad",
  "precio",
  "descripcion",
] as const

export type CsvRow = Record<string, string>

/**
 * Map a raw CSV row to an import row. Supports Spanish and English headers.
 */
export function mapCsvRowToImportRow(row: CsvRow): ProviderProductImportRow | null {
  const code = (row.codigo ?? row.code ?? "").trim()
  const name = (row.nombre ?? row.name ?? "").trim()
  if (!code || !name) return null
  const priceRaw = (row.precio ?? row.price ?? "0").toString().replace(",", ".")
  const price = parseFloat(priceRaw)
  if (Number.isNaN(price) || price < 0) return null
  return {
    code,
    name,
    category: (row.categoria ?? row.category ?? "").trim() || undefined,
    unit: (row.unidad ?? row.unit ?? "").trim() || undefined,
    price,
    description: (row.descripcion ?? row.description ?? "").trim() || undefined,
  }
}
