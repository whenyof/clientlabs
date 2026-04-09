"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useQueryClient } from "@tanstack/react-query"
import { Upload, X, Undo2, CheckCircle, Loader2, Info } from "lucide-react"
import { toast } from "sonner"

type ParsedClient = {
  name?: string
  email?: string
  phone?: string
  legalType?: string
  taxId?: string
  source?: string
  notes?: string
  excluded: boolean
}

// ─── Parsers ────────────────────────────────────────────────────────────────

const SOURCE_KEYWORDS = [
  "facebook", "instagram", "linkedin", "google", "web", "referido",
  "referral", "twitter", "tiktok", "youtube", "whatsapp", "ads", "manual",
]

const LEGAL_TYPE_MAP: Record<string, string> = {
  AUTONOMO: "AUTONOMO", AUTÓNOMO: "AUTONOMO", autonomo: "AUTONOMO", autónomo: "AUTONOMO",
  EMPRESA: "EMPRESA", empresa: "EMPRESA",
  PARTICULAR: "PARTICULAR", particular: "PARTICULAR",
}

function normalizeSource(s: string): string {
  const lower = s?.toLowerCase().trim()
  if (!lower) return "import"
  for (const kw of SOURCE_KEYWORDS) {
    if (lower.includes(kw)) return kw
  }
  return lower || "import"
}

function isCSV(text: string): boolean {
  const lines = text.trim().split("\n").filter(l => l.trim())
  if (lines.length === 0) return false
  const csvLines = lines.filter(l => (l.match(/,/g) || []).length >= 2)
  return csvLines.length >= Math.ceil(lines.length / 2)
}

// CSV: nombre, email, telefono, tipo, nif, fuente, notas
function parseCSVLine(line: string): ParsedClient | null {
  const cols = line.split(",").map(p => p.trim())
  const [name, email, phone, legalTypeRaw, taxId, sourceRaw, ...rest] = cols
  if (!name && !email && !phone) return null
  return {
    name: name || undefined,
    email: email || undefined,
    phone: phone || undefined,
    legalType: LEGAL_TYPE_MAP[legalTypeRaw?.toUpperCase()] || undefined,
    taxId: taxId || undefined,
    source: normalizeSource(sourceRaw),
    notes: rest.join(" ").trim() || undefined,
    excluded: false,
  }
}

function parseFreeLine(line: string): ParsedClient | null {
  const emailRegex = /[^\s@,]+@[^\s@,]+\.[^\s@,]+/g
  const phoneRegex = /(?:\+\d{1,3}[\s.-]?)?\d{3}[\s.-]?\d{3}[\s.-]?\d{3,4}|\+?\d{9,15}/g
  const nifRegex = /\b\d{8}[A-Z]\b|\b[A-Z]\d{7}[A-Z0-9]\b/gi

  const emails = line.match(emailRegex) || []
  const phones = line.match(phoneRegex) || []
  const nifs = line.match(nifRegex) || []

  let remaining = line
  emails.forEach(e => { remaining = remaining.replace(e, " ") })
  phones.forEach(p => { remaining = remaining.replace(p, " ") })
  nifs.forEach(n => { remaining = remaining.replace(n, " ") })

  // Detect legalType
  let legalType: string | undefined
  for (const [key, val] of Object.entries(LEGAL_TYPE_MAP)) {
    const regex = new RegExp(`\\b${key}\\b`, "i")
    if (regex.test(remaining)) {
      legalType = val
      remaining = remaining.replace(regex, " ")
      break
    }
  }

  // Detect source
  let source = "import"
  for (const kw of SOURCE_KEYWORDS) {
    const srcRegex = new RegExp(`\\b${kw}\\b`, "i")
    if (srcRegex.test(remaining)) {
      source = kw
      remaining = remaining.replace(srcRegex, " ")
      break
    }
  }

  remaining = remaining.replace(/,+/g, " ").replace(/\s+/g, " ").trim()

  // Extract name (leading title-case words)
  const tokens = remaining.split(/\s+/).filter(Boolean)
  let nameCount = 0
  for (let i = 0; i < Math.min(4, tokens.length); i++) {
    if (/^[A-ZÁÉÍÓÚÑÜ][a-záéíóúñü]/.test(tokens[i]) && !/^\d/.test(tokens[i])) {
      nameCount = i + 1
    } else {
      break
    }
  }

  const name = nameCount > 0 ? tokens.slice(0, nameCount).join(" ") : undefined
  const notesRest = tokens.slice(nameCount).join(" ").trim()

  if (!emails[0] && !phones[0] && !name) return null

  return {
    name,
    email: emails[0] || undefined,
    phone: phones[0] || undefined,
    legalType,
    taxId: nifs[0] || undefined,
    source,
    notes: notesRest || undefined,
    excluded: false,
  }
}

function parseClients(text: string): ParsedClient[] {
  const lines = text.split("\n").filter(l => l.trim())
  const csv = isCSV(text)
  return lines
    .map(line => csv ? parseCSVLine(line) : parseFreeLine(line))
    .filter((c): c is ParsedClient => c !== null)
}

// ─── Component ───────────────────────────────────────────────────────────────

export function ImportClients() {
  const router = useRouter()
  const queryClient = useQueryClient()
  const [open, setOpen] = useState(false)
  const [step, setStep] = useState<"paste" | "preview" | "importing">("paste")
  const [pastedText, setPastedText] = useState("")
  const [clients, setClients] = useState<ParsedClient[]>([])
  const [loading, setLoading] = useState(false)

  const resetDialog = () => {
    setStep("paste")
    setPastedText("")
    setClients([])
    setLoading(false)
  }

  const handleClose = () => {
    setOpen(false)
    resetDialog()
  }

  const handleAnalyze = () => {
    if (!pastedText.trim()) return
    setClients(parseClients(pastedText))
    setStep("preview")
  }

  const toggleExclude = (idx: number) => {
    setClients(prev => prev.map((c, i) => i === idx ? { ...c, excluded: !c.excluded } : c))
  }

  const updateField = (idx: number, field: keyof ParsedClient, value: string) => {
    setClients(prev => prev.map((c, i) => i === idx ? { ...c, [field]: value } : c))
  }

  const handleImport = async () => {
    const toImport = clients.filter(c => !c.excluded)
    if (toImport.length === 0) {
      toast.warning("No hay clientes para importar")
      return
    }
    setStep("importing")
    setLoading(true)
    try {
      const res = await fetch("/api/clients/import", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ clients: toImport }),
      })
      if (!res.ok) {
        const err = await res.json()
        throw new Error(err.error || "Error al importar")
      }
      const data = await res.json()
      toast.success(`${data.created} clientes importados correctamente`)
      await queryClient.invalidateQueries({ queryKey: ["clients"] })
      await queryClient.invalidateQueries({ queryKey: ["clients-kpis"] })
      router.refresh()
      handleClose()
    } catch (err: any) {
      toast.error(err.message || "Error al importar clientes")
      setStep("preview")
    } finally {
      setLoading(false)
    }
  }

  const validCount = clients.filter(c => !c.excluded).length
  const excludedCount = clients.filter(c => c.excluded).length

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="flex items-center gap-2 px-4 py-2.5 border border-slate-200 text-slate-600 text-[13px] font-medium rounded-xl hover:border-[#1FA97A] hover:text-[#1FA97A] transition-colors"
      >
        <Upload className="h-4 w-4" />
        Importar CSV
      </button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-3xl max-h-[90vh] overflow-hidden flex flex-col">

            {/* Header */}
            <div className="flex items-center justify-between px-6 py-5 border-b border-slate-100">
              <div>
                <h2 className="text-[15px] font-semibold text-slate-900 flex items-center gap-2">
                  <Upload className="h-4 w-4 text-[#1FA97A]" />
                  Importar Clientes
                </h2>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  {step === "paste" && "Pega emails, teléfonos y nombres — formato CSV o texto libre"}
                  {step === "preview" && "Revisa los clientes detectados antes de importar"}
                  {step === "importing" && "Importando clientes..."}
                </p>
              </div>
              <button onClick={handleClose} className="p-2 hover:bg-slate-100 rounded-lg transition-colors">
                <X className="h-4 w-4 text-slate-400" />
              </button>
            </div>

            {/* Body */}
            <div className="flex-1 overflow-auto">

              {/* Step 1: Paste */}
              {step === "paste" && (
                <div className="p-6 space-y-3">
                  <textarea
                    value={pastedText}
                    onChange={e => setPastedText(e.target.value)}
                    placeholder={"CSV (nombre, email, teléfono, tipo, NIF, fuente, notas):\nMaría García,maria@empresa.com,699123456,AUTONOMO,12345678A,instagram,Diseñadora\n\nTexto libre:\nAna López 612345678 instagram ana@negocio.es autónoma"}
                    className="w-full min-h-[260px] border border-slate-200 rounded-xl p-4 text-sm text-slate-900 placeholder:text-slate-400 focus:border-[#1FA97A] focus:ring-2 focus:ring-[#1FA97A]/10 outline-none resize-none font-mono bg-slate-50 focus:bg-white transition-colors"
                  />
                  <div className="flex items-start gap-2 p-3 bg-blue-50 rounded-lg border border-blue-100">
                    <Info className="h-3.5 w-3.5 text-blue-400 mt-0.5 flex-shrink-0" />
                    <p className="text-xs text-blue-600">
                      Detectamos CSV (con comas) o texto libre. CSV: nombre, email, teléfono, tipo (AUTONOMO/EMPRESA/PARTICULAR), NIF/CIF, fuente, notas.
                    </p>
                  </div>
                </div>
              )}

              {/* Step 2: Preview */}
              {step === "preview" && (
                <div className="space-y-4 p-6">
                  <div className="grid grid-cols-3 gap-3">
                    {[
                      { label: "Detectados", val: clients.length },
                      { label: "Se importarán", val: validCount },
                      { label: "Excluidos", val: excludedCount },
                    ].map(({ label, val }) => (
                      <div key={label} className="bg-slate-50 rounded-xl p-3 border border-slate-100">
                        <p className="text-xl font-bold text-slate-900">{val}</p>
                        <p className="text-xs text-slate-500 mt-0.5">{label}</p>
                      </div>
                    ))}
                  </div>

                  {clients.length === 0 ? (
                    <div className="text-center py-8 text-slate-400 text-sm">
                      No se detectaron clientes. Revisa el formato del texto.
                    </div>
                  ) : (
                    <div className="border border-slate-200 rounded-xl overflow-hidden">
                      <div className="max-h-96 overflow-auto">
                        <table className="w-full text-sm">
                          <thead className="bg-slate-50 border-b border-slate-200 sticky top-0">
                            <tr>
                              {["Nombre", "Email", "Teléfono", "Tipo", "NIF/CIF", "Origen", ""].map(h => (
                                <th key={h} className="px-3 py-2.5 text-left text-xs uppercase tracking-wider text-slate-500 font-medium">{h}</th>
                              ))}
                            </tr>
                          </thead>
                          <tbody>
                            {clients.map((client, idx) => (
                              <tr
                                key={idx}
                                className={`border-b border-slate-100 hover:bg-slate-50/50 transition-all ${client.excluded ? "opacity-40" : ""}`}
                              >
                                <td className="px-3 py-2.5">
                                  <input
                                    value={client.name || ""}
                                    onChange={e => updateField(idx, "name", e.target.value)}
                                    placeholder="Nombre"
                                    className="bg-transparent border border-transparent rounded-md px-2 py-1 hover:border-slate-200 focus:border-[#1FA97A] focus:ring-1 focus:ring-[#1FA97A]/20 outline-none text-sm w-32 text-slate-900"
                                  />
                                </td>
                                <td className="px-3 py-2.5 text-slate-500 text-xs">{client.email || "—"}</td>
                                <td className="px-3 py-2.5 text-slate-500 text-xs">{client.phone || "—"}</td>
                                <td className="px-3 py-2.5 text-slate-500 text-xs">{client.legalType || "—"}</td>
                                <td className="px-3 py-2.5 text-slate-500 text-xs font-mono">{client.taxId || "—"}</td>
                                <td className="px-3 py-2.5 text-slate-500 text-xs">{client.source || "—"}</td>
                                <td className="px-3 py-2.5 text-center">
                                  <button
                                    onClick={() => toggleExclude(idx)}
                                    className={`p-1 rounded transition-colors ${client.excluded ? "text-[#1FA97A] hover:bg-[#F0FDF8]" : "text-slate-400 hover:text-red-500"}`}
                                    title={client.excluded ? "Incluir" : "Excluir"}
                                  >
                                    {client.excluded ? <Undo2 className="h-4 w-4" /> : <X className="h-4 w-4" />}
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

              {/* Step 3: Importing */}
              {step === "importing" && (
                <div className="flex flex-col items-center justify-center py-16 space-y-4">
                  <Loader2 className="h-10 w-10 text-[#1FA97A] animate-spin" />
                  <p className="text-slate-600 text-sm">Importando {validCount} clientes...</p>
                </div>
              )}

            </div>

            {/* Footer */}
            <div className="px-6 py-4 border-t border-slate-100 flex justify-end gap-3">
              {step === "paste" && (
                <>
                  <button onClick={handleClose} className="px-4 py-2.5 text-[13px] font-medium text-slate-500 hover:text-slate-700 transition-colors">
                    Cancelar
                  </button>
                  <button
                    onClick={handleAnalyze}
                    disabled={!pastedText.trim()}
                    className="px-6 py-2.5 rounded-xl text-[13px] font-medium text-white bg-[#1FA97A] hover:bg-[#1a9068] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    Analizar texto
                  </button>
                </>
              )}
              {step === "preview" && (
                <>
                  <button onClick={resetDialog} className="px-4 py-2.5 text-[13px] font-medium text-slate-500 hover:text-slate-700 transition-colors">
                    Volver
                  </button>
                  <button
                    onClick={handleImport}
                    disabled={validCount === 0}
                    className="px-6 py-2.5 rounded-xl text-[13px] font-medium text-white bg-[#1FA97A] hover:bg-[#1a9068] disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
                  >
                    <CheckCircle className="h-4 w-4" />
                    Importar {validCount} cliente{validCount !== 1 ? "s" : ""}
                  </button>
                </>
              )}
            </div>

          </div>
        </div>
      )}
    </>
  )
}
