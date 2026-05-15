"use client"

import { useEffect } from "react"

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error(error)
  }, [error])

  return (
    <html lang="es">
      <body style={{ margin: 0, fontFamily: "var(--font-geist-sans, system-ui, sans-serif)", background: "#0B1F2A", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", minHeight: "100vh" }}>
        <div style={{ textAlign: "center", padding: "2rem" }}>
          <h1 style={{ fontSize: "1.5rem", fontWeight: 600, marginBottom: "0.5rem" }}>Algo ha ido mal</h1>
          <p style={{ color: "#94a3b8", marginBottom: "1.5rem", fontSize: "0.875rem" }}>
            Ha ocurrido un error inesperado. Por favor, inténtalo de nuevo.
          </p>
          <button
            onClick={reset}
            style={{ padding: "0.5rem 1.25rem", background: "#1FA97A", color: "#fff", border: "none", borderRadius: "6px", cursor: "pointer", fontSize: "0.875rem", fontWeight: 500 }}
          >
            Reintentar
          </button>
        </div>
      </body>
    </html>
  )
}
