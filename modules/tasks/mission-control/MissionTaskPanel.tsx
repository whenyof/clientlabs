"use client"

import { useState, useEffect } from "react"
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetFooter,
} from "@/components/ui/sheet"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Loader2 } from "lucide-react"
import { toast } from "sonner"
import type { MissionControlCalendarItem } from "./types"

type UserOption = { id: string; name: string | null; email: string | null }

export type MissionTaskPanelProps = {
  task: MissionControlCalendarItem | null
  open: boolean
  onOpenChange: (open: boolean) => void
  /** Called after save; pass updated task for optimistic UI (no refetch). */
  onSaved?: (updatedTask?: MissionControlCalendarItem) => void
}

async function patchTask(
  taskId: string,
  body: { dueDate?: string; estimatedMinutes?: number | null; assignedToId?: string | null }
): Promise<boolean> {
  const res = await fetch(`/api/tasks/${taskId}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  })
  return res.ok
}

async function patchReminder(
  reminderId: string,
  body: { status?: string; start?: string; end?: string }
): Promise<boolean> {
  const res = await fetch(`/api/reminders/${reminderId}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  })
  return res.ok
}

export function MissionTaskPanel({
  task,
  open,
  onOpenChange,
  onSaved,
}: MissionTaskPanelProps) {
  const [estimatedMinutes, setEstimatedMinutes] = useState<string>("")
  const [assignedToId, setAssignedToId] = useState<string>("")
  const [moveDate, setMoveDate] = useState<string>("")
  const [saving, setSaving] = useState(false)
  const [moving, setMoving] = useState(false)
  const [users, setUsers] = useState<UserOption[]>([])

  useEffect(() => {
    if (open && task) {
      setEstimatedMinutes(
        task.estimatedMinutes != null ? String(task.estimatedMinutes) : ""
      )
      setAssignedToId(task.assignedTo ?? "")
      setMoveDate(
        task.dueDate
          ? new Date(task.dueDate).toISOString().slice(0, 10)
          : ""
      )
    }
  }, [open, task])

  useEffect(() => {
    if (!open) return
    fetch("/api/admin/users")
      .then((res) => (res.ok ? res.json() : null))
      .then((data: { users?: UserOption[] } | null) => {
        if (data?.users?.length) setUsers(data.users)
        else setUsers([])
      })
      .catch(() => setUsers([]))
  }, [open])

  if (!task) return null

  const handleSave = async () => {
    setSaving(true)
    try {
      const body: { estimatedMinutes?: number | null; assignedToId?: string | null } = {}
      if (estimatedMinutes !== "" && !Number.isNaN(Number(estimatedMinutes))) {
        body.estimatedMinutes = Number(estimatedMinutes)
      }
      body.assignedToId = assignedToId.trim() || null
      const ok = await patchTask(task.id, body)
      if (ok) {
        toast.success("Cambios guardados")
        const updatedTask: MissionControlCalendarItem = {
          ...task,
          estimatedMinutes:
            body.estimatedMinutes ?? task.estimatedMinutes ?? null,
          assignedTo: assignedToId.trim() || null,
        }
        onSaved?.(updatedTask)
      } else toast.error("Error al guardar")
    } catch {
      toast.error("Error al guardar")
    } finally {
      setSaving(false)
    }
  }

  const handleMove = async () => {
    if (!moveDate) {
      toast.error("Elige una fecha")
      return
    }
    setMoving(true)
    try {
      const startAt = new Date(moveDate + "T12:00:00.000Z").toISOString()
      const dur = (task.estimatedMinutes ?? 30) * 60 * 1000
      const endAt = new Date(new Date(startAt).getTime() + dur).toISOString()
      const ok =
        task.kind === "REMINDER"
          ? await patchReminder(task.id, { start: startAt, end: endAt })
          : await patchTask(task.id, { dueDate: startAt })
      if (ok) {
        toast.success(task.kind === "REMINDER" ? "Recordatorio movido" : "Tarea movida")
        const updatedTask: MissionControlCalendarItem = {
          ...task,
          dueDate: startAt,
          startAt,
        }
        onSaved?.(updatedTask)
        onOpenChange(false)
      } else toast.error("Error al mover")
    } catch {
      toast.error("Error al mover")
    } finally {
      setMoving(false)
    }
  }

  const handleCompleteReminder = async () => {
    if (task.kind !== "REMINDER") return
    setSaving(true)
    try {
      const ok = await patchReminder(task.id, { status: "DONE" })
      if (ok) {
        toast.success("Recordatorio completado")
        const updatedTask: MissionControlCalendarItem = { ...task, status: "DONE" }
        onSaved?.(updatedTask)
        onOpenChange(false)
      } else toast.error("Error al completar")
    } catch {
      toast.error("Error al completar")
    } finally {
      setSaving(false)
    }
  }

  const isReminder = task.kind === "REMINDER"

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="right"
        className="bg-zinc-900 border-zinc-800 text-white w-full sm:max-w-md"
        showCloseButton={true}
      >
        <SheetHeader>
          <SheetTitle className="text-white truncate pr-8">
            {isReminder && "🔔 "}
            {task.title}
          </SheetTitle>
        </SheetHeader>

        <div className="flex flex-col gap-6 px-4 py-2 overflow-y-auto flex-1">
          {!isReminder && (
          <>
          {/* Duración estimada */}
          <div className="space-y-2">
            <Label htmlFor="estimatedMinutes" className="text-zinc-300">
              Duración (min)
            </Label>
            <Input
              id="estimatedMinutes"
              type="number"
              min={1}
              value={estimatedMinutes}
              onChange={(e) => setEstimatedMinutes(e.target.value)}
              className="bg-zinc-800 border-zinc-600 text-white"
              placeholder="Ej: 30"
            />
          </div>

          {/* Responsable */}
          <div className="space-y-2">
            <Label className="text-zinc-300">Responsable</Label>
            {users.length > 0 ? (
              <Select
                value={assignedToId || "_none_"}
                onValueChange={(v) => setAssignedToId(v === "_none_" ? "" : v)}
              >
                <SelectTrigger className="bg-zinc-800 border-zinc-600 text-white">
                  <SelectValue placeholder="Sin asignar" />
                </SelectTrigger>
                <SelectContent className="bg-zinc-900 border-zinc-700">
                  <SelectItem value="_none_" className="text-white focus:bg-zinc-800">
                    Sin asignar
                  </SelectItem>
                  {users.map((u) => (
                    <SelectItem
                      key={u.id}
                      value={u.id}
                      className="text-white focus:bg-zinc-800"
                    >
                      {u.name || u.email || u.id}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            ) : (
              <Input
                id="assignedToId"
                value={assignedToId}
                onChange={(e) => setAssignedToId(e.target.value)}
                className="bg-zinc-800 border-zinc-600 text-white"
                placeholder="ID del usuario (o lista en admin)"
              />
            )}
          </div>

          {/* Mover a */}
          <div className="space-y-2">
            <Label htmlFor="moveDate" className="text-zinc-300">
              Mover a otro día
            </Label>
            <div className="flex gap-2">
              <Input
                id="moveDate"
                type="date"
                value={moveDate}
                onChange={(e) => setMoveDate(e.target.value)}
                className="bg-zinc-800 border-zinc-600 text-white flex-1"
              />
              <Button
                type="button"
                size="sm"
                variant="secondary"
                className="bg-violet-600 hover:bg-violet-700 text-white shrink-0"
                onClick={handleMove}
                disabled={moving}
              >
                {moving ? <Loader2 className="w-4 h-4 animate-spin" /> : "Mover"}
              </Button>
            </div>
          </div>
          </>
          )}
          {isReminder && (
            <div className="space-y-2">
              <Label htmlFor="moveDateReminder" className="text-zinc-300">
                Reprogramar
              </Label>
              <div className="flex gap-2">
                <Input
                  id="moveDateReminder"
                  type="date"
                  value={moveDate}
                  onChange={(e) => setMoveDate(e.target.value)}
                  className="bg-zinc-800 border-zinc-600 text-white flex-1"
                />
                <Button
                  type="button"
                  size="sm"
                  variant="secondary"
                  className="bg-violet-600 hover:bg-violet-700 text-white shrink-0"
                  onClick={handleMove}
                  disabled={moving}
                >
                  {moving ? <Loader2 className="w-4 h-4 animate-spin" /> : "Mover"}
                </Button>
              </div>
            </div>
          )}
        </div>

        <SheetFooter className="border-t border-zinc-800">
          {isReminder ? (
            <Button
              type="button"
              className="w-full bg-amber-600 hover:bg-amber-700 text-white"
              onClick={handleCompleteReminder}
              disabled={saving}
            >
              {saving ? (
                <Loader2 className="w-4 h-4 animate-spin mr-2" />
              ) : null}
              Completar recordatorio
            </Button>
          ) : (
            <Button
              type="button"
              className="w-full bg-violet-600 hover:bg-violet-700 text-white"
              onClick={handleSave}
              disabled={saving}
            >
              {saving ? (
                <Loader2 className="w-4 h-4 animate-spin mr-2" />
              ) : null}
              Guardar cambios
            </Button>
          )}
        </SheetFooter>
      </SheetContent>
    </Sheet>
  )
}
