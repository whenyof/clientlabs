"use client"

import { useState } from "react"
import { Button } from "@shared/ui/button"
import {
 Dialog,
 DialogContent,
 DialogTitle,
} from "@/components/ui/dialog"
import * as VisuallyHidden from "@radix-ui/react-visually-hidden"
import { Plus, UserPlus, ClipboardList, FileUp } from "lucide-react"
import { CreateLeadManualDialog } from "./CreateLeadManualDialog"
import { ImportLeadsDialog } from "./ImportLeadsDialog"
import { PasteLeadsDialog } from "./PasteLeadsDialog"
import { useSectorConfig } from "@shared/hooks/useSectorConfig"

type Mode = "manual" | "import" | "paste" | null

export function CreateLeadButton() {
 const { labels } = useSectorConfig()
 const [modeSelectOpen, setModeSelectOpen] = useState(false)
 const [selectedMode, setSelectedMode] = useState<Mode>(null)

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

 <Dialog open={modeSelectOpen} onOpenChange={setModeSelectOpen}>
 <DialogContent className="!max-w-[520px] w-full mx-auto bg-white border-slate-200 p-6 rounded-2xl">
 <VisuallyHidden.Root><DialogTitle>Crear leads</DialogTitle></VisuallyHidden.Root>
 <div>
 <h2 className="text-lg font-semibold text-slate-900">¿Cómo quieres crear leads?</h2>
 <div className="border-b border-slate-100 mt-4 mb-5" />
 </div>

 <div className="grid grid-cols-3 gap-3 mt-5">
 {/* Manual */}
 <div
 className="flex flex-col gap-3 p-5 bg-[#EEF2FF] border border-[#C7D2FE] rounded-xl cursor-pointer hover:bg-[#E0E7FF] transition-all group"
 onClick={() => handleModeSelect("manual")}
 >
 <div className="w-10 h-10 rounded-lg bg-[#E0E7FF] flex items-center justify-center">
 <UserPlus className="h-5 w-5 text-[#4F46E5]" />
 </div>
 <div>
 <p className="text-sm font-semibold text-slate-900">Manual</p>
 <p className="text-xs text-slate-500 mt-0.5">Crear un lead manualmente</p>
 </div>
 </div>

 {/* Pegar datos */}
 <div
 className="flex flex-col gap-3 p-5 bg-[#E8F5F0] border border-[#6EE7B7] rounded-xl cursor-pointer hover:bg-[#D1FAE5] transition-all group"
 onClick={() => handleModeSelect("paste")}
 >
 <div className="w-10 h-10 rounded-lg bg-[#D1FAE5] flex items-center justify-center">
 <ClipboardList className="h-5 w-5 text-[#1FA97A]" />
 </div>
 <div>
 <p className="text-sm font-semibold text-slate-900">Pegar datos</p>
 <p className="text-xs text-slate-500 mt-0.5">Copy-paste masivo de texto</p>
 </div>
 </div>

 {/* Importar */}
 <div
 className="flex flex-col gap-3 p-5 bg-[#FEF3C7] border border-[#FCD34D] rounded-xl cursor-pointer hover:bg-[#FDE68A] transition-all group"
 onClick={() => handleModeSelect("import")}
 >
 <div className="w-10 h-10 rounded-lg bg-[#FDE68A] flex items-center justify-center">
 <FileUp className="h-5 w-5 text-[#D97706]" />
 </div>
 <div>
 <p className="text-sm font-semibold text-slate-900">Importar archivo</p>
 <p className="text-xs text-slate-500 mt-0.5">CSV o Excel con múltiples leads</p>
 </div>
 </div>
 </div>
 </DialogContent>
 </Dialog>

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
