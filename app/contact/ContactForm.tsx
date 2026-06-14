"use client"

import { useState } from "react"
import { CheckCircle2, Send } from "lucide-react"

type Status = "idle" | "loading" | "success" | "error"

const inputClass =
  "w-full px-4 py-3 rounded-xl border border-slate-200 bg-white text-[14px] text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-[#0F766E] focus:ring-2 focus:ring-[#0F766E]/20"

export function ContactForm() {
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [message, setMessage] = useState("")
  const [status, setStatus] = useState<Status>("idle")
  const [error, setError] = useState<string | null>(null)

  const canSubmit = name.trim().length >= 2 && email.includes("@") && message.trim().length >= 10

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!canSubmit || status === "loading") return
    setStatus("loading")
    setError(null)
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: name.trim(), email: email.trim(), message: message.trim() }),
      })
      const data = await res.json()
      if (!res.ok) {
        setError(data.error ?? "No se pudo enviar el mensaje.")
        setStatus("error")
        return
      }
      setStatus("success")
    } catch {
      setError("Error de conexión. Inténtalo de nuevo.")
      setStatus("error")
    }
  }

  if (status === "success") {
    return (
      <div className="bg-white border border-slate-200 rounded-2xl p-10 text-center">
        <div className="w-14 h-14 rounded-full bg-[#0F766E]/10 border-2 border-[#0F766E]/30 flex items-center justify-center mx-auto mb-4">
          <CheckCircle2 className="h-6 w-6 text-[#0F766E]" />
        </div>
        <h2 className="text-[18px] font-bold text-slate-900 mb-2">Mensaje enviado</h2>
        <p className="text-[14px] text-slate-500">
          Gracias por escribirnos. Te responderemos en menos de 24 horas laborables.
        </p>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 space-y-4">
      <div>
        <label htmlFor="contact-name" className="block text-[12px] font-semibold text-slate-600 mb-1.5">
          Nombre
        </label>
        <input
          id="contact-name"
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Tu nombre"
          disabled={status === "loading"}
          className={inputClass}
        />
      </div>
      <div>
        <label htmlFor="contact-email" className="block text-[12px] font-semibold text-slate-600 mb-1.5">
          Email
        </label>
        <input
          id="contact-email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="tu@email.com"
          disabled={status === "loading"}
          className={inputClass}
        />
      </div>
      <div>
        <label htmlFor="contact-message" className="block text-[12px] font-semibold text-slate-600 mb-1.5">
          Mensaje
        </label>
        <textarea
          id="contact-message"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Cuéntanos en qué podemos ayudarte..."
          rows={5}
          disabled={status === "loading"}
          className={`${inputClass} resize-none`}
        />
      </div>
      {error && <p className="text-[13px] text-red-600">{error}</p>}
      <button
        type="submit"
        disabled={!canSubmit || status === "loading"}
        className="w-full inline-flex items-center justify-center gap-2 h-12 rounded-xl bg-[#0F766E] text-white text-[14px] font-semibold hover:bg-[#0E665F] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <Send className="h-4 w-4" />
        {status === "loading" ? "Enviando..." : "Enviar mensaje"}
      </button>
      <p className="text-[11px] text-slate-400 text-center">
        También puedes escribirnos directamente a{" "}
        <a href="mailto:hola@clientlabs.io" className="text-[#0F766E] hover:underline">
          hola@clientlabs.io
        </a>
      </p>
    </form>
  )
}
