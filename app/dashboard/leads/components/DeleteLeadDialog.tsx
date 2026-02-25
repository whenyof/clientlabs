"use client"

import { useState } from "react"
import { Trash2, AlertTriangle, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter,
} from "@/components/ui/dialog"
import { deleteLead } from "../actions"
import { toast } from "sonner"
import { useRouter } from "next/navigation"

type DeleteLeadDialogProps = {
    open: boolean
    onClose: () => void
    leadId: string
    leadName: string
    onDeleted?: () => void
}

export function DeleteLeadDialog({ open, onClose, leadId, leadName, onDeleted }: DeleteLeadDialogProps) {
    const router = useRouter()
    const [loading, setLoading] = useState(false)

    const handleDelete = async () => {
        setLoading(true)
        try {
            await deleteLead(leadId)
            toast.success("Lead eliminado correctamente")
            onClose()
            if (onDeleted) {
                onDeleted()
            } else {
                router.refresh()
            }
        } catch (error: any) {
            toast.error(error.message || "Error al eliminar lead")
        } finally {
            setLoading(false)
        }
    }

    return (
        <Dialog open={open} onOpenChange={onClose}>
            <DialogContent className="bg-[var(--bg-card)] border-[var(--border-subtle)]">
                <DialogHeader>
                    <div className="flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-red-500/20 border border-red-500/30">
                            <AlertTriangle className="h-5 w-5 text-red-400" />
                        </div>
                        <div>
                            <DialogTitle className="text-[var(--text-primary)]">¿Eliminar lead?</DialogTitle>
                            <DialogDescription className="text-[var(--text-secondary)]">
                                Esta acción no se puede deshacer
                            </DialogDescription>
                        </div>
                    </div>
                </DialogHeader>

                <div className="py-4">
                    <p className="text-[var(--text-secondary)]">
                        Estás a punto de eliminar permanentemente el lead:{" "}
                        <span className="font-semibold text-[var(--text-primary)]">{leadName}</span>
                    </p>
                    <p className="text-sm text-[var(--text-secondary)] mt-2">
                        Todos los datos asociados (notas, actividades, tags) serán eliminados.
                    </p>
                </div>

                <DialogFooter>
                    <Button
                        variant="outline"
                        onClick={onClose}
                        disabled={loading}
                        className="bg-[var(--bg-main)] border-[var(--border-subtle)] text-[var(--text-primary)] hover:bg-[var(--bg-surface)]"
                    >
                        Cancelar
                    </Button>
                    <Button
                        variant="destructive"
                        onClick={handleDelete}
                        disabled={loading}
                        className="bg-red-500/20 text-red-400 hover:bg-red-500/30 border border-red-500/30"
                    >
                        {loading ? (
                            <>
                                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                Eliminando...
                            </>
                        ) : (
                            <>
                                <Trash2 className="h-4 w-4 mr-2" />
                                Eliminar Lead
                            </>
                        )}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}
