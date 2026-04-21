import { platformContent } from "@/components/landing/content"

const BADGE_CLASS: Record<string, string> = {
  Alta:  "bg-[#fff0ec] text-[#c04b20]",
  Media: "bg-[#fff7e6] text-[#a67500]",
  Baja:  "bg-[#eaf6f0] text-[#0d7a56]",
}

export function KanbanPreview() {
  const { topbar, cols } = platformContent.preview.tasks

  return (
    <div className="relative min-h-[420px] overflow-hidden rounded-[14px] border border-line bg-[#F8FAFB]">
      {/* Topbar */}
      <div className="flex items-center gap-2 border-b border-line bg-white px-3.5 py-2.5">
        <div className="flex gap-[5px]">
          {[0, 1, 2].map((i) => (
            <span key={i} className="h-[9px] w-[9px] rounded-full bg-[#d7dee2]" />
          ))}
        </div>
        <span className="ml-1.5 font-mono text-[11px] text-ink-3">{topbar}</span>
      </div>

      {/* Kanban */}
      <div className="p-4">
        <div className="grid grid-cols-3 gap-3">
          {cols.map((col) => (
            <div
              key={col.heading}
              className="min-h-[320px] rounded-[10px] border border-line bg-[#F8FAFB] p-2.5"
            >
              <h4 className="mb-2.5 flex justify-between font-display text-[12px] font-semibold uppercase tracking-[0.04em] text-ink-3">
                {col.heading}
                <span className="rounded-full border border-line bg-white px-2 py-[1px] font-mono text-[10.5px] text-ink-2">
                  {col.count}
                </span>
              </h4>
              {col.items.map((item) => (
                <div
                  key={item[0]}
                  className="mb-2 rounded-[8px] border border-line bg-white p-2.5"
                >
                  <div className="font-display text-[12.5px] font-semibold tracking-[-0.01em]">
                    {item[0]}
                  </div>
                  <div className="mt-1.5 flex items-center justify-between text-[11px] text-ink-3">
                    <span
                      className={`rounded-full px-1.5 py-[1px] font-mono text-[10px] font-semibold ${BADGE_CLASS[item[1]] ?? ""}`}
                    >
                      {item[1]}
                    </span>
                    <span>28 Abr</span>
                  </div>
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
