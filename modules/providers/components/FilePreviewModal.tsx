"use client"

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { X, Download, ExternalLink, FileText, Image as ImageIcon } from "lucide-react"
import { Button } from "@/components/ui/button"

type FilePreviewModalProps = {
    file: {
        id: string
        name: string
        url: string
        category: string
    } | null
    open: boolean
    onOpenChange: (open: boolean) => void
}

export function FilePreviewModal({ file, open, onOpenChange }: FilePreviewModalProps) {
    if (!file) return null

    const isImage = file.url.match(/\.(jpg|jpeg|png|gif|webp)$/i)
    const isPDF = file.url.match(/\.pdf$/i)

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-4xl h-[80vh] bg-zinc-950 border-white/10 p-0 overflow-hidden flex flex-col">
                <DialogHeader className="p-4 border-b border-white/10 flex flex-row items-center justify-between space-y-0">
                    <div className="flex items-center gap-3">
                        {isImage ? <ImageIcon className="h-5 w-5 text-blue-400" /> : <FileText className="h-5 w-5 text-amber-400" />}
                        <div>
                            <DialogTitle className="text-white text-base truncate max-w-[400px]">
                                {file.name}
                            </DialogTitle>
                            <p className="text-[10px] text-white/40 uppercase tracking-wider">{file.category}</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <Button
                            variant="ghost"
                            size="sm"
                            asChild
                            className="text-zinc-300 hover:text-white hover:bg-white/10"
                        >
                            <a href={file.url} download={file.name}>
                                <Download className="h-4 w-4 mr-2" />
                                Descargar
                            </a>
                        </Button>
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => onOpenChange(false)}
                            className="text-zinc-300 hover:text-white hover:bg-white/10"
                        >
                            <X className="h-5 w-5" />
                        </Button>
                    </div>
                </DialogHeader>

                <div className="flex-1 bg-zinc-900/50 flex items-center justify-center overflow-auto p-4">
                    {isImage && (
                        <img
                            src={file.url}
                            alt={file.name}
                            className="max-w-full max-h-full object-contain rounded-lg shadow-2xl"
                        />
                    )}
                    {isPDF && (
                        <iframe
                            src={`${file.url}#toolbar=0`}
                            className="w-full h-full rounded border-none"
                            title={file.name}
                        />
                    )}
                    {!isImage && !isPDF && (
                        <div className="text-center space-y-4">
                            <div className="h-20 w-20 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center mx-auto">
                                <FileText className="h-10 w-10 text-white/20" />
                            </div>
                            <p className="text-white/40 text-sm">Previsualización no disponible para este tipo de archivo</p>
                            <Button className="bg-white/10 hover:bg-white/20 text-white" asChild>
                                <a href={file.url} target="_blank" rel="noopener noreferrer">
                                    <ExternalLink className="h-4 w-4 mr-2" />
                                    Abrir en nueva pestaña
                                </a>
                            </Button>
                        </div>
                    )}
                </div>
            </DialogContent>
        </Dialog>
    )
}
