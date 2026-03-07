"use client"

import type { SalesNarrativeData } from "../services/salesNarrative"

type Props = {
  data: SalesNarrativeData
}

export function SalesNarrative({ data }: Props) {
  const { summary, highlights, risks, opportunities } = data
  const hasSections = highlights.length > 0 || risks.length > 0 || opportunities.length > 0

  return (
    <div className="rounded-xl border border-white/10 bg-white/5 p-5 backdrop-blur">
      <h3 className="text-sm font-medium text-white/80 mb-3">Narrativa del periodo</h3>
      <p className="text-sm text-white leading-snug mb-4">{summary}</p>
      {!hasSections ? null : (
        <div className="space-y-4">
          {highlights.length > 0 && (
            <div>
              <p className="text-xs font-medium text-white/60 uppercase tracking-wider mb-1.5">
                Destacados
              </p>
              <ul className="text-sm text-white/90 space-y-1 list-disc list-inside">
                {highlights.map((line, i) => (
                  <li key={i}>{line}</li>
                ))}
              </ul>
            </div>
          )}
          {risks.length > 0 && (
            <div>
              <p className="text-xs font-medium text-white/60 uppercase tracking-wider mb-1.5">
                Riesgos
              </p>
              <ul className="text-sm text-white/90 space-y-1 list-disc list-inside">
                {risks.map((line, i) => (
                  <li key={i}>{line}</li>
                ))}
              </ul>
            </div>
          )}
          {opportunities.length > 0 && (
            <div>
              <p className="text-xs font-medium text-white/60 uppercase tracking-wider mb-1.5">
                Oportunidades
              </p>
              <ul className="text-sm text-white/90 space-y-1 list-disc list-inside">
                {opportunities.map((line, i) => (
                  <li key={i}>{line}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
