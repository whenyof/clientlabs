/**
 * Cierre de pre-lanzamiento.
 *
 * Bloquea el REGISTRO y el LOGIN del público hasta el 1 de julio, dejando entrar
 * únicamente a los emails de la allowlist (la cuenta del fundador).
 *
 * Activación por entorno (sin redeploy de código para abrir):
 *   - LAUNCH_LOCKED="true"  → cierre activo. Cualquier otro valor / ausencia = ABIERTO.
 *     Por defecto ABIERTO (fail-open) para no bloquear por accidente otros entornos.
 *     El 1 de julio: pon LAUNCH_LOCKED="false" (o bórrala) y el acceso se reabre.
 *   - LAUNCH_ALLOWLIST="a@x.com,b@y.com" → emails que SÍ pueden entrar durante el
 *     cierre. Si no se define, se usa la cuenta del fundador por defecto.
 *
 * Solo lógica de servidor: NO usar NEXT_PUBLIC_ (no exponer la allowlist al cliente).
 */
const DEFAULT_ALLOWLIST = "iyanrimada5@gmail.com"

/** Texto canónico del cierre; debe coincidir con el filtro de mensajes del login. */
export const LAUNCH_LOCKED_MESSAGE = "Abrimos el 1 de julio"

export function isLaunchLocked(): boolean {
  return process.env.LAUNCH_LOCKED === "true"
}

function allowlist(): string[] {
  return (process.env.LAUNCH_ALLOWLIST ?? DEFAULT_ALLOWLIST)
    .split(",")
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean)
}

/** True si el email puede entrar aunque el cierre esté activo. */
export function isLaunchAllowed(email?: string | null): boolean {
  if (!email) return false
  return allowlist().includes(email.toLowerCase().trim())
}
