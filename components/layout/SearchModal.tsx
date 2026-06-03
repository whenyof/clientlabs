"use client"

import { useState, useEffect, useRef } from "react"
import { useRouter } from "next/navigation"
import {
  Search, X,
  UserCircle, Building2, FileText, Truck, CheckSquare, Package, Wrench,
} from "lucide-react"

interface SearchResult {
  id: string
  title: string
  subtitle?: string
  type: "Lead" | "Cliente" | "Factura" | "Proveedor" | "Tarea" | "Producto" | "Servicio"
  href: string
  icon: string
}

interface SearchModalProps {
  open: boolean
  onClose: () => void
}

const TYPE_ICON: Record<SearchResult["type"], React.ElementType> = {
  Lead: UserCircle,
  Cliente: Building2,
  Factura: FileText,
  Proveedor: Truck,
  Tarea: CheckSquare,
  Producto: Package,
  Servicio: Wrench,
}

const TYPE_COLOR: Record<SearchResult["type"], string> = {
  Lead: "#3b82f6",
  Cliente: "#10b981",
  Factura: "#f59e0b",
  Proveedor: "#8b5cf6",
  Tarea: "#ef4444",
  Producto: "#6b7280",
  Servicio: "#0891b2",
}

const QUICK_LINKS = [
  { label: "Leads", href: "/dashboard/leads", icon: UserCircle },
  { label: "Clientes", href: "/dashboard/clients", icon: Building2 },
  { label: "Facturas", href: "/dashboard/finance/facturas", icon: FileText },
  { label: "Proveedores", href: "/dashboard/providers", icon: Truck },
  { label: "Tareas", href: "/dashboard/tasks", icon: CheckSquare },
]

export function SearchModal({ open, onClose }: SearchModalProps) {
  const [query, setQuery] = useState("")
  const [results, setResults] = useState<SearchResult[]>([])
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)
  const router = useRouter()

  useEffect(() => {
    if (open) {
      setTimeout(() => inputRef.current?.focus(), 50)
      setQuery("")
      setResults([])
      setTotal(0)
    }
  }, [open])

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose()
    }
    document.addEventListener("keydown", handler)
    return () => document.removeEventListener("keydown", handler)
  }, [onClose])

  useEffect(() => {
    if (query.trim().length < 2) {
      setResults([])
      setTotal(0)
      return
    }
    const timer = setTimeout(async () => {
      setLoading(true)
      try {
        const res = await fetch(`/api/search?q=${encodeURIComponent(query.trim())}`)
        const data = await res.json()
        setResults(data.results ?? [])
        setTotal(data.total ?? 0)
      } catch {
        setResults([])
        setTotal(0)
      } finally {
        setLoading(false)
      }
    }, 300)
    return () => clearTimeout(timer)
  }, [query])

  const navigate = (href: string) => {
    router.push(href)
    onClose()
  }

  // Group results by type
  const grouped = results.reduce<Record<string, SearchResult[]>>((acc, r) => {
    if (!acc[r.type]) acc[r.type] = []
    acc[r.type].push(r)
    return acc
  }, {})

  if (!open) return null

  return (
    <div
      className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-start justify-center pt-[18vh]"
      onClick={onClose}
    >
      <div
        className="w-full max-w-xl mx-4 rounded-xl shadow-2xl border border-[var(--border-subtle)] bg-white overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Input */}
        <div className="flex items-center gap-3 px-4 py-3 border-b border-[#f0f0f0]">
          <Search className="w-4 h-4 text-[#a3a3a3] shrink-0" />
          <input
            ref={inputRef}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Buscar clientes, facturas, leads…"
            className="flex-1 bg-transparent text-[#0a0a0a] placeholder:text-[#a3a3a3] outline-none text-sm"
          />
          {query && (
            <button onClick={() => setQuery("")} className="p-0.5 rounded hover:bg-[#f5f5f5]">
              <X className="w-3.5 h-3.5 text-[#a3a3a3]" />
            </button>
          )}
          <kbd className="px-1.5 py-0.5 text-[10px] font-mono rounded border border-[#e8e8e8] bg-[#fafafa] text-[#a3a3a3]">
            Esc
          </kbd>
        </div>

        {/* Body */}
        <div className="max-h-[380px] overflow-y-auto">

          {/* Minimum chars hint */}
          {query.length > 0 && query.trim().length < 2 && (
            <div className="p-6 text-center text-sm text-[#a3a3a3]">
              Escribe al menos 2 caracteres para buscar
            </div>
          )}

          {/* Loading */}
          {loading && (
            <div className="p-6 text-center text-sm text-[#a3a3a3]">Buscando…</div>
          )}

          {/* Quick links (no query) */}
          {!loading && !query && (
            <div className="p-3">
              <p className="text-[10px] font-semibold uppercase tracking-widest text-[#a3a3a3] px-2 mb-2">
                Ir a
              </p>
              {QUICK_LINKS.map((link) => {
                const Icon = link.icon
                return (
                  <button
                    key={link.href}
                    onClick={() => navigate(link.href)}
                    className="w-full flex items-center gap-3 px-2 py-2 rounded-lg hover:bg-[#f5f5f5] text-sm text-[#0a0a0a] transition-colors text-left"
                  >
                    <Icon className="w-4 h-4 text-[#a3a3a3] shrink-0" />
                    {link.label}
                  </button>
                )
              })}
            </div>
          )}

          {/* No results */}
          {!loading && query.trim().length >= 2 && results.length === 0 && (
            <div className="p-8 text-center text-sm text-[#a3a3a3]">
              Sin resultados para &ldquo;{query}&rdquo;
            </div>
          )}

          {/* Grouped results */}
          {!loading && results.length > 0 && (
            <div className="py-2">
              {Object.entries(grouped).map(([type, items]) => {
                const Icon = TYPE_ICON[type as SearchResult["type"]] ?? FileText
                const color = TYPE_COLOR[type as SearchResult["type"]] ?? "#6b7280"
                return (
                  <div key={type} className="mb-1">
                    <p className="text-[10px] font-semibold uppercase tracking-widest px-4 py-1.5" style={{ color }}>
                      {type}s
                    </p>
                    {items.map((item) => (
                      <button
                        key={item.id}
                        onClick={() => navigate(item.href)}
                        className="w-full flex items-center gap-3 px-3 py-2 mx-1 rounded-lg hover:bg-[#f5f5f5] transition-colors text-left"
                        style={{ width: "calc(100% - 8px)" }}
                      >
                        <Icon className="w-4 h-4 shrink-0" style={{ color }} />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm text-[#0a0a0a] truncate">{item.title}</p>
                          {item.subtitle && (
                            <p className="text-[11px] text-[#a3a3a3] truncate">{item.subtitle}</p>
                          )}
                        </div>
                        <span
                          className="text-[10px] font-medium px-1.5 py-0.5 rounded shrink-0"
                          style={{ color, background: `${color}15` }}
                        >
                          {type}
                        </span>
                      </button>
                    ))}
                  </div>
                )
              })}

              {total > results.length && (
                <p className="text-xs text-center text-[#a3a3a3] py-3 border-t border-[#f0f0f0] mt-1">
                  Mostrando {results.length} de {total}. Refina tu búsqueda.
                </p>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
