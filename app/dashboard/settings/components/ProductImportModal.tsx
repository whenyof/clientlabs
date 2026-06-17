"use client"

import { useState, useRef, useCallback } from "react"
import { Upload, X, Download, FileSpreadsheet, AlertCircle, CheckCircle2 } from "lucide-react"
import { cn } from "@/lib/utils"
import { toast } from "sonner"

const TEMPLATE_CSV = `referencia,nombre,descripcion,precio_unitario,tipo_iva,unidad,tipo,categoria
REF-001,Consultoría hora,Consultoría técnica por hora,75.00,21,h,SERVICIO,Consultoría
REF-002,Licencia software,Licencia mensual software,29.99,21,mes,PRODUCTO,Software
REF-003,Pack diseño web,Diseño y maquetación web,1200.00,21,ud,SERVICIO,Diseño`

const IVA_OPTIONS = [0, 4, 10, 21]

type DupAction = "overwrite" | "skip"

type EditRow = {
  rowIndex: number
  nombre: string
  descripcion: string
  precioUnitario: number
  tipoIva: number
  unidad: string
  isService: boolean
  categoria: string
  isDuplicate: boolean
  existingId: string | null
  dupAction: DupAction
}

type PreviewResponse = {
  rows: Omit<EditRow, "dupAction">[]
  summary: { total: number; nuevos: number; duplicados: number; productos: number; servicios: number; errores: number }
  errors: { row: number; motivo: string }[]
}

type CommitResult = {
  imported: number
  updated: number
  skipped: number
  errors: { row: number; motivo: string }[]
}

interface Props {
  onClose: () => void
  onDone: () => void
}

export function ProductImportModal({ onClose, onDone }: Props) {
  const [dragging, setDragging] = useState(false)
  const [file, setFile] = useState<File | null>(null)
  const [rows, setRows] = useState<EditRow[]>([])
  const [previewErrors, setPreviewErrors] = useState<{ row: number; motivo: string }[]>([])
  const [previewing, setPreviewing] = useState(false)
  const [importing, setImporting] = useState(false)
  const [result, setResult] = useState<CommitResult | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  const runPreview = useCallback(async (f: File) => {
    setPreviewing(true)
    setRows([])
    setPreviewErrors([])
    setResult(null)
    try {
      const fd = new FormData()
      fd.append("file", f)
      fd.append("dryRun", "true")
      const res = await fetch("/api/products/import", { method: "POST", body: fd })
      const data: PreviewResponse & { error?: string } = await res.json().catch(() => ({ error: "Error inesperado" }))
      if (!res.ok) throw new Error(data.error ?? "No se pudo previsualizar")
      setRows(data.rows.map((r) => ({ ...r, dupAction: "overwrite" as DupAction })))
      setPreviewErrors(data.errors ?? [])
      if (data.rows.length === 0) {
        toast.warning(data.errors?.length ? "Ninguna fila válida — revisa los errores" : "El archivo no tiene filas válidas")
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "No se pudo previsualizar")
    } finally {
      setPreviewing(false)
    }
  }, [])

  const handleFile = useCallback((f: File) => {
    setFile(f)
    runPreview(f)
  }, [runPreview])

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setDragging(false)
    const f = e.dataTransfer.files[0]
    if (f) handleFile(f)
  }

  const downloadTemplate = () => {
    const blob = new Blob([TEMPLATE_CSV], { type: "text/csv;charset=utf-8;" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = "plantilla-productos.csv"
    a.click()
    URL.revokeObjectURL(url)
  }

  const updateRow = (rowIndex: number, patch: Partial<EditRow>) =>
    setRows((prev) => prev.map((r) => (r.rowIndex === rowIndex ? { ...r, ...patch } : r)))

  const setAllDup = (action: DupAction) =>
    setRows((prev) => prev.map((r) => (r.isDuplicate ? { ...r, dupAction: action } : r)))

  // Resumen en vivo (recalcula al togglear)
  const duplicados = rows.filter((r) => r.isDuplicate).length
  const servicios = rows.filter((r) => r.isService).length
  const summary = {
    total: rows.length,
    nuevas: rows.length - duplicados,
    duplicadas: duplicados,
    productos: rows.length - servicios,
    servicios,
  }

  const handleImport = async () => {
    if (rows.length === 0) return
    setImporting(true)
    try {
      const payload = {
        rows: rows.map((r) => ({
          nombre: r.nombre,
          descripcion: r.descripcion,
          precioUnitario: r.precioUnitario,
          tipoIva: r.tipoIva,
          unidad: r.unidad,
          isService: r.isService,
          categoria: r.categoria,
          action: r.isDuplicate ? r.dupAction : "create",
        })),
      }
      const res = await fetch("/api/products/import", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      })
      const data: CommitResult & { error?: string } = await res.json().catch(() => ({ error: "Error inesperado" }))
      if (!res.ok) throw new Error(data.error ?? "Error al importar")
      setResult(data)
      if (data.imported + data.updated > 0) {
        toast.success(`${data.imported} creados · ${data.updated} actualizados · ${data.skipped} omitidos`)
        onDone()
      } else {
        toast.warning(`Nada importado · ${data.skipped} omitidos`)
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Error al importar")
    } finally {
      setImporting(false)
    }
  }

  const inputCls = "w-full text-[12px] border border-slate-200 rounded-md px-2 py-1.5 text-slate-900 focus:outline-none focus:ring-1 focus:ring-[#0F766E]/30 focus:border-[#0F766E]"

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-5xl max-h-[92vh] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-[#E1F5EE] flex items-center justify-center">
              <FileSpreadsheet className="w-4 h-4 text-[#0F766E]" />
            </div>
            <h2 className="text-[15px] font-semibold text-slate-900">Importar productos</h2>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400 transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-6 space-y-4 overflow-y-auto">
          {/* Template + drop zone (compacto cuando ya hay filas) */}
          {rows.length === 0 && !result && (
            <>
              <div className="flex items-center justify-between px-4 py-3 rounded-xl bg-slate-50 border border-slate-200">
                <div>
                  <p className="text-[12px] font-medium text-slate-700">¿Primera vez?</p>
                  <p className="text-[11px] text-slate-400 mt-0.5">Descarga la plantilla, aunque aceptamos tus propios nombres de columna</p>
                </div>
                <button
                  onClick={downloadTemplate}
                  className="flex items-center gap-1.5 px-3 py-1.5 text-[12px] font-medium text-[#0F766E] border border-[#0F766E]/30 bg-white rounded-lg hover:bg-[#E1F5EE] transition-colors"
                >
                  <Download className="w-3.5 h-3.5" />
                  Descargar plantilla
                </button>
              </div>

              <div
                onDragOver={(e) => { e.preventDefault(); setDragging(true) }}
                onDragLeave={() => setDragging(false)}
                onDrop={onDrop}
                onClick={() => inputRef.current?.click()}
                className={cn(
                  "border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all",
                  dragging ? "border-[#0F766E] bg-[#E1F5EE]/40" : "border-slate-200 hover:border-slate-300 hover:bg-slate-50"
                )}
              >
                <input
                  ref={inputRef}
                  type="file"
                  accept=".csv,.xlsx,.xls"
                  className="hidden"
                  onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFile(f) }}
                />
                <Upload className="w-8 h-8 mx-auto mb-2 text-slate-300" />
                {previewing ? (
                  <p className="text-[13px] font-medium text-slate-600">Analizando {file?.name}…</p>
                ) : (
                  <>
                    <p className="text-[13px] font-medium text-slate-600">Arrastra tu archivo aquí</p>
                    <p className="text-[11px] text-slate-400 mt-0.5">CSV o Excel (.xlsx) · máx. 5 MB</p>
                  </>
                )}
              </div>
            </>
          )}

          {/* Errores de filas inválidas detectados en el preview */}
          {!result && previewErrors.length > 0 && (
            <div className="rounded-xl border border-amber-200 bg-amber-50 p-3">
              <p className="text-[12px] font-medium text-amber-700 flex items-center gap-1.5 mb-1">
                <AlertCircle className="w-4 h-4" /> {previewErrors.length} fila(s) con errores (no se importarán)
              </p>
              <ul className="space-y-0.5 max-h-24 overflow-y-auto">
                {previewErrors.map((e, i) => (
                  <li key={i} className="text-[11px] text-amber-600">Fila {e.row}: {e.motivo}</li>
                ))}
              </ul>
            </div>
          )}

          {/* Resumen en vivo + controles globales de duplicados */}
          {!result && rows.length > 0 && (
            <div className="flex items-center justify-between gap-3 flex-wrap px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200">
              <p className="text-[12px] text-slate-600">
                <strong className="text-slate-900">{summary.total}</strong> filas ·{" "}
                <strong className="text-emerald-600">{summary.nuevas}</strong> nuevas ·{" "}
                <strong className="text-amber-600">{summary.duplicadas}</strong> duplicadas ·{" "}
                {summary.productos} productos · {summary.servicios} servicios
              </p>
              {duplicados > 0 && (
                <div className="flex items-center gap-1.5">
                  <span className="text-[11px] text-slate-500">Duplicados:</span>
                  <button onClick={() => setAllDup("overwrite")} className="px-2.5 py-1 text-[11px] font-medium rounded-md border border-slate-200 bg-white text-slate-700 hover:bg-slate-100 transition-colors">Sobrescribir todos</button>
                  <button onClick={() => setAllDup("skip")} className="px-2.5 py-1 text-[11px] font-medium rounded-md border border-slate-200 bg-white text-slate-700 hover:bg-slate-100 transition-colors">Mantener todos</button>
                </div>
              )}
            </div>
          )}

          {/* Tabla editable */}
          {!result && rows.length > 0 && (
            <div className="rounded-xl border border-slate-200 overflow-hidden">
              <div className="overflow-auto max-h-[46vh]">
                <table className="w-full text-[12px]">
                  <thead className="sticky top-0 bg-slate-50 z-10">
                    <tr className="border-b border-slate-200 text-left text-[10px] uppercase tracking-wider text-slate-500">
                      <th className="px-2 py-2 font-medium min-w-[160px]">Concepto</th>
                      <th className="px-2 py-2 font-medium min-w-[160px]">Detalle</th>
                      <th className="px-2 py-2 font-medium w-[90px]">Precio</th>
                      <th className="px-2 py-2 font-medium w-[80px]">IVA</th>
                      <th className="px-2 py-2 font-medium w-[80px]">Unidad</th>
                      <th className="px-2 py-2 font-medium w-[150px]">Clase</th>
                      <th className="px-2 py-2 font-medium min-w-[120px]">Categoría</th>
                      <th className="px-2 py-2 font-medium w-[150px]">Estado</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {rows.map((r) => (
                      <tr key={r.rowIndex} className="hover:bg-slate-50/50">
                        <td className="px-2 py-1.5"><input value={r.nombre} onChange={(e) => updateRow(r.rowIndex, { nombre: e.target.value })} className={inputCls} /></td>
                        <td className="px-2 py-1.5"><input value={r.descripcion} onChange={(e) => updateRow(r.rowIndex, { descripcion: e.target.value })} className={inputCls} /></td>
                        <td className="px-2 py-1.5">
                          <input type="number" min={0} step="0.01" value={r.precioUnitario}
                            onChange={(e) => updateRow(r.rowIndex, { precioUnitario: Math.max(0, Number(e.target.value)) })}
                            className={cn(inputCls, "text-right")} />
                        </td>
                        <td className="px-2 py-1.5">
                          <select value={r.tipoIva} onChange={(e) => updateRow(r.rowIndex, { tipoIva: Number(e.target.value) })} className={cn(inputCls, "bg-white cursor-pointer")}>
                            {IVA_OPTIONS.map((v) => <option key={v} value={v}>{v}%</option>)}
                          </select>
                        </td>
                        <td className="px-2 py-1.5"><input value={r.unidad} onChange={(e) => updateRow(r.rowIndex, { unidad: e.target.value })} className={inputCls} /></td>
                        <td className="px-2 py-1.5">
                          <div className="flex rounded-md border border-slate-200 overflow-hidden">
                            <button type="button" onClick={() => updateRow(r.rowIndex, { isService: false })}
                              className={cn("flex-1 px-2 py-1 text-[11px] font-medium transition-colors", !r.isService ? "bg-[#0F766E] text-white" : "bg-white text-slate-500 hover:bg-slate-50")}>Producto</button>
                            <button type="button" onClick={() => updateRow(r.rowIndex, { isService: true })}
                              className={cn("flex-1 px-2 py-1 text-[11px] font-medium transition-colors border-l border-slate-200", r.isService ? "bg-[#0F766E] text-white" : "bg-white text-slate-500 hover:bg-slate-50")}>Servicio</button>
                          </div>
                        </td>
                        <td className="px-2 py-1.5"><input value={r.categoria} onChange={(e) => updateRow(r.rowIndex, { categoria: e.target.value })} className={inputCls} /></td>
                        <td className="px-2 py-1.5">
                          {r.isDuplicate ? (
                            <div className="flex items-center gap-1">
                              <span className="text-[10px] font-medium text-amber-600 shrink-0">Duplicado</span>
                              <div className="flex rounded-md border border-slate-200 overflow-hidden">
                                <button type="button" onClick={() => updateRow(r.rowIndex, { dupAction: "overwrite" })}
                                  className={cn("px-1.5 py-1 text-[10px] font-medium transition-colors", r.dupAction === "overwrite" ? "bg-amber-500 text-white" : "bg-white text-slate-500 hover:bg-slate-50")}>Sobrescribir</button>
                                <button type="button" onClick={() => updateRow(r.rowIndex, { dupAction: "skip" })}
                                  className={cn("px-1.5 py-1 text-[10px] font-medium transition-colors border-l border-slate-200", r.dupAction === "skip" ? "bg-slate-600 text-white" : "bg-white text-slate-500 hover:bg-slate-50")}>Mantener</button>
                              </div>
                            </div>
                          ) : (
                            <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-medium bg-emerald-50 text-emerald-700">Nuevo</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Resultado del commit */}
          {result && (
            <div className="rounded-xl border border-slate-200 p-4 space-y-2">
              <div className="flex items-center gap-4 text-[13px] flex-wrap">
                <span className="flex items-center gap-1.5 text-emerald-600 font-medium">
                  <CheckCircle2 className="w-4 h-4" /> {result.imported} creados
                </span>
                <span className="text-slate-500">{result.updated} actualizados</span>
                <span className="text-slate-500">{result.skipped} omitidos</span>
                {result.errors.length > 0 && (
                  <span className="flex items-center gap-1.5 text-red-500 font-medium">
                    <AlertCircle className="w-4 h-4" /> {result.errors.length} errores
                  </span>
                )}
              </div>
              {result.errors.length > 0 && (
                <ul className="mt-2 space-y-1 max-h-32 overflow-y-auto">
                  {result.errors.map((e, i) => (
                    <li key={i} className="text-[11px] text-red-500">Fila {e.row}: {e.motivo}</li>
                  ))}
                </ul>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-2 px-6 py-4 border-t border-slate-100 shrink-0">
          <button onClick={onClose} className="px-4 py-2 text-[13px] text-slate-600 hover:bg-slate-100 rounded-lg transition-colors">
            {result ? "Cerrar" : "Cancelar"}
          </button>
          {!result && (
            <button
              onClick={handleImport}
              disabled={rows.length === 0 || importing || previewing}
              className="flex items-center gap-2 px-4 py-2 text-[13px] font-medium bg-[#0F766E] text-white rounded-lg hover:bg-[#0E665F] disabled:opacity-50 transition-colors"
            >
              {importing ? (
                <><span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />Importando...</>
              ) : (
                <><Upload className="w-3.5 h-3.5" />Importar {rows.length > 0 ? `(${rows.length})` : ""}</>
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
