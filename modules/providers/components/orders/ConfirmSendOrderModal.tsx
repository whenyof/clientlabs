"use client"

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Mail } from "lucide-react"

export type ConfirmSendOrderModalProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  onConfirmSent: () => void
  onKeepEditing: () => void
  loading?: boolean
}

export function ConfirmSendOrderModal({
  open,
  onOpenChange,
  onConfirmSent,
  onKeepEditing,
  loading = false,
}: ConfirmSendOrderModalProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="max-w-sm bg-[var(--bg-card)] border-[var(--border-main)]"
        onPointerDownOutside={(e) => e.preventDefault()}
      >
        <DialogHeader>
          <DialogTitle className="text-lg font-semibold text-[var(--text-primary)] flex items-center gap-2">
            <Mail className="h-5 w-5 text-[var(--text-secondary)]" />
            ¿Ya has enviado el pedido al proveedor?
          </DialogTitle>
        </DialogHeader>
        <p className="text-sm text-[var(--text-secondary)]">
          Has abierto el correo preparado para este pedido. Confirma si ya lo has enviado o continúa editándolo.
        </p>
        <DialogFooter className="gap-2 sm:gap-0">
          <Button
            type="button"
            variant="outline"
            onClick={onKeepEditing}
            disabled={loading}
          >
            No, seguir editando
          </Button>
          <Button
            type="button"
            onClick={onConfirmSent}
            disabled={loading}
            className="bg-[var(--accent)] hover:opacity-90 text-white"
          >
            {loading ? "Guardando…" : "Sí, confirmar pedido"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
