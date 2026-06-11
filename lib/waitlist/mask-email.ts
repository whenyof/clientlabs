/**
 * Enmascara un email para mostrarlo a terceros: "juan@gmail.com" → "ju***@gmail.com".
 * Locales de 1-2 caracteres conservan solo el primero. Nunca devuelve el email completo.
 */
export function maskEmail(email: string): string {
  const at = email.indexOf("@")
  if (at <= 0) return "***"
  const local = email.slice(0, at)
  const domain = email.slice(at)
  const visible = local.length <= 2 ? local.slice(0, 1) : local.slice(0, 2)
  return `${visible}***${domain}`
}
