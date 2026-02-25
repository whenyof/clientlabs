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
            <DialogContent className="max-w-4xl h-[80vh] bg-[var(--bg-surface)] border-[var(--border-subtle)] p-0 overflow-hidden flex flex-col">
                <DialogHeader className="p-4 border-b border-[var(--border-subtle)] flex flex-row items-center justify-between space-y-0">
                    <div className="flex items-center gap-3">
                        {isImage ? <ImageIcon className="h-5 w-5 text-blue-400" /> : <FileText className="h-5 w-5 text-amber-400" />}
                        <div>
                            <DialogTitle className="text-[var(--text-primary)] text-base truncate max-w-[400px]">
                                {file.name}
                            </DialogTitle>
                            <p className="text-[10px] text-[var(--text-secondary)] uppercase tracking-wider">{file.category}</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <Button
                            variant="ghost"
                            size="sm"
                            asChild
                            className="text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
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
                            className="text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
                        >
                            <X className="h-5 w-5" />
                        </Button>
                    </div>
                </DialogHeader>

                <div className="flex-1 bg-[var(--bg-card)] flex items-center justify-center overflow-auto p-4">
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
                            <div className="h-20 w-20 rounded-2xl bg-[var(--bg-main)] border border-[var(--border-subtle)] flex items-center justify-center mx-auto">
                                <FileText className="h-10 w-10 text-[var(--text-secondary)]" />
                            </div>
                            <p className="text-[var(--text-secondary)] text-sm">Previsualización no disponible para este tipo de archivo</p>
                            <Button className="bg-[var(--bg-surface)] hover:bg-[var(--bg-surface)] text-[var(--text-primary)]" asChild>
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
