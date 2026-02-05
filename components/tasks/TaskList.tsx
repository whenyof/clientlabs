"use client"

import { Task, TaskCard } from "./TaskCard"
import { FileText } from "lucide-react"

type TaskListProps = {
    tasks: Task[]
}

export function TaskList({ tasks }: TaskListProps) {
    if (tasks.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center py-12 text-center">
                <div className="h-12 w-12 rounded-full bg-white/5 flex items-center justify-center mb-3">
                    <FileText className="h-6 w-6 text-white/20" />
                </div>
                <h3 className="text-white font-medium mb-1">No hay tareas</h3>
                <p className="text-sm text-white/40">No tienes tareas pendientes en esta vista.</p>
            </div>
        )
    }

    return (
        <div className="space-y-2">
            {tasks.map((task) => (
                <TaskCard key={task.id} task={task} />
            ))}
        </div>
    )
}
