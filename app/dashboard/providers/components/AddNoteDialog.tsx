"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { toast } from "sonner"
import { addProviderNote } from "../actions"
import { useRouter } from "next/navigation"

type AddNoteDialogProps = {
    providerId: string
    providerName: string
    open: boolean
    onOpenChange: (open: boolean) => void
    onSuccess?: () => void
}

export function AddNoteDialog({ providerId, providerName, open, onOpenChange, onSuccess }: AddNoteDialogProps) {
    const [loading, setLoading] = useState(false)
    const [content, setContent] = useState("")
    const router = useRouter()

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()

        if (!content.trim()) {
            toast.error("La nota no puede estar vacía")
            return
        }

        setLoading(true)

        try {
            const result = await addProviderNote(providerId, content)

            if (result.success) {
                toast.success("Nota añadida correctamente")
                onOpenChange(false)
                router.refresh() // Refresh server data
                if (onSuccess) onSuccess()
                setContent("") // Reset form
            } else {
                toast.error(result.error || "Error al añadir nota")
            }
        } catch (error) {
            toast.error("Error al añadir nota")
        } finally {
            setLoading(false)
        }
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="bg-zinc-900 border-white/10 max-w-md">
                <DialogHeader>
                    <DialogTitle className="text-white">Añadir nota</DialogTitle>
                    <p className="text-sm text-white/60">{providerName}</p>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-4">
                    {/* Content */}
                    <div>
                        <Label htmlFor="content" className="text-white/80">Nota *</Label>
                        <Textarea
                            id="content"
                            value={content}
                            onChange={(e) => setContent(e.target.value)}
                            className="bg-white/5 border-white/10 text-white resize-none"
                            placeholder="Escribe tu nota aquí..."
                            rows={5}
                            required
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
                            Cancelar
                        </Button>
                        <Button
                            type="submit"
                            disabled={loading}
                            className="bg-blue-500 hover:bg-blue-600 text-white"
                        >
                            {loading ? "Añadiendo..." : "Añadir nota"}
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    )
}
