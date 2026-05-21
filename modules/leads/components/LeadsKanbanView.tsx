"use client"

import { useState, useCallback } from "react"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { useRouter } from "next/navigation"
import {
  DndContext,
  DragOverlay,
  useDraggable,
  useDroppable,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
  type DragStartEvent,
} from "@dnd-kit/core"
import { CSS } from "@dnd-kit/utilities"
import { Flame, Thermometer, Snowflake } from "lucide-react"

const UNSTAGED_ID = "__unstaged__"

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
  tags: string[]
}

function getInitials(name: string | null): string {
  if (!name) return "?"
  return name.split(" ").slice(0, 2).map(w => w[0]?.toUpperCase() ?? "").join("")
}

function hashColor(str: string): string {
  const palette = ["#1FA97A", "#3B82F6", "#8B5CF6", "#F59E0B", "#EC4899", "#14B8A6", "#F97316"]
  let hash = 0
  for (let i = 0; i < str.length; i++) hash = str.charCodeAt(i) + ((hash << 5) - hash)
  return palette[Math.abs(hash) % palette.length]
}

function timeAgo(dateStr: string): string {
  const ms = Date.now() - new Date(dateStr).getTime()
  const mins = Math.floor(ms / 60000)
  if (mins < 60) return `${mins}m`
  const hours = Math.floor(mins / 60)
  if (hours < 24) return `${hours}h`
  const days = Math.floor(hours / 24)
  return `${days}d`
}

function TemperatureBadge({ temperature }: { temperature: string | null }) {
  if (!temperature) return null
  const config = {
    HOT:  { icon: <Flame  style={{ width: 10, height: 10 }} />, bg: "#FEE2E2", color: "#DC2626" },
    WARM: { icon: <Thermometer style={{ width: 10, height: 10 }} />, bg: "#FEF3C7", color: "#D97706" },
    COLD: { icon: <Snowflake style={{ width: 10, height: 10 }} />, bg: "#DBEAFE", color: "#2563EB" },
  } as const
  const c = config[temperature as keyof typeof config]
  if (!c) return null
  return (
    <span style={{ display: "inline-flex", alignItems: "center", gap: 3, padding: "2px 6px", borderRadius: 99, backgroundColor: c.bg, color: c.color, fontSize: 10, fontWeight: 600 }}>
      {c.icon}{temperature}
    </span>
  )
}

function ScoreBadge({ score }: { score: number }) {
  const bg = score >= 70 ? "#1FA97A20" : score >= 40 ? "#D9A44120" : "#94A3B820"
  const color = score >= 70 ? "#1FA97A" : score >= 40 ? "#D9A441" : "#64748B"
  return (
    <span style={{ fontSize: 11, fontWeight: 600, padding: "1px 6px", borderRadius: 4, backgroundColor: bg, color }}>
      {score}
    </span>
  )
}

function LeadCardContent({ lead }: { lead: KanbanLead }) {
  const avatarColor = hashColor(lead.name ?? lead.id)
  const initials = getInitials(lead.name)
  const visibleTags = lead.tags?.slice(0, 2) ?? []

  return (
    <>
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 8 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, minWidth: 0 }}>
          <div style={{
            width: 28, height: 28, borderRadius: "50%", flexShrink: 0,
            backgroundColor: `${avatarColor}20`, border: `1.5px solid ${avatarColor}40`,
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: 10, fontWeight: 700, color: avatarColor,
          }}>
            {initials}
          </div>
          <div style={{ minWidth: 0 }}>
            <div style={{ fontSize: 12, fontWeight: 600, color: "var(--text-primary)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
              {lead.name ?? "Sin nombre"}
            </div>
            {lead.email && (
              <div style={{ fontSize: 10, color: "var(--text-secondary)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", marginTop: 1 }}>
                {lead.email}
              </div>
            )}
          </div>
        </div>
        <TemperatureBadge temperature={lead.temperature} />
      </div>

      {visibleTags.length > 0 && (
        <div style={{ display: "flex", gap: 4, flexWrap: "wrap", marginTop: 8 }}>
          {visibleTags.map(tag => (
            <span key={tag} style={{ fontSize: 9, padding: "1px 5px", borderRadius: 4, backgroundColor: "var(--bg-surface)", border: "0.5px solid var(--border-subtle)", color: "var(--text-secondary)" }}>
              {tag}
            </span>
          ))}
          {(lead.tags?.length ?? 0) > 2 && (
            <span style={{ fontSize: 9, color: "var(--text-secondary)" }}>+{lead.tags.length - 2}</span>
          )}
        </div>
      )}

      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: 8, paddingTop: 8, borderTop: "0.5px solid var(--border-subtle)" }}>
        <span style={{ fontSize: 10, color: "var(--text-secondary)" }}>{timeAgo(lead.createdAt)}</span>
        <ScoreBadge score={lead.score} />
      </div>
    </>
  )
}

function DraggableLeadCard({ lead, onClick }: { lead: KanbanLead; onClick: () => void }) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({ id: lead.id })

  return (
    <div
      ref={setNodeRef}
      onClick={onClick}
      style={{
        transform: CSS.Translate.toString(transform),
        opacity: isDragging ? 0.35 : 1,
        background: "var(--bg-card)",
        border: "0.5px solid var(--border-subtle)",
        borderRadius: 10,
        padding: "10px 12px",
        marginBottom: 8,
        cursor: isDragging ? "grabbing" : "pointer",
        touchAction: "none",
        userSelect: "none",
        transition: isDragging ? "none" : "border-color 150ms, box-shadow 150ms",
        boxShadow: isDragging ? "0 4px 12px rgba(0,0,0,0.08)" : "none",
      }}
      onMouseEnter={e => !isDragging && ((e.currentTarget as HTMLElement).style.boxShadow = "0 2px 8px rgba(0,0,0,0.06)")}
      onMouseLeave={e => ((e.currentTarget as HTMLElement).style.boxShadow = "none")}
      {...listeners}
      {...attributes}
    >
      <LeadCardContent lead={lead} />
    </div>
  )
}

function KanbanColumn({
  stageId, stageName, stageColor, leads, onCardClick,
}: {
  stageId: string
  stageName: string
  stageColor: string
  leads: KanbanLead[]
  onCardClick: (lead: KanbanLead) => void
}) {
  const { setNodeRef, isOver } = useDroppable({ id: stageId })

  return (
    <div
      ref={setNodeRef}
      style={{
        minWidth: 268, maxWidth: 288, flex: "0 0 268px",
        background: isOver ? "rgba(31,169,122,0.04)" : "var(--bg-surface)",
        border: `0.5px solid ${isOver ? "rgba(31,169,122,0.35)" : "var(--border-subtle)"}`,
        borderRadius: 12,
        overflow: "hidden",
        transition: "background 150ms, border-color 150ms",
      }}
    >
      <div style={{ padding: "10px 14px", borderBottom: "0.5px solid var(--border-subtle)", display: "flex", alignItems: "center", gap: 8 }}>
        <span style={{ width: 8, height: 8, borderRadius: "50%", backgroundColor: stageColor, flexShrink: 0 }} />
        <span style={{ fontWeight: 600, fontSize: 12, color: "var(--text-primary)", flex: 1 }}>{stageName}</span>
        <span style={{ fontSize: 10, fontWeight: 700, color: stageColor, background: `${stageColor}15`, padding: "2px 8px", borderRadius: 99, border: `0.5px solid ${stageColor}30` }}>
          {leads.length}
        </span>
      </div>
      <div style={{ padding: "10px 10px 4px", minHeight: 80, maxHeight: 560, overflowY: "auto" }}>
        {leads.length === 0 ? (
          <p style={{ fontSize: 11, color: "var(--text-secondary)", textAlign: "center", padding: "20px 0", opacity: 0.5 }}>
            Sin leads
          </p>
        ) : (
          leads.map(lead => (
            <DraggableLeadCard key={lead.id} lead={lead} onClick={() => onCardClick(lead)} />
          ))
        )}
      </div>
    </div>
  )
}

export function LeadsKanbanView() {
  const router = useRouter()
  const queryClient = useQueryClient()
  const [activeLeadId, setActiveLeadId] = useState<string | null>(null)

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } })
  )

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

  const moveMutation = useMutation({
    mutationFn: async ({ leadId, stageId }: { leadId: string; stageId: string | null }) => {
      const res = await fetch(`/api/leads/${leadId}/stage`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ stageId }),
      })
      if (!res.ok) throw new Error("Error al mover lead")
    },
    onMutate: async ({ leadId, stageId }) => {
      await queryClient.cancelQueries({ queryKey: ["leads-kanban"] })
      const previous = queryClient.getQueryData<{ stages: Stage[]; leads: KanbanLead[] }>(["leads-kanban"])
      if (previous) {
        queryClient.setQueryData(["leads-kanban"], {
          ...previous,
          leads: previous.leads.map(l => l.id === leadId ? { ...l, stageId } : l),
        })
      }
      return { previous }
    },
    onError: (_, __, context) => {
      if (context?.previous) queryClient.setQueryData(["leads-kanban"], context.previous)
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["leads-kanban"] })
      queryClient.invalidateQueries({ queryKey: ["leads"] })
      queryClient.invalidateQueries({ queryKey: ["leads-kpis"] })
    },
  })

  const handleDragStart = useCallback((event: DragStartEvent) => {
    setActiveLeadId(event.active.id as string)
  }, [])

  const handleDragEnd = useCallback((event: DragEndEvent) => {
    setActiveLeadId(null)
    const { active, over } = event
    if (!over) return

    const leadId = active.id as string
    const newStageId = over.id === UNSTAGED_ID ? null : (over.id as string)
    const currentLead = data?.leads.find(l => l.id === leadId)
    if (!currentLead) return
    if (currentLead.stageId === newStageId) return

    moveMutation.mutate({ leadId, stageId: newStageId })
  }, [data, moveMutation])

  if (isLoading) {
    return (
      <div style={{ padding: 40, textAlign: "center", color: "var(--text-secondary)", fontSize: 13 }}>
        Cargando pipeline...
      </div>
    )
  }

  if (isError || !data) {
    return (
      <div style={{ padding: 40, textAlign: "center", color: "#EF4444", fontSize: 13 }}>
        Error al cargar el pipeline
      </div>
    )
  }

  const { stages, leads } = data
  const activeLead = activeLeadId ? leads.find(l => l.id === activeLeadId) : null

  return (
    <DndContext sensors={sensors} onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
      <div style={{ display: "flex", gap: 14, overflowX: "auto", paddingBottom: 16, alignItems: "flex-start" }}>
        {stages.map(stage => (
          <KanbanColumn
            key={stage.id}
            stageId={stage.id}
            stageName={stage.name}
            stageColor={stage.color}
            leads={leads.filter(l => l.stageId === stage.id)}
            onCardClick={lead => router.push(`/dashboard/leads/${lead.id}`)}
          />
        ))}
        <KanbanColumn
          stageId={UNSTAGED_ID}
          stageName="Sin etapa"
          stageColor="#9CA3AF"
          leads={leads.filter(l => !l.stageId)}
          onCardClick={lead => router.push(`/dashboard/leads/${lead.id}`)}
        />
      </div>

      <DragOverlay dropAnimation={{ duration: 200, easing: "cubic-bezier(0.18,0.67,0.6,1.22)" }}>
        {activeLead && (
          <div style={{
            background: "var(--bg-card)",
            border: "0.5px solid #1FA97A",
            borderRadius: 10,
            padding: "10px 12px",
            width: 260,
            boxShadow: "0 8px 28px rgba(0,0,0,0.13)",
            cursor: "grabbing",
            opacity: 0.96,
          }}>
            <LeadCardContent lead={activeLead} />
          </div>
        )}
      </DragOverlay>
    </DndContext>
  )
}
