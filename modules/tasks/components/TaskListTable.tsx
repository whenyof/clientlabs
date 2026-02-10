"use client"

import { Card, CardHeader, CardContent } from "@/components/ui/card"
import { ListTodo } from "lucide-react"
import { cn } from "@/lib/utils"

/** Mock row for placeholder table */
const MOCK_ROWS = [
  { task: "Llamada de seguimiento", client: "Acme S.L.", responsible: "María", date: "08 Feb", priority: "Alta", status: "Pendiente" },
  { task: "Envío de propuesta", client: "Beta Corp", responsible: "Juan", date: "08 Feb", priority: "Media", status: "En curso" },
  { task: "Reunión kick-off", client: "Gamma Inc", responsible: "Ana", date: "09 Feb", priority: "Alta", status: "Pendiente" },
  { task: "Revisión contrato", client: "—", responsible: "Luis", date: "10 Feb", priority: "Baja", status: "Pendiente" },
] as const

const HEADERS = [
  "Tarea",
  "Cliente",
  "Responsable",
  "Fecha",
  "Prioridad",
  "Estado",
] as const

type TaskListTableProps = {
  className?: string
}

/**
 * Tabla placeholder de tareas para el dashboard.
 * Datos mock; luego se conectarán a API.
 */
export function TaskListTable({ className }: TaskListTableProps) {
  return (
    <Card
      className={cn(
        "rounded-xl border border-border/80 shadow-sm overflow-hidden",
        className
      )}
    >
      <CardHeader className="border-b border-border/60 py-4">
        <div className="flex items-center gap-2">
          <div className="rounded-lg bg-violet-500/10 p-2">
            <ListTodo className="h-5 w-5 text-violet-500" />
          </div>
          <h2 className="text-lg font-semibold text-foreground">
            Lista de tareas
          </h2>
        </div>
      </CardHeader>
      <CardContent className="p-0">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border/60 bg-muted/30">
                {HEADERS.map((h) => (
                  <th
                    key={h}
                    className="text-left font-medium text-muted-foreground px-4 py-3 whitespace-nowrap"
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {MOCK_ROWS.map((row, i) => (
                <tr
                  key={i}
                  className="border-b border-border/40 hover:bg-muted/20 transition-colors"
                >
                  <td className="px-4 py-3 font-medium text-foreground">{row.task}</td>
                  <td className="px-4 py-3 text-muted-foreground">{row.client}</td>
                  <td className="px-4 py-3 text-muted-foreground">{row.responsible}</td>
                  <td className="px-4 py-3 text-muted-foreground">{row.date}</td>
                  <td className="px-4 py-3">
                    <span
                      className={cn(
                        "inline-flex rounded-full px-2 py-0.5 text-xs font-medium",
                        row.priority === "Alta" && "bg-rose-500/10 text-rose-600",
                        row.priority === "Media" && "bg-amber-500/10 text-amber-600",
                        row.priority === "Baja" && "bg-slate-500/10 text-slate-600"
                      )}
                    >
                      {row.priority}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">{row.status}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  )
}
