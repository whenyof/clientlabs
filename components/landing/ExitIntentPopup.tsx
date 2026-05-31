"use client"

import { useEffect, useRef, useState } from "react"
import { X, Copy, Check } from "lucide-react"

const LS_KEY   = "cl_popup_v1"
const COUPON   = "BIENVENIDA10"
const DELAY_MS = 15_000

export function ExitIntentPopup() {
  const [visible,  setVisible]  = useState(false)
  const [email,    setEmail]    = useState("")
  const [loading,  setLoading]  = useState(false)
  const [success,  setSuccess]  = useState(false)
  const [copied,   setCopied]   = useState(false)
  const [error,    setError]    = useState<string | null>(null)
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    try {
      const raw = localStorage.getItem(LS_KEY)
      if (raw) {
        const { until } = JSON.parse(raw) as { until: number }
        if (Date.now() < until) return
      }
    } catch { /* ignore */ }

    timer.current = setTimeout(() => setVisible(true), DELAY_MS)
    return () => { if (timer.current) clearTimeout(timer.current) }
  }, [])

  function dismiss() {
    setVisible(false)
    try {
      localStorage.setItem(LS_KEY, JSON.stringify({ until: Date.now() + 7 * 86_400_000 }))
    } catch { /* ignore */ }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError(null)
    try {
      const res  = await fetch("/api/lead-capture", {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({ email }),
      })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) {
        setError(data.error ?? "Error al enviar. Inténtalo de nuevo.")
        return
      }
      setSuccess(true)
      try {
        localStorage.setItem(LS_KEY, JSON.stringify({ until: Date.now() + 7 * 86_400_000 }))
      } catch { /* ignore */ }
    } catch {
      setError("Error de conexión. Inténtalo de nuevo.")
    } finally {
      setLoading(false)
    }
  }

  async function copyCode() {
    try {
      await navigator.clipboard.writeText(COUPON)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch { /* ignore */ }
  }

  if (!visible) return null

  return (
    <>
      {/* Backdrop */}
      <div
        role="presentation"
        className="fixed inset-0 z-50"
        style={{ background: "rgba(0,0,0,0.65)", backdropFilter: "blur(5px)" }}
        onClick={dismiss}
      />

      {/* Modal */}
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Oferta de bienvenida"
        className="fixed z-50"
        style={{
          left:      "50%",
          top:       "50%",
          transform: "translate(-50%, -50%)",
          width:     "min(448px, calc(100vw - 24px))",
          background: "#0B1F2A",
          border:    "1px solid rgba(15,118,110,0.28)",
          borderRadius: "14px",
          padding:   "32px",
          boxShadow: "0 32px 80px rgba(0,0,0,0.55), 0 0 0 1px rgba(15,118,110,0.08)",
        }}
      >
        {/* Close button */}
        <button
          onClick={dismiss}
          aria-label="Cerrar"
          className="absolute top-3.5 right-3.5 p-1.5 rounded-lg transition-colors"
          style={{ color: "rgba(255,255,255,0.3)" }}
          onMouseEnter={e => (e.currentTarget.style.color = "#fff")}
          onMouseLeave={e => (e.currentTarget.style.color = "rgba(255,255,255,0.3)")}
        >
          <X className="w-4 h-4" />
        </button>

        {!success ? (
          /* ─── Formulario ──────────────────────────────── */
          <>
            <span
              className="inline-block text-[10.5px] font-bold uppercase tracking-[0.14em] px-3 py-1 rounded-full mb-5"
              style={{ background: "rgba(15,118,110,0.14)", color: "#0F766E", border: "1px solid rgba(15,118,110,0.28)" }}
            >
              Oferta exclusiva · Solo hoy
            </span>

            <h2 className="text-[22px] font-bold text-white leading-tight mb-2">
              10% de descuento en<br />tu primer mes
            </h2>
            <p className="text-[13px] leading-[1.6] mb-6" style={{ color: "rgba(255,255,255,0.48)" }}>
              Escribe tu email y te mandamos el código al instante. Sin spam, solo el descuento.
            </p>

            <form onSubmit={handleSubmit} className="flex flex-col gap-3">
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="tu@email.com"
                required
                autoComplete="email"
                className="w-full rounded-lg px-4 py-3 text-[14px] text-white outline-none transition-all"
                style={{
                  background:  "rgba(255,255,255,0.06)",
                  border:      "1px solid rgba(255,255,255,0.12)",
                  caretColor:  "#0F766E",
                }}
                onFocus={e  => (e.target.style.border = "1px solid rgba(15,118,110,0.6)")}
                onBlur={e   => (e.target.style.border = "1px solid rgba(255,255,255,0.12)")}
              />

              {error && (
                <p className="text-[12px]" style={{ color: "#f87171" }}>{error}</p>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 rounded-lg text-[14px] font-semibold text-white transition-opacity disabled:opacity-60"
                style={{ background: "linear-gradient(135deg, #0F766E 0%, #0E665F 100%)" }}
              >
                {loading ? "Enviando..." : "Quiero mi 10% de descuento"}
              </button>
            </form>

            <p className="text-center text-[11px] mt-4" style={{ color: "rgba(255,255,255,0.22)" }}>
              Sin permanencia · Cancela cuando quieras · 14 días gratis
            </p>
          </>
        ) : (
          /* ─── Estado de éxito ─────────────────────────── */
          <>
            <div className="text-center mb-6">
              <div
                className="inline-flex items-center justify-center w-11 h-11 rounded-full mb-4"
                style={{ background: "rgba(15,118,110,0.14)", border: "1px solid rgba(15,118,110,0.3)" }}
              >
                <Check className="w-5 h-5" style={{ color: "#0F766E" }} />
              </div>
              <h2 className="text-[20px] font-bold text-white mb-1.5">
                Tu codigo esta en camino
              </h2>
              <p className="text-[13px]" style={{ color: "rgba(255,255,255,0.45)" }}>
                Revisa tu bandeja. Aplica este codigo al contratar:
              </p>
            </div>

            {/* Coupon box */}
            <div
              className="flex items-center justify-between gap-3 rounded-xl px-5 py-4 mb-5"
              style={{
                background:  "rgba(15,118,110,0.07)",
                border:      "1.5px dashed rgba(15,118,110,0.45)",
              }}
            >
              <span
                className="text-[23px] font-bold tracking-[0.12em]"
                style={{ color: "#0F766E", fontVariantNumeric: "tabular-nums" }}
              >
                {COUPON}
              </span>
              <button
                onClick={copyCode}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[12px] font-semibold transition-all"
                style={
                  copied
                    ? { background: "rgba(15,118,110,0.2)", color: "#0F766E", border: "1px solid rgba(15,118,110,0.3)" }
                    : { background: "rgba(255,255,255,0.06)", color: "rgba(255,255,255,0.65)", border: "1px solid rgba(255,255,255,0.1)" }
                }
              >
                {copied
                  ? <><Check className="w-3 h-3" /> Copiado</>
                  : <><Copy className="w-3 h-3" /> Copiar</>
                }
              </button>
            </div>

            <a
              href="/precios"
              className="block w-full text-center py-3 rounded-lg text-[14px] font-semibold text-white transition-opacity hover:opacity-90"
              style={{ background: "linear-gradient(135deg, #0F766E 0%, #0E665F 100%)" }}
            >
              Ver planes y aplicar descuento
            </a>

            <p className="text-center text-[11px] mt-3" style={{ color: "rgba(255,255,255,0.22)" }}>
              14 dias gratis · Sin tarjeta · Cancela cuando quieras
            </p>
          </>
        )}
      </div>
    </>
  )
}
