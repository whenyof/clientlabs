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
import { useSectorConfig } from "@/hooks/useSectorConfig"

type Mode = "manual" | "import" | "paste" | "scraping" | null

export function CreateLeadButton() {
 const { labels } = useSectorConfig()
 const ui = labels.leads.ui
 const [modeSelectOpen, setModeSelectOpen] = useState(false)
 const [selectedMode, setSelectedMode] = useState<Mode>(null)

 const modes = [
 { id: "manual" as const, icon: UserPlus, title: ui.createManual, description: ui.createManualDesc, color: "blue" as const },
 { id: "import" as const, icon: FileSpreadsheet, title: ui.createImport, description: ui.createImportDesc, color: "cyan" as const },
 { id: "paste" as const, icon: ClipboardPaste, title: ui.createPaste, description: ui.createPasteDesc, color: "emerald" as const },
 { id: "scraping" as const, icon: Globe, title: ui.createScraping, description: ui.createScrapingDesc, color: "emerald" as const, badge: ui.badgeComing },
 ]

 const handleModeSelect = (mode: Mode) => {
 setModeSelectOpen(false)
 setSelectedMode(mode)
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
 <DialogContent className="bg-zinc-900 border-[var(--border-subtle)] max-w-2xl">
 <DialogHeader>
 <DialogTitle className="text-[var(--text-primary)] text-xl">{ui.createHowTitle}</DialogTitle>
 </DialogHeader>

 <div className="grid grid-cols-2 gap-4 py-4">
 {modes.map((mode) => {
 const Icon = mode.icon
 const colorClasses = {
 blue: "bg-[var(--bg-card)] border-blue-500/30 text-[var(--accent)] hover:bg-[var(--bg-card)] hover:border-blue-500/50",
 cyan: "bg-cyan-500/10 border-cyan-500/30 text-cyan-400 hover:bg-cyan-500/20 hover:border-cyan-500/50",
 emerald: "bg-[var(--accent-soft)] border-[var(--accent)] text-[var(--accent)] hover:bg-[var(--accent-soft)] hover:border-[var(--accent)]"
 }

 return (
 <button
 key={mode.id}
 onClick={() => handleModeSelect(mode.id)}
 className={`relative p-6 rounded-lg border-2 transition-all duration-200 hover:scale-[1.02] text-left ${colorClasses[mode.color as keyof typeof colorClasses]}`}
 >
 {mode.badge && (
 <span className="absolute top-2 right-2 px-2 py-0.5 rounded text-[10px] bg-[var(--bg-card)] text-[var(--text-secondary)]">
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
