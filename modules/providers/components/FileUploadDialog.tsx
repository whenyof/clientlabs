"use client"

import { useState, useRef, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { FileText, Upload, X, Smartphone } from "lucide-react"
import { PDFDocument, StandardFonts } from "pdf-lib"
import { toast } from "sonner"

import { useSectorConfig } from "@/hooks/useSectorConfig"
import { ScanWithMobileDialog } from "./ScanWithMobileDialog"

type FileUploadDialogProps = {
    open: boolean
    onOpenChange: (open: boolean) => void
    onSuccess: (data: { name: string, url: string, category: string } | { name: string, url: string, category: string }[]) => void
    providerId: string
    entityType: 'PROVIDER' | 'ORDER' | 'PAYMENT'
    entityId: string
    presetCategory?: "INVOICE" | "ORDER" | "ORDER_SHEET"
}

const ACCEPT = ".pdf,.doc,.docx,.xls,.xlsx,.png,.jpg,.jpeg"
const CATEGORIES = [
    { value: "INVOICE" as const, label: "Factura" },
    { value: "ORDER" as const, label: "Albarán" },
    { value: "ORDER_SHEET" as const, label: "Hoja de pedido" },
    { value: "OTHER" as const, label: "Recibo u otros" },
    { value: "CONTRACT" as const, label: "Contrato" },
]

function formatBytes(bytes: number) {
    if (bytes < 1024) return bytes + " B"
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB"
    return (bytes / (1024 * 1024)).toFixed(1) + " MB"
}

export function FileUploadDialog({
    open,
    onOpenChange,
    onSuccess,
    providerId,
    entityType,
    entityId,
    presetCategory,
}: FileUploadDialogProps) {
    const { labels } = useSectorConfig()
    const [step, setStep] = useState<1 | 2>(1)
    const [loading, setLoading] = useState(false)
    const fileInputRef = useRef<HTMLInputElement>(null)
    const cameraInputRef = useRef<HTMLInputElement>(null)
    const [documentName, setDocumentName] = useState("")
    const [category, setCategory] = useState<"INVOICE" | "ORDER" | "ORDER_SHEET" | "CONTRACT" | "OTHER">(presetCategory || "OTHER")
    const [files, setFiles] = useState<File[]>([])
    const [scanMode, setScanMode] = useState<"none" | "scan">("none")
    const [showScanWithMobile, setShowScanWithMobile] = useState(false)

    useEffect(() => {
        if (open) {
            setStep(1)
            setDocumentName("")
            setCategory(presetCategory || "OTHER")
            setFiles([])
            if (fileInputRef.current) fileInputRef.current.value = ""
            if (cameraInputRef.current) cameraInputRef.current.value = ""
        }
    }, [open, presetCategory])

    const handleStep1Next = () => {
        if (!documentName.trim()) {
            toast.error("El nombre del documento es obligatorio")
            return
        }
        setStep(2)
    }

    const handleAddFiles = (e: React.ChangeEvent<HTMLInputElement>) => {
        const added = Array.from(e.target.files || [])
        if (added.length) setFiles((prev) => {
            const next = [...prev, ...added]
            return next.slice(0, 10) // límite de 10 páginas
        })
        e.target.value = ""
    }

    const handleAddCameraFiles = (e: React.ChangeEvent<HTMLInputElement>) => {
        const added = Array.from(e.target.files || [])
        if (added.length) setFiles((prev) => {
            const next = [...prev, ...added]
            return next.slice(0, 10)
        })
        e.target.value = ""
    }

    const removeFile = (index: number) => {
        setFiles((prev) => prev.filter((_, i) => i !== index))
    }

    const handleSave = async () => {
        if (!documentName.trim()) {
            toast.error("El nombre del documento es obligatorio")
            return
        }
        if (files.length === 0) {
            toast.error("Añade al menos un archivo")
            return
        }
        setLoading(true)
        try {
            if (scanMode === "scan") {
                // V1: generar un PDF multipágina A4 a partir de las imágenes seleccionadas (modo escanear)
                const pdfDoc = await PDFDocument.create()
                const pageWidth = 595.28 // A4 en puntos (72 DPI): 595 x 842
                const pageHeight = 841.89

                for (const file of files) {
                    const imgBytes = new Uint8Array(await file.arrayBuffer())
                    let img
                    if (file.type === "image/png") {
                        img = await pdfDoc.embedPng(imgBytes)
                    } else {
                        img = await pdfDoc.embedJpg(imgBytes)
                    }
                    const { width, height } = img.scale(1)
                    const scale = Math.min(pageWidth / width, pageHeight / height)
                    const scaledWidth = width * scale
                    const scaledHeight = height * scale
                    const page = pdfDoc.addPage([pageWidth, pageHeight])
                    const x = (pageWidth - scaledWidth) / 2
                    const y = (pageHeight - scaledHeight) / 2
                    page.drawImage(img, { x, y, width: scaledWidth, height: scaledHeight })
                }

                const pdfBytes = await pdfDoc.save()
                const pdfBlob = new Blob([pdfBytes.buffer as ArrayBuffer], { type: "application/pdf" })
                const fd = new FormData()
                fd.set("file", pdfBlob, `${documentName.trim() || "documento"}.pdf`)
                const res = await fetch("/api/providers/upload", { method: "POST", body: fd })
                if (!res.ok) {
                    const data = await res.json().catch(() => ({}))
                    toast.error(data.error || "Error al subir el PDF escaneado")
                    setLoading(false)
                    return
                }
                const data = await res.json()
                onSuccess({
                    name: documentName.trim(),
                    url: data.url,
                    category,
                })
                toast.success("Documento escaneado subido correctamente")
                onOpenChange(false)
            } else {
                // Flujo existente: subir archivos tal cual
                const results: { name: string, url: string, category: string }[] = []
                for (const file of files) {
                    const fd = new FormData()
                    fd.set("file", file)
                    const res = await fetch("/api/providers/upload", { method: "POST", body: fd })
                    if (!res.ok) {
                        const data = await res.json().catch(() => ({}))
                        toast.error(data.error || `Error al subir ${file.name}`)
                        setLoading(false)
                        return
                    }
                    const data = await res.json()
                    results.push({
                        name: documentName.trim(),
                        url: data.url,
                        category,
                    })
                }
                onSuccess(results.length === 1 ? results[0] : results)
                toast.success(results.length === 1 ? "Documento subido correctamente" : `${results.length} archivos subidos correctamente`)
                onOpenChange(false)
            }
        } catch (err) {
            toast.error("Error al subir los archivos")
        } finally {
            setLoading(false)
        }
    }

    const contextLabel = entityType === 'ORDER' ? labels.orders.singular.toLowerCase() : entityType === 'PAYMENT' ? 'pago' : labels.providers.singular.toLowerCase()
    const title = entityType === 'ORDER' ? "Documento del pedido" : entityType === 'PAYMENT' ? "Justificante de pago" : `Archivo del ${contextLabel}`

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-lg bg-[var(--bg-card)] border-[var(--border-main)]">
                <DialogHeader>
                    <DialogTitle className="text-[var(--text-primary)] text-base sm:text-lg">{title}</DialogTitle>
                    <p className="text-xs text-[var(--text-secondary)]">
                        {step === 1
                            ? "Introduce el nombre o número del documento."
                            : "Elige cómo añadir el documento y revisa los archivos seleccionados antes de guardar."}
                    </p>
                </DialogHeader>

                <input
                    ref={fileInputRef}
                    type="file"
                    accept={ACCEPT}
                    multiple
                    className="hidden"
                    onChange={handleAddFiles}
                />
                <input
                    ref={cameraInputRef}
                    type="file"
                    accept="image/*"
                    capture="environment"
                    multiple
                    className="hidden"
                    onChange={handleAddCameraFiles}
                />

                {step === 1 && (
                    <div className="space-y-4">
                        <div className="space-y-2">
                            <Label className="text-xs font-medium text-[var(--text-secondary)]">
                                Nombre o número del documento (obligatorio)
                            </Label>
                            <Input
                                value={documentName}
                                onChange={(e) => setDocumentName(e.target.value)}
                                className="bg-[var(--bg-main)] border-[var(--border-main)] text-[var(--text-primary)] placeholder:text-[var(--text-muted)]"
                                placeholder="Ej: Factura enero 2025, Albarán 123, Pedido 45..."
                                autoFocus
                            />
                        </div>
                        <DialogFooter className="pt-4 border-t border-[var(--border-subtle)]">
                            <Button
                                type="button"
                                variant="ghost"
                                onClick={() => onOpenChange(false)}
                                className="text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
                            >
                                Cancelar
                            </Button>
                            <Button
                                type="button"
                                onClick={handleStep1Next}
                                className="bg-[var(--accent)] text-white hover:opacity-90"
                            >
                                Continuar →
                            </Button>
                        </DialogFooter>
                    </div>
                )}

                {step === 2 && (
                    <div className="space-y-4">
                        <div className="rounded-lg bg-[var(--bg-main)] border border-[var(--border-subtle)] p-3 flex items-center justify-between gap-3">
                            <div>
                                <p className="text-xs text-[var(--text-secondary)]">
                                    Documento
                                </p>
                                <p className="text-sm font-medium text-[var(--text-primary)] truncate">
                                    {documentName || "—"}
                                </p>
                            </div>
                            <div className="shrink-0">
                                <span className="inline-flex items-center rounded-full border border-[var(--border-main)] px-2 py-0.5 text-[10px] font-medium text-[var(--text-secondary)] bg-[var(--bg-main)]/60">
                                    {presetCategory
                                        ? CATEGORIES.find((c) => c.value === presetCategory)?.label ?? "Documento"
                                        : CATEGORIES.find((c) => c.value === category)?.label ?? "Documento"}
                                </span>
                            </div>
                        </div>

                        {!presetCategory && (
                            <div className="space-y-2">
                                <Label className="text-xs font-medium text-[var(--text-secondary)]">
                                    Tipo de documento
                                </Label>
                                <div className="flex flex-wrap gap-2">
                                    {CATEGORIES.map(({ value, label }) => (
                                        <Button
                                            key={value}
                                            type="button"
                                            variant={category === value ? "default" : "outline"}
                                            size="sm"
                                            className={
                                                category === value
                                                    ? "bg-[var(--accent)] text-white"
                                                    : "border-[var(--border-main)] text-[var(--text-secondary)] hover:bg-[var(--bg-main)]"
                                            }
                                            onClick={() => setCategory(value)}
                                        >
                                            {label}
                                        </Button>
                                    ))}
                                </div>
                            </div>
                        )}

                        <div className="space-y-2">
                            <Label className="text-xs font-medium text-[var(--text-secondary)]">
                                ¿Cómo quieres añadir el documento?
                            </Label>
                            <div className="flex flex-wrap gap-2">
                                <Button
                                    type="button"
                                    variant="outline"
                                    className="border-[var(--border-main)] text-[var(--text-secondary)] hover:bg-[var(--bg-main)] text-[11px]"
                                    onClick={() => {
                                        setScanMode("none")
                                        fileInputRef.current?.click()
                                    }}
                                >
                                    <Upload className="h-3.5 w-3.5 mr-1.5" /> Importar archivo
                                </Button>
                                <Button
                                    type="button"
                                    variant="outline"
                                    className="border-[var(--border-main)] text-[var(--text-secondary)] hover:bg-[var(--bg-main)] text-[11px]"
                                    onClick={() => {
                                        setScanMode("scan")
                                        cameraInputRef.current?.click()
                                    }}
                                >
                                    <FileText className="h-3.5 w-3.5 mr-1.5" /> Escanear documento
                                </Button>
                                <Button
                                    type="button"
                                    variant="outline"
                                    className="border-[var(--border-main)] text-[var(--text-secondary)] hover:bg-[var(--bg-main)] text-[11px]"
                                    disabled={!documentName.trim()}
                                    onClick={() => {
                                        if (!documentName.trim()) return
                                        setShowScanWithMobile(true)
                                    }}
                                >
                                    <Smartphone className="h-3.5 w-3.5 mr-1.5" /> Escanear con el móvil
                                </Button>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label className="text-xs font-medium text-[var(--text-secondary)]">
                                Archivos seleccionados
                            </Label>
                            {files.length > 0 ? (
                                <ul className="space-y-2 max-h-48 overflow-y-auto rounded-lg border border-[var(--border-main)] bg-[var(--bg-main)]/60 p-2">
                                    {files.map((file, index) => (
                                        <li
                                            key={index}
                                            className="flex items-center gap-2 rounded px-2 py-1.5 bg-[var(--bg-card)] border border-[var(--border-subtle)]"
                                        >
                                            <FileText className="h-4 w-4 text-[var(--accent)] shrink-0" />
                                            <span className="text-sm text-[var(--text-primary)] truncate flex-1 min-w-0">
                                                {file.name}
                                            </span>
                                            <span className="text-xs text-[var(--text-secondary)] shrink-0">
                                                {formatBytes(file.size)}
                                            </span>
                                            <Button
                                                type="button"
                                                variant="ghost"
                                                size="sm"
                                                className="h-7 w-7 p-0 text-[var(--text-secondary)] hover:text-red-500 hover:bg-red-500/10 shrink-0"
                                                onClick={() => removeFile(index)}
                                                aria-label="Quitar archivo"
                                            >
                                                <X className="h-3.5 w-3.5" />
                                            </Button>
                                        </li>
                                    ))}
                                </ul>
                            ) : (
                                <p className="text-sm text-[var(--text-muted)]">
                                    Aún no hay archivos. Usa “Importar archivo” o “Escanear documento” para añadirlos.
                                </p>
                            )}
                        </div>

                        <DialogFooter className="pt-4 border-t border-[var(--border-subtle)]">
                            <Button
                                type="button"
                                variant="ghost"
                                onClick={() => setStep(1)}
                                className="text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
                            >
                                ← Atrás
                            </Button>
                            <Button
                                type="button"
                                onClick={handleSave}
                                disabled={loading || files.length === 0}
                                className="bg-[var(--accent)] hover:opacity-90 text-white"
                            >
                                {loading ? labels.common.loading : "Guardar documento"}
                            </Button>
                        </DialogFooter>
                    </div>
                )}
            </DialogContent>
            <ScanWithMobileDialog
                open={showScanWithMobile}
                onOpenChange={setShowScanWithMobile}
                entityType={entityType}
                entityId={entityId}
                category={category}
                documentName={documentName || ""}
                onCompleted={({ fileUrl }) => {
                    onSuccess({
                        name: documentName.trim() || "Documento escaneado",
                        url: fileUrl,
                        category,
                    })
                    setShowScanWithMobile(false)
                    onOpenChange(false)
                }}
            />
        </Dialog>
    )
}
