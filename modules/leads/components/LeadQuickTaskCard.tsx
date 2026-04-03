"use client"

import { useState } from "react"
import { Plus, CheckSquare } from "lucide-react"
import { NewTaskModal } from "@/modules/tasks/dashboard/NewTaskModal"

interface LeadQuickTaskCardProps {
  leadId: string
}

export function LeadQuickTaskCard({ leadId }: LeadQuickTaskCardProps) {
  const [open, setOpen] = useState(false)

  return (
    <>
      <div style={{
        background: "var(--bg-card)",
        border: "0.5px solid var(--border-subtle)",
        borderRadius: 12,
        padding: "16px",
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
          <CheckSquare style={{ width: 14, height: 14, color: "#1FA97A" }} />
          <span style={{ fontSize: 12, fontWeight: 600, letterSpacing: "0.07em", textTransform: "uppercase", color: "var(--text-secondary)" }}>
            Tareas
          </span>
        </div>
        <button
          type="button"
          onClick={() => setOpen(true)}
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 6,
            width: "100%",
            padding: "9px 16px",
            background: "#1FA97A10",
            border: "0.5px solid #1FA97A30",
            borderRadius: 8,
            fontSize: 13,
            fontWeight: 500,
            color: "#1FA97A",
            cursor: "pointer",
          }}
        >
          <Plus style={{ width: 14, height: 14 }} />
          Nueva tarea
        </button>
      </div>

      <NewTaskModal
        open={open}
        onClose={() => setOpen(false)}
        defaultEntityType="LEAD"
        defaultEntityId={leadId}
      />
    </>
  )
}
