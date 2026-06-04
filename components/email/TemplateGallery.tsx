"use client"

import { useState, useEffect } from "react"
import { X, Search, Star, User, Save, Loader2, Trash2 } from "lucide-react"
import { toast } from "sonner"

interface Template {
  id: string
  name: string
  description?: string | null
  subject: string
  htmlContent: string
  category?: string | null
  isDefault?: boolean
  usageCount?: number
}

interface TemplateGalleryProps {
  open: boolean
  onClose: () => void
  onSelect: (template: { subject: string; htmlContent: string }) => void
}

interface SaveTemplateModalProps {
  open: boolean
  onClose: () => void
  subject: string
  htmlContent: string
}

const CATEGORY_LABELS: Record<string, string> = {
  bienvenida: "Bienvenida",
  promo: "Promoción",
  seguimiento: "Seguimiento",
  newsletter: "Newsletter",
  otro: "Otro",
}

export function TemplateGallery({ open, onClose, onSelect }: TemplateGalleryProps) {
  const [tab, setTab] = useState<"system" | "custom">("system")
  const [query, setQuery] = useState("")
  const [system, setSystem] = useState<Template[]>([])
  const [custom, setCustom] = useState<Template[]>([])
  const [loading, setLoading] = useState(true)
  const [deleting, setDeleting] = useState<string | null>(null)

  useEffect(() => {
    if (!open) return
    setLoading(true)
    fetch("/api/email/templates")
      .then((r) => r.json())
      .then((data) => {
        setSystem(data.system ?? [])
        setCustom(data.custom ?? [])
      })
      .catch(() => toast.error("Error cargando plantillas"))
      .finally(() => setLoading(false))
  }, [open])

  const handleDelete = async (id: string) => {
    if (!confirm("¿Eliminar esta plantilla?")) return
    setDeleting(id)
    try {
      const res = await fetch(`/api/email/templates/${id}`, { method: "DELETE" })
      if (res.ok) {
        setCustom((prev) => prev.filter((t) => t.id !== id))
        toast.success("Plantilla eliminada")
      } else {
        toast.error("Error al eliminar")
      }
    } finally {
      setDeleting(null)
    }
  }

  const handleUse = async (t: Template) => {
    if (!t.id.startsWith("sys-")) {
      fetch(`/api/email/templates/${t.id}`, { method: "POST" }).catch(() => {})
    }
    onSelect({ subject: t.subject, htmlContent: t.htmlContent })
    onClose()
    toast.success(`Plantilla "${t.name}" cargada`)
  }

  const filterFn = (t: Template) =>
    !query ||
    t.name.toLowerCase().includes(query.toLowerCase()) ||
    (t.description ?? "").toLowerCase().includes(query.toLowerCase())

  const list = tab === "system" ? system.filter(filterFn) : custom.filter(filterFn)

  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[80vh] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
          <h2 className="text-base font-semibold text-slate-900">Plantillas de email</h2>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Tabs + Search */}
        <div className="px-6 pt-4 pb-3 space-y-3">
          <div className="flex gap-1 bg-slate-100 rounded-lg p-0.5 w-fit">
            {(["system", "custom"] as const).map((t) => (
              <button
                key={t}
                onClick={() => setTab(t)}
                className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
                  tab === t ? "bg-white text-slate-900 shadow-sm" : "text-slate-500 hover:text-slate-700"
                }`}
              >
                {t === "system" ? "Del sistema" : `Mis plantillas${custom.length ? ` (${custom.length})` : ""}`}
              </button>
            ))}
          </div>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Buscar plantillas…"
              className="w-full pl-8 pr-3 py-2 text-sm border border-slate-200 rounded-lg bg-slate-50 focus:outline-none focus:ring-1 focus:ring-[var(--accent)]"
            />
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto px-6 pb-6">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-5 h-5 text-slate-400 animate-spin" />
            </div>
          ) : list.length === 0 ? (
            <div className="text-center py-12 text-slate-400 text-sm">
              {tab === "custom"
                ? "Aún no tienes plantillas guardadas. Crea una campaña y guárdala como plantilla."
                : "Sin resultados para tu búsqueda."}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {list.map((t) => (
                <div
                  key={t.id}
                  className="border border-slate-200 rounded-xl p-4 hover:border-[var(--accent)] hover:shadow-sm transition-all group"
                >
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div className="flex items-center gap-2">
                      {t.isDefault ? (
                        <Star className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                      ) : (
                        <User className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      )}
                      <span className="text-sm font-semibold text-slate-800 truncate">{t.name}</span>
                    </div>
                    {t.category && (
                      <span className="text-[10px] font-medium px-1.5 py-0.5 rounded bg-slate-100 text-slate-500 shrink-0">
                        {CATEGORY_LABELS[t.category] ?? t.category}
                      </span>
                    )}
                  </div>

                  {t.description && (
                    <p className="text-xs text-slate-500 mb-2 line-clamp-2">{t.description}</p>
                  )}

                  <p className="text-xs text-slate-400 italic mb-3 truncate">
                    Asunto: {t.subject}
                  </p>

                  <div className="flex items-center justify-between gap-2">
                    <button
                      onClick={() => handleUse(t)}
                      className="flex-1 py-1.5 text-xs font-medium text-white bg-[var(--accent)] rounded-lg hover:opacity-90 transition-opacity"
                    >
                      Usar esta plantilla
                    </button>
                    {!t.isDefault && (
                      <button
                        onClick={() => handleDelete(t.id)}
                        disabled={deleting === t.id}
                        className="p-1.5 text-slate-300 hover:text-red-500 transition-colors rounded"
                      >
                        {deleting === t.id
                          ? <Loader2 className="w-3.5 h-3.5 animate-spin" />
                          : <Trash2 className="w-3.5 h-3.5" />
                        }
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export function SaveTemplateModal({ open, onClose, subject, htmlContent }: SaveTemplateModalProps) {
  const [name, setName] = useState("")
  const [description, setDescription] = useState("")
  const [category, setCategory] = useState("otro")
  const [saving, setSaving] = useState(false)

  const handleSave = async () => {
    if (!name.trim()) { toast.error("Escribe un nombre para la plantilla"); return }
    setSaving(true)
    try {
      const res = await fetch("/api/email/templates", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: name.trim(), description: description.trim() || undefined, subject, htmlContent, category }),
      })
      if (res.ok) {
        toast.success("Plantilla guardada correctamente")
        setName(""); setDescription(""); setCategory("otro")
        onClose()
      } else {
        toast.error("Error al guardar la plantilla")
      }
    } finally {
      setSaving(false)
    }
  }

  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-base font-semibold text-slate-900">Guardar como plantilla</h3>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400">
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="space-y-3">
          <div>
            <label className="text-xs font-medium text-slate-600 block mb-1">Nombre *</label>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ej: Newsletter mensual verano"
              className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-[var(--accent)]"
            />
          </div>
          <div>
            <label className="text-xs font-medium text-slate-600 block mb-1">Descripción</label>
            <input
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Para qué sirve esta plantilla…"
              className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-[var(--accent)]"
            />
          </div>
          <div>
            <label className="text-xs font-medium text-slate-600 block mb-1">Categoría</label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-[var(--accent)] bg-white"
            >
              {Object.entries(CATEGORY_LABELS).map(([k, v]) => (
                <option key={k} value={k}>{v}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="flex gap-2 pt-1">
          <button onClick={onClose} className="flex-1 py-2 text-sm font-medium text-slate-500 hover:text-slate-700 border border-slate-200 rounded-lg transition-colors">
            Cancelar
          </button>
          <button
            onClick={handleSave}
            disabled={saving || !name.trim()}
            className="flex-1 py-2 text-sm font-medium text-white bg-[var(--accent)] rounded-lg hover:opacity-90 disabled:opacity-50 transition-opacity flex items-center justify-center gap-2"
          >
            {saving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
            Guardar
          </button>
        </div>
      </div>
    </div>
  )
}
