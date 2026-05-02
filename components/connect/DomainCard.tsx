"use client"
import { getBaseUrl } from "@/lib/api/baseUrl"

import { useState } from "react"
import { Globe, Loader2 } from "lucide-react"
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
        const ipv4Regex = /^(?:[0-9]{1,3}\.){3}[0-9]{1,3}$/
        const ipv6Regex = /:/
        let hostname = val.trim().toLowerCase()
        if (hostname.startsWith("http")) {
            try { hostname = new URL(hostname).hostname } catch { return false }
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
            router.refresh()
            onSuccess(data.domain, data.rawKey)
        } catch (error: unknown) {
            toast.error(error instanceof Error ? error.message : "Error al guardar")
        } finally {
            setIsSaving(false)
        }
    }

    return (
        <div className="flex flex-col sm:flex-row gap-2.5 items-stretch sm:items-center">
            <div className="relative flex-1">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                    <Globe className="h-4 w-4 text-slate-400" />
                </div>
                <input
                    type="text"
                    value={domain}
                    onChange={(e) => setDomain(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && !isSaving && handleSave()}
                    placeholder="ejemplo.com"
                    disabled={isSaving}
                    className={cn(
                        "block w-full pl-10 pr-3 py-2.5 bg-white border border-slate-200 rounded-lg text-sm text-[#0B1F2A] placeholder-slate-400",
                        "focus:outline-none focus:ring-2 focus:ring-[#1FA97A]/20 focus:border-[#1FA97A] transition-all",
                        isSaving && "opacity-60 cursor-not-allowed"
                    )}
                />
            </div>
            <button
                onClick={handleSave}
                disabled={isSaving || !domain.trim() || domain.trim() === currentDomain}
                className={cn(
                    "flex items-center justify-center gap-2 px-5 py-2.5 text-sm font-medium rounded-lg transition-colors whitespace-nowrap",
                    "bg-[#1FA97A] text-white hover:bg-[#178f68]",
                    "disabled:opacity-40 disabled:cursor-not-allowed"
                )}
            >
                {isSaving
                    ? <><Loader2 className="w-4 h-4 animate-spin" /> Guardando</>
                    : currentDomain ? "Actualizar" : "Guardar dominio"
                }
            </button>
        </div>
    )
}
