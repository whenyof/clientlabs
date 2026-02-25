"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Upload } from "lucide-react"
import { ImportLeadsDialog } from "./ImportLeadsDialog"

export function ImportButton() {
 const [open, setOpen] = useState(false)

 return (
 <>
 <Button
 variant="outline"
 className="gap-2 bg-[var(--bg-card)] border-cyan-500/40 text-cyan-300 hover: hover: hover:border-cyan-400/60 transition-all shadow-md hover:shadow-sm hover:shadow-cyan-500/10 font-medium"
 onClick={() => setOpen(true)}
 >
 <Upload className="h-4 w-4" />
 <span>Importar CSV</span>
 </Button>

 <ImportLeadsDialog open={open} onOpenChange={setOpen} />
 </>
 )
}
