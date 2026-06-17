"use client"

import { useState } from "react"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"
import { Plus, Package, Pencil, Trash2, Search, Tag, Layers, Upload } from "lucide-react"
import { ProductImportModal } from "@/app/dashboard/settings/components/ProductImportModal"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

interface Product {
  id: string
  name: string
  description: string | null
  price: number
  taxRate: number
  unit: string
  category: string | null
  isService: boolean
  active: boolean
  createdAt: string
}

const UNITS = ["ud", "h", "kg", "m", "m²", "m³", "l", "pack", "mes", "año"]

function ProductModal({
  product,
  onClose,
  onSave,
}: {
  product: Product | null
  onClose: () => void
  onSave: (data: Partial<Product>) => void
}) {
  const [form, setForm] = useState({
    name: product?.name ?? "",
    description: product?.description ?? "",
    price: product?.price ?? 0,
    taxRate: product?.taxRate ?? 21,
    unit: product?.unit ?? "ud",
    category: product?.category ?? "",
    isService: product?.isService ?? false,
  })

  function set(k: string, v: unknown) {
    setForm((f) => ({ ...f, [k]: v }))
  }

  return (
    <div
      style={{
        position: "fixed", inset: 0, zIndex: 50,
        background: "rgba(0,0,0,0.4)", display: "flex", alignItems: "center", justifyContent: "center",
      }}
      onClick={onClose}
    >
      <div
        style={{
          background: "white", borderRadius: 12, padding: 28, width: "100%", maxWidth: 480,
          boxShadow: "0 8px 40px rgba(0,0,0,0.12)",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <h2 style={{ fontSize: 16, fontWeight: 700, marginBottom: 20, color: "#0f172a" }}>
          {product ? "Editar producto" : "Nuevo producto/servicio"}
        </h2>

        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          <div>
            <label style={labelStyle}>Nombre *</label>
            <input
              style={inputStyle}
              value={form.name}
              onChange={(e) => set("name", e.target.value)}
              placeholder="Ej: Consultoría estratégica"
            />
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            <div>
              <label style={labelStyle}>Precio (€) *</label>
              <input
                type="number"
                min={0}
                step={0.01}
                style={inputStyle}
                value={form.price}
                onChange={(e) => set("price", parseFloat(e.target.value) || 0)}
              />
            </div>
            <div>
              <label style={labelStyle}>IVA (%)</label>
              <input
                type="number"
                min={0}
                max={100}
                style={inputStyle}
                value={form.taxRate}
                onChange={(e) => set("taxRate", parseFloat(e.target.value) || 0)}
              />
            </div>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            <div>
              <label style={labelStyle}>Unidad</label>
              <Select value={form.unit} onValueChange={(v) => set("unit", v)}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Seleccionar..." />
                </SelectTrigger>
                <SelectContent>
                  {UNITS.map((u) => <SelectItem key={u} value={u}>{u}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div>
              <label style={labelStyle}>Categoría</label>
              <input
                style={inputStyle}
                value={form.category}
                onChange={(e) => set("category", e.target.value)}
                placeholder="Ej: Software"
              />
            </div>
          </div>

          <div>
            <label style={labelStyle}>Descripción</label>
            <textarea
              style={{ ...inputStyle, minHeight: 72, resize: "vertical" }}
              value={form.description}
              onChange={(e) => set("description", e.target.value)}
              placeholder="Descripción opcional..."
            />
          </div>

          <label style={{ display: "flex", alignItems: "center", gap: 8, cursor: "pointer", fontSize: 13 }}>
            <input
              type="checkbox"
              checked={form.isService}
              onChange={(e) => set("isService", e.target.checked)}
            />
            <span style={{ color: "#374151" }}>Es un servicio (no product físico)</span>
          </label>
        </div>

        <div style={{ display: "flex", gap: 8, marginTop: 24, justifyContent: "flex-end" }}>
          <button
            onClick={onClose}
            style={{
              padding: "8px 18px", borderRadius: 7, border: "1px solid #e2e8f0",
              background: "white", fontSize: 13, cursor: "pointer", color: "#64748b",
            }}
          >
            Cancelar
          </button>
          <button
            onClick={() => onSave(form)}
            disabled={!form.name.trim()}
            style={{
              padding: "8px 18px", borderRadius: 7, border: "none",
              background: "#0F766E", color: "white", fontSize: 13, fontWeight: 600, cursor: "pointer",
            }}
          >
            {product ? "Guardar cambios" : "Crear"}
          </button>
        </div>
      </div>
    </div>
  )
}

const labelStyle: React.CSSProperties = {
  display: "block", fontSize: 12, fontWeight: 600, color: "#64748b",
  marginBottom: 4, textTransform: "uppercase", letterSpacing: "0.05em",
}

const inputStyle: React.CSSProperties = {
  width: "100%", padding: "8px 10px", borderRadius: 7,
  border: "1px solid #e2e8f0", fontSize: 13, color: "#0f172a",
  background: "white", outline: "none", boxSizing: "border-box",
}

export default function ProductosPage() {
  const qc = useQueryClient()
  const [search, setSearch] = useState("")
  const [modal, setModal] = useState<{ open: boolean; product: Product | null }>({ open: false, product: null })
  const [showImport, setShowImport] = useState(false)

  const { data, isLoading } = useQuery<{ products: Product[] }>({
    queryKey: ["products"],
    queryFn: () => fetch("/api/products").then((r) => r.json()),
    staleTime: 30_000,
    refetchOnWindowFocus: false,
    retry: 0,
  })

  const products = data?.products ?? []
  const filtered = products.filter((p) =>
    p.name.toLowerCase().includes(search.toLowerCase()) ||
    (p.category ?? "").toLowerCase().includes(search.toLowerCase())
  )

  const createMutation = useMutation({
    mutationFn: (body: Partial<Product>) =>
      fetch("/api/products", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      }).then((r) => r.json()),
    onSuccess: (d) => {
      if (!d.success) { toast.error(d.error ?? "Error al crear"); return }
      toast.success("Producto creado")
      qc.invalidateQueries({ queryKey: ["products"] })
      setModal({ open: false, product: null })
    },
    onError: () => toast.error("Error al crear"),
  })

  const updateMutation = useMutation({
    mutationFn: ({ id, ...body }: Partial<Product> & { id: string }) =>
      fetch(`/api/products/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      }).then((r) => r.json()),
    onSuccess: (d) => {
      if (!d.success) { toast.error(d.error ?? "Error"); return }
      toast.success("Cambios guardados")
      qc.invalidateQueries({ queryKey: ["products"] })
      setModal({ open: false, product: null })
    },
    onError: () => toast.error("Error al guardar"),
  })

  const deleteMutation = useMutation({
    mutationFn: (id: string) =>
      fetch(`/api/products/${id}`, { method: "DELETE" }).then((r) => r.json()),
    onSuccess: () => {
      toast.success("Producto eliminado")
      qc.invalidateQueries({ queryKey: ["products"] })
    },
    onError: () => toast.error("Error al eliminar"),
  })

  function handleSave(form: Partial<Product>) {
    if (modal.product) {
      updateMutation.mutate({ id: modal.product.id, ...form })
    } else {
      createMutation.mutate(form)
    }
  }

  const services = filtered.filter((p) => p.isService)
  const goods = filtered.filter((p) => !p.isService)

  return (
    <div className="w-full">
      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 24 }}>
        <div>
          <h1 style={{ fontSize: 20, fontWeight: 700, color: "var(--text-primary)", margin: 0 }}>
            Productos y servicios
          </h1>
          <p style={{ fontSize: 13, color: "var(--text-secondary)", margin: "4px 0 0" }}>
            Catálogo reutilizable al crear presupuestos y facturas
          </p>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <button
            onClick={() => setShowImport(true)}
            style={{
              display: "flex", alignItems: "center", gap: 6,
              padding: "9px 16px", borderRadius: 8,
              border: "1px solid var(--border-subtle)",
              background: "var(--bg-card)", color: "var(--text-primary)",
              fontSize: 13, fontWeight: 600, cursor: "pointer",
            }}
          >
            <Upload style={{ width: 14, height: 14 }} />
            Importar
          </button>
          <button
            onClick={() => setModal({ open: true, product: null })}
            style={{
              display: "flex", alignItems: "center", gap: 6,
              padding: "9px 16px", borderRadius: 8, border: "none",
              background: "#0F766E", color: "white", fontSize: 13, fontWeight: 600, cursor: "pointer",
            }}
          >
            <Plus style={{ width: 14, height: 14 }} />
            Nuevo
          </button>
        </div>
      </div>

      {/* Search */}
      <div style={{ position: "relative", marginBottom: 20 }}>
        <Search style={{
          position: "absolute", left: 10, top: "50%", transform: "translateY(-50%)",
          width: 14, height: 14, color: "var(--text-secondary)",
        }} />
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Buscar por nombre o categoría..."
          style={{
            width: "100%", padding: "9px 10px 9px 32px", borderRadius: 8,
            border: "1px solid var(--border-subtle)", fontSize: 13,
            background: "var(--bg-card)", color: "var(--text-primary)", outline: "none",
            boxSizing: "border-box",
          }}
        />
      </div>

      {isLoading ? (
        <div style={{ textAlign: "center", padding: 60, color: "var(--text-secondary)", fontSize: 13 }}>
          Cargando...
        </div>
      ) : filtered.length === 0 ? (
        <div style={{
          textAlign: "center", padding: 60, background: "var(--bg-card)",
          borderRadius: 12, border: "1px solid var(--border-subtle)",
        }}>
          <Package style={{ width: 36, height: 36, color: "var(--text-secondary)", margin: "0 auto 12px" }} />
          <p style={{ fontSize: 14, color: "var(--text-primary)", fontWeight: 600, margin: 0 }}>
            Sin productos
          </p>
          <p style={{ fontSize: 12, color: "var(--text-secondary)", margin: "6px 0 0" }}>
            Crea tu primer producto o servicio para reutilizarlo en presupuestos y facturas
          </p>
        </div>
      ) : (
        <>
          {goods.length > 0 && <ProductGroup title="Productos" icon={Package} items={goods} onEdit={(p) => setModal({ open: true, product: p })} onDelete={(id) => deleteMutation.mutate(id)} />}
          {services.length > 0 && <ProductGroup title="Servicios" icon={Layers} items={services} onEdit={(p) => setModal({ open: true, product: p })} onDelete={(id) => deleteMutation.mutate(id)} />}
        </>
      )}

      {modal.open && (
        <ProductModal
          product={modal.product}
          onClose={() => setModal({ open: false, product: null })}
          onSave={handleSave}
        />
      )}

      {showImport && (
        <ProductImportModal
          onClose={() => setShowImport(false)}
          onDone={() => {
            setShowImport(false)
            qc.invalidateQueries({ queryKey: ["products"] })
          }}
        />
      )}
    </div>
  )
}

function ProductGroup({
  title,
  icon: Icon,
  items,
  onEdit,
  onDelete,
}: {
  title: string
  icon: React.ComponentType<{ style?: React.CSSProperties }>
  items: Product[]
  onEdit: (p: Product) => void
  onDelete: (id: string) => void
}) {
  return (
    <div style={{ marginBottom: 28 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 10 }}>
        <Icon style={{ width: 14, height: 14, color: "var(--text-secondary)" }} />
        <span style={{ fontSize: 11, fontWeight: 700, color: "var(--text-secondary)", textTransform: "uppercase", letterSpacing: "0.08em" }}>
          {title} ({items.length})
        </span>
      </div>
      <div style={{
        background: "var(--bg-card)", borderRadius: 12,
        border: "1px solid var(--border-subtle)", overflow: "hidden",
      }}>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ background: "var(--bg-surface)" }}>
              {["Nombre", "Precio", "IVA", "Unidad", "Categoría", ""].map((h) => (
                <th key={h} style={{
                  padding: "9px 14px", textAlign: "left", fontSize: 11, fontWeight: 600,
                  color: "var(--text-secondary)", textTransform: "uppercase", letterSpacing: "0.06em",
                  borderBottom: "1px solid var(--border-subtle)",
                }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {items.map((p, idx) => (
              <tr
                key={p.id}
                style={{
                  borderTop: idx > 0 ? "1px solid var(--border-subtle)" : undefined,
                  transition: "background 0.1s",
                }}
                onMouseEnter={(e) => { (e.currentTarget as HTMLTableRowElement).style.background = "var(--bg-surface)" }}
                onMouseLeave={(e) => { (e.currentTarget as HTMLTableRowElement).style.background = "transparent" }}
              >
                <td style={{ padding: "11px 14px", fontSize: 13, fontWeight: 500, color: "var(--text-primary)" }}>
                  {p.name}
                  {p.description && (
                    <span style={{ display: "block", fontSize: 11, color: "var(--text-secondary)", marginTop: 2 }}>
                      {p.description.slice(0, 60)}{p.description.length > 60 ? "…" : ""}
                    </span>
                  )}
                </td>
                <td style={{ padding: "11px 14px", fontSize: 13, color: "var(--text-primary)", whiteSpace: "nowrap" }}>
                  {p.price.toLocaleString("es-ES", { style: "currency", currency: "EUR" })}
                </td>
                <td style={{ padding: "11px 14px", fontSize: 13, color: "var(--text-secondary)" }}>
                  {p.taxRate}%
                </td>
                <td style={{ padding: "11px 14px" }}>
                  <span style={{
                    fontSize: 11, padding: "2px 7px", borderRadius: 20,
                    background: "var(--bg-surface)", color: "var(--text-secondary)",
                    border: "0.5px solid var(--border-subtle)",
                  }}>{p.unit}</span>
                </td>
                <td style={{ padding: "11px 14px", fontSize: 12, color: "var(--text-secondary)" }}>
                  {p.category ? (
                    <span style={{ display: "inline-flex", alignItems: "center", gap: 4 }}>
                      <Tag style={{ width: 10, height: 10 }} />
                      {p.category}
                    </span>
                  ) : "—"}
                </td>
                <td style={{ padding: "11px 14px" }}>
                  <div style={{ display: "flex", gap: 4, justifyContent: "flex-end" }}>
                    <button
                      onClick={() => onEdit(p)}
                      style={{
                        padding: "5px 10px", borderRadius: 6, border: "1px solid var(--border-subtle)",
                        background: "transparent", cursor: "pointer", display: "flex", alignItems: "center", gap: 4,
                        fontSize: 12, color: "var(--text-secondary)",
                      }}
                    >
                      <Pencil style={{ width: 11, height: 11 }} />
                      Editar
                    </button>
                    <button
                      onClick={() => { if (confirm(`¿Eliminar "${p.name}"?`)) onDelete(p.id) }}
                      style={{
                        padding: "5px 8px", borderRadius: 6, border: "1px solid #fecaca",
                        background: "transparent", cursor: "pointer", display: "flex", alignItems: "center",
                        color: "#ef4444",
                      }}
                    >
                      <Trash2 style={{ width: 11, height: 11 }} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
