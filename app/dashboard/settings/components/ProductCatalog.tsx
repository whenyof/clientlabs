"use client"

import { useState, useEffect, useCallback } from "react"
import { Plus, Pencil, Trash2, Search, Package, Check, X } from "lucide-react"
import { cn } from "@/lib/utils"

type Product = {
  id: string
  name: string
  description: string | null
  price: number
  taxRate: number
  unit: string | null
  category: string | null
  isService: boolean
  deletedAt: string | null
}

function fmt(n: number) {
  return new Intl.NumberFormat("es-ES", { style: "currency", currency: "EUR" }).format(n)
}

type FormState = {
  name: string
  description: string
  price: string
  taxRate: string
  unit: string
  category: string
  isService: boolean
}

const EMPTY_FORM: FormState = {
  name: "",
  description: "",
  price: "0",
  taxRate: "21",
  unit: "",
  category: "",
  isService: false,
}

export function ProductCatalog() {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")
  const [editingId, setEditingId] = useState<string | null>(null)
  const [form, setForm] = useState<FormState>(EMPTY_FORM)
  const [showCreate, setShowCreate] = useState(false)
  const [saving, setSaving] = useState(false)

  const fetchProducts = useCallback(async () => {
    setLoading(true)
    try {
      const res = await fetch("/api/products")
      const data = await res.json()
      if (data.products) setProducts(data.products)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { fetchProducts() }, [fetchProducts])

  const filtered = products.filter(p =>
    !search ||
    p.name.toLowerCase().includes(search.toLowerCase()) ||
    (p.category ?? "").toLowerCase().includes(search.toLowerCase())
  )

  const startEdit = (p: Product) => {
    setEditingId(p.id)
    setForm({
      name: p.name,
      description: p.description ?? "",
      price: String(p.price),
      taxRate: String(p.taxRate),
      unit: p.unit ?? "",
      category: p.category ?? "",
      isService: p.isService,
    })
    setShowCreate(false)
  }

  const cancelEdit = () => { setEditingId(null); setForm(EMPTY_FORM) }

  const saveEdit = async (id: string) => {
    setSaving(true)
    try {
      await fetch(`/api/products/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: form.name,
          description: form.description || null,
          price: Number(form.price),
          taxRate: Number(form.taxRate),
          unit: form.unit || null,
          category: form.category || null,
          isService: form.isService,
        }),
      })
      setEditingId(null)
      fetchProducts()
    } finally {
      setSaving(false)
    }
  }

  const deleteProduct = async (id: string) => {
    if (!confirm("¿Eliminar este producto del catálogo?")) return
    await fetch(`/api/products/${id}`, { method: "DELETE" })
    fetchProducts()
  }

  const createProduct = async () => {
    if (!form.name) return
    setSaving(true)
    try {
      await fetch("/api/products", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: form.name,
          description: form.description || null,
          price: Number(form.price),
          taxRate: Number(form.taxRate),
          unit: form.unit || null,
          category: form.category || null,
          isService: form.isService,
        }),
      })
      setShowCreate(false)
      setForm(EMPTY_FORM)
      fetchProducts()
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div>
          <h2 className="text-[15px] font-semibold text-slate-900">Catálogo de productos</h2>
          <p className="text-[12px] text-slate-500 mt-0.5">Productos y servicios para usar en presupuestos y facturas</p>
        </div>
        <button
          onClick={() => { setShowCreate(true); setEditingId(null); setForm(EMPTY_FORM) }}
          className="flex items-center gap-2 px-4 py-2 bg-[#1FA97A] text-white rounded-lg text-[12px] font-medium hover:bg-[#178f68] transition-colors"
        >
          <Plus className="h-3.5 w-3.5" />
          Nuevo producto
        </button>
      </div>

      {/* Search */}
      <div className="flex items-center gap-2 px-3 py-2 border border-slate-200 rounded-lg bg-white w-full max-w-xs">
        <Search className="h-3.5 w-3.5 text-slate-400 shrink-0" />
        <input
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Buscar producto o categoría..."
          className="text-[12px] outline-none flex-1 text-slate-700 placeholder-slate-400"
        />
      </div>

      {/* Create form */}
      {showCreate && (
        <div className="rounded-xl border border-[#9FE1CB] bg-[#E1F5EE]/30 p-4 space-y-3">
          <p className="text-[12px] font-medium text-slate-700">Nuevo producto / servicio</p>
          <ProductForm form={form} onChange={setForm} />
          <div className="flex items-center gap-2 justify-end pt-1">
            <button
              onClick={() => { setShowCreate(false); setForm(EMPTY_FORM) }}
              className="px-3 py-1.5 text-[12px] text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
            >
              Cancelar
            </button>
            <button
              onClick={createProduct}
              disabled={saving || !form.name}
              className="px-3 py-1.5 text-[12px] bg-[#1FA97A] text-white rounded-lg hover:bg-[#178f68] transition-colors disabled:opacity-50"
            >
              {saving ? "Guardando..." : "Guardar"}
            </button>
          </div>
        </div>
      )}

      {/* Table */}
      <div className="rounded-xl border border-slate-200 bg-white overflow-hidden">
        {loading ? (
          <div className="py-10 text-center text-[13px] text-slate-400 animate-pulse">Cargando...</div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-14">
            <div className="w-10 h-10 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-center mb-3">
              <Package className="h-5 w-5 text-slate-400" />
            </div>
            <p className="text-[13px] font-medium text-slate-700 mb-1">Sin productos</p>
            <p className="text-[12px] text-slate-400">Añade productos para usarlos en presupuestos</p>
          </div>
        ) : (
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50">
                {["Nombre", "Categoría", "Precio", "IVA", "Unidad", "Tipo", ""].map(h => (
                  <th key={h} className="py-3 px-4 text-left text-[10px] font-medium text-slate-400 uppercase tracking-wider">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map(p => (
                editingId === p.id ? (
                  <tr key={p.id} className="border-b border-slate-100 bg-slate-50/50">
                    <td colSpan={7} className="px-4 py-3">
                      <ProductForm form={form} onChange={setForm} />
                      <div className="flex items-center gap-2 justify-end mt-2">
                        <button onClick={cancelEdit} className="p-1.5 rounded-md hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors" title="Cancelar">
                          <X className="h-3.5 w-3.5" />
                        </button>
                        <button
                          onClick={() => saveEdit(p.id)}
                          disabled={saving}
                          className="p-1.5 rounded-md hover:bg-[#E1F5EE] text-slate-400 hover:text-[#1FA97A] transition-colors disabled:opacity-50"
                          title="Guardar"
                        >
                          <Check className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ) : (
                  <tr key={p.id} className="border-b border-slate-100 hover:bg-slate-50/50 transition-colors">
                    <td className="py-3.5 px-4 text-[13px] font-medium text-slate-900">{p.name}</td>
                    <td className="py-3.5 px-4 text-[12px] text-slate-500">{p.category ?? "—"}</td>
                    <td className="py-3.5 px-4 text-[13px] font-semibold text-slate-900 tabular-nums">{fmt(p.price)}</td>
                    <td className="py-3.5 px-4 text-[12px] text-slate-500">{p.taxRate}%</td>
                    <td className="py-3.5 px-4 text-[12px] text-slate-500">{p.unit ?? "—"}</td>
                    <td className="py-3.5 px-4">
                      <span className={cn(
                        "inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-medium",
                        p.isService
                          ? "bg-blue-50 text-blue-700 border border-blue-200"
                          : "bg-slate-100 text-slate-600"
                      )}>
                        {p.isService ? "Servicio" : "Producto"}
                      </span>
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-0.5 justify-end">
                        <button
                          onClick={() => startEdit(p)}
                          className="p-1.5 rounded-md hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors"
                          title="Editar"
                        >
                          <Pencil className="h-3.5 w-3.5" />
                        </button>
                        <button
                          onClick={() => deleteProduct(p.id)}
                          className="p-1.5 rounded-md hover:bg-red-50 text-slate-400 hover:text-red-500 transition-colors"
                          title="Eliminar"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                )
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}

function ProductForm({ form, onChange }: { form: FormState; onChange: (f: FormState) => void }) {
  const set = (patch: Partial<FormState>) => onChange({ ...form, ...patch })
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
      <div className="sm:col-span-2">
        <label className="block text-[10px] font-medium text-slate-500 uppercase tracking-wider mb-1">Nombre *</label>
        <input
          value={form.name}
          onChange={e => set({ name: e.target.value })}
          placeholder="Nombre del producto"
          className="w-full text-[12px] border border-slate-200 rounded-lg px-3 py-2 text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#1FA97A]/30 focus:border-[#1FA97A]"
        />
      </div>
      <div>
        <label className="block text-[10px] font-medium text-slate-500 uppercase tracking-wider mb-1">Categoría</label>
        <input
          value={form.category}
          onChange={e => set({ category: e.target.value })}
          placeholder="Software, Diseño..."
          className="w-full text-[12px] border border-slate-200 rounded-lg px-3 py-2 text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#1FA97A]/30 focus:border-[#1FA97A]"
        />
      </div>
      <div>
        <label className="block text-[10px] font-medium text-slate-500 uppercase tracking-wider mb-1">Precio (€)</label>
        <input
          type="number"
          min={0}
          step={0.01}
          value={form.price}
          onChange={e => set({ price: e.target.value })}
          className="w-full text-[12px] border border-slate-200 rounded-lg px-3 py-2 text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#1FA97A]/30 focus:border-[#1FA97A]"
        />
      </div>
      <div>
        <label className="block text-[10px] font-medium text-slate-500 uppercase tracking-wider mb-1">IVA %</label>
        <input
          type="number"
          min={0}
          max={100}
          step={1}
          value={form.taxRate}
          onChange={e => set({ taxRate: e.target.value })}
          className="w-full text-[12px] border border-slate-200 rounded-lg px-3 py-2 text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#1FA97A]/30 focus:border-[#1FA97A]"
        />
      </div>
      <div>
        <label className="block text-[10px] font-medium text-slate-500 uppercase tracking-wider mb-1">Unidad</label>
        <input
          value={form.unit}
          onChange={e => set({ unit: e.target.value })}
          placeholder="h, uds., mes..."
          className="w-full text-[12px] border border-slate-200 rounded-lg px-3 py-2 text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#1FA97A]/30 focus:border-[#1FA97A]"
        />
      </div>
      <div className="sm:col-span-3">
        <label className="block text-[10px] font-medium text-slate-500 uppercase tracking-wider mb-1">Descripción</label>
        <input
          value={form.description}
          onChange={e => set({ description: e.target.value })}
          placeholder="Descripción opcional"
          className="w-full text-[12px] border border-slate-200 rounded-lg px-3 py-2 text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#1FA97A]/30 focus:border-[#1FA97A]"
        />
      </div>
      <div className="flex items-center gap-2">
        <input
          type="checkbox"
          id={`isService-${Math.random()}`}
          checked={form.isService}
          onChange={e => set({ isService: e.target.checked })}
          className="h-4 w-4 rounded border-slate-300 accent-[#1FA97A]"
        />
        <label className="text-[12px] text-slate-600">Es un servicio</label>
      </div>
    </div>
  )
}
