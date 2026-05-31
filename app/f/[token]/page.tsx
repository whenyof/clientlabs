"use client"

import { useState, useEffect } from "react"
import { CheckCircle2, Loader2 } from "lucide-react"

interface FormField {
  key: string
  label: string
  type: "text" | "email" | "tel" | "textarea"
  required: boolean
}

interface PublicFormData {
  nombre: string
  descripcion: string | null
  fields: FormField[]
  successMessage: string | null
  active: boolean
}

export default function PublicFormPage({ params }: { params: { token: string } }) {
  const [form, setForm] = useState<PublicFormData | null>(null)
  const [loading, setLoading] = useState(true)
  const [formData, setFormData] = useState<Record<string, string>>({})
  const [submitting, setSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [successMessage, setSuccessMessage] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({})

  useEffect(() => {
    fetch(`/api/forms/public/${params.token}`)
      .then(r => r.json())
      .then(data => {
        if (data.error) {
          setError("Este formulario no está disponible.")
        } else {
          setForm(data)
        }
      })
      .catch(() => setError("No se pudo cargar el formulario."))
      .finally(() => setLoading(false))
  }, [params.token])

  function validate(): boolean {
    if (!form) return false
    const errors: Record<string, string> = {}
    for (const field of form.fields) {
      if (field.required && !formData[field.key]?.trim()) {
        errors[field.key] = `${field.label} es obligatorio`
      }
      if (field.type === "email" && formData[field.key] && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData[field.key])) {
        errors[field.key] = "Email no válido"
      }
    }
    setFieldErrors(errors)
    return Object.keys(errors).length === 0
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!validate()) return

    setSubmitting(true)
    setError(null)
    try {
      const res = await fetch("/api/forms/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token: params.token, data: formData }),
      })
      const result = await res.json()
      if (!res.ok) {
        setError(result.error ?? "Error al enviar")
        return
      }
      setSuccessMessage(result.message ?? "Gracias, te contactaremos pronto.")
      if (result.redirectUrl) {
        setTimeout(() => { window.location.href = result.redirectUrl }, 2000)
      } else {
        setSubmitted(true)
      }
    } catch {
      setError("Error de conexión. Inténtalo de nuevo.")
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <Loader2 className="w-8 h-8 text-[#0F766E] animate-spin" />
      </div>
    )
  }

  if (error && !form) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="text-center max-w-sm">
          <p className="text-slate-600 text-sm">{error}</p>
        </div>
      </div>
    )
  }

  if (submitted) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="text-center max-w-sm px-6">
          <div className="w-14 h-14 rounded-full bg-[#0F766E]/10 flex items-center justify-center mx-auto mb-4">
            <CheckCircle2 className="w-7 h-7 text-[#0F766E]" />
          </div>
          <p className="text-slate-800 font-semibold text-base mb-1">Enviado</p>
          <p className="text-slate-500 text-sm">{successMessage}</p>
        </div>
      </div>
    )
  }

  if (!form) return null

  return (
    <div className="min-h-screen bg-slate-50 flex items-start justify-center py-12 px-4">
      <div className="w-full max-w-lg">
        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden" style={{ boxShadow: "0 1px 3px rgba(0,0,0,0.06)" }}>
          <div className="px-8 pt-8 pb-6 border-b border-slate-100">
            <h1 className="text-xl font-semibold text-slate-900">{form.nombre}</h1>
            {form.descripcion && (
              <p className="mt-1.5 text-sm text-slate-500">{form.descripcion}</p>
            )}
          </div>

          <form onSubmit={handleSubmit} className="px-8 py-6 space-y-5">
            {form.fields.map(field => (
              <div key={field.key}>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">
                  {field.label}
                  {field.required && <span className="text-red-500 ml-1">*</span>}
                </label>
                {field.type === "textarea" ? (
                  <textarea
                    rows={4}
                    value={formData[field.key] ?? ""}
                    onChange={e => setFormData(prev => ({ ...prev, [field.key]: e.target.value }))}
                    className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0F766E]/30 focus:border-[#0F766E] resize-none transition-colors"
                    style={{ borderRadius: 8 }}
                  />
                ) : (
                  <input
                    type={field.type}
                    value={formData[field.key] ?? ""}
                    onChange={e => setFormData(prev => ({ ...prev, [field.key]: e.target.value }))}
                    className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0F766E]/30 focus:border-[#0F766E] transition-colors"
                    style={{ borderRadius: 8 }}
                  />
                )}
                {fieldErrors[field.key] && (
                  <p className="mt-1 text-xs text-red-500">{fieldErrors[field.key]}</p>
                )}
              </div>
            ))}

            {error && (
              <p className="text-xs text-red-500 bg-red-50 border border-red-100 rounded-lg px-3 py-2">{error}</p>
            )}

            <button
              type="submit"
              disabled={submitting}
              className="w-full py-2.5 px-4 rounded-lg text-sm font-medium text-white transition-opacity disabled:opacity-60"
              style={{ background: "#0F766E", borderRadius: 8 }}
            >
              {submitting ? (
                <span className="flex items-center justify-center gap-2">
                  <Loader2 className="w-4 h-4 animate-spin" /> Enviando...
                </span>
              ) : "Enviar"}
            </button>
          </form>

          <div className="px-8 pb-6 text-center">
            <span className="text-[11px] text-slate-400">Powered by ClientLabs</span>
          </div>
        </div>
      </div>
    </div>
  )
}
