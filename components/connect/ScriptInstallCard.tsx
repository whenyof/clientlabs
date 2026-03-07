"use client"

import { useState } from "react"
import { Code2, Copy, Check, Terminal, ChevronDown, ChevronUp, RefreshCw } from "lucide-react"
import { toast } from "sonner"
import { cn } from "@/lib/utils"
import { getClientlabsSnippet } from "@/lib/clientlabs-loader"

interface ScriptInstallCardProps {
    publicKey?: string | null
    domain?: string | null
}

export function ScriptInstallCard({ publicKey, domain }: ScriptInstallCardProps) {
    const [copied, setCopied] = useState(false)
    const [showAdvanced, setShowAdvanced] = useState(false)
    const [debug, setDebug] = useState(false)

    const displayKey = publicKey || "cl_pub_xxxxxxxxxxxxxxxxxxxxxxxxxx"

    const scriptContent = getClientlabsSnippet({ key: displayKey })

    const handleCopy = () => {
        navigator.clipboard.writeText(scriptContent)
        setCopied(true)
        toast.success("Script copiado al portapapeles")
        setTimeout(() => setCopied(false), 2000)
    }

    return (
        <div className="bg-slate-900/50 border border-slate-800 rounded-2xl overflow-hidden h-full flex flex-col">
            <div className="p-6 border-b border-slate-800">
                <div className="flex items-center gap-3 mb-1">
                    <div className="p-2 bg-teal-500/10 rounded-lg">
                        <Code2 className="w-5 h-5 text-teal-400" />
                    </div>
                    <h2 className="text-lg font-semibold text-white">Instalación del Script</h2>
                </div>
                <p className="text-slate-400 text-xs">
                    Copia el snippet con un clic y pégalo en <code className="text-teal-400 font-mono">&lt;head&gt;</code> o antes de <code className="text-teal-400 font-mono">&lt;/body&gt;</code>. Válido para Next.js, React, Astro, Shopify, Webflow, WordPress y GTM.
                </p>
            </div>

            <div className="p-6 space-y-4 flex-1">
                <div className="relative group">
                    <pre className="bg-slate-950 border border-slate-800 rounded-xl p-5 text-[13px] font-mono text-slate-300 leading-relaxed overflow-x-auto shadow-inner min-h-[140px]">
                        {scriptContent}
                    </pre>

                    <button
                        onClick={handleCopy}
                        className={cn(
                            "absolute top-3 right-3 p-2 rounded-lg border transition-all duration-200",
                            copied
                                ? "bg-emerald-500/10 border-emerald-500/50 text-emerald-400"
                                : "bg-slate-900 border-slate-700 text-slate-400 hover:text-white hover:border-slate-500 opacity-0 group-hover:opacity-100 disabled:group-hover:opacity-0"
                        )}
                    >
                        {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                    </button>
                </div>

                <div className="space-y-4">
                    <button
                        onClick={() => setShowAdvanced(!showAdvanced)}
                        className="w-full flex items-center justify-between py-2 text-xs font-medium text-slate-500 hover:text-slate-300 transition-colors"
                    >
                        <div className="flex items-center gap-2">
                            <Terminal className="w-3.5 h-3.5" />
                            Opciones Avanzadas
                        </div>
                        {showAdvanced ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                    </button>

                    {showAdvanced && (
                        <div className="bg-slate-950/50 border border-slate-800/50 rounded-xl p-4 space-y-3 animate-in fade-in slide-in-from-top-2 duration-300">
                            <label className="flex items-center gap-3 cursor-pointer group">
                                <input
                                    type="checkbox"
                                    checked={debug}
                                    onChange={(e) => setDebug(e.target.checked)}
                                    className="w-4 h-4 rounded border-slate-800 bg-slate-900 text-teal-500 focus:ring-teal-500/20"
                                />
                                <div className="flex flex-col">
                                    <span className="text-xs font-semibold text-slate-300 group-hover:text-white transition-colors">Modo Debug</span>
                                    <span className="text-[10px] text-slate-500">Muestra logs detallados en la consola del navegador.</span>
                                </div>
                            </label>

                            <div className="pt-2 border-t border-slate-800/50">
                                <button
                                    className="flex items-center gap-2 text-[10px] font-bold text-rose-500/80 hover:text-rose-500 uppercase tracking-widest transition-colors"
                                    onClick={() => toast.info("Funcionalidad de regeneración disponible en Configuración Avanzada.")}
                                >
                                    <RefreshCw className="w-3 h-3" />
                                    Regenerar Clave Publica
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {!publicKey && (
                <div className="px-6 py-4 bg-amber-500/5 border-t border-slate-800 text-[11px] text-amber-500/80 font-medium leading-tight">
                    Primero debes configurar un dominio autorizado para generar tu clave pública.
                </div>
            )}
        </div>
    )
}
