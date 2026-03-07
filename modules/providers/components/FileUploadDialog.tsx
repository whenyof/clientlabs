"use client"

import { useState, useRef, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { FileText, Upload, X } from "lucide-react"
import { toast } from "sonner"

import { useSectorConfig } from "@/hooks/useSectorConfig"

type FileUploadDialogProps = {
    open: boolean
    onOpenChange: (open: boolean) => void
    onSuccess: (data: { name: string, url: string, category: string } | { name: string, url: string, category: string }[]) => void
    providerId: string
    entityType: 'PROVIDER' | 'ORDER' | 'PAYMENT'
    entityId: string
    presetCategory?: "INVOICE" | "ORDER"
}

const ACCEPT = ".pdf,.doc,.docx,.xls,.xlsx,.png,.jpg,.jpeg"
const CATEGORIES = [
    { value: "INVOICE" as const, label: "Factura" },
    { value: "ORDER" as const, label: "Albarán" },
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
    const [documentName, setDocumentName] = useState("")
    const [category, setCategory] = useState<"INVOICE" | "ORDER" | "CONTRACT" | "OTHER">(presetCategory || "OTHER")
    const [files, setFiles] = useState<File[]>([])

    useEffect(() => {
        if (open) {
            setStep(1)
            setDocumentName("")
            setCategory(presetCategory || "OTHER")
            setFiles([])
            if (fileInputRef.current) fileInputRef.current.value = ""
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
        if (added.length) setFiles((prev) => [...prev, ...added])
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
            <DialogContent className="bg-zinc-900 border-white/10 max-w-lg">
                <DialogHeader>
                    <DialogTitle className="text-white">{title}</DialogTitle>
                    <p className="text-xs text-zinc-400">
                        {step === 1 ? "Paso 1: Nombre del documento" : "Paso 2: Archivos (vista previa hasta guardar)"}
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

                {step === 1 && (
                    <div className="space-y-4">
                        <div className="space-y-2">
                            <Label className="text-zinc-300">Nombre del documento (obligatorio)</Label>
                            <Input
                                value={documentName}
                                onChange={(e) => setDocumentName(e.target.value)}
                                className="bg-zinc-800 border-zinc-600 text-white placeholder:text-zinc-500"
                                placeholder="Ej: Factura Enero 2025"
                                autoFocus
                            />
                        </div>
                        <DialogFooter className="pt-4 border-t border-white/10">
                            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} className="text-zinc-300 border-zinc-600 hover:bg-zinc-800">
                                Cancelar
                            </Button>
                            <Button type="button" onClick={handleStep1Next} className="bg-blue-600 hover:bg-blue-700 text-white">
                                Continuar
                            </Button>
                        </DialogFooter>
                    </div>
                )}

                {step === 2 && (
                    <div className="space-y-4">
                        <div className="rounded-lg bg-zinc-800/50 border border-zinc-600 p-3">
                            <p className="text-xs text-zinc-400">Documento: <span className="text-white font-medium">{documentName || "—"}</span></p>
                        </div>

                        <div className="space-y-2">
                            <Label className="text-zinc-300">Tipo de documento</Label>
                            <div className="flex flex-wrap gap-2">
                                {CATEGORIES.map(({ value, label }) => (
                                    <Button
                                        key={value}
                                        type="button"
                                        variant={category === value ? "default" : "outline"}
                                        size="sm"
                                        className={category === value ? "bg-blue-600 text-white" : "border-zinc-600 text-zinc-300 hover:bg-zinc-800"}
                                        onClick={() => setCategory(value)}
                                    >
                                        {label}
                                    </Button>
                                ))}
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label className="text-zinc-300">Archivos (preview hasta guardar)</Label>
                            {files.length > 0 ? (
                                <ul className="space-y-2 max-h-48 overflow-y-auto rounded-lg border border-zinc-600 bg-zinc-800/30 p-2">
                                    {files.map((file, index) => (
                                        <li key={index} className="flex items-center gap-2 rounded px-2 py-1.5 bg-zinc-800/50 border border-zinc-600/50">
                                            <FileText className="h-4 w-4 text-blue-400 shrink-0" />
                                            <span className="text-sm text-white truncate flex-1 min-w-0">{file.name}</span>
                                            <span className="text-xs text-zinc-500 shrink-0">{formatBytes(file.size)}</span>
                                            <Button
                                                type="button"
                                                variant="ghost"
                                                size="sm"
                                                className="h-7 w-7 p-0 text-zinc-400 hover:text-red-400 hover:bg-red-500/10 shrink-0"
                                                onClick={() => removeFile(index)}
                                                aria-label="Quitar archivo"
                                            >
                                                <X className="h-3.5 w-3.5" />
                                            </Button>
                                        </li>
                                    ))}
                                </ul>
                            ) : (
                                <p className="text-sm text-zinc-500">Aún no hay archivos. Usa el botón para añadirlos.</p>
                            )}
                            <div className="flex flex-wrap gap-2">
                                <Button
                                    type="button"
                                    variant="outline"
                                    className="border-zinc-600 text-zinc-300 hover:bg-zinc-800"
                                    onClick={() => fileInputRef.current?.click()}
                                >
                                    <Upload className="h-4 w-4 mr-2" /> Subir más archivos
                                </Button>
                            </div>
                        </div>

                        <DialogFooter className="pt-4 border-t border-white/10">
                            <Button type="button" variant="outline" onClick={() => setStep(1)} className="text-zinc-300 border-zinc-600">
                                Atrás
                            </Button>
                            <Button
                                type="button"
                                onClick={handleSave}
                                disabled={loading || files.length === 0}
                                className="bg-green-600 hover:bg-green-700 text-white"
                            >
                                {loading ? labels.common.loading : "Guardar"}
                            </Button>
                        </DialogFooter>
                    </div>
                )}
            </DialogContent>
        </Dialog>
    )
}
