"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { toast } from "sonner"
import { createProviderOrder } from "../actions"
import { useRouter } from "next/navigation"

import { useSectorConfig } from "@/hooks/useSectorConfig"

type RegisterOrderDialogProps = {
    providerId: string
    providerName: string
    open: boolean
    onOpenChange: (open: boolean) => void
    onSuccess?: () => void
}

export function RegisterOrderDialog({ providerId, providerName, open, onOpenChange, onSuccess }: RegisterOrderDialogProps) {
    const { labels, features } = useSectorConfig()
    const [loading, setLoading] = useState(false)
    const router = useRouter()

    const [formData, setFormData] = useState({
        description: "",
        amount: "",
        orderDate: new Date().toISOString().split('T')[0],
        type: "ONE_TIME",
        status: "PENDING",
        createPayment: true
    })

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()

        if (!formData.amount || parseFloat(formData.amount) < 0) {
            toast.error("El importe no puede ser negativo")
            return
        }

        setLoading(true)

        try {
            const result = await createProviderOrder({
                providerId,
                orderDate: new Date(formData.orderDate),
                amount: parseFloat(formData.amount),
                description: formData.description,
                type: formData.type as any,
                status: "PENDING" as any,
            })

            if (result.success) {
                toast.success(labels.common.success)
                onOpenChange(false)
                if (onSuccess) onSuccess()
                router.refresh()

                // Reset form
                setFormData({
                    description: "",
                    amount: "",
                    orderDate: new Date().toISOString().split('T')[0],
                    type: "ONE_TIME",
                    status: "PENDING",
                    createPayment: true
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
            <DialogContent className="bg-zinc-900 border-white/10 max-w-md">
                <DialogHeader>
                    <DialogTitle className="text-white">{labels.providers.actions.newOrder}</DialogTitle>
                    <p className="text-sm text-white/60">{providerName}</p>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-4">
                    {/* Concept */}
                    <div className="space-y-2">
                        <Label htmlFor="description" className="text-zinc-400">Concepto / Nombre</Label>
                        <Input
                            id="description"
                            value={formData.description}
                            onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                            className="bg-zinc-800 border-white/5 text-white"
                            placeholder="Ej: Licencias SaaS Anuales"
                            required
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        {/* Amount */}
                        <div className="space-y-2">
                            <Label htmlFor="amount" className="text-zinc-400">Importe (€)</Label>
                            <Input
                                id="amount"
                                type="number"
                                step="0.01"
                                value={formData.amount}
                                onChange={(e) => setFormData(prev => ({ ...prev, amount: e.target.value }))}
                                className="bg-zinc-800 border-white/5 text-white"
                                placeholder="0.00"
                                required
                            />
                        </div>

                        {/* Date */}
                        <div className="space-y-2">
                            <Label htmlFor="orderDate" className="text-zinc-400">Fecha</Label>
                            <Input
                                id="orderDate"
                                type="date"
                                value={formData.orderDate}
                                onChange={(e) => setFormData(prev => ({ ...prev, orderDate: e.target.value }))}
                                className="bg-zinc-800 border-white/5 text-white"
                                required
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        {/* Type */}
                        <div className="space-y-2">
                            <Label className="text-zinc-400">Tipo</Label>
                            <Select
                                value={formData.type}
                                onValueChange={(v) => setFormData(prev => ({ ...prev, type: v }))}
                            >
                                <SelectTrigger className="bg-zinc-800 border-white/5 text-white">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent className="bg-zinc-900 border-white/10 text-white">
                                    <SelectItem value="ONE_TIME">{labels.orders.types.ONE_TIME}</SelectItem>
                                    <SelectItem value="RECURRING">{labels.orders.types.RECURRING}</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        {/* Status */}
                        <div className="space-y-2">
                            <Label className="text-zinc-400">Estado</Label>
                            <Select
                                value={formData.status}
                                onValueChange={(v) => setFormData(prev => ({ ...prev, status: v }))}
                            >
                                <SelectTrigger className="bg-zinc-800 border-white/5 text-white">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent className="bg-zinc-900 border-white/10 text-white">
                                    <SelectItem value="PENDING">{labels.orders.status.PENDING}</SelectItem>
                                    <SelectItem value="COMPLETED">{labels.orders.status.COMPLETED}</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    {/* Auto Payment Toggle */}
                    {features.providers.allowAutoPayment && (formData.status === "COMPLETED" || formData.status === "PAID") && (
                        <div className="flex items-center space-x-2 pt-2 pb-2">
                            <Checkbox
                                id="createPayment"
                                checked={formData.createPayment}
                                onCheckedChange={(checked) => setFormData(prev => ({ ...prev, createPayment: checked as boolean }))}
                                className="border-white/20 data-[state=checked]:bg-blue-500"
                            />
                            <Label
                                htmlFor="createPayment"
                                className="text-sm font-medium leading-none text-white/80 cursor-pointer"
                            >
                                Generar pago automáticamente
                            </Label>
                        </div>
                    )}

                    <DialogFooter className="pt-4 border-t border-white/5">
                        <Button
                            type="button"
                            variant="ghost"
                            onClick={() => onOpenChange(false)}
                            className="text-white/60 hover:text-white"
                        >
                            {labels.common.cancel}
                        </Button>
                        <Button
                            type="submit"
                            disabled={loading}
                            className="bg-blue-500 hover:bg-blue-600 text-white"
                        >
                            {loading ? labels.common.loading : labels.providers.actions.newOrder}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    )
}
