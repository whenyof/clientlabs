"use client"

import { useState } from "react"
import { useQueryClient } from "@tanstack/react-query"
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
  temperature: LeadTemp
  excluded: boolean
  additionalInfo?: string
}

// ─── Parser ────────────────────────────────────────────────────────────────

const STATUS_WORDS = [
  "CUALIFICADO", "CUALIFICADA", "QUALIFIED",
  "CONTACTADO", "CONTACTADA", "CONTACTED",
  "INTERESADO", "INTERESADA", "INTERESTED",
  "NUEVO", "NUEVA", "NEW",
  "CONVERTIDO", "CONVERTIDA", "CONVERTED",
  "PERDIDO", "PERDIDA", "LOST",
]

const SOURCE_KEYWORDS = [
  "facebook", "instagram", "linkedin", "google", "web", "referido",
  "referral", "twitter", "tiktok", "youtube", "whatsapp", "ads", "manual",
]

const TEMP_MAP: Record<string, LeadTemp> = {
  HOT: "HOT", CALIENTE: "HOT",
  WARM: "WARM", TIBIO: "WARM", TEMPLADO: "WARM",
  COLD: "COLD", FRÍO: "COLD", FRIO: "COLD",
}

function normalizeSource(s: string): string {
  const lower = s?.toLowerCase().trim()
  if (!lower) return "paste"
  for (const kw of SOURCE_KEYWORDS) {
    if (lower.includes(kw)) return kw
  }
  return lower || "paste"
}

function isCSV(text: string): boolean {
  const lines = text.trim().split("\n").filter((l) => l.trim())
  if (lines.length === 0) return false
  const csvLines = lines.filter((l) => (l.match(/,/g) || []).length >= 2)
  return csvLines.length >= Math.ceil(lines.length / 2)
}

function parseCSVLine(line: string): ParsedLead | null {
  const parts = line.split(",").map((p) => p.trim())
  const [name, email, phone, source, , ...rest] = parts
  // 5th column (status) is skipped — all imports start as NEW
  if (!name && !email && !phone) return null
  const additionalInfo = rest.join(" ").trim() || undefined
  return {
    name: name || undefined,
    email: email || undefined,
    phone: phone || undefined,
    source: normalizeSource(source),
    temperature: "COLD",
    excluded: false,
    additionalInfo,
  }
}

function parseFreeLine(line: string): ParsedLead | null {
  const emailRegex = /[^\s@,]+@[^\s@,]+\.[^\s@,]+/g
  const phoneRegex = /(?:\+\d{1,3}[\s.-]?)?\d{3}[\s.-]?\d{3}[\s.-]?\d{3,4}|\+?\d{9,15}/g

  const emails = line.match(emailRegex) || []
  const phones = line.match(phoneRegex) || []

  let remaining = line
  emails.forEach((e) => { remaining = remaining.replace(e, " ") })
  phones.forEach((p) => { remaining = remaining.replace(p, " ") })

  // Extract temperature
  let temperature: LeadTemp = "COLD"
  const tempKeys = Object.keys(TEMP_MAP).join("|")
  const tempMatch = remaining.match(new RegExp(`\\b(${tempKeys})\\b`, "i"))
  if (tempMatch) {
    temperature = TEMP_MAP[tempMatch[1].toUpperCase()]
    remaining = remaining.replace(tempMatch[0], " ")
  }

  // Remove status keywords
  const statusPattern = new RegExp(`\\b(${STATUS_WORDS.join("|")})\\b`, "i")
  remaining = remaining.replace(statusPattern, " ")

  // Extract source
  let source = "paste"
  for (const kw of SOURCE_KEYWORDS) {
    const srcRegex = new RegExp(`\\b${kw}\\b`, "i")
    if (srcRegex.test(remaining)) {
      source = kw
      remaining = remaining.replace(srcRegex, " ")
      break
    }
  }

  // Clean up
  remaining = remaining.replace(/\s+/g, " ").trim()

  // Split into name (leading title-case words) + additionalInfo (rest)
  const tokens = remaining.split(/\s+/).filter(Boolean)
  let nameCount = 0
  for (let i = 0; i < Math.min(4, tokens.length); i++) {
    if (/^[A-ZÁÉÍÓÚÑÜ][a-záéíóúñü]/.test(tokens[i])) {
      nameCount = i + 1
    } else {
      break
    }
  }

  const name = nameCount > 0 ? tokens.slice(0, nameCount).join(" ") : undefined
  const infoRest = tokens.slice(nameCount).join(" ").trim()
  const additionalInfo = infoRest || undefined

  if (!emails[0] && !phones[0] && !name) return null

  return {
    name,
    email: emails[0] || undefined,
    phone: phones[0] || undefined,
    source,
    temperature,
    excluded: false,
    additionalInfo,
  }
}

function parseMultipleLeads(text: string): ParsedLead[] {
  const lines = text.split("\n").filter((l) => l.trim())
  const csv = isCSV(text)
  return lines
    .map((line) => (csv ? parseCSVLine(line) : parseFreeLine(line)))
    .filter((l): l is ParsedLead => l !== null)
}

// ─── Component ─────────────────────────────────────────────────────────────

export function PasteLeadsDialog({
  open,
  onOpenChange,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
}) {
  const queryClient = useQueryClient()
  const [step, setStep] = useState<"paste" | "preview" | "importing">("paste")
  const [pastedText, setPastedText] = useState("")
  const [leads, setLeads] = useState<ParsedLead[]>([])
  const [loading, setLoading] = useState(false)

  const handleAnalyze = () => {
    if (!pastedText.trim()) return
    setLeads(parseMultipleLeads(pastedText))
    setStep("preview")
  }

  const toggleExclude = (index: number) => {
    setLeads((prev) =>
      prev.map((lead, idx) => (idx === index ? { ...lead, excluded: !lead.excluded } : lead))
    )
  }

  const changeTemperature = (index: number, temp: LeadTemp) => {
    setLeads((prev) =>
      prev.map((lead, idx) => (idx === index ? { ...lead, temperature: temp } : lead))
    )
  }

  const updateField = (index: number, field: keyof ParsedLead, value: string) => {
    setLeads((prev) =>
      prev.map((lead, idx) => (idx === index ? { ...lead, [field]: value } : lead))
    )
  }

  const handleImport = async () => {
    const leadsToImport = leads.filter((l) => !l.excluded)
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
          description: `${result.created} leads creados · ${result.skipped} duplicados omitidos · ${result.invalid} inválidos omitidos`,
        })
        queryClient.invalidateQueries({ queryKey: ["leads"] })
        queryClient.invalidateQueries({ queryKey: ["leads-kpis"] })
        onOpenChange(false)
        resetDialog()
      } else {
        toast.error(`Error: ${result.error}`)
        setStep("preview")
      }
    } catch {
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

  const validCount = leads.filter((l) => !l.excluded).length
  const excludedCount = leads.filter((l) => l.excluded).length

  return (
    <Dialog
      open={open}
      onOpenChange={(o) => {
        onOpenChange(o)
        if (!o) resetDialog()
      }}
    >
      <DialogContent className="bg-white border-slate-200 !max-w-[800px] w-full max-h-[90vh] overflow-hidden flex flex-col rounded-2xl">
        <DialogHeader className="bg-white border-b border-slate-100 pb-4">
          <DialogTitle className="text-slate-900 text-xl flex items-center gap-2">
            <ClipboardPaste className="h-5 w-5 text-[#1FA97A]" />
            Pegar datos masivamente
          </DialogTitle>
          <DialogDescription className="text-slate-500">
            {step === "paste" && "Pega emails, teléfonos y nombres — formato CSV o texto libre"}
            {step === "preview" && "Revisa y edita los leads detectados antes de importar"}
            {step === "importing" && "Importando leads..."}
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 overflow-auto">
          {/* STEP 1: Paste */}
          {step === "paste" && (
            <div className="p-4 space-y-3">
              <label className="text-sm font-medium text-slate-700 block">Datos de contactos</label>
              <textarea
                value={pastedText}
                onChange={(e) => setPastedText(e.target.value)}
                placeholder={"CSV (nombre, email, tel, fuente, estado, notas):\nRoberto García,roberto@empresa.com,699123456,Facebook,CUALIFICADO,Consultor que busca CRM\n\nTexto libre:\nAna López 612345678 instagram ana@negocio.es INTERESADA Autónoma sector salud"}
                className="w-full min-h-[260px] border border-slate-200 rounded-xl p-4 text-sm text-slate-900 placeholder:text-slate-400 focus:border-[#1FA97A] focus:ring-2 focus:ring-[#1FA97A]/10 outline-none resize-none font-mono bg-slate-50 focus:bg-white transition-colors"
              />
              <div className="flex items-start gap-2 p-3 bg-blue-50 rounded-lg border border-blue-100">
                <Info className="h-3.5 w-3.5 text-blue-400 mt-0.5 flex-shrink-0" />
                <p className="text-xs text-blue-600">
                  Detectamos CSV (con comas) o texto libre. CSV: nombre, email, teléfono, fuente, estado, notas extras.
                </p>
              </div>
            </div>
          )}

          {/* STEP 2: Preview */}
          {step === "preview" && (
            <div className="space-y-4 p-4">
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

              {leads.length === 0 ? (
                <div className="text-center py-8 text-slate-400 text-sm">
                  No se detectaron leads. Revisa el formato del texto.
                </div>
              ) : (
                <div className="border border-slate-200 rounded-xl overflow-hidden">
                  <div className="max-h-96 overflow-auto">
                    <table className="w-full text-sm">
                      <thead className="bg-slate-50 border-b border-slate-200 sticky top-0">
                        <tr>
                          <th className="px-3 py-2.5 text-left text-xs uppercase tracking-wider text-slate-500 font-medium">Temp.</th>
                          <th className="px-3 py-2.5 text-left text-xs uppercase tracking-wider text-slate-500 font-medium">Nombre</th>
                          <th className="px-3 py-2.5 text-left text-xs uppercase tracking-wider text-slate-500 font-medium">Email</th>
                          <th className="px-3 py-2.5 text-left text-xs uppercase tracking-wider text-slate-500 font-medium">Teléfono</th>
                          <th className="px-3 py-2.5 text-left text-xs uppercase tracking-wider text-slate-500 font-medium">Fuente</th>
                          <th className="px-3 py-2.5 text-left text-xs uppercase tracking-wider text-slate-500 font-medium">Info adicional</th>
                          <th className="px-3 py-2.5 w-8"></th>
                        </tr>
                      </thead>
                      <tbody>
                        {leads.map((lead, idx) => (
                          <tr
                            key={idx}
                            className={`border-b border-slate-100 hover:bg-slate-50/50 transition-all ${lead.excluded ? "opacity-40" : ""}`}
                          >
                            {/* Temperature */}
                            <td className="px-3 py-2.5">
                              {!lead.excluded && (
                                <div className="flex gap-1">
                                  {(["HOT", "WARM", "COLD"] as LeadTemp[]).map((t) => {
                                    const icon =
                                      t === "HOT" ? <Flame className="h-3 w-3" /> :
                                      t === "WARM" ? <CloudSun className="h-3 w-3" /> :
                                      <CloudSnow className="h-3 w-3" />
                                    const activeClass =
                                      t === "HOT" ? "bg-red-50 text-red-600 border-red-200" :
                                      t === "WARM" ? "bg-amber-50 text-amber-600 border-amber-200" :
                                      "bg-blue-50 text-blue-600 border-blue-200"
                                    return (
                                      <button
                                        key={t}
                                        onClick={() => changeTemperature(idx, t)}
                                        className={`px-1.5 py-0.5 rounded-full border transition-all ${lead.temperature === t ? activeClass : "bg-slate-50 text-slate-400 border-slate-200 hover:bg-slate-100"}`}
                                      >
                                        {icon}
                                      </button>
                                    )
                                  })}
                                </div>
                              )}
                            </td>

                            {/* Name */}
                            <td className="px-3 py-2.5">
                              <input
                                type="text"
                                value={lead.name || ""}
                                onChange={(e) => updateField(idx, "name", e.target.value)}
                                placeholder="Nombre"
                                className={`bg-transparent border border-transparent rounded-md px-2 py-1 hover:border-slate-200 focus:border-[#1FA97A] focus:ring-1 focus:ring-[#1FA97A]/20 outline-none text-sm w-32 ${lead.excluded ? "text-slate-400" : "text-slate-900"}`}
                              />
                            </td>

                            {/* Email */}
                            <td className="px-3 py-2.5">
                              <input
                                type="email"
                                value={lead.email || ""}
                                onChange={(e) => updateField(idx, "email", e.target.value)}
                                placeholder="email@..."
                                className={`bg-transparent border border-transparent rounded-md px-2 py-1 hover:border-slate-200 focus:border-[#1FA97A] focus:ring-1 focus:ring-[#1FA97A]/20 outline-none text-sm w-40 ${lead.excluded ? "text-slate-400" : "text-slate-500"}`}
                              />
                            </td>

                            {/* Phone */}
                            <td className="px-3 py-2.5">
                              <input
                                type="tel"
                                value={lead.phone || ""}
                                onChange={(e) => updateField(idx, "phone", e.target.value)}
                                placeholder="+34 6..."
                                className={`bg-transparent border border-transparent rounded-md px-2 py-1 hover:border-slate-200 focus:border-[#1FA97A] focus:ring-1 focus:ring-[#1FA97A]/20 outline-none text-sm w-28 ${lead.excluded ? "text-slate-400" : "text-slate-500"}`}
                              />
                            </td>

                            {/* Source */}
                            <td className="px-3 py-2.5 text-xs text-slate-500 capitalize">{lead.source}</td>

                            {/* Additional Info */}
                            <td className="px-3 py-2.5 text-xs text-slate-400 max-w-[160px]">
                              <span className="block truncate" title={lead.additionalInfo}>
                                {lead.additionalInfo || "—"}
                              </span>
                            </td>

                            {/* Exclude */}
                            <td className="px-3 py-2.5 text-center">
                              <button
                                onClick={() => toggleExclude(idx)}
                                className={`p-1 rounded transition-colors ${lead.excluded ? "text-[#1FA97A] hover:bg-[#F0FDF8]" : "text-slate-400 hover:text-red-500"}`}
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
              )}
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
              <button
                onClick={() => onOpenChange(false)}
                className="border border-slate-200 text-slate-700 rounded-xl px-5 py-2.5 hover:bg-slate-50 transition-colors text-sm"
              >
                Cancelar
              </button>
              <button
                onClick={handleAnalyze}
                disabled={!pastedText.trim()}
                className="bg-[#1FA97A] text-white rounded-xl px-5 py-2.5 hover:bg-[#178f68] transition-colors text-sm disabled:opacity-50"
              >
                Analizar texto
              </button>
            </>
          )}
          {step === "preview" && (
            <>
              <button
                onClick={resetDialog}
                className="border border-slate-200 text-slate-700 rounded-xl px-5 py-2.5 hover:bg-slate-50 transition-colors text-sm"
              >
                Volver
              </button>
              <button
                onClick={handleImport}
                disabled={validCount === 0}
                className="bg-[#1FA97A] text-white rounded-xl px-5 py-2.5 hover:bg-[#178f68] transition-colors text-sm disabled:opacity-50 flex items-center gap-2"
              >
                <CheckCircle className="h-4 w-4" />
                Importar {validCount} lead{validCount !== 1 ? "s" : ""}
              </button>
            </>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
