"use client"

import React, { useState } from "react"
import {
    ArrowLeft, CheckCircle2, Copy,
    ShieldCheck, XCircle, Loader2, RefreshCw,
    Code2, FileCode, ShoppingBag, Tag, Paintbrush, Blocks,
    Layers, Info, type LucideIcon
} from "lucide-react"
import Link from "next/link"
import { toast } from "sonner"
import { cn } from "@/lib/utils"
import { getClientlabsSnippet } from "@/lib/clientlabs-loader"
import { DomainCard } from "@/components/connect/DomainCard"
import { ConnectStatus } from "@/components/connect/ConnectStatusCard"

interface Integration {
    id: string
    type: string | null
    provider: string
    status: string
    config: unknown
    health: string | null
    lastSync: Date | null
}

interface ConnectViewProps {
    coreStatus: ConnectStatus
    initialDomain?: string | null
    lastUsed?: Date | null
    rawKeyHint?: string | null
    integrations: Integration[]
}

interface ProviderMeta {
    icon: LucideIcon
    iconColor: string
    iconBg: string
    description: string
}

const PROVIDER_META: Record<string, ProviderMeta> = {
    web_sdk:   { icon: Code2,       iconColor: "text-[#1FA97A]",  iconBg: "bg-[#1FA97A]/10", description: "Librería JS 2 kb. Compatible con HTML, React, Next.js, Astro y cualquier stack web." },
    wordpress: { icon: FileCode,    iconColor: "text-sky-600",    iconBg: "bg-sky-50",        description: "Plugin oficial con soporte nativo para Elementor y Contact Form 7." },
    shopify:   { icon: ShoppingBag, iconColor: "text-lime-600",   iconBg: "bg-lime-50",       description: "WebPixels integrados: Add to Cart, Checkout Initiate y Purchase." },
    gtm:       { icon: Tag,         iconColor: "text-orange-500", iconBg: "bg-orange-50",     description: "Plantilla oficial para GTM DataLayer. Sin tocar código del sitio." },
    wix:       { icon: Paintbrush,  iconColor: "text-violet-600", iconBg: "bg-violet-50",     description: "Inyección vía Wix Custom Code o Velo. Compatible con Wix Stores." },
    webflow:   { icon: Blocks,      iconColor: "text-indigo-600", iconBg: "bg-indigo-50",     description: "Script en Footer Code + Webflow Forms out-of-the-box." },
}

const PROVIDER_LABELS: Record<string, string> = {
    web_sdk: "SDK Universal", wordpress: "WordPress", shopify: "Shopify",
    gtm: "Google Tag Manager", wix: "Wix", webflow: "Webflow",
}

export function ConnectView({ coreStatus, initialDomain, lastUsed, rawKeyHint, integrations }: ConnectViewProps) {
    const [status, setStatus] = useState<ConnectStatus>(coreStatus)
    const [domain, setDomain] = useState<string | null>(initialDomain || null)
    const [snippetCopied, setSnippetCopied] = useState(false)
    const [localIntegrations, setLocalIntegrations] = useState<Integration[]>(integrations)
    const [actionLoading, setActionLoading] = useState<string | null>(null)
    const [activeModal, setActiveModal] = useState<string | null>(null)

    // Verification state — keyed by provider
    const [verifiedProviders, setVerifiedProviders] = useState<string[]>([])
    const [verifyingProvider, setVerifyingProvider] = useState<string | null>(null)
    const [failedProviders, setFailedProviders] = useState<string[]>([])
    const [verifyCounts, setVerifyCounts] = useState<Record<string, number>>({})

    const handleDomainSuccess = (newDomain: string, _rawKey: string) => {
        setDomain(newDomain)
        if (status === "setup_required") setStatus("waiting")
    }

    const handleVerifyProvider = async (provider: string) => {
        setVerifyingProvider(provider)
        setFailedProviders(prev => prev.filter(p => p !== provider))
        try {
            const res = await fetch("/api/connect/verify", { method: "POST" })
            const data = await res.json()
            if (res.ok && data.connected) {
                setVerifiedProviders(prev => [...new Set([...prev, provider])])
                setVerifyCounts(prev => ({ ...prev, [provider]: data.eventsCount ?? 0 }))
                setStatus("connected")
                toast.success("Conexión verificada correctamente")
            } else {
                setFailedProviders(prev => [...new Set([...prev, provider])])
            }
        } catch {
            setFailedProviders(prev => [...new Set([...prev, provider])])
        } finally {
            setVerifyingProvider(null)
        }
    }

    const copySnippet = () => {
        navigator.clipboard.writeText(getClientlabsSnippet({ key: rawKeyHint || "YOUR_PUBLIC_KEY" }))
        setSnippetCopied(true)
        setTimeout(() => setSnippetCopied(false), 2000)
        toast.success("Snippet copiado")
    }

    const connectIntegration = async (type: string, provider: string) => {
        setActionLoading(provider)
        try {
            const res = await fetch("/api/integrations/connect", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ type, provider, config: {} })
            })
            const data = await res.json()
            if (res.ok && data.integration) {
                toast.success(`Entorno habilitado para ${PROVIDER_LABELS[provider] ?? provider}`)
                setLocalIntegrations(prev => {
                    const exists = prev.find(i => i.type === type && i.provider === provider)
                    if (exists) return prev.map(i => i.id === exists.id ? data.integration : i)
                    return [...prev, data.integration]
                })
                setActiveModal(provider)
            } else { toast.error(`Error: ${data.error}`) }
        } catch { toast.error(`Error de red al conectar`) }
        finally { setActionLoading(null) }
    }

    const disconnectIntegration = async (type: string, provider: string) => {
        if (!confirm(`¿Estás seguro de desconectar ${PROVIDER_LABELS[provider] ?? provider}?`)) return
        setActionLoading(provider)
        try {
            const res = await fetch("/api/integrations/disconnect", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ type, provider })
            })
            if (res.ok) {
                toast.success(`${PROVIDER_LABELS[provider] ?? provider} desconectado`)
                setLocalIntegrations(prev => prev.map(i =>
                    i.type === type && i.provider === provider ? { ...i, status: "DISCONNECTED" } : i
                ))
                setVerifiedProviders(prev => prev.filter(p => p !== provider))
                setFailedProviders(prev => prev.filter(p => p !== provider))
            } else { toast.error("Error al desconectar") }
        } catch { toast.error("Error de red al desconectar") }
        finally { setActionLoading(null) }
    }

    const renderSnippetBlock = () => {
        const snippetCode = getClientlabsSnippet({ key: rawKeyHint || "YOUR_PUBLIC_KEY" })
        return (
            <div className="relative rounded-xl overflow-hidden bg-[#0B1F2A]">
                <pre className="text-xs text-[#1FA97A] font-mono whitespace-pre-wrap break-all p-5 pr-14 leading-relaxed">
                    {snippetCode}
                </pre>
                <button
                    onClick={copySnippet}
                    className="absolute top-3 right-3 p-2 bg-white/10 hover:bg-white/20 rounded-lg text-white transition-colors"
                    title="Copiar snippet"
                >
                    {snippetCopied
                        ? <CheckCircle2 className="w-4 h-4 text-[#1FA97A]" />
                        : <Copy className="w-4 h-4" />
                    }
                </button>
            </div>
        )
    }

    const renderStep = (num: number, text: React.ReactNode) => (
        <div className="flex items-start gap-3">
            <span className="flex-shrink-0 w-5 h-5 rounded-full bg-slate-100 text-slate-500 text-[10px] font-bold flex items-center justify-center mt-0.5">
                {num}
            </span>
            <p className="text-sm text-slate-600 leading-relaxed">{text}</p>
        </div>
    )

    const renderTip = (text: string) => (
        <div className="flex items-start gap-2.5 p-3.5 rounded-lg bg-slate-50 border border-slate-200">
            <Info className="w-3.5 h-3.5 text-slate-400 flex-shrink-0 mt-0.5" />
            <p className="text-xs text-slate-500 leading-relaxed">{text}</p>
        </div>
    )

    const renderVerifySection = (provider: string) => {
        const isVerifying = verifyingProvider === provider
        const isVerified = verifiedProviders.includes(provider)
        const isFailed = failedProviders.includes(provider)
        const count = verifyCounts[provider] ?? 0

        return (
            <div className="space-y-3 pt-4 border-t border-slate-100">
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide">Verificar conexión</p>
                <p className="text-sm text-slate-600">
                    Detectamos eventos de los últimos 5 minutos para confirmar que los datos están llegando correctamente.
                </p>
                <div className="flex flex-wrap items-center gap-2">
                    {!isVerified && !isVerifying && (
                        <button
                            onClick={() => handleVerifyProvider(provider)}
                            className="flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-white bg-[#1FA97A] hover:bg-[#178f68] rounded-lg transition-colors"
                        >
                            <ShieldCheck className="w-4 h-4" />
                            Verificar conexión
                        </button>
                    )}
                    {isVerifying && (
                        <div className="flex items-center gap-2 px-4 py-2.5 text-sm text-slate-500 bg-slate-50 border border-slate-200 rounded-lg">
                            <Loader2 className="w-4 h-4 animate-spin" />
                            Verificando...
                        </div>
                    )}
                    {isVerified && (
                        <div className="flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-[#1FA97A] bg-[#1FA97A]/8 border border-[#1FA97A]/20 rounded-lg">
                            <CheckCircle2 className="w-4 h-4" />
                            {count} evento{count !== 1 ? "s" : ""} — Conexión activa
                        </div>
                    )}
                    {isFailed && !isVerifying && (
                        <>
                            <div className="flex items-center gap-1.5 px-3 py-2.5 text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg">
                                <XCircle className="w-4 h-4" />
                                Sin eventos en los últimos 5 min
                            </div>
                            <button
                                onClick={() => handleVerifyProvider(provider)}
                                className="flex items-center gap-1.5 px-3 py-2.5 text-sm text-slate-500 border border-slate-200 bg-white hover:bg-slate-50 rounded-lg transition-colors"
                            >
                                <RefreshCw className="w-3.5 h-3.5" />
                                Reintentar
                            </button>
                        </>
                    )}
                </div>
            </div>
        )
    }

    const renderPlatformCard = (providerKey: string) => {
        const meta = PROVIDER_META[providerKey]
        if (!meta) return null
        const Icon = meta.icon
        const intDb = localIntegrations.find(i => i.type === "web" && i.provider === providerKey)
        const isConnected = intDb?.status === "CONNECTED"
        const isVerified = verifiedProviders.includes(providerKey)
        const isLoading = actionLoading === providerKey
        const isBlocked = !domain

        return (
            <div key={providerKey} className={cn(
                "bg-white rounded-xl border p-5 flex flex-col gap-4 transition-all",
                isVerified ? "border-[#1FA97A]/30" : "border-slate-200",
                isBlocked ? "opacity-50 pointer-events-none" : "hover:border-slate-300"
            )}>
                <div className="flex items-start gap-3">
                    <div className={cn("h-9 w-9 flex-shrink-0 rounded-lg flex items-center justify-center", meta.iconBg)}>
                        <Icon className={cn("h-4 w-4", meta.iconColor)} />
                    </div>
                    <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-2">
                            <span className="text-sm font-semibold text-[#0B1F2A]">{PROVIDER_LABELS[providerKey]}</span>
                            {isVerified && (
                                <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-[#1FA97A] bg-[#1FA97A]/10 border border-[#1FA97A]/20 px-2 py-0.5 rounded uppercase">
                                    <span className="w-1.5 h-1.5 rounded-full bg-[#1FA97A]" />
                                    Activo
                                </span>
                            )}
                            {isConnected && !isVerified && (
                                <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-amber-600 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded uppercase">
                                    Pendiente verificación
                                </span>
                            )}
                        </div>
                        <p className="text-xs text-slate-500 mt-0.5 leading-relaxed">{meta.description}</p>
                    </div>
                </div>
                <div className="flex items-center gap-2 pt-1 border-t border-slate-100">
                    {isConnected && (
                        <button
                            onClick={() => setActiveModal(providerKey)}
                            className="flex-1 py-2 text-xs font-medium text-slate-600 border border-slate-200 hover:bg-slate-50 rounded-lg transition-colors"
                        >
                            {isVerified ? "Ver instrucciones" : "Configurar"}
                        </button>
                    )}
                    <button
                        disabled={isLoading || isBlocked}
                        onClick={() => isConnected
                            ? disconnectIntegration("web", providerKey)
                            : connectIntegration("web", providerKey)
                        }
                        className={cn(
                            "flex-1 py-2 text-xs font-medium rounded-lg transition-colors",
                            isConnected ? "border border-red-200 text-red-600 hover:bg-red-50" : "bg-[#1FA97A] text-white hover:bg-[#178f68]",
                            (isLoading || isBlocked) && "opacity-50 cursor-not-allowed"
                        )}
                    >
                        {isLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin mx-auto" /> : isConnected ? "Desconectar" : "Conectar"}
                    </button>
                </div>
            </div>
        )
    }

    const renderModal = () => {
        if (!activeModal) return null
        const onClose = () => setActiveModal(null)

        const modalBox = (title: string, icon: LucideIcon, iconColor: string, iconBg: string, content: React.ReactNode) => {
            const Icon = icon
            return (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
                    <div className="bg-white rounded-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-lg border border-slate-200">
                        <div className="flex items-center gap-3 px-6 py-4 border-b border-slate-100 sticky top-0 bg-white z-10">
                            <div className={cn("p-2 rounded-lg", iconBg)}>
                                <Icon className={cn("w-4 h-4", iconColor)} />
                            </div>
                            <h2 className="text-base font-semibold text-[#0B1F2A] flex-1">{title}</h2>
                            <button onClick={onClose} className="p-1.5 text-slate-400 hover:text-slate-600 transition-colors">
                                <XCircle className="w-4 h-4" />
                            </button>
                        </div>
                        <div className="p-6">{content}</div>
                        <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex justify-end sticky bottom-0">
                            <button onClick={onClose} className="px-5 py-2 text-sm font-medium text-slate-600 bg-white border border-slate-200 hover:bg-slate-50 rounded-lg transition-colors">
                                Cerrar
                            </button>
                        </div>
                    </div>
                </div>
            )
        }

        switch (activeModal) {
            case "web_sdk":
                return modalBox("SDK Universal", Code2, "text-[#1FA97A]", "bg-[#1FA97A]/10", (
                    <div className="space-y-5">
                        <p className="text-sm text-slate-600">
                            Copia el siguiente script y pégalo dentro del <code className="bg-slate-100 px-1.5 py-0.5 rounded text-xs font-mono">&lt;head&gt;</code> de tu HTML, justo antes de <code className="bg-slate-100 px-1.5 py-0.5 rounded text-xs font-mono">&lt;/head&gt;</code>. La carga es asíncrona y no afecta al rendimiento de tu sitio.
                        </p>
                        {renderSnippetBlock()}
                        {renderTip("Compatible con HTML estático, Next.js, React, Astro, Vue, Angular, SvelteKit y cualquier stack web moderno.")}
                        {renderVerifySection("web_sdk")}
                    </div>
                ))

            case "wordpress":
                return modalBox("WordPress", FileCode, "text-sky-600", "bg-sky-50", (
                    <div className="space-y-5">
                        <p className="text-sm text-slate-600">
                            La forma más sencilla es instalar el plugin oficial. Si prefieres hacerlo manualmente, también puedes pegar el script directamente en el tema.
                        </p>

                        <div className="space-y-3">
                            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide">Opción A — Plugin oficial (recomendado)</p>
                            <a
                                href="https://es.wordpress.org/plugins/lead-capture-for-clientlabs/"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center justify-between gap-4 p-4 bg-[#0B1F2A] hover:bg-[#0d2535] rounded-xl transition-colors group"
                            >
                                <div className="flex items-center gap-3">
                                    <div className="h-9 w-9 rounded-lg bg-sky-500/20 flex items-center justify-center flex-shrink-0">
                                        <FileCode className="w-4 h-4 text-sky-400" />
                                    </div>
                                    <div>
                                        <p className="text-sm font-semibold text-white">Lead Capture for ClientLabs</p>
                                        <p className="text-xs text-slate-400">es.wordpress.org/plugins</p>
                                    </div>
                                </div>
                                <ArrowLeft className="w-4 h-4 text-slate-400 rotate-180 group-hover:translate-x-0.5 transition-transform" />
                            </a>
                            <div className="space-y-2">
                                {renderStep(1, "En el panel de WordPress ve a Plugins > Añadir nuevo y busca ClientLabs.")}
                                {renderStep(2, "Haz clic en Instalar ahora y después en Activar.")}
                                {renderStep(3, <>Ve a <strong>Ajustes &gt; ClientLabs</strong> y pega tu Clave Pública SDK.</>)}
                                {renderStep(4, "Guarda los cambios. El tracking se activará automáticamente en todas las páginas.")}
                            </div>
                        </div>

                        <div className="space-y-3">
                            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide">Opción B — Inserción manual en el tema</p>
                            <p className="text-sm text-slate-600">Pega el siguiente código en el archivo <code className="bg-slate-100 px-1 py-0.5 rounded text-xs font-mono">header.php</code> de tu tema, justo antes de <code className="bg-slate-100 px-1 py-0.5 rounded text-xs font-mono">&lt;/head&gt;</code>:</p>
                            {renderSnippetBlock()}
                            <div className="space-y-2">
                                {renderStep(1, "En WordPress ve a Apariencia > Editor de temas.")}
                                {renderStep(2, "En la barra lateral busca y abre el archivo header.php.")}
                                {renderStep(3, "Localiza la línea </head> al final de la sección <head>.")}
                                {renderStep(4, "Pega el código justo antes de esa línea y haz clic en Guardar.")}
                            </div>
                        </div>

                        {renderTip("Si no quieres editar archivos del tema, instala el plugin gratuito WPCode o Insert Headers and Footers — te permite pegar el script sin tocar código del tema.")}
                        {renderVerifySection("wordpress")}
                    </div>
                ))

            case "shopify":
                return modalBox("Shopify", ShoppingBag, "text-lime-600", "bg-lime-50", (
                    <div className="space-y-5">
                        <p className="text-sm text-slate-600">
                            Añade el script al archivo <code className="bg-slate-100 px-1 py-0.5 rounded text-xs font-mono">theme.liquid</code> de tu tema para que se cargue en todas las páginas de la tienda.
                        </p>

                        <div className="space-y-2">
                            {renderStep(1, <>Ve a tu panel de Shopify y haz clic en <strong>Tienda online</strong> en el menú izquierdo.</>)}
                            {renderStep(2, <>Haz clic en <strong>Temas</strong>. Junto a tu tema activo, haz clic en los tres puntos (...) y elige <strong>Editar código</strong>.</>)}
                            {renderStep(3, <>En la barra lateral izquierda, busca la carpeta <strong>Layout</strong> y abre el archivo <strong>theme.liquid</strong>.</>)}
                            {renderStep(4, <>Usa el buscador del editor (Ctrl+F) para encontrar la etiqueta <code className="bg-slate-100 px-1 py-0.5 rounded text-xs font-mono">&lt;/head&gt;</code>.</>)}
                            {renderStep(5, "Pega el siguiente código justo ANTES de esa etiqueta:")}
                        </div>
                        {renderSnippetBlock()}
                        <div className="space-y-2">
                            {renderStep(6, <>Haz clic en <strong>Guardar</strong> en la esquina superior derecha.</>)}
                            {renderStep(7, "Abre cualquier página de tu tienda en una nueva pestaña para verificar que el script se carga correctamente.")}
                        </div>

                        {renderTip("Antes de editar, crea una copia del tema: Temas > Acciones > Duplicar. El script es asíncrono y no afecta al rendimiento de tu tienda.")}
                        {renderVerifySection("shopify")}
                    </div>
                ))

            case "gtm":
                return modalBox("Google Tag Manager", Tag, "text-orange-500", "bg-orange-50", (
                    <div className="space-y-5">
                        <p className="text-sm text-slate-600">
                            Si ya tienes Google Tag Manager instalado en tu web, puedes inyectar el script sin modificar el código fuente — ideal para equipos sin acceso al servidor.
                        </p>

                        <div className="space-y-2">
                            {renderStep(1, <>Accede a <strong>tagmanager.google.com</strong> e inicia sesión con tu cuenta de Google.</>)}
                            {renderStep(2, <>Abre el contenedor de tu sitio web y haz clic en <strong>Añadir una nueva etiqueta</strong>.</>)}
                            {renderStep(3, <>Ponle el nombre <strong>ClientLabs Tracking</strong> para identificarla fácilmente.</>)}
                            {renderStep(4, <>En <strong>Configuración de etiqueta</strong>, elige el tipo <strong>HTML personalizado</strong>.</>)}
                            {renderStep(5, "Pega el siguiente código en el campo HTML:")}
                        </div>
                        {renderSnippetBlock()}
                        <div className="space-y-2">
                            {renderStep(6, <>En <strong>Activación</strong>, selecciona <strong>All Pages (Todas las páginas)</strong> para que se dispare en cada visita.</>)}
                            {renderStep(7, <>Haz clic en <strong>Guardar</strong>. Después, en la pantalla principal, pulsa el botón azul <strong>Publicar</strong> y confirma.</>)}
                            {renderStep(8, "Visita cualquier página de tu sitio para activar el tracking. El botón Verificar conexión debajo confirmará que los datos llegan.")}
                        </div>

                        {renderTip("Con GTM puedes pausar o eliminar el tracking en cualquier momento sin tocar el código fuente de tu web. Recuerda que los cambios en GTM no son activos hasta que publiques el contenedor.")}
                        {renderVerifySection("gtm")}
                    </div>
                ))

            case "wix":
                return modalBox("Wix", Paintbrush, "text-violet-600", "bg-violet-50", (
                    <div className="space-y-5">
                        <p className="text-sm text-slate-600">
                            Añade el script desde el panel de configuración de Wix sin necesidad de editar archivos del tema ni usar Velo.
                        </p>

                        <div className="space-y-2">
                            {renderStep(1, <>Inicia sesión en tu panel de Wix y accede a tu sitio web.</>)}
                            {renderStep(2, <>En el menú izquierdo ve a <strong>Ajustes del sitio</strong> (icono de engranaje).</>)}
                            {renderStep(3, <>Busca y haz clic en la opción <strong>Código personalizado</strong> (Custom Code).</>)}
                            {renderStep(4, <>Pulsa el botón <strong>Añadir código personalizado</strong> (Add Custom Code).</>)}
                            {renderStep(5, "Pega el siguiente código en el campo de texto:")}
                        </div>
                        {renderSnippetBlock()}
                        <div className="space-y-2">
                            {renderStep(6, <>En el campo <strong>Nombre</strong> escribe: <strong>ClientLabs Tracking</strong>.</>)}
                            {renderStep(7, <>En <strong>Añadir código a</strong> selecciona: <strong>Head</strong>.</>)}
                            {renderStep(8, <>En <strong>Páginas</strong> elige: <strong>Todas las páginas</strong>.</>)}
                            {renderStep(9, <>Haz clic en <strong>Aplicar</strong> y publica los cambios de tu sitio.</>)}
                        </div>

                        {renderTip("Si usas Wix Velo (antes Corvid), también puedes añadir el código en masterPage.js dentro de $w.onReady() para mayor control programático.")}
                        {renderVerifySection("wix")}
                    </div>
                ))

            case "webflow":
                return modalBox("Webflow", Blocks, "text-indigo-600", "bg-indigo-50", (
                    <div className="space-y-5">
                        <p className="text-sm text-slate-600">
                            Inyecta el script desde la configuración del proyecto para que aparezca automáticamente en todas las páginas publicadas.
                        </p>

                        <div className="space-y-2">
                            {renderStep(1, <>Abre tu proyecto en el Designer de Webflow.</>)}
                            {renderStep(2, <>Haz clic en el icono de engranaje (configuración) en la barra superior izquierda para abrir <strong>Project Settings</strong>.</>)}
                            {renderStep(3, <>Navega a la pestaña <strong>Custom Code</strong>.</>)}
                            {renderStep(4, <>Busca la sección <strong>Head Code</strong> (código que se inyecta en el &lt;head&gt; de todas las páginas).</>)}
                            {renderStep(5, "Pega el siguiente código en esa sección:")}
                        </div>
                        {renderSnippetBlock()}
                        <div className="space-y-2">
                            {renderStep(6, <>Haz clic en <strong>Save Changes</strong> para guardar la configuración del proyecto.</>)}
                            {renderStep(7, <>Publica tu sitio: haz clic en el botón <strong>Publish</strong> en la esquina superior derecha del Designer.</>)}
                            {renderStep(8, "Visita tu sitio publicado. El tracking comenzará a registrar visitas desde ese momento.")}
                        </div>

                        {renderTip("El código Head Code se aplica a todas las páginas del proyecto. Si necesitas añadirlo solo a una página específica, puedes hacerlo desde Page Settings > Custom Code en el panel de cada página.")}
                        {renderVerifySection("webflow")}
                    </div>
                ))

            default: return null
        }
    }

    return (
        <div className="min-h-screen bg-[#F5F7F9]">
            <div className="max-w-4xl mx-auto p-6 md:p-8 space-y-5">

                {/* Header */}
                <div className="pb-5 border-b border-slate-200">
                    <Link
                        href="/dashboard/connect"
                        className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-[#1FA97A] hover:text-[#178f68] transition-colors mb-3"
                    >
                        <ArrowLeft className="w-3.5 h-3.5" />
                        Canales
                    </Link>
                    <h1 className="text-xl font-semibold text-[#0B1F2A]">Infraestructura Web</h1>
                    <p className="text-sm text-slate-500 mt-1">Configura la capa de captura para tus sitios web y CMS.</p>
                </div>

                {/* Domain Guard */}
                <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
                    <div className="flex items-center gap-3 px-6 py-4 border-b border-slate-100">
                        <div className={cn(
                            "w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0",
                            domain ? "bg-[#1FA97A] text-white" : "bg-[#0B1F2A] text-white"
                        )}>
                            {domain ? <CheckCircle2 className="w-3.5 h-3.5" /> : "1"}
                        </div>
                        <div className="flex-1">
                            <span className="text-sm font-semibold text-[#0B1F2A]">Dominio autorizado</span>
                            {domain && <span className="ml-2 text-xs text-slate-400 font-mono">{domain}</span>}
                        </div>
                        {domain && <span className="text-xs text-[#1FA97A] font-medium">Configurado</span>}
                    </div>
                    <div className="p-6">
                        <p className="text-sm text-slate-500 mb-4">
                            Define el hostname base de tu sitio. El SDK sólo acepta peticiones desde este origen — protección Anti-CORS spoofing integrada.
                        </p>
                        <DomainCard currentDomain={domain} onSuccess={handleDomainSuccess} />
                    </div>
                </div>

                {/* Integration Methods */}
                <div>
                    <h2 className="text-base font-semibold text-[#0B1F2A] mb-1">Métodos de integración</h2>
                    <p className="text-sm text-slate-500 mb-4">
                        Elige cómo instalar el SDK en tu sitio.
                        {!domain && <span className="text-amber-600"> Configura el dominio primero.</span>}
                    </p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
                        {["web_sdk", "wordpress", "shopify", "gtm", "wix", "webflow"].map(p => renderPlatformCard(p))}
                    </div>
                </div>

            </div>

            {renderModal()}
        </div>
    )
}
