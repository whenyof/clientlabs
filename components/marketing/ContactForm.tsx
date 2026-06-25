"use client"

import { useState } from "react"
import { ChevronDown } from "lucide-react"
import { ArrowRight, CircleCheck } from "./icons"

const MOTIVOS = [
  "Dudas sobre el producto",
  "Facturación y Verifactu",
  "Planes y precios",
  "Soporte",
  "Otro",
]

export default function ContactForm() {
  const [status, setStatus] = useState<"idle" | "sending" | "ok" | "error">("idle")
  const [error, setError] = useState<string | null>(null)

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    if (status === "sending") return
    setError(null)
    setStatus("sending")

    const fd = new FormData(e.currentTarget)
    const nombre = String(fd.get("nombre") ?? "").trim()
    const email = String(fd.get("email") ?? "").trim()
    const empresa = String(fd.get("empresa") ?? "").trim()
    const motivo = String(fd.get("motivo") ?? "").trim()
    const mensaje = String(fd.get("mensaje") ?? "").trim()

    const message = [
      `Motivo: ${motivo || "—"}`,
      `Empresa: ${empresa || "—"}`,
      "",
      mensaje,
    ].join("\n")

    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: nombre, email, message }),
      })
      const data = await res.json().catch(() => null)
      if (!res.ok) {
        setError(data?.error ?? "No se pudo enviar el mensaje. Inténtalo de nuevo.")
        setStatus("error")
        return
      }
      setStatus("ok")
    } catch {
      setError("No hay conexión. Inténtalo de nuevo en un momento.")
      setStatus("error")
    }
  }

  if (status === "ok") {
    return (
      <div className="form-ok show" role="status">
        <CircleCheck />
        <h3>¡Mensaje enviado!</h3>
        <p>Gracias por escribir. Te respondo en menos de 24 horas laborables.</p>
      </div>
    )
  }

  return (
    <form className="form" id="contactForm" onSubmit={onSubmit} noValidate>
      <div className="field-row">
        <div className="field">
          <label htmlFor="nombre">Nombre</label>
          <input id="nombre" name="nombre" type="text" placeholder="Tu nombre" required />
        </div>
        <div className="field">
          <label htmlFor="email">Correo</label>
          <input id="email" name="email" type="email" placeholder="tu@correo.com" required />
        </div>
      </div>
      <div className="field">
        <label htmlFor="empresa">
          Empresa <span style={{ color: "var(--ink-4)", fontWeight: 400 }}>(opcional)</span>
        </label>
        <input id="empresa" name="empresa" type="text" placeholder="Nombre de tu negocio" />
      </div>
      <div className="field">
        <label htmlFor="motivo">¿Sobre qué nos escribes?</label>
        <div style={{ position: "relative" }}>
          <select
            id="motivo"
            name="motivo"
            defaultValue={MOTIVOS[0]}
            style={{ appearance: "none", WebkitAppearance: "none", MozAppearance: "none", cursor: "pointer", paddingRight: 32 }}
          >
            {MOTIVOS.map((m) => (
              <option key={m}>{m}</option>
            ))}
          </select>
          <ChevronDown size={14} style={{ position: "absolute", right: 10, top: "50%", transform: "translateY(-50%)", color: "#a3a3a3", pointerEvents: "none" }} />
        </div>
      </div>
      <div className="field">
        <label htmlFor="mensaje">Mensaje</label>
        <textarea
          id="mensaje"
          name="mensaje"
          placeholder="Cuéntame en qué puedo ayudarte…"
          required
          minLength={10}
        />
      </div>

      {error && (
        <p className="legal" role="alert" style={{ color: "#b4451f" }}>
          {error}
        </p>
      )}

      <button type="submit" className="btn btn-primary btn-lg" disabled={status === "sending"}>
        {status === "sending" ? "Enviando…" : "Enviar mensaje"}
        {status !== "sending" && <ArrowRight className="arr" />}
      </button>
      <p className="legal">
        Al enviar aceptas nuestra{" "}
        <a href="/privacy" style={{ color: "var(--teal-ink)", textDecoration: "underline" }}>
          política de privacidad
        </a>
        . No compartimos tus datos con nadie.
      </p>
    </form>
  )
}
