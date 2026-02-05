"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
import { Plus, FileSpreadsheet, ClipboardPaste, Globe, UserPlus } from "lucide-react"
import { CreateLeadManualDialog } from "./CreateLeadManualDialog"
import { ImportLeadsDialog } from "./ImportLeadsDialog"
import { PasteLeadsDialog } from "./PasteLeadsDialog"
import { ScrapingDialog } from "./ScrapingDialog"

type Mode = "manual" | "import" | "paste" | "scraping" | null

export function CreateLeadButton() {
    const [modeSelectOpen, setModeSelectOpen] = useState(false)
    const [selectedMode, setSelectedMode] = useState<Mode>(null)

    const modes = [
        {
            id: "manual" as const,
            icon: UserPlus,
            title: "Manual",
            description: "Crear un lead manualmente",
            color: "blue"
        },
        {
            id: "import" as const,
            icon: FileSpreadsheet,
            title: "Importar Archivo",
            description: "CSV o Excel con múltiples leads",
            color: "cyan"
        },
        {
            id: "paste" as const,
            icon: ClipboardPaste,
            title: "Pegar Datos",
            description: "Copy-paste masivo de texto",
            color: "purple"
        },
        {
            id: "scraping" as const,
            icon: Globe,
            title: "Scraping por URL",
            description: "Extraer leads de una página web",
            color: "emerald",
            badge: "Próximamente"
        }
    ]

    const handleModeSelect = (mode: Mode) => {
        setModeSelectOpen(false)
        setSelectedMode(mode)
    }

    return (
        <>
            <Button
                onClick={() => setModeSelectOpen(true)}
                className="gap-2 bg-gradient-to-r from-blue-500/20 to-purple-500/20 border-blue-500/30 text-white hover:from-blue-500/30 hover:to-purple-500/30 hover:border-blue-500/50 transition-all shadow-lg shadow-blue-500/10"
            >
                <Plus className="h-4 w-4" />
                Nuevo Lead
            </Button>

            {/* Mode Selector Dialog */}
            <Dialog open={modeSelectOpen} onOpenChange={setModeSelectOpen}>
                <DialogContent className="bg-zinc-900 border-white/10 max-w-2xl">
                    <DialogHeader>
                        <DialogTitle className="text-white text-xl">¿Cómo quieres crear leads?</DialogTitle>
                    </DialogHeader>

                    <div className="grid grid-cols-2 gap-4 py-4">
                        {modes.map((mode) => {
                            const Icon = mode.icon
                            const colorClasses = {
                                blue: "bg-blue-500/10 border-blue-500/30 text-blue-400 hover:bg-blue-500/20 hover:border-blue-500/50",
                                cyan: "bg-cyan-500/10 border-cyan-500/30 text-cyan-400 hover:bg-cyan-500/20 hover:border-cyan-500/50",
                                purple: "bg-purple-500/10 border-purple-500/30 text-purple-400 hover:bg-purple-500/20 hover:border-purple-500/50",
                                emerald: "bg-emerald-500/10 border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/20 hover:border-emerald-500/50"
                            }

                            return (
                                <button
                                    key={mode.id}
                                    onClick={() => handleModeSelect(mode.id)}
                                    className={`relative p-6 rounded-lg border-2 transition-all duration-200 hover:scale-[1.02] text-left ${colorClasses[mode.color as keyof typeof colorClasses]}`}
                                >
                                    {mode.badge && (
                                        <span className="absolute top-2 right-2 px-2 py-0.5 rounded text-[10px] bg-white/10 text-white/60">
                                            {mode.badge}
                                        </span>
                                    )}
                                    <Icon className="h-8 w-8 mb-3" />
                                    <h3 className="font-semibold text-lg mb-1">{mode.title}</h3>
                                    <p className="text-sm opacity-80">{mode.description}</p>
                                </button>
                            )
                        })}
                    </div>
                </DialogContent>
            </Dialog>

            {/* Individual Mode Dialogs */}
            <CreateLeadManualDialog
                open={selectedMode === "manual"}
                onOpenChange={(open) => !open && setSelectedMode(null)}
            />
            <ImportLeadsDialog
                open={selectedMode === "import"}
                onOpenChange={(open) => !open && setSelectedMode(null)}
            />
            <PasteLeadsDialog
                open={selectedMode === "paste"}
                onOpenChange={(open) => !open && setSelectedMode(null)}
            />
            <ScrapingDialog
                open={selectedMode === "scraping"}
                onOpenChange={(open) => !open && setSelectedMode(null)}
            />
        </>
    )
}
