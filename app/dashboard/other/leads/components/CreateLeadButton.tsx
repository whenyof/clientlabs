"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Plus, Loader2 } from "lucide-react"
import { createLead } from "../actions"

export function CreateLeadButton() {
    const router = useRouter()
    const [open, setOpen] = useState(false)
    const [loading, setLoading] = useState(false)
    const [formData, setFormData] = useState({
        name: "",
        email: "",
        phone: "",
        source: "",
    })

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!formData.name.trim()) return

        setLoading(true)
        try {
            await createLead(formData)
            setFormData({ name: "", email: "", phone: "", source: "" })
            setOpen(false)
            router.refresh()
            alert("✅ Lead creado correctamente")
        } catch (error) {
            console.error(error)
            alert("❌ Error al crear lead")
        } finally {
            setLoading(false)
        }
    }

    return (
        <>
            <Button
                onClick={() => setOpen(true)}
                className="gap-2 bg-gradient-to-r from-blue-500/20 to-purple-500/20 border-blue-500/30 text-white hover:from-blue-500/30 hover:to-purple-500/30 hover:border-blue-500/50 transition-all shadow-lg shadow-blue-500/10"
            >
                <Plus className="h-4 w-4" />
                Nuevo Lead
            </Button>

            <Dialog open={open} onOpenChange={setOpen}>
                <DialogContent className="bg-zinc-900 border-white/10">
                    <DialogHeader>
                        <DialogTitle className="text-white text-xl">Crear Nuevo Lead</DialogTitle>
                    </DialogHeader>
                    <form onSubmit={handleSubmit}>
                        <div className="space-y-4">
                            <div>
                                <Label htmlFor="name" className="text-white/80">
                                    Nombre <span className="text-red-500">*</span>
                                </Label>
                                <Input
                                    id="name"
                                    value={formData.name}
                                    onChange={(e) =>
                                        setFormData({ ...formData, name: e.target.value })
                                    }
                                    placeholder="Juan Pérez"
                                    required
                                    className="bg-white/5 border-white/10 text-white placeholder:text-white/40 mt-2"
                                />
                            </div>
                            <div>
                                <Label htmlFor="email" className="text-white/80">Email</Label>
                                <Input
                                    id="email"
                                    type="email"
                                    value={formData.email}
                                    onChange={(e) =>
                                        setFormData({ ...formData, email: e.target.value })
                                    }
                                    placeholder="juan@example.com"
                                    className="bg-white/5 border-white/10 text-white placeholder:text-white/40 mt-2"
                                />
                            </div>
                            <div>
                                <Label htmlFor="phone" className="text-white/80">Teléfono</Label>
                                <Input
                                    id="phone"
                                    value={formData.phone}
                                    onChange={(e) =>
                                        setFormData({ ...formData, phone: e.target.value })
                                    }
                                    placeholder="+34 600 000 000"
                                    className="bg-white/5 border-white/10 text-white placeholder:text-white/40 mt-2"
                                />
                            </div>
                            <div>
                                <Label htmlFor="source" className="text-white/80">Fuente</Label>
                                <Input
                                    id="source"
                                    value={formData.source}
                                    onChange={(e) =>
                                        setFormData({ ...formData, source: e.target.value })
                                    }
                                    placeholder="Web, Referido, LinkedIn..."
                                    className="bg-white/5 border-white/10 text-white placeholder:text-white/40 mt-2"
                                />
                            </div>
                        </div>
                        <DialogFooter className="mt-6">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => setOpen(false)}
                            >
                                Cancelar
                            </Button>
                            <Button
                                type="submit"
                                disabled={loading || !formData.name.trim()}
                                className="bg-blue-500/20 border-blue-500/30 text-blue-400 hover:bg-blue-500/30"
                            >
                                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                Crear Lead
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>
        </>
    )
}
