"use client"

import { useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Upload, FileSpreadsheet, FileText, ChevronDown, ChevronRight, Eye } from "lucide-react"
import { Button } from "@/components/ui/button"

type ImportBatch = {
 date: string // YYYY-MM-DD
 type: "csv" | "excel" | "unknown"
 totalLeads: number
 batchTag: string
}

type ImportHistoryPanelProps = {
 batches: ImportBatch[]
}

export function ImportHistoryPanel({ batches }: ImportHistoryPanelProps) {
 const router = useRouter()
 const searchParams = useSearchParams()
 const [isExpanded, setIsExpanded] = useState(false)

 const handleViewLeads = (batchTag: string) => {
 const params = new URLSearchParams(searchParams.toString())
 params.set("tags", batchTag)
 params.delete("status")
 params.delete("temperature")
 params.delete("reminderFilter")
 router.push(`?${params.toString()}`)
 }

 if (batches.length === 0) {
 return null
 }

 return (
 <div className="rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-card)]">
 {/* Collapsed Header */}
 <Button
 type="button"
 variant="outline"
 size="sm"
 onClick={() => setIsExpanded(!isExpanded)}
 className="w-full flex items-center justify-between p-4 hover:bg-[var(--bg-card)] transition-colors border-0 rounded-xl"
 >
 <div className="flex items-center gap-3">
 <Upload className="h-5 w-5 text-[var(--accent)]" />
 <h3 className="text-sm font-semibold text-[var(--text-primary)]">
 Historial de Importaciones
 </h3>
 <span className="px-2 py-0.5 rounded-full bg-[var(--bg-card)] border border-blue-500/30 text-xs text-[var(--accent)] font-medium">
 {batches.length}
 </span>
 </div>
 {isExpanded ? (
 <ChevronDown className="h-5 w-5 text-[var(--text-secondary)]" />
 ) : (
 <ChevronRight className="h-5 w-5 text-[var(--text-secondary)]" />
 )}
 </Button>

 {/* Expanded Content */}
 {isExpanded && (
 <div className="p-4 pt-0 space-y-3">
 {batches.map((batch, idx) => (
 <div
 key={batch.batchTag}
 className={`rounded-lg border p-3 ${idx === 0
 ? "border-blue-500/40 bg-[var(--bg-card)]"
 : "border-[var(--border-subtle)] bg-[var(--bg-card)] hover:bg-[var(--bg-card)]"
 } transition-all`}
 >
 <div className="flex items-center justify-between gap-4">
 <div className="flex items-center gap-3 flex-1">
 <div className={`p-2 rounded-lg ${idx === 0
 ? "bg-[var(--bg-card)] border border-blue-500/40"
 : "bg-[var(--bg-card)] border border-[var(--border-subtle)]"
 }`}>
 {batch.type === "csv" ? (
 <FileText className={`h-4 w-4 ${idx === 0 ? "text-[var(--accent)]" : "text-[var(--text-secondary)]"}`} />
 ) : batch.type === "excel" ? (
 <FileSpreadsheet className={`h-4 w-4 ${idx === 0 ? "text-[var(--accent)]" : "text-[var(--text-secondary)]"}`} />
 ) : (
 <Upload className={`h-4 w-4 ${idx === 0 ? "text-[var(--accent)]" : "text-[var(--text-secondary)]"}`} />
 )}
 </div>
 <div className="flex-1">
 <div className="flex items-center gap-2 mb-0.5">
 <span className="text-sm font-medium text-[var(--text-primary)]">
 {batch.type === "csv" ? "CSV" : batch.type === "excel" ? "Excel" : "Importación"}
 </span>
 {idx === 0 && (
 <span className="px-1.5 py-0.5 rounded text-[10px] bg-green-500/20 border border-green-500/30 text-green-400">
 Reciente
 </span>
 )}
 </div>
 <div className="flex items-center gap-3 text-xs text-[var(--text-secondary)]">
 <span>📅 {new Date(batch.date).toLocaleDateString("es-ES", { day: "numeric", month: "short", year: "numeric" })}</span>
 <span>• {batch.totalLeads} leads</span>
 </div>
 </div>
 </div>
 <Button
 onClick={() => handleViewLeads(batch.batchTag)}
 size="sm"
 variant="outline"
 className={idx === 0
 ? "bg-[var(--bg-card)] border-blue-500/30 text-[var(--accent)] hover:bg-[var(--bg-card)]"
 : "bg-[var(--bg-card)] border-[var(--border-subtle)] text-[var(--text-secondary)] hover:bg-[var(--bg-card)]"
 }
 >
 <Eye className="h-3.5 w-3.5 mr-1" />
 Ver leads
 </Button>
 </div>
 </div>
 ))}
 </div>
 )}
 </div>
 )
}
