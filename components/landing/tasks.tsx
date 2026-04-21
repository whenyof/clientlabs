import { tasksContent } from "@/components/landing/content"
import { LandingIcons } from "@/components/landing/icons"

const BADGE_CLASS: Record<string, string> = {
  Alta:  "bg-[#fff0ec] text-[#c04b20]",
  Media: "bg-[#fff7e6] text-[#a67500]",
  Baja:  "bg-[#eaf6f0] text-[#0d7a56]",
}

const FEAT_ICONS = {
  calendar: LandingIcons.calendar,
  link:     LandingIcons.link,
  bolt:     LandingIcons.bolt,
} as const

export function Tasks() {
  const { eyebrow, headline, headlineAccent, sub, features, metrics, kanbanTopbar, kanbanCols } =
    tasksContent

  return (
    <section className="bg-white py-[120px]">
      <div className="mx-auto max-w-[1240px] px-7">
        <div className="grid grid-cols-1 items-center gap-16 lg:grid-cols-[1fr_1.15fr] lg:gap-[64px]">

          {/* ── Left: copy ── */}
          <div>
            <span className="font-mono text-[11px] uppercase tracking-[0.14em] text-ink-3">
              {eyebrow}
            </span>
            <h2 className="mt-4 mb-4 font-display text-[clamp(40px,4.4vw,58px)] font-extrabold leading-[1.02] tracking-[-0.035em]">
              {headline}
              <br />
              {headlineAccent}
            </h2>
            <p className="max-w-[520px] text-[17px] leading-[1.55] text-ink-2">{sub}</p>

            {/* Feature list */}
            <div className="mt-8 mb-8 grid gap-[22px]">
              {features.map((feat) => {
                const Icon = FEAT_ICONS[feat.icon as keyof typeof FEAT_ICONS] ?? LandingIcons.bolt
                return (
                  <div key={feat.title} className="flex items-start gap-4">
                    <div className="grid h-11 w-11 shrink-0 place-items-center rounded-[12px] bg-[#eaf6f0] text-emerald-ink">
                      <Icon className="h-5 w-5" />
                    </div>
                    <div>
                      <div className="font-display text-[17px] font-bold tracking-[-0.015em]">
                        {feat.title}
                      </div>
                      <div className="mt-1 text-[14px] leading-[1.5] text-ink-2">{feat.desc}</div>
                    </div>
                  </div>
                )
              })}
            </div>

            {/* Metrics */}
            <div className="grid grid-cols-3 gap-4">
              {metrics.map((m) => (
                <div key={m.label} className="rounded-[14px] border border-line bg-[#F8FAFB] p-[18px]">
                  <div className="font-display text-[28px] font-extrabold tracking-[-0.03em] text-emerald-ink">
                    {m.value}
                  </div>
                  <div className="mt-1 text-[12.5px] text-ink-2">{m.label}</div>
                </div>
              ))}
            </div>
          </div>

          {/* ── Right: kanban preview ── */}
          <div className="relative min-h-[520px] overflow-hidden rounded-[14px] border border-line bg-[#F8FAFB]">
            {/* Topbar */}
            <div className="flex items-center gap-2 border-b border-line bg-white px-3.5 py-2.5">
              <div className="flex gap-[5px]">
                {[0, 1, 2].map((i) => (
                  <span key={i} className="h-[9px] w-[9px] rounded-full bg-[#d7dee2]" />
                ))}
              </div>
              <span className="ml-1.5 font-mono text-[11px] text-ink-3">{kanbanTopbar}</span>
            </div>

            {/* Kanban grid */}
            <div className="p-4">
              <div className="grid grid-cols-3 gap-3">
                {kanbanCols.map((col) => (
                  <div
                    key={col.heading}
                    className="min-h-[420px] rounded-[10px] border border-line bg-[#F8FAFB] p-2.5"
                  >
                    <h4 className="mb-2.5 flex justify-between font-display text-[12px] font-semibold uppercase tracking-[0.04em] text-ink-3">
                      {col.heading}
                      <span className="rounded-full border border-line bg-white px-2 py-[1px] font-mono text-[10.5px] text-ink-2">
                        {col.items.length}
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
                          <span>{item[2]}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
