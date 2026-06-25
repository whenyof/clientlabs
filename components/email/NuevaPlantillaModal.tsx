"use client"

import { useState } from "react"
import { X, Save, Loader2, Eye, ChevronDown } from "lucide-react"
import { toast } from "sonner"

interface NuevaPlantillaModalProps {
  open: boolean
  onClose: () => void
  onSaved: () => void
  initialHtml?: string
  initialSubject?: string
}

const CATEGORIES = [
  { value: "marketing",     label: "Marketing" },
  { value: "newsletter",    label: "Newsletter" },
  { value: "transaccional", label: "Transaccional" },
  { value: "onboarding",    label: "Onboarding" },
]

export function NuevaPlantillaModal({ open, onClose, onSaved, initialHtml = "", initialSubject = "" }: NuevaPlantillaModalProps) {
  const [name, setName]       = useState("")
  const [category, setCategory] = useState("marketing")
  const [subject, setSubject] = useState(initialSubject)
  const [html, setHtml]       = useState(initialHtml)
  const [preview, setPreview] = useState(false)
  const [saving, setSaving]   = useState(false)

  async function handleSave() {
    if (!name.trim()) { toast.error("Escribe un nombre para la plantilla"); return }
    if (!html.trim())  { toast.error("El contenido HTML no puede estar vacío"); return }
    setSaving(true)
    try {
      const res = await fetch("/api/email/templates", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: name.trim(), category, subject: subject.trim(), htmlContent: html }),
      })
      if (!res.ok) throw new Error()
      toast.success("Plantilla guardada correctamente")
      setName(""); setSubject(""); setHtml(""); setCategory("marketing")
      onSaved()
      onClose()
    } catch {
      toast.error("Error al guardar la plantilla")
    } finally {
      setSaving(false)
    }
  }

  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden">

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
          <div>
            <h2 className="text-[15px] font-semibold text-slate-900">Diseñar plantilla</h2>
            <p className="text-[12px] text-slate-400 mt-0.5">Crea una plantilla reutilizable para tus campañas</p>
          </div>
          <button onClick={onClose} className="p-2 rounded-xl hover:bg-slate-100 transition-colors">
            <X className="h-4 w-4 text-slate-400" />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 min-h-0">

            {/* Form */}
            <div className="p-6 space-y-4 border-r border-slate-100">
              <div>
                <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-1.5">
                  Nombre de la plantilla *
                </label>
                <input
                  value={name}
                  onChange={e => setName(e.target.value)}
                  placeholder="Ej: Newsletter mensual verano"
                  className="w-full px-3 py-2.5 border border-slate-200 rounded-xl text-[13px] outline-none focus:border-[#0F766E] focus:ring-2 focus:ring-[#0F766E]/10 transition-all"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-1.5">
                    Categoría
                  </label>
                  <div className="relative">
                    <select
                      value={category}
                      onChange={e => setCategory(e.target.value)}
                      className="w-full px-3 py-2.5 pr-8 border border-slate-200 rounded-xl text-[13px] outline-none focus:border-[#0F766E] bg-white appearance-none"
                    >
                      {CATEGORIES.map(c => (
                        <option key={c.value} value={c.value}>{c.label}</option>
                      ))}
                    </select>
                    <ChevronDown className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                  </div>
                </div>
                <div>
                  <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-1.5">
                    Asunto sugerido
                  </label>
                  <input
                    value={subject}
                    onChange={e => setSubject(e.target.value)}
                    placeholder="Asunto del email..."
                    className="w-full px-3 py-2.5 border border-slate-200 rounded-xl text-[13px] outline-none focus:border-[#0F766E] focus:ring-2 focus:ring-[#0F766E]/10 transition-all"
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                    HTML del email *
                  </label>
                  <span className="text-[11px] text-slate-400">Usa {"{{nombre}}"}, {"{{negocio}}"} como variables</span>
                </div>
                <textarea
                  value={html}
                  onChange={e => setHtml(e.target.value)}
                  placeholder={`<div style="max-width:600px;margin:0 auto;...">\n  <!-- Contenido del email -->\n</div>`}
                  rows={16}
                  className="w-full px-3 py-2.5 border border-slate-200 rounded-xl text-[12px] font-mono outline-none focus:border-[#0F766E] focus:ring-2 focus:ring-[#0F766E]/10 transition-all resize-none"
                />
              </div>
            </div>

            {/* Preview */}
            <div className="p-6 bg-slate-50 flex flex-col">
              <div className="flex items-center justify-between mb-3">
                <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
                  <Eye className="h-3 w-3" />
                  Vista previa en tiempo real
                </p>
                {subject && (
                  <span className="text-[11px] text-slate-400 truncate max-w-[200px]">Asunto: {subject}</span>
                )}
              </div>
              <div className="flex-1 bg-white rounded-xl border border-slate-200 overflow-hidden">
                {html.trim() ? (
                  <iframe
                    srcDoc={html}
                    className="w-full h-full min-h-[420px] border-0"
                    sandbox="allow-same-origin"
                    title="Preview"
                  />
                ) : (
                  <div className="flex items-center justify-center h-full min-h-[420px]">
                    <div className="text-center">
                      <div className="w-12 h-12 rounded-xl bg-slate-100 flex items-center justify-center mx-auto mb-3">
                        <Eye className="h-5 w-5 text-slate-300" />
                      </div>
                      <p className="text-[13px] text-slate-400">Escribe HTML en el editor para ver la vista previa</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-slate-100 flex gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2.5 border border-slate-200 rounded-xl text-[13px] font-medium text-slate-600 hover:bg-slate-50 transition-colors"
          >
            Cancelar
          </button>
          <button
            onClick={handleSave}
            disabled={saving || !name.trim() || !html.trim()}
            className="flex-1 py-2.5 rounded-xl text-[13px] font-semibold text-white transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            style={{ background: saving || !name.trim() || !html.trim() ? undefined : "#0F766E" }}
          >
            {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
            Guardar plantilla
          </button>
        </div>
      </div>
    </div>
  )
}
