"use client"

import { useState } from "react"
import { Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { toast } from "sonner"

export function CreateClientButton() {
    const [open, setOpen] = useState(false)
    const [loading, setLoading] = useState(false)

    const handleCreate = async () => {
        setLoading(true)
        // Visual-only for now
        setTimeout(() => {
            toast.success("Cliente creado correctamente (demo)")
            setLoading(false)
            setOpen(false)
        }, 1000)
    }

    return (
        <>
            <Button
                onClick={() => setOpen(true)}
                className="gap-2 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white border-0"
            >
                <Plus className="h-4 w-4" />
                Nuevo Cliente
            </Button>

            <Dialog open={open} onOpenChange={setOpen}>
                <DialogContent className="bg-zinc-900 border-white/10">
                    <DialogHeader>
                        <DialogTitle className="text-white">Crear Nuevo Cliente</DialogTitle>
                        <DialogDescription className="text-white/60">
                            Añade un cliente manualmente al sistema
                        </DialogDescription>
                    </DialogHeader>

                    <div className="space-y-4 py-4">
                        <div className="space-y-2">
                            <Label htmlFor="name" className="text-white">Nombre *</Label>
                            <Input
                                id="name"
                                placeholder="Nombre del cliente"
                                className="bg-white/5 border-white/10 text-white"
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="email" className="text-white">Email *</Label>
                            <Input
                                id="email"
                                type="email"
                                placeholder="email@ejemplo.com"
                                className="bg-white/5 border-white/10 text-white"
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="phone" className="text-white">Teléfono</Label>
                            <Input
                                id="phone"
                                placeholder="+34 600 000 000"
                                className="bg-white/5 border-white/10 text-white"
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="value" className="text-white">Valor Estimado</Label>
                            <Input
                                id="value"
                                type="number"
                                placeholder="5000"
                                className="bg-white/5 border-white/10 text-white"
                            />
                        </div>
                    </div>

                    <DialogFooter>
                        <Button
                            variant="outline"
                            onClick={() => setOpen(false)}
                            className="bg-white/5 border-white/10 text-white hover:bg-white/10"
                        >
                            Cancelar
                        </Button>
                        <Button
                            onClick={handleCreate}
                            disabled={loading}
                            className="bg-blue-600 hover:bg-blue-700 text-white"
                        >
                            {loading ? "Creando..." : "Crear Cliente"}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </>
    )
}
