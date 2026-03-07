"use client"

import { useState, useEffect } from "react"
import { AnimatePresence, motion } from "framer-motion"
import {
    PlusIcon,
    KeyIcon,
    TrashIcon,
    DocumentDuplicateIcon,
    CheckIcon,
    ShieldCheckIcon,
    CommandLineIcon,
    GlobeAltIcon,
    ListBulletIcon,
    ArrowPathIcon,
    ClockIcon,
    EyeIcon
} from "@heroicons/react/24/outline"
import { toast } from "sonner"
import { cn } from "@/lib/utils"

interface ApiKey {
    id: string
    name: string
    type: "secret" | "public" | "webhook"
    scope: "ingest" | "read" | "admin" | null
    expiryDate: string | null
    lastUsed: string | null
    createdAt: string
    revoked: boolean
}

export default function ApiSettingsPage() {
    const [keys, setKeys] = useState<ApiKey[]>([])
    const [loading, setLoading] = useState(true)
    const [isModalOpen, setIsModalOpen] = useState(false)
    const [newKeyName, setNewKeyName] = useState("")
    const [createdKeySecret, setCreatedKeySecret] = useState<string | null>(null)
    const [activeTab, setActiveTab] = useState("keys")
    const [copiedId, setCopiedId] = useState<string | null>(null)
    const [actionLoading, setActionLoading] = useState<string | null>(null)
    const [revealingKeyId, setRevealingKeyId] = useState<string | null>(null)
    const [revealedKey, setRevealedKey] = useState<string | null>(null)
    const [isRevealedKeyVisible, setIsRevealedKeyVisible] = useState(false)

    useEffect(() => {
        fetchKeys()
    }, [])

    const fetchKeys = async () => {
        setLoading(true)
        try {
            const res = await fetch("/api/settings/api-keys")
            if (res.ok) {
                const data = await res.json()
                setKeys(data)
            }
        } catch (err) {
            toast.error("Error al cargar las API Keys")
        } finally {
            setLoading(false)
        }
    }

    const handleCreateKey = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!newKeyName.trim()) return

        try {
            const res = await fetch("/api/settings/api-keys", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ name: newKeyName })
            })
            if (res.ok) {
                const data = await res.json()
                setCreatedKeySecret(data.rawKey)
                fetchKeys()
                toast.success("API Key generada con éxito")
            } else {
                toast.error("Error al crear la API Key")
            }
        } catch (err) {
            toast.error("Error de conexión")
        }
    }

    const handleRegenerateKey = async (id: string) => {
        if (!confirm("¿Regenerar esta API Key? La clave actual dejará de funcionar inmediatamente.")) return

        setActionLoading(id)
        try {
            const res = await fetch("/api/settings/api-keys/regenerate", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ id })
            })
            if (res.ok) {
                const data = await res.json()
                setCreatedKeySecret(data.rawKey)
                setIsModalOpen(true)
                fetchKeys()
                toast.success("API Key regenerada")
            } else {
                toast.error("Error al regenerar la API Key")
            }
        } catch (err) {
            toast.error("Error de conexión")
        } finally {
            setActionLoading(null)
        }
    }

    const handleRevokeKey = async (id: string) => {
        if (!confirm("¿Estás seguro de que quieres revocar esta API Key? Esta acción es irreversible.")) return

        setActionLoading(id)
        try {
            const res = await fetch("/api/settings/api-keys", {
                method: "DELETE",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ id })
            })
            if (res.ok) {
                fetchKeys()
                toast.success("API Key revocada permanentemente")
            } else {
                toast.error("Error al revocar la API Key")
            }
        } catch (err) {
            toast.error("Error de conexión")
        } finally {
            setActionLoading(null)
        }
    }

    const handleRevealKey = async (id: string) => {
        setActionLoading(id)
        try {
            const res = await fetch(`/api/settings/api-keys/${id}/reveal`)
            const data = await res.json()
            if (res.ok && data.key) {
                setRevealedKey(data.key)
                setRevealingKeyId(id)
            } else {
                toast.error(data.error || "No se puede revelar esta clave")
            }
        } catch (err) {
            toast.error("Error al revelar la clave")
        } finally {
            setActionLoading(null)
        }
    }

    const copyToClipboard = (text: string, id: string = "secret") => {
        navigator.clipboard.writeText(text)
        setCopiedId(id)
        setTimeout(() => setCopiedId(null), 2000)
        toast.success("Copiado al portapapeles")
    }

    const tabs = [
        { id: "keys", label: "Claves de acceso", icon: KeyIcon, disabled: false },
        { id: "webhooks", label: "Webhooks", icon: GlobeAltIcon, disabled: true },
        { id: "logs", label: "Logs", icon: ListBulletIcon, disabled: true },
    ]

    return (
        <div className="space-y-6">
            {/* Section Header */}
            <div className="flex flex-wrap items-center justify-between gap-4">
                <div>
                    <h2 className="text-lg font-semibold text-[#0B1F2A]">Infraestructura API</h2>
                    <p className="text-sm text-slate-500 mt-0.5">Gestión de credenciales y claves de integración.</p>
                </div>
                {!loading && keys.length > 0 && (
                    <button
                        onClick={() => {
                            setCreatedKeySecret(null)
                            setNewKeyName("")
                            setIsModalOpen(true)
                        }}
                        className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-[var(--accent)] rounded-lg hover:opacity-90 transition-colors"
                    >
                        <PlusIcon className="w-4 h-4" />
                        Nueva API Key
                    </button>
                )}
            </div>

            {/* Tabs */}
            <div className="flex items-center gap-1 bg-white rounded-xl border border-slate-200 p-1 w-fit">
                {tabs.map((tab) => {
                    const Icon = tab.icon
                    const isActive = activeTab === tab.id
                    return (
                        <button
                            key={tab.id}
                            onClick={() => !tab.disabled && setActiveTab(tab.id)}
                            disabled={tab.disabled}
                            className={cn(
                                "flex items-center gap-2 px-4 py-2 rounded-lg transition-colors text-sm font-medium",
                                isActive
                                    ? "bg-slate-50 text-[#0B1F2A]"
                                    : "text-slate-500 hover:text-slate-700",
                                tab.disabled && "opacity-30 cursor-not-allowed"
                            )}
                        >
                            <Icon className="w-4 h-4" />
                            {tab.label}
                        </button>
                    )
                })}
            </div>

            {/* Content */}
            {activeTab === "keys" && (
                <div>
                    {loading ? (
                        <div className="p-16 text-center flex flex-col items-center gap-3">
                            <ArrowPathIcon className="w-8 h-8 text-[var(--accent)] animate-spin opacity-50" />
                            <p className="text-sm text-slate-400">Cargando claves...</p>
                        </div>
                    ) : keys.length === 0 ? (
                        <div className="bg-white rounded-xl border border-slate-200 p-12 text-center">
                            <div className="max-w-sm mx-auto space-y-4">
                                <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto border border-slate-200">
                                    <ShieldCheckIcon className="w-8 h-8 text-[var(--accent)] opacity-60" />
                                </div>
                                <h3 className="text-base font-semibold text-[#0B1F2A]">Sin API Keys</h3>
                                <p className="text-sm text-slate-500">
                                    Genera tu primera credencial para integrar sistemas externos.
                                </p>
                                <button
                                    onClick={() => {
                                        setCreatedKeySecret(null)
                                        setNewKeyName("")
                                        setIsModalOpen(true)
                                    }}
                                    className="px-5 py-2.5 text-sm font-medium text-white bg-[var(--accent)] rounded-lg hover:opacity-90 transition-colors"
                                >
                                    Generar API Key
                                </button>
                            </div>
                        </div>
                    ) : (
                        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
                            <table className="w-full text-left">
                                <thead>
                                    <tr className="border-b border-slate-100 text-xs font-medium text-slate-500 uppercase">
                                        <th className="px-6 py-3">Nombre</th>
                                        <th className="px-6 py-3">Tipo</th>
                                        <th className="px-6 py-3">Última actividad</th>
                                        <th className="px-6 py-3">Estado</th>
                                        <th className="px-6 py-3 text-right">Acciones</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-50">
                                    {keys.map((key) => (
                                        <tr key={key.id} className={cn(
                                            "group transition-colors",
                                            key.revoked ? "bg-red-50/30" : "hover:bg-slate-50"
                                        )}>
                                            <td className="px-6 py-4">
                                                <div className="text-sm font-semibold text-[#0B1F2A]">{key.name}</div>
                                                <div className="text-xs text-slate-400 mt-0.5 font-mono">{key.id}</div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className="text-xs font-medium text-slate-500 uppercase">
                                                    {key.type === 'secret' ? 'Secret' : 'Public'}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="text-sm text-slate-700 flex items-center gap-1.5">
                                                    <ClockIcon className="w-3.5 h-3.5 text-slate-400" />
                                                    {key.lastUsed ? new Date(key.lastUsed).toLocaleDateString() : '—'}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                {key.revoked ? (
                                                    <span className="inline-flex px-2 py-0.5 text-[10px] font-semibold uppercase bg-red-50 text-red-600 border border-red-200 rounded">
                                                        Revocada
                                                    </span>
                                                ) : (
                                                    <span className="inline-flex px-2 py-0.5 text-[10px] font-semibold uppercase bg-emerald-50 text-emerald-600 border border-emerald-200 rounded">
                                                        Activa
                                                    </span>
                                                )}
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                {!key.revoked && (
                                                    <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                        <button
                                                            onClick={() => handleRevealKey(key.id)}
                                                            disabled={!!actionLoading}
                                                            className="p-2 text-slate-400 hover:text-[var(--accent)] border border-slate-200 rounded-lg transition-colors bg-white"
                                                            title="Revelar"
                                                        >
                                                            {actionLoading === key.id && !revealingKeyId ? <ArrowPathIcon className="w-4 h-4 animate-spin" /> : <EyeIcon className="w-4 h-4" />}
                                                        </button>
                                                        <button
                                                            onClick={() => handleRegenerateKey(key.id)}
                                                            disabled={!!actionLoading}
                                                            className="p-2 text-slate-400 hover:text-[var(--accent)] border border-slate-200 rounded-lg transition-colors bg-white"
                                                            title="Regenerar"
                                                        >
                                                            <ArrowPathIcon className="w-4 h-4" />
                                                        </button>
                                                        <button
                                                            onClick={() => handleRevokeKey(key.id)}
                                                            disabled={!!actionLoading}
                                                            className="p-2 text-slate-400 hover:text-red-500 border border-slate-200 rounded-lg transition-colors bg-white"
                                                            title="Revocar"
                                                        >
                                                            <TrashIcon className="w-4 h-4" />
                                                        </button>
                                                    </div>
                                                )}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            )}

            {/* Create/View Key Modal */}
            <AnimatePresence>
                {isModalOpen && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => !createdKeySecret && setIsModalOpen(false)}
                            className="fixed inset-0 bg-black/30 backdrop-blur-sm"
                        />
                        <motion.div
                            initial={{ opacity: 0, scale: 0.98, y: 10 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.98, y: 10 }}
                            className="relative bg-white border border-slate-200 rounded-xl w-full max-w-lg overflow-hidden shadow-lg"
                        >
                            {createdKeySecret ? (
                                <div className="p-6">
                                    <h3 className="text-lg font-semibold text-[#0B1F2A] mb-1">Credencial generada</h3>
                                    <p className="text-sm text-slate-500 mb-5">
                                        Copia esta clave ahora. No podrás volver a verla.
                                    </p>

                                    <div className="relative">
                                        <div className="bg-slate-50 border border-slate-200 rounded-lg p-4 font-mono text-sm text-[var(--accent)] break-all select-all">
                                            {createdKeySecret}
                                        </div>
                                        <button
                                            onClick={() => copyToClipboard(createdKeySecret)}
                                            className="absolute right-2 top-2 p-2 text-slate-400 hover:text-[var(--accent)] border border-slate-200 rounded-lg bg-white transition-colors"
                                        >
                                            {copiedId === "secret" ? <CheckIcon className="w-4 h-4" /> : <DocumentDuplicateIcon className="w-4 h-4" />}
                                        </button>
                                    </div>

                                    <div className="mt-5 pt-4 border-t border-slate-100">
                                        <button
                                            onClick={() => {
                                                setIsModalOpen(false)
                                                setCreatedKeySecret(null)
                                            }}
                                            className="w-full py-2.5 text-sm font-medium text-white bg-[#0B1F2A] rounded-lg hover:bg-black transition-colors"
                                        >
                                            He guardado la clave
                                        </button>
                                    </div>
                                </div>
                            ) : (
                                <form onSubmit={handleCreateKey}>
                                    <div className="p-6 space-y-5">
                                        <div>
                                            <h3 className="text-lg font-semibold text-[#0B1F2A]">Nueva API Key</h3>
                                            <p className="text-sm text-slate-500 mt-0.5">Asigna un nombre descriptivo para identificar esta clave.</p>
                                        </div>

                                        <div className="space-y-1.5">
                                            <label className="text-sm font-medium text-slate-700">Nombre</label>
                                            <input
                                                required
                                                type="text"
                                                placeholder="Ej: Producción ERP"
                                                value={newKeyName}
                                                onChange={(e) => setNewKeyName(e.target.value)}
                                                className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-lg text-sm text-[#0B1F2A] placeholder-slate-300 focus:outline-none focus:ring-1 focus:ring-[var(--accent)] focus:border-[var(--accent)] transition-colors"
                                            />
                                        </div>

                                        <div className="p-3 bg-slate-50 rounded-lg border border-slate-100 flex items-center justify-between">
                                            <div className="flex items-center gap-2">
                                                <CommandLineIcon className="w-4 h-4 text-slate-400" />
                                                <span className="text-xs font-medium text-slate-500">Permisos</span>
                                            </div>
                                            <span className="text-xs font-semibold text-[var(--accent)] bg-[var(--accent)]/10 px-2 py-0.5 rounded uppercase">ADMIN</span>
                                        </div>
                                    </div>

                                    <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex gap-3">
                                        <button
                                            type="button"
                                            onClick={() => setIsModalOpen(false)}
                                            className="flex-1 py-2.5 text-sm font-medium text-slate-500 hover:text-slate-700 transition-colors"
                                        >
                                            Cancelar
                                        </button>
                                        <button
                                            type="submit"
                                            className="flex-[2] py-2.5 text-sm font-medium text-white bg-[var(--accent)] rounded-lg hover:opacity-90 transition-colors"
                                        >
                                            Generar credencial
                                        </button>
                                    </div>
                                </form>
                            )}
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* Reveal Key Modal */}
            <AnimatePresence>
                {revealingKeyId && revealedKey && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => {
                                setRevealingKeyId(null)
                                setRevealedKey(null)
                            }}
                            className="fixed inset-0 bg-black/30 backdrop-blur-sm"
                        />
                        <motion.div
                            initial={{ opacity: 0, scale: 0.98, y: 10 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.98, y: 10 }}
                            className="relative bg-white border border-slate-200 rounded-xl w-full max-w-lg overflow-hidden shadow-lg"
                        >
                            <div className="p-6">
                                <h3 className="text-lg font-semibold text-[#0B1F2A] mb-1">Clave de Acceso</h3>
                                <p className="text-sm text-slate-500 mb-5">
                                    Aquí tienes la clave solicitada. Usa esta credencial con precaución.
                                </p>

                                <div className="relative">
                                    <input
                                        type={isRevealedKeyVisible ? "text" : "password"}
                                        readOnly
                                        value={revealedKey}
                                        className="w-full bg-slate-50 border border-slate-200 rounded-lg py-3.5 pl-4 pr-24 font-mono text-sm text-[var(--accent)] focus:outline-none"
                                    />
                                    <div className="absolute right-2 top-0 bottom-0 flex items-center gap-1">
                                        <button
                                            onClick={() => setIsRevealedKeyVisible(!isRevealedKeyVisible)}
                                            className="p-2 text-slate-400 hover:text-[#0B1F2A] transition-colors"
                                        >
                                            <EyeIcon className="w-4 h-4" />
                                        </button>
                                        <button
                                            onClick={() => copyToClipboard(revealedKey, "revealed")}
                                            className="p-2 text-slate-400 hover:text-[var(--accent)] transition-colors"
                                        >
                                            {copiedId === "revealed" ? <CheckIcon className="w-4 h-4" /> : <DocumentDuplicateIcon className="w-4 h-4" />}
                                        </button>
                                    </div>
                                </div>

                                <div className="mt-5 pt-4 border-t border-slate-100 flex justify-end">
                                    <button
                                        onClick={() => {
                                            setRevealingKeyId(null)
                                            setRevealedKey(null)
                                            setIsRevealedKeyVisible(false)
                                        }}
                                        className="px-5 py-2.5 text-sm font-medium text-white bg-[#0B1F2A] rounded-lg hover:opacity-90 transition-colors"
                                    >
                                        Cerrar
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    )
}
