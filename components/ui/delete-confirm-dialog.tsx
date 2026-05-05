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
 <AlertDialogContent className="bg-white border-slate-200 shadow-xl">
 <AlertDialogHeader>
 <AlertDialogTitle className="text-slate-900">{title}</AlertDialogTitle>
 <AlertDialogDescription className="text-slate-500">
 {description}
 </AlertDialogDescription>
 </AlertDialogHeader>
 <AlertDialogFooter>
 <AlertDialogCancel className="bg-white border-slate-200 text-slate-700 hover:bg-slate-50">
 {cancelText}
 </AlertDialogCancel>
 <AlertDialogAction
 onClick={handleConfirm}
 className="bg-red-600 text-white hover:bg-red-700 border-0"
 >
 {confirmText}
 </AlertDialogAction>
 </AlertDialogFooter>
 </AlertDialogContent>
 </AlertDialog>
 )
}
