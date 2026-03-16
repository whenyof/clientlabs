"use client"

import { useState } from "react"
import { Plus, CheckSquare, Mail, StickyNote, MessageCircle } from "lucide-react"
import { NewOrderModal } from "./NewOrderModal"
import { TaskModal } from "./TaskModal"
import { EmailModal } from "./EmailModal"
import { NoteModal } from "./NoteModal"
import { InteractionModal } from "./InteractionModal"

type ActiveModal = "order" | "task" | "email" | "note" | "interaction" | null

interface Client360ActionsBarProps {
  clientId: string
  defaultEmail?: string | null
}

export function Client360ActionsBar({ clientId, defaultEmail }: Client360ActionsBarProps) {
  const [activeModal, setActiveModal] = useState<ActiveModal>(null)

  const openModal = (type: ActiveModal) => setActiveModal(type)
  const closeModal = () => setActiveModal(null)

  return (
    <>
      <div className="w-full flex flex-wrap gap-2 mt-4 lg:grid lg:grid-cols-5 lg:gap-3">
        <button
          type="button"
          onClick={() => openModal("order")}
          className="inline-flex items-center gap-2 rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-card)] px-4 py-2 text-sm font-medium text-[var(--text-secondary)] hover:bg-[var(--bg-surface)] hover:text-[var(--text-primary)] transition-colors"
        >
          <Plus className="h-4 w-4" />
          Nuevo pedido
        </button>
        <button
          type="button"
          onClick={() => openModal("task")}
          className="inline-flex items-center gap-2 rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-card)] px-4 py-2 text-sm font-medium text-[var(--text-secondary)] hover:bg-[var(--bg-surface)] hover:text-[var(--text-primary)] transition-colors"
        >
          <CheckSquare className="h-4 w-4" />
          Crear tarea
        </button>
        <button
          type="button"
          onClick={() => openModal("email")}
          className="inline-flex items-center gap-2 rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-card)] px-4 py-2 text-sm font-medium text-[var(--text-secondary)] hover:bg-[var(--bg-surface)] hover:text-[var(--text-primary)] transition-colors"
        >
          <Mail className="h-4 w-4" />
          Registrar email
        </button>
        <button
          type="button"
          onClick={() => openModal("note")}
          className="inline-flex items-center gap-2 rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-card)] px-4 py-2 text-sm font-medium text-[var(--text-secondary)] hover:bg-[var(--bg-surface)] hover:text-[var(--text-primary)] transition-colors"
        >
          <StickyNote className="h-4 w-4" />
          Añadir nota
        </button>
        <button
          type="button"
          onClick={() => openModal("interaction")}
          className="inline-flex items-center gap-2 rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-card)] px-4 py-2 text-sm font-medium text-[var(--text-secondary)] hover:bg-[var(--bg-surface)] hover:text-[var(--text-primary)] transition-colors"
        >
          <MessageCircle className="h-4 w-4" />
          Registrar interacción
        </button>
      </div>

      <NewOrderModal open={activeModal === "order"} onClose={closeModal} clientId={clientId} />
      <TaskModal open={activeModal === "task"} onClose={closeModal} clientId={clientId} />
      <EmailModal
        open={activeModal === "email"}
        onClose={closeModal}
        clientId={clientId}
        defaultTo={defaultEmail}
      />
      <NoteModal open={activeModal === "note"} onClose={closeModal} clientId={clientId} />
      <InteractionModal open={activeModal === "interaction"} onClose={closeModal} clientId={clientId} />
    </>
  )
}

