"use client"

import { useState } from "react"
import { CheckCircle, Mail, Loader2 } from "lucide-react"

interface Props {
  params: { slug: string }
}

export default function NewsletterPublicaPage({ params }: Props) {
  const [email, setEmail] = useState("")
  const [nombre, setNombre] = useState("")
  const [estado, setEstado] = useState<"idle" | "loading" | "success" | "error">("idle")
  const [errorMsg, setErrorMsg] = useState("")

  const suscribirse = async () => {
    if (!email) return
    setEstado("loading")
    try {
      const res = await fetch("/api/newsletter/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          slug: params.slug,
          email,
          nombre,
          fuente: "widget",
        }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || "Error al suscribirse")
      setEstado("success")
    } catch (err: unknown) {
      setErrorMsg(err instanceof Error ? err.message : "Error al suscribirse")
      setEstado("error")
    }
  }

  if (estado === "success") {
    return (
      <div className="min-h-screen bg-[#f8fafc] flex items-center justify-center p-6">
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-10 max-w-md w-full text-center">
          <div className="w-16 h-16 rounded-full bg-[#E1F5EE] flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="h-8 w-8 text-[#1FA97A]" />
          </div>
          <h1 className="text-[22px] font-bold text-slate-900 mb-2">
            ¡Ya estás suscrito!
          </h1>
          <p className="text-[14px] text-slate-500 leading-relaxed">
            Recibirás las próximas ediciones directamente en tu bandeja de entrada.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#f8fafc] flex items-center justify-center p-6">
      <div className="max-w-md w-full">

        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-14 h-14 rounded-2xl bg-[#0B1F2A] flex items-center justify-center mx-auto mb-4">
            <Mail className="h-7 w-7 text-[#1FA97A]" />
          </div>
          <h1 className="text-[26px] font-black text-[#0B1F2A] leading-tight mb-2">
            Suscríbete a la newsletter
          </h1>
          <p className="text-[14px] text-slate-500 leading-relaxed">
            Consejos, reflexiones y casos reales para autónomos y pequeños negocios. Sin spam.
          </p>
        </div>

        {/* Formulario */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-4">

          <div>
            <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-1.5">
              Tu nombre
            </label>
            <input
              value={nombre}
              onChange={e => setNombre(e.target.value)}
              placeholder="María García"
              className="w-full px-4 py-3 border border-slate-200 rounded-xl text-[14px] outline-none bg-white focus:border-[#1FA97A] focus:ring-2 focus:ring-[#1FA97A]/10 transition-all"
            />
          </div>

          <div>
            <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-1.5">
              Tu email *
            </label>
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="maria@empresa.com"
              onKeyDown={e => e.key === "Enter" && suscribirse()}
              className="w-full px-4 py-3 border border-slate-200 rounded-xl text-[14px] outline-none bg-white focus:border-[#1FA97A] focus:ring-2 focus:ring-[#1FA97A]/10 transition-all"
            />
          </div>

          {estado === "error" && (
            <p className="text-[12px] text-red-500 font-medium">{errorMsg}</p>
          )}

          <button
            onClick={suscribirse}
            disabled={!email || estado === "loading"}
            className="w-full py-3 bg-[#1FA97A] text-white rounded-xl text-[14px] font-semibold hover:bg-[#1a9068] disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
          >
            {estado === "loading" ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Suscribiendo...
              </>
            ) : (
              "Suscribirme gratis"
            )}
          </button>

          <p className="text-[11px] text-slate-400 text-center">
            Sin spam. Puedes darte de baja cuando quieras.
          </p>
        </div>

        {/* Footer */}
        <p className="text-[11px] text-slate-400 text-center mt-4">
          Powered by{" "}
          <span className="text-[#1FA97A] font-medium">ClientLabs</span>
        </p>
      </div>
    </div>
  )
}
