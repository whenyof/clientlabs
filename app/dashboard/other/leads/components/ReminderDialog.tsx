"use client"

import { useState } from "react"
import { Calendar, Clock, CalendarDays } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
    DialogDescription,
} from "@/components/ui/dialog"

type ReminderDialogProps = {
    open: boolean
    onClose: () => void
    onSave: (date: Date, note: string) => void
    loading?: boolean
}

export function ReminderDialog({ open, onClose, onSave, loading }: ReminderDialogProps) {
    const [selectedDate, setSelectedDate] = useState("")
    const [note, setNote] = useState("")

    const handleQuickSelect = (days: number) => {
        const date = new Date()
        date.setDate(date.getDate() + days)
        setSelectedDate(date.toISOString().split("T")[0])
    }

    const handleSave = () => {
        if (!selectedDate) return
        const date = new Date(selectedDate)
        onSave(date, note)
        setSelectedDate("")
        setNote("")
    }

    return (
        <Dialog open={open} onOpenChange={onClose}>
            <DialogContent className="bg-zinc-900 border-white/10">
                <DialogHeader>
                    <DialogTitle className="text-white">Crear Recordatorio</DialogTitle>
                    <DialogDescription className="text-white/60">
                        Programa un recordatorio para este lead
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-4">
                    {/* Quick Presets */}
                    <div>
                        <Label className="text-white/80 text-sm mb-2 block">Acceso rápido</Label>
                        <div className="grid grid-cols-3 gap-2">
                            <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={() => handleQuickSelect(1)}
                                className="bg-white/5 border-white/10 text-white hover:bg-white/10"
                            >
                                <Calendar className="h-3 w-3 mr-1" />
                                Mañana
                            </Button>
                            <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={() => handleQuickSelect(3)}
                                className="bg-white/5 border-white/10 text-white hover:bg-white/10"
                            >
                                <CalendarDays className="h-3 w-3 mr-1" />
                                En 3 días
                            </Button>
                            <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={() => handleQuickSelect(7)}
                                className="bg-white/5 border-white/10 text-white hover:bg-white/10"
                            >
                                <Clock className="h-3 w-3 mr-1" />
                                Próxima semana
                            </Button>
                        </div>
                    </div>

                    {/* Custom Date */}
                    <div>
                        <Label className="text-white/80">Fecha personalizada</Label>
                        <Input
                            type="date"
                            value={selectedDate}
                            onChange={(e) => setSelectedDate(e.target.value)}
                            className="bg-white/5 border-white/10 text-white"
                            min={new Date().toISOString().split("T")[0]}
                        />
                    </div>

                    {/* Note */}
                    <div>
                        <Label className="text-white/80">Nota (opcional)</Label>
                        <Input
                            type="text"
                            value={note}
                            onChange={(e) => setNote(e.target.value)}
                            placeholder="Ej: Llamar para seguimiento"
                            className="bg-white/5 border-white/10 text-white placeholder:text-white/40"
                        />
                    </div>
                </div>

                <DialogFooter>
                    <Button variant="outline" onClick={onClose}>
                        Cancelar
                    </Button>
                    <Button
                        onClick={handleSave}
                        disabled={!selectedDate || loading}
                        className="bg-blue-500/20 text-blue-400 hover:bg-blue-500/30"
                    >
                        {loading ? "Guardando..." : "Crear Recordatorio"}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}
