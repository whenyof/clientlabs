/**
 * Column definitions for provider products table (labels and keys).
 */

export const PROVIDER_PRODUCT_TABLE_COLUMNS = [
  { key: "code", label: "Código" },
  { key: "name", label: "Nombre" },
  { key: "category", label: "Categoría" },
  { key: "unit", label: "Unidad" },
  { key: "price", label: "Precio" },
  { key: "status", label: "Estado" },
  { key: "actions", label: "Acciones" },
] as const
