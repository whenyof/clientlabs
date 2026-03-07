"use client"

import { useState } from "react"
import { Code, Globe, Layout, FileSpreadsheet, Zap, Bot, Copy, CheckCircle2, X, ChevronRight, MessageCircle, Share2, ArrowLeft } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Modal } from "@/components/ui/Modal"
import { Badge } from "@/components/ui/badge"
import { toast } from "sonner"

type ConnectWebDialogProps = {
    open: boolean
    onOpenChange: (open: boolean) => void
}

export function ConnectWebDialog({ open, onOpenChange }: ConnectWebDialogProps) {
    const [step, setStep] = useState<"root" | "web" | "script" | "whatsapp" | "social" | "integrations">("root")
    const [copied, setCopied] = useState(false)

    const scriptCode = `<!-- ClientLabs Lead Capture Script -->
<script>
 (function() {
 window.ClientLabs = window.ClientLabs || {};
 window.ClientLabs.apiKey = "YOUR_API_KEY";
 
 // Au forms
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

    const handleClose = () => {
        setStep("root")
        onOpenChange(false)
    }

    const connectionMethods = [
        {
            id: "script",
            icon: Code,
            title: "Script Universal",
            description: "Inserta un pequeño script en tu web y captura leads de cualquier formulario",
            status: "active" as const,
            badge: "Recomendado",
            badgeColor: "bg-emerald-50 text-emerald-600 border-emerald-100",
            onClick: () => setStep("script"),
        },
        {
            id: "wordpress",
            icon: Globe,
            title: "WordPress Plugin",
            description: "Conecta tu web WordPress en 2 clics",
            status: "coming" as const,
            badge: "Próximamente",
            badgeColor: "bg-slate-100 text-slate-500 border-slate-200",
        },
        {
            id: "webflow",
            icon: Layout,
            title: "Webflow",
            description: "Captura leads desde formularios de Webflow",
            status: "coming" as const,
            badge: "Próximamente",
            badgeColor: "bg-slate-100 text-slate-500 border-slate-200",
        },
        {
            id: "google-forms",
            icon: FileSpreadsheet,
            title: "Google Forms",
            description: "Importa respuestas automáticamente",
            status: "coming" as const,
            badge: "Próximamente",
            badgeColor: "bg-slate-100 text-slate-500 border-slate-200",
        },
        {
            id: "zapier",
            icon: Zap,
            title: "Zapier / Webhooks",
            description: "Conecta cualquier herramienta vía webhook",
            status: "coming" as const,
            badge: "Próximamente",
            badgeColor: "bg-slate-100 text-slate-500 border-slate-200",
        },
        {
            id: "scraping",
            icon: Bot,
            title: "Scraping Inteligente",
            description: "Extrae leads de páginas públicas automáticamente",
            status: "experimental" as const,
            badge: "Experimental",
            badgeColor: "bg-orange-50 text-orange-600 border-orange-200",
        },
    ]

    const renderRootStep = () => (
        <>
            <div className="sticky top-0 z-20 bg-white border-b border-slate-100 px-10 py-8 space-y-1">
                <div className="flex items-start justify-between">
                    <div>
                        <h2 className="text-2xl font-semibold text-slate-900">
                            Conectar
                        </h2>
                        <p className="text-sm text-slate-500">
                            Elige el canal desde el que quieres captar leads
                        </p>
                    </div>
                </div>
            </div>

            <div className="p-10">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Web Channel */}
                    <button
                        onClick={() => setStep("web")}
                        className="group relative rounded-2xl bg-white p-6 text-left transition-all duration-200 shadow-sm ring-1 ring-slate-200 hover:ring-emerald-400 hover:shadow-md flex items-center justify-between"
                    >
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 flex items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
                                <Globe className="h-6 w-6" />
                            </div>
                            <div>
                                <h3 className="text-base font-semibold text-slate-900 mb-0.5">
                                    Sitio Web
                                </h3>
                                <p className="text-sm text-slate-500">
                                    Formularios, WordPress, Webflow
                                </p>
                            </div>
                        </div>
                        <ChevronRight className="h-5 w-5 text-slate-400 group-hover:text-emerald-500 transition-colors" />
                    </button>

                    {/* WhatsApp Channel */}
                    <button
                        disabled
                        className="group relative rounded-2xl bg-slate-50/50 p-6 text-left transition-all duration-200 shadow-sm ring-1 ring-slate-100 flex items-center justify-between opacity-80 cursor-not-allowed"
                    >
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 flex items-center justify-center rounded-xl bg-slate-100 text-slate-400">
                                <MessageCircle className="h-6 w-6" />
                            </div>
                            <div>
                                <h3 className="text-base font-semibold text-slate-400 mb-0.5">
                                    WhatsApp
                                </h3>
                                <p className="text-sm text-slate-400">
                                    WhatsApp Business API
                                </p>
                            </div>
                        </div>
                        <Badge className="absolute top-4 right-4 bg-slate-100 text-slate-500 border-slate-200 text-[10px] uppercase font-bold tracking-wider">
                            Próximamente
                        </Badge>
                    </button>

                    {/* Social Channel */}
                    <button
                        disabled
                        className="group relative rounded-2xl bg-slate-50/50 p-6 text-left transition-all duration-200 shadow-sm ring-1 ring-slate-100 flex items-center justify-between opacity-80 cursor-not-allowed"
                    >
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 flex items-center justify-center rounded-xl bg-slate-100 text-slate-400">
                                <Share2 className="h-6 w-6" />
                            </div>
                            <div>
                                <h3 className="text-base font-semibold text-slate-400 mb-0.5">
                                    Redes Sociales
                                </h3>
                                <p className="text-sm text-slate-400">
                                    Instagram, Facebook Lead Ads
                                </p>
                            </div>
                        </div>
                        <Badge className="absolute top-4 right-4 bg-slate-100 text-slate-500 border-slate-200 text-[10px] uppercase font-bold tracking-wider">
                            Próximamente
                        </Badge>
                    </button>

                    {/* Integrations Channel */}
                    <button
                        disabled
                        className="group relative rounded-2xl bg-slate-50/50 p-6 text-left transition-all duration-200 shadow-sm ring-1 ring-slate-100 flex items-center justify-between opacity-80 cursor-not-allowed"
                    >
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 flex items-center justify-center rounded-xl bg-slate-100 text-slate-400">
                                <Zap className="h-6 w-6" />
                            </div>
                            <div>
                                <h3 className="text-base font-semibold text-slate-400 mb-0.5">
                                    Integraciones
                                </h3>
                                <p className="text-sm text-slate-400">
                                    Webhooks, Zapier, Make
                                </p>
                            </div>
                        </div>
                        <Badge className="absolute top-4 right-4 bg-slate-100 text-slate-500 border-slate-200 text-[10px] uppercase font-bold tracking-wider">
                            Próximamente
                        </Badge>
                    </button>

                </div>
            </div>
        </>
    )

    const renderWebStep = () => (
        <>
            <div className="sticky top-0 z-20 bg-white px-10 py-8 border-b border-slate-100 space-y-1">
                <button
                    onClick={() => setStep("root")}
                    className="flex items-center gap-2 text-sm text-slate-500 hover:text-slate-900 transition-colors mb-4"
                >
                    <ArrowLeft className="h-4 w-4" /> Volver
                </button>
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 flex items-center justify-center rounded-xl bg-slate-50 text-slate-600">
                        <Globe className="h-5 w-5 text-emerald-600" />
                    </div>
                    <div>
                        <h2 className="text-2xl font-semibold text-slate-900">
                            Conectar Sitio Web
                        </h2>
                        <p className="text-sm text-slate-500 mt-1">
                            Elige tu plataforma para empezar a sincronizar formularios automáticamente
                        </p>
                    </div>
                </div>
            </div>

            <div className="p-10">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {connectionMethods.map((method) => {
                        const Icon = method.icon
                        const isDisabled = method.status !== "active"

                        return (
                            <button
                                key={method.id}
                                onClick={method.onClick}
                                disabled={isDisabled}
                                className={`group relative rounded-2xl p-6 text-left transition-all duration-200 ${isDisabled
                                    ? "ring-1 ring-slate-100 bg-slate-50/50 opacity-80 cursor-not-allowed shadow-none"
                                    : "bg-white ring-1 ring-slate-200 hover:ring-emerald-400 hover:shadow-md cursor-pointer shadow-sm"
                                    }`}
                            >
                                {/* Badge */}
                                <div className="absolute top-4 right-4">
                                    <Badge variant="outline" className={`text-[10px] uppercase tracking-wider font-bold ${method.badgeColor}`}>
                                        {method.badge}
                                    </Badge>
                                </div>

                                {/* Icon */}
                                <div className={`w-12 h-12 flex items-center justify-center rounded-xl mb-4 ${isDisabled
                                    ? "bg-slate-100 text-slate-400"
                                    : "bg-emerald-50 text-emerald-600 group-hover:bg-emerald-100 group-hover:text-emerald-700 transition-colors"
                                    }`}>
                                    <Icon className="h-6 w-6" />
                                </div>

                                {/* Content */}
                                <h3 className={`text-base font-semibold mb-0.5 ${isDisabled ? "text-slate-400" : "text-slate-900"}`}>
                                    {method.title}
                                </h3>
                                <p className={`text-sm ${isDisabled ? "text-slate-400" : "text-slate-500"}`}>
                                    {method.description}
                                </p>
                            </button>
                        )
                    })}
                </div>
            </div>
        </>
    )

    const renderScriptStep = () => (
        <>
            <div className="sticky top-0 z-20 bg-white px-10 py-8 border-b border-slate-100 space-y-1">
                <button
                    onClick={() => setStep("web")}
                    className="flex items-center gap-2 text-sm text-slate-500 hover:text-slate-900 transition-colors mb-4"
                >
                    <ArrowLeft className="h-4 w-4" /> Volver
                </button>
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 flex items-center justify-center rounded-xl bg-slate-50 text-slate-600">
                        <Code className="h-5 w-5 text-emerald-600" />
                    </div>
                    <div>
                        <h2 className="text-2xl font-semibold text-slate-900">
                            Script Universal
                        </h2>
                        <p className="text-sm text-slate-500 mt-1">
                            Añade tus formularios pegando este script en el código de tu web
                        </p>
                    </div>
                </div>
            </div>

            <div className="p-10 space-y-8">
                {/* Instructions */}
                <div className="space-y-3">
                    <h4 className="text-base font-semibold text-slate-900">Instrucciones de instalación:</h4>
                    <ol className="text-sm text-slate-600 space-y-2 list-decimal list-inside bg-slate-50 border border-slate-200 p-6 rounded-2xl">
                        <li>Copia el código que aparece a continuación.</li>
                        <li>Entra al panel de administración de tu página web.</li>
                        <li>Pega el código justo antes de la etiqueta de cierre <code className="bg-slate-200 px-1 py-0.5 rounded text-slate-800 font-mono">&lt;/body&gt;</code>.</li>
                        <li>¡Listo! Los formularios de esta web se sincronizarán automáticamente con ClientLabs.</li>
                    </ol>
                </div>

                {/* Code Block */}
                <div className="relative">
                    <pre className="bg-slate-900 border border-slate-800 rounded-2xl p-6 overflow-x-auto shadow-inner">
                        <code className="text-sm text-emerald-400 font-mono">
                            {scriptCode}
                        </code>
                    </pre>
                    <Button
                        onClick={handleCopyScript}
                        size="sm"
                        className="absolute top-4 right-4 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white rounded-lg shadow-md border border-slate-700 transition-all"
                    >
                        {copied ? (
                            <>
                                <CheckCircle2 className="h-4 w-4 mr-2 text-emerald-400" />
                                Copiado
                            </>
                        ) : (
                            <>
                                <Copy className="h-4 w-4 mr-2" />
                                Copiar Script
                            </>
                        )}
                    </Button>
                </div>

                {/* Info */}
                <div className="p-4 rounded-xl bg-orange-50 border border-orange-200 flex items-start gap-3">
                    <Zap className="h-5 w-5 text-orange-500 flex-shrink-0 mt-0.5" />
                    <div>
                        <h4 className="text-sm font-semibold text-orange-800">API Key requerida (Próximamente)</h4>
                        <p className="text-xs text-orange-700 mt-1 leading-relaxed">
                            Actualmente el script es una vista previa de la arquitectura final. Más adelante deberás reemplazar <code className="font-mono font-bold bg-orange-100 px-1 rounded">YOUR_API_KEY</code> con tu clave real obtenida desde la pestaña Configuración del ecosistema.
                        </p>
                    </div>
                </div>
            </div>
        </>
    )

    return (
        <Modal isOpen={open} onClose={handleClose} width="default">
            {step === "root" && renderRootStep()}
            {step === "web" && renderWebStep()}
            {step === "script" && renderScriptStep()}
            {/* Future steps: whatsapp, social, integrations */}
        </Modal>
    )
}
