"use client"
import { AlertTriangle, ExternalLink } from "lucide-react"

export function BannerLegal() {
  return (
    <div className="flex items-start gap-3 px-4 py-3 bg-amber-50 border border-amber-200/70 rounded-xl">
      <AlertTriangle className="h-4 w-4 text-amber-500 flex-shrink-0 mt-0.5" />
      <div className="flex-1 min-w-0">
        <p className="text-[12px] text-amber-800 leading-relaxed">
          <span className="font-bold">Documentos informativos.</span>{" "}
          ClientLabs registra e importa tus documentos pero no es software de facturación oficial.
          Para emitir facturas con validez fiscal en España usa tu gestor o un software certificado
          Verifactu.{" "}
          <a
            href="https://www.agenciatributaria.es"
            target="_blank"
            rel="noopener noreferrer"
            className="font-semibold text-amber-700 hover:underline inline-flex items-center gap-1"
          >
            Más info AEAT
            <ExternalLink className="h-3 w-3" />
          </a>
        </p>
      </div>
    </div>
  )
}
