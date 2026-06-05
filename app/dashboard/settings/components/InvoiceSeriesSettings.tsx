"use client"

import { useState, useEffect } from "react"
import { toast } from "sonner"
import { Pencil, X, Check, RefreshCw } from "lucide-react"

interface InvoiceSeries {
  id: string
  name: string
  prefix: string
  nextNumber: number
  year: number
  isDefault: boolean
}

function SeriesRow({ series, onUpdated }: { series: InvoiceSeries; onUpdated: (s: InvoiceSeries) => void }) {
  const [editing, setEditing] = useState(false)
  const [value, setValue] = useState(String(series.nextNumber))
  const [saving, setSaving] = useState(false)

  const save = async () => {
    const num = parseInt(value)
    if (isNaN(num) || num < 1) { toast.error("Número no válido"); return }
    setSaving(true)
    try {
      const res = await fetch(`/api/settings/invoice-series/${series.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nextNumber: num }),
      })
      const data = await res.json()
      if (!res.ok) {
        if (res.status === 409) toast.error(data.error)
        else toast.error("Error al guardar")
        return
      }
      onUpdated(data)
      setEditing(false)
      toast.success("Serie actualizada")
    } catch {
      toast.error("Error de conexión")
    } finally {
      setSaving(false)
    }
  }

  const cancel = () => { setValue(String(series.nextNumber)); setEditing(false) }

  return (
    <tr className="border-b border-slate-100 last:border-0">
      <td className="py-3 px-4 text-sm text-slate-800 font-medium">
        {series.name}
        {series.isDefault && (
          <span className="ml-2 text-[10px] font-medium px-1.5 py-0.5 bg-emerald-50 text-emerald-700 rounded-full">
            Principal
          </span>
        )}
      </td>
      <td className="py-3 px-4 text-sm font-mono text-slate-600">{series.prefix}</td>
      <td className="py-3 px-4 text-sm text-slate-600">
        {editing ? (
          <input
            type="number"
            min={1}
            value={value}
            onChange={e => setValue(e.target.value)}
            onKeyDown={e => { if (e.key === "Enter") save(); if (e.key === "Escape") cancel() }}
            autoFocus
            className="w-24 px-2 py-1 border border-[var(--accent)] rounded-md text-sm text-slate-800 outline-none focus:ring-1 focus:ring-[var(--accent)]"
          />
        ) : (
          <span className="font-mono">{String(series.nextNumber).padStart(4, "0")}</span>
        )}
      </td>
      <td className="py-3 px-4 text-sm text-slate-400 font-mono">{series.year}</td>
      <td className="py-3 px-4">
        {editing ? (
          <div className="flex items-center gap-1.5">
            <button
              onClick={save}
              disabled={saving}
              className="p-1.5 rounded-md bg-emerald-50 text-emerald-700 hover:bg-emerald-100 transition-colors disabled:opacity-50"
            >
              {saving ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Check className="w-3.5 h-3.5" />}
            </button>
            <button onClick={cancel} className="p-1.5 rounded-md bg-slate-100 text-slate-500 hover:bg-slate-200 transition-colors">
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        ) : (
          <button
            onClick={() => { setValue(String(series.nextNumber)); setEditing(true) }}
            className="p-1.5 rounded-md text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-colors"
            title="Editar número de inicio"
          >
            <Pencil className="w-3.5 h-3.5" />
          </button>
        )}
      </td>
    </tr>
  )
}

export function InvoiceSeriesSettings() {
  const [series, setSeries] = useState<InvoiceSeries[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch("/api/settings/invoice-series")
      .then(r => r.json())
      .then((data: InvoiceSeries[]) => { setSeries(data); setLoading(false) })
      .catch(() => setLoading(false))
  }, [])

  const handleUpdated = (updated: InvoiceSeries) => {
    setSeries(prev => prev.map(s => s.id === updated.id ? updated : s))
  }

  if (loading) {
    return <div className="h-16 bg-slate-50 rounded-lg animate-pulse" />
  }

  if (series.length === 0) {
    return (
      <p className="text-sm text-slate-400 py-2">
        Aún no hay series creadas. Se generarán automáticamente al emitir tu primera factura.
      </p>
    )
  }

  return (
    <div className="overflow-hidden rounded-lg border border-slate-200">
      <table className="w-full text-left">
        <thead>
          <tr className="bg-slate-50 border-b border-slate-200">
            <th className="py-2.5 px-4 text-xs font-medium text-slate-500 uppercase tracking-wide">Serie</th>
            <th className="py-2.5 px-4 text-xs font-medium text-slate-500 uppercase tracking-wide">Prefijo</th>
            <th className="py-2.5 px-4 text-xs font-medium text-slate-500 uppercase tracking-wide">Nº actual</th>
            <th className="py-2.5 px-4 text-xs font-medium text-slate-500 uppercase tracking-wide">Año</th>
            <th className="py-2.5 px-4 text-xs font-medium text-slate-500 uppercase tracking-wide"></th>
          </tr>
        </thead>
        <tbody>
          {series.map(s => (
            <SeriesRow key={s.id} series={s} onUpdated={handleUpdated} />
          ))}
        </tbody>
      </table>
      <p className="text-[11px] text-slate-400 px-4 py-2.5 bg-slate-50 border-t border-slate-100">
        Solo puedes cambiar el número de inicio si no has emitido facturas en esa serie este año.
      </p>
    </div>
  )
}
