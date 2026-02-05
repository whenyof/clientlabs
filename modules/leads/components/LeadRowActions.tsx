"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import type { Lead } from "@prisma/client"
import { Button } from "@/components/ui/button"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
    DropdownMenuSeparator,
    DropdownMenuLabel,
} from "@/components/ui/dropdown-menu"
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import {
    MoreVertical,
    MessageSquare,
    XCircle,
    CheckCircle,
    Mail,
    ExternalLink,
    Loader2,
    Trash2
} from "lucide-react"
import { changeLeadStatus, addLeadNote, markLeadLost, convertLeadToClient } from "../actions"
import { toast } from "sonner"
import { DeleteLeadDialog } from "./DeleteLeadDialog"
import { useSectorConfig } from "@/hooks/useSectorConfig"

export function LeadRowActions({ lead }: { lead: Lead }) {
    const { labels } = useSectorConfig()
    const ui = labels.leads.ui
    const statusLabels = labels.leads.status as Record<string, string>
    const router = useRouter()
    const [loading, setLoading] = useState(false)
    const [noteDialog, setNoteDialog] = useState(false)
    const [lostDialog, setLostDialog] = useState(false)
    const [convertDialog, setConvertDialog] = useState(false)
    const [deleteDialog, setDeleteDialog] = useState(false)
    const [note, setNote] = useState("")
    const [lostReason, setLostReason] = useState("")

    const isReadOnly = lead.leadStatus === "CONVERTED" || lead.leadStatus === "LOST"

    const handleStatusChange = async (status: typeof lead.leadStatus) => {
        setLoading(true)
        try {
            await changeLeadStatus(lead.id, status)
            router.refresh()
            toast.success(`${labels.leads.singular} marcado como ${(statusLabels[status] ?? status).toLowerCase()}`)
        } catch (error) {
            console.error(error)
            toast.error(ui.toastErrorStatus)
        } finally {
            setLoading(false)
        }
    }

    const handleAddNote = async () => {
        if (!note.trim()) return
        setLoading(true)
        try {
            await addLeadNote(lead.id, note)
            setNote("")
            setNoteDialog(false)
            router.refresh()
            toast.success(ui.toastNoteSaved)
        } catch (error) {
            console.error(error)
            const message = error instanceof Error ? error.message : ui.toastErrorNote
            toast.error(message)
        } finally {
            setLoading(false)
        }
    }

    const handleEmailClick = () => {
        if (!lead.email) return
        window.location.href = `mailto:${lead.email}?subject=Contacto desde ClientLabs`
    }

    const handleMarkLost = async () => {
        if (!lostReason.trim()) return
        setLoading(true)
        try {
            await markLeadLost(lead.id, lostReason)
            setLostReason("")
            setLostDialog(false)
            router.refresh()
            toast.success(ui.toastMarkedLost)
        } catch (error) {
            console.error(error)
            toast.error(ui.toastErrorConvert)
        } finally {
            setLoading(false)
        }
    }

    const handleConvert = async () => {
        setLoading(true)
        try {
            const result = await convertLeadToClient(lead.id)
            setConvertDialog(false)
            router.refresh()
            toast.success(result.clientCreated ? ui.toastConverted : ui.toastConvertedLinked)
        } catch (error) {
            console.error(error)
            const message = error instanceof Error ? error.message : ui.toastErrorConvert
            toast.error(message)
        } finally {
            setLoading(false)
        }
    }

    return (
        <>
            <div className="flex items-center justify-end gap-1.5">
                {/* View Client button for converted leads */}
                {lead.leadStatus === "CONVERTED" && lead.clientId && (
                    <Link href="/dashboard/clients">
                        <Button
                            size="sm"
                            variant="outline"
                            className="h-9 text-xs gap-1.5 bg-emerald-500/10 border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/20"
                        >
                            <ExternalLink className="h-3.5 w-3.5" />
                            {ui.viewClient}
                        </Button>
                    </Link>
                )}

                {/* Quick Action Buttons */}
                {!isReadOnly && (
                    <>
                        {/* Add Note - Gray */}
                        <Button
                            size="sm"
                            variant="outline"
                            onClick={() => setNoteDialog(true)}
                            disabled={loading}
                            className="h-9 w-9 p-0 bg-white/5 border-white/20 text-white/60 hover:bg-white/10 hover:text-white hover:border-white/30 transition-all"
                            title={ui.addNote}
                        >
                            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <MessageSquare className="h-4 w-4" />}
                        </Button>

                        {/* Send Email - Blue */}
                        <Button
                            size="sm"
                            variant="outline"
                            onClick={handleEmailClick}
                            disabled={!lead.email}
                            className="h-9 w-9 p-0 bg-blue-500/10 border-blue-500/30 text-blue-400 hover:bg-blue-500/20 hover:border-blue-500/50 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                            title={lead.email ? `${ui.sendEmail} ${lead.email}` : ui.noEmail}
                        >
                            <Mail className="h-4 w-4" />
                        </Button>

                        {/* Convert to Client - Green */}
                        <Button
                            size="sm"
                            variant="outline"
                            onClick={() => setConvertDialog(true)}
                            disabled={loading}
                            className="h-9 w-9 p-0 bg-green-500/10 border-green-500/30 text-green-400 hover:bg-green-500/20 hover:border-green-500/50 transition-all"
                            title={ui.convertToClientShort}
                        >
                            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle className="h-4 w-4" />}
                        </Button>

                        {/* Mark Lost - Red Outline */}
                        <Button
                            size="sm"
                            variant="outline"
                            onClick={() => setLostDialog(true)}
                            disabled={loading}
                            className="h-9 w-9 p-0 border-red-500/30 text-red-400 hover:bg-red-500/10 hover:border-red-500/50 transition-all"
                            title={ui.markLostShort}
                        >
                            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <XCircle className="h-4 w-4" />}
                        </Button>
                    </>
                )}

                {/* More Actions Dropdown */}
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button
                            size="sm"
                            variant="ghost"
                            disabled={loading}
                            className="h-9 w-9 p-0 hover:bg-white/10 transition-all"
                        >
                            <MoreVertical className="h-4 w-4" />
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-48">
                        <DropdownMenuLabel className="text-xs text-white/60">{ui.changeStatus}</DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onClick={() => handleStatusChange("NEW")} disabled={isReadOnly}>
                            {ui.markAs} {statusLabels.NEW}
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleStatusChange("CONTACTED")} disabled={isReadOnly}>
                            {ui.markAs} {statusLabels.CONTACTED}
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleStatusChange("INTERESTED")} disabled={isReadOnly}>
                            {ui.markAs} {statusLabels.INTERESTED}
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleStatusChange("QUALIFIED")} disabled={isReadOnly}>
                            {ui.markAs} {statusLabels.QUALIFIED}
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                            onClick={() => setDeleteDialog(true)}
                            disabled={lead.leadStatus === "CONVERTED"}
                            className="text-red-400 hover:bg-red-500/10 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            <Trash2 className="h-4 w-4 mr-2" />
                            {ui.deleteLead}
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>

            {/* Note Dialog */}
            <Dialog open={noteDialog} onOpenChange={setNoteDialog}>
                <DialogContent className="bg-zinc-900 border-white/10">
                    <DialogHeader>
                        <DialogTitle className="text-white">{ui.addNote}</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4">
                        <div>
                            <Label className="text-white/80">{ui.noteLabel}</Label>
                            <Textarea
                                value={note}
                                onChange={(e) => setNote(e.target.value)}
                                placeholder={ui.notePlaceholder}
                                rows={4}
                                className="bg-white/5 border-white/10 text-white placeholder:text-white/40 mt-2"
                            />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setNoteDialog(false)}>
                            {labels.common.cancel}
                        </Button>
                        <Button
                            onClick={handleAddNote}
                            disabled={loading || !note.trim()}
                            className="bg-blue-500/20 border-blue-500/30 text-blue-400 hover:bg-blue-500/30"
                        >
                            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            {labels.common.save}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Lost Dialog */}
            <Dialog open={lostDialog} onOpenChange={setLostDialog}>
                <DialogContent className="bg-zinc-900 border-white/10">
                    <DialogHeader>
                        <DialogTitle className="text-white">{ui.lostDialogTitle}</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4">
                        <div>
                            <Label className="text-white/80">{ui.reason}</Label>
                            <Input
                                value={lostReason}
                                onChange={(e) => setLostReason(e.target.value)}
                                placeholder={ui.lostReasonPlaceholder}
                                className="bg-white/5 border-white/10 text-white placeholder:text-white/40 mt-2"
                            />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setLostDialog(false)}>
                            {labels.common.cancel}
                        </Button>
                        <Button
                            onClick={handleMarkLost}
                            disabled={loading || !lostReason.trim()}
                            className="bg-red-500/20 border-red-500/30 text-red-400 hover:bg-red-500/30"
                        >
                            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            {ui.markLostShort}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Convert Confirmation Dialog */}
            <Dialog open={convertDialog} onOpenChange={setConvertDialog}>
                <DialogContent className="bg-zinc-900 border-white/10">
                    <DialogHeader>
                        <DialogTitle className="text-white text-xl">{ui.convertDialogTitle}</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4">
                        <div className="p-4 rounded-lg bg-amber-500/10 border border-amber-500/30">
                            <p className="text-sm text-amber-300 font-medium mb-2">⚠️ {ui.convertIrreversible}</p>
                            <ul className="text-xs text-white/70 space-y-1">
                                <li>• {ui.convertBullet1}</li>
                                <li>• {ui.convertBullet2}</li>
                                <li>• {ui.convertBullet3}</li>
                            </ul>
                        </div>
                        <div className="p-3 rounded-lg bg-white/5">
                            <p className="text-sm text-white/80"><strong>{labels.leads.singular}:</strong> {lead.name}</p>
                            <p className="text-xs text-white/60">{lead.email}</p>
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setConvertDialog(false)}>
                            {labels.common.cancel}
                        </Button>
                        <Button
                            onClick={handleConvert}
                            disabled={loading}
                            className="bg-emerald-500/20 border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/30"
                        >
                            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            {ui.confirmConvert}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Delete Dialog */}
            <DeleteLeadDialog
                open={deleteDialog}
                onClose={() => setDeleteDialog(false)}
                leadId={lead.id}
                leadName={lead.name || "Sin nombre"}
                onDeleted={() => router.refresh()}
            />
        </>
    )
}
