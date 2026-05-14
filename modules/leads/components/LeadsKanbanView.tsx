"use client"

import { useState } from "react"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { useRouter } from "next/navigation"
import { ChevronDown, Move } from "lucide-react"

type Stage = { id: string; name: string; order: number; color: string }
type KanbanLead = {
  id: string
  name: string | null
  email: string | null
  leadStatus: string
  score: number
  temperature: string | null
  stageId: string | null
  createdAt: string
}

function TemperatureDot({ temperature }: { temperature: string | null }) {
  const color =
    temperature === "HOT" ? "#EF4444" : temperature === "WARM" ? "#F97316" : "#3B82F6"
  return (
    <span
      title={temperature ?? "COLD"}
      style={{
        display: "inline-block",
        width: 8,
        height: 8,
        borderRadius: "50%",
        backgroundColor: color,
        flexShrink: 0,
      }}
    />
  )
}

function ScoreBadge({ score }: { score: number }) {
  return (
    <span
      style={{
        fontSize: 11,
        fontWeight: 600,
        padding: "1px 6px",
        borderRadius: 4,
        backgroundColor: score >= 70 ? "#1FA97A20" : score >= 40 ? "#D9A44120" : "#94A3B820",
        color: score >= 70 ? "#1FA97A" : score >= 40 ? "#D9A441" : "#64748B",
      }}
    >
      {score}
    </span>
  )
}

function MoveDropdown({
  leadId,
  stages,
  currentStageId,
}: {
  leadId: string
  stages: Stage[]
  currentStageId: string | null
}) {
  const [open, setOpen] = useState(false)
  const queryClient = useQueryClient()

  const mutation = useMutation({
    mutationFn: async (stageId: string) => {
      const res = await fetch(`/api/leads/${leadId}/stage`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ stageId }),
      })
      if (!res.ok) throw new Error("Error al mover lead")
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["leads-kanban"] })
      setOpen(false)
    },
  })

  return (
    <div style={{ position: "relative" }}>
      <button
        onClick={(e) => { e.stopPropagation(); setOpen((v) => !v) }}
        style={{
          display: "flex",
          alignItems: "center",
          gap: 4,
          fontSize: 11,
          padding: "2px 6px",
          borderRadius: 4,
          border: "0.5px solid var(--border-subtle)",
          background: "var(--bg-surface)",
          color: "var(--text-secondary)",
          cursor: "pointer",
        }}
      >
        <Move size={11} />
        Mover
        <ChevronDown size={11} />
      </button>
      {open && (
        <div
          style={{
            position: "absolute",
            top: "calc(100% + 4px)",
            right: 0,
            zIndex: 50,
            minWidth: 140,
            background: "var(--bg-card)",
            border: "0.5px solid var(--border-subtle)",
            borderRadius: 8,
            boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
            overflow: "hidden",
          }}
          onClick={(e) => e.stopPropagation()}
        >
          {stages
            .filter((s) => s.id !== currentStageId)
            .map((s) => (
              <button
                key={s.id}
                disabled={mutation.isPending}
                onClick={() => mutation.mutate(s.id)}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                  width: "100%",
                  padding: "7px 12px",
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  fontSize: 12,
                  color: "var(--text-primary)",
                  textAlign: "left",
                }}
              >
                <span
                  style={{
                    width: 8,
                    height: 8,
                    borderRadius: "50%",
                    backgroundColor: s.color,
                    flexShrink: 0,
                  }}
                />
                {s.name}
              </button>
            ))}
        </div>
      )}
    </div>
  )
}

function LeadCard({ lead, stages }: { lead: KanbanLead; stages: Stage[] }) {
  const router = useRouter()
  return (
    <div
      onClick={() => router.push(`/dashboard/leads/${lead.id}`)}
      style={{
        background: "var(--bg-card)",
        border: "0.5px solid var(--border-subtle)",
        borderRadius: 10,
        padding: "10px 12px",
        cursor: "pointer",
        marginBottom: 8,
      }}
    >
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 8 }}>
        <div style={{ minWidth: 0 }}>
          <div
            style={{
              fontSize: 13,
              fontWeight: 600,
              color: "var(--text-primary)",
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
            }}
          >
            {lead.name ?? "Sin nombre"}
          </div>
          {lead.email && (
            <div
              style={{
                fontSize: 11,
                color: "var(--text-secondary)",
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
              }}
            >
              {lead.email}
            </div>
          )}
        </div>
        <MoveDropdown leadId={lead.id} stages={stages} currentStageId={lead.stageId} />
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 8 }}>
        <TemperatureDot temperature={lead.temperature} />
        <ScoreBadge score={lead.score} />
      </div>
    </div>
  )
}

export function LeadsKanbanView() {
  const { data, isLoading, isError } = useQuery<{ stages: Stage[]; leads: KanbanLead[] }>({
    queryKey: ["leads-kanban"],
    queryFn: async () => {
      const res = await fetch("/api/leads/kanban")
      if (!res.ok) throw new Error("Error cargando kanban")
      return res.json()
    },
    staleTime: 30_000,
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    retry: 0,
  })

  if (isLoading) {
    return (
      <div style={{ padding: 32, textAlign: "center", color: "var(--text-secondary)", fontSize: 14 }}>
        Cargando pipeline...
      </div>
    )
  }

  if (isError || !data) {
    return (
      <div style={{ padding: 32, textAlign: "center", color: "#EF4444", fontSize: 14 }}>
        Error al cargar el pipeline
      </div>
    )
  }

  const { stages, leads } = data
  const unstaged = leads.filter((l) => !l.stageId)

  return (
    <div style={{ display: "flex", gap: 16, overflowX: "auto", paddingBottom: 16, alignItems: "flex-start" }}>
      {stages.map((stage) => {
        const stageLeads = leads.filter((l) => l.stageId === stage.id)
        return (
          <div
            key={stage.id}
            style={{
              minWidth: 260,
              maxWidth: 280,
              flex: "0 0 260px",
              background: "var(--bg-surface)",
              border: "0.5px solid var(--border-subtle)",
              borderRadius: 12,
              overflow: "hidden",
            }}
          >
            <div
              style={{
                padding: "10px 14px",
                borderBottom: "0.5px solid var(--border-subtle)",
                display: "flex",
                alignItems: "center",
                gap: 8,
              }}
            >
              <span
                style={{
                  width: 10,
                  height: 10,
                  borderRadius: "50%",
                  backgroundColor: stage.color,
                  flexShrink: 0,
                }}
              />
              <span style={{ fontWeight: 600, fontSize: 13, color: "var(--text-primary)", flex: 1 }}>
                {stage.name}
              </span>
              <span
                style={{
                  fontSize: 11,
                  fontWeight: 600,
                  color: "var(--text-secondary)",
                  background: "var(--bg-card)",
                  padding: "1px 7px",
                  borderRadius: 99,
                  border: "0.5px solid var(--border-subtle)",
                }}
              >
                {stageLeads.length}
              </span>
            </div>
            <div style={{ padding: "10px 10px 4px", maxHeight: 520, overflowY: "auto" }}>
              {stageLeads.length === 0 ? (
                <p style={{ fontSize: 12, color: "var(--text-secondary)", textAlign: "center", padding: "12px 0" }}>
                  Sin leads
                </p>
              ) : (
                stageLeads.map((lead) => <LeadCard key={lead.id} lead={lead} stages={stages} />)
              )}
            </div>
          </div>
        )
      })}

      {/* Sin etapa column */}
      <div
        style={{
          minWidth: 260,
          maxWidth: 280,
          flex: "0 0 260px",
          background: "var(--bg-surface)",
          border: "0.5px solid var(--border-subtle)",
          borderRadius: 12,
          overflow: "hidden",
        }}
      >
        <div
          style={{
            padding: "10px 14px",
            borderBottom: "0.5px solid var(--border-subtle)",
            display: "flex",
            alignItems: "center",
            gap: 8,
          }}
        >
          <span
            style={{
              width: 10,
              height: 10,
              borderRadius: "50%",
              backgroundColor: "#9CA3AF",
              flexShrink: 0,
            }}
          />
          <span style={{ fontWeight: 600, fontSize: 13, color: "var(--text-primary)", flex: 1 }}>
            Sin etapa
          </span>
          <span
            style={{
              fontSize: 11,
              fontWeight: 600,
              color: "var(--text-secondary)",
              background: "var(--bg-card)",
              padding: "1px 7px",
              borderRadius: 99,
              border: "0.5px solid var(--border-subtle)",
            }}
          >
            {unstaged.length}
          </span>
        </div>
        <div style={{ padding: "10px 10px 4px", maxHeight: 520, overflowY: "auto" }}>
          {unstaged.length === 0 ? (
            <p style={{ fontSize: 12, color: "var(--text-secondary)", textAlign: "center", padding: "12px 0" }}>
              Sin leads
            </p>
          ) : (
            unstaged.map((lead) => <LeadCard key={lead.id} lead={lead} stages={stages} />)
          )}
        </div>
      </div>
    </div>
  )
}
