"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { toast } from "sonner"
import { registerClientInteraction } from "../actions"

type CallDialogProps = {
    clientId: string
    isOpen: boolean
    onClose: () => void
    onSuccess: () => void
}

export function CallDialog({ clientId, isOpen, onClose, onSuccess }: CallDialogProps) {
    const [notes, setNotes] = useState("")
    const [loading, setLoading] = useState(false)

    const handleSubmit = async () => {
        if (!notes.trim()) {
            toast.error("Añade notas de la llamada")
            return
        }

        setLoading(true)
        try {
            await registerClientInteraction(clientId, "CALL", notes)
            toast.success("Llamada registrada")
            onSuccess()
            onClose()
            setNotes("")
        } catch (error) {
            toast.error("Error al registrar llamada")
        } finally {
            setLoading(false)
        }
    }

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="bg-zinc-900 border-white/10">
                <DialogHeader>
                    <DialogTitle className="text-white">Registrar Llamada</DialogTitle>
                </DialogHeader>

                <div className="space-y-4 py-4">
                    <div>
                        <Label className="text-white">Notas de la llamada</Label>
                        <Textarea
                            value={notes}
                            onChange={(e) => setNotes(e.target.value)}
                            placeholder="¿De qué hablaron? ¿Cuáles fueron los acuerdos?"
                            className="mt-1 bg-white/5 border-white/10 text-white placeholder:text-white/40"
                            rows={5}
                            autoFocus
                        />
                    </div>
                </div>

                <DialogFooter>
                    <Button
                        variant="outline"
                        onClick={onClose}
                        className="bg-white/5 border-white/10 text-white hover:bg-white/10"
                    >
                        Cancelar
                    </Button>
                    <Button
                        onClick={handleSubmit}
                        disabled={loading || !notes.trim()}
                        className="bg-green-600 hover:bg-green-700"
                    >
                        Registrar Llamada
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}
