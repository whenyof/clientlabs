"use client"

import { useState } from "react"
import { Zap } from "lucide-react"
import { Button } from "@/components/ui/button"
import { AutomationsPanel } from "./AutomationsPanel"
import type { Lead } from "@prisma/client"

type AutomationsButtonProps = {
    selectedLead?: Lead | null
}

export function AutomationsButton({ selectedLead }: AutomationsButtonProps) {
    const [open, setOpen] = useState(false)

    return (
        <>
            <Button
                variant="outline"
                className="gap-2 bg-purple-500/10 border-purple-500/30 text-purple-400 hover:bg-purple-500/20 hover:border-purple-500/50 transition-all"
                onClick={() => setOpen(true)}
            >
                <Zap className="h-4 w-4" />
                <span>Automatizar</span>
            </Button>

            <AutomationsPanel
                open={open}
                onClose={() => setOpen(false)}
                selectedLead={selectedLead || null}
            />
        </>
    )
}
