"use client"

import { useState, useEffect, useRef } from "react"
import { useRouter } from "next/navigation"
import { X, Search, Users, UserCircle, FileText, Truck } from "lucide-react"

interface SearchResult {
  title: string
  subtitle?: string
  type: "Lead" | "Cliente" | "Factura" | "Proveedor"
  href: string
}

interface SearchModalProps {
  open: boolean
  onClose: () => void
}

const QUICK_LINKS = [
  { label: "Leads", href: "/dashboard/leads", icon: UserCircle },
  { label: "Clientes", href: "/dashboard/clients", icon: Users },
  { label: "Facturas", href: "/dashboard/finance/facturas", icon: FileText },
  { label: "Proveedores", href: "/dashboard/providers", icon: Truck },
]

const TYPE_ICON: Record<SearchResult["type"], React.ElementType> = {
  Lead: UserCircle,
  Cliente: Users,
  Factura: FileText,
  Proveedor: Truck,
}

export function SearchModal({ open, onClose }: SearchModalProps) {
  const [query, setQuery] = useState("")
  const [results, setResults] = useState<SearchResult[]>([])
  const [loading, setLoading] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)
  const router = useRouter()

  useEffect(() => {
    if (open) {
      setTimeout(() => inputRef.current?.focus(), 50)
      setQuery("")
      setResults([])
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
    if (!query.trim()) {
      setResults([])
      return
    }
    const timer = setTimeout(async () => {
      setLoading(true)
      try {
        const res = await fetch(`/api/search?q=${encodeURIComponent(query.trim())}`)
        const data = await res.json()
        setResults(data.results ?? [])
      } catch {
        setResults([])
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
        <div className="flex items-center gap-3 px-4 py-3 border-b border-[var(--border-subtle)]">
          <Search className="w-4 h-4 text-[#737373] shrink-0" />
          <input
            ref={inputRef}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Buscar clientes, facturas, leads…"
            className="flex-1 bg-transparent text-[#0a0a0a] placeholder:text-[#a3a3a3] outline-none text-sm"
          />
          {query && (
            <button onClick={() => setQuery("")} className="p-0.5 rounded hover:bg-[#f5f5f5]">
              <X className="w-3.5 h-3.5 text-[#737373]" />
            </button>
          )}
          <kbd className="px-1.5 py-0.5 text-[10px] font-mono rounded border border-[#e8e8e8] bg-[#fafafa] text-[#737373]">
            Esc
          </kbd>
        </div>

        {/* Body */}
        <div className="max-h-80 overflow-y-auto">
          {loading && (
            <div className="p-6 text-center text-sm text-[#737373]">Buscando…</div>
          )}

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
                    <Icon className="w-4 h-4 text-[#737373] shrink-0" />
                    {link.label}
                  </button>
                )
              })}
            </div>
          )}

          {!loading && query && results.length === 0 && (
            <div className="p-8 text-center text-sm text-[#737373]">
              Sin resultados para &ldquo;{query}&rdquo;
            </div>
          )}

          {!loading && results.length > 0 && (
            <div className="p-3 space-y-0.5">
              {results.map((r, i) => {
                const Icon = TYPE_ICON[r.type]
                return (
                  <button
                    key={i}
                    onClick={() => navigate(r.href)}
                    className="w-full flex items-center gap-3 px-2 py-2 rounded-lg hover:bg-[#f5f5f5] transition-colors text-left"
                  >
                    <Icon className="w-4 h-4 text-[#737373] shrink-0" />
                    <div className="flex-1 min-w-0">
                      <span className="text-sm text-[#0a0a0a] truncate block">{r.title}</span>
                      {r.subtitle && (
                        <span className="text-[11px] text-[#a3a3a3] truncate block">{r.subtitle}</span>
                      )}
                    </div>
                    <span className="text-[10px] font-medium text-[#737373] bg-[#f5f5f5] px-1.5 py-0.5 rounded shrink-0">
                      {r.type}
                    </span>
                  </button>
                )
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
