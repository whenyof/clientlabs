"use client"
import { getBaseUrl } from "@/lib/api/baseUrl"


import { useState, useEffect, useMemo } from "react"
import { useRouter } from "next/navigation"
import { useSession } from "next-auth/react"
import {
    Code, Globe, Layout, Zap, Copy, CheckCircle2, ArrowLeft, Plus, Loader2, Globe2,
    ShoppingBag, Tags, Monitor, Package, ExternalLink, Activity, UserPlus, MousePointer2,
    MessageCircle, ShoppingCart, Megaphone, Share2, Mail, History, CreditCard, ShieldCheck,
    Check, Sparkles, ChevronRight, Terminal, X, Trash2, Eye, EyeOff
} from "lucide-react"
import { XMarkIcon } from "@heroicons/react/24/outline"
import { Button } from "@/components/ui/button"
import { Modal } from "@/components/ui/Modal"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import { toast } from "sonner"
import { cn } from "@/lib/utils"
import { getClientlabsSnippet } from "@/lib/clientlabs-loader"
import { formatDistanceToNow } from "date-fns"
import { es } from "date-fns/locale"

type PublicApiKey = {
    id: string
    name: string
    domain: string
    createdAt: string
    lastUsed: string | null
    revoked: boolean
    rawKey?: string
    apiKey?: string
    sdkStatus?: "not_installed" | "active" | "inactive"
    lastEventAt?: string | null
}

type WebConnectDialogProps = {
    open: boolean
    onOpenChange: (open: boolean) => void
}

export function WebConnectDialog({ open, onOpenChange }: WebConnectDialogProps) {
    const router = useRouter()
    const { data: session } = useSession()
    const [step, setStep] = useState<"list" | "manage" | "script" | "wordpress">("list")
    const [publicKeys, setPublicKeys] = useState<PublicApiKey[]>([])
    const [integrations, setIntegrations] = useState<any[]>([])
    const [isLoading, setIsLoading] = useState(false)
    const [isLoadingInts, setIsLoadingInts] = useState(false)
    const [isCreating, setIsCreating] = useState(false)
    const [selectedKey, setSelectedKey] = useState<PublicApiKey | null>(null)
    const [copied, setCopied] = useState(false)
    const [isChecking, setIsChecking] = useState(false)
    const [sdkConnected, setSdkConnected] = useState(false)
    const [deletingId, setDeletingId] = useState<string | null>(null)
    const [showKey, setShowKey] = useState(false)

    // Form states
    const [newName, setNewName] = useState("")
    const [newDomain, setNewDomain] = useState("")

    // Feature Toggles (SDK)
    const [features, setFeatures] = useState({
        pageview: true,
        heartbeat: true,
        forms: true,
        email: true,
        cta: true,
        whatsapp: true,
        checkout: true,
        cart: true,
        purchase: true,
        utm: true,
    })

    useEffect(() => {
        if (open) {
            fetchPublicKeys()
            fetchIntegrations()
        }
    }, [open])

    const fetchIntegrations = async () => {
        setIsLoadingInts(true)
        try {
            const res = await fetch(getBaseUrl() + "/api/integrations")
            if (res.ok) {
                const data = await res.json()
                setIntegrations(data.items || [])
            }
        } catch (err) {
            console.error("Failed to fetch integrations", err)
        } finally {
            setIsLoadingInts(false)
        }
    }

    const fetchPublicKeys = async () => {
        setIsLoading(true)
        try {
            const res = await fetch(getBaseUrl() + "/api/settings/public-keys")
            if (res.ok) {
                const data = await res.json()
                setPublicKeys(data)
                return data
            }
        } catch (err) {
            console.error("Failed to fetch public keys", err)
        } finally {
            setIsLoading(false)
        }
        return []
    }

    const handleCreateKey = async () => {
        if (!newName || !newDomain) {
            toast.error("Nombre y dominio requeridos")
            return
        }

        setIsCreating(true)
        try {
            const res = await fetch(getBaseUrl() + "/api/settings/public-keys", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ name: newName, domain: newDomain })
            })

            if (res.ok) {
                const newKey = await res.json()
                setPublicKeys(prev => [newKey, ...prev])
                setNewName("")
                setNewDomain("")
                toast.success("Public Key generada para " + newKey.domain)

                // Mostrar el script inmediatamente con el rawKey
                setSelectedKey(newKey)
                setStep("script")
            } else {
                const error = await res.json()
                toast.error(error.error || "Error al crear llave")
            }
        } catch (err) {
            toast.error("Error de conexión")
        } finally {
            setIsCreating(false)
        }
    }

    const maskKey = (key?: string | null) => {
        if (!key) return ""
        if (key.length <= 14) return key.slice(0, 6) + "••••••••"
        return key.slice(0, 10) + "••••••••" + key.slice(-4)
    }

    const getScriptCode = (key: string | undefined, feat: typeof features) => {
        const k = key ?? ""
        const snippetFeatures: Record<string, boolean> = {
            pageview: feat.pageview,
            forms: feat.forms,
            intent: feat.checkout,
            ecommerce: feat.purchase,
            heartbeat: feat.heartbeat,
            utm: feat.utm,
            email: feat.email,
            cta: feat.cta,
            whatsapp: feat.whatsapp,
            cart: feat.cart,
        }
        return getClientlabsSnippet({ key: k, features: snippetFeatures })
    }

    const scriptCode = useMemo(
        () => getScriptCode(selectedKey?.apiKey ?? selectedKey?.rawKey, features),
        [selectedKey, features]
    )

    const handleCopyScript = (key?: string) => {
        if (!key) {
            toast.error("No hay clave para copiar")
            return
        }
        const code = getScriptCode(key, features)
        navigator.clipboard.writeText(code)
        setCopied(true)
        toast.success("Script copiado correctamente", {
            description: "Pégalo dentro del <head> de tu web"
        })
        setTimeout(() => setCopied(false), 2000)
    }

    const handleDeleteDomain = async (key: PublicApiKey) => {
        if (!confirm("¿Eliminar este dominio?")) return
        setDeletingId(key.id)
        try {
            const res = await fetch(`${getBaseUrl()}/api/settings/public-keys/${key.id}`, { method: "DELETE" })
            if (res.ok) {
                setPublicKeys(prev => prev.filter(k => k.id !== key.id))
                toast.success("Dominio eliminado")
                if (selectedKey?.id === key.id) {
                    setSelectedKey(null)
                    setStep("manage")
                }
            } else {
                const data = await res.json()
                toast.error(data.error || "Error al eliminar")
            }
        } catch {
            toast.error("Error de conexión")
        } finally {
            setDeletingId(null)
        }
    }

    const handleCheckConnection = async () => {
        const keyForCheck = selectedKey?.apiKey ?? selectedKey?.rawKey
        if (!keyForCheck) {
            toast.error("Llave de API no disponible para verificación")
            return
        }

        setIsChecking(true)
        toast.info("Comprobando instalación...", {
            description: `Escaneando ${selectedKey?.domain ?? "dominio"}...`
        })

        try {
            // Wait a bit to simulate scanning feel
            await new Promise(r => setTimeout(r, 1500))

            const res = await fetch(`${getBaseUrl()}/api/v1/sdk/status?key=${encodeURIComponent(keyForCheck)}`)
            if (res.ok) {
                const data = await res.json()
                setSdkConnected(Boolean(data.connected))
                if (data.connected) {
                    toast.success("SDK detectado correctamente", {
                        description: `ClientLabs está recibiendo datos desde ${data.domain}.`
                    })
                } else {
                    toast.error("SDK no detectado todavía", {
                        description: "Asegúrate de haber pegado el script y recargado tu web."
                    })
                }
            } else {
                toast.error("Error al comprobar la conexión.")
            }
        } catch (err) {
            toast.error("No se pudo contactar con el servidor de verificación.")
        } finally {
            setIsChecking(false)
        }
    }

    // Auto-poll SDK status every 5s while the script panel is open
    useEffect(() => {
        if (!open || step !== "script" || !selectedKey?.rawKey) return

        let cancelled = false

        const checkOnce = async () => {
            try {
                const k = selectedKey?.apiKey ?? selectedKey?.rawKey
                if (!k) return
                const res = await fetch(`${getBaseUrl()}/api/v1/sdk/status?key=${encodeURIComponent(k)}`)
                if (!res.ok) return
                const data = await res.json()
                if (cancelled) return
                const connected = Boolean(data.connected)
                // Only toast when connection flips from false -> true
                if (connected && !sdkConnected) {
                    setSdkConnected(true)
                    toast.success("SDK conectado correctamente", {
                        description: `ClientLabs está recibiendo datos desde ${data.domain}.`
                    })
                } else if (!connected && sdkConnected) {
                    setSdkConnected(false)
                }
            } catch {
                // ignore polling errors
            }
        }

        // Initial check + interval
        checkOnce()
        const id = setInterval(checkOnce, 5000)
        return () => {
            cancelled = true
            clearInterval(id)
        }
    }, [open, step, selectedKey?.rawKey, sdkConnected, selectedKey?.domain])

    const handleClose = () => {
        setStep("list")
        setSelectedKey(null)
        onOpenChange(false)
    }

    const webProviders = [
        { provider: "web_sdk", title: "SDK Universal", icon: <Code className="h-5 w-5" />, description: "Librería inteligente para cualquier sitio web." },
        { provider: "wordpress", title: "WordPress", icon: <Globe className="h-5 w-5" />, description: "Plugin oficial para CF7 y Elementor." },
        { provider: "shopify", title: "Shopify", icon: <ShoppingBag className="h-5 w-5" />, description: "Integración nativa para eCommerce." },
        { provider: "gtm", title: "Google Tag Manager", icon: <Tags className="h-5 w-5" />, description: "Plantilla oficial para contenedores GTM." },
        { provider: "wix", title: "Wix", icon: <Monitor className="h-5 w-5" />, description: "Tracking sobre Velo y Custom Code." },
        { provider: "webflow", title: "Webflow", icon: <Layout className="h-5 w-5" />, description: "Inyección nativa en Project Settings." }
    ]

    const handleConnect = async (provider: string) => {
        if (provider === "web_sdk") {
            setStep("manage")
            return
        }
        if (provider === "wordpress") {
            setStep("wordpress")
            return
        }

        setIsLoading(true)
        try {
            const res = await fetch(getBaseUrl() + "/api/integrations/connect", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ type: "web", provider })
            })
            if (res.ok) {
                toast.success(`Conectando con ${provider}...`)
                fetchIntegrations()
            }
        } catch (err) {
            toast.error("Error al iniciar conexión")
        } finally {
            setIsLoading(false)
        }
    }

    const renderListStep = () => (
        <div className="p-8 md:p-10 space-y-6">
            <h2 className="text-xl font-semibold text-[#0B1F2A]">Métodos de instalación</h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {webProviders.map((item) => {
                    const integration = integrations.find(i => i.provider === item.provider)
                    const isConnected = integration?.status === 'CONNECTED'
                    const isError = integration?.status === 'ERROR'
                    const isComingSoon = ["shopify", "gtm", "wix", "webflow"].includes(item.provider)

                    return (
                        <div key={item.provider} className={cn("bg-white border border-slate-200 rounded-xl p-5 transition flex flex-col justify-between", isComingSoon ? "opacity-60 cursor-not-allowed" : "hover:shadow-sm")}>
                            <div className="flex items-start gap-4">
                                <div className="h-10 w-10 flex-shrink-0 rounded-lg bg-emerald-50 flex items-center justify-center text-emerald-600">
                                    {item.icon}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2">
                                        <h3 className="text-base font-semibold text-[#0B1F2A] truncate tracking-tight">{item.title}</h3>
                                        {isConnected && !isComingSoon && (
                                            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                                        )}
                                    </div>
                                    <p className="text-xs text-slate-500 mt-1 line-clamp-2">
                                        {item.description}
                                    </p>
                                </div>
                            </div>

                            <div className="mt-6 flex items-center justify-between">
                                <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
                                    {isComingSoon ? 'Próximamente' : isConnected ? 'Estado: Activo' : isError ? 'Estado: Error' : 'Sin conectar'}
                                </span>
                                {isComingSoon ? (
                                    <span className="text-xs font-medium px-3 py-1 rounded-full bg-slate-100 text-slate-400">
                                        Próximamente
                                    </span>
                                ) : (
                                    <Button
                                        size="sm"
                                        onClick={() => handleConnect(item.provider)}
                                        className={cn(
                                            "h-8 px-4 rounded-lg font-medium transition-all text-xs",
                                            isConnected
                                                ? "bg-white border border-slate-200 text-slate-600 hover:bg-slate-50"
                                                : isError
                                                    ? "bg-amber-100 text-amber-700 hover:bg-amber-200"
                                                    : "bg-[#1FA97A] text-white hover:bg-[#178f68]"
                                        )}
                                    >
                                        {isConnected ? 'Gestionar' : isError ? 'Revisar' : 'Conectar'}
                                    </Button>
                                )}
                            </div>
                        </div>
                    )
                })}
            </div>
        </div>
    )

    const renderManageStep = () => (
        <>
            <div className="sticky top-0 z-20 bg-white px-10 py-8 border-b border-slate-100 space-y-1">
                <button onClick={() => setStep("list")} className="flex items-center gap-2 text-sm text-slate-500 hover:text-slate-900 mb-4 transition-colors">
                    <ArrowLeft className="h-4 w-4" /> Volver
                </button>
                <h2 className="text-2xl font-semibold text-slate-900">Gestionar Dominios</h2>
                <p className="text-sm text-slate-500">Crea una Public Key para cada dominio donde instales el SDK</p>
            </div>

            <div className="p-10 space-y-8">
                {/* Form to create new key */}
                <div className="bg-slate-50/50 p-6 rounded-2xl border border-slate-100 grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="md:col-span-1">
                        <label className="text-xs font-bold text-slate-500 uppercase mb-1 block">Nombre</label>
                        <input
                            value={newName}
                            onChange={e => setNewName(e.target.value)}
                            placeholder="Ej: Tienda Principal"
                            className="w-full px-4 py-2 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-emerald-500 outline-none"
                        />
                    </div>
                    <div className="md:col-span-1">
                        <label className="text-xs font-bold text-slate-500 uppercase mb-1 block">Dominio (Hostname)</label>
                        <input
                            value={newDomain}
                            onChange={e => setNewDomain(e.target.value)}
                            placeholder="ejemplo.com"
                            className="w-full px-4 py-2 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-emerald-500 outline-none"
                        />
                    </div>
                    <div className="flex items-end">
                        <Button
                            onClick={handleCreateKey}
                            disabled={isCreating}
                            className="w-full bg-slate-900 text-white hover:bg-slate-800 h-10 rounded-xl"
                        >
                            {isCreating ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Plus className="h-4 w-4 mr-2" />}
                            Crear Public Key
                        </Button>
                    </div>
                </div>

                {/* List of existing keys */}
                <div className="space-y-3">
                    <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest">Tus Dominios Autorizados</h3>
                    {isLoading ? (
                        <div className="flex justify-center p-8"><Loader2 className="h-8 w-8 animate-spin text-slate-200" /></div>
                    ) : publicKeys.length === 0 ? (
                        <div className="text-center p-12 bg-slate-50 rounded-2xl border border-dashed border-slate-200">
                            <p className="text-sm text-slate-400">Aún no tienes dominios configurados.</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 gap-2">
                            {publicKeys.map(key => (
                                <div key={key.id} className="flex items-center justify-between p-4 bg-white border border-slate-100 rounded-2xl hover:border-emerald-200 transition-all shadow-sm">
                                    <div className="flex items-center gap-4">
                                        <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center text-slate-400">
                                            <Globe2 className="h-5 w-5" />
                                        </div>
                                        <div>
                                            <div className="flex items-center gap-2 flex-wrap">
                                                <p className="text-sm font-bold text-slate-900">{key.name}</p>
                                                <Badge variant="outline" className="text-[9px] bg-slate-50">{key.domain}</Badge>
                                                {key.sdkStatus && (
                                                    <span className={cn(
                                                        "inline-flex items-center gap-1 text-[10px] font-medium",
                                                        key.sdkStatus === "active" && "text-emerald-600",
                                                        key.sdkStatus === "inactive" && "text-amber-600",
                                                        key.sdkStatus === "not_installed" && "text-red-600"
                                                    )}>
                                                        <span className={cn(
                                                            "inline-block w-1.5 h-1.5 rounded-full",
                                                            key.sdkStatus === "active" && "bg-emerald-500",
                                                            key.sdkStatus === "inactive" && "bg-amber-500",
                                                            key.sdkStatus === "not_installed" && "bg-red-500"
                                                        )} />
                                                        {key.sdkStatus === "active" && "Activo"}
                                                        {key.sdkStatus === "inactive" && "Inactivo"}
                                                        {key.sdkStatus === "not_installed" && "No detectado"}
                                                    </span>
                                                )}
                                            </div>
                                            <p className="text-[10px] text-slate-400 mt-0.5">
                                                Creada el {new Date(key.createdAt).toLocaleDateString()}
                                                {key.lastEventAt ? (
                                                    <span className="text-slate-500"> · último evento hace {formatDistanceToNow(new Date(key.lastEventAt), { addSuffix: false, locale: es })}</span>
                                                ) : key.sdkStatus === "not_installed" ? (
                                                    <span className="text-slate-500"> · sin eventos</span>
                                                ) : null}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Button
                                            size="sm"
                                            onClick={() => { setSelectedKey(key); setStep("script"); }}
                                            className="text-xs h-8 rounded-lg px-4 bg-[#1FA97A] text-white hover:bg-[#157A5C] border-0"
                                        >
                                            <Code className="h-3 w-3 mr-2" /> Script
                                        </Button>
                                        <Button
                                            size="sm"
                                            variant="outline"
                                            onClick={() => handleDeleteDomain(key)}
                                            disabled={deletingId === key.id}
                                            className="text-xs h-8 rounded-lg px-4 border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700 hover:border-red-300"
                                        >
                                            {deletingId === key.id ? (
                                                <Loader2 className="h-3 w-3 mr-2 animate-spin" />
                                            ) : (
                                                <Trash2 className="h-3 w-3 mr-2" />
                                            )}
                                            Eliminar
                                        </Button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </>
    )

    const renderScriptStep = () => {
        const FeatureToggle = ({
            label,
            checked,
            onChange,
        }: {
            label: string,
            checked: boolean,
            onChange: (v: boolean) => void,
        }) => (
            <div className="flex items-center justify-between p-2 rounded-lg hover:bg-slate-50 transition-colors">
                <p className="text-sm font-medium text-[#0B1F2A]">{label}</p>
                <Switch checked={checked} onCheckedChange={onChange} />
            </div>
        )

        return (
            <div className="w-full bg-[#F8FAFC] min-h-full pb-6">
                {/* 0. Header */}
                <div className="px-8 py-3 bg-white border-b border-slate-200 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <button
                            onClick={() => setStep("manage")}
                            className="p-2 hover:bg-slate-50 rounded-lg transition-colors border border-slate-100"
                        >
                            <ArrowLeft className="h-4 w-4 text-slate-500" />
                        </button>
                        <h2 className="text-base font-bold text-[#0B1F2A]">Implementación del SDK</h2>
                    </div>
                </div>

                <div className="px-8 py-6">
                    {/* 1. DOCUMENTACIÓN */}
                    <div className="mt-0 mb-6 bg-muted/40 border border-slate-200 rounded-xl px-5 py-3 flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <div className="w-10 h-10 rounded-lg bg-white border border-slate-200 flex items-center justify-center text-slate-400">
                                <Layout className="h-5 w-5" />
                            </div>
                            <div>
                                <h4 className="text-sm font-bold text-[#0B1F2A]">¿Necesitas ayuda instalando ClientLabs?</h4>
                                <p className="text-xs text-slate-500">Consulta nuestra documentación técnica para guías avanzadas.</p>
                            </div>
                        </div>
                        <Button
                            variant="outline"
                            size="sm"
                            className="bg-white border-slate-200 rounded-lg px-4 h-9 text-xs font-bold hover:bg-slate-50 text-slate-700 shadow-sm"
                            onClick={() => window.open("https://docs.clientlabs.app", "_blank")}
                        >
                            Ver documentación técnica
                        </Button>
                    </div>

                    {/* 2. GRID PRINCIPAL */}
                    <div className="grid grid-cols-[360px_minmax(0,1fr)] gap-6 items-start w-full">
                        {/* COLUMNA IZQUIERDA */}
                        <div className="w-[360px] flex flex-col">
                            <h3 className="text-[10px] font-heavy text-slate-400 uppercase tracking-[0.2em] px-1 mb-4">Configuración SDK</h3>
                            <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm flex flex-col">
                                <h4 className="text-sm font-bold text-[#0B1F2A] mb-3">Configuración de tracking</h4>
                                <div className="space-y-2.5">
                                    <FeatureToggle label="Page tracking" checked={features.pageview} onChange={(v) => setFeatures({ ...features, pageview: v })} />
                                    <FeatureToggle label="Session heartbeat" checked={features.heartbeat} onChange={(v) => setFeatures({ ...features, heartbeat: v })} />
                                    <FeatureToggle label="Form capture" checked={features.forms} onChange={(v) => setFeatures({ ...features, forms: v })} />
                                    <FeatureToggle label="Email detection" checked={features.email} onChange={(v) => setFeatures({ ...features, email: v })} />
                                    <FeatureToggle label="CTA clicks" checked={features.cta} onChange={(v) => setFeatures({ ...features, cta: v })} />
                                    <FeatureToggle label="Checkout intent" checked={features.checkout} onChange={(v) => setFeatures({ ...features, checkout: v })} />
                                    <FeatureToggle label="Purchase tracking" checked={features.purchase} onChange={(v) => setFeatures({ ...features, purchase: v })} />
                                    <FeatureToggle label="UTM tracking" checked={features.utm} onChange={(v) => setFeatures({ ...features, utm: v })} />
                                </div>
                            </div>
                        </div>

                        {/* COLUMNA DERECHA */}
                        <div className="min-w-0 w-full flex flex-col">
                            <h3 className="text-[10px] font-heavy text-slate-400 uppercase tracking-[0.2em] px-1 mb-4">Instalación del Script</h3>
                            <div className="bg-white border border-slate-200 rounded-xl p-8 space-y-6 shadow-sm flex flex-col">
                                <div className="space-y-2">
                                    <label className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Public API Key</label>
                                    <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg border border-slate-100">
                                        <span className="text-xs font-mono font-bold text-slate-700">
                                            {!selectedKey?.rawKey
                                                ? "No API key generated"
                                                : showKey
                                                    ? selectedKey.rawKey
                                                    : maskKey(selectedKey.rawKey)}
                                        </span>
                                        <div className="flex items-center gap-2">
                                            {selectedKey?.rawKey && (
                                                <button
                                                    type="button"
                                                    onClick={() => setShowKey(!showKey)}
                                                    className="p-1.5 rounded-lg text-slate-500 hover:text-slate-700 hover:bg-slate-100 transition-colors"
                                                    aria-label={showKey ? "Ocultar clave" : "Mostrar clave"}
                                                >
                                                    {showKey ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                                </button>
                                            )}
                                            <ShieldCheck className="w-4 h-4 text-emerald-500" />
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-4 flex-1">
                                    <div className="flex items-center gap-2 mb-3">
                                        <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                                        <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Active SDK Snippet</span>
                                    </div>

                                    <div className="bg-slate-950 rounded-xl p-5 text-emerald-400 font-mono text-sm w-full max-h-[220px] overflow-y-auto custom-scrollbar">
                                        <pre className="whitespace-pre-wrap select-all">
                                            <code className="block whitespace-pre-wrap break-all text-[13px]">{scriptCode}</code>
                                        </pre>
                                    </div>
                                </div>

                                <div className="flex gap-3 mt-4">
                                    <Button
                                        onClick={() => handleCopyScript(selectedKey?.apiKey ?? selectedKey?.rawKey)}
                                        disabled={!selectedKey?.rawKey}
                                        className={cn(
                                            "flex-1 h-12 rounded-xl text-sm font-bold transition-all shadow-md active:scale-[0.98]",
                                            copied
                                                ? "bg-emerald-500 text-white"
                                                : "bg-[#0B1F2A] text-white hover:bg-slate-800 disabled:opacity-50 disabled:pointer-events-none"
                                        )}
                                    >
                                        {copied ? <><Check className="h-4 w-4 mr-2" /> Copiado</> : <><Copy className="h-4 w-4 mr-2" /> Copiar Script</>}
                                    </Button>

                                    <Button
                                        variant="outline"
                                        onClick={handleCheckConnection}
                                        disabled={isChecking}
                                        className="flex-1 h-12 rounded-xl text-sm font-bold border-slate-200 hover:bg-slate-50 text-slate-700 shadow-sm"
                                    >
                                        {isChecking ? (
                                            <>
                                                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                                Comprobando...
                                            </>
                                        ) : (
                                            <>
                                                <Zap className="h-4 w-4 mr-2" />
                                                Comprobar conexión
                                            </>
                                        )}
                                    </Button>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* 3. SECURITY NOTICE */}
                    <div className="mt-4 rounded-lg border border-slate-200 bg-muted/40 p-4 text-[11px] text-slate-500 flex items-start gap-3">
                        <ShieldCheck className="w-4 h-4 text-slate-400 mt-0.5 shrink-0" />
                        <div className="space-y-1">
                            <p className="font-bold text-slate-700 uppercase tracking-wider text-[10px]">Security & Performance</p>
                            <p className="leading-relaxed">
                                Este script está optimizado para cargar de forma asíncrona sin afectar el PageSpeed.
                                Solo funcionará en el dominio <span className="text-emerald-600 font-bold">{selectedKey?.domain || "autorizado"}</span>.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        )
    }

    const renderWordPressStep = () => (
        <div className="p-8 space-y-6">
            <div className="flex items-center gap-4 mb-6">
                <button
                    onClick={() => setStep("list")}
                    className="p-2 hover:bg-slate-50 rounded-lg transition-colors border border-slate-100"
                >
                    <ArrowLeft className="h-4 w-4 text-slate-500" />
                </button>
                <div>
                    <h2 className="text-xl font-semibold text-slate-900">Plugin para WordPress</h2>
                    <p className="text-sm text-slate-500 mt-0.5">Instala ClientLabs en tu WordPress sin tocar código</p>
                </div>
            </div>

            <div className="border border-slate-200 rounded-xl p-6 bg-white space-y-6">
                <div className="flex items-center gap-4">
                    <div className="w-14 h-14 rounded-xl bg-[#f0f6fb] border border-[#d0e8f5] flex items-center justify-center flex-shrink-0">
                        <svg width="30" height="30" viewBox="0 0 24 24" fill="#21759B">
                            <path d="M12 2C6.486 2 2 6.486 2 12s4.486 10 10 10 10-4.486 10-10S17.514 2 12 2zm0 1.5c1.788 0 3.46.5 4.887 1.362L5.862 16.887A8.474 8.474 0 0 1 3.5 12c0-4.687 3.813-8.5 8.5-8.5zm0 17c-1.788 0-3.46-.5-4.887-1.362l11.025-12.025A8.474 8.474 0 0 1 20.5 12c0 4.687-3.813 8.5-8.5 8.5z"/>
                        </svg>
                    </div>
                    <div>
                        <h3 className="text-base font-semibold text-slate-900">ClientLabs — Lead Capture</h3>
                        <p className="text-sm text-slate-500 mt-0.5">Plugin oficial · v1.0.0 · GPL v2</p>
                    </div>
                    <a
                        href="/api/downloads/wordpress-plugin"
                        download="clientlabs-lead-capture.zip"
                        className="ml-auto flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#21759B] text-white text-sm font-medium hover:bg-[#1a5f7a] transition-colors flex-shrink-0"
                    >
                        <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
                            <path d="M8 2v8M5 7l3 3 3-3M3 13h10" stroke="white" strokeWidth="1.5" strokeLinecap="round"/>
                        </svg>
                        Descargar .zip
                    </a>
                </div>

                <div className="border-t border-slate-100 pt-5">
                    <h4 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-4">Cómo instalarlo</h4>
                    <div className="space-y-3">
                        {[
                            { num: "1", text: "Descarga el archivo .zip con el botón de arriba" },
                            { num: "2", text: "En tu WordPress ve a Plugins → Añadir nuevo → Subir plugin" },
                            { num: "3", text: "Sube el .zip, instala y activa el plugin" },
                            { num: "4", text: "Ve a Ajustes → ClientLabs y pega tu API Key" },
                        ].map((s) => (
                            <div key={s.num} className="flex items-start gap-3">
                                <div className="w-6 h-6 rounded-full bg-[#E1F5EE] text-[#0F6E56] text-xs font-bold flex items-center justify-center flex-shrink-0 mt-0.5">
                                    {s.num}
                                </div>
                                <p className="text-sm text-slate-700">{s.text}</p>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="border-t border-slate-100 pt-5">
                    <h4 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-3">Tu API Key pública</h4>
                    <p className="text-xs text-slate-500 mb-3">
                        Necesitarás esta clave al configurar el plugin en WordPress.
                        Genera una nueva si aún no tienes ninguna.
                    </p>
                    {publicKeys.length > 0 ? (
                        <div className="space-y-2">
                            {publicKeys.map((key) => (
                                <div key={key.id} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg border border-slate-100">
                                    <div>
                                        <p className="text-xs font-bold text-slate-700">{key.name}</p>
                                        <p className="text-xs text-slate-500 font-mono mt-0.5">{maskKey(key.rawKey ?? key.apiKey)}</p>
                                    </div>
                                    <button
                                        onClick={() => {
                                            const k = key.rawKey ?? key.apiKey ?? ""
                                            navigator.clipboard.writeText(k)
                                            toast.success("API Key copiada")
                                        }}
                                        className="p-2 rounded-lg hover:bg-white border border-transparent hover:border-slate-200 transition-colors"
                                    >
                                        <Copy className="h-3.5 w-3.5 text-slate-500" />
                                    </button>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="text-center p-6 bg-slate-50 rounded-xl border border-dashed border-slate-200">
                            <p className="text-xs text-slate-500 mb-3">Aún no tienes ninguna API Key generada</p>
                            <button
                                onClick={() => setStep("manage")}
                                className="text-xs font-medium text-[#1FA97A] hover:underline"
                            >
                                Generar API Key →
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    )

    return (
        <Modal isOpen={open} onClose={handleClose} width="ultraWide">
            {step === "list" && renderListStep()}
            {step === "manage" && renderManageStep()}
            {step === "script" && renderScriptStep()}
            {step === "wordpress" && renderWordPressStep()}
        </Modal>
    )
}
