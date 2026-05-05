"use client"

import { useState, useEffect, useCallback } from "react"
import { cn } from "@/lib/utils"
import { Check, Lock, Upload, Package } from "lucide-react"
import { toast } from "sonner"
import { PREMIUM_PACK_PRICE } from "@/lib/invoice-templates-catalog"

type TemplateItem = {
  id: string
  slug: string
  name: string
  description: string | null
  category: string
  price: number
  style: Record<string, string>
  owned: boolean
}

function TemplateMiniPreview({ style }: { style: Record<string, string> }) {
  return (
    <div
      className="w-full h-full flex flex-col"
      style={{ background: style.bodyBg ?? "#fff" }}
    >
      {/* Header strip */}
      <div className="flex-shrink-0 h-5 w-full flex items-center px-2 gap-1" style={{ background: style.headerBg }}>
        <div className="w-4 h-2.5 rounded-sm" style={{ background: style.headerText, opacity: 0.6 }} />
        <div className="flex-1" />
        <div className="w-5 h-2 rounded-sm" style={{ background: style.headerText, opacity: 0.4 }} />
      </div>
      {/* Body */}
      <div className="flex-1 px-2 py-1.5 flex flex-col gap-1">
        <div className="flex gap-1">
          <div className="flex-1 flex flex-col gap-0.5">
            <div className="h-1 w-8 rounded-sm" style={{ background: style.bodyText, opacity: 0.3 }} />
            <div className="h-0.5 w-6 rounded-sm" style={{ background: style.bodyText, opacity: 0.2 }} />
          </div>
          <div className="flex-1 flex flex-col gap-0.5 items-end">
            <div className="h-1 w-6 rounded-sm" style={{ background: style.accentColor, opacity: 0.7 }} />
            <div className="h-0.5 w-4 rounded-sm" style={{ background: style.bodyText, opacity: 0.2 }} />
          </div>
        </div>
        {/* Table */}
        <div className="mt-1" style={{ border: `0.5px solid ${style.tableBorderColor}` }}>
          <div className="h-2 px-1 flex gap-1 items-center" style={{ background: style.tableHeaderBg }}>
            {[16, 10, 8].map((w, i) => (
              <div key={i} className="h-0.5 rounded-sm" style={{ width: `${w}px`, background: style.tableHeaderText, opacity: 0.6 }} />
            ))}
          </div>
          {[1, 2].map(row => (
            <div key={row} className="h-2 px-1 flex gap-1 items-center" style={{ background: row % 2 === 0 ? style.tableAltRowBg : "transparent" }}>
              {[16, 10, 8].map((w, i) => (
                <div key={i} className="h-0.5 rounded-sm" style={{ width: `${w}px`, background: style.bodyText, opacity: 0.25 }} />
              ))}
            </div>
          ))}
        </div>
        <div className="mt-auto flex justify-end">
          <div className="h-1.5 w-8 rounded-sm" style={{ background: style.accentColor, opacity: 0.8 }} />
        </div>
      </div>
    </div>
  )
}

export function InvoiceTemplateGallery() {
  const [templates, setTemplates] = useState<TemplateItem[]>([])
  const [activeId, setActiveId] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [activating, setActivating] = useState<string | null>(null)

  const load = useCallback(async () => {
    try {
      const res = await fetch("/api/templates")
      const data = await res.json()
      if (data.templates) {
        setTemplates(data.templates)
        setActiveId(data.activeTemplateId)
      }
    } catch {
      toast.error("Error al cargar plantillas")
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { load() }, [load])

  const activate = async (templateId: string) => {
    setActivating(templateId)
    try {
      const res = await fetch("/api/templates/activate", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ templateId }),
      })
      if (res.ok) {
        setActiveId(templateId)
        toast.success("Plantilla activada")
      } else {
        toast.error("Error al activar la plantilla")
      }
    } catch {
      toast.error("Error de conexión")
    } finally {
      setActivating(null)
    }
  }

  const purchase = async (templateSlug: string) => {
    try {
      const res = await fetch("/api/templates/purchase", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ templateSlug }),
      })
      const data = await res.json()
      if (data.url) window.location.href = data.url
      else toast.error(data.error ?? "Error al procesar la compra")
    } catch {
      toast.error("Error de conexión")
    }
  }

  const purchaseAll = async () => {
    try {
      const res = await fetch("/api/templates/purchase-all", { method: "POST" })
      const data = await res.json()
      if (data.url) window.location.href = data.url
      else toast.error(data.error ?? "Error al procesar la compra")
    } catch {
      toast.error("Error de conexión")
    }
  }

  const importTemplate = () => {
    const input = document.createElement("input")
    input.type = "file"
    input.accept = ".json"
    input.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0]
      if (!file) return
      try {
        const text = await file.text()
        const json = JSON.parse(text)
        const res = await fetch("/api/templates/import", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(json),
        })
        const data = await res.json()
        if (data.success) { toast.success("Plantilla importada"); load() }
        else toast.error(data.error ?? "Error al importar")
      } catch {
        toast.error("Archivo JSON inválido")
      }
    }
    input.click()
  }

  const hasPremiumOwned = templates.some(t => t.category === "premium" && t.owned)
  const allPremiumOwned = templates.filter(t => t.category === "premium").every(t => t.owned)

  if (loading) {
    return <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">{Array.from({ length: 8 }).map((_, i) => <div key={i} className="aspect-[3/4] rounded-xl bg-slate-100 animate-pulse" />)}</div>
  }

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {templates.map(t => {
          const isActive = activeId === t.id
          const isOwned = t.owned
          const isActivating = activating === t.id
          const style = t.style as Record<string, string>

          return (
            <div
              key={t.id}
              className={cn(
                "relative rounded-xl border-2 p-2.5 cursor-pointer transition-all",
                isActive ? "border-[var(--accent)] shadow-sm" : "border-slate-200 hover:border-slate-300"
              )}
            >
              {isActive && (
                <div className="absolute top-2 left-2 z-10 flex items-center gap-1 bg-[var(--accent)] text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full">
                  <Check className="w-2.5 h-2.5" />
                  Activa
                </div>
              )}
              {t.category === "premium" && !isOwned && (
                <div className="absolute top-2 right-2 z-10 flex items-center gap-1 bg-amber-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full">
                  <Lock className="w-2.5 h-2.5" />
                  0,99€
                </div>
              )}

              <div className="aspect-[3/4] rounded-lg overflow-hidden border border-slate-100 mb-2">
                <TemplateMiniPreview style={style} />
              </div>

              <h4 className="font-medium text-sm text-[#0B1F2A] truncate">{t.name}</h4>
              <p className="text-[11px] text-slate-500 line-clamp-1 mb-2">{t.description}</p>

              {isOwned ? (
                <button
                  onClick={() => !isActive && activate(t.id)}
                  disabled={isActive || isActivating}
                  className={cn(
                    "w-full rounded-lg py-1.5 text-xs font-medium transition-colors",
                    isActive
                      ? "bg-[var(--accent)]/10 text-[var(--accent)] cursor-default"
                      : "bg-[var(--accent)] text-white hover:opacity-90"
                  )}
                >
                  {isActivating ? "Activando…" : isActive ? "Activa" : "Usar esta"}
                </button>
              ) : (
                <button
                  onClick={() => purchase(t.slug)}
                  className="w-full rounded-lg py-1.5 text-xs font-medium bg-amber-500 text-white hover:bg-amber-600 transition-colors"
                >
                  Comprar — 0,99€
                </button>
              )}
            </div>
          )
        })}

        {/* Import custom */}
        <div
          onClick={importTemplate}
          className="rounded-xl border-2 border-dashed border-slate-300 p-3 flex flex-col items-center justify-center gap-2 cursor-pointer hover:border-[var(--accent)] hover:bg-emerald-50/30 transition-colors min-h-[160px]"
        >
          <Upload className="w-6 h-6 text-slate-400" />
          <span className="text-xs text-slate-500 text-center">Importar<br />plantilla</span>
        </div>
      </div>

      {/* Pack banner */}
      {!allPremiumOwned && (
        <div className="rounded-xl border border-amber-200 bg-gradient-to-r from-amber-50 to-orange-50 p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <Package className="w-8 h-8 text-amber-600 flex-shrink-0" />
            <div>
              <h4 className="font-semibold text-amber-900 text-sm">Pack completo — 10 plantillas premium</h4>
              <p className="text-xs text-amber-700 mt-0.5">
                {hasPremiumOwned ? "Todas las plantillas premium por " : "Accede a todas las plantillas por "}
                <strong>{PREMIUM_PACK_PRICE.toFixed(2).replace(".", ",")}€</strong>
                {" "}(ahorra un 75%)
              </p>
            </div>
          </div>
          <button
            onClick={purchaseAll}
            className="flex-shrink-0 rounded-lg bg-amber-500 hover:bg-amber-600 text-white font-semibold px-4 py-2 text-sm transition-colors"
          >
            Comprar pack — {PREMIUM_PACK_PRICE.toFixed(2).replace(".", ",")}€
          </button>
        </div>
      )}
    </div>
  )
}
