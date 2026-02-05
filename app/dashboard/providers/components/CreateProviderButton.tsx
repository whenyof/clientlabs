"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"
import { CreateProviderDialog } from "./CreateProviderDialog"
import { useSectorConfig } from "@/hooks/useSectorConfig"

export function CreateProviderButton() {
    const { labels } = useSectorConfig()
    const [dialogOpen, setDialogOpen] = useState(false)
    const router = useRouter()

    const handleProviderCreated = () => {
        setDialogOpen(false)
        router.refresh() // Refresh server data
    }

    return (
        <>
            <Button
                onClick={() => setDialogOpen(true)}
                className="bg-blue-500 hover:bg-blue-600 text-white"
            >
                <Plus className="h-4 w-4 mr-2" />
                {labels.providers.newButton}
            </Button>
            <CreateProviderDialog
                open={dialogOpen}
                onOpenChange={setDialogOpen}
                onProviderCreated={handleProviderCreated}
            />
        </>
    )
}
