"use client"

import { useState } from "react"
import { HelpCircle, PlayCircle, Mail, Keyboard } from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { useTour } from "@/components/tour/TourContext"
import { useOS, getShortcutSymbol } from "@/hooks/use-os"

export function HelpMenu() {
  const [shortcutsOpen, setShortcutsOpen] = useState(false)
  const { start: startTour } = useTour()
  const os = useOS()
  const searchShortcut = getShortcutSymbol(os) ?? "Ctrl+K"

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button
            style={{
              width: 30, height: 30, borderRadius: 6,
              display: "grid", placeItems: "center",
              color: "#404040", background: "none", border: "none", cursor: "pointer",
              transition: "background .12s ease",
            }}
            onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.background = "#f5f5f5" }}
            onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.background = "none" }}
            aria-label="Ayuda"
          >
            <HelpCircle size={15} strokeWidth={1.8} />
          </button>
        </DropdownMenuTrigger>

        <DropdownMenuContent align="end" className="w-52 bg-white text-neutral-900 shadow-lg">
          <DropdownMenuItem className="cursor-pointer gap-2" onClick={startTour}>
            <PlayCircle className="size-4 text-neutral-400" />
            Cómo empezar
          </DropdownMenuItem>

          <DropdownMenuSeparator />

          <DropdownMenuItem
            className="cursor-pointer gap-2"
            onClick={() => { window.location.href = "mailto:errepe@clientlabs.io" }}
          >
            <Mail className="size-4 text-neutral-400" />
            Contactar soporte
          </DropdownMenuItem>

          <DropdownMenuItem
            className="cursor-pointer gap-2"
            onClick={() => setShortcutsOpen(true)}
          >
            <Keyboard className="size-4 text-neutral-400" />
            Atajos de teclado
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <Dialog open={shortcutsOpen} onOpenChange={setShortcutsOpen}>
        <DialogContent className="max-w-sm bg-white">
          <DialogHeader>
            <DialogTitle className="text-sm font-semibold text-neutral-900">
              Atajos de teclado
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-2 pt-1 text-[13px]">
            <div className="flex items-center justify-between py-1.5">
              <span className="text-neutral-600">Búsqueda global</span>
              <kbd className="rounded border border-neutral-200 bg-neutral-50 px-2 py-0.5 font-mono text-[11px] text-neutral-600">
                {searchShortcut}
              </kbd>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}
