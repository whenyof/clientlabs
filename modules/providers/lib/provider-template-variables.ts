/**
 * Template variable definitions for provider order email templates.
 */

export const PROVIDER_TEMPLATE_VARIABLES = [
  { key: "{provider_name}", desc: "Nombre del proveedor" },
  { key: "{order_date}", desc: "Fecha del pedido" },
  { key: "{order_number}", desc: "Número de pedido" },
  { key: "{products_table}", desc: "Tabla de productos (líneas)" },
  { key: "{total_amount}", desc: "Importe total" },
  { key: "{notes}", desc: "Notas del pedido" },
] as const
