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
import { updateProvider } from "@/app/dashboard/providers/actions"

type KanbanProvider = {
  id: string
  name: string
  type: string | null
  monthlyCost: number | null
  dependencyLevel: string
  isCritical: boolean
  status: string
}

const COLUMNS = [
  { id: "ACTIVE",  label: "Activos",     color: "#1FA97A", statuses: ["ACTIVE", "OK"] },
  { id: "PENDING", label: "Pendientes",  color: "#F59E0B", statuses: ["PENDING"] },
  { id: "ISSUE",   label: "Incidencias", color: "#EF4444", statuses: ["ISSUE"] },
  { id: "PAUSED",  label: "Pausados",    color: "#94A3B8", statuses: ["PAUSED", "BLOCKED"] },
] as const

type ColumnId = typeof COLUMNS[number]["id"]

const TYPE_LABELS: Record<string, string> = {
  SERVICE: "Servicio", PRODUCT: "Producto", SOFTWARE: "Software", OTHER: "Otro",
}

const DEP_COLOR: Record<string, string> = {
  LOW: "#94A3B8", MEDIUM: "#F59E0B", HIGH: "#F97316", CRITICAL: "#EF4444",
}

function getColumnForStatus(status: string): ColumnId {
  for (const col of COLUMNS) {
    if ((col.statuses as readonly string[]).includes(status)) return col.id
  }
  return "PAUSED"
}

function formatEUR(n: number | null) {
  if (!n) return null
  return new Intl.NumberFormat("es-ES", { style: "currency", currency: "EUR", minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(n)
}

function getInitials(name: string): string {
  return name.split(" ").slice(0, 2).map(w => w[0]?.toUpperCase() ?? "").join("")
}

function hashColor(str: string): string {
  const palette = ["#1FA97A", "#3B82F6", "#8B5CF6", "#F59E0B", "#EC4899", "#14B8A6"]
  let hash = 0
  for (let i = 0; i < str.length; i++) hash = str.charCodeAt(i) + ((hash << 5) - hash)
  return palette[Math.abs(hash) % palette.length]
}

function ProviderCardContent({ provider }: { provider: KanbanProvider }) {
  const cost = formatEUR(provider.monthlyCost)
  const avatarColor = hashColor(provider.name)
  const initials = getInitials(provider.name)
  const depColor = DEP_COLOR[provider.dependencyLevel] ?? "#94A3B8"

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
            {provider.name}
          </div>
          {provider.type && (
            <div style={{ fontSize: 10, color: "var(--text-secondary)", marginTop: 1 }}>
              {TYPE_LABELS[provider.type] ?? provider.type}
            </div>
          )}
        </div>
      </div>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: 8, paddingTop: 8, borderTop: "0.5px solid var(--border-subtle)" }}>
        {cost ? (
          <span style={{ fontSize: 11, color: "var(--text-primary)", fontWeight: 500 }}>{cost}/mes</span>
        ) : <span />}
        <span style={{
          fontSize: 9, fontWeight: 700, padding: "2px 6px", borderRadius: 4,
          backgroundColor: `${depColor}18`, color: depColor,
        }}>
          {provider.dependencyLevel}
        </span>
      </div>
    </>
  )
}

function DraggableProviderCard({ provider, onClick }: { provider: KanbanProvider; onClick: () => void }) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({ id: provider.id })

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
      <ProviderCardContent provider={provider} />
    </div>
  )
}

function KanbanColumn({
  column, providers, onCardClick,
}: {
  column: typeof COLUMNS[number]
  providers: KanbanProvider[]
  onCardClick: (provider: KanbanProvider) => void
}) {
  const { setNodeRef, isOver } = useDroppable({ id: column.id })

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
        <span style={{ width: 8, height: 8, borderRadius: "50%", backgroundColor: column.color, flexShrink: 0 }} />
        <span style={{ fontWeight: 600, fontSize: 12, color: "var(--text-primary)", flex: 1 }}>{column.label}</span>
        <span style={{ fontSize: 10, fontWeight: 700, color: column.color, background: `${column.color}15`, padding: "2px 8px", borderRadius: 99, border: `0.5px solid ${column.color}30` }}>
          {providers.length}
        </span>
      </div>
      <div style={{ padding: "10px 10px 4px", minHeight: 80, maxHeight: 560, overflowY: "auto" }}>
        {providers.length === 0 ? (
          <p style={{ fontSize: 11, color: "var(--text-secondary)", textAlign: "center", padding: "20px 0", opacity: 0.5 }}>
            Sin proveedores
          </p>
        ) : (
          providers.map(p => (
            <DraggableProviderCard key={p.id} provider={p} onClick={() => onCardClick(p)} />
          ))
        )}
      </div>
    </div>
  )
}

interface ProvidersKanbanViewProps {
  providers: KanbanProvider[]
  onProviderUpdate: (id: string, data: Partial<KanbanProvider>) => void
}

export function ProvidersKanbanView({ providers, onProviderUpdate }: ProvidersKanbanViewProps) {
  const router = useRouter()
  const queryClient = useQueryClient()
  const [activeProviderId, setActiveProviderId] = useState<string | null>(null)

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } })
  )

  const handleDragStart = useCallback((event: DragStartEvent) => {
    setActiveProviderId(event.active.id as string)
  }, [])

  const handleDragEnd = useCallback(async (event: DragEndEvent) => {
    setActiveProviderId(null)
    const { active, over } = event
    if (!over) return

    const providerId = active.id as string
    const newColId = over.id as ColumnId
    const provider = providers.find(p => p.id === providerId)
    if (!provider) return
    if (getColumnForStatus(provider.status) === newColId) return

    onProviderUpdate(providerId, { status: newColId })

    const result = await updateProvider(providerId, { status: newColId })
    if (!result.success) {
      onProviderUpdate(providerId, { status: provider.status })
    } else {
      queryClient.invalidateQueries({ queryKey: ["providers"] })
      router.refresh()
    }
  }, [providers, onProviderUpdate, queryClient, router])

  const activeProvider = activeProviderId ? providers.find(p => p.id === activeProviderId) : null

  return (
    <DndContext sensors={sensors} onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
      <div style={{ display: "flex", gap: 14, overflowX: "auto", paddingBottom: 16, alignItems: "flex-start" }}>
        {COLUMNS.map(column => (
          <KanbanColumn
            key={column.id}
            column={column}
            providers={providers.filter(p => getColumnForStatus(p.status) === column.id)}
            onCardClick={p => router.push(`/dashboard/providers/${p.id}`)}
          />
        ))}
      </div>

      <DragOverlay dropAnimation={{ duration: 200, easing: "cubic-bezier(0.18,0.67,0.6,1.22)" }}>
        {activeProvider && (
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
            <ProviderCardContent provider={activeProvider} />
          </div>
        )}
      </DragOverlay>
    </DndContext>
  )
}
