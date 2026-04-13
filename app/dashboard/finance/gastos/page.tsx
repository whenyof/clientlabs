"use client"

import { useState, useEffect, useCallback, useRef } from "react"
import {
  Receipt,
  TrendingDown,
  FileText,
  Search,
  Plus,
  X,
  AlertTriangle,
  Camera,
  Upload,
  CheckCircle2,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { toast } from "sonner"
import { detectarAnomalia } from "@/lib/billing/detectarAnomalia"

type Gasto = {
  id: string
  numero: string
  proveedor: string
  concepto: string
  fecha: string
  base: number
  iva: number
  total: number
  estado: string
}

type Kpis = {
  totalGastadoMes: number
  totalGastadoAnio: number
  ivaDeducibleAcumulado: number
}

const STATUS_LABEL: Record<string, string> = {
  DRAFT: "Borrador",
  SENT: "Recibida",
  VIEWED: "Revisada",
  PARTIAL: "Pago parcial",
  PAID: "Pagada",
  OVERDUE: "Vencida",
  CANCELED: "Cancelada",
}

const STATUS_BADGE: Record<string, string> = {
  DRAFT: "bg-slate-100 text-slate-600",
  SENT: "bg-blue-50 text-blue-700",
  VIEWED: "bg-purple-50 text-purple-700",
  PARTIAL: "bg-amber-50 text-amber-700",
  PAID: "bg-emerald-50 text-emerald-700",
  OVERDUE: "bg-red-50 text-red-700",
  CANCELED: "bg-gray-100 text-gray-500",
}

const PERIOD_OPTS = [
  { key: "month", label: "Este mes" },
  { key: "quarter", label: "Este trimestre" },
  { key: "year", label: "Este año" },
]

const CATEGORIAS = [
  { value: "SOFTWARE", label: "Software y suscripciones", pct: 100, ejemplos: "Vercel, Adobe, Office..." },
  { value: "MATERIAL", label: "Material de oficina", pct: 100, ejemplos: "Papel, toner, hardware..." },
  { value: "FORMACION", label: "Formacion y libros", pct: 100, ejemplos: "Cursos, libros tecnicos..." },
  { value: "SERVICIOS", label: "Servicios profesionales", pct: 100, ejemplos: "Gestoria, abogado..." },
  { value: "MARKETING", label: "Marketing y publicidad", pct: 100, ejemplos: "Ads, diseno, web..." },
  { value: "COMIDAS", label: "Comidas de trabajo", pct: 50, ejemplos: "Comidas con clientes..." },
  { value: "TRANSPORTE", label: "Transporte y vehiculo", pct: 50, ejemplos: "Gasolina, taxi, tren..." },
  { value: "TELEFONO", label: "Telefono e internet", pct: 50, ejemplos: "Movil, fibra en casa..." },
  { value: "SEGUROS", label: "Seguros profesionales", pct: 100, ejemplos: "Responsabilidad civil..." },
  { value: "OTROS", label: "Otros gastos", pct: 100, ejemplos: "Cualquier otro gasto..." },
]

function fmt(n: number) {
  return new Intl.NumberFormat("es-ES", { style: "currency", currency: "EUR" }).format(n)
}

function fmtDate(d: string) {
  return new Intl.DateTimeFormat("es-ES", { day: "2-digit", month: "2-digit", year: "numeric" }).format(new Date(d))
}

// ─── Modal nuevo gasto ─────────────────────────────────────────────────────────

type FormState = {
  proveedor: string
  concepto: string
  fecha: string
  base: string
  ivaRate: string
  categoria: string
  motivo: string
  deduciblePct: number | null
}

function NuevoGastoModal({
  onClose,
  onCreated,
}: {
  onClose: () => void
  onCreated: () => void
}) {
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [form, setForm] = useState<FormState>({
    proveedor: "",
    concepto: "",
    fecha: new Date().toISOString().split("T")[0],
    base: "",
    ivaRate: "21",
    categoria: "",
    motivo: "",
    deduciblePct: null,
  })
  const [uploading, setUploading] = useState(false)
  const [documentUrl, setDocumentUrl] = useState<string | null>(null)
  const [documentName, setDocumentName] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)

  const baseNum = parseFloat(form.base || "0")
  const ivaNum = parseFloat(form.ivaRate || "21")
  const taxAmount = baseNum > 0 ? +(baseNum * (ivaNum / 100)).toFixed(2) : 0
  const total = baseNum > 0 ? +(baseNum + taxAmount).toFixed(2) : 0

  const anomalia = detectarAnomalia({
    amount: baseNum,
    categoria: form.categoria || undefined,
    fecha: form.fecha ? new Date(form.fecha) : new Date(),
    proveedor: form.proveedor || undefined,
  })

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return

    setUploading(true)
    try {
      // Upload to Cloudinary via scan session upload-file infra isn't reachable without a session.
      // Instead use a direct FormData upload approach via the existing settings upload endpoint.
      // We send as multipart to /api/finance/gastos/upload
      const fd = new FormData()
      fd.append("file", file)
      const res = await fetch("/api/finance/gastos/upload", { method: "POST", body: fd })
      if (!res.ok) throw new Error("Error al subir el archivo")
      const data = await res.json()
      setDocumentUrl(data.url)
      setDocumentName(file.name)
      toast.success("Documento adjuntado")
    } catch {
      toast.error("No se pudo subir el documento")
    } finally {
      setUploading(false)
      if (fileInputRef.current) fileInputRef.current.value = ""
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!form.proveedor || !form.fecha || !form.base) {
      toast.error("Completa los campos requeridos")
      return
    }

    setSaving(true)
    try {
      const res = await fetch("/api/finance/gastos", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          proveedor: form.proveedor,
          concepto: form.concepto,
          fecha: form.fecha,
          base: form.base,
          ivaRate: form.ivaRate,
          categoria: form.categoria || undefined,
          documentUrl: documentUrl ?? undefined,
        }),
      })
      if (!res.ok) throw new Error("Error al guardar")
      toast.success("Gasto registrado")
      onCreated()
      onClose()
    } catch {
      toast.error("No se pudo guardar el gasto")
    } finally {
      setSaving(false)
    }
  }

  const catInfo = CATEGORIAS.find((c) => c.value === form.categoria)

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Overlay */}
      <div className="absolute inset-0 bg-black/30 backdrop-blur-sm" onClick={onClose} />

      <div className="relative bg-white rounded-xl border border-slate-200 w-full max-w-lg max-h-[90vh] overflow-y-auto shadow-lg">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
          <h2 className="text-[15px] font-semibold text-slate-900">Nuevo gasto</h2>
          <button
            type="button"
            onClick={onClose}
            className="w-7 h-7 rounded-lg flex items-center justify-center hover:bg-slate-100 transition-colors"
          >
            <X className="h-4 w-4 text-slate-500" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          {/* Anomalia banner */}
          {anomalia.esAnomalo && (
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
              <div className="flex items-start gap-3">
                <AlertTriangle className="h-4 w-4 text-amber-500 shrink-0 mt-0.5" />
                <div className="flex-1">
                  <p className="text-[13px] font-semibold text-amber-800 mb-1">
                    {anomalia.motivo}
                  </p>
                  <p className="text-[12px] text-amber-700 mb-3 leading-relaxed">
                    {anomalia.sugerencia}
                  </p>
                  <div className="flex gap-2 flex-wrap">
                    {[
                      { pct: 100, label: "Profesional al 100%", activeClass: "bg-emerald-600 text-white border-emerald-600", inactiveClass: "border-emerald-300 text-emerald-700 hover:bg-emerald-50" },
                      { pct: 50, label: "Parcial al 50%", activeClass: "bg-amber-500 text-white border-amber-500", inactiveClass: "border-amber-300 text-amber-700 hover:bg-amber-50" },
                      { pct: 0, label: "No deducible", activeClass: "bg-red-500 text-white border-red-500", inactiveClass: "border-red-200 text-red-600 hover:bg-red-50" },
                    ].map(({ pct, label, activeClass, inactiveClass }) => (
                      <button
                        key={pct}
                        type="button"
                        onClick={() =>
                          setForm((f) => ({
                            ...f,
                            deduciblePct: pct,
                            motivo:
                              pct === 100
                                ? "Gasto profesional confirmado"
                                : pct === 50
                                ? "Uso mixto personal/profesional"
                                : "Gasto personal no deducible",
                          }))
                        }
                        className={cn(
                          "px-3 py-1.5 text-[11px] font-medium rounded-lg border transition-all",
                          form.deduciblePct === pct ? activeClass : inactiveClass
                        )}
                      >
                        {label}
                      </button>
                    ))}
                  </div>
                  {form.deduciblePct !== null && (
                    <div className="mt-3">
                      <label className="text-[10px] font-semibold text-amber-700 uppercase tracking-wider block mb-1">
                        Motivo para Hacienda
                      </label>
                      <input
                        value={form.motivo}
                        onChange={(e) => setForm((f) => ({ ...f, motivo: e.target.value }))}
                        placeholder="Ej: Comida con cliente Juan Garcia el 15/04"
                        className="w-full px-3 py-2 border border-amber-200 rounded-lg text-[12px] outline-none focus:border-amber-400"
                      />
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Proveedor */}
          <div>
            <label className="text-[11px] font-semibold text-slate-600 uppercase tracking-wider block mb-1.5">
              Proveedor <span className="text-red-400">*</span>
            </label>
            <input
              value={form.proveedor}
              onChange={(e) => setForm((f) => ({ ...f, proveedor: e.target.value }))}
              placeholder="Nombre del proveedor o emisor"
              required
              className="w-full px-3 py-2.5 border border-slate-200 rounded-lg text-[13px] outline-none focus:border-[#1FA97A] focus:ring-1 focus:ring-[#1FA97A]/20"
            />
          </div>

          {/* Concepto */}
          <div>
            <label className="text-[11px] font-semibold text-slate-600 uppercase tracking-wider block mb-1.5">
              Concepto
            </label>
            <input
              value={form.concepto}
              onChange={(e) => setForm((f) => ({ ...f, concepto: e.target.value }))}
              placeholder="Descripcion del gasto"
              className="w-full px-3 py-2.5 border border-slate-200 rounded-lg text-[13px] outline-none focus:border-[#1FA97A] focus:ring-1 focus:ring-[#1FA97A]/20"
            />
          </div>

          {/* Fecha + Categoria */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-[11px] font-semibold text-slate-600 uppercase tracking-wider block mb-1.5">
                Fecha <span className="text-red-400">*</span>
              </label>
              <input
                type="date"
                value={form.fecha}
                onChange={(e) => setForm((f) => ({ ...f, fecha: e.target.value }))}
                required
                className="w-full px-3 py-2.5 border border-slate-200 rounded-lg text-[13px] outline-none focus:border-[#1FA97A] focus:ring-1 focus:ring-[#1FA97A]/20"
              />
            </div>
            <div>
              <label className="text-[11px] font-semibold text-slate-600 uppercase tracking-wider block mb-1.5">
                Categoria
              </label>
              <select
                value={form.categoria}
                onChange={(e) => setForm((f) => ({ ...f, categoria: e.target.value }))}
                className="w-full px-3 py-2.5 border border-slate-200 rounded-lg text-[13px] outline-none focus:border-[#1FA97A] bg-white"
              >
                <option value="">Sin categorizar</option>
                {CATEGORIAS.map((c) => (
                  <option key={c.value} value={c.value}>
                    {c.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Info de deducibilidad de la categoría */}
          {catInfo && (
            <div className={cn(
              "flex items-center gap-2 px-3 py-2 rounded-lg text-[11px]",
              catInfo.pct === 100
                ? "bg-emerald-50 text-emerald-700"
                : "bg-amber-50 text-amber-700"
            )}>
              <CheckCircle2 className="h-3.5 w-3.5 shrink-0" />
              <span>
                Deducible al <strong>{catInfo.pct}%</strong> — {catInfo.ejemplos}
              </span>
            </div>
          )}

          {/* Base + IVA */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-[11px] font-semibold text-slate-600 uppercase tracking-wider block mb-1.5">
                Base imponible (€) <span className="text-red-400">*</span>
              </label>
              <input
                type="number"
                min="0"
                step="0.01"
                value={form.base}
                onChange={(e) => setForm((f) => ({ ...f, base: e.target.value }))}
                placeholder="0.00"
                required
                className="w-full px-3 py-2.5 border border-slate-200 rounded-lg text-[13px] outline-none focus:border-[#1FA97A] focus:ring-1 focus:ring-[#1FA97A]/20"
              />
            </div>
            <div>
              <label className="text-[11px] font-semibold text-slate-600 uppercase tracking-wider block mb-1.5">
                IVA (%)
              </label>
              <select
                value={form.ivaRate}
                onChange={(e) => setForm((f) => ({ ...f, ivaRate: e.target.value }))}
                className="w-full px-3 py-2.5 border border-slate-200 rounded-lg text-[13px] outline-none focus:border-[#1FA97A] bg-white"
              >
                <option value="0">0%</option>
                <option value="4">4% (superreducido)</option>
                <option value="10">10% (reducido)</option>
                <option value="21">21% (general)</option>
              </select>
            </div>
          </div>

          {/* Total calculado */}
          {baseNum > 0 && (
            <div className="flex items-center justify-between px-4 py-3 bg-slate-50 rounded-xl text-[12px]">
              <div className="space-y-0.5">
                <div className="flex gap-4 text-slate-500">
                  <span>Base: <span className="font-medium text-slate-700">{fmt(baseNum)}</span></span>
                  <span>IVA ({form.ivaRate}%): <span className="font-medium text-slate-700">{fmt(taxAmount)}</span></span>
                </div>
              </div>
              <div className="text-right">
                <p className="text-[10px] text-slate-400 mb-0.5">TOTAL</p>
                <p className="text-[18px] font-bold text-slate-900 tabular-nums">{fmt(total)}</p>
              </div>
            </div>
          )}

          {/* Adjuntar ticket */}
          <div>
            <label className="text-[11px] font-semibold text-slate-600 uppercase tracking-wider block mb-1.5">
              Adjuntar ticket o factura
            </label>
            {documentUrl ? (
              <div className="flex items-center justify-between px-3 py-2.5 border border-emerald-200 bg-emerald-50 rounded-lg">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
                  <span className="text-[12px] text-emerald-700 truncate max-w-[220px]">
                    {documentName ?? "Documento adjunto"}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => { setDocumentUrl(null); setDocumentName(null) }}
                  className="text-[11px] text-slate-400 hover:text-red-500 transition-colors"
                >
                  Quitar
                </button>
              </div>
            ) : (
              <button
                type="button"
                disabled={uploading}
                onClick={() => fileInputRef.current?.click()}
                className="w-full flex items-center justify-center gap-2 px-4 py-3 border-2 border-dashed border-slate-200 rounded-xl text-[12px] font-medium text-slate-500 hover:border-[#1FA97A] hover:text-[#1FA97A] transition-colors disabled:opacity-50"
              >
                {uploading ? (
                  <>
                    <Upload className="h-4 w-4 animate-bounce" />
                    Subiendo...
                  </>
                ) : (
                  <>
                    <Camera className="h-4 w-4" />
                    Escanear ticket o subir imagen
                  </>
                )}
              </button>
            )}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*,application/pdf"
              capture="environment"
              className="hidden"
              onChange={handleFileChange}
            />
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-1">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 border border-slate-200 rounded-lg text-[13px] font-medium text-slate-600 hover:bg-slate-50 transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={saving || uploading}
              className="flex-1 py-2.5 bg-[#1FA97A] hover:bg-[#178a64] text-white rounded-lg text-[13px] font-semibold transition-colors disabled:opacity-60"
            >
              {saving ? "Guardando..." : "Guardar gasto"}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

// ─── Page ──────────────────────────────────────────────────────────────────────

export default function GastosPage() {
  const [gastos, setGastos] = useState<Gasto[]>([])
  const [kpis, setKpis] = useState<Kpis>({ totalGastadoMes: 0, totalGastadoAnio: 0, ivaDeducibleAcumulado: 0 })
  const [loading, setLoading] = useState(true)
  const [period, setPeriod] = useState("month")
  const [search, setSearch] = useState("")
  const [showModal, setShowModal] = useState(false)

  const fetchData = useCallback(async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams({ period })
      const res = await fetch(`/api/finance/gastos?${params}`, { credentials: "include" })
      if (!res.ok) return
      const data = await res.json()
      if (data.success) {
        setGastos(data.gastos)
        setKpis(data.kpis)
      }
    } finally {
      setLoading(false)
    }
  }, [period])

  useEffect(() => { fetchData() }, [fetchData])

  const filtered = gastos.filter((g) => {
    if (!search.trim()) return true
    const q = search.toLowerCase()
    return (
      g.proveedor.toLowerCase().includes(q) ||
      g.concepto.toLowerCase().includes(q) ||
      g.numero.toLowerCase().includes(q)
    )
  })

  const kpiCards = [
    {
      label: "Total gastado este mes",
      value: fmt(kpis.totalGastadoMes),
      icon: TrendingDown,
      valueClass: "text-red-500",
    },
    {
      label: "Total gastado este año",
      value: fmt(kpis.totalGastadoAnio),
      icon: Receipt,
      valueClass: "text-slate-900",
    },
    {
      label: "IVA deducible acumulado",
      value: fmt(kpis.ivaDeducibleAcumulado),
      icon: FileText,
      valueClass: "text-[#1FA97A]",
    },
  ]

  return (
    <div className="w-full space-y-5">
      {showModal && (
        <NuevoGastoModal onClose={() => setShowModal(false)} onCreated={fetchData} />
      )}

      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <h2 className="text-[15px] font-semibold text-slate-900">Gastos y compras</h2>
        <div className="flex items-center gap-2">
          {PERIOD_OPTS.map((p) => (
            <button
              key={p.key}
              type="button"
              onClick={() => setPeriod(p.key)}
              className={cn(
                "text-[11px] px-3 py-1.5 rounded-lg border transition-colors",
                period === p.key
                  ? "bg-[#1FA97A] text-white border-[#1FA97A]"
                  : "border-slate-200 text-slate-600 hover:bg-slate-50"
              )}
            >
              {p.label}
            </button>
          ))}
          <button
            type="button"
            onClick={() => setShowModal(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-[#1FA97A] hover:bg-[#178a64] text-white rounded-lg text-[11px] font-semibold transition-colors"
          >
            <Plus className="h-3.5 w-3.5" />
            Nuevo gasto
          </button>
        </div>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {kpiCards.map((k) => {
          const Icon = k.icon
          return (
            <div key={k.label} className="bg-white border border-slate-200 rounded-xl p-4">
              <div className="flex items-center justify-between mb-3">
                <span className="text-[11px] uppercase tracking-[0.08em] font-medium text-slate-500">{k.label}</span>
                <div className="w-7 h-7 rounded-lg bg-slate-50 border border-slate-100 flex items-center justify-center">
                  <Icon className="h-3.5 w-3.5 text-slate-400" />
                </div>
              </div>
              <div className={cn("text-[24px] font-semibold leading-none tabular-nums", k.valueClass, loading && "opacity-40")}>
                {loading ? "—" : k.value}
              </div>
            </div>
          )
        })}
      </div>

      {/* Search */}
      <div className="flex items-center gap-2 px-3 py-1.5 border border-slate-200 rounded-lg bg-white w-64">
        <Search className="h-3.5 w-3.5 text-slate-400 shrink-0" />
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Buscar proveedor o concepto..."
          className="text-[12px] outline-none flex-1 text-slate-700 placeholder-slate-400"
        />
      </div>

      {/* Table */}
      <div className="rounded-xl border border-slate-200 bg-white overflow-hidden">
        {loading ? (
          <div className="py-12 text-center text-[13px] text-slate-400 animate-pulse">Cargando...</div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <div className="w-12 h-12 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-center mb-4">
              <Receipt className="h-5 w-5 text-slate-400" />
            </div>
            <p className="text-[14px] font-medium text-slate-700 mb-1">Sin gastos registrados</p>
            <p className="text-[12px] text-slate-400 mb-4">
              Las facturas de proveedor aparecerán aquí cuando estén registradas
            </p>
            <button
              type="button"
              onClick={() => setShowModal(true)}
              className="flex items-center gap-1.5 px-4 py-2 bg-[#1FA97A] text-white rounded-lg text-[12px] font-semibold hover:bg-[#178a64] transition-colors"
            >
              <Plus className="h-3.5 w-3.5" />
              Registrar primer gasto
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[900px]">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50">
                  {["Fecha", "Proveedor", "Concepto", "Base", "IVA", "Total", "Estado"].map((h) => (
                    <th key={h} className="py-3 px-4 text-left text-[10px] font-medium text-slate-400 uppercase tracking-wider">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map((g) => (
                  <tr key={g.id} className="border-b border-slate-100 hover:bg-slate-50/50 transition-colors">
                    <td className="py-3.5 px-4 text-[12px] text-slate-500">{fmtDate(g.fecha)}</td>
                    <td className="py-3.5 px-4 text-[13px] font-medium text-slate-900">{g.proveedor}</td>
                    <td className="py-3.5 px-4 text-[12px] text-slate-600 max-w-[200px] truncate">{g.concepto}</td>
                    <td className="py-3.5 px-4 text-[12px] text-slate-700 text-right tabular-nums">{fmt(g.base)}</td>
                    <td className="py-3.5 px-4 text-[12px] text-slate-500 text-right tabular-nums">{fmt(g.iva)}</td>
                    <td className="py-3.5 px-4 text-[13px] font-semibold text-slate-900 text-right tabular-nums">{fmt(g.total)}</td>
                    <td className="py-3.5 px-4">
                      <span className={cn("inline-flex items-center rounded-md px-2 py-0.5 text-[11px] font-semibold", STATUS_BADGE[g.estado] ?? "bg-slate-100 text-slate-600")}>
                        {STATUS_LABEL[g.estado] ?? g.estado}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* IVA info note */}
      <div className="rounded-xl border border-[#1FA97A]/20 bg-emerald-50/50 p-4 flex items-start gap-3">
        <FileText className="h-4 w-4 text-[#1FA97A] shrink-0 mt-0.5" />
        <div>
          <p className="text-[12px] font-medium text-slate-700 mb-0.5">IVA deducible</p>
          <p className="text-[12px] text-slate-500">
            El IVA soportado en facturas de proveedor puede deducirse en tu declaracion trimestral.
            Total acumulado este año: <span className="font-semibold text-[#1FA97A]">{fmt(kpis.ivaDeducibleAcumulado)}</span>
          </p>
        </div>
      </div>
    </div>
  )
}
