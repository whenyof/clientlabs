"use client"

import React, { useState } from "react"
import { ArrowLeft, BookOpen, Code, Globe, Layers, Link as LinkIcon, CheckCircle2, ChevronDown, ChevronUp, Copy, Eye, Play, Sparkles } from "lucide-react"
import Link from "next/link"
import { toast } from "sonner"
import { getClientlabsSnippet } from "@/lib/clientlabs-loader"
import { DomainCard } from "@/components/connect/DomainCard"
import { ConnectStatusCard, ConnectStatus } from "@/components/connect/ConnectStatusCard"

interface Integration {
    id: string
    type: string | null
    provider: string
    status: string
    config: any
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

export function ConnectView({ coreStatus, initialDomain, lastUsed, rawKeyHint, integrations }: ConnectViewProps) {
    const [status, setStatus] = useState<ConnectStatus>(coreStatus)
    const [domain, setDomain] = useState<string | null>(initialDomain || null)

    // Internal API response arrays
    const [localIntegrations, setLocalIntegrations] = useState<Integration[]>(integrations)
    const [actionLoading, setActionLoading] = useState<string | null>(null)
    const [activeModal, setActiveModal] = useState<string | null>(null)

    const handleDomainSuccess = (newDomain: string, newRawKey: string) => {
        setDomain(newDomain)
        if (status === "setup_required") {
            setStatus("waiting")
        }
    }

    const connectIntegration = async (type: string, provider: string, extraConfig: any = {}) => {
        setActionLoading(provider)
        try {
            const res = await fetch('/api/integrations/connect', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ type, provider, config: extraConfig })
            })
            const data = await res.json()
            if (res.ok && data.integration) {
                toast.success(`Habilitado entorno para ${provider}`)
                setLocalIntegrations(prev => {
                    const exists = prev.find(i => i.type === type && i.provider === provider)
                    if (exists) {
                        return prev.map(i => i.id === exists.id ? data.integration : i)
                    }
                    return [...prev, data.integration]
                })
                // Open instructions matching provider
                setActiveModal(provider)
            } else {
                toast.error(`Error: ${data.error}`)
            }
        } catch (e) {
            toast.error(`Error de red al conectar ${provider}`)
        } finally {
            setActionLoading(null)
        }
    }

    const disconnectIntegration = async (type: string, provider: string) => {
        if (!confirm(`¿Estás seguro de desconectar ${provider}?`)) return
        setActionLoading(provider)
        try {
            const res = await fetch('/api/integrations/disconnect', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ type, provider })
            })
            if (res.ok) {
                toast.success(`${provider} desconectado`)
                setLocalIntegrations(prev => prev.map(i => {
                    if (i.type === type && i.provider === provider) {
                        return { ...i, status: 'DISCONNECTED' }
                    }
                    return i
                }))
            } else {
                toast.error(`Error al desconectar`)
            }
        } catch (e) {
            toast.error(`Error de red al desconectar`)
        } finally {
            setActionLoading(null)
        }
    }

    // Modal renders for instructions 
    const renderModal = () => {
        if (!activeModal) return null;

        const onClose = () => setActiveModal(null)

        const modalBox = (title: string, content: React.ReactNode) => (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
                <div className="bg-white rounded-2xl w-full max-w-2xl shadow-xl border border-slate-200 overflow-hidden animate-in zoom-in-95 duration-200">
                    <div className="flex items-center gap-3 px-6 py-4 border-b border-slate-100">
                        <div className="p-2 bg-emerald-50 rounded-lg text-emerald-600">
                            <Layers className="w-5 h-5" />
                        </div>
                        <h2 className="text-xl font-semibold text-[#0B1F2A]">{title}</h2>
                    </div>

                    <div className="p-8">
                        {content}
                    </div>

                    <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex justify-end">
                        <button onClick={onClose} className="px-5 py-2.5 text-sm font-medium text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 rounded-lg transition-colors">
                            Cerrar y continuar
                        </button>
                    </div>
                </div>
            </div>
        )

        // Switch based on Provider
        switch (activeModal) {
            case "web_sdk":
                return modalBox("SDK Universal Tracking", (
                    <div className="space-y-6">
                        <p className="text-sm text-slate-600">Copia el snippet y pégalo en el <code className="bg-slate-200 px-1 rounded">&lt;head&gt;</code> o antes de <code className="bg-slate-200 px-1 rounded">&lt;/body&gt;</code>. Compatible con HTML, Next.js, React, Astro, Shopify, Webflow, WordPress y Google Tag Manager. Puedes llamar <code className="bg-slate-200 px-1 rounded">clientlabs(&quot;track&quot;, &quot;pageview&quot;)</code> desde el primer momento.</p>

                        <div className="bg-slate-900 rounded-xl p-4 relative group">
                            <pre className="text-xs text-blue-300 font-mono whitespace-pre-wrap break-all">
                                {getClientlabsSnippet({ key: rawKeyHint || "YOUR_PUBLIC_KEY" })}
                            </pre>
                            <button
                                onClick={() => {
                                    navigator.clipboard.writeText(getClientlabsSnippet({ key: rawKeyHint || "YOUR_PUBLIC_KEY" }))
                                    toast.success("Copiado al portapapeles")
                                }}
                                className="absolute top-3 right-3 p-2 bg-white/10 hover:bg-white/20 rounded-md text-white transition-colors"
                            >
                                <Copy className="w-4 h-4" />
                            </button>
                        </div>

                        <div className="flex items-center gap-2 p-4 rounded-xl bg-amber-50 text-amber-800 border border-amber-200">
                            <Sparkles className="w-4 h-4 flex-shrink-0" />
                            <p className="text-sm">El Universal Tracking incluye recolector automático de PageViews y UTMs. Las llamadas `track()` custom siguen requiriendo inicialización.</p>
                        </div>
                    </div>
                ))
            case "wordpress":
                return modalBox("WordPress Integration", (
                    <div className="space-y-6">
                        <p className="text-sm text-slate-600">Descarga y activa el Plugin oficial de ClientLabs en tu panel de WordPress. Soporta Elementor y Contact Form 7 out-of-the-box.</p>
                        <div className="flex flex-col items-center justify-center p-8 border-2 border-dashed border-slate-200 rounded-xl bg-slate-50">
                            <ArrowLeft className="w-10 h-10 text-slate-300 mb-3 rotate-[-90deg]" />
                            <a href="#" className="text-sm font-medium text-blue-600 hover:underline">Descargar clientlabs-wp.zip</a>
                        </div>
                        <div className="space-y-2">
                            <p className="text-xs font-semibold uppercase text-slate-400">Instrucciones</p>
                            <ol className="text-sm text-slate-600 space-y-2 list-decimal list-inside">
                                <li>Ve a Plugins {">"} Añadir nuevo en WordPress.</li>
                                <li>Sube el archivo `clientlabs-wp.zip` y actívalo.</li>
                                <li>Ve a Ajustes {">"} ClientLabs y pega tu Clave Pública.</li>
                            </ol>
                        </div>
                    </div>
                ))
            case "shopify":
                return modalBox("Shopify Analytics", (
                    <div className="space-y-6">
                        <p className="text-sm text-slate-600">Captura datos de Add To Cart, Initiate Checkout y Purchases instalando el Customer Events app.</p>

                        <div className="p-5 border border-slate-200 rounded-xl space-y-4">
                            <div className="flex items-center justify-between">
                                <h3 className="text-sm font-semibold">1. Tienda de Aplicaciones</h3>
                                <button className="px-3 py-1.5 text-xs font-medium bg-[#0B1F2A] text-white rounded shadow-sm">Instalar App</button>
                            </div>
                            <p className="text-xs text-slate-500">Haz click para ser redireccionado al marketplace de tu instancia de Shopify.</p>
                        </div>

                        <div className="p-4 bg-emerald-50 border border-emerald-100 rounded-xl text-emerald-700 text-sm flex gap-3">
                            <CheckCircle2 className="w-5 h-5 flex-shrink-0" />
                            <p>Esta integración inyecta el <strong>Adapter Nativo Shopify</strong> que preconfigura automáticamente el tracking de e-commerce sobre los `Web Pixels` de Shopify (compatible con Checkout Extensibility).</p>
                        </div>
                    </div>
                ))
            case "gtm":
                return modalBox("Google Tag Manager", (
                    <div className="space-y-6">
                        <p className="text-sm text-slate-600">Integra de forma centralizada usando nuestra plantilla oficial exportada o usando el Tag Registry.</p>
                        <button className="w-full py-4 border-2 border-dashed border-blue-200 bg-blue-50 text-blue-700 rounded-xl text-sm font-medium hover:bg-blue-100 transition-colors">
                            Descargar Plantilla (.tpl)
                        </button>
                        <p className="text-xs text-slate-500 text-center">Inyecta este Template JSON en la sección "Templates" de tu entorno de GTM y usa tu Public Key para configurarlo.</p>
                    </div>
                ))
            case "wix":
                return modalBox("Wix Velo / Custom Code", (
                    <div className="space-y-6">
                        <p className="text-sm text-slate-600">Instalación manual vía Wix Settings.</p>
                        <ol className="text-sm text-slate-600 space-y-3 p-5 bg-slate-50 border border-slate-200 rounded-xl list-decimal list-inside">
                            <li>Ingresa a tu dashboard de Wix.</li>
                            <li>Ve a <strong>Settings {">"} Custom Code</strong>.</li>
                            <li>Inyecta un nuevo script y pégalo.</li>
                            <li>Asegúrate de marcar "Load Code Once".</li>
                        </ol>
                    </div>
                ))
            case "webflow":
                return modalBox("Webflow Native", (
                    <div className="space-y-6">
                        <p className="text-sm text-slate-600">Instalación en menos de 2 minutos sobre tus Webflow Projects.</p>
                        <ol className="text-sm text-slate-600 space-y-3 p-5 bg-slate-50 border border-slate-200 rounded-xl list-decimal list-inside">
                            <li>Abre tus <strong>Project Settings</strong> de Webflow.</li>
                            <li>Desplázate hacia "Custom Code".</li>
                            <li>En la celda "Footer Code", inyecta el Universal SDK.</li>
                            <li>Pulsa Publish y tu red global será propagada.</li>
                        </ol>
                    </div>
                ))

            default:
                return null;
        }
    }

    const renderCard = (providerKey: string, title: string, description: string, reqDomain: boolean = false) => {
        const intDb = localIntegrations.find(i => i.type === "web" && i.provider === providerKey)
        const isConnected = intDb?.status === 'CONNECTED'
        const isLoading = actionLoading === providerKey

        // Prevent generic connect if no domain exist and a domain is strictly required (for generic SDKs etc)
        const isDomainBlocked = reqDomain && !domain

        return (
            <div className={`bg-white rounded-xl border border-slate-200 p-6 flex flex-col justify-between transition-all duration-300 hover:shadow-sm ${isDomainBlocked ? 'opacity-50 grayscale' : ''}`}>
                <div className="flex items-start gap-4">
                    <div className="h-10 w-10 flex-shrink-0 rounded-lg bg-emerald-50 flex items-center justify-center">
                        <Layers className="h-5 w-5 text-emerald-600" />
                    </div>
                    <div>
                        <h3 className="text-base font-semibold text-[#0B1F2A]">{title}</h3>
                        <p className="text-sm text-slate-500 mt-1 h-[40px] overflow-hidden leading-tight">
                            {description}
                        </p>
                    </div>
                </div>

                <div className="mt-6 flex items-center justify-between">
                    <span className="text-xs font-medium text-slate-400">
                        {isConnected ? <span className="text-emerald-600 -ml-1">● Conectado</span> : "Sin conectar"}
                    </span>

                    <div className="flex items-center gap-2">
                        {isConnected && (
                            <button
                                onClick={() => setActiveModal(providerKey)}
                                className="px-3 py-2 text-xs font-semibold text-slate-600 border border-slate-200 hover:bg-slate-50 rounded-lg transition-colors"
                            >
                                Instrucciones
                            </button>
                        )}
                        <button
                            disabled={isLoading || isDomainBlocked}
                            onClick={() => isConnected ? disconnectIntegration("web", providerKey) : connectIntegration("web", providerKey)}
                            className={`rounded-lg text-sm font-medium px-4 py-2 transition-colors ${isConnected
                                ? 'bg-slate-50 border border-slate-200 text-red-600 hover:bg-red-50 hover:border-red-200'
                                : 'bg-[#1FA97A] text-white hover:bg-[#178f68]'
                                } ${(isLoading || isDomainBlocked) ? 'opacity-50 cursor-not-allowed' : ''}`}
                        >
                            {isLoading ? '...' : isConnected ? 'Desconectar' : 'Conectar'}
                        </button>
                    </div>
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-[#F5F7F9]">
            <div className="max-w-6xl mx-auto p-6 md:p-8 space-y-10">

                {/* Header Institucional */}
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-6 border-b border-slate-200">
                    <div className="space-y-4">
                        <Link
                            href="/dashboard/connect"
                            className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-[#1FA97A] hover:text-[#178f68] transition-colors"
                        >
                            <ArrowLeft className="w-4 h-4" />
                            Regresar a Canales
                        </Link>
                        <div>
                            <h1 className="text-2xl font-semibold text-[#0B1F2A]">Infraestructura Web</h1>
                            <p className="text-sm text-slate-500 mt-1">Configura la capa de transporte y captura para tus sitios web o CMS y lanza integraciones seguras.</p>
                        </div>
                    </div>
                </div>

                {/* Pre-requisite: Configurar un Dominio Autorizado (Domain Guard) */}
                <section className="bg-white rounded-xl border border-slate-200 p-6">
                    <div className="flex flex-col md:flex-row gap-8 items-start md:items-center justify-between">
                        <div className="flex-1">
                            <h3 className="text-base font-semibold text-[#0B1F2A] mb-1">Domain Guard (Requerido)</h3>
                            <p className="text-sm text-slate-500 max-w-2xl">
                                Configura el nombre base de tu dominio. Este sistema implementa un bloqueo criptográfico para que el API sólo pueda ser consumida desde el Frontend si el origen de solicitud coincide con tu dominio (Anti-CORS spoofing).
                            </p>
                        </div>
                        <div className="w-full md:w-96">
                            <DomainCard currentDomain={domain} onSuccess={handleDomainSuccess} />
                        </div>
                    </div>
                </section>

                {/* Main Grid: Implementation Methods */}
                <section>
                    <h2 className="text-lg font-semibold text-[#0B1F2A] mb-4">Web Implementation Methods</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                        {renderCard('web_sdk', 'SDK Universal', 'Librería JS ligera (2kb) que funciona en cualquier entorno web (HTML, React, Vanilla).', true)}
                        {renderCard('wordpress', 'WordPress', 'App Nativa (Plugin) de WordPress. Automatización Contact Form 7, Elementor e inyección nativa.', true)}
                        {renderCard('shopify', 'Shopify', 'WebPixels integrados en el E-Commerce (Add to Cart, Checkout, Purchase).', true)}
                        {renderCard('gtm', 'Google Tag Manager', 'Inyección gestionada desde el hub de GTM DataLayer y Plantilla de Integración Oficial.', true)}
                        {renderCard('wix', 'Wix', 'Tracking sobre Wix Velo e inyecciones Custom Code vía Wix Premium.', true)}
                        {renderCard('webflow', 'Webflow', 'Compatible con Componentes nativos y Webflow Forms de Webflow E-Commerce.', true)}
                    </div>
                </section>

            </div>

            {/* Injected Portal Modals */}
            {renderModal()}
        </div>
    )
}
