"use client"
import { useState, useRef } from "react"
import {
  Upload, FileText, X, CheckCircle, Loader2,
  ChevronRight, Trash2, ZoomIn, FileCheck,
} from "lucide-react"
import { cn } from "@/lib/utils"

interface Documento {
  id: string
  tipo: string
  tipoLabel: string
  tipoEmoji: string
  archivo: File | null
  preview: string | null
  numero: string
  concepto: string
  importe: string
  estadoPago: string
  subido: boolean
  error: boolean
}

interface Props {
  tipo: "venta" | "compra"
  transaccionId: string
  clienteNombre?: string
  proveedorNombre?: string
  importeTotal?: number
  onCompletado: () => void
  onOmitir: () => void
}

const TIPOS_DOCUMENTO = {
  venta: [
    { id: "factura",     label: "Factura emitida",     emoji: "🧾", desc: "La factura que has enviado al cliente",       requerido: true  },
    { id: "albaran",     label: "Albarán de entrega",  emoji: "📦", desc: "Documento de entrega del servicio o producto", requerido: false },
    { id: "presupuesto", label: "Presupuesto aceptado", emoji: "📋", desc: "El presupuesto firmado por el cliente",        requerido: false },
  ],
  compra: [
    { id: "factura", label: "Factura del proveedor", emoji: "🧾", desc: "La factura que te ha enviado el proveedor",      requerido: true  },
    { id: "albaran", label: "Albarán de recepción",  emoji: "📦", desc: "Documento de recepción de la mercancía",         requerido: false },
    { id: "pedido",  label: "Hoja de pedido",        emoji: "📝", desc: "El pedido que realizaste al proveedor",          requerido: false },
  ],
}

export function ModalDocumentosTransaccion({
  tipo,
  transaccionId,
  clienteNombre,
  proveedorNombre,
  importeTotal,
  onCompletado,
  onOmitir,
}: Props) {
  const entidad = clienteNombre || proveedorNombre || "—"

  const [documentos, setDocumentos] = useState<Documento[]>(
    TIPOS_DOCUMENTO[tipo].map((t) => ({
      id: t.id,
      tipo: t.id,
      tipoLabel: t.label,
      tipoEmoji: t.emoji,
      archivo: null,
      preview: null,
      numero: "",
      concepto: "",
      importe: importeTotal ? String(importeTotal) : "",
      estadoPago: tipo === "venta" ? "pendiente" : "pagada",
      subido: false,
      error: false,
    }))
  )

  const [paso, setPaso] = useState<"seleccion" | "preview" | "completado">("seleccion")
  const [docPreview, setDocPreview] = useState<Documento | null>(null)
  const [subiendo, setSubiendo] = useState(false)
  const inputRefs = useRef<Record<string, HTMLInputElement | null>>({})

  const handleArchivo = (docId: string, file: File) => {
    if (file.type.startsWith("image/")) {
      const reader = new FileReader()
      reader.onload = (e) => {
        setDocumentos((prev) =>
          prev.map((d) =>
            d.id === docId ? { ...d, archivo: file, preview: e.target?.result as string } : d
          )
        )
      }
      reader.readAsDataURL(file)
    } else {
      setDocumentos((prev) =>
        prev.map((d) => (d.id === docId ? { ...d, archivo: file, preview: null } : d))
      )
    }
  }

  const quitarArchivo = (docId: string) => {
    setDocumentos((prev) =>
      prev.map((d) => (d.id === docId ? { ...d, archivo: null, preview: null, subido: false } : d))
    )
  }

  const actualizarCampo = (docId: string, campo: keyof Documento, valor: string) => {
    setDocumentos((prev) =>
      prev.map((d) => (d.id === docId ? { ...d, [campo]: valor } : d))
    )
  }

  const subirTodos = async () => {
    const conArchivo = documentos.filter((d) => d.archivo)
    if (conArchivo.length === 0) { onCompletado(); return }

    setSubiendo(true)
    for (const doc of conArchivo) {
      try {
        const formData = new FormData()
        formData.append("file", doc.archivo!)
        formData.append("tipo", doc.tipo)
        if (transaccionId) {
          formData.append(tipo === "venta" ? "saleId" : "providerOrderId", transaccionId)
        }
        formData.append("meta", JSON.stringify({
          numero: doc.numero,
          concepto: doc.concepto || `${doc.tipoLabel} — ${entidad}`,
          importe: doc.importe,
          estadoPago: doc.estadoPago,
          clienteProveedor: entidad,
        }))

        const res = await fetch("/api/finance/import", { method: "POST", body: formData })
        if (!res.ok) throw new Error()

        setDocumentos((prev) => prev.map((d) => (d.id === doc.id ? { ...d, subido: true } : d)))
      } catch {
        setDocumentos((prev) => prev.map((d) => (d.id === doc.id ? { ...d, error: true } : d)))
      }
    }
    setSubiendo(false)
    setPaso("completado")
  }

  const conArchivo = documentos.filter((d) => d.archivo)

  // ── PASO COMPLETADO ──────────────────────────────────────────
  if (paso === "completado") {
    const exitosos = documentos.filter((d) => d.subido)
    const errores = documentos.filter((d) => d.error)
    return (
      <div className="flex flex-col items-center justify-center py-8 px-6 text-center">
        <div className="w-16 h-16 rounded-full bg-[#E1F5EE] flex items-center justify-center mb-4">
          <FileCheck className="h-8 w-8 text-[#1FA97A]" />
        </div>
        <h3 className="text-[18px] font-bold text-slate-900 mb-2">
          {exitosos.length} documento{exitosos.length !== 1 ? "s" : ""} importado{exitosos.length !== 1 ? "s" : ""}
        </h3>
        <p className="text-[13px] text-slate-400 mb-1">
          Guardados en el registro de{" "}
          <span className="font-semibold text-slate-600">{entidad}</span>
        </p>
        <p className="text-[12px] text-slate-400 mb-6">
          También disponibles en Finanzas → {tipo === "venta" ? "Facturación" : "Gastos"}
        </p>
        {errores.length > 0 && (
          <div className="w-full p-3 bg-red-50 border border-red-200 rounded-xl mb-4">
            <p className="text-[12px] text-red-600">
              {errores.length} documento{errores.length !== 1 ? "s" : ""} con error — puedes subirlos manualmente
              desde el perfil del {tipo === "venta" ? "cliente" : "proveedor"}
            </p>
          </div>
        )}
        <button
          onClick={onCompletado}
          className="px-6 py-2.5 bg-[#1FA97A] text-white rounded-xl text-[13px] font-semibold hover:bg-[#1a9068] transition-colors"
        >
          Perfecto, continuar
        </button>
      </div>
    )
  }

  // ── PASO PREVIEW ─────────────────────────────────────────────
  if (paso === "preview" && docPreview) {
    return (
      <div className="flex flex-col h-full">
        <div className="flex items-center gap-3 px-6 py-4 border-b border-slate-100 flex-shrink-0">
          <button
            onClick={() => { setDocPreview(null); setPaso("seleccion") }}
            className="p-1.5 rounded-lg hover:bg-slate-100"
          >
            <X className="h-4 w-4 text-slate-500" />
          </button>
          <div>
            <h3 className="text-[14px] font-bold text-slate-900">
              Preview — {docPreview.tipoLabel}
            </h3>
            <p className="text-[11px] text-slate-400">{docPreview.archivo?.name}</p>
          </div>
        </div>

        <div className="flex-1 overflow-auto p-6">
          {docPreview.preview ? (
            <img
              src={docPreview.preview}
              alt="Preview"
              className="w-full rounded-xl border border-slate-200 object-contain max-h-96"
            />
          ) : docPreview.archivo?.type === "application/pdf" ? (
            <div className="flex flex-col items-center justify-center py-12 bg-slate-50 rounded-xl border border-slate-200">
              <FileText className="h-12 w-12 text-slate-400 mb-3" />
              <p className="text-[14px] font-semibold text-slate-700">{docPreview.archivo.name}</p>
              <p className="text-[12px] text-slate-400 mt-1">
                PDF — {(docPreview.archivo.size / 1024).toFixed(0)} KB
              </p>
              <p className="text-[11px] text-slate-300 mt-3">El PDF se verá completo una vez importado</p>
            </div>
          ) : (
            <div className="flex items-center justify-center py-12 text-slate-400">
              Sin preview disponible
            </div>
          )}
        </div>

        <div className="px-6 py-4 border-t border-slate-100 flex gap-3 flex-shrink-0">
          <button
            onClick={() => { quitarArchivo(docPreview.id); setDocPreview(null); setPaso("seleccion") }}
            className="flex items-center gap-2 px-4 py-2.5 border border-red-200 text-red-500 rounded-xl text-[13px] font-medium hover:bg-red-50 transition-colors"
          >
            <Trash2 className="h-4 w-4" />
            Quitar
          </button>
          <button
            onClick={() => { setDocPreview(null); setPaso("seleccion") }}
            className="flex-1 py-2.5 bg-[#1FA97A] text-white rounded-xl text-[13px] font-semibold hover:bg-[#1a9068] transition-colors"
          >
            ✓ Confirmar este documento
          </button>
        </div>
      </div>
    )
  }

  // ── PASO SELECCIÓN ────────────────────────────────────────────
  return (
    <div className="flex flex-col h-full">
      {/* Header con contexto de la transacción */}
      <div className="px-6 pt-5 pb-4 flex-shrink-0">
        <div className="flex items-center gap-3 p-3 bg-[#E1F5EE]/50 border border-[#1FA97A]/20 rounded-xl">
          <div className="w-8 h-8 rounded-lg bg-[#1FA97A] flex items-center justify-center flex-shrink-0">
            <CheckCircle className="h-4 w-4 text-white" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-[12px] font-bold text-[#1FA97A]">
              {tipo === "venta" ? "Venta registrada" : "Compra registrada"}
            </p>
            <p className="text-[11px] text-slate-500 truncate">
              {entidad}
              {importeTotal
                ? ` — ${importeTotal.toLocaleString("es-ES", { style: "currency", currency: "EUR" })}`
                : ""}
            </p>
          </div>
        </div>
        <p className="text-[13px] text-slate-500 mt-3">
          ¿Tienes los documentos de esta {tipo === "venta" ? "venta" : "compra"}? Impórtalos ahora
          para tenerlo todo organizado.
        </p>
      </div>

      {/* Lista de documentos */}
      <div className="flex-1 overflow-y-auto px-6 pb-4 space-y-3">
        {documentos.map((doc, i) => {
          const tipoInfo = TIPOS_DOCUMENTO[tipo][i]
          return (
            <div
              key={doc.id}
              className={cn(
                "rounded-2xl border-2 transition-all duration-150",
                doc.subido
                  ? "border-[#1FA97A] bg-[#E1F5EE]/20"
                  : doc.archivo
                  ? "border-[#1FA97A]/40 bg-[#E1F5EE]/10"
                  : "border-slate-200 bg-white"
              )}
            >
              {/* Header del tipo de documento */}
              <div className="flex items-center gap-3 px-4 py-3 border-b border-slate-100">
                <span className="text-[20px] flex-shrink-0">{tipoInfo.emoji}</span>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="text-[13px] font-bold text-slate-800">{tipoInfo.label}</span>
                    {tipoInfo.requerido && (
                      <span className="text-[9px] font-bold text-amber-600 bg-amber-50 px-1.5 py-0.5 rounded-full">
                        Recomendado
                      </span>
                    )}
                    {doc.archivo && (
                      <span className="text-[9px] font-bold text-[#1FA97A] bg-[#E1F5EE] px-1.5 py-0.5 rounded-full">
                        ✓ Listo
                      </span>
                    )}
                  </div>
                  <p className="text-[11px] text-slate-400">{tipoInfo.desc}</p>
                </div>
              </div>

              {/* Sin archivo — zona de upload */}
              {!doc.archivo && (
                <div
                  onClick={() => inputRefs.current[doc.id]?.click()}
                  className="flex items-center gap-3 px-4 py-3 cursor-pointer hover:bg-slate-50/80 transition-colors"
                >
                  <input
                    ref={(el) => { inputRefs.current[doc.id] = el }}
                    type="file"
                    accept=".pdf,image/*"
                    className="hidden"
                    onChange={(e) => {
                      const file = e.target.files?.[0]
                      if (file) handleArchivo(doc.id, file)
                    }}
                  />
                  <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center flex-shrink-0">
                    <Upload className="h-4 w-4 text-slate-400" />
                  </div>
                  <span className="text-[12px] text-slate-400 font-medium">Subir PDF o imagen</span>
                  <ChevronRight className="h-4 w-4 text-slate-300 ml-auto" />
                </div>
              )}

              {/* Con archivo — preview + metadatos */}
              {doc.archivo && (
                <div className="px-4 py-3 space-y-3">
                  <div className="flex items-center gap-3 p-2.5 bg-white rounded-xl border border-slate-200">
                    <div className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center flex-shrink-0 overflow-hidden">
                      {doc.preview ? (
                        <img src={doc.preview} alt="" className="w-full h-full object-cover" />
                      ) : (
                        <FileText className="h-5 w-5 text-slate-400" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-[12px] font-semibold text-slate-700 truncate">{doc.archivo.name}</p>
                      <p className="text-[10px] text-slate-400">{(doc.archivo.size / 1024).toFixed(0)} KB</p>
                    </div>
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => { setDocPreview(doc); setPaso("preview") }}
                        className="p-1.5 rounded-lg hover:bg-slate-100 transition-colors"
                        title="Ver preview"
                      >
                        <ZoomIn className="h-3.5 w-3.5 text-slate-400" />
                      </button>
                      <button
                        onClick={() => quitarArchivo(doc.id)}
                        className="p-1.5 rounded-lg hover:bg-red-50 transition-colors"
                        title="Quitar"
                      >
                        <X className="h-3.5 w-3.5 text-slate-400 hover:text-red-500" />
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <input
                      value={doc.numero}
                      onChange={(e) => actualizarCampo(doc.id, "numero", e.target.value)}
                      placeholder="Nº documento"
                      className="px-3 py-2 border border-slate-200 rounded-xl text-[12px] outline-none bg-white focus:border-[#1FA97A]"
                    />
                    <input
                      type="number"
                      value={doc.importe}
                      onChange={(e) => actualizarCampo(doc.id, "importe", e.target.value)}
                      placeholder="Importe €"
                      className="px-3 py-2 border border-slate-200 rounded-xl text-[12px] outline-none bg-white focus:border-[#1FA97A]"
                    />
                    <select
                      value={doc.estadoPago}
                      onChange={(e) => actualizarCampo(doc.id, "estadoPago", e.target.value)}
                      className="col-span-2 px-3 py-2 border border-slate-200 rounded-xl text-[12px] outline-none bg-white focus:border-[#1FA97A]"
                    >
                      <option value="pendiente">Pendiente de cobro</option>
                      <option value="pagada">{tipo === "venta" ? "Cobrada" : "Pagada"}</option>
                      <option value="vencida">Vencida</option>
                    </select>
                  </div>
                </div>
              )}
            </div>
          )
        })}
      </div>

      {/* Footer */}
      <div className="px-6 py-4 border-t border-slate-100 flex-shrink-0 space-y-2">
        {conArchivo.length > 0 && (
          <div className="flex items-center gap-2 text-[11px] text-slate-500 mb-1">
            <CheckCircle className="h-3.5 w-3.5 text-[#1FA97A]" />
            {conArchivo.length} documento{conArchivo.length !== 1 ? "s" : ""} listo{conArchivo.length !== 1 ? "s" : ""} para importar
          </div>
        )}
        <div className="flex gap-3">
          <button
            onClick={onOmitir}
            className="px-4 py-2.5 border border-slate-200 rounded-xl text-[13px] font-medium text-slate-500 hover:bg-slate-50 transition-colors"
          >
            Omitir por ahora
          </button>
          <button
            onClick={subirTodos}
            disabled={conArchivo.length === 0 || subiendo}
            className={cn(
              "flex-1 py-2.5 rounded-xl text-[13px] font-semibold flex items-center justify-center gap-2 transition-colors",
              conArchivo.length > 0 && !subiendo
                ? "bg-[#1FA97A] text-white hover:bg-[#1a9068]"
                : "bg-slate-100 text-slate-400 cursor-not-allowed"
            )}
          >
            {subiendo ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Importando...
              </>
            ) : conArchivo.length > 0 ? (
              <>
                <Upload className="h-4 w-4" />
                Importar {conArchivo.length} documento{conArchivo.length !== 1 ? "s" : ""}
              </>
            ) : (
              "Sube al menos un documento"
            )}
          </button>
        </div>
      </div>
    </div>
  )
}
