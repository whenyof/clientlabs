"use client"
import { useState } from "react"
import { Upload, FileText, CheckCircle, X, Loader2, AlertCircle } from "lucide-react"
import { cn } from "@/lib/utils"

interface Props {
  tipo: "factura" | "presupuesto" | "albaran" | "pedido" | "rectificativa" | "otro"
  onImportado?: () => void
}

const FORM_DEFAULT = {
  numero: "",
  concepto: "",
  importe: "",
  fecha: new Date().toISOString().split("T")[0],
  clienteProveedor: "",
  estadoPago: "pendiente",
}

export function ImportarDocumento({ tipo, onImportado }: Props) {
  const [dragOver, setDragOver] = useState(false)
  const [archivo, setArchivo] = useState<File | null>(null)
  const [estado, setEstado] = useState<"idle" | "loading" | "success" | "error">("idle")
  const [form, setForm] = useState(FORM_DEFAULT)

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setDragOver(false)
    const file = e.dataTransfer.files[0]
    if (file && (file.type === "application/pdf" || file.type.startsWith("image/"))) {
      setArchivo(file)
    }
  }

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) setArchivo(file)
  }

  const importar = async () => {
    if (!archivo) return
    setEstado("loading")
    try {
      const formData = new FormData()
      formData.append("file", archivo)
      formData.append("tipo", tipo)
      formData.append("meta", JSON.stringify(form))

      const res = await fetch("/api/finance/import", { method: "POST", body: formData })
      if (!res.ok) throw new Error()

      setEstado("success")
      setTimeout(() => {
        setEstado("idle")
        setArchivo(null)
        setForm(FORM_DEFAULT)
        onImportado?.()
      }, 2000)
    } catch {
      setEstado("error")
      setTimeout(() => setEstado("idle"), 3000)
    }
  }

  if (estado === "success") {
    return (
      <div className="flex flex-col items-center justify-center py-10 gap-3">
        <div className="w-12 h-12 rounded-full bg-[#E1F5EE] flex items-center justify-center">
          <CheckCircle className="h-6 w-6 text-[#1FA97A]" />
        </div>
        <p className="text-[14px] font-semibold text-slate-800">Documento importado</p>
        <p className="text-[12px] text-slate-400">Ya aparece en tu registro</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Drop zone */}
      <div
        onDragOver={(e) => { e.preventDefault(); setDragOver(true) }}
        onDragLeave={() => setDragOver(false)}
        onDrop={handleDrop}
        onClick={() => document.getElementById("finance-file-input")?.click()}
        className={cn(
          "border-2 border-dashed rounded-2xl p-8 text-center transition-all cursor-pointer",
          dragOver
            ? "border-[#1FA97A] bg-[#E1F5EE]/30"
            : archivo
            ? "border-[#1FA97A]/50 bg-[#E1F5EE]/10"
            : "border-slate-200 hover:border-slate-300 hover:bg-slate-50"
        )}
      >
        <input
          id="finance-file-input"
          type="file"
          accept=".pdf,image/*"
          className="hidden"
          onChange={handleFile}
        />

        {archivo ? (
          <div className="flex flex-col items-center gap-2">
            <div className="w-12 h-12 rounded-xl bg-[#E1F5EE] flex items-center justify-center">
              <FileText className="h-6 w-6 text-[#1FA97A]" />
            </div>
            <p className="text-[13px] font-semibold text-slate-800">{archivo.name}</p>
            <p className="text-[11px] text-slate-400">{(archivo.size / 1024).toFixed(0)} KB</p>
            <button
              onClick={(e) => { e.stopPropagation(); setArchivo(null) }}
              className="text-[11px] text-red-400 hover:text-red-600 flex items-center gap-1"
            >
              <X className="h-3 w-3" />
              Quitar
            </button>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-2">
            <div className="w-12 h-12 rounded-xl bg-slate-100 flex items-center justify-center">
              <Upload className="h-6 w-6 text-slate-400" />
            </div>
            <p className="text-[13px] font-semibold text-slate-600">Arrastra el PDF aquí</p>
            <p className="text-[11px] text-slate-400">o haz click para seleccionar</p>
            <p className="text-[10px] text-slate-300 mt-1">PDF, JPG, PNG — máx 10MB</p>
          </div>
        )}
      </div>

      {/* Metadata */}
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1">
            Número de documento
          </label>
          <input
            value={form.numero}
            onChange={(e) => setForm((f) => ({ ...f, numero: e.target.value }))}
            placeholder="FAC-2026-001"
            className="w-full px-3 py-2.5 border border-slate-200 rounded-xl text-[13px] outline-none focus:border-[#1FA97A]"
          />
        </div>
        <div>
          <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1">
            Fecha
          </label>
          <input
            type="date"
            value={form.fecha}
            onChange={(e) => setForm((f) => ({ ...f, fecha: e.target.value }))}
            className="w-full px-3 py-2.5 border border-slate-200 rounded-xl text-[13px] outline-none focus:border-[#1FA97A]"
          />
        </div>
        <div>
          <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1">
            Cliente / Proveedor
          </label>
          <input
            value={form.clienteProveedor}
            onChange={(e) => setForm((f) => ({ ...f, clienteProveedor: e.target.value }))}
            placeholder="Nombre empresa"
            className="w-full px-3 py-2.5 border border-slate-200 rounded-xl text-[13px] outline-none focus:border-[#1FA97A]"
          />
        </div>
        <div>
          <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1">
            Importe total (€)
          </label>
          <input
            type="number"
            value={form.importe}
            onChange={(e) => setForm((f) => ({ ...f, importe: e.target.value }))}
            placeholder="0.00"
            className="w-full px-3 py-2.5 border border-slate-200 rounded-xl text-[13px] outline-none focus:border-[#1FA97A]"
          />
        </div>
        <div>
          <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1">
            Concepto
          </label>
          <input
            value={form.concepto}
            onChange={(e) => setForm((f) => ({ ...f, concepto: e.target.value }))}
            placeholder="Descripción breve"
            className="w-full px-3 py-2.5 border border-slate-200 rounded-xl text-[13px] outline-none focus:border-[#1FA97A]"
          />
        </div>
        <div>
          <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1">
            Estado de pago
          </label>
          <select
            value={form.estadoPago}
            onChange={(e) => setForm((f) => ({ ...f, estadoPago: e.target.value }))}
            className="w-full px-3 py-2.5 border border-slate-200 rounded-xl text-[13px] outline-none bg-white focus:border-[#1FA97A]"
          >
            <option value="pendiente">Pendiente</option>
            <option value="pagada">Pagada / Cobrada</option>
            <option value="vencida">Vencida</option>
            <option value="cancelada">Cancelada</option>
          </select>
        </div>
      </div>

      {estado === "error" && (
        <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-xl">
          <AlertCircle className="h-4 w-4 text-red-500 flex-shrink-0" />
          <p className="text-[12px] text-red-600">Error al importar. Inténtalo de nuevo.</p>
        </div>
      )}

      <button
        onClick={importar}
        disabled={!archivo || estado === "loading"}
        className={cn(
          "w-full py-3 rounded-xl text-[13px] font-semibold flex items-center justify-center gap-2 transition-colors",
          archivo && estado !== "loading"
            ? "bg-[#1FA97A] text-white hover:bg-[#1a9068]"
            : "bg-slate-100 text-slate-400 cursor-not-allowed"
        )}
      >
        {estado === "loading" ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" />
            Importando...
          </>
        ) : (
          <>
            <Upload className="h-4 w-4" />
            Importar documento
          </>
        )}
      </button>
    </div>
  )
}
