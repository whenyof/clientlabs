"use client"

import { useState } from "react"
import { Dialog, DialogContent } from "@/components/ui/dialog"
import { toast } from "sonner"
import { createProviderTask } from "../actions"
import { useRouter } from "next/navigation"
import { Loader2, ChevronDown } from "lucide-react"

import { useSectorConfig } from "@/hooks/useSectorConfig"

type CreateTaskDialogProps = {
    providerId: string
    providerName: string
    open: boolean
    onOpenChange: (open: boolean) => void
    onSuccess?: () => void
}

const inputClass = "w-full px-4 py-2.5 rounded-xl border border-slate-200 text-[14px] text-slate-900 placeholder:text-slate-400 bg-slate-50 focus:bg-white focus:border-[#1FA97A] focus:ring-2 focus:ring-[#1FA97A]/10 outline-none transition-all"
const selectClass = "w-full px-4 py-2.5 rounded-xl border border-slate-200 text-[14px] text-slate-900 bg-slate-50 focus:bg-white focus:border-[#1FA97A] focus:ring-2 focus:ring-[#1FA97A]/10 outline-none transition-all appearance-none cursor-pointer"
const labelClass = "text-[11px] font-semibold uppercase tracking-[0.08em] text-slate-500"

const PRIORITY_OPTIONS = [
    { value: "LOW", label: "Baja" },
    { value: "MEDIUM", label: "Media" },
    { value: "HIGH", label: "Alta" },
]

export function CreateTaskDialog({ providerId, providerName, open, onOpenChange, onSuccess }: CreateTaskDialogProps) {
    const { labels } = useSectorConfig()
    const [loading, setLoading] = useState(false)
    const router = useRouter()
    const [formData, setFormData] = useState({
        title: "",
        description: "",
        priority: "MEDIUM" as "LOW" | "MEDIUM" | "HIGH",
        dueDate: ""
    })

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!formData.title.trim()) {
            toast.error("El título es obligatorio")
            return
        }
        setLoading(true)
        try {
            const result = await createProviderTask({
                providerId,
                title: formData.title,
                description: formData.description || undefined,
                priority: formData.priority,
                dueDate: formData.dueDate ? new Date(formData.dueDate) : undefined
            })
            if (result.success) {
                toast.success(labels.common.success)
                onOpenChange(false)
                router.refresh()
                if (onSuccess) onSuccess()
                setFormData({ title: "", description: "", priority: "MEDIUM", dueDate: "" })
            } else {
                toast.error(result.error || labels.common.error)
            }
        } catch {
            toast.error(labels.common.error)
        } finally {
            setLoading(false)
        }
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="bg-white rounded-2xl p-0 !max-w-[480px] w-full overflow-hidden border-0 shadow-xl">
                <div className="px-6 pt-6 pb-5 border-b border-slate-100">
                    <h2 className="text-[17px] font-semibold text-slate-900">{labels.providers.actions.newTask}</h2>
                    <p className="text-[13px] text-slate-500 mt-1">{providerName}</p>
                </div>

                <form onSubmit={handleSubmit}>
                    <div className="px-6 py-5 space-y-4">
                        {/* Título */}
                        <div className="space-y-1.5">
                            <label className={labelClass}>TÍTULO <span className="text-[#1FA97A]">*</span></label>
                            <input
                                type="text"
                                value={formData.title}
                                onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                                placeholder="Ej: Renovar contrato"
                                required
                                className={inputClass}
                            />
                        </div>

                        {/* Descripción */}
                        <div className="space-y-1.5">
                            <label className={labelClass}>DESCRIPCIÓN</label>
                            <textarea
                                value={formData.description}
                                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                                placeholder="Detalles de la tarea..."
                                rows={3}
                                className={`${inputClass} resize-none`}
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                            {/* Prioridad */}
                            <div className="space-y-1.5">
                                <label className={labelClass}>PRIORIDAD</label>
                                <div className="relative">
                                    <select
                                        value={formData.priority}
                                        onChange={e => setFormData(prev => ({ ...prev, priority: e.target.value as any }))}
                                        className={selectClass}
                                    >
                                        {PRIORITY_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                                    </select>
                                    <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none" />
                                </div>
                            </div>

                            {/* Fecha límite */}
                            <div className="space-y-1.5">
                                <label className={labelClass}>FECHA LÍMITE</label>
                                <input
                                    type="date"
                                    value={formData.dueDate}
                                    onChange={(e) => setFormData(prev => ({ ...prev, dueDate: e.target.value }))}
                                    className={inputClass}
                                />
                            </div>
                        </div>
                    </div>

                    <div className="px-6 py-4 border-t border-slate-100 flex justify-end gap-3">
                        <button type="button" onClick={() => onOpenChange(false)} className="px-5 py-2.5 rounded-xl border border-slate-200 text-[13px] font-medium text-slate-700 hover:bg-slate-50 transition-colors">
                            {labels.common.cancel}
                        </button>
                        <button type="submit" disabled={loading || !formData.title.trim()} className="px-5 py-2.5 rounded-xl bg-[#1FA97A] text-white text-[13px] font-medium hover:bg-[#178f68] transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2">
                            {loading ? <><Loader2 className="h-4 w-4 animate-spin" /> Creando...</> : labels.providers.actions.newTask}
                        </button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    )
}
