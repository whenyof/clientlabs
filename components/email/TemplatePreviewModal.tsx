"use client"

import { X } from "lucide-react"
import type { EmailTemplateDef } from "./templates-catalog"

interface TemplatePreviewModalProps {
  template: EmailTemplateDef | null
  onClose: () => void
  onUse: (t: EmailTemplateDef) => void
}

export function TemplatePreviewModal({ template, onClose, onUse }: TemplatePreviewModalProps) {
  if (!template) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden">

        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
          <div className="min-w-0">
            <h3 className="text-[14px] font-semibold text-slate-900 truncate">{template.name}</h3>
            <p className="text-[12px] text-slate-400 mt-0.5 truncate">Asunto: {template.subject}</p>
          </div>
          <button onClick={onClose} className="ml-4 p-2 rounded-xl hover:bg-slate-100 transition-colors flex-shrink-0">
            <X className="h-4 w-4 text-slate-400" />
          </button>
        </div>

        {/* Preview */}
        <div className="flex-1 overflow-hidden bg-slate-100 p-4">
          <iframe
            srcDoc={template.html}
            className="w-full h-full min-h-[480px] rounded-xl border border-slate-200 bg-white"
            sandbox="allow-same-origin"
            title={template.name}
          />
        </div>

        {/* Footer */}
        <div className="px-5 py-4 border-t border-slate-100 flex gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2.5 border border-slate-200 rounded-xl text-[13px] font-medium text-slate-600 hover:bg-slate-50 transition-colors"
          >
            Cerrar
          </button>
          <button
            onClick={() => { onUse(template); onClose() }}
            className="flex-1 py-2.5 rounded-xl text-[13px] font-semibold text-white transition-colors"
            style={{ background: "#0F766E" }}
          >
            Usar esta plantilla →
          </button>
        </div>
      </div>
    </div>
  )
}
