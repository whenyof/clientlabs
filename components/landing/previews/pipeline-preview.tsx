import { platformContent } from "@/components/landing/content"

export function PipelinePreview() {
  const { topbar, cols, status } = platformContent.preview.crm

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

      {/* Body */}
      <div className="p-4">
        <div className="flex gap-1.5">
          {cols.map((col) => (
            <div key={col.heading} className="flex-1 rounded-[8px] border border-line bg-white p-2">
              <h5 className="mb-2 font-mono text-[10.5px] font-semibold uppercase tracking-[0.05em] text-ink-3">
                {col.heading}
              </h5>
              {col.items.map((item) => (
                <div
                  key={item[0]}
                  className="mb-1.5 rounded-[6px] border border-line bg-[#F8FAFB] px-[7px] py-1.5"
                >
                  <div className="font-display text-[11.5px] font-semibold">{item[0]}</div>
                  <div className="mt-0.5 text-[10.5px] text-ink-2">{item[1]}</div>
                </div>
              ))}
            </div>
          ))}
        </div>

        {/* Status */}
        <div className="mt-4 flex items-center gap-2 font-mono text-[12px] text-ink-3">
          <span className="h-1.5 w-1.5 rounded-full bg-emerald" />
          {status}
        </div>
      </div>
    </div>
  )
}
