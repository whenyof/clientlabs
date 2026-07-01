/**
 * Flags de disponibilidad de secciones.
 *
 * Facturación queda bloqueada para el lanzamiento y se habilita el 5 de julio.
 * Para REACTIVARLA ese día: cambia esta constante a `true` (una sola línea).
 * Eso restaura a la vez el item del sidebar (vuelve a ser grupo expandible normal)
 * y el acceso a todas las rutas /dashboard/finance.
 */
export const FACTURACION_DISPONIBLE = false

/** Texto del aviso, usado tanto en el toast del sidebar como en el bloqueo de ruta. */
export const FACTURACION_AVISO = "Facturación estará disponible el 5 de julio"
