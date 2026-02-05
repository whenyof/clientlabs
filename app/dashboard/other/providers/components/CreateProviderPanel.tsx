"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { X, Save, AlertCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { createProvider } from "@/app/dashboard/providers/actions"
import { toast } from "sonner"
import { cn } from "@/lib/utils"

type CreateProviderPanelProps = {
    open: boolean
    onClose: () => void
    onCreate: (provider: any) => void
}

export function CreateProviderPanel({ open, onClose, onCreate }: CreateProviderPanelProps) {
    const [loading, setLoading] = useState(false)
    const [formData, setFormData] = useState({
        name: "",
        type: "PRODUCT",
        status: "OK", // OK = ACTIVO, PENDING = INACTIVO
        contactEmail: "",
        contactPhone: "",
        website: "",
        monthlyCost: "",
        dependency: "MEDIUM",
        isCritical: false,
        averageOrderFrequency: "",
        lastOrderDate: "",
        autoCreateTaskOnRisk: false, // UI only for now
        autoNotifyBeforeRestock: false, // UI only for now
        notes: ""
    })

    const handleChange = (field: string, value: any) => {
        setFormData(prev => ({ ...prev, [field]: value }))
    }

    const handleSubmit = async () => {
        if (!formData.name.trim()) {
            toast.error("El nombre es obligatorio")
            return
        }

        setLoading(true)
        try {
            // Transform data for server action
            const submitData = {
                name: formData.name,
                type: formData.type as any,
                status: formData.status as any,
                contactEmail: formData.contactEmail || null,
                contactPhone: formData.contactPhone || null,
                website: formData.website || null,
                monthlyCost: formData.monthlyCost ? parseFloat(formData.monthlyCost) : null,
                dependency: formData.dependency as any,
                isCritical: formData.isCritical,
                notes: formData.notes || null,
                // Operational fields (saved if they exist in schema)
                averageOrderFrequency: formData.averageOrderFrequency ? parseInt(formData.averageOrderFrequency) : null,
                lastOrderDate: formData.lastOrderDate ? new Date(formData.lastOrderDate) : null,
                // Automations (passed to action, but might be ignored if DB columns missing)
                autoCreateTaskOnRisk: formData.autoCreateTaskOnRisk,
                autoNotifyBeforeRestock: formData.autoNotifyBeforeRestock ? 7 : null // Default to 7 days if checked
            }

            // Server Action
            const result = await createProvider(submitData)

            if (result.success && result.provider) {
                toast.success("Proveedor creado correctamente")
                onCreate(result.provider)
                onClose()
            } else {
                toast.error(result.error || "Error al crear proveedor")
            }
        } catch (error) {
            console.error(error)
            toast.error("Error inesperado")
        } finally {
            setLoading(false)
        }
    }

    // Reset form when opening
    // useEffect(() => {
    //     if (open) setFormData(...)
    // }, [open])

    return (
        <AnimatePresence>
            {open && (
                <>
                    {/* Overlay */}
                    <motion.div
                        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                    />

                    {/* Panel */}
                    <motion.div
                        className="fixed right-0 top-0 h-full w-full md:w-[600px] bg-zinc-900 border-l border-white/10 z-50 overflow-y-auto flex flex-col"
                        initial={{ x: "100%" }}
                        animate={{ x: 0 }}
                        exit={{ x: "100%" }}
                        transition={{ type: "spring", damping: 30, stiffness: 300 }}
                    >
                        {/* HEADER */}
                        <div className="sticky top-0 z-10 bg-zinc-900/95 backdrop-blur-sm border-b border-white/10 p-6 flex items-start justify-between">
                            <div>
                                <h2 className="text-xl font-bold text-white">Nuevo proveedor</h2>
                                <p className="text-sm text-white/50 mt-1">
                                    Información básica para empezar. Podrás completarla después.
                                </p>
                            </div>
                            <Button
                                variant="ghost"
                                size="icon"
                                onClick={onClose}
                                className="text-white/60 hover:text-white hover:bg-white/10 -mr-2"
                            >
                                <X className="h-5 w-5" />
                            </Button>
                        </div>

                        {/* CONTENT */}
                        <div className="flex-1 p-6 space-y-8">

                            {/* 1. Essential Info */}
                            <section className="space-y-4">
                                <h3 className="text-sm font-semibold text-white/40 uppercase tracking-wider flex items-center gap-2">
                                    <span className="w-1.5 h-1.5 rounded-full bg-blue-500"></span>
                                    Información Esencial
                                </h3>
                                <div className="grid gap-4">
                                    <div className="space-y-2">
                                        <Label className="text-white">Nombre del proveedor <span className="text-red-400">*</span></Label>
                                        <Input
                                            value={formData.name}
                                            onChange={(e) => handleChange("name", e.target.value)}
                                            placeholder="Ej: Distribuciones SL"
                                            className="bg-white/5 border-white/10 text-white placeholder:text-white/20 focus:border-blue-500/50"
                                            autoFocus
                                        />
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <Label className="text-white">Tipo</Label>
                                            <Select
                                                value={formData.type}
                                                onValueChange={(val) => handleChange("type", val)}
                                            >
                                                <SelectTrigger className="bg-white/5 border-white/10 text-white">
                                                    <SelectValue />
                                                </SelectTrigger>
                                                <SelectContent className="bg-zinc-900 border-white/10 text-white">
                                                    <SelectItem value="PRODUCT">Materia prima / Producto</SelectItem>
                                                    <SelectItem value="SERVICE">Servicios / Logística</SelectItem>
                                                    <SelectItem value="SOFTWARE">Tecnología / Software</SelectItem>
                                                    <SelectItem value="OTHER">Otro</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>

                                        <div className="space-y-2">
                                            <Label className="text-white">Estado</Label>
                                            <Select
                                                value={formData.status}
                                                onValueChange={(val) => handleChange("status", val)}
                                            >
                                                <SelectTrigger className="bg-white/5 border-white/10 text-white">
                                                    <SelectValue />
                                                </SelectTrigger>
                                                <SelectContent className="bg-zinc-900 border-white/10 text-white">
                                                    <SelectItem value="OK">Activo</SelectItem>
                                                    <SelectItem value="PENDING">Inactivo</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>
                                    </div>
                                </div>
                            </section>

                            {/* 2. Contact */}
                            <section className="space-y-4">
                                <h3 className="text-sm font-semibold text-white/40 uppercase tracking-wider">Contacto</h3>
                                <div className="grid gap-4">
                                    <div className="space-y-2">
                                        <Label className="text-white/80">Email de contacto</Label>
                                        <Input
                                            type="email"
                                            value={formData.contactEmail}
                                            onChange={(e) => handleChange("contactEmail", e.target.value)}
                                            placeholder="contacto@proveedor.com"
                                            className="bg-white/5 border-white/10 text-white placeholder:text-white/20"
                                        />
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <Label className="text-white/80">Teléfono</Label>
                                            <Input
                                                type="tel"
                                                value={formData.contactPhone}
                                                onChange={(e) => handleChange("contactPhone", e.target.value)}
                                                placeholder="+34 600..."
                                                className="bg-white/5 border-white/10 text-white placeholder:text-white/20"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label className="text-white/80">Website</Label>
                                            <Input
                                                value={formData.website}
                                                onChange={(e) => handleChange("website", e.target.value)}
                                                placeholder="www.ejemplo.com"
                                                className="bg-white/5 border-white/10 text-white placeholder:text-white/20"
                                            />
                                        </div>
                                    </div>
                                </div>
                            </section>

                            {/* 3. Costs & Dependency */}
                            <section className="space-y-4">
                                <h3 className="text-sm font-semibold text-white/40 uppercase tracking-wider">Costes y Dependencia</h3>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label className="text-white/80">Coste mensual est.</Label>
                                        <div className="relative">
                                            <span className="absolute left-3 top-2.5 text-white/40">€</span>
                                            <Input
                                                type="number"
                                                value={formData.monthlyCost}
                                                onChange={(e) => handleChange("monthlyCost", e.target.value)}
                                                placeholder="0.00"
                                                className="bg-white/5 border-white/10 text-white placeholder:text-white/20 pl-8"
                                            />
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <Label className="text-white/80">Nivel de dependencia</Label>
                                        <Select
                                            value={formData.dependency}
                                            onValueChange={(val) => handleChange("dependency", val)}
                                        >
                                            <SelectTrigger className="bg-white/5 border-white/10 text-white">
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent className="bg-zinc-900 border-white/10 text-white">
                                                <SelectItem value="LOW">Baja</SelectItem>
                                                <SelectItem value="MEDIUM">Media</SelectItem>
                                                <SelectItem value="HIGH">Alta</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </div>
                                <div className="flex items-center justify-between p-3 rounded-lg bg-white/5 border border-white/10">
                                    <div className="flex items-center gap-2">
                                        <AlertCircle className="h-4 w-4 text-amber-400" />
                                        <Label className="text-white cursor-pointer" htmlFor="critical-switch">¿Es un proveedor crítico?</Label>
                                    </div>
                                    <Switch
                                        id="critical-switch"
                                        checked={formData.isCritical}
                                        onCheckedChange={(val) => handleChange("isCritical", val)}
                                    />
                                </div>
                            </section>

                            {/* 4. Control (Mocked for now) */}
                            <section className="space-y-4">
                                <h3 className="text-sm font-semibold text-white/40 uppercase tracking-wider">Control y Previsión</h3>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label className="text-white/80">Frecuencia media (días)</Label>
                                        <Input
                                            type="number"
                                            value={formData.averageOrderFrequency}
                                            onChange={(e) => handleChange("averageOrderFrequency", e.target.value)}
                                            placeholder="Ej: 30"
                                            className="bg-white/5 border-white/10 text-white placeholder:text-white/20"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label className="text-white/80">Último pedido</Label>
                                        <Input
                                            type="date"
                                            value={formData.lastOrderDate}
                                            onChange={(e) => handleChange("lastOrderDate", e.target.value)}
                                            className="bg-white/5 border-white/10 text-white placeholder:text-white/20 text-sm"
                                        />
                                    </div>
                                </div>
                                <div className="space-y-3">
                                    <div className="flex items-start justify-between gap-4 p-3 rounded-lg bg-white/5 border border-white/10 opacity-70 hover:opacity-100 transition-opacity">
                                        <div>
                                            <Label className="text-white text-sm font-medium">Auto-tarea por riesgo</Label>
                                            <p className="text-xs text-white/40">Crear tarea urgente si hay riesgo de stock.</p>
                                        </div>
                                        <Switch
                                            checked={formData.autoCreateTaskOnRisk}
                                            onCheckedChange={(val) => handleChange("autoCreateTaskOnRisk", val)}
                                        />
                                    </div>
                                    <div className="flex items-start justify-between gap-4 p-3 rounded-lg bg-white/5 border border-white/10 opacity-70 hover:opacity-100 transition-opacity">
                                        <div>
                                            <Label className="text-white text-sm font-medium">Avisar antes de reponer</Label>
                                            <p className="text-xs text-white/40">Notificar 7 días antes de la fecha estimada.</p>
                                        </div>
                                        <Switch
                                            checked={formData.autoNotifyBeforeRestock}
                                            onCheckedChange={(val) => handleChange("autoNotifyBeforeRestock", val)}
                                        />
                                    </div>
                                </div>
                            </section>

                            {/* 5. Notes */}
                            <section className="space-y-4">
                                <h3 className="text-sm font-semibold text-white/40 uppercase tracking-wider">Notas Internas</h3>
                                <Textarea
                                    value={formData.notes}
                                    onChange={(e) => handleChange("notes", e.target.value)}
                                    placeholder="Detalles sobre acuerdos, contactos alternativos, etc."
                                    className="bg-white/5 border-white/10 text-white placeholder:text-white/20 min-h-[100px]"
                                />
                            </section>
                        </div>

                        {/* FOOTER */}
                        <div className="p-6 border-t border-white/10 bg-zinc-900/95 flex justify-end gap-3 sticky bottom-0 z-10">
                            <Button
                                variant="ghost"
                                onClick={onClose}
                                disabled={loading}
                                className="text-white/60 hover:text-white hover:bg-white/10"
                            >
                                Cancelar
                            </Button>
                            <Button
                                onClick={handleSubmit}
                                disabled={loading || !formData.name.trim()}
                                className="bg-blue-500 hover:bg-blue-600 text-white min-w-[140px]"
                            >
                                {loading ? (
                                    <div className="flex items-center gap-2">
                                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                        <span>Creando...</span>
                                    </div>
                                ) : (
                                    <>
                                        <Save className="w-4 h-4 mr-2" />
                                        Crear proveedor
                                    </>
                                )}
                            </Button>
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    )
}
