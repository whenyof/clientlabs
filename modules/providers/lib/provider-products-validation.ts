/**
 * Validation helpers for provider product forms.
 */

export function validateProductForm(data: {
  name: string
  code: string
  price: string
}): { ok: true } | { ok: false; error: string } {
  if (!data.name.trim()) return { ok: false, error: "El nombre es obligatorio" }
  if (!data.code.trim()) return { ok: false, error: "El código es obligatorio" }
  const priceNum = parseFloat(String(data.price).replace(",", "."))
  if (Number.isNaN(priceNum) || priceNum < 0)
    return { ok: false, error: "Introduce un precio válido" }
  return { ok: true }
}
