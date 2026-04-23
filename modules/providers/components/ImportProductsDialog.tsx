"use client"

import { useState, useCallback, useRef } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { toast } from "sonner"
import Papa from "papaparse"
// ExcelJS loaded dynamically to avoid heavy static import
import { importProviderProductsFromCsv } from "@/app/dashboard/providers/actions"
import { useRouter } from "next/navigation"
import { Upload, Download, FileSpreadsheet, FileText, FileType } from "lucide-react"
import { useSectorConfig } from "@/hooks/useSectorConfig"
import { cn } from "@/lib/utils"

const EXPECTED_HEADERS = ["codigo", "nombre", "categoria", "unidad", "precio", "descripcion"] as const
type CsvRow = Record<string, string>

type FormatId = "excel" | "csv" | "pdf" | "word"

const FORMATS: { id: FormatId; name: string; extensions: string; accept: string; badge: string; badgeVariant: "default" | "secondary"; group: "recommended" | "review"; icon: typeof FileSpreadsheet }[] = [
    { id: "excel", name: "Excel", extensions: ".xlsx, .xls", accept: ".xlsx,.xls", badge: "Recomendado", badgeVariant: "default", group: "recommended", icon: FileSpreadsheet },
    { id: "csv", name: "CSV", extensions: ".csv", accept: ".csv,.txt", badge: "Recomendado", badgeVariant: "default", group: "recommended", icon: FileText },
    { id: "pdf", name: "PDF", extensions: ".pdf", accept: ".pdf", badge: "Revisión previa", badgeVariant: "secondary", group: "review", icon: FileType },
    { id: "word", name: "Word", extensions: ".docx", accept: ".docx", badge: "Revisión previa", badgeVariant: "secondary", group: "review", icon: FileType },
]

const FORMAT_HELP: Record<FormatId, string> = {
    excel: "Recomendado para catálogos con columnas como código, nombre, categoría, unidad, precio y descripción.",
    csv: "Ideal para exportaciones simples. Asegúrate de que la primera fila contiene los encabezados.",
    pdf: "El sistema intentará extraer los productos del documento. Antes de importar podrás revisar y corregir la información.",
    word: "Útil para listas o tarifas enviadas por el proveedor. Requiere revisión antes de importar.",
}

type FormatItem = (typeof FORMATS)[number]

function FormatCard({
    format,
    isSelected,
    onSelect,
    secondary,
}: { format: FormatItem; isSelected: boolean; onSelect: () => void; secondary?: boolean }) {
    const Icon = format.icon
    return (
        <button
            type="button"
            onClick={onSelect}
            className={cn(
                "inline-flex items-center gap-3 rounded-lg border px-3 py-2.5 text-left transition-all min-w-0",
                "border-[var(--border-main)]",
                isSelected
                    ? "border-[var(--accent)] bg-[var(--accent)]/10 shadow-sm"
                    : secondary
                        ? "bg-[var(--bg-main)]/20 hover:bg-[var(--bg-main)]/40 text-[var(--text-secondary)]"
                        : "bg-[var(--bg-main)]/30 hover:bg-[var(--bg-main)]/50 hover:border-[var(--text-muted)]/30"
            )}
        >
            <Icon className={cn("h-5 w-5 shrink-0", isSelected ? "text-[var(--accent)]" : "text-[var(--text-muted)]")} />
            <div className="min-w-0">
                <p className={cn("text-sm font-medium truncate", secondary && !isSelected ? "text-[var(--text-secondary)]" : "text-[var(--text-primary)]")}>
                    {format.name}
                </p>
                <p className="text-[11px] text-[var(--text-muted)]">{format.extensions}</p>
            </div>
            <Badge variant={format.badgeVariant} className="shrink-0 text-[10px] py-0">
                {format.badge}
            </Badge>
        </button>
    )
}

function normalizeRowKeys(row: Record<string, unknown>): CsvRow {
    const out: CsvRow = {}
    for (const [k, v] of Object.entries(row)) {
        const key = String(k)
            .toLowerCase()
            .normalize("NFD")
            .replace(/\u0300/g, "")
            .trim()
        out[key] = v != null ? String(v) : ""
    }
    return out
}

function parseCsvFile(file: File): Promise<CsvRow[]> {
    return new Promise((resolve, reject) => {
        Papa.parse<CsvRow>(file, {
            header: true,
            skipEmptyLines: true,
            encoding: "UTF-8",
            complete: (results) => {
                if (results.errors.length) {
                    reject(new Error(results.errors[0].message))
                    return
                }
                resolve((results.data || []).map(normalizeRowKeys))
            },
            error: (err) => reject(err),
        })
    })
}

async function parseExcelFile(file: File): Promise<CsvRow[]> {
    const ExcelJS = await import("exceljs")
    const wb = new ExcelJS.Workbook()
    await wb.xlsx.load(await file.arrayBuffer())
    const ws = wb.worksheets[0]
    if (!ws) return []
    const headers: string[] = []
    const rows: Record<string, unknown>[] = []
    ws.eachRow({ includeEmpty: false }, (row, rowNum) => {
        if (rowNum === 1) { row.eachCell((cell) => headers.push(String(cell.value ?? ""))) }
        else { const obj: Record<string, unknown> = {}; row.eachCell((cell, col) => { obj[headers[col - 1]] = cell.value }); rows.push(obj) }
    })
    return rows.map(normalizeRowKeys)
}

function rowToImportRow(row: CsvRow): { code: string; name: string; category?: string; unit?: string; price: number; description?: string } | null {
    const code = (row.codigo ?? row.code ?? "").trim()
    const name = (row.nombre ?? row.name ?? "").trim()
    if (!code || !name) return null
    const priceRaw = (row.precio ?? row.price ?? "0").toString().replace(",", ".")
    const price = parseFloat(priceRaw)
    if (Number.isNaN(price) || price < 0) return null
    return {
        code,
        name,
        category: (row.categoria ?? row.category ?? "").trim() || undefined,
        unit: (row.unidad ?? row.unit ?? "").trim() || undefined,
        price,
        description: (row.descripcion ?? row.description ?? "").trim() || undefined,
    }
}

type ImportProductsDialogProps = {
    providerId: string
    providerName: string
    open: boolean
    onOpenChange: (open: boolean) => void
    onSuccess?: () => void
}

export function ImportProductsDialog({
    providerId,
    providerName,
    open,
    onOpenChange,
    onSuccess,
}: ImportProductsDialogProps) {
    const { labels } = useSectorConfig()
    const router = useRouter()
    const fileInputRef = useRef<HTMLInputElement>(null)
    const [format, setFormat] = useState<FormatId>("excel")
    const [file, setFile] = useState<File | null>(null)
    const [previewRows, setPreviewRows] = useState<{ code: string; name: string; category?: string; unit?: string; price: number; description?: string }[]>([])
    const [loading, setLoading] = useState(false)
    const [importing, setImporting] = useState(false)
    const [dragOver, setDragOver] = useState(false)

    const selectedFormat = FORMATS.find((f) => f.id === format) ?? FORMATS[0]
    const canParse = format === "excel" || format === "csv"
    const isPdfOrWord = format === "pdf" || format === "word"

    const processFile = useCallback(
        async (f: File) => {
            setFile(f)
            setLoading(true)
            setPreviewRows([])
            try {
                if (format === "csv") {
                    const rows = await parseCsvFile(f)
                    const parsed = rows.map(rowToImportRow).filter((r): r is NonNullable<typeof r> => r !== null)
                    setPreviewRows(parsed)
                    if (parsed.length === 0 && rows.length > 0) {
                        toast.error("No se encontraron filas válidas (código, nombre y precio numérico obligatorios)")
                    }
                } else if (format === "excel") {
                    const rows = await parseExcelFile(f)
                    const parsed = rows.map(rowToImportRow).filter((r): r is NonNullable<typeof r> => r !== null)
                    setPreviewRows(parsed)
                    if (parsed.length === 0 && rows.length > 0) {
                        toast.error("No se encontraron filas válidas (código, nombre y precio obligatorios)")
                    }
                } else {
                    setPreviewRows([])
                    toast.info("Formato en preparación. Por ahora usa Excel o CSV para importar.")
                }
            } catch (err) {
                toast.error((err as Error)?.message || "Error al leer el archivo")
                setFile(null)
                setPreviewRows([])
            } finally {
                setLoading(false)
            }
        },
        [format]
    )

    const handleFileChange = useCallback(
        (e: React.ChangeEvent<HTMLInputElement>) => {
            const f = e.target.files?.[0]
            if (!f) return
            const ext = f.name.toLowerCase().split(".").pop()
            const allowed = selectedFormat.accept.split(",").map((x) => x.replace(".", "").trim())
            if (!ext || !allowed.some((a) => a.toLowerCase() === ext)) {
                toast.error(`Usa un archivo ${selectedFormat.extensions}`)
                return
            }
            processFile(f)
            e.target.value = ""
        },
        [selectedFormat.accept, selectedFormat.extensions, processFile]
    )

    const handleDrop = useCallback(
        (e: React.DragEvent) => {
            e.preventDefault()
            setDragOver(false)
            const f = e.dataTransfer.files?.[0]
            if (!f) return
            processFile(f)
        },
        [processFile]
    )
    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault()
        setDragOver(true)
    }
    const handleDragLeave = () => setDragOver(false)

    const handleImport = async () => {
        if (!previewRows.length) {
            toast.error("No hay filas para importar")
            return
        }
        setImporting(true)
        try {
            const result = await importProviderProductsFromCsv(providerId, previewRows)
            if (result.success) {
                toast.success(`Importados: ${result.created ?? 0}${result.skipped ? `, omitidos: ${result.skipped}` : ""}`)
                onOpenChange(false)
                router.refresh()
                onSuccess?.()
                reset()
            } else {
                toast.error(result.error || labels.common.error)
            }
        } catch {
            toast.error(labels.common.error)
        } finally {
            setImporting(false)
        }
    }

    const handleDownloadTemplate = () => {
        const headers = EXPECTED_HEADERS.join(",")
        const sample = "EJ-001,Ejemplo producto,Bebidas,ud,1.20,Descripción opcional"
        const csv = "\uFEFF" + [headers, sample].join("\n")
        const blob = new Blob([csv], { type: "text/csv;charset=utf-8" })
        const url = URL.createObjectURL(blob)
        const a = document.createElement("a")
        a.href = url
        a.download = "plantilla-productos-proveedor.csv"
        a.click()
        URL.revokeObjectURL(url)
    }

    const reset = () => {
        setFile(null)
        setPreviewRows([])
        if (fileInputRef.current) fileInputRef.current.value = ""
    }

    return (
        <Dialog
            open={open}
            onOpenChange={(o) => {
                if (!o) reset()
                onOpenChange(o)
            }}
        >
            <DialogContent
                className={cn(
                    "max-w-2xl max-h-[90vh] flex flex-col p-0 gap-0 overflow-hidden",
                    "bg-[var(--bg-card)] border-[var(--border-main)]"
                )}
            >
                <DialogHeader className="p-6 pb-4 border-b border-[var(--border-main)]">
                    <DialogTitle className="text-lg font-semibold text-[var(--text-primary)]">
                        Importar catálogo
                    </DialogTitle>
                    <p className="text-sm text-[var(--text-secondary)] mt-0.5">
                        Sube un archivo del proveedor para añadir productos al catálogo.
                    </p>
                    {providerName && (
                        <p className="text-xs text-[var(--text-muted)] mt-1 font-medium">
                            Proveedor: {providerName}
                        </p>
                    )}
                </DialogHeader>

                <div className="flex flex-col flex-1 min-h-0 overflow-auto">
                    <div className="p-6 space-y-5">
                        {/* Selectores de formato: dos grupos */}
                        <div className="space-y-4">
                            <div>
                                <p className="text-[11px] font-medium uppercase tracking-wider text-[var(--text-muted)] mb-2">
                                    Formatos recomendados
                                </p>
                                <div className="flex flex-wrap gap-2">
                                    {FORMATS.filter((f) => f.group === "recommended").map((f) => (
                                        <FormatCard
                                            key={f.id}
                                            format={f}
                                            isSelected={format === f.id}
                                            onSelect={() => {
                                                setFormat(f.id)
                                                setFile(null)
                                                setPreviewRows([])
                                                if (fileInputRef.current) fileInputRef.current.value = ""
                                            }}
                                        />
                                    ))}
                                </div>
                            </div>
                            <div>
                                <p className="text-[11px] font-medium uppercase tracking-wider text-[var(--text-muted)] mb-2">
                                    Con revisión previa
                                </p>
                                <div className="flex flex-wrap gap-2">
                                    {FORMATS.filter((f) => f.group === "review").map((f) => (
                                        <FormatCard
                                            key={f.id}
                                            format={f}
                                            isSelected={format === f.id}
                                            onSelect={() => {
                                                setFormat(f.id)
                                                setFile(null)
                                                setPreviewRows([])
                                                if (fileInputRef.current) fileInputRef.current.value = ""
                                            }}
                                            secondary
                                        />
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* Zona de subida */}
                        <div
                            onDrop={handleDrop}
                            onDragOver={handleDragOver}
                            onDragLeave={handleDragLeave}
                            className={cn(
                                "rounded-xl border-2 border-dashed p-8 text-center transition-colors",
                                dragOver ? "border-[var(--accent)] bg-[var(--accent)]/5" : "border-[var(--border-main)] bg-[var(--bg-main)]/20"
                            )}
                        >
                            <input
                                ref={fileInputRef}
                                type="file"
                                accept={selectedFormat.accept}
                                className="sr-only"
                                onChange={handleFileChange}
                            />
                            <Upload className="mx-auto h-10 w-10 text-[var(--text-muted)] mb-3" />
                            <p className="text-sm font-medium text-[var(--text-primary)]">
                                Arrastra aquí tu archivo
                            </p>
                            <p className="text-xs text-[var(--text-secondary)] mt-0.5">
                                o selecciónalo desde tu dispositivo
                            </p>
                            <p className="text-[11px] text-[var(--text-muted)] mt-2">
                                {selectedFormat.extensions}
                            </p>
                            <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                className="mt-4 border-[var(--border-main)] text-[var(--text-primary)]"
                                onClick={() => fileInputRef.current?.click()}
                            >
                                Seleccionar archivo
                            </Button>
                            {file && (
                                <p className="text-xs text-[var(--text-secondary)] mt-3 truncate max-w-full px-4">
                                    {file.name}
                                </p>
                            )}
                        </div>

                        {/* Acción secundaria: descargar ejemplo */}
                        {canParse && (
                            <div className="flex justify-center">
                                <Button
                                    type="button"
                                    variant="ghost"
                                    size="sm"
                                    onClick={handleDownloadTemplate}
                                    className="text-[var(--text-muted)] hover:text-[var(--text-secondary)]"
                                >
                                    <Download className="h-4 w-4 mr-2" /> Descargar ejemplo Excel
                                </Button>
                            </div>
                        )}

                        {/* Caja de ayuda contextual según formato seleccionado */}
                        <div className="rounded-lg border border-[var(--border-main)] bg-[var(--bg-main)]/20 p-3.5">
                            <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
                                {FORMAT_HELP[format]}
                            </p>
                        </div>

                        {loading && (
                            <p className="text-sm text-[var(--text-secondary)] text-center">Leyendo archivo…</p>
                        )}

                        {!loading && previewRows.length > 0 && (
                            <div className="border border-[var(--border-main)] rounded-lg overflow-hidden flex flex-col min-h-0">
                                <p className="text-xs font-medium text-[var(--text-secondary)] p-3 border-b border-[var(--border-main)]">
                                    Vista previa ({previewRows.length} filas)
                                </p>
                                <div className="overflow-auto max-h-[200px]">
                                    <table className="w-full text-sm">
                                        <thead className="sticky top-0 bg-[var(--bg-card)] border-b border-[var(--border-main)]">
                                            <tr>
                                                <th className="text-left p-2 text-xs font-medium text-[var(--text-secondary)]">Código</th>
                                                <th className="text-left p-2 text-xs font-medium text-[var(--text-secondary)]">Nombre</th>
                                                <th className="text-left p-2 text-xs font-medium text-[var(--text-secondary)]">Categoría</th>
                                                <th className="text-left p-2 text-xs font-medium text-[var(--text-secondary)]">Unidad</th>
                                                <th className="text-right p-2 text-xs font-medium text-[var(--text-secondary)]">Precio</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {previewRows.slice(0, 50).map((r, i) => (
                                                <tr key={i} className="border-b border-[var(--border-main)]/50">
                                                    <td className="p-2 font-mono text-xs text-[var(--text-primary)]">{r.code}</td>
                                                    <td className="p-2 text-[var(--text-primary)]">{r.name}</td>
                                                    <td className="p-2 text-[var(--text-secondary)]">{r.category ?? "—"}</td>
                                                    <td className="p-2 text-[var(--text-secondary)]">{r.unit ?? "—"}</td>
                                                    <td className="p-2 text-right text-[var(--text-primary)]">{r.price}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                    {previewRows.length > 50 && (
                                        <p className="text-xs text-[var(--text-secondary)] p-2">
                                            … y {previewRows.length - 50} filas más
                                        </p>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                <DialogFooter className="p-6 pt-4 border-t border-[var(--border-main)] shrink-0 gap-2">
                    <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                        Cancelar
                    </Button>
                    <Button
                        type="button"
                        disabled={previewRows.length === 0 || importing}
                        onClick={handleImport}
                    >
                        {importing
                            ? "Importando…"
                            : previewRows.length > 0
                                ? `Importar ${previewRows.length} producto${previewRows.length !== 1 ? "s" : ""}`
                                : "Importar productos"}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}
