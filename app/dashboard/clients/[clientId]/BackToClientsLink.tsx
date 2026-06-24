"use client"

import { useRouter } from "next/navigation"

/**
 * Volver a la lista de clientes con navegación CLIENTE (no recarga dura).
 * Usa router.back() para apoyarse en el Router Cache de App Router (restaura la
 * lista cacheada y la posición de scroll al instante). Si no hay historial dentro
 * de la app (p. ej. enlace directo al detalle), cae a push de la lista.
 */
export function BackToClientsLink() {
  const router = useRouter()

  const onClick = () => {
    if (typeof window !== "undefined" && window.history.length > 1) {
      router.back()
    } else {
      router.push("/dashboard/clients")
    }
  }

  return (
    <button
      type="button"
      onClick={onClick}
      className="ld-back"
      style={{ border: "none", background: "transparent", cursor: "pointer" }}
    >
      <svg width="12" height="12" fill="none" viewBox="0 0 24 24" strokeWidth={2.4} stroke="currentColor" aria-hidden="true">
        <path strokeLinecap="round" strokeLinejoin="round" d="M15 18l-6-6 6-6" />
      </svg>
      Volver a clientes
    </button>
  )
}
