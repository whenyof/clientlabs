"use client"

import { useState } from "react"
import { Link2, Code, Globe, Layout, FileSpreadsheet, Zap, Bot, Copy, CheckCircle2, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
} from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { toast } from "sonner"

type ConnectWebDialogProps = {
    open: boolean
    onClose: () => void
}

export function ConnectWebDialog({ open, onClose }: ConnectWebDialogProps) {
    const [scriptDialog, setScriptDialog] = useState(false)
    const [copied, setCopied] = useState(false)

    const scriptCode = `<!-- ClientLabs Lead Capture Script -->
<script>
  (function() {
    window.ClientLabs = window.ClientLabs || {};
    window.ClientLabs.apiKey = "YOUR_API_KEY";
    
    // Auto-capture forms
    document.addEventListener('submit', function(e) {
      if (e.target.tagName === 'FORM') {
        const formData = new FormData(e.target);
        // Send to ClientLabs API
      }
    });
  })();
</script>`

    const handleCopyScript = () => {
        navigator.clipboard.writeText(scriptCode)
        setCopied(true)
        toast.success("Código copiado al portapapeles")
        setTimeout(() => setCopied(false), 2000)
    }

    const connectionMethods = [
        {
            id: "script",
            icon: Code,
            title: "Script Universal",
            description: "Inserta un pequeño script en tu web y captura leads de cualquier formulario",
            status: "active" as const,
            badge: "Recomendado",
            badgeColor: "bg-green-500/20 border-green-500/30 text-green-400",
            onClick: () => setScriptDialog(true),
        },
        {
            id: "wordpress",
            icon: Globe,
            title: "WordPress Plugin",
            description: "Conecta tu web WordPress en 2 clics",
            status: "coming" as const,
            badge: "Próximamente",
            badgeColor: "bg-yellow-500/20 border-yellow-500/30 text-yellow-400",
        },
        {
            id: "webflow",
            icon: Layout,
            title: "Webflow",
            description: "Captura leads desde formularios de Webflow",
            status: "coming" as const,
            badge: "Próximamente",
            badgeColor: "bg-yellow-500/20 border-yellow-500/30 text-yellow-400",
        },
        {
            id: "google-forms",
            icon: FileSpreadsheet,
            title: "Google Forms",
            description: "Importa respuestas automáticamente",
            status: "coming" as const,
            badge: "Próximamente",
            badgeColor: "bg-yellow-500/20 border-yellow-500/30 text-yellow-400",
        },
        {
            id: "zapier",
            icon: Zap,
            title: "Zapier / Webhooks",
            description: "Conecta cualquier herramienta vía webhook",
            status: "coming" as const,
            badge: "Próximamente",
            badgeColor: "bg-yellow-500/20 border-yellow-500/30 text-yellow-400",
        },
        {
            id: "scraping",
            icon: Bot,
            title: "Scraping Inteligente",
            description: "Extrae leads de páginas públicas",
            status: "experimental" as const,
            badge: "Experimental",
            badgeColor: "bg-red-500/20 border-red-500/30 text-red-400",
        },
    ]

    return (
        <>
            <Dialog open={open} onOpenChange={onClose}>
                <DialogContent className="bg-zinc-900 border-white/10 max-w-4xl">
                    <DialogHeader>
                        <DialogTitle className="text-2xl font-bold text-white flex items-center gap-2">
                            <Link2 className="h-6 w-6 text-blue-400" />
                            Conectar tu web
                        </DialogTitle>
                        <DialogDescription className="text-white/60 text-base">
                            Elige cómo quieres capturar leads automáticamente
                        </DialogDescription>
                    </DialogHeader>

                    {/* Connection Methods Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                        {connectionMethods.map((method) => {
                            const Icon = method.icon
                            const isDisabled = method.status !== "active"

                            return (
                                <button
                                    key={method.id}
                                    onClick={method.onClick}
                                    disabled={isDisabled}
                                    className={`group relative rounded-xl border p-6 text-left transition-all ${isDisabled
                                        ? "border-white/10 bg-white/5 opacity-60 cursor-not-allowed"
                                        : "border-blue-500/30 bg-blue-500/10 hover:bg-blue-500/20 hover:border-blue-500/50 cursor-pointer"
                                        }`}
                                >
                                    {/* Badge */}
                                    <div className="absolute top-4 right-4">
                                        <Badge className={`text-xs ${method.badgeColor}`}>
                                            {method.badge}
                                        </Badge>
                                    </div>

                                    {/* Icon */}
                                    <div className={`p-3 rounded-lg w-fit mb-4 ${isDisabled
                                        ? "bg-white/5 border border-white/10"
                                        : "bg-blue-500/20 border border-blue-500/40"
                                        }`}>
                                        <Icon className={`h-6 w-6 ${isDisabled ? "text-white/40" : "text-blue-400"}`} />
                                    </div>

                                    {/* Content */}
                                    <h3 className="text-lg font-semibold text-white mb-2">
                                        {method.title}
                                    </h3>
                                    <p className="text-sm text-white/60">
                                        {method.description}
                                    </p>
                                </button>
                            )
                        })}
                    </div>

                    {/* Footer Info */}
                    <div className="mt-6 p-4 rounded-lg bg-blue-500/10 border border-blue-500/30">
                        <p className="text-sm text-blue-400">
                            💡 Los leads capturados aparecerán automáticamente en tu panel de Leads con tags de origen
                        </p>
                    </div>
                </DialogContent>
            </Dialog>

            {/* Script Dialog */}
            <Dialog open={scriptDialog} onOpenChange={setScriptDialog}>
                <DialogContent className="bg-zinc-900 border-white/10 max-w-2xl">
                    <DialogHeader>
                        <DialogTitle className="text-xl font-bold text-white flex items-center gap-2">
                            <Code className="h-5 w-5 text-blue-400" />
                            Script Universal
                        </DialogTitle>
                        <DialogDescription className="text-white/60">
                            Compatible con cualquier web (HTML, React, Webflow, WordPress, etc.)
                        </DialogDescription>
                    </DialogHeader>

                    <div className="space-y-4">
                        {/* Instructions */}
                        <div className="space-y-2">
                            <h4 className="text-sm font-semibold text-white">Instrucciones:</h4>
                            <ol className="text-sm text-white/60 space-y-1 list-decimal list-inside">
                                <li>Copia el código de abajo</li>
                                <li>Pégalo antes del cierre del tag &lt;/body&gt; en tu web</li>
                                <li>Los formularios se capturarán automáticamente</li>
                            </ol>
                        </div>

                        {/* Code Block */}
                        <div className="relative">
                            <pre className="bg-black/50 border border-white/10 rounded-lg p-4 overflow-x-auto">
                                <code className="text-sm text-green-400 font-mono">
                                    {scriptCode}
                                </code>
                            </pre>
                            <Button
                                onClick={handleCopyScript}
                                size="sm"
                                className="absolute top-2 right-2 bg-white/10 hover:bg-white/20"
                            >
                                {copied ? (
                                    <>
                                        <CheckCircle2 className="h-4 w-4 mr-1" />
                                        Copiado
                                    </>
                                ) : (
                                    <>
                                        <Copy className="h-4 w-4 mr-1" />
                                        Copiar
                                    </>
                                )}
                            </Button>
                        </div>

                        {/* Info */}
                        <div className="p-3 rounded-lg bg-yellow-500/10 border border-yellow-500/30">
                            <p className="text-xs text-yellow-400">
                                ⚠️ Próximamente: Reemplaza YOUR_API_KEY con tu clave real desde Configuración
                            </p>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>
        </>
    )
}
