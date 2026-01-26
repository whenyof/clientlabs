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
        <div className="rounded-xl border border-white/10 bg-white/5">
            {/* Collapsed Header */}
            <button
                onClick={() => setIsExpanded(!isExpanded)}
                className="w-full flex items-center justify-between p-4 hover:bg-white/5 transition-colors"
            >
                <div className="flex items-center gap-3">
                    <Upload className="h-5 w-5 text-blue-400" />
                    <h3 className="text-sm font-semibold text-white">
                        Historial de Importaciones
                    </h3>
                    <span className="px-2 py-0.5 rounded-full bg-blue-500/20 border border-blue-500/30 text-xs text-blue-400 font-medium">
                        {batches.length}
                    </span>
                </div>
                {isExpanded ? (
                    <ChevronDown className="h-5 w-5 text-white/60" />
                ) : (
                    <ChevronRight className="h-5 w-5 text-white/60" />
                )}
            </button>

            {/* Expanded Content */}
            {isExpanded && (
                <div className="p-4 pt-0 space-y-3">
                    {batches.map((batch, idx) => (
                        <div
                            key={batch.batchTag}
                            className={`rounded-lg border p-3 ${idx === 0
                                    ? "border-blue-500/40 bg-blue-500/10"
                                    : "border-white/10 bg-white/5 hover:bg-white/10"
                                } transition-all`}
                        >
                            <div className="flex items-center justify-between gap-4">
                                <div className="flex items-center gap-3 flex-1">
                                    <div className={`p-2 rounded-lg ${idx === 0
                                            ? "bg-blue-500/20 border border-blue-500/40"
                                            : "bg-white/5 border border-white/10"
                                        }`}>
                                        {batch.type === "csv" ? (
                                            <FileText className={`h-4 w-4 ${idx === 0 ? "text-blue-400" : "text-white/60"}`} />
                                        ) : batch.type === "excel" ? (
                                            <FileSpreadsheet className={`h-4 w-4 ${idx === 0 ? "text-blue-400" : "text-white/60"}`} />
                                        ) : (
                                            <Upload className={`h-4 w-4 ${idx === 0 ? "text-blue-400" : "text-white/60"}`} />
                                        )}
                                    </div>
                                    <div className="flex-1">
                                        <div className="flex items-center gap-2 mb-0.5">
                                            <span className="text-sm font-medium text-white">
                                                {batch.type === "csv" ? "CSV" : batch.type === "excel" ? "Excel" : "Importación"}
                                            </span>
                                            {idx === 0 && (
                                                <span className="px-1.5 py-0.5 rounded text-[10px] bg-green-500/20 border border-green-500/30 text-green-400">
                                                    Reciente
                                                </span>
                                            )}
                                        </div>
                                        <div className="flex items-center gap-3 text-xs text-white/60">
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
                                        ? "bg-blue-500/20 border-blue-500/30 text-blue-400 hover:bg-blue-500/30"
                                        : "bg-white/5 border-white/10 text-white/60 hover:bg-white/10"
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
