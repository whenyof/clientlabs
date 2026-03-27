"use client"

import { useState } from "react"
import { Button } from "@shared/ui/button"
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
import { useSectorConfig } from "@shared/hooks/useSectorConfig"

type Mode = "manual" | "import" | "paste" | null

export function CreateLeadButton() {
 const { labels } = useSectorConfig()
 const ui = labels.leads.ui
 const [modeSelectOpen, setModeSelectOpen] = useState(false)
 const [selectedMode, setSelectedMode] = useState<Mode>(null)

 const modes = [
 { id: "manual" as const, icon: UserPlus, title: ui.createManual, description: ui.createManualDesc, color: "blue" as const },
 { id: "import" as const, icon: FileSpreadsheet, title: ui.createImport, description: ui.createImportDesc, color: "cyan" as const },
 { id: "paste" as const, icon: ClipboardPaste, title: ui.createPaste, description: ui.createPasteDesc, color: "emerald" as const },
 ]

 const handleModeSelect = (mode: Mode) => {
 setModeSelectOpen(false)
 setSelectedMode(mode)
 }

 const colorClasses = {
 blue: "bg-blue-50 border-blue-200 text-blue-700 hover:bg-blue-100 hover:border-blue-300",
 cyan: "bg-cyan-50 border-cyan-200 text-cyan-700 hover:bg-cyan-100 hover:border-cyan-300",
 emerald: "bg-emerald-50 border-emerald-200 text-emerald-700 hover:bg-emerald-100 hover:border-emerald-300"
 }

 return (
 <>
 <Button
 onClick={() => setModeSelectOpen(true)}
 className="gap-2 bg-[var(--bg-card)] border-blue-500/30 text-[var(--text-primary)] hover:border-blue-500/50 transition-all shadow-sm shadow-blue-500/10"
 >
 <Plus className="h-4 w-4" />
 {labels.leads.newButton}
 </Button>

 {/* Mode Selector Dialog */}
 <Dialog open={modeSelectOpen} onOpenChange={setModeSelectOpen}>
 <DialogContent className="bg-[var(--color-background-primary,#fff)] border-[var(--color-border-secondary,#e5e7eb)] max-w-2xl" style={{ borderRadius: "var(--border-radius-lg, 12px)", padding: 24 }}>
 <DialogHeader>
 <DialogTitle style={{ fontSize: 18, fontWeight: 500, color: "var(--color-text-primary, #0B1F2A)" }}>{ui.createHowTitle}</DialogTitle>
 </DialogHeader>

 <div className="grid grid-cols-2 gap-4 py-4">
 {modes.map((mode) => {
 const Icon = mode.icon
 return (
 <button
 key={mode.id}
 onClick={() => handleModeSelect(mode.id)}
 className={`relative p-6 rounded-lg border transition-all duration-200 hover:scale-[1.02] text-left ${colorClasses[mode.color]}`}
 >
 <Icon className="h-8 w-8 mb-3" />
 <h3 className="font-semibold text-lg mb-1">{mode.title}</h3>
 <p className="text-sm opacity-70">{mode.description}</p>
 </button>
 )
 })}

 {/* Scraping — Próximamente */}
 <div className="opacity-50 cursor-not-allowed relative p-6 rounded-lg border bg-emerald-50 border-emerald-200 text-emerald-700 text-left">
 <span className="absolute top-2 right-2 px-2 py-0.5 rounded text-[10px] bg-neutral-100 text-neutral-500">
 Próximamente
 </span>
 <Globe className="h-8 w-8 mb-3" />
 <h3 className="font-semibold text-lg mb-1">{ui.createScraping}</h3>
 <p className="text-sm opacity-70">{ui.createScrapingDesc}</p>
 </div>
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
 </>
 )
}
