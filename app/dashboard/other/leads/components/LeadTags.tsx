"use client"

const TAGS = ["B2B", "Priority", "Enterprise"]

export function LeadTags() {
  return (
    <div className="mt-4 flex flex-wrap gap-2">
      {TAGS.map((tag) => (
        <span
          key={tag}
          className="text-[10px] uppercase tracking-widest px-2 py-1 rounded-full bg-white/5 text-white/60 border border-white/10"
        >
          {tag}
        </span>
      ))}
    </div>
  )
}
