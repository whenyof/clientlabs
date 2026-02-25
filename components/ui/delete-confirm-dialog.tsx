import {
 AlertDialog,
 AlertDialogAction,
 AlertDialogCancel,
 AlertDialogContent,
 AlertDialogDescription,
 AlertDialogFooter,
 AlertDialogHeader,
 AlertDialogTitle,
} from "@/components/ui/alert-dialog"

type DeleteConfirmDialogProps = {
 open: boolean
 onOpenChange: (open: boolean) => void
 onConfirm: () => void
 title?: string
 description?: string
 confirmText?: string
 cancelText?: string
}

export function DeleteConfirmDialog({
 open,
 onOpenChange,
 onConfirm,
 title = "¿Estás seguro?",
 description = "Esta acción no se puede deshacer.",
 confirmText = "Eliminar",
 cancelText = "Cancelar"
}: DeleteConfirmDialogProps) {
 const handleConfirm = () => {
 onConfirm()
 onOpenChange(false)
 }

 return (
 <AlertDialog open={open} onOpenChange={onOpenChange}>
 <AlertDialogContent className="bg-zinc-900 border-[var(--border-subtle)]">
 <AlertDialogHeader>
 <AlertDialogTitle className="text-[var(--text-primary)]">{title}</AlertDialogTitle>
 <AlertDialogDescription className="text-[var(--text-secondary)]">
 {description}
 </AlertDialogDescription>
 </AlertDialogHeader>
 <AlertDialogFooter>
 <AlertDialogCancel className="bg-[var(--bg-card)] border-[var(--border-subtle)] text-[var(--text-primary)] hover:bg-[var(--bg-card)]">
 {cancelText}
 </AlertDialogCancel>
 <AlertDialogAction
 onClick={handleConfirm}
 className="bg-[var(--bg-card)] text-[var(--text-primary)] hover:bg-[var(--bg-card)]"
 >
 {confirmText}
 </AlertDialogAction>
 </AlertDialogFooter>
 </AlertDialogContent>
 </AlertDialog>
 )
}
