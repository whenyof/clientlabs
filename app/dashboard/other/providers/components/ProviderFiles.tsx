import { useState, useMemo } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { FileText, Upload, Trash2, Folder, Tag, AlertCircle, Plus, Eye } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { toast } from "sonner"
import { cn } from "@/lib/utils"
import * as VisuallyHidden from "@radix-ui/react-visually-hidden"

interface FileData {
    id: string
    name: string
    url: string
    category: "INVOICE" | "ORDER" | "CONTRACT" | "OTHER"
    group?: string | null
    notes?: string | null
    createdAt: Date | string
    size?: number
}

interface ProviderFilesProps {
    providerId: string
    files: FileData[]
    onCreateFile: (data: any) => Promise<boolean>
    onDeleteFile: (id: string) => Promise<boolean>
}

const CATEGORIES = [
    { id: "INVOICE", label: "Facturas", icon: FileText },
    { id: "ORDER", label: "Pedidos", icon: Tag },
    { id: "CONTRACT", label: "Contratos", icon: FileText },
    { id: "OTHER", label: "Otros", icon: Folder }
]

export function ProviderFiles({ providerId, files, onCreateFile, onDeleteFile }: ProviderFilesProps) {
    const [activeTab, setActiveTab] = useState("INVOICE")
    const [isUploadOpen, setIsUploadOpen] = useState(false)
    const [uploadData, setUploadData] = useState({
        name: "",
        category: "INVOICE",
        group: "",
        notes: "",
        file: null as File | null
    })
    const [loading, setLoading] = useState(false)
    const [previewOpen, setPreviewOpen] = useState(false)
    const [previewFile, setPreviewFile] = useState<FileData | null>(null)

    // Group files
    const groupedFiles = useMemo(() => {
        const filtered = files.filter(f => f.category === activeTab)
        const groups: Record<string, FileData[]> = {}

        filtered.forEach(f => {
            const group = f.group || "Sin grupo"
            if (!groups[group]) groups[group] = []
            groups[group].push(f)
        })

        return groups
    }, [files, activeTab])

    const handleUpload = async () => {
        if (!uploadData.name || !uploadData.file) {
            toast.error("Selecciona un archivo y ponle nombre")
            return
        }

        setLoading(true)
        try {
            // Mock file upload (in real app, upload to S3 here and get URL)
            const mockUrl = URL.createObjectURL(uploadData.file)

            const success = await onCreateFile({
                providerId,
                name: uploadData.name,
                url: mockUrl, // Using blob URL for demo
                category: uploadData.category,
                group: uploadData.group,
                notes: uploadData.notes,
                size: uploadData.file.size,
                type: uploadData.file.type
            })

            if (success) {
                setIsUploadOpen(false)
                setUploadData({ name: "", category: activeTab, group: "", notes: "", file: null })
            }
        } catch (error) {
            console.error(error)
        } finally {
            setLoading(false)
        }
    }

    const formatFileSize = (bytes?: number) => {
        if (!bytes) return "0 B"
        const k = 1024
        const sizes = ["B", "KB", "MB", "GB"]
        const i = Math.floor(Math.log(bytes) / Math.log(k))
        return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + " " + sizes[i]
    }

    return (
        <div className="space-y-6">
            {/* Header / Tabs */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-white/10 pb-4">
                <div className="flex items-center gap-2 overflow-x-auto no-scrollbar w-full sm:w-auto">
                    {CATEGORIES.map(cat => (
                        <button
                            key={cat.id}
                            onClick={() => setActiveTab(cat.id)}
                            className={cn(
                                "flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium transition-all whitespace-nowrap",
                                activeTab === cat.id
                                    ? "bg-white/10 text-white"
                                    : "text-white/40 hover:text-white hover:bg-white/5"
                            )}
                        >
                            <cat.icon className="w-4 h-4" />
                            {cat.label}
                            <Badge variant="secondary" className="ml-1.5 bg-white/5 text-white/40 text-[10px] h-5 px-1.5">
                                {files.filter(f => f.category === cat.id).length}
                            </Badge>
                        </button>
                    ))}
                </div>

                <Button onClick={() => setIsUploadOpen(true)} className="bg-blue-600 hover:bg-blue-700 text-white w-full sm:w-auto">
                    <Upload className="w-4 h-4 mr-2" />
                    Subir archivo
                </Button>
            </div>

            {/* List */}
            <div className="space-y-4 min-h-[300px]">
                {Object.keys(groupedFiles).length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-12 text-white/20">
                        <Folder className="w-12 h-12 mb-3 opacity-20" />
                        <p>No hay archivos en esta categoría</p>
                    </div>
                ) : (
                    Object.entries(groupedFiles).map(([group, groupFiles]) => (
                        <div key={group} className="space-y-2">
                            {group !== "Sin grupo" && (
                                <h4 className="text-xs font-semibold text-white/40 uppercase tracking-wider px-2 flex items-center gap-2">
                                    <Folder className="w-3 h-3" />
                                    {group}
                                </h4>
                            )}
                            <div className="grid grid-cols-1 gap-2">
                                <AnimatePresence initial={false}>
                                    {groupFiles.map(file => (
                                        <motion.div
                                            key={file.id}
                                            initial={{ opacity: 0, y: 10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            exit={{ opacity: 0, height: 0 }}
                                            className="group flex items-center justify-between p-3 rounded-xl bg-white/5 border border-white/10 hover:bg-white/[0.08] transition-colors"
                                        >
                                            <div className="flex items-center gap-3 overflow-hidden">
                                                <div className="w-10 h-10 rounded-lg bg-blue-500/10 flex items-center justify-center flex-shrink-0 text-blue-400">
                                                    <FileText className="w-5 h-5" />
                                                </div>
                                                <div className="min-w-0">
                                                    <h5 className="text-sm font-medium text-white truncate">{file.name}</h5>
                                                    <div className="flex items-center gap-2 text-xs text-white/40">
                                                        <span>{formatFileSize(file.size)}</span>
                                                        <span>•</span>
                                                        <span>{new Date(file.createdAt).toLocaleDateString()}</span>
                                                        {file.notes && (
                                                            <>
                                                                <span>•</span>
                                                                <span className="truncate max-w-[150px] italic">{file.notes}</span>
                                                            </>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    className="text-white/40 hover:text-white"
                                                    onClick={() => {
                                                        setPreviewFile(file)
                                                        setPreviewOpen(true)
                                                    }}
                                                >
                                                    <Eye className="w-4 h-4" />
                                                </Button>
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    className="text-white/40 hover:text-white"
                                                    onClick={() => window.open(file.url, '_blank')}
                                                >
                                                    <Upload className="w-4 h-4 rotate-180" /> {/* Download icon hack */}
                                                </Button>
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    className="text-red-400/40 hover:text-red-400 hover:bg-red-400/10"
                                                    onClick={() => onDeleteFile(file.id)}
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </Button>
                                            </div>
                                        </motion.div>
                                    ))}
                                </AnimatePresence>
                            </div>
                        </div>
                    ))
                )}
            </div>

            {/* Upload Modal */}
            <Dialog open={isUploadOpen} onOpenChange={setIsUploadOpen}>
                <DialogContent className="bg-zinc-900 border-white/10 text-white sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle>Subir Archivo</DialogTitle>
                    </DialogHeader>

                    <div className="space-y-4 py-4">
                        <div className="space-y-2">
                            <Label>Archivo</Label>
                            <Input
                                type="file"
                                className="bg-white/5 border-white/10 text-white file:text-white file:bg-white/10 file:border-0 file:rounded-md"
                                onChange={(e) => {
                                    const file = e.target.files?.[0]
                                    if (file) {
                                        setUploadData(prev => ({
                                            ...prev,
                                            file,
                                            name: file.name // Auto-fill name
                                        }))
                                    }
                                }}
                            />
                        </div>

                        <div className="space-y-2">
                            <Label>Nombre</Label>
                            <Input
                                value={uploadData.name}
                                onChange={(e) => setUploadData(prev => ({ ...prev, name: e.target.value }))}
                                placeholder="Ej: Factura Enero 2024"
                                className="bg-white/5 border-white/10"
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label>Categoría</Label>
                                <Select
                                    value={uploadData.category}
                                    onValueChange={(val) => setUploadData(prev => ({ ...prev, category: val }))}
                                >
                                    <SelectTrigger className="bg-white/5 border-white/10">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent className="bg-zinc-900 border-white/10">
                                        {CATEGORIES.map(cat => (
                                            <SelectItem key={cat.id} value={cat.id}>{cat.label}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="space-y-2">
                                <Label>Grupo (Opcional)</Label>
                                <Input
                                    value={uploadData.group}
                                    onChange={(e) => setUploadData(prev => ({ ...prev, group: e.target.value }))}
                                    placeholder="Ej: Pedido #123"
                                    className="bg-white/5 border-white/10"
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label>Nota (Opcional)</Label>
                            <Textarea
                                value={uploadData.notes}
                                onChange={(e) => setUploadData(prev => ({ ...prev, notes: e.target.value }))}
                                placeholder="Detalles adicionales..."
                                className="bg-white/5 border-white/10 resize-none h-20"
                            />
                        </div>
                    </div>

                    <DialogFooter>
                        <Button variant="ghost" onClick={() => setIsUploadOpen(false)} className="hover:bg-white/10">
                            Cancelar
                        </Button>
                        <Button onClick={handleUpload} disabled={loading} className="bg-blue-600 hover:bg-blue-700 text-white">
                            {loading ? "Subiendo..." : "Subir archivo"}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Preview Dialog */}
            <Dialog open={previewOpen} onOpenChange={setPreviewOpen}>
                <DialogContent className="bg-zinc-900 border-white/10 text-white max-w-4xl w-full h-[80vh] flex flex-col p-0">
                    <VisuallyHidden.Root>
                        <DialogTitle>Vista previa de archivo: {previewFile?.name}</DialogTitle>
                    </VisuallyHidden.Root>
                    <div className="p-4 border-b border-white/10 flex items-center justify-between bg-white/5">
                        <div className="flex items-center gap-2">
                            <FileText className="w-4 h-4 text-blue-400" />
                            <h3 className="font-semibold text-white">{previewFile?.name}</h3>
                        </div>
                        <Button variant="ghost" size="sm" onClick={() => window.open(previewFile?.url, '_blank')}>
                            <Upload className="w-4 h-4 mr-2 rotate-180" /> Descargar
                        </Button>
                    </div>

                    <div className="flex-1 overflow-auto p-4 flex items-center justify-center bg-black/50">
                        {previewFile && (
                            <>
                                {previewFile.name.match(/\.(jpg|jpeg|png|gif|webp)$/i) ? (
                                    <img
                                        src={previewFile.url}
                                        alt={previewFile.name}
                                        className="max-w-full max-h-full object-contain rounded-lg shadow-xl"
                                    />
                                ) : previewFile.name.match(/\.pdf$/i) ? (
                                    <iframe
                                        src={`${previewFile.url}#toolbar=0`}
                                        className="w-full h-full rounded-lg bg-white"
                                        title={previewFile.name}
                                    />
                                ) : (
                                    <div className="text-center py-12">
                                        <div className="w-20 h-20 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-4">
                                            <FileText className="w-8 h-8 text-white/40" />
                                        </div>
                                        <h4 className="text-lg font-medium text-white mb-2">Previsualización no disponible</h4>
                                        <p className="text-white/40 max-w-xs mx-auto mb-6">
                                            Este formato de archivo no se puede previsualizar directamente.
                                        </p>
                                        <Button onClick={() => window.open(previewFile.url, '_blank')}>
                                            Descargar archivo
                                        </Button>
                                    </div>
                                )}
                            </>
                        )}
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    )
}
