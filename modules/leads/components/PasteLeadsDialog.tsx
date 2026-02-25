"use client"

import { useState } from "react"
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
import { Textarea } from "@/components/ui/textarea"
import { ClipboardPaste, CheckCircle, X, Undo2, Flame, CloudSnow, CloudSun, Loader2 } from "lucide-react"
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
 const router = useRouter()
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

 // Remove emails and phones from line to extract name
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
 <DialogContent className="bg-zinc-900 border-[var(--border-subtle)] max-w-5xl max-h-[90vh] overflow-hidden flex flex-col">
 <DialogHeader>
 <DialogTitle className="text-[var(--text-primary)] text-xl flex items-center gap-2">
 <ClipboardPaste className="h-5 w-5 text-[var(--accent)]-hover" />
 Pegar Datos Masivamente
 </DialogTitle>
 <DialogDescription className="text-[var(--text-secondary)]">
 {step === "paste" && "Pega emails, teléfonos y nombres en cualquier formato"}
 {step === "preview" && "Revisa y edita los leads detectados"}
 {step === "importing" && "Importando leads..."}
 </DialogDescription>
 </DialogHeader>

 <div className="flex-1 overflow-auto">
 {/* STEP 1: Paste */}
 {step === "paste" && (
 <div className="space-y-4">
 <div className="p-4 rounded-lg bg-[var(--accent-soft)]-primary/15 border border-[var(--accent)]-primary/30">
 <p className="text-sm text-[var(--text-primary)] mb-2">Ejemplo de formato:</p>
 <code className="text-xs text-[var(--text-secondary)] block">
 Juan Pérez juan@empresa.com 622123123<br />
 marketing@startup.io<br />
 demo@agency.com +34 600 111 222
 </code>
 </div>

 <Textarea
 value={pastedText}
 onChange={(e) => setPastedText(e.target.value)}
 placeholder="Pega aquí tus datos..."
 className="bg-[var(--bg-card)] border-[var(--border-subtle)] text-[var(--text-primary)] placeholder:text-[var(--text-secondary)] min-h-[300px] font-mono text-sm"
 />
 </div>
 )}

 {/* STEP 2: Preview */}
 {step === "preview" && (
 <div className="space-y-4">
 {/* Summary */}
 <div className="grid grid-cols-3 gap-3">
 <div className="p-3 rounded-lg bg-[var(--bg-card)] border border-blue-500/30">
 <p className="text-xs text-[var(--text-secondary)] mb-1">Detectados</p>
 <p className="text-2xl font-bold text-[var(--accent)]">{leads.length}</p>
 </div>
 <div className="p-3 rounded-lg bg-[var(--accent-soft)] border border-[var(--accent)]">
 <p className="text-xs text-[var(--text-secondary)] mb-1">Se importarán</p>
 <p className="text-2xl font-bold text-[var(--accent)]">{validCount}</p>
 </div>
 <div className="p-3 rounded-lg bg-gray-500/10 border border-gray-500/30">
 <p className="text-xs text-[var(--text-secondary)] mb-1">Excluidos</p>
 <p className="text-2xl font-bold text-[var(--text-secondary)]">{excludedCount}</p>
 </div>
 </div>

 {/* Table */}
 <div className="border border-[var(--border-subtle)] rounded-lg overflow-hidden">
 <div className="max-h-96 overflow-auto">
 <table className="w-full text-sm">
 <thead className="bg-[var(--bg-card)] sticky top-0">
 <tr>
 <th className="px-3 py-2 text-left text-[var(--text-secondary)] font-medium">Temperatura</th>
 <th className="px-3 py-2 text-left text-[var(--text-secondary)] font-medium">Nombre</th>
 <th className="px-3 py-2 text-left text-[var(--text-secondary)] font-medium">Email</th>
 <th className="px-3 py-2 text-left text-[var(--text-secondary)] font-medium">Teléfono</th>
 <th className="px-3 py-2 text-center text-[var(--text-secondary)] font-medium w-10"></th>
 </tr>
 </thead>
 <tbody>
 {leads.map((lead, idx) => (
 <tr key={idx} className={`border-t border-[var(--border-subtle)] hover:bg-[var(--bg-card)] transition-all ${lead.excluded ? 'opacity-40' : ''
 }`}>
 <td className="px-3 py-2">
 {!lead.excluded && (
 <div className="flex gap-1">
 <button
 onClick={() => changeTemperature(idx, "HOT")}
 className={`px-2 py-0.5 rounded text-xs transition-all ${lead.temperature === "HOT"
 ? 'bg-[var(--bg-card)] border border-[var(--critical)] text-[var(--critical)]'
 : 'bg-[var(--bg-card)] border border-[var(--border-subtle)] text-[var(--text-secondary)] hover:bg-[var(--bg-card)]'
 }`}
 >
 <Flame className="h-3 w-3" />
 </button>
 <button
 onClick={() => changeTemperature(idx, "WARM")}
 className={`px-2 py-0.5 rounded text-xs transition-all ${lead.temperature === "WARM"
 ? 'bg-[var(--bg-card)] border border-[var(--border-subtle)] text-[var(--text-secondary)]'
 : 'bg-[var(--bg-card)] border border-[var(--border-subtle)] text-[var(--text-secondary)] hover:bg-[var(--bg-card)]'
 }`}
 >
 <CloudSun className="h-3 w-3" />
 </button>
 <button
 onClick={() => changeTemperature(idx, "COLD")}
 className={`px-2 py-0.5 rounded text-xs transition-all ${lead.temperature === "COLD"
 ? 'bg-cyan-500/20 border border-cyan-500/40 text-cyan-400'
 : 'bg-[var(--bg-card)] border border-[var(--border-subtle)] text-[var(--text-secondary)] hover:bg-[var(--bg-card)]'
 }`}
 >
 <CloudSnow className="h-3 w-3" />
 </button>
 </div>
 )}
 </td>
 <td className="px-3 py-2">
 <input
 type="text"
 value={lead.name || ""}
 onChange={(e) => updateField(idx, "name", e.target.value)}
 placeholder="Nombre"
 className={`bg-transparent border-0 outline-none w-full ${lead.excluded ? 'text-gray-500' : 'text-[var(--text-primary)]'}`}
 />
 </td>
 <td className="px-3 py-2">
 <input
 type="email"
 value={lead.email || ""}
 onChange={(e) => updateField(idx, "email", e.target.value)}
 placeholder="email@example.com"
 className={`bg-transparent border-0 outline-none w-full ${lead.excluded ? 'text-gray-500' : 'text-[var(--text-secondary)]'}`}
 />
 </td>
 <td className="px-3 py-2">
 <input
 type="tel"
 value={lead.phone || ""}
 onChange={(e) => updateField(idx, "phone", e.target.value)}
 placeholder="+34 600 000 000"
 className={`bg-transparent border-0 outline-none w-full ${lead.excluded ? 'text-gray-500' : 'text-[var(--text-secondary)]'}`}
 />
 </td>
 <td className="px-3 py-2 text-center">
 <button
 onClick={() => toggleExclude(idx)}
 className={`p-1 rounded transition-all ${lead.excluded
 ? 'hover:bg-[var(--accent-soft)] text-[var(--accent)]'
 : 'hover:bg-[var(--bg-card)] text-[var(--critical)]'
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
 <Loader2 className="h-12 w-12 text-[var(--accent)]-hover animate-spin" />
 <p className="text-[var(--text-secondary)]">Importando {validCount} leads...</p>
 </div>
 )}
 </div>

 <DialogFooter>
 {step === "paste" && (
 <>
 <Button variant="outline" onClick={() => onOpenChange(false)}>
 Cancelar
 </Button>
 <Button
 onClick={parseText}
 disabled={!pastedText.trim()}
 className="bg-[var(--accent-soft)]-primary/20 border-[var(--accent)]-primary/30 text-[var(--accent)]-hover hover:bg-[var(--accent-soft)]-primary/30"
 >
 Analizar Texto
 </Button>
 </>
 )}
 {step === "preview" && (
 <>
 <Button variant="outline" onClick={resetDialog}>
 Volver
 </Button>
 <Button
 onClick={handleImport}
 disabled={validCount === 0}
 className="bg-[var(--accent-soft)] border-[var(--accent)] text-[var(--accent)] hover:bg-[var(--accent-soft)]"
 >
 <CheckCircle className="mr-2 h-4 w-4" />
 Importar {validCount} Lead{validCount !== 1 ? "s" : ""}
 </Button>
 </>
 )}
 </DialogFooter>
 </DialogContent>
 </Dialog>
 )
}
