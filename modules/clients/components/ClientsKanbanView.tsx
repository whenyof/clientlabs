"use client"

import { useState, useCallback } from "react"
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
import { useRouter } from "next/navigation"
import { useQueryClient } from "@tanstack/react-query"
import { formatCurrency } from "@/lib/utils"

type KanbanClient = {
  id: string
  name: string | null
  email?: string | null
  companyName?: string | null
  totalSpent?: number | null
  invoiceRevenue?: number
  effectiveStatus: string
}

const COLUMNS = [
  { id: "ACTIVE",    label: "Activos",           color: "#0F766E" },
  { id: "VIP",       label: "VIP",               color: "#8B5CF6" },
  { id: "FOLLOW_UP", label: "En seguimiento",    color: "#F59E0B" },
  { id: "INACTIVE",  label: "Inactivos",         color: "#94A3B8" },
] as const

type ColumnId = typeof COLUMNS[number]["id"]

const KNOWN_STATUSES = new Set(["ACTIVE", "VIP", "FOLLOW_UP", "INACTIVE"])

function getColumnForStatus(status: string): ColumnId {
  if (KNOWN_STATUSES.has(status)) return status as ColumnId
  return "INACTIVE"
}

function getInitials(name: string | null): string {
  if (!name) return "?"
  return name.split(" ").slice(0, 2).map(w => w[0]?.toUpperCase() ?? "").join("")
}

function hashColor(str: string): string {
  const palette = ["#0F766E", "#3B82F6", "#8B5CF6", "#F59E0B", "#EC4899", "#14B8A6"]
  let hash = 0
  for (let i = 0; i < str.length; i++) hash = str.charCodeAt(i) + ((hash << 5) - hash)
  return palette[Math.abs(hash) % palette.length]
}

function ClientCardContent({ client }: { client: KanbanClient }) {
  const revenue = (client as any).invoiceRevenue ?? client.totalSpent ?? 0
  const avatarColor = hashColor(client.name ?? client.id)
  const initials = getInitials(client.name)
  return (
    <>
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
            {client.name ?? "Sin nombre"}
          </div>
          {client.companyName && (
            <div style={{ fontSize: 10, color: "var(--text-secondary)", marginTop: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
              {client.companyName}
            </div>
          )}
        </div>
      </div>
      {revenue > 0 && (
        <div style={{ marginTop: 8, paddingTop: 8, borderTop: "0.5px solid var(--border-subtle)", display: "flex", justifyContent: "flex-end" }}>
          <span style={{ fontSize: 11, color: "#0F766E", fontWeight: 600 }}>{formatCurrency(revenue)}</span>
        </div>
      )}
    </>
  )
}

function DraggableClientCard({ client, onClick }: { client: KanbanClient; onClick: () => void }) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({ id: client.id })

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
      }}
      onMouseEnter={e => !isDragging && ((e.currentTarget as HTMLElement).style.boxShadow = "0 2px 8px rgba(0,0,0,0.06)")}
      onMouseLeave={e => ((e.currentTarget as HTMLElement).style.boxShadow = "none")}
      {...listeners}
      {...attributes}
    >
      <ClientCardContent client={client} />
    </div>
  )
}

function KanbanColumn({
  column, clients, onCardClick,
}: {
  column: typeof COLUMNS[number]
  clients: KanbanClient[]
  onCardClick: (client: KanbanClient) => void
}) {
  const { setNodeRef, isOver } = useDroppable({ id: column.id })

  return (
    <div
      ref={setNodeRef}
      style={{
        minWidth: 268, maxWidth: 288, flex: "0 0 268px",
        background: isOver ? "rgba(15,118,110,0.04)" : "var(--bg-surface)",
        border: `0.5px solid ${isOver ? "rgba(15,118,110,0.35)" : "var(--border-subtle)"}`,
        borderRadius: 12,
        overflow: "hidden",
        transition: "background 150ms, border-color 150ms",
      }}
    >
      <div style={{ padding: "10px 14px", borderBottom: "0.5px solid var(--border-subtle)", display: "flex", alignItems: "center", gap: 8 }}>
        <span style={{ width: 8, height: 8, borderRadius: "50%", backgroundColor: column.color, flexShrink: 0 }} />
        <span style={{ fontWeight: 600, fontSize: 12, color: "var(--text-primary)", flex: 1 }}>{column.label}</span>
        <span style={{ fontSize: 10, fontWeight: 700, color: column.color, background: `${column.color}15`, padding: "2px 8px", borderRadius: 99, border: `0.5px solid ${column.color}30` }}>
          {clients.length}
        </span>
      </div>
      <div style={{ padding: "10px 10px 4px", minHeight: 80, maxHeight: 560, overflowY: "auto" }}>
        {clients.length === 0 ? (
          <p style={{ fontSize: 11, color: "var(--text-secondary)", textAlign: "center", padding: "20px 0", opacity: 0.5 }}>
            Sin clientes
          </p>
        ) : (
          clients.map(client => (
            <DraggableClientCard key={client.id} client={client} onClick={() => onCardClick(client)} />
          ))
        )}
      </div>
    </div>
  )
}

interface ClientsKanbanViewProps {
  clients: KanbanClient[]
  onClientUpdate: (clientId: string, data: Partial<KanbanClient & { status: string }>) => void
}

export function ClientsKanbanView({ clients, onClientUpdate }: ClientsKanbanViewProps) {
  const router = useRouter()
  const queryClient = useQueryClient()
  const [activeClientId, setActiveClientId] = useState<string | null>(null)

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } })
  )

  const handleDragStart = useCallback((event: DragStartEvent) => {
    setActiveClientId(event.active.id as string)
  }, [])

  const handleDragEnd = useCallback(async (event: DragEndEvent) => {
    setActiveClientId(null)
    const { active, over } = event
    if (!over) return

    const clientId = active.id as string
    const newStatus = over.id as string
    const client = clients.find(c => c.id === clientId)
    if (!client) return
    if (getColumnForStatus(client.effectiveStatus) === newStatus) return

    onClientUpdate(clientId, { status: newStatus })

    try {
      const res = await fetch(`/api/clients/${clientId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      })
      if (!res.ok) {
        onClientUpdate(clientId, { status: client.effectiveStatus })
      } else {
        queryClient.invalidateQueries({ queryKey: ["clients"] })
        queryClient.invalidateQueries({ queryKey: ["clients-kpis"] })
      }
    } catch {
      onClientUpdate(clientId, { status: client.effectiveStatus })
    }
  }, [clients, onClientUpdate, queryClient])

  const activeClient = activeClientId ? clients.find(c => c.id === activeClientId) : null

  return (
    <DndContext sensors={sensors} onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
      <div style={{ display: "flex", gap: 14, overflowX: "auto", paddingBottom: 16, alignItems: "flex-start" }}>
        {COLUMNS.map(column => (
          <KanbanColumn
            key={column.id}
            column={column}
            clients={clients.filter(c => getColumnForStatus(c.effectiveStatus) === column.id)}
            onCardClick={client => router.push(`/dashboard/clients/${client.id}`)}
          />
        ))}
      </div>

      <DragOverlay dropAnimation={{ duration: 200, easing: "cubic-bezier(0.18,0.67,0.6,1.22)" }}>
        {activeClient && (
          <div style={{
            background: "var(--bg-card)",
            border: "0.5px solid #0F766E",
            borderRadius: 10,
            padding: "10px 12px",
            width: 260,
            boxShadow: "0 8px 28px rgba(0,0,0,0.13)",
            cursor: "grabbing",
            opacity: 0.96,
          }}>
            <ClientCardContent client={activeClient} />
          </div>
        )}
      </DragOverlay>
    </DndContext>
  )
}
