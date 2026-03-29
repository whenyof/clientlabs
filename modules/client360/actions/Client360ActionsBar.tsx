"use client"

import { useState } from "react"
import { Plus, CheckSquare, Mail, StickyNote, MessageCircle } from "lucide-react"
import { NewOrderModal }     from "./NewOrderModal"
import { TaskModal }         from "./TaskModal"
import { EmailModal }        from "./EmailModal"
import { NoteModal }         from "./NoteModal"
import { InteractionModal }  from "./InteractionModal"

type ActiveModal = "order" | "task" | "email" | "note" | "interaction" | null

interface Client360ActionsBarProps {
  clientId: string
  defaultEmail?: string | null
}

const SECONDARY = [
  { id: "task",        label: "Tarea",        icon: CheckSquare   },
  { id: "email",       label: "Email",         icon: Mail          },
  { id: "note",        label: "Nota",          icon: StickyNote    },
  { id: "interaction", label: "Interacción",   icon: MessageCircle },
] as const

export function Client360ActionsBar({ clientId, defaultEmail }: Client360ActionsBarProps) {
  const [active, setActive] = useState<ActiveModal>(null)
  const close = () => setActive(null)

  return (
    <>
      <div className="bg-[var(--bg-card)] rounded-xl border border-[var(--border-subtle)] px-5 py-3.5 flex flex-wrap items-center justify-center gap-2">
        <button
          type="button"
          onClick={() => setActive("order")}
          className="inline-flex items-center gap-1.5 rounded-lg bg-[#1FA97A] px-4 py-2 text-[13px] font-semibold text-white hover:opacity-90 active:scale-[.98] transition-all"
        >
          <Plus className="h-3.5 w-3.5" />
          Nuevo pedido
        </button>

        <div className="h-5 w-px bg-[var(--border-subtle)] mx-0.5" aria-hidden="true" />

        {SECONDARY.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            type="button"
            onClick={() => setActive(id as ActiveModal)}
            aria-label={label}
            className="inline-flex items-center gap-1.5 rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-card)] px-3 py-2 text-[13px] text-[var(--text-secondary)] hover:bg-[var(--bg-surface)] hover:text-[var(--text-primary)] active:scale-[.98] transition-all"
          >
            <Icon className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">{label}</span>
          </button>
        ))}
      </div>

      <NewOrderModal    open={active === "order"}        onClose={close} clientId={clientId} />
      <TaskModal        open={active === "task"}         onClose={close} clientId={clientId} />
      <EmailModal       open={active === "email"}        onClose={close} clientId={clientId} defaultTo={defaultEmail} />
      <NoteModal        open={active === "note"}         onClose={close} clientId={clientId} />
      <InteractionModal open={active === "interaction"}  onClose={close} clientId={clientId} />
    </>
  )
}
