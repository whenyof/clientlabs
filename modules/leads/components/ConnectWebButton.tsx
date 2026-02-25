"use client"

import { useState } from "react"
import { Link2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ConnectWebDialog } from "./ConnectWebDialog"

export function ConnectWebButton() {
 const [open, setOpen] = useState(false)

 return (
 <>
 <Button
 onClick={() => setOpen(true)}
 variant="outline"
 className="gap-2 bg-[var(--bg-card)] border-blue-500/30 text-[var(--accent)] hover: hover: hover:border-blue-500/50 transition-all relative"
 >
 <Link2 className="h-4 w-4" />
 <span>Conectar Web</span>
 <Badge className="ml-1 bg-[var(--bg-card)] text-[var(--accent)] text-[10px] px-1.5 py-0">
 Beta
 </Badge>
 </Button>

 <ConnectWebDialog open={open} onClose={() => setOpen(false)} />
 </>
 )
}
