"use client"

import { useState, useEffect, useMemo, useRef } from "react"
import { Plus, Loader2 } from "lucide-react"
import type { CatalogProduct, ProductDraft } from "@/hooks/use-product-catalog"

// Normaliza para comparar: minúsculas + sin acentos. (El normalizador de proveedores
// de Gastos elimina sufijos societarios S.L./S.A. — inapropiado para productos.)
function normalize(s: string): string {
  return s
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .trim()
}

function fmtPrice(n: number): string {
  return new Intl.NumberFormat("es-ES", { style: "currency", currency: "EUR" }).format(n)
}

export type ProductPickerProps = {
  /** Catálogo ya cargado (el fetch lo hace useProductCatalog, no este componente) */
  products: CatalogProduct[]
  /** Nombre/descripción actual de la línea */
  value: string
  /** Usuario eligió un producto del catálogo. El mapeo a la línea lo hace el flujo. */
  onSelect: (product: CatalogProduct) => void
  /** Texto libre: siempre se emite al teclear */
  onChange: (text: string) => void
  /** Crear producto desde la línea. Resuelve con el producto creado. */
  onCreateProduct: (draft: ProductDraft) => Promise<CatalogProduct>
  /** Valores actuales de la línea, para el "añadir al catálogo" */
  unitPrice: number
  taxRate: number
  unit?: string
  placeholder?: string
  className?: string
}

export function ProductPicker({
  products,
  value,
  onSelect,
  onChange,
  onCreateProduct,
  unitPrice,
  taxRate,
  unit,
  placeholder = "Descripción del producto o servicio",
  className,
}: ProductPickerProps) {
  const [focused, setFocused] = useState(false)
  const [idle, setIdle] = useState(false)
  const [creating, setCreating] = useState(false)
  const blurTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  const q = normalize(value)

  // Sugerencias por nombre/categoría ("contiene"); sin query, primeras del catálogo.
  const suggestions = useMemo(() => {
    if (!q) return products.slice(0, 6)
    return products
      .filter((p) => normalize(p.name).includes(q) || normalize(p.category ?? "").includes(q))
      .slice(0, 8)
  }, [products, q])

  // ¿Es nuevo? No hay producto con nombre normalizado EXACTO igual al texto.
  const exactMatch = useMemo(
    () => q !== "" && products.some((p) => normalize(p.name) === q),
    [products, q]
  )
  const isNew = value.trim() !== "" && !exactMatch

  // Anti-parpadeo: marca "inactivo" ~600ms tras dejar de teclear.
  useEffect(() => {
    setIdle(false)
    if (!value.trim()) return
    const t = setTimeout(() => setIdle(true), 600)
    return () => clearTimeout(t)
  }, [value])

  // Mostrar la acción "añadir" solo si es nuevo y (input blurred o inactivo).
  const showAdd = isNew && (!focused || idle)
  const showDropdown = focused && suggestions.length > 0

  useEffect(() => () => { if (blurTimer.current) clearTimeout(blurTimer.current) }, [])

  async function handleCreate() {
    if (creating) return
    setCreating(true)
    try {
      const created = await onCreateProduct({
        name: value.trim(),
        price: unitPrice,
        taxRate,
        unit: unit || "ud",
      })
      // Enlaza la línea al producto recién creado (ya hace match → la acción desaparece).
      onSelect(created)
    } catch {
      // El flujo (onCreateProduct) decide cómo notificar el error; aquí solo liberamos el estado.
    } finally {
      setCreating(false)
    }
  }

  return (
    <div className={className} style={{ position: "relative" }}>
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onFocus={() => setFocused(true)}
        onBlur={() => {
          blurTimer.current = setTimeout(() => setFocused(false), 150)
        }}
        placeholder={placeholder}
        className="w-full text-[12px] border border-slate-200 rounded-md px-2 py-1.5 text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-[#0F766E]/30 focus:border-[#0F766E]"
      />

      {/* Dropdown typeahead */}
      {showDropdown && (
        <div className="absolute left-0 top-full mt-1 w-72 bg-white border border-slate-200 rounded-lg shadow-lg z-20 overflow-hidden">
          {suggestions.map((p) => (
            <button
              key={p.id}
              type="button"
              onMouseDown={(e) => {
                e.preventDefault()
                onSelect(p)
                setFocused(false)
              }}
              className="w-full flex items-center justify-between px-3 py-2 hover:bg-slate-50 text-left transition-colors"
            >
              <div className="min-w-0">
                <p className="text-[12px] font-medium text-slate-900 truncate">{p.name}</p>
                {p.category && (
                  <p className="text-[11px] text-slate-400 truncate max-w-[160px]">{p.category}</p>
                )}
              </div>
              <span className="text-[11px] font-medium text-slate-600 shrink-0 ml-2">{fmtPrice(p.price)}</span>
            </button>
          ))}
        </div>
      )}

      {/* Acción inline discreta para añadir al catálogo (opt-in, nunca automática) */}
      {showAdd && (
        <button
          type="button"
          onMouseDown={(e) => {
            e.preventDefault()
            handleCreate()
          }}
          disabled={creating}
          className="mt-1 inline-flex items-center gap-1 text-[11px] text-[#0F766E] hover:text-[#0E665F] disabled:opacity-60 transition-colors"
        >
          {creating ? (
            <Loader2 className="h-3 w-3 animate-spin" />
          ) : (
            <Plus className="h-3 w-3" />
          )}
          Nuevo · ¿Añadir a tu catálogo?
        </button>
      )}
    </div>
  )
}
