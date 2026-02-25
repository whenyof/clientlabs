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
 <DialogContent className="bg-zinc-900 border-[var(--border-subtle)] max-w-2xl">
 <DialogHeader>
 <DialogTitle className="text-[var(--text-primary)] text-xl flex items-center gap-2">
 <Globe className="h-5 w-5 text-[var(--accent)]" />
 Scraping por URL
 <span className="ml-auto px-2 py-1 rounded text-xs bg-[var(--accent-soft)] text-[var(--accent)] border border-[var(--accent)]">
 Próximamente
 </span>
 </DialogTitle>
 <DialogDescription className="text-[var(--text-secondary)]">
 Extrae leads automáticamente de cualquier página web
 </DialogDescription>
 </DialogHeader>

 <div className="space-y-6 py-4">
 {/* URL Input */}
 <div>
 <Label htmlFor="url" className="text-[var(--text-secondary)]">URL de la página</Label>
 <Input
 id="url"
 type="url"
 value={url}
 onChange={(e) => setUrl(e.target.value)}
 placeholder="https://example.com/team"
 className="bg-[var(--bg-card)] border-[var(--border-subtle)] text-[var(--text-primary)] placeholder:text-[var(--text-secondary)] mt-2"
 disabled={analyzing}
 />
 </div>

 {/* Preview Card */}
 <div className="p-6 rounded-lg bg-[var(--bg-card)] border border-[var(--accent)]">
 <div className="flex items-start gap-4">
 <div className="p-3 rounded-lg bg-[var(--accent-soft)]">
 <Sparkles className="h-6 w-6 text-[var(--accent)]" />
 </div>
 <div className="flex-1">
 <h3 className="font-semibold text-[var(--text-primary)] mb-2">Scraping Inteligente</h3>
 <ul className="space-y-2 text-sm text-[var(--text-secondary)]">
 <li className="flex items-center gap-2">
 <span className="h-1.5 w-1.5 rounded-full bg-[var(--accent-soft)]"></span>
 Detecta automáticamente emails y teléfonos
 </li>
 <li className="flex items-center gap-2">
 <span className="h-1.5 w-1.5 rounded-full bg-[var(--accent-soft)]"></span>
 Extrae nombres y cargos de equipos
 </li>
 <li className="flex items-center gap-2">
 <span className="h-1.5 w-1.5 rounded-full bg-[var(--accent-soft)]"></span>
 Clasifica leads por temperatura
 </li>
 <li className="flex items-center gap-2">
 <span className="h-1.5 w-1.5 rounded-full bg-[var(--accent-soft)]"></span>
 Preview antes de importar
 </li>
 </ul>
 </div>
 </div>
 </div>

 {/* Coming Soon Notice */}
 <div className="p-4 rounded-lg bg-[var(--bg-card)] border border-blue-500/30">
 <p className="text-sm text-[var(--accent)]">
 💡 <strong>Próximamente automatizado</strong>
 </p>
 <p className="text-xs text-[var(--text-secondary)] mt-1">
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
 className="bg-[var(--accent-soft)] border-[var(--accent)] text-[var(--accent)] hover:bg-[var(--accent-soft)]"
 >
 {analyzing && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
 {analyzing ? "Analizando..." : "Analizar Página"}
 </Button>
 </DialogFooter>
 </DialogContent>
 </Dialog>
 )
}
