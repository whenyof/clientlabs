"use client"

import { useMemo, useState } from "react"
import { AlertTriangle } from "lucide-react"
import { format, parseISO } from "date-fns"
import { enUS } from "date-fns/locale"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import {
  getWorkloadFlags,
  DEFAULT_THRESHOLDS,
  type TaskForWorkload,
  type WorkloadThresholds,
} from "../lib/workloadSaturation"

type WorkloadSaturationIndicatorProps = {
  tasks: TaskForWorkload[]
  thresholds?: Partial<WorkloadThresholds>
  className?: string
}

function formatDate(dateStr: string): string {
  try {
    return format(parseISO(dateStr), "MMM d, yyyy", { locale: enUS })
  } catch {
    return dateStr
  }
}

export function WorkloadSaturationIndicator({
  tasks,
  thresholds,
  className,
}: WorkloadSaturationIndicatorProps) {
  const [open, setOpen] = useState(false)

  const flags = useMemo(
    () => getWorkloadFlags(tasks, { ...DEFAULT_THRESHOLDS, ...thresholds }),
    [tasks, thresholds]
  )

  const hasOverload = flags.overloadedDays.length > 0 || flags.overloadedUsers.length > 0
  if (!hasOverload) return null

  const tooltipLines: string[] = []
  if (flags.overloadedDays.length > 0) {
    tooltipLines.push("Overloaded days:")
    flags.overloadedDays.forEach((d) => {
      tooltipLines.push(`• ${formatDate(d.date)}: ${d.reason}`)
    })
  }
  if (flags.overloadedUsers.length > 0) {
    tooltipLines.push("")
    tooltipLines.push("Overloaded assignees:")
    flags.overloadedUsers.forEach((u) => {
      tooltipLines.push(`• ${u.assigneeId}: ${u.reason}`)
    })
  }
  const tooltipText = tooltipLines.join("\n")

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          type="button"
          className={className}
          aria-label="Workload saturation warning"
          title={tooltipText}
        >
          <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-destructive/15 text-destructive transition-colors hover:bg-destructive/25">
            <AlertTriangle className="h-4 w-4" />
          </span>
        </button>
      </PopoverTrigger>
      <PopoverContent align="end" className="w-80 text-sm" sideOffset={8}>
        <div className="space-y-2">
          <p className="font-medium text-foreground">Workload saturation</p>
          <p className="text-muted-foreground">
            Some days or assignees are over the configured limits. This is informational only.
          </p>
          {flags.overloadedDays.length > 0 && (
            <div>
              <p className="mb-1 font-medium text-foreground">Overloaded days</p>
              <ul className="list-inside list-disc space-y-0.5 text-muted-foreground">
                {flags.overloadedDays.map((d) => (
                  <li key={d.date}>
                    {formatDate(d.date)}: {d.total} tasks
                    {d.highPriority > 0 && ` (${d.highPriority} high priority)`}
                  </li>
                ))}
              </ul>
            </div>
          )}
          {flags.overloadedUsers.length > 0 && (
            <div>
              <p className="mb-1 font-medium text-foreground">Overloaded assignees</p>
              <ul className="list-inside list-disc space-y-0.5 text-muted-foreground">
                {flags.overloadedUsers.map((u) => (
                  <li key={u.assigneeId}>
                    {u.assigneeId}: {u.total} tasks
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </PopoverContent>
    </Popover>
  )
}
