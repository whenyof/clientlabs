import { platformContent } from "@/components/landing/content"

export function ChatPreview() {
  const { topbar, messages } = platformContent.preview.ai

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

      {/* Chat */}
      <div className="p-4">
        <div className="rounded-[12px] border border-line bg-white p-3.5">
          <div className="grid gap-3">
            {messages.map((msg, i) => (
              <div key={i} className="flex gap-2.5">
                <div
                  className="grid h-[26px] w-[26px] shrink-0 place-items-center rounded-[6px] font-display text-[11px] font-bold text-white"
                  style={{ background: msg.role === "me" ? "#4a5a63" : "#1FA97A" }}
                >
                  {msg.role === "me" ? "YO" : "CL"}
                </div>
                <div
                  className="max-w-full rounded-[10px] border border-line bg-[#F8FAFB] px-[11px] py-2 text-[12.5px] leading-[1.45] [&_b]:font-bold [&_b]:text-emerald-ink"
                  /* Messages contain <b> tags from content.ts — safe static data */
                  dangerouslySetInnerHTML={{ __html: msg.text }}
                />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
