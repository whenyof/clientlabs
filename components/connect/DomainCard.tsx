"use client"
import { getBaseUrl } from "@/lib/api/baseUrl"


import { useState } from "react"
import { Globe, ShieldCheck, Loader2 } from "lucide-react"
import { toast } from "sonner"
import { cn } from "@/lib/utils"
import { useRouter } from "next/navigation"

interface DomainCardProps {
    currentDomain?: string | null
    onSuccess: (domain: string, publicKey: string) => void
}

export function DomainCard({ currentDomain, onSuccess }: DomainCardProps) {
    const router = useRouter()
    const [domain, setDomain] = useState(currentDomain || "")
    const [isSaving, setIsSaving] = useState(false)

    const validateDomain = (val: string) => {
        // Basic hostname validation (no IPs, no protocol prefix required but handled)
        const ipv4Regex = /^(?:[0-9]{1,3}\.){3}[0-9]{1,3}$/
        const ipv6Regex = /:/

        let hostname = val.trim().toLowerCase()
        if (hostname.startsWith("http")) {
            try {
                hostname = new URL(hostname).hostname
            } catch { return false }
        }

        if (ipv4Regex.test(hostname) || ipv6Regex.test(hostname)) return false
        return hostname.length > 3 && hostname.includes(".")
    }

    const handleSave = async () => {
        if (!validateDomain(domain)) {
            toast.error("Dominio inválido. Introduce un hostname como 'ejemplo.com'")
            return
        }

        setIsSaving(true)
        try {
            const res = await fetch(getBaseUrl() + "/api/settings/public-keys", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ name: `Web Connect: ${domain}`, domain })
            })

            if (!res.ok) {
                const data = await res.json()
                throw new Error(data.error || "Error al guardar el dominio")
            }

            const data = await res.json()
            toast.success("Dominio autorizado correctamente")

            // Refresh server components to show the updated connectivity status
            router.refresh()

            // Pass the publicKey just generated to show it in the UI immediately
            onSuccess(data.domain, data.rawKey)
        } catch (error: any) {
            toast.error(error.message)
        } finally {
            setIsSaving(false)
        }
    }

    return (
        <div className="bg-slate-900/50 border border-slate-800 rounded-2xl overflow-hidden">
            <div className="p-6 border-b border-slate-800">
                <div className="flex items-center gap-3 mb-1">
                    <div className="p-2 bg-teal-500/10 rounded-lg">
                        <Globe className="w-5 h-5 text-teal-400" />
                    </div>
                    <h2 className="text-lg font-semibold text-white">Dominio Autorizado</h2>
                    {currentDomain && (
                        <span className="ml-auto bg-emerald-500/10 text-emerald-500 text-[10px] px-2 py-0.5 rounded-full border border-emerald-500/20 font-bold uppercase tracking-wider">
                            Activo
                        </span>
                    )}
                </div>
                <p className="text-slate-400 text-xs">
                    Las peticiones desde otros dominios serán rechazadas por motivos de seguridad.
                </p>
            </div>

            <div className="p-6 space-y-4">
                <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <ShieldCheck className="h-4 w-4 text-slate-500" />
                    </div>
                    <input
                        type="text"
                        value={domain}
                        onChange={(e) => setDomain(e.target.value)}
                        placeholder="ejemplo.com"
                        disabled={isSaving}
                        className={cn(
                            "block w-full pl-10 pr-3 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-sm text-slate-200 placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500/50 transition-all shadow-inner",
                            isSaving && "opacity-50"
                        )}
                    />
                </div>

                <button
                    onClick={handleSave}
                    disabled={isSaving || domain === currentDomain}
                    className="w-full h-11 bg-white hover:bg-slate-100 disabled:bg-slate-800 disabled:text-slate-500 text-slate-950 font-semibold rounded-xl text-sm transition-all flex items-center justify-center gap-2 group shadow-lg shadow-white/5"
                >
                    {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : "Guardar Dominio"}
                </button>
            </div>
        </div>
    )
}
