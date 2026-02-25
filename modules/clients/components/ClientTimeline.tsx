"use client"

import { TIMELINE } from "./mock"

export function ClientTimeline() {
 return (
 <div className="bg-[var(--bg-card)] border border-[var(--border-subtle)] rounded-2xl p-5 backdrop-">
 <h4 className="text-sm font-semibold text-[var(--text-primary)] mb-4">Timeline</h4>
 <div className="space-y-4">
 {TIMELINE.map((item) => (
 <div key={item.id} className="flex gap-3">
 <div className="h-2 w-2 rounded-full bg-[var(--accent-soft)]-primary mt-2" />
 <div>
 <p className="text-sm text-[var(--text-primary)]">{item.title}</p>
 <p className="text-xs text-[var(--text-secondary)]">{item.detail}</p>
 <p className="text-[10px] text-[var(--text-secondary)] mt-1">{item.time}</p>
 </div>
 </div>
 ))}
 </div>
 </div>
 )
}
