import { platformContent } from "@/components/landing/content"

const BADGE_CLASS = {
  hot:  "bg-[#fff0ec] text-[#c04b20]",
  warm: "bg-[#fff7e6] text-[#a67500]",
  cool: "bg-[#eaf6f0] text-[#0d7a56]",
} as const

export function RecoPreview() {
  const { topbar, dateLabel, cards } = platformContent.preview.reco

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

      {/* Reco cards */}
      <div className="p-4">
        <div className="mb-2.5 font-mono text-[11px] uppercase tracking-[0.05em] text-ink-3">
          {dateLabel}
        </div>
        {cards.map((card) => (
          <div
            key={card.title}
            className="mb-2 flex items-center gap-3 rounded-[10px] border border-line bg-white px-3.5 py-3"
          >
            <div className="flex-1">
              <h6 className="m-0 font-display text-[13px] font-semibold">{card.title}</h6>
              <p className="m-0 mt-0.5 text-[11.5px] text-ink-3">{card.sub}</p>
            </div>
            <span
              className={`shrink-0 rounded-full px-2 py-1 font-mono text-[10.5px] font-semibold ${BADGE_CLASS[card.tone]}`}
            >
              {card.badge}
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}
