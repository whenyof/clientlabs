"use client"
import { getBaseUrl } from "@/lib/api/baseUrl"


import { useState, useRef } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import {
 Dialog,
 DialogContent,
 DialogHeader,
 DialogTitle,
 DialogFooter,
 DialogDescription,
} from "@/components/ui/dialog"
import { Upload, FileSpreadsheet, CheckCircle, AlertCircle, XCircle, Loader2, X, Undo2, Flame, CloudSun, CloudSnow } from "lucide-react"
import Papa from "papaparse"
import * as XLSX from "xlsx"
import { importLeads } from "../actions"
import type { LeadTemp } from "@prisma/client"
import { toast } from "sonner"

type LeadRow = {
 name?: string
 email?: string
 phone?: string
 source?: string
 message?: string
 country?: string
 formId?: string
 page?: string
 status: "valid" | "duplicate" | "invalid"
 reason?: string
 excluded: boolean
 temperature: LeadTemp
 tags?: string[]
 validationStatus?: "OK" | "REVIEW"
}

export function ImportLeadsDialog({ open, onOpenChange }: { open: boolean; onOpenChange: (open: boolean) => void }) {
 const router = useRouter()
 const fileInputRef = useRef<HTMLInputElement>(null)
 const [step, setStep] = useState<"upload" | "preview" | "importing">("upload")
 const [leads, setLeads] = useState<LeadRow[]>([])
 const [fileName, setFileName] = useState("")
 const [loading, setLoading] = useState(false)

 const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
 const file = e.target.files?.[0]
 if (!file) return

 setFileName(file.name)
 setLoading(true)

 try {
 const fileType = file.name.endsWith(".csv") ? "csv" : "excel"
 let parsedData: any[] = []

 if (fileType === "csv") {
 Papa.parse(file, {
 header: true,
 skipEmptyLines: true,
 complete: (results) => {
 parsedData = results.data
 processLeads(parsedData, fileType)
 },
 error: (error) => {
 console.error("CSV parse error:", error)
 toast.error("Error al leer el archivo CSV")
 setLoading(false)
 }
 })
 } else {
 const data = await file.arrayBuffer()
 const workbook = XLSX.read(data)
 const sheetName = workbook.SheetNames[0]
 const worksheet = workbook.Sheets[sheetName]
 parsedData = XLSX.utils.sheet_to_json(worksheet)
 processLeads(parsedData, fileType)
 }
 } catch (error) {
 console.error("File processing error:", error)
 toast.error("Error al procesar el archivo")
 setLoading(false)
 }
 }

 const processLeads = async (data: any[], fileType: "csv" | "excel") => {
 const normalizedLeads: LeadRow[] = data.map((row) => {
 const normalized: any = {}
 Object.keys(row).forEach((key) => {
 const lowerKey = key.toLowerCase().trim()
 if (lowerKey.includes("name") || lowerKey.includes("nombre")) {
 normalized.name = row[key]
 } else if (lowerKey.includes("email") || lowerKey.includes("correo")) {
 normalized.email = row[key]
 } else if (lowerKey.includes("phone") || lowerKey.includes("tel") || lowerKey.includes("móvil")) {
 normalized.phone = row[key]
 } else if (lowerKey.includes("source") || lowerKey.includes("fuente") || lowerKey.includes("origen")) {
 normalized.source = row[key]
 } else if (lowerKey.includes("message") || lowerKey.includes("mensaje") || lowerKey.includes("comment")) {
 normalized.message = row[key]
 } else if (lowerKey.includes("country") || lowerKey.includes("país") || lowerKey.includes("pais")) {
 normalized.country = row[key]
 } else if (lowerKey.includes("form") && lowerKey.includes("id")) {
 normalized.formId = row[key]
 } else if (lowerKey.includes("page") || lowerKey.includes("página") || lowerKey.includes("pagina")) {
 normalized.page = row[key]
 }
 })
 return normalized
 })

 const { applyImportRules } = await import("../utils/importRules")

 const validatedLeads: LeadRow[] = normalizedLeads.map((lead) => {
 if (!lead.email && !lead.phone) {
 return {
 ...lead,
 status: "invalid",
 reason: "Falta email y teléfono",
 excluded: false,
 temperature: "COLD" as LeadTemp,
 tags: ["invalid", "low-quality"]
 }
 }

 const processed = applyImportRules(lead, fileType)

 return {
 ...processed,
 status: "valid",
 excluded: false
 }
 })

 const emails = validatedLeads.filter(l => l.email).map(l => l.email!.toLowerCase())
 const phones = validatedLeads.filter(l => l.phone).map(l => l.phone!)

 try {
 const response = await fetch(getBaseUrl() + "/api/leads/check-duplicates", {
 method: "POST",
 headers: { "Content-Type": "application/json" },
 body: JSON.stringify({ emails, phones })
 })

 if (response.ok) {
 const { duplicates } = await response.json()

 validatedLeads.forEach((lead) => {
 if (lead.status === "valid") {
 const isDuplicate = duplicates.some((dup: any) =>
 (lead.email && dup.email?.toLowerCase() === lead.email.toLowerCase()) ||
 (lead.phone && dup.phone === lead.phone)
 )
 if (isDuplicate) {
 lead.status = "duplicate"
 lead.reason = "Ya existe en el sistema"
 }
 }
 })
 }
 } catch (error) {
 console.error("Duplicate check error:", error)
 }

 setLeads(validatedLeads)
 setStep("preview")
 setLoading(false)
 }

 const toggleExclude = (index: number) => {
 setLeads(prev => prev.map((lead, idx) =>
 idx === index ? { ...lead, excluded: !lead.excluded } : lead
 ))
 }

 const changeTemperature = (index: number, temp: LeadTemp) => {
 setLeads(prev => prev.map((lead, idx) =>
 idx === index ? { ...lead, temperature: temp } : lead
 ))
 }

 const handleImport = async () => {
 const leadsToImport = leads.filter(l => l.status === "valid" && !l.excluded)
 if (leadsToImport.length === 0) {
 toast.warning("No hay leads válidos para importar")
 return
 }

 setStep("importing")
 setLoading(true)

 try {
 const fileType = fileName.endsWith(".csv") ? "csv" : "excel"
 const result = await importLeads(leadsToImport, fileType)

 if (result.success) {
 toast.success("Importación completada", {
 description: `${result.created} leads creados • ${result.skipped} duplicados omitidos • ${result.invalid} inválidos omitidos`
 })
 onOpenChange(false)
 router.refresh()
 resetDialog()
 } else {
 toast.error(`Error: ${result.error}`)
 setStep("preview")
 }
 } catch (error) {
 console.error("Import error:", error)
 toast.error("Error al importar leads")
 setStep("preview")
 } finally {
 setLoading(false)
 }
 }

 const resetDialog = () => {
 setStep("upload")
 setLeads([])
 setFileName("")
 setLoading(false)
 if (fileInputRef.current) {
 fileInputRef.current.value = ""
 }
 }

 const totalDetected = leads.length
 const validCount = leads.filter(l => l.status === "valid" && !l.excluded).length
 const excludedCount = leads.filter(l => l.excluded).length
 const duplicateCount = leads.filter(l => l.status === "duplicate").length
 const invalidCount = leads.filter(l => l.status === "invalid").length

 return (
 <Dialog open={open} onOpenChange={(open) => {
 onOpenChange(open)
 if (!open) resetDialog()
 }}>
 <DialogContent className="bg-white border-slate-200 max-w-4xl max-h-[90vh] overflow-hidden flex flex-col rounded-2xl">
 <DialogHeader className="bg-white border-b border-slate-100 pb-4">
 <DialogTitle className="text-slate-900 text-xl flex items-center gap-2">
 <FileSpreadsheet className="h-5 w-5 text-[#1FA97A]" />
 Importar Leads desde CSV/Excel
 </DialogTitle>
 <DialogDescription className="text-slate-500">
 {step === "upload" && "Selecciona un archivo CSV o Excel con tus leads"}
 {step === "preview" && "Revisa los leads antes de importar"}
 {step === "importing" && "Importando leads..."}
 </DialogDescription>
 </DialogHeader>

 <div className="flex-1 overflow-auto">
 {/* STEP 1: Upload */}
 {step === "upload" && (
 <div className="py-8 px-4">
 <div
 onClick={() => !loading && fileInputRef.current?.click()}
 className="group border-2 border-dashed border-slate-200 rounded-xl p-10 text-center hover:border-[#1FA97A]/50 hover:bg-[#F0FDF8]/50 transition-all cursor-pointer"
 >
 <div className="flex justify-center mb-4">
 <Upload className="h-12 w-12 text-slate-300 group-hover:text-[#1FA97A] transition-colors" />
 </div>
 <p className="text-slate-700 font-medium">Arrastra tu archivo aquí o haz clic para seleccionar</p>
 <p className="text-slate-400 text-sm mt-1">Formatos soportados: CSV, XLSX, XLS</p>
 <p className="text-slate-400 text-sm">Columnas esperadas: nombre, email, teléfono, fuente</p>

 <input
 ref={fileInputRef}
 type="file"
 accept=".csv,.xlsx,.xls"
 onChange={handleFileSelect}
 className="hidden"
 />

 <button
 disabled={loading}
 className="mt-6 bg-[#1FA97A] text-white rounded-lg px-4 py-2 text-sm hover:bg-[#178f68] transition-colors disabled:opacity-50"
 onClick={(e) => { e.stopPropagation(); fileInputRef.current?.click() }}
 >
 {loading ? (
 <span className="flex items-center gap-2">
 <Loader2 className="h-4 w-4 animate-spin" />
 Procesando...
 </span>
 ) : (
 "Seleccionar Archivo"
 )}
 </button>
 </div>
 </div>
 )}

 {/* STEP 2: Preview */}
 {step === "preview" && (
 <div className="space-y-4 p-4">
 {/* KPIs */}
 <div className="grid grid-cols-4 gap-3">
 <div className="bg-slate-50 rounded-xl p-3 border border-slate-100">
 <p className="text-xl font-bold text-slate-900">{totalDetected}</p>
 <p className="text-xs text-slate-500 mt-0.5">Detectados</p>
 </div>
 <div className="bg-slate-50 rounded-xl p-3 border border-slate-100">
 <p className="text-xl font-bold text-slate-900">{validCount}</p>
 <p className="text-xs text-slate-500 mt-0.5">Se importarán</p>
 </div>
 <div className="bg-slate-50 rounded-xl p-3 border border-slate-100">
 <p className="text-xl font-bold text-slate-900">{excludedCount}</p>
 <p className="text-xs text-slate-500 mt-0.5">Excluidos</p>
 </div>
 <div className="bg-slate-50 rounded-xl p-3 border border-slate-100">
 <p className="text-xl font-bold text-slate-900">{duplicateCount + invalidCount}</p>
 <p className="text-xs text-slate-500 mt-0.5">Omitidos</p>
 </div>
 </div>

 {/* Table */}
 <div className="border border-slate-200 rounded-xl overflow-hidden">
 <div className="max-h-96 overflow-auto">
 <table className="w-full text-sm">
 <thead className="bg-slate-50 border-b border-slate-200 sticky top-0">
 <tr>
 <th className="px-4 py-3 text-left text-xs uppercase tracking-wider text-slate-500 font-medium">Estado</th>
 <th className="px-4 py-3 text-left text-xs uppercase tracking-wider text-slate-500 font-medium">Temperatura</th>
 <th className="px-4 py-3 text-left text-xs uppercase tracking-wider text-slate-500 font-medium">Nombre</th>
 <th className="px-4 py-3 text-left text-xs uppercase tracking-wider text-slate-500 font-medium">Email</th>
 <th className="px-4 py-3 text-left text-xs uppercase tracking-wider text-slate-500 font-medium">Tags</th>
 <th className="px-4 py-3 text-center text-xs uppercase tracking-wider text-slate-500 font-medium w-10"></th>
 </tr>
 </thead>
 <tbody>
 {leads.map((lead, idx) => (
 <tr key={idx} className={`border-b border-slate-100 hover:bg-slate-50/50 transition-all ${lead.excluded ? 'opacity-40' : ''}`}>
 <td className="px-4 py-3">
 {lead.status === "valid" && !lead.excluded && (
 <span className="flex items-center gap-1 text-[#1FA97A]">
 <CheckCircle className="h-3 w-3" />
 <span className="text-xs">Nuevo</span>
 </span>
 )}
 {lead.status === "valid" && lead.excluded && (
 <span className="flex items-center gap-1 text-slate-400">
 <X className="h-3 w-3" />
 <span className="text-xs">Excluido</span>
 </span>
 )}
 {lead.status === "duplicate" && (
 <span className="flex items-center gap-1 text-amber-500">
 <AlertCircle className="h-3 w-3" />
 <span className="text-xs">Duplicado</span>
 </span>
 )}
 {lead.status === "invalid" && (
 <span className="flex items-center gap-1 text-red-500">
 <XCircle className="h-3 w-3" />
 <span className="text-xs">Inválido</span>
 </span>
 )}
 </td>
 <td className="px-4 py-3">
 {lead.status === "valid" && !lead.excluded ? (
 <div className="flex gap-1">
 <button
 onClick={() => changeTemperature(idx, "HOT")}
 className={`px-2 py-0.5 rounded-full text-xs font-medium transition-all ${lead.temperature === "HOT"
 ? 'bg-red-50 text-red-600 border border-red-200'
 : 'bg-slate-50 text-slate-400 border border-slate-200 hover:bg-red-50 hover:text-red-500'
 }`}
 title="HOT"
 >
 <Flame className="h-3 w-3" />
 </button>
 <button
 onClick={() => changeTemperature(idx, "WARM")}
 className={`px-2 py-0.5 rounded-full text-xs font-medium transition-all ${lead.temperature === "WARM"
 ? 'bg-amber-50 text-amber-600 border border-amber-200'
 : 'bg-slate-50 text-slate-400 border border-slate-200 hover:bg-amber-50 hover:text-amber-500'
 }`}
 title="WARM"
 >
 <CloudSun className="h-3 w-3" />
 </button>
 <button
 onClick={() => changeTemperature(idx, "COLD")}
 className={`px-2 py-0.5 rounded-full text-xs font-medium transition-all ${lead.temperature === "COLD"
 ? 'bg-blue-50 text-blue-600 border border-blue-200'
 : 'bg-slate-50 text-slate-400 border border-slate-200 hover:bg-blue-50 hover:text-blue-500'
 }`}
 title="COLD"
 >
 <CloudSnow className="h-3 w-3" />
 </button>
 </div>
 ) : (
 <span className="text-xs text-slate-400">-</span>
 )}
 </td>
 <td className="px-4 py-3 text-sm text-slate-700">{lead.name || "-"}</td>
 <td className="px-4 py-3 text-sm text-slate-500">{lead.email || "-"}</td>
 <td className="px-4 py-3">
 {lead.tags && lead.tags.length > 0 ? (
 <div className="flex flex-wrap gap-1">
 {lead.tags.slice(0, 3).map((tag, tagIdx) => {
 let tagColor = "bg-slate-100 text-slate-500"
 if (tag.includes("high-intent")) tagColor = "bg-red-50 text-red-600"
 if (tag.includes("suspicious")) tagColor = "bg-amber-50 text-amber-600"
 if (tag.includes("business-email")) tagColor = "bg-blue-50 text-blue-600"
 if (tag.includes("warm-lead")) tagColor = "bg-amber-50 text-amber-600"
 if (tag.includes("invalid")) tagColor = "bg-red-50 text-red-600"

 return (
 <span key={tagIdx} className={`px-1.5 py-0.5 rounded text-[10px] ${tagColor}`}>
 {tag}
 </span>
 )
 })}
 {lead.tags.length > 3 && (
 <span className="text-[10px] text-slate-400">+{lead.tags.length - 3}</span>
 )}
 </div>
 ) : (
 <span className="text-xs text-slate-400">-</span>
 )}
 </td>
 <td className="px-4 py-3 text-center">
 {lead.status === "valid" && (
 <button
 onClick={() => toggleExclude(idx)}
 className={`p-1 rounded transition-colors ${lead.excluded
 ? 'text-[#1FA97A] hover:bg-[#F0FDF8]'
 : 'text-slate-400 hover:text-red-500'
 }`}
 title={lead.excluded ? "Incluir" : "Excluir"}
 >
 {lead.excluded ? <Undo2 className="h-4 w-4" /> : <X className="h-4 w-4" />}
 </button>
 )}
 </td>
 </tr>
 ))}
 </tbody>
 </table>
 </div>
 </div>
 </div>
 )}

 {/* STEP 3: Importing */}
 {step === "importing" && (
 <div className="flex flex-col items-center justify-center py-12 space-y-4">
 <Loader2 className="h-12 w-12 text-[#1FA97A] animate-spin" />
 <p className="text-slate-700">Importando {validCount} leads...</p>
 </div>
 )}
 </div>

 <DialogFooter>
 {step === "upload" && (
 <button onClick={() => onOpenChange(false)} className="border border-slate-200 text-slate-700 rounded-xl px-5 py-2.5 hover:bg-slate-50 transition-colors text-sm">
 Cancelar
 </button>
 )}
 {step === "preview" && (
 <>
 <button onClick={resetDialog} className="border border-slate-200 text-slate-700 rounded-xl px-5 py-2.5 hover:bg-slate-50 transition-colors text-sm">
 Volver
 </button>
 <button
 onClick={handleImport}
 disabled={validCount === 0}
 className="bg-[#1FA97A] text-white rounded-xl px-5 py-2.5 hover:bg-[#178f68] transition-colors text-sm disabled:opacity-50 flex items-center gap-2"
 >
 <CheckCircle className="h-4 w-4" />
 Importar {validCount} Lead{validCount !== 1 ? "s" : ""}
 </button>
 </>
 )}
 </DialogFooter>
 </DialogContent>
 </Dialog>
 )
}
