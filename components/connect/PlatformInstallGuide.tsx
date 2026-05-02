"use client"

import { useState } from "react"
import {
    Code2, FileCode, ShoppingBag, Tag, Paintbrush,
    Blocks, Copy, CheckCircle2, Info, type LucideIcon
} from "lucide-react"
import { cn } from "@/lib/utils"

interface PlatformInstallGuideProps {
    snippetCode: string
    onCopy: () => void
    copied: boolean
}

interface PlatformDef {
    id: string
    label: string
    icon: LucideIcon
    iconColor: string
}

const PLATFORMS: PlatformDef[] = [
    { id: "html",      label: "HTML / Script",     icon: Code2,       iconColor: "text-[#1FA97A]"  },
    { id: "wordpress", label: "WordPress",          icon: FileCode,    iconColor: "text-sky-600"    },
    { id: "shopify",   label: "Shopify",            icon: ShoppingBag, iconColor: "text-lime-600"   },
    { id: "gtm",       label: "Tag Manager",        icon: Tag,         iconColor: "text-orange-500" },
    { id: "wix",       label: "Wix",                icon: Paintbrush,  iconColor: "text-violet-600" },
    { id: "webflow",   label: "Webflow",            icon: Blocks,      iconColor: "text-indigo-600" },
]

interface Step {
    text: string
    isSnippet?: true
}

interface PlatformConfig {
    intro: string
    steps: Step[]
    tip: string
}

const CONFIGS: Record<string, PlatformConfig> = {
    html: {
        intro: "Pega el script en cualquier web HTML o framework. Carga asíncrona — no afecta al rendimiento.",
        steps: [
            { text: "Copia el siguiente snippet:" },
            { isSnippet: true, text: "" },
            { text: "Pégalo en el <head> de tu HTML, justo antes de </head>." },
        ],
        tip: "Compatible con HTML estático, Next.js, React, Astro, Vue, Angular, SvelteKit y cualquier stack web.",
    },
    wordpress: {
        intro: "Dos opciones: editar el tema directamente o usar un plugin de inyección de código.",
        steps: [
            { text: "Ve a tu panel de WordPress → Apariencia → Editor de temas." },
            { text: "Abre el archivo header.php." },
            { text: "Pega este código justo antes de </head>:" },
            { isSnippet: true, text: "" },
            { text: "Guarda los cambios." },
        ],
        tip: "Alternativa más sencilla: instala el plugin WPCode o Insert Headers and Footers y pega el código en la sección Header sin tocar archivos del tema.",
    },
    shopify: {
        intro: "Añade el script al tema de Shopify para que se cargue en todas las páginas de tu tienda.",
        steps: [
            { text: "Ve a Tienda online → Temas → Acciones → Editar código." },
            { text: "En la barra lateral abre Layout → theme.liquid." },
            { text: "Busca la etiqueta <head> al inicio del archivo y pega el código justo después:" },
            { isSnippet: true, text: "" },
            { text: "Haz clic en Guardar." },
        ],
        tip: "Antes de editar, crea una copia de seguridad: Temas → Acciones → Duplicar. El script se carga de forma async y no afecta al rendimiento de tu tienda.",
    },
    gtm: {
        intro: "Si ya tienes Google Tag Manager instalado en tu web, úsalo para inyectar el script sin modificar código.",
        steps: [
            { text: "Abre tu contenedor en tagmanager.google.com." },
            { text: "Haz clic en Añadir una nueva etiqueta → Tipo: HTML personalizado." },
            { text: "Asigna el nombre ClientLabs Tracking y pega el siguiente código:" },
            { isSnippet: true, text: "" },
            { text: "Activador: All Pages (Todas las páginas)." },
            { text: "Haz clic en Guardar y luego en Publicar." },
        ],
        tip: "Con GTM puedes activar, pausar o desactivar el tracking en cualquier momento sin tocar el código fuente de tu web.",
    },
    wix: {
        intro: "Añade el script desde el panel de ajustes de Wix sin necesidad de editar archivos del tema.",
        steps: [
            { text: "Ve a Ajustes del sitio → Código personalizado (Custom Code)." },
            { text: "Haz clic en Añadir código personalizado." },
            { text: "Pega el siguiente código:" },
            { isSnippet: true, text: "" },
            { text: "Nombre: ClientLabs Tracking — Ubicación: Head — Páginas: Todas las páginas." },
            { text: "Haz clic en Aplicar." },
        ],
        tip: "Si usas Wix Velo (antes Corvid), también puedes añadirlo en masterPage.js dentro de $w.onReady() para mayor control.",
    },
    webflow: {
        intro: "Inyecta el script desde la configuración del proyecto para que aparezca en todas las páginas.",
        steps: [
            { text: "Ve a tu proyecto en Webflow → Project Settings." },
            { text: "Haz clic en la pestaña Custom Code." },
            { text: "En la sección Head Code, pega el siguiente código:" },
            { isSnippet: true, text: "" },
            { text: "Haz clic en Save Changes." },
            { text: "Publica tu sitio para que los cambios surtan efecto." },
        ],
        tip: "El código se aplica automáticamente a todas las páginas del proyecto. También puedes añadirlo por página desde Page Settings → Custom Code.",
    },
}

export function PlatformInstallGuide({ snippetCode, onCopy, copied }: PlatformInstallGuideProps) {
    const [selected, setSelected] = useState("html")
    const config = CONFIGS[selected]

    // Pre-number non-snippet steps
    let num = 0
    const steps = config.steps.map(step => ({
        ...step,
        num: step.isSnippet ? null : ++num,
    }))

    return (
        <div className="space-y-4">
            {/* Scrollable tab bar */}
            <div className="flex gap-1.5 overflow-x-auto pb-1 scrollbar-none">
                {PLATFORMS.map(p => {
                    const Icon = p.icon
                    const isActive = selected === p.id
                    return (
                        <button
                            key={p.id}
                            onClick={() => setSelected(p.id)}
                            className={cn(
                                "flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium whitespace-nowrap transition-colors flex-shrink-0",
                                isActive
                                    ? "bg-[#0B1F2A] text-white"
                                    : "bg-slate-100 text-slate-500 hover:bg-slate-200 hover:text-slate-700"
                            )}
                        >
                            <Icon className={cn("w-3 h-3", isActive ? "text-white" : p.iconColor)} />
                            {p.label}
                        </button>
                    )
                })}
            </div>

            {/* Platform intro */}
            <p className="text-sm text-slate-600">{config.intro}</p>

            {/* Steps */}
            <div className="space-y-2.5">
                {steps.map((step, idx) => {
                    if (step.isSnippet) {
                        return (
                            <div key={idx} className="relative rounded-xl overflow-hidden bg-[#0B1F2A] my-3">
                                <pre className="text-xs text-[#1FA97A] font-mono whitespace-pre-wrap break-all p-5 pr-14 leading-relaxed">
                                    {snippetCode}
                                </pre>
                                <button
                                    onClick={onCopy}
                                    className="absolute top-3 right-3 p-2 bg-white/10 hover:bg-white/20 rounded-lg text-white transition-colors"
                                    title="Copiar snippet"
                                >
                                    {copied
                                        ? <CheckCircle2 className="w-4 h-4 text-[#1FA97A]" />
                                        : <Copy className="w-4 h-4" />
                                    }
                                </button>
                            </div>
                        )
                    }
                    return (
                        <div key={idx} className="flex items-start gap-3">
                            <span className="flex-shrink-0 w-5 h-5 rounded-full bg-slate-100 text-slate-500 text-[10px] font-bold flex items-center justify-center mt-0.5">
                                {step.num}
                            </span>
                            <p className="text-sm text-slate-600 leading-relaxed">{step.text}</p>
                        </div>
                    )
                })}
            </div>

            {/* Tip */}
            <div className="flex items-start gap-2.5 p-3.5 rounded-lg bg-slate-50 border border-slate-200">
                <Info className="w-3.5 h-3.5 text-slate-400 flex-shrink-0 mt-0.5" />
                <p className="text-xs text-slate-500 leading-relaxed">{config.tip}</p>
            </div>
        </div>
    )
}
