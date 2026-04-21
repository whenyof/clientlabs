import { platformContent } from "@/components/landing/content"
import { PlatformTabs } from "@/components/landing/platform-tabs"

export function Platform() {
  const { eyebrow, headline, headlineAccent, sub } = platformContent

  return (
    <section id="Soluciones" className="bg-[#F8FAFB] py-[120px]">
      <div className="mx-auto max-w-[1240px] px-7">
        {/* Section header */}
        <div className="mb-9">
          <span className="font-mono text-[11px] uppercase tracking-[0.14em] text-ink-3">
            {eyebrow}
          </span>
          <h2 className="mt-4 mb-[14px] font-display text-[clamp(40px,4.4vw,60px)] font-extrabold leading-[1.02] tracking-[-0.035em]">
            {headline}
            <br />
            {headlineAccent}
          </h2>
          <p className="max-w-[620px] text-[17px] leading-[1.55] text-ink-2">{sub}</p>
        </div>

        <PlatformTabs />
      </div>
    </section>
  )
}
