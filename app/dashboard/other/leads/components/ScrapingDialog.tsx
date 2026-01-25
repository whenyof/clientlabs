"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
    DialogDescription,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Globe, Loader2, Sparkles } from "lucide-react"
import { toast } from "sonner"

export function ScrapingDialog({ open, onOpenChange }: { open: boolean; onOpenChange: (open: boolean) => void }) {
    const [url, setUrl] = useState("")
    const [analyzing, setAnalyzing] = useState(false)

    const handleAnalyze = () => {
        setAnalyzing(true)
        // Simulate analysis
        setTimeout(() => {
            setAnalyzing(false)
            toast.info("Próximamente disponible", {
                description: "Podrás extraer automáticamente leads de cualquier página web."
            })
        }, 2000)
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="bg-zinc-900 border-white/10 max-w-2xl">
                <DialogHeader>
                    <DialogTitle className="text-white text-xl flex items-center gap-2">
                        <Globe className="h-5 w-5 text-emerald-400" />
                        Scraping por URL
                        <span className="ml-auto px-2 py-1 rounded text-xs bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                            Próximamente
                        </span>
                    </DialogTitle>
                    <DialogDescription className="text-white/60">
                        Extrae leads automáticamente de cualquier página web
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-6 py-4">
                    {/* URL Input */}
                    <div>
                        <Label htmlFor="url" className="text-white/80">URL de la página</Label>
                        <Input
                            id="url"
                            type="url"
                            value={url}
                            onChange={(e) => setUrl(e.target.value)}
                            placeholder="https://example.com/team"
                            className="bg-white/5 border-white/10 text-white placeholder:text-white/40 mt-2"
                            disabled={analyzing}
                        />
                    </div>

                    {/* Preview Card */}
                    <div className="p-6 rounded-lg bg-gradient-to-br from-emerald-500/10 to-cyan-500/10 border border-emerald-500/30">
                        <div className="flex items-start gap-4">
                            <div className="p-3 rounded-lg bg-emerald-500/20">
                                <Sparkles className="h-6 w-6 text-emerald-400" />
                            </div>
                            <div className="flex-1">
                                <h3 className="font-semibold text-white mb-2">Scraping Inteligente</h3>
                                <ul className="space-y-2 text-sm text-white/70">
                                    <li className="flex items-center gap-2">
                                        <span className="h-1.5 w-1.5 rounded-full bg-emerald-400"></span>
                                        Detecta automáticamente emails y teléfonos
                                    </li>
                                    <li className="flex items-center gap-2">
                                        <span className="h-1.5 w-1.5 rounded-full bg-emerald-400"></span>
                                        Extrae nombres y cargos de equipos
                                    </li>
                                    <li className="flex items-center gap-2">
                                        <span className="h-1.5 w-1.5 rounded-full bg-emerald-400"></span>
                                        Clasifica leads por temperatura
                                    </li>
                                    <li className="flex items-center gap-2">
                                        <span className="h-1.5 w-1.5 rounded-full bg-emerald-400"></span>
                                        Preview antes de importar
                                    </li>
                                </ul>
                            </div>
                        </div>
                    </div>

                    {/* Coming Soon Notice */}
                    <div className="p-4 rounded-lg bg-blue-500/10 border border-blue-500/30">
                        <p className="text-sm text-blue-300">
                            💡 <strong>Próximamente automatizado</strong>
                        </p>
                        <p className="text-xs text-white/60 mt-1">
                            Esta funcionalidad se activará en las próximas semanas. Podrás extraer leads de páginas de equipo, directorios, y más.
                        </p>
                    </div>
                </div>

                <DialogFooter>
                    <Button variant="outline" onClick={() => onOpenChange(false)}>
                        Cerrar
                    </Button>
                    <Button
                        onClick={handleAnalyze}
                        disabled={!url.trim() || analyzing}
                        className="bg-emerald-500/20 border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/30"
                    >
                        {analyzing && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        {analyzing ? "Analizando..." : "Analizar Página"}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}
