"use client"

import { useState, useCallback } from "react"
import { useRouter } from "next/navigation"
import {
 ShoppingCartIcon,
 DocumentPlusIcon,
 BanknotesIcon,
 BellAlertIcon,
 PencilSquareIcon,
 CalendarDaysIcon,
} from "@heroicons/react/24/outline"
import { SaleDialog } from "@/modules/clients/components/SaleDialog"
import { ReminderDialog } from "@/modules/clients/components/ReminderDialog"
import { TaskDialog } from "@/components/tasks/TaskDialog"
import { addClientNote } from "@/modules/clients/actions"
import {
 Dialog,
 DialogContent,
 DialogHeader,
 DialogTitle,
 DialogFooter,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { toast } from "sonner"

// ---------------------------------------------------------------------------
// Action button config
// ---------------------------------------------------------------------------

interface ActionButton {
 id: string
 label: string
 icon: React.ComponentType<React.SVGProps<SVGSVGElement>>
 gradient: string
 hoverGlow: string
}

const ACTIONS: ActionButton[] = [
 {
 id: "sale",
 label: "Nueva venta",
 icon: ShoppingCartIcon,
 gradient: " ",
 hoverGlow: "hover:shadow-emerald-500/25",
 },
 {
 id: "invoice",
 label: "Nueva factura",
 icon: DocumentPlusIcon,
 gradient: " ",
 hoverGlow: "hover:shadow-blue-500/25",
 },
 {
 id: "payment",
 label: "Registrar pago",
 icon: BanknotesIcon,
 gradient: " ",
 hoverGlow: "hover:shadow-emerald-500/25",
 },
 {
 id: "reminder",
 label: "Recordatorio",
 icon: BellAlertIcon,
 gradient: " ",
 hoverGlow: "hover:shadow-amber-500/25",
 },
 {
 id: "note",
 label: "Añadir nota",
 icon: PencilSquareIcon,
 gradient: " ",
 hoverGlow: "hover:shadow-pink-500/25",
 },
 {
 id: "task",
 label: "Programar tarea",
 icon: CalendarDaysIcon,
 gradient: " ",
 hoverGlow: "hover:shadow-cyan-500/25",
 },
]

// ---------------------------------------------------------------------------
// Note dialog (lightweight inline)
// ---------------------------------------------------------------------------

function NoteDialog({
 open,
 onOpenChange,
 clientId,
}: {
 open: boolean
 onOpenChange: (open: boolean) => void
 clientId: string
}) {
 const [note, setNote] = useState("")
 const [loading, setLoading] = useState(false)

 const handleSubmit = async () => {
 if (!note.trim()) {
 toast.error("Escribe una nota")
 return
 }
 setLoading(true)
 try {
 await addClientNote(clientId, note.trim())
 toast.success("Nota añadida")
 onOpenChange(false)
 setNote("")
 } catch {
 toast.error("Error al guardar nota")
 } finally {
 setLoading(false)
 }
 }

 return (
 <Dialog open={open} onOpenChange={onOpenChange}>
 <DialogContent className="bg-zinc-900 border-[var(--border-subtle)]">
 <DialogHeader>
 <DialogTitle className="text-[var(--text-primary)]">Añadir Nota</DialogTitle>
 </DialogHeader>
 <div className="py-4">
 <Label className="text-[var(--text-primary)]">Nota</Label>
 <Textarea
 value={note}
 onChange={(e) => setNote(e.target.value)}
 placeholder="Escribe una nota sobre este cliente..."
 className="mt-1 bg-[var(--bg-card)] border-[var(--border-subtle)] text-[var(--text-primary)] placeholder:text-[var(--text-secondary)]"
 rows={4}
 autoFocus
 />
 </div>
 <DialogFooter>
 <Button
 variant="outline"
 onClick={() => onOpenChange(false)}
 className="bg-[var(--bg-card)] border-[var(--border-subtle)] text-[var(--text-primary)] hover:bg-[var(--bg-card)]"
 >
 Cancelar
 </Button>
 <Button
 onClick={handleSubmit}
 disabled={loading || !note.trim()}
 className="bg-pink-600 hover:bg-pink-700"
 >
 Guardar Nota
 </Button>
 </DialogFooter>
 </DialogContent>
 </Dialog>
 )
}

// ---------------------------------------------------------------------------
// Main component
// ---------------------------------------------------------------------------

interface ClientQuickActionsProps {
 clientId: string
 clientName: string
}

export function ClientQuickActions({ clientId, clientName }: ClientQuickActionsProps) {
 const router = useRouter()

 const [saleOpen, setSaleOpen] = useState(false)
 const [reminderOpen, setReminderOpen] = useState(false)
 const [noteOpen, setNoteOpen] = useState(false)
 const [taskOpen, setTaskOpen] = useState(false)

 const handleAction = useCallback(
 (actionId: string) => {
 switch (actionId) {
 case "sale":
 setSaleOpen(true)
 break
 case "invoice":
 // Navigate to invoicing with client pre-selected
 router.push(`/dashboard/finance/billing?create=true&clientId=${clientId}`)
 break
 case "payment":
 // Navigate to invoicing payment view
 router.push(`/dashboard/finance/billing?clientFilter=${clientId}`)
 break
 case "reminder":
 setReminderOpen(true)
 break
 case "note":
 setNoteOpen(true)
 break
 case "task":
 setTaskOpen(true)
 break
 }
 },
 [router, clientId]
 )

 const handleSuccess = useCallback(() => {
 router.refresh()
 }, [router])

 return (
 <>
 {/* ─── Actions bar ─── */}
 <div
 id="client360-quick-actions"
 className="
 flex flex-wrap items-center gap-2
 "
 >
 {ACTIONS.map((action) => {
 const Icon = action.icon
 return (
 <button
 key={action.id}
 onClick={() => handleAction(action.id)}
 className={`
 group relative inline-flex items-center gap-2
 px-3.5 py-2 rounded-xl
 bg-[var(--bg-card)]/60 backdrop-
 border border-[var(--border-subtle)]
 text-sm font-semibold text-[var(--text-secondary)]
 transition-all duration-250
 hover:bg-[var(--bg-card)]/80 hover:text-[var(--text-primary)]
 hover:border-[var(--border-subtle)]
 hover:shadow-sm ${action.hoverGlow}
 active:scale-[0.97]
 `}
 >
 {/* Gradient icon */}
 <span
 className={`
 inline-flex items-center justify-center
 w-7 h-7 rounded-lg
 bg-[var(--bg-card)] ${action.gradient}
 shadow-md
 group-hover:shadow-sm
 transition-shadow duration-250
 `}
 >
 <Icon className="w-3.5 h-3.5 text-[var(--text-primary)]" />
 </span>

 {/* Label */}
 <span className="hidden sm:inline">{action.label}</span>

 {/* Ambient glow on hover */}
 <span
 className={`
 absolute inset-0 rounded-xl opacity-0
 group-hover:opacity-100
 bg-[var(--bg-card)] ${action.gradient}
 -z-10
 transition-opacity duration-300
 `}
 style={{ opacity: 0.06 }}
 />
 </button>
 )
 })}
 </div>

 {/* ─── Dialogs ─── */}

 {/* New Sale */}
 <SaleDialog
 clientId={clientId}
 isOpen={saleOpen}
 onClose={() => setSaleOpen(false)}
 onSuccess={handleSuccess}
 />

 {/* Reminder */}
 <ReminderDialog
 clientId={clientId}
 isOpen={reminderOpen}
 onClose={() => setReminderOpen(false)}
 onSuccess={handleSuccess}
 />

 {/* Note */}
 <NoteDialog
 open={noteOpen}
 onOpenChange={setNoteOpen}
 clientId={clientId}
 />

 {/* Task */}
 <TaskDialog
 open={taskOpen}
 onOpenChange={setTaskOpen}
 clientId={clientId}
 entityName={clientName}
 onSuccess={handleSuccess}
 />
 </>
 )
}
