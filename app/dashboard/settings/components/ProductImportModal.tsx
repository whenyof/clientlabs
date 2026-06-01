"use client"

import { useState, useRef, useCallback } from "react"
import { Upload, X, Download, FileSpreadsheet, AlertCircle, CheckCircle2 } from "lucide-react"
import { cn } from "@/lib/utils"
import { toast } from "sonner"

const TEMPLATE_CSV = `referencia,nombre,descripcion,precio_unitario,tipo_iva,unidad,tipo,categoria
REF-001,Consultoría hora,Consultoría técnica por hora,75.00,21,h,SERVICIO,Consultoría
REF-002,Licencia software,Licencia mensual software,29.99,21,mes,PRODUCTO,Software
REF-003,Pack diseño web,Diseño y maquetación web,1200.00,21,ud,SERVICIO,Diseño`

const COLUMNS = ["referencia", "nombre", "descripcion", "precio_unitario", "tipo_iva", "unidad", "tipo", "categoria"]

type PreviewRow = Record<string, string>

interface ImportResult {
  imported: number
  updated: number
  errors: { row: number; message: string }[]
}

interface Props {
  onClose: () => void
  onDone: () => void
}

export function ProductImportModal({ onClose, onDone }: Props) {
  const [dragging, setDragging] = useState(false)
  const [file, setFile] = useState<File | null>(null)
  const [preview, setPreview] = useState<PreviewRow[]>([])
  const [totalRows, setTotalRows] = useState(0)
  const [importing, setImporting] = useState(false)
  const [result, setResult] = useState<ImportResult | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  const parsePreview = useCallback(async (f: File) => {
    const name = f.name.toLowerCase()
    if (name.endsWith(".csv")) {
      const { parse } = await import("papaparse")
      const text = await f.text()
      const parsed = parse<PreviewRow>(text, {
        header: true,
        skipEmptyLines: true,
        transformHeader: (h) => h.trim(),
        transform: (v) => v.trim(),
      })
      setTotalRows(parsed.data.length)
      setPreview(parsed.data.slice(0, 3))
    } else if (name.endsWith(".xlsx") || name.endsWith(".xls")) {
      const XLSX = await import("xlsx")
      const buf = await f.arrayBuffer()
      const wb = XLSX.read(buf, { type: "array" })
      const sheet = wb.Sheets[wb.SheetNames[0]]
      const rows = XLSX.utils.sheet_to_json<PreviewRow>(sheet, { defval: "" })
      setTotalRows(rows.length)
      setPreview(rows.slice(0, 3))
    }
  }, [])

  const handleFile = useCallback((f: File) => {
    setFile(f)
    setResult(null)
    parsePreview(f)
  }, [parsePreview])

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

  const handleImport = async () => {
    if (!file) return
    setImporting(true)
    try {
      const fd = new FormData()
      fd.append("file", file)
      const res = await fetch("/api/products/import", { method: "POST", body: fd })
      const data: ImportResult & { error?: string } = await res.json().catch(() => ({ error: "Error inesperado" }))
      if (!res.ok) throw new Error(data.error ?? "Error al importar")
      setResult(data)
      if (data.imported + data.updated > 0) {
        toast.success(`${data.imported} creados · ${data.updated} actualizados`)
        onDone()
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Error al importar")
    } finally {
      setImporting(false)
    }
  }

  const previewHeaders = preview.length > 0 ? Object.keys(preview[0]) : COLUMNS

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-[#E1F5EE] flex items-center justify-center">
              <FileSpreadsheet className="w-4 h-4 text-[#0F766E]" />
            </div>
            <h2 className="text-[15px] font-semibold text-slate-900">Importar productos desde CSV</h2>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400 transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-6 space-y-5">
          {/* Template download */}
          <div className="flex items-center justify-between px-4 py-3 rounded-xl bg-slate-50 border border-slate-200">
            <div>
              <p className="text-[12px] font-medium text-slate-700">¿Primera vez?</p>
              <p className="text-[11px] text-slate-400 mt-0.5">Descarga la plantilla con las columnas correctas</p>
            </div>
            <button
              onClick={downloadTemplate}
              className="flex items-center gap-1.5 px-3 py-1.5 text-[12px] font-medium text-[#0F766E] border border-[#0F766E]/30 bg-white rounded-lg hover:bg-[#E1F5EE] transition-colors"
            >
              <Download className="w-3.5 h-3.5" />
              Descargar plantilla
            </button>
          </div>

          {/* Drop zone */}
          <div
            onDragOver={(e) => { e.preventDefault(); setDragging(true) }}
            onDragLeave={() => setDragging(false)}
            onDrop={onDrop}
            onClick={() => inputRef.current?.click()}
            className={cn(
              "border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all",
              dragging
                ? "border-[#0F766E] bg-[#E1F5EE]/40"
                : file
                ? "border-[#0F766E]/40 bg-[#E1F5EE]/20"
                : "border-slate-200 hover:border-slate-300 hover:bg-slate-50"
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
            {file ? (
              <>
                <p className="text-[13px] font-medium text-slate-700">{file.name}</p>
                <p className="text-[11px] text-slate-400 mt-0.5">{totalRows} filas detectadas · haz click para cambiar</p>
              </>
            ) : (
              <>
                <p className="text-[13px] font-medium text-slate-600">Arrastra tu archivo aquí</p>
                <p className="text-[11px] text-slate-400 mt-0.5">CSV o Excel (.xlsx) · máx. 5 MB</p>
              </>
            )}
          </div>

          {/* Preview table */}
          {preview.length > 0 && (
            <div className="space-y-2">
              <p className="text-[11px] font-medium text-slate-500 uppercase tracking-wider">
                Vista previa — primeras {preview.length} filas
              </p>
              <div className="rounded-xl border border-slate-200 overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-[11px]">
                    <thead>
                      <tr className="bg-slate-50 border-b border-slate-100">
                        {previewHeaders.map((h) => (
                          <th key={h} className="px-3 py-2 text-left font-medium text-slate-500 whitespace-nowrap">
                            {h}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50">
                      {preview.map((row, i) => (
                        <tr key={i} className="hover:bg-slate-50">
                          {previewHeaders.map((h) => (
                            <td key={h} className="px-3 py-2 text-slate-600 whitespace-nowrap max-w-[160px] truncate">
                              {row[h] ?? "—"}
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* Result */}
          {result && (
            <div className="rounded-xl border border-slate-200 p-4 space-y-2">
              <div className="flex items-center gap-4 text-[13px]">
                <span className="flex items-center gap-1.5 text-emerald-600 font-medium">
                  <CheckCircle2 className="w-4 h-4" /> {result.imported} importados
                </span>
                <span className="text-slate-500">{result.updated} actualizados</span>
                {result.errors.length > 0 && (
                  <span className="flex items-center gap-1.5 text-red-500 font-medium">
                    <AlertCircle className="w-4 h-4" /> {result.errors.length} errores
                  </span>
                )}
              </div>
              {result.errors.length > 0 && (
                <ul className="mt-2 space-y-1">
                  {result.errors.map((e, i) => (
                    <li key={i} className="text-[11px] text-red-500">
                      Fila {e.row}: {e.message}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-2 px-6 py-4 border-t border-slate-100">
          <button
            onClick={onClose}
            className="px-4 py-2 text-[13px] text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
          >
            {result ? "Cerrar" : "Cancelar"}
          </button>
          <button
            onClick={handleImport}
            disabled={!file || importing}
            className="flex items-center gap-2 px-4 py-2 text-[13px] font-medium bg-[#0F766E] text-white rounded-lg hover:bg-[#0E665F] disabled:opacity-50 transition-colors"
          >
            {importing ? (
              <><span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />Importando...</>
            ) : (
              <><Upload className="w-3.5 h-3.5" />Importar</>
            )}
          </button>
        </div>
      </div>
    </div>
  )
}
