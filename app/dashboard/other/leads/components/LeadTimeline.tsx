"use client"

import { TIMELINE } from "./mock"

export function LeadTimeline() {
  return (
    <div className="bg-white/5 border border-white/10 rounded-2xl p-5 backdrop-blur-xl">
      <h4 className="text-sm font-semibold text-white mb-4">Timeline</h4>
      <div className="space-y-4">
        {TIMELINE.map((item) => (
          <div key={item.id} className="flex gap-3">
            <div className="h-2 w-2 rounded-full bg-purple-500 mt-2" />
            <div>
              <p className="text-sm text-white">{item.title}</p>
              <p className="text-xs text-white/60">{item.detail}</p>
              <p className="text-[10px] text-white/40 mt-1">{item.time}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
