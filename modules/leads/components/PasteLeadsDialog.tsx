"use client"

import { useState } from "react"
import { useQueryClient } from "@tanstack/react-query"
import { Button } from "@/components/ui/button"
import {
 Dialog,
 DialogContent,
 DialogHeader,
 DialogTitle,
 DialogFooter,
 DialogDescription,
} from "@/components/ui/dialog"
import { ClipboardPaste, CheckCircle, X, Undo2, Flame, CloudSnow, CloudSun, Loader2, Info } from "lucide-react"
import { importLeads } from "../actions"
import type { LeadTemp } from "@prisma/client"
import { toast } from "sonner"

type ParsedLead = {
 name?: string
 email?: string
 phone?: string
 source: string
 excluded: boolean
 temperature: LeadTemp
}

export function PasteLeadsDialog({ open, onOpenChange }: { open: boolean; onOpenChange: (open: boolean) => void }) {
 const queryClient = useQueryClient()
 const [step, setStep] = useState<"paste" | "preview" | "importing">("paste")
 const [pastedText, setPastedText] = useState("")
 const [leads, setLeads] = useState<ParsedLead[]>([])
 const [loading, setLoading] = useState(false)

 const parseText = () => {
 if (!pastedText.trim()) return

 const lines = pastedText.split('\n').filter(line => line.trim())
 const emailRegex = /[^\s@]+@[^\s@]+\.[^\s@]+/g
 const phoneRegex = /\+?\d{9,15}/g

 const parsedLeads: ParsedLead[] = []

 lines.forEach(line => {
 const emails = line.match(emailRegex) || []
 const phones = line.match(phoneRegex) || []

 let remainingText = line
 emails.forEach(email => remainingText = remainingText.replace(email, ''))
 phones.forEach(phone => remainingText = remainingText.replace(phone, ''))

 const name = remainingText.trim().replace(/[^\w\s]/g, '').trim()

 if (emails.length > 0 || phones.length > 0) {
 parsedLeads.push({
 name: name || undefined,
 email: emails[0] || undefined,
 phone: phones[0] || undefined,
 source: "paste",
 excluded: false,
 temperature: "COLD"
 })
 }
 })

 setLeads(parsedLeads)
 setStep("preview")
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

 const updateField = (index: number, field: keyof ParsedLead, value: string) => {
 setLeads(prev => prev.map((lead, idx) =>
 idx === index ? { ...lead, [field]: value } : lead
 ))
 }

 const handleImport = async () => {
 const leadsToImport = leads.filter(l => !l.excluded)
 if (leadsToImport.length === 0) {
 toast.warning("No hay leads para importar")
 return
 }

 setStep("importing")
 setLoading(true)

 try {
 const result = await importLeads(leadsToImport, "csv")

 if (result.success) {
 toast.success("Importación completada", {
 description: `${result.created} leads creados • ${result.skipped} duplicados omitidos • ${result.invalid} inválidos omitidos`
 })
 queryClient.invalidateQueries({ queryKey: ["leads"] })
 queryClient.invalidateQueries({ queryKey: ["leads-kpis"] })
 onOpenChange(false)
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
 setStep("paste")
 setPastedText("")
 setLeads([])
 setLoading(false)
 }

 const validCount = leads.filter(l => !l.excluded).length
 const excludedCount = leads.filter(l => l.excluded).length

 return (
 <Dialog open={open} onOpenChange={(open) => {
 onOpenChange(open)
 if (!open) resetDialog()
 }}>
 <DialogContent className="bg-white border-slate-200 !max-w-[600px] w-full max-h-[90vh] overflow-hidden flex flex-col rounded-2xl">
 <DialogHeader className="bg-white border-b border-slate-100 pb-4">
 <DialogTitle className="text-slate-900 text-xl flex items-center gap-2">
 <ClipboardPaste className="h-5 w-5 text-[#1FA97A]" />
 Pegar Datos Masivamente
 </DialogTitle>
 <DialogDescription className="text-slate-500">
 {step === "paste" && "Pega emails, teléfonos y nombres en cualquier formato"}
 {step === "preview" && "Revisa y edita los leads detectados"}
 {step === "importing" && "Importando leads..."}
 </DialogDescription>
 </DialogHeader>

 <div className="flex-1 overflow-auto">
 {/* STEP 1: Paste */}
 {step === "paste" && (
 <div className="space-y-0 p-4">
 <label className="text-sm font-medium text-slate-700 mb-2 block">Datos de contactos</label>

 <textarea
 value={pastedText}
 onChange={(e) => setPastedText(e.target.value)}
 placeholder={"Pega aquí emails, nombres o cualquier lista de contactos. Por ejemplo:\n\nJuan García - juan@empresa.com - 612345678\nAna López, ana@negocio.es\ncontacto@empresa.com"}
 className="w-full min-h-[260px] border border-slate-200 rounded-xl p-4 text-sm text-slate-900 placeholder:text-slate-400 focus:border-[#1FA97A] focus:ring-2 focus:ring-[#1FA97A]/10 outline-none resize-none font-mono bg-slate-50 focus:bg-white transition-colors"
 />

 <div className="flex items-start gap-2 mt-3 p-3 bg-blue-50 rounded-lg border border-blue-100">
 <Info className="h-3.5 w-3.5 text-blue-400 mt-0.5 flex-shrink-0" />
 <p className="text-xs text-blue-600">Detectamos automáticamente emails, teléfonos y nombres en cualquier formato.</p>
 </div>
 </div>
 )}

 {/* STEP 2: Preview */}
 {step === "preview" && (
 <div className="space-y-4 p-4">
 {/* KPIs */}
 <div className="grid grid-cols-3 gap-3">
 <div className="bg-slate-50 rounded-xl p-3 border border-slate-100">
 <p className="text-xl font-bold text-slate-900">{leads.length}</p>
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
 </div>

 {/* Table */}
 <div className="border border-slate-200 rounded-xl overflow-hidden">
 <div className="max-h-96 overflow-auto">
 <table className="w-full text-sm">
 <thead className="bg-slate-50 border-b border-slate-200 sticky top-0">
 <tr>
 <th className="px-4 py-3 text-left text-xs uppercase tracking-wider text-slate-500 font-medium">Temperatura</th>
 <th className="px-4 py-3 text-left text-xs uppercase tracking-wider text-slate-500 font-medium">Nombre</th>
 <th className="px-4 py-3 text-left text-xs uppercase tracking-wider text-slate-500 font-medium">Email</th>
 <th className="px-4 py-3 text-left text-xs uppercase tracking-wider text-slate-500 font-medium">Teléfono</th>
 <th className="px-4 py-3 text-center text-xs uppercase tracking-wider text-slate-500 font-medium w-10"></th>
 </tr>
 </thead>
 <tbody>
 {leads.map((lead, idx) => (
 <tr key={idx} className={`border-b border-slate-100 hover:bg-slate-50/50 transition-all ${lead.excluded ? 'opacity-40' : ''}`}>
 <td className="px-4 py-3">
 {!lead.excluded && (
 <div className="flex gap-1">
 <button
 onClick={() => changeTemperature(idx, "HOT")}
 className={`px-2 py-0.5 rounded-full text-xs font-medium transition-all ${lead.temperature === "HOT"
 ? 'bg-red-50 text-red-600 border border-red-200'
 : 'bg-slate-50 text-slate-400 border border-slate-200 hover:bg-red-50 hover:text-red-500'
 }`}
 >
 <Flame className="h-3 w-3" />
 </button>
 <button
 onClick={() => changeTemperature(idx, "WARM")}
 className={`px-2 py-0.5 rounded-full text-xs font-medium transition-all ${lead.temperature === "WARM"
 ? 'bg-amber-50 text-amber-600 border border-amber-200'
 : 'bg-slate-50 text-slate-400 border border-slate-200 hover:bg-amber-50 hover:text-amber-500'
 }`}
 >
 <CloudSun className="h-3 w-3" />
 </button>
 <button
 onClick={() => changeTemperature(idx, "COLD")}
 className={`px-2 py-0.5 rounded-full text-xs font-medium transition-all ${lead.temperature === "COLD"
 ? 'bg-blue-50 text-blue-600 border border-blue-200'
 : 'bg-slate-50 text-slate-400 border border-slate-200 hover:bg-blue-50 hover:text-blue-500'
 }`}
 >
 <CloudSnow className="h-3 w-3" />
 </button>
 </div>
 )}
 </td>
 <td className="px-4 py-3">
 <input
 type="text"
 value={lead.name || ""}
 onChange={(e) => updateField(idx, "name", e.target.value)}
 placeholder="Nombre"
 className={`bg-transparent border border-transparent rounded-md px-2 py-1 hover:border-slate-200 focus:border-[#1FA97A] focus:ring-1 focus:ring-[#1FA97A]/20 outline-none text-sm w-full ${lead.excluded ? 'text-slate-400' : 'text-slate-900'}`}
 />
 </td>
 <td className="px-4 py-3">
 <input
 type="email"
 value={lead.email || ""}
 onChange={(e) => updateField(idx, "email", e.target.value)}
 placeholder="email@example.com"
 className={`bg-transparent border border-transparent rounded-md px-2 py-1 hover:border-slate-200 focus:border-[#1FA97A] focus:ring-1 focus:ring-[#1FA97A]/20 outline-none text-sm w-full ${lead.excluded ? 'text-slate-400' : 'text-slate-500'}`}
 />
 </td>
 <td className="px-4 py-3">
 <input
 type="tel"
 value={lead.phone || ""}
 onChange={(e) => updateField(idx, "phone", e.target.value)}
 placeholder="+34 600 000 000"
 className={`bg-transparent border border-transparent rounded-md px-2 py-1 hover:border-slate-200 focus:border-[#1FA97A] focus:ring-1 focus:ring-[#1FA97A]/20 outline-none text-sm w-full ${lead.excluded ? 'text-slate-400' : 'text-slate-500'}`}
 />
 </td>
 <td className="px-4 py-3 text-center">
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
 {step === "paste" && (
 <>
 <button onClick={() => onOpenChange(false)} className="border border-slate-200 text-slate-700 rounded-xl px-5 py-2.5 hover:bg-slate-50 transition-colors text-sm">
 Cancelar
 </button>
 <button
 onClick={parseText}
 disabled={!pastedText.trim()}
 className="bg-[#1FA97A] text-white rounded-xl px-5 py-2.5 hover:bg-[#178f68] transition-colors text-sm disabled:opacity-50"
 >
 Analizar Texto
 </button>
 </>
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
