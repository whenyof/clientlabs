"use client"

import { ChevronRight } from "lucide-react"
import { Button } from "@/components/ui/button"

export type SalesActionItem = {
 id: string
 type: string
 title: string
 description: string
 ctaLabel: string
 onCta: () => void
}

type Props = {
 actions: SalesActionItem[]
}

export function SalesActions({ actions }: Props) {
 if (actions.length === 0) return null

 return (
 <div className="space-y-3">
 <h3 className="text-sm font-medium text-[var(--text-secondary)]">Acciones recomendadas</h3>
 <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
 {actions.map((action) => (
 <div
 key={action.id}
 className="rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-card)] p-4 backdrop-blur flex flex-col sm:flex-row sm:items-center gap-3"
 >
 <div className="min-w-0 flex-1">
 <h4 className="text-sm font-medium text-[var(--text-secondary)] truncate">{action.title}</h4>
 <p className="text-xs text-[var(--text-secondary)] mt-0.5 line-clamp-2">{action.description}</p>
 </div>
 <Button
 type="button"
 variant="ghost"
 size="sm"
 onClick={action.onCta}
 className="shrink-0 h-8 px-3 text-violet-400 hover:text-violet-300 hover:bg-violet-500/10 border border-[var(--border-subtle)]"
 >
 <span className="text-xs font-medium">{action.ctaLabel}</span>
 <ChevronRight className="h-3.5 w-3.5 ml-1" />
 </Button>
 </div>
 ))}
 </div>
 </div>
 )
}
