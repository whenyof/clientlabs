"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"
import { TaskDialog } from "@/components/tasks/TaskDialog"
import { useRouter } from "next/navigation"
import { useSectorConfig } from "@/hooks/useSectorConfig"

export function AddTaskButton() {
    const { labels } = useSectorConfig()
    const [open, setOpen] = useState(false)
    const router = useRouter()

    return (
        <>
            <Button
                onClick={() => setOpen(true)}
                className="bg-blue-600 hover:bg-blue-700 text-white"
            >
                <Plus className="h-4 w-4 mr-2" />
                {labels.tasks.newButton}
            </Button>

            <TaskDialog
                open={open}
                onOpenChange={setOpen}
                onSuccess={() => router.refresh()}
            />
        </>
    )
}
