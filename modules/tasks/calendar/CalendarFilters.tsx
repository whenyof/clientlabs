"use client"

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { cn } from "@/lib/utils"

export type CalendarFiltersState = {
  assignedTo: string
  status: string
  priority: string
}

type CalendarFiltersProps = {
  filters: CalendarFiltersState
  onFiltersChange: (f: CalendarFiltersState) => void
  assigneeOptions: { value: string; label: string }[]
  className?: string
}

const STATUS_OPTIONS = [
  { value: "all", label: "Todos" },
  { value: "PENDING", label: "Pendiente" },
  { value: "DONE", label: "Hecho" },
  { value: "CANCELLED", label: "Cancelado" },
]

const PRIORITY_OPTIONS = [
  { value: "all", label: "Todas" },
  { value: "HIGH", label: "Alta" },
  { value: "MEDIUM", label: "Media" },
  { value: "LOW", label: "Baja" },
]

export function CalendarFilters({
  filters,
  onFiltersChange,
  assigneeOptions,
  className,
}: CalendarFiltersProps) {
  return (
    <div
      className={cn(
        "flex flex-wrap items-center gap-3 rounded-xl border border-border/80 bg-card px-4 py-2 shadow-sm",
        className
      )}
    >
      <Select
        value={filters.assignedTo}
        onValueChange={(v) =>
          onFiltersChange({ ...filters, assignedTo: v })
        }
      >
        <SelectTrigger className="w-[160px] bg-background">
          <SelectValue placeholder="Responsable" />
        </SelectTrigger>
        <SelectContent>
          {assigneeOptions.map((o) => (
            <SelectItem key={o.value} value={o.value}>
              {o.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <Select
        value={filters.status}
        onValueChange={(v) => onFiltersChange({ ...filters, status: v })}
      >
        <SelectTrigger className="w-[140px] bg-background">
          <SelectValue placeholder="Estado" />
        </SelectTrigger>
        <SelectContent>
          {STATUS_OPTIONS.map((o) => (
            <SelectItem key={o.value} value={o.value}>
              {o.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <Select
        value={filters.priority}
        onValueChange={(v) => onFiltersChange({ ...filters, priority: v })}
      >
        <SelectTrigger className="w-[120px] bg-background">
          <SelectValue placeholder="Prioridad" />
        </SelectTrigger>
        <SelectContent>
          {PRIORITY_OPTIONS.map((o) => (
            <SelectItem key={o.value} value={o.value}>
              {o.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  )
}
