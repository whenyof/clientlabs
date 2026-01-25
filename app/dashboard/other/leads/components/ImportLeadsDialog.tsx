"use client"

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
import { Upload, FileSpreadsheet, CheckCircle, AlertCircle, XCircle, Loader2, X, Undo2, Flame, CloudSnow, CloudSun } from "lucide-react"
import Papa from "papaparse"
import * as XLSX from "xlsx"
import { importLeads } from "../actions"
import type { LeadTemp } from "@prisma/client"

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
                // Parse CSV
                Papa.parse(file, {
                    header: true,
                    skipEmptyLines: true,
                    complete: (results) => {
                        parsedData = results.data
                        processLeads(parsedData, fileType)
                    },
                    error: (error) => {
                        console.error("CSV parse error:", error)
                        alert("❌ Error al leer el archivo CSV")
                        setLoading(false)
                    }
                })
            } else {
                // Parse Excel
                const data = await file.arrayBuffer()
                const workbook = XLSX.read(data)
                const sheetName = workbook.SheetNames[0]
                const worksheet = workbook.Sheets[sheetName]
                parsedData = XLSX.utils.sheet_to_json(worksheet)
                processLeads(parsedData, fileType)
            }
        } catch (error) {
            console.error("File processing error:", error)
            alert("❌ Error al procesar el archivo")
            setLoading(false)
        }
    }

    const processLeads = async (data: any[], fileType: "csv" | "excel") => {
        // Normalize column names (case-insensitive)
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

        // Apply intelligent rules to each lead
        const { applyImportRules } = await import("../utils/importRules")

        const validatedLeads: LeadRow[] = normalizedLeads.map((lead) => {
            // Must have at least email OR phone
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

            // Apply intelligent rules
            const processed = applyImportRules(lead, fileType)

            return {
                ...processed,
                status: "valid",
                excluded: false
            }
        })

        // Check for duplicates (client-side basic check)
        const emails = validatedLeads.filter(l => l.email).map(l => l.email!.toLowerCase())
        const phones = validatedLeads.filter(l => l.phone).map(l => l.phone!)

        // Check against existing leads
        try {
            const response = await fetch("/api/leads/check-duplicates", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ emails, phones })
            })

            if (response.ok) {
                const { duplicates } = await response.json()

                // Mark duplicates
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
        // Filter: valid AND not excluded
        const leadsToImport = leads.filter(l => l.status === "valid" && !l.excluded)
        if (leadsToImport.length === 0) {
            alert("⚠️ No hay leads válidos para importar")
            return
        }

        setStep("importing")
        setLoading(true)

        try {
            const fileType = fileName.endsWith(".csv") ? "csv" : "excel"
            const result = await importLeads(leadsToImport, fileType)

            if (result.success) {
                alert(`✅ Importación completada:\n\n• ${result.created} leads creados\n• ${result.skipped} duplicados omitidos\n• ${result.invalid} inválidos omitidos`)
                onOpenChange(false)
                router.refresh()
                resetDialog()
            } else {
                alert(`❌ Error: ${result.error}`)
                setStep("preview")
            }
        } catch (error) {
            console.error("Import error:", error)
            alert("❌ Error al importar leads")
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
            <DialogContent className="bg-zinc-900 border-white/10 max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
                <DialogHeader>
                    <DialogTitle className="text-white text-xl flex items-center gap-2">
                        <FileSpreadsheet className="h-5 w-5 text-cyan-400" />
                        Importar Leads desde CSV/Excel
                    </DialogTitle>
                    <DialogDescription className="text-white/60">
                        {step === "upload" && "Selecciona un archivo CSV o Excel con tus leads"}
                        {step === "preview" && "Revisa los leads antes de importar"}
                        {step === "importing" && "Importando leads..."}
                    </DialogDescription>
                </DialogHeader>

                <div className="flex-1 overflow-auto">
                    {/* STEP 1: Upload */}
                    {step === "upload" && (
                        <div className="flex flex-col items-center justify-center py-12 space-y-6">
                            <div className="p-6 rounded-full bg-cyan-500/10 border-2 border-cyan-500/30">
                                <Upload className="h-12 w-12 text-cyan-400" />
                            </div>

                            <div className="text-center space-y-2">
                                <h3 className="text-lg font-semibold text-white">Selecciona tu archivo</h3>
                                <p className="text-sm text-white/60 max-w-md">
                                    Formatos soportados: CSV, XLSX, XLS<br />
                                    Columnas esperadas: nombre, email, teléfono, fuente
                                </p>
                            </div>

                            <input
                                ref={fileInputRef}
                                type="file"
                                accept=".csv,.xlsx,.xls"
                                onChange={handleFileSelect}
                                className="hidden"
                            />

                            <Button
                                onClick={() => fileInputRef.current?.click()}
                                disabled={loading}
                                className="bg-gradient-to-r from-cyan-500/20 to-blue-500/20 border-cyan-500/40 text-cyan-300 hover:from-cyan-500/30 hover:to-blue-500/30"
                            >
                                {loading ? (
                                    <>
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                        Procesando...
                                    </>
                                ) : (
                                    <>
                                        <Upload className="mr-2 h-4 w-4" />
                                        Seleccionar Archivo
                                    </>
                                )}
                            </Button>
                        </div>
                    )}

                    {/* STEP 2: Preview */}
                    {step === "preview" && (
                        <div className="space-y-4">
                            {/* Summary */}
                            <div className="grid grid-cols-4 gap-3">
                                <div className="p-3 rounded-lg bg-blue-500/10 border border-blue-500/30">
                                    <div className="flex items-center gap-2 mb-1">
                                        <FileSpreadsheet className="h-4 w-4 text-blue-400" />
                                        <span className="text-xs text-white/60">Detectados</span>
                                    </div>
                                    <p className="text-2xl font-bold text-blue-400">{totalDetected}</p>
                                </div>
                                <div className="p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/30">
                                    <div className="flex items-center gap-2 mb-1">
                                        <CheckCircle className="h-4 w-4 text-emerald-400" />
                                        <span className="text-xs text-white/60">Se importarán</span>
                                    </div>
                                    <p className="text-2xl font-bold text-emerald-400">{validCount}</p>
                                </div>
                                <div className="p-3 rounded-lg bg-gray-500/10 border border-gray-500/30">
                                    <div className="flex items-center gap-2 mb-1">
                                        <X className="h-4 w-4 text-gray-400" />
                                        <span className="text-xs text-white/60">Excluidos</span>
                                    </div>
                                    <p className="text-2xl font-bold text-gray-400">{excludedCount}</p>
                                </div>
                                <div className="p-3 rounded-lg bg-amber-500/10 border border-amber-500/30">
                                    <div className="flex items-center gap-2 mb-1">
                                        <AlertCircle className="h-4 w-4 text-amber-400" />
                                        <span className="text-xs text-white/60">Omitidos</span>
                                    </div>
                                    <p className="text-2xl font-bold text-amber-400">{duplicateCount + invalidCount}</p>
                                </div>
                            </div>

                            {/* Table */}
                            <div className="border border-white/10 rounded-lg overflow-hidden">
                                <div className="max-h-96 overflow-auto">
                                    <table className="w-full text-sm">
                                        <thead className="bg-white/5 sticky top-0">
                                            <tr>
                                                <th className="px-3 py-2 text-left text-white/60 font-medium">Estado</th>
                                                <th className="px-3 py-2 text-left text-white/60 font-medium">Temperatura</th>
                                                <th className="px-3 py-2 text-left text-white/60 font-medium">Nombre</th>
                                                <th className="px-3 py-2 text-left text-white/60 font-medium">Email</th>
                                                <th className="px-3 py-2 text-left text-white/60 font-medium">Tags</th>
                                                <th className="px-3 py-2 text-center text-white/60 font-medium w-10"></th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {leads.map((lead, idx) => (
                                                <tr key={idx} className={`border-t border-white/5 hover:bg-white/5 transition-all ${lead.excluded ? 'opacity-40' : ''
                                                    }`}>
                                                    <td className="px-3 py-2">
                                                        {lead.status === "valid" && !lead.excluded && (
                                                            <span className="flex items-center gap-1 text-emerald-400">
                                                                <CheckCircle className="h-3 w-3" />
                                                                <span className="text-xs">Nuevo</span>
                                                            </span>
                                                        )}
                                                        {lead.status === "valid" && lead.excluded && (
                                                            <span className="flex items-center gap-1 text-gray-400">
                                                                <X className="h-3 w-3" />
                                                                <span className="text-xs">Excluido</span>
                                                            </span>
                                                        )}
                                                        {lead.status === "duplicate" && (
                                                            <span className="flex items-center gap-1 text-amber-400">
                                                                <AlertCircle className="h-3 w-3" />
                                                                <span className="text-xs">Duplicado</span>
                                                            </span>
                                                        )}
                                                        {lead.status === "invalid" && (
                                                            <span className="flex items-center gap-1 text-red-400">
                                                                <XCircle className="h-3 w-3" />
                                                                <span className="text-xs">Inválido</span>
                                                            </span>
                                                        )}
                                                    </td>
                                                    <td className="px-3 py-2">
                                                        {lead.status === "valid" && !lead.excluded ? (
                                                            <div className="flex gap-1">
                                                                <button
                                                                    onClick={() => changeTemperature(idx, "HOT")}
                                                                    className={`px-2 py-0.5 rounded text-xs transition-all ${lead.temperature === "HOT"
                                                                        ? 'bg-red-500/20 border border-red-500/40 text-red-400'
                                                                        : 'bg-white/5 border border-white/10 text-white/40 hover:bg-white/10'
                                                                        }`}
                                                                    title="HOT"
                                                                >
                                                                    <Flame className="h-3 w-3" />
                                                                </button>
                                                                <button
                                                                    onClick={() => changeTemperature(idx, "WARM")}
                                                                    className={`px-2 py-0.5 rounded text-xs transition-all ${lead.temperature === "WARM"
                                                                        ? 'bg-amber-500/20 border border-amber-500/40 text-amber-400'
                                                                        : 'bg-white/5 border border-white/10 text-white/40 hover:bg-white/10'
                                                                        }`}
                                                                    title="WARM"
                                                                >
                                                                    <CloudSun className="h-3 w-3" />
                                                                </button>
                                                                <button
                                                                    onClick={() => changeTemperature(idx, "COLD")}
                                                                    className={`px-2 py-0.5 rounded text-xs transition-all ${lead.temperature === "COLD"
                                                                        ? 'bg-cyan-500/20 border border-cyan-500/40 text-cyan-400'
                                                                        : 'bg-white/5 border border-white/10 text-white/40 hover:bg-white/10'
                                                                        }`}
                                                                    title="COLD"
                                                                >
                                                                    <CloudSnow className="h-3 w-3" />
                                                                </button>
                                                            </div>
                                                        ) : (
                                                            <span className="text-xs text-white/40">-</span>
                                                        )}
                                                    </td>
                                                    <td className={`px-3 py-2 ${lead.excluded ? 'text-gray-500' : 'text-white'}`}>{lead.name || "-"}</td>
                                                    <td className={`px-3 py-2 ${lead.excluded ? 'text-gray-500' : 'text-white/80'}`}>{lead.email || "-"}</td>
                                                    <td className="px-3 py-2">
                                                        {lead.tags && lead.tags.length > 0 ? (
                                                            <div className="flex flex-wrap gap-1">
                                                                {lead.tags.slice(0, 3).map((tag, tagIdx) => {
                                                                    let tagColor = "bg-gray-500/20 text-gray-400"
                                                                    if (tag.includes("high-intent")) tagColor = "bg-red-500/20 text-red-400"
                                                                    if (tag.includes("suspicious")) tagColor = "bg-orange-500/20 text-orange-400"
                                                                    if (tag.includes("business-email")) tagColor = "bg-blue-500/20 text-blue-400"
                                                                    if (tag.includes("warm-lead")) tagColor = "bg-amber-500/20 text-amber-400"
                                                                    if (tag.includes("invalid")) tagColor = "bg-red-500/20 text-red-400"

                                                                    return (
                                                                        <span key={tagIdx} className={`px-1.5 py-0.5 rounded text-[10px] ${tagColor}`}>
                                                                            {tag}
                                                                        </span>
                                                                    )
                                                                })}
                                                                {lead.tags.length > 3 && (
                                                                    <span className="text-[10px] text-white/40">+{lead.tags.length - 3}</span>
                                                                )}
                                                            </div>
                                                        ) : (
                                                            <span className="text-xs text-white/40">-</span>
                                                        )}
                                                    </td>
                                                    <td className="px-3 py-2 text-center">
                                                        {lead.status === "valid" && (
                                                            <button
                                                                onClick={() => toggleExclude(idx)}
                                                                className={`p-1 rounded transition-all ${lead.excluded
                                                                    ? 'hover:bg-emerald-500/10 text-emerald-400'
                                                                    : 'hover:bg-red-500/10 text-red-400'
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
                            <Loader2 className="h-12 w-12 text-cyan-400 animate-spin" />
                            <p className="text-white/80">Importando {validCount} leads...</p>
                        </div>
                    )}
                </div>

                <DialogFooter>
                    {step === "upload" && (
                        <Button variant="outline" onClick={() => onOpenChange(false)}>
                            Cancelar
                        </Button>
                    )}
                    {step === "preview" && (
                        <>
                            <Button variant="outline" onClick={resetDialog}>
                                Volver
                            </Button>
                            <Button
                                onClick={handleImport}
                                disabled={validCount === 0}
                                className="bg-emerald-500/20 border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/30"
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
