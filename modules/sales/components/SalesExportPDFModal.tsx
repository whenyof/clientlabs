"use client"

import { useState } from "react"
import { FileDown } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { downloadExecutivePDF, type ExecutivePDFInput } from "../lib/executivePdf"
import { useSectorConfig } from "@/hooks/useSectorConfig"

type Props = {
  open: boolean
  onOpenChange: (open: boolean) => void
  /** Payload con métricas del periodo actual (filtros de la vista). */
  payload: ExecutivePDFInput
}

export function SalesExportPDFModal({
  open,
  onOpenChange,
  payload,
}: Props) {
  const { labels } = useSectorConfig()
  const sl = labels?.sales
  const [generating, setGenerating] = useState(false)

  const handleGenerate = () => {
    setGenerating(true)
    try {
      downloadExecutivePDF(payload)
      onOpenChange(false)
    } finally {
      setGenerating(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md bg-zinc-900 border-white/10 text-white">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-lg">
            <FileDown className="h-5 w-5" />
            {sl?.exportPdf?.title ?? "Exportar PDF"}
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-4 pt-2">
          <p className="text-sm text-white/70">
            {sl?.exportPdf?.description ??
              "Genera un informe ejecutivo con el periodo seleccionado en el panel."}
          </p>
          <p className="text-xs text-white/50">
            Periodo: <span className="text-white/80 font-medium">{payload.period.label}</span>
          </p>
          <div className="flex justify-end gap-2 pt-2">
            <Button
              type="button"
              variant="ghost"
              onClick={() => onOpenChange(false)}
              className="text-white/70"
            >
              {labels?.common?.cancel ?? "Cancelar"}
            </Button>
            <Button
              type="button"
              onClick={handleGenerate}
              disabled={generating}
              className="bg-violet-600 hover:bg-violet-700 text-white"
            >
              {generating
                ? labels?.common?.loading ?? "Generando…"
                : sl?.exportPdf?.generate ?? "Generar informe"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
