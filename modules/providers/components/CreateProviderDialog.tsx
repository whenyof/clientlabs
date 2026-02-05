"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { toast } from "sonner"
import { createProvider } from "../actions"

import { useSectorConfig } from "@/hooks/useSectorConfig"

type CreateProviderDialogProps = {
    open: boolean
    onOpenChange: (open: boolean) => void
    onProviderCreated: (provider: any) => void
}

export function CreateProviderDialog({ open, onOpenChange, onProviderCreated }: CreateProviderDialogProps) {
    const { labels } = useSectorConfig()
    const [loading, setLoading] = useState(false)
    const [formData, setFormData] = useState({
        name: "",
        type: "OTHER" as "SERVICE" | "PRODUCT" | "SOFTWARE" | "OTHER",
        monthlyCost: "",
        dependency: "LOW" as "LOW" | "MEDIUM" | "HIGH" | "CRITICAL",
        contactEmail: "",
        contactPhone: "",
        website: "",
        notes: ""
    })

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()

        if (!formData.name.trim()) {
            toast.error("El nombre es obligatorio")
            return
        }

        setLoading(true)

        try {
            const result = await createProvider({
                name: formData.name,
                type: formData.type,
                monthlyCost: formData.monthlyCost ? parseFloat(formData.monthlyCost) : null,
                dependency: formData.dependency,
                isCritical: formData.dependency === 'CRITICAL' || formData.dependency === 'HIGH',
                contactEmail: formData.contactEmail || null,
                contactPhone: formData.contactPhone || null,
                website: formData.website || null,
                notes: formData.notes || null,
                status: "ACTIVE"
            })

            if (result.success && result.provider) {
                toast.success(labels.common.success)
                onProviderCreated(result.provider)
                onOpenChange(false)
                // Reset form
                setFormData({
                    name: "",
                    type: "OTHER",
                    monthlyCost: "",
                    dependency: "LOW",
                    contactEmail: "",
                    contactPhone: "",
                    website: "",
                    notes: ""
                })
            } else {
                toast.error(result.error || labels.common.error)
            }
        } catch (error) {
            toast.error(labels.common.error)
        } finally {
            setLoading(false)
        }
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="bg-zinc-900 border-white/10 max-w-2xl">
                <DialogHeader>
                    <DialogTitle className="text-white">{labels.providers.newButton}</DialogTitle>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-4">
                    {/* Name */}
                    <div>
                        <Label htmlFor="name" className="text-white/80">{labels.providers.fields.name} *</Label>
                        <Input
                            id="name"
                            value={formData.name}
                            onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                            className="bg-white/5 border-white/10 text-white"
                            placeholder="Ej: AWS, Google Workspace, etc."
                            required
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        {/* Type */}
                        <div>
                            <Label htmlFor="type" className="text-white/80">{labels.providers.fields.type}</Label>
                            <Select
                                value={formData.type}
                                onValueChange={(value: any) => setFormData(prev => ({ ...prev, type: value }))}
                            >
                                <SelectTrigger className="bg-white/5 border-white/10 text-white">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent className="bg-zinc-900 border-white/10">
                                    <SelectItem value="SERVICE">{labels.providers.types.SERVICE}</SelectItem>
                                    <SelectItem value="PRODUCT">{labels.providers.types.PRODUCT}</SelectItem>
                                    <SelectItem value="SOFTWARE">{labels.providers.types.SOFTWARE}</SelectItem>
                                    <SelectItem value="OTHER">{labels.providers.types.OTHER}</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        {/* Monthly Cost */}
                        <div>
                            <Label htmlFor="monthlyCost" className="text-white/80">{labels.providers.fields.monthlyCost} (€)</Label>
                            <Input
                                id="monthlyCost"
                                type="number"
                                step="0.01"
                                value={formData.monthlyCost}
                                onChange={(e) => setFormData(prev => ({ ...prev, monthlyCost: e.target.value }))}
                                className="bg-white/5 border-white/10 text-white"
                                placeholder="0.00"
                            />
                        </div>
                    </div>

                    {/* Dependency */}
                    <div>
                        <Label htmlFor="dependency" className="text-white/80">{labels.providers.fields.dependencyLevel}</Label>
                        <Select
                            value={formData.dependency}
                            onValueChange={(value: any) => setFormData(prev => ({ ...prev, dependency: value }))}
                        >
                            <SelectTrigger className="bg-white/5 border-white/10 text-white">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent className="bg-zinc-900 border-white/10">
                                <SelectItem value="LOW">{labels.providers.dependency.LOW}</SelectItem>
                                <SelectItem value="MEDIUM">{labels.providers.dependency.MEDIUM}</SelectItem>
                                <SelectItem value="HIGH">{labels.providers.dependency.HIGH}</SelectItem>
                                <SelectItem value="CRITICAL">{labels.providers.dependency.CRITICAL}</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        {/* Contact Email */}
                        <div>
                            <Label htmlFor="contactEmail" className="text-white/80">{labels.providers.fields.contactEmail}</Label>
                            <Input
                                id="contactEmail"
                                type="email"
                                value={formData.contactEmail}
                                onChange={(e) => setFormData(prev => ({ ...prev, contactEmail: e.target.value }))}
                                className="bg-white/5 border-white/10 text-white"
                                placeholder="soporte@proveedor.com"
                            />
                        </div>

                        {/* Contact Phone */}
                        <div>
                            <Label htmlFor="contactPhone" className="text-white/80">{labels.providers.fields.contactPhone}</Label>
                            <Input
                                id="contactPhone"
                                value={formData.contactPhone}
                                onChange={(e) => setFormData(prev => ({ ...prev, contactPhone: e.target.value }))}
                                className="bg-white/5 border-white/10 text-white"
                                placeholder="+34 600 000 000"
                            />
                        </div>
                    </div>

                    {/* Website */}
                    <div>
                        <Label htmlFor="website" className="text-white/80">{labels.providers.fields.website}</Label>
                        <Input
                            id="website"
                            type="url"
                            value={formData.website}
                            onChange={(e) => setFormData(prev => ({ ...prev, website: e.target.value }))}
                            className="bg-white/5 border-white/10 text-white"
                            placeholder="https://proveedor.com"
                        />
                    </div>

                    {/* Notes */}
                    <div>
                        <Label htmlFor="notes" className="text-white/80">Notas</Label>
                        <Textarea
                            id="notes"
                            value={formData.notes}
                            onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                            className="bg-white/5 border-white/10 text-white resize-none"
                            placeholder="Información adicional sobre el proveedor..."
                            rows={3}
                        />
                    </div>

                    {/* Actions */}
                    <div className="flex justify-end gap-3 pt-4">
                        <Button
                            type="button"
                            variant="ghost"
                            onClick={() => onOpenChange(false)}
                            className="text-white/60 hover:text-white hover:bg-white/10"
                        >
                            {labels.common.cancel}
                        </Button>
                        <Button
                            type="submit"
                            disabled={loading}
                            className="bg-blue-500 hover:bg-blue-600 text-white"
                        >
                            {loading ? labels.common.loading : labels.common.create}
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    )
}

